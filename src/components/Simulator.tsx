"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  questions,
  getQuestionsByDomain,
  getExamSampleFromPool,
  domainNames,
  Question,
} from "@/data/questions";
import { examQuestions } from "@/data/questions-exam";
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
import { Locale, t, loadLocale, saveLocale } from "@/lib/i18n";
import QuestionCard from "./QuestionCard";
import ExamResultsView from "./ExamResults";
import Timer from "./Timer";
import ProgressDashboard from "./ProgressDashboard";
import LanguageToggle from "./LanguageToggle";
import StudyGuide from "./StudyGuide";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const EXAM_TIME_LIMIT = 90 * 60;
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
  const [locale, setLocale] = useState<Locale>("es");
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

  useEffect(() => {
    setProgress(loadProgress());
    setLocale(loadLocale());
  }, []);

  const handleLocaleChange = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    saveLocale(newLocale);
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
    const qs = getExamSampleFromPool(examQuestions, EXAM_QUESTION_COUNT);
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
    [activeQuestions, currentIndex, questionStartTime, answers, progress]
  );

  const handleRevealExplanation = useCallback(() => {
    setShowExplanation(true);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex === activeQuestions.length - 1) {
      if (mode === "exam") {
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
      } else {
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

  // =================== MENU ===================
  if (mode === "menu") {
    return (
      <div ref={topRef} className="space-y-8">
        {/* Language toggle */}
        <div className="flex justify-end">
          <LanguageToggle locale={locale} onChange={handleLocaleChange} />
        </div>

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
            <span>{t("menu.badge", locale)}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t("menu.title", locale)}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t("menu.subtitle", locale)}
          </p>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            {t("menu.description", locale)}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Study Mode + Resources */}
          <div className="space-y-6">
            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📖 {t("study.title", locale)}
                </CardTitle>
                <CardDescription>
                  {t("study.description", locale)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => startStudyMode(null)}
                >
                  {t("study.allDomains", locale)} ({questions.length} {t("study.questions", locale)})
                </Button>
                <Separator />
                <p className="text-xs text-muted-foreground font-medium">{t("study.byDomain", locale)}</p>
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

            {/* Official Resources */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  🔗 {locale === "es" ? "Recursos oficiales de Anthropic" : "Official Anthropic Resources"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Claude Agent SDK</p>
                  <div className="space-y-1">
                    <a href="https://platform.claude.com/docs/en/agent-sdk/overview" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">Agent SDK Overview</a>
                    <a href="https://platform.claude.com/docs/en/agent-sdk/agent-loop" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">Agent Loop</a>
                    <a href="https://platform.claude.com/docs/en/agent-sdk/hooks" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">SDK Hooks</a>
                    <a href="https://platform.claude.com/docs/en/agent-sdk/subagents" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">Subagents</a>
                    <a href="https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">Building Agents (Blog)</a>
                    <a href="https://github.com/anthropics/claude-agent-sdk-python" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">Agent SDK Python (GitHub)</a>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Claude Code</p>
                  <div className="space-y-1">
                    <a href="https://code.claude.com/docs/en/memory" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">Memory & CLAUDE.md</a>
                    <a href="https://code.claude.com/docs/en/skills" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">Skills & Commands</a>
                    <a href="https://code.claude.com/docs/en/hooks-guide" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">Hooks Guide</a>
                    <a href="https://code.claude.com/docs/en/mcp" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">MCP Integration</a>
                    <a href="https://code.claude.com/docs/en/headless" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">Headless Mode (CI/CD)</a>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Claude API</p>
                  <div className="space-y-1">
                    <a href="https://platform.claude.com/docs/en/build-with-claude/structured-outputs" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">Structured Outputs & tool_use</a>
                    <a href="https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">Handling Stop Reasons</a>
                    <a href="https://platform.claude.com/docs/en/build-with-claude/batch-processing" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">Message Batches API</a>
                    <a href="https://platform.claude.com/docs/en/build-with-claude/context-windows" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">Context Windows</a>
                    <a href="https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">Prompting Best Practices</a>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">MCP</p>
                  <div className="space-y-1">
                    <a href="https://modelcontextprotocol.io/specification/2025-11-25/server/tools" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">MCP Tools Specification</a>
                    <a href="https://github.com/modelcontextprotocol" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">MCP GitHub Organization</a>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{locale === "es" ? "Certificacion" : "Certification"}</p>
                  <div className="space-y-1">
                    <a href="https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">{locale === "es" ? "Solicitar acceso al examen (Skilljar)" : "Request exam access (Skilljar)"}</a>
                    <a href="https://www.anthropic.com/news/claude-partner-network" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">Claude Partner Network</a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exam Mode */}
          <div className="space-y-6">
            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📝 {t("exam.title", locale)}
                </CardTitle>
                <CardDescription>
                  {t("exam.description", locale)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="bg-muted rounded-lg p-2.5">
                    <p className="font-bold text-lg">{EXAM_QUESTION_COUNT}</p>
                    <p className="text-xs text-muted-foreground">{t("exam.questions", locale)}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-2.5">
                    <p className="font-bold text-lg">90</p>
                    <p className="text-xs text-muted-foreground">{t("exam.minutes", locale)}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-2.5">
                    <p className="font-bold text-lg">720</p>
                    <p className="text-xs text-muted-foreground">{t("exam.minPass", locale)}</p>
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={startExamMode}>
                  {t("exam.start", locale)}
                </Button>
              </CardContent>
            </Card>

            <ProgressDashboard progress={progress} locale={locale} />

            {progress.questionsAnswered > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={handleResetProgress}
              >
                {t("progress.reset", locale)}
              </Button>
            )}
          </div>
        </div>

        {/* Study Guide */}
        <Card className="border-2 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setMode("guide")}>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-base">
                  📚 {locale === "es" ? "Guia de estudio" : "Study Guide"}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {locale === "es"
                    ? "Conceptos clave, anti-patrones, trampas del examen y ejercicios practicos por dominio."
                    : "Key concepts, anti-patterns, exam traps, and build exercises by domain."}
                </p>
              </div>
              <span className="text-muted-foreground text-lg">→</span>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="pt-5">
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-1">{t("info.scenarios", locale)}</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• Customer Support Agent</li>
                  <li>• Code Generation with Claude Code</li>
                  <li>• Multi-Agent Research System</li>
                  <li>• Developer Productivity</li>
                  <li>• CI/CD Integration</li>
                  <li>• Structured Data Extraction</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1">{t("info.format", locale)}</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• {t("info.multipleChoice", locale)}</li>
                  <li>• {t("info.oneCorrect", locale)}</li>
                  <li>• {t("info.noPenalty", locale)}</li>
                  <li>• {t("info.scaledScore", locale)}</li>
                  <li>• {t("info.min720", locale)}</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1">{t("info.tech", locale)}</p>
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
              {t("topbar.menu", locale)}
            </Button>
            <Badge variant={mode === "exam" ? "default" : "secondary"}>
              {mode === "exam"
                ? t("topbar.exam", locale)
                : mode === "review"
                ? t("topbar.review", locale)
                : t("topbar.study", locale)}
              {studyDomain && mode === "study" && ` — D${studyDomain}`}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle locale={locale} onChange={handleLocaleChange} />
            {mode === "exam" ? (
              <Timer
                startTime={startTime}
                locale={locale}
                timeLimit={EXAM_TIME_LIMIT}
                onTimeUp={handleTimeUp}
              />
            ) : (
              <Timer startTime={startTime} locale={locale} />
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <Progress value={progressPct} className="h-1.5" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {answeredCount} {t("topbar.of", locale)} {activeQuestions.length} {t("topbar.answered", locale)}
            </span>
            {mode === "exam" && (
              <span>{activeQuestions.length - answeredCount} {t("topbar.pending", locale)}</span>
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
          locale={locale}
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

  // =================== STUDY GUIDE ===================
  if (mode === "guide") {
    return (
      <div ref={topRef}>
        <StudyGuide locale={locale} onBack={backToMenu} />
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
          locale={locale}
          onBackToMenu={backToMenu}
          onReviewAnswers={handleReviewAnswers}
        />
      </div>
    );
  }

  return null;
}
