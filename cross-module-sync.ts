import { useEffect, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { realtimeStateManager } from './realtime-state-manager';
import { useToast } from '@/hooks/use-toast';

// Event types for cross-module communication
export type CrossModuleEvent = 
  | { type: 'portfolio_updated'; data: { portfolioId: string; clientId: string; changes: any } }
  | { type: 'client_created'; data: { clientId: string; clientData: any } }
  | { type: 'client_updated'; data: { clientId: string; changes: any } }
  | { type: 'task_completed'; data: { taskId: string; clientId: string; taskData: any } }
  | { type: 'scenario_calculated'; data: { clientId?: string; scenarioData: any } }
  | { type: 'pipeline_moved'; data: { clientId: string; fromStage: string; toStage: string } }
  | { type: 'holding_added'; data: { portfolioId: string; clientId: string; holdingData: any } }
  | { type: 'kpi_updated'; data: { metrics: string[]; values: Record<string, any> } }
  | { type: 'notification_triggered'; data: { type: string; message: string; relatedIds: string[] } };

// Centralized event emitter for cross-module communication
class CrossModuleEventEmitter {
  private listeners: Map<string, ((event: CrossModuleEvent) => void)[]> = new Map();
  private eventHistory: CrossModuleEvent[] = [];
  private maxHistorySize = 50;

  // Subscribe to specific event types
  subscribe(eventType: string, listener: (event: CrossModuleEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(eventType);
      if (eventListeners) {
        const index = eventListeners.indexOf(listener);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    };
  }

  // Subscribe to all events
  subscribeAll(listener: (event: CrossModuleEvent) => void) {
    return this.subscribe('*', listener);
  }

  // Emit event to all subscribers
  emit(event: CrossModuleEvent) {
    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Emit to specific event type listeners
    const typeListeners = this.listeners.get(event.type) || [];
    const allListeners = this.listeners.get('*') || [];
    
    [...typeListeners, ...allListeners].forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in cross-module event listener:', error);
      }
    });
  }

  // Get recent event history
  getEventHistory(): CrossModuleEvent[] {
    return [...this.eventHistory];
  }

  // Clear all listeners (for cleanup)
  clearAll() {
    this.listeners.clear();
    this.eventHistory = [];
  }
}

// Singleton event emitter
export const crossModuleEvents = new CrossModuleEventEmitter();

// Hook for listening to cross-module events
export const useCrossModuleEvents = (
  eventTypes?: string[],
  handler?: (event: CrossModuleEvent) => void
) => {
  const [events, setEvents] = useState<CrossModuleEvent[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    const eventHandler = (event: CrossModuleEvent) => {
      setEvents(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events
      
      if (handler) {
        handler(event);
      }
    };

    if (eventTypes && eventTypes.length > 0) {
      // Subscribe to specific event types
      eventTypes.forEach(eventType => {
        unsubscribers.push(crossModuleEvents.subscribe(eventType, eventHandler));
      });
    } else {
      // Subscribe to all events
      unsubscribers.push(crossModuleEvents.subscribeAll(eventHandler));
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [eventTypes, handler]);

  return events;
};

// Hook for coordinating cross-module updates
export const useCrossModuleCoordinator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const coordinateUpdate = useCallback(async (event: CrossModuleEvent) => {
    try {
      switch (event.type) {
        case 'portfolio_updated':
          // When portfolio changes, update scenarios, dashboard, and client data
          await Promise.all([
            realtimeStateManager.invalidatePortfolioRelated(
              event.data.portfolioId, 
              event.data.clientId
            ),
            realtimeStateManager.invalidateScenarioRelated(event.data.clientId),
            // Trigger recalculation of KPIs that depend on portfolio values
            queryClient.invalidateQueries({ queryKey: ['kpi-summary'] }),
          ]);
          break;

        case 'client_created':
        case 'client_updated':
          // When client changes, update pipeline, dashboard, tasks, and portfolios
          await Promise.all([
            realtimeStateManager.invalidateClientRelated(event.data.clientId),
            realtimeStateManager.invalidatePipelineRelated(),
            queryClient.invalidateQueries({ queryKey: ['kpi-summary'] }),
          ]);
          break;

        case 'task_completed':
          // When task completes, update dashboard, notifications, and client status
          await Promise.all([
            realtimeStateManager.invalidateTaskRelated(event.data.clientId),
            queryClient.invalidateQueries({ queryKey: ['enhanced-notifications'] }),
            // Update client compliance status
            queryClient.invalidateQueries({ 
              queryKey: ['financial-clients', event.data.clientId] 
            }),
          ]);
          
          // Show success notification
          toast({
            title: "Task Completed",
            description: "Compliance task has been marked as completed.",
          });
          break;

        case 'scenario_calculated':
          // When scenario is calculated, update dashboard and client planning data
          await Promise.all([
            realtimeStateManager.invalidateScenarioRelated(event.data.clientId),
            queryClient.invalidateQueries({ queryKey: ['kpi-summary'] }),
            // Update any client-specific planning data
            ...(event.data.clientId ? [
              queryClient.invalidateQueries({ 
                queryKey: ['client-portfolios', event.data.clientId] 
              })
            ] : []),
          ]);
          break;

        case 'pipeline_moved':
          // When client moves in pipeline, update all related modules
          await Promise.all([
            realtimeStateManager.invalidatePipelineRelated(),
            realtimeStateManager.invalidateClientRelated(event.data.clientId),
            queryClient.invalidateQueries({ queryKey: ['enhanced-notifications'] }),
            queryClient.invalidateQueries({ queryKey: ['kpi-summary'] }),
          ]);
          break;

        case 'holding_added':
          // When holding is added, trigger comprehensive portfolio updates
          await Promise.all([
            realtimeStateManager.invalidatePortfolioRelated(
              event.data.portfolioId,
              event.data.clientId
            ),
            // Recalculate scenarios that might be affected
            realtimeStateManager.invalidateScenarioRelated(event.data.clientId),
            // Update allocation charts and performance metrics
            queryClient.invalidateQueries({ 
              queryKey: ['portfolio-performance', event.data.portfolioId] 
            }),
          ]);
          break;

        case 'kpi_updated':
          // When KPIs change, ensure dashboard components reflect changes
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['kpi-summary'] }),
            queryClient.invalidateQueries({ queryKey: ['kpi-historical'] }),
            queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] }),
          ]);
          break;

        case 'notification_triggered':
          // When notification is triggered, update notification center
          await queryClient.invalidateQueries({ queryKey: ['enhanced-notifications'] });
          break;

        default:
          console.warn('Unhandled cross-module event:', event.type);
      }
    } catch (error) {
      console.error('Error coordinating cross-module update:', error);
      toast({
        title: "Update Error",
        description: "Some data may not be fully synchronized. Please refresh if needed.",
        variant: "destructive",
      });
    }
  }, [queryClient, toast]);

  return { coordinateUpdate };
};

