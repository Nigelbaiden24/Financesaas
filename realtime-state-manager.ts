import { QueryClient } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

// Centralized cache invalidation strategies
export class RealtimeStateManager {
  private static queryClient: QueryClient = queryClient;
  
  // Cross-module cache invalidation patterns
  static readonly CACHE_PATTERNS = {
    // Dashboard related queries
    DASHBOARD: ['financial-dashboard', 'kpi-summary', 'kpi-historical'],
    
    // Client related queries
    CLIENTS: ['financial-clients', 'client-portfolios', 'pipeline-overview'],
    
    // Portfolio related queries
    PORTFOLIOS: ['financial-portfolios', 'portfolio-holdings', 'portfolio-performance'],
    
    // Scenario and planning queries
    SCENARIOS: ['financial-scenarios', 'latest-scenario'],
    
    // Compliance and task queries
    TASKS: ['compliance-tasks', 'compliance-task', 'overdue-tasks', 'task-templates'],
    
    // Notification queries
    NOTIFICATIONS: ['enhanced-notifications', 'pipeline-stages'],
    
    // All queries (for major updates)
    ALL: ['financial-', 'compliance-', 'kpi-', 'portfolio-', 'client-', 'scenario-', 'pipeline-', 'enhanced-']
  };

  // Optimistic update helpers
  static optimisticUpdate<T>(
    queryKey: (string | number)[],
    updater: (old: T | undefined) => T,
    rollbackData?: T
  ) {
    const previousData = this.queryClient.getQueryData<T>(queryKey);
    
    // Apply optimistic update
    this.queryClient.setQueryData(queryKey, updater);
    
    return {
      rollback: () => {
        this.queryClient.setQueryData(queryKey, rollbackData ?? previousData);
      },
      previousData
    };
  }

  // Cross-module invalidation when clients change
  static async invalidateClientRelated(clientId?: string) {
    const invalidations = [
      ...this.CACHE_PATTERNS.CLIENTS,
      ...this.CACHE_PATTERNS.DASHBOARD,
      ...this.CACHE_PATTERNS.PORTFOLIOS,
      ...this.CACHE_PATTERNS.TASKS,
      ...this.CACHE_PATTERNS.NOTIFICATIONS,
    ];

    await Promise.all(
      invalidations.map(pattern => 
        this.queryClient.invalidateQueries({
          queryKey: clientId ? [pattern, clientId] : [pattern],
          type: 'all'
        })
      )
    );
  }

  // Cross-module invalidation when portfolios change
  static async invalidatePortfolioRelated(portfolioId?: string, clientId?: string) {
    const invalidations = [
      ...this.CACHE_PATTERNS.PORTFOLIOS,
      ...this.CACHE_PATTERNS.DASHBOARD,
      ...this.CACHE_PATTERNS.SCENARIOS,
    ];

    await Promise.all([
      ...invalidations.map(pattern => 
        this.queryClient.invalidateQueries({
          queryKey: portfolioId ? [pattern, portfolioId] : [pattern],
          type: 'all'
        })
      ),
      // Also invalidate client-specific data
      ...(clientId ? [this.invalidateClientRelated(clientId)] : [])
    ]);
  }

  // Cross-module invalidation when scenarios change
  static async invalidateScenarioRelated(clientId?: string) {
    const invalidations = [
      ...this.CACHE_PATTERNS.SCENARIOS,
      ...this.CACHE_PATTERNS.DASHBOARD,
    ];

    await Promise.all([
      ...invalidations.map(pattern => 
        this.queryClient.invalidateQueries({ queryKey: [pattern], type: 'all' })
      ),
      // Also invalidate client-specific data
      ...(clientId ? [this.invalidateClientRelated(clientId)] : [])
    ]);
  }

  // Cross-module invalidation when tasks change
  static async invalidateTaskRelated(clientId?: string) {
    const invalidations = [
      ...this.CACHE_PATTERNS.TASKS,
      ...this.CACHE_PATTERNS.DASHBOARD,
      ...this.CACHE_PATTERNS.NOTIFICATIONS,
    ];

    await Promise.all([
      ...invalidations.map(pattern => 
        this.queryClient.invalidateQueries({ queryKey: [pattern], type: 'all' })
      ),
      // Also invalidate client-specific data
      ...(clientId ? [this.invalidateClientRelated(clientId)] : [])
    ]);
  }

