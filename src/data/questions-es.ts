// ============================================================
// Claude Certified Architect – Foundations
// Spanish Translation Map
// ============================================================

export interface QuestionTranslation {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  explanation: string;
  keyConcept: string;
}

export const questionsEs: Record<string, QuestionTranslation> = {
  "D1-001": {
    question:
      "Un agente de soporte al cliente está en medio de una conversación cuando llama a la herramienta `lookup_order`. La API responde exitosamente. ¿Qué valor de `stop_reason` debe verificar el bucle de orquestación para saber que debe enviar el resultado de la herramienta a Claude antes de que la conversación pueda continuar?",
    options: {
      A: '"end_turn" — el modelo terminó su respuesta y está esperando una entrada',
      B: '"tool_use" — el modelo emitió una llamada a herramienta y el bucle debe suministrar el resultado',
      C: '"max_tokens" — el modelo se quedó sin espacio y necesita el resultado para continuar',
      D: '"stop_sequence" — se alcanzó un token de parada personalizado, señalando una llamada a herramienta',
    },
    explanation:
      'Cuando Claude emite una llamada a herramienta, establece stop_reason en "tool_use". El bucle de orquestación debe detectar este valor, ejecutar la herramienta y devolver un mensaje con rol de usuario que contiene un bloque tool_result. Solo después de ese intercambio Claude continuará generando. "end_turn" significa que el modelo terminó sin necesitar una herramienta. "max_tokens" y "stop_sequence" no están relacionados con las invocaciones de herramientas.\n\nComo implementarlo:\n```typescript\nasync function runAgentLoop(messages: Message[]) {\n  while (true) {\n    const response = await anthropic.messages.create({\n      model: "claude-opus-4-5",\n      max_tokens: 4096,\n      tools: [lookupOrderTool],\n      messages,\n    });\n\n    if (response.stop_reason === "end_turn") {\n      // Extract final text and return to user\n      const text = response.content.find(b => b.type === "text")?.text;\n      return text;\n    }\n\n    if (response.stop_reason === "tool_use") {\n      // Append assistant message with tool call\n      messages.push({ role: "assistant", content: response.content });\n\n      // Execute each tool call and collect results\n      const toolResults = [];\n      for (const block of response.content) {\n        if (block.type === "tool_use") {\n          const result = await executeTool(block.name, block.input);\n          toolResults.push({\n            type: "tool_result",\n            tool_use_id: block.id,\n            content: JSON.stringify(result),\n          });\n        }\n      }\n      // Return tool results to Claude\n      messages.push({ role: "user", content: toolResults });\n    }\n  }\n}\n```',
    keyConcept: "Ciclo de vida del bucle agéntico – valores de stop_reason",
  },

  "D1-002": {
    question:
      "Tu sistema de investigación multi-agente usa un coordinador que lanza subagentes especializados para revisión de literatura, análisis de datos y verificación de citas. El coordinador necesita que cada subagente trabaje solo con la información relevante para su tarea, no con el contexto completo de la investigación. ¿Qué patrón arquitectónico logra mejor este aislamiento?",
    options: {
      A: "Pasar el historial completo de conversación a cada subagente para que tengan contexto completo",
      B: "Hub-and-spoke: el coordinador mantiene el contexto maestro y pasa solo las instrucciones específicas de la tarea a cada subagente en una conversación aislada",
      C: "Encadenar cada subagente secuencialmente, agregando sus salidas a un contexto compartido",
      D: "Usar una sola instancia de Claude con cambio de roles mediante el system prompt",
    },
    explanation:
      "El patrón hub-and-spoke (coordinador-subagente) otorga a cada subagente su propio contexto de conversación aislado. El coordinador resume y transmite solo lo que el subagente necesita, evitando la contaminación de contexto y manteniendo el conteo de tokens manejable. La opción A inunda a los subagentes con datos irrelevantes. La opción C crea un contexto monolítico creciente. La opción D no es una arquitectura multi-agente.\n\nComo implementarlo:\n```typescript\nclass ResearchCoordinator {\n  private findings: Record<string, string> = {};\n\n  async runLiteratureReview(topic: string) {\n    // Subagent gets ONLY what it needs — isolated conversation\n    const response = await anthropic.messages.create({\n      model: \"claude-opus-4-5\",\n      system: \"You are a literature review specialist. Focus only on the task given.\",\n      messages: [{\n        role: \"user\",\n        content: `Review literature on: ${topic}. Return key findings as bullet points.`\n      }],\n      tools: [webSearchTool, fetchPaperTool],\n      max_tokens: 2048,\n    });\n    this.findings.literature = extractText(response);\n  }\n\n  async runDataAnalysis() {\n    // Coordinator passes ONLY the literature findings, not full history\n    const response = await anthropic.messages.create({\n      model: \"claude-opus-4-5\",\n      system: \"You are a data analysis specialist.\",\n      messages: [{\n        role: \"user\",\n        content: `Analyze these findings statistically:\\n${this.findings.literature}`\n      }],\n      tools: [statsTool, chartTool],\n      max_tokens: 2048,\n    });\n    this.findings.analysis = extractText(response);\n  }\n}\n```",
    keyConcept: "Arquitectura coordinador-subagente hub-and-spoke con contexto aislado",
  },

  "D1-003": {
    question:
      "Estás configurando un AgentDefinition para un subagente que debe poder lanzar sus propias tareas hijas. Tu configuración actualmente lista `allowedTools: [\"Read\", \"Grep\", \"WebSearch\"]`. El subagente falla al intentar lanzar tareas hijas en tiempo de ejecución. ¿Cuál es la causa más probable?",
    options: {
      A: 'El subagente necesita la herramienta "Bash" para lanzar procesos hijos',
      B: '"Task" debe incluirse explícitamente en allowedTools para que un agente pueda lanzar subagentes',
      C: "Los subagentes no pueden lanzar tareas hijas; solo el orquestador de nivel superior puede usar Task",
      D: "El AgentDefinition necesita un campo parentAgentId apuntando al coordinador",
    },
    explanation:
      "La herramienta Task es el mecanismo para lanzar subagentes en el framework agéntico de Claude Code. Debe listarse explícitamente en allowedTools del AgentDefinition; no se incluye por defecto. Sin ella, el agente no puede delegar trabajo a agentes hijos, independientemente de qué otras herramientas estén disponibles. La opción C es incorrecta — el lanzamiento anidado está soportado. Las opciones A y D describen requisitos inexistentes.\n\nComo implementarlo:\n```typescript\n// AgentDefinition with Task tool explicitly included\nconst subagentDefinition = {\n  name: \"research-subagent\",\n  description: \"Subagent that can spawn child tasks for deep research\",\n  allowedTools: [\n    \"Read\",\n    \"Grep\",\n    \"WebSearch\",\n    \"Task\",  // <-- Required to spawn child subagents\n  ],\n  systemPrompt: `You are a research agent. When a topic requires deep investigation,\n    spawn a child task using the Task tool with a specific focused prompt.`,\n};\n\n// In CLAUDE.md or agent config:\n// allowed_tools:\n//   - Read\n//   - Grep\n//   - WebSearch\n//   - Task   # Must be explicit\n```",
    keyConcept: "Herramienta Task y configuración de allowedTools en AgentDefinition",
  },

  "D1-004": {
    question:
      "Un equipo de investigación quiere explorar tres enfoques analíticos diferentes sobre el mismo conjunto de datos simultáneamente, para luego combinar los mejores hallazgos. ¿Qué mecanismo de Claude Code está diseñado específicamente para este caso de uso de exploración divergente?",
    options: {
      A: "Usar --resume para restaurar una sesión anterior para cada enfoque",
      B: "Crear tres archivos CLAUDE.md separados, uno por enfoque",
      C: "Usar fork_session para crear ramas independientes desde el estado actual de la sesión",
      D: "Lanzar tres herramientas Task secuencialmente y concatenar sus salidas",
    },
    explanation:
      "fork_session es el mecanismo diseñado específicamente para la exploración divergente. Crea una copia independiente de la sesión actual — incluyendo el historial de conversación y el contexto — que puede evolucionar en una dirección diferente sin afectar el original. --resume restaura una sola sesión (no crea ramas). Los archivos CLAUDE.md separados cambian la configuración, no el estado de la sesión. Las tareas secuenciales no pueden ejecutar exploraciones verdaderamente divergentes en paralelo.\n\nComo implementarlo:\n```bash\n# In Claude Code interactive session:\n# After loading the dataset and establishing baseline context:\n\n# Fork session for Approach A (clustering analysis)\n/fork approach-a\n# Now in branch A — explore clustering\nclaude \"Apply k-means clustering to the dataset with k=3,5,7 and compare silhouette scores\"\n\n# Return to original and fork for Approach B\n/switch main\n/fork approach-b\nclaude \"Apply PCA dimensionality reduction and analyze top 3 principal components\"\n\n# Return to original and fork for Approach C\n/switch main\n/fork approach-c\nclaude \"Run regression analysis using all features and identify top predictors\"\n\n# Later: review all branches and merge best findings\n/switch main\nclaude \"Summarize findings from branches approach-a, approach-b, approach-c\"\n```",
    keyConcept: "fork_session para exploración divergente",
  },

  "D1-005": {
    question:
      "Tu flujo de trabajo del agente de soporte requiere que un paso de análisis de sentimiento siempre se ejecute antes de un paso de decisión de escalada. Un arquitecto junior propone agregar esta instrucción al system prompt: \"Siempre analiza el sentimiento antes de decidir sobre la escalada.\" Un arquitecto senior dice que esto es insuficiente para producción. ¿Cuál es el mecanismo de aplicación más confiable?",
    options: {
      A: "Agregar la instrucción tanto al system prompt como al primer mensaje de usuario para redundancia",
      B: "Usar un hook PostToolUse que bloquee programáticamente la herramienta de escalada para que no sea llamada hasta que la herramienta de sentimiento haya sido invocada en la sesión actual",
      C: "Incluir una lista numerada de pasos en el system prompt y pedir a Claude que los siga en orden",
      D: "Establecer la temperatura en 0 para que el modelo siga de forma confiable la instrucción de ordenamiento",
    },
    explanation:
      "La guía de ordenamiento basada en prompts (opciones A y C) es probabilística — el modelo puede no cumplir siempre bajo entradas adversariales o casos extremos. Un hook PostToolUse es aplicación programática: se ejecuta en la capa de aplicación y puede inspeccionar el estado para rechazar o redirigir llamadas a herramientas que violen el ordenamiento requerido. La temperatura (opción D) afecta la aleatoriedad, no el cumplimiento de requisitos procedurales.\n\nComo implementarlo:\n```typescript\nconst sessionState = { sentimentAnalyzed: false };\n\nconst hooks = {\n  PostToolUse: async ({ toolName }) => {\n    if (toolName === \"analyze_sentiment\") {\n      sessionState.sentimentAnalyzed = true;\n    }\n  },\n  PreToolUse: async ({ toolName }) => {\n    if (toolName === \"escalate_to_human\" && !sessionState.sentimentAnalyzed) {\n      return {\n        decision: \"deny\",\n        reason: \"Sentiment analysis must run before escalation. Call analyze_sentiment first.\",\n      };\n    }\n    return { decision: \"allow\" };\n  },\n};\n\n// Register hooks when creating the agent\nconst agent = new ClaudeAgent({ tools, hooks, systemPrompt });\n```",
    keyConcept: "Aplicación programática mediante hooks vs guía basada en prompts para el ordenamiento del flujo de trabajo",
  },

  "D1-006": {
    question:
      "Tu agente de soporte llama a una herramienta `get_customer_data` que devuelve números de teléfono en varios formatos: `(555) 123-4567`, `555-123-4567`, `5551234567`. Necesitas que todos los números de teléfono estén almacenados en formato E.164 antes de llegar a la base de datos. ¿Dónde es el lugar más apropiado para implementar esta normalización?",
    options: {
      A: "En el system prompt, instruyendo a Claude para que normalice los números de teléfono en sus respuestas",
      B: "En un hook PostToolUse que intercepta los resultados de las herramientas y normaliza los números de teléfono antes de que sean enviados de vuelta a Claude",
      C: "En un hook PreToolUse que modifica los argumentos de la llamada a la herramienta antes de que se ejecute",
      D: "En la herramienta misma, pero solo cuando la salida se escribirá en la base de datos",
    },
    explanation:
      "Los hooks PostToolUse interceptan el resultado de la herramienta después de su ejecución y antes de que llegue a Claude. Esta es la capa correcta para la normalización de datos porque opera sobre los datos que fluyen por el pipeline, independientemente de lo que Claude haga después. La opción A depende de que la salida de Claude sea perfecta, lo cual no es confiable. La opción C (PreToolUse) modifica entradas, no salidas. La opción D es inconsistente — la normalización debería ocurrir en cada punto de salida.\n\nComo implementarlo:\n```typescript\nfunction toE164(phone: string, defaultCountry = \"US\"): string {\n  // Strip all non-digits\n  const digits = phone.replace(/\\D/g, \"\");\n  // US numbers: add +1 prefix\n  if (digits.length === 10) return `+1${digits}`;\n  if (digits.length === 11 && digits.startsWith(\"1\")) return `+${digits}`;\n  return `+${digits}`; // international fallback\n}\n\nconst hooks = {\n  PostToolUse: async ({ toolName, result }) => {\n    if (toolName === \"get_customer_data\" && result?.phone) {\n      return {\n        ...result,\n        phone: toE164(result.phone),\n      };\n    }\n    return result;\n  },\n};\n```",
    keyConcept: "Hooks PostToolUse para normalización de datos y aplicación de cumplimiento",
  },

  "D1-007": {
    question:
      "Un pipeline de investigación tiene una secuencia fija: (1) obtener artículos, (2) extraer afirmaciones clave, (3) verificar referencias cruzadas, (4) generar resumen. La entrada de cada paso depende enteramente de la salida del paso anterior, y la estructura de la tarea es conocida de antemano. ¿Qué estrategia de descomposición es la más apropiada?",
    options: {
      A: "Descomposición adaptativa dinámica — dejar que el agente decida su próxima acción en cada paso",
      B: "Prompt chaining — definir la secuencia de antemano y pasar las salidas como entradas a través de cada paso",
      C: "Ejecución paralela — ejecutar los cuatro pasos simultáneamente y combinar los resultados",
      D: "De un solo disparo — proporcionar todas las instrucciones en un prompt y dejar que Claude complete todo de una vez",
    },
    explanation:
      "El prompt chaining es ideal cuando la secuencia de tareas es conocida, determinista y cada paso depende de la salida del paso anterior. Otorga control total sobre el pipeline y permite manejo de errores en cada límite. La descomposición adaptativa dinámica es mejor cuando la estructura de la tarea es desconocida o puede cambiar según los hallazgos intermedios. La ejecución paralela requiere tareas independientes. De un solo disparo no es confiable para trabajo complejo de múltiples pasos.\n\nComo implementarlo:\n```typescript\nasync function runResearchPipeline(topic: string) {\n  // Step 1: Fetch papers\n  const papers = await callClaude(\n    `Fetch the 5 most relevant papers on: ${topic}`,\n    [fetchPaperTool]\n  );\n\n  // Step 2: Extract claims — receives Step 1 output\n  const claims = await callClaude(\n    `Extract the key scientific claims from these papers:\\n${papers}`,\n    []\n  );\n\n  // Step 3: Cross-reference — receives Step 2 output\n  const verified = await callClaude(\n    `Cross-reference these claims against citations:\\n${claims}`,\n    [citationTool]\n  );\n\n  // Step 4: Generate summary — receives Step 3 output\n  const summary = await callClaude(\n    `Generate a research summary from these verified claims:\\n${verified}`,\n    []\n  );\n\n  return summary;\n}\n```",
    keyConcept: "Descomposición de tareas: prompt chaining vs descomposición adaptativa dinámica",
  },

  "D1-008": {
    question:
      "Un agente de investigación está investigando un nuevo tema científico donde no sabe de antemano qué sub-preguntas surgirán. Después de obtener el primer artículo, descubre tres sub-temas inesperados que cada uno requiere diferentes herramientas y enfoques. ¿Qué estrategia de descomposición está diseñada para este escenario?",
    options: {
      A: "Prompt chaining — predefinir tres cadenas paralelas, una por sub-tema",
      B: "Descomposición adaptativa dinámica — el agente decide sus próximas acciones basándose en lo que descubre",
      C: "Orquestación estática — definir todos los caminos posibles de antemano en el system prompt",
      D: "Encadenamiento secuencial — procesar cada sub-tema en serie con la misma plantilla de prompt fija",
    },
    explanation:
      "La descomposición adaptativa dinámica permite al agente observar resultados intermedios y decidir qué hacer a continuación según lo que encuentra, incluyendo lanzar nuevas sub-tareas para temas inesperados. Esta es la opción correcta cuando la estructura de la tarea es emergente en lugar de conocida de antemano. El prompt chaining requiere que la estructura esté definida con anticipación. La orquestación estática no puede manejar ramas inesperadas. El encadenamiento secuencial con una plantilla fija no puede adaptarse a tipos de sub-temas variados.\n\nComo implementarlo:\n```typescript\n// System prompt that enables adaptive behavior\nconst systemPrompt = `You are a research agent exploring scientific topics.\nAfter each discovery, decide dynamically what to investigate next.\nYou may spawn child tasks, search for papers, or change direction based on findings.\nAlways explain your reasoning before each action.`;\n\n// The agent loop runs until end_turn with no further tool calls\nconst response = await anthropic.messages.create({\n  model: \"claude-opus-4-5\",\n  system: systemPrompt,\n  messages: [{ role: \"user\", content: `Investigate: ${topic}` }],\n  tools: [\n    fetchPaperTool,\n    webSearchTool,\n    spawnSubtaskTool, // Task tool for creating child agents\n    saveNotesTool,\n  ],\n  max_tokens: 8192,\n});\n// Agent will dynamically chain tool calls based on discoveries\n```",
    keyConcept: "Descomposición adaptativa dinámica para estructuras de tareas emergentes",
  },

  "D1-009": {
    question:
      "Un agente fue interrumpido a mitad del flujo de trabajo después de completar los pasos 1 a 4 de un proceso de incorporación de clientes de 7 pasos. El estado de la sesión fue guardado. ¿Cómo deberías reanudar el flujo de trabajo desde el paso 5 sin repetir los pasos completados?",
    options: {
      A: "Iniciar una nueva sesión e incluir un resumen de los pasos 1 a 4 en el system prompt",
      B: "Usar --resume con el ID de sesión guardado para restaurar el historial de conversación y continuar desde donde se dejó",
      C: "Re-ejecutar todo el flujo de trabajo desde el paso 1; el modelo detectará los pasos completados y los omitirá",
      D: "Usar fork_session en la sesión guardada para bifurcar hacia una nueva continuación",
    },
    explanation:
      "--resume acepta un ID de sesión y restaura el historial completo de conversación, permitiendo al agente continuar desde exactamente donde se detuvo. Este es el propósito de la reanudación de sesión. Iniciar una nueva sesión con un resumen (opción A) pierde fidelidad de contexto y puede causar inconsistencias. Re-ejecutar desde el paso 1 es un desperdicio y arriesga efectos secundarios. fork_session es para crear ramas divergentes, no para reanudación lineal.\n\nComo implementarlo:\n```bash\n# Save the session ID when starting\nclaude --session-id onboarding-customer-123 -p \"Begin 7-step onboarding for customer ORD-9912\"\n\n# Later, if interrupted, resume with the same session ID\nclaude --resume onboarding-customer-123\n# Claude restores full conversation history and continues from step 5\n\n# Programmatically:\nconst { sessionId } = await startClaudeSession({ task: onboardingTask });\nawait saveToDatabase({ customerId, sessionId }); // persist for recovery\n\n// On recovery:\nconst { sessionId } = await getFromDatabase({ customerId });\nawait resumeClaudeSession({ sessionId });\n```",
    keyConcept: "Reanudación de sesión con --resume",
  },

  "D1-010": {
    question:
      "Un flujo de trabajo de investigación de múltiples pasos requiere que una revisión de literatura sea aprobada por un humano antes de que comience la fase de análisis de datos. La arquitectura debe evitar que la siguiente fase comience automáticamente. ¿Qué mecanismo implementa correctamente esta compuerta de prerequisito?",
    options: {
      A: "Instruir a Claude en el system prompt que espere la confirmación del usuario antes de continuar con el análisis de datos",
      B: "Usar un hook PostToolUse en la herramienta de finalización de la revisión de literatura que pause la ejecución y emita una solicitud de aprobación a la interfaz de supervisión humana, bloqueando la siguiente llamada a herramienta hasta que se reciba la aprobación",
      C: "Establecer un límite de max_tokens en la respuesta de la revisión de literatura para forzar a Claude a detenerse",
      D: "Usar un stop_sequence que Claude emitirá cuando la revisión esté completa",
    },
    explanation:
      "Un hook PostToolUse que bloquea programáticamente la ejecución posterior hasta que llegue una señal de aprobación es la implementación confiable de una compuerta de prerequisito. Opera en la capa de aplicación, no dentro de la generación de Claude, lo que lo hace resistente a la inyección de prompts y al incumplimiento del modelo. La opción A está basada en prompts y no es confiable. max_tokens y stop_sequence interrumpen la generación pero no implementan lógica de compuerta condicional vinculada a la aprobación humana.\n\nComo implementarlo:\n```typescript\nlet humanApproved = false;\n\nconst hooks = {\n  PostToolUse: async ({ toolName, result }) => {\n    if (toolName === \"complete_literature_review\") {\n      // Emit approval request to human-in-the-loop interface\n      await notifyHuman({\n        type: \"approval_required\",\n        phase: \"literature_review\",\n        summary: result.summary,\n        approvalUrl: `https://your-app.com/approve/${result.reviewId}`,\n      });\n\n      // Block until human approves (poll or use webhook)\n      while (!humanApproved) {\n        await sleep(5000);\n        humanApproved = await checkApprovalStatus(result.reviewId);\n      }\n\n      return { ...result, approved: true };\n    }\n  },\n};\n\n// Webhook endpoint to receive approval\napp.post(\"/approve/:reviewId\", (req, res) => {\n  humanApproved = true;\n  res.json({ status: \"approved\" });\n});\n```",
    keyConcept: "Flujos de trabajo de múltiples pasos con compuertas de prerequisito usando hooks",
  },

  "D1-011": {
    question:
      'Después de que tu agente de soporte llama a `lookup_order(order_id="ORD-9912")`, la herramienta retorna exitosamente. Ensamblas el resultado de la herramienta y lo envías de vuelta a Claude. Claude responde con stop_reason: "end_turn" y proporciona una respuesta completa al cliente. ¿Qué señala esto?',
    options: {
      A: "Claude necesita otra llamada a herramienta para terminar la respuesta",
      B: "Claude terminó su generación y no se necesitan más llamadas a herramientas para este turno",
      C: "La respuesta fue truncada debido a límites de tokens",
      D: "Claude está esperando el próximo resultado de herramienta antes de poder continuar",
    },
    explanation:
      'stop_reason: "end_turn" significa que Claude completó su generación de forma natural — produjo una respuesta completa y no tiene llamadas a herramientas pendientes. El bucle de orquestación debe presentar esta respuesta al usuario. Si se necesitara otra llamada a herramienta, stop_reason sería "tool_use". "max_tokens" indica truncamiento. No existe un estado donde "end_turn" signifique esperar más datos.\n\nComo implementarlo:\n```typescript\nasync function runLoop(messages: Message[]): Promise<string> {\n  const response = await anthropic.messages.create({\n    model: "claude-opus-4-5",\n    max_tokens: 1024,\n    tools: [lookupOrderTool],\n    messages,\n  });\n\n  switch (response.stop_reason) {\n    case "end_turn":\n      // Done — extract and return the final text to the user\n      const text = response.content\n        .filter(b => b.type === "text")\n        .map(b => b.text)\n        .join("");\n      return text;\n\n    case "tool_use":\n      // Not done — must supply tool results and loop again\n      messages.push({ role: "assistant", content: response.content });\n      const results = await executeToolCalls(response.content);\n      messages.push({ role: "user", content: results });\n      return runLoop(messages); // recurse\n\n    case "max_tokens":\n      throw new Error("Response truncated — increase max_tokens");\n\n    default:\n      throw new Error(`Unexpected stop_reason: ${response.stop_reason}`);\n  }\n}\n```',
    keyConcept: "Ciclo de vida del bucle agéntico – razón de parada end_turn",
  },

  "D1-012": {
    question:
      "En tu sistema de investigación hub-and-spoke, el agente coordinador ha acumulado 180k tokens de contexto a través de 12 interacciones con subagentes. Notas que el coordinador está comenzando a perder el rastro de los hallazgos tempranos de los subagentes. ¿Qué ajuste arquitectónico aborda mejor esto?",
    options: {
      A: "Aumentar la ventana de contexto actualizando a un modelo más grande",
      B: 'Hacer que el coordinador mantenga un "registro de hallazgos" estructurado como archivo de borrador, escribiendo los descubrimientos clave después de cada interacción con subagentes y leyéndolo al inicio de cada nuevo paso de coordinación',
      C: "Enviar los 180k tokens a cada nuevo subagente para que puedan ayudar al coordinador a recordar",
      D: "Deshabilitar el contexto de interacciones más antiguas con subagentes truncando el historial de conversación",
    },
    explanation:
      "Un archivo de borrador estructurado (registro de hallazgos) persiste la información clave fuera de la ventana de contexto, permitiendo al coordinador acceder a ella selectivamente sin llevar todo el historial. Este es un patrón estándar para flujos de trabajo agénticos de larga duración. Simplemente actualizar los modelos posterga pero no resuelve el problema. Enviar todos los tokens a los subagentes ubica mal el problema e infla los contextos de los subagentes. Truncar sin resumir pierde información de forma irreversible.\n\nComo implementarlo:\n```typescript\n// findings-register.json — written after each subagent interaction\nconst findingsRegister = {\n  lastUpdated: \"2024-01-15T10:30:00Z\",\n  subagentFindings: [\n    {\n      agent: \"literature-review\",\n      completedAt: \"2024-01-15T09:00:00Z\",\n      keyFindings: [\"Climate sensitivity is 3°C per doubling CO2\", \"Paper DOI: 10.1234/xyz\"],\n    },\n    {\n      agent: \"data-analysis\",\n      completedAt: \"2024-01-15T10:00:00Z\",\n      keyFindings: [\"Correlation r=0.87 between emissions and temperature\"],\n    },\n  ],\n};\n\n// Coordinator reads register at start of each step\nconst coordinatorPrompt = `\nPrevious findings (from findings-register.json):\n${JSON.stringify(findingsRegister, null, 2)}\n\nYour next task: delegate citation checking to the citation-subagent.\n`;\n\n// After each subagent completes, write new findings to file\nawait fs.writeFile(\"findings-register.json\", JSON.stringify(updatedRegister));\n```",
    keyConcept: "Gestión del contexto en agentes coordinadores de larga duración usando archivos de borrador",
  },

  "D2-001": {
    question:
      "Tu agente de soporte tiene dos herramientas: `search_knowledge_base(query: string)` con descripción \"Busca documentación interna\" y `search_orders(query: string)` con descripción \"Busca datos de clientes\". Los agentes consistentemente enrutan preguntas sobre estado de pedidos hacia `search_knowledge_base`. ¿Cuál es la causa raíz más probable?",
    options: {
      A: "Las herramientas tienen los mismos nombres de parámetros, haciendo que el modelo las trate como equivalentes",
      B: "Las descripciones de las herramientas son demasiado similares y ambiguas — el modelo usa las descripciones como su señal principal de enrutamiento y no puede distinguirlas",
      C: "El system prompt no lista explícitamente qué herramienta usar para cada tipo de pregunta",
      D: "El modelo ignora las descripciones de las herramientas y enruta aleatoriamente cuando las herramientas comparten parámetros",
    },
    explanation:
      'Las descripciones de herramientas son el mecanismo principal mediante el cual los LLMs seleccionan herramientas. Las descripciones vagas o superpuestas como "busca documentación interna" vs "busca datos de clientes" son insuficientemente distintivas. La solución es hacer que las descripciones sean inequívocas y específicas sobre lo que cada herramienta hace y no hace. La opción C puede ayudar pero es secundaria a la calidad de la descripción. Las opciones A y D son incorrectas — los nombres de parámetros no impulsan el enrutamiento y el modelo no ignora las descripciones.\n\nComo implementarlo:\n```typescript\nconst tools = [\n  {\n    name: \"search_knowledge_base\",\n    description:\n      \"Searches the internal product documentation, FAQs, and policy articles. \" +\n      \"Use for questions about HOW features work, product policies, and how-to guides. \" +\n      \"Do NOT use for customer-specific data like order status, account info, or transaction history.\",\n    input_schema: {\n      type: \"object\",\n      properties: { query: { type: \"string\", description: \"The documentation topic to search\" } },\n      required: [\"query\"],\n    },\n  },\n  {\n    name: \"search_orders\",\n    description:\n      \"Searches customer order records, shipment status, and transaction history. \" +\n      \"Use for questions about a specific customer\'s orders, refunds, or deliveries. \" +\n      \"Do NOT use for general product questions or policy lookups.\",\n    input_schema: {\n      type: \"object\",\n      properties: { query: { type: \"string\", description: \"Customer order query, e.g. order ID or customer email\" } },\n      required: [\"query\"],\n    },\n  },\n];\n```',
    keyConcept: "Descripciones de herramientas como mecanismo principal para la selección de herramientas por parte del LLM",
  },

  "D2-002": {
    question:
      "Rediseñas las dos herramientas de búsqueda con descripciones más claras. `search_knowledge_base` ahora dice: \"Busca la documentación interna del producto y los artículos de preguntas frecuentes. Úsala para preguntas sobre cómo funcionan las características, políticas o guías generales. NO usar para datos específicos del cliente como pedidos o información de cuenta.\" Después del despliegue, la precisión del enrutamiento mejora del 60% al 94%. ¿Qué principio demuestra esto?",
    options: {
      A: "Las restricciones negativas en las descripciones ayudan al modelo a entender los límites de la herramienta tanto como las descripciones positivas",
      B: "Las descripciones más largas siempre producen una mejor selección de herramientas independientemente del contenido",
      C: "El modelo se basa en las instrucciones del system prompt, no en las descripciones de las herramientas, para las decisiones de enrutamiento",
      D: "Las descripciones de herramientas deberían evitar especificar lo que la herramienta NO hace para prevenir confusión",
    },
    explanation:
      'Las restricciones negativas explícitas ("NO usar para...") en las descripciones de herramientas son muy efectivas porque definen los límites de la herramienta, no solo sus capacidades. El modelo usa tanto señales positivas como negativas para tomar decisiones de enrutamiento. Las descripciones más largas sin claridad no mejoran el enrutamiento (B es incorrecto). El modelo utiliza principalmente las descripciones de herramientas, no solo los system prompts, para la selección de herramientas (C es incorrecto). Omitir las restricciones negativas fue el problema original (D es incorrecto).\n\nComo implementarlo:\n```typescript\n// BEFORE (60% accuracy — ambiguous):\nconst badDescription = \"Searches internal documentation\";\n\n// AFTER (94% accuracy — positive + negative constraints):\nconst goodDescription =\n  \"Searches the internal product documentation and FAQ articles. \" +\n  // Positive: what it IS for\n  \"Use this for questions about how features work, policies, or general how-to guidance. \" +\n  // Negative constraint: what it is NOT for\n  \"Do NOT use for customer-specific data like orders, account balances, or transaction history.\";\n\n// Template for writing effective tool descriptions:\n// 1. One sentence: what data/system does this tool access?\n// 2. \'Use this for:\' — 2-3 specific use cases\n// 3. \'Do NOT use for:\' — the most common misrouting case\n```',
    keyConcept: "Diseño efectivo de descripciones de herramientas con límites explícitos",
  },

  "D2-003": {
    question:
      "La herramienta `update_order_status` de tu servidor MCP es llamada con un order_id que no existe en la base de datos. El servidor necesita devolver un error que le diga a Claude que se trata de un fallo de validación permanente (no vale la pena reintentar) y qué ocurrió. ¿Qué estructura de respuesta es la más apropiada?",
    options: {
      A: "Devolver HTTP 404 y dejar que el cliente MCP maneje la interpretación del error",
      B: 'Devolver: `{ "isError": true, "content": [{ "type": "text", "text": "Pedido ORD-9912 no encontrado" }], "errorCategory": "validation", "isRetryable": false }`',
      C: "Lanzar una excepción en el manejador de la herramienta; el protocolo MCP la convertirá en una respuesta de error",
      D: 'Devolver: `{ "error": "NOT_FOUND", "message": "Pedido no encontrado" }` sin la bandera isError',
    },
    explanation:
      "Las respuestas de error estructuradas de MCP deben usar la bandera isError para señalar errores explícitamente a la capa del modelo de Claude, incluir una descripción legible por humanos en el array content, y llevar metadatos como errorCategory y isRetryable para que el orquestador pueda decidir si reintentar o escalar. Los códigos de estado HTTP (A) son preocupaciones de la capa de transporte, no semántica MCP. Lanzar excepciones (C) no le da a Claude metadatos de error estructurados. Omitir isError (D) significa que Claude puede no reconocer la respuesta como un error.\n\nComo implementarlo:\n```typescript\n// MCP server tool handler\nserver.setRequestHandler(CallToolRequestSchema, async (request) => {\n  if (request.params.name === \"update_order_status\") {\n    const { order_id, status } = request.params.arguments;\n\n    const order = await db.orders.findById(order_id);\n    if (!order) {\n      // Structured MCP error response\n      return {\n        isError: true,\n        content: [{\n          type: \"text\",\n          text: `Order ${order_id} not found in the database. Verify the order ID and try again.`,\n        }],\n        errorCategory: \"validation\",  // permanent — do not retry\n        isRetryable: false,\n      };\n    }\n\n    await db.orders.updateStatus(order_id, status);\n    return {\n      isError: false,\n      content: [{ type: \"text\", text: `Order ${order_id} updated to ${status}` }],\n    };\n  }\n});\n```",
    keyConcept: "Bandera isError de MCP y respuestas de error estructuradas con errorCategory e isRetryable",
  },

  "D2-004": {
    question:
      "La herramienta `fetch_paper` de un subagente de investigación falla porque la API académica externa tiene limitación de tasa (HTTP 429). Necesitas que Claude entienda si debe reintentar inmediatamente, esperar y reintentar, o escalar. ¿Qué clasificación de error y respuesta es la más apropiada?",
    options: {
      A: 'errorCategory: "transient", isRetryable: true, con un campo retryAfterSeconds indicando el tiempo de espera',
      B: 'errorCategory: "validation", isRetryable: false, porque el formato de la solicitud fue rechazado',
      C: 'errorCategory: "business", isRetryable: true, porque es una restricción de lógica de negocio',
      D: 'errorCategory: "permission", isRetryable: false, porque el acceso fue denegado',
    },
    explanation:
      "Una limitación de tasa (HTTP 429) es un error transitorio — el servicio no está disponible temporalmente, no está rechazando la solicitud de forma permanente. Clasificarlo como transitorio con isRetryable: true y proporcionar una pista retryAfterSeconds permite al orquestador implementar una estrategia de backoff inteligente. Los errores de validación son para entradas malformadas (B es incorrecto). Los errores de negocio son para restricciones lógicas como fondos insuficientes (C es incorrecto). Los errores de permiso son para fallos de autorización (D es incorrecto). Las limitaciones de tasa son restricciones de capacidad temporales, de ahí el término transitorio.\n\nComo implementarlo:\n```typescript\nasync function fetchPaper(doi: string) {\n  try {\n    const response = await academicApi.fetch(doi);\n    return {\n      isError: false,\n      content: [{ type: \"text\", text: JSON.stringify(response) }],\n    };\n  } catch (err) {\n    if (err.status === 429) {\n      const retryAfter = parseInt(err.headers[\"retry-after\"] ?? \"60\");\n      return {\n        isError: true,\n        content: [{\n          type: \"text\",\n          text: `Academic API rate limit hit. Please wait ${retryAfter}s before retrying DOI: ${doi}`,\n        }],\n        errorCategory: \"transient\",\n        isRetryable: true,\n        retryAfterSeconds: retryAfter,\n      };\n    }\n    if (err.status === 404) {\n      return {\n        isError: true,\n        content: [{ type: \"text\", text: `Paper not found: ${doi}` }],\n        errorCategory: \"validation\",\n        isRetryable: false,\n      };\n    }\n  }\n}\n```",
    keyConcept: "Clasificación de errores transitorios vs de validación vs de negocio vs de permiso",
  },

  "D2-005": {
    question:
      "Tu sistema de investigación tiene 18 herramientas que abarcan búsqueda web, acceso a base de datos, operaciones de archivos, verificación de citas y análisis estadístico. Tienes un subagente de revisión de literatura y un subagente de análisis de datos. ¿Cómo deberías distribuir las herramientas entre estos agentes?",
    options: {
      A: "Dar las 18 herramientas a ambos agentes para que puedan manejar cualquier tarea inesperada que surja",
      B: "Dar a cada agente 4-5 herramientas adaptadas a su función específica: el agente de literatura obtiene herramientas de búsqueda web y citas; el agente de datos obtiene herramientas de base de datos, archivos y estadísticas",
      C: "Dar al coordinador las 18 herramientas y hacer que los subagentes soliciten herramientas a través del coordinador",
      D: "Asignar aleatoriamente 9 herramientas a cada agente para equilibrar la carga",
    },
    explanation:
      "El acceso a herramientas con alcance limitado (4-5 herramientas por agente) es una buena práctica por varias razones: reduce la carga cognitiva del modelo (menos herramientas significa menos confusión), limita el radio de explosión de los errores y aplica el principio de mínimo privilegio. Dar las 18 herramientas a ambos agentes (A) crea ambigüedad y riesgo de seguridad. Tener todas las herramientas en el coordinador (C) rompe la separación de responsabilidades. La asignación aleatoria (D) ignora los requisitos funcionales.\n\nComo implementarlo:\n```typescript\n// Literature Review Subagent — scoped to 4 tools\nconst literatureAgent = await anthropic.messages.create({\n  model: \"claude-opus-4-5\",\n  system: \"You are a literature review specialist.\",\n  tools: [\n    webSearchTool,       // Find papers online\n    fetchPaperTool,      // Download paper by DOI\n    checkCitationTool,   // Validate citations\n    saveNotesTool,       // Save findings to scratchpad\n  ],\n  messages,\n});\n\n// Data Analysis Subagent — scoped to 5 different tools\nconst dataAgent = await anthropic.messages.create({\n  model: \"claude-opus-4-5\",\n  system: \"You are a data analysis specialist.\",\n  tools: [\n    queryDatabaseTool,   // Access research datasets\n    readFileTool,        // Read data files\n    writeFileTool,       // Save processed data\n    runStatsTool,        // Statistical computations\n    generateChartTool,   // Visualizations\n  ],\n  messages,\n});\n// Neither agent has access to the other\'s tools\n```",
    keyConcept: "Acceso a herramientas con alcance limitado — 4-5 herramientas por agente, no todas las herramientas",
  },

  "D2-006": {
    question:
      "Estás construyendo una herramienta de revisión de código usando Claude. La herramienta siempre debe llamar a la función `analyze_code` en lugar de elegir si llamarla o simplemente responder en texto. ¿Qué configuración de tool_choice aplica esto?",
    options: {
      A: 'tool_choice: { type: "auto" } — Claude llamará a la herramienta cuando crea que es necesario',
      B: 'tool_choice: { type: "any" } — Claude debe llamar al menos a una herramienta pero elige cuál',
      C: 'tool_choice: { type: "tool", name: "analyze_code" } — fuerza a Claude a siempre llamar a analyze_code específicamente',
      D: 'tool_choice: { type: "none" } — previene las llamadas a herramientas para que el análisis siempre esté en prosa',
    },
    explanation:
      'tool_choice: { type: "tool", name: "analyze_code" } obliga a Claude a llamar a esa herramienta específica en cada turno, garantizando una salida estructurada para cada revisión. "auto" significa que Claude puede elegir no llamar a ninguna herramienta. "any" significa que Claude debe llamar a una herramienta pero puede elegir cualquiera disponible. "none" deshabilita completamente las llamadas a herramientas. Cuando necesitas una invocación específica garantizada de una herramienta, la selección forzada es la única opción confiable.\n\nComo implementarlo:\n```typescript\nconst response = await anthropic.messages.create({\n  model: \"claude-opus-4-5\",\n  max_tokens: 2048,\n  tools: [\n    {\n      name: \"analyze_code\",\n      description: \"Analyzes code for bugs, style issues, and security vulnerabilities\",\n      input_schema: {\n        type: \"object\",\n        properties: {\n          bugs: { type: \"array\", items: { type: \"string\" } },\n          security_issues: { type: \"array\", items: { type: \"string\" } },\n          style_violations: { type: \"array\", items: { type: \"string\" } },\n          overall_score: { type: \"number\", minimum: 0, maximum: 10 },\n        },\n        required: [\"bugs\", \"security_issues\", \"style_violations\", \"overall_score\"],\n      },\n    },\n  ],\n  // Force Claude to ALWAYS call analyze_code — never respond in prose\n  tool_choice: { type: \"tool\", name: \"analyze_code\" },\n  messages: [{ role: \"user\", content: `Review this code:\\n\\n${codeToReview}` }],\n});\n\n// Guaranteed: response.content[0].type === \"tool_use\"\nconst review = response.content[0].input;\n```',
    keyConcept: "Selección forzada con tool_choice para invocación garantizada de herramientas",
  },

  "D2-007": {
    question:
      "Tu equipo quiere compartir una configuración de servidor MCP para una herramienta de base de datos en todo el proyecto. Un desarrollador individual también quiere un servidor MCP personal para su entorno de pruebas local que NO debería afectar a otros miembros del equipo. ¿Dónde debería vivir cada configuración?",
    options: {
      A: "Ambos en `.mcp.json` en la raíz del proyecto — la configuración individual puede ser comentada por desarrollador",
      B: "Ambos en `~/.claude.json` — la configuración personal y del proyecto se fusiona en tiempo de ejecución",
      C: "Servidor del equipo en `.mcp.json` (raíz del proyecto, confirmado en git); servidor personal en `~/.claude.json` (nivel de usuario, no confirmado)",
      D: "Servidor del equipo en `~/.claude.json` en cada máquina; servidor personal en `.mcp.json` para que pueda estar en el .gitignore",
    },
    explanation:
      ".mcp.json en la raíz del proyecto es la configuración MCP de alcance de proyecto confirmada en control de versiones, haciendo que los servidores compartidos del equipo estén disponibles para todos los desarrolladores. ~/.claude.json es la configuración a nivel de usuario en la máquina de cada desarrollador, afectando solo a ese usuario y no compartida por git. Las opciones A y B confunden los dos niveles de alcance. La opción D invierte la semántica — la configuración a nivel de usuario debería estar en ~/.claude.json, no en un archivo de proyecto.\n\nComo implementarlo:\n```jsonc\n// .mcp.json — committed to git, shared with all team members\n{\n  \"mcpServers\": {\n    \"team-database\": {\n      \"command\": \"node\",\n      \"args\": [\"./mcp-servers/database/index.js\"],\n      \"env\": {\n        \"DB_CONNECTION_STRING\": \"${DB_CONNECTION_STRING}\"  // from env vars\n      }\n    }\n  }\n}\n\n// ~/.claude.json — NOT committed, personal only\n{\n  \"mcpServers\": {\n    \"local-test-db\": {\n      \"command\": \"node\",\n      \"args\": [\"/Users/alice/personal-mcp/test-db/index.js\"],\n      \"env\": {\n        \"DB_URL\": \"postgresql://localhost:5432/mytest\"\n      }\n    }\n  }\n}\n// Both configs are merged at runtime — Alice gets both servers\n// Other team members only get team-database\n```",
    keyConcept: "Alcance del servidor MCP: .mcp.json (proyecto) vs ~/.claude.json (usuario)",
  },

  "D2-008": {
    question:
      "Tu `.mcp.json` configura un servidor MCP de base de datos que requiere una cadena de conexión. La cadena de conexión varía según el entorno (dev/staging/prod) y no debe ser confirmada en control de versiones. ¿Cómo deberías manejar esto en la configuración?",
    options: {
      A: "Codificar de forma fija la cadena de conexión de producción y usar .gitignore para evitar que .mcp.json sea confirmado",
      B: 'Usar expansión de variables de entorno en .mcp.json: `"connectionString": "${DB_CONNECTION_STRING}"` para que el valor real sea leído del entorno en tiempo de ejecución',
      C: "Almacenar la cadena de conexión en un archivo .env separado e importarla usando la sintaxis @import en .mcp.json",
      D: "Pasar la cadena de conexión como argumento de línea de comandos al iniciar la sesión de Claude Code",
    },
    explanation:
      "La expansión de variables de entorno en .mcp.json (usando la sintaxis ${VAR_NAME}) permite que el archivo de configuración sea confirmado de forma segura en control de versiones mientras mantiene los secretos fuera. Los valores reales se suministran a través de variables de entorno que se establecen de forma diferente por entorno. Agregar .mcp.json al gitignore (A) impide el uso compartido del equipo. @import es una característica de CLAUDE.md, no de .mcp.json (C). Los argumentos CLI no son un mecanismo estándar de configuración de servidores MCP (D).\n\nComo implementarlo:\n```jsonc\n// .mcp.json — safe to commit, no secrets\n{\n  \"mcpServers\": {\n    \"postgres-db\": {\n      \"command\": \"npx\",\n      \"args\": [\"-y\", \"@modelcontextprotocol/server-postgres\"],\n      \"env\": {\n        // ${VAR} is expanded at runtime from the process environment\n        \"POSTGRES_CONNECTION_STRING\": \"${DB_CONNECTION_STRING}\"\n      }\n    }\n  }\n}\n\n# .env.development (gitignored)\nDB_CONNECTION_STRING=postgresql://user:pass@localhost:5432/myapp_dev\n\n# .env.production (set in CI/CD secrets)\nDB_CONNECTION_STRING=postgresql://user:prod-pass@prod-host:5432/myapp\n\n# .gitignore — only the .env files are ignored, not .mcp.json\n.env*\n!.env.example\n```",
    keyConcept: "Expansión de variables de entorno en .mcp.json para gestión de secretos",
  },

  "D2-009": {
    question:
      "Un desarrollador le pide a Claude Code que encuentre todos los archivos TypeScript en el directorio `src/` que importan desde `'../utils/auth'`. ¿Qué herramienta incorporada es la más apropiada para esta tarea?",
    options: {
      A: "Read — para leer cada archivo TypeScript y verificar sus importaciones",
      B: "Bash — para ejecutar un comando grep personalizado",
      C: "Grep — para buscar el patrón de importación en el contenido de múltiples archivos",
      D: "Glob — para listar todos los archivos TypeScript por patrón",
    },
    explanation:
      "Grep está diseñado para la búsqueda de contenido en archivos — encontrar un patrón de importación específico (`from '../utils/auth'`) en muchos archivos es exactamente su caso de uso. Read requeriría cargar cada archivo individualmente y es ineficiente para búsquedas. Bash ejecutando grep omite la optimización de la herramienta incorporada. Glob encuentra archivos por patrón de nombre pero no busca en su contenido. Para buscar contenido en múltiples archivos, Grep es la herramienta incorporada correcta.\n\nComo implementarlo:\n```typescript\n// Claude Code internally uses Grep like this:\n// Grep tool call:\n{\n  \"tool\": \"Grep\",\n  \"input\": {\n    \"pattern\": \"from ['\\\"]\\\\.\\\\.?\\\\/.*utils\\\\/auth['\\\"]?\",\n    \"path\": \"src/\",\n    \"glob\": \"**/*.ts\",\n    \"output_mode\": \"files_with_matches\"\n  }\n}\n\n// Equivalent bash for reference (but prefer the built-in Grep tool):\n// grep -r --include='*.ts' -l \"from.*utils/auth\" src/\n\n// The Grep tool is preferred because:\n// 1. It respects .claudeignore file exclusions\n// 2. It has optimized permissions in the sandbox\n// 3. Results are structured for Claude to parse reliably\n```",
    keyConcept: "Selección de herramienta incorporada: Grep para búsqueda de contenido en archivos",
  },

  "D2-010": {
    question:
      "Claude Code está ayudando a refactorizar un proyecto. Necesita encontrar todos los archivos que coincidan con el patrón `*.service.ts` dentro del árbol de directorio `src/` para entender qué servicios existen. ¿Qué herramienta incorporada debería usar?",
    options: {
      A: "Grep — para buscar la extensión .service.ts en el contenido de los archivos",
      B: "Bash con `find` — para listar archivos que coincidan con el patrón de nombre",
      C: "Glob — para coincidir archivos por patrón de nombre en el árbol de directorios",
      D: "Read — para leer la raíz del proyecto y descubrir archivos desde listados de directorios",
    },
    explanation:
      "Glob es la herramienta incorporada correcta para encontrar archivos por patrón de nombre (como `**/*.service.ts`). Coincide eficientemente nombres de archivos en árboles de directorios sin leer el contenido de los archivos. Grep busca el contenido de los archivos, no sus nombres. Bash con find omite innecesariamente las herramientas incorporadas. Read opera en archivos individuales y no puede realizar coincidencias de patrones de nombres en todo un directorio.\n\nComo implementarlo:\n```typescript\n// Claude Code internally uses Glob like this:\n{\n  \"tool\": \"Glob\",\n  \"input\": {\n    \"pattern\": \"**/*.service.ts\",\n    \"path\": \"src/\"\n  }\n}\n// Returns: [\"src/auth/auth.service.ts\", \"src/orders/order.service.ts\", ...]\n\n// Common Glob patterns for code navigation:\n// Find all test files:        \"**/*.spec.ts\" or \"**/*.test.ts\"\n// Find all React components:  \"src/components/**/*.tsx\"\n// Find all config files:      \"**/*.config.{js,ts}\"\n// Find all index files:       \"**/index.ts\"\n\n// After Glob lists the files, use Read to inspect specific ones:\n// { \"tool\": \"Read\", \"input\": { \"file_path\": \"src/auth/auth.service.ts\" } }\n```",
    keyConcept: "Selección de herramienta incorporada: Glob para coincidencia de patrones de nombres de archivos",
  },

  "D2-011": {
    question:
      "Tu agente de soporte llama a `charge_refund(order_id, amount)`. La pasarela de pago rechaza la solicitud porque el reembolso excede el monto del cargo original. Esta es una restricción lógica permanente — ningún reintento tendrá éxito. ¿Qué respuesta de error es la más precisa?",
    options: {
      A: 'errorCategory: "transient", isRetryable: true — la pasarela puede procesarlo más tarde',
      B: 'errorCategory: "business", isRetryable: false — el monto del reembolso excede el cargo original, una violación permanente de las reglas de negocio',
      C: 'errorCategory: "validation", isRetryable: false — el campo del monto está malformado',
      D: 'errorCategory: "permission", isRetryable: false — el agente carece de permiso para emitir reembolsos',
    },
    explanation:
      "Un error de negocio representa una violación de una regla específica del dominio — en este caso, que un reembolso no puede exceder el cargo original. Ningún reintento resolverá esto; se necesita una acción diferente (como un reembolso parcial). Un error transitorio es para indisponibilidad temporal del servicio. Un error de validación es para entradas malformadas (tipos incorrectos, campos faltantes). Un error de permiso es para fallos de autorización. La restricción del monto del reembolso es un límite de lógica de negocio, no uno técnico.\n\nComo implementarlo:\n```typescript\nasync function chargeRefund(orderId: string, amount: number) {\n  const order = await db.orders.findById(orderId);\n  const originalCharge = order.chargedAmount;\n\n  // Business rule violation — permanent, not retryable\n  if (amount > originalCharge) {\n    return {\n      isError: true,\n      content: [{\n        type: \"text\",\n        text: `Refund of $${amount} exceeds original charge of $${originalCharge} for order ${orderId}. ` +\n              `Maximum refundable amount is $${originalCharge}. ` +\n              `Consider issuing a partial refund instead.`,\n      }],\n      errorCategory: \"business\",\n      isRetryable: false,\n      // Hint to agent about what action IS valid\n      suggestedAction: `charge_refund(\"${orderId}\", ${originalCharge})`,\n    };\n  }\n\n  // Proceed with valid refund...\n}\n\n// Error category decision tree:\n// transient  → HTTP 429, 503, network timeout (retry after wait)\n// validation → wrong types, missing required fields (fix input)\n// business   → domain rule violated (different action needed)\n// permission → 401, 403 (check auth credentials)\n```",
    keyConcept: "Clasificación de errores de negocio para violaciones permanentes de reglas de dominio",
  },

  "D2-012": {
    question:
      "Un agente de investigación tiene tres herramientas con estas descripciones: `fetch_paper`: \"Obtiene artículos académicos\", `search_database`: \"Busca en la base de datos\", `download_content`: \"Descarga contenido de la web\". El agente consistentemente elige `download_content` cuando se le indica obtener un artículo específico por DOI. ¿Cuál es la solución más efectiva?",
    options: {
      A: "Renombrar `fetch_paper` a `get_academic_paper_by_doi` para que el nombre sea autoexplicativo",
      B: 'Reescribir la descripción de `fetch_paper` para que sea específica: "Recupera metadatos completos del artículo académico y PDF por DOI o ID de arXiv desde el índice del repositorio académico. Usa esta herramienta — no download_content — cuando tengas un identificador específico del artículo."',
      C: "Eliminar `download_content` para eliminar la opción en conflicto",
      D: 'Agregar una regla en el system prompt: "Siempre usar fetch_paper para artículos"',
    },
    explanation:
      "Las descripciones específicas y diferenciadas son la solución principal para el enrutamiento incorrecto de herramientas. La descripción revisada le dice al modelo exactamente qué maneja fetch_paper (DOIs/IDs de arXiv), la distingue explícitamente de download_content y proporciona la señal de enrutamiento que el modelo necesita. Renombrar ayuda pero es insuficiente sin una buena descripción. Eliminar herramientas limita la funcionalidad. Las reglas del system prompt son secundarias a las descripciones de herramientas y menos confiables.\n\nComo implementarlo:\n```typescript\nconst tools = [\n  {\n    name: \"fetch_paper\",\n    // BEFORE: \"Gets academic papers\"  ← too vague, misrouting occurs\n    // AFTER: specific + differentiating + negative constraint\n    description:\n      \"Retrieves full academic paper metadata and PDF by DOI or arXiv ID \" +\n      \"from the academic repository index (PubMed, arXiv, Semantic Scholar). \" +\n      \"Use this — NOT download_content — when you have a specific paper identifier (DOI or arXiv ID). \" +\n      \"Example: fetch_paper({ doi: \\\"10.1038/nature12373\\\" })\",\n    input_schema: {\n      type: \"object\",\n      properties: {\n        doi: { type: \"string\", description: \"DOI like 10.1234/abc or arXiv ID like 2301.00001\" },\n      },\n      required: [\"doi\"],\n    },\n  },\n  {\n    name: \"download_content\",\n    description:\n      \"Downloads arbitrary web content from a URL (HTML pages, PDFs, JSON). \" +\n      \"Use for general web scraping and non-academic content. \" +\n      \"Do NOT use when you have a paper DOI — use fetch_paper instead.\",\n    input_schema: {\n      type: \"object\",\n      properties: { url: { type: \"string\" } },\n      required: [\"url\"],\n    },\n  },\n];\n```",
    keyConcept: "Especificidad de la descripción de la herramienta para evitar enrutamiento incorrecto",
  },

  "D3-001": {
    question:
      "Un desarrollador tiene la preferencia personal de usar siempre snake_case para los nombres de variables. Trabaja en múltiples proyectos, algunos de los cuales tienen sus propios estándares de codificación. ¿Dónde debe colocar el CLAUDE.md que contiene su preferencia personal de snake_case para que se aplique como predeterminado en todos sus proyectos?",
    options: {
      A: "En la raíz de cada proyecto como `.claude/CLAUDE.md`",
      B: "En `~/.claude/CLAUDE.md` — la ubicación a nivel de usuario que se aplica globalmente",
      C: "En el sistema `/etc/claude/CLAUDE.md` para aplicación a toda la máquina",
      D: "En la raíz de cada proyecto como `CLAUDE.md` (no dentro de .claude/)",
    },
    explanation:
      "~/.claude/CLAUDE.md es el CLAUDE.md a nivel de usuario que se aplica en todos los proyectos para el usuario actual. Es la ubicación correcta para preferencias personales que deben servir como predeterminadas independientemente del proyecto activo. Los archivos CLAUDE.md a nivel de proyecto en .claude/ anulan o extienden la configuración a nivel de usuario para ese proyecto específico. /etc/claude/ no es una ubicación soportada. CLAUDE.md en la raíz del proyecto es válido pero de alcance de proyecto.\n\nComo implementarlo:\n```bash\n# Create the user-level CLAUDE.md\nmkdir -p ~/.claude\ncat > ~/.claude/CLAUDE.md << 'EOF'\n# Personal Coding Preferences\n\n## Naming Conventions\n- Use snake_case for all variable and function names\n- Use PascalCase for classes and type names\n- Use SCREAMING_SNAKE_CASE for constants\n\n## Code Style\n- Prefer explicit types over `any`\n- Always add return type annotations to functions\nEOF\n\n# Project-level can override if needed:\n# .claude/CLAUDE.md in a specific project:\n# ## Naming Conventions\n# - Use camelCase (this project follows JS conventions)\n# This overrides the user-level snake_case preference for this project only\n```",
    keyConcept: "Jerarquía de CLAUDE.md: usuario (~/.claude/CLAUDE.md) para predeterminados personales",
  },

  "D3-002": {
    question:
      "Un monorepo grande tiene un `.claude/CLAUDE.md` raíz con directrices generales y un subdirectorio `services/payments/` con reglas de cumplimiento específicas para pagos. El equipo quiere que las reglas de cumplimiento solo se apliquen cuando Claude esté trabajando dentro de `services/payments/`. ¿Cómo deberían estructurar esto?",
    options: {
      A: 'Agregar las reglas de pagos al `.claude/CLAUDE.md` raíz con un comentario que diga "aplica solo a pagos"',
      B: "Crear `.claude/CLAUDE.md` dentro de `services/payments/` — Claude carga los archivos CLAUDE.md jerárquicamente por directorio",
      C: "Usar @import en el CLAUDE.md raíz para importar condicionalmente las reglas de pagos",
      D: "Crear un proyecto de Claude Code separado para el servicio de pagos",
    },
    explanation:
      "Claude carga los archivos CLAUDE.md jerárquicamente: aplica el nivel de usuario, luego la raíz del proyecto, luego los archivos CLAUDE.md de subdirectorios a medida que desciende en los directorios. Colocar un CLAUDE.md dentro de `services/payments/.claude/` asegura que esas reglas solo estén activas cuando Claude está operando en ese subárbol. Agregar todo al archivo raíz ignora el contexto (A). @import incluye archivos incondicionalmente (C). Crear un proyecto separado es excesivo (D).\n\nComo implementarlo:\n```\nmonorepo/\n├── .claude/\n│   └── CLAUDE.md          ← Root: general guidelines for all code\n├── services/\n│   ├── payments/\n│   │   ├── .claude/\n│   │   │   └── CLAUDE.md  ← Loaded ONLY when working in services/payments/\n│   │   └── src/\n│   └── inventory/\n│       └── src/\n```\n\n```markdown\n# services/payments/.claude/CLAUDE.md\n\n## PCI-DSS Compliance Rules\n- NEVER log card numbers, CVVs, or full PANs\n- All payment data must be encrypted at rest (AES-256)\n- Use the `mask_pan()` utility before displaying card numbers\n- All payment mutations require dual approval in production\n- Always import from `@payments/secure-utils`, never from `lodash` directly\n```",
    keyConcept: "Jerarquía a nivel de directorio de CLAUDE.md para reglas específicas del contexto",
  },

  "D3-003": {
    question:
      "El `.claude/CLAUDE.md` de un proyecto se está volviendo muy largo con secciones para directrices de pruebas, convenciones de API y reglas de seguridad. El equipo quiere dividirlo en archivos modulares. ¿Cuál es la sintaxis correcta para incluir un archivo de reglas de seguridad separado desde dentro de CLAUDE.md?",
    options: {
      A: "`#include .claude/rules/security.md`",
      B: "`@import .claude/rules/security.md`",
      C: "`!import rules/security.md`",
      D: "`{{.claude/rules/security.md}}`",
    },
    explanation:
      "@import es la sintaxis correcta de Claude Code para incluir archivos externos dentro de un CLAUDE.md. Esto permite la configuración modular donde cada preocupación (pruebas, seguridad, APIs) vive en su propio archivo y se compone junto. #include es una directiva del preprocesador de C, no la sintaxis de CLAUDE.md. !import y la sintaxis de doble llave no están soportadas. Usando @import, el equipo puede mantener cada archivo de reglas de forma independiente.\n\nComo implementarlo:\n```markdown\n# .claude/CLAUDE.md — main configuration file\n\n## Project Overview\nThis is the payments microservice. Follow all rules below.\n\n@import .claude/rules/testing.md\n@import .claude/rules/api-conventions.md\n@import .claude/rules/security.md\n@import .claude/rules/database.md\n```\n\n```markdown\n# .claude/rules/security.md\n\n## Security Rules\n- Never commit secrets or API keys\n- Always validate and sanitize user input\n- Use parameterized queries — never concatenate SQL strings\n- Run `npm audit` before each PR\n```\n\n```markdown\n# .claude/rules/testing.md\n\n## Testing Guidelines\n- Every new function needs a corresponding unit test\n- Use `describe/it` blocks, not `test()`\n- Mock external HTTP calls with `msw`\n```",
    keyConcept: "Sintaxis @import para composición modular de CLAUDE.md",
  },

  "D3-004": {
    question:
      "Necesitas que Claude Code realice una revisión de código en un pipeline de CI. El pipeline debe capturar la revisión estructurada de Claude como JSON para procesamiento posterior, y Claude no debería esperar entrada interactiva. ¿Qué combinación de flags logra esto?",
    options: {
      A: "`claude --interactive --format json`",
      B: '`claude -p "Revisa este código" --output-format json`',
      C: "`claude --batch --json-output`",
      D: "`claude --ci-mode --structured`",
    },
    explanation:
      "-p (--print) es el flag no interactivo que envía un solo prompt y sale, haciéndolo adecuado para pipelines de CI. --output-format json instruye a Claude para que genere en formato JSON para consumo por máquinas. Juntos proporcionan salida JSON no interactiva. --interactive es lo opuesto de lo que CI necesita. --batch y --ci-mode no son flags válidos de Claude Code.\n\nComo implementarlo:\n```yaml\n# .github/workflows/code-review.yml\njobs:\n  claude-review:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n\n      - name: Run Claude Code Review\n        env:\n          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}\n        run: |\n          # -p: non-interactive (single prompt, then exit)\n          # --output-format json: structured JSON output\n          claude -p \"Review the changed files for bugs and security issues. \\\n            Return findings as JSON with fields: severity, file, line, message.\" \\\n            --output-format json \\\n            > review-results.json\n\n      - name: Process review results\n        run: |\n          # Parse JSON output for downstream use\n          cat review-results.json | jq '.findings[] | select(.severity == \"high\")'\n\n      - name: Fail if high severity issues found\n        run: |\n          HIGH=$(cat review-results.json | jq '[.findings[] | select(.severity==\"high\")] | length')\n          if [ \"$HIGH\" -gt 0 ]; then exit 1; fi\n```",
    keyConcept: "Flag -p para uso no interactivo en CI, --output-format json para salida estructurada",
  },

  "D3-005": {
    question:
      "Un trabajo de CI usa Claude Code para validar contratos de API. El trabajo debe asegurar que Claude devuelva un esquema JSON específico que coincida con `{ \"valid\": boolean, \"violations\": string[] }`. ¿Qué flag obliga a que la salida JSON de Claude se ajuste a este esquema?",
    options: {
      A: "`--output-format json` solo garantiza la conformidad del esquema",
      B: "`--json-schema <archivo-esquema>` aplica la salida contra una definición de esquema JSON",
      C: "Incluir la definición del esquema en el prompt y pedir a Claude que lo siga",
      D: "`--structured-output <esquema>` valida la salida a nivel de la API de Claude",
    },
    explanation:
      "--json-schema acepta un archivo de esquema y restringe la salida JSON de Claude Code para que se ajuste a ese esquema. Esto proporciona conformidad de esquema aplicada por máquina en lugar de depender de la adherencia probabilística de Claude. --output-format json asegura el formato JSON pero no valida contra un esquema específico. Incluir el esquema en el prompt está basado en prompts (probabilístico). --structured-output no es un flag CLI válido de Claude Code.\n\nComo implementarlo:\n```bash\n# 1. Define the schema file\ncat > /tmp/contract-validation-schema.json << 'EOF'\n{\n  \"type\": \"object\",\n  \"required\": [\"valid\", \"violations\"],\n  \"properties\": {\n    \"valid\": { \"type\": \"boolean\" },\n    \"violations\": {\n      \"type\": \"array\",\n      \"items\": { \"type\": \"string\" }\n    }\n  },\n  \"additionalProperties\": false\n}\nEOF\n\n# 2. Run Claude Code with schema enforcement\nclaude -p \"Validate this OpenAPI contract for compliance: $(cat api-contract.yaml)\" \\\n  --output-format json \\\n  --json-schema /tmp/contract-validation-schema.json \\\n  > validation-result.json\n\n# 3. Output is guaranteed to match the schema\ncat validation-result.json\n# { \"valid\": false, \"violations\": [\"Missing required field 'operationId' on POST /users\"] }\n```",
    keyConcept: "Flag --json-schema para aplicar la conformidad del esquema de salida en CI",
  },

  "D3-006": {
    question:
      "Tu proyecto tiene un comando slash personalizado `/generate-component` que construye componentes React siguiendo las convenciones del proyecto. Quieres que este comando esté disponible para todos en el equipo. ¿Dónde debe colocarse el archivo de definición del comando?",
    options: {
      A: "`~/.claude/commands/generate-component.md` — en el directorio home de cada desarrollador",
      B: "`.claude/commands/generate-component.md` — en el repositorio del proyecto, confirmado en git",
      C: "`.claude/skills/generate-component/SKILL.md` — como una skill en lugar de un comando",
      D: "`CLAUDE.md` — incrustar las definiciones de comandos directamente en el archivo de configuración principal",
    },
    explanation:
      ".claude/commands/ en la raíz del proyecto es la ubicación para comandos slash de alcance de proyecto que deben compartirse con el equipo a través del control de versiones. ~/.claude/commands/ es para comandos personales que se aplican al desarrollador individual en todos sus proyectos. Las skills (SKILL.md) son para comportamientos agénticos reutilizables con configuraciones específicas de contexto y herramientas, no simples comandos. Incrustar en CLAUDE.md no es el mecanismo correcto para las definiciones de comandos slash.\n\nComo implementarlo:\n```\n# File: .claude/commands/generate-component.md\n# This file defines the /generate-component slash command\n# Committed to git — available to all team members\n```\n\n```markdown\n# .claude/commands/generate-component.md\n\nGenerate a React component following project conventions.\n\nArguments: $COMPONENT_NAME $COMPONENT_TYPE (functional|class)\n\nSteps:\n1. Create `src/components/$COMPONENT_NAME/$COMPONENT_NAME.tsx`\n2. Create `src/components/$COMPONENT_NAME/$COMPONENT_NAME.test.tsx`\n3. Create `src/components/$COMPONENT_NAME/index.ts` (barrel export)\n4. Follow the component template in `.claude/templates/component.tsx`\n5. Add proper TypeScript props interface\n6. Export from `src/components/index.ts`\n```\n\n```bash\n# Usage in Claude Code:\n/generate-component UserProfile functional\n```",
    keyConcept: ".claude/commands/ (proyecto) vs ~/.claude/commands/ (personal) para comandos slash",
  },

  "D3-007": {
    question:
      "Estás creando una skill para Claude Code que realiza una auditoría de seguridad de módulos de autenticación. La skill necesita su propio contexto aislado (no el historial de conversación de la sesión principal), acceso solo a las herramientas Read y Grep, y debería aceptar una ruta de módulo objetivo como argumento. ¿Qué campos de configuración de SKILL.md habilitan esto?",
    options: {
      A: "`context: shared`, `allowed-tools: [Read, Grep, Bash]`, `argument-hint: <target-module>`",
      B: "`context: fork`, `allowed-tools: [Read, Grep]`, `argument-hint: <module-path>`",
      C: "`context: new`, `tools: [Read, Grep]`, `args: <module-path>`",
      D: "`isolation: true`, `allowed-tools: [Read, Grep]`, `parameter: <module-path>`",
    },
    explanation:
      "`context: fork` crea un contexto aislado ramificado desde la sesión actual, evitando que la skill contamine o lea la conversación principal. `allowed-tools: [Read, Grep]` limita la skill solo a las herramientas que necesita. `argument-hint: <module-path>` proporciona la pista que se muestra al invocar la skill. La opción A incluye Bash (riesgo de seguridad innecesario) y usa `context: shared` (rompe el aislamiento). Las opciones C y D usan nombres de campos inexistentes.\n\nComo implementarlo:\n```markdown\n---\ncontext: fork\nallowed-tools:\n  - Read\n  - Grep\nargument-hint: <module-path>\n---\n\n# Security Audit Skill\n\nPerform a security audit on the authentication module at `$ARGUMENTS`.\n\nCheck for:\n1. Hard-coded credentials or secrets (grep for password=, secret=, api_key=)\n2. SQL injection vulnerabilities (unparameterized queries)\n3. Missing input validation on user-controlled fields\n4. Insecure token storage patterns\n5. Missing rate limiting on auth endpoints\n6. Weak password hashing (MD5, SHA1 without salt)\n\nFor each finding, report:\n- File path and line number\n- Vulnerability type\n- Severity: critical/high/medium/low\n- Recommended fix\n```\n\n```bash\n# Usage: invoke the skill with the module path as argument\n/security-audit src/auth/\n```",
    keyConcept: "Configuración de SKILL.md: fork de contexto, allowed-tools y argument-hint",
  },

  "D3-008": {
    question:
      "Un desarrollador está a punto de pedirle a Claude Code que refactorice un módulo de autenticación crítico. Antes de que Claude realice cualquier cambio, el desarrollador quiere ver el plan de Claude y aprobarlo. ¿Qué modo debería activar?",
    options: {
      A: "Modo de ejecución directa — Claude ejecuta de inmediato y explica después",
      B: "Modo de planificación — Claude presenta un plan detallado para su revisión y aprobación antes de ejecutar cualquier acción",
      C: "Modo de prueba — Claude simula cambios sin escribir archivos",
      D: "Modo de revisión — Claude genera un informe pero requiere un comando de ejecución separado",
    },
    explanation:
      'El modo de planificación es la función de Claude Code que hace que presente un plan paso a paso de lo que pretende hacer y espere la aprobación humana antes de ejecutar cualquier modificación de archivos. Esta es la compuerta de seguridad apropiada para operaciones sensibles como la refactorización de autenticación. El modo de ejecución directa realiza cambios de inmediato (A). El "modo de prueba" y el "modo de revisión" no son funciones nombradas de Claude Code; el modo de planificación es el término correcto.\n\nComo implementarlo:\n```bash\n# Activate plan mode before sensitive operations\nclaude --plan \"Refactor the authentication module in src/auth/ to use JWT instead of sessions\"\n\n# Claude will output something like:\n# PLAN:\n# 1. Read src/auth/session.ts to understand current implementation\n# 2. Read src/auth/middleware.ts to identify session checks\n# 3. Install jsonwebtoken package\n# 4. Create src/auth/jwt.ts with token generation/validation\n# 5. Update src/auth/middleware.ts to validate JWTs instead of sessions\n# 6. Update src/auth/login.ts to return JWT on successful login\n# 7. Update src/auth/logout.ts to invalidate tokens\n# 8. Update tests in src/auth/__tests__/\n#\n# Proceed? (y/n)\n\n# Only after developer types \'y\' does Claude begin executing\n```\n\n```markdown\n# You can also set plan mode in CLAUDE.md to always require approval:\n## Workflow\n- Always use plan mode before modifying files in src/auth/ or src/payments/\n```',
    keyConcept: "Modo de planificación para aprobación humana antes de la ejecución",
  },

  "D3-009": {
    question:
      "Tu pipeline de CI usa Claude Code para generar casos de prueba para nuevo código, luego en un paso separado usa Claude Code para revisar esos casos de prueba. Quieres que el paso de revisión no tenga memoria del razonamiento del paso de generación. ¿Cómo implementas este aislamiento de contexto?",
    options: {
      A: "Usar --resume con un ID de sesión en blanco para comenzar desde cero",
      B: "Pasar el archivo de pruebas generado como entrada a una nueva sesión de Claude Code iniciada con -p; cada invocación de -p es una sesión fresca sin contexto previo",
      C: 'Limpiar el contexto enviando un mensaje "olvidar lo anterior" antes del prompt de revisión',
      D: "Usar --no-cache para evitar que Claude acceda a respuestas anteriores",
    },
    explanation:
      "Cada invocación de `claude -p` inicia una sesión completamente nueva sin historial de conversación, proporcionando verdadero aislamiento de contexto. La sesión de revisión no puede acceder al razonamiento de la sesión de generación porque son procesos separados con contextos separados. --resume con cualquier ID de sesión restaura una sesión anterior (A). Las instrucciones de \"olvidar lo anterior\" están basadas en prompts y no son confiables (C). --no-cache no es un flag válido de Claude Code y no lograría el aislamiento de sesión (D).\n\nComo implementarlo:\n```yaml\n# .github/workflows/test-generation-and-review.yml\njobs:\n  generate-and-review:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n\n      # Step 1: Generate tests (fresh session via -p)\n      - name: Generate test cases\n        run: |\n          claude -p \"Generate comprehensive unit tests for src/payments/refund.ts. \\\n            Save tests to src/payments/__tests__/refund.test.ts\" \\\n            --output-format json > generation-log.json\n        # Session ends here — no state carries over\n\n      # Step 2: Review tests (completely NEW session via -p)\n      - name: Review generated tests\n        run: |\n          # -p starts a FRESH session with no knowledge of generation step\n          # The review only sees the test FILE, not generation reasoning\n          claude -p \"Review the test file at src/payments/__tests__/refund.test.ts. \\\n            Check for: missing edge cases, incorrect assertions, missing error scenarios. \\\n            Return findings as JSON.\" \\\n            --output-format json > review-results.json\n        # Truly independent review — no generation bias\n```",
    keyConcept: "Aislamiento de contexto de sesión usando invocaciones -p separadas para revisión vs generación",
  },

  "D3-010": {
    question:
      "Quieres que Claude Code mejore iterativamente una función usando un enfoque orientado a pruebas: escribir pruebas primero, luego implementar hasta que las pruebas pasen, y luego refinar. ¿Qué patrón de flujo de trabajo describe mejor esto?",
    options: {
      A: "Patrón de entrevista — Claude hace preguntas aclaratorias al desarrollador antes de escribir código",
      B: "Iteración orientada a pruebas — proporcionar pruebas fallidas como especificación, hacer que Claude implemente hasta que pasen las pruebas, luego refinar",
      C: "Patrón de ejemplos I/O — proporcionar pares de entrada-salida como especificaciones para la generación de código",
      D: "Generación de un solo disparo — escribir la especificación completa de antemano y generar todo el código de una vez",
    },
    explanation:
      "La iteración orientada a pruebas es un patrón de refinamiento iterativo donde las pruebas fallidas sirven como especificación. Claude implementa código, ejecuta pruebas, observa fallos y revisa hasta que todas las pruebas pasen. Esto crea un bucle de retroalimentación que converge en el comportamiento correcto. El patrón de entrevista es para reunir requisitos (A). Los ejemplos I/O especifican el comportamiento a través de pares de datos (C) — útil pero no lo mismo que ejecutar pruebas. De un solo disparo no tiene bucle de retroalimentación iterativo (D).\n\nComo implementarlo:\n```bash\n# Step 1: Write the failing tests first (specification)\ncat > src/utils/formatPrice.test.ts << 'EOF'\ndescribe('formatPrice', () => {\n  it('formats integer cents to dollar string', () => {\n    expect(formatPrice(1999)).toBe('$19.99');\n  });\n  it('handles zero', () => {\n    expect(formatPrice(0)).toBe('$0.00');\n  });\n  it('handles negative (refund)', () => {\n    expect(formatPrice(-500)).toBe('-$5.00');\n  });\n});\nEOF\n\n# Step 2: Ask Claude to implement until tests pass\nclaude \"Implement formatPrice(cents: number): string in src/utils/formatPrice.ts.\nThe tests in src/utils/formatPrice.test.ts define the expected behavior.\nRun the tests with 'npm test formatPrice' and iterate until all tests pass.\"\n\n# Claude will:\n# 1. Read the test file\n# 2. Implement the function\n# 3. Run npm test\n# 4. See failures, revise implementation\n# 5. Repeat until all tests pass\n```",
    keyConcept: "Iteración orientada a pruebas como flujo de trabajo de refinamiento iterativo",
  },

  "D3-011": {
    question:
      "Tu proyecto tiene un directorio `.claude/rules/`. Quieres que un archivo de reglas `api-versioning.yaml` solo se cargue cuando Claude esté trabajando en el subdirectorio `src/api/`. ¿Qué mecanismo habilita esta carga condicional?",
    options: {
      A: "YAML frontmatter en el archivo de reglas con una clave `paths:` especificando `src/api/**`",
      B: "Una declaración @import en el CLAUDE.md del proyecto con una expresión condicional",
      C: "Un archivo `.claudeignore` que excluye la regla cuando no está en el directorio de API",
      D: 'Nombrar el archivo `api-versioning.api.yaml` — el patrón de extensión activa la carga basada en directorio',
    },
    explanation:
      "El YAML frontmatter en los archivos `.claude/rules/` soporta una clave `paths:` que especifica patrones glob. Cuando Claude está operando en una ruta que coincide con el patrón (como `src/api/**`), la regla se carga; de lo contrario se ignora. Este es el mecanismo integrado para la carga condicional de reglas. @import incluye archivos incondicionalmente. .claudeignore controla qué archivos del proyecto puede ver Claude, no la carga de reglas. Las convenciones de nombres de archivos no controlan la activación de reglas.\n\nComo implementarlo:\n```yaml\n# .claude/rules/api-versioning.yaml\n---\npaths:\n  - src/api/**          # Only loaded when working in src/api/\n  - src/api-gateway/**  # Also applies to the gateway module\n---\n\n# API Versioning Rules\n\n## Versioning Requirements\n- All new endpoints must include an API version prefix: /v1/, /v2/\n- Never remove fields from existing response schemas (additive only)\n- Deprecated endpoints must return a Deprecation header with sunset date\n- Version negotiation via Accept header is required for v3+\n\n## Breaking Change Policy\n- Any breaking change requires a new version number\n- Maintain backward compatibility for N-1 versions minimum\n```\n\n```yaml\n# .claude/rules/database.yaml\n---\npaths:\n  - src/db/**\n  - src/migrations/**\n---\n# Database rules — only loaded in db/migrations directories\n```",
    keyConcept: ".claude/rules/ con YAML frontmatter paths para carga condicional de reglas",
  },

  "D3-012": {
    question:
      "Un desarrollador quiere que Claude Code entienda la forma exacta de los datos que devuelve su API antes de generar un analizador. En lugar de una larga descripción en prosa, quieren mostrarle a Claude cómo se ve la entrada y cómo debería verse la salida. ¿Qué patrón de refinamiento iterativo es más apropiado?",
    options: {
      A: "Iteración orientada a pruebas — escribir pruebas unitarias para el analizador y dejar que Claude implemente",
      B: "Patrón de ejemplos I/O — proporcionar muestras JSON concretas de entrada y estructuras de salida esperadas como especificación",
      C: "Patrón de entrevista — hacer que Claude haga preguntas sobre el esquema de la API",
      D: "Prompt chaining — primero describir la API en prosa, luego generar el analizador en un segundo prompt",
    },
    explanation:
      "El patrón de ejemplos I/O es ideal cuando puedes demostrar la transformación con datos concretos. Mostrarle a Claude respuestas de API de muestra (entrada) y la estructura analizada deseada (salida) elimina la ambigüedad y le proporciona una especificación precisa con la que trabajar. La iteración orientada a pruebas requiere escribir código de prueba, lo cual puede ser prematuro. El patrón de entrevista es para la recopilación de requisitos. El prompt chaining resuelve un problema diferente (pipelines de múltiples pasos).\n\nComo implementarlo:\n```typescript\n// Prompt using the I/O examples pattern:\nconst prompt = `\nGenerate a TypeScript parser function for this API response.\n\nINPUT (raw API response):\n${JSON.stringify({\n  \"product_id\": \"SKU-123\",\n  \"product_name\": \"Blue Widget\",\n  \"price_cents\": 1999,\n  \"in_stock\": true,\n  \"tags\": [\"electronics\", \"widgets\"],\n  \"created_at\": \"2024-01-15T10:30:00Z\"\n}, null, 2)}\n\nEXPECTED OUTPUT (parsed structure):\n${JSON.stringify({\n  id: \"SKU-123\",\n  name: \"Blue Widget\",\n  priceUsd: 19.99,\n  available: true,\n  categories: [\"electronics\", \"widgets\"],\n  createdAt: new Date(\"2024-01-15T10:30:00Z\")\n}, null, 2)}\n\nThe parser should handle:\n- snake_case to camelCase conversion\n- cents to dollars conversion\n- ISO string to Date object conversion\n- Array field renaming (tags -> categories)\n`;\n```",
    keyConcept: "Patrón de ejemplos I/O para especificación mediante datos concretos",
  },

  "D4-001": {
    question:
      "Estás construyendo un sistema de revisión de contratos. Tu prompt actual dice: \"Revisa este contrato e identifica cualquier problema.\" La salida es inconsistente — a veces una lista de puntos, a veces prosa, a veces nada. ¿Cuál es el cambio más efectivo al prompt?",
    options: {
      A: 'Agregar "Sé exhaustivo" al prompt para fomentar una salida más completa',
      B: 'Reemplazar con criterios explícitos: "Identifica cláusulas que: (1) limiten la responsabilidad más allá de $10k, (2) incluyan renovación automática, (3) restrinjan la propiedad de PI. Para cada hallazgo, indica el número de cláusula, el texto exacto y por qué está marcado."',
      C: "Agregar ejemplos few-shot de buenas revisiones al prompt",
      D: "Aumentar la temperatura para obtener salidas más diversas y luego filtrar",
    },
    explanation:
      'Los criterios explícitos y medibles producen salidas consistentes porque le dicen a Claude exactamente qué buscar y cómo estructurar cada hallazgo. Las instrucciones vagas como "identificar cualquier problema" o "ser exhaustivo" dejan demasiado a la interpretación. Los ejemplos few-shot (C) ayudan con la consistencia del formato pero no definen qué buscar. Aumentar la temperatura (D) aumenta la variabilidad, lo que empeora la consistencia, no la mejora.\n\nComo implementarlo:\n```typescript\nconst systemPrompt = `You are a contract review specialist.\nFor each contract provided, identify clauses that meet ANY of these criteria:\n1. Limit liability below $10,000\n2. Include automatic renewal without explicit opt-out\n3. Restrict the client\'s ownership of IP created during the engagement\n\nFor EACH finding, output exactly:\n- Clause number (e.g., \"Section 8.2\")\n- Exact quoted text from the contract\n- Which criterion it triggers (1, 2, or 3 from above)\n- Risk level: HIGH / MEDIUM / LOW\n- Recommended action\n\nIf no clauses match the criteria, output: \"No flagged clauses found.\"`;\n\nconst response = await anthropic.messages.create({\n  model: \"claude-opus-4-5\",\n  system: systemPrompt,\n  messages: [{ role: \"user\", content: `Review this contract:\\n\\n${contractText}` }],\n  max_tokens: 2048,\n});\n```',
    keyConcept: "Criterios explícitos sobre instrucciones vagas para salidas de revisión consistentes",
  },

  "D4-002": {
    question:
      "Estás extrayendo atributos de productos de descripciones de comercio electrónico. Tu prompt con instrucciones solo produce formato inconsistente: a veces `color: azul`, a veces `Color: Azul`, a veces `colour: blue`. ¿Qué técnica soluciona más confiablemente la inconsistencia de formato?",
    options: {
      A: 'Agregar "Usa nombres de campos en minúsculas consistentes" a las instrucciones del prompt',
      B: "Proporcionar 3-5 ejemplos few-shot que demuestren el formato de salida exacto que quieres",
      C: "Usar tool_use con un esquema JSON para aplicar la estructura de salida de forma programática",
      D: "Post-procesar la salida con un paso de normalización mediante regex",
    },
    explanation:
      "Usar tool_use con un esquema JSON proporciona conformidad estructural garantizada — el modelo debe producir una salida que coincida con el esquema, eliminando completamente la variabilidad de formato. Los ejemplos few-shot (B) mejoran significativamente la consistencia pero siguen siendo probabilísticos. Las instrucciones del prompt (A) son la forma más débil — el modelo puede no seguirlas perfectamente. El post-procesamiento (D) es una solución alternativa, no una solución, y puede omitir casos extremos. Para garantizar la estructura, tool_use con esquema es superior.\n\nComo implementarlo:\n```typescript\nconst response = await anthropic.messages.create({\n  model: \"claude-opus-4-5\",\n  tools: [\n    {\n      name: \"extract_product_attributes\",\n      description: \"Extracts structured product attributes from a description\",\n      input_schema: {\n        type: \"object\",\n        properties: {\n          // Schema enforces lowercase field names and specific types\n          color: { type: \"string\", description: \"Product color in lowercase (e.g., 'blue', 'red')\" },\n          size: { type: \"string\", enum: [\"xs\", \"s\", \"m\", \"l\", \"xl\", \"xxl\"] },\n          material: { type: \"string\" },\n          price_usd: { type: \"number\" },\n          brand: { type: \"string\" },\n        },\n        required: [\"color\", \"size\", \"material\"],\n      },\n    },\n  ],\n  tool_choice: { type: \"tool\", name: \"extract_product_attributes\" },\n  messages: [{ role: \"user\", content: `Extract attributes from: ${productDescription}` }],\n  max_tokens: 1024,\n});\n// Schema guarantees: always lowercase 'color', always valid size enum, etc.\nconst attrs = response.content[0].input;\n```",
    keyConcept: "tool_use con esquema JSON para salida estructurada garantizada",
  },

  "D4-003": {
    question:
      "Estás diseñando un esquema JSON para extraer reseñas de productos. Algunos productos tienen garantía, otros no. El campo `warrantyMonths` debe incluirse cuando esté presente y omitirse cuando esté ausente. ¿Cómo debe modelarse esto?",
    options: {
      A: "Hacer `warrantyMonths` obligatorio con un valor predeterminado de 0 cuando esté ausente",
      B: "Hacer `warrantyMonths` un campo obligatorio con tipo `integer | null`, siempre presente pero que admita nulos",
      C: "Hacer `warrantyMonths` un campo opcional (no en el array requerido) con tipo `integer`",
      D: 'Usar un campo string `hasWarranty: "yes" | "no"` en lugar de un entero que admita nulos',
    },
    explanation:
      "Hacer `warrantyMonths` opcional (ausente del array `required` en el esquema JSON) permite que esté presente cuando existan datos y omitirlo cuando no. Esto produce datos más limpios que incluir siempre null. La opción B (campo obligatorio que admite nulos) también es válida pero obliga a que el campo siempre aparezca. El valor predeterminado 0 de la opción A confunde \"sin garantía\" con \"desconocido\". La opción D pierde la seguridad de tipo y la información de duración.\n\nComo implementarlo:\n```typescript\nconst productReviewSchema = {\n  type: \"object\",\n  properties: {\n    productName: { type: \"string\" },\n    rating: { type: \"integer\", minimum: 1, maximum: 5 },\n    reviewText: { type: \"string\" },\n    // Optional field — omitted when no warranty info in the review\n    warrantyMonths: {\n      type: \"integer\",\n      minimum: 0,\n      description: \"Warranty duration in months. Omit entirely if no warranty mentioned.\",\n    },\n    // Optional field — omitted if not mentioned\n    verifiedPurchase: { type: \"boolean\" },\n  },\n  // warrantyMonths is NOT in required — it can be absent\n  required: [\"productName\", \"rating\", \"reviewText\"],\n};\n\n// With warranty:    { productName: \"Widget\", rating: 4, reviewText: \"...\", warrantyMonths: 24 }\n// Without warranty: { productName: \"Widget\", rating: 4, reviewText: \"...\" }\n// vs. nullable approach (always present):\n//                   { productName: \"Widget\", rating: 4, reviewText: \"...\", warrantyMonths: null }\n```",
    keyConcept: "Diseño de esquema: campos obligatorios vs opcionales para datos condicionales",
  },

  "D4-004": {
    question:
      "Estás extrayendo categorías de productos del texto. La mayoría de los productos caen en un conjunto conocido: \"Electronics\", \"Clothing\", \"Books\", \"Home\". Pero algunos productos no encajan. ¿Cómo deberías modelar el campo de categoría para manejar ambos casos de forma confiable?",
    options: {
      A: 'Usar `type: "string"` sin restricciones y depender de que Claude elija de la lista',
      B: 'Usar un enum: `["Electronics", "Clothing", "Books", "Home"]` y aceptar que las categorías desconocidas fallarán la validación',
      C: 'Usar enum: `["Electronics", "Clothing", "Books", "Home", "other"]` combinado con un campo opcional `categoryDetail: string` para cuando se seleccione "other"',
      D: 'Usar `type: "string"` y agregar un campo booleano separado `isKnownCategory`',
    },
    explanation:
      'El patrón "other" + detalle es una buena práctica para la extracción categórica abierta. Preserva el beneficio de un enum restringido (habilitando filtrado y agrupación en categorías conocidas) mientras permite el manejo elegante de desconocidos a través del campo de detalle. El enum puro sin "other" (B) falla con desconocidos válidos. La cadena sin restricciones (A) pierde los beneficios de legibilidad por máquina del enum. El enfoque booleano + cadena (D) duplica la lógica y es más difícil de usar en flujos posteriores.\n\nComo implementarlo:\n```typescript\nconst categorySchema = {\n  type: \"object\",\n  properties: {\n    productName: { type: \"string\" },\n    category: {\n      type: \"string\",\n      // Known categories as enum values + escape hatch\n      enum: [\"Electronics\", \"Clothing\", \"Books\", \"Home\", \"other\"],\n      description: \"Primary product category. Use \'other\' if none of the known categories fit.\",\n    },\n    // Optional — only populated when category === \'other\'\n    categoryDetail: {\n      type: \"string\",\n      description: \"Specific category name when \'other\' is selected. E.g., \'Sporting Goods\', \'Automotive\'\",\n    },\n  },\n  required: [\"productName\", \"category\"],\n};\n\n// Usage in downstream processing:\nfunction displayCategory(product: Product): string {\n  if (product.category === \"other\") {\n    return product.categoryDetail ?? \"Uncategorized\";\n  }\n  return product.category; // Always one of the known enum values\n}\n\n// Filter known categories efficiently:\nconst electronics = products.filter(p => p.category === \"Electronics\");\nconst unknowns = products.filter(p => p.category === \"other\");\n```',
    keyConcept: "Diseño de esquema: enum con campo 'other' + detalle para categorías abiertas",
  },

  "D4-005": {
    question:
      "Tu pipeline de extracción ocasionalmente produce JSON donde Claude alucina un campo `price` como `\"free\"` (una cadena) en lugar de `0` (un número) para productos sin costo. Tienes un validador de esquema JSON en tu pipeline. ¿Cuál es la estrategia de reintento correcta cuando falla la validación?",
    options: {
      A: "Reintentar con el prompt original — el modelo puede producir una respuesta válida en el segundo intento",
      B: "Reintentar con retroalimentación de error: incluir la salida original, el mensaje de error de validación, e instruir a Claude que corrija solo el campo fallido",
      C: "Post-procesar la salida: detectar precios en cadena y convertirlos a números",
      D: "Bajar la temperatura a 0 para evitar que ocurra la alucinación",
    },
    explanation:
      'El reintento con retroalimentación de error es el patrón correcto de bucle de validación-reintento. Al incluir el error de validación exacto ("price debe ser un número, se obtuvo la cadena \'free\'") en el prompt de reintento, Claude tiene información precisa para corregir el campo específico sin regenerar todo. Reintentar con el mismo prompt (A) es probabilístico y desperdicia tokens. El post-procesamiento (C) es una solución alternativa que puede omitir casos. La temperatura 0 reduce la aleatoriedad pero no previene todos los errores de formato, especialmente para casos extremos como "free".\n\nComo implementarlo:\n```typescript\nasync function extractWithRetry(text: string, schema: object, maxRetries = 2) {\n  let lastOutput: string | null = null;\n  let lastError: string | null = null;\n\n  for (let attempt = 0; attempt <= maxRetries; attempt++) {\n    // Build messages: on retry, include the error feedback\n    const userMessage = attempt === 0\n      ? `Extract product data from: ${text}`\n      : `Your previous extraction had a validation error. Please fix it.\n\nYour previous output:\n${lastOutput}\n\nValidation error: ${lastError}\n\nPlease return corrected JSON fixing ONLY the invalid field(s).`;\n\n    const response = await anthropic.messages.create({\n      model: \"claude-opus-4-5\",\n      tools: [{ name: \"extract\", input_schema: schema }],\n      tool_choice: { type: \"tool\", name: \"extract\" },\n      messages: [{ role: \"user\", content: userMessage }],\n      max_tokens: 1024,\n    });\n\n    const output = response.content[0].input;\n    const validation = validateAgainstSchema(output, schema);\n\n    if (validation.valid) return output;\n\n    lastOutput = JSON.stringify(output, null, 2);\n    lastError = validation.errors[0].message; // e.g., \"price must be number, got string\"\n  }\n\n  throw new Error(`Extraction failed after ${maxRetries} retries: ${lastError}`);\n}\n```',
    keyConcept: "Bucles de validación-reintento con retroalimentación de error para corrección de salida estructurada",
  },

  "D4-006": {
    question:
      "Tu pipeline de CI necesita ejecutar revisiones de código basadas en Claude en 500 archivos durante la noche. El costo es una preocupación pero la latencia no — los resultados deben estar listos para la mañana siguiente. ¿Qué función de la API reduce el costo en un 50% para este caso de uso?",
    options: {
      A: "Prompt caching — almacenar en caché el system prompt para reducir los costos de tokens de entrada",
      B: "Message Batches API — enviar todas las revisiones como un lote para una reducción de costos del 50%, con resultados disponibles en 24 horas",
      C: "Streaming API — transmitir respuestas para reducir el tiempo hasta el primer token y los costos de latencia generales",
      D: "Llamadas API paralelas — ejecutar 50 solicitudes simultáneas para reducir el tiempo total",
    },
    explanation:
      "La Message Batches API proporciona una reducción de costos del 50% al procesar solicitudes de forma asíncrona dentro de una ventana de 24 horas, lo que la hace ideal para cargas de trabajo masivas donde no se necesita respuesta en tiempo real. El prompt caching reduce los costos para system prompts repetidos pero no en un 50% en todos los tokens. El streaming reduce la latencia, no el costo. Las solicitudes paralelas alcanzan límites de tasa y no reducen el costo por token.\n\nComo implementarlo:\n```typescript\nimport Anthropic from \"@anthropic-ai/sdk\";\nconst anthropic = new Anthropic();\n\n// Step 1: Create the batch with all 500 file reviews\nconst batch = await anthropic.beta.messages.batches.create({\n  requests: files.map((file, i) => ({\n    custom_id: `review-${file.name}-${i}`,\n    params: {\n      model: \"claude-opus-4-5\",\n      max_tokens: 1024,\n      system: \"You are a code reviewer. Identify bugs, security issues, and style violations.\",\n      messages: [{\n        role: \"user\",\n        content: `Review this file:\\n\\n${file.content}`,\n      }],\n    },\n  })),\n});\n\nconsole.log(`Batch created: ${batch.id}`);\n// 50% cheaper than 500 individual API calls\n\n// Step 2: Poll until complete (up to 24 hours)\nasync function waitForBatch(batchId: string) {\n  while (true) {\n    const status = await anthropic.beta.messages.batches.retrieve(batchId);\n    if (status.processing_status === \"ended\") break;\n    await new Promise(r => setTimeout(r, 60_000)); // poll every minute\n  }\n  return anthropic.beta.messages.batches.results(batchId);\n}\n```",
    keyConcept: "Message Batches API: reducción de costos del 50% para procesamiento masivo no en tiempo real",
  },

  "D4-007": {
    question:
      "Tu equipo envía 500 solicitudes de revisión de código a través de la Message Batches API. Un revisor pregunta: \"¿Podemos usar tool_use en el lote para obtener revisiones JSON estructuradas?\" Otro dice que las llamadas a herramientas no están soportadas en el modo batch. ¿Quién tiene razón?",
    options: {
      A: "El primer revisor — tool_use funciona de manera idéntica en los modos batch y en tiempo real",
      B: "El segundo revisor — la Message Batches API no soporta llamadas a herramientas; usa modo JSON o salida estructurada basada en prompts en su lugar",
      C: "Ambos tienen razón parcialmente — las definiciones de herramientas pueden incluirse pero la ejecución de herramientas se difiere",
      D: "Ninguno — el modo batch solo soporta respuestas de texto plano, no datos estructurados en absoluto",
    },
    explanation:
      "La Message Batches API no soporta llamadas a herramientas. Para salida estructurada en modo batch, debes usar enfoques alternativos: JSON basado en prompts (pidiendo a Claude que genere JSON directamente) o modo JSON si está disponible. La ejecución de herramientas requiere un bucle agéntico en tiempo real, que es incompatible con el modelo batch asíncrono. La opción A es incorrecta. La opción C tergiversa el comportamiento. La opción D es demasiado restrictiva — la salida JSON estructurada a través de prompts es posible, solo que no mediante tool_use.\n\nComo implementarlo:\n```typescript\n// WRONG: tool_use is not supported in batch mode\n// const badBatchRequest = {\n//   custom_id: \"review-1\",\n//   params: {\n//     tools: [analyzeCodeTool],       // ← NOT supported\n//     tool_choice: { type: \"tool\" },  // ← NOT supported\n//     ...\n//   }\n// };\n\n// CORRECT: Use prompt-based JSON instead\nconst batchRequest = {\n  custom_id: \"review-file-1\",\n  params: {\n    model: \"claude-opus-4-5\",\n    max_tokens: 1024,\n    system: `You are a code reviewer. Always respond with valid JSON only.\nSchema: { \"bugs\": string[], \"security\": string[], \"style\": string[], \"score\": number }`,\n    messages: [{\n      role: \"user\",\n      content: `Review and return JSON:\\n\\n${fileContent}`,\n    }],\n    // No tools field — use prompt to enforce JSON structure\n  },\n};\n\n// Parse and validate the JSON response after batch completes\nconst result = JSON.parse(batchResult.message.content[0].text);\n```",
    keyConcept: "Message Batches API: sin llamadas a herramientas; usar salida estructurada basada en prompts",
  },

  "D4-008": {
    question:
      "Un pipeline de revisión de código envía cada archivo a Claude individualmente, luego recibe 50 revisiones separadas. Los revisores se quejan de que Claude omite problemas entre archivos como dependencias circulares e inconsistencias arquitectónicas. ¿Cómo debe reestructurarse el pipeline?",
    options: {
      A: "Enviar los 50 archivos en un solo prompt para que Claude pueda revisarlos todos a la vez",
      B: "Usar una revisión de múltiples pasadas: la primera pasada hace revisiones locales por archivo; la segunda pasada envía resúmenes de todos los archivos más los hallazgos por archivo para identificar problemas de integración entre archivos",
      C: "Pedir a cada revisión por archivo que también busque problemas entre archivos incluyendo toda la base de código como contexto",
      D: "Ejecutar tres revisiones de un solo archivo por archivo y votar los hallazgos",
    },
    explanation:
      "La revisión de múltiples pasadas es el patrón correcto: la primera pasada maneja eficientemente los problemas locales de alcance de archivo. La segunda pasada se enfoca específicamente en los problemas de integración usando las salidas de la primera pasada — puede ver patrones en todos los archivos sin necesitar releer todo el código fuente. Enviar los 50 archivos a la vez (A) puede exceder los límites de contexto y es poco enfocado. Agregar instrucciones de revisión entre archivos a cada revisión por archivo (C) escala mal y produce análisis redundante entre archivos. La votación (D) no resuelve el problema de visibilidad entre archivos.\n\nComo implementarlo:\n```typescript\nasync function multiPassCodeReview(files: SourceFile[]) {\n  // Pass 1: Per-file local reviews (can run in parallel)\n  const localReviews = await Promise.all(\n    files.map(file => reviewFile(file))\n  );\n\n  // Compile summaries from pass 1 (not full source)\n  const fileSummaries = localReviews.map((review, i) => ({\n    file: files[i].path,\n    exports: review.exports,\n    imports: review.imports,\n    localIssues: review.issues,\n  }));\n\n  // Pass 2: Cross-file integration review\n  // Only sends summaries (~5% of original token count)\n  const crossFileReview = await anthropic.messages.create({\n    model: \"claude-opus-4-5\",\n    system: \"You are an architecture reviewer. Analyze cross-file issues.\",\n    messages: [{\n      role: \"user\",\n      content: `Analyze these file summaries for cross-file issues:\\n` +\n               `- Circular dependencies\\n` +\n               `- Architecture violations\\n` +\n               `- Inconsistent error handling patterns\\n\\n` +\n               `File summaries:\\n${JSON.stringify(fileSummaries, null, 2)}`,\n    }],\n    max_tokens: 4096,\n  });\n\n  return { localReviews, crossFileIssues: crossFileReview };\n}\n```",
    keyConcept: "Revisión de múltiples pasadas: pasada local por archivo + pasada de integración entre archivos",
  },

  "D4-009": {
    question:
      "Un desarrollador envía una revisión de código y le pide a Claude que la revise en la misma sesión donde se generó el código. La revisión vuelve inusualmente indulgente, omitiendo los mismos errores que Claude acaba de escribir. ¿Cuál es la causa más probable?",
    options: {
      A: "Claude está sesgado hacia el código que generó porque fue entrenado para preferir su propia salida",
      B: "La auto-revisión en la misma sesión retiene el contexto de razonamiento de la generación, lo que hace que Claude reproduzca los mismos puntos ciegos en lugar de abordar el código de forma fresca",
      C: "El prompt de revisión de código no fue lo suficientemente específico sobre qué buscar",
      D: "La temperatura del modelo era demasiado baja, impidiendo que el modelo identificara errores creativos",
    },
    explanation:
      "La auto-revisión en la misma sesión es una limitación conocida: Claude retiene el razonamiento y los supuestos de la fase de generación en su ventana de contexto. Al revisar, aborda el código con esos mismos supuestos ya activos, reduciendo la probabilidad de detectar errores que derivan de supuestos incorrectos. La solución es usar una sesión separada para la revisión (contexto fresco) o tener un agente diferente que realice la revisión. La opción A no es precisa. La opción C también puede ser cierta pero no es la causa raíz aquí. La opción D es irrelevante.\n\nComo implementarlo:\n```typescript\n// PROBLEMATIC: review in same session as generation\nasync function badWorkflow(task: string) {\n  const session = await startSession();\n  await session.send(`Generate a function to: ${task}`);\n  // Same session — retains generation reasoning\n  const review = await session.send(\"Now review the code you just wrote\");\n  // Review is biased — Claude already \"committed\" to its implementation decisions\n}\n\n// CORRECT: separate sessions for generation and review\nasync function goodWorkflow(task: string) {\n  // Session 1: Generation\n  const genResult = await anthropic.messages.create({\n    model: \"claude-opus-4-5\",\n    messages: [{ role: \"user\", content: `Generate a function to: ${task}` }],\n    max_tokens: 2048,\n  });\n  const generatedCode = extractCode(genResult);\n\n  // Session 2: Review — completely fresh context, no generation history\n  const reviewResult = await anthropic.messages.create({\n    model: \"claude-opus-4-5\",\n    system: \"You are a critical code reviewer. Find all bugs and security issues.\",\n    messages: [{ role: \"user\", content: `Review this code for bugs:\\n\\n${generatedCode}` }],\n    max_tokens: 2048,\n  });\n  // Fresh perspective — no blind spots from generation\n}\n```",
    keyConcept: "Limitación de la auto-revisión: la misma sesión retiene el contexto de razonamiento de generación",
  },

  "D4-010": {
    question:
      "Estás extrayendo códigos de diagnóstico médico de notas clínicas. La tarea es ambigua: los mismos síntomas pueden mapearse a múltiples códigos válidos, y se utilizan diferentes notaciones en distintas clínicas. ¿Qué técnica aborda más confiablemente esta ambigüedad?",
    options: {
      A: "Usar un system prompt muy detallado que explique todas las notaciones posibles",
      B: "Proporcionar ejemplos few-shot que cubran los casos ambiguos — cada ejemplo muestra una nota clínica ambigua mapeada al código correcto con una explicación",
      C: "Usar la Message Batches API para procesar todas las notas simultáneamente",
      D: "Forzar tool_use con un esquema que solo permite un código por diagnóstico",
    },
    explanation:
      "Los ejemplos few-shot son la técnica más efectiva para resolver la ambigüedad de tareas, especialmente cuando la ambigüedad es semántica (múltiples interpretaciones válidas) en lugar de estructural. Mostrar ejemplos concretos de cómo resolver casos ambiguos enseña al modelo la lógica de decisión a través de la demostración. Los system prompts detallados ayudan pero son menos efectivos que los ejemplos para la desambiguación compleja. La Batches API es una optimización de costo/latencia, no una técnica de calidad. Forzar un solo código mediante esquema no resuelve cuál código es correcto.\n\nComo implementarlo:\n```typescript\nconst systemPrompt = `You are a medical coding specialist extracting ICD-10 codes from clinical notes.\n\nHere are examples showing how to handle ambiguous cases:\n\n--- EXAMPLE 1 ---\nNote: \"Patient presents with chest pain, radiating to left arm, diaphoresis\"\nCoding reasoning: Symptoms strongly suggest acute MI. Without test confirmation, use rule-out code.\nOutput: { primary: \"R07.9\", secondary: [], confidence: \"probable\", reasoning: \"Radiating chest pain pattern\" }\n\n--- EXAMPLE 2 ---\nNote: \"Pt c/o SOB x3 days, hx of CHF\"\nCoding reasoning: SOB with CHF history — could be CHF exacerbation or separate respiratory issue.\nOutput: { primary: \"I50.9\", secondary: [\"R06.00\"], confidence: \"probable\", reasoning: \"Known CHF history makes cardiac etiology primary\" }\n\n--- EXAMPLE 3 ---\nNote: \"Fever, cough, positive rapid flu test\"\nCoding reasoning: Confirmed flu — use confirmed diagnosis code not suspected.\nOutput: { primary: \"J11.1\", secondary: [], confidence: \"confirmed\", reasoning: \"Positive rapid test confirms influenza\" }\n\nFor each note, follow the same reasoning pattern shown above.`;\n```",
    keyConcept: "Ejemplos few-shot para resolver ambigüedad en tareas de extracción complejas",
  },

  "D4-011": {
    question:
      "Envías 1000 registros a la Message Batches API a las 2:00 PM. Un interesado solicita los resultados a las 2:30 PM. El lote no se ha completado. ¿Qué debes decirle al interesado sobre el modelo de procesamiento de la Message Batches API?",
    options: {
      A: "El lote falló — los lotes deben completarse en minutos",
      B: "El lote está funcionando con normalidad — la Message Batches API procesa solicitudes de forma asíncrona dentro de una ventana de 24 horas, no en tiempo real",
      C: "El lote está retrasado — contactar al soporte de Anthropic para acelerarlo",
      D: "El tamaño del lote excede los límites — dividirlo en lotes de 100 para un procesamiento más rápido",
    },
    explanation:
      "La Message Batches API está diseñada para el procesamiento masivo asíncrono con una ventana de completado de hasta 24 horas. Intercambia latencia por ahorro de costos (reducción del 50%). No es una API de baja latencia. 30 minutos está bien dentro de la ventana de procesamiento normal. La expectativa del interesado de resultados en sub-minutos es incompatible con el modelo de API batch. Si se necesitaran resultados en tiempo real, debería haberse utilizado la API síncrona estándar.\n\nComo implementarlo:\n```typescript\n// Choosing the right API based on latency requirements:\n\n// Use SYNCHRONOUS API when:\n// - Results needed in < 30 seconds\n// - Real-time user interaction\n// - Latency-sensitive workflows\nconst realtimeResult = await anthropic.messages.create({ ... });\n\n// Use MESSAGE BATCHES API when:\n// - Results can wait up to 24 hours\n// - Overnight processing jobs\n// - Cost is more important than speed\nconst batch = await anthropic.beta.messages.batches.create({ requests: [...] });\n\n// Polling pattern for batch completion:\nasync function pollBatchCompletion(batchId: string): Promise<BatchResults> {\n  const maxWait = 24 * 60 * 60 * 1000; // 24 hours\n  const pollInterval = 5 * 60 * 1000;  // Poll every 5 minutes\n  const startTime = Date.now();\n\n  while (Date.now() - startTime < maxWait) {\n    const batch = await anthropic.beta.messages.batches.retrieve(batchId);\n    if (batch.processing_status === \"ended\") {\n      return anthropic.beta.messages.batches.results(batchId);\n    }\n    console.log(`Batch ${batch.processing_status} — ${batch.request_counts.processing} remaining`);\n    await new Promise(r => setTimeout(r, pollInterval));\n  }\n  throw new Error(\"Batch did not complete within 24 hours\");\n}\n```",
    keyConcept: "Message Batches API: ventana de procesamiento de 24 horas, no en tiempo real",
  },

  "D4-012": {
    question:
      "Necesitas extraer nombres de productos, precios y estado de inventario de listados minoristas. La extracción debe devolver JSON válido en cada llamada para el procesamiento posterior. ¿Qué enfoque proporciona la mayor garantía de salida JSON válida?",
    options: {
      A: 'Incluir "Generar solo JSON válido" en el system prompt',
      B: "Usar ejemplos few-shot que muestren salida JSON",
      C: "Definir una herramienta (por ejemplo, `extract_product`) con un esquema JSON y usar tool_choice para forzar a Claude a llamarla — la API aplica la conformidad del esquema",
      D: "Pedirle a Claude que verifique su propio JSON antes de responder",
    },
    explanation:
      "Usar tool_use con un esquema JSON definido y forzar la llamada a la herramienta a través de tool_choice es la mayor garantía de salida estructurada. La API aplica que los argumentos de la llamada a la herramienta se ajusten al esquema antes de devolver la respuesta. Las instrucciones del prompt (A) y los ejemplos few-shot (B) son probabilísticos. La auto-verificación (D) también es probabilística y agrega latencia. Para la conformidad JSON crítica para la misión, tool_use con esquema es el enfoque definitivo.\n\nComo implementarlo:\n```typescript\nconst response = await anthropic.messages.create({\n  model: \"claude-opus-4-5\",\n  max_tokens: 1024,\n  tools: [\n    {\n      name: \"extract_product\",\n      description: \"Extracts structured product data from a retail listing\",\n      input_schema: {\n        type: \"object\",\n        properties: {\n          name: {\n            type: \"string\",\n            description: \"Full product name\",\n          },\n          price_usd: {\n            type: \"number\",\n            description: \"Price in USD as a decimal number (e.g., 29.99)\",\n          },\n          in_stock: {\n            type: \"boolean\",\n            description: \"True if product is currently available\",\n          },\n        },\n        required: [\"name\", \"price_usd\", \"in_stock\"],\n      },\n    },\n  ],\n  // API-enforced: Claude MUST call extract_product with a valid schema\n  tool_choice: { type: \"tool\", name: \"extract_product\" },\n  messages: [{ role: \"user\", content: `Extract product data from: ${listingText}` }],\n});\n\n// Guaranteed valid structure — API rejected any non-conforming response\nconst product = response.content[0].input as {\n  name: string;\n  price_usd: number;\n  in_stock: boolean;\n};\n```",
    keyConcept: "tool_use con tool_choice forzado para conformidad garantizada del esquema JSON",
  },

  "D5-001": {
    question:
      "Un agente de soporte ha estado ejecutándose durante 2 horas y ha acumulado 80k tokens de conversación. Para reducir el tamaño del contexto, un desarrollador aplica summarización progresiva — condensando turnos de conversación anteriores en resúmenes. El agente comienza a dar montos de reembolso incorrectos que difieren de lo discutido anteriormente. ¿Cuál es la causa más probable?",
    options: {
      A: "El modelo se confundió al tener tanto resúmenes como turnos completos de conversación en el contexto",
      B: "La summarización progresiva condensó números específicos y fechas de turnos anteriores, causando que el agente perdiera datos factuales precisos como el monto exacto de reembolso acordado",
      C: "El prompt de summarización era demasiado breve — resúmenes más largos preservarían más detalles",
      D: "La ventana de contexto del modelo fue restablecida, perdiendo todo el contexto anterior",
    },
    explanation:
      "La summarización progresiva es conocida por arriesgar la condensación o eliminación de datos cuantitativos específicos (números, fechas, montos, identificadores) durante el proceso de summarización. Los resúmenes en prosa capturan temas e intenciones pero frecuentemente pierden las cifras exactas. La solución es extraer y preservar los hechos críticos (como los montos de reembolso acordados) en un bloque estructurado de \"hechos del caso\" fuera del alcance de la summarización. Las opciones A y C caracterizan mal el problema. La opción D describe un modo de fallo diferente.\n\nComo implementarlo:\n```typescript\ninterface CaseFacts {\n  customerId: string;\n  caseNumber: string;\n  agreedRefundAmount: number | null;\n  originalOrderAmount: number;\n  escalationStatus: \"open\" | \"escalated\" | \"resolved\";\n  keyDates: Record<string, string>; // ISO dates\n}\n\n// Extract and freeze critical facts BEFORE summarizing\nfunction buildSummarizationPrompt(conversation: Message[], facts: CaseFacts): string {\n  return `Summarize this support conversation into 3-4 sentences capturing the customer\'s issue and the resolution direction.\nDO NOT include specific numbers — those are preserved separately.\n\nConversation:\n${conversation.map(m => `${m.role}: ${m.content}`).join(\"\\n\")}`;\n}\n\n// The case facts block is NEVER summarized — always included verbatim\nfunction buildContextForNextTurn(summary: string, facts: CaseFacts): string {\n  return `CASE FACTS (exact values — do not modify):\n${JSON.stringify(facts, null, 2)}\n\nCONVERSATION SUMMARY:\n${summary}`;\n}\n```",
    keyConcept: "Riesgos de la summarización progresiva: condensación de números, fechas y hechos específicos",
  },

  "D5-002": {
    question:
      "Para prevenir la pérdida de hechos críticos durante la compresión de contexto, tu equipo decide mantener un bloque estructurado al inicio de cada conversación de soporte. Este bloque siempre contiene: customer_id, case_number, agreed_resolution, refund_amount y escalation_status. ¿Cómo se llama este patrón y por qué funciona?",
    options: {
      A: "Inyección en el system prompt — los hechos en el system prompt nunca se resumen",
      B: "Bloque de \"hechos del caso\" estructurado — los datos precisamente tipados y críticos se mantienen por separado del flujo de la conversación, asegurando que nunca se compriman",
      C: "Anclaje de contexto — colocar los hechos al inicio asegura que estén en posición de primacía y tengan mayor peso",
      D: "Presupuestación de tokens — reservar tokens para los hechos evita que sean desplazados",
    },
    explanation:
      "El patrón de bloque de hechos del caso estructurado separa los datos factuales críticos (números, IDs, valores acordados) de la conversación narrativa. Porque se mantiene como un bloque estructurado distinto en lugar de estar incrustado en prosa, no está sujeto a la summarización progresiva y puede ser explícitamente preservado o actualizado. La opción A está relacionada pero \"inyección en el system prompt\" no es el nombre canónico de este patrón. La opción C (primacía) es un efecto real pero describe el sesgo de posición, no este patrón. La opción D describe la estrategia de gestión de tokens.\n\nComo implementarlo:\n```typescript\n// The case facts block is maintained as the FIRST user message\n// It gets UPDATED in-place as the conversation progresses, never summarized\n\nfunction formatCaseFactsBlock(facts: CaseFacts): string {\n  return `<case_facts>\ncustomer_id: ${facts.customerId}\ncase_number: ${facts.caseNumber}\nagreed_resolution: ${facts.agreedResolution ?? \"pending\"}\nrefund_amount: ${facts.refundAmount !== null ? `$${facts.refundAmount.toFixed(2)}` : \"not yet agreed\"}\nescalation_status: ${facts.escalationStatus}\norder_date: ${facts.orderDate}\noriginal_amount: $${facts.originalAmount.toFixed(2)}\n</case_facts>`;\n}\n\n// When building messages for Claude:\nconst messages: Message[] = [\n  {\n    role: \"user\",\n    // Facts block always first — never compressed\n    content: formatCaseFactsBlock(currentFacts) + \"\\n\\n\" + conversationSummary,\n  },\n  // ... recent turns follow ...\n];\n\n// After each tool call that updates a fact, update the block:\nasync function afterRefundAgreed(amount: number) {\n  currentFacts.refundAmount = amount;\n  currentFacts.agreedResolution = \"full_refund\";\n  // The next turn\'s case facts block will reflect the update\n}\n```",
    keyConcept: "Bloques estructurados de 'hechos del caso' para datos críticos persistentes a través de límites de contexto",
  },

  "D5-003": {
    question:
      "Un agente de investigación recibe una sola respuesta de API que contiene 40 documentos como resultados de herramientas, totalizando 60k tokens. El agente necesita sintetizar todos los hallazgos, pero notas que consistentemente ignora los documentos 15-30 mientras procesa con precisión los documentos 1-10 y 35-40. ¿Qué fenómeno de confiabilidad del contexto explica esto?",
    options: {
      A: "Agotamiento del presupuesto de tokens — el agente se queda sin tokens antes de llegar a los documentos intermedios",
      B: "Efecto de perderse en el medio — los LLMs atienden más confiablemente al contenido al principio y al final de la ventana de contexto que al contenido en el medio",
      C: "Truncamiento de resultados de herramientas — MCP automáticamente trunca los resultados de herramientas que excedan 4k tokens",
      D: "Decaimiento de atención — el mecanismo de atención del modelo se degrada linealmente a través del contexto",
    },
    explanation:
      "El efecto de perderse en el medio es un fenómeno bien documentado: los LLMs tienen menor recuperación y atención para el contenido en el medio de las ventanas de contexto largas en comparación con el inicio y el final. Esto es especialmente pronunciado para tareas de recuperación. La solución es reordenar los documentos importantes al principio o al final, o reestructurar cómo se presenta la información. El agotamiento de tokens (A) cortaría todo el contenido subsiguiente, no omitiría el medio. El truncamiento de resultados de herramientas (C) no es automático. El decaimiento de atención (D) no es lineal — el patrón tiene forma de U.\n\nComo implementarlo:\n```typescript\n// Strategy: reorder documents to mitigate lost-in-the-middle\nfunction orderDocumentsForReliableRetrieval(\n  documents: Document[],\n  relevanceScores: number[]\n): Document[] {\n  // Sort by relevance descending\n  const sorted = documents\n    .map((doc, i) => ({ doc, score: relevanceScores[i] }))\n    .sort((a, b) => b.score - a.score);\n\n  const n = sorted.length;\n  const result: Document[] = new Array(n);\n\n  // Place most relevant at beginning and end (avoid the middle)\n  // Even-indexed positions go to the front, odd-indexed to the back\n  let front = 0, back = n - 1;\n  sorted.forEach(({ doc }, i) => {\n    if (i % 2 === 0) result[front++] = doc;\n    else result[back--] = doc;\n  });\n\n  return result;\n}\n\n// Alternative: use multiple smaller requests instead of one giant context\nasync function synthesizeInChunks(documents: Document[], chunkSize = 10) {\n  const chunks = [];\n  for (let i = 0; i < documents.length; i += chunkSize) {\n    const chunk = documents.slice(i, i + chunkSize);\n    const summary = await summarizeChunk(chunk);\n    chunks.push(summary);\n  }\n  return synthesizeSummaries(chunks); // final synthesis on summaries\n}\n```",
    keyConcept: "Efecto de perderse en el medio: la confiabilidad cae para el contenido en el medio del contexto",
  },

  "D5-004": {
    question:
      "Tu sistema de investigación realiza 15 llamadas secuenciales a herramientas, cada una devolviendo 5k tokens de datos. Para la llamada 12 a la herramienta, el agente está luchando por recordar hallazgos de las llamadas 1-4. Verificas el contexto y descubres que solo los resultados de las herramientas consumen 75k tokens. ¿Qué cambio estructural aborda mejor la acumulación desproporcionada de tokens en los resultados de herramientas?",
    options: {
      A: "Aumentar la ventana de contexto a 200k tokens para acomodar más resultados de herramientas",
      B: "Después de cada llamada a herramienta, tener un paso de summarización que destile el resultado a los hallazgos clave antes de agregarlo al contexto, en lugar de agregar resultados en bruto",
      C: "Limitar cada herramienta para devolver un máximo de 1k tokens",
      D: "Almacenar los resultados de las herramientas en una base de datos y hacer que Claude los consulte según sea necesario",
    },
    explanation:
      "Resumir los resultados de las herramientas antes de agregarlos al contexto es la mitigación correcta para la acumulación de tokens en los resultados de herramientas. Los resultados en bruto de las herramientas (especialmente las salidas de consultas de bases de datos y contenido web) tienden a ser verbosos. Un paso de summarización extrae los hallazgos esenciales (hechos clave, números, conclusiones) y descarta el ruido, reduciendo dramáticamente el uso de tokens mientras preserva la información que importa. Simplemente aumentar el tamaño del contexto (A) no es escalable. Los límites estrictos en la salida de herramientas (C) pueden truncar datos necesarios. La opción D es un patrón válido pero más complejo y aún no resuelve el problema de acumulación en contexto para una sesión en curso.\n\nComo implementarlo:\n```typescript\nasync function runToolWithSummarization(\n  toolName: string,\n  toolArgs: object,\n  maxSummaryTokens = 500\n): Promise<{ raw: string; summary: string }> {\n  // Execute the tool\n  const rawResult = await executeTool(toolName, toolArgs);\n\n  // Summarize if result is large (> 1k tokens estimated)\n  const estimatedTokens = rawResult.length / 4;\n  if (estimatedTokens < 1000) {\n    return { raw: rawResult, summary: rawResult };\n  }\n\n  // Distill to key findings only\n  const summaryResponse = await anthropic.messages.create({\n    model: \"claude-haiku-4-5\", // Use faster/cheaper model for summarization\n    system: \"Extract only the key findings, numbers, dates, and conclusions. Be concise.\",\n    messages: [{ role: \"user\", content: `Summarize these tool results in ${maxSummaryTokens} tokens:\\n${rawResult}` }],\n    max_tokens: maxSummaryTokens,\n  });\n\n  return {\n    raw: rawResult, // Store full result externally if needed\n    summary: extractText(summaryResponse), // Use summary in context\n  };\n}\n\n// In the agentic loop, append SUMMARIES not raw results:\nmessages.push({\n  role: \"user\",\n  content: [{ type: \"tool_result\", tool_use_id: block.id, content: summary }],\n});\n```",
    keyConcept: "Los resultados de herramientas acumulan tokens desproporcionadamente; resumir antes de agregar",
  },

  "D5-005": {
    question:
      "Tu agente de soporte debe escalar a un agente humano cuando el cliente solicita explícitamente un humano, cuando ninguna política cubre el problema del cliente, o cuando el agente ha intentado 3 veces sin resolución. Un desarrollador sugiere también agregar escalada por sentimiento: \"escalar cuando el cliente parezca frustrado\". ¿Por qué la escalada basada en sentimiento no es confiable?",
    options: {
      A: "El análisis de sentimiento requiere un modelo separado y agrega latencia a cada turno",
      B: "La detección de sentimiento es subjetiva e inconsistente — el mismo texto puede clasificarse de manera diferente entre turnos, lo que lleva a desencadenantes de escalada impredecibles",
      C: "El sentimiento del cliente no es visible para Claude en interacciones solo de texto",
      D: "Agregar escalada por sentimiento entraría en conflicto con el desencadenante de solicitud explícita",
    },
    explanation:
      "La escalada basada en sentimiento no es confiable porque el sentimiento es subjetivo, dependiente del contexto y clasificado de manera inconsistente. Un cliente que dice \"esto es ridículo\" puede estar frustrado o bromeando dependiendo del contexto. Las señales de sentimiento también varían según la cultura, el estilo de comunicación y el contexto. Los tres desencadenantes enumerados (solicitud explícita, brecha de política, fallo repetido para progresar) son objetivos y deterministas. Los desencadenantes de escalada confiables deben ser inequívocos y basarse en hechos observables, no en estados emocionales inferidos.\n\nComo implementarlo:\n```typescript\n// RELIABLE: objective, deterministic escalation conditions\ninterface EscalationState {\n  attemptCount: number;\n  policyFound: boolean;\n  customerRequestedHuman: boolean;\n}\n\nfunction shouldEscalate(state: EscalationState, latestMessage: string): boolean {\n  // Condition 1: Explicit request (deterministic text matching)\n  const explicitRequest = [\n    \"speak to a human\", \"talk to an agent\", \"human please\",\n    \"real person\", \"supervisor\", \"escalate\"\n  ].some(phrase => latestMessage.toLowerCase().includes(phrase));\n\n  // Condition 2: Policy gap (objective fact)\n  const noPolicy = !state.policyFound;\n\n  // Condition 3: Repeated failure (countable fact)\n  const repeatedFailure = state.attemptCount >= 3;\n\n  return explicitRequest || noPolicy || repeatedFailure;\n}\n\n// UNRELIABLE: do NOT use sentiment as an escalation trigger\n// function seemsFrustrated(message: string): boolean {\n//   // Same message classifies differently each call — inconsistent\n//   // \"This is ridiculous\" — frustrated or sarcastic? Context-dependent.\n//   // Different cultures express frustration differently\n// }\n```",
    keyConcept: "La escalada basada en sentimiento no es confiable; usar desencadenantes de escalada objetivos",
  },

  "D5-006": {
    question:
      "Un agente de soporte intenta procesar un reembolso pero la API de pagos devuelve un error. El agente debe comunicar el fallo al orquestador con suficiente información para decidir si reintentar, probar una alternativa o escalar. ¿Qué estructura de propagación de errores es la más completa?",
    options: {
      A: '`{ "success": false, "message": "Reembolso fallido" }`',
      B: '`{ "success": false, "failureType": "transient", "failedStep": "payment_api", "partialResults": { "orderUpdated": true, "paymentProcessed": false }, "retryable": true, "userMessage": "Tu reembolso está siendo procesado. Por favor espera un momento." }`',
      C: '`{ "error": true, "code": 503, "timestamp": "2024-01-15T10:30:00Z" }`',
      D: '`{ "success": false, "stackTrace": "PaymentGatewayError en línea 42..." }`',
    },
    explanation:
      "La propagación de errores estructurada debe incluir: tipo de fallo (para clasificar el error), paso fallido (para identificar dónde en el flujo de trabajo falló), resultados parciales (para saber qué tuvo éxito y no reintentar), bandera retryable (para guiar la siguiente acción del orquestador), y un mensaje orientado al usuario. La opción A es demasiado escasa para la toma de decisiones del orquestador. La opción C proporciona información de nivel HTTP sin contexto semántico. La opción D expone trazas de pila internas — un riesgo de seguridad que también es inútil para las decisiones de orquestación.\n\nComo implementarlo:\n```typescript\ninterface WorkflowErrorResult {\n  success: false;\n  failureType: \"transient\" | \"validation\" | \"business\" | \"permission\";\n  failedStep: string;\n  partialResults: Record<string, boolean>;\n  retryable: boolean;\n  retryAfterSeconds?: number;\n  userMessage: string;         // Safe to show customer\n  internalDetails?: string;    // For logging only — NEVER send to customer\n}\n\nasync function processRefund(orderId: string, amount: number): Promise<WorkflowResult> {\n  const orderUpdated = await updateOrderStatus(orderId, \"refund_pending\");\n\n  try {\n    await paymentGateway.issueRefund(orderId, amount);\n    return { success: true, orderId, amount };\n  } catch (err) {\n    // Structured error with full orchestrator context\n    return {\n      success: false,\n      failureType: err.status === 503 ? \"transient\" : \"business\",\n      failedStep: \"payment_api\",\n      partialResults: {\n        orderUpdated: true,   // Already done — don\'t retry this\n        paymentProcessed: false, // Failed — retry only this\n      },\n      retryable: err.status === 503,\n      retryAfterSeconds: err.status === 503 ? 30 : undefined,\n      userMessage: \"Your refund request is processing. You\'ll receive confirmation within 24 hours.\",\n      // internalDetails logged separately, never returned to Claude context\n    };\n  }\n}\n```",
    keyConcept: "Propagación de errores estructurada con tipo de fallo, resultados parciales y bandera retryable",
  },

  "D5-007": {
    question:
      "Un agente de investigación está explorando una gran base de código en muchas sesiones. Después de cada sesión, los hallazgos importantes (firmas de funciones, patrones arquitectónicos, grafos de dependencias) se pierden y deben redescubrirse. ¿Cuál es el mecanismo más apropiado para persistir estos hallazgos a través de los límites de contexto?",
    options: {
      A: "Usar --resume para restaurar el historial completo de conversación cada vez",
      B: "Usar archivos de borrador para escribir hallazgos clave en un formato estructurado al final de cada sesión, y leerlos al inicio de la siguiente sesión",
      C: "Aumentar la ventana de contexto para mantener todo el historial de investigación",
      D: "Usar fork_session para ramificar desde el estado de la sesión anterior",
    },
    explanation:
      "Los archivos de borrador son el mecanismo correcto para persistir hallazgos clave a través de los límites de contexto. Escribir notas estructuradas (firmas de funciones, patrones, dependencias) en un archivo al final de la sesión y leerlas al inicio de la sesión es más eficiente que --resume (que restaura el historial completo de conversación incluyendo todo el ruido) y más confiable que depender del tamaño de la ventana de contexto. fork_session es para crear ramas de exploración dentro de una sesión, no para persistencia entre sesiones.\n\nComo implementarlo:\n```typescript\n// At session END — write structured findings to scratchpad\nconst findings = {\n  sessionDate: new Date().toISOString(),\n  exploredPaths: [\n    \"src/auth/\",\n    \"src/middleware/\",\n  ],\n  keyFunctions: [\n    { name: \"validateJWT\", path: \"src/auth/jwt.ts:42\", signature: \"(token: string) => Promise<Payload>\" },\n    { name: \"authMiddleware\", path: \"src/middleware/auth.ts:15\", signature: \"(req, res, next) => void\" },\n  ],\n  architectureNotes: [\n    \"Auth uses stateless JWT — no session store\",\n    \"Middleware checks Authorization header, falls back to cookie\",\n    \"Token refresh handled in src/auth/refresh.ts\",\n  ],\n  unexploredAreas: [\"src/admin/\", \"src/api/v2/\"],\n  nextSteps: [\"Map dependency graph of src/admin/\", \"Check for circular deps in api/v2\"],\n};\nawait fs.writeFile(\"research-scratchpad.json\", JSON.stringify(findings, null, 2));\n\n// At session START — read scratchpad to restore context efficiently\nconst scratchpad = JSON.parse(await fs.readFile(\"research-scratchpad.json\", \"utf-8\"));\nconst systemMessage = `Previous research findings:\\n${JSON.stringify(scratchpad, null, 2)}\\n\\nContinue from next steps listed above.`;\n```",
    keyConcept: "Archivos de borrador para persistir hallazgos clave a través de los límites de contexto",
  },

  "D5-008": {
    question:
      "Un desarrollador ha estado explorando una tarea de refactorización compleja durante 45 minutos. El contexto de la sesión de Claude Code ha crecido a 120k tokens con muchos callejones sin salida exploratorios y enfoques abandonados. El desarrollador quiere continuar el trabajo central pero con un contexto más limpio y enfocado. ¿Cuál es el enfoque recomendado?",
    options: {
      A: "Iniciar una sesión completamente nueva y resumir el trabajo en el primer mensaje",
      B: "Usar /compact para resumir el historial de conversación, reduciendo el tamaño del contexto mientras se preserva el hilo esencial del trabajo",
      C: "Usar --resume para recargar desde un punto de control anterior antes de los callejones sin salida",
      D: "Eliminar el directorio .claude/ para restablecer todo el estado de la sesión",
    },
    explanation:
      "/compact es el comando de Claude Code diseñado exactamente para este escenario — resume el historial de conversación en su lugar, eliminando callejones sin salida exploratorios y contenido redundante mientras preserva el hilo importante del trabajo. Esto reduce el tamaño del contexto sin perder los conocimientos válidos clave de la sesión activa. Comenzar completamente de nuevo (A) pierde los hallazgos válidos acumulados de la sesión actual. --resume restaura un estado previo, revirtiendo el trabajo completado. Eliminar .claude/ es destructivo y puede borrar la configuración del proyecto.\n\nComo implementarlo:\n```bash\n# In an active Claude Code session that has grown too large:\n# Check current context size\n/status\n# → Context: 120,847 tokens (85% of limit)\n\n# Run /compact to summarize and reduce context\n/compact\n# Claude will:\n# 1. Identify the core thread of productive work\n# 2. Discard exploratory dead ends and abandoned approaches\n# 3. Preserve key decisions, code changes, and active task state\n# 4. Replace the full history with a concise summary\n# → Context: 12,400 tokens (8% of limit)\n\n# Continue working with the cleaned context\nclaude \"Now refactor the authentication module as we discussed\"\n\n# The /compact summary will include:\n# - What was decided/agreed\n# - What files were modified\n# - What the current task is\n# - Key constraints discovered during exploration\n```",
    keyConcept: "/compact para reducir el tamaño del contexto en sesiones de exploración",
  },

  "D5-009": {
    question:
      "Tu pipeline de extracción produce puntuaciones de confianza para cada campo extraído. Para un conjunto de datos financieros de 10,000 registros, quieres validar la precisión sin revisar manualmente todos los registros. Decides muestrear registros para revisión manual. ¿Qué estrategia de muestreo identifica más eficientemente los errores sistémicos?",
    options: {
      A: "Muestreo aleatorio simple — seleccionar aleatoriamente 100 registros de los 10,000",
      B: "Muestreo estratificado por puntuación de confianza — muestrear intensamente de registros de baja confianza, ligeramente de registros de alta confianza, e incluir una muestra aleatoria de referencia de registros de alta confianza",
      C: "Muestreo secuencial — revisar los primeros 100 registros en orden",
      D: "Muestreo de valores atípicos — solo revisar registros donde algún campo sea nulo",
    },
    explanation:
      "El muestreo estratificado por puntuación de confianza es el enfoque más eficiente para encontrar errores sistémicos. Los registros de baja confianza son los que más probablemente contienen errores y deben revisarse a una tasa más alta. Los registros de alta confianza probablemente son correctos pero una pequeña muestra aleatoria valida que la puntuación de confianza esté calibrada correctamente. El muestreo aleatorio simple (A) es ineficiente porque la mayoría de los registros muestreados serán de alta confianza y sin errores. El muestreo secuencial (C) puede estar sesgado si los primeros registros comparten un patrón. El muestreo solo de valores atípicos (D) omite errores no nulos.\n\nComo implementarlo:\n```typescript\ninterface SamplingConfig {\n  lowConfidenceThreshold: number;   // e.g., 0.7\n  highConfidenceThreshold: number;  // e.g., 0.95\n  lowConfidenceSampleRate: number;  // e.g., 0.3 (review 30% of low-conf records)\n  highConfidenceSampleRate: number; // e.g., 0.02 (review 2% of high-conf records as baseline)\n}\n\nfunction stratifiedSample(\n  records: ExtractionResult[],\n  config: SamplingConfig\n): ExtractionResult[] {\n  const lowConf = records.filter(r => r.confidence < config.lowConfidenceThreshold);\n  const midConf = records.filter(\n    r => r.confidence >= config.lowConfidenceThreshold &&\n         r.confidence < config.highConfidenceThreshold\n  );\n  const highConf = records.filter(r => r.confidence >= config.highConfidenceThreshold);\n\n  return [\n    // Heavy sampling from low-confidence (most likely to have errors)\n    ...sample(lowConf, Math.ceil(lowConf.length * config.lowConfidenceSampleRate)),\n    // Medium sampling from mid-confidence\n    ...sample(midConf, Math.ceil(midConf.length * 0.1)),\n    // Baseline sample from high-confidence (validates calibration)\n    ...sample(highConf, Math.ceil(highConf.length * config.highConfidenceSampleRate)),\n  ];\n}\n```",
    keyConcept: "Muestreo estratificado por puntuación de confianza para validación eficiente",
  },

  "D5-010": {
    question:
      "Tu sistema de investigación extrae afirmaciones de artículos. Un interesado pregunta: \"¿Cómo sabemos de qué artículo proviene cada afirmación extraída, para poder verificarla?\" Implementas un mecanismo de seguimiento de procedencia. ¿Qué enfoque satisface mejor este requisito?",
    options: {
      A: "Almacenar el texto completo de cada artículo junto con cada afirmación en la base de datos",
      B: "Mantener mapeos de afirmación-fuente: cada afirmación extraída incluye el DOI del artículo fuente, el número de página y la cita textual usada como evidencia",
      C: "Incluir una sección de bibliografía en el informe de investigación final",
      D: "Registrar todas las llamadas a herramientas para que los artículos fuente puedan inferirse del historial de llamadas",
    },
    explanation:
      "Los mapeos de afirmación-fuente que vinculan cada afirmación a su artículo fuente (DOI), ubicación (página/sección) y cita textual de evidencia proporcionan procedencia directa y auditable. Esto permite que cualquier afirmación sea verificada yendo directamente a la fuente con información de ubicación precisa. Almacenar el texto completo del artículo (A) consume mucho almacenamiento y no crea vínculos explícitos. Una bibliografía (C) lista fuentes pero no mapea afirmaciones individuales a fuentes específicas. Inferir procedencia de registros de llamadas (D) es frágil e indirecto.\n\nComo implementarlo:\n```typescript\ninterface ExtractedClaim {\n  claim: string;               // The extracted claim text\n  confidence: number;          // 0-1 confidence score\n  provenance: ClaimProvenance;\n}\n\ninterface ClaimProvenance {\n  doi: string;                 // e.g., \"10.1038/nature12373\"\n  paperTitle: string;\n  authorLastName: string;      // For quick reference: \"Smith et al. (2024)\"\n  year: number;\n  pageNumber?: number;         // Page where claim appears\n  sectionTitle?: string;       // e.g., \"Results\", \"Discussion\"\n  verbatimQuote: string;       // Exact text from paper — the evidence\n  quoteContext: string;        // Surrounding sentence(s) for context\n}\n\n// In the extraction prompt:\nconst extractionSchema = {\n  name: \"extract_claims\",\n  input_schema: {\n    type: \"object\",\n    properties: {\n      claims: {\n        type: \"array\",\n        items: {\n          type: \"object\",\n          properties: {\n            claim: { type: \"string\" },\n            doi: { type: \"string\" },\n            verbatimQuote: { type: \"string\", description: \"Exact quote from paper supporting this claim\" },\n            pageNumber: { type: \"integer\" },\n          },\n          required: [\"claim\", \"doi\", \"verbatimQuote\"],\n        },\n      },\n    },\n  },\n};\n```",
    keyConcept: "Mapeos de afirmación-fuente para procedencia y verificabilidad de la extracción",
  },

  "D5-011": {
    question:
      "Tu pipeline de extracción procesa artículos de noticias y extrae un campo `publishedDate`. Algunos artículos dicen \"ayer\" o \"el martes pasado\" en lugar de una fecha absoluta. ¿Cómo deberías manejar esto para mantener la confiabilidad de los datos?",
    options: {
      A: 'Extraer la expresión de fecha relativa tal cual ("ayer", "el martes pasado") y resolverla en el post-procesamiento',
      B: "Usar la marca de tiempo de rastreo del artículo como sustituto de la fecha de publicación",
      C: "Incluir contexto temporal en el prompt de extracción (por ejemplo, la fecha de rastreo del artículo) para que Claude pueda resolver las fechas relativas a fechas absolutas ISO 8601, y agregar un campo `dateConfidence: \"inferred\" | \"explicit\"`",
      D: "Rechazar los artículos con fechas relativas y excluirlos del conjunto de datos",
    },
    explanation:
      "Proporcionar contexto temporal (la fecha de rastreo o la fecha de metadatos del artículo) permite a Claude resolver expresiones de fecha relativas a fechas absolutas en el momento de la extracción. Agregar un campo de confianza (\"explicit\" vs \"inferred\") preserva la información de procedencia sobre cómo se determinó la fecha, permitiendo a los consumidores posteriores filtrar o manejar las fechas inferidas de manera diferente. La opción A difiere la resolución y puede perder el punto de referencia. La opción B es imprecisa — las fechas de rastreo y publicación difieren. La opción D pierde datos válidos innecesariamente.\n\nComo implementarlo:\n```typescript\nasync function extractArticleData(article: NewsArticle) {\n  const systemPrompt = `You are extracting data from news articles.\nToday's date (article crawl date): ${article.crawledAt.toISOString().split('T')[0]}\n\nWhen extracting publishedDate:\n- If the article states an absolute date (\"January 15, 2024\"), extract it as-is and set dateConfidence to \"explicit\"\n- If relative (\"yesterday\", \"last Tuesday\", \"3 days ago\"), resolve using the crawl date and set dateConfidence to \"inferred\"\n- Always return dates in ISO 8601 format: YYYY-MM-DD`;\n\n  const response = await anthropic.messages.create({\n    model: \"claude-opus-4-5\",\n    system: systemPrompt,\n    tools: [{\n      name: \"extract_article\",\n      input_schema: {\n        type: \"object\",\n        properties: {\n          headline: { type: \"string\" },\n          publishedDate: { type: \"string\", pattern: \"^\\\\d{4}-\\\\d{2}-\\\\d{2}$\" },\n          dateConfidence: { type: \"string\", enum: [\"explicit\", \"inferred\"] },\n          // \"explicit\" = \"January 15\" in article\n          // \"inferred\" = \"yesterday\" resolved using crawl date\n        },\n        required: [\"headline\", \"publishedDate\", \"dateConfidence\"],\n      },\n    }],\n    tool_choice: { type: \"tool\", name: \"extract_article\" },\n    messages: [{ role: \"user\", content: article.text }],\n    max_tokens: 512,\n  });\n}\n```",
    keyConcept: "Manejo de datos temporales: resolver fechas relativas con contexto y metadatos de confianza",
  },

  "D5-012": {
    question:
      "Tu agente de soporte evalúa su confianza en sus propias respuestas. Después del análisis, encuentras que los campos con confianza > 0,9 tienen una tasa de error del 12%, mientras que el agente afirmó casi certeza. Las puntuaciones de confianza no reflejan la precisión real. ¿Qué indica esto y cómo debe abordarse?",
    options: {
      A: "El agente está alucinando — deshabilitar la puntuación de confianza y depender de reglas deterministas",
      B: "Las puntuaciones de confianza están mal calibradas — la confianza auto-reportada del modelo no se correlaciona con la precisión real. Implementar calibración a nivel de campo comparando la confianza predicha con la precisión observada a través de muestras históricas y recalibrando los umbrales.",
      C: "La tasa de error del 12% está dentro de los límites aceptables para un umbral de confianza de 0,9",
      D: "Aumentar el umbral de confianza a 0,99 para reducir errores",
    },
    explanation:
      "La descalibración significa que las puntuaciones de confianza son sistemáticamente demasiado confiadas — una confianza de 0,9 debería tener ~10% de tasa de error, no 12%, pero más importante, el patrón indica que el modelo asigna alta confianza a respuestas inciertas. La solución es la calibración a nivel de campo: medir la relación entre la confianza predicha y la precisión real en un conjunto de validación, luego ajustar los umbrales o agregar una capa de calibración. Simplemente elevar el umbral (D) selecciona menos registros sin corregir la descalibración subyacente. Deshabilitar la confianza (A) elimina una señal útil. Una tasa de error del 12% con confianza de 0,9 puede o no ser aceptable dependiendo del dominio, pero la descalibración es el problema central.\n\nComo implementarlo:\n```typescript\n// Step 1: Build a calibration dataset\n// Run extraction on 500 known-good records, collect (predicted_confidence, actual_correct) pairs\nconst calibrationData: Array<{ predictedConf: number; wasCorrect: boolean }> = [];\n\n// Step 2: Compute calibration curve (expected vs observed accuracy per confidence bucket)\nfunction computeCalibrationCurve(data: typeof calibrationData) {\n  const buckets = [0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1.0];\n  return buckets.map((upperBound, i) => {\n    const lowerBound = buckets[i - 1] ?? 0;\n    const bucket = data.filter(d => d.predictedConf >= lowerBound && d.predictedConf < upperBound);\n    const observedAccuracy = bucket.filter(d => d.wasCorrect).length / bucket.length;\n    return { range: `${lowerBound}-${upperBound}`, predicted: (lowerBound + upperBound) / 2, observed: observedAccuracy };\n  });\n}\n// If model says 0.9 but observedAccuracy is 0.88, the model is overconfident\n\n// Step 3: Apply calibration mapping in production\nfunction calibrateConfidence(rawConfidence: number, calibrationMap: Map<number, number>): number {\n  // Map raw model confidence to calibrated confidence using the curve\n  const bucket = Math.floor(rawConfidence * 10) / 10;\n  return calibrationMap.get(bucket) ?? rawConfidence;\n}\n\n// Step 4: Use calibrated thresholds for routing decisions\nconst HUMAN_REVIEW_THRESHOLD = 0.85; // Calibrated, not raw model confidence\n```",
    keyConcept: "Calibración de puntuación de confianza: confianza predicha vs precisión observada",
  },
};
