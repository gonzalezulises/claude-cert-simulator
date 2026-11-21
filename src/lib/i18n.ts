export type Locale = "es" | "en";

const translations = {
  // Menu
  "menu.badge": { es: "SIMULADOR NO OFICIAL", en: "UNOFFICIAL SIMULATOR" },
  "menu.title": { es: "Claude Certified Architect", en: "Claude Certified Architect" },
  "menu.subtitle": { es: "Simulador de certificación — Foundations", en: "Certification Simulator — Foundations" },
  "menu.description": {
    es: "142 preguntas basadas en escenarios reales. 5 dominios. Modo estudio (66 preguntas) y modo examen (60 ítems de 4 escenarios sorteados, según el peso oficial de cada dominio) para evaluar tu preparación.",
    en: "142 scenario-based questions. 5 domains. Study mode (66 questions) and exam mode (60 items from 4 randomly drawn scenarios, by official domain weight) to test your readiness.",
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
    es: "Simula el examen real: 60 preguntas de 4 escenarios sorteados, 120 minutos, sin explicaciones hasta terminar. Usa primero el banco del examen y completa con el de estudio.",
    en: "Simulate the real exam: 60 questions from 4 randomly drawn scenarios, 120 minutes, no explanations until the end. Uses the exam bank first and fills in from the study bank.",
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
  "question.selectN": { es: "Selecciona {n} respuestas", en: "Select {n} responses" },
  "question.confirm": { es: "Confirmar respuesta", en: "Confirm answer" },
  "exam.scenarios": { es: "Escenarios de este intento:", en: "Scenarios in this attempt:" },
  "question.sources": { es: "Fuentes oficiales:", en: "Official sources:" },
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
  "results.scaledScore": { es: "Puntaje escalado estimado", en: "Estimated scaled score" },
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
    es: "Ítems de una y de varias respuestas; cada ítem dice cuántas elegir",
    en: "Single- and multiple-response items; each item states how many to select",
  },
  "info.scenarioMix": {
    es: "4 escenarios sorteados de los 6, como en el examen real",
    en: "4 scenarios drawn at random from the 6, as in the real exam",
  },
  "info.noPenalty": { es: "Sin penalidad por adivinar", en: "No penalty for guessing" },
  "info.scaledScore": { es: "Puntuación escalada 100–1000 (aquí, una estimación lineal)", en: "Scaled score 100-1000 (here, a linear estimate)" },
  "info.min720": { es: "Mínimo 720 para aprobar", en: "Minimum 720 to pass" },

  // Footer
  "footer.disclaimer": {
    es: "Simulador no oficial — solo para estudio personal. Basado en la guía pública del examen Claude Certified Architect – Foundations (CCAR-F, versión 1.1, vigente desde noviembre de 2026).",
    en: "Unofficial simulator — for personal study only. Based on the public Claude Certified Architect – Foundations exam guide (CCAR-F, version 1.1, effective November 2026).",
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
