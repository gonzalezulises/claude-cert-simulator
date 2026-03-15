import { QuestionTranslation } from "./questions-es";

export const examQuestionsEs: Record<string, QuestionTranslation> = {
  // ============================================================
  // DOMINIO 1 – Arquitectura Agéntica y Orquestación
  // ============================================================

  "E1-001": {
    question:
      "Una ejecución no interactiva de Claude Code termina, pero el objeto de salida tiene `stop_reason: \"error_max_turns\"`. ¿Qué indica esto y cuál es la siguiente acción correcta?",
    options: {
      A: "El modelo alcanzó su límite de tokens — aumentar max_tokens y volver a ejecutar",
      B: "El agente llegó al máximo de turnos permitidos sin completar la tarea — inspeccionar la transcripción, aumentar el límite de turnos o rediseñar el flujo para que requiera menos pasos",
      C: "La sesión fue interrumpida por un error de red — simplemente reintentar la misma solicitud",
      D: "El modelo se negó a continuar por una violación de seguridad — revisar el system prompt en busca de problemas de política",
    },
    explanation:
      "`error_max_turns` es un subtipo de ResultMessage que indica que la ejecución agéntica alcanzó el número máximo de turnos configurado (no un límite de tokens ni un fallo de red). La tarea no se completó. La respuesta correcta es inspeccionar qué se logró, potencialmente aumentar el límite de turnos o rediseñar el flujo para completarse en menos pasos. Se distingue de `error_max_budget_usd` (límite de costo) y `error_during_execution` (excepción en tiempo de ejecución).",
    keyConcept: "Subtipos de ResultMessage: error_max_turns vs otros subtipos de error",
  },

  "E1-002": {
    question:
      "Un pipeline de investigación headless devuelve un ResultMessage con `stop_reason: \"error_max_budget_usd\"` después de procesar 40 de 200 documentos planificados. El operador del pipeline necesita saber exactamente hasta dónde llegó antes de que se agotara el presupuesto. ¿Qué enfoque muestra mejor esta información?",
    options: {
      A: "Capturar el error y volver a ejecutar desde el principio con un límite de presupuesto mayor",
      B: "Analizar la transcripción completa de la sesión: las llamadas a herramientas y sus resultados están incluidas, de modo que el operador puede determinar el último documento procesado con éxito antes de alcanzar el presupuesto",
      C: "Consultar el endpoint `/sessions` de Claude para obtener el desglose de costos por documento",
      D: "Establecer `stop_reason_detail: true` en la solicitud a la API para obtener un desglose de costos",
    },
    explanation:
      "`error_max_budget_usd` significa que se alcanzó el límite máximo de costo en USD acumulado. La transcripción de la sesión (disponible en el ResultMessage o mediante --output-format stream-json) contiene todas las llamadas a herramientas y sus resultados, lo que permite al operador identificar el último documento procesado. No existe ningún endpoint `/sessions` de costos ni un flag `stop_reason_detail`. Volver a ejecutar desde el principio desperdiciaría el trabajo ya completado.",
    keyConcept: "Subtipo de ResultMessage error_max_budget_usd e inspección de la transcripción",
  },

  "E1-003": {
    question:
      "Estás configurando Claude Code para un pipeline de CI/CD que debe aplicar correcciones de linting de manera autónoma, ejecutar pruebas y hacer commits de los cambios, todo sin ningún aviso de confirmación humana. ¿Qué modo de permisos debes configurar?",
    options: {
      A: "`acceptEdits` — el agente acepta ediciones de archivos pero sigue solicitando confirmación para comandos de shell",
      B: "`plan` — el agente planifica todas las acciones de antemano y luego las ejecuta",
      C: "`bypassPermissions` — el agente omite todas las verificaciones de permisos y se ejecuta de forma completamente autónoma",
      D: "`dontAsk` — el agente suprime los diálogos de confirmación preservando las verificaciones de seguridad",
    },
    explanation:
      "`bypassPermissions` desactiva todas las verificaciones de permisos, permitiendo al agente realizar ediciones de archivos, comandos de shell y otras acciones sin ningún aviso de confirmación. Este es el modo apropiado para pipelines de CI/CD completamente automatizados que se ejecutan en entornos de confianza y aislados. `acceptEdits` solo suprime los avisos de edición de archivos. `plan` muestra un plan anticipado pero aún requiere aprobación. `dontAsk` no es un modo de permiso estándar de Claude Code.",
    keyConcept: "Modos de permiso: bypassPermissions para operación completamente autónoma",
  },

  "E1-004": {
    question:
      "Un desarrollador quiere que Claude Code proponga un plan para una tarea de refactorización grande y muestre todas las llamadas a herramientas previstas antes de ejecutarlas, para que el desarrollador pueda revisar y cancelar si es necesario. ¿Qué modo de permiso habilita este flujo de trabajo?",
    options: {
      A: "`default` — Claude solicita confirmación antes de cada llamada a herramienta",
      B: "`plan` — Claude genera y muestra todas las llamadas a herramientas planificadas primero, luego espera aprobación antes de ejecutar",
      C: "`acceptEdits` — Claude acepta todas las ediciones automáticamente y muestra un resumen al final",
      D: "`bypassPermissions` — Claude ejecuta todo y proporciona un diff para revisión posterior",
    },
    explanation:
      "El modo de permiso `plan` está diseñado específicamente para este flujo de trabajo: Claude genera el plan de ejecución completo (todas las llamadas a herramientas previstas) y lo presenta al usuario antes de ejecutar cualquier acción. El usuario puede revisar y cancelar antes de que se realice cualquier cambio. `default` pregunta por cada llamada a herramienta pero no ofrece una vista general anticipada. `acceptEdits` aprueba automáticamente los cambios de archivos sin un plan previo. `bypassPermissions` ejecuta todo sin ninguna confirmación.",
    keyConcept: "Modo de permiso: plan para revisión anticipada antes de la ejecución",
  },

  "E1-005": {
    question:
      "Estás diseñando un AgentDefinition para un subagente de resumen de documentos. Un colega propone darle a este subagente la herramienta `Agent` para que pueda delegar secciones difíciles a sub-subagentes adicionales. ¿Por qué esta propuesta es arquitectónicamente inválida en Claude Code?",
    options: {
      A: "La herramienta `Agent` solo está disponible en el nivel de pago de Claude Code",
      B: "Los subagentes definidos mediante AgentDefinition no pueden incluir la herramienta `Agent` en su allowedTools — solo los orquestadores de nivel superior pueden lanzar subagentes",
      C: "La herramienta `Agent` fue deprecada en v2.1.63 y reemplazada por `Task`",
      D: "Los subagentes pueden usar la herramienta `Agent` pero solo si el padre otorga permisos delegados explícitamente",
    },
    explanation:
      "En el framework agéntico de Claude Code, los subagentes definidos mediante AgentDefinition no pueden crear sus propios subagentes — la herramienta `Agent` (o su predecesora `Task`) no está permitida en el allowedTools de un subagente. Esta es una restricción arquitectónica deliberada que evita el lanzamiento recursivo ilimitado y mantiene el grafo de orquestación manejable. La opción C es engañosa: en v2.1.63 la herramienta fue renombrada de `Task` a `Agent`, no deprecada. La opción D describe un mecanismo de delegación inexistente.",
    keyConcept: "Restricción de AgentDefinition: los subagentes no pueden lanzar subagentes adicionales",
  },

  "E1-006": {
    question:
      "En Claude Code v2.1.63, la herramienta usada para lanzar subagentes fue renombrada. Un desarrollador que actualiza una configuración AgentDefinition escrita antes de esta versión ve que `allowedTools: [\"Task\"]` ya no se reconoce. ¿Cuál es el reemplazo correcto?",
    options: {
      A: 'Reemplazar `"Task"` con `"Spawn"` — el nuevo nombre de la herramienta para crear subagentes',
      B: 'Reemplazar `"Task"` con `"Agent"` — la herramienta fue renombrada de Task a Agent en v2.1.63',
      C: "Eliminar la entrada; el lanzamiento de subagentes ahora es automático y no requiere una herramienta",
      D: 'Reemplazar `"Task"` con `"SubAgent"` — el nuevo nombre canónico',
    },
    explanation:
      "En Claude Code v2.1.63, la herramienta `Task` fue renombrada a `Agent`. Cualquier AgentDefinition que antes listara `\"Task\"` en allowedTools para permitir el lanzamiento de subagentes debe actualizarse a `\"Agent\"`. La funcionalidad es idéntica; solo cambió el nombre. No existe ningún nombre de herramienta `Spawn` o `SubAgent`, y el lanzamiento de subagentes no es automático.",
    keyConcept: "Herramienta Task renombrada a Agent en Claude Code v2.1.63",
  },

  "E1-007": {
    question:
      "Un agente coordinador lanza un subagente para realizar un análisis de 200 pasos. Cuando el subagente termina, el coordinador recibe un resumen conciso. Un desarrollador junior se sorprende de que el coordinador no pueda ver ninguna de las 200 llamadas a herramientas intermedias que realizó el subagente. ¿Cuál es la explicación correcta?",
    options: {
      A: "La transcripción completa del subagente está disponible en el contexto del coordinador bajo una clave `subagent_transcript`",
      B: "Los subagentes devuelven solo su resultado final al padre — no la transcripción intermedia completa — para preservar la eficiencia del contexto",
      C: "El coordinador debe solicitar explícitamente la transcripción llamando a `get_subagent_logs(subagent_id)`",
      D: "La transcripción completa está disponible pero solo en la respuesta raw de la API, no en la interfaz de Claude Code",
    },
    explanation:
      "Por diseño, los subagentes devuelven solo su resultado final (un resumen de texto o salida estructurada) al orquestador padre. Las llamadas a herramientas intermedias, los pasos de razonamiento y las salidas parciales dentro de la ejecución del subagente no se propagan de vuelta. Esto es intencional: mantiene la ventana de contexto del coordinador manejable y refuerza límites claros entre agentes. No existe ningún endpoint `get_subagent_logs` ni clave `subagent_transcript` en el contexto del padre.",
    keyConcept: "Los subagentes devuelven solo el resultado final al padre, no la transcripción completa",
  },

  "E1-008": {
    question:
      "Un subagente es lanzado por un coordinador que tiene un system prompt de 5,000 tokens con pautas de voz de marca y reglas de escalación. Después del lanzamiento, el subagente hace una pregunta que viola las reglas de escalación. ¿Cuál es la causa más probable?",
    options: {
      A: "La versión del modelo del subagente es diferente a la del coordinador y procesa las instrucciones de forma distinta",
      B: "Los subagentes no heredan el system prompt ni el historial de conversación del padre — comienzan con un contexto nuevo y solo reciben lo que se pasa explícitamente en el prompt de su tarea",
      C: "El coordinador debe usar `share_context: true` en el AgentDefinition para pasar su system prompt",
      D: "Los subagentes heredan el system prompt automáticamente pero ignoran las instrucciones añadidas después del primer turno de usuario",
    },
    explanation:
      "Los subagentes operan en ventanas de contexto independientes. NO reciben el system prompt ni el historial de conversación del orquestador padre. Solo reciben lo que se incluye explícitamente en la descripción de la tarea que se pasa a la herramienta Agent. Si las reglas de escalación son críticas para el subagente, deben incluirse explícitamente en ese prompt de tarea. No existe ningún flag `share_context` ni herencia automática del system prompt.",
    keyConcept: "Los subagentes no heredan el system prompt ni el historial de conversación del padre",
  },

  "E1-009": {
    question:
      "Un subagente es lanzado en un directorio de proyecto que tiene un archivo `.claude/CLAUDE.md` con estándares de código. El coordinador que lanzó este subagente no tiene relación con el CLAUDE.md de ese proyecto. Cuando el subagente inicia, ¿ve el CLAUDE.md del proyecto?",
    options: {
      A: "No — los subagentes solo leen archivos CLAUDE.md listados explícitamente en su system prompt",
      B: "No — CLAUDE.md es un documento por sesión y los subagentes se ejecutan en sesiones separadas",
      C: "Sí — los subagentes reciben automáticamente el CLAUDE.md del directorio del proyecto en el que operan, aunque no hereden el system prompt del padre",
      D: "Sí — pero solo si el padre pasa explícitamente `inject_claude_md: true` en el AgentDefinition",
    },
    explanation:
      "Los subagentes reciben el CLAUDE.md del directorio del proyecto en el que operan — esto se inyecta automáticamente desde disco, tal como ocurre en cualquier sesión de Claude Code en ese directorio. Esto es independiente de la conversación del padre. Lo que los subagentes NO reciben es el system prompt ni el historial de conversación del padre. La inyección de CLAUDE.md está basada en el directorio, no se hereda del padre, y no requiere ningún flag explícito.",
    keyConcept: "Los subagentes reciben el CLAUDE.md del proyecto desde disco, pero no el system prompt del padre",
  },

  "E1-010": {
    question:
      "Una tarea de migración de código de larga duración necesita procesar 500 archivos. Después de procesar 200, la ventana de contexto del agente está casi llena. Se emite un `SystemMessage` con `subtype: \"compact_boundary\"`. ¿Qué señala este evento y qué se preserva después de la compactación?",
    options: {
      A: "La sesión está a punto de ser terminada; nada se preserva y el agente debe reiniciar desde el archivo 1",
      B: "La compactación de contexto está a punto de ocurrir: el historial de conversación será resumido, pero CLAUDE.md se reinyectará desde disco y sobrevivirá intacto",
      C: "Los permisos de herramienta del agente se están restableciendo a los valores predeterminados después del límite",
      D: "Ha comenzado una nueva ventana de contexto; tanto el historial de conversación como CLAUDE.md se descartan",
    },
    explanation:
      "Un `SystemMessage` con `subtype: \"compact_boundary\"` señala que Claude Code está a punto de compactar el contexto. Después de la compactación, el historial de conversación se resume (compresión con pérdida), pero CLAUDE.md se reinyecta desde disco y se preserva completamente — nunca forma parte del historial compactado. Sin embargo, cualquier instrucción dada solo en la conversación (no en CLAUDE.md) puede perderse después de la compactación. Los permisos de herramienta no se ven afectados por la compactación.",
    keyConcept: "SystemMessage compact_boundary: CLAUDE.md sobrevive a la compactación, la conversación puede no hacerlo",
  },

  "E1-011": {
    question:
      "Un bucle de orquestación recibe un ResultMessage con `stop_reason: \"error_during_execution\"`. El bucle tiene lógica de reintento, pero el ingeniero quiere saber si reintentar es seguro. ¿Qué indica este stop reason sobre la seguridad del reintento?",
    options: {
      A: "Siempre es seguro reintentar porque el error ocurrió antes de que se ejecutaran las llamadas a herramientas",
      B: "Nunca es seguro reintentar; la tarea debe reiniciarse desde el principio manualmente",
      C: "`error_during_execution` indica que ocurrió una excepción en tiempo de ejecución durante la ejecución — algunas llamadas a herramientas pueden haber tenido éxito, por lo que un reintento ingenuo puede causar efectos secundarios duplicados; se requieren verificaciones de idempotencia",
      D: "Reintentar es seguro porque Claude Code revierte automáticamente todos los efectos secundarios cuando ocurre este error",
    },
    explanation:
      "`error_during_execution` significa que ocurrió una excepción mientras el agente estaba en ejecución — potencialmente después de que varias llamadas a herramientas ya habían tenido éxito. Reintentar ciegamente puede causar escrituras duplicadas, envíos dobles u otros efectos secundarios. Un reintento seguro requiere idempotencia en las herramientas externas, lógica de reintento con conciencia de puntos de control que reanude desde el último paso exitoso, o un mecanismo de reversión completo. Claude Code no revierte automáticamente los efectos secundarios.",
    keyConcept: "error_during_execution: se requiere idempotencia para un reintento seguro",
  },

  "E1-012": {
    question:
      "Al configurar una ejecución headless no interactiva de Claude Code, un ingeniero necesita equilibrar exhaustividad con costo. El parámetro `effort` puede establecerse en `low`, `medium`, `high` o `max`. Para una tarea de resumen sencilla y sensible al costo de 10 documentos cortos, ¿qué nivel es más apropiado?",
    options: {
      A: "`max` — siempre usar el máximo esfuerzo para garantizar la mayor calidad de salida",
      B: "`high` — un buen equilibrio entre calidad y costo para la mayoría de las tareas de producción",
      C: "`low` — apropiado para tareas simples y sensibles al costo donde la velocidad y la economía importan más que el razonamiento profundo",
      D: "`medium` — el valor predeterminado; siempre debe usarse cuando haya dudas",
    },
    explanation:
      "El parámetro `effort` controla cuánto razonamiento interno y exploración realiza el modelo. `low` es apropiado para tareas sencillas como resumir documentos cortos, donde la sobrecarga del razonamiento extendido desperdiciaría tokens y dinero. `max` es para tareas altamente complejas que requieren análisis profundo. `high` es para tareas de producción que necesitan un razonamiento exhaustivo. `medium` es un valor predeterminado sensato pero no óptimo para trabajo explícitamente simple y sensible al costo.",
    keyConcept: "Niveles de effort: low para tareas simples y sensibles al costo, max para razonamiento profundo complejo",
  },

  // ============================================================
  // DOMINIO 2 – Diseño de Herramientas e Integración MCP
  // ============================================================

  "E2-001": {
    question:
      "La herramienta `query_database` de un servidor MCP encuentra un timeout de SQL. El servidor devuelve `{ \"isError\": true, \"content\": [...] }`. En un escenario separado, la capa de transporte MCP en sí falla al entregar la solicitud. ¿Cuál es la distinción arquitectónica crítica entre estos dos casos?",
    options: {
      A: "Ambos casos son equivalentes — el cliente debe reintentar en ambos escenarios",
      B: "`isError: true` en el resultado de la herramienta es un error visible para el LLM — Claude lo ve y puede razonar sobre él. Un fallo de transporte JSON-RPC es invisible para Claude y debe ser manejado por la capa del cliente MCP antes de llegar al modelo",
      C: "`isError: true` es solo para errores HTTP; los errores JSON-RPC manejan todos los fallos de lógica de aplicación",
      D: "Los errores JSON-RPC se propagan directamente a la ventana de contexto del modelo, mientras que `isError` es solo para registro",
    },
    explanation:
      "El protocolo MCP distingue dos capas de error: `isError: true` en un resultado de herramienta es un error semántico visible para el LLM — Claude lo recibe en su contexto y puede razonar sobre él, decidir reintentar o tomar acción correctiva. Un error JSON-RPC en la capa de transporte (por ejemplo, el servidor es inaccesible, JSON malformado) es un fallo de transporte que el cliente MCP maneja antes de que el modelo vea nada. Confundir estos lleva a un manejo deficiente de errores: los errores de transporte requieren reintento a nivel de infraestructura, mientras que los resultados con `isError` requieren razonamiento a nivel del modelo.",
    keyConcept: "Distinción MCP: isError (visible al LLM) vs error JSON-RPC (fallo de transporte)",
  },

  "E2-002": {
    question:
      "Tu equipo está desplegando un nuevo servidor MCP para una aplicación de producción. Al servidor accederá Claude Code a través de una red. El líder técnico dice que el transporte SSE ahora es legacy. ¿Qué deberías usar en su lugar y por qué?",
    options: {
      A: "stdio — es el transporte más eficiente para servidores desplegados en red",
      B: "HTTP (Streamable HTTP) — es el transporte recomendado actualmente para servidores MCP desplegados en red, reemplazando el transporte SSE deprecado",
      C: "WebSocket — es el reemplazo de SSE en la especificación MCP",
      D: "gRPC — el transporte MCP más reciente para uso de producción de alto rendimiento",
    },
    explanation:
      "La especificación MCP identifica tres tipos de transporte: HTTP (Streamable HTTP, recomendado para servidores desplegados en red), SSE (deprecado, en proceso de eliminación) y stdio (para servidores basados en procesos locales). SSE ha sido reemplazado por Streamable HTTP, que admite tanto streaming como patrones estándar de solicitud/respuesta. stdio es para procesos lanzados localmente, no para servidores en red. WebSocket y gRPC no son tipos de transporte MCP.",
    keyConcept: "Tipos de transporte MCP: HTTP (recomendado), SSE (deprecado), stdio (local)",
  },

  "E2-003": {
    question:
      "Un desarrollador tiene un servidor MCP definido a nivel de usuario en `~/.claude.json`, el mismo servidor también configurado a nivel de proyecto en `.mcp.json`, y una tercera anulación local en una configuración local `.claude/`. Cuando las tres configuraciones entran en conflicto en una configuración para ese servidor, ¿cuál gana?",
    options: {
      A: "Nivel de usuario (`~/.claude.json`) — las preferencias del usuario siempre tienen precedencia",
      B: "Nivel de proyecto (`.mcp.json`) — la configuración del proyecto anula los ajustes personales",
      C: "Nivel local (configuración local `.claude/`) — el alcance local tiene la mayor precedencia, luego el proyecto, luego el usuario",
      D: "Gana la última configuración cargada, que depende del orden del sistema de archivos",
    },
    explanation:
      "La precedencia de alcance MCP sigue una jerarquía estricta: local > proyecto > usuario. Una configuración local (almacenada en el directorio `.claude/` de configuración local) anula tanto el `.mcp.json` a nivel de proyecto como el `~/.claude.json` a nivel de usuario. Esto refleja cómo funcionan la mayoría de los sistemas de capas de configuración — las configuraciones más específicas y cercanas al código tienen precedencia sobre los valores predeterminados más amplios. El orden es determinístico, no dependiente del sistema de archivos.",
    keyConcept: "Precedencia de alcance MCP: local > proyecto > usuario",
  },

  "E2-004": {
    question:
      "Una alerta de uso de ventana de contexto se activa cuando un agente de investigación con 12 servidores MCP activos comienza una tarea. El agente aún no ha procesado ningún documento. ¿Cuál es la causa arquitectónica más probable del alto uso inicial de contexto?",
    options: {
      A: "El system prompt es demasiado largo y debe acortarse",
      B: "Cada servidor MCP agrega TODOS sus esquemas de herramientas a CADA solicitud — con 12 servidores cada uno con múltiples herramientas, la sobrecarga combinada de esquemas consume contexto significativo antes de que se procese cualquier contenido de la tarea",
      C: "El historial de conversación de una sesión anterior se está reinyectando",
      D: "El tokenizador del modelo es ineficiente al codificar esquemas JSON de herramientas",
    },
    explanation:
      "Los esquemas de herramientas MCP se inyectan en cada solicitud para cada servidor conectado. Con 12 servidores MCP, cada uno potencialmente definiendo entre 5 y 20 herramientas con esquemas de parámetros, descripciones y definiciones de tipos, la sobrecarga acumulada de tokens antes de que se procese cualquier contenido del usuario puede ser de miles de tokens. Esta es una consideración arquitectónica crítica: reduce el número de servidores MCP activos, usa la activación de ToolSearch o limita los servidores activos a los necesarios para la tarea actual.",
    keyConcept: "Los esquemas de herramientas MCP consumen contexto por solicitud; cada servidor agrega TODOS sus esquemas",
  },

  "E2-005": {
    question:
      "Un agente se ejecuta con 15 servidores MCP activos. Un ingeniero senior dice que ToolSearch debería activarse automáticamente para gestionar la sobrecarga de herramientas. ¿A qué utilización de la ventana de contexto se activa típicamente ToolSearch y cómo puede forzarse su habilitación?",
    options: {
      A: "ToolSearch se activa al 50% de utilización del contexto; establece `TOOL_SEARCH_THRESHOLD=0.5` para configurarlo",
      B: "ToolSearch se activa cuando el uso de la ventana de contexto supera el 10% y puede forzarse mediante la variable de entorno `ENABLE_TOOL_SEARCH`",
      C: "ToolSearch se activa solo cuando se llama explícitamente con `tool_search: true` en la solicitud API",
      D: "ToolSearch siempre está activo y no puede configurarse — selecciona automáticamente las 5 mejores herramientas",
    },
    explanation:
      "ToolSearch es un mecanismo de gestión de contexto que se activa cuando la utilización de la ventana de contexto supera aproximadamente el 10%, ayudando al modelo a priorizar qué herramientas incluir en el conjunto de trabajo. Puede forzarse independientemente de la utilización usando la variable de entorno `ENABLE_TOOL_SEARCH`. Esto es importante cuando tienes muchos servidores MCP y quieres reducir el consumo de tokens por solicitud debida a la inyección de esquemas. No tiene un umbral configurable mediante `TOOL_SEARCH_THRESHOLD`.",
    keyConcept: "ToolSearch se activa con >10% de la ventana de contexto, configurable via ENABLE_TOOL_SEARCH",
  },

  "E2-006": {
    question:
      "Un archivo `.mcp.json` configura un servidor MCP que requiere una clave API. El equipo quiere un valor de respaldo `dev-key-local` cuando la variable de entorno `API_KEY` no esté definida, para comodidad en el desarrollo local. ¿Qué sintaxis de expansión de variables logra esto?",
    options: {
      A: "`${API_KEY || dev-key-local}` — operador OR al estilo JavaScript",
      B: "`${API_KEY ?? dev-key-local}` — operador de fusión nula",
      C: "`${API_KEY:-dev-key-local}` — expansión de valor predeterminado al estilo shell",
      D: "`$API_KEY?dev-key-local` — sintaxis de expansión ternaria",
    },
    explanation:
      ".mcp.json admite dos sintaxis de expansión de variables: `${VAR}` para sustitución simple y `${VAR:-default}` para sustitución con un valor de respaldo cuando la variable no está definida o está vacía. La notación `:-` está tomada de la expansión de parámetros del shell POSIX. Los operadores al estilo JavaScript (`||`, `??`) no están soportados. No hay sintaxis ternaria con `?` en la expansión de variables de .mcp.json.",
    keyConcept: "Sintaxis de expansión de variables: ${VAR} y ${VAR:-default} en .mcp.json",
  },

  "E2-007": {
    question:
      "Un desarrollador escribe el siguiente fragmento de `.mcp.json`:\n```json\n{\n  \"mcpServers\": {\n    \"my-api\": {\n      \"url\": \"${API_BASE_URL}/v2\",\n      \"headers\": {\n        \"Authorization\": \"Bearer ${AUTH_TOKEN}\"\n      }\n    }\n  }\n}\n```\n¿Qué campos admiten expansión de variables en esta configuración?",
    options: {
      A: "Solo el campo `url` admite expansión de variables; los headers deben usar valores literales",
      B: "La expansión de variables funciona en los campos `url`, `headers`, `command`, `args` y `env` de .mcp.json",
      C: "La expansión de variables solo está soportada en el campo `env`; usa variables de entorno indirectamente para otros campos",
      D: "La expansión de variables funciona en todo .mcp.json, incluyendo en nombres de servidor y claves raíz",
    },
    explanation:
      "La característica de expansión de variables de `.mcp.json` admite la sintaxis `${VAR}` y `${VAR:-default}` en los siguientes campos específicos: `command`, `args`, `env`, `url` y `headers`. Esto cubre tanto los servidores basados en stdio (command/args/env) como los servidores basados en HTTP (url/headers). La expansión de variables no se aplica a las claves de nombre del servidor ni a otros campos estructurales del JSON. El ejemplo usa correctamente la expansión tanto en `url` como en `headers`.",
    keyConcept: "Expansión de variables soportada en: command, args, env, url, headers en .mcp.json",
  },

  "E2-008": {
    question:
      "Defines una herramienta con `strict: true` en su definición de esquema. Un colega pregunta qué garantía ofrece esto y qué limitaciones introduce. ¿Cuál respuesta es la más precisa?",
    options: {
      A: "`strict: true` garantiza que el modelo siempre llame a esta herramienta e ignore las demás",
      B: "`strict: true` habilita la decodificación restringida, garantizando que la salida de la llamada a herramienta se ajuste exactamente al esquema — pero el esquema debe seguir las limitaciones del modo estricto: todas las propiedades requeridas, sin additionalProperties, y sin el uso de patrones como `allOf`/`anyOf`",
      C: "`strict: true` valida el esquema en el momento de la definición pero no ofrece garantías en tiempo de ejecución",
      D: "`strict: true` habilita la validación del esquema tanto en entrada como en salida, duplicando la latencia",
    },
    explanation:
      "`strict: true` en una definición de herramienta habilita la decodificación restringida: la generación de tokens del modelo está restringida para producir solo salidas que sean válidas contra el esquema JSON. Esta es una garantía sólida en tiempo de ejecución del cumplimiento del esquema. Sin embargo, conlleva limitaciones en el esquema: todas las propiedades del objeto deben estar en `required`, `additionalProperties` debe ser `false`, y los combinadores como `allOf`, `anyOf`, `oneOf` no están soportados. Características como `minimum`/`maximum`, `minLength`, `maxLength`, `pattern` y `const` tampoco están disponibles en modo estricto.",
    keyConcept: "strict: true habilita decodificación restringida con limitaciones específicas de esquema",
  },

  "E2-009": {
    question:
      "Un desarrollador intenta agregar una restricción `pattern` a un esquema JSON de herramienta con `strict: true` para que un campo de número de teléfono coincida con `^\\+[1-9]\\d{1,14}$`. La definición de la herramienta es rechazada. ¿Cuál es el enfoque correcto?",
    options: {
      A: "Usar `minLength` y `maxLength` en lugar de `pattern` para restringir el campo de número de teléfono",
      B: "Cambiar a `strict: false` para permitir `pattern`, luego usar validación del lado del servidor en el manejador de la herramienta para aplicar el formato",
      C: "Anidar el patrón dentro de un combinador de esquema `oneOf`, que está permitido en modo estricto",
      D: "Agregar el patrón regex a la descripción del campo — el modelo lo seguirá mediante seguimiento de instrucciones en lugar de decodificación restringida",
    },
    explanation:
      "En el modo `strict: true`, no están soportados `pattern`, `minLength`, `maxLength`, `minimum`, `maximum`, `const` y los combinadores de esquema (`allOf`, `anyOf`, `oneOf`). Si necesitas validación a nivel de regex, las opciones son: (1) usar `strict: false` e implementar la validación en el manejador de la herramienta del lado del servidor, o (2) usar `strict: false` y confiar en el seguimiento de instrucciones del modelo. La opción A es incorrecta porque `minLength`/`maxLength` tampoco están disponibles en modo estricto. La opción C es incorrecta porque `oneOf` tampoco está permitido en modo estricto.",
    keyConcept: "Limitaciones del modo estricto: sin pattern, minLength, maxLength, ni combinadores",
  },

  "E2-010": {
    question:
      "Un desarrollador de una empresa quiere aplicar un servidor MCP de escaneo de seguridad obligatorio para todos los usuarios de Claude Code en equipos macOS de la empresa, sin depender de que cada desarrollador lo configure por sí mismo. ¿Dónde debe configurarse este servidor de política gestionada?",
    options: {
      A: "En el `.mcp.json` del proyecto — se confirmará en cada repo y se aplicará automáticamente",
      B: "En `~/.claude.json` en el equipo de cada desarrollador mediante un script de incorporación",
      C: "En `/Library/Application Support/ClaudeCode/CLAUDE.md` — la ubicación de política gestionada en macOS que controla TI y no puede ser anulada por los usuarios",
      D: "En `/etc/claude/policy.json` — el archivo de política de todo el sistema para Claude Code",
    },
    explanation:
      "En macOS, `/Library/Application Support/ClaudeCode/CLAUDE.md` es la ubicación de política gestionada para Claude Code. Los departamentos de TI pueden desplegar configuración aquí (mediante MDM u herramientas similares), y este archivo tiene precedencia sobre los ajustes a nivel de usuario y de proyecto. Los usuarios no pueden anular la política gestionada. `.mcp.json` requiere que el archivo esté presente en cada repositorio. `~/.claude.json` es por usuario y puede modificarse. `/etc/claude/policy.json` no es una ruta real de Claude Code.",
    keyConcept: "CLAUDE.md de política gestionada en /Library/Application Support/ClaudeCode/ en macOS",
  },

  "E2-011": {
    question:
      "El registro de servidores MCP de tu equipo crece a 8 servidores, cada uno con un promedio de 12 herramientas. Antes de que se procese cualquier prompt de usuario, observas que la solicitud ya consume una parte significativa de la ventana de contexto. Quieres usar ToolSearch para mitigar esto, pero necesitas entender sus límites. ¿Cuál afirmación es correcta?",
    options: {
      A: "ToolSearch elimina completamente el consumo de contexto de esquemas de herramientas — los esquemas solo se cargan cuando una herramienta se llama realmente",
      B: "ToolSearch reduce el conjunto de herramientas activas a las más relevantes para la solicitud actual, disminuyendo la sobrecarga de esquemas por solicitud, pero aún se consume algo de contexto base de esquema",
      C: "ToolSearch reemplaza todos los esquemas de herramientas con una sola herramienta universal que acepta cualquier entrada JSON",
      D: "ToolSearch solo funciona con servidores MCP basados en stdio; los servidores HTTP siempre deben incluir todos los esquemas de herramientas",
    },
    explanation:
      "ToolSearch es un mecanismo de recuperación que selecciona las herramientas más contextualmente relevantes del registro completo e incluye solo esos esquemas en una solicitud dada. Esto reduce (pero no elimina) el consumo de contexto de esquemas. Se sigue necesitando un conjunto base de descripciones de herramientas para habilitar la búsqueda en sí. ToolSearch funciona independientemente del tipo de transporte (stdio vs HTTP). No existe ninguna herramienta universal de entrada JSON que reemplace todos los esquemas.",
    keyConcept: "ToolSearch reduce pero no elimina el consumo de contexto de esquemas de herramientas",
  },

  "E2-012": {
    question:
      "El servidor MCP de un agente de soporte está desplegado localmente junto con Claude Code en la misma máquina (no en red). ¿Qué tipo de transporte es más apropiado para este despliegue?",
    options: {
      A: "HTTP — siempre usar HTTP para despliegues de producción independientemente de la topología",
      B: "SSE — el transporte legacy aún es necesario para servidores locales",
      C: "stdio — el transporte apropiado para servidores MCP basados en procesos lanzados localmente",
      D: "WebSocket — la opción de menor latencia para comunicación entre procesos locales",
    },
    explanation:
      "El transporte stdio está diseñado para servidores MCP que se ejecutan como procesos locales, lanzados y gestionados por Claude Code en la misma máquina. La comunicación ocurre a través de tuberías de entrada/salida estándar. El transporte HTTP es para servidores desplegados en red. SSE está deprecado. WebSocket no es un tipo de transporte MCP. Para servidores locales coubicados, stdio es la opción correcta y más eficiente.",
    keyConcept: "Transporte stdio de MCP para servidores basados en procesos locales",
  },

  // ============================================================
  // DOMINIO 3 – Configuración y Flujos de Trabajo de Claude Code
  // ============================================================

  "E3-001": {
    question:
      "Un desarrollador agrega directrices detalladas del proyecto al `CLAUDE.md` del proyecto. A mitad de sesión, la ventana de contexto se llena y ocurre una compactación. Después de la compactación, el agente ya no sigue las directrices del proyecto. ¿Cuál es la causa raíz?",
    options: {
      A: "La compactación elimina el archivo CLAUDE.md del disco, requiriendo que el desarrollador lo restaure desde control de versiones",
      B: "Las directrices no estaban en CLAUDE.md sino que se dieron como instrucción conversacional — la compactación resume la conversación y esas instrucciones se pierden, mientras que CLAUDE.md sobrevive al ser reinyectado desde disco",
      C: "CLAUDE.md tiene un límite de 200 líneas y las directrices lo superaron, causando inyección parcial después de la compactación",
      D: "La compactación solo preserva los 10 mensajes más recientes; cualquier instrucción dada antes de eso se pierde",
    },
    explanation:
      "CLAUDE.md se reinyecta desde disco después de cada evento de compactación — siempre sobrevive. Lo que se pierde durante la compactación es el historial de conversación, que se resume con pérdida. Si las directrices del desarrollador se entregaron como mensajes conversacionales en lugar de escribirse en CLAUDE.md, no sobrevivirán a la compactación. La solución es poner las instrucciones persistentes en CLAUDE.md. La directriz de 200 líneas es una recomendación para mantener los archivos manejables, no un límite estricto que cause inyección parcial.",
    keyConcept: "CLAUDE.md sobrevive a la compactación (reinyectado desde disco); las instrucciones conversacionales no",
  },

  "E3-002": {
    question:
      "El proyecto de un equipo ha crecido y el archivo CLAUDE.md ahora tiene 450 líneas, cubriendo estándares de código, decisiones de arquitectura, convenciones de prueba, reglas de seguridad y procedimientos de despliegue. El rendimiento se está degradando y el uso de contexto es alto. ¿Cuál es el enfoque recomendado?",
    options: {
      A: "Aumentar el límite de max_tokens para acomodar el CLAUDE.md más grande",
      B: "Dividir el contenido en múltiples archivos específicos por tema en subdirectorios `.claude/rules/` — Claude Code los descubre de forma recursiva y el CLAUDE.md principal puede usar `@import` para referenciarlos selectivamente",
      C: "Comprimir el CLAUDE.md usando un minificador personalizado para reducir el conteo de tokens preservando el significado",
      D: "Mover la mitad del contenido al `~/.claude/CLAUDE.md` de nivel usuario para que quede dividido entre dos archivos",
    },
    explanation:
      "El enfoque recomendado para archivos CLAUDE.md grandes es dividir el contenido en archivos específicos por tema bajo subdirectorios `.claude/rules/`. Claude Code los descubre de forma recursiva. El CLAUDE.md principal debe mantenerse por debajo de 200 líneas (el objetivo) y puede usar directivas `@import` para cargar selectivamente archivos de reglas adicionales cuando sea relevante. Esto reduce el consumo de contexto por solicitud porque no todas las reglas necesitan cargarse para cada tarea. Comprimir o dividir entre niveles de usuario y proyecto perdería la claridad del alcance.",
    keyConcept: "Objetivo de CLAUDE.md: <200 líneas; usar .claude/rules/ para el exceso, descubierto recursivamente",
  },

  "E3-003": {
    question:
      "Un archivo de skill tiene el siguiente frontmatter:\n```yaml\n---\ndisable-model-invocation: true\nuser-invocable: false\n---\n```\n¿Qué especifica esta configuración sobre el comportamiento de ejecución del skill?",
    options: {
      A: "El skill se ejecuta sin ninguna llamada al modelo Claude y no puede ser activado por usuarios mediante comandos slash",
      B: "El skill deshabilita todas las herramientas pero sigue usando el modelo para razonamiento; los usuarios no pueden invocarlo",
      C: "El skill está oculto en la UI pero puede ser invocado por agentes con `user-invocable: false` anulado en tiempo de ejecución",
      D: "El skill está deprecado y será eliminado; `user-invocable: false` es la bandera de deprecación",
    },
    explanation:
      "`disable-model-invocation: true` significa que el skill ejecuta sus acciones definidas (comandos de shell, operaciones de archivos, etc.) sin realizar ninguna llamada a la API del modelo Claude — se ejecuta como automatización pura. `user-invocable: false` significa que el skill no aparece en el menú de comandos slash y no puede ser activado directamente por usuarios escribiendo `/nombre-del-skill`; solo puede ser invocado programáticamente por el sistema u otros agentes. Juntos, definen un skill automatizado no interactivo.",
    keyConcept: "Frontmatter de skill: disable-model-invocation suprime llamadas al modelo; user-invocable controla visibilidad de comandos slash",
  },

  "E3-004": {
    question:
      "Un skill necesita incluir el nombre de la rama git actual en su contexto de ejecución. El prompt del skill dice:\n```\nEstás revisando código en la rama: !`git branch --show-current`\n```\n¿Qué hace la sintaxis `!\\`` `` en el momento de ejecución del skill?",
    options: {
      A: "Escapa el backtick para prevenir inyección de shell y pasa la cadena literal `git branch --show-current` al modelo",
      B: "Ejecuta dinámicamente el comando de shell en el momento de carga del skill e inyecta la salida stdout del comando en el contexto del skill",
      C: "Marca el comando como una llamada a herramienta que Claude ejecutará usando la herramienta Bash durante la conversación",
      D: "Es un fragmento de código Markdown y no tiene semántica de ejecución especial",
    },
    explanation:
      "La sintaxis `!\\`comando\\`` en CLAUDE.md y archivos de skill es la sintaxis de inyección de contexto dinámico. Cuando el skill se carga, Claude Code ejecuta el comando de shell y reemplaza la expresión `!\\`...\\`` con la salida stdout del comando. Esto permite a los skills y archivos CLAUDE.md inyectar información dinámica en tiempo de ejecución (como la rama git actual, el nombre del entorno o las versiones de herramientas) en el contexto. No es una llamada a la herramienta Bash durante la conversación y no escapa la inyección de shell — ejecuta el comando en el momento de carga.",
    keyConcept: "Inyección de contexto dinámico: la sintaxis !`comando` ejecuta el comando de shell en el momento de carga del skill",
  },

  "E3-005": {
    question:
      "Un skill está definido con la siguiente firma de invocación:\n```\n/deploy $ARGUMENTS[0] to $ARGUMENTS[1]\n```\nUn usuario escribe `/deploy main production`. ¿Cuáles son los valores de `$ARGUMENTS[0]` y `$ARGUMENTS[1]`?",
    options: {
      A: "`$ARGUMENTS[0]` = `main production` (cadena completa de argumentos), `$ARGUMENTS[1]` = undefined",
      B: "`$ARGUMENTS[0]` = `main`, `$ARGUMENTS[1]` = `production`",
      C: "`$ARGUMENTS[0]` = `/deploy`, `$ARGUMENTS[1]` = `main`",
      D: "Los argumentos indexados como `$ARGUMENTS[N]` no están soportados; solo `$ARGUMENTS` como conjunto",
    },
    explanation:
      "En los skills de Claude Code, `$ARGUMENTS` contiene la cadena completa de argumentos pasada después del nombre del skill. `$ARGUMENTS[N]` proporciona acceso posicional a los tokens separados por espacios: `$ARGUMENTS[0]` es el primer token (`main`), `$ARGUMENTS[1]` es el segundo (`production`), y así sucesivamente. `$N` (por ejemplo, `$1`, `$2`) es una abreviatura equivalente. El nombre del skill en sí no está incluido en los argumentos. Tanto `$ARGUMENTS` (cadena completa) como `$ARGUMENTS[N]` (indexado) están soportados.",
    keyConcept: "Sustituciones de cadenas en skills: $ARGUMENTS (completo), $ARGUMENTS[N] o $N (posicional indexado)",
  },

  "E3-006": {
    question:
      "Necesitas ejecutar Claude Code de forma no interactiva en un pipeline de CI. El pipeline debe recibir salida de streaming en tiempo real como eventos JSON. ¿Qué flags de línea de comandos habilitan este comportamiento?",
    options: {
      A: "`--headless --json-output` — headless desactiva la UI y json-output habilita el streaming JSON",
      B: "`--output-format stream-json` — habilita la salida JSON de streaming para uso no interactivo/headless",
      C: "`--ci-mode --stream` — el flag de modo CI dedicado con streaming habilitado",
      D: "`--no-interactive --format json` — los flags estándar para salida JSON en CI",
    },
    explanation:
      "`--output-format stream-json` es el flag que habilita la salida JSON de streaming en el modo headless de Claude Code. Cada evento (mensaje del asistente, llamada a herramienta, resultado de herramienta, finalización) se emite como un objeto JSON en una nueva línea, lo que permite al pipeline de CI procesar eventos en tiempo real. No existe ningún flag `--headless`, `--ci-mode`, `--stream` o `--no-interactive` para este propósito. El flag `--continue` puede combinarse con `--output-format stream-json` para reanudar una sesión anterior.",
    keyConcept: "Modo headless: --output-format stream-json para streaming de eventos JSON en tiempo real",
  },

  "E3-007": {
    question:
      "Un pipeline de CI ejecuta Claude Code con `--allowedTools Read,Grep,Glob`. Durante la ejecución, Claude intenta llamar a la herramienta `Bash` para ejecutar un conjunto de pruebas. ¿Qué ocurre?",
    options: {
      A: "La llamada a la herramienta Bash se pone en cola y se ejecuta después de que termina la sesión como un paso posterior",
      B: "La llamada a la herramienta Bash es bloqueada — `--allowedTools` define una lista blanca y cualquier herramienta que no esté en la lista es denegada",
      C: "La llamada a la herramienta Bash tiene éxito porque `Bash` es una herramienta integrada que no puede restringirse",
      D: "Claude es informado de que Bash no está disponible y sustituye automáticamente con una llamada a `Read`",
    },
    explanation:
      "`--allowedTools` crea una lista blanca explícita de herramientas permitidas para una sesión de Claude Code. Cualquier herramienta no listada — incluyendo herramientas integradas como Bash, Edit y Write — es bloqueada. Claude recibirá un error al intentar usar una herramienta denegada y deberá razonar sobre alternativas dentro del conjunto permitido. No hay sustitución automática ni omisión para herramientas integradas. Este mecanismo se usa en CI para aplicar el principio de mínimo privilegio.",
    keyConcept: "--allowedTools como lista blanca bloquea cualquier herramienta no explícitamente permitida, incluyendo las integradas",
  },

  "E3-008": {
    question:
      "Un script de hook PreToolUse sale con código 2 cuando detecta que Claude está a punto de eliminar un archivo fuera del directorio del proyecto. ¿Cuál es el efecto del código de salida 2 de un hook de shell?",
    options: {
      A: "El código de salida 2 indica éxito con advertencias — la llamada a herramienta procede pero se registra una advertencia",
      B: "El código de salida 2 bloquea la llamada a herramienta y expone la salida stderr del hook a Claude como razón de la denegación",
      C: "El código de salida 2 termina la sesión completa de Claude Code inmediatamente",
      D: "El código de salida 2 se trata igual que el código de salida 0 — los códigos de salida distintos de cero solo difieren en severidad",
    },
    explanation:
      "Los hooks de shell de Claude Code usan una convención de código de salida de tres valores: código de salida 0 significa continuar (permitir la llamada a herramienta), código de salida 2 significa bloquear (denegar la llamada a herramienta, y Claude recibe el stderr del hook como razón), y cualquier otro código distinto de cero significa continuar pero registrar el error. El código de salida 2 es el valor específico para el bloqueo programático. Esto permite a los hooks funcionar como puertas de aplicación de políticas — el hook puede explicar exactamente por qué se denegó una llamada a herramienta escribiendo en stderr.",
    keyConcept: "Códigos de salida de hooks: 0 (continuar), 2 (bloquear con razón), otros no-cero (continuar + registrar)",
  },

  "E3-009": {
    question:
      "Un equipo de desarrollo quiere ejecutar un script personalizado de construcción de contexto antes de cualquier sesión larga de Claude Code para inyectar el estado relevante del proyecto. ¿Qué evento de hook se activa exactamente una vez al comienzo de una sesión de Claude Code?",
    options: {
      A: "`UserPromptSubmit` — se activa cuando se envía el primer mensaje del usuario",
      B: "`PreToolUse` — se activa antes de la primera llamada a herramienta en la sesión",
      C: "`SessionStart` — se activa una vez cuando se inicializa la sesión de Claude Code",
      D: "`SubagentStart` — se activa al comienzo de cualquier ejecución de agente, incluyendo la sesión de nivel superior",
    },
    explanation:
      "`SessionStart` se activa exactamente una vez cuando una sesión de Claude Code se inicializa, antes de cualquier interacción del usuario. Es el hook correcto para acciones de configuración únicas como inyectar contexto de entorno, inicializar archivos de estado o ejecutar scripts previos a la sesión. `UserPromptSubmit` se activa en cada mensaje del usuario, no solo en el primero. `PreToolUse` se activa antes de las llamadas a herramientas, que aún no han ocurrido al inicio de la sesión. `SubagentStart` es específico para eventos del ciclo de vida de subagentes, no para el inicio de la sesión principal.",
    keyConcept: "Eventos de hooks: SessionStart se activa una vez en la inicialización de la sesión",
  },

  "E3-010": {
    question:
      "Un equipo de seguridad quiere interceptar todas las llamadas a herramientas y realizar una solicitud HTTP en tiempo real a su servicio de auditoría antes de que se ejecute cada herramienta. ¿Qué combinación de tipo de hook y evento logra esto?",
    options: {
      A: "Tipo de hook: `command`; evento: `PostToolUse` — ejecuta un script de shell después de cada llamada a herramienta para registrarla",
      B: "Tipo de hook: `http`; evento: `PreToolUse` — envía una solicitud HTTP al servicio de auditoría antes de cada llamada a herramienta, y puede bloquear la llamada devolviendo una respuesta que no sea 200",
      C: "Tipo de hook: `prompt`; evento: `PermissionRequest` — añade contexto de auditoría al diálogo de permisos",
      D: "Tipo de hook: `agent`; evento: `PreToolUse` — lanza un subagente de auditoría antes de cada llamada a herramienta",
    },
    explanation:
      "Claude Code soporta cuatro tipos de hook: `command` (script de shell), `http` (solicitud HTTP), `prompt` (inyección de prompt) y `agent` (invocación de subagente). Para llamadas de auditoría HTTP en tiempo real antes de que se ejecute cada herramienta, el tipo de hook `http` en el evento `PreToolUse` es la combinación correcta. El hook HTTP envía una solicitud a la URL especificada y puede bloquear la llamada a herramienta si la respuesta indica denegación. Usar `PostToolUse` sería posterior al hecho y no puede bloquear la llamada.",
    keyConcept: "Tipos de hook: command, http, prompt, agent — http+PreToolUse para bloqueo de auditoría en tiempo real",
  },

  "E3-011": {
    question:
      "Un skill necesita bifurcar su ejecución en un nuevo contexto aislado en lugar de continuar en el contexto de conversación actual. ¿Qué clave de frontmatter habilita este comportamiento?",
    options: {
      A: "`model: claude-sonnet-4-5` — especificar un modelo hace que el skill se ejecute en una llamada API separada",
      B: "`context: fork` — bifurca explícitamente la ejecución en una nueva ventana de contexto aislada",
      C: "`agent: true` — marca el skill como un agente, que automáticamente recibe un contexto nuevo",
      D: "`user-invocable: false` — los skills no invocables por el usuario siempre se ejecutan en contextos aislados",
    },
    explanation:
      "`context: fork` en el frontmatter de un skill hace que el skill se ejecute en una nueva ventana de contexto aislada, bifurcada desde el estado de sesión actual. Esto es distinto del comportamiento predeterminado de continuar en el mismo contexto de conversación. Es útil para skills que necesitan realizar trabajo exploratorio sin contaminar la conversación principal, o para skills que necesitan un contexto limpio para un razonamiento preciso. `model:` especifica qué modelo usar, no si bifurcar. `agent: true` marca el skill como un agente pero no implica bifurcación de contexto.",
    keyConcept: "Frontmatter de skill: context: fork crea un contexto de ejecución aislado",
  },

  "E3-012": {
    question:
      "Un pipeline headless de Claude Code necesita continuar una sesión anterior por ID. El pipeline tiene el ID de sesión de la ejecución anterior almacenado en una variable `$SESSION_ID`. ¿Qué flag reanuda la sesión?",
    options: {
      A: "`--resume $SESSION_ID` — restaura el estado exacto de la conversación de la sesión especificada",
      B: "`--session-id $SESSION_ID` — se adjunta a una sesión existente",
      C: "`--continue $SESSION_ID` — el único flag que admite reanudación de sesión por ID en modo headless",
      D: "`--restore $SESSION_ID` — el flag de reanudación específico para headless",
    },
    explanation:
      "`--resume` acepta un ID de sesión para restaurar el historial de conversación de una sesión guardada previamente. En modo headless combinado con `--output-format stream-json`, esto permite a un pipeline continuar una tarea de larga duración a través de múltiples invocaciones. El flag `--continue` continúa la sesión más reciente sin necesitar un ID específico. `--session-id`, `--restore` y `--attach` no son flags válidos de Claude Code.",
    keyConcept: "Reanudación de sesión: --resume [session_id] restaura una sesión anterior específica",
  },

  // ============================================================
  // DOMINIO 4 – Ingeniería de Prompts y Salidas Estructuradas
  // ============================================================

  "E4-001": {
    question:
      "Tu aplicación fue construida sobre Claude 3.5 y dependía de respuestas asistente pre-completadas (comenzando el turno del asistente con JSON parcial) para forzar salida estructurada. Actualizas a Claude 4.6. ¿Qué debes cambiar en tu integración?",
    options: {
      A: "Nada — las respuestas pre-completadas están completamente soportadas en Claude 4.6 y siguen siendo el enfoque recomendado",
      B: "Las respuestas pre-completadas están deprecadas en Claude 4.6 — reemplázalas con la característica de salida estructurada `output_config.format` o instrucciones explícitas en el prompt",
      C: "Aumentar el límite de `max_tokens`; la deprecación solo afecta a respuestas de menos de 50 tokens",
      D: "Mover el contenido pre-completado del turno del asistente a un resultado de herramienta para mantener el mismo comportamiento",
    },
    explanation:
      "Las respuestas asistente pre-completadas (inyectar texto parcial al inicio del turno del asistente para guiar el formato de salida) están deprecadas en Claude 4.6 y versiones posteriores. Los enfoques de reemplazo son: (1) usar `output_config.format` con `type: \"json_schema\"` para salida JSON estructurada garantizada mediante decodificación restringida, o (2) confiar en el seguimiento mejorado de instrucciones de Claude 4.6 con instrucciones de formato explícitas en el prompt. La deprecación aplica a todos los tamaños de respuesta.",
    keyConcept: "Respuestas pre-completadas deprecadas en Claude 4.6 — usar salidas estructuradas o instrucciones",
  },

  "E4-002": {
    question:
      "Necesitas extraer datos estructurados de pedidos de correos electrónicos de clientes, garantizados para coincidir con un esquema JSON específico en cada llamada. El esquema incluye `order_id`, `items`, `total` y `shipping_address`. ¿Qué configuración de API logra una garantía sólida de cumplimiento del esquema?",
    options: {
      A: 'Agregar "Responde solo con JSON válido que coincida con este esquema: {...}" al system prompt',
      B: 'Usar `output_config: { format: { type: "json_schema", schema: {...} } }` en la solicitud API para habilitar la decodificación restringida',
      C: 'Establecer `response_format: { type: "json_object" }` para habilitar el modo JSON',
      D: "Usar una herramienta con el esquema definido como parámetros de entrada, luego parsear los argumentos de la llamada a herramienta como salida estructurada",
    },
    explanation:
      "`output_config.format.type = \"json_schema\"` con un esquema proporcionado habilita la decodificación restringida — la generación de tokens del modelo está restringida en la capa de muestreo para producir solo tokens válidos según el esquema. Esto proporciona una garantía sólida en tiempo de ejecución del cumplimiento del esquema, a diferencia de las instrucciones en el prompt (que dependen del comportamiento del modelo y pueden fallar) o el modo `json_object` (que garantiza JSON válido pero no una forma específica del esquema). Llamar a una herramienta con parámetros de esquema es una alternativa válida pero agrega sobrecarga de ida y vuelta.",
    keyConcept: "output_config.format.type = json_schema habilita la decodificación restringida para el cumplimiento del esquema",
  },

  "E4-003": {
    question:
      "Un desarrollador define el siguiente esquema JSON para salida estructurada:\n```json\n{\n  \"type\": \"object\",\n  \"properties\": {\n    \"status\": { \"type\": \"string\", \"enum\": [\"active\", \"inactive\"] },\n    \"count\": { \"type\": \"integer\", \"minimum\": 0, \"maximum\": 100 }\n  },\n  \"required\": [\"status\", \"count\"]\n}\n```\nEste esquema es rechazado cuando se usa con `strict: true`. ¿Por qué?",
    options: {
      A: "La restricción `enum` en `status` no está soportada en modo estricto",
      B: "Las restricciones `minimum` y `maximum` en `count` no están soportadas en modo estricto, y falta `additionalProperties: false`",
      C: "El esquema usa el tipo `integer` que no está soportado — solo se permite `number`",
      D: "El array `required` debe estar vacío en modo estricto",
    },
    explanation:
      "Los esquemas JSON en modo estricto tienen limitaciones específicas: `minimum`, `maximum`, `minLength`, `maxLength`, `pattern`, `const` y los combinadores de esquema no están soportados. Además, `additionalProperties: false` es obligatorio en todos los tipos de objeto en modo estricto. El esquema falla por dos razones: (1) `count` usa `minimum` y `maximum` que no están soportados, y (2) al objeto le falta `additionalProperties: false`. `enum` es válido en modo estricto. El tipo `integer` está soportado. Todas las propiedades definidas deben estar en `required`, lo cual están.",
    keyConcept: "Limitaciones del modo estricto: sin minimum/maximum, additionalProperties debe ser false",
  },

  "E4-004": {
    question:
      "Un desarrollador diseña un esquema de salida estructurada que incluye un tipo `Node` que tiene un campo `children` que también es un array de objetos `Node` (una estructura de árbol recursiva). Intentan usar esto con `strict: true`. ¿Qué sucederá?",
    options: {
      A: "Funciona correctamente — la decodificación restringida maneja tipos recursivos con profundidad acotada automáticamente",
      B: "El esquema es rechazado — las referencias circulares/recursivas no están soportadas en la decodificación restringida en modo estricto",
      C: "Funciona pero solo hasta 3 niveles de anidamiento; los árboles más profundos son truncados",
      D: "Los esquemas recursivos requieren que se establezca el flag `circular: true` en la definición del esquema",
    },
    explanation:
      "La decodificación restringida en modo estricto construye una máquina de estados finita a partir del esquema JSON en el momento de la solicitud para restringir la generación de tokens. Las referencias circulares/recursivas (donde un tipo se referencia a sí mismo) crearían máquinas de estados infinitas, que no pueden construirse. Por tanto, las referencias circulares están explícitamente no soportadas en los esquemas de modo estricto. Para estructuras de árbol, debes usar un esquema no estricto (con validación del lado del servidor) o limitar la profundidad inlineando el tipo hasta una profundidad fija en lugar de usar referencias recursivas.",
    keyConcept: "El modo estricto no soporta referencias de esquema circulares/recursivas",
  },

  "E4-005": {
    question:
      "Un sistema de clasificación de tickets de soporte necesita procesar 50,000 tickets durante la noche. Cada ticket requiere una sola llamada a Claude para clasificación. Usando llamadas API síncronas, esto tarda 14 horas. ¿Cuál es la característica de API más apropiada para este caso de uso?",
    options: {
      A: "Aumentar el límite de tasa contactando al soporte de Anthropic para permitir mayor rendimiento síncrono",
      B: "Usar la Batch API — enviar las 50,000 solicitudes en lotes de hasta 100,000, que se procesa de forma asíncrona y típicamente se completa en menos de 1 hora a menor costo",
      C: "Usar llamadas API síncronas paralelas con 100 hilos concurrentes para lograr un rendimiento 100 veces mayor",
      D: "Usar respuestas de streaming para reducir el tiempo hasta el primer token de cada ticket",
    },
    explanation:
      "La Batch API está diseñada exactamente para cargas de trabajo de alto volumen y no en tiempo real, como las tareas de clasificación nocturna. Especificaciones clave: hasta 100,000 solicitudes o 256 MB por lote, la mayoría de los lotes se completan en menos de 1 hora (no 14 horas), los resultados están disponibles durante 29 días, los lotes vencen a las 24 horas si no se completan, y el precio es típicamente menor que las llamadas síncronas. Las llamadas síncronas paralelas alcanzarían los límites de tasa. El streaming reduce la latencia pero no el rendimiento. Solicitar aumentos de límite de tasa es lento y costoso.",
    keyConcept: "Batch API: 100K solicitudes/256MB por lote, <1 hora típico, resultados disponibles 29 días",
  },

  "E4-006": {
    question:
      "Un trabajo de Batch API se envía el lunes a las 9:00 AM con 80,000 solicitudes. No se ha completado el martes a las 9:00 AM. ¿Qué sucede con el lote y cuándo vencen los resultados?",
    options: {
      A: "El lote continúa indefinidamente; no hay vencimiento",
      B: "El lote vence y se cancela a las 24 horas (martes a las 9:00 AM); los resultados completados están disponibles para recuperación durante 29 días desde el envío",
      C: "El lote se pausa después de 12 horas y requiere reanudación manual; los resultados vencen 7 días después de la finalización",
      D: "El lote se reintenta automáticamente desde cero después de 24 horas sin intervención del usuario",
    },
    explanation:
      "Los trabajos de Batch API tienen una ventana de procesamiento de 24 horas: si el lote no se ha completado dentro de las 24 horas desde el envío, vence y se cancela. Los resultados de las solicitudes completadas dentro de un lote vencido aún son recuperables. Los resultados en sí permanecen disponibles durante 29 días desde la fecha de envío original, después de los cuales se eliminan. No hay mecanismo de reintento automático ni de reanudación manual — debes reenviar los lotes fallidos.",
    keyConcept: "Batch API: vence a las 24h si está incompleto, resultados disponibles durante 29 días desde el envío",
  },

  "E4-007": {
    question:
      "Un agente de investigación procesa un documento técnico de 50 páginas y luego responde preguntas sobre él. El rendimiento es deficiente y la precisión es baja. Un ingeniero senior sugiere reordenar el prompt. ¿Cuál es la estructura recomendada para responder preguntas sobre documentos largos?",
    options: {
      A: "Colocar la pregunta primero, seguida de las instrucciones, seguida del documento",
      B: "Intercalar secciones relevantes del documento con cada pregunta para coubicación de evidencia y consulta",
      C: "Colocar el documento largo al inicio del prompt, seguido de las instrucciones, con la consulta específica al final",
      D: "Colocar instrucciones al inicio, el documento en el medio y la pregunta al final",
    },
    explanation:
      "La investigación sobre el manejo de contexto de Claude muestra que colocar documentos largos al inicio del prompt, seguidos de instrucciones de tarea, con la consulta específica al final puede mejorar la precisión hasta en un 30% en comparación con otros órdenes. Esta estructura refleja cómo trabajaría un experto humano: absorber primero el contexto completo del documento, entender la estructura de la tarea, luego aplicarla a la pregunta específica. Colocar las consultas antes del documento significa que el modelo procesa la pregunta sin el contexto que necesita.",
    keyConcept: "Documentos largos al inicio, consulta al final — mejora de precisión de hasta el 30%",
  },

  "E4-008": {
    question:
      "Un prompt de generación de respuestas de soporte usa etiquetas XML para estructurar su contenido:\n```xml\n<context>El cliente es miembro desde 2019...</context>\n<instructions>Redacta una respuesta que...</instructions>\n<input>Queja del cliente: {{complaint}}</input>\n```\n¿Por qué se prefieren las etiquetas XML sobre los delimitadores simples para estructurar prompts complejos?",
    options: {
      A: "Las etiquetas XML son requeridas por la API de Anthropic y los delimitadores de texto simple causan errores de parseo",
      B: "Las etiquetas XML proporcionan límites semánticos con nombre e inequívocos que Claude analiza de manera confiable — a diferencia de markdown o delimitadores simples que pueden aparecer naturalmente en el contenido y causar confusión de límites",
      C: "Las etiquetas XML se comprimen mejor y reducen el conteo de tokens en comparación con delimitadores de texto simple",
      D: "Las etiquetas XML permiten a Claude extraer contenido de forma programática mediante XPath en su procesamiento interno",
    },
    explanation:
      "Las etiquetas XML se recomiendan para estructurar prompts complejos porque proporcionan límites semánticos con nombre (`<context>`, `<instructions>`, `<input>`) que delimitan claramente las secciones incluso cuando el contenido de la sección en sí contiene texto de apariencia similar. Los encabezados markdown (`##`) o los delimitadores simples (`---`) pueden aparecer naturalmente en el contenido, causando ambigüedad sobre dónde termina una sección y comienza otra. El entrenamiento de Claude incluye prompts estructurados con XML y los analiza de manera confiable. Las etiquetas XML no son requeridas por la API y no afectan el conteo de tokens.",
    keyConcept: "Etiquetas XML para estructura de prompt inequívoca: <example>, <instructions>, <context>, <input>",
  },

  "E4-009": {
    question:
      "Un prompt de generación de código produce salidas sutilmente incorrectas que son difíciles de detectar. Un ingeniero de prompts propone un patrón de 'auto-verificación'. ¿En qué consiste este patrón y por qué es efectivo?",
    options: {
      A: "El patrón de auto-verificación llama al modelo dos veces — una para generar, otra para validar — duplicando el costo pero eliminando errores",
      B: "El patrón de auto-verificación instruye al modelo a revisar su propia salida contra criterios especificados antes de finalizarla, detectando errores mediante razonamiento explícito de segunda pasada en una sola llamada",
      C: "El patrón de auto-verificación añade un esquema JSON de validación que el modelo verifica automáticamente contra su salida",
      D: "El patrón de auto-verificación usa un flag `verify: true` en la API para habilitar la verificación de consistencia interna",
    },
    explanation:
      "El patrón de auto-verificación es una técnica de ingeniería de prompts donde, después de generar una respuesta inicial, se instruye al modelo (en el mismo prompt o como un turno de seguimiento) a releer su salida y verificarla contra criterios explícitos (por ejemplo, '¿Este código maneja el caso null? ¿Coincide con la firma de la función?'). Esto aprovecha la capacidad de razonamiento del modelo para detectar errores que pudo haber cometido en la generación inicial. Se realiza en una sola llamada API (como parte del prompt) o como un segundo turno, no mediante una llamada API separada, y no requiere ningún flag especial.",
    keyConcept: "Patrón de auto-verificación: el modelo revisa su propia salida contra criterios antes de finalizarla",
  },

  "E4-010": {
    question:
      "Un equipo migra su prompt de una versión anterior de Claude a Claude 4.6. Una herramienta que se llamaba ~60% de las veces ahora se activa en casi cada mensaje, causando efectos secundarios inesperados. ¿Cuál es la causa más probable?",
    options: {
      A: "Claude 4.6 tiene un error en la selección de herramientas que fuerza a que todas se activen",
      B: "El prompt estaba sobre-diseñado para un modelo más antiguo y menos capaz — las instrucciones explícitas de uso de herramientas que eran necesarias para activar la herramienta ahora causan sobreactivación con el seguimiento de instrucciones más capaz de Claude 4.6",
      C: "La configuración `tool_choice: auto` cambió el comportamiento entre versiones; establecer `tool_choice: none` para solucionarlo",
      D: "La ventana de contexto del modelo es más grande en 4.6 y procesa la descripción de la herramienta de forma diferente",
    },
    explanation:
      "Un antipatrón bien documentado al actualizar a Claude 4.6 (o modelos igualmente capaces) es el exceso de instrucciones en el prompt. Los modelos más antiguos y menos capaces a veces necesitaban instrucciones muy explícitas y detalladas para activar llamadas a herramientas de manera confiable. Cuando esos mismos prompts se usan con el seguimiento de instrucciones más fuerte de Claude 4.6, las herramientas que antes se subactivaban ahora se sobreactivan. La solución es simplificar los prompts — eliminar o suavizar el lenguaje de activación explícita que estaba compensando las limitaciones del modelo anterior.",
    keyConcept: "Antipatrón: exceso de instrucciones para Claude 4.6 hace que herramientas que antes se subactivaban ahora se sobreactiven",
  },

  "E4-011": {
    question:
      "Estás diseñando un esquema JSON para extracción estructurada con `strict: true`. El esquema necesita un campo opcional `notes` que puede o no estar presente en la salida. En JSON Schema estándar, omitirías `notes` de `required`. ¿Qué debes hacer de forma diferente en modo estricto?",
    options: {
      A: "En modo estricto, todas las propiedades definidas en el esquema DEBEN estar en el array `required` — hacer `notes` requerido pero permitir `null` como su valor usando `type: [\"string\", \"null\"]`",
      B: "Los campos opcionales se expresan estableciendo `required: false` como un flag a nivel de propiedad",
      C: "Los campos opcionales no están soportados en modo estricto; eliminar `notes` del esquema completamente",
      D: 'Usar `anyOf: [{"type": "string"}, {"type": "null"}]` para campos opcionales — anyOf está permitido para manejo de null',
    },
    explanation:
      "En modo estricto, todas las propiedades definidas en el objeto `properties` DEBEN aparecer en el array `required` — no hay campos opcionales en el sentido estándar. Para representar 'opcionalidad' (el valor puede o no ser significativo), el enfoque canónico es requerir el campo pero permitir `null` como su tipo usando `type: [\"string\", \"null\"]`. Cuando no existen notas, el modelo produce `null`. No hay flag `required: false` a nivel de propiedad, y `anyOf` no está soportado en modo estricto.",
    keyConcept: "Modo estricto: todas las propiedades deben ser requeridas; usar type: [\"string\", \"null\"] para campos opcionales nulables",
  },

  "E4-012": {
    question:
      "Un trabajo de Batch API devuelve resultados con algunas solicitudes mostrando `\"error_max_structured_output_retries\"` como stop reason. ¿Qué indica esto y cuál es la solución recomendada?",
    options: {
      A: "El esquema de salida estructurada era demasiado grande — reducir el número de campos",
      B: "Claude intentó generar salida estructurada válida múltiples veces pero no logró ajustarse al esquema después del máximo de reintentos permitidos — el esquema puede ser demasiado restrictivo o ambiguo para la entrada dada",
      C: "El lote superó la cuota de reintentos — esperar 24 horas antes de reenviar",
      D: "El modelo fue interrumpido a mitad de generación; reenviar esas solicitudes específicas individualmente",
    },
    explanation:
      "`error_max_structured_output_retries` es un subtipo de ResultMessage que indica que Claude intentó generar salida que se ajustara al esquema JSON especificado múltiples veces pero no logró producir un resultado válido dentro del presupuesto de reintentos permitido. Esto ocurre típicamente cuando el esquema es altamente restrictivo en relación con el contenido de entrada — por ejemplo, requiriendo valores enum que no coinciden con los datos reales, o requiriendo campos que no pueden extraerse de la fuente. La solución es revisar el esquema en busca de restricciones excesivamente estrictas, simplificar el esquema o mejorar el prompt para guiar al modelo hacia salidas válidas.",
    keyConcept: "error_max_structured_output_retries: conformidad del esquema fallida repetidamente; revisar restricciones del esquema",
  },

  // ============================================================
  // DOMINIO 5 – Gestión de Contexto y Rendimiento
  // ============================================================

  "E5-001": {
    question:
      "Un equipo está eligiendo entre Claude Opus 4.6 y Claude Sonnet 4.5 para una tarea de análisis de documentos largos. Los documentos tienen 800,000 tokens cada uno. ¿Qué modelos pueden manejar esto de forma nativa sin configuración especial?",
    options: {
      A: "Solo Claude Opus 4.6 — Sonnet 4.5 tiene un límite de 200K tokens y no puede procesar documentos de 800K tokens",
      B: "Tanto Claude Opus 4.6 como Claude Sonnet 4.6 tienen ventanas de contexto de 1M tokens; Claude Sonnet 4.5 tiene 200K de forma nativa pero puede llegar a 1M con el header beta de contexto extendido",
      C: "Ninguno puede manejar 800K tokens; los documentos deben dividirse en fragmentos de menos de 200K independientemente del modelo",
      D: "Todos los modelos Claude 4.x tienen ventanas de contexto de 2M tokens",
    },
    explanation:
      "Especificaciones de ventana de contexto: Claude Opus 4.6 y Claude Sonnet 4.6 tienen ventanas de contexto nativas de 1M tokens. Claude Sonnet 4.5 y Claude 4 (sin el sufijo 4.6) tienen ventanas de contexto nativas de 200K tokens pero pueden extenderse a 1M tokens usando el header de solicitud beta de contexto extendido. Para un documento de 800K tokens, Opus 4.6 y Sonnet 4.6 lo manejan de forma nativa; Sonnet 4.5 requiere el header beta. Todos los modelos Claude 4.x están muy por debajo de la afirmación de 2M.",
    keyConcept: "Ventanas de contexto: Opus 4.6/Sonnet 4.6 = 1M nativo; Sonnet 4.5/4 = 200K (1M con header beta)",
  },

  "E5-002": {
    question:
      "Claude Code está procesando una tarea de análisis de código grande y comienza a recibir mensajes XML `<token_budget>` inyectados en su contexto. ¿Qué hace este mecanismo y por qué es importante?",
    options: {
      A: "Es una notificación de facturación que le indica al modelo que reduzca la verbosidad de la salida para mantenerse dentro del presupuesto",
      B: "Claude recibe XML `<token_budget>` con información de presupuesto restante y actualizaciones de uso después de cada llamada a herramienta — esta conciencia del contexto permite a Claude ajustar su comportamiento (por ejemplo, ser más conciso, dejar de lanzar nuevos subagentes) a medida que se llena el contexto",
      C: "Es un elemento de prompt configurable por el usuario que restringe la longitud total de la salida",
      D: "Activa la compactación automática cada vez que aparece en el contexto",
    },
    explanation:
      "El sistema de gestión de contexto de Claude Code inyecta XML `<token_budget>` en el contexto, proporcionando a Claude información sobre el presupuesto de tokens restante y actualizaciones de uso después de cada llamada a herramienta. Esta conciencia del contexto es por diseño: Claude puede usar esta información para tomar decisiones informadas, como escribir respuestas más cortas, evitar lanzar nuevos subagentes que consumirían contexto adicional, o priorizar sus pasos restantes. No es una notificación de facturación, no es configurable directamente por el usuario y no activa la compactación.",
    keyConcept: "Conciencia del contexto: Claude recibe XML token_budget y actualizaciones de uso después de cada llamada a herramienta",
  },

  "E5-003": {
    question:
      "Un equipo quiere implementar comportamiento de compactación personalizado — específicamente, guardar un resumen estructurado en un archivo antes de que ocurra la compactación, en lugar de depender de la summarización con pérdida predeterminada. ¿Qué hook habilita esto?",
    options: {
      A: "`PostToolUse` en cualquier llamada a herramienta — ejecutar la lógica de resumen cada vez que se ejecute cualquier herramienta",
      B: "`SessionStart` — ejecutar la lógica de resumen al comienzo de cada nueva sesión después de la compactación",
      C: "`PreCompact` — se activa antes de que ocurra la compactación, permitiendo que la lógica de preservación de estado personalizado se ejecute primero",
      D: "Manejador de SystemMessage `compact_boundary` — interceptar el mensaje del sistema y redirigir la compactación",
    },
    explanation:
      "El hook `PreCompact` se activa específicamente antes de que comience el proceso de compactación de contexto de Claude Code. Este es el hook correcto para implementar comportamiento de compactación personalizado: el hook puede escribir un resumen estructurado, guardar estado clave en archivos o realizar cualquier lógica de preservación antes de que se resuma el historial de conversación. `PostToolUse` es demasiado frecuente y no es activado por la compactación. `SessionStart` se activa después de que la compactación ocurrió y comienza una nueva sesión, lo cual es demasiado tarde. El SystemMessage `compact_boundary` es observable pero no interceptable como hook.",
    keyConcept: "El hook PreCompact habilita la preservación de estado personalizado antes de la compactación de contexto",
  },

  "E5-004": {
    question:
      "Un flujo de trabajo de investigación complejo procesa 500 documentos a través de múltiples sesiones. El equipo debate entre: (A) usar una sola sesión de larga duración con compactación, o (B) lanzar subagentes para cada lote, que devuelven resultados a un coordinador. ¿Qué enfoque es más eficiente en cuanto a contexto y por qué?",
    options: {
      A: "Sesión única con compactación — evita la sobrecarga de lanzar múltiples agentes y la compactación preserva toda la información relevante",
      B: "Subagentes en ventanas de contexto nuevas — cada subagente procesa su lote en un contexto aislado, devuelve solo el resultado final al coordinador, evitando que el contexto del coordinador acumule el historial completo de procesamiento",
      C: "Ambos enfoques son equivalentes en eficiencia de contexto; elegir según la complejidad del código",
      D: "La sesión única es más eficiente porque la reutilización de contexto entre documentos reduce el costo de tokens por documento",
    },
    explanation:
      "Los subagentes en ventanas de contexto nuevas son significativamente más eficientes en contexto para el procesamiento a gran escala. Cada subagente comienza con un contexto limpio, procesa su lote y devuelve solo el resultado final al coordinador. Los pasos de procesamiento intermedios (cientos de llamadas a herramientas, resultados parciales) nunca se acumulan en el contexto del coordinador. Con compactación, aunque el historial se resume, ocurre pérdida de información y el contexto del coordinador aún crece con el tiempo. El patrón de múltiples ventanas de contexto es el enfoque recomendado para flujos de trabajo que exceden la capacidad de una sola ventana de contexto.",
    keyConcept: "Flujos de trabajo con múltiples ventanas de contexto: subagentes con contexto nuevo preferidos sobre compactación a escala",
  },

  "E5-005": {
    question:
      "Un pipeline de CI ejecuta múltiples sesiones de Claude Code en diferentes ejecuciones, y el equipo necesita que cada sesión sepa qué pruebas pasaron o fallaron en la ejecución anterior. El pipeline no usa reanudación de sesión. ¿Cuál es el mecanismo más confiable para pasar estado entre ventanas de contexto?",
    options: {
      A: "Incluir el historial de conversación completo de la ejecución anterior en el system prompt de la nueva sesión",
      B: "Escribir un archivo de estado estructurado `tests.json` o `progress.txt` al final de cada ejecución; la siguiente sesión lee este archivo al inicio para entender el estado previo",
      C: "Usar el flag `--continue` para heredar automáticamente el estado de la sesión anterior",
      D: "Almacenar el estado en variables de entorno que persisten entre ejecuciones de CI",
    },
    explanation:
      "Los archivos de estado (por ejemplo, `tests.json`, `progress.txt`) escritos en el sistema de archivos son el patrón recomendado para pasar estado estructurado entre límites de ventana de contexto en flujos de trabajo de múltiples sesiones. Cada sesión lee el archivo de estado al inicio (mediante un hook SessionStart o una llamada inicial a herramienta), procesa su trabajo y escribe un archivo de estado actualizado. Esto es explícito, inspeccionable y no depende de la continuidad de la sesión. Incluir el historial completo de conversación en los system prompts desperdicia tokens. `--continue` solo reanuda la sesión inmediatamente anterior. Las variables de entorno son efímeras en la mayoría de los sistemas de CI.",
    keyConcept: "Archivos de estado (tests.json, progress.txt) para seguimiento confiable del estado entre ventanas de contexto",
  },

  "E5-006": {
    question:
      "Un flujo de trabajo de refactorización de código de múltiples sesiones necesita rastrear qué archivos se han refactorizado en múltiples ejecuciones de Claude Code. El equipo considera usar git como mecanismo de estado. ¿Por qué es git particularmente adecuado para esto?",
    options: {
      A: "Git proporciona operaciones atómicas del sistema de archivos que evitan el desbordamiento de la ventana de contexto",
      B: "Los commits de git crean un registro persistente y consultable de qué archivos se cambiaron en cada sesión — la siguiente sesión puede ejecutar `git diff` o `git log` para descubrir exactamente qué se hizo y qué queda por hacer",
      C: "Git inyecta automáticamente el historial de commits en la ventana de contexto de Claude mediante el sistema CLAUDE.md",
      D: "El área de staging de git sirve como almacén de memoria entre sesiones que Claude Code lee de forma nativa",
    },
    explanation:
      "Git es un excelente mecanismo de estado entre sesiones porque los commits crean un registro persistente y direccionable por contenido de exactamente qué cambió y cuándo. La siguiente sesión de Claude Code puede usar `git status` para ver cambios sin confirmar, `git log` para ver qué se completó en sesiones anteriores y `git diff` para entender el estado actual relativo a cualquier línea base. Esto le da a Claude información de estado precisa y consultable sin consumir ventana de contexto con el historial de conversación sin procesar. Git no inyecta automáticamente en CLAUDE.md y su área de staging no es un mecanismo de memoria nativo de Claude.",
    keyConcept: "Git como seguimiento de estado entre sesiones: git log/diff/status proporciona historial preciso y consultable",
  },

  "E5-007": {
    question:
      "Un coordinador de investigación orquesta 20 subagentes. Al comienzo de la sesión, antes de que se procese cualquier documento, el coordinador ya tiene un 15% de utilización del contexto. El coordinador tiene 12 servidores MCP conectados. ¿Cuál es el contribuyente principal más probable al alto uso base del contexto?",
    options: {
      A: "El system prompt del coordinador es demasiado largo y debe acortarse",
      B: "Las 20 definiciones de subagentes se pre-cargan en la ventana de contexto al inicio de la sesión",
      C: "Los 12 servidores MCP inyectan todos sus esquemas de herramientas en cada solicitud, creando una base alta de tokens de definición de herramientas antes de que se agregue cualquier contenido de tarea",
      D: "El archivo CLAUDE.md del proyecto es demasiado grande y consume contexto excesivo",
    },
    explanation:
      "Cada servidor MCP inyecta todos sus esquemas de herramientas (nombres, descripciones, tipos de parámetros, documentación) en cada solicitud API. Con 12 servidores, cada uno potencialmente con entre 5 y 20 herramientas con esquemas detallados, el contexto combinado de definición de herramientas puede llegar fácilmente a miles de tokens. Esta sobrecarga está presente en cada solicitud antes de que se procese cualquier contenido de tarea, explicando la base alta. Las definiciones de subagentes no se pre-cargan. Los system prompts y CLAUDE.md pueden contribuir pero típicamente son más pequeños que los esquemas de herramientas de 12 servidores.",
    keyConcept: "Cada servidor MCP agrega TODOS los esquemas de herramientas a CADA solicitud — fuente principal de sobrecarga de contexto base",
  },

  "E5-008": {
    question:
      "Durante una sesión de investigación larga, aparece un `SystemMessage` con `subtype: \"compact_boundary\"`. La sesión tenía hallazgos importantes compartidos en mensajes de conversación (no en CLAUDE.md) y también tenía instrucciones CLAUDE.md a nivel de proyecto. Después de la compactación, ¿qué elementos sobreviven intactos y cuáles están en riesgo?",
    options: {
      A: "Tanto los hallazgos de la conversación como CLAUDE.md sobreviven — la compactación solo elimina los detalles de las llamadas a herramientas",
      B: "CLAUDE.md sobrevive intacto (reinyectado desde disco después de la compactación); los mensajes de conversación incluyendo hallazgos importantes se resumen con pérdida — algunos detalles pueden perderse",
      C: "Ninguno sobrevive — la compactación inicia un contexto completamente nuevo con solo el system prompt",
      D: "CLAUDE.md se resume como los mensajes de conversación; solo los 20 mensajes más recientes sobreviven de forma literal",
    },
    explanation:
      "La compactación funciona de la siguiente manera: CLAUDE.md se relee desde disco y se inyecta de nuevo — siempre sobrevive de forma literal. El historial de conversación (incluyendo hallazgos importantes, resultados intermedios y cualquier instrucción dada conversacionalmente) se resume mediante compresión con pérdida. El resumen preserva la narrativa general pero puede perder detalles específicos, números o conclusiones. Por eso la información crítica debe escribirse en CLAUDE.md o en archivos de estado en lugar de dejarse en mensajes conversacionales si necesita sobrevivir a la compactación.",
    keyConcept: "Compactación: CLAUDE.md sobrevive de forma literal; el historial de conversación se resume con pérdida",
  },

  "E5-009": {
    question:
      "Una tarea de análisis compleja está diseñada como una sola sesión larga, pero el equipo descubre que después de completar el 60% de la tarea, la calidad del agente se degrada. El ingeniero propone cambiar a un flujo de trabajo de múltiples ventanas de contexto. ¿Cómo se ve este enfoque en la práctica?",
    options: {
      A: "Ejecutar el mismo prompt múltiples veces en sesiones separadas y combinar las salidas por mayoría de votos",
      B: "Dividir la tarea en lotes; cada lote se ejecuta en una sesión nueva que comienza leyendo un archivo de estado (descubrimiento del sistema de archivos), procesa su trabajo y escribe los resultados de vuelta — no se lleva historial de sesión entre lotes",
      C: "Usar el flag `--context-budget` para dividir el presupuesto de sesión entre múltiples llamadas API",
      D: "Habilitar la compactación en cada llamada API individualmente en lugar de dejar que se acumule",
    },
    explanation:
      "El patrón de flujo de trabajo de múltiples ventanas de contexto funciona de la siguiente manera: dividir la tarea general en lotes; cada lote inicia una sesión de Claude Code nueva que comienza leyendo el estado actual del sistema de archivos (un archivo de estado, git status o una salida estructurada del lote anterior) en lugar del historial de conversación; la sesión procesa su lote y escribe los resultados de vuelta al sistema de archivos; la siguiente sesión repite esto. Esto mantiene cada ventana de contexto pequeña y limpia. No existe ningún flag `--context-budget` y la compactación por llamada no es una opción configurable.",
    keyConcept: "Múltiples ventanas de contexto: sesiones nuevas + descubrimiento del sistema de archivos preferidos sobre sesiones largas con compactación",
  },

  "E5-010": {
    question:
      "Un equipo de soporte está procesando tickets de clientes con Claude Sonnet 4.5 y encuentra un hilo de tickets de 180,000 tokens que supera la ventana de contexto nativa del modelo de 200K al agregar el system prompt. Quieren extender el contexto a 1M tokens. ¿Cuál es el enfoque técnico correcto?",
    options: {
      A: "Actualizar a Claude Sonnet 4.6 que tiene una ventana de contexto nativa de 1M",
      B: "Agregar el header de solicitud beta de contexto extendido para desbloquear 1M tokens para Claude Sonnet 4.5",
      C: "Habilitar `extended_context: true` en la configuración del servidor MCP .mcp.json",
      D: "Tanto A como B son opciones válidas; A requiere un cambio de modelo, B extiende el modelo actual",
    },
    explanation:
      "Ambos enfoques son técnicamente válidos para este escenario. La opción A (actualizar a Claude Sonnet 4.6) admite 1M tokens de forma nativa sin ninguna configuración adicional — sencillo y confiable. La opción B (agregar el header beta de contexto extendido) habilita contexto de 1M tokens para Claude Sonnet 4.5 sin cambiar modelos, útil si hay razones de costo, latencia o paridad de características para permanecer en 4.5. La elección depende de restricciones operativas. No existe ninguna configuración `extended_context` en `.mcp.json`.",
    keyConcept: "Sonnet 4.5 alcanza 1M tokens via header beta; Sonnet 4.6 tiene 1M de forma nativa",
  },

  "E5-011": {
    question:
      "Un orquestador recibe `<token_budget remaining=\"45000\">` en su contexto mientras está a mitad de lanzar 8 subagentes más (cada uno estimado en ~10,000 tokens de sobrecarga de resultado). ¿Qué debe hacer un orquestador bien diseñado con esta información?",
    options: {
      A: "Ignorar la información de presupuesto y continuar lanzando los 8 subagentes según lo planeado",
      B: "Activar inmediatamente la compactación manual antes de lanzar más subagentes",
      C: "Usar la información de presupuesto para adaptarse: lanzar solo 4 de los 8 subagentes (priorizando los más críticos), escribir los resultados intermedios en un archivo de estado y planificar la continuación en una nueva ventana de contexto para los 4 restantes",
      D: "Cambiar a un modelo con una ventana de contexto más grande a mitad de sesión",
    },
    explanation:
      "La conciencia del contexto de Claude (mediante XML `<token_budget>`) está diseñada para habilitar comportamiento adaptativo. Con 45,000 tokens restantes y 8 subagentes consumiendo cada uno ~10,000 tokens, lanzar los 8 excedería el presupuesto (80,000 > 45,000). La respuesta bien diseñada es priorizar los subagentes más críticos, lanzar solo tantos como permita el presupuesto, persistir los resultados intermedios en un archivo de estado para mayor durabilidad y planificar con gracia la continuación en una nueva ventana de contexto. No puedes cambiar modelos a mitad de sesión, y activar la compactación a mitad de tarea arriesga perder estado crítico.",
    keyConcept: "Conciencia de token_budget: adaptar el lanzamiento de subagentes y planificar una continuación elegante",
  },

  "E5-012": {
    question:
      "Un flujo de trabajo de procesamiento de datos necesita rastrear cuáles de 1,000 elementos se han procesado en múltiples sesiones de Claude Code. El equipo considera tres opciones: (A) confiar en la memoria de Claude dentro de una sola sesión larga, (B) escribir un archivo `progress.txt` actualizado después de cada elemento, (C) usar commits de git después de cada lote. ¿Qué opciones son confiables entre reinicios de sesión?",
    options: {
      A: "Solo la opción A — la memoria en contexto de Claude es el mecanismo de seguimiento más preciso",
      B: "Solo la opción B — los archivos de texto son el único formato que Claude Code puede leer al inicio de la sesión",
      C: "Las opciones B y C — ambos enfoques basados en el sistema de archivos persisten entre sesiones; la opción A se pierde cuando la sesión termina o se compacta",
      D: "Las tres opciones son igualmente confiables entre reinicios de sesión",
    },
    explanation:
      "La memoria en sesión (opción A) se pierde cuando una sesión de Claude Code termina y se degrada con la compactación. No puede rastrear estado de manera confiable entre múltiples sesiones. Los enfoques basados en el sistema de archivos (B y C) persisten independientemente de cualquier sesión de Claude Code: `progress.txt` está diseñado explícitamente para este patrón, y los commits de git proporcionan un registro consultable y controlado por versiones del progreso que cualquier sesión nueva puede inspeccionar mediante `git log`. Tanto B como C son patrones recomendados para la gestión de estado entre sesiones.",
    keyConcept: "El estado basado en el sistema de archivos (progress.txt, git) sobrevive a los reinicios de sesión; la memoria en contexto no",
  },
};
