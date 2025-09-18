import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
  integer,
  boolean,
  varchar,
  decimal,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Organizations table for multi-tenancy (each advisory firm)
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // URL-friendly identifier
  domain: text("domain"), // Custom domain if any
  logo: text("logo"), // Logo URL
  address: jsonb("address"), // {street, city, postcode, country}
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  regulatoryLicense: text("regulatory_license"), // FCA number, etc.
  settings: jsonb("settings").default({}), // Org-specific settings
  plan: text("plan").default("starter"), // pricing plan
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users table with RBAC and multi-tenancy
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  password: text("password"), // Hashed password
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("adviser"), // admin, adviser, paraplanner
  profileImageUrl: text("profile_image_url"),
  phone: text("phone"),
  title: text("title"), // Job title
  department: text("department"),
  permissions: jsonb("permissions").default([]), // Granular permissions array
  isActive: boolean("is_active").default(true),
  emailVerified: boolean("email_verified").default(false),
  lastLoginAt: timestamp("last_login_at"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// JWT refresh tokens for secure auth
export const refreshTokens = pgTable("refresh_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Clients table (customers of the advisory firm)
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  adviserId: varchar("adviser_id").references(() => users.id), // Primary adviser
  clientNumber: text("client_number").notNull(), // Unique within org
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth"),
  nationality: text("nationality"),
  address: jsonb("address"), // {street, city, postcode, country}
  maritalStatus: text("marital_status"), // single, married, divorced, widowed
  employmentStatus: text("employment_status"), // employed, self-employed, retired, unemployed
  employer: text("employer"),
  jobTitle: text("job_title"),
  annualIncome: decimal("annual_income", { precision: 12, scale: 2 }),
  netWorth: decimal("net_worth", { precision: 12, scale: 2 }),
  riskTolerance: text("risk_tolerance").default("moderate"), // conservative, moderate, aggressive
  investmentExperience: text("investment_experience"), // none, basic, experienced, expert
  objectives: jsonb("objectives").default([]), // Array of financial objectives
  dependents: jsonb("dependents").default([]), // Array of dependent information
  status: text("status").default("prospect"), // prospect, active, inactive, former
  source: text("source"), // How they found us
  notes: text("notes"),
  lastReviewDate: timestamp("last_review_date"),
  nextReviewDate: timestamp("next_review_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Client households for joint financial planning
export const households = pgTable("households", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  primaryClientId: varchar("primary_client_id").references(() => clients.id),
  jointIncome: decimal("joint_income", { precision: 12, scale: 2 }),
  jointNetWorth: decimal("joint_net_worth", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Link clients to households (many-to-many)
export const householdMembers = pgTable("household_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  householdId: varchar("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  relationship: text("relationship").notNull(), // primary, spouse, child, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Financial goals for clients
export const financialGoals = pgTable("financial_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default("0"),
  targetDate: timestamp("target_date").notNull(),
  priority: text("priority").default("medium"), // high, medium, low
  status: text("status").default("active"), // active, achieved, paused, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Portfolios for investment management
export const portfolios = pgTable("portfolios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  accountType: text("account_type").notNull(), // ISA, SIPP, General Investment, etc.
  provider: text("provider"), // Platform provider
  accountNumber: text("account_number"),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).default("0"),
  currency: text("currency").default("GBP"),
  modelPortfolio: text("model_portfolio"), // Reference to model portfolio if using one
  assetAllocation: jsonb("asset_allocation").default({}), // {equities: 60, bonds: 30, cash: 10}
  benchmarkIndex: text("benchmark_index"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Holdings within portfolios
export const holdings = pgTable("holdings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  portfolioId: varchar("portfolio_id").notNull().references(() => portfolios.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(), // Ticker or ISIN
  name: text("name").notNull(),
  assetClass: text("asset_class").notNull(), // equity, bond, cash, property, commodity, alternative
  sector: text("sector"),
  region: text("region"),
  quantity: decimal("quantity", { precision: 15, scale: 6 }).notNull(),
  averageCost: decimal("average_cost", { precision: 10, scale: 4 }),
  currentPrice: decimal("current_price", { precision: 10, scale: 4 }).notNull(),
  marketValue: decimal("market_value", { precision: 12, scale: 2 }).notNull(),
  unrealizedGainLoss: decimal("unrealized_gain_loss", { precision: 12, scale: 2 }),
  weight: decimal("weight", { precision: 5, scale: 2 }), // Percentage of portfolio
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Portfolio transactions
export const portfolioTransactions = pgTable("portfolio_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  portfolioId: varchar("portfolio_id").notNull().references(() => portfolios.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // buy, sell, dividend, interest, fee, deposit, withdrawal
  symbol: text("symbol"), // For trades
  quantity: decimal("quantity", { precision: 15, scale: 6 }),
  price: decimal("price", { precision: 10, scale: 4 }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  fees: decimal("fees", { precision: 10, scale: 2 }).default("0"),
  netAmount: decimal("net_amount", { precision: 12, scale: 2 }).notNull(),
  tradeDate: timestamp("trade_date").notNull(),
  settlementDate: timestamp("settlement_date"),
  description: text("description"),
  reference: text("reference"), // External reference
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Scenario modeling for financial planning
export const scenarios = pgTable("scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // retirement, education, house_purchase, etc.
  currentAge: integer("current_age").notNull(),
  targetAge: integer("target_age").notNull(),
  currentSavings: decimal("current_savings", { precision: 12, scale: 2 }).default("0"),
  monthlyContribution: decimal("monthly_contribution", { precision: 10, scale: 2 }).notNull(),
  expectedReturn: decimal("expected_return", { precision: 5, scale: 2 }).notNull(),
  inflationRate: decimal("inflation_rate", { precision: 5, scale: 2 }).default("2.5"),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }),
  projectedValue: decimal("projected_value", { precision: 12, scale: 2 }),
  projectedIncome: decimal("projected_income", { precision: 10, scale: 2 }),
  assumptions: jsonb("assumptions").default({}), // Additional modeling assumptions
  results: jsonb("results").default({}), // Detailed scenario results
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Compliance and regulatory tasks
export const complianceTasks = pgTable("compliance_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  clientId: varchar("client_id").references(() => clients.id, { onDelete: "cascade" }),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  type: text("type").notNull(), // kyc, suitability, annual_review, fact_find, risk_assessment
  category: text("category").notNull(), // compliance, client_service, regulatory
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").default("medium"), // high, medium, low
  status: text("status").default("pending"), // pending, in_progress, completed, overdue, cancelled
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  completedBy: varchar("completed_by").references(() => users.id),
  notes: text("notes"),
  attachments: jsonb("attachments").default([]), // File references
  recurrenceRule: text("recurrence_rule"), // For recurring tasks
  parentTaskId: varchar("parent_task_id"), // Self-reference for task hierarchy
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Client meetings and appointments
export const meetings = pgTable("meetings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  adviserId: varchar("adviser_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // initial_consultation, annual_review, ad_hoc, phone_call
  location: text("location"), // Office, client home, video call, phone
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(60), // Minutes
  status: text("status").default("scheduled"), // scheduled, completed, cancelled, no_show
  attendees: jsonb("attendees").default([]), // Additional attendees
  agenda: jsonb("agenda").default([]), // Meeting agenda items
  notes: text("notes"),
  actionItems: jsonb("action_items").default([]), // Follow-up actions
  nextMeetingDate: timestamp("next_meeting_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Client documents and file storage
export const clientDocuments = pgTable("client_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  originalFileName: text("original_file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  filePath: text("file_path").notNull(), // Storage path
  category: text("category").notNull(), // kyc, suitability, statements, correspondence
  documentType: text("document_type"), // passport, driving_license, utility_bill, etc.
  description: text("description"),
  tags: text("tags").array().default([]),
  isConfidential: boolean("is_confidential").default(true),
  retentionDate: timestamp("retention_date"), // When to delete for GDPR
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Report templates and generation
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  clientId: varchar("client_id").references(() => clients.id, { onDelete: "cascade" }),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  type: text("type").notNull(), // suitability, portfolio_review, financial_plan, compliance
  title: text("title").notNull(),
  description: text("description"),
  templateId: text("template_id"), // Reference to report template
  data: jsonb("data").notNull(), // Report data and content
  settings: jsonb("settings").default({}), // Report formatting options
  status: text("status").default("draft"), // draft, generated, sent, archived
  filePath: text("file_path"), // Generated report file
  sentAt: timestamp("sent_at"),
  sentTo: jsonb("sent_to").default([]), // Recipients
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Client pipeline stages for practice management
export const clientPipelineStages = pgTable("client_pipeline_stages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Data Collection, Modelling, Report, Compliance
  description: text("description"),
  position: integer("position").notNull(), // Order of stages
  color: text("color").default("#3B82F6"), // Color for UI
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Client pipeline tracking
export const clientPipeline = pgTable("client_pipeline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  stageId: varchar("stage_id").notNull().references(() => clientPipelineStages.id),
  enteredAt: timestamp("entered_at").defaultNow().notNull(),
  expectedCompletionDate: timestamp("expected_completion_date"),
  notes: text("notes"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  completionPercentage: integer("completion_percentage").default(0), // 0-100
  priority: text("priority").default("medium"), // high, medium, low
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// KPI tracking for dashboard analytics
export const kpiMetrics = pgTable("kpi_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  metricType: text("metric_type").notNull(), // total_clients, aum, performance, pipeline_value, etc.
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  previousValue: decimal("previous_value", { precision: 15, scale: 2 }),
  changePercentage: decimal("change_percentage", { precision: 5, scale: 2 }),
  period: text("period").notNull(), // daily, weekly, monthly, quarterly
  recordDate: timestamp("record_date").notNull(),
  metadata: jsonb("metadata").default({}), // Additional context
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Enhanced notifications with more context
export const enhancedNotifications = pgTable("enhanced_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // task_due, review_reminder, system_update, pipeline_update
  category: text("category").notNull(), // urgent, important, info, success
  priority: text("priority").default("medium"), // high, medium, low
  relatedResourceType: text("related_resource_type"), // client, task, portfolio
  relatedResourceId: varchar("related_resource_id"),
  actionUrl: text("action_url"),
  actionLabel: text("action_label"),
  isRead: boolean("is_read").default(false),
  isPinned: boolean("is_pinned").default(false),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

// System audit log
export const auditLog = pgTable("audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(), // create, update, delete, login, etc.
  resourceType: text("resource_type").notNull(), // client, portfolio, user, etc.
  resourceId: varchar("resource_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relationships
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  clients: many(clients),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  refreshTokens: many(refreshTokens),
  clients: many(clients, { relationName: "adviser" }),
  createdTasks: many(complianceTasks, { relationName: "creator" }),
  assignedTasks: many(complianceTasks, { relationName: "assignee" }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [clients.organizationId],
    references: [organizations.id],
  }),
  adviser: one(users, {
    fields: [clients.adviserId],
    references: [users.id],
  }),
  portfolios: many(portfolios),
  financialGoals: many(financialGoals),
  scenarios: many(scenarios),
  meetings: many(meetings),
  documents: many(clientDocuments),
  householdMemberships: many(householdMembers),
}));

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  client: one(clients, {
    fields: [portfolios.clientId],
    references: [clients.id],
  }),
  holdings: many(holdings),
  transactions: many(transactions),
}));

// Insert schemas for form validation
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHoldingSchema = createInsertSchema(holdings).omit({
  id: true,
  createdAt: true,
});

export const insertPortfolioTransactionSchema = createInsertSchema(portfolioTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertFinancialGoalSchema = createInsertSchema(financialGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertComplianceTaskSchema = createInsertSchema(complianceTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientPipelineStageSchema = createInsertSchema(clientPipelineStages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientPipelineSchema = createInsertSchema(clientPipeline).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKpiMetricSchema = createInsertSchema(kpiMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertEnhancedNotificationSchema = createInsertSchema(enhancedNotifications).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

// Type definitions
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type SelectOrganization = typeof organizations.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = typeof users.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type SelectClient = typeof clients.$inferSelect;

export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type SelectPortfolio = typeof portfolios.$inferSelect;

export type InsertHolding = z.infer<typeof insertHoldingSchema>;
export type SelectHolding = typeof holdings.$inferSelect;

export type InsertPortfolioTransaction = z.infer<typeof insertPortfolioTransactionSchema>;
export type SelectPortfolioTransaction = typeof portfolioTransactions.$inferSelect;

export type InsertFinancialGoal = z.infer<typeof insertFinancialGoalSchema>;
export type SelectFinancialGoal = typeof financialGoals.$inferSelect;

export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type SelectScenario = typeof scenarios.$inferSelect;

export type InsertComplianceTask = z.infer<typeof insertComplianceTaskSchema>;
export type SelectComplianceTask = typeof complianceTasks.$inferSelect;

export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type SelectMeeting = typeof meetings.$inferSelect;

export type InsertClientPipelineStage = z.infer<typeof insertClientPipelineStageSchema>;
export type SelectClientPipelineStage = typeof clientPipelineStages.$inferSelect;

export type InsertClientPipeline = z.infer<typeof insertClientPipelineSchema>;
export type SelectClientPipeline = typeof clientPipeline.$inferSelect;

export type InsertKpiMetric = z.infer<typeof insertKpiMetricSchema>;
export type SelectKpiMetric = typeof kpiMetrics.$inferSelect;

export type InsertEnhancedNotification = z.infer<typeof insertEnhancedNotificationSchema>;
export type SelectEnhancedNotification = typeof enhancedNotifications.$inferSelect;

// Legacy tables for compatibility (keeping existing system working)
export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => chatSessions.id),
  message: text("message").notNull(),
  isFromSupport: boolean("is_from_support").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("GBP"),
  monthlyDesignLimit: integer("monthly_design_limit").notNull(),
  features: jsonb("features").notNull(),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  planId: varchar("plan_id").references(() => subscriptionPlans.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("GBP"),
  status: text("status").notNull(),
  paymentMethod: text("payment_method"),
  paymentId: text("payment_id"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usageAnalytics = pgTable("usage_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  resourceType: text("resource_type"),
  resourceId: varchar("resource_id"),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  category: text("category"),
  isRead: boolean("is_read").default(false),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export const customRequests = pgTable("custom_requests", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  serviceType: text("service_type").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  previewImageUrl: text("preview_image_url").notNull(),
  templateData: jsonb("template_data").notNull(),
  isPublic: boolean("is_public").default(true),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sector: text("sector"),
  aiPromptTemplate: text("ai_prompt_template"),
  isPremium: boolean("is_premium").default(false),
  usageCount: integer("usage_count").default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  htmlTemplate: text("html_template"),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  templateId: varchar("template_id").notNull().references(() => templates.id),
  title: text("title").notNull(),
  content: jsonb("content").notNull(),
  serviceType: text("service_type").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  status: text("status").default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  detectedSector: text("detected_sector"),
  isPublic: boolean("is_public").default(false),
  shareToken: text("share_token"),
  downloadCount: integer("download_count").default(0),
  viewCount: integer("view_count").default(0),
  pageCount: integer("page_count").default(1),
  originalPrompt: text("original_prompt").notNull(),
  htmlContent: jsonb("html_content"),
  pdfPath: text("pdf_path"),
});

export const documentRewrites = pgTable("document_rewrites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  originalText: text("original_text").notNull(),
  rewrittenText: text("rewritten_text").notNull(),
  style: text("style").notNull(),
  language: text("language").default("english"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentTranslations = pgTable("document_translations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  originalText: text("original_text"),
  translatedText: text("translated_text").notNull(),
  sourceLanguage: text("source_language").default("english"),
  targetLanguage: text("target_language").notNull(),
  fileName: text("file_name"),
  fileType: text("file_type"),
  isFileTranslation: boolean("is_file_translation").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Legacy insert schemas
export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertUsageAnalyticsSchema = createInsertSchema(usageAnalytics).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

export const insertCustomRequestSchema = createInsertSchema(customRequests).omit({
  id: true,
  createdAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentRewriteSchema = createInsertSchema(documentRewrites).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentTranslationSchema = createInsertSchema(documentTranslations).omit({
  id: true,
  createdAt: true,
});

// Legacy types
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type SelectChatSession = typeof chatSessions.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type SelectChatMessage = typeof chatMessages.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SelectSubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type SelectTransaction = typeof transactions.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

export type InsertUsageAnalytics = z.infer<typeof insertUsageAnalyticsSchema>;
export type SelectUsageAnalytics = typeof usageAnalytics.$inferSelect;
export type UsageAnalytics = typeof usageAnalytics.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type SelectNotification = typeof notifications.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export type InsertCustomRequest = z.infer<typeof insertCustomRequestSchema>;
export type SelectCustomRequest = typeof customRequests.$inferSelect;
export type CustomRequest = typeof customRequests.$inferSelect;

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type SelectTemplate = typeof templates.$inferSelect;
export type Template = typeof templates.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type SelectDocument = typeof documents.$inferSelect;
export type Document = typeof documents.$inferSelect;

export type InsertDocumentRewrite = z.infer<typeof insertDocumentRewriteSchema>;
export type SelectDocumentRewrite = typeof documentRewrites.$inferSelect;
export type DocumentRewrite = typeof documentRewrites.$inferSelect;

export type InsertDocumentTranslation = z.infer<typeof insertDocumentTranslationSchema>;
export type SelectDocumentTranslation = typeof documentTranslations.$inferSelect;
export type DocumentTranslation = typeof documentTranslations.$inferSelect;

// Additional legacy types for compatibility
export type User = typeof users.$inferSelect;
export type UpsertUser = Partial<InsertUser> & { id: string };

// User roles for RBAC
export type UserRole = "admin" | "adviser" | "paraplanner";

// Permission system
export const PERMISSIONS = {
  // Client management
  CLIENTS_VIEW: "clients:view",
  CLIENTS_CREATE: "clients:create",
  CLIENTS_EDIT: "clients:edit",
  CLIENTS_DELETE: "clients:delete",
  
  // Portfolio management
  PORTFOLIOS_VIEW: "portfolios:view",
  PORTFOLIOS_CREATE: "portfolios:create",
  PORTFOLIOS_EDIT: "portfolios:edit",
  PORTFOLIOS_DELETE: "portfolios:delete",
  PORTFOLIOS_TRADE: "portfolios:trade",
  
  // Financial planning
  PLANNING_VIEW: "planning:view",
  PLANNING_CREATE: "planning:create",
  PLANNING_EDIT: "planning:edit",
  
  // Reports
  REPORTS_VIEW: "reports:view",
  REPORTS_CREATE: "reports:create",
  REPORTS_SEND: "reports:send",
  
  // Compliance
  COMPLIANCE_VIEW: "compliance:view",
  COMPLIANCE_MANAGE: "compliance:manage",
  
  // Organization admin
  ORG_SETTINGS: "org:settings",
  ORG_USERS: "org:users",
  ORG_BILLING: "org:billing",
} as const;

// Default permissions by role
export const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_EDIT,
    PERMISSIONS.CLIENTS_DELETE,
    PERMISSIONS.PORTFOLIOS_VIEW,
    PERMISSIONS.PORTFOLIOS_CREATE,
    PERMISSIONS.PORTFOLIOS_EDIT,
    PERMISSIONS.PORTFOLIOS_DELETE,
    PERMISSIONS.PORTFOLIOS_TRADE,
    PERMISSIONS.PLANNING_VIEW,
    PERMISSIONS.PLANNING_CREATE,
    PERMISSIONS.PLANNING_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.REPORTS_SEND,
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.COMPLIANCE_MANAGE,
    PERMISSIONS.ORG_SETTINGS,
    PERMISSIONS.ORG_USERS,
    PERMISSIONS.ORG_BILLING,
  ],
  adviser: [
    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_EDIT,
    PERMISSIONS.PORTFOLIOS_VIEW,
    PERMISSIONS.PORTFOLIOS_CREATE,
    PERMISSIONS.PORTFOLIOS_EDIT,
    PERMISSIONS.PORTFOLIOS_TRADE,
    PERMISSIONS.PLANNING_VIEW,
    PERMISSIONS.PLANNING_CREATE,
    PERMISSIONS.PLANNING_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.REPORTS_SEND,
    PERMISSIONS.COMPLIANCE_VIEW,
  ],
  paraplanner: [
    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.PORTFOLIOS_VIEW,
    PERMISSIONS.PLANNING_VIEW,
    PERMISSIONS.PLANNING_CREATE,
    PERMISSIONS.PLANNING_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.COMPLIANCE_VIEW,
  ],
} as const;