"use client";

import { Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
}

export default function LanguageToggle({ locale, onChange }: LanguageToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border bg-muted p-0.5 text-xs">
      <button
        onClick={() => onChange("es")}
        className={cn(
          "px-2.5 py-1 rounded-md font-medium transition-all",
          locale === "es"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        ES
      </button>
      <button
        onClick={() => onChange("en")}
        className={cn(
          "px-2.5 py-1 rounded-md font-medium transition-all",
          locale === "en"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
    </div>
  );
}
