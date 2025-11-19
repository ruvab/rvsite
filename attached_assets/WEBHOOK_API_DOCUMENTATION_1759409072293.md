# Content Publishing Webhook API Documentation

## Overview

The Content Publishing Webhook allows external content creation applications to automatically publish content to AgeHealthy. The system supports multiple content types with secure HMAC authentication, idempotency, and asynchronous processing with callback notifications.

## Features

✅ **HMAC Authentication** - SHA256 signature-based security  
✅ **Idempotency Support** - Prevent duplicate processing with unique keys  
✅ **Async Processing** - Immediate 202 response, processing in background  
✅ **Callback Notifications** - Success/failure notifications to your URL  
✅ **Multiple Content Types** - Blog posts, LinkedIn posts, Instagram stories  
✅ **HTML Sanitization** - Automatic XSS protection for HTML content  
✅ **Tracking & Monitoring** - Full audit trail with tracking IDs

## Endpoint

```
POST /api/v1/content/publish
```

## Authentication

All requests must include HMAC SHA256 signature in headers:

### Required Headers

| Header | Description |
|--------|-------------|
| `X-Signature` | HMAC SHA256 signature of `timestamp + JSON.stringify(body)` |
| `X-Request-Timestamp` | Current Unix timestamp in milliseconds |
| `Content-Type` | Must be `application/json` |

### Signature Generation

```javascript
const crypto = require('crypto');

const timestamp = Date.now().toString();
const payload = { /* your request body */ };
const signatureString = timestamp + JSON.stringify(payload);

const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(signatureString)
  .digest('hex');
```

### Environment Variable

Set your webhook secret:
```bash
WEBHOOK_SECRET=your-secret-key-here
```

⚠️ **Security Note**: The request timestamp must be within 5 minutes of current time to prevent replay attacks.

## Request Format

### Base Payload Structure

```json
{
  "idempotencyKey": "unique-request-id-123",
  "contentType": "blogPost",
  "targetPlatform": {
    "name": "AgeHealthy Blog",
    "publishStatus": "publish"
  },
  "notificationUrl": "https://your-app.com/webhook/callback",
  "data": {
    // Content-specific data
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `idempotencyKey` | string | Yes | Unique identifier to prevent duplicate processing |
| `contentType` | string | Yes | Type of content: `blogPost`, `linkedInPost`, `instagramStory` |
| `targetPlatform.name` | string | Yes | Platform name (e.g., "AgeHealthy Blog") |
| `targetPlatform.publishStatus` | string | Yes | `publish` or `draft` |
| `notificationUrl` | string | Yes | Your URL to receive success/failure callbacks |
| `data` | object | Yes | Content-specific data (see below) |

## Content Types

### 1. Blog Post (`blogPost`)

```json
{
  "idempotencyKey": "blog-post-123",
  "contentType": "blogPost",
  "targetPlatform": {
    "name": "AgeHealthy Blog",
    "publishStatus": "publish"
  },
  "notificationUrl": "https://your-app.com/callback",
  "data": {
    "title": "The Science of Healthy Aging",
    "contentHtml": "<h2>Introduction</h2><p>Aging is...</p>",
    "slug": "science-of-healthy-aging",
    "featuredImageUrl": "https://example.com/image.jpg",
    "tags": ["aging", "health", "wellness"],
    "categories": ["Health Tips", "Science"],
    "meta": {
      "seoTitle": "The Science of Healthy Aging | AgeHealthy",
      "seoDescription": "Discover evidence-based strategies for healthy aging"
    }
  }
}
```

**Blog Post Data Fields:**

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `title` | string | Yes | 200 chars | Blog post title |
| `contentHtml` | string | Yes | 50,000 chars | HTML content (automatically sanitized) |
| `slug` | string | No | 200 chars | URL-friendly slug (auto-generated if omitted) |
| `featuredImageUrl` | string | No | 500 chars | Main image URL |
| `tags` | string[] | No | 10 tags | Content tags |
| `categories` | string[] | No | 5 categories | Content categories |
| `meta.seoTitle` | string | No | 100 chars | SEO title tag |
| `meta.seoDescription` | string | No | 200 chars | SEO meta description |

### 2. LinkedIn Post (`linkedInPost`)

```json
{
  "idempotencyKey": "linkedin-post-456",
  "contentType": "linkedInPost",
  "targetPlatform": {
    "name": "LinkedIn",
    "publishStatus": "publish"
  },
  "notificationUrl": "https://your-app.com/callback",
  "data": {
    "text": "🎯 New Research: The Secret to Healthy Aging...",
    "mediaUrls": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ]
  }
}
```

**LinkedIn Post Data Fields:**

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `text` | string | Yes | 3,000 chars | Post text content |
| `mediaUrls` | string[] | No | 4 URLs | Image/video URLs |

### 3. Instagram Story (`instagramStory`)

```json
{
  "idempotencyKey": "ig-story-789",
  "contentType": "instagramStory",
  "targetPlatform": {
    "name": "Instagram",
    "publishStatus": "publish"
  },
  "notificationUrl": "https://your-app.com/callback",
  "data": {
    "mediaUrl": "https://example.com/story-image.jpg",
    "mediaType": "image",
    "stickers": [
      {
        "type": "location",
        "data": { "locationId": "123456" }
      }
    ]
  }
}
```

**Instagram Story Data Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mediaUrl` | string | Yes | Story media URL (image or video) |
| `mediaType` | string | Yes | `image` or `video` |
| `stickers` | array | No | Story stickers (location, poll, etc.) |

