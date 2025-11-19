import { storage } from './storage';
import { generateNewsSummary, type NewsSummaryRequest } from './ai-news-summarizer';
import { db } from './db';
import { aiNewsSummaries } from '@shared/schema';

function shouldGenerateToday(): boolean {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Generate on Tuesday (2), Thursday (4), Saturday (6)
  return dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6;
}

export async function checkAndGenerateNewsSummaries(force = false): Promise<{ 
  generated: boolean; 
  message: string; 
  summariesCount?: number;
  summaryIds?: number[];
}> {
  try {
    const schedule = await storage.getNewsSchedule();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!force && !shouldGenerateToday()) {
      return {
        generated: false,
        message: `Today is not a scheduled generation day. News summaries are published on Tuesdays, Thursdays, and Saturdays only.`
      };
    }

    if (!force && schedule?.lastGeneratedDate) {
      const lastGenDate = new Date(schedule.lastGeneratedDate);
      lastGenDate.setHours(0, 0, 0, 0);
      
      if (lastGenDate.getTime() === today.getTime()) {
        return {
          generated: false,
          message: 'News summaries already generated today.'
        };
      }
    }

    // Fetch latest trending tech news
    console.log('Fetching trending tech news articles...');
    const newsResponse = await fetch('http://localhost:5000/api/technology-news', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!newsResponse.ok) {
      throw new Error(`Failed to fetch news: ${newsResponse.statusText}`);
    }

    const newsData = await newsResponse.json();
    const articles = newsData.articles || [];

    if (articles.length === 0) {
      await storage.updateNewsSchedule({
        failedAttempts: (schedule?.failedAttempts || 0) + 1,
        lastFailedRun: new Date(),
      });
      
      return {
        generated: false,
        message: 'No news articles available to summarize.'
      };
    }

    // Select top 5 articles for summarization
    const topArticles = articles.slice(0, 5);
    console.log(`Generating AI summaries for ${topArticles.length} articles...`);

    const summaryIds: number[] = [];
    let successCount = 0;

    for (const article of topArticles) {
      try {
        // Prepare article data
        const articleRequest: NewsSummaryRequest = {
          title: article.title,
          content: article.content || article.description || article.title,
          url: article.url,
          sourceName: article.source?.name || 'Unknown',
          author: article.author
        };

        // Generate AI summary
        const aiSummary = await generateNewsSummary(articleRequest);

        // Create credit line
        const creditLine = `Source: ${article.source?.name || 'Unknown'} | Original article: ${article.url}`;

        // Save to database
        const [newSummary] = await db.insert(aiNewsSummaries).values({
          originalUrl: article.url,
          originalTitle: article.title,
          originalPublishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
          sourceName: article.source?.name || 'Unknown',
          sourceUrl: article.source?.url || article.url,
          aiSummary: aiSummary.summary,
          keyHighlights: aiSummary.keyHighlights,
          keyTakeaways: aiSummary.keyTakeaways,
          actionItems: aiSummary.actionItems,
          category: 'technology',
          tags: [], // Could extract from article if needed
          wordCount: aiSummary.wordCount,
          featuredImage: aiSummary.featuredImage,
          originalAuthor: article.author || null,
          creditLine,
          aiModel: 'gpt-4o-mini',
          scheduledDate: today,
          isPublished: true,
          publishedAt: new Date(),
        }).returning();

        summaryIds.push(newSummary.id);
        successCount++;
        
        console.log(`✓ Generated summary for: ${article.title}`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error(`Failed to generate summary for "${article.title}":`, error);
        // Continue with next article
      }
    }

    // Update schedule
    await storage.updateNewsSchedule({
      lastGeneratedDate: today,
      totalGenerated: (schedule?.totalGenerated || 0) + successCount,
      lastSuccessfulRun: new Date(),
      failedAttempts: 0,
    });

    return {
      generated: true,
      message: `Successfully generated ${successCount} AI-powered news summaries!`,
      summariesCount: successCount,
      summaryIds
    };
  } catch (error) {
    console.error('News summary generation error:', error);
    
    // Update failed attempts
    const schedule = await storage.getNewsSchedule();
    await storage.updateNewsSchedule({
      failedAttempts: (schedule?.failedAttempts || 0) + 1,
      lastFailedRun: new Date(),
    });
    
    throw error;
  }
}

export async function initializeNewsSchedule(): Promise<void> {
  try {
    const existing = await storage.getNewsSchedule();
    
    if (!existing) {
      await storage.createNewsSchedule({
        isActive: true,
        totalGenerated: 0,
        failedAttempts: 0,
      });
      console.log('✅ News schedule initialized');
    }
  } catch (error) {
    console.error('Error initializing news schedule:', error);
  }
}

let newsSchedulerInterval: NodeJS.Timeout | null = null;

export function startNewsScheduler(): void {
  if (newsSchedulerInterval) {
    console.log('⚠️  News scheduler already running');
    return;
  }

  const checkInterval = 60 * 60 * 1000; // 1 hour
  
  const runScheduledCheck = async () => {
    try {
      const now = new Date();
      const hour = now.getHours();
      
      // Run at 10 AM on Tue/Thu/Sat
      if (hour === 10 && shouldGenerateToday()) {
        console.log('🤖 Running scheduled news summary generation...');
        const result = await checkAndGenerateNewsSummaries(false);
        
        if (result.generated) {
          console.log(`✅ ${result.message}`);
        } else {
          console.log(`ℹ️  ${result.message}`);
        }
      }
    } catch (error) {
      console.error('❌ News scheduler error:', error);
    }
  };

  // Run initial check
  runScheduledCheck();
  
  // Schedule hourly checks
  newsSchedulerInterval = setInterval(runScheduledCheck, checkInterval);
  
  console.log('✅ News scheduler started - checking hourly at 10:00 AM on Tue/Thu/Sat');
}

export function stopNewsScheduler(): void {
  if (newsSchedulerInterval) {
    clearInterval(newsSchedulerInterval);
    newsSchedulerInterval = null;
    console.log('⏹️  News scheduler stopped');
  }
}
