var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/pdfGenerator.ts
var pdfGenerator_exports = {};
__export(pdfGenerator_exports, {
  generatePDF: () => generatePDF
});
async function generatePDF(document) {
  try {
    console.log(`\u{1F504} Starting PDF generation for: ${document.title}`);
    const htmlContent = await generateComprehensivePDFContent(document);
    console.log(`\u{1F4DD} Generated HTML content (${htmlContent.length} chars) with full document sections`);
    const htmlPdf = await import("html-pdf-node");
    const options = {
      format: "A4",
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm"
      },
      printBackground: true,
      preferCSSPageSize: true
    };
    const file = { content: htmlContent };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    console.log(`\u2705 PDF generated successfully (${pdfBuffer.length} bytes) with full content`);
    return pdfBuffer;
  } catch (error) {
    console.error("\u274C PDF generation error:", error);
    return generateFallbackPDF(document);
  }
}
async function generateComprehensivePDFContent(document) {
  const sections = document.content?.sections || [];
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${document.title}</title>
  ${pdfStyles}
</head>
<body>
  <div class="document">
    <header class="header">
      <h1 class="main-title">${document.title}</h1>
      <div class="subtitle">Generated on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}</div>
    </header>
    
    <main class="content">
      ${sections.map((section, index2) => `
        <section class="section ${index2 > 2 ? "page-break" : ""}">
          <h2 class="section-title">${section.title || "Section"}</h2>
          <div class="section-content">
            ${formatSectionContent(section)}
          </div>
        </section>
      `).join("")}
    </main>
    
    <footer class="footer">
      <p>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Jenrate.ai - Professional Document Generation</p>
    </footer>
  </div>
