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
      "El bucle de tu agente de soporte envía una solicitud con las herramientas `lookup_order` y `process_refund`. La respuesta trae `stop_reason: \"tool_use\"`, un bloque de texto breve que dice «Déjame revisar ese pedido» y un bloque `tool_use` para `lookup_order`. ¿Qué debe hacer el bucle a continuación?",
    options: {
      A: "Ejecutar lookup_order, añadir el turno del asistente y su tool_result, y volver a llamar a Claude",
      B: "Mostrar el bloque de texto al cliente y esperar su siguiente mensaje, ya que el modelo respondió",
      C: "Tomar el bloque de texto como respuesta final y cerrar el turno, dejando sin responder la llamada pendiente",
      D: "Ejecutar lookup_order y enviar su salida cruda directamente al cliente, sin volver a llamar a Claude",
    },
    explanation:
      "`stop_reason: \"tool_use\"` significa que Claude pide el resultado de una herramienta antes de poder seguir. El bucle ejecuta la herramienta, añade el contenido del asistente sin cambios, agrega un mensaje de usuario con un `tool_result` por cada bloque `tool_use` y vuelve a llamar a Claude. Repite hasta que `stop_reason` sea `\"end_turn\"`.\n\nLas opciones B y C toman el bloque de texto como señal de que el turno terminó. Revisar si hay texto del asistente es uno de los antipatrones de finalización que nombra la guía: un turno `tool_use` suele incluir texto. La opción D se salta al modelo, así que Claude nunca razona sobre los datos del pedido (por ejemplo, para decidir si procede un reembolso).\n\nCómo implementarlo:\n```typescript\nlet messages = [{ role: \"user\", content: customerMessage }];\nwhile (true) {\n  const res = await client.messages.create({\n    model: \"claude-sonnet-5-5\", max_tokens: 2048, tools, messages,\n  });\n  messages.push({ role: \"assistant\", content: res.content });\n  if (res.stop_reason !== \"tool_use\") break; // \"end_turn\": terminado\n  const results = await Promise.all(\n    res.content.filter(b => b.type === \"tool_use\").map(async b => ({\n      type: \"tool_result\", tool_use_id: b.id, content: await runTool(b.name, b.input),\n    })),\n  );\n  messages.push({ role: \"user\", content: results });\n}\n```",
    keyConcept: "stop_reason \"tool_use\" significa ejecutar la herramienta, devolver el resultado y volver a llamar",
  },

  "D1-002": {
    question:
      "En tu sistema de investigación, los subagentes de búsqueda, análisis y síntesis leen y escriben directamente en un documento compartido tipo «pizarra», y el coordinador solo los arranca. Un informe final contiene una estadística errónea y nadie puede saber qué agente la introdujo; además, un paso de análisis fallido llegó a la síntesis sin que nadie lo notara. ¿Qué cambio resuelve ambos problemas?",
    options: {
      A: "Hacer que cada subagente relea la pizarra compartida más seguido para que los agentes detecten los errores de los demás",
      B: "Enrutar todo el tráfico entre subagentes a través del coordinador, que le pasa a cada uno solo lo que necesita",
      C: "Fusionar los tres subagentes en un solo agente con un prompt más largo, para que la información no tenga que moverse",
      D: "Darle a cada subagente el historial completo de conversación del coordinador para que todos compartan la misma visión",
    },
    explanation:
      "El patrón hub-and-spoke deja al coordinador a cargo de toda la comunicación entre subagentes. Cada traspaso pasa por un solo lugar, así que puedes ver qué recibió y qué devolvió cada subagente, detectar y clasificar fallos antes de que lleguen a la síntesis y controlar qué información fluye hacia dónde. Eso resuelve tanto la estadística imposible de rastrear como el fallo silencioso.\n\nLa opción A mantiene el canal compartido sin observación y suma más lecturas de datos que pueden estar mal. La opción C elimina la especialización y el aislamiento de contexto que hacían útiles a los subagentes. La opción D inunda a cada subagente con contexto irrelevante y, de todos modos, los subagentes no heredan el historial del coordinador: el coordinador tiene que pasar el contexto de forma explícita.\n\nCómo implementarlo:\n```typescript\nconst search = await runSubagent(\"web-search\", { topic, subtopics });\nif (search.status === \"error\") return handleSearchFailure(search); // se detecta en el hub\nconst analysis = await runSubagent(\"doc-analysis\", { documents: search.documents });\nlog({ step: \"analysis\", input: search.documents.length, output: analysis.findings.length });\nconst report = await runSubagent(\"synthesis\", { findings: analysis.findings });\n```",
    keyConcept: "Enrutar toda la comunicación entre subagentes por el coordinador, por observabilidad y manejo de errores",
  },

  "D1-003": {
    question:
      "Un coordinador hecho con el Agent SDK define los subagentes `web-search` y `doc-analysis` en su opción `agents` y corre sin interfaz con `allowedTools: [\"Read\", \"Grep\", \"WebSearch\"]`. Los registros muestran que el coordinador hace él mismo todas las búsquedas y que cada intento de delegar es rechazado. Las definiciones de los subagentes son válidas. ¿Cuál es la causa?",
    options: {
      A: "La lista tools de cada subagente debe incluir \"Task\" antes de que el coordinador pueda llamarlo",
      B: "Los subagentes solo se cargan desde archivos en .claude/agents/; sin interfaz se ignoran los definidos en código",
      C: "A allowedTools del coordinador le falta \"Task\", la herramienta con la que lanza a sus subagentes",
      D: "Delegar requiere un parentAgentId en cada AgentDefinition que apunte de vuelta al coordinador",
    },
    explanation:
      "Un coordinador lanza subagentes mediante la herramienta Task, así que su `allowedTools` debe incluir `\"Task\"`. Sin ella, cada intento de delegar es rechazado y el coordinador termina haciendo el trabajo él mismo, que es justo lo que muestran los registros. En el producto actual la herramienta se llama `Agent` (se renombró en Claude Code v2.1.63); `Task` sigue funcionando como alias.\n\nLa opción A pone el requisito en el agente equivocado: la lista `tools` de un subagente solo importa si ese subagente lanza sus propios subagentes, algo que Claude Code permite hoy hasta tres niveles de profundidad por defecto (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`). La opción B es falsa: las definiciones programáticas son el enfoque recomendado para apps del SDK y tienen prioridad sobre los agentes en archivo con el mismo nombre. La opción D describe un campo que no existe.\n\nCómo implementarlo:\n```typescript\nfor await (const msg of query({\n  prompt: \"Research the impact of AI on creative industries\",\n  options: {\n    allowedTools: [\"Read\", \"Grep\", \"WebSearch\", \"Task\"], // \"Agent\" en versiones actuales\n    agents: {\n      \"web-search\": { description: \"Finds sources on the web\", prompt: searchPrompt, tools: [\"WebSearch\", \"WebFetch\"] },\n      \"doc-analysis\": { description: \"Analyzes documents\", prompt: analysisPrompt, tools: [\"Read\", \"Grep\"] },\n    },\n  },\n})) { /* ... */ }\n```",
    keyConcept: "El allowedTools del coordinador debe incluir Task (hoy Agent) para lanzar subagentes",
  },

  "D1-004": {
    question:
      "Después de una sesión de una hora que mapeó las particularidades de un conjunto de datos, tu equipo quiere probar dos estrategias de análisis, clustering y regresión, sin que una contamine a la otra y conservando intacto el análisis original para comparar. ¿Qué debes hacer?",
    options: {
      A: "Bifurcar dos veces la sesión analizada con fork_session, para que cada estrategia corra en su propia rama",
      B: "Reanudar la sesión original con --resume y ejecutar ambas estrategias en ella, una después de la otra",
      C: "Abrir dos sesiones totalmente nuevas y dejar que cada una vuelva a explorar el conjunto de datos desde cero",
      D: "Ejecutar ambas estrategias en subagentes que escriban sus resultados parciales en el mismo registro de sesión",
    },
    explanation:
      "fork_session crea una sesión nueva que arranca con una copia del historial de la original y luego diverge, con su propio ID de sesión. Bifurcar dos veces le da a cada estrategia el análisis base compartido sin que ninguna vea el trabajo de la otra, y la sesión original queda sin cambios para comparar.\n\nLa opción B mezcla ambas estrategias en un solo historial, así que la segunda queda influida por la primera. La opción C desperdicia una hora de análisis válido. La opción D vuelve a juntar las estrategias en un mismo registro compartido, que es justo la contaminación que querías evitar. Ojo: bifurcar ramifica la conversación, no el sistema de archivos; si una rama edita archivos, las demás ven esos cambios.\n\nCómo implementarlo:\n```bash\nclaude --resume dataset-analysis --fork-session -p \"Try k-means clustering on the cleaned data\"\nclaude --resume dataset-analysis --fork-session -p \"Try a regression model on the cleaned data\"\n# SDK: query({ prompt, options: { resume: sessionId, forkSession: true } })\n```",
    keyConcept: "fork_session ramifica una base compartida en exploraciones independientes",
  },

  "D1-005": {
    question:
      "A mitad de la conversación, tu agente decide que una disputa de facturación necesita a una persona: al cliente le cobraron dos veces y quiere que se revierta uno de los cargos, algo que supera la autoridad del agente. Los agentes humanos trabajan en una herramienta de cola aparte y no pueden ver la transcripción del chat. ¿Qué debe enviar el agente mediante `escalate_to_human`?",
    options: {
      A: "Una nota de una línea, como «Disputa de facturación, revisar», para que la persona mire el caso desde cero",
      B: "La transcripción cruda pegada completa, para que la persona lea todo lo que dijeron el cliente y el agente",
      C: "Un resumen estructurado: ID del cliente, causa raíz encontrada, monto en juego y la acción recomendada",
      D: "Solo el ID del cliente, ya que la persona puede abrir la cuenta y pedirle al cliente que lo explique de nuevo",
    },
    explanation:
      "Un traspaso a mitad del proceso tiene que permitir que alguien sin la transcripción actúe de inmediato. Un resumen estructurado (ID del cliente, qué verificó el agente y la causa raíz, el monto involucrado y la acción que recomienda) le entrega a la persona la decisión en lugar de la investigación. Ese es el protocolo de traspaso que describe la guía para personas que no tienen acceso a la conversación.\n\nLa opción A obliga a la persona a repetir toda la investigación. La opción B técnicamente lleva todo, pero entierra la causa raíz y el monto pedido en una conversación que la persona debe releer. La opción D obliga al cliente a repetir su historia, lo contrario de resolver en el primer contacto.\n\nCómo implementarlo:\n```typescript\nawait tools.escalate_to_human({\n  customer_id: \"C-48213\",\n  issue: \"Duplicate charge\",\n  root_cause: \"Payment retried after gateway timeout; both captures settled on 2026-11-03\",\n  amount: { value: 89.0, currency: \"USD\" },\n  verified: [\"identity\", \"both charges in ledger\"],\n  recommended_action: \"Reverse capture ch_2 (89.00 USD)\",\n});\n```",
    keyConcept: "Resúmenes de traspaso estructurados para personas que no ven la conversación",
  },

  "D1-006": {
    question:
      "La política permite que el agente de soporte reembolse hasta 500 dólares; cualquier monto mayor debe ir a una persona. El prompt de sistema enuncia la regla con claridad, pero las auditorías semanales siguen encontrando algunos reembolsos de 700 a 900 dólares procesados sin intervención humana. ¿Cuál es la solución correcta?",
    options: {
      A: "Añadir ejemplos few-shot de reembolsos grandes que se escalan, para que el modelo aprenda dónde está el umbral",
      B: "Un hook PreToolUse sobre process_refund que deniegue montos mayores de 500 dólares y le indique al agente que escale",
      C: "Un hook PostToolUse sobre process_refund que marque cualquier reembolso mayor de 500 dólares para revisión posterior",
      D: "Quitarle process_refund al agente para que las personas atiendan todos los reembolsos, sin importar el monto",
    },
    explanation:
      "Una regla de negocio que debe cumplirse siempre necesita una verificación determinista, no una instrucción mejor. Un hook PreToolUse inspecciona la llamada pendiente a `process_refund`, la deniega cuando el monto supera los 500 dólares y su motivo redirige al agente hacia `escalate_to_human`. El reembolso nunca se ejecuta y la conversación sigue por el camino correcto.\n\nLa opción A mejora las probabilidades, pero sigue siendo probabilística: la fuga se achica sin cerrarse. La opción C detecta la violación después de que el dinero ya se movió. La opción D cumple la regla a costa de la meta de 80 % de resolución en el primer contacto: los reembolsos pequeños que el agente debería resolver irían todos a personas.\n\nCómo implementarlo:\n```typescript\nconst refundLimit: HookCallback = async (input) => {\n  const { tool_input } = input as PreToolUseHookInput;\n  if ((tool_input as { amount: number }).amount > 500) {\n    return { hookSpecificOutput: { hookEventName: \"PreToolUse\", permissionDecision: \"deny\",\n      permissionDecisionReason: \"Refunds over $500 need a human. Call escalate_to_human with a summary.\" } };\n  }\n  return {};\n};\n// options.hooks = { PreToolUse: [{ matcher: \"mcp__support__process_refund\", hooks: [refundLimit] }] }\n```",
    keyConcept: "Los hooks de intercepción bloquean llamadas que violan la política y redirigen a la escalada",
  },

  "D1-007": {
    question:
      "Una canalización de investigación siempre ejecuta los mismos cuatro pasos: (1) obtener artículos, (2) extraer las afirmaciones clave, (3) verificar las citas, (4) redactar un resumen. La entrada de cada paso es por completo la salida del anterior, y la estructura nunca cambia entre temas. ¿Qué estrategia de descomposición encaja mejor?",
    options: {
      A: "Descomposición dinámica adaptativa, dejando que el agente elija su siguiente acción después de cada paso",
      B: "Ejecución en paralelo, corriendo los cuatro pasos al mismo tiempo y combinando sus salidas al final",
      C: "Encadenamiento de prompts: fijar la secuencia y pasar la salida de cada paso como entrada del siguiente",
      D: "Un solo prompt con todas las instrucciones, para que Claude complete los cuatro pasos en una sola respuesta",
    },
    explanation:
      "Cuando los pasos se conocen de antemano y cada uno depende del anterior, el encadenamiento de prompts es el patrón correcto. Cada llamada tiene una sola tarea acotada y puedes validar o manejar errores en cada frontera antes de pasar la salida.\n\nLa opción A paga por una flexibilidad que la tarea no necesita y hace que las ejecuciones sean menos predecibles. La opción B es imposible aquí: el paso 2 necesita la salida del paso 1, así que los pasos no son independientes. La opción D le pide a una sola llamada cuatro tareas a la vez, lo que diluye la atención y elimina los puntos de control entre pasos.\n\nCómo implementarlo:\n```typescript\nconst papers = await step(\"Fetch the most relevant papers on: \" + topic);\nconst claims = await step(\"Extract the key claims from these papers:\\n\" + papers);\nconst checked = await step(\"Cross-check the citations behind these claims:\\n\" + claims);\nconst summary = await step(\"Write a summary of the verified claims:\\n\" + checked);\n```",
    keyConcept: "Encadenamiento de prompts para secuencias fijas y predecibles de pasos dependientes",
  },

  "D1-008": {
    question:
      "Un agente de investigación estudia un tema científico nuevo y no puede saber de antemano qué subpreguntas van a importar. Después de leer el primer artículo, encuentra tres subtemas inesperados, cada uno con fuentes y herramientas distintas. ¿Qué estrategia de descomposición está pensada para esta situación?",
    options: {
      A: "Descomposición adaptativa: generar las siguientes subtareas a partir de lo que cada paso descubrió de verdad",
      B: "Encadenamiento de prompts con tres cadenas predefinidas, una por subtema, escritas antes de empezar a buscar",
      C: "Un plan estático en el prompt de sistema que enumere todos los caminos que podría tomar la investigación",
      D: "Pasadas secuenciales que aplican una misma plantilla fija de prompt a cada subtema, uno tras otro",
    },
    explanation:
      "La investigación abierta es donde la descomposición dinámica y adaptativa justifica su costo: el plan se genera a partir de los hallazgos intermedios, así que las subtareas nuevas aparecen a medida que la evidencia las revela, y cada una recibe las fuentes y herramientas que necesita.\n\nLa opción B necesita la estructura antes de buscar, pero estos subtemas solo aparecieron después de leer el primer artículo. La opción C intenta enumerar lo desconocido por adelantado y aun así se pierde lo que nadie previó. La opción D adapta el orden, pero no el enfoque: una sola plantilla no sirve para subtemas que necesitan fuentes y herramientas distintas.\n\nCómo implementarlo:\n```typescript\nlet queue = [initialQuestion];\nwhile (queue.length) {\n  const q = queue.shift()!;\n  const result = await investigate(q);              // devuelve hallazgos + preguntas nuevas\n  findings.push(...result.findings);\n  queue.push(...prioritize(result.newQuestions));    // el plan crece con lo encontrado\n}\n```",
    keyConcept: "Descomposición dinámica adaptativa para tareas abiertas cuya estructura va emergiendo",
  },

  "D1-009": {
    question:
      "El lunes, una ingeniera trabajó en una sesión con nombre, «billing-legacy», que rastreó cómo funciona un módulo de facturación antiguo. Nadie ha tocado ese código desde entonces. El martes quiere seguir investigando donde lo dejó. ¿Cuál es la forma más eficiente de continuar?",
    options: {
      A: "Reanudarla por nombre con claude --resume billing-legacy y seguir desde el contexto del lunes",
      B: "Abrir una sesión nueva y pegar un resumen, porque el contexto reanudado nunca es confiable",
      C: "Bifurcar la sesión del lunes con fork_session para que la original quede como respaldo del trabajo",
      D: "Abrir una sesión nueva y pedirle al agente que relea el módulo para reconstruir lo que sabía",
    },
    explanation:
      "Reanuda cuando el contexto anterior sigue siendo válido. El código no cambió, así que las lecturas de archivos y las conclusiones del lunes son exactas, y `claude --resume billing-legacy` las recupera todas por nombre.\n\nLa opción B aplica la regla del contexto desactualizado a un caso donde nada está desactualizado; un resumen solo perdería detalle. La opción C crea una rama que nadie necesita: reanudar suma a la sesión y no hay un enfoque divergente que explorar. La opción D repite una investigación cuyos resultados siguen siendo correctos.\n\nCómo implementarlo:\n```bash\nclaude -n billing-legacy            # lunes: nombrar la sesión (o /rename dentro de ella)\nclaude --resume billing-legacy      # martes: continuar con todo el contexto anterior\n```",
    keyConcept: "Reanudar una sesión con nombre cuando su contexto anterior sigue siendo válido",
  },

  "D1-010": {
    question:
      "La política dice que el análisis de datos solo puede empezar después de que una persona apruebe la revisión de literatura. En las pruebas, el coordinador a veces llama a `run_analysis` justo después de `complete_literature_review`, aunque su prompt de sistema le dice que espere la aprobación. ¿Qué hace cumplir el orden requerido?",
    options: {
      A: "Un prompt de sistema más contundente que enumere las fases en orden y repita que primero va la aprobación",
      B: "Una stop_sequence después de la revisión, para que la generación se detenga ahí hasta que alguien escriba la aprobación",
      C: "Un hook PostToolUse sobre run_analysis que descarte su salida cuando no se haya registrado la aprobación",
      D: "Un hook PreToolUse que deniegue run_analysis hasta que quede registrada la aprobación humana de esa revisión",
    },
    explanation:
      "Cuando un orden debe cumplirse siempre, la verificación va en código que corre antes de que se ejecute la herramienta posterior. Un hook PreToolUse ve la llamada pendiente a `run_analysis` y la deniega, con un motivo, hasta que la aprobación esté registrada. El modelo no puede saltársela, porque la compuerta no es una instrucción al modelo.\n\nLa opción A sigue siendo una guía en el prompt con una tasa de fallo distinta de cero, que es lo que ya mostraron las pruebas. La opción B controla dónde se detiene la generación de texto; no ata nada a una aprobación humana ni a las llamadas a herramientas. La opción C actúa demasiado tarde: PostToolUse corre después de que el análisis ya se ejecutó, así que el costo y los efectos secundarios ya ocurrieron.\n\nCómo implementarlo:\n```typescript\nconst approved = new Set<string>();\nconst gate: HookCallback = async (input) => {\n  const { tool_name, tool_input } = input as PreToolUseHookInput;\n  if (tool_name === \"run_analysis\" && !approved.has((tool_input as any).review_id)) {\n    return { hookSpecificOutput: { hookEventName: \"PreToolUse\", permissionDecision: \"deny\",\n      permissionDecisionReason: \"Waiting for human approval of the literature review.\" } };\n  }\n  return {};\n};\n// options.hooks = { PreToolUse: [{ matcher: \"run_analysis\", hooks: [gate] }] }\n```",
    keyConcept: "Las compuertas programáticas bloquean herramientas posteriores hasta que terminan los pasos previos",
  },

  "D1-011": {
    question:
      "El bucle de un desarrollador ejecuta cada herramienta que pide Claude y luego envía una solicitud nueva que contiene solo el mensaje original del cliente y el último `tool_result`. En producción, el agente vuelve a llamar a `get_customer` una y otra vez y olvida datos que encontró dos pasos antes. ¿Cuál es la solución?",
    options: {
      A: "Conservar todo el historial: añadir cada turno tool_use del asistente y su tool_result antes de la siguiente llamada",
      B: "Añadir al prompt de sistema una línea que le pida al agente recordar resultados anteriores en vez de repetir llamadas",
      C: "Guardar en caché las respuestas de get_customer para que las llamadas repetidas sean instantáneas y no cuesten nada",
      D: "Subir max_tokens para que el modelo tenga más espacio para arrastrar sus hallazgos anteriores en el razonamiento",
    },
    explanation:
      "Claude no tiene memoria entre solicitudes: lo que sabe es lo que está en `messages`. El bucle debe añadir cada turno del asistente (con sus bloques `tool_use`) y el turno de usuario con los `tool_result` correspondientes, para que cada iteración parta de la anterior. Además, la API exige que cada `tool_result` vaya justo después del `tool_use` que responde, y un historial recortado rompe esa regla.\n\nLa opción B le pide al modelo recordar algo que nunca recibió. La opción C abarata las llamadas repetidas, pero el agente sigue igual de ciego a lo que ya encontró. La opción D agranda el presupuesto de salida; no devuelve a la entrada los resultados que faltan.\n\nCómo implementarlo:\n```typescript\nmessages.push({ role: \"assistant\", content: response.content });\nmessages.push({ role: \"user\", content: toolResults }); // primero los bloques tool_result\nconst next = await client.messages.create({ model: \"claude-sonnet-5-5\", max_tokens: 2048, tools, messages });\n```",
    keyConcept: "Los resultados de herramientas se añaden al historial para que la siguiente iteración los use",
  },

  "D1-012": {
    question:
      "Tu coordinador le pasa al subagente de síntesis los hallazgos de los subagentes de búsqueda y de análisis de documentos como un solo bloque largo de prosa concatenada. Los informes resultantes hacen afirmaciones correctas, pero a menudo les asignan la fuente equivocada o ninguna. ¿Cómo debería pasar el coordinador estos hallazgos?",
    options: {
      A: "Pedirle al subagente de síntesis que deduzca la fuente de cada afirmación por la redacción y el contexto de la prosa",
      B: "Enviar solo un resumen corto de cada hallazgo para que el prompt de síntesis sea pequeño y se centre en las afirmaciones",
      C: "Dejar la prosa como está, pero añadir al final del prompt una bibliografía con todas las URL consultadas",
      D: "Enviar registros estructurados que separen cada afirmación de sus metadatos: URL de la fuente, documento y página",
    },
    explanation:
      "La atribución sobrevive a un traspaso solo si viaja junto con cada afirmación. Los registros estructurados (por ejemplo, objetos JSON con `claim`, `source_url`, `document`, `page`) separan el contenido de los metadatos, así que el subagente de síntesis puede citar exactamente qué respalda cada afirmación. Los subagentes solo saben lo que está en su prompt, por lo que el coordinador debe incluir esos hallazgos completos de forma directa.\n\nLa opción A le pide al modelo reconstruir una correspondencia que se perdió; va a adivinar. La opción B achica la entrada, pero borra justo los metadatos que faltan. La opción C conserva las fuentes, pero una lista plana al final ya no dice qué afirmación vino de qué documento.\n\nCómo implementarlo:\n```typescript\nconst findings = [\n  { claim: \"Streaming royalties fell 12% in 2025\", source_url: \"https://example.org/report\", document: \"IFPI Global Report\", page: 14 },\n  { claim: \"...\", source_url: \"...\", document: \"...\", page: 3 },\n];\nawait runSubagent(\"synthesis\", `Write the section. Cite source_url and page for every claim.\\n${JSON.stringify(findings)}`);\n```",
    keyConcept: "Pasar el contexto entre agentes como datos estructurados que mantienen juntas la afirmación y su fuente",
  },

  "D2-001": {
    question:
      "Las herramientas de tu agente de soporte tienen descripciones detalladas y bien diferenciadas: `lookup_order` indica que se use solo cuando el cliente da un número de pedido o pregunta por una compra concreta, y `search_policies` cubre las preguntas generales sobre plazos de devolución, reglas de reembolso y cargos. La semana pasada alguien agregó esta línea al prompt de sistema: «Siempre que un cliente mencione un reembolso, llama primero a lookup_order». Desde entonces, el 40 % de las preguntas generales, como «¿Cuál es su política de reembolso para artículos abiertos?», dispara una llamada a `lookup_order` que falla por falta de número de pedido. ¿Qué deberías cambiar primero?",
    options: {
      A: "Reformular esa línea del prompt para que aplique solo a reembolsos de un pedido concreto, y dejar que las descripciones enruten lo general.",
      B: "Alargar la descripción de `lookup_order` y escribir en mayúsculas que nunca debe usarse para preguntas generales sobre políticas de reembolso o cargos.",
      C: "Agregar un clasificador previo que elimine la palabra «reembolso» de las preguntas generales antes de que el mensaje del cliente llegue al agente.",
      D: "Forzar `tool_choice` a `search_policies` cuando el mensaje del cliente contenga «política» o «reembolso», y dejar el prompt tal como está.",
    },
    explanation:
      "La A es correcta. La evidencia aísla la causa: las descripciones ya eran buenas y el enrutamiento erróneo empezó cuando se agregó al prompt de sistema una instrucción activada por una palabra clave. Una instrucción como «siempre que un cliente mencione un reembolso, llama a lookup_order» crea una asociación no deseada entre una palabra y una herramienta, y se impone sobre descripciones bien escritas. Acotar la instrucción a los reembolsos de un pedido concreto elimina el conflicto en su origen.\n\nLa B enfrenta la descripción con el prompt de sistema: el límite ya está escrito en la descripción y el prompt igual gana, así que las mayúsculas solo agravan el conflicto. La C agrega una capa sobredimensionada que reescribe lo que dice el cliente y oculta el defecto real. La D cambia el criterio del modelo por otra regla de palabra clave: «reembolso» también aparece en solicitudes sobre un pedido concreto, así que forzar `search_policies` rompería el caso legítimo.\n\nCómo implementarlo:\n```text\n# BEFORE (keyword trigger)\nWhenever a customer mentions a refund, call lookup_order first.\n\n# AFTER (scoped to the real need)\nWhen a customer asks for a refund on a specific purchase, confirm the order\nwith lookup_order before discussing eligibility. For general questions about\nrefund rules, follow the tool descriptions.\n```",
    keyConcept: "Las instrucciones del prompt de sistema sensibles a palabras clave pueden imponerse sobre buenas descripciones de herramientas",
  },

  "D2-002": {
    question:
      "El subagente de análisis de documentos tiene una sola herramienta, `analyze_document(document_id, instructions)`, descrita como «Analiza un documento según las instrucciones». El coordinador la usa para tres trabajos distintos: extraer datos numéricos, redactar un resumen y comprobar si una afirmación concreta está respaldada por una fuente. Los registros muestran que las comprobaciones de afirmaciones a menudo vuelven como resúmenes, y que el código posterior no logra procesar los resultados porque la forma de la salida cambia de una llamada a otra. ¿Cuál es el rediseño más eficaz?",
    options: {
      A: "Mantener la herramienta única y agregar un parámetro de texto libre `output_format` para que el coordinador describa la forma que quiere en cada llamada.",
      B: "Dividirla en `extract_data_points`, `summarize_content` y `verify_claim_against_source`, cada una con su propia descripción y su contrato.",
      C: "Mantener la herramienta única y agregar cinco ejemplos few-shot al prompt del subagente con la salida correcta para cada uno de los tres tipos de solicitud.",
      D: "Procesar cada resultado con una segunda llamada al modelo que clasifique el tipo de salida y lo reformatee a la forma que esperaba el coordinador.",
    },
    explanation:
      "La B es correcta. Una herramienta genérica que hace tres trabajos obliga al modelo a deducir el propósito a partir de instrucciones en texto libre, y no le da al código posterior un contrato de salida estable. Dividirla en herramientas con un propósito específico le da a cada trabajo una descripción precisa, su propio esquema de entrada y una salida fija, por ejemplo `{ supported, evidence_quote }` para verificar afirmaciones; así el modelo elige la operación correcta y el coordinador recibe resultados que puede procesar.\n\nLa A conserva la ambigüedad y traslada el contrato a una prosa por llamada que nada valida. La C agrega tokens sin crear un contrato, y la herramienta única sigue cubriendo tres trabajos. La D trata el síntoma después del hecho, suma latencia y costo, y no puede convertir un resumen en la verificación que hacía falta. La documentación de Anthropic también recomienda agrupar operaciones relacionadas en una herramienta con un parámetro `action`; eso funciona cuando comparten contrato, y estas tres no lo comparten.\n\nCómo implementarlo:\n```typescript\nconst tools = [\n  { name: \"extract_data_points\",\n    description: \"Extracts numeric facts (value, unit, page) from one document. Returns a list; never summarizes.\",\n    input_schema: { type: \"object\", properties: { document_id: { type: \"string\" } }, required: [\"document_id\"] } },\n  { name: \"summarize_content\",\n    description: \"Writes a summary of one document of at most 200 words. Does not check claims.\",\n    input_schema: { type: \"object\", properties: { document_id: { type: \"string\" } }, required: [\"document_id\"] } },\n  { name: \"verify_claim_against_source\",\n    description: \"Checks one claim against one document. Returns { supported: boolean, evidence_quote: string | null }.\",\n    input_schema: { type: \"object\", properties: { document_id: { type: \"string\" }, claim: { type: \"string\" } }, required: [\"document_id\", \"claim\"] } },\n];\n```",
    keyConcept: "Dividir una herramienta genérica en herramientas con propósito específico y contratos definidos",
  },

  "D2-003": {
    question:
      "Tu herramienta MCP `update_order_status` recibe un ID de pedido que no existe. Hoy el servidor devuelve un resultado normal cuyo único texto es «Operation failed». Los registros muestran que el agente repite la misma llamada cuatro o cinco veces y luego le dice al cliente que «el sistema está caído». ¿Qué debería devolver la herramienta?",
    options: {
      A: "Un error de protocolo JSON-RPC con código -32602, para que el cliente MCP detenga la llamada antes de que el resultado llegue al contexto del modelo.",
      B: "Un resultado exitoso vacío, para que el agente suponga que la actualización no hacía falta y pase al siguiente paso de la conversación.",
      C: "El mismo texto «Operation failed», más una regla en el prompt de sistema que le indique al agente no repetir una llamada más de dos veces.",
      D: "Un resultado con `isError: true` que diga que el pedido no existe, más `errorCategory: \"validation\"` e `isRetryable: false`.",
    },
    explanation:
      "La D es correcta. La especificación de MCP reporta los errores de ejecución de una herramienta, incluidos los de validación de la entrada, dentro del resultado con `isError: true`, para que el modelo vea qué falló y corrija el rumbo. Agregar `errorCategory: \"validation\"` e `isRetryable: false` le dice al agente que repetir la llamada no sirve y que debe pedirle al cliente que confirme el número de pedido.\n\nLa A usa mal los errores de protocolo, que la especificación reserva para herramientas desconocidas, solicitudes mal formadas y errores del servidor; el cliente puede no pasárselos al modelo, y se pierde el significado de «pedido inexistente». La B disfraza un fallo de éxito, así que el agente sigue como si nada. La C mantiene el mensaje uniforme «Operation failed»: el agente sigue sin distinguir un ID equivocado de una caída y solo falla más rápido.\n\nCómo implementarlo:\n```typescript\nif (!order) {\n  return {\n    isError: true,\n    content: [{ type: \"text\", text: JSON.stringify({\n      errorCategory: \"validation\",\n      isRetryable: false,\n      message: `Order ${orderId} does not exist. Ask the customer to confirm the order number.`,\n    }) }],\n  };\n}\n```",
    keyConcept: "isError de MCP con metadatos estructurados de validación no reintentable",
  },

  "D2-004": {
    question:
      "El subagente de búsqueda documental llama a `search_archive(query)`. Cuando el índice del archivo no responde, la herramienta captura la excepción y devuelve `{ \"results\": [] }`, exactamente lo mismo que cuando una consulta no encuentra nada. Anoche el índice estuvo caído una hora, y tres informes afirmaron que «no existe investigación previa» sobre temas que el archivo cubre de sobra. ¿Qué cambio corrige esto en el origen?",
    options: {
      A: "Hacer que el agente de síntesis desconfíe de toda lista vacía y repita siempre la misma consulta dos veces antes de concluir que no hay cobertura.",
      B: "Quitar el try/catch de la herramienta, para que cualquier excepción suba y termine el flujo de investigación antes de que se escriba el informe.",
      C: "Agregar un campo `status: \"ok\"` a cada respuesta y pedirle al subagente en su prompt de sistema que revise sus resultados cuando la lista venga vacía.",
      D: "Devolver `isError: true`, `errorCategory: \"transient\"` e `isRetryable: true` si el índice cae; dejar `[]` para cuando no hay coincidencias.",
    },
    explanation:
      "La D es correcta. Un fallo de acceso y un resultado vacío válido son resultados distintos que exigen decisiones distintas: el primero pide reintentar o reportar el hueco; el segundo es una consulta exitosa sin coincidencias. Devolver un error transitorio estructurado ante la caída, y una lista vacía exitosa solo cuando de verdad no hay coincidencias, permite que el agente los distinga.\n\nLa A desperdicia llamadas en cada resultado vacío legítimo y aun así no distingue una caída de una ausencia real. La B exagera: mata todo el flujo, con el trabajo ya hecho, por una caída recuperable. La C agrega un campo que siempre dice «ok», así que el fallo sigue disfrazado de éxito; ningún prompt recupera la información que la herramienta descartó.\n\nCómo implementarlo:\n```typescript\ntry {\n  const hits = await archive.search(query);\n  return { content: [{ type: \"text\", text: JSON.stringify({ results: hits }) }] }; // [] = real no-match\n} catch (err) {\n  return {\n    isError: true,\n    content: [{ type: \"text\", text: JSON.stringify({\n      errorCategory: \"transient\", isRetryable: true,\n      message: \"Archive index unreachable; results unknown, not empty.\",\n    }) }],\n  };\n}\n```",
    keyConcept: "Distinguir fallos de acceso de resultados vacíos válidos",
  },

  "D2-005": {
    question:
      "Para «mantener la flexibilidad», a cada subagente de tu sistema de investigación se le dieron las 18 herramientas: búsqueda web, lectura de PDF, formato de citas, estadística, generación del informe y más. Ahora las trazas muestran que el agente de síntesis lanza sus propias búsquedas web en vez de trabajar con los hallazgos que recibe, y que el agente de informes a veces llama a herramientas de estadística. Los errores de selección de herramientas se triplicaron desde el cambio. ¿Qué deberías hacer?",
    options: {
      A: "Mantener las 18 herramientas en cada subagente, pero agregar a cada prompt de sistema un párrafo con las herramientas que debe usar y las que debe evitar.",
      B: "Darle a cada subagente solo las 4–5 herramientas que su rol necesita, como búsqueda para el agente de búsqueda y formato para el de informes.",
      C: "Fusionar los cuatro subagentes en un solo agente con las 18 herramientas, para que ya no haya dudas sobre qué agente es dueño de cada una.",
      D: "Pasar las 18 herramientas al coordinador y que cada subagente le pida ejecutar una herramienta en su nombre cada vez que la necesite.",
    },
    explanation:
      "La B es correcta. Darle muchas herramientas a un agente aumenta la complejidad de la decisión y empeora la selección, y los agentes con herramientas ajenas a su especialidad tienden a usarlas mal, como muestran las búsquedas web del agente de síntesis. Limitar cada subagente a las herramientas de su rol elimina las opciones equivocadas en vez de pedirle al modelo que las ignore.\n\nLa A conserva la decisión entre 18 opciones y depende de que el modelo cumpla una lista, algo probabilístico. La C empeora el problema: un solo agente con todos los roles y todas las herramientas, sin especialización. La D convierte al coordinador en un cuello de botella, con una ida y vuelta por cada llamada, y las 18 herramientas siguen concentradas en un solo lugar.\n\nCómo implementarlo:\n```typescript\nimport { query } from \"@anthropic-ai/claude-agent-sdk\";\n\nconst agents = {\n  \"web-searcher\": { description: \"Finds sources\", prompt: \"...\",\n    tools: [\"mcp__research__web_search\", \"mcp__research__fetch_page\"] },\n  \"synthesizer\": { description: \"Combines findings\", prompt: \"...\",\n    tools: [\"Read\", \"mcp__research__merge_findings\"] },\n  \"reporter\": { description: \"Renders the report\", prompt: \"...\",\n    tools: [\"mcp__research__format_citations\", \"mcp__research__render_report\"] },\n};\n\nfor await (const msg of query({ prompt: topic, options: { agents, allowedTools: [\"Agent\"] } })) { /* ... */ }\n```",
    keyConcept: "Acceso a herramientas acotado al rol de cada subagente",
  },

  "D2-006": {
    question:
      "Tu pipeline de extracción procesa contratos con tres herramientas: `extract_metadata` (partes, fechas, tipo de contrato), `lookup_company_registry` y `classify_clauses`. Las dos herramientas de enriquecimiento dependen de los metadatos, pero en el 20 % de las ejecuciones Claude llama primero a `lookup_company_registry` con nombres de empresa adivinados. ¿Cómo garantizas que la extracción de metadatos ocurra siempre primero?",
    options: {
      A: "Usar `tool_choice: {\"type\": \"any\"}` en cada solicitud para que Claude deba llamar a una herramienta, y poner `extract_metadata` primera en la lista.",
      B: "Mantener `tool_choice: {\"type\": \"auto\"}` y agregar al prompt de sistema una frase que diga que `extract_metadata` siempre va primero.",
      C: "Forzar `{\"type\": \"tool\", \"name\": \"extract_metadata\"}` en todas las solicitudes de la conversación, para que nada se enriquezca con nombres adivinados.",
      D: "Forzar `{\"type\": \"tool\", \"name\": \"extract_metadata\"}` solo en la primera solicitud y usar `\"auto\"` en los turnos siguientes para enriquecer.",
    },
    explanation:
      "La D es correcta. La selección forzada garantiza que se llame a una herramienta concreta, así que forzar `extract_metadata` en la primera solicitud vuelve determinista el orden. Volver a `auto` en los turnos siguientes permite que Claude llame a las herramientas de enriquecimiento con metadatos reales.\n\nLa A solo garantiza que se llame a alguna herramienta, no a cuál, y el orden de la lista no indica prioridad. La B es el enfoque probabilístico que ya falla en el 20 % de los casos. La C se pasa: forzar la misma herramienta en cada turno impide que el enriquecimiento llegue a ejecutarse. Nota de producto: la documentación actual indica que Claude Opus 5.5 y Sonnet 5.5 rechazan `any` y `tool` forzado con un error 400; con esos modelos, ejecuta el primer paso desde tu código o usa `auto` con strict tool use.\n\nCómo implementarlo:\n```python\nfirst = client.messages.create(\n    model=\"claude-haiku-5-5\", max_tokens=2048, tools=tools,\n    tool_choice={\"type\": \"tool\", \"name\": \"extract_metadata\"},\n    messages=[{\"role\": \"user\", \"content\": contract_text}],\n)\n# append first.content and the tool_result, then continue with:\nnext_turn = client.messages.create(\n    model=\"claude-haiku-5-5\", max_tokens=2048, tools=tools,\n    tool_choice={\"type\": \"auto\"}, messages=messages,\n)\n```",
    keyConcept: "tool_choice forzado para el primer paso y auto en los turnos siguientes",
  },

  "D2-007": {
    question:
      "El agente de productividad de tu equipo necesita un servidor MCP para el sistema interno de tickets, y todo ingeniero debe recibirlo automáticamente al clonar el repositorio. Por otro lado, una ingeniera quiere probar un servidor MCP experimental de búsqueda vectorial en todos sus proyectos sin afectar a nadie más. ¿Dónde debe configurarse cada servidor?",
    options: {
      A: "Ambos en el `.mcp.json` del proyecto, con la entrada experimental marcada `\"disabled\": true` para que el resto la ignore.",
      B: "Ambos en el `~/.claude.json` de cada ingeniero, configurados por un script de incorporación que copia el servidor de tickets a todos.",
      C: "El de tickets en el `.mcp.json` del proyecto, versionado en el repo; el experimental en su ámbito de usuario en `~/.claude.json`.",
      D: "El de tickets en su propio `~/.claude.json` de usuario, y el experimental en un `.mcp.json` que figure en el `.gitignore`.",
    },
    explanation:
      "La C es correcta. El ámbito de proyecto (`.mcp.json` en la raíz del repositorio, bajo control de versiones) es la forma de compartir servidores MCP con el equipo: quien clona el repo los recibe. El ámbito de usuario, guardado en `~/.claude.json`, mantiene un servidor privado para una persona y disponible en todos sus proyectos, lo que encaja con un experimento.\n\nLa A pone un experimento personal en un archivo compartido y se apoya en un campo `disabled` que `.mcp.json` no define. La B hace depender las herramientas compartidas de un script de copia en lugar del control de versiones, así que se desincronizan. La D invierte los ámbitos: el servidor compartido llegaría a una sola persona, y un `.mcp.json` ignorado por git escondería el experimento en un único proyecto. Claude Code también tiene un ámbito local (el predeterminado), guardado en `~/.claude.json` bajo la ruta de un proyecto; sirve para un servidor privado de un solo proyecto, no para uno que ella quiere en todos.\n\nCómo implementarlo:\n```bash\n# Shared: writes .mcp.json in the repo root (commit it)\nclaude mcp add --scope project --transport http tickets https://tickets.internal.example.com/mcp\n\n# Personal, all of her projects: writes ~/.claude.json\nclaude mcp add --scope user vector-search -- npx -y @example/vector-search-mcp\n```",
    keyConcept: "Ámbitos de MCP: proyecto (.mcp.json) para herramientas compartidas, usuario (~/.claude.json) para servidores personales",
  },

  "D2-008": {
    question:
      "Tu equipo quiere versionar un `.mcp.json` que conecte Claude Code con un servidor MCP de GitHub. El servidor necesita un token de acceso personal en un encabezado `Authorization`, y cada desarrollador tiene un token distinto. El borrador de un compañero trae su propio token pegado en el archivo. ¿Cómo debe manejar la credencial la configuración compartida?",
    options: {
      A: "Dejar el token en el archivo, pero agregar `.mcp.json` al `.gitignore` para que cada desarrollador mantenga una copia privada con su token.",
      B: "Mover el token al CLAUDE.md del proyecto, bajo un encabezado «Credenciales», para que Claude lo lea y lo pase al conectarse.",
      C: "Versionar el archivo con el token del compañero y pedirle a cada desarrollador que lo reemplace localmente por el suyo antes de iniciar Claude Code.",
      D: "Versionar el encabezado como `\"Bearer ${GITHUB_TOKEN}\"` y que cada desarrollador defina `GITHUB_TOKEN` en su propio entorno.",
    },
    explanation:
      "La D es correcta. Claude Code expande variables de entorno en `.mcp.json` (en `command`, `args`, `env`, `url` y `headers`), así que el equipo puede versionar un único archivo compartido mientras el secreto de cada desarrollador queda en su propio entorno.\n\nLa A deja de compartir la configuración, lo que anula el sentido del ámbito de proyecto. La B pone un secreto en un archivo versionado que además se carga en el contexto del modelo, y CLAUDE.md no configura conexiones MCP. La C sube un secreto real al control de versiones, donde queda en el historial aunque luego se reemplace en local. Nota de producto: `${VAR:-default}` aporta un valor por defecto, y algunas variables de credenciales, como `ANTHROPIC_API_KEY`, se leen vacías en la `url` y los `headers` de un servidor remoto para que no se filtren a ese servidor.\n\nCómo implementarlo:\n```json\n{\n  \"mcpServers\": {\n    \"github\": {\n      \"type\": \"http\",\n      \"url\": \"https://api.githubcopilot.com/mcp/\",\n      \"headers\": { \"Authorization\": \"Bearer ${GITHUB_TOKEN}\" }\n    }\n  }\n}\n```",
    keyConcept: "La expansión de variables de entorno en .mcp.json mantiene los secretos fuera del control de versiones",
  },

  "D2-009": {
    question:
      "Un ingeniero le pide a tu agente, construido con el Agent SDK y con Read, Write, Edit, Bash, Grep y Glob, que explique cómo fluye una solicitud de pago por un repositorio heredado y desconocido de 4.000 archivos. El primer prototipo leía los archivos uno por uno desde la raíz del árbol y se quedó sin contexto antes de llegar a cualquier código de pagos. ¿Qué estrategia de exploración debería seguir el agente?",
    options: {
      A: "Usar Glob para listar todos los archivos fuente y luego leerlos todos con Read de una vez, para tener el código completo en contexto antes de responder.",
      B: "Usar Bash para concatenar el repositorio en un solo archivo de texto y luego leerlo por partes con Read, de principio a fin, hasta entender el flujo.",
      C: "Buscar con Grep los puntos de entrada, como la ruta o el handler de pagos, y luego leer esos archivos con Read siguiendo sus imports paso a paso.",
      D: "Leer solo el README y la estructura de carpetas, y responder a partir de las convenciones de nombres sin abrir el código, para ahorrar contexto.",
    },
    explanation:
      "La C es correcta. Construir la comprensión de forma incremental, con Grep para encontrar los puntos de entrada y Read para seguir los imports desde ahí, gasta contexto solo en los archivos que importan para el flujo de pagos.\n\nLa A y la B repiten el error del prototipo de leer todo de entrada: cargan miles de archivos, o uno gigantesco, y se quedan sin contexto. La D ahorra contexto a costa de no mirar el código, así que la explicación es una conjetura. Nota de producto: en Claude Code interactivo sobre macOS, Linux y WSL, Glob y Grep quedan fuera del conjunto de herramientas por defecto y las búsquedas corren como `grep` o `find` a través de Bash; nombrarlas en `allowedTools`, como hace este agente, las recupera, y la estrategia es la misma en ambos casos.\n\nCómo implementarlo:\n```text\n1. Grep  pattern=\"router\\.(post|put)\\(['\\\"]/payments\"   output_mode=files_with_matches\n2. Read  src/routes/payments.ts          -> imports PaymentService\n3. Read  src/services/payment-service.ts -> imports gateway/stripe-adapter\n4. Read  src/gateway/stripe-adapter.ts   -> end of the flow\n```",
    keyConcept: "Exploración incremental: Grep para los puntos de entrada y Read siguiendo los imports",
  },

  "D2-010": {
    question:
      "Antes de migrar de framework de pruebas, tu agente debe listar todas las pruebas de componentes React de un monorepo. Las pruebas están junto a sus componentes en decenas de paquetes y todas siguen el patrón de nombre `*.test.tsx`. Algunas no importan directamente la librería de pruebas porque usan un helper compartido. ¿Qué herramienta integrada corresponde a este paso?",
    options: {
      A: "Grep de `@testing-library/react` en todo el repositorio, porque toda prueba de componente tiene que importar ese paquete en algún lugar.",
      B: "Read del `package.json` raíz y de la configuración de cada workspace, para averiguar dónde guarda cada paquete sus pruebas de componentes.",
      C: "Bash con un script propio que recorra el árbol de carpetas y abra cada archivo para comprobar si contiene un bloque `describe(`.",
      D: "Glob con el patrón `**/*.test.tsx`, porque el conjunto buscado lo define el nombre del archivo, no algo que esté dentro de los archivos.",
    },
    explanation:
      "La D es correcta. Glob encuentra archivos por patrón de nombre o extensión, y aquí el requisito es un patrón de nombre, así que `**/*.test.tsx` devuelve exactamente el conjunto buscado a cualquier profundidad.\n\nLa A busca en el contenido, y el enunciado ya dice que algunas pruebas importan la librería solo a través de un helper compartido, así que Grep las perdería. La B busca en configuración que no enumera archivos de prueba. La C reconstruye Glob a mano, abre cada archivo sin necesidad, y un `describe(` no es lo que define una prueba de componente. Nota de producto: Glob limita los resultados a 100 archivos, así que en un monorepo grande quizá debas acotar el patrón por paquete; y en Claude Code interactivo sobre macOS y Linux, la misma búsqueda corre como `find` a través de Bash salvo que Glob esté habilitado.\n\nCómo implementarlo:\n```json\n{ \"tool\": \"Glob\", \"input\": { \"pattern\": \"packages/**/*.test.tsx\" } }\n```",
    keyConcept: "Glob para patrones de nombre de archivo; Grep para el contenido",
  },

  "D2-011": {
    question:
      "Tu subagente de búsqueda web descarga 8 fuentes para un subtema. Dos descargas fallan con un 503 «service temporarily unavailable»; las otras seis funcionan. Hoy el subagente devuelve de inmediato un error al coordinador, que vuelve a despachar todo el subtema y repite las seis descargas que ya habían funcionado. ¿Cómo debería manejar esto el subagente?",
    options: {
      A: "Reintentar en local las dos descargas con espera creciente; si siguen fallando, devolver los seis resultados, qué fuentes fallaron y qué se intentó.",
      B: "Devolver solo los seis resultados exitosos y reportar éxito total sin mencionar los fallos, para que el coordinador no tenga trabajo adicional.",
      C: "Seguir reintentando las dos descargas fallidas el tiempo que haga falta, para que el coordinador reciba siempre los ocho resultados completos.",
      D: "Seguir escalando los errores 503 al coordinador de inmediato, pero pedirle que asigne menos fuentes por subtema para que fallen menos.",
    },
    explanation:
      "La A es correcta. Un 503 es transitorio, así que el subagente debe recuperarse localmente primero y propagar al coordinador solo lo que no pudo resolver, junto con sus resultados parciales y lo que intentó. Así el coordinador decide si seis fuentes bastan o si conviene otra alternativa, sin repetir trabajo que ya salió bien.\n\nLa B oculta el fallo: el coordinador cree que la cobertura está completa cuando faltan dos fuentes. La C no tiene límite: una caída larga bloquea toda la investigación. La D mantiene el escalamiento costoso y cambia la carga de trabajo en lugar del manejo de errores.\n\nCómo implementarlo:\n```typescript\nconst results = await Promise.all(urls.map(u => fetchWithRetry(u, { retries: 3, backoffMs: 500 })));\nconst ok = results.filter(r => r.ok);\nconst failed = results.filter(r => !r.ok).map(r => ({ url: r.url, error: \"503\", attempts: 4 }));\nreturn { findings: ok.map(r => r.data), partial: failed.length > 0, failed };\n```",
    keyConcept: "Recuperación local de errores transitorios en subagentes; propagar solo lo no resuelto con resultados parciales",
  },

  "D2-012": {
    question:
      "El agente de análisis de documentos tiene dos herramientas con descripciones casi idénticas: `analyze_content` («Analiza contenido y extrae la información clave»), que solo procesa fragmentos devueltos por la búsqueda web, y `analyze_document` («Analiza un documento y extrae la información clave»), que procesa PDF del archivo. Las trazas muestran que cerca de un tercio de los PDF del archivo se enrutan a `analyze_content`, y esas llamadas devuelven resultados ilegibles. ¿Cuál es la corrección más eficaz?",
    options: {
      A: "Eliminar `analyze_content`, porque se superpone con `analyze_document`, y dejar que la herramienta de documentos procese también los fragmentos web.",
      B: "Agregar al prompt de sistema la línea «prefiere analyze_document para todo lo que parezca un documento», para que el agente desempate.",
      C: "Renombrar `analyze_content` a `extract_web_results` y decir en su descripción que solo acepta fragmentos de búsqueda, nunca archivos.",
      D: "Agregar un parámetro `source_type` a ambas herramientas y devolver un error de validación cuando no coincida con la herramienta llamada.",
    },
    explanation:
      "La C es correcta. Las dos herramientas se superponen en nombre y descripción, así que el modelo no tiene ninguna señal para distinguirlas. Renombrar la herramienta web y reescribir su descripción en torno a su entrada real (fragmentos de resultados de búsqueda, no archivos) elimina la superposición funcional que causa el enrutamiento erróneo.\n\nLa A elimina una capacidad: `analyze_document` no se diseñó para fragmentos web, así que esos resultados empeorarían. La B agrega una instrucción vaga y sensible a palabras clave; las páginas web también «parecen documentos», así que crea un nuevo tipo de error de enrutamiento. La D detecta el error después de una llamada desperdiciada y deja la ambigüedad intacta.\n\nCómo implementarlo:\n```typescript\n{\n  name: \"extract_web_results\",\n  description: \"Extracts facts from web search result snippets (title, url, snippet text) \" +\n    \"returned by web_search. Input: the raw results array. Does NOT accept PDFs, \" +\n    \"archive files or document IDs; use analyze_document for those.\",\n  input_schema: { type: \"object\", properties: { results: { type: \"array\" } }, required: [\"results\"] },\n}\n```",
    keyConcept: "Renombrar herramientas y reescribir descripciones para eliminar la superposición funcional",
  },

  "D3-001": {
    question:
      "Priya prefiere cláusulas de guarda con retorno temprano y mensajes de commit detallados. Trabaja en seis repositorios, cada uno con su propio CLAUDE.md versionado, y sus compañeros no comparten esas preferencias. Quiere que Claude Code las aplique en todos los repositorios sin cambiar nada de lo que cargan sus compañeros. ¿Dónde debe escribirlas?",
    options: {
      A: "En el `CLAUDE.md` raíz de cada repositorio, bajo un encabezado de preferencias personales",
      B: "En el `.claude/CLAUDE.md` de cada repositorio, versionado para que la preferencia persista",
      C: "En `~/.claude/CLAUDE.md`, el archivo de usuario que se carga para ella en todos los proyectos",
      D: "En un archivo `.claude/rules/priya.md` en cada repositorio, sin frontmatter `paths`",
    },
    explanation:
      "La C es correcta: `~/.claude/CLAUDE.md` es el archivo de nivel de usuario. Se carga en todos los proyectos de su máquina y no se comparte por control de versiones, así que sus compañeros nunca lo ven. La A y la B son archivos de nivel de proyecto: una vez versionados, todos los compañeros los cargan. La D pone la preferencia en el directorio `.claude/rules/` del proyecto, que también se versiona, y una regla sin campo `paths` se carga en todas las sesiones de todos. Nota de producto: `CLAUDE.local.md` es otra opción personal, pero es por proyecto, así que necesitaría seis copias.\n\nCómo implementarlo:\n```markdown\n<!-- ~/.claude/CLAUDE.md (personal, not in any repo) -->\n## My preferences\n- Prefer early-return guard clauses over nested if/else\n- Write commit messages with a summary line and a body explaining why\n```",
    keyConcept: "El CLAUDE.md de usuario (~/.claude/CLAUDE.md) guarda preferencias personales que no se comparten con el equipo",
  },

  "D3-002": {
    question:
      "Un monorepo guarda 90 líneas de convenciones de Terraform en `.claude/rules/terraform.md`, sin frontmatter. Todos los archivos de Terraform están en `infra/`. Los desarrolladores de front-end, que nunca tocan `infra/`, ven esas reglas cargadas en todas sus sesiones, y Claude a veces aplica nombres al estilo Terraform a su código React. ¿Cuál es la corrección más precisa?",
    options: {
      A: "Mover las reglas de Terraform al CLAUDE.md raíz bajo un encabezado «Solo infraestructura»",
      B: "Convertir las reglas en una skill `.claude/skills/terraform/` que se ejecute a demanda",
      C: "Agregar frontmatter YAML con `paths: [\"infra/**/*\"]` para que cargue solo con esos archivos",
      D: "Importar el archivo con `@.claude/rules/terraform.md` desde `infra/CLAUDE.md` y nada más",
    },
    explanation:
      "La C es correcta: un campo `paths` en el frontmatter YAML de la regla la vuelve condicional. Claude Code la carga solo cuando Claude lee o edita un archivo que coincide, así que las sesiones de front-end dejan de pagar su costo y de recibir su influencia. La A deja las reglas en un archivo que se carga en todas las sesiones y depende de que Claude infiera cuándo aplica un encabezado. La B pierde la aplicación automática: el trabajo de infraestructura dependería de que alguien recuerde invocar la skill. La D no ayuda: el archivo sigue en `.claude/rules/` sin `paths`, así que se sigue cargando para todos; el import solo añade una segunda copia al trabajar en `infra/`.\n\nCómo implementarlo:\n```markdown\n---\npaths:\n  - \"infra/**/*\"\n---\n\n# Terraform conventions\n- Module names use snake_case\n- Every resource has `owner` and `cost_center` tags\n```",
    keyConcept: "Las reglas con paths en el frontmatter se cargan solo con los archivos que coinciden y reducen el contexto irrelevante",
  },

  "D3-003": {
    question:
      "Un monorepo tiene `packages/billing` y `packages/search`, cada uno con su propio CLAUDE.md. Los estándares compartidos están en `docs/standards/`: `security.md`, `pii-handling.md` y `query-performance.md`. Los mantenedores de billing saben que su paquete necesita los archivos de seguridad y de datos personales; los de search solo necesitan el de rendimiento de consultas. ¿Cómo deben incorporar los estándares correctos?",
    options: {
      A: "En el CLAUDE.md de billing, agregar `@../../docs/standards/security.md` y `@../../docs/standards/pii-handling.md`",
      B: "Agregar una línea `@import docs/standards/*` al CLAUDE.md raíz para que todos los paquetes reciban los tres archivos",
      C: "Pegar los tres estándares en el CLAUDE.md raíz y decirle a Claude que ignore lo que no sea relevante",
      D: "Escribir «ver docs/standards/security.md y pii-handling.md» en el CLAUDE.md de billing para que Claude los lea",
    },
    explanation:
      "La A es correcta: los imports de CLAUDE.md usan `@ruta/al/archivo`, y las rutas relativas se resuelven desde el archivo que contiene el import. El CLAUDE.md de cada paquete puede importar solo los estándares que sus mantenedores saben que necesita, lo que mantiene el contexto enfocado. La B usa una sintaxis que no existe (`@import` con un glob) y además daría todos los archivos a todos los paquetes. La C construye el archivo monolítico que los imports buscan evitar y deja la relevancia a la inferencia. La D es texto en prosa: Claude ve ese archivo solo si decide abrirlo, mientras que un import con `@` se expande y se carga junto con el CLAUDE.md.\n\nCómo implementarlo:\n```markdown\n<!-- packages/billing/CLAUDE.md -->\n# Billing package\n@../../docs/standards/security.md\n@../../docs/standards/pii-handling.md\n\n<!-- packages/search/CLAUDE.md -->\n# Search package\n@../../docs/standards/query-performance.md\n```",
    keyConcept: "Los imports con @ruta permiten que el CLAUDE.md de cada paquete incluya solo los estándares que necesita",
  },

  "D3-004": {
    question:
      "Tu job de CI ejecuta `claude -p` en cada push a un pull request abierto y publica cada hallazgo como comentario en línea. Después de que un desarrollador sube dos commits de corrección, el PR muestra tres copias de varios comentarios, incluidos comentarios sobre líneas que ya se corrigieron. Los revisores empiezan a ignorar al bot. ¿Qué cambio resuelve esto de forma más directa?",
    options: {
      A: "Ejecutar la revisión una sola vez por pull request, en el primer push, y omitirla en los siguientes",
      B: "Pasar los hallazgos de la corrida anterior en el prompt y pedir solo problemas nuevos o pendientes",
      C: "Subir el umbral de severidad para que solo se publiquen hallazgos críticos en los pushes siguientes",
      D: "Agregar una regla en CLAUDE.md que diga a Claude que no repita comentarios de corridas anteriores",
    },
    explanation:
      "La B es correcta: cada corrida con `-p` empieza una sesión nueva que no sabe nada de los comentarios anteriores. Darle los hallazgos previos y pedirle que informe solo los problemas nuevos o todavía sin resolver elimina duplicados y comentarios obsoletos, y aun así revisa los commits nuevos. La A deja de revisar las correcciones, que pueden introducir errores nuevos. La C oculta problemas reales no críticos y no evita los duplicados críticos. La D le pide a Claude evitar algo que no puede ver: sin los hallazgos anteriores en el contexto, no tiene forma de saber qué ya dijo.\n\nCómo implementarlo:\n```bash\ngh api repos/$REPO/pulls/$PR/comments --jq '[.[] | select(.user.login==\"review-bot\") | {path, line, body}]' > prior.json\n\ngit diff origin/main...HEAD | claude -p \"Review this diff. prior.json lists findings already posted. Report only issues that are new or still present in the current code; do not repeat fixed ones.\" \\\n  --output-format json --json-schema \"$(cat findings.schema.json)\" > review.json\n```",
    keyConcept: "Al volver a revisar, se incluyen los hallazgos previos y se informan solo los nuevos o no resueltos",
  },

  "D3-005": {
    question:
      "Debes sacar un servicio de un ORM obsoleto. Un primer vistazo muestra que unos 50 archivos lo usan, algunos a través de un repositorio propio y otros con constructores de consultas en crudo, y hay dos estrategias viables: agregar primero una capa adaptadora o reescribir archivo por archivo. Tu líder quiere revisar el enfoque antes de que empiecen las ediciones y tenerlas terminadas hoy. ¿Qué flujo de trabajo encaja?",
    options: {
      A: "Usar ejecución directa desde el inicio y dejar que Claude migre los archivos en el orden en que los encuentre",
      B: "Usar plan mode para explorar los usos y elegir una estrategia, y luego ejecutar el plan aprobado directamente",
      C: "Usar plan mode durante todo el trabajo para que las ~50 ediciones queden en solo lectura hasta terminar",
      D: "Escribir un prompt detallado para la capa adaptadora y ejecutarlo en ejecución directa sin explorar antes",
    },
    explanation:
      "La B es correcta: la investigación tiene peso arquitectónico (muchos archivos, dos estrategias válidas), así que plan mode permite que Claude explore el código y presente un plan sin tocar archivos. Una vez aprobado el plan, la implementación está bien definida y puede hacerse con ejecución directa. La A se compromete con ediciones antes de comparar las estrategias, con riesgo de retrabajo costoso. La C malinterpreta plan mode: es de solo lectura, así que no puede terminar la migración; se sale de él después de aprobar el plan. La D elige una estrategia antes de explorar los dos patrones de uso, así que el prompt puede estar mal para la mitad de los archivos.\n\nCómo implementarlo:\n```bash\nclaude --permission-mode plan\n# > Investigate every use of LegacyORM, compare an adapter shim vs a file-by-file rewrite, and propose a plan\n# Review and approve the plan, then leave plan mode (Shift+Tab) and let Claude execute it\n```",
    keyConcept: "Combinar plan mode para investigar con ejecución directa para implementar el plan aprobado",
  },

  "D3-006": {
    question:
      "La skill versionada de tu equipo, `.claude/skills/review/SKILL.md`, ejecuta la lista estándar de revisión de código. Quieres una versión más estricta para tu propio trabajo que además revise la telemetría faltante, mientras tus compañeros siguen recibiendo el `/review` estándar sin cambios. ¿Qué debes hacer?",
    options: {
      A: "Editar `.claude/skills/review/SKILL.md` para agregar las revisiones de telemetría y subir el cambio",
      B: "Crear `~/.claude/skills/review-strict/SKILL.md`, una copia personal con un nombre distinto",
      C: "Agregar `.claude/commands/review-strict.md` al repositorio y versionarlo para tu propio uso",
      D: "Agregar las revisiones de telemetría al CLAUDE.md del proyecto para que apliquen en cada revisión",
    },
    explanation:
      "La B es correcta: las skills en `~/.claude/skills/` son personales y se cargan solo en tu máquina, y un nombre distinto te mantiene disponible el `/review` del equipo. La A cambia la skill compartida para todo el equipo. La C es de alcance de proyecto: todo lo que se versiona en `.claude/commands/` aparece para cada compañero. La D agrega instrucciones siempre cargadas que todos reciben en cada sesión. Nota de producto: si la skill personal usara el mismo nombre, la documentación actual le da prioridad a la personal sobre la del proyecto para ti, así que perderías acceso a la versión estándar.\n\nCómo implementarlo:\n```markdown\n---\nname: review-strict\ndescription: Team review checklist plus telemetry checks (personal variant)\n---\nRun the checklist in .claude/skills/review/SKILL.md, then also flag any new\nendpoint or job that emits no metrics or structured logs.\n```",
    keyConcept: "Las variantes personales de una skill van en ~/.claude/skills/ con otro nombre para no afectar al equipo",
  },

  "D3-007": {
    question:
      "Tu CLAUDE.md raíz creció a 300 líneas. 140 de ellas son un procedimiento paso a paso para preparar las notas de versión, una tarea que el equipo hace una vez por semana. Los desarrolladores dicen que en las sesiones de programación diarias se siguen los estándares centrales con menos fiabilidad que antes. ¿Cuál es la mejor reestructuración?",
    options: {
      A: "Mover el procedimiento a `~/.claude/CLAUDE.md` solo en la máquina del responsable de versiones",
      B: "Dejar el procedimiento en CLAUDE.md pero moverlo al final bajo un encabezado «Solo versiones»",
      C: "Mover el procedimiento a una skill de proyecto en `.claude/skills/` e invocarla cuando se necesite",
      D: "Moverlo a `docs/release.md` y agregar una línea `@docs/release.md` al CLAUDE.md raíz",
    },
    explanation:
      "La C es correcta: CLAUDE.md es para estándares universales que toda sesión necesita; un flujo semanal de varios pasos pertenece a una skill, que se carga solo cuando se invoca. La A oculta el procedimiento al resto del equipo y además lo sigue cargando en todas las sesiones del responsable de versiones. La B deja 140 líneas en el contexto en cada tarea, que es la causa del problema. La D solo mueve el texto: un archivo importado se carga junto con el CLAUDE.md que lo importa, así que el costo de contexto es el mismo.\n\nCómo implementarlo:\n```markdown\n<!-- .claude/skills/release-notes/SKILL.md -->\n---\nname: release-notes\ndescription: Prepare the weekly release notes from merged PRs\ndisable-model-invocation: true\n---\n1. List PRs merged since the last tag\n2. Group them by area and write user-facing notes\n3. Save to docs/releases/<version>.md\n```",
    keyConcept: "Las skills guardan flujos específicos que se invocan a demanda; CLAUDE.md guarda estándares universales siempre cargados",
  },

  "D3-008": {
    question:
      "Un reporte de error de producción incluye un stack trace que apunta a `parseInvoiceDate()` en `billing/dates.ts`: falla con cadenas ISO que traen un desfase de zona horaria. La función tiene 30 líneas, cuenta con pruebas unitarias y no hace falta cambiar nada más. ¿Cómo debes hacer que Claude Code lo resuelva?",
    options: {
      A: "Entrar en plan mode para que Claude explore el módulo de facturación y proponga opciones antes de editar",
      B: "Usar ejecución directa: darle a Claude el trace y el archivo, corregirlo y correr las pruebas existentes",
      C: "Hacer que el subagente Explore mapee todos los llamadores de la función antes de intentar cualquier cambio",
      D: "Pedirle a Claude que te entreviste sobre los requisitos de manejo de fechas en toda la aplicación",
    },
    explanation:
      "La B es correcta: es una corrección bien entendida, en un solo archivo, con un stack trace claro y pruebas existentes, que es justo para lo que sirve la ejecución directa. La A, la C y la D agregan investigación que la tarea no necesita. Plan mode (A) vale la pena para cambios arquitectónicos o con varios enfoques válidos, no para un error localizado. Mapear todos los llamadores (C) es innecesario porque el contrato de la función no cambia. El patrón de entrevista (D) es para espacios de diseño desconocidos, no para un defecto con causa conocida.\n\nCómo implementarlo:\n```text\nThis stack trace shows parseInvoiceDate() in billing/dates.ts throwing on\n\"2026-03-01T10:00:00+02:00\". Fix it to accept timezone offsets, add a test\nfor that input, and run the billing tests.\n```",
    keyConcept: "Ejecución directa para cambios simples y bien acotados con una causa clara",
  },

  "D3-009": {
    question:
      "Tu pipeline hace que Claude Code genere pruebas para un módulo nuevo y, en un paso posterior del mismo job, revise esas pruebas. El paso de revisión corre con `--continue`, así que retoma la sesión de generación, y aprueba casi todo, incluidas pruebas que verifican el comportamiento equivocado. ¿Cómo debes reestructurar el paso de revisión?",
    options: {
      A: "Mantener `--continue` y agregar «sé crítico con tu propio trabajo anterior» al prompt de revisión",
      B: "Ejecutar la revisión como una nueva llamada `claude -p` que recibe solo el diff y las pruebas",
      C: "Mantener `--continue` y cambiar el paso de revisión a un modelo mayor con más esfuerzo de razonamiento",
      D: "Pedirle al paso de generación que agregue una sección de autorrevisión antes de terminar su trabajo",
    },
    explanation:
      "La B es correcta: una sesión que produjo el código arrastra su propio razonamiento y tiende a confirmarlo. Una nueva invocación de `claude -p` sin `--continue` ni `--resume` inicia una sesión independiente que juzga las pruebas solo a partir del diff y los archivos. La A, la C y la D mantienen al revisor dentro del contexto que escribió las pruebas: una línea en el prompt (A) o un modelo más grande (C) no eliminan ese sesgo, y una autorrevisión (D) es la misma sesión calificándose a sí misma. Nota de producto: la documentación dice lo mismo para el trabajo interactivo, donde `/code-review` revisa un diff en un subagente nuevo que nunca vio la conversación.\n\nCómo implementarlo:\n```bash\n# Step 1: generate\nclaude -p \"Write unit tests for src/pricing/\" --allowedTools \"Read,Write,Bash(npm test *)\"\n\n# Step 2: independent review, new session (no --continue / --resume)\ngit diff origin/main -- tests/ | claude -p \"Review these tests against src/pricing/. Flag tests that assert incorrect behavior.\" --output-format json\n```",
    keyConcept: "Aislamiento de contexto: una instancia independiente revisa mejor que la sesión que escribió el código",
  },

  "D3-010": {
    question:
      "Necesitas una función `normalizePhone()` que maneje prefijos internacionales, extensiones y entradas vacías, y que procese 100 000 números en menos de un segundo. Dos intentos anteriores, hechos a partir de una descripción en prosa, pasaron tu revisión manual y luego fallaron en producción con un caso borde distinto cada uno. ¿Qué enfoque da el avance más confiable?",
    options: {
      A: "Escribir primero pruebas de formatos, casos borde y el límite de tiempo, e iterar sobre sus fallos",
      B: "Reescribir la especificación en prosa con más detalle y pedirle a Claude que la genere de una vez",
      C: "Pedirle a Claude tres implementaciones alternativas y elegir la que se lea más limpia",
      D: "Hacer que Claude la implemente ya y agregar pruebas después para los errores que aparezcan",
    },
    explanation:
      "La A es correcta: un conjunto de pruebas escrito primero, que cubra los formatos esperados, los casos borde y el requisito de rendimiento, le da a Claude una verificación de pasa/falla que puede ejecutar, y compartir las pruebas que fallan guía cada iteración. La B sigue dependiendo de una descripción en prosa que ya se interpretó de forma inconsistente. La C elige por legibilidad, lo que no dice nada de la corrección. La D repite el patrón que falló: los errores se descubren en producción en lugar de antes.\n\nCómo implementarlo:\n```text\nHere is tests/normalizePhone.test.ts: 24 cases (prefixes, extensions, blank and\nnull input) plus a test that 100k numbers finish in under 1 s. Implement\nnormalizePhone() so they pass. Run the tests after each change and fix\nthe failures until all pass.\n```",
    keyConcept: "Iteración guiada por pruebas: escribir las pruebas primero e iterar compartiendo los fallos",
  },

  "D3-011": {
    question:
      "Las migraciones de base de datos están en 14 carpetas de servicio (`services/orders/db/migrations/`, `services/users/db/migrations/`, etc.) y cada mes se agregan servicios nuevos. Toda migración debe ser reversible y evitar bloquear tablas grandes, pero Claude sigue escribiendo migraciones irreversibles. ¿Qué configuración aplica esta convención de la forma más mantenible?",
    options: {
      A: "Agregar un CLAUDE.md en cada carpeta `db/migrations/` y copiarlo en cada servicio nuevo",
      B: "Poner la convención en el CLAUDE.md raíz bajo un encabezado «Migraciones» para todas las sesiones",
      C: "Crear `.claude/rules/migrations.md` con `paths: [\"services/*/db/migrations/**\"]`",
      D: "Agregar `@services/*/db/migrations/RULES.md` al CLAUDE.md raíz para importar cada carpeta",
    },
    explanation:
      "La C es correcta: un único archivo de regla en Markdown con un glob en su frontmatter `paths` cubre todas las carpetas de servicio actuales y futuras, y se carga solo cuando Claude trabaja en una migración que coincide. La A funciona, pero requiere 14 copias más una por cada servicio nuevo, que terminarán divergiendo. La B carga la convención en todas las sesiones, incluidas las muchas que nunca tocan migraciones, y depende de que Claude infiera cuándo aplica. La D no es válida: los imports con `@` reciben una ruta de archivo, no un glob, y un import cargaría el contenido en todas las sesiones de todos modos.\n\nCómo implementarlo:\n```markdown\n<!-- .claude/rules/migrations.md -->\n---\npaths:\n  - \"services/*/db/migrations/**\"\n---\n# Migration rules\n- Every migration has a working down() step\n- Add indexes with CONCURRENTLY; never lock tables over 1M rows\n```",
    keyConcept: "Las reglas con glob superan a los CLAUDE.md por directorio para convenciones repartidas en muchas carpetas",
  },

  "D3-012": {
    question:
      "Le pides a Claude Code un conversor de una exportación CSV heredada al formato JSON de tu API. Tu explicación en prosa («une los campos de nombre, normaliza las fechas, anida la dirección») produjo tres interpretaciones distintas en varios intentos: una pierde los segundos nombres y otra deja las fechas como texto. ¿Qué debes hacer ahora?",
    options: {
      A: "Ampliar la prosa con una redacción más estricta y agregar mayúsculas de énfasis a cada regla",
      B: "Pedirle a Claude que deduzca el formato destino leyendo el código del handler de la API primero",
      C: "Dividir el pedido en tres prompts: primero los nombres, luego las fechas y luego la dirección",
      D: "Dar 2 o 3 filas CSV de ejemplo con el JSON exacto que esperas, incluidos los casos borde",
    },
    explanation:
      "La D es correcta: cuando la prosa se interpreta de forma inconsistente, dos o tres pares concretos de entrada y salida son la manera más eficaz de mostrar la transformación, e incluir un segundo nombre y un formato de fecha raro fija exactamente los casos que fallaron. La A agrega más de la misma prosa ambigua; el énfasis no elimina la ambigüedad. La B puede revelar los nombres de los campos, pero no las reglas de transformación, como la forma de unir los nombres. La C divide el trabajo pero deja cada parte igual de ambigua.\n\nCómo implementarlo:\n```text\nInput:  \"Ana\",\"María\",\"Pérez\",\"03/01/2026\",\"Calle 50\",\"Panamá\"\nOutput: {\"name\":\"Ana María Pérez\",\"createdAt\":\"2026-01-03\",\n         \"address\":{\"street\":\"Calle 50\",\"city\":\"Panamá\"}}\n\nInput:  \"Luis\",\"\",\"Gómez\",\"12/11/2025\",\"\",\"\"\nOutput: {\"name\":\"Luis Gómez\",\"createdAt\":\"2025-11-12\",\"address\":null}\n```",
    keyConcept: "Los ejemplos concretos de entrada y salida aclaran transformaciones que la prosa deja ambiguas",
  },

  "D4-001": {
    question:
      "Un extractor de riesgos contractuales marca cláusulas para el equipo legal. Su prompt dice: \"Marca las cláusulas riesgosas. Sé conservador y marca solo las cláusulas de las que estés muy seguro.\" Tras dos semanas, los abogados descartan el 70% de las marcas: la confidencialidad estándar y los términos de pago rutinarios aparecen junto a límites de responsabilidad realmente inusuales, y los abogados ya pasan por alto todas las marcas. ¿Qué cambio mejora más directamente la precisión?",
    options: {
      A: "Reemplazar la frase sobre confianza por categorías: marcar límites de responsabilidad bajo $50k, renovación automática sin salida y cesión de PI; omitir el texto estándar.",
      B: "Endurecer la instrucción a \"marca solo cláusulas de las que tengas al menos 90% de certeza\" y exigir un puntaje numérico de confianza en cada marca.",
      C: "Agregar ejemplos few-shot con el formato deseado de cada marca (número de cláusula, texto citado, motivo) para que los abogados revisen más rápido.",
      D: "Hacer que una segunda pasada de Claude relea cada marca y borre las que considere de bajo riesgo, conservando la definición actual de cláusula riesgosa.",
    },
    explanation:
      "La causa raíz es que \"riesgosa\" nunca se define, así que el modelo aplica su propio umbral. La opción A indica qué categorías reportar y cuáles omitir, y eso es lo que sube la precisión. La opción B es filtrado por confianza: la guía señala que frases como \"sé conservador\" o \"solo alta confianza\" no mejoran la precisión, porque la confianza del modelo no está anclada a la definición de los abogados. La opción C corrige el formato de las marcas, no qué cláusulas califican. La opción D repite la pasada con la misma definición vaga, así que sus borrados son tan arbitrarios como las marcas originales y el costo se duplica. Una tasa alta de falsos positivos también erosiona la confianza en las marcas correctas; por eso importa corregir los criterios.\n\nCómo implementarlo:\n```typescript\nconst systemPrompt = `Flag a clause ONLY if it matches one of these categories:\n1. Liability cap below $50,000\n2. Automatic renewal without an opt-out window\n3. Assignment of client IP to the vendor\nDo NOT flag: confidentiality boilerplate, standard Net-30/60 payment terms, governing-law clauses.\nFor each flag return: clause number, quoted text, category (1-3).`;\n```",
    keyConcept: "Criterios categóricos explícitos, no frases de confianza, suben la precisión",
  },

  "D4-002": {
    question:
      "Tu revisor de CI ya devuelve los hallazgos mediante una herramienta `report_finding` cuyo esquema exige `file`, `line`, `issue`, `severity` y `suggested_fix`. Todas las respuestas son válidas según el esquema, pero los desarrolladores se quejan de que la calidad varía: algunos `suggested_fix` solo dicen \"considera refactorizar\" y otros dan un cambio de código concreto, y problemas similares reciben severidades distintas. Las instrucciones escritas y detalladas sobre ser específico no han ayudado. ¿Qué deberías agregar?",
    options: {
      A: "Endurecer el esquema: agregar `minLength: 80` a `suggested_fix` y un enum para `severity` para que la API rechace las correcciones vagas.",
      B: "Repetir las instrucciones de especificidad en mayúsculas al inicio y al final del prompt de sistema para que el modelo no las pase por alto.",
      C: "Bajar la temperatura a 0 para que el mismo tipo de problema produzca siempre la misma redacción y la misma severidad en todas las revisiones.",
      D: "Agregar 2–4 hallazgos de ejemplo con ubicación, problema, severidad y corrección concreta en código, incluido un caso límite con su razonamiento.",
    },
    explanation:
      "La estructura ya la garantiza el esquema de la herramienta; lo que varía es el contenido. Cuando las instrucciones detalladas por sí solas producen resultados inconsistentes, los ejemplos few-shot son la forma más efectiva de mostrar cómo luce un hallazgo accionable, y un ejemplo límite enseña a calibrar la severidad. La opción A no puede imponer que algo sea accionable: una frase larga y vaga pasa igual un control de longitud (y las restricciones de longitud como `minLength` ni siquiera las admite el modo strict de Claude). La opción B repite las mismas instrucciones que ya fallaron. La opción C reduce la aleatoriedad pero no le muestra al modelo qué significa \"específico\", así que sería vago de forma consistente.\n\nCómo implementarlo:\n```typescript\nconst examples = `<example>\nfile: src/cart.ts  line: 42  severity: major\nissue: total is computed before discounts are applied, so the order is charged full price\nsuggested_fix: move applyDiscounts(cart) above computeTotal(cart) on line 40\n</example>\n<example>\nfile: src/log.ts  line: 8  severity: minor\nissue: debug log prints the full request body, including the email address\nsuggested_fix: log only request.id; why minor: internal logs, no secrets\n</example>`;\n```",
    keyConcept: "Los ejemplos few-shot corrigen contenido inconsistente que el esquema no puede imponer",
  },

  "D4-003": {
    question:
      "Un extractor de facturas usa un esquema de herramienta en el que `purchase_order_number` es un string obligatorio. Cerca del 30% de las facturas de proveedores no tiene número de orden de compra. Los auditores descubren que, en esas facturas, el modelo devuelve números de OC verosímiles que no existen en el ERP. ¿Cómo deberías cambiar el diseño?",
    options: {
      A: "Mantener el campo obligatorio y agregar \"nunca inventes valores\" a la descripción de la herramienta, para que el modelo sepa que está prohibido.",
      B: "Agregar un validador que rechace números de OC desconocidos y reintente con el mensaje de error hasta que el modelo devuelva uno real.",
      C: "Mantener el campo obligatorio pero pedirle al modelo que escriba el texto \"PO-UNKNOWN\" cada vez que falte el número de OC.",
      D: "Hacer el campo anulable (`[\"string\", \"null\"]`) e indicarle al modelo que devuelva null cuando la factura no muestre OC.",
    },
    explanation:
      "Un campo obligatorio obliga al modelo a producir un valor aunque la fuente no lo tenga, y eso es justamente lo que provoca la invención. Hacer el campo anulable permite que el esquema exprese \"no está presente\", que es lo que la guía indica para evitar que el modelo invente valores para cumplir campos obligatorios. La opción A deja la presión del esquema y confía en una instrucción que compite con ella. La opción B no puede funcionar: los reintentos fallan cuando la información simplemente no está en el documento, así que el ciclo agota sus intentos o produce otro número inventado. La opción C reemplaza un null tipado por un texto mágico que los sistemas posteriores deben tratar aparte y que puede colarse en los reportes. (El modo strict de Claude también acepta dejar el campo fuera de `required`; la versión anulable mantiene la clave presente en cada registro.)\n\nCómo implementarlo:\n```typescript\nconst schema = {\n  type: \"object\",\n  properties: {\n    invoice_number: { type: \"string\" },\n    purchase_order_number: {\n      type: [\"string\", \"null\"],\n      description: \"PO number exactly as printed. null if the invoice shows none.\",\n    },\n  },\n  required: [\"invoice_number\", \"purchase_order_number\"],\n  additionalProperties: false,\n};\n```",
    keyConcept: "Los campos anulables evitan la invención cuando la fuente puede no tener el dato",
  },

  "D4-004": {
    question:
      "Extraes un `complaint_category` de correos de clientes hacia un conjunto fijo que usan los tableros: billing, shipping, product_defect, account_access. En producción, el 8% de los correos no encaja en ninguna y algunos son demasiado vagos para clasificarlos. Con un enum simple de cuatro valores, el modelo fuerza esos correos a la categoría más cercana y sesga los tableros. ¿Qué cambio de esquema lo corrige y mantiene el campo filtrable por máquina?",
    options: {
      A: "Agregar `other` y `unclear` al enum, más un string anulable `category_detail` que el modelo llena cuando elige `other`.",
      B: "Cambiar el campo a texto libre para que el modelo describa cualquier categoría a su manera, y normalizarlo después con una tabla.",
      C: "Mantener el enum de cuatro valores y agregar un número `confidence` para que los tableros filtren las clasificaciones dudosas.",
      D: "Hacer `complaint_category` opcional para que el modelo lo omita cuando el correo no coincida con ninguno de los cuatro valores.",
    },
    explanation:
      "El patrón enum + \"other\" + detalle mantiene filtrables las categorías conocidas y da a los casos atípicos un lugar honesto, y el valor \"unclear\" cubre los correos demasiado ambiguos para clasificar. La opción B descarta el enum, así que los tableros deben conciliar infinitas variantes de escritura. La opción C conserva la clasificación forzada; un número de confianza no dice a qué categoría pertenece realmente el correo. La opción D vuelve indistinguible \"no encajó\" de \"demasiado vago\", y el código posterior no puede contar ninguno de los dos.\n\nCómo implementarlo:\n```typescript\nconst schema = {\n  type: \"object\",\n  properties: {\n    complaint_category: {\n      type: \"string\",\n      enum: [\"billing\", \"shipping\", \"product_defect\", \"account_access\", \"other\", \"unclear\"],\n    },\n    category_detail: { type: [\"string\", \"null\"], description: \"Short label when category is 'other', else null\" },\n  },\n  required: [\"complaint_category\", \"category_detail\"],\n  additionalProperties: false,\n};\n```",
    keyConcept: "Enum con 'other' + detalle y 'unclear' para categorías extensibles",
  },

  "D4-005": {
    question:
      "Tu extracción de facturas usa tool use con un esquema strict, así que todas las respuestas se pueden parsear. Luego un validador detecta que en el 6% de los casos las partidas extraídas no suman el `total` extraído; al revisar la fuente, los números están presentes y son correctos en los propios documentos. ¿Qué estrategia de reintento deberías implementar?",
    options: {
      A: "Reenviar la misma solicitud; la variación del muestreo hace que un segundo intento suela producir partidas que sí suman.",
      B: "Activar el modo strict también en los otros esquemas, ya que la decodificación restringida garantiza que los valores sumen.",
      C: "Omitir el reintento y sobrescribir `total` con la suma de las partidas extraídas, para que todo registro pase la validación.",
      D: "Enviar un seguimiento con el documento original, la extracción fallida y el error específico (partidas 1,240 vs. total 1,420).",
    },
    explanation:
      "Es un error semántico, no de sintaxis: el esquema se cumple, pero los valores son inconsistentes. Como los números correctos están en la fuente, un reintento que incluye el documento, la salida fallida y el error de validación preciso le da al modelo lo que necesita para autocorregirse. La opción A no le da información nueva al modelo. La opción B confunde los dos tipos de error: los esquemas strict eliminan los errores de sintaxis pero no impiden valores que no suman. La opción C oculta el error al confiar en la partida que se leyó mal, así que un registro incorrecto queda guardado como válido. Nota de producto: Claude Opus 5.5 y Sonnet 5.5 rechazan `tool_choice` forzado (`any` o `tool`) con un error 400; la guía del examen sigue evaluando la selección forzada, así que el ejemplo usa `claude-haiku-5-5`, que sí la acepta. En los modelos nuevos, usa `auto` con herramientas `strict: true` o salidas estructuradas.\n\nCómo implementarlo:\n```typescript\nconst retry = await client.messages.create({\n  model: \"claude-haiku-5-5\",\n  max_tokens: 2048,\n  tools: [extractInvoiceTool],\n  tool_choice: { type: \"tool\", name: \"extract_invoice\" },\n  messages: [{ role: \"user\", content:\n    `<document>${doc}</document>\\n<previous_extraction>${JSON.stringify(prev)}</previous_extraction>\\n` +\n    `<validation_error>line_items sum to 1240.00 but total is 1420.00. Re-read the line items and correct the extraction.</validation_error>` }],\n});\n```",
    keyConcept: "Reintentar con documento, salida fallida y error específico corrige errores semánticos",
  },

  "D4-006": {
    question:
      "Los reclamos de seguro escaneados llegan de forma continua durante el día. Tu contrato garantiza resultados extraídos dentro de las 30 horas desde la llegada de cada documento, y finanzas exige conservar el descuento del 50% de la Message Batches API. No hay garantía de latencia, así que planifica que cada batch use su ventana completa de 24 horas. ¿Cada cuánto deberías enviar batches?",
    options: {
      A: "Una vez al día a medianoche, para que cada batch sea lo más grande posible y el costo fijo por solicitud sea el menor.",
      B: "Cada 12 horas, lo que reduce a la mitad la espera frente a un batch nocturno y mantiene los batches grandes.",
      C: "Cada 4 horas, para que el peor caso sea unas 4 horas de espera más 24 de procesamiento, dentro del SLA de 30 horas.",
      D: "Dejar de usar batches y llamar a la Messages API síncrona por cada documento al llegar, lo que siempre cumple el SLA.",
    },
    explanation:
      "El peor caso de un documento es el tiempo que espera al siguiente envío más la ventana máxima de procesamiento: intervalo + 24 h debe quedar por debajo de 30 h, así que el intervalo debe ser de 6 h como máximo. Una cadencia de 4 horas (28 h en el peor caso) deja margen para reenviar fallas. La opción A puede llegar a 48 h y la B a 36 h; ambas incumplen el SLA. La opción D cumple el SLA pero renuncia al descuento del 50%, algo que el requisito descarta. La mayoría de los batches termina en menos de una hora, pero no hay garantía de latencia, así que el plan debe suponer las 24 horas completas.",
    keyConcept: "Frecuencia de envío = SLA menos la ventana de procesamiento de 24 horas",
  },

  "D4-007": {
    question:
      "Tu equipo quiere pasar dos trabajos nocturnos a la Message Batches API. El trabajo 1 envía cada archivo modificado con una herramienta `emit_findings` y un `tool_choice` forzado, y lee el input del `tool_use` como resultado. El trabajo 2 es un agente que debe llamar a `run_tests`, leer los resultados y decidir qué corregir. Un compañero dice que los batches \"no admiten herramientas en absoluto\". ¿Cuál es el plan correcto?",
    options: {
      A: "No pasar ninguno: la Batches API rechaza toda solicitud que incluya definiciones de herramientas, así que ambos siguen síncronos.",
      B: "Pasar ambos: la Batches API ejecuta el ciclo del agente por ti, corriendo `run_tests` y devolviendo los resultados.",
      C: "Pasar el trabajo 1 con su herramienta; dejar el 2 síncrono, porque una solicitud en batch no puede ejecutar una herramienta y seguir.",
      D: "Pasar solo el trabajo 2 y cambiar el 1 a modo JSON en el batch, porque el tool_choice forzado no se acepta en batches.",
    },
    explanation:
      "Las solicitudes en batch aceptan definiciones de herramientas, así que una extracción de un solo turno con herramienta forzada funciona: el resultado ya contiene el bloque `tool_use` que necesitas. Lo que un batch no puede hacer es llamar herramientas en varios turnos dentro de una solicitud, porque nada ejecuta `run_tests` y devuelve el resultado a mitad de la solicitud; ese ciclo necesita la API síncrona. La opción A es la idea equivocada del compañero. La opción B inventa un ciclo automático de herramientas que no existe. La opción D falla dos veces: el `tool_choice` forzado funciona en batches y Claude no tiene \"modo JSON\" (la salida estructurada viene de tool use o, en la API actual, de `output_config.format`).",
    keyConcept: "Los batches admiten tool use de un turno, no ciclos de herramientas de varios turnos",
  },

  "D4-008": {
    question:
      "Un desarrollador pide a Claude Code que genere un módulo de rate limiting y, en la misma conversación, le dice: \"Ahora revisa el código que acabas de escribir en busca de bugs.\" La revisión lo aprueba; una semana después, una condición de carrera en la recarga de tokens provoca una caída. El equipo quiere revisiones que detecten problemas así antes del merge. ¿Qué deberían cambiar?",
    options: {
      A: "Seguir revisando en la misma conversación, pero agregar \"sé extremadamente crítico con tu código\" y una lista de concurrencia.",
      B: "Activar el pensamiento extendido con un presupuesto amplio en la generación, para que el modelo razone la concurrencia antes.",
      C: "Pedir a la misma conversación que revise el código tres veces y aprobarlo solo si las tres autorrevisiones no hallan nada.",
      D: "Enviar solo el código y los requisitos a otra instancia de Claude sin acceso a la conversación en la que se generó el código.",
    },
    explanation:
      "En la misma sesión, el modelo conserva el razonamiento que produjo el código, así que tiende a reconfirmar sus propias decisiones. Una instancia independiente que solo ve el código y los requisitos lo revisa sin esos supuestos, y la guía indica que eso detecta problemas sutiles mejor que las instrucciones de autorrevisión o el pensamiento extendido. La opción A sigue siendo autorrevisión con palabras más fuertes. La opción B mejora la generación pero no agrega ninguna verificación independiente. La opción C repite tres veces la misma revisión sesgada.\n\nCómo implementarlo:\n```typescript\nconst review = await client.messages.create({\n  model: \"claude-opus-5-5\",\n  max_tokens: 4096,\n  system: \"You are reviewing code you did not write. Look for concurrency and correctness bugs.\",\n  messages: [{ role: \"user\", content: `<requirements>${spec}</requirements>\\n<code>${generatedCode}</code>` }],\n});\n```",
    keyConcept: "Una instancia de revisión independiente supera la autorrevisión en la misma sesión",
  },

  "D4-009": {
    question:
      "Tu revisión de CI ya ejecuta una pasada enfocada por cada archivo modificado y sus hallazgos locales son buenos. Un PR cambió un handler de API para enviar `amount` en centavos mientras el módulo de facturación seguía tratándolo como dólares. Cada archivo se veía correcto por sí solo y ninguna pasada marcó la discrepancia. ¿Cómo deberías ampliar la revisión?",
    options: {
      A: "Unir todos los archivos modificados en un solo prompt grande por PR para que el modelo vea todo junto y no archivo por archivo.",
      B: "Mantener las pasadas por archivo y agregar una pasada de integración aparte que reciba las interfaces y siga el flujo de datos.",
      C: "Pedir a cada pasada por archivo que también considere cómo otros archivos usan su código, adjuntando todo el repositorio.",
      D: "Ejecutar cada pasada por archivo tres veces y conservar solo los hallazgos en los que coincidan al menos dos de las tres.",
    },
    explanation:
      "Las pasadas por archivo son la herramienta correcta para los problemas locales, pero una discrepancia de unidades vive entre archivos. Una pasada de integración aparte, enfocada en las interfaces modificadas y en los datos que las cruzan, es el patrón multipasada que describe la guía. La opción A trae de vuelta la dilución de la atención: un prompt enorme da una cobertura desigual y puede perder los hallazgos locales que ya funcionan. La opción C pide a cada pasada local hacer trabajo de integración sobre todo un repositorio, lo que diluye la atención y duplica el esfuerzo. La opción D vota entre ejecuciones que carecen todas de visibilidad entre archivos, así que el bug sigue sin verse.",
    keyConcept: "Revisión multipasada: pasadas locales por archivo más una pasada de integración",
  },

  "D4-010": {
    question:
      "Un subagente de análisis de documentos extrae `methodology` y `sample_size` (ambos obligatorios) de artículos de investigación. Funciona con artículos que tienen una sección de Métodos dedicada, pero devuelve strings vacíos en artículos que describen sus métodos dentro de la introducción o en los pies de figura. Agregar la frase \"los métodos pueden aparecer en cualquier parte del artículo\" cambió poco. ¿Cuál es el siguiente paso más efectivo?",
    options: {
      A: "Hacer ambos campos opcionales para que el subagente pueda omitirlos, y que el agente de síntesis anote qué artículos no los tenían.",
      B: "Dividir cada artículo en secciones, hacer una extracción por sección y quedarse con la primera sección que devuelva algo.",
      C: "Agregar 2–3 ejemplos few-shot de extracción correcta en artículos cuyos métodos están en el texto o en pies de figura.",
      D: "Ampliar la frase a una lista detallada de cada lugar donde podría aparecer el texto de métodos, ordenada por probabilidad.",
    },
    explanation:
      "La información está presente; el modelo simplemente no la reconoce en estructuras poco familiares. Los ejemplos few-shot que muestran la extracción en estructuras de documento variadas son el remedio que da la guía para extracciones vacías o nulas de campos obligatorios, y se generalizan a estructuras que no se enumeraron. La opción A disfraza un problema de cobertura como dato faltante, aunque los detalles están en los artículos. La opción B pierde el contexto entre secciones (un tamaño de muestra en un pie de figura, un método en la introducción), multiplica el costo, y \"el primero no vacío\" puede quedarse con el valor equivocado. La opción D es más instrucción del tipo que ya falló, y una lista solo cubre los casos que nombra.",
    keyConcept: "Ejemplos few-shot de estructuras variadas corrigen extracciones vacías",
  },

  "D4-011": {
    question:
      "Tu extractor de documentos de préstamos reintenta con retroalimentación del error cada vez que falla la validación. Los logs muestran dos grupos de fallas: (1) fechas devueltas como \"March 3rd\" en lugar de ISO 8601, y (2) `interest_rate` ausente en contratos que dicen \"tasa según el Anexo B\", un anexo que no viene en el envío. Los reintentos corrigen el grupo 1, pero el grupo 2 sigue fallando tras tres intentos. ¿Qué deberías hacer?",
    options: {
      A: "Subir el límite de reintentos a seis para el grupo 2, ya que cada intento incluye el error y el modelo acabará encontrando la tasa.",
      B: "Mantener los reintentos para errores de formato como el grupo 1 y desviar el grupo 2 a un flujo de fuente faltante: el Anexo B no está.",
      C: "Eliminar por completo los reintentos y normalizar todas las fechas en código, porque reintentar no corrige ningún error de extracción.",
      D: "Endurecer el prompt de reintento del grupo 2, diciéndole al modelo que `interest_rate` es obligatorio y que debe devolverlo.",
    },
    explanation:
      "Los reintentos funcionan cuando el error es de formato o de estructura y la información está en el documento; por eso el grupo 1 se corrige. No sirven cuando la información solo existe en un documento externo que no se entregó: ninguna retroalimentación puede producir una tasa que está en el Anexo B. Lo correcto es mantener el ciclo de reintentos para el grupo 1 y detectar el grupo 2 como \"fuente incompleta\" (pedir el anexo o marcarlo para revisión). La opción A gasta tokens y favorece la invención. La opción C descarta un ciclo de reintentos que sí funciona. La opción D presiona al modelo para que invente un valor.",
    keyConcept: "Los reintentos corrigen errores de formato, no información ausente en la fuente",
  },

  "D4-012": {
    question:
      "Tu revisor automático de PR reporta cuatro categorías. Tasas de descarte del último mes: seguridad 6%, bugs de corrección 11%, rendimiento 14% y \"exactitud de comentarios/documentación\" 72%. Los líderes de equipo dicen que los desarrolladores ya pasan por alto todos los hallazgos, incluidos problemas de seguridad reales. ¿Qué deberías hacer primero?",
    options: {
      A: "Desactivar por ahora la categoría de exactitud de documentación y reescribir sus criterios (marcar solo comentarios que contradigan el código).",
      B: "Agregar \"reporta solo hallazgos de los que estés muy seguro\" a todo el prompt para que todas las categorías sean más conservadoras a la vez.",
      C: "Mantener las cuatro categorías pero limitar cada revisión a cinco hallazgos, ordenados por la confianza que declara el modelo.",
      D: "Mover los hallazgos de documentación a una sección colapsada al final del comentario del PR, para que se vean menos pero sigan.",
    },
    explanation:
      "Una sola categoría ruidosa está minando la confianza en las que sí aciertan. Desactivar temporalmente la categoría con muchos falsos positivos devuelve la confianza de inmediato, y reescribir sus criterios (por ejemplo, marcar un comentario solo cuando el comportamiento que describe contradice el código) permite reactivarla cuando sea precisa. La opción B es una instrucción general de confianza, que según la guía no mejora la precisión y además suprimiría hallazgos de seguridad válidos. La opción C usa un orden por confianza que puede desplazar bugs reales. La opción D sigue publicando el ruido que los desarrolladores ya aprendieron a ignorar.",
    keyConcept: "Desactivar temporalmente las categorías con muchos falsos positivos devuelve la confianza",
  },

  "D5-001": {
    question:
      "Tu agente de soporte lleva 90 minutos en una disputa de facturación. Para ahorrar tokens, el harness resume cada turno con más de 20 mensajes de antigüedad. Al final de la sesión, el agente ofrece un crédito de $40, aunque la transcripción muestra que acordó un reembolso de $112.50 en el pedido #8812 antes del 14 de marzo. El historial resumido ahora dice: \"se le prometió al cliente un reembolso parcial pronto\". ¿Qué cambio evita esto de forma más directa?",
    options: {
      A: "Subir el umbral de resumen de 20 a 60 mensajes para que se condensen menos turnos en una sesión típica",
      B: "Pedirle al resumidor más detalle y que conserve los números importantes cuando considere que son relevantes",
      C: "Poner la transcripción completa sin resumir en el system prompt para que el agente relea cada turno en cada solicitud",
      D: "Pasar montos, fechas, IDs y acuerdos a un bloque de hechos del caso que viaje en cada prompt, fuera del resumen",
    },
    explanation:
      "D es la correcta porque el resumen progresivo convierte hechos transaccionales precisos ($112.50, 14 de marzo, #8812) en prosa vaga (\"un reembolso parcial pronto\"). Llevar esos hechos a un bloque estructurado y persistente, que se envía literal en cada solicitud y que el resumidor nunca reescribe, los mantiene exactos sin importar cuánto historial se condense.\n\nA solo retrasa la pérdida: las sesiones largas igual cruzan el umbral más alto. B sigue confiando en un resumidor con pérdida para decidir qué es \"importante\", que es el mismo mecanismo que ya perdió la cifra. C deshace el resumen: vuelve el problema de tokens, y una transcripción muy larga invita errores de \"lost in the middle\".\n\nCómo implementarlo:\n```typescript\ninterface CaseFacts {\n  orderId: string;            // \"8812\"\n  agreedRefund: number | null; // 112.50\n  refundDueBy: string | null;  // \"2026-03-14\"\n  status: \"open\" | \"agreed\" | \"escalated\" | \"resolved\";\n}\n\nfunction buildPrompt(facts: CaseFacts, summary: string, recent: string) {\n  // Facts are never summarized: they travel verbatim on every turn\n  return `<case_facts>\\n${JSON.stringify(facts, null, 2)}\\n</case_facts>\\n` +\n         `<history_summary>\\n${summary}\\n</history_summary>\\n${recent}`;\n}\n```",
    keyConcept: "Conservar los hechos transaccionales en un bloque persistente de hechos del caso, fuera del historial resumido",
  },

  "D5-002": {
    question:
      "Una persona llama y dice: \"Soy Maria Lopez, cancelen mi suscripción, por favor\". get_customer devuelve tres cuentas activas a nombre de Maria Lopez en ciudades distintas. Los logs muestran que hoy el agente elige la cuenta con la actividad más reciente y la cancela. ¿Qué se le debe indicar al agente que haga en su lugar?",
    options: {
      A: "Mantener la regla de la actividad más reciente, pero enviar un mensaje de confirmación cuando se complete la cancelación",
      B: "Pedirle a quien llama un identificador adicional, como el correo o un número de pedido, antes de actuar sobre una cuenta",
      C: "Escalar a un humano cada vez que get_customer devuelva más de una coincidencia, porque la identidad es incierta",
      D: "Elegir la cuenta cuya ciudad coincida con el código de área del teléfono y luego proceder con la cancelación",
    },
    explanation:
      "B es la correcta: cuando una búsqueda devuelve varias coincidencias, el agente debe pedir un identificador adicional en lugar de elegir por heurística. Una pregunta extra resuelve la ambigüedad y mantiene el caso dentro de lo que el agente puede resolver.\n\nA sigue actuando sobre una suposición; la confirmación llega cuando quizás ya se canceló la suscripción de otra persona. C escala de más un caso que el agente resuelve con una pregunta, lo que baja la resolución en el primer contacto. D es solo otra heurística: el código de área del teléfono no indica de forma confiable quién es dueño de la cuenta.\n\nCómo implementarlo (extracto del system prompt):\n```markdown\n## Identity\nIf get_customer returns more than one match, do NOT pick one.\nAsk for one more identifier (email on file, order number, or last 4\ndigits of the payment card) and call get_customer again with it.\nOnly act on an account after exactly one match remains.\n```",
    keyConcept: "Varias coincidencias de cliente exigen pedir otro identificador, no elegir por heurística",
  },

  "D5-003": {
    question:
      "El coordinador concatena las salidas de 12 subagentes en una sola entrada de 70k tokens para el agente de síntesis, en el orden en que terminaron. Los informes usan siempre hallazgos de las dos primeras y las dos últimas salidas, mientras que las del medio, que contienen la evidencia más sólida, casi nunca se citan. Cada salida se revisó y es correcta. ¿Qué deberías cambiar?",
    options: {
      A: "Correr la síntesis 12 veces, una por cada salida de subagente, y luego concatenar las doce secciones resultantes",
      B: "Ordenar las salidas por longitud para que las más cortas vayan primero y las más largas queden al final de la entrada",
      C: "Pedirle al agente de síntesis que lea la entrada dos veces y confirme que consideró la salida de cada subagente",
      D: "Abrir la entrada agregada con un resumen de hallazgos clave y dar a cada detalle de subagente un encabezado explícito",
    },
    explanation:
      "D es la correcta. El patrón (se usan el inicio y el final, se ignora el medio) es el efecto \"lost in the middle\": los modelos procesan bien el inicio y el final de entradas largas y pueden omitir hallazgos de la parte central. Un resumen de hallazgos clave al inicio pone la evidencia más importante en la posición más fuerte, y los encabezados explícitos hacen que cada bloque sea localizable.\n\nA elimina el efecto eliminando la síntesis: doce secciones aisladas no pueden comparar ni conciliar fuentes. B reordena por una propiedad que no tiene que ver con la importancia, así que la evidencia más sólida puede seguir en el medio. C depende de lo que el modelo diga de sí mismo; pedirle que confirme no cambia cómo la posición afecta la atención.\n\nCómo implementarlo:\n```typescript\nfunction buildSynthesisInput(outputs: SubagentOutput[]): string {\n  const keyFindings = outputs.flatMap(o => o.topFindings).slice(0, 15);\n  return [\n    \"## KEY FINDINGS (read first)\",\n    ...keyFindings.map(f => `- ${f.claim} [${f.sourceId}]`),\n    ...outputs.map(o => `\\n## SUBAGENT: ${o.topic}\\n${o.detail}`),\n  ].join(\"\\n\");\n}\n```",
    keyConcept: "Mitigar \"lost in the middle\": hallazgos clave primero y encabezados de sección explícitos",
  },

  "D5-004": {
    question:
      "Para un informe sobre regulación del reciclaje de baterías, el subagente de bases de datos legales falló tras sus reintentos (la API de la fuente estaba caída) y el subagente de patentes obtuvo solo resultados parciales de una fuente con muro de pago. Los otros tres subagentes tuvieron éxito. Luego, los interesados se quejan de que el informe final parece completo y autorizado en temas legales que apenas cubrió. ¿Cómo se debe estructurar la salida de la síntesis?",
    options: {
      A: "Retener el informe completo hasta que todos los subagentes tengan éxito, reintentando las fuentes fallidas hasta que respondan",
      B: "Omitir toda sección cuyas fuentes estén incompletas, para que el informe tenga solo contenido de subagentes exitosos",
      C: "Agregar anotaciones de cobertura que marquen los hallazgos bien sustentados y las áreas con vacíos por fuentes caídas",
      D: "Completar la sección legal con el conocimiento general del agente de síntesis para que el informe no muestre vacíos",
    },
    explanation:
      "C es la correcta. Las anotaciones de cobertura le dicen al lector qué hallazgos se apoyan en fuentes sólidas y qué áreas tienen vacíos porque una fuente no estuvo disponible, de modo que una falla parcial queda a la vista en lugar de moldear las conclusiones en silencio.\n\nA convierte una fuente fallida en un flujo detenido: el antipatrón de \"terminar o bloquear por una sola falla\". B oculta el vacío: el lector no puede saber que los temas legales nunca se investigaron, que es justo la queja inicial. D llena el vacío con contenido sin fuente y hace que el informe parezca más completo de lo que fue la investigación.\n\nCómo implementarlo:\n```typescript\ninterface CoverageNote {\n  topic: string;                         // \"EU legal framework\"\n  status: \"well_supported\" | \"partial\" | \"gap\";\n  reason?: string;                       // \"legal DB unavailable after 3 retries\"\n  sourcesUsed: number;\n}\n// The synthesis prompt requires a \"Coverage\" section built from these notes\n```",
    keyConcept: "Las anotaciones de cobertura en la síntesis exponen los vacíos por fuentes no disponibles",
  },

  "D5-005": {
    question:
      "El primer mensaje de un cliente es: \"Quiero hablar con un humano. No con un bot\". Su cuenta muestra un cobro duplicado sencillo que el agente podría reembolsar con una sola llamada a una herramienta. ¿Qué debe hacer el agente?",
    options: {
      A: "Reembolsar primero el cobro duplicado y luego ofrecer la transferencia si el cliente todavía quiere un humano",
      B: "Explicar que puede corregir cobros duplicados al instante y pedirle al cliente que lo deje intentar antes de transferir",
      C: "Atender la solicitud de inmediato: llamar a escalate_to_human con un breve resumen del caso, sin investigar antes",
      D: "Consultar la cuenta para reunir los detalles del cobro y luego escalar con un diagnóstico completo para el humano",
    },
    explanation:
      "C es la correcta. Una solicitud explícita de hablar con un humano es por sí sola un disparador de escalamiento; el agente debe atenderla de inmediato, sin intentar antes investigar ni resolver. Pasar lo que dijo el cliente mantiene útil el traspaso.\n\nA ignora la preferencia expresada y actúa primero. B es el patrón correcto para un cliente frustrado que no pidió una persona (reconocer, ofrecer resolver, escalar si insiste), pero aquí la solicitud es explícita. D retrasa la transferencia para investigar, que es justo lo que el cliente rechazó.\n\nCómo implementarlo (extracto del system prompt):\n```markdown\n## Escalation\n- If the customer explicitly asks for a human, call escalate_to_human\n  immediately. Do not investigate or attempt a fix first.\n- If the customer is frustrated but has NOT asked for a human and the\n  issue is within your capability, acknowledge it and offer to resolve.\n```",
    keyConcept: "Atender de inmediato la solicitud explícita de un humano, sin investigar antes",
  },

  "D5-006": {
    question:
      "Tu subagente de reembolsos llama a process_refund, que actualiza el registro del pedido y luego agota el tiempo de espera en la pasarela de pago. El coordinador recibe {\"status\": \"error\", \"message\": \"refund failed\"} y ya volvió a correr el reembolso completo dos veces, generando actualizaciones duplicadas del pedido. ¿Qué información, agregada al error, detendría los duplicados de forma más directa?",
    options: {
      A: "Resultados parciales que indiquen que el pedido ya se actualizó y que el estado del pago no está confirmado",
      B: "El código HTTP y el tiempo de respuesta de la llamada fallida a la pasarela, para que el coordinador vea qué salió mal",
      C: "Un indicador retryable: true, para que el coordinador sepa que el timeout fue transitorio y que reintentar es seguro",
      D: "Un mensaje para el cliente que el coordinador pueda transmitir, explicando que el reembolso se retrasa y llegará",
    },
    explanation:
      "A es la correcta. Los duplicados ocurren porque el coordinador no puede ver que una parte de la operación ya se completó. El contexto estructurado de error debe incluir qué se intentó y los resultados parciales; con \"pedido actualizado, pago sin confirmar\", el coordinador puede reintentar solo el paso de pago o consultar su estado en lugar de repetir todo el reembolso.\n\nB agrega detalle de transporte, pero sigue sin decir qué pasos se completaron. C es la opción más tentadora y empeora las cosas: \"reintentable\" sin resultados parciales invita exactamente a la repetición completa que causó los duplicados. D ayuda en la conversación con el cliente, pero no le da al coordinador nada con qué decidir.\n\nCómo implementarlo:\n```typescript\ntype RefundError = {\n  isError: true;\n  failureType: \"transient_timeout\";\n  attempted: { tool: \"process_refund\"; orderId: string; amount: number };\n  partialResults: { orderRecordUpdated: true; paymentStatus: \"unconfirmed\" };\n  alternatives: [\"check_payment_status\", \"retry_payment_only\"];\n};\n```",
    keyConcept: "Los errores estructurados deben incluir qué se intentó y los resultados parciales",
  },

  "D5-007": {
    question:
      "Un ingeniero lleva tres horas usando tu agente de exploración sobre un sistema de facturación heredado. Al principio, el agente identificó las clases InvoiceLedger y RetryScheduler. Ahora sus respuestas contradicen esos hallazgos y describen \"un patrón típico de scheduler\" en lugar de nombrar a RetryScheduler. ¿Qué cambio de diseño contrarresta mejor esto?",
    options: {
      A: "Hacer que el agente anote los hallazgos clave en un archivo scratchpad y lo lea antes de responder lo siguiente",
      B: "Reiniciar la sesión cada hora y pedirle al ingeniero que repita las clases importantes en el primer mensaje",
      C: "Agregar al system prompt una regla que prohíba describir patrones típicos y exija nombrar solo clases concretas",
      D: "Reanudar la sesión antes de cada pregunta nueva para que las tres horas de historial vuelvan a cargarse en contexto",
    },
    explanation:
      "A es la correcta. Las respuestas inconsistentes y las referencias a \"patrones típicos\" en lugar de las clases encontradas antes son la señal de la degradación del contexto en sesiones largas. Un archivo scratchpad conserva los hallazgos clave fuera de la conversación, y leerlo antes de cada respuesta vuelve a poner los datos concretos en una posición fuerte.\n\nB le pasa al ingeniero el trabajo de recordar y pierde todo lo que olvide repetir. C trata el síntoma: el modelo no puede nombrar con fiabilidad lo que ya no retiene bien, así que la regla puede producir nombres equivocados con seguridad. D vuelve a cargar el mismo historial largo y degradado, que es la causa, no la solución.\n\nCómo implementarlo:\n```markdown\n<!-- notes/exploration.md, maintained by the agent -->\n## Confirmed classes\n- InvoiceLedger (src/billing/ledger.ts): append-only, owns totals\n- RetryScheduler (src/billing/retry.ts): custom backoff, NOT a cron\n## Open questions\n- Who calls RetryScheduler.flush()?\n```\nSystem prompt: \"Before answering, read notes/exploration.md. After each discovery, update it.\"",
    keyConcept: "Los archivos scratchpad contrarrestan la degradación del contexto en exploraciones largas",
  },

  "D5-008": {
    question:
      "A mitad de un refactor, una sesión de Claude Code está casi llena. La mayor parte del contexto es salida de decenas de búsquedas con grep y lecturas de archivos, muchas en directorios sin salida. El desarrollador quiere seguir en la misma sesión con las decisiones del refactor intactas. ¿Qué debe hacer?",
    options: {
      A: "Salir, abrir una sesión nueva y pegar los últimos mensajes para que Claude recuerde el plan que se estaba siguiendo",
      B: "Borrar el directorio .claude/ del proyecto para que Claude Code limpie su contexto en caché y arranque más liviano",
      C: "Subir max_tokens de la sesión para que el modelo tenga más espacio para la salida de exploración que falta",
      D: "Ejecutar /compact con instrucciones de conservar las decisiones del refactor, para resumir y liberar espacio",
    },
    explanation:
      "D es la correcta. /compact resume la conversación hasta ese punto y libera contexto en la misma sesión; agregar instrucciones (por ejemplo, \"/compact conserva las decisiones del refactor y la lista de archivos cambiados\") le dice a Claude qué preservar mientras se condensa la salida verbosa de la exploración. Claude Code también compacta solo cerca del límite, pero ejecutarlo tú con instrucciones de enfoque controla qué sobrevive.\n\nA pierde toda decisión que no esté en los últimos mensajes. B borra la configuración del proyecto (settings, comandos, reglas) y no hace nada sobre la conversación en curso. C confunde límites: max_tokens limita la longitud de la salida del modelo, no el tamaño de la ventana de contexto.\n\nCómo implementarlo:\n```text\n/compact Keep: the target module layout, the 6 files already migrated,\nand the decision to keep the legacy adapter until phase 2. Drop grep output.\n```",
    keyConcept: "/compact con instrucciones de enfoque reduce el contexto lleno de salida de exploración",
  },

  "D5-009": {
    question:
      "Tu pipeline de facturas aprueba automáticamente las extracciones con confianza de 0.95 o más y envía el resto a revisores. Tras seis meses, nadie mira el flujo aprobado automáticamente, y finanzas descubre que el campo de impuestos de la plantilla de un proveedor nuevo lleva semanas mal leído. ¿Cómo deberías monitorear el flujo aprobado automáticamente de aquí en adelante?",
    options: {
      A: "Bajar el umbral de aprobación automática a 0.90 para que más facturas lleguen a revisión y los errores se detecten antes",
      B: "Revisar una muestra aleatoria estratificada de extracciones de alta confianza para medir errores y ver patrones nuevos",
      C: "Revisar solo las extracciones de alta confianza que rechacen los sistemas posteriores, porque esas se sabe que están mal",
      D: "Hacer que el modelo vuelva a puntuar cada extracción aprobada y revisar aquellas cuyas dos puntuaciones no coincidan",
    },
    explanation:
      "B es la correcta. Una muestra aleatoria estratificada de extracciones de alta confianza (estratificada por proveedor, plantilla o tipo de documento) da una tasa de error continua y sin sesgo para el flujo que nadie revisa, y hace aparecer patrones de error nuevos, como una plantilla nueva, antes de que se extiendan durante semanas.\n\nA mueve el umbral sin medir nada; una plantilla que se lee mal con seguridad también queda por encima de 0.90. C solo detecta los errores que algún sistema posterior rechaza, y un monto de impuestos mal leído suele pasar la validación. D compara al modelo consigo mismo: una extracción equivocada con seguridad tiende a recibir dos veces la misma puntuación alta.\n\nCómo implementarlo:\n```python\nimport random\ndef daily_audit_sample(auto_approved, per_stratum=10):\n    by_stratum = {}\n    for doc in auto_approved:\n        by_stratum.setdefault((doc.supplier_template, doc.doc_type), []).append(doc)\n    # every stratum is sampled, including new, low-volume templates\n    return [d for docs in by_stratum.values()\n              for d in random.sample(docs, min(per_stratum, len(docs)))]\n```",
    keyConcept: "El muestreo aleatorio estratificado de extracciones de alta confianza mide errores y revela patrones nuevos",
  },

  "D5-010": {
    question:
      "Tu pipeline de investigación corre subagente de búsqueda → subagente resumidor (que comprime cada fuente en tres viñetas) → agente de síntesis. Los revisores ya no pueden saber qué fuente respalda cada afirmación del informe final, aunque el subagente de búsqueda devuelve URLs. ¿Cómo deberías corregirlo?",
    options: {
      A: "Agregar al final del informe una bibliografía con todas las URLs que devolvió el subagente de búsqueda en la corrida",
      B: "Que los subagentes emitan mapeos afirmación-fuente (afirmación, URL, extracto) que resumen y síntesis conserven",
      C: "Pedirle al agente de síntesis que deduzca la fuente probable de cada afirmación a partir del tema y la redacción",
      D: "Quitar el resumidor y pasar el texto completo de cada fuente a la síntesis para que los originales estén en contexto",
    },
    explanation:
      "B es la correcta. La atribución se pierde en el paso de resumen porque los hallazgos se comprimen sin su mapeo afirmación-fuente. Hacer que cada subagente emita mapeos estructurados (afirmación, URL o nombre del documento, extracto de respaldo) y exigir que el resumidor y el agente de síntesis los conserven y fusionen mantiene cada afirmación rastreable de punta a punta.\n\nA enumera las fuentes, pero no dice qué fuente respalda cada afirmación. C le pide al modelo que adivine la atribución, lo que produce citas plausibles pero no verificables. D infla la entrada de la síntesis con documentos completos, suma riesgo de \"lost in the middle\" y sigue sin producir un mapeo explícito.\n\nCómo implementarlo:\n```typescript\ninterface ClaimSource {\n  claim: string;\n  sourceUrl: string;\n  documentTitle: string;\n  excerpt: string;          // verbatim supporting text\n  publishedAt?: string;\n}\n// Summarizer contract: input ClaimSource[] -> output ClaimSource[] (merged, never dropped)\n```",
    keyConcept: "Los mapeos estructurados afirmación-fuente deben sobrevivir al resumen y a la síntesis",
  },

  "D5-011": {
    question:
      "Sobre el ayuno intermitente y la salud metabólica, los subagentes devuelven tres ensayos aleatorizados grandes que coinciden en una pérdida de peso modesta, y dos estudios más pequeños (uno de cohorte observacional) con resultados opuestos sobre la sensibilidad a la insulina. El informe actual lo junta todo en una sola frase segura: \"El ayuno intermitente mejora el peso y la sensibilidad a la insulina\". ¿Cómo se debe estructurar el informe?",
    options: {
      A: "Informar solo los tres ensayos aleatorizados y descartar los estudios de insulina, por ser más chicos y contradictorios",
      B: "Separar los hallazgos bien establecidos de los disputados, conservando la redacción y el diseño de cada estudio",
      C: "Promediar los tamaños de efecto de los cinco estudios y presentar una sola estimación combinada por resultado",
      D: "Mantener la frase única y agregar una advertencia de que algunos hallazgos del informe podrían estar en disputa",
    },
    explanation:
      "B es la correcta. El informe debe tener secciones explícitas que distingan los hallazgos bien establecidos (pérdida de peso, tres ensayos grandes que coinciden) de los disputados (sensibilidad a la insulina, estudios pequeños y contradictorios), conservando cómo cada fuente describió su resultado y el contexto metodológico, como ensayo frente a cohorte observacional.\n\nA oculta evidencia real aunque disputada, así que el lector nunca se entera de que la pregunta sigue abierta. C combina estudios de diseños distintos en un solo número, lo que borra las diferencias metodológicas que el lector necesita. D es una advertencia vaga que no dice qué afirmación está en disputa ni por qué.\n\nCómo implementarlo (extracto del prompt de síntesis):\n```markdown\nStructure the report as:\n## Well-established (consistent, high-quality evidence)\n## Contested or emerging (conflicting or limited evidence)\nFor each finding keep: the source's own wording, study design\n(RCT / cohort / survey), sample size, and the citation.\n```",
    keyConcept: "Separar hallazgos bien establecidos de los disputados, conservando el contexto metodológico",
  },

  "D5-012": {
    question:
      "Tu modelo de extracción entrega una puntuación de confianza por campo. En 2,000 documentos etiquetados, los campos con 0.9 o más aciertan solo el 78% de las veces en contract_end_date, pero el 99% en party_name. Hoy, un único umbral global de 0.9 decide qué campos van a revisión humana. ¿Qué deberías hacer?",
    options: {
      A: "Calibrar un umbral de revisión por campo con el conjunto de validación etiquetado, para enrutar cada campo según su precisión",
      B: "Dejar de usar la confianza del modelo y enviar cada día una proporción aleatoria fija del 30% de documentos a revisión",
      C: "Mantener el umbral global de 0.9 y agregar un prompt que le pida al modelo ser más conservador al puntuar fechas",
      D: "Subir el umbral global a 0.99 para todos los campos, lo que elimina la mayoría de las fechas extraídas con exceso de confianza",
    },
    explanation:
      "A es la correcta. El conjunto etiquetado muestra que la misma puntuación implica precisiones distintas según el campo, así que un umbral global está mal calibrado. Umbrales por campo ajustados con un conjunto de validación etiquetado (por ejemplo, la puntuación a partir de la cual cada campo llega al 98% de precisión observada) dirigen la revisión adonde de verdad ocurren los errores.\n\nB descarta una señal útil y gasta capacidad de revisión en campos que casi siempre están bien. C le pide al modelo que se calibre con palabras; la confianza autoinformada no queda calibrada porque un prompt lo diga, y el resultado igual habría que medirlo. D envía de más party_name, que ya acertaba el 99%, y sigue sin comprobar dónde se vuelve confiable contract_end_date.\n\nCómo implementarlo:\n```python\ndef calibrate_threshold(scores, correct, target=0.98):\n    # lowest threshold whose accepted set meets the target accuracy\n    for t in sorted(set(scores)):\n        kept = [c for s, c in zip(scores, correct) if s >= t]\n        if kept and sum(kept) / len(kept) >= target:\n            return t\n    return None  # field always goes to review\n\nthresholds = {f: calibrate_threshold(val[f].scores, val[f].correct) for f in FIELDS}\n```",
    keyConcept: "Calibrar umbrales de confianza por campo con un conjunto de validación etiquetado",
  },
  "D1-013": {
    question:
      "La semana pasada, tu herramienta de exploración del Agent SDK ejecutó una sesión con nombre, «auth-audit», que mapeó 30 archivos de un módulo de autenticación heredado. Desde entonces, un compañero reescribió `token.ts` y `session.ts`; los otros 28 archivos no cambiaron. Ahora quieres comparar dos enfoques de refactorización que partan de ese análisis, sin que un enfoque influya en el otro. ¿Qué dos acciones son adecuadas? (Selecciona dos.)",
    options: {
      A: "Reanudar «auth-audit» sin comentarios, porque el agente notará por sí solo los archivos reescritos la próxima vez que los lea",
      B: "Reanudar «auth-audit» e indicarle al agente que token.ts y session.ts cambiaron, para que vuelva a leer solo esos dos archivos",
      C: "Probar ambos enfoques de refactorización uno tras otro en la sesión reanudada, para que el segundo aprenda del primero",
      D: "Bifurcar la sesión reanudada con fork_session en dos ramas, una por enfoque de refactorización, desde la base compartida",
    },
    explanation:
      "La opción B es correcta porque la mayor parte del contexto previo sigue siendo válido: 28 de 30 archivos no cambiaron. La regla de la guía es reanudar cuando el contexto previo es mayormente válido e indicarle a la sesión reanudada exactamente qué archivos cambiaron, para que vuelva a analizar esos archivos en lugar de explorar todo de nuevo.\n\nLa opción D es correcta porque fork_session crea ramas independientes a partir de una base de análisis compartida. Cada enfoque de refactorización parte de la misma comprensión del módulo, y ninguna rama ve el razonamiento de la otra.\n\nLa opción A es incorrecta porque la sesión guarda resultados de herramientas desactualizados de token.ts y session.ts. El agente no tiene motivo para releer archivos que cree conocer, así que razonará con el contenido viejo. La guía insiste en informar al agente sobre los cambios en archivos ya analizados.\n\nLa opción C es incorrecta porque ejecutar ambos enfoques en una sola sesión deja que el razonamiento del primero condicione al segundo. Esa es justamente la contaminación que la bifurcación busca evitar.",
    keyConcept: "Reanuda cuando el contexto previo es mayormente válido y nombra los archivos que cambiaron; usa fork_session para explorar enfoques divergentes desde una misma base.",
  },
  "D2-013": {
    question:
      "Tu herramienta MCP `process_refund` devuelve el mismo `{\"error\": \"Operation failed\"}` para cualquier falla: tiempos de espera agotados de la pasarela de pago, ID de pedido mal formados, reembolsos fuera de la ventana de 60 días de la política y llamadas hechas con una credencial sin permiso de reembolso. El agente reintenta todas, incluidas las violaciones de política, y luego les dice a los clientes «algo salió mal». ¿Qué dos cambios le permiten al agente elegir la recuperación correcta? (Selecciona dos.)",
    options: {
      A: "Devolver isError: true con un errorCategory (transient, validation, business o permission) y un mensaje legible para personas",
      B: "Devolver isError: false con un resultado vacío para violaciones de política, para que el agente siga al próximo paso sin reintentar",
      C: "Agregar isRetryable: false y una explicación apta para el cliente al error de la ventana de 60 días, para que el agente pare y explique",
      D: "Mantener el mensaje genérico pero subir el límite de reintentos del agente, para que los timeouts transitorios terminen pasando",
    },
    explanation:
      "La opción A es correcta porque el indicador isError de MCP le dice al agente que la llamada falló, y una categoría le dice por qué. Un timeout pide un reintento; un ID mal formado, corregir la entrada; un error de permisos, escalar; y una violación de política, una explicación. La guía nombra estas cuatro categorías y advierte que las respuestas uniformes del tipo «Operation failed» impiden una recuperación adecuada.\n\nLa opción C es correcta porque una violación de regla de negocio fallará cada vez que se reintente. Marcarla con isRetryable: false evita intentos inútiles, y una explicación apta para el cliente le permite al agente decirle por qué no se puede procesar el reembolso en lugar de «algo salió mal».\n\nLa opción B es incorrecta porque reporta una falla como éxito. El agente podría decirle al cliente que el reembolso se hizo, y nada registra que la política lo bloqueó.\n\nLa opción D es incorrecta porque más reintentos solo agregan desperdicio: tres de los cuatro tipos de falla nunca tendrán éxito al reintentar, y el agente sigue sin poder distinguirlos.",
    keyConcept: "Devuelve isError con una categoría y si es reintentable, para que el agente reintente errores transitorios, corrija los de validación y explique las violaciones de reglas de negocio.",
  },
  "D3-013": {
    question:
      "Una persona recién contratada clona el repositorio y descubre que Claude Code ignora las convenciones de API que el resto del equipo sí recibe. Resulta que esas convenciones viven en el `~/.claude/CLAUDE.md` del líder técnico. Mientras tanto, el CLAUDE.md raíz creció a 600 líneas que cubren pruebas, diseño de API y despliegue, y sus ediciones suelen entrar en conflicto. ¿Qué dos acciones resuelven el problema y mantienen la configuración mantenible? (Selecciona dos.)",
    options: {
      A: "Pedirle a la nueva persona que copie el ~/.claude/CLAUDE.md del líder técnico en su propio directorio personal para igualarlos",
      B: "Mover las convenciones de API a un nuevo docs/CLAUDE.md, para que se carguen con cualquier archivo de todo el repositorio",
      C: "Mover las convenciones de API a la configuración del proyecto versionada, para que cada clon las reciba por control de versiones",
      D: "Dividir el CLAUDE.md raíz de 600 líneas en archivos por tema en .claude/rules/, como testing.md y api-conventions.md",
    },
    explanation:
      "La opción C es correcta porque las instrucciones de nivel usuario en ~/.claude/CLAUDE.md solo aplican a ese usuario y nunca se comparten por control de versiones. Las convenciones del equipo van en la configuración de nivel proyecto (CLAUDE.md raíz, .claude/CLAUDE.md o un archivo versionado en .claude/rules/), que recibe cada clon.\n\nLa opción D es correcta porque la guía recomienda dividir un CLAUDE.md grande en archivos enfocados por tema dentro de .claude/rules/. Cada tema es más fácil de mantener y editar, lo que reduce los cambios en conflicto.\n\nLa opción A es incorrecta porque una copia privada no está versionada: se desfasa a medida que el líder técnico edita la suya, y cada nueva contratación enfrentará el mismo problema.\n\nLa opción B es incorrecta porque un CLAUDE.md en un subdirectorio es configuración de nivel directorio: se carga cuando Claude trabaja con archivos de docs/, no con el código del resto del repositorio.",
    keyConcept: "Las instrucciones del equipo van en la configuración del proyecto versionada, no en ~/.claude/CLAUDE.md; divide un CLAUDE.md grande en archivos por tema en .claude/rules/.",
  },
  "D4-013": {
    question:
      "El prompt de revisión de tu CI dice: «Revisa este PR con cuidado. Sé conservador y reporta solo hallazgos de alta confianza». Los desarrolladores igual descartan la mayoría de los comentarios: detalles de estilo, preferencias de nombres y alertas sobre patrones que el código usa en todas partes. Ahora también empezaron a ignorar los reportes de bugs reales. ¿Qué dos cambios mejoran más la precisión y la confianza? (Selecciona dos.)",
    options: {
      A: "Reemplazar la instrucción por criterios explícitos: reportar bugs, fallas de seguridad y pérdida de datos; omitir estilo y patrones locales",
      B: "Desactivar por un tiempo las categorías de estilo y nombres mientras reescribes sus criterios, para recuperar la confianza en el resto",
      C: "Reforzar la redacción a «Sé extremadamente conservador; reporta solo hallazgos con más de 95 % de certeza de ser reales»",
      D: "Pedirle a Claude que califique cada hallazgo del 1 al 10 y publicar solo los que califique con 9 o más, descartando los demás",
    },
    explanation:
      "La opción A es correcta porque la guía dice que los criterios categóricos explícitos, que indican qué problemas reportar y cuáles omitir, mejoran la precisión, mientras que instrucciones generales como «sé conservador» no lo hacen. El modelo necesita saber qué cuenta como hallazgo, no cuán prudente debe sentirse.\n\nLa opción B es correcta porque las categorías con muchos falsos positivos minan la confianza en las categorías precisas. Apagarlas mientras mejoras sus prompts recupera de inmediato la confianza en los hallazgos de bugs y seguridad.\n\nLa opción C es incorrecta porque es la misma instrucción vaga dicha con más fuerza. Sigue sin decir qué tipos de problemas importan, así que el ruido de estilo y nombres continúa.\n\nLa opción D es incorrecta porque es un filtro basado en confianza, que la guía contrapone a los criterios específicos. Una autocalificación sin calibrar no define qué reportar, y un detalle de estilo puede recibir un 9 con la misma facilidad que un bug real.",
    keyConcept: "Define qué categorías de problemas reportar y cuáles omitir; la prudencia vaga o los filtros de confianza no suben la precisión, y las categorías ruidosas pueden pausarse para recuperar la confianza.",
  },
  "D4-014": {
    question:
      "El esquema de tu herramienta de extracción de contratos marca `renewal_terms` como string obligatorio y `governing_law` como un enum de 12 códigos de jurisdicción por los que se agrupan los reportes posteriores. Los revisores encuentran términos de renovación inventados en contratos que no tienen cláusula de renovación, y los contratos regidos por una jurisdicción fuera de la lista terminan forzados al valor del enum más cercano. ¿Qué dos cambios de esquema corrigen estos errores? (Selecciona dos.)",
    options: {
      A: "Mantener renewal_terms obligatorio pero agregar «nunca inventes valores» a la descripción, ya que los campos obligatorios deben llenarse",
      B: "Hacer renewal_terms anulable (type [\"string\", \"null\"]) para que el modelo devuelva null cuando el contrato no tiene esa cláusula",
      C: "Agregar «other» al enum de governing_law, más un string governing_law_detail que registre la jurisdicción que no está en la lista",
      D: "Cambiar governing_law a un string de texto libre sin enum, para que los reportes interpreten el nombre que use cada contrato",
    },
    explanation:
      "La opción B es correcta porque la guía dice que los campos que la fuente podría no contener deben ser opcionales o anulables. Un string obligatorio obliga al modelo a producir algo, y de ahí salen los términos de renovación inventados.\n\nLa opción C es correcta porque el patrón «other» más un string de detalle conserva los 12 códigos por los que agrupan los reportes y les da a las jurisdicciones no listadas un lugar honesto, en vez de meterlas en el valor más cercano.\n\nLa opción A es incorrecta porque el esquema sigue exigiendo un valor. Una instrucción en la descripción compite con un requisito estructural, y el requisito estructural gana con la frecuencia suficiente para seguir produciendo invenciones.\n\nLa opción D es incorrecta porque el texto libre rompe la integración posterior: los reportes agrupados por 12 códigos fijos recibirían variantes de escritura y abreviaturas que no pueden agrupar.",
    keyConcept: "Haz anulables los campos que la fuente podría no tener, y usa enum + «other» + detalle para categorías que deben ser consistentes pero extensibles.",
  },
  "D5-013": {
    question:
      "Para un reporte sobre la adopción de autobuses eléctricos, el subagente que genera el reporte recibe cifras de costo de flota por ciudad, noticias recientes sobre retrasos en compras, hallazgos técnicos sobre la autonomía de las baterías y dos estudios de pasajeros con cifras distintas; los hallazgos no traen fechas. El agente lo presenta todo como viñetas uniformes y marca las cifras de pasajeros como una «contradicción». Luego los revisores descubren que los estudios son de 2019 y de 2025. ¿Qué dos cambios mejoran el reporte? (Selecciona dos.)",
    options: {
      A: "Exigir que los subagentes incluyan fechas de publicación o de recolección de datos, para que cifras de años distintos se lean como cambio en el tiempo",
      B: "Indicarle al agente del reporte que conserve solo el estudio de pasajeros más reciente y descarte el antiguo, para no confundir al lector",
      C: "Mantener viñetas uniformes para todo tipo de contenido, ya que un formato consistente facilita comparar todas las secciones",
      D: "Presentar las cifras de costo como tabla, las noticias de compras como prosa y los hallazgos de autonomía como una lista estructurada",
    },
    explanation:
      "La opción A es correcta porque la guía exige fechas de publicación o de recolección en las salidas estructuradas para que las diferencias temporales no se interpreten como contradicciones. Con fechas, las cifras de 2019 y 2025 se convierten en una tendencia.\n\nLa opción D es correcta porque la guía dice que la salida de la síntesis debe presentar cada tipo de contenido de forma apropiada: datos financieros como tablas, noticias como prosa y hallazgos técnicos como listas estructuradas, en lugar de forzar un formato uniforme.\n\nLa opción B es incorrecta porque descarta evidencia creíble y su procedencia. Incluso cuando las fuentes de verdad chocan, la guía pide anotar el conflicto con su atribución, no elegir un valor de forma arbitraria; aquí, además, el estudio antiguo muestra la tendencia.\n\nLa opción C es incorrecta porque mantiene justo el problema contra el que advierte la guía: convertir todo tipo de contenido a un solo formato pierde la estructura que hace legibles las comparaciones financieras y las noticias narrativas.",
    keyConcept: "Incluye fechas en los hallazgos estructurados para que las diferencias de tiempo no se lean como conflictos, y presenta cada tipo de contenido en el formato que le corresponde.",
  },
};
