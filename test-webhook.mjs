import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const WEBHOOK_URL = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}/api/v1/content/publish`
  : 'http://localhost:5000/api/v1/content/publish';

async function testBlogPostWebhook() {
  console.log('\n📝 Testing Blog Post Webhook...\n');
  
  const payload = {
    idempotencyKey: `blog-test-${Date.now()}`,
    contentType: 'blogPost',
    targetPlatform: {
      name: 'Ruvab IT Blog',
      publishStatus: 'publish'
    },
    notificationUrl: 'https://webhook.site/test',
    data: {
      title: 'Test Blog Post via Webhook',
      contentHtml: '<h2>Introduction</h2><p>This is a test blog post created via webhook.</p><p>It demonstrates the content publishing system.</p>',
      slug: `test-blog-post-webhook-${Date.now()}`,
      featuredImageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
      tags: ['testing', 'webhook', 'automation'],
      categories: ['Technology', 'Development'],
      meta: {
        seoTitle: 'Test Blog Post | Ruvab IT',
        seoDescription: 'A test blog post demonstrating the webhook content publishing system'
      }
    }
  };

  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(timestamp + JSON.stringify(payload))
    .digest('hex');

  try {
    console.log(`Sending request to: ${WEBHOOK_URL}`);
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Signature: ${signature.substring(0, 20)}...`);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Request-Timestamp': timestamp
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    console.log(`\n✅ Response Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 202) {
      console.log('\n🎉 Webhook test successful! Content is being processed.');
      console.log(`Tracking ID: ${data.trackingId}`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

console.log('🚀 Content Publishing Webhook Test');
console.log('====================================');
testBlogPostWebhook().catch(console.error);
