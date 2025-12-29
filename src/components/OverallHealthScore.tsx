import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

interface OverallHealthScoreProps {
  score: number;
  className?: string;
}

export function OverallHealthScore({ score, className }: OverallHealthScoreProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Attention";
  };

  const getGradientId = () => {
    if (score >= 80) return "scoreGradientGreen";
    if (score >= 60) return "scoreGradientYellow";
    return "scoreGradientRed";
  };

  return (
    <div
      className={cn(
        "glass-card-elevated rounded-2xl p-8 slide-up text-center relative overflow-hidden",
        className
      )}
    >
      {/* Background glow */}
      <div
        className={cn(
          "absolute inset-0 opacity-10 blur-3xl",
          score >= 80 ? "bg-success" : score >= 60 ? "bg-warning" : "bg-destructive"
        )}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold font-heading text-foreground">
            Overall Health Score
          </h3>
        </div>

        <div className="relative inline-flex items-center justify-center">
          <svg className="w-40 h-40 transform -rotate-90">
            <defs>
              <linearGradient id="scoreGradientGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--success))" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="scoreGradientYellow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--warning))" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <linearGradient id="scoreGradientRed" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--destructive))" />
                <stop offset="100%" stopColor="#f87171" />
              </linearGradient>
            </defs>

            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />

            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="45"
              fill="none"
              stroke={`url(#${getGradientId()})`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-4xl font-bold font-heading", getScoreColor())}>
              {score}
            </span>
            <span className="text-sm text-muted-foreground">out of 100</span>
          </div>
        </div>

        <p className={cn("mt-4 font-medium", getScoreColor())}>{getScoreLabel()}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Based on your daily smartphone signals
        </p>
      </div>
    </div>
  );
}
