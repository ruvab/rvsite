import { db } from './db';
import { blogPosts } from '@shared/schema';
import { isNull, eq } from 'drizzle-orm';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

async function generateBlogImage(title: string, excerpt: string): Promise<string | null> {
  try {
    const imagePrompt = `A professional, modern blog header image for an article titled: "${title}". ${excerpt ? `Context: ${excerpt.substring(0, 200)}` : ''}. Style: clean, professional, tech-focused with gradient colors (blue, purple, cyan). High quality, engaging, minimalist design.`;
    
    console.log(`Generating featured image for blog: ${title}`);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1792x1024",
      quality: "standard",
    });

    const imageUrl = response.data?.[0]?.url;
    
    if (imageUrl) {
      console.log(`✅ Blog image generated successfully for: ${title}`);
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating blog image:', error);
    return null;
  }
}

async function generateMissingBlogImages() {
  try {
    console.log('🖼️  Starting blog image generation...\n');

    // Find all blog posts without featured images
    const postsWithoutImages = await db.query.blogPosts.findMany({
      where: isNull(blogPosts.featuredImage),
    });

    console.log(`Found ${postsWithoutImages.length} blog posts without images\n`);

    if (postsWithoutImages.length === 0) {
      console.log('✅ All blog posts already have images!');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const post of postsWithoutImages) {
      try {
        console.log(`Generating image for: "${post.title}"`);
        
        const imageUrl = await generateBlogImage(post.title, post.excerpt || '');
        
        if (imageUrl) {
          // Update the blog post with the generated image
          await db.update(blogPosts)
            .set({ featuredImage: imageUrl })
            .where(eq(blogPosts.id, post.id));
          
          console.log(`✅ Image generated and saved for post ID ${post.id}`);
          successCount++;
        } else {
          console.log(`❌ Failed to generate image for post ID ${post.id}`);
          failCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error processing post ID ${post.id}:`, error);
        failCount++;
      }
    }

    console.log('\n📊 Image Generation Summary:');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📝 Total: ${postsWithoutImages.length}`);

  } catch (error) {
    console.error('Fatal error in image generation:', error);
    process.exit(1);
  }
}

// Run the script
generateMissingBlogImages()
  .then(() => {
    console.log('\n🎉 Blog image generation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