## Response Format

### Success Response (202 Accepted)

The endpoint returns immediately with a tracking ID while processing continues asynchronously:

```json
{
  "status": "processing",
  "message": "Request received and is being processed.",
  "trackingId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Error Responses

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

#### Validation Error (400)
```json
{
  "status": "failed",
  "message": "Validation failed",
  "errors": [
    {
      "field": "data.title",
      "error": "Title is required"
    },
    {
      "field": "data.contentHtml",
      "error": "Content exceeds maximum length"
    }
  ]
}
```

#### Server Error (500)
```json
{
  "status": "failed",
  "message": "Internal server error",
  "errors": [
    {
      "field": "system",
      "error": "Database connection failed"
    }
  ]
}
```

## Callback Notifications

After processing completes (success or failure), the system sends a POST request to your `notificationUrl`.

### Success Callback

```json
{
  "status": "success",
  "trackingId": "550e8400-e29b-41d4-a716-446655440000",
  "idempotencyKey": "blog-post-123",
  "data": {
    "postUrl": "https://agehealthy.app/blog/science-of-healthy-aging",
    "postId": "c8f7a0d3-e5b6-4c9a-8f2d-1a3b5c7d9e0f"
  }
}
```

### Failure Callback

```json
{
  "status": "failed",
  "trackingId": "550e8400-e29b-41d4-a716-446655440000",
  "idempotencyKey": "blog-post-123",
  "error": {
    "code": "PROCESSING_FAILED",
    "message": "Failed to create blog post: Database error"
  }
}
```

### Callback Retry Logic

- **Max Retries**: 3 attempts
- **Retry Delay**: Exponential backoff (2s, 4s, 8s)
- **Timeout**: 10 seconds per attempt

## Idempotency

The `idempotencyKey` ensures duplicate requests with the same key return the same result without re-processing:

1. First request: Processes content, returns tracking ID
2. Duplicate request: Returns cached result with same tracking ID
3. Cache persists indefinitely for audit trail

**Best Practice**: Use a combination of timestamp and unique identifier:
```
idempotencyKey: `${contentType}-${timestamp}-${uniqueId}`
```

## Security Features

### 1. HMAC Signature Authentication
- SHA256 algorithm with shared secret
- Prevents unauthorized access
- Verifies request integrity

### 2. Timestamp Validation
- Maximum 5-minute age for requests
- Prevents replay attacks
- Protects against man-in-the-middle

### 3. HTML Sanitization
- Automatic XSS protection
- Removes malicious scripts
- Preserves safe formatting

### 4. URL Validation
- Validates image and media URLs
- Prevents SSRF attacks
- Ensures HTTPS for external resources

## Rate Limiting

- **Free Tier**: 100 requests/day
- **Premium**: Unlimited requests
- Returns 429 when limit exceeded

## Testing

Use the provided test script to verify integration:

```bash
node webhook-test.js
```

The test script includes:
- ✅ Blog post creation
- ✅ LinkedIn post creation  
- ✅ Idempotency verification
- ✅ Invalid signature security test

## Database Tables

The webhook system uses these tables for tracking:

### `webhook_requests`
- Logs all incoming webhook requests
- Stores idempotency keys
- Tracks request/response data

### `webhook_jobs`
- Manages async processing jobs
- Tracks job status (queued, processing, completed, failed)
- Records callback notification attempts

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_FAILED` | HMAC signature validation failed |
| `VALIDATION_FAILED` | Request payload validation error |
| `PROCESSING_FAILED` | Content processing error |
| `CALLBACK_FAILED` | Notification delivery failed |

## Support

For issues or questions:
- Check server logs for detailed error messages
- Verify HMAC signature generation
- Ensure timestamp is within 5-minute window
- Validate payload against content type schema

## Example Integration

```javascript
const crypto = require('crypto');
const fetch = require('node-fetch');

async function publishBlogPost(title, content) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  const WEBHOOK_URL = 'https://your-agehealthy-instance.com/api/v1/content/publish';
  
  const payload = {
    idempotencyKey: `blog-${Date.now()}-${Math.random()}`,
    contentType: 'blogPost',
    targetPlatform: {
      name: 'AgeHealthy Blog',
      publishStatus: 'publish'
    },
    notificationUrl: 'https://your-app.com/webhook/callback',
    data: {
      title,
      contentHtml: content,
      tags: ['wellness', 'health'],
      categories: ['Health Tips']
    }
  };

  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(timestamp + JSON.stringify(payload))
    .digest('hex');

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signature,
      'X-Request-Timestamp': timestamp
    },
    body: JSON.stringify(payload)
  });

  return await response.json();
}
```

---

**Version**: 2.0.0  
**Last Updated**: October 2025
