import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  PieChart, 
  TrendingUp, 
  Shield,
  Activity,
  Plus,
  Home,
  Target,
  FileText,
  BarChart3
} from "lucide-react";

// Import our new components
import ClientList from './client-management/client-list';
import ClientForm from './client-management/client-form';
import HouseholdList from './client-management/household-list';
import PortfolioAllocationChart from './charts/portfolio-allocation-chart';
import PerformanceChart from './charts/performance-chart';
import ScenarioProjectionsChart from './charts/scenario-projections-chart';

// Import mock data
import { 
  mockClients, 
  mockPortfolios, 
  mockHouseholds,
  mockDashboardStats,
  mockPerformanceData,
  mockAllocationData,
  mockRecentActivity,
  mockComplianceTasks,
  type Client
} from '../data/mock-financial-data';

export default function ModernDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [clients] = useState(mockClients);
  const [portfolios] = useState(mockPortfolios);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [clientFormMode, setClientFormMode] = useState<'create' | 'edit'>('create');
  const [households] = useState(mockHouseholds);

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setClientFormMode('edit');
    setIsClientFormOpen(true);
  };

  const handleDeleteClient = (clientId: string) => {
    // In real app, this would make an API call
    console.log('Delete client:', clientId);
  };

  const handleViewClient = (client: Client) => {
    console.log('View client:', client);
    // Navigate to detailed client view
  };

  const handleAddClient = () => {
    setSelectedClient(null);
    setClientFormMode('create');
    setIsAddClientOpen(true);
  };

  const handleSaveClient = (clientData: Partial<Client>) => {
    console.log('Save client:', clientData);
    setIsClientFormOpen(false);
    setIsAddClientOpen(false);
    // In real app, this would make an API call to save
  };

  const handleCancelClient = () => {
    setIsClientFormOpen(false);
    setIsAddClientOpen(false);
    setSelectedClient(null);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: "default" as const, label: "Active" },
      prospect: { variant: "secondary" as const, label: "Prospect" },
      inactive: { variant: "outline" as const, label: "Inactive" },
      pending: { variant: "outline" as const, label: "Pending" },
      in_progress: { variant: "default" as const, label: "In Progress", className: "bg-blue-100 text-blue-800" },
      completed: { variant: "default" as const, label: "Completed", className: "bg-green-100 text-green-800" },
      overdue: { variant: "destructive" as const, label: "Overdue" }
    };
    
    const config = variants[status as keyof typeof variants] || variants.prospect;
    return (
      <Badge variant={config.variant} className={config.className || undefined}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Financial Planning Platform
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Comprehensive practice management and client planning suite
          </p>
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation - Mobile Responsive */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 h-auto">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                <Home className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="clients" className="text-xs sm:text-sm">
                <Users className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Clients</span>
              </TabsTrigger>
              <TabsTrigger value="households" className="text-xs sm:text-sm">
                <Home className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Households</span>
              </TabsTrigger>
              <TabsTrigger value="portfolios" className="text-xs sm:text-sm">
                <PieChart className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Portfolios</span>
              </TabsTrigger>
              <TabsTrigger value="planning" className="text-xs sm:text-sm">
                <Target className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Planning</span>
              </TabsTrigger>
              <TabsTrigger value="compliance" className="text-xs sm:text-sm">
                <Shield className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Compliance</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-xs sm:text-sm">
                <FileText className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Dashboard */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockDashboardStats.totalClients}</div>
                  <p className="text-xs text-muted-foreground">
                    {mockDashboardStats.activeClients} active, {mockDashboardStats.prospects} prospects
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assets Under Management</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    £{(mockDashboardStats.totalAUM / 1000000).toFixed(2)}M
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across {mockDashboardStats.portfoliosUnderManagement} portfolios
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    +{mockDashboardStats.avgPerformance}%
                  </div>
                  <p className="text-xs text-muted-foreground">YTD returns</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {mockDashboardStats.pendingTasks}
                  </div>
                  <p className="text-xs text-muted-foreground">Compliance & reviews</p>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Charts - Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Portfolio Allocation Chart */}
              <PortfolioAllocationChart 
                data={mockAllocationData} 
                title="Overall Asset Allocation"
                className="lg:col-span-1"
              />
              
              {/* Performance Chart */}
              <PerformanceChart 
                data={mockPerformanceData}
                title="Portfolio Performance"
                showComparison={true}
                className="lg:col-span-2"
              />
            </div>

            {/* Recent Activity & Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockRecentActivity.slice(0, 4).map(activity => (
                    <div key={activity.id} className="flex items-start space-x-4">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'completed' ? 'bg-green-500' : 
                        activity.status === 'scheduled' ? 'bg-blue-500' : 'bg-orange-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.client}</p>
                        <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Compliance Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockComplianceTasks
                    .filter(task => task.status !== 'completed')
                    .slice(0, 4)
                    .map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        <p className="text-xs text-gray-600">{task.client} • Due: {task.dueDate}</p>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clients Management with New Components */}
          <TabsContent value="clients">
            <ClientList
              clients={clients}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
              onViewClient={handleViewClient}
              onAddClient={handleAddClient}
              isLoading={false}
            />
          </TabsContent>

          {/* Households Management */}
          <TabsContent value="households">
            <HouseholdList
              households={households}
              clients={clients}
              onEditHousehold={(household) => console.log('Edit household:', household)}
              onDeleteHousehold={(id) => console.log('Delete household:', id)}
              onViewHousehold={(household) => console.log('View household:', household)}
              onAddHousehold={() => console.log('Add household')}
              isLoading={false}
            />
          </TabsContent>

          {/* Portfolio Analytics */}
          <TabsContent value="portfolios" className="space-y-6">
            {/* Portfolio Performance Overview */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <PerformanceChart 
                data={mockPerformanceData}
                title="Combined Portfolio Performance"
                showComparison={true}
              />
              <PortfolioAllocationChart 
                data={mockAllocationData}
                title="Asset Allocation Distribution"
              />
            </div>

            {/* Individual Portfolios */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Portfolio Management</CardTitle>
                  <CardDescription>Manage individual client portfolios</CardDescription>
                </div>
                <Button data-testid="button-add-portfolio">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Portfolio
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolios.map(portfolio => {
                    const client = clients.find(c => c.id === portfolio.clientId);
                    return (
                      <Card key={portfolio.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold">{portfolio.name}</h3>
                              <p className="text-gray-600">{client?.name}</p>
                              <p className="text-sm text-gray-500">{portfolio.provider} • {portfolio.accountType}</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                              <div>
                                <p className="text-sm text-gray-500">Value</p>
                                <p className="font-semibold">£{portfolio.value.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">YTD</p>
                                <p className={`font-semibold ${portfolio.performance.ytd > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {portfolio.performance.ytd > 0 ? '+' : ''}{portfolio.performance.ytd}%
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">1Y</p>
                                <p className={`font-semibold ${portfolio.performance.oneYear > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {portfolio.performance.oneYear > 0 ? '+' : ''}{portfolio.performance.oneYear}%
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" data-testid={`button-view-portfolio-${portfolio.id}`}>
                                  View
                                </Button>
                                <Button variant="outline" size="sm" data-testid={`button-edit-portfolio-${portfolio.id}`}>
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Planning with Interactive Charts */}
          <TabsContent value="planning" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Interactive Scenario Projections */}
              <ScenarioProjectionsChart 
                onParamsChange={(params) => console.log('Scenario params updated:', params)}
              />
              
              {/* Additional Planning Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Planning Tools</CardTitle>
                    <CardDescription>Financial planning calculators and scenarios</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" data-testid="button-retirement-calculator">
                      <Target className="w-4 h-4 mr-2" />
                      Retirement Calculator
                    </Button>
                    <Button variant="outline" className="w-full justify-start" data-testid="button-education-planner">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Education Planner
                    </Button>
                    <Button variant="outline" className="w-full justify-start" data-testid="button-tax-optimizer">
                      <PieChart className="w-4 h-4 mr-2" />
                      Tax Optimizer
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Scenarios</CardTitle>
                    <CardDescription>Common planning scenarios for clients</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium">Early Retirement (Age 55)</h4>
                      <p className="text-sm text-gray-600">£2M target, 8.5% returns</p>
                      <p className="text-sm font-semibold text-green-600">85% probability</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium">House Purchase</h4>
                      <p className="text-sm text-gray-600">£80k deposit in 3 years</p>
                      <p className="text-sm font-semibold text-green-600">92% probability</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Compliance Dashboard</CardTitle>
                  <CardDescription>Track regulatory requirements and client reviews</CardDescription>
                </div>
                <Button data-testid="button-add-task">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockComplianceTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{task.title}</h3>
                          {getStatusBadge(task.status)}
                        </div>
                        <p className="text-sm text-gray-600">{task.client} • {task.type}</p>
                        <p className="text-xs text-gray-500">Due: {task.dueDate} • Assigned to: {task.assignedTo}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" data-testid={`button-view-task-${task.id}`}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-edit-task-${task.id}`}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Generation</CardTitle>
                <CardDescription>Generate client reports and regulatory documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex flex-col gap-2" data-testid="button-suitability-report">
                    <FileText className="w-6 h-6" />
                    <span>Suitability Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2" data-testid="button-portfolio-report">
                    <PieChart className="w-6 h-6" />
                    <span>Portfolio Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2" data-testid="button-compliance-report">
                    <Shield className="w-6 h-6" />
                    <span>Compliance Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Client Form Dialogs */}
      <Dialog open={isClientFormOpen} onOpenChange={setIsClientFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {clientFormMode === 'create' ? 'Add New Client' : 'Edit Client'}
            </DialogTitle>
            <DialogDescription>
              {clientFormMode === 'create' 
                ? 'Create a comprehensive client profile'
                : 'Update client information and details'
              }
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            client={selectedClient || undefined}
            onSave={handleSaveClient}
            onCancel={handleCancelClient}
            mode={clientFormMode}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Create a comprehensive client profile with all relevant details
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            onSave={handleSaveClient}
            onCancel={handleCancelClient}
            mode="create"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}