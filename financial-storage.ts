import { 
  type SelectClient, type InsertClient, 
  type SelectPortfolio, type InsertPortfolio,
  type SelectHolding, type InsertHolding,
  type SelectComplianceTask, type InsertComplianceTask,
  type SelectMeeting, type InsertMeeting,
  type SelectScenario, type InsertScenario,
  type SelectClientPipelineStage, type InsertClientPipelineStage,
  type SelectClientPipeline, type InsertClientPipeline,
  type SelectKpiMetric, type InsertKpiMetric,
  type SelectEnhancedNotification, type InsertEnhancedNotification,
  type SelectUser,
  auditLog
} from "@shared/schema";

// Extended interfaces for financial features
interface AuditLogEntry {
  id: string;
  organizationId?: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

interface TaskChecklist {
  id: string;
  taskId: string;
  name: string;
  description: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  sortOrder: number;
}

interface ComplianceTaskWithChecklists extends SelectComplianceTask {
  checklists?: TaskChecklist[];
  assignedToUser?: Pick<SelectUser, 'id' | 'firstName' | 'lastName' | 'email'>;
  client?: Pick<SelectClient, 'id' | 'firstName' | 'lastName' | 'email'>;
}

interface TaskTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: number; // minutes
  checklists: {
    name: string;
    description: string;
    sortOrder: number;
  }[];
  isActive: boolean;
}

// Financial Storage Interface
export interface IFinancialStorage {
  // Clients
  getClients(organizationId: string): Promise<SelectClient[]>;
  getClient(id: string, organizationId: string): Promise<SelectClient | undefined>;
  createClient(client: InsertClient): Promise<SelectClient>;
  updateClient(id: string, organizationId: string, updates: Partial<SelectClient>): Promise<SelectClient | undefined>;
  deleteClient(id: string, organizationId: string): Promise<boolean>;

  // Portfolios
  getPortfolios(organizationId: string): Promise<SelectPortfolio[]>;
  getPortfoliosByClient(clientId: string, organizationId: string): Promise<SelectPortfolio[]>;
  getPortfolio(id: string, organizationId: string): Promise<SelectPortfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<SelectPortfolio>;
  updatePortfolio(id: string, organizationId: string, updates: Partial<SelectPortfolio>): Promise<SelectPortfolio | undefined>;

  // Holdings
  getHoldings(portfolioId: string, organizationId: string): Promise<SelectHolding[]>;
  createHolding(holding: InsertHolding): Promise<SelectHolding>;
  updateHolding(id: string, organizationId: string, updates: Partial<SelectHolding>): Promise<SelectHolding | undefined>;

  // Compliance Tasks
  getComplianceTasks(organizationId: string, filters?: {
    clientId?: string;
    assignedTo?: string;
    status?: string;
    type?: string;
    overdue?: boolean;
  }): Promise<ComplianceTaskWithChecklists[]>;
  getComplianceTask(id: string, organizationId: string): Promise<ComplianceTaskWithChecklists | undefined>;
  createComplianceTask(task: InsertComplianceTask): Promise<SelectComplianceTask>;
  updateComplianceTask(id: string, organizationId: string, updates: Partial<SelectComplianceTask>): Promise<SelectComplianceTask | undefined>;
  deleteComplianceTask(id: string, organizationId: string): Promise<boolean>;
  
  // Task Checklists
  getTaskChecklists(taskId: string): Promise<TaskChecklist[]>;
  updateTaskChecklist(taskId: string, checklistId: string, completed: boolean, completedBy?: string): Promise<TaskChecklist | undefined>;
  
  // Task Templates
  getTaskTemplates(): Promise<TaskTemplate[]>;
  getTaskTemplate(id: string): Promise<TaskTemplate | undefined>;
  createTaskFromTemplate(templateId: string, clientId: string, assignedTo: string, organizationId: string, dueDate?: string): Promise<SelectComplianceTask>;

