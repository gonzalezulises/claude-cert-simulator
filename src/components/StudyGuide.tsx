"use client";

import { studyGuide, DomainGuide } from "@/data/study-guide";
import { Locale } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StudyGuideProps {
  locale: Locale;
  onBack: () => void;
}

export default function StudyGuide({ locale, onBack }: StudyGuideProps) {
  const [activeDomain, setActiveDomain] = useState<number | null>(null);
  const isEs = locale === "es";

  if (activeDomain !== null) {
    const guide = studyGuide.find((g) => g.domain === activeDomain)!;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setActiveDomain(null)}>
            ← {isEs ? "Dominios" : "Domains"}
          </Button>
          <Badge variant="default">{guide.weight}%</Badge>
        </div>

        <div>
          <h2 className="text-xl font-bold">D{guide.domain}: {guide.name}</h2>
          <Card className="mt-3 border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <p className="text-sm font-medium">
                {isEs ? "Regla clave:" : "Key rule:"}
              </p>
              <p className="text-sm mt-1 italic">
                {isEs ? guide.keyRuleEs : guide.keyRule}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Concepts */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            {isEs ? "Conceptos clave" : "Key concepts"}
          </h3>
          <div className="space-y-4">
            {guide.concepts.map((c, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {isEs ? c.titleEs : c.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {isEs ? c.contentEs : c.content}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Anti-patterns */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-destructive">
            {isEs ? "Anti-patrones" : "Anti-patterns"}
          </h3>
          <div className="space-y-3">
            {guide.antiPatterns.map((ap, i) => (
              <Card key={i} className="border-destructive/20 bg-destructive/5">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium">
                    {isEs ? ap.patternEs : ap.pattern}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">{isEs ? "Por que:" : "Why:"}</span>{" "}
                    {isEs ? ap.whyEs : ap.why}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Exam traps */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-warning-foreground">
            {isEs ? "Trampas del examen" : "Exam traps"}
          </h3>
          <div className="space-y-2">
            {guide.examTraps.map((t, i) => (
              <Card key={i} className="border-warning/20 bg-warning/5">
                <CardContent className="pt-3 pb-3">
                  <p className="text-sm">
                    {isEs ? t.trapEs : t.trap}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Build exercise */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-success">
            {isEs ? "Ejercicio practico" : "Build exercise"}
          </h3>
          <Card className="border-success/20 bg-success/5">
            <CardContent className="pt-4">
              <p className="text-sm leading-relaxed">
                {isEs ? guide.buildExerciseEs : guide.buildExercise}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            {isEs ? "Recursos oficiales" : "Official resources"}
          </h3>
          <div className="space-y-1">
            {guide.resources.map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary hover:underline"
              >
                → {r.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Menu
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-bold">
          {isEs ? "Guia de estudio" : "Study Guide"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isEs
            ? "Conceptos clave, anti-patrones, trampas del examen y ejercicios practicos por dominio."
            : "Key concepts, anti-patterns, exam traps, and build exercises by domain."}
        </p>
      </div>

      <div className="grid gap-4">
        {studyGuide.map((guide) => (
          <Card
            key={guide.domain}
            className="border-2 hover:border-primary/30 transition-colors cursor-pointer"
            onClick={() => setActiveDomain(guide.domain)}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="default" className="text-xs">{guide.weight}%</Badge>
                    <span className="text-base font-semibold">
                      D{guide.domain}: {guide.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {isEs ? guide.keyRuleEs : guide.keyRule}
                  </p>
                </div>
                <span className="text-muted-foreground ml-2">→</span>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {guide.concepts.length} {isEs ? "conceptos" : "concepts"}
                </Badge>
                <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                  {guide.antiPatterns.length} anti-patterns
                </Badge>
                <Badge variant="outline" className="text-xs text-warning-foreground border-warning/30">
                  {guide.examTraps.length} {isEs ? "trampas" : "traps"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
