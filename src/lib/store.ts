import { Question } from "@/data/questions";

export type Mode = "menu" | "study" | "exam" | "review" | "results" | "guide";

export interface UserAnswer {
  questionId: string;
  selectedAnswer: "A" | "B" | "C" | "D" | null;
  isCorrect: boolean;
  timeSpent: number; // seconds
}

export interface ExamState {
  mode: Mode;
  questions: Question[];
  currentIndex: number;
  answers: UserAnswer[];
  startTime: number;
  totalTimeLimit: number; // seconds (exam mode only)
  studyDomain: number | null; // filter by domain in study mode
  showExplanation: boolean;
}

export interface DomainScore {
  domain: number;
  name: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface ExamResults {
  totalCorrect: number;
  totalQuestions: number;
  percentage: number;
  scaledScore: number; // 100-1000
  passed: boolean;
  domainScores: DomainScore[];
  totalTime: number;
  answers: UserAnswer[];
}

export function calculateResults(
  questions: Question[],
  answers: UserAnswer[],
  startTime: number
): ExamResults {
  const totalCorrect = answers.filter((a) => a.isCorrect).length;
  const totalQuestions = questions.length;
  const percentage = (totalCorrect / totalQuestions) * 100;

  // Scaled score: map percentage to 100-1000 range
  const scaledScore = Math.round(100 + (percentage / 100) * 900);
  const passed = scaledScore >= 720;

  const domainMap = new Map<number, { correct: number; total: number; name: string }>();

  questions.forEach((q, i) => {
    if (!domainMap.has(q.domain)) {
      domainMap.set(q.domain, { correct: 0, total: 0, name: q.domainName });
    }
    const d = domainMap.get(q.domain)!;
    d.total++;
    if (answers[i]?.isCorrect) d.correct++;
  });

  const domainScores: DomainScore[] = Array.from(domainMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([domain, data]) => ({
      domain,
      name: data.name,
      correct: data.correct,
      total: data.total,
      percentage: Math.round((data.correct / data.total) * 100),
    }));

  return {
    totalCorrect,
    totalQuestions,
    percentage,
    scaledScore,
    passed,
    domainScores,
    totalTime: Math.floor((Date.now() - startTime) / 1000),
    answers,
  };
}

// Persist study progress in localStorage
const STORAGE_KEY = "claude-cert-progress";

export interface StudyProgress {
  questionsAnswered: number;
  correctAnswers: number;
  domainProgress: Record<number, { answered: number; correct: number }>;
  answeredIds: string[];
  lastSession: string;
  examHistory: Array<{
    date: string;
    scaledScore: number;
    passed: boolean;
    percentage: number;
  }>;
}

export function loadProgress(): StudyProgress {
  if (typeof window === "undefined") {
    return createEmptyProgress();
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // ignore
  }
  return createEmptyProgress();
}

export function saveProgress(progress: StudyProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function createEmptyProgress(): StudyProgress {
  return {
    questionsAnswered: 0,
    correctAnswers: 0,
    domainProgress: {},
    answeredIds: [],
    lastSession: new Date().toISOString(),
    examHistory: [],
  };
}

export function resetProgress() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
