import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar,
  FileText,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  checklists?: TaskChecklist[];
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

interface TaskChecklistProps {
  task: ComplianceTaskWithChecklists;
  onChecklistUpdate?: (taskId: string, checklistId: string, completed: boolean) => void;
  onTaskStatusUpdate?: (taskId: string, status: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<ComplianceTaskWithChecklists>) => void;
  isLoading?: boolean;
}

export default function TaskChecklistComponent({ 
  task, 
  onChecklistUpdate, 
  onTaskStatusUpdate, 
  onTaskUpdate,
  isLoading = false 
}: TaskChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [updatingChecklist, setUpdatingChecklist] = useState<string | null>(null);
  const { toast } = useToast();

  const checklists = task.checklists || [];
  const completedChecklists = checklists.filter(c => c.isCompleted).length;
  const totalChecklists = checklists.length;
  const completionProgress = totalChecklists > 0 ? (completedChecklists / totalChecklists) * 100 : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'completed': { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      'in_progress': { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800' },
      'pending': { variant: 'outline' as const, className: 'bg-amber-100 text-amber-800' },
      'cancelled': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    
    return (
      <Badge variant={config.variant} className={config.className} data-testid={`badge-status-${task.id}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      'high': 'bg-red-100 text-red-800 border-red-200',
      'medium': 'bg-amber-100 text-amber-800 border-amber-200',
      'low': 'bg-green-100 text-green-800 border-green-200',
    };
    
    return (
      <Badge variant="outline" className={variants[priority as keyof typeof variants]} data-testid={`badge-priority-${task.id}`}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const handleChecklistUpdate = async (checklistId: string, completed: boolean) => {
    if (!onChecklistUpdate) return;
    
    setUpdatingChecklist(checklistId);
    
    try {
      await onChecklistUpdate(task.id, checklistId, completed);
      toast({
        title: "Checklist Updated",
        description: `Task checklist item ${completed ? 'completed' : 'unchecked'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update checklist",
        variant: "destructive",
      });
    } finally {
      setUpdatingChecklist(null);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!onTaskStatusUpdate) return;
    
    try {
      await onTaskStatusUpdate(task.id, newStatus);
      toast({
        title: "Task Updated",
        description: `Task status changed to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <Card className={`transition-all duration-200 ${isOverdue ? 'border-red-300 bg-red-50/50' : ''}`} data-testid={`card-task-${task.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              task.status === 'completed' ? 'bg-green-100' :
              task.status === 'in_progress' ? 'bg-blue-100' :
              isOverdue ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              {getStatusIcon(task.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg font-semibold truncate" data-testid={`text-title-${task.id}`}>
                  {task.title}
                </CardTitle>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs" data-testid={`badge-overdue-${task.id}`}>
                    OVERDUE
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {getStatusBadge(task.status)}
                {getPriorityBadge(task.priority)}
                <Badge variant="outline" className="text-xs" data-testid={`badge-type-${task.id}`}>
                  {task.type.toUpperCase()}
                </Badge>
              </div>
              
              {task.description && (
                <p className="text-sm text-gray-600 mb-2" data-testid={`text-description-${task.id}`}>
                  {task.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                {task.client && (
                  <div className="flex items-center gap-1" data-testid={`text-client-${task.id}`}>
                    <User className="w-3 h-3" />
                    {task.client.firstName} {task.client.lastName}
                  </div>
                )}
                
                {task.dueDate && (
                  <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`} data-testid={`text-due-date-${task.id}`}>
                    <Calendar className="w-3 h-3" />
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
                
                {task.assignedToUser && (
                  <div className="flex items-center gap-1" data-testid={`text-assigned-to-${task.id}`}>
                    Assigned to: {task.assignedToUser.firstName} {task.assignedToUser.lastName}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {totalChecklists > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs"
                data-testid={`button-toggle-checklist-${task.id}`}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                Checklist ({completedChecklists}/{totalChecklists})
              </Button>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        {totalChecklists > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span data-testid={`text-progress-${task.id}`}>{Math.round(completionProgress)}%</span>
            </div>
            <Progress value={completionProgress} className="h-2" data-testid={`progress-${task.id}`} />
          </div>
        )}
      </CardHeader>

      {/* Checklist Content */}
      {isExpanded && totalChecklists > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Task Checklist</h4>
            
            {checklists.map((checklist) => (
              <div
                key={checklist.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                  checklist.isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}
                data-testid={`checklist-item-${checklist.id}`}
              >
                <Checkbox
                  checked={checklist.isCompleted}
                  onCheckedChange={(checked) => handleChecklistUpdate(checklist.id, checked as boolean)}
                  disabled={updatingChecklist === checklist.id || isLoading}
                  className="mt-0.5"
                  data-testid={`checkbox-${checklist.id}`}
                />
                
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${checklist.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {checklist.name}
                  </div>
                  
                  {checklist.description && (
                    <div className={`text-xs mt-1 ${checklist.isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                      {checklist.description}
                    </div>
                  )}
                  
                  {checklist.isCompleted && checklist.completedAt && (
                    <div className="text-xs text-gray-400 mt-1">
                      Completed {new Date(checklist.completedAt).toLocaleDateString()}
                      {checklist.completedBy && ` by ${checklist.completedBy}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {/* Action Buttons */}
      <CardContent className="pt-0 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {task.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate('in_progress')}
                disabled={isLoading}
                data-testid={`button-start-${task.id}`}
              >
                Start Task
              </Button>
            )}
            
            {task.status === 'in_progress' && completionProgress === 100 && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate('completed')}
                disabled={isLoading}
                data-testid={`button-complete-${task.id}`}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Task
              </Button>
            )}
            
            {task.status !== 'completed' && task.status !== 'cancelled' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={isLoading}
                data-testid={`button-cancel-${task.id}`}
              >
                Cancel
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={isLoading}
              data-testid={`button-view-details-${task.id}`}
            >
              <FileText className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}