"use client";

import { StudyProgress } from "@/lib/store";
import { Locale, t } from "@/lib/i18n";
import { domainNames } from "@/data/questions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressDashboardProps {
  progress: StudyProgress;
  locale: Locale;
  embedded?: boolean;
}

export default function ProgressDashboard({ progress, locale, embedded }: ProgressDashboardProps) {
  const overallPct = progress.questionsAnswered > 0
    ? Math.round((progress.correctAnswers / progress.questionsAnswered) * 100)
    : 0;

  const content = (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {t("progress.title", locale)}
      </p>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span>{t("progress.general", locale)}</span>
          <span className="text-muted-foreground">
            {progress.correctAnswers}/{progress.questionsAnswered} ({overallPct}%)
          </span>
        </div>
        <Progress
          value={overallPct}
          className={cn(
            "h-1.5",
            overallPct >= 72 ? "[&>div]:bg-success" :
            overallPct >= 50 ? "[&>div]:bg-warning" :
            "[&>div]:bg-destructive"
          )}
        />
      </div>

      {Object.entries(domainNames).map(([key, name]) => {
        const d = Number(key);
        const dp = progress.domainProgress[d];
        const pct = dp && dp.answered > 0 ? Math.round((dp.correct / dp.answered) * 100) : 0;
        return (
          <div key={d} className="space-y-0.5">
            <div className="flex justify-between text-[10px]">
              <span className="truncate">D{d}: {name}</span>
              <span className="text-muted-foreground ml-2 flex-shrink-0">
                {dp ? `${dp.correct}/${dp.answered}` : "—"}
              </span>
            </div>
            <Progress
              value={pct}
              className={cn(
                "h-1",
                pct >= 72 ? "[&>div]:bg-success" :
                pct >= 50 ? "[&>div]:bg-warning" :
                "[&>div]:bg-destructive"
              )}
            />
          </div>
        );
      })}

      {progress.examHistory.length > 0 && (
        <div className="pt-1">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">
            {t("progress.recentExams", locale)}
          </p>
          <div className="space-y-0.5">
            {progress.examHistory.slice(-3).reverse().map((e, i) => (
              <div key={i} className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">
                  {new Date(e.date).toLocaleDateString(locale === "es" ? "es-MX" : "en-US")}
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
    </div>
  );

  if (embedded) return content;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("progress.title", locale)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {content}
      </CardContent>
    </Card>
  );
}