// Hook for real-time dashboard synchronization
export const useDashboardSync = () => {
  const { coordinateUpdate } = useCrossModuleCoordinator();

  useCrossModuleEvents(
    ['portfolio_updated', 'client_updated', 'task_completed', 'scenario_calculated'],
    coordinateUpdate
  );
};

// Hook for portfolio-scenario synchronization
export const usePortfolioScenarioSync = () => {
  const queryClient = useQueryClient();

  const syncPortfolioToScenario = useCallback(async (portfolioId: string, clientId: string) => {
    // When portfolio changes, trigger scenario recalculation
    const portfolioData = queryClient.getQueryData(['portfolio-holdings', portfolioId]);
    const clientData = queryClient.getQueryData(['financial-clients']);
    
    if (portfolioData && clientData) {
      // Extract client info for scenario parameters
      const client = Array.isArray(clientData) ? 
        clientData.find((c: any) => c.id === clientId) : null;
      
      if (client) {
        // Emit event to trigger scenario updates
        crossModuleEvents.emit({
          type: 'portfolio_updated',
          data: { portfolioId, clientId, changes: { holdings: portfolioData } }
        });
      }
    }
  }, [queryClient]);

  return { syncPortfolioToScenario };
};

// Hook for task-pipeline synchronization
export const useTaskPipelineSync = () => {
  const queryClient = useQueryClient();

  const syncTaskToComplianceStatus = useCallback(async (taskId: string, clientId: string, status: string) => {
    // When critical tasks are completed, potentially move client in pipeline
    const criticalTaskTypes = ['kyc', 'fact_find', 'risk_assessment', 'annual_review'];
    const taskData = queryClient.getQueryData(['compliance-task', taskId]);
    
    if (taskData && typeof taskData === 'object' && 'type' in taskData) {
      const task = taskData as any;
      
      if (status === 'completed' && criticalTaskTypes.includes(task.type)) {
        // Emit event to potentially advance client in pipeline
        crossModuleEvents.emit({
          type: 'task_completed',
          data: { taskId, clientId, taskData: task }
        });
      }
    }
  }, [queryClient]);

  return { syncTaskToComplianceStatus };
};

// Hook for automatic background synchronization
export const useBackgroundSync = (interval: number = 30000) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const syncInterval = setInterval(async () => {
      // Perform background refresh of critical data
      await realtimeStateManager.backgroundRefresh(['high']);
      
      // Check for any stale data and refresh
      const staleQueries = queryClient.getQueryCache().findAll({
        stale: true,
        fetchStatus: 'idle'
      });

      if (staleQueries.length > 0) {
        console.log(`Refreshing ${staleQueries.length} stale queries`);
        await Promise.all(
          staleQueries.slice(0, 5).map(query => // Limit to 5 to avoid overwhelming
            queryClient.invalidateQueries({ queryKey: query.queryKey })
          )
        );
      }
    }, interval);

    return () => clearInterval(syncInterval);
  }, [queryClient, interval]);
};

// Enhanced event emission helpers
export const emitCrossModuleEvent = (event: CrossModuleEvent) => {
  crossModuleEvents.emit(event);
  
  // Also handle through realtime state manager for cache invalidation
  realtimeStateManager.handleRealtimeUpdate({
    type: event.type as any,
    data: event.data
  });
};

// Debug utilities for development
export const getCrossModuleEventHistory = () => crossModuleEvents.getEventHistory();
export const clearCrossModuleEvents = () => crossModuleEvents.clearAll();