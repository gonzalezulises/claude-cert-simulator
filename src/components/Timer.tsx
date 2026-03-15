"use client";

import { useEffect, useState } from "react";
import { Locale, t } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TimerProps {
  startTime: number;
  locale: Locale;
  timeLimit?: number;
  onTimeUp?: () => void;
}

export default function Timer({ startTime, locale, timeLimit, onTimeUp }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(now);
      if (timeLimit && now >= timeLimit && onTimeUp) {
        onTimeUp();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, timeLimit, onTimeUp]);

  const remaining = timeLimit ? Math.max(0, timeLimit - elapsed) : elapsed;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isLow = timeLimit ? remaining < 300 : false;
  const isCritical = timeLimit ? remaining < 60 : false;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-sm px-3 py-1 tabular-nums",
        isLow && "border-warning text-warning-foreground bg-warning/10",
        isCritical && "border-destructive text-destructive bg-destructive/10 animate-pulse"
      )}
    >
      ⏱ {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      {timeLimit && <span className="text-xs ml-1 opacity-60">{t("topbar.remaining", locale)}</span>}
    </Badge>
  );
}
