"use client";

import { ExamResults as ExamResultsType } from "@/lib/store";
import { Question } from "@/data/questions";
import { Locale, t } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ExamResultsProps {
  results: ExamResultsType;
  questions: Question[];
  locale: Locale;
  onBackToMenu: () => void;
  onReviewAnswers: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function ExamResultsView({
  results,
  questions,
  locale,
  onBackToMenu,
  onReviewAnswers,
}: ExamResultsProps) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Score Card */}
      <Card className={cn(
        "border-2 text-center",
        results.passed
          ? "border-success/40 bg-success/5"
          : "border-destructive/40 bg-destructive/5"
      )}>
        <CardHeader>
          <div className="text-5xl mb-2">
            {results.passed ? "🎉" : "📚"}
          </div>
          <CardTitle className="text-2xl">
            {results.passed ? t("results.passed", locale) : t("results.failed", locale)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center gap-8">
            <div>
              <p className="text-4xl font-bold text-primary">{results.scaledScore}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("results.scaledScore", locale)}</p>
              <p className="text-xs text-muted-foreground">{t("results.minToPass", locale)}</p>
            </div>
            <Separator orientation="vertical" className="h-20" />
            <div>
              <p className="text-4xl font-bold">{results.totalCorrect}/{results.totalQuestions}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("results.correctAnswers", locale)}</p>
              <p className="text-xs text-muted-foreground">({Math.round(results.percentage)}%)</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {t("results.totalTime", locale)} {formatTime(results.totalTime)}
          </div>
        </CardContent>
      </Card>

      {/* Domain Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("results.domainBreakdown", locale)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.domainScores.map((ds) => (
            <div key={ds.domain} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  D{ds.domain}: {ds.name}
                </span>
                <span className="text-muted-foreground">
                  {ds.correct}/{ds.total} ({ds.percentage}%)
                </span>
              </div>
              <Progress
                value={ds.percentage}
                className={cn(
                  "h-2.5",
                  ds.percentage >= 72 ? "[&>div]:bg-success" :
                  ds.percentage >= 50 ? "[&>div]:bg-warning" :
                  "[&>div]:bg-destructive"
                )}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weak areas */}
      {results.domainScores.some(d => d.percentage < 72) && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-lg">{t("results.weakAreas", locale)}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.domainScores
                .filter(d => d.percentage < 72)
                .sort((a, b) => a.percentage - b.percentage)
                .map(d => (
                  <li key={d.domain} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">D{d.domain}</Badge>
                    <span>{d.name}</span>
                    <span className="text-destructive font-medium ml-auto">{d.percentage}%</span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onReviewAnswers} size="lg">
          {t("results.reviewAnswers", locale)}
        </Button>
        <Button onClick={onBackToMenu} size="lg">
          {t("results.backToMenu", locale)}
        </Button>
      </div>
    </div>
  );
}
