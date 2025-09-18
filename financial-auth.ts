import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { realtimeStateManager } from "@/lib/realtime-state-manager";

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'adviser' | 'paraplanner';
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Auth utilities
class AuthManager {
  private static ACCESS_TOKEN_KEY = 'financial_access_token';
  private static REFRESH_TOKEN_KEY = 'financial_refresh_token';
  private static USER_KEY = 'financial_user';

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static clearAuth(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getUser();
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Custom fetch wrapper that adds auth headers
const financialApiRequest = async (url: string, options: RequestInit = {}) => {
  const authHeaders = AuthManager.getAuthHeaders();
  
  const response = await fetch(`/api/financial${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    AuthManager.clearAuth();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Auth hooks
export const useFinancialAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['financial-auth-user'],
    queryFn: async () => {
      if (!AuthManager.isAuthenticated()) {
        return null;
      }
      try {
        const response = await financialApiRequest('/auth/user');
        return response.user;
      } catch (error) {
        AuthManager.clearAuth();
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch('/api/financial/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: (data) => {
      AuthManager.setAccessToken(data.accessToken);
      AuthManager.setRefreshToken(data.refreshToken);
      AuthManager.setUser(data.user);
      queryClient.setQueryData(['financial-auth-user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['financial-auth-user'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role?: string;
    }) => {
      const response = await fetch('/api/financial/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: (data) => {
      AuthManager.setAccessToken(data.accessToken);
      AuthManager.setRefreshToken(data.refreshToken);
      AuthManager.setUser(data.user);
      queryClient.setQueryData(['financial-auth-user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['financial-auth-user'] });
    },
  });

  const logout = () => {
    AuthManager.clearAuth();
    queryClient.clear();
    window.location.href = '/';
  };

  return {
    user,
    isLoading,
    isAuthenticated: AuthManager.isAuthenticated(),
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
};

// Financial planning data hooks
export const useFinancialDashboard = () => {
  return useQuery({
    queryKey: ['financial-dashboard'],
    queryFn: () => financialApiRequest('/dashboard'),
    enabled: AuthManager.isAuthenticated(),
  });
};

export const useFinancialClients = () => {
  return useQuery({
    queryKey: ['financial-clients'],
    queryFn: () => financialApiRequest('/clients'),
    enabled: AuthManager.isAuthenticated(),
  });
};

export const useFinancialPortfolios = () => {
  return useQuery({
    queryKey: ['financial-portfolios'],
    queryFn: () => financialApiRequest('/portfolios'),
    enabled: AuthManager.isAuthenticated(),
  });
};

export const useFinancialScenario = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (scenarioData: {
      currentAge: number;
      retirementAge: number;
      monthlyContribution: number;
      expectedReturn: number;
      inflationRate?: number;
      currentSavings?: number;
      clientId?: string;
    }) => {
      // Optimistic update for scenario results (show loading state)
      const optimisticScenario = {
        id: 'temp-' + Date.now(),
        ...scenarioData,
        scenarios: {
          conservative: { projectedValue: 0, monthlyIncome: 0 },
          moderate: { projectedValue: 0, monthlyIncome: 0 },
          aggressive: { projectedValue: 0, monthlyIncome: 0 }
        },
        isCalculating: true,
        createdAt: new Date().toISOString()
      };
      
      queryClient.setQueryData(['latest-scenario'], optimisticScenario);
      
      try {
        const result = await financialApiRequest('/scenarios/run', {
          method: 'POST',
          body: JSON.stringify(scenarioData),
        });
        return result;
      } catch (error) {
        // Remove optimistic data on error
        queryClient.removeQueries({ queryKey: ['latest-scenario'] });
        throw error;
      }
    },
    onSuccess: async (data, variables) => {
      // Store the actual scenario result
      queryClient.setQueryData(['latest-scenario'], data);
      
      // Cross-module invalidation for scenario updates
      await realtimeStateManager.invalidateScenarioRelated(variables.clientId);
      
      // Update dashboard metrics that may depend on scenario results
      queryClient.invalidateQueries({ queryKey: ['kpi-summary'] });
    },
    onError: (error) => {
      console.error('Scenario calculation failed:', error);
      queryClient.removeQueries({ queryKey: ['latest-scenario'] });
    },
  });
};

export const useFinancialComplianceTasks = () => {
  return useQuery({
    queryKey: ['compliance-tasks'],
    queryFn: () => financialApiRequest('/tasks'),
    enabled: AuthManager.isAuthenticated(),
  });
};

export const useCreateFinancialClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientData: any) => {
      // Optimistic update
      const optimisticClient = {
        id: 'temp-' + Date.now(),
        ...clientData,
        status: 'prospect',
        portfolioValue: 0,
        lastReview: new Date().toISOString().split('T')[0]
      };
      
      const { rollback } = realtimeStateManager.optimisticUpdate(
        ['financial-clients'],
        (old: any[] = []) => [...old, optimisticClient]
      );
      
      try {
        const result = await financialApiRequest('/clients', {
          method: 'POST',
          body: JSON.stringify(clientData),
        });
        return result;
      } catch (error) {
        rollback();
        throw error;
      }
    },
    onSuccess: async (data, variables) => {
      // Comprehensive cross-module invalidation
      await realtimeStateManager.invalidateClientRelated();
      
      // Trigger pipeline update for new prospect
      await realtimeStateManager.invalidatePipelineRelated();
    },
    onError: (error) => {
      console.error('Failed to create client:', error);
    },
  });
};

export const useUpdateFinancialClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...clientData }: any) => financialApiRequest(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-clients'] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
    },
  });
};

export const useCreateComplianceTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskData: any) => financialApiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
    },
  });
};

export const useUpdateComplianceTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...taskData }: any) => {
      // Optimistic update for task status
      const { rollback } = realtimeStateManager.optimisticUpdate(
        ['compliance-tasks'],
        (old: any[] = []) => old.map(task => 
          task.id === id ? { ...task, ...taskData, updatedAt: new Date() } : task
        )
      );
      
      try {
        const result = await financialApiRequest(`/tasks/${id}`, {
          method: 'PUT',
          body: JSON.stringify(taskData),
        });
        return result;
      } catch (error) {
        rollback();
        throw error;
      }
    },
    onSuccess: async (data, variables) => {
      // Cross-module invalidation for task updates
      await realtimeStateManager.invalidateTaskRelated(variables.clientId);
      
      // Update notification center if task is completed
      if (variables.status === 'completed') {
        queryClient.invalidateQueries({ queryKey: ['enhanced-notifications'] });
      }
    },
  });
};

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: ({ type, ...data }: { type: 'suitability' | 'portfolio' } & any) => 
      financialApiRequest(`/reports/${type}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
};

// Holdings management hooks
export const usePortfolioHoldings = (portfolioId: string | null) => {
  return useQuery({
    queryKey: ['portfolio-holdings', portfolioId],
    queryFn: () => {
      if (!portfolioId) throw new Error('Portfolio ID is required');
      return financialApiRequest(`/portfolios/${portfolioId}/holdings`);
    },
    enabled: AuthManager.isAuthenticated() && !!portfolioId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateHolding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ portfolioId, ...holdingData }: {
      portfolioId: string;
      symbol: string;
      name: string;
      assetClass: 'equity' | 'bond' | 'cash' | 'property' | 'commodity' | 'alternative';
      sector?: string;
      region?: string;
      quantity: number;
      averageCost?: number;
      currentPrice: number;
    }) => {
      // Optimistic update for new holding
      const optimisticHolding = {
        id: 'temp-' + Date.now(),
        portfolioId,
        ...holdingData,
        marketValue: holdingData.quantity * holdingData.currentPrice,
        gainLoss: 0,
        gainLossPercent: 0,
        createdAt: new Date().toISOString()
      };
      
      const { rollback } = realtimeStateManager.optimisticUpdate(
        ['portfolio-holdings', portfolioId],
        (old: any[] = []) => [...old, optimisticHolding]
      );
      
      try {
        const result = await financialApiRequest(`/portfolios/${portfolioId}/holdings`, {
          method: 'POST',
          body: JSON.stringify(holdingData),
        });
        return result;
      } catch (error) {
        rollback();
        throw error;
      }
    },
    onSuccess: async (data, variables) => {
      // Get portfolio data to find client ID
      const portfolioData = queryClient.getQueryData(['financial-portfolios']);
      const portfolio = Array.isArray(portfolioData) ? 
        portfolioData.find((p: any) => p.id === variables.portfolioId) : null;
      
      // Comprehensive cross-module invalidation
      await realtimeStateManager.invalidatePortfolioRelated(
        variables.portfolioId, 
        portfolio?.clientId
      );
      
      // Update scenario calculations if they depend on this portfolio
      await realtimeStateManager.invalidateScenarioRelated(portfolio?.clientId);
    },
  });
};

export const useUpdateHolding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ portfolioId, holdingId, ...holdingData }: {
      portfolioId: string;
      holdingId: string;
      symbol?: string;
      name?: string;
      assetClass?: 'equity' | 'bond' | 'cash' | 'property' | 'commodity' | 'alternative';
      sector?: string;
      region?: string;
      quantity?: number;
      averageCost?: number;
      currentPrice?: number;
    }) => financialApiRequest(`/portfolios/${portfolioId}/holdings/${holdingId}`, {
      method: 'PUT',
      body: JSON.stringify(holdingData),
    }),
    onSuccess: (data, variables) => {
      // Invalidate portfolio holdings
      queryClient.invalidateQueries({ queryKey: ['portfolio-holdings', variables.portfolioId] });
      // Invalidate specific holding cache
      queryClient.invalidateQueries({ queryKey: ['holding-details', variables.holdingId] });
      // Invalidate portfolios to update total values
      queryClient.invalidateQueries({ queryKey: ['financial-portfolios'] });
      // Invalidate dashboard to update summary stats
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
    },
  });
};

