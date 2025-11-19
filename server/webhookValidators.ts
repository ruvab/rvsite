import { z } from 'zod';

const VALID_BLOG_CATEGORIES = [
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

const blogPostDataSchema = z.object({
  title: z.string().min(1).max(200),
  contentHtml: z.string().min(1).max(50000),
  slug: z.string().max(200).optional(),
  featuredImageUrl: z.string().url().max(500).optional(),
  tags: z.array(z.string()).max(10).optional(),
  category: z.enum(VALID_BLOG_CATEGORIES).optional(),
  categories: z.array(z.enum(VALID_BLOG_CATEGORIES)).max(5).optional(),
  meta: z.object({
    seoTitle: z.string().max(100).optional(),
    seoDescription: z.string().max(200).optional(),
  }).optional(),
});

const linkedInPostDataSchema = z.object({
  text: z.string().min(1).max(3000),
  mediaUrls: z.array(z.string().url()).max(4).optional(),
});

const instagramStoryDataSchema = z.object({
  mediaUrl: z.string().url(),
  mediaType: z.enum(['image', 'video']),
  stickers: z.array(z.object({
    type: z.string(),
    data: z.record(z.any()),
  })).optional(),
});

export const webhookPayloadSchema = z.object({
  idempotencyKey: z.string().min(1).max(255),
  contentType: z.enum(['blogPost', 'linkedInPost', 'instagramStory']),
  targetPlatform: z.object({
    name: z.string().min(1),
    publishStatus: z.enum(['publish', 'draft']),
  }),
  notificationUrl: z.string().url(),
  data: z.any(),
});

export function validateContentData(contentType: string, data: any) {
  switch (contentType) {
    case 'blogPost':
      return blogPostDataSchema.parse(data);
    case 'linkedInPost':
      return linkedInPostDataSchema.parse(data);
    case 'instagramStory':
      return instagramStoryDataSchema.parse(data);
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }
}

export function formatValidationErrors(error: z.ZodError) {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    error: err.message,
  }));
}
