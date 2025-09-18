import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SparklineData {
  index: number;
  value: number;
  timestamp?: string;
}

interface EnhancedSparklineChartProps {
  data: number[];
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  height?: number;
  width?: string;
  showTrend?: boolean;
  showTooltip?: boolean;
  animationDuration?: number;
  strokeWidth?: number;
  gradient?: boolean;
  realTimeUpdate?: boolean;
  className?: string;
  dataTestId?: string;
}

export default function EnhancedSparklineChart({
  data = [],
  color = 'blue',
  trend = 'neutral',
  height = 40,
  width = '100%',
  showTrend = true,
  showTooltip = true,
  animationDuration = 800,
  strokeWidth = 2,
  gradient = true,
  realTimeUpdate = false,
  className = '',
  dataTestId
}: EnhancedSparklineChartProps) {
  const [animatedData, setAnimatedData] = useState<SparklineData[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Color mappings
  const colorMap = {
    blue: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
    purple: '#8b5cf6',
    orange: '#f59e0b',
    teal: '#06b6d4',
    amber: '#f59e0b'
  };

  const strokeColor = typeof color === 'string' && color in colorMap 
    ? colorMap[color as keyof typeof colorMap] 
    : color;

  // Transform data to chart format
  const chartData = useMemo(() => {
    return data.map((value, index) => ({
      index,
      value,
      timestamp: new Date(Date.now() - (data.length - index) * 24 * 60 * 60 * 1000).toISOString()
    }));
  }, [data]);

  // Calculate trend metrics
  const trendMetrics = useMemo(() => {
    if (data.length < 2) return { change: 0, changePercent: 0, direction: 'neutral' as const };
    
    const first = data[0];
    const last = data[data.length - 1];
    const change = last - first;
    const changePercent = first !== 0 ? (change / first) * 100 : 0;
    
    return {
      change,
      changePercent,
      direction: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const
    };
  }, [data]);

  // Animate data changes
  useEffect(() => {
    if (realTimeUpdate) {
      setIsAnimating(true);
      
      // Stagger the data points for smooth animation
      chartData.forEach((point, index) => {
        setTimeout(() => {
          setAnimatedData(prev => {
            const newData = [...prev];
            newData[index] = point;
            return newData;
          });
        }, index * 50);
      });

      setTimeout(() => {
        setIsAnimating(false);
      }, animationDuration);
    } else {
      setAnimatedData(chartData);
    }
  }, [chartData, realTimeUpdate, animationDuration]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 text-xs"
        >
          <div className="font-medium">{data.value.toFixed(2)}</div>
          <div className="text-gray-500">Point {label + 1}</div>
        </motion.div>
      );
    }
    return null;
  };

  // Trend icon component
  const TrendIcon = () => {
    const direction = trend !== 'neutral' ? trend : trendMetrics.direction;
    
    if (direction === 'up') {
      return <TrendingUp className="w-3 h-3 text-green-500" />;
    } else if (direction === 'down') {
      return <TrendingDown className="w-3 h-3 text-red-500" />;
    } else {
      return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  if (data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center text-gray-400 text-xs ${className}`}
        style={{ height }}
        data-testid={dataTestId ? `${dataTestId}-empty` : undefined}
      >
        No data
      </div>
    );
  }

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ height, width }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      data-testid={dataTestId}
    >
      {/* Trend indicator */}
      {showTrend && (
        <motion.div
          className="absolute top-0 right-0 z-10 flex items-center gap-1"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <TrendIcon />
          <span className={`text-xs font-medium ${
            trendMetrics.direction === 'up' ? 'text-green-600' : 
            trendMetrics.direction === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trendMetrics.changePercent > 0 ? '+' : ''}{trendMetrics.changePercent.toFixed(1)}%
          </span>
        </motion.div>
      )}

      {/* Loading overlay */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={realTimeUpdate ? animatedData : chartData}>
          {gradient && (
            <defs>
              <linearGradient id={`gradient-${dataTestId || 'sparkline'}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
          )}
          
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            dot={false}
            fill={gradient ? `url(#gradient-${dataTestId || 'sparkline'})` : 'none'}
            animationDuration={realTimeUpdate ? 0 : animationDuration}
            animationEasing="ease-out"
          />
          
          {showTooltip && (
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: strokeColor, strokeWidth: 1, strokeDasharray: '3 3' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Real-time pulse indicator */}
      {realTimeUpdate && (
        <motion.div
          className="absolute bottom-1 left-1 w-2 h-2 bg-green-500 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
      )}
    </motion.div>
  );
}