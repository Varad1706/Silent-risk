import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp, Moon, Footprints } from "lucide-react";

interface InsightProps {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  trend?: "positive" | "negative" | "neutral";
}

function Insight({ icon: Icon, title, value, description, trend = "neutral" }: InsightProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <span
            className={cn(
              "text-sm font-semibold",
              trend === "positive" && "text-success",
              trend === "negative" && "text-destructive",
              trend === "neutral" && "text-muted-foreground"
            )}
          >
            {value}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

interface DailyInsightsProps {
  className?: string;
}

export function DailyInsights({ className }: DailyInsightsProps) {
  const insights: InsightProps[] = [
    {
      icon: TrendingUp,
      title: "Activity Level",
      value: "+12%",
      description: "More active than yesterday",
      trend: "positive",
    },
    {
      icon: Moon,
      title: "Sleep Quality",
      value: "7.5h",
      description: "Deep sleep: 2h 15m",
      trend: "positive",
    },
    {
      icon: Footprints,
      title: "Steps Today",
      value: "8,432",
      description: "1,568 to reach daily goal",
      trend: "neutral",
    },
  ];

  return (
    <div className={cn("glass-card-elevated rounded-2xl p-6 slide-up", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold font-heading text-foreground">AI Insights</h3>
      </div>

      <div className="space-y-1">
        {insights.map((insight, index) => (
          <Insight key={index} {...insight} />
        ))}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-accent/50 border border-accent">
        <p className="text-sm text-accent-foreground">
          <span className="font-semibold">AI Recommendation:</span> Consider a short evening walk to improve your sleep quality based on your recent patterns.
        </p>
      </div>
    </div>
  );
}
