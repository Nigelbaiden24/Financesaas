import { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart as PieChartIcon, TrendingUp, RefreshCw } from "lucide-react";
import { AnimatedChartWrapper, useChartAnimation } from './animated-chart-wrapper';
import { usePortfolioRealtimeSync } from '@/hooks/useRealtimeSync';
import { motion, AnimatePresence } from 'framer-motion';

interface AllocationData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  target?: number;
  variance?: number;
}

interface EnhancedPortfolioAllocationChartProps {
  portfolioId: string;
  clientId?: string;
  data?: AllocationData[];
  isLoading?: boolean;
  error?: string | null;
  onAllocationChange?: (allocation: AllocationData[]) => void;
  showTargets?: boolean;
  interactive?: boolean;
  className?: string;
}

const COLORS = {
  equities: '#3b82f6',
  bonds: '#10b981',
  cash: '#f59e0b',
  alternatives: '#8b5cf6',
  property: '#ef4444',
  commodities: '#06b6d4'
};

const DEFAULT_ALLOCATION_DATA: AllocationData[] = [
  { name: 'Equities', value: 650000, percentage: 65, color: COLORS.equities, target: 70, variance: -5 },
  { name: 'Bonds', value: 250000, percentage: 25, color: COLORS.bonds, target: 20, variance: 5 },
  { name: 'Cash', value: 50000, percentage: 5, color: COLORS.cash, target: 5, variance: 0 },
  { name: 'Alternatives', value: 50000, percentage: 5, color: COLORS.alternatives, target: 5, variance: 0 }
];

