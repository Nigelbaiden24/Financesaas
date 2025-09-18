import { useState, useCallback, useEffect, memo, useMemo } from "react";
import { useDashboardRealtimeSync } from "@/hooks/useRealtimeSync";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  BarChart3, 
  CheckCircle2,
  Target,
  Activity,
  PieChart,
  Star,
  Info
} from "lucide-react";
import { useKpiSummary, useKpiHistorical } from "@/lib/financial-auth";
import SparklineChart from "./sparkline-chart";

interface KpiMetric {
  value: number;
  previousValue: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  sparklineData: number[];
}

interface KpiData {
  totalClients: KpiMetric;
  totalAUM: KpiMetric;
  avgPerformance: KpiMetric;
  pendingTasks: KpiMetric;
  activeScenarios: KpiMetric;
  pipelineValue: KpiMetric;
  clientSatisfaction: KpiMetric;
}

const EnhancedKpiPanels = memo(() => {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const { data: kpiData, isLoading } = useKpiSummary();
  const { data: historicalData } = useKpiHistorical(undefined, selectedPeriod);
  
  // Enable real-time synchronization for dashboard KPIs
  const { events } = useDashboardRealtimeSync();
  
  // Real-time event counter for UI feedback
  const [updateCount, setUpdateCount] = useState(0);
  
  // Track real-time events for KPI updates
  const handleRealtimeUpdate = useCallback(() => {
    setUpdateCount(prev => prev + 1);
  }, []);
  
  // Memoize formatting functions to prevent recreation on each render - MOVED TO TOP
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatPercentage = useCallback((value: number) => {
    if (value === null || value === undefined || isNaN(value)) return '0.0%';
    return `${value.toFixed(1)}%`;
  }, []);

  const formatChange = useCallback((change: number, isPercentage: boolean = false) => {
    const sign = change >= 0 ? '+' : '';
    const formatted = isPercentage ? `${change.toFixed(1)}%` : change.toString();
    return `${sign}${formatted}`;
  }, []);

  const getTrendIcon = useCallback((trend: string, change: number) => {
    if (Math.abs(change) < 0.1) return null;
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  }, []);

  const getTrendColor = useCallback((trend: string, change: number) => {
    if (Math.abs(change) < 0.1) return 'text-gray-500';
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  }, []);

  // Memoize color classes to prevent recreation - MOVED TO TOP
  const getColorClasses = useMemo(() => {
    const colors: Record<string, { border: string; bg: string; text: string; icon: string }> = {
      blue: { border: 'border-l-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
      green: { border: 'border-l-green-500', bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-500' },
      purple: { border: 'border-l-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500' },
      orange: { border: 'border-l-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', icon: 'text-orange-500' },
      indigo: { border: 'border-l-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-500' },
      teal: { border: 'border-l-teal-500', bg: 'bg-teal-50', text: 'text-teal-700', icon: 'text-teal-500' },
      amber: { border: 'border-l-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-500' },
    };
    return (color: string) => colors[color] || colors.blue;
  }, []);
  
  // Listen for relevant events with proper useEffect
  useEffect(() => {
    // Filter for KPI-relevant event types
    const kpiRelevantEvents = events.filter(event => 
      ['portfolio_updated', 'client_updated', 'task_completed', 'scenario_calculated', 'kpi_updated'].includes(event.type)
    );
    
    if (kpiRelevantEvents.length > 0) {
      handleRealtimeUpdate();
      console.log('KPI real-time update triggered:', kpiRelevantEvents.map(e => e.type));
    }
  }, [events, handleRealtimeUpdate]);

  // Define metrics data structure
  const metrics: KpiData = kpiData || {
    totalClients: { value: 0, previousValue: 0, change: 0, trend: 'neutral', sparklineData: [] },
    totalAUM: { value: 0, previousValue: 0, change: 0, trend: 'neutral', sparklineData: [] },
    avgPerformance: { value: 0, previousValue: 0, change: 0, trend: 'neutral', sparklineData: [] },
    pendingTasks: { value: 0, previousValue: 0, change: 0, trend: 'neutral', sparklineData: [] },
    activeScenarios: { value: 0, previousValue: 0, change: 0, trend: 'neutral', sparklineData: [] },
    pipelineValue: { value: 0, previousValue: 0, change: 0, trend: 'neutral', sparklineData: [] },
    clientSatisfaction: { value: 0, previousValue: 0, change: 0, trend: 'neutral', sparklineData: [] },
  };

  // Memoize KPI panels configuration to prevent recreation
  const kpiPanels = useMemo(() => [
    {
      id: 'total-clients',
      title: 'Total Clients',
      value: (metrics.totalClients?.value ?? 0).toString(),
      change: metrics.totalClients?.change ?? 0,
      trend: metrics.totalClients?.trend ?? 'neutral',
      sparklineData: metrics.totalClients?.sparklineData ?? [],
      icon: Users,
      color: 'blue',
      description: 'Active and prospect clients',
      tooltip: `Previous period: ${metrics.totalClients?.previousValue ?? 0} clients. ${formatChange(metrics.totalClients?.change ?? 0, true)} change.`
    },
    {
      id: 'total-aum',
      title: 'Assets Under Management',
      value: formatCurrency(metrics.totalAUM?.value ?? 0),
      change: metrics.totalAUM?.change ?? 0,
      trend: metrics.totalAUM?.trend ?? 'neutral',
      sparklineData: metrics.totalAUM?.sparklineData ?? [],
      icon: DollarSign,
      color: 'green',
      description: 'Total managed assets',
      tooltip: `Previous period: ${formatCurrency(metrics.totalAUM?.previousValue ?? 0)}. ${formatChange(metrics.totalAUM?.change ?? 0, true)} growth.`
    },
    {
      id: 'avg-performance',
      title: 'Average Performance',
      value: formatPercentage(metrics.avgPerformance?.value ?? 0),
      change: metrics.avgPerformance?.change ?? 0,
      trend: metrics.avgPerformance?.trend ?? 'neutral',
      sparklineData: metrics.avgPerformance?.sparklineData ?? [],
      icon: BarChart3,
      color: 'purple',
      description: 'Portfolio YTD performance',
      tooltip: `Previous period: ${formatPercentage(metrics.avgPerformance?.previousValue ?? 0)}. ${formatChange(metrics.avgPerformance?.change ?? 0, true)} change.`
    },
    {
      id: 'pending-tasks',
      title: 'Pending Tasks',
      value: (metrics.pendingTasks?.value ?? 0).toString(),
      change: metrics.pendingTasks?.change ?? 0,
      trend: metrics.pendingTasks?.trend === 'up' ? 'down' as const : metrics.pendingTasks?.trend === 'down' ? 'up' as const : 'neutral' as const, // Reverse trend for tasks (fewer is better)
      sparklineData: metrics.pendingTasks?.sparklineData ?? [],
      icon: CheckCircle2,
      color: 'orange',
      description: 'Outstanding compliance items',
      tooltip: `Previous period: ${metrics.pendingTasks?.previousValue ?? 0} tasks. ${formatChange(metrics.pendingTasks?.change ?? 0, true)} change.`
    },
    {
      id: 'active-scenarios',
      title: 'Active Scenarios',
      value: (metrics.activeScenarios?.value ?? 0).toString(),
      change: metrics.activeScenarios?.change ?? 0,
      trend: metrics.activeScenarios?.trend ?? 'neutral',
      sparklineData: metrics.activeScenarios?.sparklineData ?? [],
      icon: Target,
      color: 'indigo',
      description: 'Financial planning models',
      tooltip: `Previous period: ${metrics.activeScenarios?.previousValue ?? 0} scenarios. ${formatChange(metrics.activeScenarios?.change ?? 0, true)} change.`
    },
    {
      id: 'pipeline-value',
      title: 'Pipeline Value',
      value: formatCurrency(metrics.pipelineValue?.value ?? 0),
      change: metrics.pipelineValue?.change ?? 0,
      trend: metrics.pipelineValue?.trend ?? 'neutral',
      sparklineData: metrics.pipelineValue?.sparklineData ?? [],
      icon: Activity,
      color: 'teal',
      description: 'Prospective client value',
      tooltip: `Previous period: ${formatCurrency(metrics.pipelineValue?.previousValue ?? 0)}. ${formatChange(metrics.pipelineValue?.change ?? 0, true)} change.`
    },
    {
      id: 'client-satisfaction',
      title: 'Client Satisfaction',
      value: `${(metrics.clientSatisfaction?.value ?? 0).toFixed(1)}/5.0`,
      change: metrics.clientSatisfaction?.change ?? 0,
      trend: metrics.clientSatisfaction?.trend ?? 'neutral',
      sparklineData: metrics.clientSatisfaction?.sparklineData ?? [],
      icon: Star,
      color: 'amber',
      description: 'Average client rating',
      tooltip: `Previous period: ${(metrics.clientSatisfaction?.previousValue ?? 0).toFixed(1)}/5.0. ${formatChange(metrics.clientSatisfaction?.change ?? 0, true)} change.`
    }
  ], [metrics, formatCurrency, formatPercentage, formatChange]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Key Performance Indicators</h2>
            <p className="text-gray-600">Monitor your practice performance with real-time metrics</p>
          </div>
          <div className="flex items-center gap-2">
            {['3months', '6months', '1year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                data-testid={`button-period-${period}`}
              >
                {period === '3months' ? '3M' : period === '6months' ? '6M' : '1Y'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiPanels.map((panel) => {
            const colors = getColorClasses(panel.color);
            const IconComponent = panel.icon;
            const trendIcon = getTrendIcon(panel.trend, panel.change);
            const trendColor = getTrendColor(panel.trend, panel.change);

            return (
              <Tooltip key={panel.id}>
                <TooltipTrigger asChild>
                  <Card 
                    className={`${colors.border} border-l-4 hover:shadow-lg transition-shadow cursor-pointer group`}
                    data-testid={`kpi-card-${panel.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <IconComponent className={`h-4 w-4 ${colors.icon}`} />
                          {panel.title}
                        </CardTitle>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{panel.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <CardDescription className="text-xs">
                        {panel.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Main Value */}
                        <div className="flex items-end justify-between">
                          <div>
                            <p 
                              className="text-2xl font-bold text-gray-900"
                              data-testid={`value-${panel.id}`}
                            >
                              {panel.value}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              {trendIcon}
                              <span className={`text-sm font-medium ${trendColor}`}>
                                {formatChange(panel.change, true)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Sparkline Chart */}
                        <div className="h-12 group-hover:opacity-80 transition-opacity">
                          <SparklineChart 
                            data={panel.sparklineData}
                            color={panel.color}
                            trend={panel.trend as 'up' | 'down' | 'neutral'}
                          />
                        </div>

                        {/* Additional Context */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>vs last period</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              panel.trend === 'up' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : panel.trend === 'down'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            {panel.trend === 'up' ? 'Growing' : panel.trend === 'down' ? 'Declining' : 'Stable'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-medium">{panel.title}</p>
                    <p className="text-sm">{panel.tooltip}</p>
                    <div className="text-xs space-y-1">
                      <div>Current: {panel.value}</div>
                      <div>Change: {formatChange(panel.change, true)}</div>
                      <div>Trend: {panel.trend}</div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Summary Row */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <PieChart className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-lg font-semibold text-blue-900">Practice Overview</span>
                </div>
                <p className="text-sm text-blue-700">
                  Managing {metrics.totalClients?.value ?? 0} clients with {formatCurrency(metrics.totalAUM?.value ?? 0)} AUM
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-lg font-semibold text-green-900">Performance</span>
                </div>
                <p className="text-sm text-green-700">
                  Average {formatPercentage(metrics.avgPerformance?.value ?? 0)} returns with {(metrics.clientSatisfaction?.value ?? 0).toFixed(1)}/5 satisfaction
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-purple-600 mr-2" />
                  <span className="text-lg font-semibold text-purple-900">Pipeline</span>
                </div>
                <p className="text-sm text-purple-700">
                  {formatCurrency(metrics.pipelineValue?.value ?? 0)} in prospect value with {metrics.pendingTasks?.value ?? 0} pending tasks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
});

// Set display name for debugging
EnhancedKpiPanels.displayName = 'EnhancedKpiPanels';

export default EnhancedKpiPanels;