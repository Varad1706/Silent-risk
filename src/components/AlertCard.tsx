import { cn } from "@/lib/utils";
import { Bell, Clock, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

interface AlertCardProps {
  title: string;
  message: string;
  time: string;
  severity: "info" | "warning" | "critical";
  isNew?: boolean;
  className?: string;
  delay?: number;
}

export function AlertCard({
  title,
  message,
  time,
  severity,
  isNew = false,
  className,
  delay = 0,
}: AlertCardProps) {
  const severityConfig = {
    info: {
      border: "border-l-primary",
      bg: "bg-primary/5",
      icon: "text-primary",
    },
    warning: {
      border: "border-l-warning",
      bg: "bg-warning/5",
      icon: "text-warning",
    },
    critical: {
      border: "border-l-destructive",
      bg: "bg-destructive/5",
      icon: "text-destructive",
    },
  };

  const config = severityConfig[severity];

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-4 border-l-4 slide-up group hover:shadow-lg transition-all duration-300",
        config.border,
        isNew && config.bg,
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className={cn("mt-1", severity === "critical" && "heartbeat")}>
          <Bell className={cn("w-5 h-5", config.icon)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground truncate">{title}</h4>
            {isNew && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full font-medium">
                New
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {message}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {time}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              View Details
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
