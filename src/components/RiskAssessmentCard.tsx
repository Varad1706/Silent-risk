import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRiskAssessments, RiskAssessment } from '@/hooks/useRiskAssessments';
import { AlertTriangle, Activity, Brain, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

function getRiskColor(level: string) {
  switch (level) {
    case 'low': return 'bg-green-500/20 text-green-700 dark:text-green-400';
    case 'moderate': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    case 'high': return 'bg-red-500/20 text-red-700 dark:text-red-400';
    default: return 'bg-muted text-muted-foreground';
  }
}

function getRiskIcon(condition: string) {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('cardio') || lowerCondition.includes('heart')) {
    return <Activity className="h-4 w-4" />;
  }
  if (lowerCondition.includes('stress') || lowerCondition.includes('mental')) {
    return <Brain className="h-4 w-4" />;
  }
  return <AlertTriangle className="h-4 w-4" />;
}

function AssessmentItem({ assessment }: { assessment: RiskAssessment }) {
  return (
    <div className="space-y-2 p-3 rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getRiskIcon(assessment.condition)}
          <span className="font-medium text-sm">{assessment.condition}</span>
        </div>
        <Badge variant="outline" className={getRiskColor(assessment.risk_level)}>
          {assessment.risk_level}
        </Badge>
      </div>
      <Progress value={assessment.risk_score} className="h-2" />
      <p className="text-xs text-muted-foreground">{assessment.description}</p>
      <p className="text-xs text-muted-foreground/70">
        {format(new Date(assessment.assessed_at), 'MMM d, yyyy h:mm a')}
      </p>
    </div>
  );
}

export function RiskAssessmentCard() {
  const { assessments, isLoading, isCalculating, calculateRisk } = useRiskAssessments();

  // Get latest assessments (one per condition)
  const latestAssessments = assessments.reduce((acc, curr) => {
    if (!acc.find(a => a.condition === curr.condition)) {
      acc.push(curr);
    }
    return acc;
  }, [] as RiskAssessment[]).slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Risk Assessment</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={calculateRisk}
          disabled={isCalculating}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
          {isCalculating ? 'Analyzing...' : 'Analyze'}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : latestAssessments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No risk assessments yet</p>
            <p className="text-xs">Log some health metrics and click Analyze</p>
          </div>
        ) : (
          <div className="space-y-3">
            {latestAssessments.map(assessment => (
              <AssessmentItem key={assessment.id} assessment={assessment} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
