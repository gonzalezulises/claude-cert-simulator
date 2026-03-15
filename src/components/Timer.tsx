"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TimerProps {
  startTime: number;
  timeLimit?: number; // seconds
  onTimeUp?: () => void;
}

export default function Timer({ startTime, timeLimit, onTimeUp }: TimerProps) {
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
  const isLow = timeLimit ? remaining < 300 : false; // < 5 min
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
      {timeLimit ? "⏱" : "⏱"} {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      {timeLimit && <span className="text-xs ml-1 opacity-60">restante</span>}
    </Badge>
  );
}
