import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { HealthMetric } from "@/hooks/useHealthMetrics";
import { format } from "date-fns";

interface HealthTrendChartProps {
  data: HealthMetric[];
  metric: keyof HealthMetric;
  title: string;
  color?: string;
  unit?: string;
  className?: string;
}

export function HealthTrendChart({
  data,
  metric,
  title,
  color = "hsl(var(--primary))",
  unit = "",
  className,
}: HealthTrendChartProps) {
  const chartData = data.map((item) => ({
    date: format(new Date(item.recorded_at), "MMM dd"),
    value: item[metric] as number | null,
  })).filter((item) => item.value !== null);

  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : null;

  return (
    <div className={cn("glass-card-elevated rounded-2xl p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold font-heading text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">Last 7 days</p>
        </div>
        {latestValue !== null && (
          <div className="text-right">
            <span className="text-2xl font-bold text-primary font-heading">
              {latestValue}
            </span>
            {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
          </div>
        )}
      </div>

      {chartData.length > 0 ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${metric})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          <p>No data available yet</p>
        </div>
      )}
    </div>
  );
}
