import { QuestionTranslation } from "./questions-es";

export const examQuestionsEs: Record<string, QuestionTranslation> = {
  // ============================================================
  // DOMINIO 1 – Arquitectura Agéntica y Orquestación
  // ============================================================

  "E1-001": {
    question:
      "Para decidir cuándo detenerse, tu bucle de soporte busca en cada respuesta de Claude frases como «¿Hay algo más en lo que pueda ayudarte?». Después de que un cambio de prompt modificó la redacción del agente, algunas conversaciones terminan antes de procesar el reembolso y otras siguen dando vueltas después de haber ayudado al cliente. ¿Qué debe determinar el fin del bucle?",
    options: {
      A: "Una lista más larga de frases de cierre, en un archivo de configuración que se actualice tras cada cambio de prompt",
      B: "El campo stop_reason: seguir iterando mientras sea \"tool_use\" y terminar cuando sea \"end_turn\"",
      C: "Si la última respuesta contiene algún texto, ya que los turnos que llaman herramientas nunca traen texto",
      D: "Un modelo clasificador aparte que lea cada respuesta y juzgue si el problema parece resuelto",
    },
    explanation:
      "`stop_reason` es la señal estructurada hecha para esta decisión: `\"tool_use\"` significa que Claude quiere el resultado de una herramienta y el bucle debe continuar; `\"end_turn\"` significa que terminó. No cambia cuando cambia la redacción.\n\nLa opción A sigue analizando lenguaje natural, el antipatrón que falló aquí, y lo convierte en una tarea de mantenimiento. La opción C parte de una premisa falsa: un turno `tool_use` suele traer texto, así que la presencia de texto no indica que terminó. La opción D agrega un segundo modelo para adivinar algo que la API ya dice con exactitud.",
    keyConcept: "Terminar el bucle según stop_reason, no analizando lenguaje natural",
  },

  "E1-002": {
    question:
      "El negocio quiere que el agente ofrezca crédito en tienda antes de un reembolso en efectivo, pero lo considera una preferencia: los clientes que lo rechacen deben recibir el reembolso sin fricción, y omitir la oferta de vez en cuando cuesta poco. Un ingeniero propone un hook que bloquee process_refund hasta que se haya ejecutado offer_store_credit. ¿Qué debes recomendar?",
    options: {
      A: "Implementar el hook, porque toda regla de orden en un flujo de soporte es más segura si se impone en código",
      B: "Implementar el hook y añadir una bandera de excepción que el agente active cuando juzgue innecesaria la oferta",
      C: "Descartar el requisito, porque no se debe especificar nada que el sistema no pueda garantizar",
      D: "Poner la preferencia en el prompt con ejemplos y reservar los hooks para reglas que deben cumplirse siempre",
    },
    explanation:
      "La imposición programática es para reglas donde un solo fallo es inaceptable, como verificar la identidad antes de mover dinero o los límites estrictos de reembolso. Esta regla es explícitamente una preferencia con un modo de fallo barato, así que la guía en el prompt con criterios claros y algunos ejemplos es la herramienta proporcionada. Una compuerta rígida aquí añadiría fricción justo a los clientes que el negocio quiere cuidar.\n\nLa opción A trata toda regla de orden como una garantía y sobrediseña una preferencia. La opción B construye la compuerta y luego le da al modelo una forma de saltársela, así que no garantiza nada y suma complejidad. La opción C ignora un objetivo de negocio legítimo que la guía en el prompt puede atender bien.",
    keyConcept: "Guía en el prompt para preferencias; imposición programática solo donde el cumplimiento debe ser determinista",
  },

  "E1-003": {
    question:
      "La sesión con nombre de ayer, «checkout-refactor», analizó 30 archivos y produjo un plan de refactorización. Durante la noche, un compañero editó solo `cart.ts` y `pricing.ts`; los otros 28 archivos no cambiaron. Quieres continuar hoy desperdiciando el menor trabajo posible y sin supuestos desactualizados. ¿Qué haces?",
    options: {
      A: "Reanudar la sesión e indicarle qué dos archivos cambiaron, para que relea solo esos antes de seguir",
      B: "Reanudar la sesión sin decir nada; el agente detectará por su cuenta los archivos cambiados y se adaptará",
      C: "Abrir una sesión nueva y pedirle al agente que vuelva a explorar los treinta archivos para rehacer el análisis",
      D: "Bifurcar la sesión con fork_session, para que la nueva rama tome en cuenta los archivos editados",
    },
    explanation:
      "La mayor parte del contexto de ayer sigue siendo válida, así que reanudar es la base correcta. Pero una sesión reanudada conserva las lecturas viejas de `cart.ts` y `pricing.ts`, y nada hace que el agente las relea por sí solo. Decirle exactamente qué archivos cambiaron permite un reanálisis dirigido: dos archivos en vez de treinta.\n\nLa opción B confía en que el agente note un cambio del que no tiene ninguna señal. La opción C descarta el análisis válido de 28 archivos intactos; empezar de cero es para cuando la mayoría de los resultados previos están desactualizados. La opción D copia las mismas lecturas desactualizadas a una rama nueva, porque bifurcar ramifica la conversación, no su visión de los archivos.",
    keyConcept: "Al reanudar tras cambios en el código, decirle al agente exactamente qué cambió para un reanálisis dirigido",
  },

  "E1-004": {
    question:
      "Un agente de triaje de incidentes sigue una cadena fija: leer los registros de errores, revisar el último despliegue, revisar las métricas de la base de datos y redactar un informe. En un incidente, los registros apuntaban a un certificado vencido en una API de terceros, pero la cadena igual revisó el despliegue y la base de datos, y el informe culpó a una consulta lenta. ¿Qué descomposición encaja con esta tarea?",
    options: {
      A: "Mantener la cadena fija, pero añadir un quinto paso que revise las dependencias externas después de la base de datos",
      B: "Ejecutar los cuatro pasos en paralelo para que los hallazgos de un paso no sesguen la lectura del siguiente",
      C: "Descomposición adaptativa: partir de la evidencia y derivar cada subtarea siguiente de lo que esta muestra",
      D: "Reemplazar la cadena por un solo prompt largo que le pida al agente sopesar todas las causas raíz posibles",
    },
    explanation:
      "El triaje de incidentes es abierto: qué revisar después depende de lo que reveló la revisión anterior. La descomposición adaptativa permite que la pista del certificado en los registros se convierta en la siguiente subtarea, en lugar de ignorarse a favor de un guion fijo. El encadenamiento de prompts sirve para trabajo de varios pasos predecible; esta tarea no lo es.\n\nLa opción A parcha el camino de este incidente y va a fallar con la próxima causa inesperada. La opción B quita el orden, pero mantiene la lista fija de revisiones, así que la evidencia sigue sin poder redirigir la investigación. La opción D pide todo a la vez, lo que diluye la atención y renuncia a la investigación paso a paso que encontró la pista.",
    keyConcept: "Descomposición dinámica para investigaciones abiertas; encadenamiento para trabajo predecible",
  },

  "E1-005": {
    question:
      "Tu coordinador debe investigar cuatro subtemas independientes. Las trazas muestran que emite una llamada Task, espera el resultado de ese subagente y luego emite la siguiente, así que la latencia total es la suma de las cuatro ejecuciones. Los subtemas no dependen entre sí. ¿Qué cambio permite que corran al mismo tiempo?",
    options: {
      A: "Que el coordinador emita las cuatro llamadas Task en una sola respuesta, para que los subagentes corran en paralelo",
      B: "Pedirle a cada subagente que lance al siguiente cuando termine, para que el coordinador ya no tenga que esperar",
      C: "Juntar los cuatro subtemas en una sola llamada Task y pedirle a ese subagente que reparta el trabajo internamente",
      D: "Darles a los cuatro subagentes una memoria compartida para que cada uno vea el avance de los demás mientras trabaja",
    },
    explanation:
      "El lanzamiento en paralelo ocurre cuando el coordinador emite varias llamadas Task en la misma respuesta. Así, las subtareas independientes terminan en aproximadamente el tiempo de la más lenta, no en la suma. (En las versiones actuales la herramienta se llama `Agent` y los subagentes corren en segundo plano por defecto).\n\nLa opción B sigue siendo una cadena: Claude Code actual sí permite que los subagentes lancen los suyos (hasta tres niveles por defecto), pero pasarse el trabajo uno tras otro sigue siendo secuencial y saca al coordinador del enrutamiento. La opción C vuelve a meter cuatro temas en un solo contexto y pierde tanto el paralelismo como el foco. La opción D supone una memoria compartida entre subagentes que no existe; cada uno corre con contexto aislado.",
    keyConcept: "Lanzar subagentes en paralelo con varias llamadas Task en una sola respuesta del coordinador",
  },

  "E1-006": {
    question:
      "El prompt del coordinador al subagente de búsqueda es un procedimiento de 12 pasos: ejecutar exactamente estas tres cadenas de búsqueda, abrir los cinco primeros resultados, extraer dos citas de cada uno, etc. En temas donde esas cadenas dan resultados pobres, el subagente sigue los pasos de todos modos y devuelve hallazgos escasos. ¿Qué debería contener el prompt en su lugar?",
    options: {
      A: "Los mismos doce pasos, más ramas adicionales que digan qué hacer cada vez que un paso dé resultados pobres",
      B: "Nada más que el nombre del tema, para que el subagente elija su propio rumbo sin ninguna restricción",
      C: "Menos pasos, pero cada uno más estricto, con cadenas de búsqueda exactas y un mínimo obligatorio de fuentes",
      D: "El objetivo y el nivel de calidad: qué cubrir, qué fuentes sirven y cuándo la cobertura es suficiente",
    },
    explanation:
      "Un subagente solo puede adaptarse si sabe qué intenta lograr. Un prompt que enuncia el objetivo y los criterios de calidad (qué debe cubrirse, qué fuentes valen, cuándo parar) le permite cambiar de búsqueda cuando los resultados son pobres y, a la vez, le da al coordinador un estándar predecible contra el cual revisar.\n\nLa opción A intenta prever cada fallo con más procedimiento, que crece sin fin y aun así deja casos fuera. La opción B se va al otro extremo: sin criterios, el coordinador no puede juzgar si el resultado es suficiente. La opción C vuelve el procedimiento todavía más rígido, que es justo la causa de los hallazgos escasos.",
    keyConcept: "Los prompts del coordinador deben fijar objetivos y criterios de calidad, no procedimientos paso a paso",
  },

  "E1-007": {
    question:
      "Un coordinador delega en un subagente un análisis de código de 200 pasos y recibe de vuelta un resumen conciso. Un desarrollador junior quiere que el coordinador revise los pasos intermedios y se sorprende de que no pueda ver ninguna de las llamadas a herramientas del subagente. ¿Qué es cierto y qué debería hacer el desarrollador?",
    options: {
      A: "Su transcripción está en el contexto del coordinador bajo una clave subagent_transcript; leerla desde ahí",
      B: "Solo vuelve el mensaje final; pedirle al subagente que incluya en su informe final la evidencia necesaria",
      C: "El coordinador debe llamar a una herramienta get_subagent_logs para cargar la transcripción en su contexto",
      D: "La transcripción está en la respuesta cruda de la API, pero oculta al coordinador; extraerla de ahí",
    },
    explanation:
      "El aislamiento de contexto funciona en ambos sentidos. Las llamadas y los resultados intermedios de un subagente se quedan en su propio contexto, y solo su mensaje final vuelve al padre. Eso es lo que evita que un análisis de 200 pasos inunde al coordinador. Si el coordinador necesita verificar algo, el prompt del subagente debe pedir esa evidencia (rutas de archivos, números de línea, las comprobaciones que hizo) en un informe final estructurado. Para auditar fuera del modelo, las transcripciones se guardan por separado y un hook SubagentStop recibe su ruta.\n\nLas opciones A, C y D inventan un canal que devolvería la transcripción al contexto del coordinador, justo lo que el diseño evita. Ninguno existe.",
    keyConcept: "Los subagentes devuelven solo su mensaje final; pide en ese informe la evidencia que necesitas",
  },

  "E1-008": {
    question:
      "Un coordinador tiene un prompt de sistema de 5000 tokens con pautas de tono de marca y reglas de escalada. Delega una consulta de reembolso a un subagente con el prompt de tarea «Atiende el ticket #1234». La respuesta del subagente viola las reglas de escalada. ¿Cuál es la causa más probable?",
    options: {
      A: "Los subagentes empiezan de cero: sin prompt de sistema ni historial del padre, solo su prompt y la tarea",
      B: "El subagente corre otra versión del modelo, que interpreta de otra forma las mismas instrucciones heredadas",
      C: "El coordinador debe poner share_context: true en la AgentDefinition para pasarle su prompt de sistema",
      D: "Los subagentes heredan el prompt de sistema, pero ignoran las instrucciones que llegan después del primer turno",
    },
    explanation:
      "El contexto de un subagente que no es fork arranca sin el historial de conversación ni el prompt de sistema del padre. Recibe su propio prompt de sistema (`AgentDefinition.prompt`), la cadena de prompt de la herramienta Agent, el CLAUDE.md del proyecto y sus definiciones de herramientas. Las reglas de escalada vivían solo en el prompt de sistema del coordinador, así que el subagente nunca las vio. La solución es poner las reglas que necesita en el prompt propio del subagente o en la tarea delegada.\n\nLa opción B culpa al modelo cuando las instrucciones simplemente no estaban. La opción C describe una bandera que no existe. La opción D inventa una herencia parcial que tampoco existe.",
    keyConcept: "Los subagentes no heredan el prompt de sistema ni el historial del padre; el contexto se pasa explícitamente",
  },

  "E1-009": {
    question:
      "Un cliente escribe: «El pedido #8812 llegó dañado, me cobraron dos veces este mes y necesito cambiar mi dirección de envío». El agente atiende el pedido dañado, responde la pregunta de facturación con conocimiento general sin revisar la cuenta y nunca toca la dirección. ¿Cómo debería manejar el flujo mensajes como este?",
    options: {
      A: "Atender solo la primera inquietud e invitar al cliente a abrir tickets nuevos para las otras dos",
      B: "Escalar a una persona todo mensaje con más de una inquietud, porque las solicitudes mixtas son muy riesgosas",
      C: "Separarlo en asuntos, investigar cada uno en paralelo con contexto compartido y responder una sola vez",
      D: "Tratar las inquietudes estrictamente de a una, esperando que el cliente confirme cada una antes de seguir",
    },
    explanation:
      "Las solicitudes con varias inquietudes deben descomponerse primero en asuntos explícitos, para que ninguno se pierda. Luego cada asunto se investiga con las herramientas que necesita (consulta del pedido, registros de facturación, cambio de dirección), en paralelo cuando se puede y compartiendo el contexto del cliente ya reunido, y los resultados se combinan en una sola resolución coherente.\n\nLa opción A le devuelve trabajo al cliente y baja la resolución en el primer contacto. La opción B escala casos que el agente puede resolver, lo que desperdicia capacidad humana y aleja la meta del 80 %. La opción D evita perder asuntos, pero convierte una conversación en varias idas y vueltas sin beneficio, ya que las tres inquietudes son independientes.",
    keyConcept: "Descomponer solicitudes con varias inquietudes, investigar cada asunto y sintetizar una sola resolución",
  },

  "E1-010": {
    question:
      "En un agente de integración continua, un hook debe impedir cualquier `git push --force` a main. Está registrado en PostToolUse con un matcher `Bash` y devuelve una decisión de bloqueo cuando ve ese comando. Anoche un push forzado igual reescribió main, y los registros muestran que el hook se disparó. ¿Por qué, y cuál es la solución?",
    options: {
      A: "El matcher debe ser \"git\" en vez de \"Bash\", y la regla también debería repetirse en el prompt",
      B: "PostToolUse es correcto, pero el matcher necesita onFailure: \"block\" para que se respete la decisión del hook",
      C: "PostToolUse corre después de que el comando se ejecuta; la verificación va en un hook PreToolUse que lo deniegue",
      D: "Los hooks no pueden leer los argumentos de Bash, así que la regla debe vivir en CLAUDE.md como política del proyecto",
    },
    explanation:
      "Todo se reduce al momento. PostToolUse se dispara después de que la herramienta corrió, así que cuando el hook «bloquea», el push ya reescribió main; en ese punto Claude solo recibe una retroalimentación. Una regla que debe impedir una acción va en PreToolUse, que ve `tool_input.command` antes de la ejecución y puede devolver `permissionDecision: \"deny\"` con un motivo.\n\nLa opción A falla dos veces: los matchers comparan nombres de herramientas, así que `Bash` es el matcher correcto, y añadir texto al prompt no vuelve determinista la regla. La opción B malinterpreta `onFailure`, que decide qué pasa cuando falla el propio callback del hook; no puede deshacer un comando que ya corrió. La opción D es falsa: los hooks reciben la entrada completa de la herramienta, incluido el comando de Bash.\n\nCómo implementarlo:\n```typescript\nconst noForcePush: HookCallback = async (input) => {\n  const cmd = String(((input as PreToolUseHookInput).tool_input as any).command ?? \"\");\n  if (/git\\s+push\\b.*(--force|-f\\b)/.test(cmd) && /\\bmain\\b/.test(cmd)) {\n    return { hookSpecificOutput: { hookEventName: \"PreToolUse\", permissionDecision: \"deny\",\n      permissionDecisionReason: \"Force-pushing to main is not allowed. Open a PR instead.\" } };\n  }\n  return {};\n};\n// options.hooks = { PreToolUse: [{ matcher: \"Bash\", hooks: [noForcePush] }] }\n```",
    keyConcept: "Los hooks que bloquean deben correr antes de la ejecución (PreToolUse); PostToolUse llega tarde",
  },

  "E1-011": {
    question:
      "El bucle de un agente de investigación está programado para detenerse después de 8 iteraciones. Las consultas simples terminan muy por debajo de eso, pero las profundas se cortan a mitad de la investigación y el informe se arma con hallazgos parciales sin ninguna señal de que falte algo. ¿Cuál es un mejor diseño?",
    options: {
      A: "Subir el tope a 25 iteraciones para que las consultas profundas tengan espacio de terminar dentro del límite fijo",
      B: "Iterar hasta que stop_reason sea \"end_turn\", con un tope alto solo como red de seguridad que marque la ejecución",
      C: "Hacer que el agente diga en cada respuesta cuántos pasos más espera, y detenerse cuando llegue a cero",
      D: "Quitar el bucle y pedir el informe completo en una sola llamada, con todas las herramientas disponibles",
    },
    explanation:
      "El modelo indica que terminó mediante `stop_reason`; el bucle debe correr hasta `\"end_turn\"`. Un tope sigue siendo útil contra bucles desbocados, pero como respaldo: alcanzarlo significa que la ejecución quedó incompleta y debe informarse así, no tratarse en silencio como un informe terminado. En el Agent SDK ese tope es `maxTurns`, y al alcanzarlo la ejecución termina con un ResultMessage cuyo `subtype` es `error_max_turns`; es un subtipo de resultado, no un valor de `stop_reason`.\n\nLa opción A mueve el corte arbitrario en lugar de quitarlo como mecanismo principal. La opción C analiza lenguaje natural para decidir el final, otro antipatrón. La opción D elimina por completo el bucle agéntico, así que el modelo no puede actuar sobre lo que devuelven sus herramientas.",
    keyConcept: "Los topes de iteraciones son red de seguridad, no el mecanismo principal para detenerse",
  },

  "E1-012": {
    question:
      "Le pides a un agente que «agregue pruebas completas a este código heredado»: 400 archivos, casi ninguna prueba existente y dependencias poco claras entre módulos. ¿Qué plan tiene más probabilidades de lograr una cobertura útil?",
    options: {
      A: "Generar un archivo de pruebas por cada archivo fuente, en orden alfabético, hasta cubrir todo el árbol",
      B: "Mapear la estructura, ordenar las áreas de más impacto y seguir un plan priorizado que se adapte",
      C: "Escribir de antemano una lista fija de veinte tareas de prueba y ejecutarlas en orden sin ningún cambio",
      D: "Empezar por los archivos más fáciles de probar para que el número de cobertura suba lo más rápido posible",
    },
    explanation:
      "Las tareas abiertas se descomponen entendiendo primero el terreno. Mapear la estructura muestra qué existe y cómo se conecta; ordenar las áreas de mayor impacto (rutas de pago, utilidades compartidas, código que cambia seguido) dirige el esfuerzo a donde las pruebas más importan; y un plan adaptativo absorbe las dependencias que solo aparecen cuando empiezas a escribir pruebas.\n\nLa opción A reparte el esfuerzo por igual entre código de importancia muy distinta e ignora las dependencias. La opción C se compromete con un plan antes de saber nada del código. La opción D optimiza la métrica y no el objetivo: el código fácil de probar suele ser el menos riesgoso.",
    keyConcept: "Descomponer el trabajo abierto mapeando, priorizando y adaptando el plan a medida que se aprende",
  },

  // ============================================================
  // DOMINIO 2 – Diseño de Herramientas e Integración MCP
  // ============================================================

  "E2-001": {
    question:
      "La política de la empresa prohíbe reembolsos de más de $500 sin aprobación de un gerente. Cuando se llama a `process_refund` por $720, tu servidor MCP devuelve `isError: true` con el texto «Error 4012». El agente repite la llamada, luego prueba con $719 y al final le dice al cliente que «algo salió mal». ¿Qué debería devolver la herramienta para que el agente maneje bien este caso?",
    options: {
      A: "`isError: true` con `errorCategory: \"transient\"` e `isRetryable: true`, para que el agente espere y reenvíe cuando el servicio de reembolsos se recupere.",
      B: "Un error de protocolo JSON-RPC, para que el cliente MCP bloquee la solicitud y el agente nunca vea una infracción de política que no puede resolver solo.",
      C: "`isError: true`, `errorCategory: \"business\"`, `isRetryable: false` y una explicación amable de que los reembolsos de más de $500 requieren un gerente.",
      D: "Un resultado exitoso que limite el reembolso a $500 sin avisar, para que el cliente reciba casi todo el dinero y la conversación pueda seguir.",
    },
    explanation:
      "La C es correcta. Es una infracción de una regla de negocio: ningún reintento va a funcionar, y el agente necesita saber por qué para explicar la regla y escalar (por ejemplo, con `escalate_to_human`). Un error de negocio no reintentable con una explicación amable para el cliente le da exactamente eso. El opaco «Error 4012» es lo que llevó al agente a tantear con $719.\n\nLa A etiqueta un límite de política permanente como una caída temporal e invita a más reintentos inútiles. La B usa el canal equivocado: los errores de protocolo son para solicitudes mal formadas, y el agente pierde la información que necesita para hablar con el cliente. La D cambia sin aviso una operación financiera sin el acuerdo del cliente.\n\nCómo implementarlo:\n```typescript\nif (amount > 500 && !managerApproved) {\n  return { isError: true, content: [{ type: \"text\", text: JSON.stringify({\n    errorCategory: \"business\", isRetryable: false,\n    customerMessage: \"Refunds over $500 need a manager's approval. I can request it for you now.\",\n    suggestedAction: \"escalate_to_human\",\n  }) }] };\n}\n```",
    keyConcept: "Errores de negocio no reintentables con explicaciones comprensibles para el cliente",
  },

  "E2-002": {
    question:
      "Claude Code debe cambiar el timeout de uno de los cuatro bloques de reintento de `client.ts`. Los bloques se generaron desde una plantilla y son idénticos byte a byte, y el texto único más cercano, el nombre de la función que lo contiene, `uploadFile`, está 60 líneas por encima del tercer bloque. La llamada a Edit falla porque su `old_string` coincide en cuatro lugares. Solo debe cambiar el bloque dentro de `uploadFile`. ¿Cuál es la forma confiable de hacer este cambio?",
    options: {
      A: "Repetir Edit con `replace_all: true`, que aplica el nuevo timeout en cada lugar donde aparece el texto y resuelve el error de unicidad.",
      B: "Buscar con Grep la línea del timeout con `output_mode: \"content\"` y pasarle a Edit el número de línea que devuelve como lugar a cambiar.",
      C: "Usar Write para sobrescribir `client.ts` con lo que Claude recuerda del archivo y el nuevo timeout, sin volver a leerlo antes.",
      D: "Leer el archivo completo con Read, cambiar el timeout solo en el tercer bloque del contenido cargado y escribirlo entero con Write.",
    },
    explanation:
      "La D es correcta. Cuando Edit no encuentra un texto ancla único, Read seguido de Write es la alternativa confiable: Claude carga el contenido actual, cambia exactamente el bloque dentro de `uploadFile` y escribe el archivo completo.\n\nLa A cambia los cuatro bloques, tres de ellos por error. La B supone que Edit acepta un número de línea, pero Edit solo hace reemplazo exacto de texto con `old_string` y `new_string`. La C sobrescribe el archivo de memoria, lo que puede borrar sin aviso cambios hechos desde la última lectura. Nota de producto: el Edit actual también puede fijar una sola coincidencia con un `old_string` más largo que incluya suficiente contexto; cuando el texto único más cercano está a 60 líneas, como aquí, ese ancla es frágil, y por eso aplica la alternativa Read + Write de la guía.\n\nCómo implementarlo:\n```text\n1. Read  client.ts                       (full current content)\n2. In the loaded text, change timeoutMs: 5000 -> 15000 only inside uploadFile()\n3. Write client.ts  <complete updated content>\n```",
    keyConcept: "Read + Write como alternativa cuando Edit no tiene un ancla única",
  },

  "E2-003": {
    question:
      "Tu agente usa un servidor MCP interno cuya herramienta `query_docs(path)` lee una página de una documentación de 1.200 páginas organizada en una jerarquía profunda. Las trazas muestran que, antes de cada respuesta, el agente hace de 10 a 15 llamadas exploratorias a `query_docs` con rutas adivinadas, y muchas devuelven «not found». ¿Qué debería agregar el servidor MCP?",
    options: {
      A: "Exponer la jerarquía de la documentación como recursos MCP, para que el agente vea qué páginas existen y lea directamente la correcta.",
      B: "Subir el timeout y el límite de solicitudes del servidor, para que las llamadas exploratorias terminen antes y el agente pueda adivinar más veces.",
      C: "Agregar una herramienta `list_everything` que devuelva el texto completo de las 1.200 páginas de una vez, para que el agente nunca adivine una ruta.",
      D: "Agregar una regla al prompt de sistema que limite al agente a tres llamadas a `query_docs` por respuesta y le pida responder con lo que encuentre.",
    },
    explanation:
      "La A es correcta. Los recursos MCP son el mecanismo para exponer un catálogo de contenido, como una jerarquía de documentación, una lista de issues o esquemas de base de datos, para que el agente vea qué datos existen sin llamadas exploratorias. En Claude Code, los recursos aparecen en las menciones con `@` y se pueden listar y leer con herramientas de recursos integradas.\n\nLa B hace más rápido el desperdicio en vez de eliminarlo. La C reemplaza el catálogo por el contenido completo: satura el contexto, y las salidas muy grandes activan las advertencias y los límites de salida MCP de Claude Code. La D limita las conjeturas, así que el agente responde con peor evidencia.\n\nCómo implementarlo:\n```typescript\nserver.registerResource(\n  \"docs-index\",\n  \"docs://index\",\n  { title: \"Documentation index\", mimeType: \"application/json\" },\n  async () => ({ contents: [{ uri: \"docs://index\", text: JSON.stringify(buildTree()) }] }),\n);\n```",
    keyConcept: "Los recursos MCP exponen catálogos de contenido y reducen las llamadas exploratorias",
  },

  "E2-004": {
    question:
      "`get_customer` tiene la descripción «Devuelve información del cliente». Devuelve nombre, correo, nivel y estado de la cuenta, pero no el historial de pedidos. Las trazas muestran que, cuando un cliente pregunta «¿qué pedí el mes pasado?», el agente llama a `get_customer` varias veces con argumentos distintos y luego le dice que no tiene pedidos recientes, aunque `lookup_order` habría respondido. ¿Cuál es la mejor corrección?",
    options: {
      A: "Subir el número máximo de turnos del agente, para que tenga margen para seguir explorando después de `get_customer` y acabe probando `lookup_order`.",
      B: "Ampliar `get_customer` para que también devuelva el historial completo de pedidos y sea el único lugar donde buscar cualquier dato de un cliente.",
      C: "Agregar al prompt de sistema la regla «si get_customer no responde la pregunta, prueba las otras herramientas antes de contestarle al cliente».",
      D: "Reescribir la descripción de `get_customer` para listar sus campos, decir que no tiene datos de pedidos y remitir a `lookup_order` para compras.",
    },
    explanation:
      "La D es correcta. Las descripciones son la principal señal que usa el modelo para elegir herramientas, y una buena descripción también dice qué devuelve la herramienta y qué no. Decir explícitamente que `get_customer` no tiene datos de pedidos y nombrar `lookup_order` para las compras elimina la expectativa falsa que provoca las llamadas repetidas.\n\nLa A le da más margen para divagar a un agente mal informado. La B crea superposición entre dos herramientas y engorda cada consulta de cliente. La C es una regla genérica de último recurso que deja al agente adivinando qué herramienta cubre qué.\n\nCómo implementarlo:\n```typescript\n{\n  name: \"get_customer\",\n  description: \"Returns the profile of one verified customer: name, email, tier and account status. \" +\n    \"Does NOT return orders, purchases or shipments; for those, use lookup_order. \" +\n    \"Input: customer_id (CUS-######) or the email on the account.\",\n  input_schema: { /* ... */ },\n}\n```",
    keyConcept: "Las descripciones deben indicar salidas y límites, y señalar la herramienta alternativa",
  },

  "E2-005": {
    question:
      "Tu pipeline define una herramienta de extracción por tipo de documento: `extract_invoice`, `extract_receipt` y `extract_purchase_order`, cada una con un esquema estricto. Los documentos llegan sin etiqueta. En cerca del 6 % de las llamadas, Claude responde con un resumen en prosa en vez de llamar a una herramienta, y el parser posterior falla. ¿Qué configuración de `tool_choice` corrige esto sin fijar el tipo de documento en el código?",
    options: {
      A: "`{\"type\": \"auto\"}`, más una instrucción en el prompt de sistema que diga «responde siempre llamando a una herramienta de extracción, nunca con texto».",
      B: "`{\"type\": \"tool\", \"name\": \"extract_invoice\"}`, porque las facturas son el tipo más frecuente y el esquema puede absorber los demás tipos.",
      C: "`{\"type\": \"any\"}`, para que Claude deba llamar a una de las herramientas pero siga eligiendo qué esquema corresponde al documento.",
      D: "`{\"type\": \"none\"}`, y luego procesar la prosa con expresiones regulares que asignen cada tipo de documento a sus campos esperados.",
    },
    explanation:
      "La C es correcta. `any` garantiza que Claude llame a una de las herramientas en lugar de devolver texto, y aun así deja que el modelo elija el esquema que corresponde a cada documento sin etiqueta.\n\nLa A es el comportamiento por defecto más una instrucción probabilística, que es justo lo que hoy produce el 6 % de prosa. La B impone un solo esquema a recibos y órdenes de compra. La D renuncia a la salida estructurada y la reemplaza por un parsing frágil. Nota de producto: la documentación actual indica que Claude Opus 5.5 y Sonnet 5.5 rechazan `any` y `tool` forzado con un error 400; con esos modelos, usa `auto` con strict tool use o structured outputs.\n\nCómo implementarlo:\n```python\nresponse = client.messages.create(\n    model=\"claude-haiku-5-5\",\n    max_tokens=2048,\n    tools=[extract_invoice, extract_receipt, extract_purchase_order],\n    tool_choice={\"type\": \"any\"},\n    messages=[{\"role\": \"user\", \"content\": document_text}],\n)\n```",
    keyConcept: "tool_choice \"any\" garantiza una llamada a herramienta mientras el modelo elige cuál",
  },

  "E2-006": {
    question:
      "Un compañero agregó «Verifica siempre la fuente de cada estadística» al prompt de sistema del agente de síntesis. Desde entonces el agente llama a `fetch_source_document` (descripción: «Descarga el texto completo de una fuente por URL; úsala solo cuando a un hallazgo le falte la cita o haya que contrastar una cita con el original») por cada número de los hallazgos, aunque cada hallazgo ya trae su cita y su fragmento. La latencia se triplicó. ¿Qué deberías cambiar?",
    options: {
      A: "Renombrar `fetch_source_document` a `download_full_text`, para que la palabra «fuente» del prompt ya no coincida con el nombre de la herramienta.",
      B: "Quitarle `fetch_source_document` al agente de síntesis y mandar cada verificación de fuentes de vuelta por el coordinador y el agente de búsqueda.",
      C: "Usar `tool_choice: {\"type\": \"none\"}` en las solicitudes del agente de síntesis, para que no pueda llamar a ninguna herramienta mientras combina hallazgos.",
      D: "Reformular la línea del prompt para que cada estadística conserve la cita de su hallazgo, y descargar solo cuando un hallazgo no tenga cita.",
    },
    explanation:
      "La D es correcta. La descripción de la herramienta ya dice cuándo descargar; la nueva línea del prompt de sistema es una instrucción sensible a palabras clave («verifica la fuente») que se impone sobre ella. Reescribir la instrucción en torno al requisito real, que cada estadística conserve su cita, elimina la asociación no deseada con la herramienta de descarga.\n\nLa A trata la coincidencia de palabras como la causa y la esconde, y deja una instrucción vaga que puede pegarse a otra herramienta. La B quita una herramienta que el agente necesita legítimamente para los hallazgos sin cita, y suma idas y vueltas al coordinador. La C bloquea también las descargas legítimas.\n\nCómo implementarlo:\n```text\n# BEFORE\nAlways check the source for every statistic.\n\n# AFTER\nEvery statistic in the report must keep the citation and quote from its finding.\nCall fetch_source_document only if a finding has no citation or its quote\nlooks inconsistent with the claim.\n```",
    keyConcept: "Revisar el prompt de sistema en busca de instrucciones sensibles a palabras clave que anulan las descripciones",
  },

  "E2-007": {
    question:
      "Tu equipo conectó un servidor MCP `code_intel` cuya herramienta `find_references` resuelve un símbolo en 40 repositorios con un grafo de llamadas precalculado, incluidas las llamadas hechas por inyección de dependencias. Su descripción es «Finds references». Las trazas muestran que el agente casi siempre usa Grep en su lugar y se pierde llamadores de los otros repositorios. ¿Qué cambio hace que el agente use la herramienta MCP cuando corresponde?",
    options: {
      A: "Quitar Grep de las herramientas del agente, para que `find_references` sea la única opción de búsqueda para cualquier consulta de código.",
      B: "Ampliar la descripción para explicar que resuelve símbolos en los 40 repos, incluidas las llamadas inyectadas, y qué devuelve exactamente.",
      C: "Agregar al prompt de sistema una frase que le pida al agente «preferir las herramientas MCP sobre las integradas cuando ambas puedan servir».",
      D: "Renombrar la herramienta a `grep_all_repos`, para que el agente la asocie con el comportamiento de Grep que ya prefiere para buscar código.",
    },
    explanation:
      "La B es correcta. Con una descripción de dos palabras, el agente no tiene motivo para pensar que la herramienta MCP hace más que Grep. Describir en detalle sus capacidades y su salida (resolución entre repositorios, llamadas inyectadas, qué contiene cada resultado) le permite ver cuándo es la mejor herramienta.\n\nLa A quita la herramienta adecuada para búsquedas de texto simples, como mensajes de error o claves de configuración. La C es una regla general que elegirá herramientas MCP incluso donde una integrada es mejor. La D le da un nombre engañoso: la herramienta no hace coincidencia de texto, así que el agente la usaría para tareas equivocadas.\n\nCómo implementarlo:\n```typescript\n{\n  name: \"find_references\",\n  description: \"Finds every caller of a function, class or method across all 40 company \" +\n    \"repositories using a prebuilt call graph, including calls through dependency \" +\n    \"injection and re-exports that text search misses. Input: a fully qualified symbol. \" +\n    \"Returns repo, file, line and the calling symbol for each reference. Use Grep instead \" +\n    \"for plain text such as log messages or config keys.\",\n}\n```",
    keyConcept: "Descripciones detalladas de herramientas MCP evitan que el agente prefiera las integradas",
  },

  "E2-008": {
    question:
      "El subagente de análisis de documentos tiene una herramienta genérica `fetch_url(url)` para cargar los papers que encontró el agente de búsqueda. Las auditorías muestran que a veces descarga páginas web cualquiera mencionadas dentro de esos papers, lo que mete contenido no verificado en el análisis, y una vez intentó descargar una URL de administración interna que aparecía en un documento. ¿Cuál es el mejor cambio en las herramientas del subagente?",
    options: {
      A: "Mantener `fetch_url` y agregar al prompt de sistema una regla que le pida descargar solo los documentos que el coordinador le asignó de forma explícita.",
      B: "Quitarle toda capacidad de descarga al subagente y que el coordinador pegue el texto completo de cada paper asignado en el prompt del subagente.",
      C: "Reemplazar `fetch_url` por una herramienta `load_document` que solo acepte IDs de documento o URL de fuentes aprobadas y rechace lo demás.",
      D: "Mantener `fetch_url`, pero registrar cada solicitud y revisar los registros cada semana para detectar abusos y ajustar las instrucciones del subagente.",
    },
    explanation:
      "La C es correcta. Reemplazar una herramienta genérica por una restringida que valida su entrada impone el rol del subagente en el código: puede cargar los documentos que debe analizar y nada más, lo que además bloquea la URL interna.\n\nLa A depende de que el modelo cumpla el prompt, y justo el contenido que lee (las URL dentro de los papers) es lo que lo desvía. La B sobrecarga al coordinador y el contexto del subagente con textos completos, y pierde la carga bajo demanda. La D detecta el abuso una semana después de que ocurrió.\n\nCómo implementarlo:\n```typescript\nconst APPROVED = [/^https:\\/\\/arxiv\\.org\\//, /^https:\\/\\/doi\\.org\\//, /^archive:\\/\\//];\n\nasync function loadDocument({ ref }: { ref: string }) {\n  if (!APPROVED.some(rx => rx.test(ref))) {\n    return { isError: true, content: [{ type: \"text\", text: JSON.stringify({\n      errorCategory: \"validation\", isRetryable: false,\n      message: \"Only approved document sources can be loaded.\" }) }] };\n  }\n  return { content: [{ type: \"text\", text: await fetchDocument(ref) }] };\n}\n```",
    keyConcept: "Reemplazar herramientas genéricas por alternativas restringidas",
  },

  "E2-009": {
    question:
      "Definiste un subagente de Claude Code en `.claude/agents/security-reviewer.md` para revisar diffs y reportar hallazgos, y omitiste el campo `tools`. En dos sesiones el revisor «arregló» los problemas que encontró editando archivos, y una vez ejecutó un script de migración con Bash. Su trabajo es solo leer y buscar en el código. ¿Cuál es la corrección adecuada?",
    options: {
      A: "Agregar `tools: Read, Grep, Glob` a su frontmatter para que solo pueda leer y buscar, y deje de heredar herramientas de edición o de shell.",
      B: "Agregar al prompt del subagente la frase «Eres un revisor; nunca edites archivos ni ejecutes comandos», y que siga heredando todas las herramientas.",
      C: "Agregar `disallowedTools: Write` al frontmatter del subagente, para que el revisor ya no pueda crear ni sobrescribir archivos durante una revisión.",
      D: "Mover las instrucciones del revisor al CLAUDE.md principal, para que el agente principal haga las revisiones y el subagente deje de hacer falta.",
    },
    explanation:
      "La A es correcta. Cuando se omite `tools`, un subagente hereda todas las herramientas disponibles para subagentes, incluidas Edit, Write y Bash. Listar solo Read, Grep y Glob lo limita a lo que su rol necesita y evita el mal uso desde el origen.\n\nLa B depende de que el modelo cumpla el prompt, que es el mecanismo que ya falló. La C quita Write pero deja Edit y Bash, justo las dos que usó mal. La D renuncia al contexto aislado y a la especialización del subagente, y el agente principal tiene todas las herramientas de todos modos.\n\nCómo implementarlo:\n```markdown\n---\nname: security-reviewer\ndescription: Reviews diffs for security issues and reports findings. Never modifies code.\ntools: Read, Grep, Glob\n---\nYou review the changes you are given and report each finding with file, line and severity.\n```",
    keyConcept: "Limitar las herramientas de un subagente a su rol",
  },

  "E2-010": {
    question:
      "Seguridad exige que el Claude Code de cada desarrollador se conecte exactamente al conjunto de servidores MCP aprobados por la empresa, incluido un servidor obligatorio de detección de secretos, y que los desarrolladores no puedan agregar otros. Todos los equipos son laptops macOS administradas. Un colega propone escribir este requisito en el CLAUDE.md administrado de `/Library/Application Support/ClaudeCode/CLAUDE.md`. ¿Qué deberías hacer en su lugar?",
    options: {
      A: "Desplegar `/Library/Application Support/ClaudeCode/managed-mcp.json` con los servidores aprobados, lo que le da a ese archivo control exclusivo de MCP.",
      B: "Mantener el CLAUDE.md administrado pero escribir la regla en mayúsculas, indicándole a Claude que se conecte solo a los servidores aprobados que allí se listan.",
      C: "Versionar los servidores aprobados en el `.mcp.json` de cada repositorio, para que se carguen solos para cada desarrollador que clone un repo de la empresa.",
      D: "Cargar los servidores aprobados en el `~/.claude.json` de cada desarrollador con un script de incorporación que TI vuelva a ejecutar cada mes.",
    },
    explanation:
      "La A es correcta. `managed-mcp.json` despliega un conjunto fijo de servidores MCP con control exclusivo: Claude Code carga los servidores de ese archivo, y `claude mcp add` falla con un error de política empresarial. CLAUDE.md, administrado o no, solo aporta instrucciones y contexto; no configura ni bloquea conexiones MCP.\n\nLa B es la misma idea equivocada con más énfasis. La C funciona por repositorio, no hace nada fuera de los repos de la empresa y no impide que los desarrolladores agreguen sus propios servidores. La D escribe en un archivo que el usuario puede editar, así que el desarrollador puede cambiarlo entre ejecuciones. Si los desarrolladores deben conservar sus propios servidores y recibir además los de la empresa, la documentación remite al ajuste administrado `managedMcpServers`, con `allowedMcpServers` y `deniedMcpServers` para filtrar.\n\nCómo implementarlo:\n```text\n# Deployed by MDM to /Library/Application Support/ClaudeCode/managed-mcp.json\n{\n  \"mcpServers\": {\n    \"secrets-scanner\": { \"type\": \"http\", \"url\": \"https://scanner.internal.example.com/mcp\" },\n    \"tickets\": { \"type\": \"http\", \"url\": \"https://tickets.internal.example.com/mcp\" }\n  }\n}\n\n# Check on a developer machine\nclaude mcp list    # shows only the managed servers\n```",
    keyConcept: "managed-mcp.json impone servidores MCP; CLAUDE.md solo lleva instrucciones",
  },

  "E2-011": {
    question:
      "Tu agente usa una herramienta MCP `deploy_preview`. Cuando la cuenta de servicio no tiene acceso a un repositorio, la herramienta devuelve `isError: true` con «Request failed, please try again». El agente obedece y reintenta hasta su límite de 8 intentos en cada uno de esos repositorios, y pierde varios minutos por tarea antes de rendirse. ¿Qué debería devolver la herramienta en este caso?",
    options: {
      A: "El mismo mensaje, más un bucle de reintentos con espera exponencial en el servidor, para que el agente solo vea el fallo cuando se agoten.",
      B: "`isError: false` con una lista vacía de despliegues, para que el agente trate el repositorio como si no tuviera nada que desplegar y siga.",
      C: "`isError: true` con `errorCategory: \"transient\"` y una pista `retryAfterSeconds`, para que al menos los reintentos del agente se espacien.",
      D: "`isError: true`, `errorCategory: \"permission\"`, `isRetryable: false` y una descripción del acceso que falta y de quién puede otorgarlo.",
    },
    explanation:
      "La D es correcta. Un permiso que falta no se arregla solo, así que reintentar es perder tiempo. Unos metadatos estructurados que lo marquen como error de permiso no reintentable, con una descripción legible del acceso que falta, permiten que el agente se detenga de inmediato y lo reporte o lo escale.\n\nLa A esconde el mismo error poco informativo detrás de reintentos más lentos en el servidor. La B disfraza un fallo de resultado vacío válido, así que la tarea se salta el repositorio sin avisar. La C etiqueta el error como transitorio, y el agente sigue reintentando, solo que más despacio.\n\nCómo implementarlo:\n```typescript\nif (res.status === 403) {\n  return { isError: true, content: [{ type: \"text\", text: JSON.stringify({\n    errorCategory: \"permission\", isRetryable: false,\n    message: `Service account lacks deploy access to ${repo}. A repo admin must grant the 'preview-deployer' role.`,\n  }) }] };\n}\n```",
    keyConcept: "Errores reintentables y no reintentables: los metadatos estructurados evitan reintentos inútiles",
  },

  "E2-012": {
    question:
      "Antes de cambiar la firma de `formatCurrency`, el agente debe encontrar a todos sus llamadores. Un Grep de `formatCurrency(` devuelve solo 3 llamadas, pero QA dice que la función se usa en decenas de pantallas. La investigación muestra que `utils/money.ts` la reexporta como `fmtMoney` y que `ui/index.ts` la reexporta dentro de un objeto `Money` como `Money.format`. ¿Cómo debería encontrar el agente todos los usos?",
    options: {
      A: "Leer con Read cada archivo de las carpetas `ui/` y `utils/` de principio a fin, y listar cada lugar donde parezca formatearse una moneda.",
      B: "Usar Glob con `**/*money*` y `**/*currency*`, y tratar cada archivo cuyo nombre coincida con alguno de esos patrones como llamador.",
      C: "Repetir el Grep de `formatCurrency(` con coincidencia sin distinguir mayúsculas y en modo multilínea, para que también capture las otras formas.",
      D: "Encontrar todos los nombres con que se exporta la función, incluidos `fmtMoney` y `Money.format`, y luego buscar cada uno con Grep en el código.",
    },
    explanation:
      "La D es correcta. Para rastrear una función a través de módulos envoltorio, primero identifica todos los nombres exportados con que circula y luego busca cada uno en todo el código. Así aparecen los llamadores que una búsqueda del nombre original no puede ver.\n\nLa A lee carpetas enteras de entrada, gasta contexto y aun así pierde llamadores fuera de esas dos carpetas. La B encuentra archivos por nombre, lo que no dice nada sobre si llaman a la función. La C sigue buscando el nombre original, que los llamadores con alias nunca usan.\n\nCómo implementarlo:\n```text\n1. Grep  \"formatCurrency\"  output_mode=content   -> find re-exports and aliases\n2. Read  utils/money.ts, ui/index.ts            -> confirm fmtMoney, Money.format\n3. Grep  \"formatCurrency\\(|fmtMoney\\(|Money\\.format\\(\"  output_mode=files_with_matches\n```",
    keyConcept: "Rastrear usos a través de módulos envoltorio: reunir los nombres exportados y buscar cada uno con Grep",
  },

  // ============================================================
  // DOMINIO 3 – Configuración y Flujos de Trabajo de Claude Code
  // ============================================================

  "E3-001": {
    question:
      "Dos desarrolladores en el mismo commit ven comportamientos distintos: en las sesiones de Ana, Claude siempre ejecuta `make lint` antes de hacer commit; en las de Ben, nunca. Ambos tienen el árbol de trabajo limpio y el CLAUDE.md del repositorio no menciona el lint. Ben ejecuta `/memory` y ve solo el CLAUDE.md del proyecto y su propio archivo de usuario vacío. ¿Cuál es la causa más probable y la corrección que sirve a todo el equipo?",
    options: {
      A: "La regla de lint está en el `~/.claude/CLAUDE.md` de Ana; hay que moverla al CLAUDE.md versionado del proyecto",
      B: "La sesión de Ben usa una copia en caché del CLAUDE.md; hay que limpiar la caché y reiniciar para recargarlo",
      C: "A Ben le falta la regla en su archivo de usuario; hay que copiarla a su `~/.claude/CLAUDE.md` para igualarlos",
      D: "El CLAUDE.md de proyecto de Ana difiere del de Ben; Ben debe hacer pull para recibir el mismo archivo",
    },
    explanation:
      "La A es correcta: el archivo del repositorio es idéntico para ambos, así que la instrucción adicional debe venir de un nivel que solo carga Ana. Las instrucciones de nivel de usuario en `~/.claude/CLAUDE.md` no se comparten por control de versiones; ejecutar `/memory` en la sesión de Ana mostraría ese archivo. Mover la regla al CLAUDE.md del proyecto se la da a todos. La B describe una caché que no existe: CLAUDE.md se lee del disco. La C arregla solo la máquina de Ben; el siguiente compañero tendrá el mismo problema. La D queda descartada por el enunciado: ambos están en el mismo commit con el árbol de trabajo limpio.\n\nCómo implementarlo:\n```markdown\n<!-- CLAUDE.md at the repository root (committed) -->\n## Before committing\n- Run `make lint` and fix every error before creating a commit\n```",
    keyConcept: "Diagnosticar la jerarquía con /memory: las instrucciones de usuario no se comparten con el equipo",
  },

  "E3-002": {
    question:
      "Un CLAUDE.md de proyecto de 450 líneas mezcla guías de pruebas, API, seguridad y despliegue. Cuatro líderes distintos son dueños de esos temas, y sus ediciones chocan en el mismo archivo casi en cada versión. Quieren mantener cada tema en su propio archivo mientras Claude sigue cargándolo todo como instrucciones del proyecto en cada sesión. ¿Cuál es la estructura recomendada?",
    options: {
      A: "Dividirlo en cuatro archivos CLAUDE.md ubicados en `tests/`, `api/`, `security/` y `deploy/`",
      B: "Dividirlo en archivos temáticos en `.claude/rules/`, como `testing.md` y `api-conventions.md`",
      C: "Mover la sección de cada líder a su propio `~/.claude/CLAUDE.md` para que sus ediciones no choquen",
      D: "Mantener un solo archivo y agregar una regla CODEOWNERS para que solo un líder lo edite a la vez",
    },
    explanation:
      "La B es correcta: `.claude/rules/` es la forma documentada de dividir un CLAUDE.md monolítico en archivos temáticos enfocados. Los archivos de reglas sin campo `paths` se cargan al iniciar igual que CLAUDE.md, así que Claude conserva toda la guía, y cada líder edita un archivo separado. La A cambia el comportamiento: los CLAUDE.md de subdirectorio se cargan solo cuando Claude trabaja con archivos de esas carpetas, así que las reglas de seguridad o despliegue desaparecerían de la mayoría de las sesiones. La C saca la guía del proyecto compartido; los compañeros dejarían de recibirla. La D mantiene los choques, solo que en serie, y el archivo sigue siendo monolítico.\n\nCómo implementarlo:\n```text\n.claude/\n  CLAUDE.md            # short: build commands, project overview\n  rules/\n    testing.md\n    api-conventions.md\n    security.md\n    deployment.md\n```",
    keyConcept: "Dividir un CLAUDE.md grande en archivos temáticos dentro de .claude/rules/",
  },

  "E3-003": {
    question:
      "La skill `/scaffold-endpoint` de tu equipo necesita un nombre de recurso y un método HTTP. Los desarrolladores suelen escribir `/scaffold-endpoint` sin nada más, y Claude entonces adivina un nombre de recurso a partir del archivo que esté abierto. Quieres que, al invocarla, los desarrolladores vean qué parámetros espera la skill. ¿Qué debes agregar?",
    options: {
      A: "Una línea `context: fork` para que la skill corra en un subagente que pida los valores que faltan",
      B: "Una línea `argument-hint: [resource] [method]` en el frontmatter del SKILL.md de la skill",
      C: "Una línea en el CLAUDE.md del proyecto que liste los argumentos que espera recibir cada skill",
      D: "Una línea `disable-model-invocation: true` para que solo los desarrolladores la inicien, con argumentos",
    },
    explanation:
      "La B es correcta: `argument-hint` en el frontmatter de SKILL.md indica a los desarrolladores qué parámetros espera la skill cuando la invocan. La A aísla el contexto de la skill, pero no le dice a nadie qué pasar. La C carga una lista en todas las sesiones y no hace nada en el momento de la invocación. La D controla quién puede invocar la skill (solo el usuario, no Claude por su cuenta), pero no dice nada de sus parámetros. Nota de producto: la documentación actual describe `argument-hint` como la pista que se muestra en el autocompletado, así que también indícale a la skill que se detenga y pregunte cuando `$ARGUMENTS` esté vacío.\n\nCómo implementarlo:\n```markdown\n---\nname: scaffold-endpoint\ndescription: Scaffold a REST endpoint with handler, schema and tests\nargument-hint: [resource] [method]\n---\nIf $ARGUMENTS is empty, ask for the resource name and HTTP method before doing anything.\nScaffold the endpoint for: $ARGUMENTS\n```",
    keyConcept: "El frontmatter argument-hint muestra a los desarrolladores los parámetros que necesita una skill",
  },

  "E3-004": {
    question:
      "Producto pide actualizaciones de pedidos en tiempo real en la app móvil. El backend podría enviarlas por WebSockets, lo que requiere un nuevo gateway de conexiones y sesiones persistentes, o mediante un servicio gestionado de pub/sub, lo que implica un proveedor nuevo con otra autenticación. En ambos casos el cambio toca la capa de API, el cliente móvil y la configuración de despliegue. ¿Cómo debes empezar con Claude Code?",
    options: {
      A: "Usar ejecución directa con WebSockets, por ser la opción más común, y ajustar después",
      B: "Usar ejecución directa e indicarle a Claude que se detenga y pregunte en cada decisión de infraestructura",
      C: "Hacer que Claude prototipe ambas opciones directamente en la rama principal y quedarse con la más rápida",
      D: "Usar plan mode para explorar el código y comparar ambos enfoques antes de editar cualquier archivo",
    },
    explanation:
      "La D es correcta: dos enfoques válidos con requisitos de infraestructura distintos, en varias capas, es exactamente el tipo de decisión arquitectónica para la que existe plan mode. Claude explora el código en solo lectura y expone los trade-offs antes de cambiar nada. La A se compromete con un enfoque antes de compararlos, con riesgo de una reescritura costosa. La B empieza a editar antes de tomar la decisión, así que el trabajo ya hecho puede tener que descartarse. La C escribe dos implementaciones a medias en la rama principal para resolver una pregunta que el análisis puede responder primero.\n\nCómo implementarlo:\n```bash\nclaude --permission-mode plan\n# > Compare a WebSocket gateway vs managed pub/sub for real-time order updates.\n# > For each: files and services touched, infra and auth changes, risks. Recommend one.\n```",
    keyConcept: "Plan mode para elegir entre enfoques con requisitos de infraestructura distintos",
  },

  "E3-005": {
    question:
      "Un desarrollador sin experiencia en cachés debe agregar una caché de lectura delante de un servicio de precios lento. Su prompt es una línea: «agrega caché a getPrice». Sospechas que hay decisiones que no ha considerado, como la invalidación cuando cambian los precios y qué pasa cuando la caché está caída. ¿Qué debe hacer antes de que Claude escriba código?",
    options: {
      A: "Pedirle a Claude que lo entreviste sobre el diseño hasta tener una especificación, y luego construir",
      B: "Pedirle a Claude que implemente el enfoque de caché más común y revisar el diff al terminar",
      C: "Agregar una línea en CLAUDE.md que diga «considera la invalidación de caché» para todas las sesiones",
      D: "Hacer que Claude escriba el código y las pruebas a la vez, y tomar las pruebas en verde como prueba",
    },
    explanation:
      "La A es correcta: el patrón de entrevista hace que Claude formule preguntas que sacan a la luz consideraciones que el desarrollador no anticipó, como la estrategia de invalidación, los TTL y los modos de falla, antes de implementar en un dominio desconocido. La B incorpora valores por defecto que el desarrollador nunca eligió, y revisar un diff no muestra las decisiones que se tomaron en silencio. La C agrega una línea siempre cargada para una sola tarea y nombra solo una de las preguntas abiertas. La D no ayuda: pruebas escritas con los mismos supuestos sin examinar pasarán y no demostrarán nada sobre las decisiones que faltan.\n\nCómo implementarlo:\n```text\nI need a read-through cache in front of getPrice() but haven't designed it.\nInterview me until you could write the spec (invalidation, TTL, behavior when\nthe cache is down, consistency needs), then write it to SPEC.md. Don't write code yet.\n```",
    keyConcept: "Patrón de entrevista: que Claude haga preguntas de diseño antes de implementar en un dominio desconocido",
  },

  "E3-006": {
    question:
      "Tu job de revisión de pull requests ejecuta `claude -p \"Review this diff\" --output-format json`, y un script lee el campo `result` para publicar comentarios en línea. Más o menos una de cada diez corridas rompe el script porque el texto de la revisión cambia de forma: a veces una lista y a veces párrafos. Cada corrida debe entregar hallazgos con archivo, línea, severidad y mensaje. ¿Qué cambio lo corrige?",
    options: {
      A: "Agregar «responde siempre como un arreglo JSON» al prompt y leer `result` con un parser tolerante",
      B: "Agregar `--json-schema` con un esquema de hallazgos y leer el campo `structured_output`",
      C: "Cambiar a `--output-format stream-json` y armar los hallazgos a partir del flujo de eventos",
      D: "Pasar una regex sobre `result` buscando archivo:línea y descartar las líneas que no coincidan",
    },
    explanation:
      "La B es correcta: `--output-format json` solo envuelve el texto libre de Claude en un sobre JSON (`result`, ID de sesión, metadatos). Agregar `--json-schema` hace que Claude devuelva una salida que cumple el esquema, en el campo `structured_output`, que el script puede publicar como comentarios en línea. La A sigue dependiendo de que el modelo obedezca una instrucción, así que algunas corridas seguirán fallando. La C cambia cómo se entrega la salida (eventos delimitados por líneas), no la forma de la revisión. La D adivina la estructura a partir de texto libre y pierde hallazgos en silencio. La documentación agrega que `structured_output` no aparece si la corrida termina sin una salida válida, así que hay que verificar que exista.\n\nCómo implementarlo:\n```bash\ngh pr diff \"$PR\" | claude -p \"Review this diff for bugs and security issues\" \\\n  --output-format json \\\n  --json-schema '{\"type\":\"object\",\"properties\":{\"findings\":{\"type\":\"array\",\"items\":{\"type\":\"object\",\"properties\":{\"file\":{\"type\":\"string\"},\"line\":{\"type\":\"integer\"},\"severity\":{\"type\":\"string\",\"enum\":[\"high\",\"medium\",\"low\"]},\"message\":{\"type\":\"string\"}},\"required\":[\"file\",\"line\",\"severity\",\"message\"]}}},\"required\":[\"findings\"]}' \\\n  | jq '.structured_output.findings'\n```",
    keyConcept: "--output-format json con --json-schema entrega hallazgos procesables por máquina en structured_output",
  },

  "E3-007": {
    question:
      "Después de que Claude refactoriza un módulo de checkout, encuentras tres problemas: la nueva función de descuento redondea antes de aplicar el impuesto, la función de impuestos ahora supone que su entrada ya viene redondeada y el resumen del pedido muestra valores de ambas. Corregir cualquiera de ellos cambia lo que deben hacer los otros dos. ¿Cómo debes darle esta retroalimentación a Claude?",
    options: {
      A: "Describir los tres problemas y cómo se relacionan en un solo mensaje para que se corrijan juntos",
      B: "Informar primero el redondeo, esperar la corrección, luego el impuesto y luego el resumen del pedido",
      C: "Abrir tres sesiones nuevas, una por problema, para que cada corrección tenga un contexto limpio",
      D: "Revertir el refactor y pedirle a Claude que lo rehaga desde cero con el mismo prompt original",
    },
    explanation:
      "La A es correcta: cuando las correcciones interactúan, dar todos los problemas y la relación entre ellos en un mensaje detallado permite que Claude diseñe una corrección coherente, por ejemplo, decidir una sola vez dónde ocurre el redondeo. La B es el patrón correcto para problemas independientes; aquí cada corrección en serie se basaría en supuestos que la siguiente cambia, lo que genera vaivenes. La C es todavía peor: tres sesiones aisladas no ven los cambios de las otras, así que sus correcciones chocarán. La D repite el mismo prompt, que probablemente reproduzca el mismo diseño, y descarta las partes útiles del refactor.\n\nCómo implementarlo:\n```text\nThree linked problems in the checkout refactor; fix them together:\n1. applyDiscount() rounds before tax; rounding must happen once, after tax.\n2. computeTax() now assumes rounded input; it must accept unrounded amounts.\n3. OrderSummary shows both values; it should show only the final rounded total.\nAdd a test covering a discounted, taxed order with fractional cents.\n```",
    keyConcept: "Los problemas que interactúan van en un solo mensaje detallado; los independientes se iteran en serie",
  },

  "E3-008": {
    question:
      "Un paso de CI le pide a Claude Code que genere pruebas para cada pull request. Los revisores rechazan la mayoría: verifican getters y constantes, crean sus propios mocks de base de datos aunque el repositorio tiene fixtures compartidos en `tests/fixtures/`, e ignoran la regla del equipo de que toda corrección de error necesita una prueba de regresión. El prompt es «escribe pruebas para los archivos cambiados». ¿Qué cambio mejora más el resultado en todos los pull requests?",
    options: {
      A: "Generar el doble de pruebas por pull request y dejar que los revisores conserven las útiles",
      B: "Agregar al prompt de CI una instrucción por corrida que diga «escribe solo pruebas valiosas»",
      C: "Documentar en CLAUDE.md los estándares de pruebas, qué hace valiosa una prueba y los fixtures",
      D: "Ejecutar el generador de pruebas con un modelo de mayor nivel para que infiera las preferencias",
    },
    explanation:
      "La C es correcta: CLAUDE.md es el mecanismo por el que Claude Code invocado en CI recibe el contexto del proyecto. Escribir los estándares de pruebas, qué pruebas valora el equipo (como las de regresión para cada corrección) y qué fixtures existen le da a cada corrida el conocimiento que le faltaba. La A multiplica la salida de poco valor y la carga de los revisores. La B es una instrucción vaga que no dice qué significa «valiosa» ni que existen fixtures. La D no puede inferir convenciones que no están escritas en ningún lugar que vea. Nota de producto: `claude -p` carga CLAUDE.md por defecto, pero `--bare` lo omite, así que no ejecutes este paso en modo bare.\n\nCómo implementarlo:\n```markdown\n<!-- CLAUDE.md -->\n## Testing standards\n- Every bug fix includes a regression test that fails before the fix\n- Do not test trivial getters, setters or constants\n- Use the shared fixtures in tests/fixtures/ (db.ts, users.ts); never hand-roll DB mocks\n- Test behavior through public APIs, including error paths\n```",
    keyConcept: "CLAUDE.md da a Claude Code en CI los estándares de pruebas y los fixtures que necesita",
  },

  "E3-009": {
    question:
      "Estás planificando un cambio en cómo un sistema heredado maneja las sesiones de usuario. El descubrimiento implica leer decenas de archivos en tres servicios. En un intento anterior, el contenido crudo de los archivos llenó la sesión y, para la fase de implementación, Claude había perdido el hilo de decisiones tomadas al principio. ¿Cómo debes ejecutar la fase de descubrimiento esta vez?",
    options: {
      A: "Delegar el descubrimiento al subagente Explore para que solo vuelva un resumen a la sesión principal",
      B: "Pegar tú mismo los archivos relevantes en la sesión principal para que Claude los lea en un solo lugar",
      C: "Hacer el descubrimiento en ejecución directa y luego usar `/compact` cuando termine de leer todo",
      D: "Omitir el descubrimiento y confiar en una sección de arquitectura de CLAUDE.md que describa los servicios",
    },
    explanation:
      "La A es correcta: el subagente Explore lee los archivos en su propio contexto y devuelve un resumen, así que la salida extensa del descubrimiento nunca desplaza las decisiones en la conversación principal. La B pone el mismo contenido crudo en la sesión principal, que es lo que falló antes. La C deja que el contexto se llene primero y luego depende de un resumen con pérdida de todo, incluidas las primeras decisiones. La D confía en una descripción que puede estar desactualizada en un sistema heredado y se salta la investigación que el cambio necesita. Nota de producto: la documentación actual dice que agotar el contexto es menos común con ventanas de 1M de tokens, pero sigue recomendando subagentes para mantener la exploración ruidosa fuera de la conversación principal.\n\nCómo implementarlo:\n```text\nUse the Explore subagent (very thorough) to find how sessions are created,\nrefreshed and invalidated across auth-service, gateway and web-app. Return\na summary: files involved, data flow, and anything surprising. No edits.\n```",
    keyConcept: "El subagente Explore aísla el descubrimiento extenso y devuelve un resumen a la conversación principal",
  },

  "E3-010": {
    question:
      "`.claude/rules/api.md` empieza con el frontmatter `paths: [\"src/api/*.ts\"]`. Claude aplica las reglas al editar `src/api/router.ts`, pero las ignora al editar `src/api/v2/orders.ts` y `src/api/v2/users.ts`. ¿Cuáles son la causa y la corrección?",
    options: {
      A: "Las reglas con paths se cargan solo al iniciar; reinicia la sesión tras abrir un archivo de `src/api/v2/`",
      B: "`*` coincide con un solo nivel de directorio; cambia el patrón a `src/api/**/*.ts` para las subcarpetas",
      C: "Las reglas no coinciden con carpetas anidadas; agrega un CLAUDE.md en `src/api/v2/` con las mismas reglas",
      D: "El glob debe ser absoluto; cámbialo por la ruta completa de `src/api` en la máquina de cada desarrollador",
    },
    explanation:
      "La B es correcta: en un glob de `paths`, `src/api/*.ts` coincide solo con archivos que están directamente en `src/api/`; hace falta `**` para incluir archivos de subcarpetas. La A es incorrecta porque las reglas con paths se cargan durante la sesión, cuando Claude lee o edita un archivo que coincide. La C es incorrecta porque los globs con `**` sí coinciden con carpetas anidadas, y esa es la principal ventaja de las reglas frente a los CLAUDE.md por directorio. La D es incorrecta porque los patrones son relativos al directorio del proyecto que contiene `.claude/`; las rutas absolutas fallarían en cualquier otra máquina.\n\nCómo implementarlo:\n```markdown\n---\npaths:\n  - \"src/api/**/*.ts\"\n---\n# API rules\n- Validate every request body with the shared schema helper\n```",
    keyConcept: "Globs en paths: * se queda en un directorio y ** abarca los subdirectorios",
  },

  "E3-011": {
    question:
      "Tu skill `/map-dependencies` recorre todo el repositorio e imprime cientos de líneas de grafos de imports antes de dar un resumen de diez líneas. Los desarrolladores la ejecutan en medio de una tarea y, después, su sesión queda saturada y es más difícil de dirigir. Solo necesitan el resumen en la conversación principal. ¿Qué cambio en el frontmatter encaja mejor?",
    options: {
      A: "Poner `disable-model-invocation: true` para que la skill corra solo cuando un desarrollador escriba su nombre",
      B: "Poner `allowed-tools: Read Grep Glob` para que la skill no pueda escribir nada mientras corre",
      C: "Poner `context: fork` para que la skill corra en un subagente aislado y devuelva solo su resultado",
      D: "Poner `user-invocable: false` para que Claude la ejecute por su cuenta en lugar del desarrollador",
    },
    explanation:
      "La C es correcta: `context: fork` ejecuta la skill en un subagente aislado. La salida extensa del grafo se queda en ese contexto y solo el resultado vuelve a la conversación principal. La A cambia quién puede activar la skill; la salida seguiría llegando a la sesión principal. La B preaprueba herramientas de solo lectura; no cambia a dónde va la salida. La D oculta la skill del menú `/` para que solo Claude pueda invocarla, y la salida sigue entrando en la conversación. Nota de producto: la documentación aclara que una skill bifurcada no ve el historial de la conversación, así que su prompt debe ser autosuficiente.\n\nCómo implementarlo:\n```markdown\n---\nname: map-dependencies\ndescription: Map module dependencies and summarize hotspots\ncontext: fork\nagent: Explore\n---\nBuild the import graph for the repository. Return only a summary of at most\n10 lines: cycles, most-imported modules, and suspicious cross-layer imports.\n```",
    keyConcept: "context: fork ejecuta skills verbosas en un subagente aislado para que solo el resultado llegue a la sesión principal",
  },

  "E3-012": {
    question:
      "Un compañero agregó `.claude/rules/graphql.yaml`, que empieza con un frontmatter entre marcadores `---` con `paths: [\"**/*.graphql\"]`, seguido de las convenciones del esquema. Semanas después, Claude sigue ignorando esas convenciones al editar archivos `.graphql` en cualquier parte del repositorio, y el archivo nunca aparece entre las reglas cargadas. ¿Cuál es la corrección?",
    options: {
      A: "Cambiar la clave `paths` por `globs`, porque `paths` solo acepta directorios y no tipos de archivo",
      B: "Importar el archivo con `@.claude/rules/graphql.yaml` desde el CLAUDE.md raíz para que se cargue",
      C: "Renombrarlo a `graphql.md`, conservando su frontmatter, porque los archivos de reglas deben ser Markdown",
      D: "Poner un CLAUDE.md junto a cada archivo `.graphql`, porque las reglas no filtran por extensión",
    },
    explanation:
      "La C es correcta: Claude Code solo descubre archivos `.md` en `.claude/rules/`. El frontmatter y el glob `**/*.graphql` ya están bien; el archivo simplemente nunca se lee por su extensión. La A es incorrecta: `paths` es el campo que usan las reglas y acepta globs por extensión, como `**/*.ts`. La B cargaría el texto al iniciar en todas las sesiones, se edite el archivo que se edite, así que las convenciones dejarían de estar acotadas por ruta. La D es falsa en los hechos y además dispersaría copias por todo el repositorio.\n\nCómo implementarlo:\n```bash\ngit mv .claude/rules/graphql.yaml .claude/rules/graphql.md\n```\n```markdown\n---\npaths:\n  - \"**/*.graphql\"\n---\n# GraphQL schema conventions\n- Types are PascalCase; fields are camelCase\n```",
    keyConcept: "Las reglas de .claude/rules/ son archivos Markdown con frontmatter YAML; los globs de paths las acotan",
  },

  // ============================================================
  // DOMINIO 4 – Ingeniería de Prompts y Salidas Estructuradas
  // ============================================================

  "E4-001": {
    question:
      "Tu revisor de CI etiqueta cada hallazgo como critical, major o minor. Las auditorías muestran que el mismo tipo de problema recibe etiquetas distintas entre PR: una consulta SQL sin parametrizar fue \"critical\" en un PR y \"minor\" en otro, así que los equipos no pueden usar la severidad para bloquear merges. El prompt actual dice: \"Asigna la severidad según el impacto.\" ¿Qué cambio mejora más la consistencia?",
    options: {
      A: "Pedir al modelo una confianza numérica con cada hallazgo y derivar la etiqueta de severidad a partir de ella en el posproceso.",
      B: "Reemplazar las tres etiquetas por una escala de severidad de 1 a 10 para dar más granularidad y menos decisiones límite.",
      C: "Definir cada nivel con criterios explícitos y un ejemplo breve de código, p. ej. critical: SQL inyectable o secretos expuestos.",
      D: "Agregar \"sé consistente con las etiquetas de severidad entre revisiones\" y recordar que la severidad bloquea merges.",
    },
    explanation:
      "\"Según el impacto\" deja cada PR a un juicio nuevo. Los criterios explícitos por nivel, cada uno anclado en un ejemplo de código concreto, le dan al modelo una referencia fija, que es como la guía indica lograr una clasificación consistente. La opción A confunde la confianza (qué tan seguro está el modelo) con la severidad (qué tan grave es el problema). La opción B agrega más fronteras que ubicar de forma inconsistente. La opción D pide consistencia sin definir qué significa ser consistente.",
    keyConcept: "Criterios de severidad con ejemplos de código para una clasificación consistente",
  },

  "E4-002": {
    question:
      "Tu flujo de ingreso recibe facturas, órdenes de compra y contratos sin saber el tipo de cada archivo. Definiste tres herramientas de extracción (`extract_invoice`, `extract_po`, `extract_contract`) con esquemas JSON y usas `tool_choice: {\"type\": \"auto\"}`. En el 4% de las llamadas, Claude responde con prosa como \"Esto parece una factura\" y no llama a ninguna herramienta, lo que rompe el flujo. ¿Qué deberías cambiar?",
    options: {
      A: "Forzar `tool_choice: {\"type\": \"tool\", \"name\": \"extract_invoice\"}`, ya que las facturas son el tipo más común.",
      B: "Usar `tool_choice: {\"type\": \"any\"}` para que Claude deba llamar a una de las tres herramientas y elija la adecuada.",
      C: "Mantener `auto` y agregar \"responde siempre llamando a una herramienta, nunca con texto\" al prompt y a cada herramienta.",
      D: "Quitar las herramientas y pedir JSON en la respuesta de texto, con un campo `document_type` que el flujo use para enrutar.",
    },
    explanation:
      "Con `auto`, el modelo puede responder con texto. `any` garantiza una llamada a herramienta y deja que el modelo elija el esquema que coincide con el documento, que es justo el caso de varios esquemas y tipo de documento desconocido. La opción A garantiza una llamada, pero fuerza el esquema de factura sobre contratos y órdenes de compra. La opción C mantiene el comportamiento opcional y solo hace menos probable una respuesta de texto. La opción D abandona tool use, que la guía considera la vía más confiable para obtener salida conforme al esquema, y trae de vuelta los errores de parseo de JSON. (La API actual también ofrece `strict: true` en herramientas y `output_config.format`; restringen el esquema, pero no reemplazan elegir el `tool_choice` correcto.) Nota de producto: Claude Opus 5.5 y Sonnet 5.5 rechazan `tool_choice` forzado (`any` o `tool`) con un error 400; la guía del examen sigue evaluando la selección forzada, así que el ejemplo usa `claude-haiku-5-5`, que sí la acepta. En los modelos nuevos, usa `auto` con herramientas `strict: true` o salidas estructuradas.\n\nCómo implementarlo:\n```typescript\nconst res = await client.messages.create({\n  model: \"claude-haiku-5-5\",\n  max_tokens: 2048,\n  tools: [extractInvoice, extractPo, extractContract],\n  tool_choice: { type: \"any\" },\n  messages: [{ role: \"user\", content: fileText }],\n});\nconst call = res.content.find((b) => b.type === \"tool_use\");\n```",
    keyConcept: "tool_choice \"any\" garantiza una llamada a herramienta cuando el tipo de documento es desconocido",
  },

  "E4-003": {
    question:
      "Tu revisión de CI produce unos 40 hallazgos por PR grande, y los dos revisores senior solo pueden verificar unos 10 a mano. Algunos hallazgos son claramente correctos; otros son dudosos. Quieres que la atención humana vaya donde más importa, sin descartar hallazgos en silencio. ¿Qué diseño encaja mejor?",
    options: {
      A: "Pedir a la sesión que los generó que revise los 40 hallazgos al final, quite los que ahora le generen dudas y publique el resto.",
      B: "Agregar una pasada de verificación que reporte una confianza por hallazgo; publicar los de alta confianza y encolar el resto.",
      C: "Publicar automáticamente solo los hallazgos de seguridad y descartar las demás categorías hasta que los revisores tengan tiempo.",
      D: "Dar a la pasada de generación un mayor presupuesto de pensamiento extendido para que todo hallazgo se publique sin revisión.",
    },
    explanation:
      "Una pasada de verificación en la que el modelo declara su confianza junto a cada hallazgo permite un enrutamiento calibrado: los hallazgos seguros van directo al PR y los dudosos van al poco tiempo humano disponible. Calibra el umbral con los datos históricos de descarte; la confianza se usa para enrutar, no como sustituto de criterios de revisión explícitos. La opción A es autorrevisión en la misma sesión, que tiende a conservar las decisiones del propio modelo y descarta hallazgos en silencio. La opción C descarta hallazgos válidos por categoría. La opción D supone que el pensamiento extendido vuelve innecesaria la revisión; la guía dice que no detecta problemas sutiles tan bien como un paso de revisión aparte.",
    keyConcept: "Pasada de verificación con confianza por hallazgo para un enrutamiento calibrado",
  },

  "E4-004": {
    question:
      "Algunos recibos de tu flujo de extracción imprimen un total que no coincide con sus propias partidas (errores del proveedor), mientras que en otros casos el modelo lee mal una partida. Contabilidad necesita distinguir estas dos situaciones en lugar de confiar en silencio en cualquiera de los dos números. ¿Cómo deberías diseñar la extracción?",
    options: {
      A: "Extraer solo `stated_total` y que el código rechace todo recibo cuyas partidas no sumen, enviándolo a un nuevo reintento.",
      B: "Extraer solo las partidas y calcular el total en código, ignorando el total impreso porque puede traer errores del proveedor.",
      C: "Pedir al modelo que corrija el total impreso cuando no coincida con las partidas, para que llegue un registro consistente.",
      D: "Extraer `stated_total` y un `calculated_total` sumado de las partidas, más un indicador `conflict_detected` si difieren.",
    },
    explanation:
      "Capturar ambos totales y un indicador de conflicto convierte una inconsistencia silenciosa en datos: el código puede reintentar con retroalimentación específica cuando es probable una mala lectura, y enviar los errores reales del proveedor a contabilidad con la evidencia intacta. La opción A reintenta cada discrepancia, pero un recibo que está mal en la fuente nunca va a cuadrar, así que entra en bucle o termina en una corrección inventada. La opción B descarta el total impreso, así que los errores del proveedor desaparecen. La opción C pide al modelo sobrescribir datos de la fuente y oculta el conflicto que contabilidad necesita ver.",
    keyConcept: "calculated_total vs. stated_total con conflict_detected para la autocorrección",
  },

  "E4-005": {
    question:
      "Tu plataforma de soporte ejecuta tres cargas con Claude: (1) un borrador de respuesta que ve un agente en vivo mientras el cliente espera en el chat, (2) el etiquetado nocturno de los tickets cerrados del día para un reporte de analítica que se revisa la semana siguiente, y (3) una reclasificación trimestral de 2 millones de tickets históricos. Finanzas quiere el descuento del 50% de la Message Batches API donde no perjudique la experiencia del cliente. ¿Qué asignación es correcta?",
    options: {
      A: "Usar batch para el etiquetado nocturno y la reclasificación trimestral; dejar los borradores del chat en la Messages API síncrona.",
      B: "Usar batch para las tres, consultando el batch del chat cada pocos segundos, ya que casi todos terminan en menos de una hora.",
      C: "Usar batch solo para la carga trimestral; el etiquetado nocturno debe ser síncrono porque un batch puede tardar 24 horas.",
      D: "Usar batch para los borradores del chat, que es el mayor costo, y ejecutar las dos cargas de analítica de forma síncrona.",
    },
    explanation:
      "El procesamiento por lotes encaja con trabajo no bloqueante y tolerante a la latencia, y no encaja con flujos bloqueantes. El borrador del chat bloquea a un cliente que espera, así que necesita la API síncrona. El etiquetado nocturno que se lee una semana después y la carga trimestral toleran sin problema hasta 24 horas. La opción B ignora que los batches no tienen SLA de latencia; \"normalmente en menos de una hora\" no es aceptable para un cliente que espera. La opción C trata la ventana de 24 horas como un problema para un reporte que se lee una semana después. La opción D pone en batch la única carga crítica en latencia.",
    keyConcept: "Batch para trabajo tolerante a la latencia, síncrono para flujos bloqueantes",
  },

  "E4-006": {
    question:
      "Un batch de 20,000 extracciones de contratos termina con 19,640 resultados `succeeded` y 360 `errored`; los errores dicen que esas solicitudes superaron la ventana de contexto del modelo. Tu código de manejo de resultados empareja hoy cada resultado con su entrada según su posición en el archivo de resultados. ¿Qué deberías hacer?",
    options: {
      A: "Reenviar el batch completo de 20,000 solicitudes; uno nuevo mantiene todos los resultados juntos y en el orden de entrada.",
      B: "Reenviar sin cambios las 360 solicitudes fallidas en un batch nuevo, ya que un resultado `errored` suele ser transitorio.",
      C: "Emparejar por `custom_id` y reenviar solo los 360 documentos fallidos, divididos en fragmentos que quepan en el contexto.",
      D: "Seguir emparejando por posición, pero ordenar antes el archivo de resultados por fecha para que coincida con la entrada.",
    },
    explanation:
      "Los resultados de un batch pueden llegar en cualquier orden, así que `custom_id` es la única forma confiable de relacionar un resultado con su solicitud y de identificar qué documentos fallaron. Un desborde de la ventana de contexto es determinista, así que los documentos fallidos deben modificarse (fragmentarse) antes de reenviarse, y solo esos deben reenviarse. La opción A vuelve a pagar 19,640 éxitos y tampoco garantiza el orden. La opción B reenvía solicitudes que fallarán igual. La opción D sigue confiando en el orden, que la API no garantiza. Probar el prompt con una muestra antes de los batches grandes reduce estos reenvíos.\n\nCómo implementarlo:\n```typescript\nconst failed: string[] = [];\nfor await (const r of await client.messages.batches.results(batchId)) {\n  if (r.result.type === \"succeeded\") save(r.custom_id, r.result.message);\n  else failed.push(r.custom_id);\n}\nconst retry = failed.flatMap((id) => chunk(docs[id]).map((part, i) => ({\n  custom_id: `${id}-part${i}`,\n  params: { model: \"claude-sonnet-5-5\", max_tokens: 2048, messages: [{ role: \"user\", content: part }] },\n})));\nawait client.messages.batches.create({ requests: retry });\n```",
    keyConcept: "Usar custom_id para reenviar solo las solicitudes fallidas, modificadas según haga falta",
  },

  "E4-007": {
    question:
      "Claude Code genera pruebas unitarias en tu pipeline de CI. Las pruebas generadas cubren sobre todo el camino feliz: en funciones con retornos tempranos, ramas de error o validaciones de límites, esas ramas quedan sin probar. Ya agregaste \"cubre todas las ramas y casos límite\" al prompt, con poco efecto. ¿Cuál es el siguiente cambio más efectivo?",
    options: {
      A: "Hacer fallar el job de CI cuando baje la cobertura y enviar el porcentaje a Claude, pidiéndole que escriba más pruebas.",
      B: "Ampliar la instrucción a un párrafo completo que defina con precisión cobertura de ramas, valores límite y rutas de error.",
      C: "Exigir que el modelo liste en un resumen JSON cada función que probó, para que los revisores detecten las omitidas.",
      D: "Agregar 2–3 ejemplos que unan una función con su rama sin probar, por qué importa y la prueba que la cubre.",
    },
    explanation:
      "Cuando las instrucciones por sí solas no cambian el comportamiento, los ejemplos few-shot muestran el criterio que buscas. Ejemplos que van de una función a la rama específica sin cubrir, explican por qué importa y muestran la prueba resultante enseñan al modelo a encontrar huecos de cobertura por rama en código que no ha visto. La opción A da una retroalimentación demasiado vaga para actuar: un porcentaje no dice qué rama falta. La opción B es más de la instrucción que ya falló. La opción C agrega reportes, pero no cambia qué ramas se prueban.",
    keyConcept: "Ejemplos few-shot que muestran huecos de cobertura por rama",
  },

  "E4-008": {
    question:
      "Un check de CI le pide a Claude \"verificar que los comentarios del código sean exactos\". Marca TODO desactualizados, redacción informal y puntuación faltante, y los desarrolladores descartan casi todo. Al equipo le importa una sola cosa: comentarios que engañarían a quien lee sobre lo que hace el código. ¿Cómo deberías reescribir la instrucción?",
    options: {
      A: "Mantener la instrucción, pero agregar \"reporta problemas de comentarios solo si estás muy seguro de que importan\".",
      B: "Pedir al modelo que califique cada comentario de 1 a 5 por exactitud y publicar solo los que obtengan 2 o menos.",
      C: "Mantener la instrucción y agregar ejemplos few-shot de comentarios bien escritos para que aprenda el estilo del equipo.",
      D: "Marcar un comentario solo si lo que dice que hace el código contradice lo que hace; omitir estilo, redacción y TODO.",
    },
    explanation:
      "La meta vaga \"exactos\" deja que el modelo incluya temas de estilo. Un criterio explícito (el comportamiento que el comentario describe contradice el real) más una lista explícita de exclusiones define exactamente qué reportar, y eso es lo que mejora la precisión. La opción A es una instrucción de confianza, que no mejora la precisión frente a criterios categóricos. La opción B es un filtrado tipo confianza sobre un puntaje que sigue sin definición. La opción C empuja al modelo hacia el estilo, justo el ruido que los desarrolladores descartan.",
    keyConcept: "Criterios explícitos de qué reportar y qué omitir en lugar de metas vagas",
  },

  "E4-009": {
    question:
      "El flujo de Claude Code de un equipo genera una migración de base de datos y luego, en la misma sesión, le pide a Claude \"autoverifica la migración contra nuestra lista antes de terminar\". Una migración que eliminaba una columna que aún usaba un job de reportes pasó esa autoverificación y llegó a staging. ¿Qué cambio da la revisión más efectiva?",
    options: {
      A: "Correr la lista en una sesión nueva de Claude que reciba la migración, el esquema y la lista, pero no el historial.",
      B: "Mantener la autoverificación en la misma sesión, pero mover la lista al final del prompt para que se lea al último.",
      C: "Activar el pensamiento extendido en la generación para que el modelo razone cada tabla dependiente antes de escribir.",
      D: "Pedir a la sesión generadora que explique cada cambio y aprobar la migración solo si su explicación es coherente.",
    },
    explanation:
      "Una autoverificación en la misma sesión hereda el razonamiento que produjo la migración, así que es poco probable que el modelo cuestione su propia decisión de eliminar la columna. Una instancia independiente sin ese contexto, con la migración, el esquema y la lista (e idealmente herramientas para buscar usos de la columna), la revisa desde cero y es más efectiva que la autorrevisión o el pensamiento extendido. La opción B sigue siendo autorrevisión. La opción C mejora la generación pero no agrega una verificación independiente. La opción D evalúa al generador por su propia explicación, que naturalmente sonará coherente.",
    keyConcept: "Instancia independiente sin el contexto de generación para revisar",
  },

  "E4-010": {
    question:
      "Tu revisión de seguridad marca todo uso de evaluación dinámica de código y todo string de SQL crudo. Muchos están bien: un evaluador de expresiones aislado con lista de permitidos y SQL construido solo con constantes. Probaste a listar en el prompt los archivos seguros por ruta, pero el código seguro nuevo en otras partes sigue siendo marcado. ¿Qué enfoque generaliza mejor?",
    options: {
      A: "Seguir ampliando en el prompt la lista de rutas y nombres de funciones seguras cada vez que aparezca un falso positivo.",
      B: "Bajar a informativa la severidad de todo hallazgo de código dinámico y SQL crudo para que no bloquee ni alarme a nadie.",
      C: "Agregar ejemplos few-shot que contrasten patrones seguros (evaluador con permitidos, SQL constante) con los inyectables.",
      D: "Indicar al modelo que reporte código dinámico y SQL crudo solo si está muy seguro de que el uso es realmente explotable.",
    },
    explanation:
      "Una lista de rutas solo cubre casos especificados de antemano. Los ejemplos few-shot que contrastan patrones aceptables con problemas reales, y explican la diferencia, permiten que el modelo generalice el criterio a código nuevo, reduciendo falsos positivos sin ocultar inyecciones reales. La opción A es el enfoque que ya está fallando. La opción B también degrada las vulnerabilidades reales. La opción D es una instrucción de confianza, que no mejora la precisión como lo hacen los ejemplos concretos y contrastados.",
    keyConcept: "Ejemplos few-shot que contrastan patrones aceptables con problemas reales",
  },

  "E4-011": {
    question:
      "Tu esquema de herramienta strict para órdenes de compra incluye `discount_code` en `required`, porque un compañero cree que el modo strict de Claude exige que toda propiedad sea obligatoria. La mayoría de las órdenes no tiene código de descuento, y el modelo rellena códigos inventados como \"SAVE10\". ¿Cuál es la corrección adecuada?",
    options: {
      A: "Mantener `discount_code` obligatorio, como exige el modo strict, y agregar un filtro que borre códigos ausentes en la tabla de promociones.",
      B: "Desactivar `strict: true` en esta herramienta para que las reglas del esquema se relajen y el modelo ya no se sienta obligado a llenarlo.",
      C: "Permitir que el campo falte o sea null: el modo strict de Claude acepta propiedades fuera de `required` y `[\"string\", \"null\"]`.",
      D: "Mantener el campo obligatorio y agregar a la descripción de la herramienta que facturación rechazará códigos inventados.",
    },
    explanation:
      "El compañero aplica la regla de otro proveedor. El modo strict de Claude acepta propiedades que no están en `required` (cuentan para un límite de 24 parámetros opcionales) y tipos anulables con arreglos de tipos o `anyOf`. Hacer el campo opcional o anulable elimina la presión que provoca la invención, como recomienda la guía en 4.3. La opción A mantiene la presión y deja pasar un código inventado que casualmente existe (\"SAVE10\"). La opción B mantiene `required` en el esquema, así que la presión sigue y además pierdes la garantía del esquema. La opción D confía en una instrucción que compite con el esquema.",
    keyConcept: "El modo strict de Claude admite campos opcionales y anulables; úsalos para evitar invenciones",
  },

  "E4-012": {
    question:
      "Los desarrolladores descartan cerca del 30% de los hallazgos de tu revisor de CI, pero no puedes saber por qué: los hallazgos son texto libre y abarcan muchas construcciones de código distintas. Quieres saber qué tipos de hallazgos provocan los descartes para corregir el prompt de forma sistemática. ¿Qué deberías agregar?",
    options: {
      A: "Pedir a los desarrolladores un motivo breve en texto libre cada vez que descarten un hallazgo y leer una muestra cada cierto tiempo.",
      B: "Pedir al modelo que declare una confianza para cada hallazgo y descartar todos los que queden por debajo de un umbral fijo.",
      C: "Volver a pasar los hallazgos descartados por una segunda pasada de Claude que decida si el desarrollador tuvo razón al descartarlos.",
      D: "Agregar a cada hallazgo estructurado un campo `detected_pattern` con la construcción que lo disparó y agrupar los descartes por él.",
    },
    explanation:
      "Un campo `detected_pattern` hace que cada hallazgo se pueda contar según la construcción de código que lo disparó, así que las tasas de descarte se pueden agrupar por patrón y corregir en el prompt los peores casos. Ese es el diseño de ciclo de retroalimentación que describe la guía. La opción A recoge texto no estructurado, difícil de agregar, y depende del esfuerzo de los desarrolladores. La opción B filtra hallazgos sin explicar qué patrones fallan. La opción C cuestiona a los desarrolladores en lugar de medir dónde se equivoca el revisor.",
    keyConcept: "El campo detected_pattern permite analizar los descartes de forma sistemática",
  },

  // ============================================================
  // DOMINIO 5 – Gestión de Contexto y Rendimiento
  // ============================================================

  "E5-001": {
    question:
      "Por cada artículo, el subagente de análisis de documentos devuelve una narración de 3,000 palabras con su razonamiento y citas largas. El agente de síntesis recibe 25 de estas y trabaja con un presupuesto de contexto ajustado; sus informes omiten cifras clave y confunden qué dijo cada artículo. ¿Qué deberías cambiar primero?",
    options: {
      A: "Que el subagente de análisis devuelva hechos clave, citas y relevancia en formato estructurado, no prosa",
      B: "Darle al agente de síntesis un valor mayor de max_tokens para que tenga más espacio para procesar las 25 narraciones",
      C: "Agregar una segunda pasada de síntesis que relea las 25 narraciones y corrija las cifras que la primera pasada erró",
      D: "Hacer que el coordinador recorte cada narración a sus primeras 500 palabras antes de enviarla al agente de síntesis",
    },
    explanation:
      "A es la correcta. Cuando un agente posterior tiene un presupuesto de contexto limitado, el agente anterior debe devolver datos estructurados (hechos clave, citas, puntuaciones de relevancia) en lugar de contenido verboso y cadenas de razonamiento. Así el agente de síntesis recibe los hechos que necesita, cada uno ligado a su artículo, en una fracción de los tokens.\n\nB confunde límites: max_tokens limita la longitud de la salida del modelo, no cuánta entrada puede aprovechar bien. C duplica el costo y le da a la segunda pasada la misma entrada sobrecargada que causó los errores. D recorta por posición, así que cualquier cifra clave que aparezca después de la palabra 500 se pierde.\n\nCómo implementarlo:\n```typescript\ninterface PaperAnalysis {\n  paperId: string;\n  citation: string;            // \"Lee et al., 2025, J. Energy Policy\"\n  keyFacts: { fact: string; value?: string; page?: number }[];\n  relevance: number;           // 0-1, against the research question\n  method: string;              // \"RCT, n=1,200\"\n}\n// The subagent's final message must be a JSON array of PaperAnalysis, nothing else\n```",
    keyConcept: "Los agentes anteriores devuelven hechos estructurados, citas y relevancia, no prosa de razonamiento",
  },

  "E5-002": {
    question:
      "Un cliente escribe: \"Es la TERCERA vez que mi paquete llega dañado. Es ridículo\". Adjunta fotos. La política cubre un reemplazo estándar, que el agente está autorizado a emitir, y el cliente no pidió hablar con una persona. ¿Qué patrón de respuesta es el mejor?",
    options: {
      A: "Escalar a un humano de inmediato, porque un sentimiento muy negativo indica que el caso es demasiado sensible para el agente",
      B: "Reconocer la frustración, ofrecer el reemplazo ahora y escalar solo si el cliente insiste en hablar con un humano",
      C: "Abrir primero una investigación completa del historial de daños del transportista, para que la respuesta ataque la causa",
      D: "Emitir el reemplazo con una respuesta breve que solo cite la política y cerrar el caso, porque no se pidió un humano",
    },
    explanation:
      "B es la correcta. Cuando el problema está dentro de lo que el agente puede resolver y el cliente no pidió un humano, el agente debe reconocer la frustración y ofrecer la solución, y escalar solo si el cliente reitera que quiere una persona.\n\nA usa el sentimiento como disparador de escalamiento; la frustración no mide la complejidad del caso, y este es un reemplazo estándar cubierto. C retrasa una solución que el cliente puede tener ya; investigar al transportista es un seguimiento aparte. D resuelve el caso, pero ignora la frustración y no le da al cliente un camino claro hacia un humano si lo quiere, lo que suele generar un nuevo contacto.\n\nCómo implementarlo (ejemplo few-shot en el system prompt):\n```markdown\n<example>\nCustomer: \"Third damaged package. Ridiculous.\" (photos attached)\nAgent: \"I'm sorry, three damaged deliveries is frustrating. I can send a\nreplacement today at no cost. Would you like me to do that, or would you\nprefer to speak with a member of our team?\"\n</example>\n```",
    keyConcept: "Reconocer la frustración y ofrecer la solución; escalar solo si el cliente lo reitera",
  },

  "E5-003": {
    question:
      "El subagente de búsqueda de patentes devuelve una lista vacía en dos situaciones: cuando la API de patentes agota el tiempo de espera y cuando una consulta de verdad no tiene patentes coincidentes. El coordinador trata ambas como \"no se encontró estado de la técnica\" y ha publicado informes que afirman novedad en temas que nunca se buscaron. ¿Qué corrección ataca la causa raíz?",
    options: {
      A: "Devolver un error propio para fallas de acceso (tipo, consulta, reintentos) y dejar [] para búsquedas sin resultados",
      B: "Hacer que el coordinador repita toda búsqueda que vuelva vacía, por si la lista vacía vino de un timeout",
      C: "Hacer que el subagente lance una excepción ante cualquier resultado vacío para que el coordinador detenga el flujo",
      D: "Subir el timeout de la API de patentes de 10 a 60 segundos para que los timeouts sean tan raros que se puedan ignorar",
    },
    explanation:
      "A es la correcta. Una falla de acceso (la búsqueda nunca se ejecutó) y un resultado vacío válido (la búsqueda se ejecutó y no encontró nada) significan cosas distintas y requieren decisiones distintas. Informar la falla como un error estructurado, con su tipo, la consulta intentada y la información de reintentos, le permite al coordinador reintentar, probar otra fuente o marcar el vacío, mientras [] sigue significando \"se buscó y no hay nada\".\n\nB gasta llamadas repitiendo búsquedas vacías válidas y sigue sin distinguir los dos casos. C convierte resultados legítimos de \"sin coincidencias\" en fallas y detiene todo el flujo, que es el antipatrón opuesto. D hace los timeouts menos frecuentes, pero los que ocurren se siguen informando como \"sin estado de la técnica\".\n\nCómo implementarlo:\n```typescript\ntype SearchResult =\n  | { ok: true; query: string; results: Patent[] }            // [] = truly none\n  | { ok: false; failureType: \"timeout\" | \"auth\" | \"unavailable\";\n      query: string; attempts: number; partialResults: Patent[];\n      alternatives: string[] };                                 // e.g. [\"EPO mirror\"]\n```",
    keyConcept: "Distinguir las fallas de acceso de los resultados vacíos válidos",
  },

  "E5-004": {
    question:
      "Tu agente debe responder \"¿Cómo fluye un reembolso desde la API hasta el libro contable?\" en un monorepo de 400,000 líneas. En el diseño actual, el agente principal ejecuta él mismo cada grep y cada lectura de archivo; tras 30 minutos, su contexto es casi todo salida cruda de búsquedas y pierde de vista la pregunta original. ¿Qué diseño mantiene efectivo al agente principal?",
    options: {
      A: "Lanzar subagentes para preguntas acotadas, como rastrear las dependencias del reembolso, que devuelvan solo resúmenes",
      B: "Cargar al inicio tanto del monorepo como quepa en el contexto para que el agente casi no tenga que buscar después",
      C: "Hacer que el agente principal limite cada grep a 20 resultados mientras sigue ejecutando todas las búsquedas en su contexto",
      D: "Correr la misma pregunta en cinco sesiones paralelas y quedarse con la respuesta en la que coincida la mayoría",
    },
    explanation:
      "A es la correcta. Delegar investigaciones acotadas (\"encontrar todos los puntos de entrada del reembolso\", \"rastrear las dependencias del reembolso hasta el libro contable\") en subagentes mantiene la salida verbosa de la exploración en sus propias ventanas de contexto; el agente principal recibe solo los resúmenes y conserva la coordinación de alto nivel de la pregunta.\n\nB llena el contexto con código casi todo irrelevante antes de empezar, lo que acelera la degradación. C sigue acumulando cada búsqueda en el contexto principal, y limitar los resultados puede esconder justo la coincidencia que importa. D multiplica por cinco el mismo diseño defectuoso y suma costo sin resolver la acumulación de contexto. (La guía llama \"Task\" a la herramienta que lanza subagentes; la documentación actual del Agent SDK la nombra \"Agent\" en allowedTools).\n\nCómo implementarlo (Agent SDK, TypeScript):\n```typescript\nconst options = {\n  model: \"claude-sonnet-5-5\",\n  allowedTools: [\"Read\", \"Grep\", \"Glob\", \"Agent\"],\n  agents: {\n    \"code-tracer\": {\n      description: \"Traces one call path and returns a short summary with file:line refs\",\n      prompt: \"Investigate only the question given. Return <=20 lines: path, key functions, file:line.\",\n      tools: [\"Read\", \"Grep\", \"Glob\"],\n    },\n  },\n};\n```",
    keyConcept: "Delegar en subagentes aísla la salida verbosa de exploración del agente coordinador",
  },

  "E5-005": {
    question:
      "Una corrida de investigación de seis horas, con un coordinador y ocho subagentes, se cayó en la hora cuatro cuando el servidor se reinició. Todo el progreso estaba en memoria, así que la corrida empezó de cero. ¿Cómo deberías diseñar el sistema para que la próxima caída cueste minutos y no horas?",
    options: {
      A: "Cada agente exporta su estado a una ruta conocida; al reanudar, el coordinador carga un manifiesto en los prompts",
      B: "Confiar en reanudar la sesión del coordinador tras la caída, porque su transcripción contiene cada resultado devuelto",
      C: "Guardar cada hora el borrador del informe final y, al reanudar, dejar que todos los subagentes investiguen desde cero",
      D: "Correr dos copias idénticas del sistema completo en servidores distintos para que una sobreviva si la otra se cae",
    },
    explanation:
      "A es la correcta. La persistencia estructurada del estado hace explícita la recuperación: cada agente escribe su progreso (subtareas completadas, hallazgos, trabajo pendiente) en una ubicación conocida, y al reanudar el coordinador carga un manifiesto de esas exportaciones e inyecta el estado relevante en el prompt de cada agente, de modo que el trabajo sigue desde el último punto de control.\n\nB recupera solo los resultados que los subagentes ya habían devuelto; el trabajo en curso dentro de cada subagente se pierde, y recargar una transcripción de cuatro horas trae de vuelta sus problemas de contexto. C protege el texto del informe, pero descarta el progreso de cada agente, así que se repite casi toda la investigación. D duplica el costo y no ayuda cuando ambas copias fallan por la misma razón.\n\nCómo implementarlo:\n```json\n// state/manifest.json, rewritten by the coordinator after each checkpoint\n{\n  \"runId\": \"batt-2026-11-20\",\n  \"agents\": {\n    \"web-search\": { \"state\": \"state/web-search.json\", \"status\": \"done\" },\n    \"doc-analysis\": { \"state\": \"state/doc-analysis.json\", \"status\": \"in_progress\",\n                      \"completed\": 14, \"remaining\": [\"paper-15\", \"paper-16\"] }\n  }\n}\n```",
    keyConcept: "Recuperación ante caídas: los agentes exportan su estado y el coordinador carga un manifiesto al reanudar",
  },

  "E5-006": {
    question:
      "Tu sistema de extracción reporta 97% de precisión por campo en 50,000 documentos, y la dirección quiere eliminar la revisión humana de todas las salidas de alta confianza. Las facturas mecanografiadas son el 85% del volumen; los recibos manuscritos y los contratos de varias páginas son el resto. ¿Qué deberías hacer antes de reducir la revisión?",
    options: {
      A: "Aprobar el cambio, porque 97% supera la meta de 95% y las salidas de alta confianza son las más precisas de todas",
      B: "Medir la precisión por tipo de documento y por campo, y reducir la revisión solo en los segmentos que cumplan la meta",
      C: "Quitar la revisión solo de las facturas mecanografiadas, que son la mayoría, y mantener todo lo demás en revisión",
      D: "Reducir la revisión en todo durante una prueba de dos semanas y revertir si los equipos posteriores reportan más errores",
    },
    explanation:
      "B es la correcta. Una cifra agregada dominada por facturas mecanografiadas puede ocultar una precisión baja en recibos manuscritos o en campos específicos de los contratos. Validar la precisión por tipo de documento y por segmento de campo muestra dónde es seguro automatizar, y la revisión se reduce solo donde cada segmento cumple la meta.\n\nA confía en el agregado, que es justo la cifra que puede esconder un segmento que falla. C es una suposición sin datos por segmento; incluso las facturas mecanografiadas pueden tener un campo débil, como los identificadores fiscales. D usa las quejas posteriores como métrica, pero muchos errores de extracción pasan en silencio y nunca se reportan.\n\nCómo implementarlo:\n```python\nimport pandas as pd\ndf = pd.DataFrame(validation_rows)  # doc_type, field, correct (bool)\nseg = df.groupby([\"doc_type\", \"field\"])[\"correct\"].agg([\"mean\", \"count\"])\nsafe = seg[(seg[\"mean\"] >= 0.97) & (seg[\"count\"] >= 200)]\n# only (doc_type, field) pairs in `safe` may skip human review\n```",
    keyConcept: "La precisión agregada puede ocultar segmentos débiles; validar antes por tipo de documento y campo",
  },

  "E5-007": {
    question:
      "Cada llamada a lookup_order devuelve 45 campos (códigos de bodega, eventos de escaneo del transportista, indicadores de marketing y más). En conversaciones de devoluciones, el agente la llama de seis a ocho veces, y a mitad de la sesión esos resultados dominan el contexto, aunque solo importan order_id, items, purchase_date, status y return_eligible. ¿Cuál es la mejor corrección?",
    options: {
      A: "Pasar el agente a un modelo con una ventana de contexto más grande para que quepan todos los resultados en la sesión",
      B: "Recortar cada resultado de lookup_order a los campos relevantes para la devolución antes de agregarlo al contexto",
      C: "Indicarle al agente en el system prompt que ignore los campos irrelevantes cuando lea después los resultados",
      D: "Dejar los resultados fuera de la conversación por completo y hacer que el agente vuelva a llamar la herramienta cuando los necesite",
    },
    explanation:
      "B es la correcta. Los resultados de herramientas se acumulan en el contexto y consumen tokens de forma desproporcionada a su relevancia. Recortar cada resultado a los campos que la tarea necesita, antes de agregarlo, conserva los hechos importantes y quita el ruido, por ejemplo con un hook PostToolUse o un envoltorio de la herramienta.\n\nA deja 40 campos irrelevantes por llamada en el contexto; sube el costo sin hacer más fácil encontrar los campos importantes. C sigue enviando todos los campos en cada turno, así que los tokens y la distracción se mantienen. D obliga a repetir llamadas y pierde los hechos que el agente necesita entre turnos. (Las definiciones de herramientas son un costo aparte: Claude Code ya difiere los esquemas de herramientas MCP con tool search, activado por defecto; aquí el problema son los resultados.)\n\nCómo implementarlo:\n```typescript\nconst RETURN_FIELDS = [\"order_id\", \"items\", \"purchase_date\", \"status\", \"return_eligible\"] as const;\n\nfunction trimOrder(raw: Record<string, unknown>) {\n  return Object.fromEntries(RETURN_FIELDS.map(k => [k, raw[k]]));\n}\n// tool handler: return { content: [{ type: \"text\", text: JSON.stringify(trimOrder(raw)) }] };\n```",
    keyConcept: "Recortar las salidas verbosas de herramientas a los campos relevantes antes de que se acumulen",
  },

  "E5-008": {
    question:
      "Dos fuentes confiables no coinciden: una asociación de la industria reporta que la capacidad de reciclaje de baterías de la región en 2024 fue de 1.2 millones de toneladas, mientras que una agencia de gobierno reporta 0.8 millones para el mismo año y región. Hoy, el subagente de análisis de documentos conserva el valor con más citas y descarta el otro. ¿Qué debería hacer en su lugar?",
    options: {
      A: "Conservar la cifra del gobierno, porque las agencias públicas son más neutrales y por lo tanto la fuente con más autoridad",
      B: "Informar el promedio de ambos valores, 1.0 millones de toneladas, como una estimación que concilia las dos fuentes",
      C: "Quitar ambas cifras del análisis e indicar que no se encontraron datos confiables de capacidad 2024 para la región",
      D: "Incluir ambos valores con su fuente y marcar el conflicto para que el coordinador decida cómo conciliarlos",
    },
    explanation:
      "D es la correcta. Cuando fuentes confiables reportan estadísticas en conflicto, el análisis debe completarse con ambos valores incluidos y el conflicto anotado con la atribución de cada fuente, dejando la conciliación al coordinador, que puede revisar definiciones, alcance o metodología antes de la síntesis.\n\nA y B concilian de forma arbitraria: A elige un ganador por suposición y B inventa una cifra que ninguna fuente reportó. C descarta dos datos confiables y reporta un vacío que no existe. Igual que el diseño actual, las tres le ocultan al lector que las fuentes no coinciden.\n\nCómo implementarlo:\n```json\n{\n  \"metric\": \"battery recycling capacity, 2024, region X\",\n  \"values\": [\n    { \"value\": 1.2, \"unit\": \"Mt\", \"source\": \"Industry association report\", \"url\": \"https://...\", \"method\": \"member survey\" },\n    { \"value\": 0.8, \"unit\": \"Mt\", \"source\": \"Government agency statistics\", \"url\": \"https://...\", \"method\": \"permitted capacity\" }\n  ],\n  \"conflict\": true,\n  \"note\": \"Possible definitional difference: surveyed vs permitted capacity\"\n}\n```",
    keyConcept: "Anotar las estadísticas en conflicto con su fuente en lugar de elegir una",
  },

  "E5-009": {
    question:
      "Los revisores pueden verificar 300 de los 5,000 contratos que se extraen cada día. Algunos contratos tienen dos fechas de terminación distintas en cláusulas diferentes, y el modelo extrae una de ellas con alta confianza. ¿Qué regla de enrutamiento aprovecha mejor la capacidad limitada de revisión?",
    options: {
      A: "Elegir al azar 300 contratos cada día para que todos los documentos tengan la misma probabilidad de llegar a revisión",
      B: "Enviar a revisión los 300 contratos más largos, porque los documentos largos tienen más cláusulas y por ende más errores",
      C: "Priorizar los campos de baja confianza y los contratos con texto fuente contradictorio, como dos fechas de terminación",
      D: "Enrutar solo por puntuación de confianza, porque una confianza alta significa que el documento fuente no era ambiguo",
    },
    explanation:
      "C es la correcta. Con capacidad limitada, la revisión debe ir primero a las extracciones con baja confianza del modelo y a los documentos cuya fuente es ambigua o contradictoria. Detectar valores en conflicto en la fuente (dos fechas de terminación) atrapa casos que la puntuación de confianza no ve.\n\nA es una buena forma de medir tasas de error, que es una necesidad aparte, pero como única regla de enrutamiento gasta casi todo el tiempo de los revisores en documentos fáciles y correctos. B usa la longitud como indicador de riesgo sin evidencia de que prediga errores. D queda desmentida por el propio escenario: el modelo dio alta confianza a una de dos fechas en conflicto.\n\nCómo implementarlo:\n```python\ndef review_priority(doc):\n    score = 0\n    score += sum(1 for f in doc.fields if f.confidence < f.calibrated_threshold) * 2\n    score += 5 if doc.source_conflicts else 0   # e.g. two distinct termination dates found\n    return score\n\nqueue = sorted(today_docs, key=review_priority, reverse=True)[:300]\n```",
    keyConcept: "Enviar primero a la revisión limitada las extracciones de baja confianza o con fuentes contradictorias",
  },

  "E5-010": {
    question:
      "Un cliente le pide al agente que iguale el precio más bajo de un competidor en un televisor que compró la semana pasada. Tu política describe ajustes de precio cuando tu propio sitio baja el precio dentro de los 14 días posteriores a la compra, y no dice nada sobre precios de competidores. ¿Qué debe hacer el agente?",
    options: {
      A: "Aplicar la regla de ajuste de 14 días del propio sitio al precio del competidor, porque la intención de la política es parecida",
      B: "Rechazar con amabilidad, explicando que no se igualan precios de competidores porque la política no lo incluye",
      C: "Pedir una captura del precio del competidor y aprobar el ajuste si la compra está dentro de los 14 días",
      D: "Escalar a un humano, porque la política no dice nada sobre igualar a competidores y el caso requiere una decisión de política",
    },
    explanation:
      "D es la correcta. Un vacío de política es un disparador de escalamiento aunque el caso parezca sencillo: la política cubre ajustes del propio sitio, pero no dice nada sobre igualar a competidores, así que conceder o negar la solicitud sería una decisión de política que el agente no está autorizado a tomar.\n\nA y C extienden la política por analogía y comprometen a la empresa con una regla que nadie aprobó. B trata el silencio como una prohibición; negar también es una decisión de política, y puede contradecir lo que el negocio elegiría.\n\nCómo implementarlo (extracto del system prompt):\n```markdown\n## Escalate when policy is ambiguous or silent\nIf a request is not explicitly covered by the policy documents\n(e.g. competitor price matching when policy only covers our own\nprice drops), do not approve or deny it. Call escalate_to_human\nwith: the request, the closest policy section, and why it does not apply.\n```",
    keyConcept: "Escalar cuando la política es ambigua o no cubre la solicitud específica del cliente",
  },

  "E5-011": {
    question:
      "El agente de síntesis marca una \"contradicción\": una fuente dice que el 34% de los minoristas usa pronóstico de demanda con IA y otra dice que el 61%. Al revisar, la primera cifra viene de una encuesta de 2021 y la segunda de una de 2025, pero ninguna salida de subagente incluía la fecha. ¿Cómo deberías evitar este tipo de error?",
    options: {
      A: "Indicarle al agente de síntesis que prefiera la cifra más alta siempre que dos fuentes reporten la misma estadística",
      B: "Hacer que el agente de síntesis busque de nuevo en la web por cada conflicto para averiguar qué cifra es más reciente",
      C: "Dejar que el agente de síntesis descarte toda estadística en conflicto y conserve solo las cifras en que todas coinciden",
      D: "Exigir que los subagentes incluyan las fechas de publicación y de recolección de datos en la salida estructurada",
    },
    explanation:
      "D es la correcta. Sin fechas de publicación o de recolección de datos, un cambio en el tiempo parece una contradicción. Exigir que los subagentes incluyan esas fechas en su salida estructurada permite que el agente de síntesis lea 34% (2021) y 61% (2025) como una tendencia y no como un conflicto.\n\nA elige un valor por regla y oculta la dimensión temporal. B parcha el síntoma con viajes extra para obtener información que los subagentes ya tenían al leer las fuentes. C descarta datos válidos, y aquí borraría justo la tendencia que el informe debería mostrar.\n\nCómo implementarlo:\n```typescript\ninterface DatedClaim {\n  claim: string;            // \"34% of retailers use AI demand forecasting\"\n  sourceUrl: string;\n  publishedAt: string;      // \"2021-06-01\"\n  dataCollectedAt?: string; // \"2021-Q1\"\n}\n// Synthesis rule: compare values only within the same collection period;\n// otherwise report them as a time series.\n```",
    keyConcept: "Exigir fechas de publicación y recolección para que las diferencias temporales no se lean como contradicciones",
  },

  "E5-012": {
    question:
      "Tu subagente de búsqueda web se topa a menudo con timeouts de red breves que funcionan al segundo intento. Hoy reenvía cada timeout al coordinador, que gasta un turno decidiendo reintentar cada uno. De vez en cuando, una fuente devuelve 403 Forbidden, que ningún reintento corrige. ¿Cómo debe manejar las fallas el subagente?",
    options: {
      A: "Reenviar todas las fallas, incluido cada timeout, para que el coordinador mantenga visibilidad total de lo que pasa",
      B: "Reintentar localmente los timeouts transitorios y propagar solo los errores sin resolver, como el 403, con contexto",
      C: "Reintentar localmente cada falla hasta que funcione, incluidos los 403, para que el coordinador nunca maneje errores",
      D: "Tratar un 403 como un resultado vacío para que la corrida siga, y reintentar los timeouts una vez antes de rendirse en silencio",
    },
    explanation:
      "B es la correcta. Los subagentes deben recuperarse localmente de las fallas transitorias y propagar solo los errores que no pueden resolver, junto con lo que intentaron y los resultados parciales. El coordinador deja de gastar turnos en reintentos rutinarios y aun así recibe el contexto que necesita para el 403 (probar otra fuente o marcar un vacío de cobertura).\n\nA inunda al coordinador con decisiones que el subagente puede tomar solo. C reintenta un error permanente que nunca va a funcionar, pierde tiempo y se lo oculta al coordinador. D suprime errores en silencio: un 403 informado como \"sin resultados\" parece una búsqueda vacía exitosa.\n\nCómo implementarlo:\n```typescript\nasync function fetchWithRecovery(url: string) {\n  for (let attempt = 1; attempt <= 3; attempt++) {\n    const r = await fetchSource(url);\n    if (r.ok) return { ok: true, data: r.data };\n    if (r.kind !== \"timeout\") {\n      return { ok: false, failureType: r.kind, url, attempts: attempt,\n               partialResults: r.partial ?? [], alternatives: [\"search cached copy\"] };\n    }\n    await sleep(500 * attempt); // transient: handle locally\n  }\n  return { ok: false, failureType: \"timeout\", url, attempts: 3, partialResults: [] };\n}\n```",
    keyConcept: "Recuperar localmente las fallas transitorias y propagar solo los errores sin resolver, con contexto",
  },

  "E1-013": {
    question:
      "Una canalización de integración continua usa Claude Code para revisar pull requests. El prompt de sistema dice que el agente debe ejecutar la batería de pruebas antes de publicar cualquier comentario de revisión, pero aproximadamente una ejecución de cada veinte publica el comentario primero. El equipo necesita que el orden se cumpla siempre. ¿Qué debe implementar?",
    options: {
      A: "Un prompt de sistema más contundente, «CRÍTICO: ejecuta las pruebas antes de comentar», copiado también en CLAUDE.md",
      B: "Un nivel de esfuerzo más bajo, para que el modelo siga la instrucción más al pie de la letra e improvise menos",
      C: "Un hook PreToolUse que bloquee la herramienta de comentar hasta que la de pruebas haya pasado en esta sesión",
      D: "Una sola herramienta combinada que ejecute todas las pruebas y publique el comentario en una única llamada",
    },
    explanation:
      "Cuando el cumplimiento tiene que ser determinista, el prompt es la capa equivocada. Un prompt es una instrucción probabilística: tiene una tasa de fallo distinta de cero, que es justo ese uno de cada veinte. Un hook PreToolUse es código de la aplicación que inspecciona la llamada pendiente y la rechaza si no se cumple el prerrequisito, así que la tasa de fallo es cero por construcción.\n\nLa opción A cambia la redacción, no el mecanismo. La opción B confunde esfuerzo con obediencia: el esfuerzo ajusta la profundidad del razonamiento, no el seguimiento de reglas. La opción D funcionaría para este par de pasos, pero quita la posibilidad de ejecutar pruebas sin comentar y esconde los fallos: si las pruebas fallan, la herramienta combinada igual tiene que decidir qué publica.\n\nCómo implementarlo:\n```typescript\nlet testsPassed = false;\nconst hooks = {\n  PreToolUse: [{ matcher: \"post_review_comment\", hooks: [async () => testsPassed ? {} : {\n    hookSpecificOutput: { hookEventName: \"PreToolUse\", permissionDecision: \"deny\",\n      permissionDecisionReason: \"Run the test suite first; commenting is gated on a green run.\" } }] }],\n  PostToolUse: [{ matcher: \"run_tests\", hooks: [async (input: any) => {\n    testsPassed = input.tool_response?.exitCode === 0; return {}; }] }],\n};\n```",
    keyConcept: "El prompt para preferencias, los hooks para garantías: un prerrequisito va en código",
  },

  "E1-014": {
    question:
      "Un agente de extracción obtiene registros de tres servidores MCP. Uno devuelve las fechas como marcas de tiempo Unix, otro como cadenas ISO 8601 y el tercero como DD/MM/AAAA. El agente ordena mal los registros una y otra vez porque compara los tres formatos como si fueran iguales. ¿Cuál es la solución más confiable?",
    options: {
      A: "Describir los tres formatos en el prompt de sistema e indicarle al modelo que los convierta antes de comparar",
      B: "Subir el nivel de esfuerzo para que el modelo razone con más cuidado cada fecha antes de compararlas",
      C: "Un hook PostToolUse que reescriba cada campo de fecha a ISO 8601 antes de que el modelo vea el resultado",
      D: "Pedirles a los dueños de los tres servidores MCP que acuerden un solo formato de fecha para todas sus respuestas",
    },
    explanation:
      "Los hooks PostToolUse interceptan el resultado de una herramienta en su camino de vuelta y pueden transformarlo antes de que lo vea el modelo. Normalizar ahí los tres formatos hace que el modelo reciba siempre una sola forma, así que la comparación deja de ser un problema de razonamiento y pasa a ser un problema de datos resuelto una vez, en código. (En el SDK actual el hook reemplaza la salida con `updatedToolOutput`; el campo anterior, `updatedMCPToolOutput`, solo cubre herramientas MCP).\n\nLa opción A traslada una conversión mecánica al razonamiento del modelo, donde cuesta tokens en cada registro y aun así falla a veces. La opción B es la misma apuesta con más presupuesto. La opción D es limpia en principio, pero rara vez está disponible: casi nunca controlas tres servidores de terceros, y una cuarta fuente traería el problema de vuelta.\n\nCómo implementarlo:\n```typescript\nconst normalizeDates: HookCallback = async (input) => {\n  const out = (input as PostToolUseHookInput).tool_response as Record<string, unknown>;\n  return { hookSpecificOutput: { hookEventName: \"PostToolUse\", updatedToolOutput: toIsoDates(out) } };\n};\n// options.hooks = { PostToolUse: [{ matcher: \"^mcp__\", hooks: [normalizeDates] }] }\n```",
    keyConcept: "Los hooks PostToolUse normalizan formatos heterogéneos antes de que el modelo los vea",
  },

  "E1-015": {
    question:
      "Ayer un ingeniero usó una sesión con nombre para analizar el módulo de pagos y acordó con el agente un plan de refactorización. Durante la noche, un colega reescribió la mayor parte de ese módulo. El ingeniero quiere continuar hoy. ¿Cuál es la forma más confiable de retomarlo?",
    options: {
      A: "Reanudar la sesión con --resume; el agente notará que los archivos cambiaron y los volverá a leer",
      B: "Empezar de cero con un resumen estructurado de lo concluido ayer, porque los resultados viejos caducaron",
      C: "Usar fork_session para bifurcar la sesión de ayer y continuar la refactorización en la rama nueva",
      D: "Reanudar la sesión y subir el nivel de esfuerzo para que el agente revise cada archivo antes de actuar",
    },
    explanation:
      "Una sesión reanudada arrastra sus resultados de herramientas viejos, y esos son lecturas de código que ya se reescribió. El agente razonará sobre ese contenido desactualizado salvo que algo lo obligue a releer, y nada lo hace automáticamente. Empezar de cero con un resumen estructurado conserva lo que sigue siendo cierto (las conclusiones y el plan) y descarta lo que no (el contenido de los archivos).\n\nLa regla de decisión: reanuda cuando el contexto previo es mayormente válido; empieza de cero con un resumen inyectado cuando los resultados previos quedaron desactualizados. Aquí cambió la mayor parte del módulo. La opción A supone una relectura automática que no ocurre. La opción C copia el mismo historial desactualizado a una rama. La opción D gasta más razonamiento en entradas viejas, y eso no las actualiza.",
    keyConcept: "Con la mayoría de los resultados previos desactualizados, empezar de cero con un resumen en vez de reanudar",
  },

  "E1-016": {
    question:
      "Tu coordinador siempre ejecuta la canalización completa (búsqueda web, análisis de documentos, síntesis e informe) para cada consulta. Con preguntas amplias funciona bien, pero «¿En qué año se publicó el artículo del transformer?» tarda cuatro minutos y devuelve un informe de varias páginas. ¿Cómo debería cambiar el coordinador?",
    options: {
      A: "Dividir el sistema en dos productos separados, uno para datos rápidos y otro para informes completos",
      B: "Poner delante un enrutador por palabras clave que mande cualquier pregunta de menos de 15 palabras a un solo agente",
      C: "Mantener la canalización completa y pedirle a cada subagente que termine más rápido cuando la pregunta parezca simple",
      D: "Hacer que el coordinador evalúe qué necesita cada consulta e invoque solo los subagentes que de verdad requiere",
    },
    explanation:
      "Decidir qué subagentes invocar según la complejidad de la consulta es parte del trabajo del coordinador. Una pregunta factual simple puede necesitar una sola búsqueda; un tema amplio necesita toda la canalización con refinamiento iterativo. Poner ese criterio en el coordinador mantiene un solo sistema que ajusta el esfuerzo a la pregunta.\n\nLa opción A duplica el sistema y les pasa a los usuarios la decisión de enrutar. La opción B reemplaza el criterio por un indicador frágil: una pregunta corta puede ser profunda y una larga, trivial. La opción C sigue pagando todas las etapas en cada consulta y solo le pide a cada una que se apure.",
    keyConcept: "El coordinador elige dinámicamente los subagentes en vez de correr siempre toda la canalización",
  },

};
