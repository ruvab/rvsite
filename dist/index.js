var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  blogPosts: () => blogPosts,
  blogPostsRelations: () => blogPostsRelations,
  insertBlogPostSchema: () => insertBlogPostSchema,
  insertNewsletterLeadSchema: () => insertNewsletterLeadSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPageContentSchema: () => insertPageContentSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertUserSchema: () => insertUserSchema,
  newsletterLeads: () => newsletterLeads,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  pageContents: () => pageContents,
  pageContentsRelations: () => pageContentsRelations,
  payments: () => payments,
  paymentsRelations: () => paymentsRelations,
  searchIndex: () => searchIndex,
  searchSchema: () => searchSchema,
  sessions: () => sessions,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, boolean, timestamp, varchar, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var blogPosts = pgTable("blog_posts", {
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
  authorId: integer("author_id").notNull().references(() => users.id)
});
var pageContents = pgTable("page_contents", {
  id: serial("id").primaryKey(),
  pageKey: varchar("page_key", { length: 255 }).notNull().unique(),
  title: text("title").notNull(),
  content: jsonb("content").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by").notNull().references(() => users.id)
});
var searchIndex = pgTable("search_index", {
  id: serial("id").primaryKey(),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  // 'blog', 'page', 'service'
  contentId: integer("content_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  searchVector: text("search_vector"),
  // For full-text search
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [
  index("search_content_idx").on(table.contentType, table.contentId)
]);
var usersRelations = relations(users, ({ many }) => ({
  blogPosts: many(blogPosts),
  pageContents: many(pageContents)
}));
var blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id]
  })
}));
var pageContentsRelations = relations(pageContents, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [pageContents.updatedBy],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  publishedAt: true,
  updatedAt: true
});
var insertPageContentSchema = createInsertSchema(pageContents).omit({
  id: true,
  updatedAt: true
});
var searchSchema = z.object({
  query: z.string().min(1).max(200),
  type: z.enum(["all", "blog", "page", "service"]).optional().default("all"),
  limit: z.number().min(1).max(50).optional().default(10),
  offset: z.number().min(0).optional().default(0)
});
var newsletterLeads = pgTable("newsletter_leads", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  subscriptionDate: timestamp("subscription_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  source: varchar("source", { length: 100 }).default("website"),
  // website, referral, etc.
  userAgent: varchar("user_agent", { length: 500 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id", { length: 255 }).notNull().unique(),
  amount: integer("amount").notNull(),
  // Amount in paise
  currency: varchar("currency", { length: 3 }).default("INR"),
  status: varchar("status", { length: 50 }).default("created"),
  // created, paid, failed, cancelled
  customerName: varchar("customer_name", { length: 255 }),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 20 }),
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  description: text("description"),
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
  razorpaySignature: varchar("razorpay_signature", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }).notNull(),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("INR"),
  status: varchar("status", { length: 50 }).notNull(),
  // success, failed, pending
  method: varchar("method", { length: 50 }),
  // card, netbanking, wallet, upi
  bank: varchar("bank", { length: 100 }),
  walletType: varchar("wallet_type", { length: 100 }),
  vpa: varchar("vpa", { length: 255 }),
  fee: integer("fee"),
  // Razorpay fee in paise
  tax: integer("tax"),
  // Tax on fee in paise
  errorCode: varchar("error_code", { length: 50 }),
  errorDescription: text("error_description"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var ordersRelations = relations(orders, ({ many }) => ({
  payments: many(payments)
}));
var paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id]
  })
}));
var insertNewsletterLeadSchema = createInsertSchema(newsletterLeads).omit({
  id: true,
  subscriptionDate: true,
  createdAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true
});

