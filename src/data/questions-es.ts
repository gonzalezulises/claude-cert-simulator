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
      'Cuando Claude emite una llamada a herramienta, establece stop_reason en "tool_use". El bucle de orquestación debe detectar este valor, ejecutar la herramienta y devolver un mensaje con rol de usuario que contiene un bloque tool_result. Solo después de ese intercambio Claude continuará generando. "end_turn" significa que el modelo terminó sin necesitar una herramienta. "max_tokens" y "stop_sequence" no están relacionados con las invocaciones de herramientas.',
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
      "El patrón hub-and-spoke (coordinador-subagente) otorga a cada subagente su propio contexto de conversación aislado. El coordinador resume y transmite solo lo que el subagente necesita, evitando la contaminación de contexto y manteniendo el conteo de tokens manejable. La opción A inunda a los subagentes con datos irrelevantes. La opción C crea un contexto monolítico creciente. La opción D no es una arquitectura multi-agente.",
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
      "La herramienta Task es el mecanismo para lanzar subagentes en el framework agéntico de Claude Code. Debe listarse explícitamente en allowedTools del AgentDefinition; no se incluye por defecto. Sin ella, el agente no puede delegar trabajo a agentes hijos, independientemente de qué otras herramientas estén disponibles. La opción C es incorrecta — el lanzamiento anidado está soportado. Las opciones A y D describen requisitos inexistentes.",
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
      "fork_session es el mecanismo diseñado específicamente para la exploración divergente. Crea una copia independiente de la sesión actual — incluyendo el historial de conversación y el contexto — que puede evolucionar en una dirección diferente sin afectar el original. --resume restaura una sola sesión (no crea ramas). Los archivos CLAUDE.md separados cambian la configuración, no el estado de la sesión. Las tareas secuenciales no pueden ejecutar exploraciones verdaderamente divergentes en paralelo.",
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
      "La guía de ordenamiento basada en prompts (opciones A y C) es probabilística — el modelo puede no cumplir siempre bajo entradas adversariales o casos extremos. Un hook PostToolUse es aplicación programática: se ejecuta en la capa de aplicación y puede inspeccionar el estado para rechazar o redirigir llamadas a herramientas que violen el ordenamiento requerido. La temperatura (opción D) afecta la aleatoriedad, no el cumplimiento de requisitos procedurales.",
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
      "Los hooks PostToolUse interceptan el resultado de la herramienta después de su ejecución y antes de que llegue a Claude. Esta es la capa correcta para la normalización de datos porque opera sobre los datos que fluyen por el pipeline, independientemente de lo que Claude haga después. La opción A depende de que la salida de Claude sea perfecta, lo cual no es confiable. La opción C (PreToolUse) modifica entradas, no salidas. La opción D es inconsistente — la normalización debería ocurrir en cada punto de salida.",
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
      "El prompt chaining es ideal cuando la secuencia de tareas es conocida, determinista y cada paso depende de la salida del paso anterior. Otorga control total sobre el pipeline y permite manejo de errores en cada límite. La descomposición adaptativa dinámica es mejor cuando la estructura de la tarea es desconocida o puede cambiar según los hallazgos intermedios. La ejecución paralela requiere tareas independientes. De un solo disparo no es confiable para trabajo complejo de múltiples pasos.",
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
      "La descomposición adaptativa dinámica permite al agente observar resultados intermedios y decidir qué hacer a continuación según lo que encuentra, incluyendo lanzar nuevas sub-tareas para temas inesperados. Esta es la opción correcta cuando la estructura de la tarea es emergente en lugar de conocida de antemano. El prompt chaining requiere que la estructura esté definida con anticipación. La orquestación estática no puede manejar ramas inesperadas. El encadenamiento secuencial con una plantilla fija no puede adaptarse a tipos de sub-temas variados.",
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
      "--resume acepta un ID de sesión y restaura el historial completo de conversación, permitiendo al agente continuar desde exactamente donde se detuvo. Este es el propósito de la reanudación de sesión. Iniciar una nueva sesión con un resumen (opción A) pierde fidelidad de contexto y puede causar inconsistencias. Re-ejecutar desde el paso 1 es un desperdicio y arriesga efectos secundarios. fork_session es para crear ramas divergentes, no para reanudación lineal.",
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
      "Un hook PostToolUse que bloquea programáticamente la ejecución posterior hasta que llegue una señal de aprobación es la implementación confiable de una compuerta de prerequisito. Opera en la capa de aplicación, no dentro de la generación de Claude, lo que lo hace resistente a la inyección de prompts y al incumplimiento del modelo. La opción A está basada en prompts y no es confiable. max_tokens y stop_sequence interrumpen la generación pero no implementan lógica de compuerta condicional vinculada a la aprobación humana.",
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
      'stop_reason: "end_turn" significa que Claude completó su generación de forma natural — produjo una respuesta completa y no tiene llamadas a herramientas pendientes. El bucle de orquestación debe presentar esta respuesta al usuario. Si se necesitara otra llamada a herramienta, stop_reason sería "tool_use". "max_tokens" indica truncamiento. No existe un estado donde "end_turn" signifique esperar más datos.',
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
      "Un archivo de borrador estructurado (registro de hallazgos) persiste la información clave fuera de la ventana de contexto, permitiendo al coordinador acceder a ella selectivamente sin llevar todo el historial. Este es un patrón estándar para flujos de trabajo agénticos de larga duración. Simplemente actualizar los modelos posterga pero no resuelve el problema. Enviar todos los tokens a los subagentes ubica mal el problema e infla los contextos de los subagentes. Truncar sin resumir pierde información de forma irreversible.",
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
      'Las descripciones de herramientas son el mecanismo principal mediante el cual los LLMs seleccionan herramientas. Las descripciones vagas o superpuestas como "busca documentación interna" vs "busca datos de clientes" son insuficientemente distintivas. La solución es hacer que las descripciones sean inequívocas y específicas sobre lo que cada herramienta hace y no hace. La opción C puede ayudar pero es secundaria a la calidad de la descripción. Las opciones A y D son incorrectas — los nombres de parámetros no impulsan el enrutamiento y el modelo no ignora las descripciones.',
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
      'Las restricciones negativas explícitas ("NO usar para...") en las descripciones de herramientas son muy efectivas porque definen los límites de la herramienta, no solo sus capacidades. El modelo usa tanto señales positivas como negativas para tomar decisiones de enrutamiento. Las descripciones más largas sin claridad no mejoran el enrutamiento (B es incorrecto). El modelo utiliza principalmente las descripciones de herramientas, no solo los system prompts, para la selección de herramientas (C es incorrecto). Omitir las restricciones negativas fue el problema original (D es incorrecto).',
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
      "Las respuestas de error estructuradas de MCP deben usar la bandera isError para señalar errores explícitamente a la capa del modelo de Claude, incluir una descripción legible por humanos en el array content, y llevar metadatos como errorCategory y isRetryable para que el orquestador pueda decidir si reintentar o escalar. Los códigos de estado HTTP (A) son preocupaciones de la capa de transporte, no semántica MCP. Lanzar excepciones (C) no le da a Claude metadatos de error estructurados. Omitir isError (D) significa que Claude puede no reconocer la respuesta como un error.",
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
      "Una limitación de tasa (HTTP 429) es un error transitorio — el servicio no está disponible temporalmente, no está rechazando la solicitud de forma permanente. Clasificarlo como transitorio con isRetryable: true y proporcionar una pista retryAfterSeconds permite al orquestador implementar una estrategia de backoff inteligente. Los errores de validación son para entradas malformadas (B es incorrecto). Los errores de negocio son para restricciones lógicas como fondos insuficientes (C es incorrecto). Los errores de permiso son para fallos de autorización (D es incorrecto). Las limitaciones de tasa son restricciones de capacidad temporales, de ahí el término transitorio.",
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
      "El acceso a herramientas con alcance limitado (4-5 herramientas por agente) es una buena práctica por varias razones: reduce la carga cognitiva del modelo (menos herramientas significa menos confusión), limita el radio de explosión de los errores y aplica el principio de mínimo privilegio. Dar las 18 herramientas a ambos agentes (A) crea ambigüedad y riesgo de seguridad. Tener todas las herramientas en el coordinador (C) rompe la separación de responsabilidades. La asignación aleatoria (D) ignora los requisitos funcionales.",
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
      'tool_choice: { type: "tool", name: "analyze_code" } obliga a Claude a llamar a esa herramienta específica en cada turno, garantizando una salida estructurada para cada revisión. "auto" significa que Claude puede elegir no llamar a ninguna herramienta. "any" significa que Claude debe llamar a una herramienta pero puede elegir cualquiera disponible. "none" deshabilita completamente las llamadas a herramientas. Cuando necesitas una invocación específica garantizada de una herramienta, la selección forzada es la única opción confiable.',
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
      ".mcp.json en la raíz del proyecto es la configuración MCP de alcance de proyecto confirmada en control de versiones, haciendo que los servidores compartidos del equipo estén disponibles para todos los desarrolladores. ~/.claude.json es la configuración a nivel de usuario en la máquina de cada desarrollador, afectando solo a ese usuario y no compartida por git. Las opciones A y B confunden los dos niveles de alcance. La opción D invierte la semántica — la configuración a nivel de usuario debería estar en ~/.claude.json, no en un archivo de proyecto.",
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
      "La expansión de variables de entorno en .mcp.json (usando la sintaxis ${VAR_NAME}) permite que el archivo de configuración sea confirmado de forma segura en control de versiones mientras mantiene los secretos fuera. Los valores reales se suministran a través de variables de entorno que se establecen de forma diferente por entorno. Agregar .mcp.json al gitignore (A) impide el uso compartido del equipo. @import es una característica de CLAUDE.md, no de .mcp.json (C). Los argumentos CLI no son un mecanismo estándar de configuración de servidores MCP (D).",
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
      "Grep está diseñado para la búsqueda de contenido en archivos — encontrar un patrón de importación específico (`from '../utils/auth'`) en muchos archivos es exactamente su caso de uso. Read requeriría cargar cada archivo individualmente y es ineficiente para búsquedas. Bash ejecutando grep omite la optimización de la herramienta incorporada. Glob encuentra archivos por patrón de nombre pero no busca en su contenido. Para buscar contenido en múltiples archivos, Grep es la herramienta incorporada correcta.",
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
      "Glob es la herramienta incorporada correcta para encontrar archivos por patrón de nombre (como `**/*.service.ts`). Coincide eficientemente nombres de archivos en árboles de directorios sin leer el contenido de los archivos. Grep busca el contenido de los archivos, no sus nombres. Bash con find omite innecesariamente las herramientas incorporadas. Read opera en archivos individuales y no puede realizar coincidencias de patrones de nombres en todo un directorio.",
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
      "Un error de negocio representa una violación de una regla específica del dominio — en este caso, que un reembolso no puede exceder el cargo original. Ningún reintento resolverá esto; se necesita una acción diferente (como un reembolso parcial). Un error transitorio es para indisponibilidad temporal del servicio. Un error de validación es para entradas malformadas (tipos incorrectos, campos faltantes). Un error de permiso es para fallos de autorización. La restricción del monto del reembolso es un límite de lógica de negocio, no uno técnico.",
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
      "Las descripciones específicas y diferenciadas son la solución principal para el enrutamiento incorrecto de herramientas. La descripción revisada le dice al modelo exactamente qué maneja fetch_paper (DOIs/IDs de arXiv), la distingue explícitamente de download_content y proporciona la señal de enrutamiento que el modelo necesita. Renombrar ayuda pero es insuficiente sin una buena descripción. Eliminar herramientas limita la funcionalidad. Las reglas del system prompt son secundarias a las descripciones de herramientas y menos confiables.",
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
      "~/.claude/CLAUDE.md es el CLAUDE.md a nivel de usuario que se aplica en todos los proyectos para el usuario actual. Es la ubicación correcta para preferencias personales que deben servir como predeterminadas independientemente del proyecto activo. Los archivos CLAUDE.md a nivel de proyecto en .claude/ anulan o extienden la configuración a nivel de usuario para ese proyecto específico. /etc/claude/ no es una ubicación soportada. CLAUDE.md en la raíz del proyecto es válido pero de alcance de proyecto.",
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
      "Claude carga los archivos CLAUDE.md jerárquicamente: aplica el nivel de usuario, luego la raíz del proyecto, luego los archivos CLAUDE.md de subdirectorios a medida que desciende en los directorios. Colocar un CLAUDE.md dentro de `services/payments/.claude/` asegura que esas reglas solo estén activas cuando Claude está operando en ese subárbol. Agregar todo al archivo raíz ignora el contexto (A). @import incluye archivos incondicionalmente (C). Crear un proyecto separado es excesivo (D).",
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
      "@import es la sintaxis correcta de Claude Code para incluir archivos externos dentro de un CLAUDE.md. Esto permite la configuración modular donde cada preocupación (pruebas, seguridad, APIs) vive en su propio archivo y se compone junto. #include es una directiva del preprocesador de C, no la sintaxis de CLAUDE.md. !import y la sintaxis de doble llave no están soportadas. Usando @import, el equipo puede mantener cada archivo de reglas de forma independiente.",
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
      "-p (--print) es el flag no interactivo que envía un solo prompt y sale, haciéndolo adecuado para pipelines de CI. --output-format json instruye a Claude para que genere en formato JSON para consumo por máquinas. Juntos proporcionan salida JSON no interactiva. --interactive es lo opuesto de lo que CI necesita. --batch y --ci-mode no son flags válidos de Claude Code.",
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
      "--json-schema acepta un archivo de esquema y restringe la salida JSON de Claude Code para que se ajuste a ese esquema. Esto proporciona conformidad de esquema aplicada por máquina en lugar de depender de la adherencia probabilística de Claude. --output-format json asegura el formato JSON pero no valida contra un esquema específico. Incluir el esquema en el prompt está basado en prompts (probabilístico). --structured-output no es un flag CLI válido de Claude Code.",
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
      ".claude/commands/ en la raíz del proyecto es la ubicación para comandos slash de alcance de proyecto que deben compartirse con el equipo a través del control de versiones. ~/.claude/commands/ es para comandos personales que se aplican al desarrollador individual en todos sus proyectos. Las skills (SKILL.md) son para comportamientos agénticos reutilizables con configuraciones específicas de contexto y herramientas, no simples comandos. Incrustar en CLAUDE.md no es el mecanismo correcto para las definiciones de comandos slash.",
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
      "`context: fork` crea un contexto aislado ramificado desde la sesión actual, evitando que la skill contamine o lea la conversación principal. `allowed-tools: [Read, Grep]` limita la skill solo a las herramientas que necesita. `argument-hint: <module-path>` proporciona la pista que se muestra al invocar la skill. La opción A incluye Bash (riesgo de seguridad innecesario) y usa `context: shared` (rompe el aislamiento). Las opciones C y D usan nombres de campos inexistentes.",
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
      'El modo de planificación es la función de Claude Code que hace que presente un plan paso a paso de lo que pretende hacer y espere la aprobación humana antes de ejecutar cualquier modificación de archivos. Esta es la compuerta de seguridad apropiada para operaciones sensibles como la refactorización de autenticación. El modo de ejecución directa realiza cambios de inmediato (A). El "modo de prueba" y el "modo de revisión" no son funciones nombradas de Claude Code; el modo de planificación es el término correcto.',
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
      "Cada invocación de `claude -p` inicia una sesión completamente nueva sin historial de conversación, proporcionando verdadero aislamiento de contexto. La sesión de revisión no puede acceder al razonamiento de la sesión de generación porque son procesos separados con contextos separados. --resume con cualquier ID de sesión restaura una sesión anterior (A). Las instrucciones de \"olvidar lo anterior\" están basadas en prompts y no son confiables (C). --no-cache no es un flag válido de Claude Code y no lograría el aislamiento de sesión (D).",
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
      "La iteración orientada a pruebas es un patrón de refinamiento iterativo donde las pruebas fallidas sirven como especificación. Claude implementa código, ejecuta pruebas, observa fallos y revisa hasta que todas las pruebas pasen. Esto crea un bucle de retroalimentación que converge en el comportamiento correcto. El patrón de entrevista es para reunir requisitos (A). Los ejemplos I/O especifican el comportamiento a través de pares de datos (C) — útil pero no lo mismo que ejecutar pruebas. De un solo disparo no tiene bucle de retroalimentación iterativo (D).",
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
      "El YAML frontmatter en los archivos `.claude/rules/` soporta una clave `paths:` que especifica patrones glob. Cuando Claude está operando en una ruta que coincide con el patrón (como `src/api/**`), la regla se carga; de lo contrario se ignora. Este es el mecanismo integrado para la carga condicional de reglas. @import incluye archivos incondicionalmente. .claudeignore controla qué archivos del proyecto puede ver Claude, no la carga de reglas. Las convenciones de nombres de archivos no controlan la activación de reglas.",
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
      "El patrón de ejemplos I/O es ideal cuando puedes demostrar la transformación con datos concretos. Mostrarle a Claude respuestas de API de muestra (entrada) y la estructura analizada deseada (salida) elimina la ambigüedad y le proporciona una especificación precisa con la que trabajar. La iteración orientada a pruebas requiere escribir código de prueba, lo cual puede ser prematuro. El patrón de entrevista es para la recopilación de requisitos. El prompt chaining resuelve un problema diferente (pipelines de múltiples pasos).",
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
      'Los criterios explícitos y medibles producen salidas consistentes porque le dicen a Claude exactamente qué buscar y cómo estructurar cada hallazgo. Las instrucciones vagas como "identificar cualquier problema" o "ser exhaustivo" dejan demasiado a la interpretación. Los ejemplos few-shot (C) ayudan con la consistencia del formato pero no definen qué buscar. Aumentar la temperatura (D) aumenta la variabilidad, lo que empeora la consistencia, no la mejora.',
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
      "Usar tool_use con un esquema JSON proporciona conformidad estructural garantizada — el modelo debe producir una salida que coincida con el esquema, eliminando completamente la variabilidad de formato. Los ejemplos few-shot (B) mejoran significativamente la consistencia pero siguen siendo probabilísticos. Las instrucciones del prompt (A) son la forma más débil — el modelo puede no seguirlas perfectamente. El post-procesamiento (D) es una solución alternativa, no una solución, y puede omitir casos extremos. Para garantizar la estructura, tool_use con esquema es superior.",
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
      "Hacer `warrantyMonths` opcional (ausente del array `required` en el esquema JSON) permite que esté presente cuando existan datos y omitirlo cuando no. Esto produce datos más limpios que incluir siempre null. La opción B (campo obligatorio que admite nulos) también es válida pero obliga a que el campo siempre aparezca. El valor predeterminado 0 de la opción A confunde \"sin garantía\" con \"desconocido\". La opción D pierde la seguridad de tipo y la información de duración.",
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
      'El patrón "other" + detalle es una buena práctica para la extracción categórica abierta. Preserva el beneficio de un enum restringido (habilitando filtrado y agrupación en categorías conocidas) mientras permite el manejo elegante de desconocidos a través del campo de detalle. El enum puro sin "other" (B) falla con desconocidos válidos. La cadena sin restricciones (A) pierde los beneficios de legibilidad por máquina del enum. El enfoque booleano + cadena (D) duplica la lógica y es más difícil de usar en flujos posteriores.',
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
      'El reintento con retroalimentación de error es el patrón correcto de bucle de validación-reintento. Al incluir el error de validación exacto ("price debe ser un número, se obtuvo la cadena \'free\'") en el prompt de reintento, Claude tiene información precisa para corregir el campo específico sin regenerar todo. Reintentar con el mismo prompt (A) es probabilístico y desperdicia tokens. El post-procesamiento (C) es una solución alternativa que puede omitir casos. La temperatura 0 reduce la aleatoriedad pero no previene todos los errores de formato, especialmente para casos extremos como "free".',
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
      "La Message Batches API proporciona una reducción de costos del 50% al procesar solicitudes de forma asíncrona dentro de una ventana de 24 horas, lo que la hace ideal para cargas de trabajo masivas donde no se necesita respuesta en tiempo real. El prompt caching reduce los costos para system prompts repetidos pero no en un 50% en todos los tokens. El streaming reduce la latencia, no el costo. Las solicitudes paralelas alcanzan límites de tasa y no reducen el costo por token.",
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
      "La Message Batches API no soporta llamadas a herramientas. Para salida estructurada en modo batch, debes usar enfoques alternativos: JSON basado en prompts (pidiendo a Claude que genere JSON directamente) o modo JSON si está disponible. La ejecución de herramientas requiere un bucle agéntico en tiempo real, que es incompatible con el modelo batch asíncrono. La opción A es incorrecta. La opción C tergiversa el comportamiento. La opción D es demasiado restrictiva — la salida JSON estructurada a través de prompts es posible, solo que no mediante tool_use.",
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
      "La revisión de múltiples pasadas es el patrón correcto: la primera pasada maneja eficientemente los problemas locales de alcance de archivo. La segunda pasada se enfoca específicamente en los problemas de integración usando las salidas de la primera pasada — puede ver patrones en todos los archivos sin necesitar releer todo el código fuente. Enviar los 50 archivos a la vez (A) puede exceder los límites de contexto y es poco enfocado. Agregar instrucciones de revisión entre archivos a cada revisión por archivo (C) escala mal y produce análisis redundante entre archivos. La votación (D) no resuelve el problema de visibilidad entre archivos.",
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
      "La auto-revisión en la misma sesión es una limitación conocida: Claude retiene el razonamiento y los supuestos de la fase de generación en su ventana de contexto. Al revisar, aborda el código con esos mismos supuestos ya activos, reduciendo la probabilidad de detectar errores que derivan de supuestos incorrectos. La solución es usar una sesión separada para la revisión (contexto fresco) o tener un agente diferente que realice la revisión. La opción A no es precisa. La opción C también puede ser cierta pero no es la causa raíz aquí. La opción D es irrelevante.",
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
      "Los ejemplos few-shot son la técnica más efectiva para resolver la ambigüedad de tareas, especialmente cuando la ambigüedad es semántica (múltiples interpretaciones válidas) en lugar de estructural. Mostrar ejemplos concretos de cómo resolver casos ambiguos enseña al modelo la lógica de decisión a través de la demostración. Los system prompts detallados ayudan pero son menos efectivos que los ejemplos para la desambiguación compleja. La Batches API es una optimización de costo/latencia, no una técnica de calidad. Forzar un solo código mediante esquema no resuelve cuál código es correcto.",
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
      "La Message Batches API está diseñada para el procesamiento masivo asíncrono con una ventana de completado de hasta 24 horas. Intercambia latencia por ahorro de costos (reducción del 50%). No es una API de baja latencia. 30 minutos está bien dentro de la ventana de procesamiento normal. La expectativa del interesado de resultados en sub-minutos es incompatible con el modelo de API batch. Si se necesitaran resultados en tiempo real, debería haberse utilizado la API síncrona estándar.",
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
      "Usar tool_use con un esquema JSON definido y forzar la llamada a la herramienta a través de tool_choice es la mayor garantía de salida estructurada. La API aplica que los argumentos de la llamada a la herramienta se ajusten al esquema antes de devolver la respuesta. Las instrucciones del prompt (A) y los ejemplos few-shot (B) son probabilísticos. La auto-verificación (D) también es probabilística y agrega latencia. Para la conformidad JSON crítica para la misión, tool_use con esquema es el enfoque definitivo.",
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
      "La summarización progresiva es conocida por arriesgar la condensación o eliminación de datos cuantitativos específicos (números, fechas, montos, identificadores) durante el proceso de summarización. Los resúmenes en prosa capturan temas e intenciones pero frecuentemente pierden las cifras exactas. La solución es extraer y preservar los hechos críticos (como los montos de reembolso acordados) en un bloque estructurado de \"hechos del caso\" fuera del alcance de la summarización. Las opciones A y C caracterizan mal el problema. La opción D describe un modo de fallo diferente.",
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
      "El patrón de bloque de hechos del caso estructurado separa los datos factuales críticos (números, IDs, valores acordados) de la conversación narrativa. Porque se mantiene como un bloque estructurado distinto en lugar de estar incrustado en prosa, no está sujeto a la summarización progresiva y puede ser explícitamente preservado o actualizado. La opción A está relacionada pero \"inyección en el system prompt\" no es el nombre canónico de este patrón. La opción C (primacía) es un efecto real pero describe el sesgo de posición, no este patrón. La opción D describe la estrategia de gestión de tokens.",
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
      "El efecto de perderse en el medio es un fenómeno bien documentado: los LLMs tienen menor recuperación y atención para el contenido en el medio de las ventanas de contexto largas en comparación con el inicio y el final. Esto es especialmente pronunciado para tareas de recuperación. La solución es reordenar los documentos importantes al principio o al final, o reestructurar cómo se presenta la información. El agotamiento de tokens (A) cortaría todo el contenido subsiguiente, no omitiría el medio. El truncamiento de resultados de herramientas (C) no es automático. El decaimiento de atención (D) no es lineal — el patrón tiene forma de U.",
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
      "Resumir los resultados de las herramientas antes de agregarlos al contexto es la mitigación correcta para la acumulación de tokens en los resultados de herramientas. Los resultados en bruto de las herramientas (especialmente las salidas de consultas de bases de datos y contenido web) tienden a ser verbosos. Un paso de summarización extrae los hallazgos esenciales (hechos clave, números, conclusiones) y descarta el ruido, reduciendo dramáticamente el uso de tokens mientras preserva la información que importa. Simplemente aumentar el tamaño del contexto (A) no es escalable. Los límites estrictos en la salida de herramientas (C) pueden truncar datos necesarios. La opción D es un patrón válido pero más complejo y aún no resuelve el problema de acumulación en contexto para una sesión en curso.",
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
      "La escalada basada en sentimiento no es confiable porque el sentimiento es subjetivo, dependiente del contexto y clasificado de manera inconsistente. Un cliente que dice \"esto es ridículo\" puede estar frustrado o bromeando dependiendo del contexto. Las señales de sentimiento también varían según la cultura, el estilo de comunicación y el contexto. Los tres desencadenantes enumerados (solicitud explícita, brecha de política, fallo repetido para progresar) son objetivos y deterministas. Los desencadenantes de escalada confiables deben ser inequívocos y basarse en hechos observables, no en estados emocionales inferidos.",
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
      "La propagación de errores estructurada debe incluir: tipo de fallo (para clasificar el error), paso fallido (para identificar dónde en el flujo de trabajo falló), resultados parciales (para saber qué tuvo éxito y no reintentar), bandera retryable (para guiar la siguiente acción del orquestador), y un mensaje orientado al usuario. La opción A es demasiado escasa para la toma de decisiones del orquestador. La opción C proporciona información de nivel HTTP sin contexto semántico. La opción D expone trazas de pila internas — un riesgo de seguridad que también es inútil para las decisiones de orquestación.",
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
      "Los archivos de borrador son el mecanismo correcto para persistir hallazgos clave a través de los límites de contexto. Escribir notas estructuradas (firmas de funciones, patrones, dependencias) en un archivo al final de la sesión y leerlas al inicio de la sesión es más eficiente que --resume (que restaura el historial completo de conversación incluyendo todo el ruido) y más confiable que depender del tamaño de la ventana de contexto. fork_session es para crear ramas de exploración dentro de una sesión, no para persistencia entre sesiones.",
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
      "/compact es el comando de Claude Code diseñado exactamente para este escenario — resume el historial de conversación en su lugar, eliminando callejones sin salida exploratorios y contenido redundante mientras preserva el hilo importante del trabajo. Esto reduce el tamaño del contexto sin perder los conocimientos válidos clave de la sesión activa. Comenzar completamente de nuevo (A) pierde los hallazgos válidos acumulados de la sesión actual. --resume restaura un estado previo, revirtiendo el trabajo completado. Eliminar .claude/ es destructivo y puede borrar la configuración del proyecto.",
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
      "El muestreo estratificado por puntuación de confianza es el enfoque más eficiente para encontrar errores sistémicos. Los registros de baja confianza son los que más probablemente contienen errores y deben revisarse a una tasa más alta. Los registros de alta confianza probablemente son correctos pero una pequeña muestra aleatoria valida que la puntuación de confianza esté calibrada correctamente. El muestreo aleatorio simple (A) es ineficiente porque la mayoría de los registros muestreados serán de alta confianza y sin errores. El muestreo secuencial (C) puede estar sesgado si los primeros registros comparten un patrón. El muestreo solo de valores atípicos (D) omite errores no nulos.",
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
      "Los mapeos de afirmación-fuente que vinculan cada afirmación a su artículo fuente (DOI), ubicación (página/sección) y cita textual de evidencia proporcionan procedencia directa y auditable. Esto permite que cualquier afirmación sea verificada yendo directamente a la fuente con información de ubicación precisa. Almacenar el texto completo del artículo (A) consume mucho almacenamiento y no crea vínculos explícitos. Una bibliografía (C) lista fuentes pero no mapea afirmaciones individuales a fuentes específicas. Inferir procedencia de registros de llamadas (D) es frágil e indirecto.",
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
      "Proporcionar contexto temporal (la fecha de rastreo o la fecha de metadatos del artículo) permite a Claude resolver expresiones de fecha relativas a fechas absolutas en el momento de la extracción. Agregar un campo de confianza (\"explicit\" vs \"inferred\") preserva la información de procedencia sobre cómo se determinó la fecha, permitiendo a los consumidores posteriores filtrar o manejar las fechas inferidas de manera diferente. La opción A difiere la resolución y puede perder el punto de referencia. La opción B es imprecisa — las fechas de rastreo y publicación difieren. La opción D pierde datos válidos innecesariamente.",
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
      "La descalibración significa que las puntuaciones de confianza son sistemáticamente demasiado confiadas — una confianza de 0,9 debería tener ~10% de tasa de error, no 12%, pero más importante, el patrón indica que el modelo asigna alta confianza a respuestas inciertas. La solución es la calibración a nivel de campo: medir la relación entre la confianza predicha y la precisión real en un conjunto de validación, luego ajustar los umbrales o agregar una capa de calibración. Simplemente elevar el umbral (D) selecciona menos registros sin corregir la descalibración subyacente. Deshabilitar la confianza (A) elimina una señal útil. Una tasa de error del 12% con confianza de 0,9 puede o no ser aceptable dependiendo del dominio, pero la descalibración es el problema central.",
    keyConcept: "Calibración de puntuación de confianza: confianza predicha vs precisión observada",
  },
};
