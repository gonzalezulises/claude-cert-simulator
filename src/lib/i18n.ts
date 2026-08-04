export type Locale = "es" | "en";

const translations = {
  // Menu
  "menu.badge": { es: "ANTHROPIC", en: "ANTHROPIC" },
  "menu.title": { es: "Claude Certified Architect", en: "Claude Certified Architect" },
  "menu.subtitle": { es: "Simulador de certificación — Foundations", en: "Certification Simulator — Foundations" },
  "menu.description": {
    es: "124 preguntas basadas en escenarios reales. 5 dominios. Modo estudio (60 preguntas) y modo examen (60 ítems distintos, sorteados según el peso oficial de cada dominio) para evaluar tu preparación.",
    en: "124 scenario-based questions. 5 domains. Study mode (60 questions) and exam mode (60 different items, drawn by official domain weight) to test your readiness.",
  },

  // Study mode
  "study.title": { es: "Modo Estudio", en: "Study Mode" },
  "study.description": {
    es: "Practica pregunta por pregunta con explicaciones detalladas después de cada respuesta.",
    en: "Practice question by question with detailed explanations after each answer.",
  },
  "study.allDomains": { es: "Todos los dominios", en: "All domains" },
  "study.questions": { es: "preguntas", en: "questions" },
  "study.byDomain": { es: "Por dominio:", en: "By domain:" },

  // Exam mode
  "exam.title": { es: "Modo Examen", en: "Exam Mode" },
  "exam.description": {
    es: "Simula el examen real: 60 preguntas exclusivas (distintas al modo estudio), 120 minutos, sin explicaciones hasta terminar.",
    en: "Simulate the real exam: 60 exclusive questions (different from study mode), 120 minutes, no explanations until the end.",
  },
  "exam.questions": { es: "Preguntas", en: "Questions" },
  "exam.minutes": { es: "Minutos", en: "Minutes" },
  "exam.minPass": { es: "Mín. aprobar", en: "Min. to pass" },
  "exam.start": { es: "Iniciar examen", en: "Start exam" },

  // Progress
  "progress.title": { es: "Tu progreso", en: "Your progress" },
  "progress.general": { es: "General", en: "Overall" },
  "progress.recentExams": { es: "Exámenes recientes", en: "Recent exams" },
  "progress.reset": { es: "Reiniciar progreso", en: "Reset progress" },

  // Question card
  "question.domain": { es: "Dominio", en: "Domain" },
  "question.scenario": { es: "Escenario:", en: "Scenario:" },
  "question.reveal": { es: "Ver explicación", en: "Show explanation" },
  "question.correct": { es: "Correcto", en: "Correct" },
  "question.incorrect": { es: "Incorrecto — La respuesta correcta es", en: "Incorrect — The correct answer is" },
  "question.keyConcept": { es: "Concepto clave:", en: "Key concept:" },
  "question.prev": { es: "← Anterior", en: "← Previous" },
  "question.next": { es: "Siguiente →", en: "Next →" },
  "question.finish": { es: "Finalizar", en: "Finish" },

  // Difficulty
  "difficulty.basic": { es: "Básico", en: "Basic" },
  "difficulty.intermediate": { es: "Intermedio", en: "Intermediate" },
  "difficulty.advanced": { es: "Avanzado", en: "Advanced" },

  // Top bar
  "topbar.menu": { es: "← Menú", en: "← Menu" },
  "topbar.exam": { es: "Examen", en: "Exam" },
  "topbar.review": { es: "Revisión", en: "Review" },
  "topbar.study": { es: "Estudio", en: "Study" },
  "topbar.answered": { es: "respondidas", en: "answered" },
  "topbar.pending": { es: "pendientes", en: "pending" },
  "topbar.remaining": { es: "restante", en: "remaining" },
  "topbar.of": { es: "de", en: "of" },

  // Results
  "results.passed": { es: "Aprobado", en: "Passed" },
  "results.failed": { es: "No aprobado", en: "Not passed" },
  "results.scaledScore": { es: "Puntaje escalado", en: "Scaled score" },
  "results.minToPass": { es: "(mín. 720 para aprobar)", en: "(min. 720 to pass)" },
  "results.correctAnswers": { es: "Respuestas correctas", en: "Correct answers" },
  "results.totalTime": { es: "Tiempo total:", en: "Total time:" },
  "results.domainBreakdown": { es: "Desglose por dominio", en: "Domain breakdown" },
  "results.weakAreas": { es: "Áreas a reforzar", en: "Areas to improve" },
  "results.reviewAnswers": { es: "Revisar respuestas", en: "Review answers" },
  "results.backToMenu": { es: "Volver al menú", en: "Back to menu" },

  // Info
  "info.scenarios": { es: "Escenarios del examen (salen 4 de estos 6)", en: "Exam scenarios (4 of these 6 appear)" },
  "info.format": { es: "Formato", en: "Format" },
  "info.tech": { es: "Tecnologías evaluadas", en: "Technologies tested" },
  "info.multipleChoice": { es: "60 ítems en 120 minutos", en: "60 items in 120 minutes" },
  "info.oneCorrect": {
    es: "Opción múltiple y respuesta múltiple: cada ítem indica cuántas marcar",
    en: "Multiple-choice and multiple-response: each item states how many to select",
  },
  "info.noPenalty": { es: "Sin penalidad por adivinar", en: "No penalty for guessing" },
  "info.scaledScore": { es: "Puntuación escalada 100–1000", en: "Scaled score 100-1000" },
  "info.min720": { es: "Mínimo 720 para aprobar", en: "Minimum 720 to pass" },

  // Footer
  "footer.disclaimer": {
    es: "Simulador no oficial — solo para estudio personal. Basado en la guía pública del examen Claude Certified Architect – Foundations (CCAR-F, versión 1.0, vigente desde julio de 2026).",
    en: "Unofficial simulator — for personal study only. Based on the public Claude Certified Architect – Foundations exam guide (CCAR-F, version 1.0, effective July 2026).",
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