// server/db.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, like, or, desc, and } from "drizzle-orm";
import bcrypt from "bcrypt";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(insertUser) {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword
    }).returning();
    return user;
  }
  async updateUser(id, updates) {
    const [user] = await db.update(users).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user;
  }
  // Blog operations
  async getBlogPosts() {
    return await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true)).orderBy(desc(blogPosts.publishedAt));
  }
  async getBlogPost(id) {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }
  async getBlogPostBySlug(slug) {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }
  async createBlogPost(insertBlogPost) {
    const [post] = await db.insert(blogPosts).values(insertBlogPost).returning();
    await this.updateSearchIndex("blog", post.id, post.title, post.content);
    return post;
  }
  async updateBlogPost(id, updates) {
    const [post] = await db.update(blogPosts).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(blogPosts.id, id)).returning();
    if (post) {
      await this.updateSearchIndex("blog", post.id, post.title, post.content);
    }
    return post;
  }
  async deleteBlogPost(id) {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    await db.delete(searchIndex).where(
      and(
        eq(searchIndex.contentType, "blog"),
        eq(searchIndex.contentId, id)
      )
    );
    return (result.rowCount ?? 0) > 0;
  }
  // Page content operations
  async getPageContent(pageKey) {
    const [content] = await db.select().from(pageContents).where(and(eq(pageContents.pageKey, pageKey), eq(pageContents.isActive, true)));
    return content;
  }
  async getAllPageContents() {
    return await db.select().from(pageContents).where(eq(pageContents.isActive, true)).orderBy(desc(pageContents.updatedAt));
  }
  async createPageContent(insertPageContent) {
    const [content] = await db.insert(pageContents).values(insertPageContent).returning();
    await this.updateSearchIndex("page", content.id, content.title, JSON.stringify(content.content));
    return content;
  }
  async updatePageContent(pageKey, updates) {
    const [content] = await db.update(pageContents).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(pageContents.pageKey, pageKey)).returning();
    if (content) {
      await this.updateSearchIndex("page", content.id, content.title, JSON.stringify(content.content));
    }
    return content;
  }
  // User management operations
  async updateUserPassword(userId, hashedPassword) {
    try {
      await db.update(users).set({
        password: hashedPassword,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(users.id, userId));
    } catch (error) {
      console.error("Error updating user password:", error);
      throw error;
    }
  }
  // Newsletter operations
  async createNewsletterLead(insertLead) {
    try {
      const [lead] = await db.insert(newsletterLeads).values(insertLead).onConflictDoUpdate({
        target: newsletterLeads.email,
        set: {
          subscriptionDate: /* @__PURE__ */ new Date(),
          isActive: true
        }
      }).returning();
      return lead;
    } catch (error) {
      console.error("Error creating newsletter lead:", error);
      throw error;
    }
  }
  async getNewsletterLeads() {
    try {
      return await db.select().from(newsletterLeads).orderBy(desc(newsletterLeads.createdAt));
    } catch (error) {
      console.error("Error fetching newsletter leads:", error);
      throw error;
    }
  }
  async getNewsletterLead(email) {
    try {
      const [lead] = await db.select().from(newsletterLeads).where(eq(newsletterLeads.email, email));
      return lead;
    } catch (error) {
      console.error("Error fetching newsletter lead:", error);
      throw error;
    }
  }
  // Search operations
  async searchContent(query) {
    const searchTerm = `%${query.query}%`;
    let whereCondition = or(
      like(searchIndex.title, searchTerm),
      like(searchIndex.content, searchTerm)
    );
    if (query.type !== "all") {
      whereCondition = and(
        eq(searchIndex.contentType, query.type),
        whereCondition
      );
    }
    return await db.select().from(searchIndex).where(whereCondition).orderBy(desc(searchIndex.updatedAt)).limit(query.limit || 10);
  }
  async updateSearchIndex(contentType, contentId, title, content) {
    await db.delete(searchIndex).where(
      and(
        eq(searchIndex.contentType, contentType),
        eq(searchIndex.contentId, contentId)
      )
    );
    await db.insert(searchIndex).values({
      contentType,
      contentId,
      title,
      content: content.substring(0, 5e3),
      // Limit content length
      searchVector: `${title} ${content}`.toLowerCase()
    });
  }
  // Payment operations
  async createOrder(insertOrder) {
    try {
      const [order] = await db.insert(orders).values(insertOrder).returning();
      return order;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }
  async getOrder(orderId) {
    try {
      const [order] = await db.select().from(orders).where(eq(orders.orderId, orderId));
      return order;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }
  async getOrderById(id) {
    try {
      const [order] = await db.select().from(orders).where(eq(orders.id, id));
      return order;
    } catch (error) {
      console.error("Error fetching order by ID:", error);
      throw error;
    }
  }
  async updateOrder(orderId, updates) {
    try {
      const [order] = await db.update(orders).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.orderId, orderId)).returning();
      return order;
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  }
  async getAllOrders() {
    try {
      return await db.select().from(orders).orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error("Error fetching all orders:", error);
      throw error;
    }
  }
  async createPayment(insertPayment) {
    try {
      const [payment] = await db.insert(payments).values(insertPayment).returning();
      return payment;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  }
  async getPaymentsByOrderId(orderId) {
    try {
      return await db.select().from(payments).where(eq(payments.orderId, orderId)).orderBy(desc(payments.createdAt));
    } catch (error) {
      console.error("Error fetching payments for order:", error);
      throw error;
    }
  }
  async getPaymentByRazorpayId(razorpayPaymentId) {
    try {
      const [payment] = await db.select().from(payments).where(eq(payments.razorpayPaymentId, razorpayPaymentId));
      return payment;
    } catch (error) {
      console.error("Error fetching payment by Razorpay ID:", error);
      throw error;
    }
  }
  // Initialize default data
  async initializeDefaultData() {
    console.log("Storage: Starting database initialization...");
    const existingAdmin = await db.select().from(users).where(eq(users.isAdmin, true)).limit(1);
    if (existingAdmin.length === 0) {
      await this.createUser({
        username: "admin",
        email: "admin@ruvab.it.com",
        password: "admin123",
        // This will be hashed
        firstName: "Admin",
        lastName: "User",
        isAdmin: true
      });
      console.log("Storage: Created default admin user");
    }
    const existingPosts = await db.select().from(blogPosts).limit(1);
    if (existingPosts.length === 0) {
      const adminUser = await db.select().from(users).where(eq(users.isAdmin, true)).limit(1);
      const adminId = adminUser[0]?.id || 1;
      await this.createDefaultBlogPosts(adminId);
      console.log("Storage: Created default blog posts");
    }
    console.log("Storage: Database initialization complete");
  }
  async createDefaultBlogPosts(adminId) {
    const samplePosts = [
      {
        title: "The Future of AI in Business Automation",
        slug: "future-ai-business-automation",
        excerpt: "Explore how artificial intelligence is revolutionizing business processes and creating new opportunities for growth and efficiency across industries.",
        featuredImage: "/images/blog-featured-ai-automation.png",
        content: `# The Future of AI in Business Automation

Artificial Intelligence is transforming the business landscape at an unprecedented pace. From streamlining operations to enhancing customer experiences, AI-powered automation is becoming the backbone of modern enterprises.`,
        category: "AI & Technology",
        tags: ["AI", "Automation", "Business"],
        authorId: adminId,
        isPublished: true
      },
      {
        title: "Data Analytics: Turning Information into Insights",
        slug: "data-analytics-insights",
        excerpt: "Learn how modern data analytics tools and techniques can help your business make data-driven decisions and unlock hidden opportunities.",
        featuredImage: "/images/blog-featured-data-analytics.png",
        content: `# Data Analytics: Turning Information into Insights

In today's data-driven world, the ability to extract meaningful insights from vast amounts of information is crucial for business success.`,
        category: "Data Analytics",
        tags: ["Data", "Analytics", "Business Intelligence"],
        authorId: adminId,
        isPublished: true
      }
    ];
    for (const post of samplePosts) {
      await this.createBlogPost(post);
    }
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import bcrypt2 from "bcrypt";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import sgMail from "@sendgrid/mail";
import Razorpay from "razorpay";
import crypto from "crypto";

// server/security.ts
var securityHeaders = (req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://www.google-analytics.com https://replit.com https://ep1.adtrafficquality.google",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: http:",
    "connect-src 'self' https://www.google-analytics.com https://api.razorpay.com https://ep1.adtrafficquality.google",
    "frame-src 'self' https://checkout.razorpay.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
    "object-src 'none'",
    "base-uri 'self'"
  ].join("; ");
  res.setHeader("Content-Security-Policy", csp);
  next();
};
var validateEnvironment = () => {
  const requiredVars = ["DATABASE_URL"];
  const optionalVars = [
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
    "SENDGRID_API_KEY"
  ];
  const missing = [];
  const warnings = [];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }
  if (missing.length > 0) {
    console.error("\u274C Missing required environment variables:");
    missing.forEach((v) => console.error(`   - ${v}`));
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  if (warnings.length > 0) {
    console.warn("\u26A0\uFE0F  Optional environment variables not configured:");
    warnings.forEach((v) => console.warn(`   - ${v}`));
  }
  console.log("\u2705 Environment validation completed");
};

// server/routes.ts
var PgSession = connectPgSimple(session);
var razorpay = null;
var initializeRazorpay = () => {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
      razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
      console.log("\u2705 Razorpay payment gateway initialized successfully");
      console.log(`\u{1F511} Using Key ID: ${process.env.RAZORPAY_KEY_ID.slice(0, 15)}...`);
      return true;
    } catch (error) {
      console.error("\u274C Error initializing Razorpay:", error);
      return false;
    }
  } else {
    console.log("\u26A0\uFE0F  Razorpay credentials not found - payment functionality will be disabled");
    console.log("\u{1F4CB} Missing variables:");
    if (!process.env.RAZORPAY_KEY_ID) console.log("   - RAZORPAY_KEY_ID");
    if (!process.env.RAZORPAY_KEY_SECRET) console.log("   - RAZORPAY_KEY_SECRET");
    return false;
  }
};
var razorpayInitialized = initializeRazorpay();
var requireAuth = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};
var requireAdmin = async (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  req.user = user;
  next();
};
async function registerRoutes(app2) {
  validateEnvironment();
  app2.use(securityHeaders);
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const chatSessions = /* @__PURE__ */ new Map();
  wss.on("connection", (ws2, req) => {
    console.log("New WebSocket connection established");
    const sessionId = "session_" + Math.random().toString(36).substr(2, 9);
    chatSessions.set(sessionId, { ws: ws2, sessionId });
    if (ws2.readyState === WebSocket.OPEN) {
      ws2.send(JSON.stringify({
        type: "connection",
        sessionId,
        message: "Connected to support chat"
      }));
    }
    ws2.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "message") {
          setTimeout(() => {
            if (ws2.readyState === WebSocket.OPEN) {
              const response = generateSmartResponse(message.text);
              ws2.send(JSON.stringify({
                type: "message",
                id: Math.random().toString(36).substr(2, 9),
                text: response,
                sender: "support",
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              }));
            }
          }, 1500 + Math.random() * 2e3);
          setTimeout(() => {
            if (ws2.readyState === WebSocket.OPEN) {
              ws2.send(JSON.stringify({
                type: "typing",
                isTyping: true
              }));
            }
          }, 500);
          setTimeout(() => {
            if (ws2.readyState === WebSocket.OPEN) {
              ws2.send(JSON.stringify({
                type: "typing",
                isTyping: false
              }));
            }
          }, 1400 + Math.random() * 2e3);
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws2.on("close", () => {
      console.log("WebSocket connection closed");
      chatSessions.delete(sessionId);
    });
    ws2.on("error", (error) => {
      console.error("WebSocket error:", error);
      chatSessions.delete(sessionId);
    });
  });
  function generateSmartResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes("ai") || lowerMessage.includes("artificial intelligence") || lowerMessage.includes("machine learning")) {
      return "Great question about AI! \u{1F680} We specialize in AI implementation and machine learning solutions. Our services include predictive analytics, natural language processing, computer vision, and custom AI model development. We've helped businesses increase efficiency by up to 40% through intelligent automation. Would you like to know more about any specific AI solution?";
    }
    if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("pricing") || lowerMessage.includes("budget")) {
      return "Thank you for your interest in our pricing! Our costs vary based on project scope, requirements, and customization needs. For accurate pricing and detailed quotes, I'd be happy to connect you with our sales and support team.\n\nPlease reach out to: support@ruvabit.com\n\nOur sales team will:\n\u2022 Understand your specific requirements\n\u2022 Provide detailed cost breakdown\n\u2022 Offer customized solutions within your budget\n\u2022 Schedule a free consultation\n\nWould you like me to help you with anything else about our services?";
    }
    if (lowerMessage.includes("software") || lowerMessage.includes("development") || lowerMessage.includes("app") || lowerMessage.includes("web")) {
      return "Excellent! \u{1F4BB} We're experts in software development with 5+ years of experience. We build:\n\n\u2022 Web Applications (React, Node.js, Python)\n\u2022 Mobile Apps (React Native, Flutter)\n\u2022 Enterprise Solutions\n\u2022 E-commerce Platforms\n\u2022 Custom APIs and Integrations\n\nWe follow agile methodology and provide ongoing support. What type of software solution are you looking for?";
    }
    if (lowerMessage.includes("qr") || lowerMessage.includes("qr code")) {
      return "Our QR Code Generator is awesome! \u{1F4F1} Visit https://qr-gen.ruvab.it.com - it's completely free and offers:\n\n\u2022 Custom QR codes for URLs, text, contacts\n\u2022 Bulk generation capabilities\n\u2022 High-resolution downloads\n\u2022 Professional design options\n\nIt's part of our suite of digital tools. Are you interested in our other business solutions too?";
    }
    if (lowerMessage.includes("contact") || lowerMessage.includes("meeting") || lowerMessage.includes("consultation") || lowerMessage.includes("call")) {
      return "I'd love to arrange that! \u{1F4DE} Here are your options:\n\n\u2022 Free 30-minute consultation call\n\u2022 Technical demo session\n\u2022 In-person meeting (if you're in our area)\n\u2022 Video conference at your convenience\n\nOur consultations are completely free with no obligations. What works best for your schedule? I can connect you with our senior consultant right away.";
    }
    if (lowerMessage.includes("team") || lowerMessage.includes("company") || lowerMessage.includes("about")) {
      return "Great question! \u{1F465} Ruvab IT is a technology solutions company with a passionate team of developers, AI specialists, and business analysts. We've:\n\n\u2022 Completed 100+ successful projects\n\u2022 Served clients across 15+ industries\n\u2022 Maintained 98% client satisfaction rate\n\u2022 Specialized in cutting-edge technologies\n\nWe're based in India but serve clients globally. Our mission is to make advanced technology accessible to businesses of all sizes. What would you like to know about our expertise?";
    }
    if (lowerMessage.includes("help") || lowerMessage.includes("support") || lowerMessage.includes("problem") || lowerMessage.includes("issue")) {
      return "I'm here to help! \u{1F91D} Let me know what specific challenge you're facing:\n\n\u2022 Technical questions about our services\n\u2022 Project scope and requirements discussion\n\u2022 Pricing and timeline information\n\u2022 Integration and implementation guidance\n\nOr if you prefer, I can connect you directly with one of our technical specialists. What area do you need assistance with?";
    }
    if (lowerMessage.includes("thank") || lowerMessage.includes("appreciate")) {
      return "You're very welcome! \u{1F60A} I'm glad I could help. Is there anything else you'd like to know about our services? I'm here whenever you need assistance with AI solutions, software development, or any technology needs. Feel free to ask anything!";
    }
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return "Hello! \u{1F44B} Welcome to Ruvab IT support. I'm excited to help you explore our technology solutions! We specialize in AI implementation, custom software development, data analytics, and digital transformation. What brings you here today?";
    }
    return "Thank you for your message! \u{1F914} I want to make sure I give you the most helpful information. Could you tell me a bit more about what you're looking for? I can help with:\n\n\u2022 AI and Machine Learning solutions\n\u2022 Software Development projects\n\u2022 Data Analytics and Business Intelligence\n\u2022 Cloud Solutions and Digital Transformation\n\nWhat specific area interests you most?";
  }
  app2.use(session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      tableName: "sessions"
    }),
    secret: process.env.SESSION_SECRET || "dev-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      const isValidPassword = await bcrypt2.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ success: true });
    });
  });
  app2.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const isValidPassword = await bcrypt2.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      const hashedNewPassword = await bcrypt2.hash(newPassword, 10);
      await storage.updateUserPassword(user.id, hashedNewPassword);
      res.json({
        success: true,
        message: "Password updated successfully"
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      res.json({ message: "Users endpoint - to be implemented" });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid user data", errors: result.error.errors });
      }
      const user = await storage.createUser(result.data);
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/blog/posts", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Get blog posts error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/blog/posts/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Get blog post error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/blog/posts", requireAdmin, async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Get admin blog posts error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/blog/posts", requireAdmin, async (req, res) => {
    try {
      const result = insertBlogPostSchema.safeParse({
        ...req.body,
        authorId: req.session.userId
      });
      if (!result.success) {
        return res.status(400).json({ message: "Invalid blog post data", errors: result.error.errors });
      }
      const post = await storage.createBlogPost(result.data);
      res.json(post);
    } catch (error) {
      console.error("Create blog post error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/admin/blog/posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const post = await storage.updateBlogPost(id, req.body);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Update blog post error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/admin/blog/posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const success = await storage.deleteBlogPost(id);
      if (!success) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete blog post error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/pages", requireAdmin, async (req, res) => {
    try {
      const pages = await storage.getAllPageContents();
      res.json(pages);
    } catch (error) {
      console.error("Get pages error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/pages/:pageKey", async (req, res) => {
    try {
      const page = await storage.getPageContent(req.params.pageKey);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Get page error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/pages", requireAdmin, async (req, res) => {
    try {
      const result = insertPageContentSchema.safeParse({
        ...req.body,
        updatedBy: req.session.userId
      });
      if (!result.success) {
        return res.status(400).json({ message: "Invalid page data", errors: result.error.errors });
      }
      const page = await storage.createPageContent(result.data);
      res.json(page);
    } catch (error) {
      console.error("Create page error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/admin/pages/:pageKey", requireAdmin, async (req, res) => {
    try {
      const page = await storage.updatePageContent(req.params.pageKey, {
        ...req.body,
        updatedBy: req.session.userId
      });
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Update page error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/search", async (req, res) => {
    try {
      const searchParams = {
        query: req.query.query,
        type: req.query.type || "all",
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 10,
        offset: req.query.offset ? parseInt(req.query.offset, 10) : 0
      };
      const result = searchSchema.safeParse(searchParams);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid search parameters", errors: result.error.errors });
      }
      const results = await storage.searchContent(result.data);
      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      const userAgent = req.get("User-Agent") || "Unknown";
      const ipAddress = req.ip || req.connection.remoteAddress || "Unknown";
      const lead = await storage.createNewsletterLead({
        email: email.toLowerCase().trim(),
        source: "website",
        userAgent,
        ipAddress,
        isActive: true
      });
      res.json({
        success: true,
        message: "Successfully subscribed to newsletter",
        lead: {
          id: lead.id,
          email: lead.email,
          subscriptionDate: lead.subscriptionDate
        }
      });
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });
  app2.get("/api/admin/newsletter/leads", requireAuth, async (req, res) => {
    try {
      const leads = await storage.getNewsletterLeads();
      res.json(leads);
    } catch (error) {
      console.error("Get newsletter leads error:", error);
      res.status(500).json({ message: "Failed to fetch newsletter leads" });
    }
  });
  app2.post("/api/payment/create-order", async (req, res) => {
    try {
      if (!razorpay || !razorpayInitialized) {
        return res.status(503).json({
          error: "Payment service not available",
          message: "Razorpay is not configured. Please contact support.",
          debug: {
            razorpayExists: !!razorpay,
            initialized: razorpayInitialized,
            hasKeyId: !!process.env.RAZORPAY_KEY_ID,
            hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET
          }
        });
      }
      const { amount, serviceType, customerName, customerEmail, customerPhone, description } = req.body;
      if (!amount || !serviceType || !customerEmail) {
        return res.status(400).json({ error: "Amount, service type, and customer email are required" });
      }
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const razorpayOrder = await razorpay.orders.create({
        amount: amount * 100,
        // Convert to paise
        currency: "INR",
        receipt: orderId
      });
      const order = await storage.createOrder({
        orderId,
        amount: amount * 100,
        currency: "INR",
        status: "created",
        customerName,
        customerEmail,
        customerPhone,
        serviceType,
        description,
        razorpayOrderId: razorpayOrder.id
      });
      res.json({
        success: true,
        orderId: order.orderId,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });
  app2.post("/api/payment/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
        return res.status(400).json({ error: "Missing payment verification data" });
      }
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return res.status(500).json({ error: "Payment verification not configured" });
      }
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto.createHmac("sha256", secret).update(body.toString()).digest("hex");
      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: "Invalid payment signature" });
      }
      if (!razorpay) {
        return res.status(500).json({ error: "Payment gateway not configured" });
      }
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      await storage.updateOrder(orderId, {
        status: "paid",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      });
      const order = await storage.getOrder(orderId);
      if (order) {
        await storage.createPayment({
          orderId: order.id,
          razorpayPaymentId: razorpay_payment_id,
          amount: typeof payment.amount === "string" ? parseInt(payment.amount) : payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          bank: payment.bank || null,
          walletType: payment.wallet || null,
          vpa: payment.vpa || null,
          fee: typeof payment.fee === "string" ? parseInt(payment.fee) : payment.fee || 0,
          tax: typeof payment.tax === "string" ? parseInt(payment.tax) : payment.tax || 0
        });
      }
      res.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });
  app2.get("/api/payment/order/:orderId", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const payments2 = await storage.getPaymentsByOrderId(order.id);
      res.json({
        success: true,
        order: {
          ...order,
          payments: payments2
        }
      });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  app2.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders2 = await storage.getAllOrders();
      res.json(orders2);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/orders/:orderId", requireAdmin, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const payments2 = await storage.getPaymentsByOrderId(order.id);
      res.json({
        ...order,
        payments: payments2
      });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/payment/webhook", async (req, res) => {
    try {
      const webhookSignature = req.get("X-Razorpay-Signature");
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (webhookSecret && webhookSignature) {
        const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(JSON.stringify(req.body)).digest("hex");
        if (expectedSignature !== webhookSignature) {
          return res.status(400).json({ error: "Invalid webhook signature" });
        }
      }
      const event = req.body.event;
      const paymentEntity = req.body.payload.payment.entity;
      if (event === "payment.captured") {
        const payment = await storage.getPaymentByRazorpayId(paymentEntity.id);
        if (payment) {
          const order = await storage.getOrderById(payment.orderId);
          if (order && order.status !== "paid") {
            await storage.updateOrder(order.orderId, { status: "paid" });
          }
        }
      } else if (event === "payment.failed") {
        const payment = await storage.getPaymentByRazorpayId(paymentEntity.id);
        if (payment) {
          const order = await storage.getOrderById(payment.orderId);
          if (order) {
            await storage.updateOrder(order.orderId, { status: "failed" });
          }
        }
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const { name, email, company, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please provide a valid email address" });
      }
      if (!process.env.SENDGRID_API_KEY) {
        console.log("Contact form submission:", { name, email, company, subject, message });
        console.warn("SendGrid API key not configured. Contact form data logged only.");
        return res.json({
          success: true,
          message: "Thank you for your message. We'll get back to you within 24 hours."
        });
      }
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const emailContent = `
        <h2>New Contact Form Submission</h2>
        
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || "Not specified"}</p>
        <p><strong>Subject:</strong> ${subject || "Contact Form Submission"}</p>
        
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        
        <p><em>Submitted at: ${(/* @__PURE__ */ new Date()).toISOString()}</em></p>
      `;
      const msg = {
        to: process.env.EMAIL_TO || "admin@ruvab.it.com",
        from: process.env.EMAIL_FROM || "noreply@ruvab.it.com",
        subject: `Contact Form: ${subject || "New Inquiry"}`,
        html: emailContent,
        replyTo: email
      };
      await sgMail.send(msg);
      res.json({
        success: true,
        message: "Thank you for your message. We'll get back to you within 24 hours."
      });
    } catch (error) {
      console.error("SendGrid error:", error);
      console.log("Contact form submission (email failed):", req.body);
      res.json({
        success: true,
        message: "Thank you for your message. We'll get back to you within 24 hours."
      });
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  console.log("Initializing default data...");
  await storage.initializeDefaultData();
  console.log("Default data initialized successfully");
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