</body>
</html>`;
}
function formatSectionContent(section) {
  const content = section.content || "";
  const type = section.type || "";
  switch (type) {
    case "executive_summary":
    case "introduction":
      return `<div class="highlight-box">${content}</div>`;
    case "financial_highlights":
    case "key_metrics":
      return `<div class="metrics-section">${content}</div>`;
    case "work_experience":
    case "experience":
      return `<div class="experience-section">${content}</div>`;
    case "skills":
      return `<div class="skills-section">${content}</div>`;
    case "pitch_slides":
      return formatPitchSlides(section);
    case "invoice_items":
      return formatInvoiceItems(section);
    default:
      return `<p>${content}</p>`;
  }
}
function formatPitchSlides(section) {
  if (section.slides && Array.isArray(section.slides)) {
    return section.slides.map((slide) => `
      <div class="pitch-slide">
        <h3 class="slide-title">${slide.title || "Slide"}</h3>
        ${slide.subtitle ? `<p class="slide-subtitle">${slide.subtitle}</p>` : ""}
        <div class="slide-content">${slide.content || ""}</div>
      </div>
    `).join("");
  }
  return `<p>${section.content || ""}</p>`;
}
function formatInvoiceItems(section) {
  if (section.items && Array.isArray(section.items)) {
    return `
      <table class="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${section.items.map((item) => `
            <tr>
              <td>${item.description || ""}</td>
              <td>${item.quantity || ""}</td>
              <td>${item.rate || ""}</td>
              <td>${item.amount || ""}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }
  return `<p>${section.content || ""}</p>`;
}
function generateFallbackPDF(document) {
  const sections = document.content?.sections || [];
  let content = `${document.title}

`;
  sections.forEach((section) => {
    if (section.title && section.content) {
      content += `${section.title}
${"-".repeat(section.title.length)}
`;
      content += `${section.content}

`;
    }
  });
  content += `
Generated on: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`;
  const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length ${content.length + 100}>>stream
BT/F1 12 Tf 72 720 Td(${content.replace(/\n/g, ")Tj 0 -15 Td(")})Tj ET
endstream endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref 0 6
0000000000 65535 f 
0000000010 00000 n 
0000000062 00000 n 
0000000119 00000 n 
0000000267 00000 n 
0000000${(400 + content.length).toString().padStart(3, "0")} 00000 n 
trailer<</Size 6/Root 1 0 R>>startxref ${450 + content.length}%%EOF`;
  return Buffer.from(pdfContent, "utf8");
}
var init_pdfGenerator = __esm({
  "server/pdfGenerator.ts"() {
    "use strict";
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import session from "express-session";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  chatMessages: () => chatMessages,
  chatMessagesRelations: () => chatMessagesRelations,
  chatSessions: () => chatSessions,
  chatSessionsRelations: () => chatSessionsRelations,
  customRequests: () => customRequests,
  documentVersions: () => documentVersions,
  documents: () => documents,
  documentsRelations: () => documentsRelations,
  emailSubscriptions: () => emailSubscriptions,
  insertChatMessageSchema: () => insertChatMessageSchema,
  insertChatSessionSchema: () => insertChatSessionSchema,
  insertCustomRequestSchema: () => insertCustomRequestSchema,
  insertDocumentSchema: () => insertDocumentSchema,
  insertDocumentVersionSchema: () => insertDocumentVersionSchema,
  insertEmailSubscriptionSchema: () => insertEmailSubscriptionSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertSubscriptionPlanSchema: () => insertSubscriptionPlanSchema,
  insertTemplateSchema: () => insertTemplateSchema,
  insertTestimonialSchema: () => insertTestimonialSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUsageAnalyticsSchema: () => insertUsageAnalyticsSchema,
  insertUserSchema: () => insertUserSchema,
  notifications: () => notifications,
  sessions: () => sessions,
  subscriptionPlans: () => subscriptionPlans,
  templates: () => templates,
  templatesRelations: () => templatesRelations,
  testimonials: () => testimonials,
  transactions: () => transactions,
  upsertUserSchema: () => upsertUserSchema,
  usageAnalytics: () => usageAnalytics,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  varchar,
  decimal,
  index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").unique(),
  email: text("email").notNull().unique(),
  password: text("password"),
  // Optional for OAuth users
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  profileImageUrl: text("profile_image_url"),
  provider: text("provider").default("email"),
  // 'email', 'google', 'facebook'
  providerId: text("provider_id"),
  currentPlan: text("current_plan").default("starter"),
  // 'starter', 'pro', 'agency'
  planStartDate: timestamp("plan_start_date").defaultNow(),
  planEndDate: timestamp("plan_end_date"),
  monthlyUsage: integer("monthly_usage").default(0),
  usageResetDate: timestamp("usage_reset_date").defaultNow(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  isActive: boolean("is_active").default(true),
  emailVerified: boolean("email_verified").default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  // 'Starter', 'Pro', 'Agency'
  slug: text("slug").notNull().unique(),
  // 'starter', 'pro', 'agency'
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("GBP"),
  monthlyDesignLimit: integer("monthly_design_limit").notNull(),
  features: jsonb("features").notNull(),
  // Array of feature descriptions
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  planId: varchar("plan_id").references(() => subscriptionPlans.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("GBP"),
  status: text("status").notNull(),
  // 'pending', 'completed', 'failed', 'refunded'
  paymentMethod: text("payment_method"),
  // 'stripe', 'paypal', etc.
  paymentId: text("payment_id"),
  // External payment provider ID
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  // 'pitch-deck', 'resume', 'brochure', etc.
  sector: text("sector").default("general"),
  // 'marketing', 'finance', 'technology', 'real_estate'
  previewImageUrl: text("preview_image_url").notNull(),
  templateData: jsonb("template_data").notNull(),
  // Template structure and fields
  aiPromptTemplate: text("ai_prompt_template"),
  // Template for AI generation
  isPublic: boolean("is_public").default(true),
  isPremium: boolean("is_premium").default(false),
  // Requires Pro+ plan
  tags: text("tags").array(),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  templateId: varchar("template_id").references(() => templates.id),
  title: text("title").notNull(),
  content: jsonb("content").notNull(),
  // Generated content
  originalPrompt: text("original_prompt").notNull(),
  serviceType: text("service_type").notNull(),
  // 'pitch-deck', 'resume-builder', etc.
  detectedSector: text("detected_sector").default("general"),
  pageCount: integer("page_count").default(1),
  // Number of pages selected by user
  thumbnailUrl: text("thumbnail_url"),
  status: text("status").default("draft"),
  // 'draft', 'completed', 'shared'
  isPublic: boolean("is_public").default(false),
  shareToken: text("share_token"),
  // For public sharing
  downloadCount: integer("download_count").default(0),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var documentVersions = pgTable("document_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => documents.id).notNull(),
  versionNumber: integer("version_number").notNull(),
  content: jsonb("content").notNull(),
  changeDescription: text("change_description"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  subject: text("subject"),
  status: text("status").default("open"),
  // 'open', 'in_progress', 'closed'
  priority: text("priority").default("normal"),
  // 'low', 'normal', 'high', 'urgent'
  assignedToSupportId: varchar("assigned_to_support_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at")
});
var chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => chatSessions.id).notNull(),
  message: text("message").notNull(),
  attachments: jsonb("attachments"),
  // File attachments
  isFromSupport: boolean("is_from_support").default(false),
  supportUserId: varchar("support_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  customerTitle: text("customer_title"),
  customerCompany: text("customer_company"),
  customerImageUrl: text("customer_image_url"),
  message: text("message").notNull(),
  rating: integer("rating").notNull(),
  // 1-5 stars
  serviceUsed: text("service_used"),
  // Which AI service they used
  isVerified: boolean("is_verified").default(false),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var usageAnalytics = pgTable("usage_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  // 'document_created', 'template_used', 'login', etc.
  resourceType: text("resource_type"),
  // 'document', 'template', 'chat', etc.
  resourceId: varchar("resource_id"),
  metadata: jsonb("metadata"),
  // Additional tracking data
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var emailSubscriptions = pgTable("email_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  email: text("email").notNull(),
  subscriptionType: text("subscription_type").notNull(),
  // 'newsletter', 'product_updates', 'marketing'
  isActive: boolean("is_active").default(true),
  source: text("source"),
  // Where they subscribed from
  createdAt: timestamp("created_at").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at")
});
var notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  // 'info', 'success', 'warning', 'error'
  category: text("category"),
  // 'account', 'billing', 'feature', 'support'
  isRead: boolean("is_read").default(false),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at")
});
var customRequests = pgTable("custom_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  phone: text("phone"),
  service: text("service").notNull(),
  projectDetails: text("project_details").notNull(),
  timeline: text("timeline"),
  budget: text("budget"),
  additionalRequirements: text("additional_requirements"),
  status: text("status").default("pending").notNull(),
  // 'pending', 'quoted', 'in_progress', 'completed', 'cancelled'
  priority: text("priority").default("normal").notNull(),
  // 'low', 'normal', 'high', 'urgent'
  assignedTo: varchar("assigned_to").references(() => users.id),
  estimatedCost: integer("estimated_cost"),
  // in pence/cents
  quotedCost: integer("quoted_cost"),
  // in pence/cents
  notes: text("notes"),
  // Internal notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  transactions: many(transactions),
  chatSessions: many(chatSessions),
  usageAnalytics: many(usageAnalytics),
  notifications: many(notifications)
}));
var documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id]
  }),
  template: one(templates, {
    fields: [documents.templateId],
    references: [templates.id]
  }),
  versions: many(documentVersions)
}));
var templatesRelations = relations(templates, ({ many }) => ({
  documents: many(documents)
}));
var chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id]
  }),
  messages: many(chatMessages)
}));
var chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageResetDate: true,
  planStartDate: true
});
var upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  usageResetDate: true,
  planStartDate: true
});
var insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true
});
var insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true
});
var insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true
});
var insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  downloadCount: true,
  viewCount: true
});
var insertDocumentVersionSchema = createInsertSchema(documentVersions).omit({
  id: true,
  createdAt: true
});
var insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  closedAt: true
});
var insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true
});
var insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true
});
var insertUsageAnalyticsSchema = createInsertSchema(usageAnalytics).omit({
  id: true,
  createdAt: true
});
var insertEmailSubscriptionSchema = createInsertSchema(emailSubscriptions).omit({
  id: true,
  createdAt: true,
  unsubscribedAt: true
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  readAt: true
});
var insertCustomRequestSchema = createInsertSchema(customRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  priority: true,
  assignedTo: true,
  estimatedCost: true,
  quotedCost: true,
  notes: true
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
import { eq, desc, and, gte, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  // Users
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async getUserByUsername(username) {
    if (!username) return void 0;
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const now = /* @__PURE__ */ new Date();
    const [user] = await db.insert(users).values({
      ...insertUser,
      planStartDate: now,
      usageResetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      // First day of next month
      updatedAt: now
    }).returning();
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async updateUser(id, updates) {
    const [user] = await db.update(users).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user;
  }
  async updateUserUsage(id, increment) {
    const [user] = await db.update(users).set({
      monthlyUsage: sql2`${users.monthlyUsage} + ${increment}`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, id)).returning();
    return user;
  }
  async resetMonthlyUsage(id) {
    const [user] = await db.update(users).set({
      monthlyUsage: 0,
      usageResetDate: new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth() + 1, 1),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, id)).returning();
    return user;
  }
  async updateStripeCustomerId(id, customerId) {
    const [user] = await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, id)).returning();
    return user;
  }
  async updateUserStripeInfo(id, stripeCustomerId, stripeSubscriptionId) {
    const [user] = await db.update(users).set({
      stripeCustomerId,
      stripeSubscriptionId,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, id)).returning();
    return user;
  }
  // Subscription Plans
  async getSubscriptionPlans() {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true)).orderBy(subscriptionPlans.sortOrder);
  }
  async getSubscriptionPlan(slug) {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.slug, slug));
    return plan;
  }
  async createSubscriptionPlan(plan) {
    const [newPlan] = await db.insert(subscriptionPlans).values(plan).returning();
    return newPlan;
  }
  // Transactions
  async getUserTransactions(userId) {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }
  async createTransaction(transaction) {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }
  async updateTransactionStatus(id, status) {
    const [transaction] = await db.update(transactions).set({ status }).where(eq(transactions.id, id)).returning();
    return transaction;
  }
  // Templates
  async getTemplates() {
    return await db.select().from(templates).where(eq(templates.isPublic, true)).orderBy(desc(templates.usageCount));
  }
  async getTemplatesByCategory(category) {
    return await db.select().from(templates).where(and(eq(templates.category, category), eq(templates.isPublic, true))).orderBy(desc(templates.usageCount));
  }
  async getTemplatesBySector(sector) {
    return await db.select().from(templates).where(and(eq(templates.sector, sector), eq(templates.isPublic, true))).orderBy(desc(templates.usageCount));
  }
  async getTemplate(id) {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }
  async getTemplateCategories() {
    const results = await db.selectDistinct({ category: templates.category }).from(templates).where(eq(templates.isPublic, true));
    return results.map((r) => r.category);
  }
  async createTemplate(template) {
    const [newTemplate] = await db.insert(templates).values(template).returning();
    return newTemplate;
  }
  async incrementTemplateUsage(id) {
    await db.update(templates).set({
      usageCount: sql2`${templates.usageCount} + 1`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(templates.id, id));
  }
  // Documents
  async getDocuments(userId) {
    if (userId) {
      return await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.updatedAt));
    }
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }
  async getDocument(id) {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }
  async createDocument(document) {
    const [newDocument] = await db.insert(documents).values(document).returning();
    if (document.userId) {
      await this.trackUsage({
        userId: document.userId,
        action: "document_created",
        resourceType: "document",
        resourceId: newDocument.id,
        metadata: { serviceType: document.serviceType, sector: document.detectedSector }
      });
    }
    return newDocument;
  }
  async updateDocument(id, updates) {
    const [document] = await db.update(documents).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(documents.id, id)).returning();
    return document;
  }
  async deleteDocument(id) {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount > 0;
  }
  async getPublicDocuments() {
    return await db.select().from(documents).where(eq(documents.isPublic, true)).orderBy(desc(documents.viewCount));
  }
  // Chat
  async createChatSession(session3) {
    const [newSession] = await db.insert(chatSessions).values(session3).returning();
    return newSession;
  }
  async getChatSession(id) {
    const [session3] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session3;
  }
  async getUserChatSessions(userId) {
    return await db.select().from(chatSessions).where(eq(chatSessions.userId, userId)).orderBy(desc(chatSessions.createdAt));
  }
  async getChatMessages(sessionId) {
    return await db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.createdAt);
  }
  async addChatMessage(message) {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }
  async closeChatSession(id) {
    const [session3] = await db.update(chatSessions).set({
      status: "closed",
      isActive: false,
      closedAt: /* @__PURE__ */ new Date()
    }).where(eq(chatSessions.id, id)).returning();
    return session3;
  }
  // Analytics
  async trackUsage(analytics) {
    const [newAnalytics] = await db.insert(usageAnalytics).values(analytics).returning();
    return newAnalytics;
  }
  async getUserAnalytics(userId, days = 30) {
    const daysAgo = /* @__PURE__ */ new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    return await db.select().from(usageAnalytics).where(and(
      eq(usageAnalytics.userId, userId),
      gte(usageAnalytics.createdAt, daysAgo)
    )).orderBy(desc(usageAnalytics.createdAt));
  }
  // Notifications
  async createNotification(notification) {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }
  async getUserNotifications(userId) {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }
  async markNotificationAsRead(id) {
    const [notification] = await db.update(notifications).set({
      isRead: true,
      readAt: /* @__PURE__ */ new Date()
    }).where(eq(notifications.id, id)).returning();
    return notification;
  }
  // Custom Requests
  async createCustomRequest(request) {
    const [newRequest] = await db.insert(customRequests).values(request).returning();
    return newRequest;
  }
  // Database Template Retrieval (from existing templates table)
  async getDatabaseTemplates() {
    try {
      const allTemplates = await db.select({
        name: templates.name,
        text: templates.aiPromptTemplate
      }).from(templates).where(sql2`${templates.aiPromptTemplate} IS NOT NULL AND ${templates.aiPromptTemplate} != ''`);
      return allTemplates.filter((t) => t.text).map((t) => ({
        name: t.name,
        text: t.text
      }));
    } catch (error) {
      console.error("Error retrieving database templates:", error);
      return [];
    }
  }
  async getDatabaseTemplatesByCategory(category) {
    try {
      const categoryMap = {
        "marketing": "pitch-deck",
        "resume": "resume",
        "business": "report",
        "content": "ebook",
        "email": "newsletter"
      };
      const dbCategory = categoryMap[category] || category;
      const categoryTemplates = await db.select({
        name: templates.name,
        text: templates.aiPromptTemplate
      }).from(templates).where(and(
        eq(templates.category, dbCategory),
        sql2`${templates.aiPromptTemplate} IS NOT NULL AND ${templates.aiPromptTemplate} != ''`
      ));
      return categoryTemplates.filter((t) => t.text).map((t) => ({
        name: t.name,
        text: t.text
      }));
    } catch (error) {
      console.error("Error retrieving database templates by category:", error);
      return [];
    }
  }
  // Stripe methods
  async updateStripeCustomerId(userId, customerId) {
    const [user] = await db.update(users).set({ stripeCustomerId: customerId, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
    return user;
  }
  async updateUserStripeInfo(userId, stripeInfo) {
    const [user] = await db.update(users).set({
      stripeCustomerId: stripeInfo.customerId,
      stripeSubscriptionId: stripeInfo.subscriptionId,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    return user;
  }
  // Template categories
  async getTemplateCategories() {
    const result = await db.select({ category: templates.category }).from(templates).groupBy(templates.category);
    return result.map((r) => r.category);
  }
  async getTemplateByCategory(category) {
    const [template] = await db.select().from(templates).where(eq(templates.category, category)).limit(1);
    return template;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import OpenAI from "openai";

// server/auth.ts
import bcrypt from "bcrypt";
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}
async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}
async function registerUser(userData) {
  const existingUser = await storage.getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }
  if (userData.username) {
    const existingUsername = await storage.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new Error("Username is already taken");
    }
  }
  const hashedPassword = await hashPassword(userData.password);
  const newUser = {
    email: userData.email,
    password: hashedPassword,
    firstName: userData.firstName,
    lastName: userData.lastName,
    username: userData.username || null,
    provider: "email",
    currentPlan: "starter",
    monthlyUsage: 0,
    isActive: true,
    emailVerified: false
  };
  return await storage.createUser(newUser);
}
async function loginUser(email, password) {
  const user = await storage.getUserByEmail(email);
  if (!user || !user.password) {
    return null;
  }
  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    return null;
  }
  await storage.updateUser(user.id, { lastLoginAt: /* @__PURE__ */ new Date() });
  return user;
}

// server/routes.ts
var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
async function registerRoutes(app2) {
  app2.use(session({
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
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const user = await registerUser(req.body);
      req.session.userId = user.id;
      res.json({ user });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await loginUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = user.id;
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  app2.get("/api/templates", async (req, res) => {
    try {
      const { category } = req.query;
      const templates2 = category ? await storage.getTemplatesByCategory(category) : await storage.getTemplates();
      res.json(templates2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });
  app2.get("/api/templates/by-service/:serviceType", async (req, res) => {
    try {
      const { serviceType } = req.params;
      console.log(`\u{1F50D} Fetching templates for service type: ${serviceType}`);
      const possibleCategories = getCategoryMappingForServiceType(serviceType);
      console.log(`\u{1F3AF} Mapped categories: ${possibleCategories.join(", ")}`);
      const allTemplates = await storage.getTemplates();
      const filteredTemplates = allTemplates.filter(
        (template) => possibleCategories.includes(template.category)
      );
      console.log(`\u{1F4DD} Found ${filteredTemplates.length} templates for ${serviceType}`);
      const templateList = filteredTemplates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description || `${template.category} template`,
        category: template.category
      }));
      res.json(templateList);
    } catch (error) {
      console.error("\u274C Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });
  app2.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });
  app2.get("/api/debug/templates", async (req, res) => {
    try {
      console.log("\u{1F50D} DEBUG: Template loading analysis");
      const dbTemplates = await storage.getTemplates();
      console.log(`\u{1F4CA} Database templates: ${dbTemplates.length}`);
      const validDbTemplates = dbTemplates.filter((t) => t.id && t.category && t.name);
      console.log(`\u2705 Valid database templates: ${validDbTemplates.length}`);
      const categoriesDb = [...new Set(dbTemplates.map((t) => t.category).filter(Boolean))];
      console.log(`\u{1F4CB} Database categories: ${categoriesDb.join(", ")}`);
      const fs2 = await import("fs");
      const path3 = await import("path");
      const templatesDir = path3.join(process.cwd(), "server/templates");
      let backendTemplates = [];
      if (fs2.existsSync(templatesDir)) {
        const files = fs2.readdirSync(templatesDir).filter((f) => f.endsWith(".json"));
        backendTemplates = files.map((file) => {
          try {
            const content = fs2.readFileSync(path3.join(templatesDir, file), "utf8");
            const template = JSON.parse(content);
            return { file, id: template.id, name: template.name, category: template.category };
          } catch (error) {
            return { file, error: error.message };
          }
        });
      }
      res.json({
        database: {
          total: dbTemplates.length,
          valid: validDbTemplates.length,
          categories: categoriesDb,
          templates: dbTemplates.map((t) => ({
            id: t.id,
            name: t.name,
            category: t.category,
            sector: t.sector,
            usageCount: t.usageCount
          }))
        },
        backend: {
          directory: templatesDir,
          exists: fs2.existsSync(templatesDir),
          total: backendTemplates.length,
          templates: backendTemplates
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to debug templates",
        error: error.message
      });
    }
  });
  app2.get("/api/documents", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const documents2 = await storage.getDocuments(userId);
      res.json(documents2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  app2.get("/api/documents/:id", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      if (document.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });
  app2.post("/api/documents", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const planLimits = {
        starter: 8,
        pro: 40,
        agency: Infinity
      };
      const currentLimit = planLimits[user.currentPlan] || 8;
      if (user.monthlyUsage >= currentLimit) {
        return res.status(429).json({
          message: "Monthly design limit reached. Please upgrade your plan or wait until next month.",
          currentUsage: user.monthlyUsage,
          limit: currentLimit
        });
      }
      const validatedData = insertDocumentSchema.parse({
        ...req.body,
        userId: user.id
      });
      const document = await storage.createDocument(validatedData);
      await storage.updateUserUsage(user.id, 1);
      res.json(document);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });
  app2.put("/api/documents/:id", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      if (document.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const updatedDocument = await storage.updateDocument(req.params.id, req.body);
      res.json(updatedDocument);
    } catch (error) {
      res.status(500).json({ message: "Failed to update document" });
    }
  });
  app2.delete("/api/documents/:id", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      if (document.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteDocument(req.params.id);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });
  app2.get("/api/documents/:id/download", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      console.log(`\u{1F4C4} Generating PDF for document: ${document.title} (${document.serviceType})`);
      const { generatePDF: generatePDF2 } = await Promise.resolve().then(() => (init_pdfGenerator(), pdfGenerator_exports));
      const pdfBuffer = await generatePDF2(document);
      const filename = `${document.title.replace(/[^a-zA-Z0-9\s]/g, "_").replace(/\s+/g, "_")}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", pdfBuffer.length.toString());
      res.send(pdfBuffer);
      console.log(`\u2705 PDF generated successfully: ${filename}`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      res.status(500).json({ message: "Failed to generate PDF document" });
    }
  });
  app2.get("/api/test-pdf", async (req, res) => {
    try {
      console.log(`\u{1F9EA} Testing PDF generation...`);
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 16 Tf
72 720 Td
(Test PDF Document) Tj
0 -40 Td
/F1 12 Tf
(This is a working PDF generated by Jenrate.Ai) Tj
0 -20 Td
(All document generation and PDF download systems are functional.) Tj
0 -20 Td
(Generated on: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000062 00000 n 
0000000119 00000 n 
0000000267 00000 n 
0000000520 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
580
%%EOF`;
      const pdfBuffer = Buffer.from(pdfContent, "utf8");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="test_document.pdf"');
      res.setHeader("Content-Length", pdfBuffer.length.toString());
      res.send(pdfBuffer);
      console.log(`\u2705 Test PDF generated successfully: test_document.pdf (${pdfBuffer.length} bytes)`);
    } catch (error) {
      console.error("\u274C Test PDF generation failed:", error);
      res.status(500).json({ message: "Test PDF generation failed", error: error.message });
    }
  });
  async function findBestTemplate(prompt, serviceType) {
    console.log(`\u{1F50D} Finding database template for serviceType: ${serviceType}`);
    const allTemplates = await storage.getTemplates();
    if (!allTemplates || allTemplates.length === 0) {
      console.log("\u274C No templates found in database");
      return null;
    }
    console.log(`\u{1F4CA} Found ${allTemplates.length} total database templates`);
    console.log(`\u{1F4CB} Available categories: ${[...new Set(allTemplates.map((t) => t.category).filter(Boolean))].join(", ")}`);
    const validTemplates = allTemplates.filter((t) => t.id && t.category && t.name);
    console.log(`\u2705 Valid templates (with ID, category, name): ${validTemplates.length}`);
    const serviceToCategory = {
      "resume-builder": ["resume", "cv", "curriculum-vitae"],
      "cv": ["resume", "cv", "curriculum-vitae"],
      "pitch-deck": ["pitch-deck", "presentation", "startup-pitch"],
      "brochure-designer": ["brochure", "marketing-brochure", "flyer"],
      "report-generator": ["report", "financial-report", "business-report"],
      "invoice-creator": ["invoice", "billing", "bill"],
      "business-plan": ["business-plan", "startup-plan"],
      "newsletter-designer": ["newsletter", "email-newsletter"],
      "ebook-creator": ["ebook", "book", "guide"],
      "chart-generator": ["chart", "graph", "data-visualization"]
    };
    const possibleCategories = serviceToCategory[serviceType] || [serviceType];
    console.log(`\u{1F3AF} Possible categories for '${serviceType}': ${possibleCategories.join(", ")}`);
    const categoryTemplates = validTemplates.filter(
      (t) => t.category && possibleCategories.some(
        (cat) => t.category.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(t.category.toLowerCase())
      )
    );
    console.log(`\u{1F3AF} Category matches for '${serviceType}': ${categoryTemplates.length}`);
    if (categoryTemplates.length > 0) {
      console.log(`\u{1F4DD} Found category templates: ${categoryTemplates.map((t) => `${t.name} (${t.category})`).join(", ")}`);
    }
    if (categoryTemplates.length > 0) {
      const scoredTemplates = categoryTemplates.map((template) => {
        let score = 0;
        const promptLower = prompt.toLowerCase();
        if (template.tags) {
          template.tags.forEach((tag) => {
            if (promptLower.includes(tag.toLowerCase())) {
              score += 3;
            }
          });
        }
        const sectorKeywords = {
          marketing: ["marketing", "campaign", "brand", "advertising", "promotion", "social media", "sales"],
          finance: ["financial", "budget", "revenue", "investment", "profit", "accounting", "money"],
          technology: ["tech", "software", "digital", "AI", "development", "innovation", "app"],
          real_estate: ["property", "real estate", "housing", "rental", "mortgage", "development"],
          general: ["business", "professional", "company", "corporate"]
        };
        const sectorKeywordList = sectorKeywords[template.sector] || [];
        sectorKeywordList.forEach((keyword) => {
          if (promptLower.includes(keyword)) {
            score += 2;
          }
        });
        if (promptLower.includes(template.name.toLowerCase())) {
          score += 5;
        }
        if (promptLower.includes(template.description.toLowerCase())) {
          score += 2;
        }
        return { template, score };
      });
      const bestTemplate = scoredTemplates.sort((a, b) => b.score - a.score)[0];
      if (bestTemplate.score > 0) {
        return bestTemplate.template;
      }
      return categoryTemplates.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))[0];
    }
    const serviceKeywords = {
      "pitch-deck": ["pitch", "presentation", "startup", "funding", "business plan"],
      "resume": ["resume", "cv", "job", "career", "experience", "work history"],
      "brochure": ["brochure", "marketing", "product", "service", "promotional"],
      "report": ["report", "analysis", "data", "research", "findings"],
      "invoice": ["invoice", "bill", "payment", "charge", "cost"],
      "business-plan": ["business plan", "strategy", "startup", "company"],
      "ebook": ["ebook", "book", "guide", "manual", "content"],
      "newsletter": ["newsletter", "email", "update", "news"]
    };
    for (const [category, keywords] of Object.entries(serviceKeywords)) {
      if (keywords.some((keyword) => prompt.toLowerCase().includes(keyword))) {
        const categoryTemplates2 = await storage.getTemplatesByCategory(category);
        if (categoryTemplates2.length > 0) {
          return categoryTemplates2[0];
        }
      }
    }
    const fallbackTemplate = validTemplates.find(
      (t) => t.category && (t.category.toLowerCase().includes(serviceType.toLowerCase().replace("-", "")) || t.category.toLowerCase().includes(serviceType.toLowerCase().replace(" ", "")))
    ) || validTemplates[0];
    if (fallbackTemplate) {
      console.log(`\u{1F527} Using fallback template: ${fallbackTemplate.name} (${fallbackTemplate.category})`);
    } else {
      console.log("\u274C No valid fallback template found");
    }
    return fallbackTemplate;
  }
  async function findBackendTemplate(prompt, serviceType) {
    console.log(`\u{1F50D} Looking for backend template: serviceType=${serviceType}`);
    const fs2 = await import("fs");
    const path3 = await import("path");
    try {
      const templatesDir = path3.join(process.cwd(), "server/templates");
      console.log(`\u{1F4C1} Backend templates directory: ${templatesDir}`);
      if (!fs2.existsSync(templatesDir)) {
        console.log("\u274C Backend templates directory not found");
        return null;
      }
      const availableFiles = fs2.readdirSync(templatesDir).filter((f) => f.endsWith(".json"));
      console.log(`\u{1F4CB} Available backend template files: ${availableFiles.join(", ")}`);
      const templateMap = {
        "resume": "resume.json",
        "resume-builder": "resume.json",
        "cv": "resume.json",
        "curriculum-vitae": "resume.json",
        "pitch-deck": "pitch-deck.json",
        "presentation": "pitch-deck.json",
        "startup-pitch": "pitch-deck.json",
        "investor-deck": "pitch-deck.json",
        "brochure": "brochure.json",
        "brochure-designer": "brochure.json",
        "marketing-brochure": "brochure.json",
        "flyer": "brochure.json",
        "leaflet": "brochure.json",
        "report": "report.json",
        "report-generator": "report.json",
        "financial-report": "report.json",
        "business-report": "report.json",
        "analysis": "report.json",
        "invoice": "invoice.json",
        "invoice-creator": "invoice.json",
        "invoice-generator": "invoice.json",
        "bill": "invoice.json",
        "billing": "invoice.json",
        "business-plan": "business-plan.json",
        "business-plan-generator": "business-plan.json",
        "startup-plan": "business-plan.json",
        "company-plan": "business-plan.json",
        "newsletter": "newsletter.json",
        "newsletter-designer": "newsletter.json",
        "newsletter-generator": "newsletter.json",
        "company-newsletter": "newsletter.json",
        "email-newsletter": "newsletter.json",
        "ebook-creator": "report.json",
        // Use report template for ebooks
        "ebook": "report.json",
        "chart-generator": "report.json",
        // Use report template for charts/graphs
        "chart": "report.json",
        "graph": "report.json"
      };
      console.log(`\u{1F3AF} Template mapping for '${serviceType}': ${templateMap[serviceType] || "not found"}`);
      let templateFile = templateMap[serviceType];
      if (!templateFile) {
        for (const [key, file] of Object.entries(templateMap)) {
          if (serviceType.includes(key) || key.includes(serviceType)) {
            templateFile = file;
            break;
          }
        }
      }
      if (!templateFile) {
        const promptLower = prompt.toLowerCase();
        if (promptLower.includes("resume") || promptLower.includes("cv") || promptLower.includes("job")) {
          templateFile = "resume.json";
        } else if (promptLower.includes("pitch") || promptLower.includes("presentation") || promptLower.includes("startup")) {
          templateFile = "pitch-deck.json";
        } else if (promptLower.includes("brochure") || promptLower.includes("marketing")) {
          templateFile = "brochure.json";
        }
      }
      if (!templateFile) {
        console.log(`\u274C No backend template mapping found for service type: ${serviceType}`);
        return null;
      }
      const templatePath = path3.join(templatesDir, templateFile);
      console.log(`\u{1F4C4} Trying to load template file: ${templatePath}`);
      if (!fs2.existsSync(templatePath)) {
        console.log(`\u274C Backend template file not found: ${templatePath}`);
        return null;
      }
      const templateContent = fs2.readFileSync(templatePath, "utf8");
      const template = JSON.parse(templateContent);
      if (!template.id || !template.name || !template.category) {
        console.log(`\u26A0\uFE0F Invalid backend template structure: ${templateFile}`);
        return null;
      }
      console.log(`\u2705 Using BACKEND template: ${template.name} (${template.category})`);
      return template;
    } catch (error) {
      console.error("Error loading backend template:", error);
      return null;
    }
  }
  function getCategoryMappingForServiceType(serviceType) {
    const categoryMappings = {
      "resume": ["resume"],
      "resume-builder": ["resume"],
      "cv": ["resume"],
      "curriculum-vitae": ["resume"],
      "pitch-deck": ["pitch-deck"],
      "presentation": ["pitch-deck"],
      "startup-pitch": ["pitch-deck"],
      "investor-deck": ["pitch-deck"],
      "brochure": ["brochure"],
      "brochure-designer": ["brochure"],
      "marketing-brochure": ["brochure"],
      "flyer": ["brochure"],
      "leaflet": ["brochure"],
      "report": ["report", "financial-report", "business-report"],
      "report-generator": ["report", "financial-report", "business-report"],
      "financial-report": ["report", "financial-report"],
      "business-report": ["report", "business-report"],
      "analysis": ["report"],
      "invoice": ["invoice"],
      "invoice-creator": ["invoice"],
      "invoice-generator": ["invoice"],
      "bill": ["invoice"],
      "billing": ["invoice"],
      "business-plan": ["business-plan"],
      "business-plan-generator": ["business-plan"],
      "startup-plan": ["business-plan"],
      "company-plan": ["business-plan"],
      "newsletter": ["newsletter"],
      "newsletter-designer": ["newsletter"],
      "newsletter-generator": ["newsletter"],
      "company-newsletter": ["newsletter"],
      "email-newsletter": ["newsletter"],
      "ebook-creator": ["ebook"],
      "ebook": ["ebook"],
      "chart-generator": ["chart"],
      "chart": ["chart"],
      "graph": ["chart"]
    };
    return categoryMappings[serviceType] || ["report"];
  }
  app2.post("/api/generate", async (req, res) => {
    try {
      const { prompt, serviceType, templateId } = req.body;
      if (!prompt || !serviceType) {
        return res.status(400).json({ message: "Prompt and service type are required" });
      }
      const userId = req.session?.userId;
      let user = null;
      if (userId) {
        user = await storage.getUser(userId);
        const planLimits = {
          starter: 8,
          pro: 40,
          agency: Infinity
        };
        const currentLimit = planLimits[user.currentPlan] || 8;
        if (user.monthlyUsage >= currentLimit) {
          return res.status(429).json({
            message: "Monthly design limit reached. Please upgrade your plan.",
            currentUsage: user.monthlyUsage,
            limit: currentLimit
          });
        }
      }
      let selectedTemplate;
      if (templateId) {
        selectedTemplate = await storage.getTemplate(templateId);
      }
      if (!selectedTemplate) {
        console.log("\u{1F50D} Looking for database templates first...");
        selectedTemplate = await findBestTemplate(prompt, serviceType);
        if (!selectedTemplate) {
          console.log("\u{1F4C1} No database template found, using backend templates");
          selectedTemplate = await findBackendTemplate(prompt, serviceType);
        }
      }
      if (!selectedTemplate) {
        return res.status(404).json({ message: "No suitable template found" });
      }
      console.log(`\u{1F3AF} Selected template: ${selectedTemplate.name} (${selectedTemplate.category})`);
      const sectorKeywords = {
        marketing: ["marketing", "campaign", "brand", "advertising", "promotion", "social media"],
        finance: ["financial", "budget", "revenue", "investment", "profit", "accounting"],
        technology: ["tech", "software", "digital", "AI", "development", "innovation"],
        real_estate: ["property", "real estate", "housing", "rental", "mortgage", "development"]
      };
      let detectedSector = selectedTemplate.sector || "general";
      const promptLower = prompt.toLowerCase();
      for (const [sector, keywords] of Object.entries(sectorKeywords)) {
        if (keywords.some((keyword) => promptLower.includes(keyword))) {
          detectedSector = sector;
          break;
        }
      }
      const templateStructure = JSON.stringify(selectedTemplate.templateData, null, 2);
      const basePrompt = selectedTemplate.aiPromptTemplate || `Create professional ${selectedTemplate.category} content following the template structure.`;
      const enhancedSystemPrompt = `You are an expert ${selectedTemplate.category} creator specializing in the ${detectedSector} sector.

Template Information:
- Name: ${selectedTemplate.name}
- Category: ${selectedTemplate.category}
- Sector: ${detectedSector}
- Description: ${selectedTemplate.description}

Template Structure:
${templateStructure}

${basePrompt}

IMPORTANT: 
1. Follow the exact template structure provided above
2. Generate content that fits the template fields/sections
3. Make it specific to the ${detectedSector} industry when possible
4. Return ONLY valid JSON that matches the template structure
5. Fill all template fields with relevant, professional content
6. Use the user's prompt to customize the content appropriately`;
      const enhancedUserPrompt = `User Request: ${prompt}

Please generate content for a ${selectedTemplate.category} using the template structure provided. 
Make sure to:
- Address the user's specific request
- Use the template's predefined structure
- Include all required fields from the template
- Make it relevant to the ${detectedSector} sector
- Return valid JSON only`;
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          { role: "user", content: enhancedUserPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 3e3
      });
      const generatedContent = JSON.parse(completion.choices[0].message.content || "{}");
      let documentTemplateId = selectedTemplate.id;
      if (selectedTemplate.id && selectedTemplate.id.startsWith("backend-")) {
        documentTemplateId = "f49f5ff5-0ba4-48cb-aad3-f6e10b8f275e";
      }
      const finalContent = {
        ...generatedContent,
        templateInfo: {
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          templateCategory: selectedTemplate.category,
          templateSector: detectedSector
        }
      };
      let document = null;
      if (userId && user) {
        console.log(`\u{1F4BE} Creating document with template ID: ${documentTemplateId} (original: ${selectedTemplate.id})`);
        document = await storage.createDocument({
          userId: user.id,
          templateId: documentTemplateId,
          title: generatedContent.title || `${selectedTemplate.name} - ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`,
          content: finalContent,
          originalPrompt: prompt,
          serviceType: selectedTemplate.category,
          thumbnailUrl: selectedTemplate.previewImageUrl || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=300&h=200&fit=crop`,
          detectedSector,
          status: "completed"
        });
        if (!selectedTemplate.id.startsWith("backend-")) {
          await storage.incrementTemplateUsage(selectedTemplate.id);
        }
        await storage.updateUserUsage(user.id, 1);
        return res.json(document);
      }
      return res.json({
        title: generatedContent.title || `Generated ${selectedTemplate.category}`,
        content: finalContent,
        templateInfo: {
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          templateCategory: selectedTemplate.category,
          templateSector: detectedSector
        },
        originalPrompt: prompt,
        serviceType: selectedTemplate.category,
        detectedSector,
        id: `guest-${Date.now()}`,
        isGuest: true,
        message: "Sign up to save and access your designs anytime!"
      });
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({
        message: error.message || "Failed to generate content",
        isGuest: !req.session?.userId
      });
    }
  });
  app2.get("/api/chat-sessions", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const sessions2 = await storage.getChatSessions(userId);
      res.json(sessions2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });
  app2.post("/api/chat-sessions", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const validatedData = insertChatSessionSchema.parse({
        ...req.body,
        userId
      });
      const session3 = await storage.createChatSession(validatedData);
      res.json(session3);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });
  app2.post("/api/chat-sessions/:sessionId/messages", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const validatedData = insertChatMessageSchema.parse({
        ...req.body,
        chatSessionId: req.params.sessionId
      });
      const message = await storage.createChatMessage(validatedData);
      res.json(message);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  app2.get("/api/chat-sessions/:sessionId/messages", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const messages = await storage.getChatMessages(req.params.sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  const httpServer = createServer(app2);
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
import session2 from "express-session";
import connectPg from "connect-pg-simple";
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
var sessionTtl = 7 * 24 * 60 * 60 * 1e3;
var pgStore = connectPg(session2);
var sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true,
  ttl: sessionTtl,
  tableName: "sessions"
});
app.use(session2({
  secret: process.env.SESSION_SECRET || "fallback-secret-for-dev",
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    // Set to true in production with HTTPS
    maxAge: sessionTtl
  }
}));
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
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