export const useDeleteHolding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ portfolioId, holdingId }: { portfolioId: string; holdingId: string }) => 
      financialApiRequest(`/portfolios/${portfolioId}/holdings/${holdingId}`, {
        method: 'DELETE',
      }),
    onSuccess: (data, variables) => {
      // Invalidate portfolio holdings
      queryClient.invalidateQueries({ queryKey: ['portfolio-holdings', variables.portfolioId] });
      // Remove specific holding from cache
      queryClient.removeQueries({ queryKey: ['holding-details', variables.holdingId] });
      // Invalidate portfolios to update total values
      queryClient.invalidateQueries({ queryKey: ['financial-portfolios'] });
      // Invalidate dashboard to update summary stats
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
    },
  });
};

export const useHoldingDetails = (portfolioId: string | null, holdingId: string | null) => {
  return useQuery({
    queryKey: ['holding-details', holdingId],
    queryFn: () => {
      if (!portfolioId || !holdingId) throw new Error('Portfolio ID and Holding ID are required');
      return financialApiRequest(`/portfolios/${portfolioId}/holdings/${holdingId}`);
    },
    enabled: AuthManager.isAuthenticated() && !!portfolioId && !!holdingId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Enhanced portfolio query with client relationship
export const useClientPortfolios = (clientId: string | null) => {
  return useQuery({
    queryKey: ['client-portfolios', clientId],
    queryFn: () => {
      if (!clientId) throw new Error('Client ID is required');
      return financialApiRequest(`/clients/${clientId}/portfolios`);
    },
    enabled: AuthManager.isAuthenticated() && !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Portfolio performance data hook
export const usePortfolioPerformance = (portfolioId: string | null, period: '1M' | '3M' | '6M' | '1Y' | '3Y' = '1Y') => {
  return useQuery({
    queryKey: ['portfolio-performance', portfolioId, period],
    queryFn: () => {
      if (!portfolioId) throw new Error('Portfolio ID is required');
      return financialApiRequest(`/portfolios/${portfolioId}/performance?period=${period}`);
    },
    enabled: AuthManager.isAuthenticated() && !!portfolioId,
    staleTime: 10 * 60 * 1000, // 10 minutes for performance data
  });
};

// ===================== COMPREHENSIVE COMPLIANCE TASK MANAGEMENT HOOKS =====================

export const useComplianceTasks = (filters?: {
  clientId?: string;
  assignedTo?: string;
  status?: string;
  type?: string;
  overdue?: boolean;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  return useQuery({
    queryKey: ['compliance-tasks', filters],
    queryFn: () => financialApiRequest(`/tasks?${queryParams.toString()}`),
    enabled: AuthManager.isAuthenticated(),
  });
};

export const useComplianceTask = (taskId: string) => {
  return useQuery({
    queryKey: ['compliance-task', taskId],
    queryFn: () => financialApiRequest(`/tasks/${taskId}`),
    enabled: AuthManager.isAuthenticated() && !!taskId,
  });
};


export const useDeleteComplianceTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => {
      return financialApiRequest(`/tasks/${taskId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
    },
  });
};

export const useUpdateTaskChecklist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, checklistId, completed }: {
      taskId: string;
      checklistId: string;
      completed: boolean;
    }) => {
      return financialApiRequest(`/tasks/${taskId}/checklist/${checklistId}`, {
        method: 'PUT',
        body: JSON.stringify({ completed }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-task', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['compliance-tasks'] });
    },
  });
};

// Task Templates Hooks
export const useTaskTemplates = () => {
  return useQuery({
    queryKey: ['task-templates'],
    queryFn: () => financialApiRequest('/task-templates'),
    enabled: AuthManager.isAuthenticated(),
  });
};

export const useCreateTaskFromTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, clientId, assignedTo, dueDate }: {
      templateId: string;
      clientId: string;
      assignedTo: string;
      dueDate?: string;
    }) => {
      return financialApiRequest(`/task-templates/${templateId}/create`, {
        method: 'POST',
        body: JSON.stringify({ clientId, assignedTo, dueDate }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
    },
  });
};

// Workflow Automation Hooks
export const useCreateClientOnboardingTasks = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (clientId: string) => {
      return financialApiRequest(`/workflow/onboard-client/${clientId}`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, status, notes }: {
      taskId: string;
      status: string;
      notes?: string;
    }) => {
      return financialApiRequest(`/workflow/task/${taskId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-task', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
    },
  });
};

export const useOverdueTasks = () => {
  return useQuery({
    queryKey: ['overdue-tasks'],
    queryFn: () => financialApiRequest('/tasks/overdue'),
    enabled: AuthManager.isAuthenticated(),
  });
};

// Comprehensive Compliance Manager Hook
export const useComplianceManager = () => {
  const tasksQuery = useComplianceTasks();
  const templatesQuery = useTaskTemplates();
  const overdueTasks = useOverdueTasks();
  
  const createTask = useCreateComplianceTask();
  const updateTask = useUpdateComplianceTask();
  const deleteTask = useDeleteComplianceTask();
  const updateChecklist = useUpdateTaskChecklist();
  const createFromTemplate = useCreateTaskFromTemplate();
  const updateStatus = useUpdateTaskStatus();
  const createOnboarding = useCreateClientOnboardingTasks();
  
  return {
    // Data
    tasks: tasksQuery.data || [],
    templates: templatesQuery.data || [],
    overdue: overdueTasks.data || [],
    
    // Loading states
    isLoadingTasks: tasksQuery.isLoading,
    isLoadingTemplates: templatesQuery.isLoading,
    
    // Actions
    createTask: createTask.mutateAsync,
    updateTask: updateTask.mutateAsync,
    deleteTask: deleteTask.mutateAsync,
    updateChecklist: updateChecklist.mutateAsync,
    createFromTemplate: createFromTemplate.mutateAsync,
    updateStatus: updateStatus.mutateAsync,
    createOnboarding: createOnboarding.mutateAsync,
    
    // Action states
    isCreating: createTask.isPending,
    isUpdating: updateTask.isPending,
    isDeleting: deleteTask.isPending,
    isUpdatingChecklist: updateChecklist.isPending,
    isCreatingFromTemplate: createFromTemplate.isPending,
    
    // Refresh functions
    refetchTasks: tasksQuery.refetch,
    refetchTemplates: templatesQuery.refetch,
    refetchOverdue: overdueTasks.refetch,
  };
};

// === Enhanced Dashboard Hooks ===

// Pipeline Management Hooks
export const usePipelineStages = () => {
  return useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: () => financialApiRequest('/pipeline/stages'),
    enabled: AuthManager.isAuthenticated(),
  });
};

export const usePipelineOverview = () => {
  return useQuery({
    queryKey: ['pipeline-overview'],
    queryFn: () => financialApiRequest('/pipeline/overview'),
    enabled: AuthManager.isAuthenticated(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useUpdateClientStage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ clientId, stageId, notes }: { clientId: string; stageId: string; notes?: string }) => {
      // Optimistic update for pipeline stage
      const { rollback } = realtimeStateManager.optimisticUpdate(
        ['pipeline-overview'],
        (old: any) => {
          if (!old?.stages) return old;
          
          const newStages = old.stages.map((stage: any) => ({
            ...stage,
            clients: stage.clients.filter((client: any) => client.id !== clientId)
          }));
          
          const targetStage = newStages.find((stage: any) => stage.stageId === stageId);
          if (targetStage) {
            const clientData = old.stages
              .flatMap((stage: any) => stage.clients)
              .find((client: any) => client.id === clientId);
            
            if (clientData) {
              targetStage.clients.push({
                ...clientData,
                notes: notes || clientData.notes,
                movedAt: new Date().toISOString()
              });
            }
          }
          
          return { ...old, stages: newStages };
        }
      );
      
      try {
        const result = await financialApiRequest(`/pipeline/client/${clientId}/stage`, {
          method: 'PUT',
          body: JSON.stringify({ stageId, notes }),
        });
        return result;
      } catch (error) {
        rollback();
        throw error;
      }
    },
    onSuccess: async (data, variables) => {
      // Comprehensive pipeline and client invalidation
      await realtimeStateManager.invalidatePipelineRelated();
      await realtimeStateManager.invalidateClientRelated(variables.clientId);
      
      // Trigger notification for pipeline movement
      realtimeStateManager.handleRealtimeUpdate({
        type: 'pipeline_moved',
        data: { clientId: variables.clientId, stageId: variables.stageId }
      });
    },
  });
};

// Enhanced Notifications Hooks
export const useEnhancedNotifications = (unreadOnly: boolean = false) => {
  return useQuery({
    queryKey: ['enhanced-notifications', unreadOnly],
    queryFn: () => financialApiRequest(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`),
    enabled: AuthManager.isAuthenticated(),
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      return financialApiRequest(`/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return financialApiRequest('/notifications/mark-all-read', {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-notifications'] });
    },
  });
};

// KPI and Analytics Hooks
export const useKpiHistorical = (metric?: string, period: string = '6months') => {
  return useQuery({
    queryKey: ['kpi-historical', metric, period],
    queryFn: () => financialApiRequest(`/kpi/historical?${metric ? `metric=${metric}&` : ''}period=${period}`),
    enabled: AuthManager.isAuthenticated(),
  });
};

export const useKpiSummary = () => {
  return useQuery({
    queryKey: ['kpi-summary'],
    queryFn: () => financialApiRequest('/kpi/summary'),
    enabled: AuthManager.isAuthenticated(),
    refetchInterval: 60000, // Refresh every minute
  });
};

export { AuthManager };