export default function EnhancedPortfolioAllocationChart({
  portfolioId,
  clientId,
  data = DEFAULT_ALLOCATION_DATA,
  isLoading = false,
  error = null,
  onAllocationChange,
  showTargets = true,
  interactive = true,
  className = ""
}: EnhancedPortfolioAllocationChartProps) {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Real-time synchronization\n  const { events, emitPortfolioEvent } = usePortfolioRealtimeSync(portfolioId, clientId);
  
  // Chart animation hook\n  const { animationKey, isAnimating } = useChartAnimation(data);

  // Format currency\n  const formatCurrency = (value: number) => {\n    return new Intl.NumberFormat('en-GB', {\n      style: 'currency',\n      currency: 'GBP',\n      minimumFractionDigits: 0,\n      maximumFractionDigits: 0,\n    }).format(value);\n  };

  // Handle segment interactions\n  const handleSegmentClick = useCallback((entry: any, index: number) => {\n    if (!interactive) return;\n    \n    const segmentName = entry.name;\n    setSelectedSegment(selectedSegment === segmentName ? null : segmentName);\n    \n    if (onAllocationChange) {\n      onAllocationChange(data);\n    }\n    \n    // Emit real-time event for allocation interaction\n    emitPortfolioEvent('portfolio_updated', {\n      action: 'allocation_viewed',\n      segment: segmentName,\n      portfolioId\n    });\n  }, [interactive, selectedSegment, onAllocationChange, data, emitPortfolioEvent, portfolioId]);

  // Custom tooltip\n  const CustomTooltip = ({ active, payload }: any) => {\n    if (active && payload && payload.length) {\n      const data = payload[0].payload;\n      return (\n        <motion.div\n          initial={{ opacity: 0, scale: 0.9 }}\n          animate={{ opacity: 1, scale: 1 }}\n          exit={{ opacity: 0, scale: 0.9 }}\n          className="bg-white p-4 rounded-lg shadow-lg border border-gray-200"\n        >\n          <div className="space-y-2">\n            <div className="flex items-center gap-2">\n              <div \n                className="w-3 h-3 rounded-full"\n                style={{ backgroundColor: data.color }}\n              />\n              <span className="font-medium text-gray-900">{data.name}</span>\n            </div>\n            <div className="space-y-1 text-sm">\n              <div className="flex justify-between gap-4">\n                <span className="text-gray-600">Value:</span>\n                <span className="font-medium">{formatCurrency(data.value)}</span>\n              </div>\n              <div className="flex justify-between gap-4">\n                <span className="text-gray-600">Allocation:</span>\n                <span className="font-medium">{data.percentage}%</span>\n              </div>\n              {showTargets && data.target && (\n                <>\n                  <div className="flex justify-between gap-4">\n                    <span className="text-gray-600">Target:</span>\n                    <span className="font-medium">{data.target}%</span>\n                  </div>\n                  {data.variance !== undefined && (\n                    <div className="flex justify-between gap-4">\n                      <span className="text-gray-600">Variance:</span>\n                      <span className={`font-medium ${\n                        data.variance > 0 ? 'text-green-600' : \n                        data.variance < 0 ? 'text-red-600' : 'text-gray-600'\n                      }`}>\n                        {data.variance > 0 ? '+' : ''}{data.variance}%\n                      </span>\n                    </div>\n                  )}\n                </>\n              )}\n            </div>\n          </div>\n        </motion.div>\n      );\n    }\n    return null;\n  };

  // Handle manual refresh\n  const handleRefresh = useCallback(() => {\n    setRefreshKey(prev => prev + 1);\n    emitPortfolioEvent('portfolio_updated', {\n      action: 'allocation_refreshed',\n      portfolioId\n    });\n  }, [emitPortfolioEvent, portfolioId]);

  // Listen for real-time events\n  useEffect(() => {\n    if (events.length > 0) {\n      const latestEvent = events[0];\n      if (latestEvent.type === 'holding_added' || latestEvent.type === 'portfolio_updated') {\n        setRefreshKey(prev => prev + 1);\n      }\n    }\n  }, [events]);

  return (\n    <Card className={`${className} relative overflow-hidden`}>\n      <CardHeader>\n        <div className="flex items-center justify-between">\n          <div>\n            <CardTitle className="flex items-center gap-2 text-lg">\n              <PieChartIcon className="w-5 h-5 text-blue-600" />\n              Portfolio Allocation\n            </CardTitle>\n            <CardDescription>\n              Real-time asset class distribution with target comparisons\n            </CardDescription>\n          </div>\n          <div className="flex items-center gap-2">\n            {isAnimating && (\n              <motion.div\n                animate={{ rotate: 360 }}\n                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}\n              >\n                <RefreshCw className="w-4 h-4 text-blue-600" />\n              </motion.div>\n            )}\n            <Button \n              variant="outline" \n              size="sm" \n              onClick={handleRefresh}\n              disabled={isLoading}\n              data-testid="button-refresh-allocation"\n            >\n              <RefreshCw className="w-4 h-4" />\n            </Button>\n          </div>\n        </div>\n      </CardHeader>\n      \n      <CardContent>\n        <AnimatedChartWrapper\n          isLoading={isLoading}\n          error={error}\n          data={data}\n          className="space-y-6"\n          animationDuration={0.5}\n          dataTestId="portfolio-allocation-chart"\n        >\n          {/* Chart */}\n          <div className="h-80">\n            <ResponsiveContainer width="100%" height="100%">\n              <PieChart key={`${animationKey}-${refreshKey}`}>\n                <Pie\n                  data={data}\n                  cx="50%"\n                  cy="50%"\n                  outerRadius={100}\n                  innerRadius={50}\n                  paddingAngle={2}\n                  dataKey="value"\n                  onClick={handleSegmentClick}\n                  onMouseEnter={(entry) => setHoveredSegment(entry.name)}\n                  onMouseLeave={() => setHoveredSegment(null)}\n                  animationBegin={0}\n                  animationDuration={800}\n                  animationEasing="ease-out"\n                >\n                  {data.map((entry, index) => (\n                    <Cell \n                      key={`cell-${index}`}\n                      fill={entry.color}\n                      stroke={selectedSegment === entry.name ? '#374151' : 'transparent'}\n                      strokeWidth={selectedSegment === entry.name ? 3 : 0}\n                      style={{\n                        filter: hoveredSegment && hoveredSegment !== entry.name ? 'brightness(0.7)' : 'brightness(1)',\n                        cursor: interactive ? 'pointer' : 'default',\n                        transition: 'all 0.2s ease'\n                      }}\n                    />\n                  ))}\n                </Pie>\n                <Tooltip content={<CustomTooltip />} />\n              </PieChart>\n            </ResponsiveContainer>\n          </div>\n\n          {/* Allocation Details */}\n          <div className="space-y-4">\n            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">\n              <AnimatePresence>\n                {data.map((item, index) => (\n                  <motion.div\n                    key={item.name}\n                    initial={{ opacity: 0, x: -20 }}\n                    animate={{ opacity: 1, x: 0 }}\n                    exit={{ opacity: 0, x: -20 }}\n                    transition={{ delay: index * 0.1 }}\n                    className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${\n                      selectedSegment === item.name \n                        ? 'border-blue-300 bg-blue-50' \n                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'\n                    }`}\n                    onClick={() => handleSegmentClick(item, index)}\n                    data-testid={`allocation-segment-${item.name.toLowerCase()}`}\n                  >\n                    <div className="flex items-center justify-between mb-2">\n                      <div className="flex items-center gap-2">\n                        <div \n                          className="w-3 h-3 rounded-full"\n                          style={{ backgroundColor: item.color }}\n                        />\n                        <span className="font-medium text-gray-900">{item.name}</span>\n                      </div>\n                      <Badge variant="outline" className="text-xs">\n                        {item.percentage}%\n                      </Badge>\n                    </div>\n                    \n                    <div className="space-y-1 text-sm">\n                      <div className="flex justify-between">\n                        <span className="text-gray-600">Current:</span>\n                        <span className="font-medium">{formatCurrency(item.value)}</span>\n                      </div>\n                      \n                      {showTargets && item.target && (\n                        <>\n                          <div className="flex justify-between">\n                            <span className="text-gray-600">Target:</span>\n                            <span className="font-medium">{item.target}%</span>\n                          </div>\n                          \n                          {item.variance !== undefined && (\n                            <div className="flex justify-between">\n                              <span className="text-gray-600">Variance:</span>\n                              <div className="flex items-center gap-1">\n                                {item.variance !== 0 && (\n                                  <TrendingUp className={`w-3 h-3 ${\n                                    item.variance > 0 ? 'text-green-600 rotate-0' : 'text-red-600 rotate-180'\n                                  }`} />\n                                )}\n                                <span className={`font-medium text-xs ${\n                                  item.variance > 0 ? 'text-green-600' : \n                                  item.variance < 0 ? 'text-red-600' : 'text-gray-600'\n                                }`}>\n                                  {item.variance > 0 ? '+' : ''}{item.variance}%\n                                </span>\n                              </div>\n                            </div>\n                          )}\n                        </>\n                      )}\n                    </div>\n                  </motion.div>\n                ))}\n              </AnimatePresence>\n            </div>\n          </div>\n        </AnimatedChartWrapper>\n      </CardContent>\n    </Card>\n  );\n}