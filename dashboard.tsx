import { useState, useEffect } from "react";
import { useRealtimeSync, useDashboardRealtimeSync } from "@/hooks/useRealtimeSync";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  FileText, 
  AlertCircle, 
  Calendar, 
  Calculator,
  Shield,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Upload,
  UserPlus,
  Target,
  Activity,
  Clock,
  CheckCircle2,
  CheckSquare,
  DollarSign,
  Briefcase,
  Home
} from "lucide-react";
import Header from "@/components/header";
import {
  useFinancialAuth,
  useFinancialDashboard,
  useFinancialClients,
  useFinancialPortfolios,
  useFinancialScenario,
  useFinancialComplianceTasks,
  useCreateFinancialClient,
  useUpdateComplianceTask,
  useGenerateReport,
  useComplianceManager,
  useTaskTemplates,
  useCreateTaskFromTemplate,
  useUpdateTaskChecklist
} from "@/lib/financial-auth";
import ScenarioProjectionsChart from "@/components/charts/scenario-projections-chart";
import { useToast } from "@/hooks/use-toast";
import HoldingsManager from "@/components/holdings-manager";
import InteractiveAllocationChart from "@/components/interactive-allocation-chart";
import PerformanceTrackingChart from "@/components/performance-tracking-chart";
import TaskManager from "@/components/compliance/task-manager";
import EnhancedKpiPanels from "@/components/enhanced-kpi-panels";
import PipelineManagement from "@/components/pipeline-management";
import NotificationCenter from "@/components/notification-center";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'prospect' | 'inactive';
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  portfolioValue: number;
  lastReview: string;
}

interface Portfolio {
  id: string;
  clientId: string;
  name: string;
  value: number;
  allocation: {
    equities: number;
    bonds: number;
    cash: number;
    alternatives: number;
  };
  performance: {
    ytd: number;
    oneYear: number;
    threeYear: number;
  };
}

interface Scenario {
  id: string;
  name: string;
  retirementAge: number;
  monthlyContribution: number;
  expectedReturn: number;
  projectedValue: number;
  projectedIncome: number;
}

interface ComplianceTask {
  id: string;
  client: string;
  type: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate: string;
  assignedTo: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useFinancialAuth();
  const { toast } = useToast();
  
  // Enable comprehensive real-time synchronization
  const { events: realtimeEvents, emitEvent } = useRealtimeSync({
    enableBackgroundSync: true,
    backgroundSyncInterval: 30000,
    enableEventLogging: import.meta.env.MODE === 'development'
  });
  
  // Dashboard-specific real-time updates
  useDashboardRealtimeSync();

