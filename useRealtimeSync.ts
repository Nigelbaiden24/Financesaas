import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useCrossModuleEvents, 
  useCrossModuleCoordinator,
  useBackgroundSync,
  emitCrossModuleEvent,
  CrossModuleEvent 
} from '@/lib/cross-module-sync';
import { useToast } from '@/hooks/use-toast';

// Main hook for comprehensive real-time synchronization
export const useRealtimeSync = (options: {
  enableBackgroundSync?: boolean;
  backgroundSyncInterval?: number;
  enableEventLogging?: boolean;
} = {}) => {
  const { 
    enableBackgroundSync = true,
    backgroundSyncInterval = 30000,
    enableEventLogging = false
  } = options;

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { coordinateUpdate } = useCrossModuleCoordinator();
  const eventLogRef = useRef<CrossModuleEvent[]>([]);

  // Always call the hook but control behavior with parameters
  useBackgroundSync({
    enabled: enableBackgroundSync,
    interval: backgroundSyncInterval
  });

  // Listen to all cross-module events and coordinate updates
  const events = useCrossModuleEvents(undefined, useCallback((event: CrossModuleEvent) => {
    if (enableEventLogging) {
      eventLogRef.current.push(event);
      console.log('Cross-module event:', event);
    }
    coordinateUpdate(event);
  }, [coordinateUpdate, enableEventLogging]));

  // Helper function to emit events
  const emitEvent = useCallback((event: CrossModuleEvent) => {
    emitCrossModuleEvent(event);
  }, []);

  // Helper function to get event log (for debugging)
  const getEventLog = useCallback(() => {
    return [...eventLogRef.current];
  }, []);

  // Helper function to clear event log
  const clearEventLog = useCallback(() => {
    eventLogRef.current = [];
  }, []);

  return {
    events,
    emitEvent,
    getEventLog,
    clearEventLog,
    isBackgroundSyncEnabled: enableBackgroundSync
  };
};

// Hook specifically for dashboard components
export const useDashboardRealtimeSync = () => {
  const queryClient = useQueryClient();
  
  // Listen for events that affect dashboard
  const events = useCrossModuleEvents([
    'portfolio_updated',
    'client_updated', 
    'task_completed',
    'scenario_calculated',
    'kpi_updated'
  ], useCallback((event: CrossModuleEvent) => {
    // Dashboard-specific update logic
    switch (event.type) {
      case 'portfolio_updated':
        // Refresh KPI panels that show portfolio metrics
        queryClient.invalidateQueries({ queryKey: ['kpi-summary'] });
        break;
      case 'client_updated':
        // Refresh client count and pipeline metrics
        queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['pipeline-overview'] });
        break;
      case 'task_completed':
        // Update task-related KPIs and notifications
        queryClient.invalidateQueries({ queryKey: ['kpi-summary'] });
        queryClient.invalidateQueries({ queryKey: ['enhanced-notifications'] });
        break;
    }
  }, [queryClient]));

  return { events };
};

// Hook for portfolio management components
export const usePortfolioRealtimeSync = (portfolioId?: string, clientId?: string) => {
  const queryClient = useQueryClient();
  
  const events = useCrossModuleEvents([
    'holding_added',
    'portfolio_updated',
    'scenario_calculated'
  ], useCallback((event: CrossModuleEvent) => {
    // Only process events related to this portfolio/client
    const isRelevant = 
      (portfolioId && 'portfolioId' in event.data && event.data.portfolioId === portfolioId) ||
      (clientId && 'clientId' in event.data && event.data.clientId === clientId);
    
    if (isRelevant) {
      switch (event.type) {
        case 'holding_added':
          // Refresh portfolio allocation charts
          queryClient.invalidateQueries({ queryKey: ['portfolio-holdings', portfolioId] });
          queryClient.invalidateQueries({ queryKey: ['portfolio-performance', portfolioId] });
          break;
        case 'portfolio_updated':
          // Refresh all portfolio-related data
          queryClient.invalidateQueries({ queryKey: ['portfolio-holdings', portfolioId] });
          queryClient.invalidateQueries({ queryKey: ['financial-portfolios'] });
          break;
        case 'scenario_calculated':
          // Update related scenario projections
          queryClient.invalidateQueries({ queryKey: ['latest-scenario'] });
          break;
      }
    }
  }, [portfolioId, clientId, queryClient]));

  // Helper to emit portfolio-related events
  const emitPortfolioEvent = useCallback((type: 'portfolio_updated' | 'holding_added', data: any) => {
    emitCrossModuleEvent({
      type,
      data: { ...data, portfolioId, clientId }
    });
  }, [portfolioId, clientId]);

  return { events, emitPortfolioEvent };
};

