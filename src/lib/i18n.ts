export type Locale = "es" | "en";

const translations = {
  // Menu
  "menu.badge": { es: "ANTHROPIC", en: "ANTHROPIC" },
  "menu.title": { es: "Claude Certified Architect", en: "Claude Certified Architect" },
  "menu.subtitle": { es: "Simulador de certificacion — Foundations", en: "Certification Simulator — Foundations" },
  "menu.description": {
    es: "60 preguntas basadas en escenarios reales. 5 dominios. Practica en modo estudio o evalua tu preparacion con un examen simulado.",
    en: "60 scenario-based questions. 5 domains. Practice in study mode or test your readiness with a simulated exam.",
  },

  // Study mode
  "study.title": { es: "Modo Estudio", en: "Study Mode" },
  "study.description": {
    es: "Practica pregunta por pregunta con explicaciones detalladas despues de cada respuesta.",
    en: "Practice question by question with detailed explanations after each answer.",
  },
  "study.allDomains": { es: "Todos los dominios", en: "All domains" },
  "study.questions": { es: "preguntas", en: "questions" },
  "study.byDomain": { es: "Por dominio:", en: "By domain:" },

  // Exam mode
  "exam.title": { es: "Modo Examen", en: "Exam Mode" },
  "exam.description": {
    es: "Simula el examen real: 30 preguntas, 90 minutos, sin explicaciones hasta terminar.",
    en: "Simulate the real exam: 30 questions, 90 minutes, no explanations until the end.",
  },
  "exam.questions": { es: "Preguntas", en: "Questions" },
  "exam.minutes": { es: "Minutos", en: "Minutes" },
  "exam.minPass": { es: "Min. aprobar", en: "Min. to pass" },
  "exam.start": { es: "Iniciar examen", en: "Start exam" },

  // Progress
  "progress.title": { es: "Tu progreso", en: "Your progress" },
  "progress.general": { es: "General", en: "Overall" },
  "progress.recentExams": { es: "Examenes recientes", en: "Recent exams" },
  "progress.reset": { es: "Reiniciar progreso", en: "Reset progress" },

  // Question card
  "question.domain": { es: "Dominio", en: "Domain" },
  "question.scenario": { es: "Escenario:", en: "Scenario:" },
  "question.reveal": { es: "Ver explicacion", en: "Show explanation" },
  "question.correct": { es: "Correcto", en: "Correct" },
  "question.incorrect": { es: "Incorrecto — La respuesta correcta es", en: "Incorrect — The correct answer is" },
  "question.keyConcept": { es: "Concepto clave:", en: "Key concept:" },
  "question.prev": { es: "← Anterior", en: "← Previous" },
  "question.next": { es: "Siguiente →", en: "Next →" },
  "question.finish": { es: "Finalizar", en: "Finish" },

  // Difficulty
  "difficulty.basic": { es: "Basico", en: "Basic" },
  "difficulty.intermediate": { es: "Intermedio", en: "Intermediate" },
  "difficulty.advanced": { es: "Avanzado", en: "Advanced" },

  // Top bar
  "topbar.menu": { es: "← Menu", en: "← Menu" },
  "topbar.exam": { es: "Examen", en: "Exam" },
  "topbar.review": { es: "Revision", en: "Review" },
  "topbar.study": { es: "Estudio", en: "Study" },
  "topbar.answered": { es: "respondidas", en: "answered" },
  "topbar.pending": { es: "pendientes", en: "pending" },
  "topbar.remaining": { es: "restante", en: "remaining" },
  "topbar.of": { es: "de", en: "of" },

  // Results
  "results.passed": { es: "Aprobado", en: "Passed" },
  "results.failed": { es: "No aprobado", en: "Not passed" },
  "results.scaledScore": { es: "Puntaje escalado", en: "Scaled score" },
  "results.minToPass": { es: "(min. 720 para aprobar)", en: "(min. 720 to pass)" },
  "results.correctAnswers": { es: "Respuestas correctas", en: "Correct answers" },
  "results.totalTime": { es: "Tiempo total:", en: "Total time:" },
  "results.domainBreakdown": { es: "Desglose por dominio", en: "Domain breakdown" },
  "results.weakAreas": { es: "Areas a reforzar", en: "Areas to improve" },
  "results.reviewAnswers": { es: "Revisar respuestas", en: "Review answers" },
  "results.backToMenu": { es: "Volver al menu", en: "Back to menu" },

  // Info
  "info.scenarios": { es: "Escenarios del examen", en: "Exam scenarios" },
  "info.format": { es: "Formato", en: "Format" },
  "info.tech": { es: "Tecnologias evaluadas", en: "Technologies tested" },
  "info.multipleChoice": { es: "Opcion multiple (A/B/C/D)", en: "Multiple choice (A/B/C/D)" },
  "info.oneCorrect": { es: "Una respuesta correcta", en: "One correct answer" },
  "info.noPenalty": { es: "Sin penalidad por adivinar", en: "No penalty for guessing" },
  "info.scaledScore": { es: "Score escalado 100-1000", en: "Scaled score 100-1000" },
  "info.min720": { es: "Minimo 720 para aprobar", en: "Minimum 720 to pass" },

  // Footer
  "footer.disclaimer": {
    es: "Simulador no oficial — Solo para estudio personal. Basado en la guia publica del examen Claude Certified Architect – Foundations.",
    en: "Unofficial simulator — For personal study only. Based on the public Claude Certified Architect – Foundations exam guide.",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  return translations[key]?.[locale] ?? key;
}

const LOCALE_KEY = "claude-cert-locale";

export function loadLocale(): Locale {
  if (typeof window === "undefined") return "es";
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved === "en" || saved === "es") return saved;
  } catch {
    // ignore
  }
  return "es";
}

export function saveLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCALE_KEY, locale);
}
