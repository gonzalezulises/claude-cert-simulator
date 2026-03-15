"use client";

import { StudyProgress } from "@/lib/store";
import { domainNames } from "@/data/questions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressDashboardProps {
  progress: StudyProgress;
}

export default function ProgressDashboard({ progress }: ProgressDashboardProps) {
  const overallPct = progress.questionsAnswered > 0
    ? Math.round((progress.correctAnswers / progress.questionsAnswered) * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Tu progreso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span>General</span>
            <span className="text-muted-foreground">
              {progress.correctAnswers}/{progress.questionsAnswered} ({overallPct}%)
            </span>
          </div>
          <Progress
            value={overallPct}
            className={cn(
              "h-2",
              overallPct >= 72 ? "[&>div]:bg-success" :
              overallPct >= 50 ? "[&>div]:bg-warning" :
              "[&>div]:bg-destructive"
            )}
          />
        </div>

        {/* Per domain */}
        {Object.entries(domainNames).map(([key, name]) => {
          const d = Number(key);
          const dp = progress.domainProgress[d];
          const pct = dp && dp.answered > 0 ? Math.round((dp.correct / dp.answered) * 100) : 0;
          return (
            <div key={d} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="truncate">D{d}: {name}</span>
                <span className="text-muted-foreground ml-2 flex-shrink-0">
                  {dp ? `${dp.correct}/${dp.answered}` : "0/0"}
                </span>
              </div>
              <Progress
                value={pct}
                className={cn(
                  "h-1.5",
                  pct >= 72 ? "[&>div]:bg-success" :
                  pct >= 50 ? "[&>div]:bg-warning" :
                  "[&>div]:bg-destructive"
                )}
              />
            </div>
          );
        })}

        {/* Exam history */}
        {progress.examHistory.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">Examenes recientes</p>
            <div className="space-y-1">
              {progress.examHistory.slice(-3).reverse().map((e, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {new Date(e.date).toLocaleDateString("es-MX")}
                  </span>
                  <span className={cn(
                    "font-mono font-medium",
                    e.passed ? "text-success" : "text-destructive"
                  )}>
                    {e.scaledScore} {e.passed ? "✓" : "✗"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
