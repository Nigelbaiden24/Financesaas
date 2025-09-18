import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, BarChart3, Target, Zap, Activity } from "lucide-react";

interface PerformanceDataPoint {
  date: string;
  portfolioValue: number;
  benchmarkValue: number;
  portfolioReturn: number;
  benchmarkReturn: number;
}

interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  beta: number;
  alpha: number;
}

interface PerformanceTrackingChartProps {
  portfolioId: string;
  portfolioName: string;
  performanceData?: PerformanceDataPoint[];
  portfolioMetrics?: PerformanceMetrics;
  benchmarkMetrics?: PerformanceMetrics;
  benchmarkName?: string;
}

// Generate mock performance data for demonstration
const generateMockPerformanceData = (period: string): PerformanceDataPoint[] => {
  const periods = {
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    '3Y': 1095,
  };

  const days = periods[period as keyof typeof periods] || 365;
  const data: PerformanceDataPoint[] = [];
  
  let portfolioValue = 100;
  let benchmarkValue = 100;
  
  // Simulate portfolio outperforming benchmark with higher volatility
  for (let i = 0; i <= days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    // Add some randomness with trending bias
    const portfolioChange = (Math.random() - 0.45) * 0.02; // Slight positive bias
    const benchmarkChange = (Math.random() - 0.48) * 0.015; // Less volatile, slight positive bias
    
    portfolioValue *= (1 + portfolioChange);
    benchmarkValue *= (1 + benchmarkChange);
    
    const portfolioReturn = ((portfolioValue / 100) - 1) * 100;
    const benchmarkReturn = ((benchmarkValue / 100) - 1) * 100;
    
    data.push({
      date: date.toISOString().split('T')[0],
      portfolioValue,
      benchmarkValue,
      portfolioReturn,
      benchmarkReturn,
    });
  }
  
  return data;
};

