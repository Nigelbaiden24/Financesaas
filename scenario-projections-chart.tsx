import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlayCircle, TrendingUp } from "lucide-react";
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useDebounce } from 'use-debounce';
import { useScenarioRealtimeSync } from '@/hooks/useRealtimeSync';

interface ScenarioData {
  year: number;
  conservative: number;
  moderate: number;
  aggressive: number;
  contributions: number;
}

interface ScenarioProjectionsChartProps {
  className?: string;
  onParamsChange?: (params: ScenarioParams) => void;
  onRunScenario?: (params: ScenarioParams) => void;
  isLoading?: boolean;
  error?: string | null;
}

interface ScenarioParams {
  monthlyContribution: number;
  retirementAge: number;
  currentAge: number;
  expectedReturn: number;
  inflationRate: number;
}

const ScenarioProjectionsChart = memo((props: {
  className?: string;
  onParamsChange?: (params: ScenarioParams) => void;
  onRunScenario?: (params: ScenarioParams) => void;
  isLoading?: boolean;
  error?: string | null;
}) => {
  const { 
    className = "",
    onParamsChange,
    onRunScenario,
    isLoading = false,
    error = null,
  } = props;
  // Real-time synchronization for scenario updates
  const { events, emitScenarioEvent } = useScenarioRealtimeSync();
  const [monthlyContribution, setMonthlyContribution] = useState([2000]);
  const [retirementAge, setRetirementAge] = useState([65]);
  const [currentAge, setCurrentAge] = useState([35]);
  const [expectedReturn, setExpectedReturn] = useState([7]);
  const [inflationRate, setInflationRate] = useState([2.5]);

  const [scenarioData, setScenarioData] = useState<ScenarioData[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Debounce parameter changes to prevent excessive event firing
  const [debouncedMonthlyContribution] = useDebounce(monthlyContribution, 300);
  const [debouncedRetirementAge] = useDebounce(retirementAge, 300);
  const [debouncedCurrentAge] = useDebounce(currentAge, 300);
  const [debouncedExpectedReturn] = useDebounce(expectedReturn, 300);
  const [debouncedInflationRate] = useDebounce(inflationRate, 300);

  // Memoized calculation function to prevent unnecessary recalculations
  const calculateScenarios = useMemo(() => {
    return (params: {
      monthlyContribution: number;
      retirementAge: number;
      currentAge: number;
      expectedReturn: number;
      inflationRate: number;
    }): ScenarioData[] => {
      const data: ScenarioData[] = [];
      const years = params.retirementAge - params.currentAge;
      const monthlyAmount = params.monthlyContribution;
      
      for (let year = 0; year <= years; year++) {
        const totalContributions = monthlyAmount * 12 * year;
        
        // Different return scenarios
        const conservativeReturn = 0.04;
        const moderateReturn = params.expectedReturn / 100;
        const aggressiveReturn = 0.10;
        
        const calculateFV = (rate: number) => {
          if (year === 0) return 0;
          const months = year * 12;
          const monthlyRate = rate / 12;
          const realAnnualRate = rate - (params.inflationRate / 100);
          const realMonthlyRate = realAnnualRate / 12;
          
          // Handle zero or negative real rates properly
          if (Math.abs(realMonthlyRate) < 0.00001) {
            // Use simple arithmetic for zero rates
            return monthlyAmount * months;
          } else if (realMonthlyRate < 0) {
            // Handle negative real rates (high inflation)
            return monthlyAmount * (1 - Math.pow(1 + realMonthlyRate, months)) / (-realMonthlyRate);
          } else {
            // Standard compound growth formula
            return monthlyAmount * (Math.pow(1 + realMonthlyRate, months) - 1) / realMonthlyRate;
          }
        };
        
        data.push({
          year: params.currentAge + year,
          conservative: Math.round(calculateFV(conservativeReturn)),
          moderate: Math.round(calculateFV(moderateReturn)),
          aggressive: Math.round(calculateFV(aggressiveReturn)),
          contributions: Math.round(totalContributions)
        });
      }
      
      return data;
    };
  }, []);

  // Update scenario data with immediate feedback for UI
  useEffect(() => {
    const params = {
      monthlyContribution: monthlyContribution[0],
      retirementAge: retirementAge[0],
      currentAge: currentAge[0],
      expectedReturn: expectedReturn[0],
      inflationRate: inflationRate[0]
    };

    const freshData = calculateScenarios(params);
    setScenarioData(freshData);

    // Validate inputs
    const errors: Record<string, string> = {};
    
    if (params.currentAge >= params.retirementAge) {
      errors.ages = 'Current age must be less than retirement age';
    }
    if (params.retirementAge - params.currentAge > 50) {
      errors.ages = 'Retirement period cannot exceed 50 years';
    }
    if (params.monthlyContribution <= 0) {
      errors.contribution = 'Monthly contribution must be greater than £0';
    }
    if (params.expectedReturn <= 0 || params.expectedReturn > 20) {
      errors.return = 'Expected return must be between 0.1% and 20%';
    }
    
    setValidationErrors(errors);
    
    if (onParamsChange) {
      onParamsChange(params);
    }
  }, [monthlyContribution, retirementAge, currentAge, expectedReturn, inflationRate, onParamsChange, calculateScenarios]);

  // Debounced real-time event emission with fresh data
  useEffect(() => {
    const params = {
      monthlyContribution: debouncedMonthlyContribution[0],
      retirementAge: debouncedRetirementAge[0],
      currentAge: debouncedCurrentAge[0],
      expectedReturn: debouncedExpectedReturn[0],
      inflationRate: debouncedInflationRate[0]
    };

    // Calculate fresh projections for event emission
    const freshProjections = calculateScenarios(params);
    
    // Only emit if we have no validation errors
    const hasErrors = params.currentAge >= params.retirementAge ||
                     params.retirementAge - params.currentAge > 50 ||
                     params.monthlyContribution <= 0 ||
                     params.expectedReturn <= 0 ||
                     params.expectedReturn > 20;

    if (!hasErrors) {
      emitScenarioEvent({
        parameters: params,
        projections: freshProjections, // ← FIXED: Using fresh data, not stale state
        updatedAt: new Date().toISOString()
      });
    }
  }, [debouncedMonthlyContribution, debouncedRetirementAge, debouncedCurrentAge, debouncedExpectedReturn, debouncedInflationRate, emitScenarioEvent, calculateScenarios]);

  const formatCurrency = (value: number) => {
    return `£${(value / 1000).toFixed(0)}k`;
  };

  const formatTooltip = (value: any, name: string) => {
    const scenarios = {
      conservative: 'Conservative (4%)',
      moderate: `Moderate (${expectedReturn[0]}%)`,
      aggressive: 'Aggressive (10%)',
      contributions: 'Total Contributions'
    };
    
    return [
      `£${value.toLocaleString()}`,
      scenarios[name as keyof typeof scenarios] || name
    ];
  };

  const finalValues = scenarioData[scenarioData.length - 1];
  const projectedIncome = finalValues ? Math.round(finalValues.moderate * 0.04 / 12) : 0;

  const handleRunScenario = useCallback(() => {
    if (Object.keys(validationErrors).length > 0) {
      return; // Don't run if there are validation errors
    }
    
    const scenarioParams = {
      monthlyContribution: monthlyContribution[0],
      retirementAge: retirementAge[0],
      currentAge: currentAge[0],
      expectedReturn: expectedReturn[0],
      inflationRate: inflationRate[0]
    };
    
    // Emit scenario event for cross-module sync
    emitScenarioEvent({
      parameters: scenarioParams,
      calculatedAt: new Date().toISOString()
    });
    
    if (onRunScenario) {
      onRunScenario(scenarioParams);
    }
  }, [monthlyContribution, retirementAge, currentAge, expectedReturn, inflationRate, validationErrors, onRunScenario, emitScenarioEvent]);

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Advanced Scenario Modelling Engine
            </CardTitle>
            <CardDescription>
              Real-time interactive financial planning with inflation-adjusted projections
            </CardDescription>
          </div>
          <Button 
            onClick={handleRunScenario}
            disabled={isLoading || hasValidationErrors}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2"
            data-testid="button-run-scenario"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <PlayCircle className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Calculating...' : 'Run Scenario'}
          </Button>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg" data-testid="error-message">
            <p className="text-red-600 text-sm font-medium">Error: {error}</p>
          </div>
        )}
        
        {hasValidationErrors && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg" data-testid="validation-errors">
            {Object.entries(validationErrors).map(([field, message]) => (
              <p key={field} className="text-yellow-700 text-sm">• {message}</p>
            ))}
          </div>
        )}
        
        {finalValues && !hasValidationErrors && (
          <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border" data-testid="scenario-results">
            <div className="text-center" data-testid="result-conservative">
              <p className="text-sm text-gray-600">Conservative (4%)</p>
              <p className="text-lg font-bold text-red-600">£{finalValues.conservative.toLocaleString()}</p>
            </div>
            <div className="text-center border-x border-gray-200" data-testid="result-moderate">
              <p className="text-sm text-gray-600">Moderate ({expectedReturn[0]}%)</p>
              <p className="text-xl font-bold text-blue-600">£{finalValues.moderate.toLocaleString()}</p>
            </div>
            <div className="text-center" data-testid="result-aggressive">
              <p className="text-sm text-gray-600">Aggressive (10%)</p>
              <p className="text-lg font-bold text-green-600">£{finalValues.aggressive.toLocaleString()}</p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Interactive Controls */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Scenario Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="contribution-slider">Monthly Contribution: £{monthlyContribution[0].toLocaleString()}</Label>
            <Slider
              id="contribution-slider"
              value={monthlyContribution}
              onValueChange={setMonthlyContribution}
              max={10000}
              min={50}
              step={50}
              className="mt-2"
              data-testid="slider-monthly-contribution"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>£50</span>
              <span>£10,000</span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="return-slider">Expected Return: {expectedReturn[0]}%</Label>
            <Slider
              id="return-slider"
              value={expectedReturn}
              onValueChange={setExpectedReturn}
              max={20}
              min={0.1}
              step={0.1}
              className="mt-2"
              data-testid="slider-expected-return"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.1%</span>
              <span>20%</span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="current-age-slider">Current Age: {currentAge[0]}</Label>
            <Slider
              id="current-age-slider"
              value={currentAge}
              onValueChange={setCurrentAge}
              max={65}
              min={18}
              step={1}
              className="mt-2"
              data-testid="slider-current-age"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>18</span>
              <span>65</span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="retirement-age-slider">Retirement Age: {retirementAge[0]}</Label>
            <Slider
              id="retirement-age-slider"
              value={retirementAge}
              onValueChange={setRetirementAge}
              max={80}
              min={50}
              step={1}
              className="mt-2"
              data-testid="slider-retirement-age"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50</span>
              <span>80</span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="inflation-slider">Inflation Rate: {inflationRate[0]}%</Label>
            <Slider
              id="inflation-slider"
              value={inflationRate}
              onValueChange={setInflationRate}
              max={10}
              min={1}
              step={0.1}
              className="mt-2"
              data-testid="slider-inflation-rate"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>10%</span>
            </div>
          </div>
        </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={scenarioData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="conservative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="moderate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="aggressive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="contributions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}`}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={(label) => `Age: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              
              <Area 
                type="monotone" 
                dataKey="contributions" 
                stackId="1"
                stroke="#6b7280" 
                fill="url(#contributions)"
                name="contributions"
                animationDuration={800}
                animationEasing="ease-in-out"
              />
              <Area 
                type="monotone" 
                dataKey="conservative" 
                stackId="2"
                stroke="#ef4444" 
                fill="url(#conservative)"
                name="conservative"
                animationDuration={800}
                animationEasing="ease-in-out"
              />
              <Area 
                type="monotone" 
                dataKey="moderate" 
                stackId="3"
                stroke="#3b82f6" 
                fill="url(#moderate)"
                name="moderate"
                animationDuration={800}
                animationEasing="ease-in-out"
              />
              <Area 
                type="monotone" 
                dataKey="aggressive" 
                stackId="4"
                stroke="#10b981" 
                fill="url(#aggressive)"
                name="aggressive"
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

// Set display name for debugging
ScenarioProjectionsChart.displayName = 'ScenarioProjectionsChart';

export default ScenarioProjectionsChart;