import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface PerformanceData {
  date: string;
  portfolio: number;
  benchmark: number;
  target?: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  title?: string;
  className?: string;
  showComparison?: boolean;
}

export default function PerformanceChart({ 
  data, 
  title = "Portfolio Performance", 
  className = "",
  showComparison = true
}: PerformanceChartProps) {
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('YTD');

  // Filter data based on selected period
  const getFilteredData = () => {
    const now = new Date();
    let filterDate: Date;
    
    switch (selectedPeriod) {
      case '1M':
        filterDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3M':
        filterDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6M':
        filterDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case 'YTD':
        filterDate = new Date(now.getFullYear(), 0, 1);
        break;
      case '1Y':
        filterDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case '3Y':
        filterDate = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
        break;
      default:
        return data; // ALL
    }
    
    return data.filter(item => {
      const itemDate = new Date(item.date + '-01'); // Assuming YYYY-MM format
      return itemDate >= filterDate;
    });
  };

  const filteredData = getFilteredData();

  const formatTooltip = (value: any, name: string) => {
    const formattedValue = typeof value === 'number' ? `${value > 0 ? '+' : ''}${value.toFixed(2)}%` : value;
    const label = name === 'portfolio' ? 'Portfolio' : name === 'benchmark' ? 'Benchmark' : name;
    return [formattedValue, label];
  };

  const handleZoomIn = () => {
    const dataLength = filteredData.length;
    const start = Math.floor(dataLength * 0.25);
    const end = Math.floor(dataLength * 0.75);
    setZoomDomain([start, end]);
  };

  const handleZoomOut = () => {
    setZoomDomain(null);
  };

  const resetZoom = () => {
    setZoomDomain(null);
    setSelectedPeriod('ALL');
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setZoomDomain(null); // Reset zoom when changing period
  };

  const currentPortfolioValue = filteredData[filteredData.length - 1]?.portfolio || 0;
  const currentBenchmarkValue = filteredData[filteredData.length - 1]?.benchmark || 0;
  const outperformance = currentPortfolioValue - currentBenchmarkValue;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>
              Portfolio vs Benchmark • {selectedPeriod} Performance
            </CardDescription>
            {outperformance !== 0 && (
              <div className="mt-2">
                <span className={`text-sm font-semibold ${outperformance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {outperformance > 0 ? '+' : ''}{outperformance.toFixed(2)}% vs benchmark
                </span>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleZoomIn} data-testid="button-zoom-in">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut} data-testid="button-zoom-out">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetZoom} data-testid="button-reset-zoom">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={filteredData} 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                domain={zoomDomain || ['dataMin', 'dataMax']}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              
              <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
              
              <Line 
                type="monotone" 
                dataKey="portfolio" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#1d4ed8' }}
                name="Portfolio"
              />
              
              {showComparison && (
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#64748b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#64748b', strokeWidth: 2, r: 3 }}
                  name="Benchmark"
                />
              )}
              
              {filteredData.some(d => d.target) && (
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#dc2626" 
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Target"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center space-x-2 mt-4">
          {['1M', '3M', '6M', 'YTD', '1Y', '3Y', 'ALL'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange(period)}
              data-testid={`button-period-${period.toLowerCase()}`}
            >
              {period}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}