  // Cross-module invalidation when pipeline changes
  static async invalidatePipelineRelated() {
    const invalidations = [
      ...this.CACHE_PATTERNS.CLIENTS,
      ...this.CACHE_PATTERNS.DASHBOARD,
      ...this.CACHE_PATTERNS.NOTIFICATIONS,
      'pipeline-overview',
      'pipeline-stages'
    ];

    await Promise.all(
      invalidations.map(pattern => 
        this.queryClient.invalidateQueries({ queryKey: [pattern], type: 'all' })
      )
    );
  }

  // Complete system refresh (for major updates)
  static async invalidateAll() {
    await Promise.all(
      this.CACHE_PATTERNS.ALL.map(pattern => 
        this.queryClient.invalidateQueries({
          predicate: (query) => 
            query.queryKey.some(key => 
              typeof key === 'string' && key.startsWith(pattern)
            ),
          type: 'all'
        })
      )
    );
  }

  // Smart background refresh for real-time updates
  static async backgroundRefresh(priorities: ('high' | 'medium' | 'low')[] = ['high']) {
    const queries = {
      high: [
        'financial-dashboard',
        'kpi-summary', 
        'enhanced-notifications',
        'overdue-tasks'
      ],
      medium: [
        'financial-clients',
        'pipeline-overview',
        'compliance-tasks'
      ],
      low: [
        'kpi-historical',
        'task-templates'
      ]
    };

    for (const priority of priorities) {
      await Promise.all(
        queries[priority].map(queryKey => 
          this.queryClient.invalidateQueries({ 
            queryKey: [queryKey], 
            refetchType: 'active' 
          })
        )
      );
    }
  }

  // Enhanced event type mapping for targeted cache invalidations
  static readonly EVENT_TYPE_MAPPINGS = {
    // Portfolio-related events
    'portfolio_updated': {
      queries: ['financial-portfolios', 'portfolio-holdings', 'portfolio-performance', 'kpi-summary'],
      scopedQueries: ['portfolio-holdings', 'portfolio-performance'],
      dependencies: ['financial-dashboard']
    },
    'holding_added': {
      queries: ['portfolio-holdings', 'portfolio-performance', 'kpi-summary'],
      scopedQueries: ['portfolio-holdings', 'portfolio-performance'],
      dependencies: []
    },
    
    // Client-related events
    'client_updated': {
      queries: ['financial-clients', 'client-portfolios', 'pipeline-overview', 'kpi-summary'],
      scopedQueries: ['client-portfolios'],
      dependencies: ['financial-dashboard', 'compliance-tasks']
    },
    'client_created': {
      queries: ['financial-clients', 'pipeline-overview', 'kpi-summary'],
      scopedQueries: [],
      dependencies: ['financial-dashboard']
    },
    
    // Scenario-related events
    'scenario_calculated': {
      queries: ['financial-scenarios', 'latest-scenario', 'kpi-summary'],
      scopedQueries: ['latest-scenario'],
      dependencies: []
    },
    
    // Task-related events
    'task_completed': {
      queries: ['compliance-tasks', 'overdue-tasks', 'kpi-summary'],
      scopedQueries: ['compliance-tasks'],
      dependencies: ['enhanced-notifications', 'financial-dashboard']
    },
    'task_created': {
      queries: ['compliance-tasks', 'overdue-tasks'],
      scopedQueries: ['compliance-tasks'],
      dependencies: []
    },
    
    // Pipeline-related events
    'pipeline_moved': {
      queries: ['pipeline-overview', 'pipeline-stages', 'kpi-summary'],
      scopedQueries: [],
      dependencies: ['financial-dashboard', 'enhanced-notifications']
    },
    
    // KPI-specific events
    'kpi_updated': {
      queries: ['kpi-summary', 'kpi-historical'],
      scopedQueries: [],
      dependencies: []
    },
    
    // Notification events
    'notification_received': {
      queries: ['enhanced-notifications'],
      scopedQueries: [],
      dependencies: []
    }
  } as const;

