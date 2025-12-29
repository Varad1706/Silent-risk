import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface HealthMetricCardProps {
  title: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  status?: "normal" | "warning" | "critical";
  className?: string;
  delay?: number;
}

export function HealthMetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  status = "normal",
  className,
  delay = 0,
}: HealthMetricCardProps) {
  const statusColors = {
    normal: "text-success",
    warning: "text-warning",
    critical: "text-destructive",
  };

  const statusBg = {
    normal: "bg-success/10",
    warning: "bg-warning/10",
    critical: "bg-destructive/10",
  };

  const trendIcons = {
    up: "↑",
    down: "↓",
    stable: "→",
  };

  return (
    <div
      className={cn(
        "glass-card-elevated rounded-2xl p-6 slide-up group hover:scale-[1.02] transition-transform duration-300",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "p-3 rounded-xl transition-colors duration-300",
            statusBg[status],
            "group-hover:scale-110"
          )}
        >
          <Icon className={cn("w-5 h-5", statusColors[status])} />
        </div>
        {trend && trendValue && (
          <span
            className={cn(
              "text-sm font-medium flex items-center gap-1",
              trend === "up" && status === "normal" ? "text-success" : "",
              trend === "down" && status === "normal" ? "text-destructive" : "",
              trend === "stable" ? "text-muted-foreground" : ""
            )}
          >
            {trendIcons[trend]} {trendValue}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-3xl font-bold font-heading", statusColors[status])}>
            {value}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>

      {status !== "normal" && (
        <div
          className={cn(
            "mt-4 px-3 py-2 rounded-lg text-xs font-medium",
            statusBg[status],
            statusColors[status]
          )}
        >
          {status === "warning" ? "Attention needed" : "Critical - Review now"}
        </div>
      )}
    </div>
  );
}
