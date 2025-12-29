import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HeartRateChartProps {
  className?: string;
}

export function HeartRateChart({ className }: HeartRateChartProps) {
  const [data, setData] = useState<number[]>([]);

  useEffect(() => {
    // Generate initial data
    const initialData = Array.from({ length: 60 }, () =>
      70 + Math.random() * 20 - 10
    );
    setData(initialData);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [...prev.slice(1), 70 + Math.random() * 20 - 10];
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const maxValue = Math.max(...data, 100);
  const minValue = Math.min(...data, 50);
  const range = maxValue - minValue || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - minValue) / range) * 80;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className={cn("glass-card-elevated rounded-2xl p-6 slide-up", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold font-heading text-foreground">Heart Rate</h3>
          <p className="text-sm text-muted-foreground">Last 60 seconds</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary font-heading">
            {data.length > 0 ? Math.round(data[data.length - 1]) : 72}
          </span>
          <span className="text-sm text-muted-foreground ml-1">BPM</span>
        </div>
      </div>

      <div className="relative h-32 w-full">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <polygon
            fill="url(#heartGradient)"
            points={areaPoints}
            className="transition-all duration-300"
          />

          {/* Line */}
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="0.5"
            points={points}
            className="transition-all duration-300"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current value dot */}
          {data.length > 0 && (
            <circle
              cx="100"
              cy={100 - ((data[data.length - 1] - minValue) / range) * 80}
              r="1.5"
              fill="hsl(var(--primary))"
              className="pulse-ring"
            />
          )}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
          <span>{Math.round(maxValue)}</span>
          <span>{Math.round(minValue)}</span>
        </div>
      </div>
    </div>
  );
}
