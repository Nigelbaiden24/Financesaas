import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users,
  Download,
  Calendar,
  FileText,
  Target,
  BarChart3,
  RefreshCw
} from "lucide-react";
import TaskChecklistComponent from "./task-checklist";
import { useToast } from "@/hooks/use-toast";

interface ComplianceTaskWithChecklists {
  id: string;
  organizationId: string;
  clientId?: string;
  assignedTo?: string;
  createdBy?: string;
  type: string;
  category: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  checklists?: any[];
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedToUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface TaskTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: number;
  checklists: {
    name: string;
    description: string;
    sortOrder: number;
  }[];
  isActive: boolean;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface TaskManagerProps {
  tasks: ComplianceTaskWithChecklists[];
  clients: Client[];
  users: User[];
  templates: TaskTemplate[];
  isLoading?: boolean;
  onCreateTask?: (task: Partial<ComplianceTaskWithChecklists>) => void;
  onUpdateTask?: (taskId: string, updates: Partial<ComplianceTaskWithChecklists>) => void;
  onDeleteTask?: (taskId: string) => void;
  onChecklistUpdate?: (taskId: string, checklistId: string, completed: boolean) => void;
  onTaskStatusUpdate?: (taskId: string, status: string) => void;
  onCreateFromTemplate?: (templateId: string, clientId: string, assignedTo: string, dueDate?: string) => void;
  onRefresh?: () => void;
  onExportTasks?: () => void;
}

export default function TaskManager({
  tasks = [],
  clients = [],
  users = [],
  templates = [],
  isLoading = false,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onChecklistUpdate,
  onTaskStatusUpdate,
  onCreateFromTemplate,
  onRefresh,
  onExportTasks
}: TaskManagerProps) {
  const { toast } = useToast();
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [overdueFilter, setOverdueFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  
  // State for creating new tasks
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: '',
    priority: 'medium' as const,
    clientId: '',
    assignedTo: '',
    dueDate: ''
  });
  
