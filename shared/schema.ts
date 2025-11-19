import { pgTable, text, serial, integer, boolean, timestamp, varchar, index, jsonb, uniqueIndex, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

// Users table for authentication and admin functionality
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().default([]).notNull(),
  featuredImage: text("featured_image"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  source: varchar("source", { length: 50 }).default("manual").notNull(),
});

export const blogSchedule = pgTable("blog_schedule", {
  id: serial("id").primaryKey(),
  lastGeneratedDate: timestamp("last_generated_date"),
  lastGeneratedCategory: varchar("last_generated_category", { length: 100 }),
  nextScheduledDate: timestamp("next_scheduled_date"),
  totalGenerated: integer("total_generated").default(0).notNull(),
  failedAttempts: integer("failed_attempts").default(0).notNull(),
  lastWebhookReceived: timestamp("last_webhook_received"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// CMS page content management
export const pageContents = pgTable("page_contents", {
  id: serial("id").primaryKey(),
  pageKey: varchar("page_key", { length: 255 }).notNull().unique(),
  title: text("title").notNull(),
  content: jsonb("content").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by").notNull().references(() => users.id),
});

// Search indexing table for advanced search functionality
export const searchIndex = pgTable("search_index", {
  id: serial("id").primaryKey(),
  contentType: varchar("content_type", { length: 50 }).notNull(), // 'blog', 'page', 'service'
  contentId: integer("content_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  searchVector: text("search_vector"), // For full-text search
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("search_content_idx").on(table.contentType, table.contentId),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  blogPosts: many(blogPosts),
  pageContents: many(pageContents),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));

export const pageContentsRelations = relations(pageContents, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [pageContents.updatedBy],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  publishedAt: true,
  updatedAt: true,
});

export const insertBlogScheduleSchema = createInsertSchema(blogSchedule).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPageContentSchema = createInsertSchema(pageContents).omit({
  id: true,
  updatedAt: true,
});

export const searchSchema = z.object({
  query: z.string().min(1).max(200),
  type: z.enum(['all', 'blog', 'page', 'service']).optional().default('all'),
  limit: z.number().min(1).max(50).optional().default(10),
  offset: z.number().min(0).optional().default(0),
});

// News cache table for 12-hour interval caching
export const newsCache = pgTable("news_cache", {
  id: serial("id").primaryKey(),
  cacheKey: varchar("cache_key", { length: 255 }).notNull().unique(), // e.g. 'technology_news'
  articles: jsonb("articles").notNull(), // Store the fetched articles array
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  sourceInfo: jsonb("source_info"), // Store info about which sources were used
  articleCount: integer("article_count").default(0),
});

// Free Tools table for user-submitted HTML/CSS/JS tools
export const freeTools = pgTable("free_tools", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  htmlCode: text("html_code").notNull(), // The complete HTML/CSS/JS code
  category: varchar("category", { length: 100 }), // e.g., 'calculator', 'converter', 'generator'
  isActive: boolean("is_active").default(true).notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  webhookSource: varchar("webhook_source", { length: 255 }), // Track webhook source
  metadata: jsonb("metadata"), // Additional tool metadata from webhook
});

// News Archive table - Comprehensive backup system for admin contingency
export const newsArchive = pgTable("news_archive", {
  id: serial("id").primaryKey(),
  articleId: varchar("article_id", { length: 500 }).notNull(), // Original article ID from API
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"), // Full article content if available
  url: text("url").notNull(),
  urlToImage: text("url_to_image"),
  publishedAt: timestamp("published_at"),
  sourceName: varchar("source_name", { length: 255 }).notNull(),
  sourceUrl: text("source_url"),
  sourceId: varchar("source_id", { length: 255 }),
  
  // Categorization and tagging
  category: varchar("category", { length: 100 }).default("technology").notNull(),
  tags: text("tags").array().default([]).notNull(), // Keywords and tags
  language: varchar("language", { length: 10 }).default("en").notNull(),
  country: varchar("country", { length: 10 }),
  
  // API and source metadata
  apiProvider: varchar("api_provider", { length: 50 }).notNull(), // 'newsapi_ai', 'newsnow'
  apiResponseId: varchar("api_response_id", { length: 255 }), // API-specific response ID
  fetchMethod: varchar("fetch_method", { length: 50 }).default("api").notNull(), // 'api', 'rss', 'scrape'
  
  // Content analysis and metadata
  summary: text("summary"), // Generated summary/excerpt
  keyPoints: text("key_points").array().default([]), // Key bullet points
  sentiment: varchar("sentiment", { length: 20 }), // 'positive', 'negative', 'neutral'
  wordCount: integer("word_count").default(0),
  readingTime: integer("reading_time").default(0), // Estimated reading time in minutes
  
  // SEO and social metadata
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  ogImage: text("og_image"),
  twitterCard: varchar("twitter_card", { length: 50 }),
  
  // Technical metadata
  contentHash: varchar("content_hash", { length: 64 }), // SHA-256 hash for duplicate detection
  imageAnalysis: jsonb("image_analysis"), // Image metadata and analysis
  rawApiResponse: jsonb("raw_api_response"), // Full original API response for debugging
  
  // Admin and quality control
  isVerified: boolean("is_verified").default(false).notNull(), // Admin verified for quality
  isActive: boolean("is_active").default(true).notNull(), // Active for internal use
  qualityScore: integer("quality_score").default(0), // 0-100 quality rating
  adminNotes: text("admin_notes"), // Admin comments and notes
  verifiedBy: integer("verified_by").references(() => users.id), // Admin who verified
  verifiedAt: timestamp("verified_at"),
  
  // Timestamps
  archivedAt: timestamp("archived_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("news_archive_article_id_idx").on(table.articleId),
  index("news_archive_source_idx").on(table.sourceName),
  index("news_archive_published_idx").on(table.publishedAt),
  index("news_archive_api_provider_idx").on(table.apiProvider),
  index("news_archive_category_idx").on(table.category),
  index("news_archive_archived_idx").on(table.archivedAt),
  index("news_archive_content_hash_idx").on(table.contentHash),
  uniqueIndex("news_archive_unique_content").on(table.contentHash),
]);

// AI News Summaries - OpenAI-powered summaries for trending tech news
export const aiNewsSummaries = pgTable("ai_news_summaries", {
  id: serial("id").primaryKey(),
  
  // Original article reference
  originalUrl: text("original_url").notNull(),
  originalTitle: text("original_title").notNull(),
  originalPublishedAt: timestamp("original_published_at"),
  sourceName: varchar("source_name", { length: 255 }).notNull(),
  sourceUrl: text("source_url"),
  
  // AI-generated summary content (200-300 words)
  aiSummary: text("ai_summary").notNull(),
  keyHighlights: text("key_highlights").array().default([]).notNull(), // Bullet points
  keyTakeaways: text("key_takeaways").array().default([]).notNull(), // Main insights
  actionItems: text("action_items").array().default([]).notNull(), // Suggested actions
  
  // Metadata
  category: varchar("category", { length: 100 }).default("technology").notNull(),
  tags: text("tags").array().default([]).notNull(),
  wordCount: integer("word_count").default(0),
  featuredImage: text("featured_image"), // AI-generated image URL
  
  // Credits and attribution
  originalAuthor: varchar("original_author", { length: 255 }),
  creditLine: text("credit_line").notNull(), // "Source: [Name] | [URL]"
  
  // AI generation metadata
  aiModel: varchar("ai_model", { length: 50 }).default("gpt-4").notNull(),
  generationPrompt: text("generation_prompt"), // The prompt used
  generationTokens: integer("generation_tokens").default(0),
  generationCost: decimal("generation_cost", { precision: 10, scale: 6 }).default("0"),
  
  // Scheduling and automation
  scheduledDate: timestamp("scheduled_date").notNull(), // When it was scheduled (Tue/Thu/Sat)
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  publishedAt: timestamp("published_at"),
  
  // Quality control
  qualityScore: integer("quality_score").default(0), // 0-100
  isVerified: boolean("is_verified").default(false).notNull(),
  verifiedBy: integer("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  adminNotes: text("admin_notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("ai_news_summaries_scheduled_idx").on(table.scheduledDate),
  index("ai_news_summaries_published_idx").on(table.publishedAt),
  index("ai_news_summaries_category_idx").on(table.category),
  index("ai_news_summaries_source_idx").on(table.sourceName),
]);

// News scheduler table - tracks automation schedule for Tue/Thu/Sat
export const newsSchedule = pgTable("news_schedule", {
  id: serial("id").primaryKey(),
  lastGeneratedDate: timestamp("last_generated_date"),
  nextScheduledDate: timestamp("next_scheduled_date"),
  totalGenerated: integer("total_generated").default(0).notNull(),
  failedAttempts: integer("failed_attempts").default(0).notNull(),
  lastSuccessfulRun: timestamp("last_successful_run"),
  lastFailedRun: timestamp("last_failed_run"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// News Source Statistics - Track API performance and source reliability
export const newsSourceStats = pgTable("news_source_stats", {
  id: serial("id").primaryKey(),
  sourceName: varchar("source_name", { length: 255 }).notNull(),
  apiProvider: varchar("api_provider", { length: 50 }).notNull(),
  
  // Statistics
  totalArticles: integer("total_articles").default(0).notNull(),
  successfulFetches: integer("successful_fetches").default(0).notNull(),
  failedFetches: integer("failed_fetches").default(0).notNull(),
  averageQualityScore: integer("average_quality_score").default(0),
  lastFetchAt: timestamp("last_fetch_at"),
  lastSuccessAt: timestamp("last_success_at"),
  lastFailureAt: timestamp("last_failure_at"),
  
  // Reliability metrics
  uptimePercentage: integer("uptime_percentage").default(100), // 0-100
  averageResponseTime: integer("average_response_time").default(0), // milliseconds
  reliabilityScore: integer("reliability_score").default(100), // 0-100
  
  // Admin tracking
  isActive: boolean("is_active").default(true).notNull(),
  adminNotes: text("admin_notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("news_source_stats_provider_idx").on(table.apiProvider),
  index("news_source_stats_source_idx").on(table.sourceName),
]);

// Newsletter leads table
export const newsletterLeads = pgTable("newsletter_leads", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  subscriptionDate: timestamp("subscription_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  source: varchar("source", { length: 100 }).default("website"), // website, referral, etc.
  userAgent: varchar("user_agent", { length: 500 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Referral partners table
export const referralPartners = pgTable("referral_partners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url").notNull(),
  referralUrl: text("referral_url").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // hosting, payment, email, database, etc.
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  commissionRate: varchar("commission_rate", { length: 50 }), // e.g., "10%", "$50 per signup"
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id", { length: 255 }).notNull().unique(),
  amount: integer("amount").notNull(), // Amount in paise
  currency: varchar("currency", { length: 3 }).default("INR"),
  status: varchar("status", { length: 50 }).default("created"), // created, paid, failed, cancelled
  customerName: varchar("customer_name", { length: 255 }),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 20 }),
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  description: text("description"),
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
  razorpaySignature: varchar("razorpay_signature", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }).notNull(),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("INR"),
  status: varchar("status", { length: 50 }).notNull(), // success, failed, pending
  method: varchar("method", { length: 50 }), // card, netbanking, wallet, upi
  bank: varchar("bank", { length: 100 }),
  walletType: varchar("wallet_type", { length: 100 }),
  vpa: varchar("vpa", { length: 255 }),
  fee: integer("fee"), // Razorpay fee in paise
  tax: integer("tax"), // Tax on fee in paise
  errorCode: varchar("error_code", { length: 50 }),
  errorDescription: text("error_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Order relations
export const ordersRelations = relations(orders, ({ many }) => ({
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const referralPartnersRelations = relations(referralPartners, ({ one }) => ({
  createdByUser: one(users, {
    fields: [referralPartners.createdBy],
    references: [users.id],
  }),
}));

export type NewsletterLead = typeof newsletterLeads.$inferSelect;
export type InsertNewsletterLead = typeof newsletterLeads.$inferInsert;

export const insertNewsletterLeadSchema = createInsertSchema(newsletterLeads).omit({
  id: true,
  subscriptionDate: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertReferralPartnerSchema = createInsertSchema(referralPartners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsCacheSchema = createInsertSchema(newsCache).omit({
  id: true,
  fetchedAt: true,
});

export const insertNewsArchiveSchema = createInsertSchema(newsArchive).omit({
  id: true,
  archivedAt: true,
  updatedAt: true,
});

export const insertAiNewsSummarySchema = createInsertSchema(aiNewsSummaries).omit({
  id: true,
  generatedAt: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const insertNewsScheduleSchema = createInsertSchema(newsSchedule).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFreeToolSchema = createInsertSchema(freeTools).omit({
  id: true,
  submittedAt: true,
});

export const insertNewsSourceStatsSchema = createInsertSchema(newsSourceStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Subscription Plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // Starter, Professional, Bronze, Silver, Gold
  planType: varchar("plan_type", { length: 50 }).notNull(), // monthly, tiered, per_post
  priceMin: integer("price_min").notNull(), // Price in INR paise, minimum for ranges
  priceMax: integer("price_max"), // Maximum for ranges in INR paise, null for fixed pricing
  currency: varchar("currency", { length: 3 }).default("INR"),
  billingInterval: varchar("billing_interval", { length: 20 }).default("monthly"), // monthly, one_time
  description: text("description").notNull(),
  features: jsonb("features").notNull(), // Array of feature strings
  
  // Razorpay plan tracking
  razorpayPlanId: varchar("razorpay_plan_id", { length: 255 }),
  
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  // Unique constraints for Razorpay integration
  uniqueIndex("subscription_plans_razorpay_plan_id_unique").on(table.razorpayPlanId),
  // Validation constraints
  // priceMin must be > 0
  // priceMax must be >= priceMin when not null
]);

// User Subscriptions table
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  status: varchar("status", { length: 50 }).default("pending"), // active, cancelled, expired, pending
  agreedPrice: integer("agreed_price").notNull(), // Base price in INR paise (before GST)
  totalPrice: integer("total_price").notNull(), // Total price including GST in INR paise
  gstAmount: integer("gst_amount").notNull(), // GST amount in INR paise
  gstRate: decimal("gst_rate", { precision: 5, scale: 2 }).default("18.00"), // GST rate percentage (18%)
  currency: varchar("currency", { length: 3 }).default("INR"),
  billingInterval: varchar("billing_interval", { length: 20 }).default("monthly"),
  
  // Billing dates
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"), // For fixed-term subscriptions
  nextBillingDate: timestamp("next_billing_date"),
  lastBillingDate: timestamp("last_billing_date"),
  
  // Razorpay subscription tracking
  razorpaySubscriptionId: varchar("razorpay_subscription_id", { length: 255 }),
  
  // Metadata
  metadata: jsonb("metadata"), // Additional subscription details
  cancelReason: text("cancel_reason"),
  cancelledAt: timestamp("cancelled_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("user_subscriptions_user_idx").on(table.userId),
  index("user_subscriptions_plan_idx").on(table.planId),
  index("user_subscriptions_status_idx").on(table.status),
  // Unique constraints for Razorpay integration
  uniqueIndex("user_subscriptions_razorpay_subscription_id_unique").on(table.razorpaySubscriptionId),
]);

// Subscription Payments table - Track recurring payments
export const subscriptionPayments = pgTable("subscription_payments", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").notNull().references(() => userSubscriptions.id),
  orderId: integer("order_id").references(() => orders.id), // Link to main orders table
  amount: integer("amount").notNull(), // Total amount in INR paise (includes GST)
  baseAmount: integer("base_amount"), // Base amount before tax in INR paise
  gstAmount: integer("gst_amount"), // GST amount in INR paise
  gstRate: decimal("gst_rate", { precision: 5, scale: 2 }).default("18.00"), // GST rate percentage (18%)
  currency: varchar("currency", { length: 3 }).default("INR"),
  status: varchar("status", { length: 50 }).notNull(), // success, failed, pending, refunded
  
  // Razorpay payment details
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
  
  // Payment method details
  paymentMethod: varchar("payment_method", { length: 50 }), // card, netbanking, wallet, upi
  paymentDetails: jsonb("payment_details"), // Additional payment method info
  
  // Billing period info
  billingPeriodStart: timestamp("billing_period_start"),
  billingPeriodEnd: timestamp("billing_period_end"),
  
  // Failure handling
  failureReason: text("failure_reason"),
  retryCount: integer("retry_count").default(0),
  nextRetryAt: timestamp("next_retry_at"),
  
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("subscription_payments_subscription_idx").on(table.subscriptionId),
  index("subscription_payments_status_idx").on(table.status),
  index("subscription_payments_paid_at_idx").on(table.paidAt),
]);

// Subscription plan relations
export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  userSubscriptions: many(userSubscriptions),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [userSubscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  payments: many(subscriptionPayments),
}));

export const subscriptionPaymentsRelations = relations(subscriptionPayments, ({ one }) => ({
  subscription: one(userSubscriptions, {
    fields: [subscriptionPayments.subscriptionId],
    references: [userSubscriptions.id],
  }),
  order: one(orders, {
    fields: [subscriptionPayments.orderId],
    references: [orders.id],
  }),
}));

// Subscription schemas
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionPaymentSchema = createInsertSchema(subscriptionPayments).omit({
  id: true,
  createdAt: true,
});

export type InsertNewsletterLeadData = z.infer<typeof insertNewsletterLeadSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type ReferralPartner = typeof referralPartners.$inferSelect;
export type InsertReferralPartner = z.infer<typeof insertReferralPartnerSchema>;

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type PageContent = typeof pageContents.$inferSelect;
export type InsertPageContent = z.infer<typeof insertPageContentSchema>;
export type SearchQuery = z.infer<typeof searchSchema>;
export type SearchIndex = typeof searchIndex.$inferSelect;
export type NewsCache = typeof newsCache.$inferSelect;
export type InsertNewsCache = z.infer<typeof insertNewsCacheSchema>;
export type NewsArchive = typeof newsArchive.$inferSelect;
export type InsertNewsArchive = z.infer<typeof insertNewsArchiveSchema>;
export type AiNewsSummary = typeof aiNewsSummaries.$inferSelect;
export type InsertAiNewsSummary = z.infer<typeof insertAiNewsSummarySchema>;
export type NewsSchedule = typeof newsSchedule.$inferSelect;
export type InsertNewsSchedule = z.infer<typeof insertNewsScheduleSchema>;
export type NewsSourceStats = typeof newsSourceStats.$inferSelect;
export type InsertNewsSourceStats = z.infer<typeof insertNewsSourceStatsSchema>;

// Subscription type exports
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type SubscriptionPayment = typeof subscriptionPayments.$inferSelect;
export type InsertSubscriptionPayment = z.infer<typeof insertSubscriptionPaymentSchema>;

// Free Tools type exports
export type FreeTool = typeof freeTools.$inferSelect;
export type InsertFreeTool = z.infer<typeof insertFreeToolSchema>;

// Webhook requests table - logs all incoming webhook requests
export const webhookRequests = pgTable("webhook_requests", {
  id: serial("id").primaryKey(),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).notNull().unique(),
  trackingId: varchar("tracking_id", { length: 255 }).notNull().unique(),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  targetPlatform: jsonb("target_platform").notNull(),
  notificationUrl: text("notification_url"),
  requestPayload: jsonb("request_payload").notNull(),
  responseStatus: integer("response_status").notNull(),
  responseData: jsonb("response_data"),
  signature: text("signature").notNull(),
  timestamp: varchar("timestamp", { length: 50 }).notNull(),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("webhook_requests_idempotency_idx").on(table.idempotencyKey),
  index("webhook_requests_tracking_idx").on(table.trackingId),
]);

// Webhook jobs table - manages async processing
export const webhookJobs = pgTable("webhook_jobs", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull().references(() => webhookRequests.id),
  trackingId: varchar("tracking_id", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default('queued'), // queued, processing, completed, failed
  contentType: varchar("content_type", { length: 50 }).notNull(),
  contentData: jsonb("content_data").notNull(),
  publishedContentId: integer("published_content_id"),
  publishedContentUrl: text("published_content_url"),
  errorMessage: text("error_message"),
  callbackAttempts: integer("callback_attempts").default(0).notNull(),
  callbackStatus: varchar("callback_status", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("webhook_jobs_tracking_idx").on(table.trackingId),
  index("webhook_jobs_status_idx").on(table.status),
]);

// User onboarding progress table
export const userOnboarding = pgTable("user_onboarding", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  hasCompletedTour: boolean("has_completed_tour").default(false).notNull(),
  tourStep: integer("tour_step").default(0).notNull(),
  hasViewedProfile: boolean("has_viewed_profile").default(false).notNull(),
  hasCreatedContent: boolean("has_created_content").default(false).notNull(),
  hasExploredProducts: boolean("has_explored_products").default(false).notNull(),
  completionPercentage: integer("completion_percentage").default(0).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("user_onboarding_user_idx").on(table.userId),
]);

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // info, warning, success, error, announcement
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  actionUrl: text("action_url"),
  actionLabel: varchar("action_label", { length: 100 }),
  isRead: boolean("is_read").default(false).notNull(),
  priority: varchar("priority", { length: 20 }).default('normal').notNull(), // low, normal, high, urgent
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("notifications_user_idx").on(table.userId),
  index("notifications_read_idx").on(table.isRead),
  index("notifications_created_idx").on(table.createdAt),
]);

// Testimonials table
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerTitle: varchar("customer_title", { length: 255 }),
  customerCompany: varchar("customer_company", { length: 255 }),
  customerImage: text("customer_image"),
  testimonialText: text("testimonial_text").notNull(),
  rating: integer("rating").default(5).notNull(), // 1-5 stars
  productService: varchar("product_service", { length: 255 }), // Which product/service they're reviewing
  isApproved: boolean("is_approved").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("testimonials_approved_idx").on(table.isApproved),
  index("testimonials_featured_idx").on(table.isFeatured),
]);

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  pushNotifications: boolean("push_notifications").default(true).notNull(),
  newsletterSubscribed: boolean("newsletter_subscribed").default(false).notNull(),
  theme: varchar("theme", { length: 20 }).default('light').notNull(), // light, dark, auto
  language: varchar("language", { length: 10 }).default('en').notNull(),
  timezone: varchar("timezone", { length: 100 }).default('UTC').notNull(),
  displayName: varchar("display_name", { length: 255 }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  socialLinks: jsonb("social_links"), // {linkedin, twitter, github, etc}
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("user_preferences_user_idx").on(table.userId),
]);

// Chat conversations table - tracks chat sessions
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  userEmail: varchar("user_email", { length: 255 }),
  userName: varchar("user_name", { length: 255 }),
  status: varchar("status", { length: 20 }).default('active').notNull(), // active, closed, archived
  totalMessages: integer("total_messages").default(0).notNull(),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("chat_conversations_session_idx").on(table.sessionId),
  index("chat_conversations_user_idx").on(table.userId),
  index("chat_conversations_status_idx").on(table.status),
]);

// Chat messages table - individual messages with AI responses
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => chatConversations.id),
  sender: varchar("sender", { length: 20 }).notNull(), // user, ai
  message: text("message").notNull(),
  response: text("response"),
  responseSource: varchar("response_source", { length: 50 }), // database, openai, fallback
  similarityScore: decimal("similarity_score", { precision: 5, scale: 4 }), // For DB cache matching
  usageCount: integer("usage_count").default(1).notNull(), // How many times this Q&A pair was used
  isResolved: boolean("is_resolved").default(false).notNull(),
  rating: integer("rating"), // User rating 1-5
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("chat_messages_conversation_idx").on(table.conversationId),
  index("chat_messages_usage_idx").on(table.usageCount),
]);

// Chat FAQs table - frequently asked questions from chat data
export const chatFAQs = pgTable("chat_faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // ai-solutions, software-dev, tools, pricing, etc
  tags: text("tags").array().default([]).notNull(),
  askCount: integer("ask_count").default(1).notNull(), // How many times this question was asked
  uniqueUserCount: integer("unique_user_count").default(1).notNull(), // How many unique users asked
  isPublished: boolean("is_published").default(false).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("chat_faqs_category_idx").on(table.category),
  index("chat_faqs_published_idx").on(table.isPublished),
  index("chat_faqs_ask_count_idx").on(table.askCount),
]);

// Webhook relations
export const webhookRequestsRelations = relations(webhookRequests, ({ many }) => ({
  jobs: many(webhookJobs),
}));

export const webhookJobsRelations = relations(webhookJobs, ({ one }) => ({
  request: one(webhookRequests, {
    fields: [webhookJobs.requestId],
    references: [webhookRequests.id],
  }),
}));

// User onboarding relations
export const userOnboardingRelations = relations(userOnboarding, ({ one }) => ({
  user: one(users, {
    fields: [userOnboarding.userId],
    references: [users.id],
  }),
}));

// Notifications relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// User preferences relations
export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

// Webhook schemas
export const insertWebhookRequestSchema = createInsertSchema(webhookRequests).omit({
  id: true,
  createdAt: true,
});

export const insertWebhookJobSchema = createInsertSchema(webhookJobs).omit({
  id: true,
  createdAt: true,
  processedAt: true,
  completedAt: true,
});

// Webhook type exports
export type WebhookRequest = typeof webhookRequests.$inferSelect;
export type InsertWebhookRequest = z.infer<typeof insertWebhookRequestSchema>;
export type WebhookJob = typeof webhookJobs.$inferSelect;
export type InsertWebhookJob = z.infer<typeof insertWebhookJobSchema>;

// User onboarding schemas
export const insertUserOnboardingSchema = createInsertSchema(userOnboarding).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Notifications schemas
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Testimonials schemas
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User preferences schemas
export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User onboarding type exports
export type UserOnboarding = typeof userOnboarding.$inferSelect;
export type InsertUserOnboarding = z.infer<typeof insertUserOnboardingSchema>;

// Notifications type exports
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Testimonials type exports
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

// User preferences type exports
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

// Blog schedule type exports
export type BlogSchedule = typeof blogSchedule.$inferSelect;
export type InsertBlogSchedule = z.infer<typeof insertBlogScheduleSchema>;

// Chat relations
export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [chatConversations.userId],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}));

// Chat schemas
export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertChatFAQSchema = createInsertSchema(chatFAQs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Chat type exports
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatFAQ = typeof chatFAQs.$inferSelect;
export type InsertChatFAQ = z.infer<typeof insertChatFAQSchema>;