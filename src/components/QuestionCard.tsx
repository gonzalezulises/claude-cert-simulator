"use client";

import { Question } from "@/data/questions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  selectedAnswer: "A" | "B" | "C" | "D" | null;
  onAnswer: (answer: "A" | "B" | "C" | "D") => void;
  showExplanation: boolean;
  isStudyMode: boolean;
  onNext: () => void;
  onPrev: () => void;
  onReveal?: () => void;
}

const difficultyColors = {
  basic: "bg-success/15 text-success border-success/30",
  intermediate: "bg-warning/15 text-warning-foreground border-warning/30",
  advanced: "bg-destructive/15 text-destructive border-destructive/30",
};

const difficultyLabels = {
  basic: "Basico",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

export default function QuestionCard({
  question,
  index,
  total,
  selectedAnswer,
  onAnswer,
  showExplanation,
  isStudyMode,
  onNext,
  onPrev,
  onReveal,
}: QuestionCardProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const answered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="space-y-4">
      {/* Header info */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-mono text-xs">
          {index + 1} / {total}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          Dominio {question.domain}: {question.domainName}
        </Badge>
        <Badge variant="outline" className="text-xs">
          Task {question.taskStatement}
        </Badge>
        <Badge className={cn("text-xs", difficultyColors[question.difficulty])}>
          {difficultyLabels[question.difficulty]}
        </Badge>
      </div>

      {/* Scenario badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Escenario:
        </span>
        <Badge variant="outline" className="text-xs font-normal">
          {question.scenario}
        </Badge>
      </div>

      {/* Question */}
      <Card>
        <CardHeader className="pb-3">
          <p className="text-base leading-relaxed font-medium">
            {question.question}
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrectOption = option.id === question.correctAnswer;
            const showResult = showExplanation && answered;

            let optionStyle = "border-border hover:border-primary/40 hover:bg-accent/50 cursor-pointer";
            if (isSelected && !showResult) {
              optionStyle = "border-primary bg-primary/10 ring-2 ring-primary/20";
            }
            if (showResult) {
              if (isCorrectOption) {
                optionStyle = "border-success bg-success/10 ring-2 ring-success/20";
              } else if (isSelected && !isCorrectOption) {
                optionStyle = "border-destructive bg-destructive/10 ring-2 ring-destructive/20";
              } else {
                optionStyle = "border-border opacity-60";
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => {
                  if (!showResult) onAnswer(option.id);
                }}
                onMouseEnter={() => setHoveredOption(option.id)}
                onMouseLeave={() => setHoveredOption(null)}
                disabled={showResult}
                className={cn(
                  "w-full text-left rounded-lg border p-3.5 transition-all duration-200 flex items-start gap-3",
                  optionStyle,
                  showResult && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold border transition-colors",
                    isSelected && !showResult && "bg-primary text-primary-foreground border-primary",
                    showResult && isCorrectOption && "bg-success text-success-foreground border-success",
                    showResult && isSelected && !isCorrectOption && "bg-destructive text-white border-destructive",
                    !isSelected && !showResult && hoveredOption === option.id && "border-primary/50 text-primary",
                    !isSelected && !showResult && hoveredOption !== option.id && "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {option.id}
                </span>
                <span className="text-sm leading-relaxed pt-0.5">{option.text}</span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Study mode: reveal button */}
      {isStudyMode && answered && !showExplanation && onReveal && (
        <div className="flex justify-center">
          <Button onClick={onReveal} variant="default" size="lg">
            Ver explicacion
          </Button>
        </div>
      )}

      {/* Explanation */}
      {showExplanation && answered && (
        <Card className={cn(
          "border-2",
          isCorrect ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
        )}>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">
                {isCorrect ? "✓" : "✗"}
              </span>
              <span className={cn(
                "font-semibold text-sm",
                isCorrect ? "text-success" : "text-destructive"
              )}>
                {isCorrect ? "Correcto" : `Incorrecto — La respuesta correcta es ${question.correctAnswer}`}
              </span>
            </div>
            <Separator className="mb-3" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {question.explanation}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Concepto clave:</span>
              <Badge variant="secondary" className="text-xs">
                {question.keyConcept}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={index === 0}
        >
          ← Anterior
        </Button>
        <Button
          onClick={onNext}
          disabled={!isStudyMode && !answered}
        >
          {index === total - 1 ? "Finalizar" : "Siguiente →"}
        </Button>
      </div>
    </div>
  );
}
