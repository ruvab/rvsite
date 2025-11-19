import { 
  type BlogPost, type InsertBlogPost, type User, type InsertUser,
  type PageContent, type InsertPageContent, type SearchQuery, type SearchIndex,
  type NewsletterLead, type InsertNewsletterLead, type Order, type InsertOrder,
  type Payment, type InsertPayment, type ReferralPartner, type InsertReferralPartner,
  type NewsCache, type InsertNewsCache, type NewsArchive, type InsertNewsArchive,
  type NewsSourceStats, type InsertNewsSourceStats,
  type SubscriptionPlan, type InsertSubscriptionPlan, 
  type UserSubscription, type InsertUserSubscription,
  type SubscriptionPayment, type InsertSubscriptionPayment,
  type FreeTool, type InsertFreeTool,
  type BlogSchedule, type InsertBlogSchedule,
  type NewsSchedule, type InsertNewsSchedule,
  type AiNewsSummary, type InsertAiNewsSummary,
  type UserOnboarding, type InsertUserOnboarding,
  type Notification, type InsertNotification,
  type Testimonial, type InsertTestimonial,
  type UserPreferences, type InsertUserPreferences,
  type ChatConversation, type InsertChatConversation,
  type ChatMessage, type InsertChatMessage,
  type ChatFAQ, type InsertChatFAQ
} from "@shared/schema";
import { db } from "./db";
import { users, blogPosts, pageContents, searchIndex, newsletterLeads, orders, payments, referralPartners, newsCache, newsArchive, newsSourceStats, subscriptionPlans, userSubscriptions, subscriptionPayments, freeTools, blogSchedule, newsSchedule, aiNewsSummaries, userOnboarding, notifications, testimonials, userPreferences, chatConversations, chatMessages, chatFAQs } from "@shared/schema";
import { eq, like, or, desc, and, lt, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Blog operations
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;

  // Page content operations
  getPageContent(pageKey: string): Promise<PageContent | undefined>;
  getAllPageContents(): Promise<PageContent[]>;
  createPageContent(insertPageContent: InsertPageContent): Promise<PageContent>;
  updatePageContent(pageKey: string, updates: Partial<InsertPageContent>): Promise<PageContent | undefined>;

  // Search operations
  searchContent(query: SearchQuery): Promise<SearchIndex[]>;
  updateSearchIndex(contentType: string, contentId: number, title: string, content: string): Promise<void>;

  // Newsletter operations
  createNewsletterLead(insertLead: InsertNewsletterLead): Promise<NewsletterLead>;
  getNewsletterLeads(): Promise<NewsletterLead[]>;
  getNewsletterLead(email: string): Promise<NewsletterLead | undefined>;

  // Payment operations
  createOrder(insertOrder: InsertOrder): Promise<Order>;
  getOrder(orderId: string): Promise<Order | undefined>;
  getOrderById(id: number): Promise<Order | undefined>;
  updateOrder(orderId: string, updates: Partial<InsertOrder>): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  
  createPayment(insertPayment: InsertPayment): Promise<Payment>;
  getPaymentsByOrderId(orderId: number): Promise<Payment[]>;
  getPaymentByRazorpayId(razorpayPaymentId: string): Promise<Payment | undefined>;

  // Referral partner operations
  getReferralPartners(): Promise<ReferralPartner[]>;
  getReferralPartner(id: number): Promise<ReferralPartner | undefined>;
  createReferralPartner(insertPartner: InsertReferralPartner): Promise<ReferralPartner>;
  updateReferralPartner(id: number, updates: Partial<InsertReferralPartner>): Promise<ReferralPartner | undefined>;
  deleteReferralPartner(id: number): Promise<boolean>;

  // News cache operations for 12-hour caching
  getNewsCache(cacheKey: string): Promise<NewsCache | undefined>;
  setNewsCache(cacheData: InsertNewsCache): Promise<NewsCache>;
  isNewsCacheValid(cacheKey: string): Promise<boolean>;
  clearExpiredNewsCache(): Promise<void>;

  // News archive operations for admin backup/contingency
  archiveNewsArticle(article: InsertNewsArchive): Promise<NewsArchive>;
  archiveNewsArticles(articles: InsertNewsArchive[]): Promise<NewsArchive[]>;
  getArchivedArticles(options?: { limit?: number; offset?: number; apiProvider?: string }): Promise<NewsArchive[]>;
  getArchivedArticleById(id: number): Promise<NewsArchive | undefined>;
  getArchivedArticleByHash(contentHash: string): Promise<NewsArchive | undefined>;
  updateArchivedArticle(id: number, updates: Partial<InsertNewsArchive>): Promise<NewsArchive | undefined>;
  deleteArchivedArticle(id: number): Promise<boolean>;
  getArchiveStatistics(): Promise<{ totalArticles: number; byProvider: Record<string, number>; byCategory: Record<string, number> }>;

  // News source statistics operations
  updateSourceStats(sourceName: string, apiProvider: string, success: boolean, responseTime?: number): Promise<void>;
  getSourceStats(apiProvider?: string): Promise<NewsSourceStats[]>;
  getSourceStatsByName(sourceName: string, apiProvider: string): Promise<NewsSourceStats | undefined>;

  // Subscription plans operations
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;

  // User subscriptions operations
  getUserSubscriptions(userId: number): Promise<UserSubscription[]>;
  getUserActiveSubscription(userId: number): Promise<UserSubscription | undefined>;
  getUserSubscription(id: number): Promise<UserSubscription | undefined>;
  createUserSubscription(insertSubscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: number, updates: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined>;

  // Subscription payments operations
  getSubscriptionPayments(subscriptionId: number): Promise<SubscriptionPayment[]>;
  getUserPaymentHistory(userId: number): Promise<SubscriptionPayment[]>;
  createSubscriptionPayment(insertPayment: InsertSubscriptionPayment): Promise<SubscriptionPayment>;
  updateSubscriptionPayment(id: number, updates: Partial<InsertSubscriptionPayment>): Promise<SubscriptionPayment | undefined>;

  // Free tools operations
  getFreeTools(): Promise<FreeTool[]>;
  getFreeTool(id: number): Promise<FreeTool | undefined>;
  createFreeTool(insertTool: InsertFreeTool): Promise<FreeTool>;
  updateFreeTool(id: number, updates: Partial<InsertFreeTool>): Promise<FreeTool | undefined>;
  deleteFreeTool(id: number): Promise<boolean>;

  // Blog Schedule operations
  getBlogSchedule(): Promise<BlogSchedule | undefined>;
  updateBlogSchedule(updates: Partial<InsertBlogSchedule>): Promise<BlogSchedule>;
  createBlogSchedule(schedule: InsertBlogSchedule): Promise<BlogSchedule>;

  // News Schedule operations
  getNewsSchedule(): Promise<NewsSchedule | undefined>;
  updateNewsSchedule(updates: Partial<InsertNewsSchedule>): Promise<NewsSchedule>;
  createNewsSchedule(schedule: InsertNewsSchedule): Promise<NewsSchedule>;

  // AI News Summaries operations
  getAiNewsSummaries(options?: { limit?: number; offset?: number }): Promise<AiNewsSummary[]>;
  getAiNewsSummary(id: number): Promise<AiNewsSummary | undefined>;
  getRecentAiNewsSummaries(limit?: number): Promise<AiNewsSummary[]>;

  // User Onboarding operations
  getUserOnboarding(userId: number): Promise<UserOnboarding | undefined>;
  createUserOnboarding(userId: number): Promise<UserOnboarding>;
  updateUserOnboarding(userId: number, updates: Partial<InsertUserOnboarding>): Promise<UserOnboarding | undefined>;

  // Notifications operations
  getUserNotifications(userId: number, options?: { unreadOnly?: boolean; limit?: number }): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(insertNotification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  deleteNotification(id: number): Promise<boolean>;
  getUnreadNotificationCount(userId: number): Promise<number>;

  // Testimonials operations
  getTestimonials(options?: { approvedOnly?: boolean; featuredOnly?: boolean }): Promise<Testimonial[]>;
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, updates: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<boolean>;

  // User Preferences operations
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(userId: number, preferences?: Partial<InsertUserPreferences>): Promise<UserPreferences>;
  updateUserPreferences(userId: number, updates: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined>;

  // Chat Conversation operations
  getChatConversation(sessionId: string): Promise<ChatConversation | undefined>;
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  updateChatConversation(sessionId: string, updates: Partial<InsertChatConversation>): Promise<ChatConversation | undefined>;
  getChatConversationsByUser(userId: number): Promise<ChatConversation[]>;

  // Chat Message operations
  getChatMessages(conversationId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  updateChatMessage(id: number, updates: Partial<InsertChatMessage>): Promise<ChatMessage | undefined>;
  findSimilarQuestion(question: string): Promise<ChatMessage | undefined>;
  incrementMessageUsage(id: number): Promise<void>;

  // Chat FAQ operations
  getChatFAQs(options?: { category?: string; limit?: number }): Promise<ChatFAQ[]>;
  getChatFAQ(id: number): Promise<ChatFAQ | undefined>;
  createChatFAQ(faq: InsertChatFAQ): Promise<ChatFAQ>;
  updateChatFAQ(id: number, updates: Partial<InsertChatFAQ>): Promise<ChatFAQ | undefined>;
  deleteChatFAQ(id: number): Promise<boolean>;
  incrementFAQAskCount(id: number, uniqueUser?: boolean): Promise<void>;
  getPublishedFAQs(): Promise<ChatFAQ[]>;

  // Initialize default data
  initializeDefaultData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error(`Database error fetching user by ID ${id}:`, error);
      throw new Error('Failed to fetch user from database');
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error(`Database error fetching user by username ${username}:`, error);
      throw new Error('Failed to fetch user from database');
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(insertUser.password, 10);
      
      const [user] = await db
        .insert(users)
        .values({
          ...insertUser,
          password: hashedPassword,
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Database error creating user:', error);
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') { // PostgreSQL unique violation
        throw new Error('Username or email already exists');
      }
      throw new Error('Failed to create user');
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Blog operations
  async getBlogPosts(): Promise<BlogPost[]> {
    try {
      return await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.isPublished, true))
        .orderBy(desc(blogPosts.publishedAt));
    } catch (error) {
      console.error('Database error fetching blog posts:', error);
      // If database connection failed, return empty array instead of crashing
      if (error && typeof error === 'object' && 'code' in error && error.code === '57P01') {
        console.warn('Database connection terminated, returning empty blog posts array');
        return [];
      }
      throw new Error('Failed to fetch blog posts');
    }
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    try {
      const [post] = await db
        .insert(blogPosts)
        .values(insertBlogPost)
        .returning();
      
      // Update search index (non-critical, don't fail if this fails)
      try {
        await this.updateSearchIndex('blog', post.id, post.title, post.content);
      } catch (searchError) {
        console.warn('Failed to update search index for blog post:', searchError);
      }
      
      return post;
    } catch (error) {
      console.error('Database error creating blog post:', error);
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') { // PostgreSQL unique violation
        throw new Error('Blog post with this slug already exists');
      }
      throw new Error('Failed to create blog post');
    }
  }

  async updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [post] = await db
      .update(blogPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    
    if (post) {
      // Update search index
      await this.updateSearchIndex('blog', post.id, post.title, post.content);
    }
    
    return post;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    try {
      const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
      
      // Remove from search index (non-critical)
      try {
        await db.delete(searchIndex).where(
          and(
            eq(searchIndex.contentType, 'blog'),
            eq(searchIndex.contentId, id)
          )
        );
      } catch (searchError) {
        console.warn('Failed to remove blog post from search index:', searchError);
      }
      
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error(`Database error deleting blog post ${id}:`, error);
      throw new Error('Failed to delete blog post');
    }
  }

  // Page content operations
  async getPageContent(pageKey: string): Promise<PageContent | undefined> {
    const [content] = await db
      .select()
      .from(pageContents)
      .where(and(eq(pageContents.pageKey, pageKey), eq(pageContents.isActive, true)));
    return content;
  }

  async getAllPageContents(): Promise<PageContent[]> {
    return await db
      .select()
      .from(pageContents)
      .where(eq(pageContents.isActive, true))
      .orderBy(desc(pageContents.updatedAt));
  }

  async createPageContent(insertPageContent: InsertPageContent): Promise<PageContent> {
    const [content] = await db
      .insert(pageContents)
      .values(insertPageContent)
      .returning();
    
    // Update search index
    await this.updateSearchIndex('page', content.id, content.title, JSON.stringify(content.content));
    
    return content;
  }

  async updatePageContent(pageKey: string, updates: Partial<InsertPageContent>): Promise<PageContent | undefined> {
    const [content] = await db
      .update(pageContents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pageContents.pageKey, pageKey))
      .returning();
    
    if (content) {
      // Update search index
      await this.updateSearchIndex('page', content.id, content.title, JSON.stringify(content.content));
    }
    
    return content;
  }

  // User management operations
  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    try {
      await db
        .update(users)
        .set({ 
          password: hashedPassword, 
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error updating user password:", error);
      throw error;
    }
  }

  // Newsletter operations
  async createNewsletterLead(insertLead: InsertNewsletterLead): Promise<NewsletterLead> {
    try {
      const [lead] = await db
        .insert(newsletterLeads)
        .values(insertLead)
        .onConflictDoUpdate({
          target: newsletterLeads.email,
          set: {
            subscriptionDate: new Date(),
            isActive: true,
          },
        })
        .returning();
      return lead;
    } catch (error) {
      console.error("Error creating newsletter lead:", error);
      throw error;
    }
  }

  async getNewsletterLeads(): Promise<NewsletterLead[]> {
    try {
      return await db
        .select()
        .from(newsletterLeads)
        .orderBy(desc(newsletterLeads.createdAt));
    } catch (error) {
      console.error("Error fetching newsletter leads:", error);
      throw error;
    }
  }

  async getNewsletterLead(email: string): Promise<NewsletterLead | undefined> {
    try {
      const [lead] = await db
        .select()
        .from(newsletterLeads)
        .where(eq(newsletterLeads.email, email));
      return lead;
    } catch (error) {
      console.error("Error fetching newsletter lead:", error);
      throw error;
    }
  }

  // Search operations
  async searchContent(query: SearchQuery): Promise<SearchIndex[]> {
    try {
      const searchTerm = `%${query.query}%`;
      
      let whereCondition = or(
        like(searchIndex.title, searchTerm),
        like(searchIndex.content, searchTerm)
      );
      
      if (query.type !== 'all') {
        whereCondition = and(
          eq(searchIndex.contentType, query.type),
          whereCondition
        );
      }
      
      return await db
        .select()
        .from(searchIndex)
        .where(whereCondition)
        .orderBy(desc(searchIndex.updatedAt))
        .limit(query.limit || 10);
    } catch (error) {
      console.error('Database error searching content:', error);
      throw new Error('Failed to search content');
    }
  }

  async updateSearchIndex(contentType: string, contentId: number, title: string, content: string): Promise<void> {
    try {
      // Remove existing entry
      await db.delete(searchIndex).where(
        and(
          eq(searchIndex.contentType, contentType),
          eq(searchIndex.contentId, contentId)
        )
      );
    
      // Create new entry
      await db.insert(searchIndex).values({
        contentType,
        contentId,
        title,
        content: content.substring(0, 5000), // Limit content length
        searchVector: `${title} ${content}`.toLowerCase(),
      });
    } catch (error) {
      console.error('Database error updating search index:', error);
      throw new Error('Failed to update search index');
    }
  }

  // Payment operations
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    try {
      const [order] = await db
        .insert(orders)
        .values(insertOrder)
        .returning();
      return order;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<Order | undefined> {
    try {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderId, orderId));
      return order;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    try {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, id));
      return order;
    } catch (error) {
      console.error("Error fetching order by ID:", error);
      throw error;
    }
  }

  async updateOrder(orderId: string, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    try {
      const [order] = await db
        .update(orders)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(orders.orderId, orderId))
        .returning();
      return order;
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      return await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error("Error fetching all orders:", error);
      throw error;
    }
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    try {
      const [payment] = await db
        .insert(payments)
        .values(insertPayment)
        .returning();
      return payment;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  }

  async getPaymentsByOrderId(orderId: number): Promise<Payment[]> {
    try {
      return await db
        .select()
        .from(payments)
        .where(eq(payments.orderId, orderId))
        .orderBy(desc(payments.createdAt));
    } catch (error) {
      console.error("Error fetching payments for order:", error);
      throw error;
    }
  }

  async getPaymentByRazorpayId(razorpayPaymentId: string): Promise<Payment | undefined> {
    try {
      const [payment] = await db
        .select()
        .from(payments)
        .where(eq(payments.razorpayPaymentId, razorpayPaymentId));
      return payment;
    } catch (error) {
      console.error("Error fetching payment by Razorpay ID:", error);
      throw error;
    }
  }

  // Archive management for 24/7 news availability
  async getRecentArchiveArticles(limit: number = 20): Promise<any[]> {
    try {
      const archiveArticles = await db
        .select({
          id: newsArchive.articleId,
          title: newsArchive.title,
          description: newsArchive.description,
          content: newsArchive.content,
          summary: newsArchive.summary,
          url: newsArchive.url,
          urlToImage: newsArchive.urlToImage,
          publishedAt: newsArchive.publishedAt,
          source: {
            name: newsArchive.sourceName,
            id: newsArchive.sourceId
          },
          author: newsArchive.apiProvider
        })
        .from(newsArchive)
        .where(
          and(
            eq(newsArchive.isActive, true),
            eq(newsArchive.category, 'technology'),
            eq(newsArchive.isVerified, true) // Only verified technology content
          )
        )
        .orderBy(desc(newsArchive.archivedAt))
        .limit(limit);

      return archiveArticles.map(article => ({
        ...article,
        summary: article.summary ? article.summary.split('\n').filter(s => s.trim()) : []
      }));
    } catch (error) {
      console.error("Error fetching archive articles:", error);
      throw error;
    }
  }

  // Monthly cleanup system to optimize database space
  async performMonthlyCleanup(): Promise<{ deletedCount: number, retainedCount: number }> {
    try {
      console.log("🧹 Starting monthly news archive cleanup...");
      
      // Calculate cutoff date (30 days ago)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      
      // Count articles to be deleted
      const [countResult] = await db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(newsArchive)
        .where(lt(newsArchive.archivedAt, cutoffDate));
      
      const deleteCount = countResult.count;
      
      // Delete old archive articles (older than 30 days)
      await db
        .delete(newsArchive)
        .where(lt(newsArchive.archivedAt, cutoffDate));
      
      // Count remaining articles
      const [retainedResult] = await db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(newsArchive);
      
      const retainedCount = retainedResult.count;
      
      console.log(`🧹 Monthly cleanup complete: Deleted ${deleteCount} old articles, retained ${retainedCount}`);
      
      return { deletedCount: deleteCount, retainedCount };
    } catch (error) {
      console.error("Error during monthly cleanup:", error);
      throw error;
    }
  }

  // Check if monthly cleanup is needed and perform it
  async checkAndPerformCleanup(): Promise<void> {
    try {
      const lastCleanupKey = 'last_news_cleanup';
      
      // Get last cleanup date from a simple key-value system (using newsCache table for simplicity)
      const lastCleanup = await db
        .select()
        .from(newsCache)
        .where(eq(newsCache.cacheKey, lastCleanupKey))
        .limit(1);
      
      const now = new Date();
      let shouldCleanup = false;
      
      if (lastCleanup.length === 0) {
        // No previous cleanup recorded
        shouldCleanup = true;
      } else {
        const lastCleanupDate = lastCleanup[0].expiresAt;
        const daysSinceLastCleanup = (now.getTime() - lastCleanupDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // Cleanup if it's been more than 30 days
        shouldCleanup = daysSinceLastCleanup >= 30;
      }
      
      if (shouldCleanup) {
        const result = await this.performMonthlyCleanup();
        
        // Update last cleanup record
        const nextCleanup = new Date();
        nextCleanup.setDate(nextCleanup.getDate() + 30); // Next cleanup in 30 days
        
        await db
          .insert(newsCache)
          .values({
            cacheKey: lastCleanupKey,
            articles: [],
            expiresAt: nextCleanup,
            sourceInfo: { lastCleanup: now, deletedCount: result.deletedCount },
            articleCount: 0
          })
          .onConflictDoUpdate({
            target: newsCache.cacheKey,
            set: {
              expiresAt: nextCleanup,
              sourceInfo: { lastCleanup: now, deletedCount: result.deletedCount },
              fetchedAt: now
            }
          });
        
        console.log(`🎯 Next automatic cleanup scheduled for: ${nextCleanup.toLocaleDateString()}`);
      }
    } catch (error) {
      console.error("Error checking cleanup schedule:", error);
    }
  }

  // User Onboarding operations
  async getUserOnboarding(userId: number): Promise<UserOnboarding | undefined> {
    const [onboarding] = await db.select().from(userOnboarding).where(eq(userOnboarding.userId, userId));
    return onboarding;
  }

  async createUserOnboarding(userId: number): Promise<UserOnboarding> {
    const [onboarding] = await db
      .insert(userOnboarding)
      .values({ userId })
      .returning();
    return onboarding;
  }

  async updateUserOnboarding(userId: number, updates: Partial<InsertUserOnboarding>): Promise<UserOnboarding | undefined> {
    const [updated] = await db
      .update(userOnboarding)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userOnboarding.userId, userId))
      .returning();
    return updated;
  }

  // Notifications operations
  async getUserNotifications(userId: number, options?: { unreadOnly?: boolean; limit?: number }): Promise<Notification[]> {
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

    if (options?.unreadOnly) {
      query = db
        .select()
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ))
        .orderBy(desc(notifications.createdAt));
    }

    if (options?.limit) {
      return await query.limit(options.limit);
    }

    return await query;
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    return result[0]?.count || 0;
  }

  // Testimonials operations
  async getTestimonials(options?: { approvedOnly?: boolean; featuredOnly?: boolean }): Promise<Testimonial[]> {
    if (options?.featuredOnly) {
      return await db
        .select()
        .from(testimonials)
        .where(and(
          eq(testimonials.isApproved, true),
          eq(testimonials.isFeatured, true)
        ))
        .orderBy(testimonials.displayOrder, desc(testimonials.createdAt));
    }

    if (options?.approvedOnly) {
      return await db
        .select()
        .from(testimonials)
        .where(eq(testimonials.isApproved, true))
        .orderBy(testimonials.displayOrder, desc(testimonials.createdAt));
    }

    return await db
      .select()
      .from(testimonials)
      .orderBy(testimonials.displayOrder, desc(testimonials.createdAt));
  }

  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    const [testimonial] = await db.select().from(testimonials).where(eq(testimonials.id, id));
    return testimonial;
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db
      .insert(testimonials)
      .values(insertTestimonial)
      .returning();
    return testimonial;
  }

  async updateTestimonial(id: number, updates: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const [testimonial] = await db
      .update(testimonials)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(testimonials.id, id))
      .returning();
    return testimonial;
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    const result = await db.delete(testimonials).where(eq(testimonials.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // User Preferences operations
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    const [preferences] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return preferences;
  }

  async createUserPreferences(userId: number, preferences?: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const [userPref] = await db
      .insert(userPreferences)
      .values({ userId, ...preferences })
      .returning();
    return userPref;
  }

  async updateUserPreferences(userId: number, updates: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .update(userPreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId))
      .returning();
    return preferences;
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    console.log("Storage: Starting database initialization...");
    
    // Create default admin user if none exists
    const existingAdmin = await db.select().from(users).where(eq(users.isAdmin, true)).limit(1);
    
    if (existingAdmin.length === 0) {
      await this.createUser({
        username: 'admin',
        email: 'admin@ruvab.it.com',
        password: 'admin123', // This will be hashed
        firstName: 'Admin',
        lastName: 'User',
        isAdmin: true,
      });
      console.log("Storage: Created default admin user");
    }
    
    // Create default blog posts if none exist
    const existingPosts = await db.select().from(blogPosts).limit(1);
    
    if (existingPosts.length === 0) {
      const adminUser = await db.select().from(users).where(eq(users.isAdmin, true)).limit(1);
      const adminId = adminUser[0]?.id || 1;
      
      await this.createDefaultBlogPosts(adminId);
      console.log("Storage: Created default blog posts");
    }

    // Create default referral partners if none exist
    const existingPartners = await db.select().from(referralPartners).limit(1);
    
    if (existingPartners.length === 0) {
      const adminUser = await db.select().from(users).where(eq(users.isAdmin, true)).limit(1);
      const adminId = adminUser[0]?.id || 1;
      
      await this.createDefaultReferralPartners(adminId);
      console.log("Storage: Created default referral partners");
    }
    
    console.log("Storage: Database initialization complete");
  }

  private async createDefaultBlogPosts(adminId: number) {
    const samplePosts = [
      {
        title: "The Future of AI in Business Automation",
        slug: "future-ai-business-automation",
        excerpt: "Explore how artificial intelligence is revolutionizing business processes and creating new opportunities for growth and efficiency across industries.",
        featuredImage: "/images/blog-featured-ai-automation.png",
        content: `# The Future of AI in Business Automation\n\nArtificial Intelligence is transforming the business landscape at an unprecedented pace. From streamlining operations to enhancing customer experiences, AI-powered automation is becoming the backbone of modern enterprises.`,
        category: "AI & Technology",
        tags: ["AI", "Automation", "Business"],
        authorId: adminId,
        isPublished: true,
      },
      {
        title: "Data Analytics: Turning Information into Insights",
        slug: "data-analytics-insights",
        excerpt: "Learn how modern data analytics tools and techniques can help your business make data-driven decisions and unlock hidden opportunities.",
        featuredImage: "/images/blog-featured-data-analytics.png",
        content: `# Data Analytics: Turning Information into Insights\n\nIn today's data-driven world, the ability to extract meaningful insights from vast amounts of information is crucial for business success.`,
        category: "Data Analytics",
        tags: ["Data", "Analytics", "Business Intelligence"],
        authorId: adminId,
        isPublished: true,
      }
    ];

    for (const post of samplePosts) {
      await this.createBlogPost(post);
    }
  }

  private async createDefaultReferralPartners(adminId: number) {
    const samplePartners = [
      {
        name: "Replit",
        description: "The collaborative browser-based IDE for modern development teams. Build, test, and deploy applications directly in your browser with real-time collaboration features.",
        logoUrl: "https://replit.com/public/images/replit-logo.png",
        websiteUrl: "https://replit.com",
        referralUrl: "https://replit.com?ref=ruvab-it",
        category: "development",
        isActive: true,
        sortOrder: 1,
        commissionRate: "20% recurring",
        createdBy: adminId,
      },
      {
        name: "Bolt.new",
        description: "AI-powered full-stack web development platform that lets you build, edit, and deploy complete applications instantly. Generate functional web apps with AI assistance and real-time collaboration.",
        logoUrl: "https://bolt.new/favicon.ico",
        websiteUrl: "https://bolt.new",
        referralUrl: "https://bolt.new/?rid=3v6oaw",
        category: "development",
        isActive: true,
        sortOrder: 2,
        commissionRate: "Referral credits",
        createdBy: adminId,
      },
      {
        name: "Namecheap",
        description: "Affordable domain names, web hosting, SSL certificates, and website builder tools. Reliable hosting solutions for businesses of all sizes.",
        logoUrl: "https://www.namecheap.com/assets/img/nc-icon.png",
        websiteUrl: "https://www.namecheap.com",
        referralUrl: "https://www.namecheap.com?aff=ruvab",
        category: "hosting",
        isActive: true,
        sortOrder: 3,
        commissionRate: "$50 per sale",
        createdBy: adminId,
      },
      {
        name: "Razorpay",
        description: "Complete payment solution for businesses in India. Accept payments, automate payouts, and manage finances with powerful APIs and dashboard.",
        logoUrl: "https://razorpay.com/assets/razorpay-logo.svg",
        websiteUrl: "https://razorpay.com",
        referralUrl: "https://rzp.io/rzp/JADb7Mz",
        category: "payment",
        isActive: true,
        sortOrder: 3,
        commissionRate: "Revenue share",
        createdBy: adminId,
      },
      {
        name: "SendGrid",
        description: "Email delivery platform trusted by developers and marketers. Send transactional and marketing emails with reliable delivery and analytics.",
        logoUrl: "https://sendgrid.com/brand/sg-twilio-lockup.svg",
        websiteUrl: "https://sendgrid.com",
        referralUrl: "https://sendgrid.com?ref=ruvab",
        category: "email",
        isActive: true,
        sortOrder: 4,
        commissionRate: "15% commission",
        createdBy: adminId,
      },
      {
        name: "Zoho",
        description: "Comprehensive suite of business applications including CRM, email, project management, and productivity tools for growing businesses.",
        logoUrl: "https://www.zoho.com/logo/zoho-logo.svg",
        websiteUrl: "https://www.zoho.com",
        referralUrl: "https://www.zoho.com?ref=ruvab-it",
        category: "other",
        isActive: true,
        sortOrder: 5,
        commissionRate: "25% recurring",
        createdBy: adminId,
      },
      {
        name: "NewsNow API",
        description: "Real-time news aggregation API providing access to thousands of news sources worldwide. Perfect for building news applications and staying informed.",
        logoUrl: "https://www.newsnow.com/favicon.ico",
        websiteUrl: "https://rapidapi.com/newsnow/api/newsnow",
        referralUrl: "https://rapidapi.com/newsnow/api/newsnow?ref=ruvab",
        category: "news",
        isActive: true,
        sortOrder: 6,
        commissionRate: "10% per subscription",
        createdBy: adminId,
      }
    ];

    for (const partner of samplePartners) {
      await this.createReferralPartner(partner);
    }
  }

  // Referral partner operations
  async getReferralPartners(): Promise<ReferralPartner[]> {
    return await db.select().from(referralPartners).orderBy(referralPartners.sortOrder, referralPartners.name);
  }

  async getReferralPartner(id: number): Promise<ReferralPartner | undefined> {
    const [partner] = await db.select().from(referralPartners).where(eq(referralPartners.id, id));
    return partner;
  }

  async createReferralPartner(insertPartner: InsertReferralPartner): Promise<ReferralPartner> {
    const [partner] = await db
      .insert(referralPartners)
      .values({
        ...insertPartner,
        updatedAt: new Date(),
      })
      .returning();
    return partner;
  }

  async updateReferralPartner(id: number, updates: Partial<InsertReferralPartner>): Promise<ReferralPartner | undefined> {
    const [partner] = await db
      .update(referralPartners)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(referralPartners.id, id))
      .returning();
    return partner;
  }

  async deleteReferralPartner(id: number): Promise<boolean> {
    const result = await db.delete(referralPartners).where(eq(referralPartners.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // News cache operations for 12-hour caching
  async getNewsCache(cacheKey: string): Promise<NewsCache | undefined> {
    const [cache] = await db.select().from(newsCache).where(eq(newsCache.cacheKey, cacheKey));
    return cache;
  }

  async setNewsCache(cacheData: InsertNewsCache): Promise<NewsCache> {
    // First, delete any existing cache with the same key
    await db.delete(newsCache).where(eq(newsCache.cacheKey, cacheData.cacheKey));
    
    // Insert new cache entry
    const [cache] = await db
      .insert(newsCache)
      .values(cacheData)
      .returning();
    return cache;
  }

  async isNewsCacheValid(cacheKey: string): Promise<boolean> {
    const [cache] = await db.select().from(newsCache).where(eq(newsCache.cacheKey, cacheKey));
    
    if (!cache) {
      return false;
    }
    
    const now = new Date();
    return cache.expiresAt > now;
  }

  async clearExpiredNewsCache(): Promise<void> {
    const now = new Date();
    await db.delete(newsCache).where(lt(newsCache.expiresAt, now));
  }

  // News archive operations for admin backup/contingency
  async archiveNewsArticle(article: InsertNewsArchive): Promise<NewsArchive> {
    try {
      const [archived] = await db
        .insert(newsArchive)
        .values(article)
        .onConflictDoUpdate({
          target: newsArchive.contentHash,
          set: {
            updatedAt: new Date(),
            // Only update fields that might have changed
            qualityScore: article.qualityScore,
            adminNotes: article.adminNotes,
          },
        })
        .returning();
      return archived;
    } catch (error) {
      console.error("Error archiving news article:", error);
      throw error;
    }
  }

  async archiveNewsArticles(articles: InsertNewsArchive[]): Promise<NewsArchive[]> {
    try {
      const archived: NewsArchive[] = [];
      for (const article of articles) {
        const result = await this.archiveNewsArticle(article);
        archived.push(result);
      }
      return archived;
    } catch (error) {
      console.error("Error archiving news articles:", error);
      throw error;
    }
  }

  async getArchivedArticles(options?: { limit?: number; offset?: number; apiProvider?: string }): Promise<NewsArchive[]> {
    try {
      const baseQuery = db.select().from(newsArchive);
      
      if (options?.apiProvider) {
        const filteredQuery = baseQuery.where(eq(newsArchive.apiProvider, options.apiProvider))
          .orderBy(desc(newsArchive.archivedAt));
        
        if (options?.limit && options?.offset) {
          return await filteredQuery.limit(options.limit).offset(options.offset);
        } else if (options?.limit) {
          return await filteredQuery.limit(options.limit);
        } else if (options?.offset) {
          return await filteredQuery.offset(options.offset);
        } else {
          return await filteredQuery;
        }
      } else {
        const orderedQuery = baseQuery.orderBy(desc(newsArchive.archivedAt));
        
        if (options?.limit && options?.offset) {
          return await orderedQuery.limit(options.limit).offset(options.offset);
        } else if (options?.limit) {
          return await orderedQuery.limit(options.limit);
        } else if (options?.offset) {
          return await orderedQuery.offset(options.offset);
        } else {
          return await orderedQuery;
        }
      }
    } catch (error) {
      console.error("Error fetching archived articles:", error);
      throw error;
    }
  }

  async getArchivedArticleById(id: number): Promise<NewsArchive | undefined> {
    try {
      const [article] = await db.select().from(newsArchive).where(eq(newsArchive.id, id));
      return article;
    } catch (error) {
      console.error("Error fetching archived article by ID:", error);
      throw error;
    }
  }

  async getArchivedArticleByHash(contentHash: string): Promise<NewsArchive | undefined> {
    try {
      const [article] = await db.select().from(newsArchive).where(eq(newsArchive.contentHash, contentHash));
      return article;
    } catch (error) {
      console.error("Error fetching archived article by hash:", error);
      throw error;
    }
  }

  async updateArchivedArticle(id: number, updates: Partial<InsertNewsArchive>): Promise<NewsArchive | undefined> {
    try {
      const [article] = await db
        .update(newsArchive)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(newsArchive.id, id))
        .returning();
      return article;
    } catch (error) {
      console.error("Error updating archived article:", error);
      throw error;
    }
  }

  async deleteArchivedArticle(id: number): Promise<boolean> {
    try {
      const result = await db.delete(newsArchive).where(eq(newsArchive.id, id));
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error("Error deleting archived article:", error);
      throw error;
    }
  }

  async getArchiveStatistics(): Promise<{ totalArticles: number; byProvider: Record<string, number>; byCategory: Record<string, number> }> {
    try {
      const articles = await db.select().from(newsArchive);
      
      const totalArticles = articles.length;
      const byProvider: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      
      articles.forEach(article => {
        byProvider[article.apiProvider] = (byProvider[article.apiProvider] || 0) + 1;
        byCategory[article.category] = (byCategory[article.category] || 0) + 1;
      });
      
      return { totalArticles, byProvider, byCategory };
    } catch (error) {
      console.error("Error getting archive statistics:", error);
      throw error;
    }
  }

  // News source statistics operations
  async updateSourceStats(sourceName: string, apiProvider: string, success: boolean, responseTime?: number): Promise<void> {
    try {
      const existingStats = await this.getSourceStatsByName(sourceName, apiProvider);
      
      if (existingStats) {
        // Update existing stats
        const newStats = {
          totalArticles: success ? existingStats.totalArticles + 1 : existingStats.totalArticles,
          successfulFetches: success ? existingStats.successfulFetches + 1 : existingStats.successfulFetches,
          failedFetches: success ? existingStats.failedFetches : existingStats.failedFetches + 1,
          lastFetchAt: new Date(),
          lastSuccessAt: success ? new Date() : existingStats.lastSuccessAt,
          lastFailureAt: success ? existingStats.lastFailureAt : new Date(),
          averageResponseTime: responseTime ? Math.round(((existingStats.averageResponseTime || 0) + responseTime) / 2) : (existingStats.averageResponseTime || 0),
          uptimePercentage: Math.round((existingStats.successfulFetches / (existingStats.successfulFetches + existingStats.failedFetches)) * 100),
          updatedAt: new Date(),
        };
        
        await db
          .update(newsSourceStats)
          .set(newStats)
          .where(and(eq(newsSourceStats.sourceName, sourceName), eq(newsSourceStats.apiProvider, apiProvider)));
      } else {
        // Create new stats record
        await db
          .insert(newsSourceStats)
          .values({
            sourceName,
            apiProvider,
            totalArticles: success ? 1 : 0,
            successfulFetches: success ? 1 : 0,
            failedFetches: success ? 0 : 1,
            lastFetchAt: new Date(),
            lastSuccessAt: success ? new Date() : undefined,
            lastFailureAt: success ? undefined : new Date(),
            averageResponseTime: responseTime || 0,
            uptimePercentage: success ? 100 : 0,
            reliabilityScore: success ? 100 : 0,
          });
      }
    } catch (error) {
      console.error("Error updating source stats:", error);
      throw error;
    }
  }

  async getSourceStats(apiProvider?: string): Promise<NewsSourceStats[]> {
    try {
      if (apiProvider) {
        return await db.select().from(newsSourceStats).where(eq(newsSourceStats.apiProvider, apiProvider));
      } else {
        return await db.select().from(newsSourceStats);
      }
    } catch (error) {
      console.error("Error fetching source stats:", error);
      throw error;
    }
  }

  async getSourceStatsByName(sourceName: string, apiProvider: string): Promise<NewsSourceStats | undefined> {
    try {
      const [stats] = await db
        .select()
        .from(newsSourceStats)
        .where(and(eq(newsSourceStats.sourceName, sourceName), eq(newsSourceStats.apiProvider, apiProvider)));
      return stats;
    } catch (error) {
      console.error("Error fetching source stats by name:", error);
      throw error;
    }
  }

  // Subscription Plans operations
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true)).orderBy(subscriptionPlans.sortOrder);
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [plan] = await db
      .insert(subscriptionPlans)
      .values({
        ...insertPlan,
        updatedAt: new Date(),
      })
      .returning();
    return plan;
  }

  // User Subscriptions operations
  async getUserSubscriptions(userId: number): Promise<UserSubscription[]> {
    return await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .orderBy(desc(userSubscriptions.createdAt));
  }

  async getUserActiveSubscription(userId: number): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(and(eq(userSubscriptions.userId, userId), eq(userSubscriptions.status, 'active')))
      .orderBy(desc(userSubscriptions.createdAt))
      .limit(1);
    return subscription;
  }

  async getUserSubscription(id: number): Promise<UserSubscription | undefined> {
    const [subscription] = await db.select().from(userSubscriptions).where(eq(userSubscriptions.id, id));
    return subscription;
  }

  async createUserSubscription(insertSubscription: InsertUserSubscription): Promise<UserSubscription> {
    const [subscription] = await db
      .insert(userSubscriptions)
      .values({
        ...insertSubscription,
        updatedAt: new Date(),
      })
      .returning();
    return subscription;
  }

  async updateUserSubscription(id: number, updates: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .update(userSubscriptions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.id, id))
      .returning();
    return subscription;
  }

  // Subscription Payments operations
  async getSubscriptionPayments(subscriptionId: number): Promise<SubscriptionPayment[]> {
    return await db
      .select()
      .from(subscriptionPayments)
      .where(eq(subscriptionPayments.subscriptionId, subscriptionId))
      .orderBy(desc(subscriptionPayments.createdAt));
  }

  async getUserPaymentHistory(userId: number): Promise<SubscriptionPayment[]> {
    return await db
      .select()
      .from(subscriptionPayments)
      .innerJoin(userSubscriptions, eq(subscriptionPayments.subscriptionId, userSubscriptions.id))
      .where(eq(userSubscriptions.userId, userId))
      .orderBy(desc(subscriptionPayments.createdAt))
      .then(results => results.map(result => result.subscription_payments));
  }

  async createSubscriptionPayment(insertPayment: InsertSubscriptionPayment): Promise<SubscriptionPayment> {
    const [payment] = await db
      .insert(subscriptionPayments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async updateSubscriptionPayment(id: number, updates: Partial<InsertSubscriptionPayment>): Promise<SubscriptionPayment | undefined> {
    const [payment] = await db
      .update(subscriptionPayments)
      .set(updates)
      .where(eq(subscriptionPayments.id, id))
      .returning();
    return payment;
  }

  // Free Tools operations
  async getFreeTools(): Promise<FreeTool[]> {
    return await db
      .select()
      .from(freeTools)
      .where(eq(freeTools.isActive, true))
      .orderBy(desc(freeTools.submittedAt));
  }

  async getFreeTool(id: number): Promise<FreeTool | undefined> {
    const [tool] = await db.select().from(freeTools).where(eq(freeTools.id, id));
    return tool;
  }

  async createFreeTool(insertTool: InsertFreeTool): Promise<FreeTool> {
    const [tool] = await db
      .insert(freeTools)
      .values(insertTool)
      .returning();
    return tool;
  }

  async updateFreeTool(id: number, updates: Partial<InsertFreeTool>): Promise<FreeTool | undefined> {
    const [tool] = await db
      .update(freeTools)
      .set(updates)
      .where(eq(freeTools.id, id))
      .returning();
    return tool;
  }

  async deleteFreeTool(id: number): Promise<boolean> {
    const result = await db.delete(freeTools).where(eq(freeTools.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Blog Schedule operations
  async getBlogSchedule(): Promise<BlogSchedule | undefined> {
    const [schedule] = await db
      .select()
      .from(blogSchedule)
      .limit(1);
    return schedule;
  }

  async updateBlogSchedule(updates: Partial<InsertBlogSchedule>): Promise<BlogSchedule> {
    const existing = await this.getBlogSchedule();
    
    if (existing) {
      const [updated] = await db
        .update(blogSchedule)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(blogSchedule.id, existing.id))
        .returning();
      return updated;
    } else {
      return await this.createBlogSchedule(updates as InsertBlogSchedule);
    }
  }

  async createBlogSchedule(schedule: InsertBlogSchedule): Promise<BlogSchedule> {
    const [newSchedule] = await db
      .insert(blogSchedule)
      .values(schedule)
      .returning();
    return newSchedule;
  }

  // News Schedule operations
  async getNewsSchedule(): Promise<NewsSchedule | undefined> {
    const [schedule] = await db
      .select()
      .from(newsSchedule)
      .limit(1);
    return schedule;
  }

  async updateNewsSchedule(updates: Partial<InsertNewsSchedule>): Promise<NewsSchedule> {
    const existing = await this.getNewsSchedule();
    
    if (existing) {
      const [updated] = await db
        .update(newsSchedule)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(newsSchedule.id, existing.id))
        .returning();
      return updated;
    } else {
      return await this.createNewsSchedule(updates as InsertNewsSchedule);
    }
  }

  async createNewsSchedule(schedule: InsertNewsSchedule): Promise<NewsSchedule> {
    const [newSchedule] = await db
      .insert(newsSchedule)
      .values(schedule)
      .returning();
    return newSchedule;
  }

  // AI News Summaries operations
  async getAiNewsSummaries(options?: { limit?: number; offset?: number }): Promise<AiNewsSummary[]> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    
    const summaries = await db
      .select()
      .from(aiNewsSummaries)
      .where(eq(aiNewsSummaries.isPublished, true))
      .orderBy(desc(aiNewsSummaries.publishedAt))
      .limit(limit)
      .offset(offset);
    
    return summaries;
  }

  async getAiNewsSummary(id: number): Promise<AiNewsSummary | undefined> {
    const [summary] = await db
      .select()
      .from(aiNewsSummaries)
      .where(eq(aiNewsSummaries.id, id));
    return summary;
  }

  async getRecentAiNewsSummaries(limit = 10): Promise<AiNewsSummary[]> {
    const summaries = await db
      .select()
      .from(aiNewsSummaries)
      .where(eq(aiNewsSummaries.isPublished, true))
      .orderBy(desc(aiNewsSummaries.publishedAt))
      .limit(limit);
    
    return summaries;
  }

  // Chat Conversation operations
  async getChatConversation(sessionId: string): Promise<ChatConversation | undefined> {
    const [conversation] = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.sessionId, sessionId))
      .limit(1);
    return conversation;
  }

  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const [created] = await db
      .insert(chatConversations)
      .values(conversation)
      .returning();
    return created;
  }

  async updateChatConversation(sessionId: string, updates: Partial<InsertChatConversation>): Promise<ChatConversation | undefined> {
    const [updated] = await db
      .update(chatConversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatConversations.sessionId, sessionId))
      .returning();
    return updated;
  }

  async getChatConversationsByUser(userId: number): Promise<ChatConversation[]> {
    const conversations = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.userId, userId))
      .orderBy(desc(chatConversations.lastMessageAt));
    return conversations;
  }

  // Chat Message operations
  async getChatMessages(conversationId: number): Promise<ChatMessage[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(chatMessages.createdAt);
    return messages;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return created;
  }

  async updateChatMessage(id: number, updates: Partial<InsertChatMessage>): Promise<ChatMessage | undefined> {
    const [updated] = await db
      .update(chatMessages)
      .set(updates)
      .where(eq(chatMessages.id, id))
      .returning();
    return updated;
  }

  async findSimilarQuestion(question: string): Promise<ChatMessage | undefined> {
    const lowerQuestion = question.toLowerCase().trim();
    
    const messages = await db
      .select()
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.sender, 'user'),
          sql`LOWER(TRIM(${chatMessages.message})) LIKE ${`%${lowerQuestion}%`}`
        )
      )
      .orderBy(desc(chatMessages.usageCount))
      .limit(1);
    
    return messages[0];
  }

  async incrementMessageUsage(id: number): Promise<void> {
    await db
      .update(chatMessages)
      .set({ usageCount: sql`${chatMessages.usageCount} + 1` })
      .where(eq(chatMessages.id, id));
  }

  // Chat FAQ operations
  async getChatFAQs(options: { category?: string; limit?: number } = {}): Promise<ChatFAQ[]> {
    let query = db.select().from(chatFAQs);
    
    if (options.category) {
      query = query.where(eq(chatFAQs.category, options.category)) as any;
    }
    
    query = query.orderBy(desc(chatFAQs.askCount)) as any;
    
    if (options.limit) {
      query = query.limit(options.limit) as any;
    }
    
    return await query;
  }

  async getChatFAQ(id: number): Promise<ChatFAQ | undefined> {
    const [faq] = await db
      .select()
      .from(chatFAQs)
      .where(eq(chatFAQs.id, id))
      .limit(1);
    return faq;
  }

  async createChatFAQ(faq: InsertChatFAQ): Promise<ChatFAQ> {
    const [created] = await db
      .insert(chatFAQs)
      .values(faq)
      .returning();
    return created;
  }

  async updateChatFAQ(id: number, updates: Partial<InsertChatFAQ>): Promise<ChatFAQ | undefined> {
    const [updated] = await db
      .update(chatFAQs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatFAQs.id, id))
      .returning();
    return updated;
  }

  async deleteChatFAQ(id: number): Promise<boolean> {
    const result = await db
      .delete(chatFAQs)
      .where(eq(chatFAQs.id, id))
      .returning();
    return result.length > 0;
  }

  async incrementFAQAskCount(id: number, uniqueUser = false): Promise<void> {
    const updates: any = {
      askCount: sql`${chatFAQs.askCount} + 1`,
    };
    
    if (uniqueUser) {
      updates.uniqueUserCount = sql`${chatFAQs.uniqueUserCount} + 1`;
    }
    
    await db
      .update(chatFAQs)
      .set(updates)
      .where(eq(chatFAQs.id, id));
  }

  async getPublishedFAQs(): Promise<ChatFAQ[]> {
    const faqs = await db
      .select()
      .from(chatFAQs)
      .where(eq(chatFAQs.isPublished, true))
      .orderBy(chatFAQs.displayOrder, desc(chatFAQs.askCount));
    return faqs;
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();