  // Smart invalidation based on event type with selective scope
  static async invalidateByEventType(eventType: keyof typeof RealtimeStateManager.EVENT_TYPE_MAPPINGS, data?: any) {
    const mapping = this.EVENT_TYPE_MAPPINGS[eventType];
    if (!mapping) {
      console.warn(`No cache mapping found for event type: ${eventType}`);
      return;
    }

    const invalidationPromises: Promise<void>[] = [];

    // Invalidate primary queries
    mapping.queries.forEach(queryKey => {
      invalidationPromises.push(
        this.queryClient.invalidateQueries({ queryKey: [queryKey], type: 'active' })
      );
    });

    // Invalidate scoped queries (with entity ID if available)
    if (data) {
      mapping.scopedQueries.forEach(queryKey => {
        const scopeId = data.clientId || data.portfolioId || data.scenarioId;
        if (scopeId) {
          invalidationPromises.push(
            this.queryClient.invalidateQueries({ queryKey: [queryKey, scopeId], type: 'active' })
          );
        }
      });
    }

    // Invalidate dependency queries
    mapping.dependencies.forEach(queryKey => {
      invalidationPromises.push(
        this.queryClient.invalidateQueries({ queryKey: [queryKey], type: 'active' })
      );
    });

    await Promise.all(invalidationPromises);
  }

  // Enhanced real-time data synchronization with improved type safety
  static handleRealtimeUpdate(event: {
    type: keyof typeof RealtimeStateManager.EVENT_TYPE_MAPPINGS;
    data: any;
  }) {
    // Use the centralized event mapping system
    this.invalidateByEventType(event.type, event.data);
    
    // Log for debugging in development
    if (import.meta.env.MODE === 'development') {
      console.log(`Cache invalidation triggered for event: ${event.type}`, {
        affectedQueries: this.EVENT_TYPE_MAPPINGS[event.type]?.queries || [],
        data: event.data
      });
    }
  }

  // Batch event handling for multiple simultaneous updates
  static async handleBatchRealtimeUpdates(events: Array<{ type: keyof typeof RealtimeStateManager.EVENT_TYPE_MAPPINGS; data: any }>) {
    // Collect all unique query keys to invalidate
    const allQueriesToInvalidate = new Set<string>();
    const scopedInvalidations: Array<{ queryKey: string; scopeId: string }> = [];

    events.forEach(event => {
      const mapping = this.EVENT_TYPE_MAPPINGS[event.type];
      if (mapping) {
        // Add primary queries
        mapping.queries.forEach(query => allQueriesToInvalidate.add(query));
        mapping.dependencies.forEach(query => allQueriesToInvalidate.add(query));
        
        // Add scoped queries
        if (event.data) {
          const scopeId = event.data.clientId || event.data.portfolioId || event.data.scenarioId;
          if (scopeId) {
            mapping.scopedQueries.forEach(queryKey => {
              scopedInvalidations.push({ queryKey, scopeId });
            });
          }
        }
      }
    });

    // Execute all invalidations in parallel
    const invalidationPromises = [
      // Invalidate unique queries
      ...Array.from(allQueriesToInvalidate).map(queryKey =>
        this.queryClient.invalidateQueries({ queryKey: [queryKey], type: 'active' })
      ),
      // Invalidate scoped queries
      ...scopedInvalidations.map(({ queryKey, scopeId }) =>
        this.queryClient.invalidateQueries({ queryKey: [queryKey, scopeId], type: 'active' })
      )
    ];

    await Promise.all(invalidationPromises);

    if (import.meta.env.MODE === 'development') {
      console.log(`Batch cache invalidation completed for ${events.length} events`, {
        uniqueQueries: Array.from(allQueriesToInvalidate),
        scopedInvalidations: scopedInvalidations.length
      });
    }
  }

  // Prefetch commonly accessed data
  static async prefetchCriticalData() {
    const criticalQueries = [
      'financial-dashboard',
      'financial-clients',
      'kpi-summary',
      'enhanced-notifications'
    ];

    await Promise.all(
      criticalQueries.map(queryKey => 
        this.queryClient.prefetchQuery({ queryKey: [queryKey] })
      )
    );
  }

  // Performance optimization: batch updates
  static batchUpdate(updates: (() => void)[]) {
    this.queryClient.getQueryCache().clear();
    updates.forEach(update => update());
    this.backgroundRefresh(['high']);
  }
}

// Export singleton instance
export const realtimeStateManager = RealtimeStateManager;