// Hook for compliance/task management components
export const useTaskRealtimeSync = (clientId?: string) => {
  const queryClient = useQueryClient();
  
  const events = useCrossModuleEvents([
    'task_completed',
    'client_updated',
    'pipeline_moved'
  ], useCallback((event: CrossModuleEvent) => {
    // Only process events related to this client
    const isRelevant = !clientId || 
      ('clientId' in event.data && event.data.clientId === clientId);
    
    if (isRelevant) {
      switch (event.type) {
        case 'task_completed':
          // Refresh task lists and compliance status
          queryClient.invalidateQueries({ queryKey: ['compliance-tasks'] });
          queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
          break;
        case 'client_updated':
          // Refresh client-specific tasks
          if (clientId) {
            queryClient.invalidateQueries({ 
              queryKey: ['compliance-tasks', { clientId }] 
            });
          }
          break;
        case 'pipeline_moved':
          // Update task templates and compliance requirements
          queryClient.invalidateQueries({ queryKey: ['task-templates'] });
          break;
      }
    }
  }, [clientId, queryClient]));

  // Helper to emit task-related events
  const emitTaskEvent = useCallback((type: 'task_completed', data: any) => {
    emitCrossModuleEvent({
      type,
      data: { ...data, clientId }
    });
  }, [clientId]);

  return { events, emitTaskEvent };
};

// Hook for scenario planning components
export const useScenarioRealtimeSync = (clientId?: string) => {
  const queryClient = useQueryClient();
  
  const events = useCrossModuleEvents([
    'portfolio_updated',
    'client_updated',
    'scenario_calculated'
  ], useCallback((event: CrossModuleEvent) => {
    const isRelevant = !clientId || 
      ('clientId' in event.data && event.data.clientId === clientId);
    
    if (isRelevant) {
      switch (event.type) {
        case 'portfolio_updated':
          // Portfolio changes might affect scenario parameters
          queryClient.invalidateQueries({ queryKey: ['latest-scenario'] });
          break;
        case 'client_updated':
          // Client info changes affect scenario calculations
          queryClient.invalidateQueries({ queryKey: ['financial-scenarios'] });
          break;
        case 'scenario_calculated':
          // Update scenario-related displays
          queryClient.invalidateQueries({ queryKey: ['latest-scenario'] });
          break;
      }
    }
  }, [clientId, queryClient]));

  // Helper to emit scenario events
  const emitScenarioEvent = useCallback((data: any) => {
    emitCrossModuleEvent({
      type: 'scenario_calculated',
      data: { ...data, clientId }
    });
  }, [clientId]);

  return { events, emitScenarioEvent };
};

// Hook for pipeline management components
export const usePipelineRealtimeSync = () => {
  const queryClient = useQueryClient();
  
  const events = useCrossModuleEvents([
    'pipeline_moved',
    'client_created',
    'client_updated',
    'task_completed'
  ], useCallback((event: CrossModuleEvent) => {
    switch (event.type) {
      case 'pipeline_moved':
        // Refresh pipeline overview and client positions
        queryClient.invalidateQueries({ queryKey: ['pipeline-overview'] });
        queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] });
        break;
      case 'client_created':
        // New clients appear in pipeline
        queryClient.invalidateQueries({ queryKey: ['pipeline-overview'] });
        break;
      case 'client_updated':
        // Client updates might affect pipeline display
        queryClient.invalidateQueries({ queryKey: ['pipeline-overview'] });
        break;
      case 'task_completed':
        // Task completion might trigger pipeline advancement
        queryClient.invalidateQueries({ queryKey: ['pipeline-overview'] });
        break;
    }
  }, [queryClient]));

  // Helper to emit pipeline events
  const emitPipelineEvent = useCallback((clientId: string, fromStage: string, toStage: string) => {
    emitCrossModuleEvent({
      type: 'pipeline_moved',
      data: { clientId, fromStage, toStage }
    });
  }, []);

  return { events, emitPipelineEvent };
};