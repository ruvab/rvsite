import OpenAI from 'openai';
import { stripHtmlTags, stripHtmlPreserveMarkdown, stripHtmlFromArray } from './html-utils';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export const BLOG_CATEGORIES = [
  'Technology',
  'AI & Machine Learning',
  'Business Intelligence',
  'Automation',
  'Data Analytics',
  'Digital Transformation',
  'Cybersecurity',
  'Cloud Computing',
  'Software Development',
  'Industry News'
] as const;

export type BlogCategory = typeof BLOG_CATEGORIES[number];

interface GeneratedBlog {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  slug: string;
  featuredImage: string | null;
}

async function generateBlogImage(title: string, category: string): Promise<string | null> {
  try {
    const imagePrompt = `A professional, modern blog header image representing "${title}". Style: clean, tech-focused, professional business aesthetic with gradient colors (blue, purple, cyan). High quality, 16:9 aspect ratio, minimalist design.`;
    
    console.log(`Generating featured image for: ${title}`);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1792x1024",
      quality: "standard",
    });

    const imageUrl = response.data?.[0]?.url;
    
    if (imageUrl) {
      console.log(`✅ Image generated successfully for: ${title}`);
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating blog image:', error);
    return null;
  }
}

export async function generateBlogArticle(category: BlogCategory): Promise<GeneratedBlog> {
  const prompt = `You are a recognized industry expert and award-winning technology journalist with 20+ years of hands-on experience creating premium editorial content that meets Google AdSense 2025 E-E-A-T standards (Experience, Expertise, Authoritativeness, Trustworthiness).

CRITICAL GOOGLE ADSENSE 2025 E-E-A-T REQUIREMENTS:
- EXPERIENCE: Demonstrate first-hand, real-world experience with the subject matter
- EXPERTISE: Showcase deep technical knowledge and mastery of the topic
- AUTHORITATIVENESS: Position content as definitive, credible industry reference
- TRUSTWORTHINESS: Provide accurate, well-researched, verifiable information
- Content MUST be 1000-1500+ words (AdSense 2025 minimum for monetization)
- NO generic, thin, or AI-generated feel - write with genuine human expertise

Write a comprehensive, authoritative long-form article about ${category} with these strict requirements:

1. LENGTH & DEPTH (CRITICAL - ADSENSE 2025):
   - 1200-1500 words minimum (substantial, authoritative content)
   - In-depth expert analysis with multiple layers and perspectives
   - Comprehensive coverage that serves as a complete resource
   - Include historical context, current trends, and future predictions

2. E-E-A-T CONTENT QUALITY (MANDATORY FOR ADSENSE 2025):
   
   **EXPERIENCE:**
   - Share specific, real-world scenarios you've encountered
   - Include practical insights from hands-on implementation
   - Reference actual projects, challenges, and solutions
   - Use first-person perspective where appropriate to show direct experience
   
   **EXPERTISE:**
   - Demonstrate deep technical understanding and mastery
   - Explain complex concepts clearly with expert-level detail
   - Include industry-specific terminology used correctly
   - Reference frameworks, methodologies, and best practices
   - Cite specific data, statistics, or research findings
   
   **AUTHORITATIVENESS:**
   - Position the article as the definitive guide on the topic
   - Include references to industry standards and leading practices
   - Present information with confidence and authority
   - Cover the topic comprehensively - leave no important aspects unaddressed
   
   **TRUSTWORTHINESS:**
   - Provide accurate, verifiable information
   - Be transparent about limitations or evolving areas
   - Include balanced perspectives (pros/cons, benefits/challenges)
   - Use specific examples and real data (not vague generalizations)

3. STRUCTURE (Long-Form Professional Article):
   - Compelling, authoritative headline (60-70 characters, conveys expertise)
   - Strong introduction (3-4 paragraphs) that establishes authority and value
   - 5-7 well-developed H2 sections, each covering a distinct aspect
   - Each section should have 3-4 substantive paragraphs (100+ words per section)
   - Include H3 subheadings within sections for detailed breakdowns
   - Strong conclusion (3-4 paragraphs) with expert recommendations and next steps

4. WRITING STYLE (Expert Voice):
   - Write as a recognized industry expert sharing hard-won insights
   - Professional, authoritative tone with genuine expertise
   - Use active voice and confident, declarative statements
   - Balance technical depth with accessibility
   - Include specific examples, case studies, and real-world applications
   - NO generic advice - every point should demonstrate unique expertise

5. CONTENT ELEMENTS (E-E-A-T Signals):
   - Include specific numbers, percentages, or timeframes
   - Reference industry research, studies, or trends
   - Provide step-by-step guidance or frameworks
   - Share lessons learned from experience
   - Address common mistakes and how to avoid them
   - Include expert tips or pro insights

6. SEO & DISCOVERABILITY:
   - Naturally incorporate relevant keywords throughout
   - Use semantic variations and related technical terms
   - Ensure headline demonstrates expertise and authority
   - Structure content for featured snippets and rich results

7. VALUE PROPOSITION (Reader-First):
   - Every paragraph must provide actionable, expert-level value
   - Answer "how" and "why" in depth, not just "what"
   - Provide insights that save readers time, money, or effort
   - Include implementation guidance, not just theory

Return the article in the following JSON format:
{
  "title": "Expert-level, authoritative headline (60-70 chars) that establishes credibility",
  "content": "Full long-form article (1200-1500 words) in MARKDOWN format. CRITICAL FORMAT REQUIREMENTS:\\n\\n## First Major Section Title\\n\\nFirst paragraph with detailed expert insights and specific examples.\\n\\nSecond paragraph continuing the analysis.\\n\\n### Subsection Title\\n\\nDetailed content for subsection.\\n\\n## Second Major Section Title\\n\\nContent for second section...\\n\\nNOTE: Use ## for H2 main section headings (NOT numbered lists like '1.', '2.'), ### for H3 subsection headings, double line breaks between paragraphs. NO HTML TAGS (no <h2>, <p>, etc.). Write in PLAIN TEXT with markdown symbols only.",
  "excerpt": "Authoritative 2-sentence summary that establishes expertise and value (150-160 characters)",
  "tags": ["expert-level-tag1", "industry-specific-tag2", "technical-tag3", "authority-tag4", "professional-tag5"]
}

CRITICAL FORMAT RULE: Your content MUST use markdown headings (## and ###), NOT numbered lists (1., 2., 3.). Each major section should start with ## followed by the section title on the same line.

REMEMBER: This content MUST meet Google AdSense 2025 standards. Minimum 1000 words. Demonstrate E-E-A-T throughout. Write as a recognized expert with deep experience and authority. Generic, short, or thin content will be REJECTED and fail monetization.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a globally recognized technology expert and thought leader with 20+ years of hands-on industry experience. You create authoritative, long-form editorial content that meets Google AdSense 2025 E-E-A-T standards (Experience, Expertise, Authoritativeness, Trustworthiness).

Your credentials and approach:
- **EXPERIENCE**: You have direct, first-hand experience implementing and working with the technologies you write about. You share real scenarios, challenges, and solutions from your career.
- **EXPERTISE**: You possess deep technical mastery and can explain complex concepts with clarity and precision. You use industry-specific terminology correctly and reference established frameworks and methodologies.
- **AUTHORITATIVENESS**: Your articles are definitive guides that other professionals reference. You present information with confidence backed by knowledge and cover topics comprehensively.
- **TRUSTWORTHINESS**: You provide accurate, verifiable, well-researched information. You're transparent about limitations, present balanced perspectives, and use specific data rather than vague generalizations.

Your writing standards:
- 1200-1500 word minimum - substantial, comprehensive coverage
- Expert-level insights backed by real-world experience
- Specific examples, case studies, data points, and research
- Authoritative tone that establishes credibility
- Original analysis that demonstrates unique expertise
- Professional journalism standards with meticulous research
- Clear structure with 5-7 well-developed sections
- Every paragraph adds expert-level value
- MARKDOWN FORMAT: Use ## for H2 headings, ### for H3 subheadings (NEVER use numbered lists like "1.", "2." for main sections)

You NEVER write generic, thin, or surface-level content. Every article demonstrates genuine expertise, shares hard-won insights, and positions you as a recognized authority in the field. Your work meets the highest standards for Google AdSense 2025 monetization and E-E-A-T requirements.

CRITICAL: Format all content in markdown. Example structure:
## Understanding the Landscape
Content paragraph here...

### Key Considerations
Subsection content...

## Implementation Strategies
Next major section...`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 5000,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No content generated from OpenAI');
    }

    const parsedResponse = JSON.parse(responseText);
    
    const slug = generateSlug(parsedResponse.title);
    const cleanTitle = stripHtmlTags(parsedResponse.title);
    const cleanContent = stripHtmlPreserveMarkdown(parsedResponse.content);
    const cleanExcerpt = stripHtmlTags(parsedResponse.excerpt);
    
    // Validate content quality for AdSense 2025 compliance (E-E-A-T standards)
    const wordCount = cleanContent.split(/\s+/).filter(word => word.length > 0).length;
    
    // Enforce strict 1000-1500+ word requirement per AdSense 2025 guidelines
    if (wordCount < 1000) {
      throw new Error(`Generated content too short (${wordCount} words). AdSense 2025 requires minimum 1000 words (recommended 1500+) for E-E-A-T compliance.`);
    }
    
    if (wordCount > 2000) {
      throw new Error(`Generated content too long (${wordCount} words). Keep content focused and valuable (1000-1500 words optimal for user engagement).`);
    }
    
    // Check for proper H2 heading structure (requires 5-7 H2 sections for long-form content)
    const h2Headings = (cleanContent.match(/^## [^\n]+$/gm) || []).length;
    
    if (h2Headings < 5) {
      throw new Error(`Insufficient content structure (only ${h2Headings} H2 sections). AdSense 2025 requires 5-7 well-developed sections for 1000+ word articles demonstrating E-E-A-T.`);
    }
    
    if (h2Headings > 8) {
      throw new Error(`Too many H2 sections (${h2Headings}). Content should have 5-7 focused sections for optimal readability and authority.`);
    }
    
    // Check for substantive content depth (more paragraphs for longer content)
    const paragraphCount = cleanContent.split('\n\n').filter(p => p.trim().length > 50).length;
    
    if (paragraphCount < 15) {
      throw new Error(`Insufficient content depth (only ${paragraphCount} paragraphs). Each of the 5-7 sections should have 2-4 substantive paragraphs demonstrating expertise.`);
    }
    
    console.log(`✅ AdSense 2025 quality validation passed: ${wordCount} words, ${h2Headings} H2 sections, ${paragraphCount} paragraphs`);
    
    // Generate featured image
    const featuredImage = await generateBlogImage(cleanTitle, category);

    return {
      title: cleanTitle,
      content: cleanContent,
      excerpt: cleanExcerpt,
      category: category,
      tags: stripHtmlFromArray(parsedResponse.tags || []),
      slug: slug,
      featuredImage: featuredImage
    };

  } catch (error) {
    console.error('Error generating blog article:', error);
    throw new Error(`Failed to generate blog article for category ${category}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
}

export function getNextCategory(lastCategory: string | null): BlogCategory {
  if (!lastCategory) {
    return BLOG_CATEGORIES[0];
  }

  const currentIndex = BLOG_CATEGORIES.indexOf(lastCategory as BlogCategory);
  
  if (currentIndex === -1) {
    return BLOG_CATEGORIES[0];
  }

  const nextIndex = (currentIndex + 1) % BLOG_CATEGORIES.length;
  return BLOG_CATEGORIES[nextIndex];
}

export function shouldGenerateToday(): boolean {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
}

export function getNextScheduledDate(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  let daysToAdd = 0;
  
  if (dayOfWeek === 0) {
    daysToAdd = 1;
  } else if (dayOfWeek === 1) {
    daysToAdd = 2;
  } else if (dayOfWeek === 2) {
    daysToAdd = 1;
  } else if (dayOfWeek === 3) {
    daysToAdd = 2;
  } else if (dayOfWeek === 4) {
    daysToAdd = 1;
  } else if (dayOfWeek === 5) {
    daysToAdd = 3;
  } else if (dayOfWeek === 6) {
    daysToAdd = 2;
  }
  
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysToAdd);
  nextDate.setHours(10, 0, 0, 0);
  
  return nextDate;
}
