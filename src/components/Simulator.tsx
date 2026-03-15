"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  questions,
  getQuestionsByDomain,
  getExamSample,
  domainNames,
  Question,
} from "@/data/questions";
import {
  Mode,
  UserAnswer,
  ExamResults as ExamResultsType,
  calculateResults,
  loadProgress,
  saveProgress,
  resetProgress,
  StudyProgress,
} from "@/lib/store";
import QuestionCard from "./QuestionCard";
import ExamResultsView from "./ExamResults";
import Timer from "./Timer";
import ProgressDashboard from "./ProgressDashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const EXAM_TIME_LIMIT = 90 * 60; // 90 minutes
const EXAM_QUESTION_COUNT = 30;

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Simulator() {
  const [mode, setMode] = useState<Mode>("menu");
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [results, setResults] = useState<ExamResultsType | null>(null);
  const [progress, setProgress] = useState<StudyProgress>(loadProgress());
  const [studyDomain, setStudyDomain] = useState<number | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Load progress on mount
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startStudyMode = useCallback((domain: number | null) => {
    setStudyDomain(domain);
    let qs = domain ? getQuestionsByDomain(domain as 1 | 2 | 3 | 4 | 5) : [...questions];
    qs = shuffleArray(qs);
    setActiveQuestions(qs);
    setCurrentIndex(0);
    setAnswers(new Array(qs.length).fill(null).map(() => ({
      questionId: "",
      selectedAnswer: null,
      isCorrect: false,
      timeSpent: 0,
    })));
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setShowExplanation(false);
    setMode("study");
  }, []);

  const startExamMode = useCallback(() => {
    const qs = getExamSample(EXAM_QUESTION_COUNT);
    setActiveQuestions(qs);
    setCurrentIndex(0);
    setAnswers(new Array(qs.length).fill(null).map(() => ({
      questionId: "",
      selectedAnswer: null,
      isCorrect: false,
      timeSpent: 0,
    })));
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setShowExplanation(false);
    setResults(null);
    setMode("exam");
  }, []);

  const handleAnswer = useCallback(
    (answer: "A" | "B" | "C" | "D") => {
      const q = activeQuestions[currentIndex];
      const isCorrect = answer === q.correctAnswer;
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

      const newAnswers = [...answers];
      newAnswers[currentIndex] = {
        questionId: q.id,
        selectedAnswer: answer,
        isCorrect,
        timeSpent,
      };
      setAnswers(newAnswers);

      // In study mode, show explanation after selecting
      if (mode === "study") {
        // Don't auto-show; let user click "Ver explicacion"
      }

      // Update progress
      const newProgress = { ...progress };
      if (!newProgress.answeredIds.includes(q.id)) {
        newProgress.questionsAnswered++;
        if (isCorrect) newProgress.correctAnswers++;
        if (!newProgress.domainProgress[q.domain]) {
          newProgress.domainProgress[q.domain] = { answered: 0, correct: 0 };
        }
        newProgress.domainProgress[q.domain].answered++;
        if (isCorrect) newProgress.domainProgress[q.domain].correct++;
        newProgress.answeredIds.push(q.id);
        newProgress.lastSession = new Date().toISOString();
        saveProgress(newProgress);
        setProgress(newProgress);
      }
    },
    [activeQuestions, currentIndex, questionStartTime, answers, mode, progress]
  );

  const handleRevealExplanation = useCallback(() => {
    setShowExplanation(true);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex === activeQuestions.length - 1) {
      // Finish
      if (mode === "exam") {
        const r = calculateResults(activeQuestions, answers, startTime);
        setResults(r);
        // Save exam to history
        const newProgress = { ...progress };
        newProgress.examHistory.push({
          date: new Date().toISOString(),
          scaledScore: r.scaledScore,
          passed: r.passed,
          percentage: r.percentage,
        });
        saveProgress(newProgress);
        setProgress(newProgress);
        setMode("results");
      } else {
        // Study mode: go to results summary
        const r = calculateResults(activeQuestions, answers, startTime);
        setResults(r);
        setMode("results");
      }
    } else {
      setCurrentIndex(currentIndex + 1);
      setQuestionStartTime(Date.now());
      setShowExplanation(false);
      scrollToTop();
    }
  }, [currentIndex, activeQuestions, answers, mode, startTime, progress]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setQuestionStartTime(Date.now());
      if (mode === "study") {
        const a = answers[currentIndex - 1];
        setShowExplanation(a?.selectedAnswer !== null);
      }
      scrollToTop();
    }
  }, [currentIndex, mode, answers]);

  const handleTimeUp = useCallback(() => {
    const r = calculateResults(activeQuestions, answers, startTime);
    setResults(r);
    const newProgress = { ...progress };
    newProgress.examHistory.push({
      date: new Date().toISOString(),
      scaledScore: r.scaledScore,
      passed: r.passed,
      percentage: r.percentage,
    });
    saveProgress(newProgress);
    setProgress(newProgress);
    setMode("results");
  }, [activeQuestions, answers, startTime, progress]);

  const handleReviewAnswers = useCallback(() => {
    setCurrentIndex(0);
    setShowExplanation(true);
    setMode("review");
  }, []);

  const backToMenu = useCallback(() => {
    setMode("menu");
    setResults(null);
    setProgress(loadProgress());
  }, []);

  const handleResetProgress = useCallback(() => {
    resetProgress();
    setProgress(loadProgress());
  }, []);

  // =================== RENDER ===================

  if (mode === "menu") {
    return (
      <div ref={topRef} className="space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
            <span>ANTHROPIC</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Claude Certified Architect
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Simulador de certificacion — Foundations
          </p>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            60 preguntas basadas en escenarios reales. 5 dominios. Practica en modo estudio
            o evalua tu preparacion con un examen simulado.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Study Mode */}
          <Card className="border-2 hover:border-primary/30 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📖 Modo Estudio
              </CardTitle>
              <CardDescription>
                Practica pregunta por pregunta con explicaciones detalladas despues de cada respuesta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => startStudyMode(null)}
              >
                Todos los dominios ({questions.length} preguntas)
              </Button>
              <Separator />
              <p className="text-xs text-muted-foreground font-medium">Por dominio:</p>
              <div className="grid gap-2">
                {Object.entries(domainNames).map(([key, name]) => {
                  const d = Number(key);
                  const count = getQuestionsByDomain(d as 1 | 2 | 3 | 4 | 5).length;
                  const weights: Record<number, number> = {
                    1: 27, 2: 18, 3: 20, 4: 20, 5: 15,
                  };
                  return (
                    <Button
                      key={d}
                      variant="ghost"
                      className="justify-between h-auto py-2 px-3 text-left"
                      onClick={() => startStudyMode(d)}
                    >
                      <span className="text-sm">
                        D{d}: {name}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {weights[d]}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Exam Mode */}
          <div className="space-y-6">
            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📝 Modo Examen
                </CardTitle>
                <CardDescription>
                  Simula el examen real: {EXAM_QUESTION_COUNT} preguntas, 90 minutos, sin explicaciones
                  hasta terminar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="bg-muted rounded-lg p-2.5">
                    <p className="font-bold text-lg">{EXAM_QUESTION_COUNT}</p>
                    <p className="text-xs text-muted-foreground">Preguntas</p>
                  </div>
                  <div className="bg-muted rounded-lg p-2.5">
                    <p className="font-bold text-lg">90</p>
                    <p className="text-xs text-muted-foreground">Minutos</p>
                  </div>
                  <div className="bg-muted rounded-lg p-2.5">
                    <p className="font-bold text-lg">720</p>
                    <p className="text-xs text-muted-foreground">Min. aprobar</p>
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={startExamMode}>
                  Iniciar examen
                </Button>
              </CardContent>
            </Card>

            {/* Progress */}
            <ProgressDashboard progress={progress} />

            {progress.questionsAnswered > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={handleResetProgress}
              >
                Reiniciar progreso
              </Button>
            )}
          </div>
        </div>

        {/* Info */}
        <Card>
          <CardContent className="pt-5">
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-1">Escenarios del examen</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• Customer Support Agent</li>
                  <li>• Code Generation con Claude Code</li>
                  <li>• Multi-Agent Research System</li>
                  <li>• Developer Productivity</li>
                  <li>• CI/CD Integration</li>
                  <li>• Structured Data Extraction</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1">Formato</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• Opcion multiple (A/B/C/D)</li>
                  <li>• Una respuesta correcta</li>
                  <li>• Sin penalidad por adivinar</li>
                  <li>• Score escalado 100-1000</li>
                  <li>• Minimo 720 para aprobar</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1">Tecnologias evaluadas</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• Claude Agent SDK</li>
                  <li>• Model Context Protocol (MCP)</li>
                  <li>• Claude Code CLI</li>
                  <li>• Claude API & tool_use</li>
                  <li>• Message Batches API</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // =================== STUDY / EXAM / REVIEW ===================
  if (mode === "study" || mode === "exam" || mode === "review") {
    const q = activeQuestions[currentIndex];
    const answeredCount = answers.filter((a) => a.selectedAnswer !== null).length;
    const progressPct = (answeredCount / activeQuestions.length) * 100;

    return (
      <div ref={topRef} className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={backToMenu}>
              ← Menu
            </Button>
            <Badge variant={mode === "exam" ? "default" : "secondary"}>
              {mode === "exam" ? "Examen" : mode === "review" ? "Revision" : "Estudio"}
              {studyDomain && mode === "study" && ` — D${studyDomain}`}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            {mode === "exam" && (
              <Timer
                startTime={startTime}
                timeLimit={EXAM_TIME_LIMIT}
                onTimeUp={handleTimeUp}
              />
            )}
            {mode !== "exam" && (
              <Timer startTime={startTime} />
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <Progress value={progressPct} className="h-1.5" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{answeredCount} de {activeQuestions.length} respondidas</span>
            {mode === "exam" && (
              <span>{activeQuestions.length - answeredCount} pendientes</span>
            )}
          </div>
        </div>

        {/* Question navigator (mini) */}
        {mode === "exam" && (
          <div className="flex flex-wrap gap-1">
            {activeQuestions.map((_, i) => {
              const a = answers[i];
              const isCurrent = i === currentIndex;
              const isAnswered = a?.selectedAnswer !== null;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentIndex(i);
                    setQuestionStartTime(Date.now());
                    scrollToTop();
                  }}
                  className={cn(
                    "w-7 h-7 rounded text-xs font-mono transition-all",
                    isCurrent && "ring-2 ring-primary ring-offset-1",
                    isAnswered && !isCurrent && "bg-primary/20 text-primary",
                    !isAnswered && !isCurrent && "bg-muted text-muted-foreground",
                    isCurrent && "bg-primary text-primary-foreground"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        )}

        {/* Question card */}
        <QuestionCard
          question={q}
          index={currentIndex}
          total={activeQuestions.length}
          selectedAnswer={answers[currentIndex]?.selectedAnswer ?? null}
          onAnswer={handleAnswer}
          showExplanation={
            mode === "review" ? true : (mode === "study" ? showExplanation : false)
          }
          isStudyMode={mode === "study" || mode === "review"}
          onNext={mode === "review" && currentIndex === activeQuestions.length - 1
            ? backToMenu
            : handleNext
          }
          onPrev={handlePrev}
          onReveal={mode === "study" ? handleRevealExplanation : undefined}
        />
      </div>
    );
  }

  // =================== RESULTS ===================
  if (mode === "results" && results) {
    return (
      <div ref={topRef}>
        <ExamResultsView
          results={results}
          questions={activeQuestions}
          onBackToMenu={backToMenu}
          onReviewAnswers={handleReviewAnswers}
        />
      </div>
    );
  }

  return null;
}
