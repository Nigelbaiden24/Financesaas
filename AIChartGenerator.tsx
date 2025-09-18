import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  Upload, 
  Plus,
  Loader2,
  Download
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ChartData {
  labels: string[];
  values: number[];
  title?: string;
  type: 'bar' | 'line' | 'pie' | 'area';
}

interface AIChartGeneratorProps {
  onChartGenerated: (chartSvg: string) => void;
  onClose?: () => void;
}

export function AIChartGenerator({ onChartGenerated, onClose }: AIChartGeneratorProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area'>('bar');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chartTitle, setChartTitle] = useState('');
  const [manualData, setManualData] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'manual' | 'csv'>('manual');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const chartTypeOptions = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'area', label: 'Area Chart', icon: TrendingUp }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.includes('csv') && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV or Excel file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setCsvFile(file);
    toast({
      title: "File Uploaded",
      description: `${file.name} is ready for processing.`,
    });
  };

  const parseManualData = (data: string): ChartData | null => {
    try {
      const lines = data.trim().split('\n');
      if (lines.length < 2) return null;

      const labels: string[] = [];
      const values: number[] = [];

      lines.forEach(line => {
        const [label, value] = line.split(',').map(item => item.trim());
        if (label && value && !isNaN(Number(value))) {
          labels.push(label);
          values.push(Number(value));
        }
      });

      if (labels.length === 0 || values.length === 0) return null;

      return {
        labels,
        values,
        title: chartTitle || 'Generated Chart',
        type: chartType
      };
    } catch (error) {
      return null;
    }
  };

  const generateChart = async () => {
    setIsGenerating(true);
    
    try {
      let chartData: ChartData | null = null;

      if (mode === 'manual') {
        if (!manualData.trim()) {
          toast({
            title: "No Data Provided",
            description: "Please enter chart data in the format: Label, Value",
            variant: "destructive",
          });
          return;
        }
        chartData = parseManualData(manualData);
      } else if (mode === 'csv' && csvFile) {
        // Process CSV file
        const formData = new FormData();
        formData.append('file', csvFile);
        formData.append('chartType', chartType);
        formData.append('title', chartTitle);

        const response = await fetch('/api/generate-chart-from-file', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to process file');
        }

        const result = await response.json();
        chartData = result.chartData;
      }

      if (!chartData) {
        toast({
          title: "Invalid Data",
          description: "Please check your data format. Use: Label, Value per line.",
          variant: "destructive",
        });
        return;
      }

      // Generate chart SVG using AI
      const response = await fetch('/api/generate-chart-svg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chartData,
          type: chartType,
          title: chartTitle
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate chart');
      }

      const result = await response.json();
      
      if (result.svg) {
        onChartGenerated(result.svg);
        toast({
          title: "Chart Generated",
          description: "Your chart has been added to the document.",
        });
        
        // Reset form
        setManualData('');
        setCsvFile(null);
        setChartTitle('');
        
        // Close panel if callback provided
        if (onClose) onClose();
      }

    } catch (error) {
      console.error('Error generating chart:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate chart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <BarChart3 className="w-4 h-4" />
          AI Chart Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Chart Type Selection */}
        <div className="space-y-1">
          <Label className="text-xs">Chart Type</Label>
          <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              {chartTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="w-4 h-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chart Title */}
        <div className="space-y-1">
          <Label className="text-xs">Chart Title</Label>
          <Input
            value={chartTitle}
            onChange={(e) => setChartTitle(e.target.value)}
            placeholder="Enter chart title..."
          />
        </div>

        {/* Data Input Mode */}
        <div className="space-y-1">
          <Label className="text-xs">Data Input Method</Label>
          <div className="flex gap-2">
            <Button
              variant={mode === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('manual')}
              className="flex-1"
            >
              Manual Entry
            </Button>
            <Button
              variant={mode === 'csv' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('csv')}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          </div>
        </div>

        {/* Manual Data Entry */}
        {mode === 'manual' && (
          <div className="space-y-1">
            <Label className="text-xs">Chart Data</Label>
            <Textarea
              value={manualData}
              onChange={(e) => setManualData(e.target.value)}
              placeholder="January, 100&#10;February, 150&#10;March, 200&#10;April, 175"
              rows={4}
              className="font-mono text-xs"
            />
            <p className="text-xs text-gray-500">
              Format: Label, Value (one per line)
            </p>
          </div>
        )}

        {/* File Upload */}
        {mode === 'csv' && (
          <div className="space-y-1">
            <Label className="text-xs">Upload CSV/Excel File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              {csvFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Upload className="w-4 h-4" />
                    {csvFile.name}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">
                    CSV or Excel files up to 5MB
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={generateChart}
          disabled={isGenerating || (mode === 'manual' && !manualData.trim()) || (mode === 'csv' && !csvFile)}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Chart...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Generate & Insert Chart
            </>
          )}
        </Button>

        {/* Examples */}
        <div className="bg-gray-50 p-2 rounded text-xs">
          <div className="font-medium text-gray-700 mb-1">Example:</div>
          <div className="text-gray-600 font-mono text-xs">
            Q1 Sales, 25000<br/>
            Q2 Sales, 32000<br/>
            Q3 Sales, 28000<br/>
            Q4 Sales, 41000
          </div>
        </div>
      </CardContent>
    </Card>
  );
}