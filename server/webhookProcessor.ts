import sanitizeHtml from 'sanitize-html';
import { db } from './db';
import { webhookJobs, blogPosts, users, webhookRequests } from '../shared/schema';
import { eq } from 'drizzle-orm';
import fetch from 'node-fetch';
import { recordWebhookReceived } from './blog-scheduler';
import { stripHtmlTags, stripHtmlFromArray } from './html-utils';

const CALLBACK_MAX_RETRIES = 3;
const CALLBACK_RETRY_DELAYS = [2000, 4000, 8000];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
}

async function sendCallback(url: string, payload: any, attempt = 0): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error(`Callback attempt ${attempt + 1} failed:`, error);
    
    if (attempt < CALLBACK_MAX_RETRIES - 1) {
      await new Promise(resolve => setTimeout(resolve, CALLBACK_RETRY_DELAYS[attempt]));
      return sendCallback(url, payload, attempt + 1);
    }
    
    return false;
  }
}

export async function processWebhookJob(jobId: number) {
  try {
    const [job] = await db
      .select()
      .from(webhookJobs)
      .where(eq(webhookJobs.id, jobId))
      .limit(1);

    if (!job) {
      console.error(`Job ${jobId} not found`);
      return;
    }

    await db
      .update(webhookJobs)
      .set({ status: 'processing', processedAt: new Date() })
      .where(eq(webhookJobs.id, jobId));

    let publishedContentId: number | null = null;
    let publishedContentUrl: string | null = null;
    let errorMessage: string | null = null;

    try {
      if (job.contentType === 'blogPost') {
        const data = job.contentData as any;
        
        const adminUsers = await db
          .select()
          .from(users)
          .where(eq(users.isAdmin, true))
          .limit(1);

        if (adminUsers.length === 0) {
          throw new Error('No admin user found to publish blog post');
        }

        const adminUserId = adminUsers[0].id;
        
        const cleanContent = stripHtmlTags(data.contentHtml || '');
        const cleanTitle = stripHtmlTags(data.title || '');
        const slug = data.slug || generateSlug(cleanTitle);
        
        const excerpt = cleanContent.substring(0, 200) + '...';

        const category = data.category || (data.categories && data.categories[0]) || 'Technology';

        const contentData = job.contentData as any;
        const [newPost] = await db.insert(blogPosts).values({
          title: cleanTitle,
          slug: slug,
          content: cleanContent,
          excerpt: excerpt,
          category: category,
          tags: stripHtmlFromArray(data.tags || []),
          featuredImage: data.featuredImageUrl || null,
          isPublished: contentData.publishStatus === 'publish',
          authorId: adminUserId,
          source: 'webhook',
        }).returning();

        publishedContentId = newPost.id;
        publishedContentUrl = `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/blog/${slug}`;
      } else if (job.contentType === 'linkedInPost' || job.contentType === 'instagramStory') {
        errorMessage = `Content type ${job.contentType} is logged but not published (external platform)`;
      }

      await db
        .update(webhookJobs)
        .set({
          status: 'completed',
          publishedContentId,
          publishedContentUrl,
          errorMessage,
          completedAt: new Date(),
        })
        .where(eq(webhookJobs.id, jobId));

      const [webhookRequest] = await db
        .select()
        .from(webhookRequests)
        .where(eq(webhookRequests.id, job.requestId))
        .limit(1);

      if (webhookRequest?.notificationUrl) {
        const callbackPayload = errorMessage ? {
          status: 'success',
          trackingId: job.trackingId,
          idempotencyKey: webhookRequest.idempotencyKey,
          data: {
            message: errorMessage,
          }
        } : {
          status: 'success',
          trackingId: job.trackingId,
          idempotencyKey: webhookRequest.idempotencyKey,
          data: {
            postUrl: publishedContentUrl,
            postId: publishedContentId?.toString(),
          }
        };

        const callbackSuccess = await sendCallback(webhookRequest.notificationUrl, callbackPayload);

        await db
          .update(webhookJobs)
          .set({
            callbackAttempts: CALLBACK_MAX_RETRIES,
            callbackStatus: callbackSuccess ? 'success' : 'failed',
          })
          .where(eq(webhookJobs.id, jobId));
      }

    } catch (processingError: any) {
      console.error(`Job ${jobId} processing failed:`, processingError);
      
      await db
        .update(webhookJobs)
        .set({
          status: 'failed',
          errorMessage: processingError.message || 'Unknown error',
          completedAt: new Date(),
        })
        .where(eq(webhookJobs.id, jobId));

      const [webhookRequest] = await db
        .select()
        .from(webhookRequests)
        .where(eq(webhookRequests.id, job.requestId))
        .limit(1);

      if (webhookRequest?.notificationUrl) {
        const callbackPayload = {
          status: 'failed',
          trackingId: job.trackingId,
          idempotencyKey: webhookRequest.idempotencyKey,
          error: {
            code: 'PROCESSING_FAILED',
            message: `Failed to create blog post: ${processingError.message}`,
          }
        };

        const callbackSuccess = await sendCallback(webhookRequest.notificationUrl, callbackPayload);

        await db
          .update(webhookJobs)
          .set({
            callbackAttempts: CALLBACK_MAX_RETRIES,
            callbackStatus: callbackSuccess ? 'success' : 'failed',
          })
          .where(eq(webhookJobs.id, jobId));
      }
    }

  } catch (error) {
    console.error(`Fatal error processing job ${jobId}:`, error);
  }
}
