import { 
  type User, type InsertUser, type UpsertUser,
  type Template, type InsertTemplate,
  type Document, type InsertDocument,
  type ChatSession, type InsertChatSession,
  type ChatMessage, type InsertChatMessage,
  type SubscriptionPlan, type InsertSubscriptionPlan,
  type Transaction, type InsertTransaction,
  type UsageAnalytics, type InsertUsageAnalytics,
  type Notification, type InsertNotification,
  type CustomRequest, type InsertCustomRequest,
  type DocumentRewrite, type InsertDocumentRewrite,
  type DocumentTranslation, type InsertDocumentTranslation
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserUsage(id: string, increment: number): Promise<User | undefined>;
  resetMonthlyUsage(id: string): Promise<User | undefined>;
  updateStripeCustomerId(id: string, customerId: string): Promise<User | undefined>;
  updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User | undefined>;
  updateUserSessionId(id: string, sessionId: string): Promise<User | undefined>;
  clearUserSession(id: string): Promise<User | undefined>;
  
  // Admin functions
  getAllUsers(): Promise<User[]>;
  getPendingUsers(): Promise<User[]>;
  approveUser(userId: string, approvedBy: string): Promise<User | undefined>;
  rejectUser(userId: string): Promise<boolean>;

  // Subscription Plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(slug: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;

  // Transactions
  getUserTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: string, status: string): Promise<Transaction | undefined>;

  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  getTemplatesBySector(sector: string): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  getTemplateCategories(): Promise<string[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  incrementTemplateUsage(id: string): Promise<void>;

  // Documents
  getDocuments(userId?: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  getPublicDocuments(): Promise<Document[]>;

  // Chat
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getUserChatSessions(userId: string): Promise<ChatSession[]>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  closeChatSession(id: string): Promise<ChatSession | undefined>;

  // Analytics
  trackUsage(analytics: InsertUsageAnalytics): Promise<UsageAnalytics>;
  getUserAnalytics(userId: string, days?: number): Promise<UsageAnalytics[]>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;

  // Custom Requests
  createCustomRequest(request: InsertCustomRequest): Promise<CustomRequest>;

  // Document Rewrites
  createDocumentRewrite(rewrite: InsertDocumentRewrite): Promise<DocumentRewrite>;
  getDocumentRewrites(documentId: string): Promise<DocumentRewrite[]>;

  // Document Translations
  createDocumentTranslation(translation: InsertDocumentTranslation): Promise<DocumentTranslation>;
  getDocumentTranslations(documentId: string): Promise<DocumentTranslation[]>;

  // Dashboard Stats
  getDashboardStats(userId: string): Promise<{
    totalDocuments: number;
    documentsThisMonth: number;
    totalDownloads: number;
    downloadsThisMonth: number;
    monthlyUsage: number;
    planLimit: number;
    currentPlan: string;
    planExpiry: string | null;
  }>;

  // Database Template Retrieval (from Replit storage)
  getDatabaseTemplates(): Promise<{ name: string; text: string }[]>;
  getDatabaseTemplatesByCategory(category: string): Promise<{ name: string; text: string }[]>;
  
  // Stripe methods
  updateStripeCustomerId(userId: string, customerId: string): Promise<User | undefined>;
  updateUserStripeInfo(userId: string, stripeInfo: { customerId: string; subscriptionId: string }): Promise<User | undefined>;
  updateUserSubscription(userId: string, subscription: { 
    planId: string; 
    isAnnual: boolean; 
    stripeCustomerId: string; 
    stripeSubscriptionId: string; 
    status: string; 
  }): Promise<User | undefined>;
  
  // Template categories
  getTemplateCategories(): Promise<string[]>;
  getTemplateByCategory(category: string): Promise<Template | undefined>;
}

// Database Storage Implementation
import { db } from "./db";
import { 
  users, 
  templates, 
  documents, 
  chatSessions, 
  chatMessages,
  subscriptionPlans,
  transactions,
  usageAnalytics,
  notifications,
  customRequests,
  documentRewrites,
  documentTranslations
} from "@shared/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!username) return undefined;
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        planStartDate: now,
        usageResetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1), // First day of next month
        updatedAt: now
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserUsage(id: string, increment: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        monthlyUsage: sql`${users.monthlyUsage} + ${increment}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async resetMonthlyUsage(id: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        monthlyUsage: 0,
        usageResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateStripeCustomerId(id: string, customerId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Session management for single-device login
  async updateUserSessionId(userId: string, sessionId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ currentSessionId: sessionId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async clearUserSession(userId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ currentSessionId: null, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Admin functions
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getPendingUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isApproved, false)).orderBy(desc(users.createdAt));
  }

  async approveUser(userId: string, approvedBy: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        isApproved: true,
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async rejectUser(userId: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ 
        isApproved: false,
        approvedBy: null,
        approvedAt: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return result.length > 0;
  }

  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true)).orderBy(subscriptionPlans.sortOrder);
  }

  async getSubscriptionPlan(slug: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.slug, slug));
    return plan;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db.insert(subscriptionPlans).values(plan).returning();
    return newPlan;
  }

  // Transactions
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransactionStatus(id: string, status: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  // Templates
  async getTemplates(): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.isPublic, true))
      .orderBy(desc(templates.usageCount));
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(and(eq(templates.category, category), eq(templates.isPublic, true)))
      .orderBy(desc(templates.usageCount));
  }

  async getTemplatesBySector(sector: string): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(and(eq(templates.sector, sector), eq(templates.isPublic, true)))
      .orderBy(desc(templates.usageCount));
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async getTemplateCategories(): Promise<string[]> {
    const results = await db
      .selectDistinct({ category: templates.category })
      .from(templates)
      .where(eq(templates.isPublic, true));
    return results.map(r => r.category);
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db.insert(templates).values(template).returning();
    return newTemplate;
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    await db
      .update(templates)
      .set({ 
        usageCount: sql`${templates.usageCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(templates.id, id));
  }

  // Documents
  async getDocuments(userId?: string): Promise<Document[]> {
    if (userId) {
      return await db
        .select()
        .from(documents)
        .where(eq(documents.userId, userId))
        .orderBy(desc(documents.updatedAt));
    }
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    
    // Track usage analytics
    if (document.userId) {
      await this.trackUsage({
        userId: document.userId,
        action: 'document_created',
        resourceType: 'document',
        resourceId: newDocument.id,
        metadata: { serviceType: document.serviceType, sector: document.detectedSector }
      });
    }

    return newDocument;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return document;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return (result as any).rowCount > 0;
  }

  async getPublicDocuments(): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.isPublic, true))
      .orderBy(desc(documents.viewCount));
  }

  // Chat
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [newSession] = await db.insert(chatSessions).values(session).returning();
    return newSession;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session;
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.createdAt));
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async closeChatSession(id: string): Promise<ChatSession | undefined> {
    const [session] = await db
      .update(chatSessions)
      .set({ 
        status: 'closed',
        isActive: false,
        closedAt: new Date()
      })
      .where(eq(chatSessions.id, id))
      .returning();
    return session;
  }

  // Analytics
  async trackUsage(analytics: InsertUsageAnalytics): Promise<UsageAnalytics> {
    const [newAnalytics] = await db.insert(usageAnalytics).values(analytics).returning();
    return newAnalytics;
  }

  async getUserAnalytics(userId: string, days: number = 30): Promise<UsageAnalytics[]> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    return await db
      .select()
      .from(usageAnalytics)
      .where(and(
        eq(usageAnalytics.userId, userId),
        gte(usageAnalytics.createdAt, daysAgo)
      ))
      .orderBy(desc(usageAnalytics.createdAt));
  }

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  // Custom Requests
  async createCustomRequest(request: InsertCustomRequest): Promise<CustomRequest> {
    const [newRequest] = await db.insert(customRequests).values(request).returning();
    return newRequest;
  }

  // Database Template Retrieval (from existing templates table)
  async getDatabaseTemplates(): Promise<{ name: string; text: string }[]> {
    try {
      // Get all templates from the database that have AI prompt templates
      const allTemplates = await db.select({
        name: templates.name,
        text: templates.aiPromptTemplate
      }).from(templates).where(sql`${templates.aiPromptTemplate} IS NOT NULL AND ${templates.aiPromptTemplate} != ''`);
      
      return allTemplates.filter(t => t.text).map(t => ({
        name: t.name,
        text: t.text!
      }));
    } catch (error) {
      console.error("Error retrieving database templates:", error);
      return [];
    }
  }

  async getDatabaseTemplatesByCategory(category: string): Promise<{ name: string; text: string }[]> {
    try {
      // Map categories to template categories in database
      const categoryMap: {[key: string]: string} = {
        'marketing': 'pitch-deck',
        'resume': 'resume', 
        'business': 'report',
        'content': 'ebook',
        'email': 'newsletter'
      };
      
      const dbCategory = categoryMap[category] || category;
      
      // Get templates from database by category
      const categoryTemplates = await db.select({
        name: templates.name,
        text: templates.aiPromptTemplate
      }).from(templates).where(and(
        eq(templates.category, dbCategory),
        sql`${templates.aiPromptTemplate} IS NOT NULL AND ${templates.aiPromptTemplate} != ''`
      ));
      
      return categoryTemplates.filter(t => t.text).map(t => ({
        name: t.name,
        text: t.text!
      }));
    } catch (error) {
      console.error("Error retrieving database templates by category:", error);
      return [];
    }
  }

  // Stripe methods
  async updateStripeCustomerId(userId: string, customerId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeInfo: { customerId: string; subscriptionId: string }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: stripeInfo.customerId, 
        stripeSubscriptionId: stripeInfo.subscriptionId,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserSubscription(userId: string, subscription: { 
    planId: string; 
    isAnnual: boolean; 
    stripeCustomerId: string; 
    stripeSubscriptionId: string; 
    status: string; 
  }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        currentPlan: subscription.planId,
        stripeCustomerId: subscription.stripeCustomerId, 
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        planStartDate: new Date(),
        planEndDate: subscription.isAnnual ? 
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Template categories
  async getTemplateCategories(): Promise<string[]> {
    const result = await db.select({ category: templates.category }).from(templates).groupBy(templates.category);
    return result.map(r => r.category);
  }

  async getTemplateByCategory(category: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.category, category)).limit(1);
    return template;
  }

  // Document Rewrites
  async createDocumentRewrite(rewrite: InsertDocumentRewrite): Promise<DocumentRewrite> {
    const [documentRewrite] = await db
      .insert(documentRewrites)
      .values(rewrite)
      .returning();
    return documentRewrite;
  }

  async getDocumentRewrites(documentId: string): Promise<DocumentRewrite[]> {
    return await db
      .select()
      .from(documentRewrites)
      .where(eq(documentRewrites.documentId, documentId))
      .orderBy(desc(documentRewrites.createdAt));
  }

  // Document Translations
  async createDocumentTranslation(translation: InsertDocumentTranslation): Promise<DocumentTranslation> {
    const [documentTranslation] = await db
      .insert(documentTranslations)
      .values(translation)
      .returning();
    return documentTranslation;
  }

  async getDocumentTranslations(documentId: string): Promise<DocumentTranslation[]> {
    return await db
      .select()
      .from(documentTranslations)
      .where(eq(documentTranslations.documentId, documentId))
      .orderBy(desc(documentTranslations.createdAt));
  }

  // Dashboard Stats
  async getDashboardStats(userId: string): Promise<{
    totalDocuments: number;
    documentsThisMonth: number;
    totalDownloads: number;
    downloadsThisMonth: number;
    monthlyUsage: number;
    planLimit: number;
    currentPlan: string;
    planExpiry: string | null;
  }> {
    // Get user info
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get current date and first day of current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total documents
    const totalDocuments = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(eq(documents.userId, userId));

    // Get documents created this month
    const documentsThisMonth = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(and(
        eq(documents.userId, userId),
        gte(documents.createdAt, firstDayOfMonth)
      ));

    // Get total downloads (sum of all document download counts)
    const totalDownloadsResult = await db
      .select({ total: sql<number>`sum(${documents.downloadCount})` })
      .from(documents)
      .where(eq(documents.userId, userId));

    // Get downloads this month (sum of download counts for documents created this month)
    const downloadsThisMonthResult = await db
      .select({ total: sql<number>`sum(${documents.downloadCount})` })
      .from(documents)
      .where(and(
        eq(documents.userId, userId),
        gte(documents.createdAt, firstDayOfMonth)
      ));

    // Get plan limits based on current plan
    const planLimits: { [key: string]: number } = {
      'starter': 5,
      'pro': 50,
      'agency': 200
    };

    return {
      totalDocuments: totalDocuments[0]?.count || 0,
      documentsThisMonth: documentsThisMonth[0]?.count || 0,
      totalDownloads: totalDownloadsResult[0]?.total || 0,
      downloadsThisMonth: downloadsThisMonthResult[0]?.total || 0,
      monthlyUsage: user.monthlyUsage || 0,
      planLimit: planLimits[user.currentPlan || 'starter'] || 5,
      currentPlan: user.currentPlan || 'starter',
      planExpiry: user.planEndDate ? user.planEndDate.toISOString().split('T')[0] : null,
    };
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private templates: Map<string, Template>;
  private documents: Map<string, Document>;
  private chatSessions: Map<string, ChatSession>;
  private chatMessages: Map<string, ChatMessage>;
  private subscriptionPlans: Map<string, SubscriptionPlan>;
  private transactions: Map<string, Transaction>;
  private analytics: Map<string, UsageAnalytics>;
  private notifications: Map<string, Notification>;
  private customRequests: Map<string, CustomRequest>;


  constructor() {
    this.users = new Map();
    this.templates = new Map();
    this.documents = new Map();
    this.chatSessions = new Map();
    this.chatMessages = new Map();
    this.subscriptionPlans = new Map();
    this.transactions = new Map();
    this.analytics = new Map();
    this.notifications = new Map();
    this.customRequests = new Map();

    // Initialize with sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create sample templates
    await this.createTemplate({
      name: "Modern Pitch Deck",
      description: "Professional presentation template for startups and business proposals",
      category: "Pitch Deck",
      previewImageUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      templateData: {
        slides: [
          { type: "title", fields: ["company_name", "tagline", "presenter_name"] },
          { type: "problem", fields: ["problem_statement", "pain_points"] },
          { type: "solution", fields: ["solution_overview", "key_benefits"] },
          { type: "market", fields: ["market_size", "target_audience"] },
          { type: "business_model", fields: ["revenue_streams", "pricing"] },
          { type: "team", fields: ["founders", "key_team_members"] },
          { type: "financials", fields: ["revenue_projection", "funding_ask"] },
          { type: "contact", fields: ["email", "website", "social_media"] }
        ]
      },
      tags: ["business", "startup", "presentation", "professional"]
    });

    await this.createTemplate({
      name: "Creative Resume",
      description: "Modern CV template with customizable sections and design elements",
      category: "CV Maker",
      previewImageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      templateData: {
        sections: [
          { type: "header", fields: ["full_name", "job_title", "contact_info"] },
          { type: "summary", fields: ["professional_summary"] },
          { type: "experience", fields: ["work_history", "achievements"] },
          { type: "education", fields: ["degrees", "certifications"] },
          { type: "skills", fields: ["technical_skills", "soft_skills"] },
          { type: "projects", fields: ["portfolio_items"] }
        ]
      },
      tags: ["career", "professional", "design", "modern"]
    });

    await this.createTemplate({
      name: "Business Brochure",
      description: "Tri-fold brochure template for marketing and promotional materials",
      category: "Brochure",
      previewImageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      templateData: {
        panels: [
          { type: "front", fields: ["company_name", "main_headline", "hero_image"] },
          { type: "inside_left", fields: ["about_us", "company_story"] },
          { type: "inside_center", fields: ["services", "products"] },
          { type: "inside_right", fields: ["testimonials", "case_studies"] },
          { type: "back", fields: ["contact_info", "call_to_action"] }
        ]
      },
      tags: ["marketing", "business", "promotional", "print"]
    });

    await this.createTemplate({
      name: "Sales Report",
      description: "Professional report template with charts and data visualization",
      category: "Report Generator",
      previewImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      templateData: {
        sections: [
          { type: "cover", fields: ["report_title", "period", "company_logo"] },
          { type: "executive_summary", fields: ["key_findings", "recommendations"] },
          { type: "data_analysis", fields: ["metrics", "charts", "trends"] },
          { type: "conclusions", fields: ["insights", "next_steps"] }
        ]
      },
      tags: ["business", "analytics", "data", "professional"]
    });


  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      updatedAt: now,
      planStartDate: now,
      planEndDate: null,
      usageResetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      // Ensure all optional fields are null instead of undefined
      username: insertUser.username ?? null,
      password: insertUser.password ?? null,
      profileImageUrl: insertUser.profileImageUrl ?? null,
      provider: insertUser.provider ?? null,
      providerId: insertUser.providerId ?? null,
      currentPlan: insertUser.currentPlan ?? null,
      monthlyUsage: insertUser.monthlyUsage ?? null,
      isActive: insertUser.isActive ?? null,
      emailVerified: insertUser.emailVerified ?? null,
      lastLoginAt: insertUser.lastLoginAt ?? null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async updateUserUsage(id: string, increment: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const currentUsage = user.monthlyUsage || 0;
      const updatedUser = { 
        ...user, 
        monthlyUsage: currentUsage + increment 
      };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  // Templates
  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(
      template => template.category.toLowerCase() === category.toLowerCase()
    );
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const now = new Date();
    const template: Template = { 
      ...insertTemplate, 
      id, 
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      // Ensure all optional fields are null instead of undefined
      sector: insertTemplate.sector ?? null,
      aiPromptTemplate: insertTemplate.aiPromptTemplate ?? null,
      isPublic: insertTemplate.isPublic ?? null,
      isPremium: insertTemplate.isPremium ?? null,
      tags: insertTemplate.tags ?? null
    };
    this.templates.set(id, template);
    return template;
  }

  // Documents
  async getDocuments(userId?: string): Promise<Document[]> {
    const docs = Array.from(this.documents.values());
    return userId ? docs.filter(doc => doc.userId === userId) : docs;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const now = new Date();
    const document: Document = { 
      ...insertDocument, 
      id, 
      createdAt: now,
      updatedAt: now,
      downloadCount: 0,
      viewCount: 0,
      // Ensure all optional fields are null instead of undefined
      templateId: insertDocument.templateId ?? null,
      detectedSector: insertDocument.detectedSector ?? null,
      pageCount: insertDocument.pageCount ?? null,
      thumbnailUrl: insertDocument.thumbnailUrl ?? null,
      status: insertDocument.status ?? null,
      isPublic: insertDocument.isPublic ?? null,
      shareToken: insertDocument.shareToken ?? null
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (document) {
      const updatedDocument = { 
        ...document, 
        ...updates, 
        updatedAt: new Date() 
      };
      this.documents.set(id, updatedDocument);
      return updatedDocument;
    }
    return undefined;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Chat
  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = { 
      ...insertSession, 
      id, 
      createdAt: new Date(),
      closedAt: null,
      // Ensure all optional fields are null instead of undefined
      subject: insertSession.subject ?? null,
      status: insertSession.status ?? null,
      priority: insertSession.priority ?? null,
      assignedToSupportId: insertSession.assignedToSupportId ?? null,
      isActive: insertSession.isActive ?? null
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async addChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      createdAt: new Date(),
      attachments: insertMessage.attachments ?? null,
      // Ensure all optional fields are null instead of undefined
      isFromSupport: insertMessage.isFromSupport ?? null,
      supportUserId: insertMessage.supportUserId ?? null
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    if (existingUser) {
      const updatedUser = { ...existingUser, ...userData, updatedAt: new Date() };
      this.users.set(userData.id, updatedUser);
      return updatedUser;
    } else {
      const now = new Date();
      const user: User = { 
        ...userData, 
        createdAt: now,
        updatedAt: now,
        planStartDate: userData.planStartDate ?? now,
        planEndDate: userData.planEndDate ?? null,
        usageResetDate: userData.usageResetDate ?? new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
      this.users.set(userData.id, user);
      return user;
    }
  }

  async resetMonthlyUsage(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { 
        ...user, 
        monthlyUsage: 0,
        usageResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        updatedAt: new Date()
      };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values()).filter(plan => plan.isActive);
  }

  async getSubscriptionPlan(slug: string): Promise<SubscriptionPlan | undefined> {
    return Array.from(this.subscriptionPlans.values()).find(plan => plan.slug === slug);
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = randomUUID();
    const newPlan: SubscriptionPlan = { 
      ...plan, 
      id, 
      createdAt: new Date(),
      isActive: plan.isActive ?? null,
      sortOrder: plan.sortOrder ?? null
    };
    this.subscriptionPlans.set(id, newPlan);
    return newPlan;
  }

  // Transactions
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const newTransaction: Transaction = { 
      ...transaction, 
      id, 
      createdAt: new Date(),
      planId: transaction.planId ?? null,
      currency: transaction.currency ?? null,
      paymentMethod: transaction.paymentMethod ?? null,
      paymentId: transaction.paymentId ?? null,
      description: transaction.description ?? null
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async updateTransactionStatus(id: string, status: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      const updatedTransaction = { ...transaction, status };
      this.transactions.set(id, updatedTransaction);
      return updatedTransaction;
    }
    return undefined;
  }

  async getTemplatesBySector(sector: string): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(
      template => template.sector === sector && template.isPublic
    );
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    const template = this.templates.get(id);
    if (template) {
      const updatedTemplate = { 
        ...template, 
        usageCount: (template.usageCount || 0) + 1,
        updatedAt: new Date()
      };
      this.templates.set(id, updatedTemplate);
    }
  }

  async getPublicDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.isPublic)
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async closeChatSession(id: string): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (session) {
      const updatedSession = { 
        ...session, 
        isActive: false,
        status: "closed",
        closedAt: new Date() 
      };
      this.chatSessions.set(id, updatedSession);
      return updatedSession;
    }
    return undefined;
  }

  // Analytics
  async trackUsage(analytics: InsertUsageAnalytics): Promise<UsageAnalytics> {
    const id = randomUUID();
    const newAnalytics: UsageAnalytics = { 
      ...analytics, 
      id, 
      createdAt: new Date(),
      resourceType: analytics.resourceType ?? null,
      resourceId: analytics.resourceId ?? null,
      metadata: analytics.metadata ?? null,
      ipAddress: analytics.ipAddress ?? null,
      userAgent: analytics.userAgent ?? null
    };
    this.analytics.set(id, newAnalytics);
    return newAnalytics;
  }

  async getUserAnalytics(userId: string, days: number = 30): Promise<UsageAnalytics[]> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    return Array.from(this.analytics.values())
      .filter(analytics => 
        analytics.userId === userId && 
        analytics.createdAt >= daysAgo
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const newNotification: Notification = { 
      ...notification, 
      id, 
      createdAt: new Date(),
      category: notification.category ?? null,
      isRead: notification.isRead ?? null,
      actionUrl: notification.actionUrl ?? null,
      readAt: notification.readAt ?? null
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (notification) {
      const updatedNotification = { 
        ...notification, 
        isRead: true,
        readAt: new Date()
      };
      this.notifications.set(id, updatedNotification);
      return updatedNotification;
    }
    return undefined;
  }

  // Custom Requests
  async createCustomRequest(request: InsertCustomRequest): Promise<CustomRequest> {
    const id = randomUUID();
    const now = new Date();
    const customRequest: CustomRequest = { 
      ...request, 
      id, 
      createdAt: now,
      updatedAt: now,
      status: request.status ?? 'pending',
      category: request.category ?? null,
      timeline: request.timeline ?? null,
      requirements: request.requirements ?? null,
      attachments: request.attachments ?? null,
      adminNotes: request.adminNotes ?? null,
      assignedTo: request.assignedTo ?? null,
      completedAt: request.completedAt ?? null
    };
    this.customRequests.set(id, customRequest);
    return customRequest;
  }

  // Database Template Retrieval (from Replit storage)
  async getDatabaseTemplates(): Promise<{ name: string; text: string }[]> {
    // For MemStorage, simulate templates from environment or return sample data
    const templateData = process.env.TEMPLATES_DATA;
    if (templateData) {
      try {
        const templates = JSON.parse(templateData);
        return Array.isArray(templates) ? templates : [];
      } catch (error) {
        console.error("Error parsing templates data:", error);
      }
    }
    return [];
  }

  async getDatabaseTemplatesByCategory(category: string): Promise<{ name: string; text: string }[]> {
    const allTemplates = await this.getDatabaseTemplates();
    return allTemplates.filter(template => {
      const categoryTag = `#category:${category.toLowerCase()}`;
      return template.text.toLowerCase().includes(categoryTag);
    });
  }

  // Stripe methods
  async updateStripeCustomerId(userId: string, customerId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = { ...user, stripeCustomerId: customerId, updatedAt: new Date() };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async updateUserStripeInfo(userId: string, stripeInfo: { customerId: string; subscriptionId: string }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = { 
        ...user, 
        stripeCustomerId: stripeInfo.customerId, 
        stripeSubscriptionId: stripeInfo.subscriptionId,
        updatedAt: new Date() 
      };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  // Template categories
  async getTemplateCategories(): Promise<string[]> {
    const categories = new Set<string>();
    this.templates.forEach(template => categories.add(template.category));
    return Array.from(categories);
  }

  async getTemplateByCategory(category: string): Promise<Template | undefined> {
    return Array.from(this.templates.values()).find(template => template.category === category);
  }
}

// Use DatabaseStorage by default since we have a database provisioned
export const storage = new DatabaseStorage();
