import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AllocationData {
  name: string;
  value: number;
  color: string;
}

interface PortfolioAllocationChartProps {
  data: AllocationData[];
  title?: string;
  className?: string;
}

const ROUNDING_CAP = 360;

const renderTooltip = (props: any) => {
  if (props.active && props.payload && props.payload.length) {
    const data = props.payload[0];
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-semibold">{data.payload.name}</p>
        <p className="text-blue-600">
          {data.payload.value.toFixed(1)}% (£{(data.payload.actualValue || 0).toLocaleString()})
        </p>
      </div>
    );
  }
  return null;
};

export default function PortfolioAllocationChart({ 
  data, 
  title = "Asset Allocation",
  className = ""
}: PortfolioAllocationChartProps) {
  const processedData = data.map(item => ({
    ...item,
    // Ensure we have actual values for tooltip
    actualValue: item.actualValue || 0
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Interactive portfolio composition</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={renderTooltip} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}