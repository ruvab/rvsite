# Blog Content Webhook Integration Guide

## Overview

This system accepts blog content via webhook and automatically publishes it to your blog. If webhook submissions fail, the system will automatically generate AI-powered blog articles on scheduled days (Monday, Wednesday, and Thursday).

## Webhook Endpoint

**URL**: `https://your-replit-domain.repl.co/api/v1/content/publish`

**Method**: POST

**Content-Type**: application/json

## Authentication

The webhook uses HMAC SHA256 signature verification for security.

### Required Headers

```
X-Signature: <HMAC-SHA256 signature>
X-Request-Timestamp: <Unix timestamp in milliseconds>
```

### Generating the Signature

1. Get the current timestamp in milliseconds: `const timestamp = Date.now().toString()`
2. Create the signature string: `timestamp + JSON.stringify(requestBody)`
3. Generate HMAC SHA256: `crypto.createHmac('sha256', WEBHOOK_SECRET).update(signatureString).digest('hex')`

**WEBHOOK_SECRET**: You need to set this environment variable in your Replit secrets. Share this secret key with the content generation web app.

### Example Code (Node.js)

```javascript
const crypto = require('crypto');

const WEBHOOK_SECRET = 'your-shared-secret-key';
const webhookUrl = 'https://your-replit-domain.repl.co/api/v1/content/publish';

const payload = {
  idempotencyKey: 'unique-key-123',
  contentType: 'blogPost',
  targetPlatform: {
    name: 'blog',
    publishStatus: 'publish' // or 'draft'
  },
  notificationUrl: 'https://your-callback-url.com/webhook/callback',
  data: {
    title: 'Your Blog Post Title',
    contentHtml: '<h2>Introduction</h2><p>Your content here...</p>',
    slug: 'your-blog-post-slug', // optional
    category: 'Technology', // Must be one of the valid categories
    tags: ['tech', 'innovation'], // optional
    featuredImageUrl: 'https://example.com/image.jpg', // optional
    meta: {
      seoTitle: 'SEO Title',
      seoDescription: 'SEO Description'
    }
  }
};

const timestamp = Date.now().toString();
const signatureString = timestamp + JSON.stringify(payload);
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(signatureString)
  .digest('hex');

fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Signature': signature,
    'X-Request-Timestamp': timestamp
  },
  body: JSON.stringify(payload)
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## Valid Blog Categories

The system supports the following 10 categories. Use one of these values in the `category` field:

1. **Technology**
2. **AI & Machine Learning**
3. **Business Intelligence**
4. **Automation**
5. **Data Analytics**
6. **Digital Transformation**
7. **Cybersecurity**
8. **Cloud Computing**
9. **Software Development**
10. **Industry News**

## Request Payload Schema

```typescript
{
  idempotencyKey: string,        // Unique identifier for deduplication (required)
  contentType: "blogPost",       // Fixed value (required)
  targetPlatform: {
    name: string,                // Platform name (required)
    publishStatus: "publish" | "draft"  // Publish immediately or save as draft (required)
  },
  notificationUrl: string,       // Callback URL for status updates (required, must be valid URL)
  data: {
    title: string,               // Blog post title (1-200 characters, required)
    contentHtml: string,         // HTML content (1-50,000 characters, required)
    slug?: string,               // URL slug (max 200 characters, optional - auto-generated if not provided)
    category?: string,           // One of the 10 valid categories (optional, defaults to 'Technology')
    tags?: string[],             // Array of tags (max 10, optional)
    featuredImageUrl?: string,   // Featured image URL (max 500 characters, optional)
    meta?: {
      seoTitle?: string,         // SEO title (max 100 characters, optional)
      seoDescription?: string    // SEO description (max 200 characters, optional)
    }
  }
}
```

## Response Format

### Success Response (202 Accepted)

```json
{
  "status": "processing",
  "message": "Request received and is being processed.",
  "trackingId": "uuid-v4-tracking-id"
}
```

### Error Responses

#### Validation Error (400)
```json
{
  "status": "failed",
  "message": "Validation failed",
  "errors": [
    {
      "field": "data.title",
      "error": "String must contain at least 1 character(s)"
    }
  ]
}
```

#### Authentication Error (401)
```json
{
  "status": "failed",
  "message": "Invalid signature",
  "errors": [
    {
      "field": "headers",
      "error": "X-Signature does not match expected value"
    }
  ]
}
```

## Callback Notification

After processing your webhook, the system will send a POST request to your `notificationUrl` with the result:

### Success Callback
```json
{
  "status": "success",
  "trackingId": "uuid-v4-tracking-id",
  "idempotencyKey": "your-idempotency-key",
  "data": {
    "postUrl": "https://your-blog.com/blog/your-post-slug",
    "postId": "123"
  }
}
```

### Failure Callback
```json
{
  "status": "failed",
  "trackingId": "uuid-v4-tracking-id",
  "idempotencyKey": "your-idempotency-key",
  "error": {
    "code": "PROCESSING_FAILED",
    "message": "Failed to create blog post: error details"
  }
}
```

## Automated Content Generation

### How It Works

If the webhook sender fails to send blog content, the system has an intelligent fallback:

1. **Scheduled Days**: Content is auto-generated on **Mondays, Wednesdays, and Thursdays**
2. **Category Rotation**: Uses round-robin selection through all 10 categories
3. **AI-Powered**: Generates 700-900 word, SEO-optimized, humanized articles
4. **Quality**: Articles are conversational, keyword-rich, and professionally structured

### Content Generation Features

- **Length**: 700-900 words per article
- **Style**: Humanized, conversational, accessible
- **SEO**: Keyword-rich with proper meta tags
- **Structure**: H1 headline, 2-3 H2 subheadings, short paragraphs
- **Quality**: Unique insights, current trends, actionable takeaways
- **HTML Format**: Properly formatted with semantic HTML tags

### Manual Trigger (Admin Only)

Admins can manually trigger content generation:

**Endpoint**: POST `/api/admin/blog/generate`

**Authentication**: Requires admin login

**Response**:
```json
{
  "success": true,
  "message": "Successfully generated and published blog article: \"Article Title\"",
  "postId": 123
}
```

### View Schedule Status (Admin Only)

Check the auto-generation schedule:

**Endpoint**: GET `/api/admin/blog/schedule`

**Authentication**: Requires admin login

**Response**:
```json
{
  "success": true,
  "schedule": {
    "lastGeneratedDate": "2025-10-21T10:00:00.000Z",
    "lastGeneratedCategory": "AI & Machine Learning",
    "nextScheduledDate": "2025-10-23T10:00:00.000Z",
    "totalGenerated": 15,
    "failedAttempts": 0,
    "lastWebhookReceived": "2025-10-20T14:30:00.000Z",
    "isActive": true
  },
  "categories": [
    "Technology",
    "AI & Machine Learning",
    "Business Intelligence",
    "Automation",
    "Data Analytics",
    "Digital Transformation",
    "Cybersecurity",
    "Cloud Computing",
    "Software Development",
    "Industry News"
  ],
  "publishDays": ["Monday", "Wednesday", "Thursday"]
}
```

## Testing

Use the included `test-webhook.mjs` script to test the webhook integration:

```bash
node test-webhook.mjs
```

Make sure to update the script with your actual webhook URL and secret.

## Important Notes

1. **Idempotency**: Use unique `idempotencyKey` values to prevent duplicate posts
2. **Timestamp**: The `X-Request-Timestamp` must be within 5 minutes of current time
3. **Content Sanitization**: HTML content is automatically sanitized for security
4. **Slug Generation**: If not provided, slugs are auto-generated from the title
5. **Category Validation**: Only the 10 specified categories are accepted
6. **Webhook Priority**: Webhook content takes priority over auto-generation

## Environment Variables Required

Set these in your Replit Secrets:

- `WEBHOOK_SECRET`: Shared secret for webhook authentication (required - must match sender's secret)
- `AI_INTEGRATIONS_OPENAI_API_KEY`: Automatically set by Replit AI Integrations (required for fallback)
- `AI_INTEGRATIONS_OPENAI_BASE_URL`: Automatically set by Replit AI Integrations (required for fallback)

**Note**: The AI integration credentials are automatically configured when you use the Replit AI Integrations feature. If fallback content generation fails, ensure the OpenAI integration is properly set up in your Replit project.

## Webhook Processing Flow

1. **Webhook Received**: System validates signature and timestamp
2. **Validation**: Content data is validated against schemas
3. **Recording**: Webhook receipt is immediately recorded (prevents duplicate AI generation)
4. **Processing**: Job is queued and processed asynchronously
5. **Callback**: Sender is notified of success or failure

This ensures that even if webhook processing fails after validation, the system won't trigger AI fallback for the same day.

## Support

For issues or questions, contact your system administrator.
