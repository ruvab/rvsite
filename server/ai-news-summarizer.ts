import OpenAI from 'openai';
import { stripHtmlTags, stripHtmlFromArray } from './html-utils';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface NewsSummaryRequest {
  title: string;
  content: string;
  url: string;
  sourceName: string;
  author?: string;
}

export interface NewsSummaryResponse {
  summary: string; // 200-300 words
  keyHighlights: string[]; // 3-5 bullet points
  keyTakeaways: string[]; // 2-4 main insights
  actionItems: string[]; // 1-3 suggested actions
  wordCount: number;
  featuredImage: string | null; // AI-generated image URL
}

async function generateNewsImage(title: string): Promise<string | null> {
  try {
    const imagePrompt = `A modern, professional news article header image for: "${title}". Style: tech news, clean design, professional aesthetic with gradient colors (blue, purple, cyan). High quality, 16:9 aspect ratio, minimalist and engaging.`;
    
    console.log(`Generating featured image for news: ${title}`);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1792x1024",
      quality: "standard",
    });

    const imageUrl = response.data?.[0]?.url;
    
    if (imageUrl) {
      console.log(`✅ News image generated successfully for: ${title}`);
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating news image:', error);
    return null;
  }
}

export async function generateNewsSummary(article: NewsSummaryRequest): Promise<NewsSummaryResponse> {
  const prompt = `You are a professional technology news analyst. Analyze the following tech news article and provide a comprehensive summary.

ARTICLE DETAILS:
Title: ${article.title}
Source: ${article.sourceName}
${article.author ? `Author: ${article.author}` : ''}

ARTICLE CONTENT:
${article.content}

TASK:
Generate a professional analysis with the following structure:

1. SUMMARY (200-300 words):
   - Write a concise, engaging summary that captures the essence of the article
   - Use clear, accessible language suitable for tech professionals
   - Maintain a neutral, informative tone
   - Include key facts, figures, and developments

2. KEY HIGHLIGHTS (3-5 bullet points):
   - Extract the most important facts or developments
   - Focus on what's new or significant
   - Keep each point concise (1-2 sentences max)

3. KEY TAKEAWAYS (2-4 insights):
   - Identify the broader implications
   - What does this mean for the tech industry/users/businesses?
   - Focus on strategic or practical insights

4. ACTION ITEMS (1-3 suggested actions):
   - What should readers do with this information?
   - Practical next steps (e.g., "Monitor this development," "Consider adopting this technology," "Review your security protocols")
   - Make them actionable and specific

Format your response as JSON with this structure:
{
  "summary": "200-300 word summary text here",
  "keyHighlights": ["highlight 1", "highlight 2", "highlight 3"],
  "keyTakeaways": ["takeaway 1", "takeaway 2"],
  "actionItems": ["action 1", "action 2"]
}

IMPORTANT:
- Keep the summary between 200-300 words
- Be objective and fact-based
- Focus on technology-related aspects
- Use professional but accessible language
- Use PLAIN TEXT only - NO HTML tags`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional technology news analyst who creates concise, insightful summaries of tech news articles. You always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(responseText);
    
    // Validate, clean, and strip HTML from the response
    const summary = stripHtmlTags(parsed.summary || '');
    const wordCount = summary.split(/\s+/).filter((word: string) => word.length > 0).length;
    
    // Generate featured image for the news article
    const featuredImage = await generateNewsImage(article.title);
    
    return {
      summary,
      keyHighlights: stripHtmlFromArray(Array.isArray(parsed.keyHighlights) ? parsed.keyHighlights : []),
      keyTakeaways: stripHtmlFromArray(Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : []),
      actionItems: stripHtmlFromArray(Array.isArray(parsed.actionItems) ? parsed.actionItems : []),
      wordCount,
      featuredImage
    };
  } catch (error) {
    console.error('Error generating news summary:', error);
    throw new Error(`Failed to generate AI summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function batchGenerateNewsSummaries(articles: NewsSummaryRequest[]): Promise<(NewsSummaryResponse & { originalUrl: string })[]> {
  const results: (NewsSummaryResponse & { originalUrl: string })[] = [];
  
  for (const article of articles) {
    try {
      console.log(`Generating AI summary for: ${article.title}`);
      const summary = await generateNewsSummary(article);
      results.push({
        ...summary,
        originalUrl: article.url
      });
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to summarize article "${article.title}":`, error);
      // Continue with other articles even if one fails
    }
  }
  
  return results;
}
