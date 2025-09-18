import { useState, useCallback } from "react";
import { usePipelineRealtimeSync } from "@/hooks/useRealtimeSync";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  DollarSign,
  Calendar,
  Target,
  MoreHorizontal,
  Edit,
  MessageSquare
} from "lucide-react";
import { usePipelineOverview, useUpdateClientStage } from "@/lib/financial-auth";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  enteredAt: Date;
  expectedCompletion: Date;
  completionPercentage: number;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  notes: string;
  portfolioValue: number;
}

interface PipelineStage {
  stageId: string;
  stageName: string;
  stageColor: string;
  clients: Client[];
}

const PipelineManagement = () => {
  const { toast } = useToast();
  const { data: pipelineData, isLoading, refetch } = usePipelineOverview();
  const updateClientStageMutation = useUpdateClientStage();
  
  // Enable real-time pipeline synchronization
  const { events, emitPipelineEvent } = usePipelineRealtimeSync();
  
  const [draggedClient, setDraggedClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [stageNotes, setStageNotes] = useState("");

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Client Pipeline</CardTitle>
          <CardDescription>Loading pipeline data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-32 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const stages: PipelineStage[] = pipelineData?.stages || [];
  const metrics = pipelineData?.metrics || {};

  const handleDragStart = (client: Client) => {
    setDraggedClient(client);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    
    if (!draggedClient) return;

    // Don't do anything if dropping on the same stage
    const currentStage = stages.find(stage => 
      stage.clients.some(client => client.id === draggedClient.id)
    );
    
    if (currentStage?.stageId === targetStageId) {
      setDraggedClient(null);
      return;
    }

    try {
      await updateClientStageMutation.mutateAsync({
        clientId: draggedClient.id,
        stageId: targetStageId,
        notes: `Moved from ${currentStage?.stageName} to ${stages.find(s => s.stageId === targetStageId)?.stageName}`
      });
      
      // Emit real-time pipeline event
      emitPipelineEvent(
        draggedClient.id,
        currentStage?.stageId || 'unknown',
        targetStageId
      );
      
      toast({
        title: "Stage Updated",
        description: `${draggedClient.name} moved to new stage successfully.`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update client stage",
        variant: "destructive",
      });
    }
    
    setDraggedClient(null);
  };

  const handleUpdateStage = async () => {
    if (!selectedClient) return;
    
    try {
      await updateClientStageMutation.mutateAsync({
        clientId: selectedClient.id,
        stageId: selectedClient.id, // This would be the new stage ID in real implementation
        notes: stageNotes
      });
      
      toast({
        title: "Notes Updated",
        description: "Client stage notes updated successfully.",
      });
      
      setSelectedClient(null);
      setStageNotes("");
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update notes",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysUntilCompletion = (expectedDate: Date) => {
    const now = new Date();
    const expected = new Date(expectedDate);
    const diffTime = expected.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.totalPipelineValue || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeClients || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Days in Pipeline</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avgDaysInPipeline || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.completionRate || 0}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Stages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Client Pipeline Stages
          </CardTitle>
          <CardDescription>
            Drag and drop clients between stages to update their progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stages.map((stage, index) => (
              <div
                key={stage.stageId}
                className="space-y-4"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.stageId)}
                data-testid={`pipeline-stage-${stage.stageId}`}
              >
                {/* Stage Header */}
                <div 
                  className="p-4 rounded-lg border-2 border-dashed border-gray-200"
                  style={{ borderColor: stage.stageColor }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.stageColor }}
                      />
                      <h3 className="font-semibold text-gray-900">{stage.stageName}</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stage.clients.length}
                    </Badge>
                  </div>
                  
                  {index < stages.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-auto mt-2" />
                  )}
                </div>

                {/* Clients in this stage */}
                <div className="space-y-3 min-h-[200px]">
                  {stage.clients.map((client) => (
                    <div
                      key={client.id}
                      draggable
                      onDragStart={() => handleDragStart(client)}
                      className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md cursor-move transition-shadow"
                      data-testid={`pipeline-client-${client.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{client.name}</h4>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(client.portfolioValue)}
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedClient(client);
                                setStageNotes(client.notes || "");
                              }}
                              data-testid={`button-edit-client-${client.id}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Client Stage</DialogTitle>
                              <DialogDescription>
                                Update notes and progress for {client.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="notes">Stage Notes</Label>
                                <Textarea
                                  id="notes"
                                  value={stageNotes}
                                  onChange={(e) => setStageNotes(e.target.value)}
                                  placeholder="Add notes about this client's progress..."
                                  data-testid="textarea-stage-notes"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button 
                                  onClick={handleUpdateStage}
                                  disabled={updateClientStageMutation.isPending}
                                  data-testid="button-update-stage"
                                >
                                  {updateClientStageMutation.isPending ? "Updating..." : "Update"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className="space-y-2">
                        <Progress 
                          value={client.completionPercentage} 
                          className="h-2"
                          data-testid={`progress-${client.id}`}
                        />
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            {client.completionPercentage}% complete
                          </span>
                          <Badge 
                            variant="outline" 
                            className={getPriorityColor(client.priority)}
                          >
                            {client.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {getDaysUntilCompletion(client.expectedCompletion)} days
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-xs">
                              {client.assignedTo?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      
                      {client.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <div className="flex items-start gap-1">
                            <MessageSquare className="h-3 w-3 text-gray-400 mt-0.5" />
                            <p className="text-gray-600">{client.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {stage.clients.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                      No clients in this stage
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PipelineManagement;