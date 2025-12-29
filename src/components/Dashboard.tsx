import { useState } from "react";
import { Header } from "@/components/Header";
import { HealthMetricCard } from "@/components/HealthMetricCard";
import { AlertCard } from "@/components/AlertCard";
import { HeartRateChart } from "@/components/HeartRateChart";
import { OverallHealthScore } from "@/components/OverallHealthScore";
import { DailyInsights } from "@/components/DailyInsights";
import { HealthTrendChart } from "@/components/HealthTrendChart";
import { LogMetricDialog, QuickActionType } from "@/components/LogMetricDialog";
import { RiskAssessmentCard } from "@/components/RiskAssessmentCard";
import { useHealthMetrics, useLatestMetric } from "@/hooks/useHealthMetrics";
import { useAlerts } from "@/hooks/useAlerts";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  Activity,
  Thermometer,
  Brain,
  Droplets,
  Zap,
  Loader2,
} from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();
  const { data: metrics, isLoading: metricsLoading } = useHealthMetrics(7);
  const { data: latestMetric } = useLatestMetric();
  const { data: alerts, isLoading: alertsLoading } = useAlerts();
  const [quickAction, setQuickAction] = useState<QuickActionType>(null);

  const getMetricStatus = (value: number | null, normal: [number, number]): "normal" | "warning" | "critical" => {
    if (value === null) return "normal";
    if (value >= normal[0] && value <= normal[1]) return "normal";
    const deviation = Math.min(
      Math.abs(value - normal[0]),
      Math.abs(value - normal[1])
    );
    const range = normal[1] - normal[0];
    return deviation > range * 0.5 ? "critical" : "warning";
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
  const lastSyncTime = latestMetric?.recorded_at
    ? formatDistanceToNow(new Date(latestMetric.recorded_at), { addSuffix: true })
    : "Never";

  // Calculate health score based on metrics
  const calculateHealthScore = () => {
    if (!latestMetric) return 78; // Default score
    let score = 100;
    
    if (latestMetric.heart_rate) {
      if (latestMetric.heart_rate < 60 || latestMetric.heart_rate > 100) score -= 10;
    }
    if (latestMetric.blood_pressure_systolic) {
      if (latestMetric.blood_pressure_systolic > 130) score -= 15;
    }
    if (latestMetric.hydration && latestMetric.hydration < 60) score -= 10;
    if (latestMetric.stress_level && latestMetric.stress_level > 70) score -= 10;
    if (latestMetric.sleep_hours && latestMetric.sleep_hours < 6) score -= 15;
    
    return Math.max(0, Math.min(100, score));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-8 fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
                Good morning, <span className="gradient-text">{displayName}</span>
              </h2>
              <p className="text-muted-foreground mt-1">
                Here's your health overview for today
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-left sm:text-right">
                <p className="text-sm text-muted-foreground">Last sync</p>
                <p className="font-medium text-foreground">{lastSyncTime}</p>
              </div>
              <LogMetricDialog />
            </div>
          </div>
        </section>

        {metricsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Health Metrics */}
            <div className="lg:col-span-2 space-y-6">
              {/* Health Score and Chart Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <OverallHealthScore score={calculateHealthScore()} />
                <HeartRateChart />
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <HealthMetricCard
                  title="Heart Rate"
                  value={latestMetric?.heart_rate?.toString() || "72"}
                  unit="BPM"
                  icon={Heart}
                  trend="stable"
                  trendValue="Normal"
                  status={getMetricStatus(latestMetric?.heart_rate || null, [60, 100])}
                  delay={100}
                />
                <HealthMetricCard
                  title="Blood Pressure"
                  value={
                    latestMetric?.blood_pressure_systolic && latestMetric?.blood_pressure_diastolic
                      ? `${latestMetric.blood_pressure_systolic}/${latestMetric.blood_pressure_diastolic}`
                      : "120/80"
                  }
                  unit="mmHg"
                  icon={Activity}
                  status={getMetricStatus(latestMetric?.blood_pressure_systolic || null, [90, 130])}
                  delay={200}
                />
                <HealthMetricCard
                  title="Temperature"
                  value={latestMetric?.temperature?.toString() || "98.4"}
                  unit="°F"
                  icon={Thermometer}
                  status={getMetricStatus(latestMetric?.temperature || null, [97, 99])}
                  delay={300}
                />
                <HealthMetricCard
                  title="Stress Level"
                  value={latestMetric?.stress_level?.toString() || "42"}
                  unit="/ 100"
                  icon={Brain}
                  trend="down"
                  trendValue="-8%"
                  status={getMetricStatus(latestMetric?.stress_level || null, [0, 50])}
                  delay={400}
                />
                <HealthMetricCard
                  title="Hydration"
                  value={latestMetric?.hydration?.toString() || "68"}
                  unit="%"
                  icon={Droplets}
                  status={getMetricStatus(latestMetric?.hydration || null, [60, 100])}
                  delay={500}
                />
                <HealthMetricCard
                  title="Energy"
                  value={latestMetric?.energy_level?.toString() || "85"}
                  unit="%"
                  icon={Zap}
                  trend="up"
                  trendValue="+15%"
                  status={getMetricStatus(latestMetric?.energy_level || null, [50, 100])}
                  delay={600}
                />
              </div>

              {/* Trend Charts */}
              {metrics && metrics.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold font-heading text-foreground mb-4">
                    Health Trends
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <HealthTrendChart
                      data={metrics}
                      metric="heart_rate"
                      title="Heart Rate Trend"
                      unit="BPM"
                    />
                    <HealthTrendChart
                      data={metrics}
                      metric="steps"
                      title="Daily Steps"
                      color="hsl(var(--success))"
                    />
                  </div>
                </div>
              )}

              {/* AI Risk Assessment */}
              <RiskAssessmentCard />
            </div>

            {/* Right Column - Alerts & Insights */}
            <div className="space-y-6">
              {/* Daily Insights */}
              <DailyInsights className="delay-300" />

              {/* Alerts */}
              <div
                className="glass-card-elevated rounded-2xl p-6 slide-up"
                style={{ animationDelay: "400ms" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold font-heading text-foreground">
                    Recent Alerts
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {alerts?.length || 0} alerts
                  </span>
                </div>

                <div className="space-y-3">
                  {alertsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : alerts && alerts.length > 0 ? (
                    alerts.slice(0, 3).map((alert, index) => (
                      <AlertCard
                        key={alert.id}
                        title={alert.title}
                        message={alert.message}
                        time={formatDistanceToNow(new Date(alert.created_at), {
                          addSuffix: true,
                        })}
                        severity={alert.severity}
                        isNew={!alert.is_read}
                        delay={500 + index * 100}
                      />
                    ))
                  ) : (
                    <>
                      <AlertCard
                        title="Welcome to SilentRisk"
                        message="Start logging your health metrics to receive personalized alerts and insights."
                        time="Just now"
                        severity="info"
                        isNew
                        delay={500}
                      />
                      <AlertCard
                        title="Tip: Log Daily Metrics"
                        message="For best results, log your metrics at the same time each day."
                        time="Just now"
                        severity="info"
                        delay={600}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div
                className="glass-card-elevated rounded-2xl p-6 slide-up"
                style={{ animationDelay: "500ms" }}
              >
                <h3 className="font-semibold font-heading text-foreground mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setQuickAction("activity")}
                    className="p-4 rounded-xl bg-accent hover:bg-accent/80 transition-colors text-center"
                  >
                    <Activity className="w-6 h-6 text-primary mx-auto mb-2" />
                    <span className="text-sm font-medium text-foreground">
                      Log Activity
                    </span>
                  </button>
                  <button 
                    onClick={() => setQuickAction("water")}
                    className="p-4 rounded-xl bg-accent hover:bg-accent/80 transition-colors text-center"
                  >
                    <Droplets className="w-6 h-6 text-primary mx-auto mb-2" />
                    <span className="text-sm font-medium text-foreground">
                      Log Water
                    </span>
                  </button>
                  <button 
                    onClick={() => setQuickAction("heart")}
                    className="p-4 rounded-xl bg-accent hover:bg-accent/80 transition-colors text-center"
                  >
                    <Heart className="w-6 h-6 text-primary mx-auto mb-2" />
                    <span className="text-sm font-medium text-foreground">
                      Check Heart
                    </span>
                  </button>
                  <button 
                    onClick={() => setQuickAction("stress")}
                    className="p-4 rounded-xl bg-accent hover:bg-accent/80 transition-colors text-center"
                  >
                    <Brain className="w-6 h-6 text-primary mx-auto mb-2" />
                    <span className="text-sm font-medium text-foreground">
                      Stress Test
                    </span>
                  </button>
                </div>
              </div>

              {/* Quick Action Dialog */}
              <LogMetricDialog 
                quickAction={quickAction} 
                onQuickActionComplete={() => setQuickAction(null)} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
