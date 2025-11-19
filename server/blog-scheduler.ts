import { storage } from './storage';
import { generateBlogArticle, getNextCategory, shouldGenerateToday, getNextScheduledDate } from './ai-blog-generator';
import { db } from './db';
import { blogPosts, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function checkAndGenerateBlog(force = false): Promise<{ generated: boolean; message: string; postId?: number }> {
  try {
    const schedule = await storage.getBlogSchedule();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!force && !shouldGenerateToday()) {
      return {
        generated: false,
        message: `Today is not a scheduled generation day. Content is published on Mondays, Wednesdays, and Fridays only.`
      };
    }

    if (!force && schedule?.lastGeneratedDate) {
      const lastGenDate = new Date(schedule.lastGeneratedDate);
      lastGenDate.setHours(0, 0, 0, 0);
      
      if (lastGenDate.getTime() === today.getTime()) {
        return {
          generated: false,
          message: 'Blog article already generated today.'
        };
      }
    }

    if (!force && schedule?.lastWebhookReceived) {
      const lastWebhookDate = new Date(schedule.lastWebhookReceived);
      lastWebhookDate.setHours(0, 0, 0, 0);
      
      if (lastWebhookDate.getTime() === today.getTime()) {
        return {
          generated: false,
          message: 'Webhook content already received today. Skipping AI generation.'
        };
      }
    }

    const nextCategory = getNextCategory(schedule?.lastGeneratedCategory || null);
    
    console.log(`Generating blog article for category: ${nextCategory}`);
    const generatedBlog = await generateBlogArticle(nextCategory);

    const adminUsers = await db
      .select()
      .from(users)
      .where(eq(users.isAdmin, true))
      .limit(1);

    if (adminUsers.length === 0) {
      throw new Error('No admin user found to publish blog post');
    }

    const adminUserId = adminUsers[0].id;

    const [newPost] = await db.insert(blogPosts).values({
      title: generatedBlog.title,
      slug: generatedBlog.slug,
      content: generatedBlog.content,
      excerpt: generatedBlog.excerpt,
      category: generatedBlog.category,
      tags: generatedBlog.tags,
      featuredImage: generatedBlog.featuredImage,
      isPublished: true,
      authorId: adminUserId,
      source: 'ai-generated',
    }).returning();

    await storage.updateBlogSchedule({
      lastGeneratedDate: new Date(),
      lastGeneratedCategory: nextCategory,
      nextScheduledDate: getNextScheduledDate(),
      totalGenerated: (schedule?.totalGenerated || 0) + 1,
      failedAttempts: 0,
    });

    console.log(`✅ Blog article generated and published: "${generatedBlog.title}"`);

    return {
      generated: true,
      message: `Successfully generated and published blog article: "${generatedBlog.title}"`,
      postId: newPost.id
    };

  } catch (error) {
    console.error('Error in checkAndGenerateBlog:', error);
    
    const schedule = await storage.getBlogSchedule();
    await storage.updateBlogSchedule({
      failedAttempts: (schedule?.failedAttempts || 0) + 1,
    });

    return {
      generated: false,
      message: `Failed to generate blog article: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function initializeSchedule(): Promise<void> {
  try {
    const existing = await storage.getBlogSchedule();
    
    if (!existing) {
      await storage.createBlogSchedule({
        isActive: true,
        nextScheduledDate: getNextScheduledDate(),
        totalGenerated: 0,
        failedAttempts: 0,
      });
      console.log('✅ Blog schedule initialized');
    }
  } catch (error) {
    console.error('Error initializing schedule:', error);
  }
}

export async function recordWebhookReceived(): Promise<void> {
  try {
    await storage.updateBlogSchedule({
      lastWebhookReceived: new Date(),
    });
  } catch (error) {
    console.error('Error recording webhook:', error);
  }
}

let schedulerInterval: NodeJS.Timeout | null = null;

export function startScheduler(): void {
  if (schedulerInterval) {
    console.log('⚠️  Scheduler already running');
    return;
  }

  const checkInterval = 60 * 60 * 1000;
  
  const runScheduledCheck = async () => {
    try {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour === 10 && shouldGenerateToday()) {
        console.log('🤖 Running scheduled blog generation check...');
        const result = await checkAndGenerateBlog(false);
        
        if (result.generated) {
          console.log(`✅ ${result.message}`);
        } else {
          console.log(`ℹ️  ${result.message}`);
        }
      }
    } catch (error) {
      console.error('❌ Scheduler error:', error);
    }
  };

  runScheduledCheck();
  
  schedulerInterval = setInterval(runScheduledCheck, checkInterval);
  
  console.log('✅ Blog scheduler started - checking hourly at 10:00 AM on Mon/Wed/Fri');
}

export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('⏹️  Blog scheduler stopped');
  }
}