// Generate mock metrics
const generateMockMetrics = (data: PerformanceDataPoint[], isPortfolio: boolean): PerformanceMetrics => {
  const returns = data.map((d, i) => i === 0 ? 0 : (d.portfolioValue / data[i-1].portfolioValue - 1));
  const finalReturn = ((data[data.length - 1]?.portfolioValue || 100) / 100 - 1) * 100;
  
  return {
    totalReturn: finalReturn,
    annualizedReturn: isPortfolio ? finalReturn * 1.1 : finalReturn * 0.95,
    volatility: isPortfolio ? 15.2 : 12.8,
    sharpeRatio: isPortfolio ? 1.23 : 1.05,
    maxDrawdown: isPortfolio ? -8.5 : -6.2,
    beta: isPortfolio ? 1.15 : 1.0,
    alpha: isPortfolio ? 2.1 : 0,
  };
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const portfolioData = payload.find((p: any) => p.dataKey === 'portfolioReturn');
    const benchmarkData = payload.find((p: any) => p.dataKey === 'benchmarkReturn');
    
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <div className="font-medium text-gray-900 mb-2">
          {new Date(label).toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })}
        </div>
        {portfolioData && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-sm text-gray-600">Portfolio:</span>
            <span className="text-sm font-medium">
              {portfolioData.value > 0 ? '+' : ''}{portfolioData.value.toFixed(2)}%
            </span>
          </div>
        )}
        {benchmarkData && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-sm text-gray-600">Benchmark:</span>
            <span className="text-sm font-medium">
              {benchmarkData.value > 0 ? '+' : ''}{benchmarkData.value.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function PerformanceTrackingChart({
  portfolioId,
  portfolioName,
  performanceData,
  portfolioMetrics,
  benchmarkMetrics,
  benchmarkName = "FTSE All-World"
}: PerformanceTrackingChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [activeTab, setActiveTab] = useState('performance');

  // Use mock data if no real data provided
  const chartData = useMemo(() => {
    return performanceData || generateMockPerformanceData(selectedPeriod);
  }, [performanceData, selectedPeriod]);

  const mockPortfolioMetrics = useMemo(() => {
    return portfolioMetrics || generateMockMetrics(chartData, true);
  }, [portfolioMetrics, chartData]);

  const mockBenchmarkMetrics = useMemo(() => {
    return benchmarkMetrics || generateMockMetrics(chartData, false);
  }, [benchmarkMetrics, chartData]);

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatMetric = (value: number, suffix = '') => {
    return `${value.toFixed(2)}${suffix}`;
  };

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getPerformanceBadge = (value: number) => {
    if (value >= 10) return 'default';
    if (value >= 0) return 'secondary';
    return 'destructive';
  };

  const periods = [
    { key: '1M', label: '1M' },
    { key: '3M', label: '3M' },
    { key: '6M', label: '6M' },
    { key: '1Y', label: '1Y' },
    { key: '3Y', label: '3Y' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Analysis
            </CardTitle>
            <CardDescription>
              {portfolioName} vs {benchmarkName}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {periods.map((period) => (
              <Button
                key={period.key}
                variant={selectedPeriod === period.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.key)}
                data-testid={`button-period-${period.key}`}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
            <TabsTrigger value="metrics" data-testid="tab-metrics">Metrics</TabsTrigger>
            <TabsTrigger value="risk" data-testid="tab-risk">Risk Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            {/* Performance Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Portfolio Return</span>
                </div>
                <div className={`text-2xl font-bold ${getPerformanceColor(mockPortfolioMetrics.totalReturn)}`}>
                  {formatPercentage(mockPortfolioMetrics.totalReturn)}
                </div>
                <div className="text-xs text-blue-600">{selectedPeriod} Period</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Benchmark Return</span>
                </div>
                <div className={`text-2xl font-bold ${getPerformanceColor(mockBenchmarkMetrics.totalReturn)}`}>
                  {formatPercentage(mockBenchmarkMetrics.totalReturn)}
                </div>
                <div className="text-xs text-gray-600">{benchmarkName}</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Outperformance</span>
                </div>
                <div className={`text-2xl font-bold ${getPerformanceColor(
                  mockPortfolioMetrics.totalReturn - mockBenchmarkMetrics.totalReturn
                )}`}>
                  {formatPercentage(mockPortfolioMetrics.totalReturn - mockBenchmarkMetrics.totalReturn)}
                </div>
                <div className="text-xs text-green-600">vs Benchmark</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Sharpe Ratio</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {formatMetric(mockPortfolioMetrics.sharpeRatio)}
                </div>
                <div className="text-xs text-purple-600">Risk-Adjusted</div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="h-80 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="portfolioReturn"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={false}
                    name={portfolioName}
                    activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="benchmarkReturn"
                    stroke="#6b7280"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name={benchmarkName}
                    activeDot={{ r: 4, stroke: '#6b7280', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Portfolio Metrics */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  Portfolio Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Return</span>
                    <Badge variant={getPerformanceBadge(mockPortfolioMetrics.totalReturn)}>
                      {formatPercentage(mockPortfolioMetrics.totalReturn)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Annualized Return</span>
                    <span className="font-medium">{formatPercentage(mockPortfolioMetrics.annualizedReturn)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Volatility</span>
                    <span className="font-medium">{formatMetric(mockPortfolioMetrics.volatility, '%')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Sharpe Ratio</span>
                    <span className="font-medium">{formatMetric(mockPortfolioMetrics.sharpeRatio)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Max Drawdown</span>
                    <span className="font-medium text-red-600">{formatPercentage(mockPortfolioMetrics.maxDrawdown)}</span>
                  </div>
                </div>
              </div>

              {/* Benchmark Metrics */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  Benchmark Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Return</span>
                    <Badge variant={getPerformanceBadge(mockBenchmarkMetrics.totalReturn)}>
                      {formatPercentage(mockBenchmarkMetrics.totalReturn)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Annualized Return</span>
                    <span className="font-medium">{formatPercentage(mockBenchmarkMetrics.annualizedReturn)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Volatility</span>
                    <span className="font-medium">{formatMetric(mockBenchmarkMetrics.volatility, '%')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Sharpe Ratio</span>
                    <span className="font-medium">{formatMetric(mockBenchmarkMetrics.sharpeRatio)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Max Drawdown</span>
                    <span className="font-medium text-red-600">{formatPercentage(mockBenchmarkMetrics.maxDrawdown)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Risk Metrics</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Beta</div>
                    <div className="text-2xl font-bold text-gray-900">{formatMetric(mockPortfolioMetrics.beta)}</div>
                    <div className="text-xs text-gray-500">Market sensitivity</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Alpha</div>
                    <div className={`text-2xl font-bold ${getPerformanceColor(mockPortfolioMetrics.alpha)}`}>
                      {formatPercentage(mockPortfolioMetrics.alpha)}
                    </div>
                    <div className="text-xs text-gray-500">Excess return</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Risk Assessment</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm font-medium text-yellow-800 mb-1">Volatility Level</div>
                    <div className="text-lg font-bold text-yellow-900">
                      {mockPortfolioMetrics.volatility > 20 ? 'High' : 
                       mockPortfolioMetrics.volatility > 15 ? 'Moderate' : 'Low'}
                    </div>
                    <div className="text-xs text-yellow-700">{formatMetric(mockPortfolioMetrics.volatility, '% annual')}</div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-1">Risk-Adjusted Performance</div>
                    <div className="text-lg font-bold text-blue-900">
                      {mockPortfolioMetrics.sharpeRatio > 1.5 ? 'Excellent' :
                       mockPortfolioMetrics.sharpeRatio > 1.0 ? 'Good' : 
                       mockPortfolioMetrics.sharpeRatio > 0.5 ? 'Fair' : 'Poor'}
                    </div>
                    <div className="text-xs text-blue-700">Sharpe ratio: {formatMetric(mockPortfolioMetrics.sharpeRatio)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Recommendations</h3>
                <div className="space-y-2 text-sm">
                  {mockPortfolioMetrics.volatility > 20 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="text-orange-800">Consider reducing volatility through diversification</div>
                    </div>
                  )}
                  {mockPortfolioMetrics.beta > 1.2 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-yellow-800">Portfolio more sensitive to market movements</div>
                    </div>
                  )}
                  {mockPortfolioMetrics.sharpeRatio > 1.5 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-green-800">Strong risk-adjusted performance</div>
                    </div>
                  )}
                  {Math.abs(mockPortfolioMetrics.maxDrawdown) > 10 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-red-800">Consider risk management strategies</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}