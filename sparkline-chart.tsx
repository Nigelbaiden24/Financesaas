import { useEffect, useRef, memo, useMemo } from "react";

interface SparklineChartProps {
  data: number[];
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
  showDots?: boolean;
  animated?: boolean;
}

const SparklineChart = memo<SparklineChartProps>(({ 
  data, 
  color = 'blue', 
  trend = 'neutral',
  width = 120,
  height = 40,
  strokeWidth = 2,
  className = '',
  showDots = false,
  animated = true
}: SparklineChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Memoize color map to prevent recreation on every render
  const colorMap = useMemo(() => ({
    blue: { stroke: '#3B82F6', fill: '#EFF6FF', gradient: 'url(#blueGradient)' },
    green: { stroke: '#10B981', fill: '#ECFDF5', gradient: 'url(#greenGradient)' },
    purple: { stroke: '#8B5CF6', fill: '#F3E8FF', gradient: 'url(#purpleGradient)' },
    orange: { stroke: '#F59E0B', fill: '#FEF3C7', gradient: 'url(#orangeGradient)' },
    indigo: { stroke: '#6366F1', fill: '#EEF2FF', gradient: 'url(#indigoGradient)' },
    teal: { stroke: '#14B8A6', fill: '#F0FDFA', gradient: 'url(#tealGradient)' },
    amber: { stroke: '#F59E0B', fill: '#FFFBEB', gradient: 'url(#amberGradient)' },
    red: { stroke: '#EF4444', fill: '#FEF2F2', gradient: 'url(#redGradient)' },
  }), []);

  const colors = useMemo(() => colorMap[color] || colorMap.blue, [colorMap, color]);

  // Memoize expensive calculations
  const chartData = useMemo(() => {
    // Handle empty or insufficient data
    if (!data || data.length < 2) {
      return null;
    }

    // Calculate path
    const padding = 4;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const valueRange = maxValue - minValue || 1; // Avoid division by zero
    
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      return { x, y, value };
    });

    // Create SVG path
    const pathData = points.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    }, '');

    // Create area path for gradient fill
    const areaPathData = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return { points, pathData, areaPathData };
  }, [data, width, height]);

  // Determine trend colors
  const finalColors = useMemo(() => {
    const trendColors = {
      up: colorMap.green,
      down: colorMap.red,
      neutral: colors
    };
    return trendColors[trend];
  }, [colorMap, colors, trend]);

  // Early return for no data
  if (!chartData) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-xs text-gray-400">No data</div>
      </div>
    );
  }

  const { points, pathData, areaPathData } = chartData;

  // Animation path length calculation
  const pathLength = useRef<number>(0);

  useEffect(() => {
    if (animated && svgRef.current) {
      const pathElement = svgRef.current.querySelector('.sparkline-path') as SVGPathElement;
      if (pathElement) {
        pathLength.current = pathElement.getTotalLength();
        pathElement.style.strokeDasharray = `${pathLength.current}`;
        pathElement.style.strokeDashoffset = `${pathLength.current}`;
        
        // Animate the path
        setTimeout(() => {
          pathElement.style.transition = 'stroke-dashoffset 1s ease-in-out';
          pathElement.style.strokeDashoffset = '0';
        }, 100);
      }
    }
  }, [data, animated]);

  return (
    <div className={`${className}`} style={{ width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        data-testid="sparkline-chart"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="tealGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="amberGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={areaPathData}
          fill={finalColors.gradient}
          className="sparkline-area"
        />

        {/* Main line */}
        <path
          d={pathData}
          fill="none"
          stroke={finalColors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="sparkline-path"
          style={animated ? {
            strokeDasharray: pathLength.current,
            strokeDashoffset: pathLength.current,
          } : {}}
        />

        {/* Data points (dots) */}
        {showDots && points.map((point, index) => (
          <g key={index}>
            {/* Outer circle for hover effect */}
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="transparent"
              className="hover:fill-gray-100 transition-all duration-200 cursor-pointer"
              data-value={point.value}
            />
            {/* Inner dot */}
            <circle
              cx={point.x}
              cy={point.y}
              r="2"
              fill={finalColors.stroke}
              className="pointer-events-none"
            />
          </g>
        ))}

        {/* Trend indicator (subtle) */}
        {trend !== 'neutral' && (
          <g className="trend-indicator">
            <polygon
              points={trend === 'up' 
                ? `${width - 15},${padding + 5} ${width - 10},${padding} ${width - 5},${padding + 5}` 
                : `${width - 15},${padding} ${width - 10},${padding + 5} ${width - 5},${padding}`
              }
              fill={trend === 'up' ? '#10B981' : '#EF4444'}
              opacity="0.6"
            />
          </g>
        )}
      </svg>
    </div>
  );
});

// Set display name for debugging
SparklineChart.displayName = 'SparklineChart';

export default SparklineChart;