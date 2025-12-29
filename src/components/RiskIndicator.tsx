import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface RiskIndicatorProps {
  level: "low" | "medium" | "high";
  percentage: number;
  condition: string;
  description: string;
  className?: string;
  delay?: number;
}

export function RiskIndicator({
  level,
  percentage,
  condition,
  description,
  className,
  delay = 0,
}: RiskIndicatorProps) {
  const levelConfig = {
    low: {
      icon: CheckCircle,
      gradient: "from-success to-emerald-400",
      bg: "bg-success/10",
      text: "text-success",
      label: "Low Risk",
    },
    medium: {
      icon: AlertTriangle,
      gradient: "from-warning to-amber-400",
      bg: "bg-warning/10",
      text: "text-warning",
      label: "Medium Risk",
    },
    high: {
      icon: AlertCircle,
      gradient: "from-destructive to-red-400",
      bg: "bg-destructive/10",
      text: "text-destructive",
      label: "High Risk",
    },
  };

  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "glass-card-elevated rounded-2xl p-6 slide-up overflow-hidden relative group",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background gradient accent */}
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-30",
          `bg-gradient-to-br ${config.gradient}`
        )}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-xl", config.bg)}>
            <Icon className={cn("w-6 h-6", config.text)} />
          </div>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold",
              config.bg,
              config.text
            )}
          >
            {config.label}
          </span>
        </div>

        <h3 className="text-lg font-semibold font-heading text-foreground mb-2">
          {condition}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        {/* Risk meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Risk Score</span>
            <span className={cn("font-semibold", config.text)}>{percentage}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r",
                config.gradient
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