  // State for template creation
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateData, setTemplateData] = useState({
    clientId: '',
    assignedTo: '',
    dueDate: ''
  });

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.client?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.client?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesType = typeFilter === "all" || task.type === typeFilter;
    const matchesClient = clientFilter === "all" || task.clientId === clientFilter;
    const matchesAssignee = assigneeFilter === "all" || task.assignedTo === assigneeFilter;
    
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
    const matchesOverdue = !overdueFilter || isOverdue;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType && 
           matchesClient && matchesAssignee && matchesOverdue;
  });

  // Group tasks by status for kanban view
  const tasksByStatus = {
    pending: filteredTasks.filter(t => t.status === 'pending'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
    cancelled: filteredTasks.filter(t => t.status === 'cancelled')
  };

  // Task statistics
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length,
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.clientId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await onCreateTask?.(newTask);
      setIsCreateDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        type: '',
        priority: 'medium',
        clientId: '',
        assignedTo: '',
        dueDate: ''
      });
      toast({
        title: "Task Created",
        description: "New compliance task has been created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate || !templateData.clientId) {
      toast({
        title: "Validation Error",
        description: "Please select a template and client",
        variant: "destructive",
      });
      return;
    }

    try {
      await onCreateFromTemplate?.(
        selectedTemplate, 
        templateData.clientId, 
        templateData.assignedTo, 
        templateData.dueDate
      );
      setIsTemplateDialogOpen(false);
      setSelectedTemplate('');
      setTemplateData({ clientId: '', assignedTo: '', dueDate: '' });
      toast({
        title: "Task Created",
        description: "Task created successfully from template",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create task from template",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setTypeFilter("all");
    setClientFilter("all");
    setAssigneeFilter("all");
    setOverdueFilter(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" data-testid="heading-compliance-dashboard">
            Compliance Dashboard
          </h2>
          <p className="text-gray-600">Manage KYC, suitability assessments, and regulatory requirements</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={onRefresh} disabled={isLoading} data-testid="button-refresh">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outline" onClick={onExportTasks} data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-from-template">
                <Target className="w-4 h-4 mr-2" />
                From Template
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-template">
              <DialogHeader>
                <DialogTitle>Create Task from Template</DialogTitle>
                <DialogDescription>
                  Select a template and assign it to a client
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="template" className="text-right">Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="col-span-3" data-testid="select-template">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="client" className="text-right">Client</Label>
                  <Select value={templateData.clientId} onValueChange={(value) => setTemplateData(prev => ({ ...prev, clientId: value }))}>
                    <SelectTrigger className="col-span-3" data-testid="select-template-client">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.firstName} {client.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assignee" className="text-right">Assign to</Label>
                  <Select value={templateData.assignedTo} onValueChange={(value) => setTemplateData(prev => ({ ...prev, assignedTo: value }))}>
                    <SelectTrigger className="col-span-3" data-testid="select-template-assignee">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right">Due Date</Label>
                  <Input
                    type="date"
                    className="col-span-3"
                    value={templateData.dueDate}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, dueDate: e.target.value }))}
                    data-testid="input-template-due-date"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={handleCreateFromTemplate} disabled={isLoading} data-testid="button-create-from-template">
                  Create Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-task">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" data-testid="dialog-new-task">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Create a custom compliance task
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title*</Label>
                  <Input
                    id="title"
                    className="col-span-3"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Task title"
                    data-testid="input-task-title"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Type</Label>
                  <Select value={newTask.type} onValueChange={(value) => setNewTask(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="col-span-3" data-testid="select-task-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kyc">KYC</SelectItem>
                      <SelectItem value="suitability">Suitability</SelectItem>
                      <SelectItem value="annual_review">Annual Review</SelectItem>
                      <SelectItem value="fact_find">Fact Find</SelectItem>
                      <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                      <SelectItem value="compliance_check">Compliance Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="col-span-3" data-testid="select-task-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="client" className="text-right">Client*</Label>
                  <Select value={newTask.clientId} onValueChange={(value) => setNewTask(prev => ({ ...prev, clientId: value }))}>
                    <SelectTrigger className="col-span-3" data-testid="select-task-client">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.firstName} {client.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assignee" className="text-right">Assign to</Label>
                  <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask(prev => ({ ...prev, assignedTo: value }))}>
                    <SelectTrigger className="col-span-3" data-testid="select-task-assignee">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    className="col-span-3"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    data-testid="input-task-due-date"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Textarea
                    id="description"
                    className="col-span-3"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Task description"
                    rows={3}
                    data-testid="textarea-task-description"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={handleCreateTask} disabled={isLoading} data-testid="button-create-task">
                  Create Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card data-testid="card-stats-total">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-600">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-stats-pending">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-stats-progress">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-stats-completed">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-stats-overdue">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                <p className="text-xs text-gray-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Task Filters</h3>
            <Button variant="outline" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger data-testid="select-priority-filter">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger data-testid="select-type-filter">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="kyc">KYC</SelectItem>
                  <SelectItem value="suitability">Suitability</SelectItem>
                  <SelectItem value="annual_review">Annual Review</SelectItem>
                  <SelectItem value="fact_find">Fact Find</SelectItem>
                  <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                  <SelectItem value="compliance_check">Compliance Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger data-testid="select-client-filter">
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger data-testid="select-assignee-filter">
                  <SelectValue placeholder="All assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={overdueFilter}
                  onChange={(e) => setOverdueFilter(e.target.checked)}
                  className="rounded"
                  data-testid="checkbox-overdue-filter"
                />
                <span>Show only overdue</span>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" data-testid="heading-filtered-tasks">
            Tasks ({filteredTasks.length})
          </h3>
        </div>
        
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Found</h3>
                <p className="text-gray-600 mb-4">
                  {tasks.length === 0 
                    ? "No compliance tasks have been created yet." 
                    : "No tasks match your current filters."
                  }
                </p>
                <div className="space-x-2">
                  <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-task">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                  {tasks.length > 0 && (
                    <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters-empty">
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <TaskChecklistComponent
                key={task.id}
                task={task}
                onChecklistUpdate={onChecklistUpdate}
                onTaskStatusUpdate={onTaskStatusUpdate}
                onTaskUpdate={onUpdateTask}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}