  // All state hooks first
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    riskProfile: 'moderate' as const,
    annualIncome: ''
  });

  // API hooks
  const dashboardQuery = useFinancialDashboard();
  const clientsQuery = useFinancialClients();
  const portfoliosQuery = useFinancialPortfolios();
  const complianceTasksQuery = useFinancialComplianceTasks();
  const scenarioMutation = useFinancialScenario();
  const createClientMutation = useCreateFinancialClient();
  const updateTaskMutation = useUpdateComplianceTask();
  const generateReportMutation = useGenerateReport();

  // Comprehensive compliance hooks
  const complianceManager = useComplianceManager();
  const taskTemplatesQuery = useTaskTemplates();
  const createTaskFromTemplate = useCreateTaskFromTemplate();
  const updateTaskChecklist = useUpdateTaskChecklist();
  const createClientOnboardingTasks = useComplianceManager().createOnboarding;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  // Loading state AFTER all hooks
  if (!isAuthenticated || !user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>;
  }

  // Get data from API
  const clients = clientsQuery.data || [];
  const portfolios = portfoliosQuery.data || [];
  const complianceTasks = complianceTasksQuery.data || [];
  const dashboardStats = dashboardQuery.data?.stats || {
    totalClients: 0,
    totalAUM: 0,
    avgPerformance: 0,
    pendingTasks: 0,
  };
  const recentActivity = dashboardQuery.data?.recentActivity || [];

  // Fallback mock data (in case API is still loading)
  const fallbackClients: Client[] = [
    {
      id: '1',
      name: 'John Anderson',
      email: 'john.anderson@email.com',
      phone: '07700 900123',
      status: 'active',
      riskProfile: 'moderate',
      portfolioValue: 485000,
      lastReview: '2024-11-15'
    },
    {
      id: '2',
      name: 'Sarah Williams',
      email: 'sarah.williams@email.com',
      phone: '07700 900124',
      status: 'active',
      riskProfile: 'aggressive',
      portfolioValue: 750000,
      lastReview: '2024-12-01'
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'michael.brown@email.com',
      phone: '07700 900125',
      status: 'prospect',
      riskProfile: 'conservative',
      portfolioValue: 0,
      lastReview: '2024-12-10'
    }
  ];

  // Use API data or fallback to mock data if loading
  const displayClients = clients.length > 0 ? clients : fallbackClients;
  const displayPortfolios = portfolios.length > 0 ? portfolios : [];
  
  const fallbackPortfolios: Portfolio[] = [
    {
      id: '1',
      clientId: '1',
      name: 'Growth Portfolio',
      value: 485000,
      allocation: { equities: 65, bonds: 25, cash: 5, alternatives: 5 },
      performance: { ytd: 8.2, oneYear: 12.5, threeYear: 7.8 }
    },
    {
      id: '2',
      clientId: '2',
      name: 'Aggressive Growth',
      value: 750000,
      allocation: { equities: 80, bonds: 10, cash: 5, alternatives: 5 },
      performance: { ytd: 15.1, oneYear: 18.7, threeYear: 11.2 }
    }
  ];

  const fallbackComplianceTasks: ComplianceTask[] = [
    {
      id: '1',
      client: 'John Anderson',
      type: 'Annual Review',
      title: 'Portfolio Suitability Assessment',
      status: 'pending',
      dueDate: '2024-12-20',
      assignedTo: 'You'
    },
    {
      id: '2',
      client: 'Sarah Williams',
      type: 'KYC Update',
      title: 'Customer Due Diligence Refresh',
      status: 'in_progress',
      dueDate: '2024-12-25',
      assignedTo: 'You'
    },
    {
      id: '3',
      client: 'Michael Brown',
      type: 'Fact Find',
      title: 'Initial Client Fact Find',
      status: 'completed',
      dueDate: '2024-12-10',
      assignedTo: 'You'
    }
  ];

  // Enhanced scenario handler for the new component
  interface ScenarioParams {
    monthlyContribution: number;
    retirementAge: number;
    currentAge: number;
    expectedReturn: number;
    inflationRate: number;
  }

  const handleAddClient = async () => {
    try {
      const result = await createClientMutation.mutateAsync({
        firstName: newClient.name.split(' ')[0] || newClient.name,
        lastName: newClient.name.split(' ').slice(1).join(' ') || 'Unknown',
        email: newClient.email,
        phone: newClient.phone,
        riskTolerance: newClient.riskProfile,
        annualIncome: newClient.annualIncome ? parseFloat(newClient.annualIncome) : undefined,
      });
      
      // Emit cross-module event for client creation
      emitEvent({
        type: 'client_created',
        data: { 
          clientId: result.id || 'new-client', 
          clientData: { ...newClient, ...result } 
        }
      });
      
      toast({
        title: "Client Created",
        description: `${newClient.name} has been added to your client list.`,
      });
      
      setIsNewClientOpen(false);
      setNewClient({ name: '', email: '', phone: '', riskProfile: 'moderate', annualIncome: '' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create client",
        variant: "destructive",
      });
    }
  };

  const handleScenarioCalculation = async (params: ScenarioParams) => {
    try {
      const result = await scenarioMutation.mutateAsync({
        currentAge: params.currentAge,
        retirementAge: params.retirementAge,
        monthlyContribution: params.monthlyContribution,
        expectedReturn: params.expectedReturn,
        inflationRate: params.inflationRate,
        currentSavings: 0,
        clientId: selectedClient || undefined,
      });
      
      // Emit cross-module event for scenario calculation
      emitEvent({
        type: 'scenario_calculated',
        data: { 
          clientId: selectedClient,
          scenarioData: { ...params, result }
        }
      });
      
      toast({
        title: "Scenario Analysis Complete",
        description: `Advanced projections calculated with comprehensive scenarios`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to run scenario analysis",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = async (type: 'suitability' | 'portfolio', data: any) => {
    try {
      const result = await generateReportMutation.mutateAsync({ type, ...data });
      toast({
        title: "Report Generated",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'prospect':
        return <Badge variant="secondary">Prospect</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Advisory Platform</h1>
          <p className="text-gray-600">Complete practice management and client planning suite</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Enhanced Overview Dashboard */}
          <TabsContent value="overview" className="space-y-8">
            {/* Enhanced KPI Panels with Mini Charts */}
            <EnhancedKpiPanels />

            {/* Notification Center & Pipeline Management */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <PipelineManagement />
              </div>
              <div>
                <NotificationCenter />
              </div>
            </div>

            {/* Recent Activity & Key Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Activity className="h-5 w-5" />
                    Recent Client Activity
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Latest updates and portfolio changes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Sarah Williams</p>
                      <p className="text-xs text-gray-600">Portfolio rebalanced (+£12,500) - 2 hours ago</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      +2.3%
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">John Anderson</p>
                      <p className="text-xs text-gray-600">Suitability report generated - 1 day ago</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Review
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Michael Brown</p>
                      <p className="text-xs text-gray-600">Initial consultation completed - 3 days ago</p>
                    </div>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      New Client
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Emma Thompson</p>
                      <p className="text-xs text-gray-600">Risk assessment updated - 1 week ago</p>
                    </div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Risk Change
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <Target className="h-5 w-5" />
                    Priority Tasks
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    High-priority compliance and client tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(complianceTasks.length > 0 ? complianceTasks : fallbackComplianceTasks)
                    .filter(task => task.status !== 'completed')
                    .slice(0, 4)
                    .map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-600">{task.client} - Due: {task.dueDate}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span className="text-xs text-gray-500">{task.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(task.status)}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <Button variant="outline" className="w-full text-sm" data-testid="button-view-all-tasks">
                      View All Tasks ({complianceTasks.length > 0 ? complianceTasks.length : fallbackComplianceTasks.length})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clients Management */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search clients..." className="pl-10 w-64" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="prospect">Prospects</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>Create a new client profile</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        data-testid="input-client-name"
                        value={newClient.name}
                        onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        data-testid="input-client-email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone"
                        data-testid="input-client-phone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Risk Profile</Label>
                      <Select value={newClient.riskProfile} onValueChange={(value: any) => setNewClient({...newClient, riskProfile: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conservative">Conservative</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="aggressive">Aggressive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewClientOpen(false)} data-testid="button-cancel-client">Cancel</Button>
                    <Button onClick={handleAddClient} data-testid="button-add-client">Add Client</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {displayClients.map(client => (
                <Card key={client.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {client.name ? client.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{client.name}</h3>
                          <p className="text-gray-600">{client.email}</p>
                          <p className="text-sm text-gray-500">{client.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Portfolio Value</p>
                          <p className="text-lg font-semibold">£{client.portfolioValue.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Risk Profile</p>
                          <Badge variant="outline">{client.riskProfile}</Badge>
                        </div>
                        {getStatusBadge(client.status)}
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={async () => {
                              try {
                                await createClientOnboardingTasks(client.id);
                                toast({
                                  title: "Onboarding Tasks Created",
                                  description: "Standard compliance tasks have been created for this client",
                                });
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to create onboarding tasks",
                                  variant: "destructive",
                                });
                              }
                            }}
                            data-testid={`button-onboard-${client.id}`}
                            title="Create standard compliance tasks for this client"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Portfolio Management */}
          <TabsContent value="portfolios" className="space-y-6">
            {(displayPortfolios.length > 0 ? displayPortfolios : fallbackPortfolios).map(portfolio => {
              const client = displayClients.find(c => c.id === portfolio.clientId);
              
              // Transform portfolio data for charts
              const assetClassBreakdown = {
                equity: { 
                  value: portfolio.allocation ? portfolio.allocation.equities * portfolio.value / 100 : 0, 
                  percentage: portfolio.allocation ? portfolio.allocation.equities : 0 
                },
                bond: { 
                  value: portfolio.allocation ? portfolio.allocation.bonds * portfolio.value / 100 : 0, 
                  percentage: portfolio.allocation ? portfolio.allocation.bonds : 0 
                },
                cash: { 
                  value: portfolio.allocation ? portfolio.allocation.cash * portfolio.value / 100 : 0, 
                  percentage: portfolio.allocation ? portfolio.allocation.cash : 0 
                },
                alternative: { 
                  value: portfolio.allocation ? portfolio.allocation.alternatives * portfolio.value / 100 : 0, 
                  percentage: portfolio.allocation ? portfolio.allocation.alternatives : 0 
                }
              };

              return (
                <div key={portfolio.id} className="space-y-6">
                  {/* Portfolio Header Card */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{portfolio.name}</CardTitle>
                          <CardDescription className="text-base">
                            Client: {client?.name || 'Unknown Client'}
                          </CardDescription>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline" data-testid={`badge-account-type-${portfolio.id}`}>
                              {(portfolio as any).accountType || 'General Investment'}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              Provider: {(portfolio as any).provider || 'Not specified'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900" data-testid={`text-portfolio-value-${portfolio.id}`}>
                            £{portfolio.value.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {portfolio.performance.ytd >= 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`text-sm font-medium ${
                              portfolio.performance.ytd >= 0 ? 'text-green-600' : 'text-red-600'
                            }`} data-testid={`text-performance-ytd-${portfolio.id}`}>
                              {portfolio.performance.ytd >= 0 ? '+' : ''}{portfolio.performance.ytd}% YTD
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            1Y: {portfolio.performance.oneYear >= 0 ? '+' : ''}{portfolio.performance.oneYear}% | 
                            3Y: {portfolio.performance.threeYear >= 0 ? '+' : ''}{portfolio.performance.threeYear}%
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Quick Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateReport('portfolio', { portfolioId: portfolio.id })}
                          disabled={generateReportMutation.isPending}
                          data-testid={`button-generate-report-${portfolio.id}`}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Generate Report
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-view-performance-${portfolio.id}`}
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Performance
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-rebalance-${portfolio.id}`}
                        >
                          <Activity className="w-4 h-4 mr-2" />
                          Rebalance
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Holdings Management Section */}
                  <HoldingsManager
                    portfolioId={portfolio.id}
                    portfolioName={portfolio.name}
                    clientName={client?.name || 'Unknown Client'}
                  />

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Interactive Asset Allocation Chart */}
                    <InteractiveAllocationChart
                      assetClassBreakdown={assetClassBreakdown}
                      totalValue={portfolio.value}
                      title={`${portfolio.name} - Asset Allocation`}
                      description="Current portfolio allocation with detailed analytics"
                    />

                    {/* Performance Tracking Chart */}
                    <PerformanceTrackingChart
                      portfolioId={portfolio.id}
                      portfolioName={portfolio.name}
                      benchmarkName="FTSE All-World"
                    />
                  </div>

                  {/* Divider between portfolios */}
                  {(displayPortfolios.length > 0 ? displayPortfolios : fallbackPortfolios).length > 1 && 
                   portfolio.id !== (displayPortfolios.length > 0 ? displayPortfolios : fallbackPortfolios)[(displayPortfolios.length > 0 ? displayPortfolios : fallbackPortfolios).length - 1].id && (
                    <div className="border-t border-gray-200 my-8" />
                  )}
                </div>
              );
            })}

            {/* Empty State */}
            {(displayPortfolios.length === 0 && fallbackPortfolios.length === 0) && (
              <Card>
                <CardContent className="p-12">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Portfolios Found</h3>
                    <p className="text-gray-600 mb-4">
                      Get started by creating your first client portfolio or importing existing data.
                    </p>
                    <Button data-testid="button-create-portfolio">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Portfolio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Advanced Financial Planning & Scenario Modeling Engine */}
          <TabsContent value="planning" className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Advanced Scenario Modelling Engine</h2>
              <p className="text-gray-600">Interactive retirement planning with comprehensive projection analysis</p>
            </div>
            
            <ScenarioProjectionsChart
              className="w-full"
              onRunScenario={handleScenarioCalculation}
              isLoading={scenarioMutation.isPending}
              error={scenarioMutation.error?.message || null}
            />
          </TabsContent>

          {/* Comprehensive Compliance Management */}
          <TabsContent value="compliance" className="space-y-6">
            <TaskManager
              tasks={complianceManager.tasks}
              clients={displayClients.map(c => ({
                id: c.id,
                firstName: c.name?.split(' ')[0] || '',
                lastName: c.name?.split(' ')[1] || '',
                email: c.email,
                status: c.status
              }))}
              users={[
                {
                  id: user?.id || '',
                  firstName: user?.firstName || '',
                  lastName: user?.lastName || '',
                  email: user?.email || ''
                }
              ]}
              templates={taskTemplatesQuery.data || []}
              isLoading={complianceManager.isLoadingTasks || complianceManager.isLoadingTemplates}
              onCreateTask={async (taskData) => {
                await complianceManager.createTask(taskData);
                toast({
                  title: "Task Created",
                  description: "New compliance task has been created successfully",
                });
              }}
              onUpdateTask={async (taskId, updates) => {
                await complianceManager.updateTask({ taskId, updates });
                toast({
                  title: "Task Updated",
                  description: "Task has been updated successfully",
                });
              }}
              onDeleteTask={async (taskId) => {
                await complianceManager.deleteTask(taskId);
                toast({
                  title: "Task Deleted",
                  description: "Task has been cancelled successfully",
                });
              }}
              onChecklistUpdate={async (taskId, checklistId, completed) => {
                await complianceManager.updateChecklist({ taskId, checklistId, completed });
                toast({
                  title: "Checklist Updated",
                  description: `Checklist item ${completed ? 'completed' : 'unchecked'}`,
                });
              }}
              onTaskStatusUpdate={async (taskId, status) => {
                await complianceManager.updateStatus({ taskId, status });
                toast({
                  title: "Status Updated",
                  description: `Task status changed to ${status.replace('_', ' ')}`,
                });
              }}
              onCreateFromTemplate={async (templateId, clientId, assignedTo, dueDate) => {
                await complianceManager.createFromTemplate({ templateId, clientId, assignedTo, dueDate });
                toast({
                  title: "Task Created",
                  description: "Task created successfully from template",
                });
              }}
              onRefresh={async () => {
                await Promise.all([
                  complianceManager.refetchTasks(),
                  complianceManager.refetchTemplates()
                ]);
                toast({
                  title: "Refreshed",
                  description: "Data has been refreshed successfully",
                });
              }}
              onExportTasks={async () => {
                // TODO: Implement CSV export functionality
                toast({
                  title: "Export Started",
                  description: "Task export will be available soon",
                });
              }}
            />
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Suitability Reports</CardTitle>
                  <CardDescription>Generate client suitability assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {displayClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="w-full mt-4">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Reports</CardTitle>
                  <CardDescription>Performance and allocation reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select portfolio" />
                    </SelectTrigger>
                    <SelectContent>
                      {fallbackPortfolios.map(portfolio => (
                        <SelectItem key={portfolio.id} value={portfolio.id}>{portfolio.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="w-full mt-4">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Reports</CardTitle>
                  <CardDescription>Regulatory and audit reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kyc">KYC Summary</SelectItem>
                      <SelectItem value="suitability">Suitability Overview</SelectItem>
                      <SelectItem value="audit">Audit Trail</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full mt-4">
                    <Shield className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}