  // Audit Logging
  logAction(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<AuditLogEntry>;
  getAuditLogs(organizationId: string, filters?: {
    userId?: string;
    resourceType?: string;
    resourceId?: string;
    action?: string;
    from?: Date;
    to?: Date;
  }): Promise<AuditLogEntry[]>;

  // Scenarios
  getScenarios(organizationId: string, clientId?: string): Promise<SelectScenario[]>;
  createScenario(scenario: InsertScenario): Promise<SelectScenario>;

  // Meetings
  getMeetings(organizationId: string, filters?: { clientId?: string; adviserId?: string }): Promise<SelectMeeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<SelectMeeting>;

  // Dashboard Statistics
  getDashboardStats(organizationId: string, userId?: string): Promise<{
    totalClients: number;
    totalAUM: number;
    avgPerformance: number;
    pendingTasks: number;
    overdueTasks: number;
    completedTasksThisMonth: number;
    recentActivity: any[];
  }>;

  // Workflow Automation
  createClientOnboardingTasks(clientId: string, organizationId: string, adviserId: string): Promise<SelectComplianceTask[]>;
  getOverdueTasks(organizationId: string): Promise<ComplianceTaskWithChecklists[]>;
  updateTaskStatus(taskId: string, organizationId: string, status: string, completedBy?: string): Promise<SelectComplianceTask | undefined>;

  // Pipeline Management
  getPipelineStages(organizationId: string): Promise<SelectClientPipelineStage[]>;
  createPipelineStage(stage: InsertClientPipelineStage): Promise<SelectClientPipelineStage>;
  updatePipelineStage(id: string, organizationId: string, updates: Partial<SelectClientPipelineStage>): Promise<SelectClientPipelineStage | undefined>;
  deletePipelineStage(id: string, organizationId: string): Promise<boolean>;
  
  getClientPipeline(organizationId: string, filters?: { clientId?: string; stageId?: string }): Promise<SelectClientPipeline[]>;
  updateClientPipelineStage(clientId: string, stageId: string, organizationId: string, updates?: Partial<SelectClientPipeline>): Promise<SelectClientPipeline | undefined>;
  
  // Notifications
  getNotifications(organizationId: string, userId?: string, filters?: {
    isRead?: boolean;
    type?: string;
    category?: string;
    limit?: number;
  }): Promise<SelectEnhancedNotification[]>;
  createNotification(notification: InsertEnhancedNotification): Promise<SelectEnhancedNotification>;
  markNotificationRead(id: string, userId: string, organizationId: string): Promise<SelectEnhancedNotification | undefined>;
  markAllNotificationsRead(userId: string, organizationId: string): Promise<boolean>;
  deleteNotification(id: string, userId: string, organizationId: string): Promise<boolean>;
  
  // KPI Metrics
  getKpiMetrics(organizationId: string, filters?: {
    metricType?: string;
    period?: string;
    from?: Date;
    to?: Date;
  }): Promise<SelectKpiMetric[]>;
  createKpiMetric(metric: InsertKpiMetric): Promise<SelectKpiMetric>;
  getKpiSummary(organizationId: string): Promise<{
    totalClients: { value: number; change: number };
    totalAUM: { value: number; change: number };
    averageReturn: { value: number; change: number };
    newClients: { value: number; change: number };
    activePortfolios: { value: number; change: number };
  }>;
  getKpiHistorical(organizationId: string, metricType: string, period: string, limit?: number): Promise<SelectKpiMetric[]>;
}

// Database Storage Implementation
import { db } from "./db";
import { 
  users, 
  clients, 
  portfolios, 
  holdings, 
  complianceTasks, 
  meetings, 
  scenarios,
  organizations,
  clientPipelineStages,
  clientPipeline,
  kpiMetrics,
  enhancedNotifications
} from "@shared/schema";
import { eq, desc, and, gte, lte, sql, or, inArray } from "drizzle-orm";

export class FinancialDatabaseStorage implements IFinancialStorage {
  // Helper method to log actions
  async logAction(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<AuditLogEntry> {
    const [logEntry] = await db
      .insert(auditLog)
      .values({
        ...entry,
        createdAt: new Date(),
      })
      .returning();
    
    return {
      id: logEntry.id,
      organizationId: logEntry.organizationId || undefined,
      userId: logEntry.userId || undefined,
      action: logEntry.action,
      resourceType: logEntry.resourceType,
      resourceId: logEntry.resourceId || undefined,
      oldValues: logEntry.oldValues,
      newValues: logEntry.newValues,
      ipAddress: logEntry.ipAddress || undefined,
      userAgent: logEntry.userAgent || undefined,
      createdAt: logEntry.createdAt,
    };
  }

  // Clients
  async getClients(organizationId: string): Promise<SelectClient[]> {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.organizationId, organizationId))
      .orderBy(desc(clients.createdAt));
  }

