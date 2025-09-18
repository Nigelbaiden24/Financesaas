import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, PieChart as PieChartIcon } from "lucide-react";

interface AssetClassBreakdown {
  [key: string]: {
    value: number;
    percentage: number;
  };
}

interface InteractiveAllocationChartProps {
  assetClassBreakdown: AssetClassBreakdown;
  totalValue: number;
  title?: string;
  description?: string;
}

// Color palette for different asset classes with professional financial look
const ASSET_CLASS_COLORS = {
  equity: "#2563eb",      // Blue
  bond: "#059669",        // Green  
  cash: "#dc2626",        // Red
  property: "#7c3aed",    // Purple
  commodity: "#ea580c",   // Orange
  alternative: "#0891b2", // Cyan
} as const;

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium text-gray-900 capitalize">{data.name}</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Value:</span>
            <span className="font-medium">
              {new Intl.NumberFormat('en-GB', {
                style: 'currency',
                currency: 'GBP',
              }).format(data.value)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Allocation:</span>
            <span className="font-medium">{data.percentage.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom label component for the pie chart
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null; // Don't show labels for very small slices
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="600"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

export default function InteractiveAllocationChart({ 
  assetClassBreakdown, 
  totalValue, 
  title = "Asset Allocation",
  description = "Current portfolio allocation by asset class"
}: InteractiveAllocationChartProps) {
  
  // Transform the data for the chart
  const chartData = useMemo(() => {
    return Object.entries(assetClassBreakdown).map(([assetClass, data]) => ({
      name: assetClass,
      value: data.value,
      percentage: data.percentage,
      color: ASSET_CLASS_COLORS[assetClass as keyof typeof ASSET_CLASS_COLORS] || "#6b7280",
    })).sort((a, b) => b.value - a.value); // Sort by value descending
  }, [assetClassBreakdown]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const largestAllocation = chartData[0];
    const diversificationScore = chartData.length >= 4 ? "High" : chartData.length >= 2 ? "Medium" : "Low";
    const equityPercentage = chartData.find(item => item.name === 'equity')?.percentage || 0;
    
    return {
      largestAllocation,
      diversificationScore,
      equityPercentage,
      riskLevel: equityPercentage > 70 ? "Aggressive" : equityPercentage > 40 ? "Moderate" : "Conservative"
    };
  }, [chartData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No allocation data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={entry.color}
                      strokeWidth={2}
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend and Statistics */}
          <div className="space-y-4">
            {/* Asset Breakdown */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 mb-3">Asset Breakdown</h4>
              {chartData.map((item) => (
                <div 
                  key={item.name} 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors"
                  data-testid={`allocation-item-${item.name}`}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium capitalize">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{item.percentage.toFixed(1)}%</div>
                    <div className="text-xs text-gray-600">{formatCurrency(item.value)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Portfolio Statistics */}
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium text-gray-900">Portfolio Analytics</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs text-blue-600 font-medium uppercase tracking-wider">
                    Largest Position
                  </div>
                  <div className="text-sm font-semibold text-blue-900 capitalize">
                    {statistics.largestAllocation?.name}
                  </div>
                  <div className="text-xs text-blue-700">
                    {statistics.largestAllocation?.percentage.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-xs text-green-600 font-medium uppercase tracking-wider">
                    Risk Profile
                  </div>
                  <div className="text-sm font-semibold text-green-900">
                    {statistics.riskLevel}
                  </div>
                  <div className="text-xs text-green-700">
                    {statistics.equityPercentage.toFixed(1)}% Equity
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Diversification</span>
                <Badge 
                  variant={
                    statistics.diversificationScore === "High" ? "default" :
                    statistics.diversificationScore === "Medium" ? "secondary" : "outline"
                  }
                >
                  {statistics.diversificationScore}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Asset Classes</span>
                <span className="text-sm font-medium">{chartData.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Value</span>
                <span className="text-sm font-medium">{formatCurrency(totalValue)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}