  async getClient(id: string, organizationId: string): Promise<SelectClient | undefined> {
    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.organizationId, organizationId)));
    return client;
  }

  async createClient(client: InsertClient): Promise<SelectClient> {
    const [newClient] = await db.insert(clients).values(client).returning();
    
    // Log the action
    await this.logAction({
      organizationId: client.organizationId,
      userId: client.adviserId || undefined,
      action: 'create',
      resourceType: 'client',
      resourceId: newClient.id,
      newValues: newClient,
    });

    // Auto-create onboarding tasks
    if (newClient.adviserId) {
      await this.createClientOnboardingTasks(newClient.id, client.organizationId, newClient.adviserId);
    }

    return newClient;
  }

  async updateClient(id: string, organizationId: string, updates: Partial<SelectClient>): Promise<SelectClient | undefined> {
    // Get old values for audit log
    const oldClient = await this.getClient(id, organizationId);
    if (!oldClient) return undefined;

    const [updatedClient] = await db
      .update(clients)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(clients.id, id), eq(clients.organizationId, organizationId)))
      .returning();

    if (updatedClient) {
      await this.logAction({
        organizationId,
        userId: updates.adviserId || oldClient.adviserId || undefined,
        action: 'update',
        resourceType: 'client',
        resourceId: id,
        oldValues: oldClient,
        newValues: updatedClient,
      });
    }

    return updatedClient;
  }

  async deleteClient(id: string, organizationId: string): Promise<boolean> {
    const client = await this.getClient(id, organizationId);
    if (!client) return false;

    const result = await db
      .update(clients)
      .set({ status: 'former' })  // Soft delete by changing status
      .where(and(eq(clients.id, id), eq(clients.organizationId, organizationId)));

    await this.logAction({
      organizationId,
      userId: client.adviserId || undefined,
      action: 'delete',
      resourceType: 'client',
      resourceId: id,
      oldValues: client,
    });

    return (result as any).rowCount > 0;
  }

  // Portfolios
  async getPortfolios(organizationId: string): Promise<SelectPortfolio[]> {
    return await db
      .select({
        id: portfolios.id,
        clientId: portfolios.clientId,
        name: portfolios.name,
        description: portfolios.description,
        accountType: portfolios.accountType,
        provider: portfolios.provider,
        accountNumber: portfolios.accountNumber,
        totalValue: portfolios.totalValue,
        currency: portfolios.currency,
        modelPortfolio: portfolios.modelPortfolio,
        assetAllocation: portfolios.assetAllocation,
        benchmarkIndex: portfolios.benchmarkIndex,
        isActive: portfolios.isActive,
        createdAt: portfolios.createdAt,
        updatedAt: portfolios.updatedAt,
      })
      .from(portfolios)
      .innerJoin(clients, eq(portfolios.clientId, clients.id))
      .where(eq(clients.organizationId, organizationId))
      .orderBy(desc(portfolios.updatedAt));
  }

  async getPortfoliosByClient(clientId: string, organizationId: string): Promise<SelectPortfolio[]> {
    return await db
      .select({
        id: portfolios.id,
        clientId: portfolios.clientId,
        name: portfolios.name,
        description: portfolios.description,
        accountType: portfolios.accountType,
        provider: portfolios.provider,
        accountNumber: portfolios.accountNumber,
        totalValue: portfolios.totalValue,
        currency: portfolios.currency,
        modelPortfolio: portfolios.modelPortfolio,
        assetAllocation: portfolios.assetAllocation,
        benchmarkIndex: portfolios.benchmarkIndex,
        isActive: portfolios.isActive,
        createdAt: portfolios.createdAt,
        updatedAt: portfolios.updatedAt,
      })
      .from(portfolios)
      .innerJoin(clients, eq(portfolios.clientId, clients.id))
      .where(and(
        eq(portfolios.clientId, clientId),
        eq(clients.organizationId, organizationId)
      ))
      .orderBy(desc(portfolios.updatedAt));
  }

  async getPortfolio(id: string, organizationId: string): Promise<SelectPortfolio | undefined> {
    const [portfolio] = await db
      .select({
        id: portfolios.id,
        clientId: portfolios.clientId,
        name: portfolios.name,
        description: portfolios.description,
        accountType: portfolios.accountType,
        provider: portfolios.provider,
        accountNumber: portfolios.accountNumber,
        totalValue: portfolios.totalValue,
        currency: portfolios.currency,
        modelPortfolio: portfolios.modelPortfolio,
        assetAllocation: portfolios.assetAllocation,
        benchmarkIndex: portfolios.benchmarkIndex,
        isActive: portfolios.isActive,
        createdAt: portfolios.createdAt,
        updatedAt: portfolios.updatedAt,
      })
      .from(portfolios)
      .innerJoin(clients, eq(portfolios.clientId, clients.id))
      .where(and(
        eq(portfolios.id, id),
        eq(clients.organizationId, organizationId)
      ));
    return portfolio;
  }

  async createPortfolio(portfolio: InsertPortfolio): Promise<SelectPortfolio> {
    const [newPortfolio] = await db.insert(portfolios).values(portfolio).returning();
    
    // Log the action
    const client = await db.select().from(clients).where(eq(clients.id, portfolio.clientId)).limit(1);
    await this.logAction({
      organizationId: client[0]?.organizationId,
      userId: client[0]?.adviserId || undefined,
      action: 'create',
      resourceType: 'portfolio',
      resourceId: newPortfolio.id,
      newValues: newPortfolio,
    });

    return newPortfolio;
  }

  async updatePortfolio(id: string, organizationId: string, updates: Partial<SelectPortfolio>): Promise<SelectPortfolio | undefined> {
    const oldPortfolio = await this.getPortfolio(id, organizationId);
    if (!oldPortfolio) return undefined;

    const [updatedPortfolio] = await db
      .update(portfolios)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(portfolios.id, id))
      .returning();

    if (updatedPortfolio) {
      const client = await db.select().from(clients).where(eq(clients.id, updatedPortfolio.clientId)).limit(1);
      await this.logAction({
        organizationId: client[0]?.organizationId,
        userId: client[0]?.adviserId || undefined,
        action: 'update',
        resourceType: 'portfolio',
        resourceId: id,
        oldValues: oldPortfolio,
        newValues: updatedPortfolio,
      });
    }

    return updatedPortfolio;
  }

  // Holdings
  async getHoldings(portfolioId: string, organizationId: string): Promise<SelectHolding[]> {
    return await db
      .select()
      .from(holdings)
      .innerJoin(portfolios, eq(holdings.portfolioId, portfolios.id))
      .innerJoin(clients, eq(portfolios.clientId, clients.id))
      .where(and(
        eq(holdings.portfolioId, portfolioId),
        eq(clients.organizationId, organizationId)
      ))
      .orderBy(desc(holdings.lastUpdated));
  }

  async createHolding(holding: InsertHolding): Promise<SelectHolding> {
    const [newHolding] = await db.insert(holdings).values(holding).returning();
    
    // Log the action
    const portfolio = await db.select().from(portfolios).where(eq(portfolios.id, holding.portfolioId)).limit(1);
    if (portfolio[0]) {
      const client = await db.select().from(clients).where(eq(clients.id, portfolio[0].clientId)).limit(1);
      await this.logAction({
        organizationId: client[0]?.organizationId,
        userId: client[0]?.adviserId || undefined,
        action: 'create',
        resourceType: 'holding',
        resourceId: newHolding.id,
        newValues: newHolding,
      });
    }

    return newHolding;
  }

  async updateHolding(id: string, organizationId: string, updates: Partial<SelectHolding>): Promise<SelectHolding | undefined> {
    const [oldHolding] = await db.select().from(holdings).where(eq(holdings.id, id));
    if (!oldHolding) return undefined;

    const [updatedHolding] = await db
      .update(holdings)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(holdings.id, id))
      .returning();

    if (updatedHolding) {
      const portfolio = await db.select().from(portfolios).where(eq(portfolios.id, updatedHolding.portfolioId)).limit(1);
      if (portfolio[0]) {
        const client = await db.select().from(clients).where(eq(clients.id, portfolio[0].clientId)).limit(1);
        await this.logAction({
          organizationId: client[0]?.organizationId,
          userId: client[0]?.adviserId || undefined,
          action: 'update',
          resourceType: 'holding',
          resourceId: id,
          oldValues: oldHolding,
          newValues: updatedHolding,
        });
      }
    }

    return updatedHolding;
  }

  // Compliance Tasks
  async getComplianceTasks(organizationId: string, filters?: {
    clientId?: string;
    assignedTo?: string;
    status?: string;
    type?: string;
    overdue?: boolean;
  }): Promise<ComplianceTaskWithChecklists[]> {
    let query = db
      .select({
        id: complianceTasks.id,
        organizationId: complianceTasks.organizationId,
        clientId: complianceTasks.clientId,
        assignedTo: complianceTasks.assignedTo,
        createdBy: complianceTasks.createdBy,
        type: complianceTasks.type,
        category: complianceTasks.category,
        title: complianceTasks.title,
        description: complianceTasks.description,
        priority: complianceTasks.priority,
        status: complianceTasks.status,
        dueDate: complianceTasks.dueDate,
        completedAt: complianceTasks.completedAt,
        completedBy: complianceTasks.completedBy,
        notes: complianceTasks.notes,
        attachments: complianceTasks.attachments,
        recurrenceRule: complianceTasks.recurrenceRule,
        parentTaskId: complianceTasks.parentTaskId,
        createdAt: complianceTasks.createdAt,
        updatedAt: complianceTasks.updatedAt,
        // Join client info
        clientFirstName: clients.firstName,
        clientLastName: clients.lastName,
        clientEmail: clients.email,
        // Join assigned user info
        assignedUserFirstName: users.firstName,
        assignedUserLastName: users.lastName,
        assignedUserEmail: users.email,
      })
      .from(complianceTasks)
      .leftJoin(clients, eq(complianceTasks.clientId, clients.id))
      .leftJoin(users, eq(complianceTasks.assignedTo, users.id))
      .where(eq(complianceTasks.organizationId, organizationId));

    if (filters?.clientId) {
      query = query.where(and(
        eq(complianceTasks.organizationId, organizationId),
        eq(complianceTasks.clientId, filters.clientId)
      ));
    }
    if (filters?.assignedTo) {
      query = query.where(and(
        eq(complianceTasks.organizationId, organizationId),
        eq(complianceTasks.assignedTo, filters.assignedTo)
      ));
    }
    if (filters?.status) {
      query = query.where(and(
        eq(complianceTasks.organizationId, organizationId),
        eq(complianceTasks.status, filters.status)
      ));
    }
    if (filters?.type) {
      query = query.where(and(
        eq(complianceTasks.organizationId, organizationId),
        eq(complianceTasks.type, filters.type)
      ));
    }
    if (filters?.overdue) {
      query = query.where(and(
        eq(complianceTasks.organizationId, organizationId),
        lte(complianceTasks.dueDate, new Date()),
        or(eq(complianceTasks.status, 'pending'), eq(complianceTasks.status, 'in_progress'))
      ));
    }

    const results = await query.orderBy(desc(complianceTasks.createdAt));
    
    // Transform results to include nested objects
    return results.map(row => ({
      id: row.id,
      organizationId: row.organizationId,
      clientId: row.clientId,
      assignedTo: row.assignedTo,
      createdBy: row.createdBy,
      type: row.type,
      category: row.category,
      title: row.title,
      description: row.description,
      priority: row.priority,
      status: row.status,
      dueDate: row.dueDate,
      completedAt: row.completedAt,
      completedBy: row.completedBy,
      notes: row.notes,
      attachments: row.attachments,
      recurrenceRule: row.recurrenceRule,
      parentTaskId: row.parentTaskId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      client: row.clientFirstName ? {
        id: row.clientId!,
        firstName: row.clientFirstName,
        lastName: row.clientLastName!,
        email: row.clientEmail || '',
      } : undefined,
      assignedToUser: row.assignedUserFirstName ? {
        id: row.assignedTo!,
        firstName: row.assignedUserFirstName,
        lastName: row.assignedUserLastName!,
        email: row.assignedUserEmail!,
      } : undefined,
    }));
  }

  async getComplianceTask(id: string, organizationId: string): Promise<ComplianceTaskWithChecklists | undefined> {
    const tasks = await this.getComplianceTasks(organizationId);
    return tasks.find(task => task.id === id);
  }

  async createComplianceTask(task: InsertComplianceTask): Promise<SelectComplianceTask> {
    const [newTask] = await db.insert(complianceTasks).values(task).returning();
    
    // Log the action
    await this.logAction({
      organizationId: task.organizationId,
      userId: task.createdBy,
      action: 'create',
      resourceType: 'compliance_task',
      resourceId: newTask.id,
      newValues: newTask,
    });

    return newTask;
  }

  async updateComplianceTask(id: string, organizationId: string, updates: Partial<SelectComplianceTask>): Promise<SelectComplianceTask | undefined> {
    const [oldTask] = await db
      .select()
      .from(complianceTasks)
      .where(and(eq(complianceTasks.id, id), eq(complianceTasks.organizationId, organizationId)));
    
    if (!oldTask) return undefined;

    const [updatedTask] = await db
      .update(complianceTasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(complianceTasks.id, id), eq(complianceTasks.organizationId, organizationId)))
      .returning();

    if (updatedTask) {
      await this.logAction({
        organizationId,
        userId: updates.assignedTo || oldTask.assignedTo || undefined,
        action: 'update',
        resourceType: 'compliance_task',
        resourceId: id,
        oldValues: oldTask,
        newValues: updatedTask,
      });
    }

    return updatedTask;
  }

  async deleteComplianceTask(id: string, organizationId: string): Promise<boolean> {
    const task = await db
      .select()
      .from(complianceTasks)
      .where(and(eq(complianceTasks.id, id), eq(complianceTasks.organizationId, organizationId)))
      .limit(1);

    if (task.length === 0) return false;

    const result = await db
      .update(complianceTasks)
      .set({ status: 'cancelled' })  // Soft delete
      .where(and(eq(complianceTasks.id, id), eq(complianceTasks.organizationId, organizationId)));

    await this.logAction({
      organizationId,
      userId: task[0].assignedTo || undefined,
      action: 'delete',
      resourceType: 'compliance_task',
      resourceId: id,
      oldValues: task[0],
    });

    return (result as any).rowCount > 0;
  }

  // Task Checklists - Using JSON for simplicity (in real app would be separate table)
  async getTaskChecklists(taskId: string): Promise<TaskChecklist[]> {
    // For now return mock data, in real implementation this would be a separate table
    const task = await db.select().from(complianceTasks).where(eq(complianceTasks.id, taskId)).limit(1);
    if (!task[0]) return [];

    // Generate standard checklists based on task type
    const standardChecklists = this.getStandardChecklistsForTaskType(task[0].type);
    return standardChecklists.map((item, index) => ({
      id: `${taskId}-checklist-${index}`,
      taskId,
      name: item.name,
      description: item.description,
      isCompleted: false,
      sortOrder: index,
    }));
  }

  async updateTaskChecklist(taskId: string, checklistId: string, completed: boolean, completedBy?: string): Promise<TaskChecklist | undefined> {
    // Mock implementation - in real app would update database
    const checklists = await this.getTaskChecklists(taskId);
    const checklist = checklists.find(c => c.id === checklistId);
    if (checklist) {
      checklist.isCompleted = completed;
      checklist.completedAt = completed ? new Date() : undefined;
      checklist.completedBy = completed ? completedBy : undefined;
    }
    return checklist;
  }

  // Task Templates
  async getTaskTemplates(): Promise<TaskTemplate[]> {
    // Return predefined task templates
    return [
      {
        id: 'kyc-template',
        name: 'KYC Documentation',
        type: 'kyc',
        category: 'compliance',
        description: 'Complete Know Your Customer documentation and verification',
        priority: 'high',
        estimatedDuration: 45,
        checklists: [
          { name: 'Identity Verification', description: 'Verify client identity documents', sortOrder: 1 },
          { name: 'Address Verification', description: 'Verify client address proof', sortOrder: 2 },
          { name: 'Source of Funds', description: 'Document and verify source of funds', sortOrder: 3 },
          { name: 'PEP Check', description: 'Politically Exposed Person screening', sortOrder: 4 },
          { name: 'Sanctions Check', description: 'Check against sanctions lists', sortOrder: 5 },
        ],
        isActive: true,
      },
      {
        id: 'suitability-template',
        name: 'Suitability Assessment',
        type: 'suitability',
        category: 'compliance',
        description: 'Assess investment suitability for client',
        priority: 'high',
        estimatedDuration: 60,
        checklists: [
          { name: 'Risk Profile Assessment', description: 'Complete risk tolerance questionnaire', sortOrder: 1 },
          { name: 'Financial Circumstances', description: 'Document client financial situation', sortOrder: 2 },
          { name: 'Investment Objectives', description: 'Record investment goals and objectives', sortOrder: 3 },
          { name: 'Investment Experience', description: 'Assess client investment knowledge and experience', sortOrder: 4 },
          { name: 'Suitability Report', description: 'Prepare suitability report', sortOrder: 5 },
        ],
        isActive: true,
      },
      {
        id: 'annual-review-template',
        name: 'Annual Review',
        type: 'annual_review',
        category: 'compliance',
        description: 'Annual portfolio and client review',
        priority: 'medium',
        estimatedDuration: 90,
        checklists: [
          { name: 'Portfolio Performance Review', description: 'Review portfolio performance vs benchmarks', sortOrder: 1 },
          { name: 'Client Circumstances Review', description: 'Review changes in client circumstances', sortOrder: 2 },
          { name: 'Risk Profile Review', description: 'Reassess risk tolerance and profile', sortOrder: 3 },
          { name: 'Rebalancing Assessment', description: 'Assess need for portfolio rebalancing', sortOrder: 4 },
          { name: 'Review Documentation', description: 'Update all relevant documentation', sortOrder: 5 },
          { name: 'Client Meeting', description: 'Conduct review meeting with client', sortOrder: 6 },
        ],
        isActive: true,
      },
    ];
  }

  async getTaskTemplate(id: string): Promise<TaskTemplate | undefined> {
    const templates = await this.getTaskTemplates();
    return templates.find(t => t.id === id);
  }

  async createTaskFromTemplate(templateId: string, clientId: string, assignedTo: string, organizationId: string, dueDate?: string): Promise<SelectComplianceTask> {
    const template = await this.getTaskTemplate(templateId);
    if (!template) {
      throw new Error('Task template not found');
    }

    const task: InsertComplianceTask = {
      organizationId,
      clientId,
      assignedTo,
      createdBy: assignedTo,
      type: template.type,
      category: template.category,
      title: template.name,
      description: template.description,
      priority: template.priority,
      status: 'pending',
      dueDate: dueDate ? new Date(dueDate) : undefined,
    };

    return await this.createComplianceTask(task);
  }

  // Audit Logs
  async getAuditLogs(organizationId: string, filters?: {
    userId?: string;
    resourceType?: string;
    resourceId?: string;
    action?: string;
    from?: Date;
    to?: Date;
  }): Promise<AuditLogEntry[]> {
    let query = db
      .select()
      .from(auditLog)
      .where(eq(auditLog.organizationId, organizationId));

    if (filters?.userId) {
      query = query.where(and(
        eq(auditLog.organizationId, organizationId),
        eq(auditLog.userId, filters.userId)
      ));
    }
    if (filters?.resourceType) {
      query = query.where(and(
        eq(auditLog.organizationId, organizationId),
        eq(auditLog.resourceType, filters.resourceType)
      ));
    }
    if (filters?.resourceId) {
      query = query.where(and(
        eq(auditLog.organizationId, organizationId),
        eq(auditLog.resourceId, filters.resourceId)
      ));
    }
    if (filters?.action) {
      query = query.where(and(
        eq(auditLog.organizationId, organizationId),
        eq(auditLog.action, filters.action)
      ));
    }
    if (filters?.from) {
      query = query.where(and(
        eq(auditLog.organizationId, organizationId),
        gte(auditLog.createdAt, filters.from)
      ));
    }
    if (filters?.to) {
      query = query.where(and(
        eq(auditLog.organizationId, organizationId),
        lte(auditLog.createdAt, filters.to)
      ));
    }

    const results = await query.orderBy(desc(auditLog.createdAt));
    return results.map(row => ({
      id: row.id,
      organizationId: row.organizationId || undefined,
      userId: row.userId || undefined,
      action: row.action,
      resourceType: row.resourceType,
      resourceId: row.resourceId || undefined,
      oldValues: row.oldValues,
      newValues: row.newValues,
      ipAddress: row.ipAddress || undefined,
      userAgent: row.userAgent || undefined,
      createdAt: row.createdAt,
    }));
  }

  // Scenarios
  async getScenarios(organizationId: string, clientId?: string): Promise<SelectScenario[]> {
    let query = db
      .select()
      .from(scenarios)
      .innerJoin(clients, eq(scenarios.clientId, clients.id))
      .where(eq(clients.organizationId, organizationId));

    if (clientId) {
      query = query.where(and(
        eq(clients.organizationId, organizationId),
        eq(scenarios.clientId, clientId)
      ));
    }

    return await query.orderBy(desc(scenarios.updatedAt));
  }

  async createScenario(scenario: InsertScenario): Promise<SelectScenario> {
    const [newScenario] = await db.insert(scenarios).values(scenario).returning();
    
    // Log the action
    const client = await db.select().from(clients).where(eq(clients.id, scenario.clientId)).limit(1);
    await this.logAction({
      organizationId: client[0]?.organizationId,
      userId: client[0]?.adviserId || undefined,
      action: 'create',
      resourceType: 'scenario',
      resourceId: newScenario.id,
      newValues: newScenario,
    });

    return newScenario;
  }

  // Meetings
  async getMeetings(organizationId: string, filters?: { clientId?: string; adviserId?: string }): Promise<SelectMeeting[]> {
    let query = db
      .select()
      .from(meetings)
      .where(eq(meetings.organizationId, organizationId));

    if (filters?.clientId) {
      query = query.where(and(
        eq(meetings.organizationId, organizationId),
        eq(meetings.clientId, filters.clientId)
      ));
    }
    if (filters?.adviserId) {
      query = query.where(and(
        eq(meetings.organizationId, organizationId),
        eq(meetings.adviserId, filters.adviserId)
      ));
    }

    return await query.orderBy(desc(meetings.scheduledAt));
  }

  async createMeeting(meeting: InsertMeeting): Promise<SelectMeeting> {
    const [newMeeting] = await db.insert(meetings).values(meeting).returning();
    
    // Log the action
    await this.logAction({
      organizationId: meeting.organizationId,
      userId: meeting.adviserId,
      action: 'create',
      resourceType: 'meeting',
      resourceId: newMeeting.id,
      newValues: newMeeting,
    });

    return newMeeting;
  }

  // Dashboard Statistics
  async getDashboardStats(organizationId: string, userId?: string): Promise<{
    totalClients: number;
    totalAUM: number;
    avgPerformance: number;
    pendingTasks: number;
    overdueTasks: number;
    completedTasksThisMonth: number;
    recentActivity: any[];
  }> {
    // Get client count
    const clientCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(clients)
      .where(eq(clients.organizationId, organizationId));

    // Get total AUM
    const totalAUM = await db
      .select({ sum: sql<number>`coalesce(sum(${portfolios.totalValue}), 0)` })
      .from(portfolios)
      .innerJoin(clients, eq(portfolios.clientId, clients.id))
      .where(eq(clients.organizationId, organizationId));

    // Get pending and overdue tasks
    const taskStats = await db
      .select({
        pending: sql<number>`count(case when ${complianceTasks.status} in ('pending', 'in_progress') then 1 end)`,
        overdue: sql<number>`count(case when ${complianceTasks.status} in ('pending', 'in_progress') and ${complianceTasks.dueDate} < now() then 1 end)`,
        completedThisMonth: sql<number>`count(case when ${complianceTasks.status} = 'completed' and ${complianceTasks.completedAt} >= date_trunc('month', current_date) then 1 end)`,
      })
      .from(complianceTasks)
      .where(eq(complianceTasks.organizationId, organizationId));

    // Get recent activity from audit log
    const recentActivity = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.organizationId, organizationId))
      .orderBy(desc(auditLog.createdAt))
      .limit(10);

    return {
      totalClients: clientCount[0]?.count || 0,
      totalAUM: totalAUM[0]?.sum || 0,
      avgPerformance: 8.5, // Mock average performance
      pendingTasks: taskStats[0]?.pending || 0,
      overdueTasks: taskStats[0]?.overdue || 0,
      completedTasksThisMonth: taskStats[0]?.completedThisMonth || 0,
      recentActivity: recentActivity || [],
    };
  }

  // Workflow Automation
  async createClientOnboardingTasks(clientId: string, organizationId: string, adviserId: string): Promise<SelectComplianceTask[]> {
    const tasks: SelectComplianceTask[] = [];
    
    // Create standard onboarding tasks
    const templates = ['kyc-template', 'suitability-template'];
    
    for (const templateId of templates) {
      try {
        const task = await this.createTaskFromTemplate(
          templateId, 
          clientId, 
          adviserId, 
          organizationId,
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Due in 7 days
        );
        tasks.push(task);
      } catch (error) {
        console.error(`Failed to create task from template ${templateId}:`, error);
      }
    }

    return tasks;
  }

  async getOverdueTasks(organizationId: string): Promise<ComplianceTaskWithChecklists[]> {
    return await this.getComplianceTasks(organizationId, { overdue: true });
  }

  async updateTaskStatus(taskId: string, organizationId: string, status: string, completedBy?: string): Promise<SelectComplianceTask | undefined> {
    const updates: Partial<SelectComplianceTask> = { status };
    
    if (status === 'completed') {
      updates.completedAt = new Date();
      updates.completedBy = completedBy;
    }

    return await this.updateComplianceTask(taskId, organizationId, updates);
  }

  // Helper method to get standard checklists for task types
  private getStandardChecklistsForTaskType(taskType: string): { name: string; description: string }[] {
    switch (taskType) {
      case 'kyc':
        return [
          { name: 'Identity Verification', description: 'Verify client identity documents' },
          { name: 'Address Verification', description: 'Verify client address proof' },
          { name: 'Source of Funds', description: 'Document and verify source of funds' },
          { name: 'PEP Check', description: 'Politically Exposed Person screening' },
          { name: 'Sanctions Check', description: 'Check against sanctions lists' },
        ];
      case 'suitability':
        return [
          { name: 'Risk Profile Assessment', description: 'Complete risk tolerance questionnaire' },
          { name: 'Financial Circumstances', description: 'Document client financial situation' },
          { name: 'Investment Objectives', description: 'Record investment goals and objectives' },
          { name: 'Investment Experience', description: 'Assess client investment knowledge and experience' },
          { name: 'Suitability Report', description: 'Prepare suitability report' },
        ];
      case 'annual_review':
        return [
          { name: 'Portfolio Performance Review', description: 'Review portfolio performance vs benchmarks' },
          { name: 'Client Circumstances Review', description: 'Review changes in client circumstances' },
          { name: 'Risk Profile Review', description: 'Reassess risk tolerance and profile' },
          { name: 'Rebalancing Assessment', description: 'Assess need for portfolio rebalancing' },
          { name: 'Review Documentation', description: 'Update all relevant documentation' },
          { name: 'Client Meeting', description: 'Conduct review meeting with client' },
        ];
      default:
        return [
          { name: 'Task Preparation', description: 'Prepare necessary documents and information' },
          { name: 'Task Execution', description: 'Complete the main task requirements' },
          { name: 'Documentation', description: 'Document results and outcomes' },
          { name: 'Review & Sign-off', description: 'Review work and obtain necessary approvals' },
        ];
    }
  }

  // Pipeline Management Methods
  async getPipelineStages(organizationId: string): Promise<SelectClientPipelineStage[]> {
    return await db
      .select()
      .from(clientPipelineStages)
      .where(eq(clientPipelineStages.organizationId, organizationId))
      .orderBy(clientPipelineStages.position);
  }

  async createPipelineStage(stage: InsertClientPipelineStage): Promise<SelectClientPipelineStage> {
    const [newStage] = await db.insert(clientPipelineStages).values(stage).returning();
    
    await this.logAction({
      organizationId: stage.organizationId,
      action: 'create',
      resourceType: 'pipeline_stage',
      resourceId: newStage.id,
      newValues: newStage,
    });

    return newStage;
  }

  async updatePipelineStage(id: string, organizationId: string, updates: Partial<SelectClientPipelineStage>): Promise<SelectClientPipelineStage | undefined> {
    const [oldStage] = await db
      .select()
      .from(clientPipelineStages)
      .where(and(eq(clientPipelineStages.id, id), eq(clientPipelineStages.organizationId, organizationId)));
    
    if (!oldStage) return undefined;

    const [updatedStage] = await db
      .update(clientPipelineStages)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(clientPipelineStages.id, id), eq(clientPipelineStages.organizationId, organizationId)))
      .returning();

    if (updatedStage) {
      await this.logAction({
        organizationId,
        action: 'update',
        resourceType: 'pipeline_stage',
        resourceId: id,
        oldValues: oldStage,
        newValues: updatedStage,
      });
    }

    return updatedStage;
  }

  async deletePipelineStage(id: string, organizationId: string): Promise<boolean> {
    const [stage] = await db
      .select()
      .from(clientPipelineStages)
      .where(and(eq(clientPipelineStages.id, id), eq(clientPipelineStages.organizationId, organizationId)));

    if (!stage) return false;

    const result = await db
      .update(clientPipelineStages)
      .set({ isActive: false })
      .where(and(eq(clientPipelineStages.id, id), eq(clientPipelineStages.organizationId, organizationId)));

    await this.logAction({
      organizationId,
      action: 'delete',
      resourceType: 'pipeline_stage',
      resourceId: id,
      oldValues: stage,
    });

    return (result as any).rowCount > 0;
  }

  async getClientPipeline(organizationId: string, filters?: { clientId?: string; stageId?: string }): Promise<SelectClientPipeline[]> {
    let query = db
      .select({
        id: clientPipeline.id,
        organizationId: clientPipeline.organizationId,
        clientId: clientPipeline.clientId,
        stageId: clientPipeline.stageId,
        enteredAt: clientPipeline.enteredAt,
        expectedCompletionDate: clientPipeline.expectedCompletionDate,
        notes: clientPipeline.notes,
        assignedTo: clientPipeline.assignedTo,
        completionPercentage: clientPipeline.completionPercentage,
        priority: clientPipeline.priority,
        createdAt: clientPipeline.createdAt,
        updatedAt: clientPipeline.updatedAt,
      })
      .from(clientPipeline)
      .where(eq(clientPipeline.organizationId, organizationId));

    if (filters?.clientId) {
      query = query.where(and(
        eq(clientPipeline.organizationId, organizationId),
        eq(clientPipeline.clientId, filters.clientId)
      ));
    }
    if (filters?.stageId) {
      query = query.where(and(
        eq(clientPipeline.organizationId, organizationId),
        eq(clientPipeline.stageId, filters.stageId)
      ));
    }

    return await query.orderBy(desc(clientPipeline.updatedAt));
  }

  async updateClientPipelineStage(clientId: string, stageId: string, organizationId: string, updates?: Partial<SelectClientPipeline>): Promise<SelectClientPipeline | undefined> {
    // Check if client pipeline entry exists
    const [existingEntry] = await db
      .select()
      .from(clientPipeline)
      .where(and(
        eq(clientPipeline.clientId, clientId),
        eq(clientPipeline.organizationId, organizationId)
      ))
      .limit(1);

    if (existingEntry) {
      // Update existing entry
      const [updated] = await db
        .update(clientPipeline)
        .set({
          stageId,
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(clientPipeline.id, existingEntry.id))
        .returning();

      await this.logAction({
        organizationId,
        userId: updates?.assignedTo,
        action: 'update',
        resourceType: 'client_pipeline',
        resourceId: updated.id,
        oldValues: existingEntry,
        newValues: updated,
      });

      return updated;
    } else {
      // Create new entry
      const [newEntry] = await db
        .insert(clientPipeline)
        .values({
          organizationId,
          clientId,
          stageId,
          enteredAt: new Date(),
          ...updates,
        })
        .returning();

      await this.logAction({
        organizationId,
        userId: updates?.assignedTo,
        action: 'create',
        resourceType: 'client_pipeline',
        resourceId: newEntry.id,
        newValues: newEntry,
      });

      return newEntry;
    }
  }

  // Notification Methods
  async getNotifications(organizationId: string, userId?: string, filters?: {
    isRead?: boolean;
    type?: string;
    category?: string;
    limit?: number;
  }): Promise<SelectEnhancedNotification[]> {
    let query = db
      .select()
      .from(enhancedNotifications)
      .where(eq(enhancedNotifications.organizationId, organizationId));

    if (userId) {
      query = query.where(and(
        eq(enhancedNotifications.organizationId, organizationId),
        eq(enhancedNotifications.userId, userId)
      ));
    }

    if (filters?.isRead !== undefined) {
      query = query.where(and(
        eq(enhancedNotifications.organizationId, organizationId),
        eq(enhancedNotifications.isRead, filters.isRead)
      ));
    }

    if (filters?.type) {
      query = query.where(and(
        eq(enhancedNotifications.organizationId, organizationId),
        eq(enhancedNotifications.type, filters.type)
      ));
    }

    if (filters?.category) {
      query = query.where(and(
        eq(enhancedNotifications.organizationId, organizationId),
        eq(enhancedNotifications.category, filters.category)
      ));
    }

    const limit = filters?.limit || 50;
    return await query
      .orderBy(desc(enhancedNotifications.createdAt))
      .limit(limit);
  }

  async createNotification(notification: InsertEnhancedNotification): Promise<SelectEnhancedNotification> {
    const [newNotification] = await db.insert(enhancedNotifications).values(notification).returning();
    
    await this.logAction({
      organizationId: notification.organizationId,
      userId: notification.userId,
      action: 'create',
      resourceType: 'notification',
      resourceId: newNotification.id,
      newValues: newNotification,
    });

    return newNotification;
  }

  async markNotificationRead(id: string, userId: string, organizationId: string): Promise<SelectEnhancedNotification | undefined> {
    const [updated] = await db
      .update(enhancedNotifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(and(
        eq(enhancedNotifications.id, id),
        eq(enhancedNotifications.userId, userId),
        eq(enhancedNotifications.organizationId, organizationId)
      ))
      .returning();

    if (updated) {
      await this.logAction({
        organizationId,
        userId,
        action: 'update',
        resourceType: 'notification',
        resourceId: id,
        newValues: { isRead: true, readAt: updated.readAt },
      });
    }

    return updated;
  }

  async markAllNotificationsRead(userId: string, organizationId: string): Promise<boolean> {
    const result = await db
      .update(enhancedNotifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(and(
        eq(enhancedNotifications.userId, userId),
        eq(enhancedNotifications.organizationId, organizationId),
        eq(enhancedNotifications.isRead, false)
      ));

    await this.logAction({
      organizationId,
      userId,
      action: 'update',
      resourceType: 'notification',
      newValues: { bulk_mark_read: true },
    });

    return (result as any).rowCount > 0;
  }

  async deleteNotification(id: string, userId: string, organizationId: string): Promise<boolean> {
    const [notification] = await db
      .select()
      .from(enhancedNotifications)
      .where(and(
        eq(enhancedNotifications.id, id),
        eq(enhancedNotifications.userId, userId),
        eq(enhancedNotifications.organizationId, organizationId)
      ));

    if (!notification) return false;

    const result = await db
      .delete(enhancedNotifications)
      .where(and(
        eq(enhancedNotifications.id, id),
        eq(enhancedNotifications.userId, userId),
        eq(enhancedNotifications.organizationId, organizationId)
      ));

    await this.logAction({
      organizationId,
      userId,
      action: 'delete',
      resourceType: 'notification',
      resourceId: id,
      oldValues: notification,
    });

    return (result as any).rowCount > 0;
  }

  // KPI Metrics Methods
  async getKpiMetrics(organizationId: string, filters?: {
    metricType?: string;
    period?: string;
    from?: Date;
    to?: Date;
  }): Promise<SelectKpiMetric[]> {
    let query = db
      .select()
      .from(kpiMetrics)
      .where(eq(kpiMetrics.organizationId, organizationId));

    if (filters?.metricType) {
      query = query.where(and(
        eq(kpiMetrics.organizationId, organizationId),
        eq(kpiMetrics.metricType, filters.metricType)
      ));
    }

    if (filters?.period) {
      query = query.where(and(
        eq(kpiMetrics.organizationId, organizationId),
        eq(kpiMetrics.period, filters.period)
      ));
    }

    if (filters?.from) {
      query = query.where(and(
        eq(kpiMetrics.organizationId, organizationId),
        gte(kpiMetrics.recordDate, filters.from)
      ));
    }

    if (filters?.to) {
      query = query.where(and(
        eq(kpiMetrics.organizationId, organizationId),
        lte(kpiMetrics.recordDate, filters.to)
      ));
    }

    return await query.orderBy(desc(kpiMetrics.recordDate));
  }

  async createKpiMetric(metric: InsertKpiMetric): Promise<SelectKpiMetric> {
    const [newMetric] = await db.insert(kpiMetrics).values(metric).returning();
    
    await this.logAction({
      organizationId: metric.organizationId,
      action: 'create',
      resourceType: 'kpi_metric',
      resourceId: newMetric.id,
      newValues: newMetric,
    });

    return newMetric;
  }

  async getKpiSummary(organizationId: string): Promise<{
    totalClients: { value: number; change: number };
    totalAUM: { value: number; change: number };
    averageReturn: { value: number; change: number };
    newClients: { value: number; change: number };
    activePortfolios: { value: number; change: number };
  }> {
    // Get current period metrics
    const currentMetrics = await db
      .select()
      .from(kpiMetrics)
      .where(and(
        eq(kpiMetrics.organizationId, organizationId),
        eq(kpiMetrics.period, 'monthly'),
        gte(kpiMetrics.recordDate, new Date(new Date().getFullYear(), new Date().getMonth(), 1))
      ));

    // Helper function to find metric value and change
    const getMetricSummary = (metricType: string) => {
      const metric = currentMetrics.find(m => m.metricType === metricType);
      return {
        value: Number(metric?.value || 0),
        change: Number(metric?.changePercentage || 0),
      };
    };

    return {
      totalClients: getMetricSummary('total_clients'),
      totalAUM: getMetricSummary('total_aum'),
      averageReturn: getMetricSummary('average_return'),
      newClients: getMetricSummary('new_clients'),
      activePortfolios: getMetricSummary('active_portfolios'),
    };
  }

  async getKpiHistorical(organizationId: string, metricType: string, period: string, limit = 12): Promise<SelectKpiMetric[]> {
    return await db
      .select()
      .from(kpiMetrics)
      .where(and(
        eq(kpiMetrics.organizationId, organizationId),
        eq(kpiMetrics.metricType, metricType),
        eq(kpiMetrics.period, period)
      ))
      .orderBy(desc(kpiMetrics.recordDate))
      .limit(limit);
  }
}