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
      "`error_max_turns` es un subtipo de ResultMessage que indica que la ejecución agéntica alcanzó el número máximo de turnos configurado (no un límite de tokens ni un fallo de red). La tarea no se completó. La respuesta correcta es inspeccionar qué se logró, potencialmente aumentar el límite de turnos o rediseñar el flujo para completarse en menos pasos. Se distingue de `error_max_budget_usd` (límite de costo) y `error_during_execution` (excepción en tiempo de ejecución).\n\nComo implementarlo:\n```typescript\n// Handling error_max_turns in a Node.js orchestration loop\nimport Anthropic from \"@anthropic-ai/sdk\";\n\nconst client = new Anthropic();\n\nasync function runWithRetry(prompt: string, maxTurns = 20) {\n  const result = await client.beta.messages.create({\n    model: \"claude-opus-4-6\",\n    max_tokens: 4096,\n    // @ts-ignore – SDK typings may vary\n    max_turns: maxTurns,\n    messages: [{ role: \"user\", content: prompt }],\n  });\n\n  if (result.stop_reason === \"error_max_turns\") {\n    console.warn(`Agent hit turn limit (${maxTurns}). Inspecting transcript…`);\n    // Inspect last assistant message to find partial progress\n    const lastMsg = result.messages?.at(-1);\n    console.log(\"Last message:\", lastMsg?.content);\n    // Retry with a higher limit or redesigned workflow\n    return runWithRetry(prompt, maxTurns * 2);\n  }\n\n  return result;\n}\n```\n\nPara aumentar el límite de turnos desde la CLI:\n```bash\nclaude --max-turns 50 \"Analyze all 200 documents and produce a summary\"\n```",
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
      "`error_max_budget_usd` significa que se alcanzó el límite máximo de costo en USD acumulado. La transcripción de la sesión (disponible en el ResultMessage o mediante --output-format stream-json) contiene todas las llamadas a herramientas y sus resultados, lo que permite al operador identificar el último documento procesado. No existe ningún endpoint `/sessions` de costos ni un flag `stop_reason_detail`. Volver a ejecutar desde el principio desperdiciaría el trabajo ya completado.\n\nComo implementarlo:\n```bash\n# Stream JSON events to a file for later inspection\nclaude --output-format stream-json \\\n  --max-budget-usd 2.00 \\\n  \"Process all 200 documents\" > session-transcript.jsonl\n\n# Parse transcript to find last successfully processed doc\nnode -e \"\nconst lines = require('fs').readFileSync('session-transcript.jsonl','utf8').trim().split('\\n');\nconst toolResults = lines\n  .map(l => JSON.parse(l))\n  .filter(e => e.type === 'tool_result');\nconsole.log('Last tool result:', toolResults.at(-1));\n\"\n```\n\n```typescript\n// Programmatic budget-aware pipeline with checkpoint resumption\nasync function processBatch(docs: string[], budgetUsd: number) {\n  const result = await runHeadless({ docs, maxBudgetUsd: budgetUsd });\n  if (result.stop_reason === \"error_max_budget_usd\") {\n    const lastProcessed = extractLastProcessedDoc(result.transcript);\n    console.log(`Processed up to doc: ${lastProcessed}. Resume from next.`);\n    await saveCheckpoint(lastProcessed);\n  }\n}\n```",
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
      "`bypassPermissions` desactiva todas las verificaciones de permisos, permitiendo al agente realizar ediciones de archivos, comandos de shell y otras acciones sin ningún aviso de confirmación. Este es el modo apropiado para pipelines de CI/CD completamente automatizados que se ejecutan en entornos de confianza y aislados. `acceptEdits` solo suprime los avisos de edición de archivos. `plan` muestra un plan anticipado pero aún requiere aprobación. `dontAsk` no es un modo de permiso estándar de Claude Code.\n\nComo implementarlo:\n```bash\n# CI/CD pipeline step — run fully autonomously inside a sandboxed runner\nclaude --permission-mode bypassPermissions \\\n  --output-format stream-json \\\n  \"Run eslint --fix on all TypeScript files, then run npm test, then commit changes\"\n```\n\n```typescript\n// SDK usage with bypassPermissions\nimport { query } from \"@anthropic-ai/claude-code\";\n\nconst result = await query({\n  prompt: \"Apply lint fixes and run tests\",\n  options: {\n    permissionMode: \"bypassPermissions\", // Only in sandboxed/trusted envs\n  },\n});\n```\n\n```yaml\n# GitHub Actions example\n- name: Claude Code Auto-Fix\n  run: |\n    claude --permission-mode bypassPermissions \\\n      \"Fix all eslint errors and run npm test\"\n  env:\n    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}\n```",
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
      "El modo de permiso `plan` está diseñado específicamente para este flujo de trabajo: Claude genera el plan de ejecución completo (todas las llamadas a herramientas previstas) y lo presenta al usuario antes de ejecutar cualquier acción. El usuario puede revisar y cancelar antes de que se realice cualquier cambio. `default` pregunta por cada llamada a herramienta pero no ofrece una vista general anticipada. `acceptEdits` aprueba automáticamente los cambios de archivos sin un plan previo. `bypassPermissions` ejecuta todo sin ninguna confirmación.\n\nComo implementarlo:\n```bash\n# Interactive session: show plan before executing refactor\nclaude --permission-mode plan \\\n  \"Refactor all React class components to functional components with hooks\"\n# Claude will print something like:\n# Plan:\n# 1. Read src/components/Header.tsx\n# 2. Edit src/components/Header.tsx (convert class → function)\n# 3. Read src/components/Footer.tsx\n# ...\n# Proceed? (y/n)\n```\n\n```typescript\n// SDK — plan mode returns the plan for programmatic review\nimport { query } from \"@anthropic-ai/claude-code\";\n\nconst result = await query({\n  prompt: \"Refactor class components\",\n  options: { permissionMode: \"plan\" },\n});\n// Inspect result.plan before approving\nconsole.log(result.plan);\n```",
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
      "En el framework agéntico de Claude Code, los subagentes definidos mediante AgentDefinition no pueden crear sus propios subagentes — la herramienta `Agent` (o su predecesora `Task`) no está permitida en el allowedTools de un subagente. Esta es una restricción arquitectónica deliberada que evita el lanzamiento recursivo ilimitado y mantiene el grafo de orquestación manejable. La opción C es engañosa: en v2.1.63 la herramienta fue renombrada de `Task` a `Agent`, no deprecada. La opción D describe un mecanismo de delegación inexistente.\n\nComo implementarlo:\n```typescript\n// Correct AgentDefinition — subagent tools must NOT include \"Agent\"\nconst summarizerAgent = {\n  name: \"summarizer\",\n  description: \"Summarizes a single document section\",\n  allowedTools: [\"Read\", \"Grep\"], // ✅ No \"Agent\" tool here\n  systemPrompt: \"You summarize text. You do not spawn subagents.\",\n};\n\n// Top-level orchestrator CAN include \"Agent\" tool\nconst orchestrator = {\n  name: \"orchestrator\",\n  allowedTools: [\"Agent\", \"Read\", \"Write\"], // ✅ Agent tool at top level only\n};\n```\n\n```jsonc\n// .claude/agents/summarizer.json\n{\n  \"name\": \"summarizer\",\n  \"allowedTools\": [\"Read\", \"Grep\"],\n  // \"Agent\" intentionally omitted — subagents cannot spawn subagents\n  \"systemPrompt\": \"Summarize the provided document section.\"\n}\n```",
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
      "En Claude Code v2.1.63, la herramienta `Task` fue renombrada a `Agent`. Cualquier AgentDefinition que antes listara `\"Task\"` en allowedTools para permitir el lanzamiento de subagentes debe actualizarse a `\"Agent\"`. La funcionalidad es idéntica; solo cambió el nombre. No existe ningún nombre de herramienta `Spawn` o `SubAgent`, y el lanzamiento de subagentes no es automático.\n\nComo implementarlo:\n```jsonc\n// Before v2.1.63 (old — broken after upgrade)\n{\n  \"allowedTools\": [\"Task\", \"Read\", \"Write\"]\n}\n\n// After v2.1.63 (correct)\n{\n  \"allowedTools\": [\"Agent\", \"Read\", \"Write\"]\n}\n```\n\n```bash\n# Quick migration: find all AgentDefinition configs using old \"Task\" name\ngrep -r '\"Task\"' .claude/agents/ --include=\"*.json\"\n\n# Replace in all agent config files\nsed -i 's/\"Task\"/\"Agent\"/g' .claude/agents/*.json\n\n# Verify\ngrep -r 'allowedTools' .claude/agents/\n```",
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
      "Por diseño, los subagentes devuelven solo su resultado final (un resumen de texto o salida estructurada) al orquestador padre. Las llamadas a herramientas intermedias, los pasos de razonamiento y las salidas parciales dentro de la ejecución del subagente no se propagan de vuelta. Esto es intencional: mantiene la ventana de contexto del coordinador manejable y refuerza límites claros entre agentes. No existe ningún endpoint `get_subagent_logs` ni clave `subagent_transcript` en el contexto del padre.\n\nComo implementarlo:\n```typescript\n// Coordinator spawning a subagent — only receives final result\nimport { query } from \"@anthropic-ai/claude-code\";\n\nconst coordinatorResult = await query({\n  prompt: `\n    Use the Agent tool to analyze all 200 documents in /data/.\n    Return only: total count, top 3 themes, and any anomalies.\n  `,\n  // Coordinator receives a short summary — not the 200-step transcript\n});\n\nconsole.log(coordinatorResult.result); // Short final summary only\n```\n\n```typescript\n// If you need detailed logs from subagents, write them to disk inside the subagent\n// Subagent system prompt:\nconst subagentPrompt = `\nAnalyze the documents. After each document, append a JSON line to /tmp/agent-log.jsonl.\nAt the end, return a concise summary.\n`;\n// Coordinator can then Read /tmp/agent-log.jsonl if needed\n```",
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
      "Los subagentes operan en ventanas de contexto independientes. NO reciben el system prompt ni el historial de conversación del orquestador padre. Solo reciben lo que se incluye explícitamente en la descripción de la tarea que se pasa a la herramienta Agent. Si las reglas de escalación son críticas para el subagente, deben incluirse explícitamente en ese prompt de tarea. No existe ningún flag `share_context` ni herencia automática del system prompt.\n\nComo implementarlo:\n```typescript\n// BAD — subagent won't see coordinator's system prompt with escalation rules\nconst bad = await query({\n  prompt: \"Use Agent tool to handle ticket #1234\", // subagent gets no escalation rules!\n});\n\n// GOOD — explicitly include required rules in the subagent task description\nconst ESCALATION_RULES = `\nEscalation rules:\n- Billing issues over $500 must be escalated to billing-team@company.com\n- Security complaints must be escalated immediately to security@company.com\n- All other issues: attempt resolution, escalate after 2 failed attempts\n`;\n\nconst good = await query({\n  prompt: `\n    Use the Agent tool with this task:\n    \"Handle support ticket #1234. ${ESCALATION_RULES}\"\n  `,\n});\n```\n\n```markdown\n<!-- Alternative: put shared rules in .claude/CLAUDE.md so all subagents get them -->\n<!-- .claude/CLAUDE.md -->\n## Escalation Rules\n- Billing > $500 → billing-team@company.com\n- Security issues → security@company.com immediately\n```",
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
      "Los subagentes reciben el CLAUDE.md del directorio del proyecto en el que operan — esto se inyecta automáticamente desde disco, tal como ocurre en cualquier sesión de Claude Code en ese directorio. Esto es independiente de la conversación del padre. Lo que los subagentes NO reciben es el system prompt ni el historial de conversación del padre. La inyección de CLAUDE.md está basada en el directorio, no se hereda del padre, y no requiere ningún flag explícito.\n\nComo implementarlo:\n```markdown\n<!-- .claude/CLAUDE.md (project root) -->\n<!-- This file is automatically injected into ALL subagents operating in this directory -->\n\n## Coding Standards\n- Use TypeScript strict mode\n- All functions must have explicit return types\n- No `any` types\n\n## Security Rules\n- Never log secrets or API keys\n- All SQL must use parameterized queries\n```\n\n```bash\n# Verify what a subagent will see by checking project CLAUDE.md\ncat .claude/CLAUDE.md\n\n# Check for subdirectory-specific rules (also auto-injected for that dir)\nfind . -name \"CLAUDE.md\" -not -path \"*/node_modules/*\"\n```\n\n```typescript\n// Subagent operating in /project/src/ will receive:\n// 1. /project/.claude/CLAUDE.md (project root)\n// 2. /project/src/.claude/CLAUDE.md (if it exists)\n// It will NOT receive the parent coordinator's system prompt\n```",
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
      "Un `SystemMessage` con `subtype: \"compact_boundary\"` señala que Claude Code está a punto de compactar el contexto. Después de la compactación, el historial de conversación se resume (compresión con pérdida), pero CLAUDE.md se reinyecta desde disco y se preserva completamente — nunca forma parte del historial compactado. Sin embargo, cualquier instrucción dada solo en la conversación (no en CLAUDE.md) puede perderse después de la compactación. Los permisos de herramienta no se ven afectados por la compactación.\n\nComo implementarlo:\n```typescript\n// Listen for compact_boundary events in stream-json output\nimport { execSync } from \"child_process\";\n\n// Run with streaming and pipe through parser\n// $ claude --output-format stream-json \"Migrate 500 files\" | node parser.js\n\nprocess.stdin.setEncoding(\"utf8\");\nprocess.stdin.on(\"data\", (chunk: string) => {\n  for (const line of chunk.split(\"\\n\").filter(Boolean)) {\n    const event = JSON.parse(line);\n    if (event.type === \"system\" && event.subtype === \"compact_boundary\") {\n      console.log(\"Compaction imminent — saving critical state to CLAUDE.md...\");\n      // Write any critical state to CLAUDE.md before compaction completes\n    }\n  }\n});\n```\n\n```bash\n# Use PreCompact hook to save state before compaction\n# .claude/hooks/pre-compact.sh\n#!/bin/bash\necho \"## Current Progress (auto-saved before compaction)\" >> .claude/CLAUDE.md\necho \"Files processed: $(cat .progress/count.txt)\" >> .claude/CLAUDE.md\nexit 0\n```",
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
      "`error_during_execution` significa que ocurrió una excepción mientras el agente estaba en ejecución — potencialmente después de que varias llamadas a herramientas ya habían tenido éxito. Reintentar ciegamente puede causar escrituras duplicadas, envíos dobles u otros efectos secundarios. Un reintento seguro requiere idempotencia en las herramientas externas, lógica de reintento con conciencia de puntos de control que reanude desde el último paso exitoso, o un mecanismo de reversión completo. Claude Code no revierte automáticamente los efectos secundarios.\n\nComo implementarlo:\n```typescript\n// Idempotency-safe retry using a checkpoint file\nasync function runWithCheckpoint(items: string[]) {\n  const checkpointPath = \"./.checkpoint.json\";\n  let checkpoint = { lastIndex: -1 };\n\n  try {\n    checkpoint = JSON.parse(fs.readFileSync(checkpointPath, \"utf8\"));\n  } catch { /* no checkpoint yet */ }\n\n  const remaining = items.slice(checkpoint.lastIndex + 1);\n\n  const result = await query({\n    prompt: `Process these items (already processed up to index ${checkpoint.lastIndex}): ${remaining.join(\", \")}`,\n  });\n\n  if (result.stop_reason === \"error_during_execution\") {\n    // Save progress before retrying\n    const lastSuccess = extractLastSuccessIndex(result);\n    fs.writeFileSync(checkpointPath, JSON.stringify({ lastIndex: lastSuccess }));\n    console.log(`Saved checkpoint at index ${lastSuccess}. Safe to retry.`);\n  }\n}\n```\n\n```bash\n# Make downstream tools idempotent using upsert patterns\n# Instead of INSERT, use INSERT ... ON CONFLICT DO NOTHING\n# Instead of creating files, check existence first\nif [ ! -f \"output/$ID.json\" ]; then\n  process_item \"$ID\"\nfi\n```",
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
      "El parámetro `effort` controla cuánto razonamiento interno y exploración realiza el modelo. `low` es apropiado para tareas sencillas como resumir documentos cortos, donde la sobrecarga del razonamiento extendido desperdiciaría tokens y dinero. `max` es para tareas altamente complejas que requieren análisis profundo. `high` es para tareas de producción que necesitan un razonamiento exhaustivo. `medium` es un valor predeterminado sensato pero no óptimo para trabajo explícitamente simple y sensible al costo.\n\nComo implementarlo:\n```bash\n# CLI: set effort level for a non-interactive run\nclaude --effort low --output-format stream-json \\\n  \"Summarize each of these 10 documents in 2 sentences\"\n\n# For complex architectural analysis, use max\nclaude --effort max \\\n  \"Analyze this codebase for security vulnerabilities and suggest fixes\"\n```\n\n```typescript\n// SDK: effort parameter in API call\nconst result = await client.messages.create({\n  model: \"claude-opus-4-6\",\n  max_tokens: 1024,\n  thinking: { type: \"enabled\", budget_tokens: 500 }, // low effort = low budget\n  messages: [{ role: \"user\", content: \"Summarize this document: ...\" }],\n});\n\n// effort: \"max\" maps to higher thinking budget\nconst complexResult = await client.messages.create({\n  model: \"claude-opus-4-6\",\n  max_tokens: 4096,\n  thinking: { type: \"enabled\", budget_tokens: 10000 }, // max effort\n  messages: [{ role: \"user\", content: \"Deeply analyze this architecture...\" }],\n});\n```",
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
      "El protocolo MCP distingue dos capas de error: `isError: true` en un resultado de herramienta es un error semántico visible para el LLM — Claude lo recibe en su contexto y puede razonar sobre él, decidir reintentar o tomar acción correctiva. Un error JSON-RPC en la capa de transporte (por ejemplo, el servidor es inaccesible, JSON malformado) es un fallo de transporte que el cliente MCP maneja antes de que el modelo vea nada. Confundir estos lleva a un manejo deficiente de errores: los errores de transporte requieren reintento a nivel de infraestructura, mientras que los resultados con `isError` requieren razonamiento a nivel del modelo.\n\nComo implementarlo:\n```typescript\n// MCP server: return isError:true for LLM-visible application errors\nimport { Server } from \"@modelcontextprotocol/sdk/server/index.js\";\n\nserver.setRequestHandler(CallToolRequestSchema, async (request) => {\n  if (request.params.name === \"query_database\") {\n    try {\n      const rows = await db.query(request.params.arguments.sql);\n      return { content: [{ type: \"text\", text: JSON.stringify(rows) }] };\n    } catch (err) {\n      // SQL timeout — LLM-visible: Claude can reason about this\n      return {\n        isError: true,\n        content: [{ type: \"text\", text: `SQL timeout: ${err.message}` }],\n      };\n    }\n  }\n});\n\n// MCP client: handle JSON-RPC transport errors separately\ntry {\n  const result = await mcpClient.callTool(\"query_database\", { sql: \"SELECT...\" });\n  if (result.isError) {\n    // Forward to model — let Claude decide what to do\n    return result;\n  }\n} catch (transportErr) {\n  // JSON-RPC transport failure — handle at infra level, don't forward to model\n  await retryWithBackoff(() => mcpClient.callTool(...));\n}\n```",
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
      "La especificación MCP identifica tres tipos de transporte: HTTP (Streamable HTTP, recomendado para servidores desplegados en red), SSE (deprecado, en proceso de eliminación) y stdio (para servidores basados en procesos locales). SSE ha sido reemplazado por Streamable HTTP, que admite tanto streaming como patrones estándar de solicitud/respuesta. stdio es para procesos lanzados localmente, no para servidores en red. WebSocket y gRPC no son tipos de transporte MCP.\n\nComo implementarlo:\n```bash\n# Add an HTTP (Streamable HTTP) MCP server\nclaude mcp add --transport http my-production-api https://api.example.com/mcp\n\n# Add a local stdio MCP server\nclaude mcp add --transport stdio local-tool -- node /path/to/server.js\n\n# List all configured servers and their transports\nclaude mcp list\n```\n\n```json\n// .mcp.json — HTTP transport for network server\n{\n  \"mcpServers\": {\n    \"my-api\": {\n      \"transport\": \"http\",\n      \"url\": \"https://api.example.com/mcp\",\n      \"headers\": {\n        \"Authorization\": \"Bearer ${API_TOKEN}\"\n      }\n    },\n    \"local-tool\": {\n      \"command\": \"node\",\n      \"args\": [\"/path/to/mcp-server.js\"]\n    }\n  }\n}\n```",
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
      "La precedencia de alcance MCP sigue una jerarquía estricta: local > proyecto > usuario. Una configuración local (almacenada en el directorio `.claude/` de configuración local) anula tanto el `.mcp.json` a nivel de proyecto como el `~/.claude.json` a nivel de usuario. Esto refleja cómo funcionan la mayoría de los sistemas de capas de configuración — las configuraciones más específicas y cercanas al código tienen precedencia sobre los valores predeterminados más amplios. El orden es determinístico, no dependiente del sistema de archivos.\n\nComo implementarlo:\n```bash\n# User-level config (~/.claude.json) — applies to all projects\nclaude mcp add --scope user shared-tool -- node ~/tools/shared-mcp.js\n\n# Project-level config (.mcp.json in repo root) — applies to all team members\nclaude mcp add --scope project team-db -- node ./scripts/db-mcp.js\n\n# Local override (.claude/ local settings) — overrides project & user for this machine\nclaude mcp add --scope local my-override -- node ./local-dev-server.js\n```\n\n```jsonc\n// Precedence example: same server \"analytics\" defined in multiple scopes\n// ~/.claude.json (user scope) — lowest priority\n{ \"mcpServers\": { \"analytics\": { \"url\": \"https://prod.analytics.com/mcp\" } } }\n\n// .mcp.json (project scope) — overrides user\n{ \"mcpServers\": { \"analytics\": { \"url\": \"https://staging.analytics.com/mcp\" } } }\n\n// .claude/settings.local.json (local scope) — wins\n{ \"mcpServers\": { \"analytics\": { \"url\": \"http://localhost:3001/mcp\" } } }\n```",
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
      "Los esquemas de herramientas MCP se inyectan en cada solicitud para cada servidor conectado. Con 12 servidores MCP, cada uno potencialmente definiendo entre 5 y 20 herramientas con esquemas de parámetros, descripciones y definiciones de tipos, la sobrecarga acumulada de tokens antes de que se procese cualquier contenido del usuario puede ser de miles de tokens. Esta es una consideración arquitectónica crítica: reduce el número de servidores MCP activos, usa la activación de ToolSearch o limita los servidores activos a los necesarios para la tarea actual.\n\nComo implementarlo:\n```bash\n# Check how many tools are loaded (and their approximate token footprint)\nclaude mcp list\n\n# Disable servers not needed for current task\nclaude mcp disable analytics-server\nclaude mcp disable legacy-crm-server\n\n# Force-enable ToolSearch to reduce per-request schema overhead\nexport ENABLE_TOOL_SEARCH=1\nclaude \"Research the codebase and summarize architecture\"\n\n# Or disable specific servers inline via --disabledMcpServers flag\nclaude --disabledMcpServers \"server1,server2\" \"Your task here\"\n```\n\n```json\n// .mcp.json — only include servers needed for this project role\n{\n  \"mcpServers\": {\n    \"file-ops\": { \"command\": \"node\", \"args\": [\"./mcp/file-ops.js\"] },\n    \"git-tools\": { \"command\": \"node\", \"args\": [\"./mcp/git.js\"] }\n    // Intentionally excluded: analytics, crm, reporting, etc.\n  }\n}\n```",
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
      "ToolSearch es un mecanismo de gestión de contexto que se activa cuando la utilización de la ventana de contexto supera aproximadamente el 10%, ayudando al modelo a priorizar qué herramientas incluir en el conjunto de trabajo. Puede forzarse independientemente de la utilización usando la variable de entorno `ENABLE_TOOL_SEARCH`. Esto es importante cuando tienes muchos servidores MCP y quieres reducir el consumo de tokens por solicitud debida a la inyección de esquemas. No tiene un umbral configurable mediante `TOOL_SEARCH_THRESHOLD`.\n\nComo implementarlo:\n```bash\n# Force-enable ToolSearch regardless of context utilization\nexport ENABLE_TOOL_SEARCH=1\n\n# Then run Claude Code normally — it will use ToolSearch from the start\nclaude \"Analyze the database schema and suggest optimizations\"\n\n# In a CI environment\nENABLE_TOOL_SEARCH=1 claude --output-format stream-json \"Process documents\"\n```\n\n```yaml\n# GitHub Actions — enable ToolSearch for high-MCP-server-count runs\njobs:\n  claude-analysis:\n    steps:\n      - name: Run Claude with ToolSearch\n        env:\n          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}\n          ENABLE_TOOL_SEARCH: \"1\"\n        run: claude --output-format stream-json \"Analyze codebase\"\n```",
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
      ".mcp.json admite dos sintaxis de expansión de variables: `${VAR}` para sustitución simple y `${VAR:-default}` para sustitución con un valor de respaldo cuando la variable no está definida o está vacía. La notación `:-` está tomada de la expansión de parámetros del shell POSIX. Los operadores al estilo JavaScript (`||`, `??`) no están soportados. No hay sintaxis ternaria con `?` en la expansión de variables de .mcp.json.\n\nComo implementarlo:\n```json\n{\n  \"mcpServers\": {\n    \"my-service\": {\n      \"command\": \"node\",\n      \"args\": [\"./mcp-server.js\"],\n      \"env\": {\n        \"API_KEY\": \"${API_KEY:-dev-key-local}\",\n        \"DB_URL\": \"${DATABASE_URL:-postgres://localhost:5432/devdb}\",\n        \"LOG_LEVEL\": \"${LOG_LEVEL:-info}\"\n      }\n    }\n  }\n}\n```\n\n```bash\n# With API_KEY set: uses the real key\nexport API_KEY=sk-prod-abc123\nclaude \"Query the database\"\n\n# Without API_KEY: falls back to dev-key-local\nunset API_KEY\nclaude \"Query the database\"\n# → server starts with API_KEY=dev-key-local\n```",
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
      "La característica de expansión de variables de `.mcp.json` admite la sintaxis `${VAR}` y `${VAR:-default}` en los siguientes campos específicos: `command`, `args`, `env`, `url` y `headers`. Esto cubre tanto los servidores basados en stdio (command/args/env) como los servidores basados en HTTP (url/headers). La expansión de variables no se aplica a las claves de nombre del servidor ni a otros campos estructurales del JSON. El ejemplo usa correctamente la expansión tanto en `url` como en `headers`.\n\nComo implementarlo:\n```json\n{\n  \"mcpServers\": {\n    \"api-server\": {\n      \"url\": \"${API_BASE_URL:-https://staging.api.com}/v2\",\n      \"headers\": {\n        \"Authorization\": \"Bearer ${AUTH_TOKEN}\",\n        \"X-Environment\": \"${APP_ENV:-development}\"\n      }\n    },\n    \"local-tool\": {\n      \"command\": \"${NODE_PATH:-node}\",\n      \"args\": [\"${MCP_SERVER_SCRIPT:-./mcp/server.js}\"],\n      \"env\": {\n        \"DB_HOST\": \"${DB_HOST:-localhost}\",\n        \"DB_PORT\": \"${DB_PORT:-5432}\"\n      }\n    }\n  }\n}\n```\n\n```bash\n# Set for current session\nexport API_BASE_URL=https://prod.api.com\nexport AUTH_TOKEN=$(cat ~/.secrets/api-token)\nclaude \"Use the API to fetch user data\"\n```",
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
      "`strict: true` en una definición de herramienta habilita la decodificación restringida: la generación de tokens del modelo está restringida para producir solo salidas que sean válidas contra el esquema JSON. Esta es una garantía sólida en tiempo de ejecución del cumplimiento del esquema. Sin embargo, conlleva limitaciones en el esquema: todas las propiedades del objeto deben estar en `required`, `additionalProperties` debe ser `false`, y los combinadores como `allOf`, `anyOf`, `oneOf` no están soportados. Características como `minimum`/`maximum`, `minLength`, `maxLength`, `pattern` y `const` tampoco están disponibles en modo estricto.\n\nComo implementarlo:\n```python\nimport anthropic\n\nclient = anthropic.Anthropic()\n\n# Tool with strict: True — constrained decoding guarantees schema compliance\nresponse = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=1024,\n    tools=[{\n        \"name\": \"extract_order\",\n        \"description\": \"Extract order details from text\",\n        \"strict\": True,  # Enable constrained decoding\n        \"input_schema\": {\n            \"type\": \"object\",\n            \"properties\": {\n                \"order_id\": {\"type\": \"string\"},\n                \"total\": {\"type\": \"number\"},\n                \"status\": {\"type\": \"string\", \"enum\": [\"pending\", \"shipped\", \"delivered\"]}\n            },\n            \"required\": [\"order_id\", \"total\", \"status\"],  # ALL properties must be required\n            \"additionalProperties\": False  # REQUIRED in strict mode\n        }\n    }],\n    messages=[{\"role\": \"user\", \"content\": \"Extract: Order #1234, $59.99, shipped\"}]\n)\n```",
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
      "En el modo `strict: true`, no están soportados `pattern`, `minLength`, `maxLength`, `minimum`, `maximum`, `const` y los combinadores de esquema (`allOf`, `anyOf`, `oneOf`). Si necesitas validación a nivel de regex, las opciones son: (1) usar `strict: false` e implementar la validación en el manejador de la herramienta del lado del servidor, o (2) usar `strict: false` y confiar en el seguimiento de instrucciones del modelo. La opción A es incorrecta porque `minLength`/`maxLength` tampoco están disponibles en modo estricto. La opción C es incorrecta porque `oneOf` tampoco está permitido en modo estricto.\n\nComo implementarlo:\n```python\n# WRONG — strict: True rejects pattern, minLength, maxLength\ntools_broken = [{\n    \"name\": \"validate_phone\",\n    \"strict\": True,\n    \"input_schema\": {\n        \"type\": \"object\",\n        \"properties\": {\n            \"phone\": {\n                \"type\": \"string\",\n                \"pattern\": \"^\\\\+[1-9]\\\\d{1,14}$\"  # NOT allowed in strict mode\n            }\n        },\n        \"required\": [\"phone\"],\n        \"additionalProperties\": False\n    }\n}]\n\n# CORRECT — strict: False, validate server-side\ntools_correct = [{\n    \"name\": \"validate_phone\",\n    \"strict\": False,\n    \"input_schema\": {\n        \"type\": \"object\",\n        \"properties\": {\n            \"phone\": {\n                \"type\": \"string\",\n                \"description\": \"E.164 format: +[country][number], e.g. +14155552671\"\n            }\n        },\n        \"required\": [\"phone\"]\n    }\n}]\n\n# Server-side validation in tool handler\nimport re\ndef handle_validate_phone(phone: str):\n    if not re.match(r'^\\+[1-9]\\d{1,14}$', phone):\n        raise ValueError(f\"Invalid phone format: {phone}\")\n    return {\"valid\": True, \"phone\": phone}\n```",
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
      "En macOS, `/Library/Application Support/ClaudeCode/CLAUDE.md` es la ubicación de política gestionada para Claude Code. Los departamentos de TI pueden desplegar configuración aquí (mediante MDM u herramientas similares), y este archivo tiene precedencia sobre los ajustes a nivel de usuario y de proyecto. Los usuarios no pueden anular la política gestionada. `.mcp.json` requiere que el archivo esté presente en cada repositorio. `~/.claude.json` es por usuario y puede modificarse. `/etc/claude/policy.json` no es una ruta real de Claude Code.\n\nComo implementarlo:\n```bash\n# IT/admin: create the managed policy file (requires admin/sudo)\nsudo mkdir -p \"/Library/Application Support/ClaudeCode\"\n\nsudo tee \"/Library/Application Support/ClaudeCode/CLAUDE.md\" << 'EOF'\n# Company Managed Policy — DO NOT MODIFY\n\n## Required MCP Servers\nAll Claude Code sessions must use the security scanning server.\n\n## Prohibited Actions\n- Never commit to main branch directly\n- Never disable the security-scanner MCP server\n- All file writes outside project directory require approval\nEOF\n```\n\n```bash\n# Verify managed policy is in place on a user's machine\ncat \"/Library/Application Support/ClaudeCode/CLAUDE.md\"\n```\n\n```json\n// Managed .mcp.json can also be placed here to enforce MCP servers\n// /Library/Application Support/ClaudeCode/mcp.json\n{\n  \"mcpServers\": {\n    \"security-scanner\": {\n      \"command\": \"/usr/local/bin/claude-security-mcp\",\n      \"args\": [\"--policy\", \"strict\"]\n    }\n  }\n}\n```",
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
      "ToolSearch es un mecanismo de recuperación que selecciona las herramientas más contextualmente relevantes del registro completo e incluye solo esos esquemas en una solicitud dada. Esto reduce (pero no elimina) el consumo de contexto de esquemas. Se sigue necesitando un conjunto base de descripciones de herramientas para habilitar la búsqueda en sí. ToolSearch funciona independientemente del tipo de transporte (stdio vs HTTP). No existe ninguna herramienta universal de entrada JSON que reemplace todos los esquemas.\n\nComo implementarlo:\n```bash\n# Enable ToolSearch to reduce per-request tool schema overhead\nexport ENABLE_TOOL_SEARCH=1\n\n# With 8 servers × 12 tools = 96 tool schemas\n# Without ToolSearch: all 96 schemas in every request\n# With ToolSearch: only ~10 most relevant schemas per request\n\nclaude \"Query the user database for active accounts created this month\"\n# ToolSearch selects: query_database, list_tables, get_schema\n# Excludes: file_ops, git_tools, email_sender, etc.\n```\n\n```typescript\n// Monitor token usage with and without ToolSearch\nconst withoutToolSearch = await client.messages.create({\n  model: \"claude-opus-4-6\",\n  tools: allTools, // All 96 tools\n  messages: [{ role: \"user\", content: \"Query the database\" }],\n  max_tokens: 1024,\n});\nconsole.log(\"Input tokens without ToolSearch:\", withoutToolSearch.usage.input_tokens);\n\n// With ToolSearch (ENABLE_TOOL_SEARCH=1), Claude Code automatically\n// reduces the active tool set. The baseline overhead remains for the\n// search index itself, but full schemas are only sent for relevant tools.\n```",
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
      "El transporte stdio está diseñado para servidores MCP que se ejecutan como procesos locales, lanzados y gestionados por Claude Code en la misma máquina. La comunicación ocurre a través de tuberías de entrada/salida estándar. El transporte HTTP es para servidores desplegados en red. SSE está deprecado. WebSocket no es un tipo de transporte MCP. Para servidores locales coubicados, stdio es la opción correcta y más eficiente.\n\nComo implementarlo:\n```bash\n# Add a local stdio MCP server\nclaude mcp add --transport stdio support-tools -- node /path/to/support-mcp-server.js\n\n# Or with Python\nclaude mcp add support-tools -- python3 /path/to/support_mcp_server.py\n\n# Check it was added with stdio transport\nclaude mcp list\n# support-tools: stdio — node /path/to/support-mcp-server.js\n```\n\n```json\n// .mcp.json — stdio for local co-deployed server\n{\n  \"mcpServers\": {\n    \"support-tools\": {\n      \"command\": \"node\",\n      \"args\": [\"/opt/support-agent/mcp-server.js\"],\n      \"env\": {\n        \"DB_URL\": \"${SUPPORT_DB_URL:-postgres://localhost/support}\",\n        \"LOG_LEVEL\": \"info\"\n      }\n    }\n  }\n}\n```\n\n```typescript\n// MCP server skeleton using stdio transport\nimport { Server } from \"@modelcontextprotocol/sdk/server/index.js\";\nimport { StdioServerTransport } from \"@modelcontextprotocol/sdk/server/stdio.js\";\n\nconst server = new Server({ name: \"support-tools\", version: \"1.0.0\" });\nconst transport = new StdioServerTransport();\nawait server.connect(transport); // Listens on stdin/stdout\n```",
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
      "CLAUDE.md se reinyecta desde disco después de cada evento de compactación — siempre sobrevive. Lo que se pierde durante la compactación es el historial de conversación, que se resume con pérdida. Si las directrices del desarrollador se entregaron como mensajes conversacionales en lugar de escribirse en CLAUDE.md, no sobrevivirán a la compactación. La solución es poner las instrucciones persistentes en CLAUDE.md. La directriz de 200 líneas es una recomendación para mantener los archivos manejables, no un límite estricto que cause inyección parcial.\n\nComo implementarlo:\n```markdown\n<!-- .claude/CLAUDE.md — persistent instructions that survive compaction -->\n\n## Code Style\n- Use 2-space indentation (not tabs)\n- Prefer `const` over `let`; never use `var`\n- All async functions must have explicit error handling\n\n## Testing Requirements\n- Every new function needs a unit test in __tests__/\n- Use Jest with ts-jest for TypeScript files\n- Test file naming: `<module>.test.ts`\n\n## Architecture Decisions\n- Use Repository pattern for all DB access\n- No business logic in API route handlers\n```\n\n```bash\n# Good: write it to CLAUDE.md before starting a long session\necho \"\\n## Style: use 2-space indentation\" >> .claude/CLAUDE.md\n# → Now it survives compaction\n```",
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
      "El enfoque recomendado para archivos CLAUDE.md grandes es dividir el contenido en archivos específicos por tema bajo subdirectorios `.claude/rules/`. Claude Code los descubre de forma recursiva. El CLAUDE.md principal debe mantenerse por debajo de 200 líneas (el objetivo) y puede usar directivas `@import` para cargar selectivamente archivos de reglas adicionales cuando sea relevante. Esto reduce el consumo de contexto por solicitud porque no todas las reglas necesitan cargarse para cada tarea. Comprimir o dividir entre niveles de usuario y proyecto perdería la claridad del alcance.\n\nComo implementarlo:\n```bash\n# Create a well-organized rules directory structure\nmkdir -p .claude/rules\n\n# Split by topic\ncat > .claude/rules/coding-standards.md << 'EOF'\n## TypeScript Standards\n- strict mode enabled\n- explicit return types required\n- no `any` types\nEOF\n\ncat > .claude/rules/security.md << 'EOF'\n## Security Rules\n- parameterized SQL only\n- no hardcoded secrets\n- validate all inputs with Zod\nEOF\n```\n\n```markdown\n<!-- .claude/CLAUDE.md — keep under 200 lines, import selectively -->\n# Project: MyApp\n\n## Quick Reference\n- Tech: Next.js 15, TypeScript, Postgres\n- Deploy: Vercel\n\n@import .claude/rules/coding-standards.md\n@import .claude/rules/security.md\n<!-- Only import testing rules when needed: @import .claude/rules/testing.md -->\n```",
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
      "`disable-model-invocation: true` significa que el skill ejecuta sus acciones definidas (comandos de shell, operaciones de archivos, etc.) sin realizar ninguna llamada a la API del modelo Claude — se ejecuta como automatización pura. `user-invocable: false` significa que el skill no aparece en el menú de comandos slash y no puede ser activado directamente por usuarios escribiendo `/nombre-del-skill`; solo puede ser invocado programáticamente por el sistema u otros agentes. Juntos, definen un skill automatizado no interactivo.\n\nComo implementarlo:\n```markdown\n---\ndisable-model-invocation: true\nuser-invocable: false\n---\n\n# sync-dependencies\n\nThis skill runs without any Claude model calls and is not user-facing.\n\n```bash\nnpm install\nnpm audit fix\ngit add package-lock.json\ngit commit -m \"chore: sync dependencies\"\n```\n```\n\n```markdown\n---\n# Contrast: user-invocable skill with model invocation\ndisable-model-invocation: false\nuser-invocable: true\ndescription: \"Review the current PR for issues\"\n---\n\n# review-pr\n\nUse the GitHub MCP server to fetch the PR diff, then analyze it for issues.\nProvide a structured review with severity ratings.\n```",
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
      "La sintaxis `!\\`comando\\`` en CLAUDE.md y archivos de skill es la sintaxis de inyección de contexto dinámico. Cuando el skill se carga, Claude Code ejecuta el comando de shell y reemplaza la expresión `!\\`...\\`` con la salida stdout del comando. Esto permite a los skills y archivos CLAUDE.md inyectar información dinámica en tiempo de ejecución (como la rama git actual, el nombre del entorno o las versiones de herramientas) en el contexto. No es una llamada a la herramienta Bash durante la conversación y no escapa la inyección de shell — ejecuta el comando en el momento de carga.\n\nComo implementarlo:\n```markdown\n<!-- .claude/CLAUDE.md — dynamic context injection examples -->\n\n# Project Context\n\nCurrent git branch: !`git branch --show-current`\nNode version: !`node --version`\nLast deploy: !`git log --oneline -1 origin/main`\n\n## Environment\nApp running: !`curl -s -o /dev/null -w \"%{http_code}\" http://localhost:3000/health 2>/dev/null || echo \"not running\"`\n```\n\n```markdown\n<!-- .claude/skills/code-review.md -->\n---\nuser-invocable: true\ndescription: Review code on current branch\n---\n\nYou are reviewing code on branch: !`git branch --show-current`\nChanged files: !`git diff --name-only main`\nTest coverage: !`cat coverage/coverage-summary.json 2>/dev/null | jq '.total.lines.pct'`\n\nReview the changed files for issues.\n```",
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
      "En los skills de Claude Code, `$ARGUMENTS` contiene la cadena completa de argumentos pasada después del nombre del skill. `$ARGUMENTS[N]` proporciona acceso posicional a los tokens separados por espacios: `$ARGUMENTS[0]` es el primer token (`main`), `$ARGUMENTS[1]` es el segundo (`production`), y así sucesivamente. `$N` (por ejemplo, `$1`, `$2`) es una abreviatura equivalente. El nombre del skill en sí no está incluido en los argumentos. Tanto `$ARGUMENTS` (cadena completa) como `$ARGUMENTS[N]` (indexado) están soportados.\n\nComo implementarlo:\n```markdown\n<!-- .claude/skills/deploy.md -->\n---\nuser-invocable: true\ndescription: Deploy a branch to an environment\nallowed-tools: [Bash]\n---\n\n# Deploy Skill\n\nDeploy branch `$ARGUMENTS[0]` (or `$1`) to environment `$ARGUMENTS[1]` (or `$2`).\n\nSteps:\n1. Verify branch `$1` exists: run `git branch -a | grep $1`\n2. Check environment `$2` is valid (staging/production/preview)\n3. Run the deployment: `./scripts/deploy.sh $1 $2`\n4. Confirm deployment succeeded\n\nFull arguments string: $ARGUMENTS\n```\n\n```bash\n# Usage examples:\n# /deploy main production\n#   → $ARGUMENTS[0] = \"main\", $ARGUMENTS[1] = \"production\"\n#   → $1 = \"main\", $2 = \"production\"\n\n# /deploy feature/auth staging\n#   → $ARGUMENTS[0] = \"feature/auth\", $ARGUMENTS[1] = \"staging\"\n```",
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
      "`--output-format stream-json` es el flag que habilita la salida JSON de streaming en el modo headless de Claude Code. Cada evento (mensaje del asistente, llamada a herramienta, resultado de herramienta, finalización) se emite como un objeto JSON en una nueva línea, lo que permite al pipeline de CI procesar eventos en tiempo real. No existe ningún flag `--headless`, `--ci-mode`, `--stream` o `--no-interactive` para este propósito. El flag `--continue` puede combinarse con `--output-format stream-json` para reanudar una sesión anterior.\n\nComo implementarlo:\n```bash\n# Basic headless run with streaming JSON\nclaude --output-format stream-json \\\n  --permission-mode bypassPermissions \\\n  \"Run tests and fix any failures\" \\\n  2>&1 | tee ci-output.jsonl\n\n# Parse specific event types in CI\nclaude --output-format stream-json \"Analyze code\" | \\\n  node -e \"\n  const readline = require('readline');\n  const rl = readline.createInterface({ input: process.stdin });\n  rl.on('line', line => {\n    const event = JSON.parse(line);\n    if (event.type === 'result') {\n      console.log('Final result:', event.result);\n      process.exit(event.subtype === 'success' ? 0 : 1);\n    }\n  });\n  \"\n```\n\n```yaml\n# GitHub Actions CI step\n- name: Claude Code Analysis\n  run: |\n    claude \\\n      --output-format stream-json \\\n      --allowedTools Read,Grep,Glob \\\n      --max-turns 20 \\\n      \"Check for security vulnerabilities in changed files\" \\\n      | jq -r 'select(.type==\"result\") | .result'\n  env:\n    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}\n```",
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
      "`--allowedTools` crea una lista blanca explícita de herramientas permitidas para una sesión de Claude Code. Cualquier herramienta no listada — incluyendo herramientas integradas como Bash, Edit y Write — es bloqueada. Claude recibirá un error al intentar usar una herramienta denegada y deberá razonar sobre alternativas dentro del conjunto permitido. No hay sustitución automática ni omisión para herramientas integradas. Este mecanismo se usa en CI para aplicar el principio de mínimo privilegio.\n\nComo implementarlo:\n```bash\n# Read-only analysis — only allow read tools\nclaude --allowedTools Read,Grep,Glob \\\n  --output-format stream-json \\\n  \"Analyze code quality and report issues (no changes)\"\n\n# Allow specific operations needed for linting\nclaude --allowedTools Read,Grep,Glob,Edit,Bash \\\n  \"Run eslint --fix on all TypeScript files\"\n\n# Explicitly deny all tools except MCP server tools\nclaude --allowedTools \"mcp__my-server__query_db,mcp__my-server__list_tables\" \\\n  \"What tables exist and how many rows in each?\"\n```\n\n```typescript\n// SDK: specify allowed tools in the tools array directly\nconst result = await client.messages.create({\n  model: \"claude-opus-4-6\",\n  max_tokens: 2048,\n  // Only include tool definitions for tools you want to allow\n  tools: [\n    { name: \"Read\", description: \"Read file contents\", input_schema: {} as any },\n    { name: \"Grep\", description: \"Search file contents\", input_schema: {} as any },\n    // Bash, Edit, Write intentionally excluded\n  ],\n  messages: [{ role: \"user\", content: \"Analyze the codebase\" }],\n});\n```",
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
      "Los hooks de shell de Claude Code usan una convención de código de salida de tres valores: código de salida 0 significa continuar (permitir la llamada a herramienta), código de salida 2 significa bloquear (denegar la llamada a herramienta, y Claude recibe el stderr del hook como razón), y cualquier otro código distinto de cero significa continuar pero registrar el error. El código de salida 2 es el valor específico para el bloqueo programático. Esto permite a los hooks funcionar como puertas de aplicación de políticas — el hook puede explicar exactamente por qué se denegó una llamada a herramienta escribiendo en stderr.\n\nComo implementarlo:\n```bash\n#!/bin/bash\n# .claude/hooks/pre-tool-use.sh\n# Blocks writes/deletes to files outside the project directory\n\nTOOL_NAME=\"$1\"\nTOOL_INPUT=\"$2\"  # JSON string of tool arguments\n\n# Block file operations outside project dir\nif echo \"$TOOL_INPUT\" | grep -qE '\"path\":\\s*\"/etc|\"path\":\\s*\"/usr|\"path\":\\s*\"/home'; then\n  echo \"Blocked: Cannot modify system files outside project directory\" >&2\n  exit 2  # Block the action — stderr message goes to Claude\nfi\n\n# Block production env file modifications\nif echo \"$TOOL_INPUT\" | grep -q 'production.env\\|.env.prod'; then\n  echo \"Blocked: Direct modification of production env files is prohibited. Use secrets manager.\" >&2\n  exit 2\nfi\n\nexit 0  # Allow the action\n```\n\n```json\n// .claude/settings.json — register the hook\n{\n  \"hooks\": {\n    \"PreToolUse\": [\n      {\n        \"type\": \"command\",\n        \"command\": \".claude/hooks/pre-tool-use.sh\"\n      }\n    ]\n  }\n}\n```",
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
      "`SessionStart` se activa exactamente una vez cuando una sesión de Claude Code se inicializa, antes de cualquier interacción del usuario. Es el hook correcto para acciones de configuración únicas como inyectar contexto de entorno, inicializar archivos de estado o ejecutar scripts previos a la sesión. `UserPromptSubmit` se activa en cada mensaje del usuario, no solo en el primero. `PreToolUse` se activa antes de las llamadas a herramientas, que aún no han ocurrido al inicio de la sesión. `SubagentStart` es específico para eventos del ciclo de vida de subagentes, no para el inicio de la sesión principal.\n\nComo implementarlo:\n```bash\n#!/bin/bash\n# .claude/hooks/session-start.sh\n# Runs once when a Claude Code session starts\n\n# Build dynamic context for CLAUDE.md\ncat > .claude/SESSION_CONTEXT.md << EOF\n## Session Context (auto-generated at start)\nDate: $(date)\nBranch: $(git branch --show-current)\nUncommitted changes: $(git status --porcelain | wc -l | tr -d ' ') files\nEnvironment: ${APP_ENV:-development}\nEOF\n\necho \"Session context initialized\" >&2\nexit 0\n```\n\n```json\n// .claude/settings.json\n{\n  \"hooks\": {\n    \"SessionStart\": [\n      {\n        \"type\": \"command\",\n        \"command\": \".claude/hooks/session-start.sh\"\n      }\n    ]\n  }\n}\n```",
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
      "Claude Code soporta cuatro tipos de hook: `command` (script de shell), `http` (solicitud HTTP), `prompt` (inyección de prompt) y `agent` (invocación de subagente). Para llamadas de auditoría HTTP en tiempo real antes de que se ejecute cada herramienta, el tipo de hook `http` en el evento `PreToolUse` es la combinación correcta. El hook HTTP envía una solicitud a la URL especificada y puede bloquear la llamada a herramienta si la respuesta indica denegación. Usar `PostToolUse` sería posterior al hecho y no puede bloquear la llamada.\n\nComo implementarlo:\n```json\n// .claude/settings.json — HTTP hook for real-time audit\n{\n  \"hooks\": {\n    \"PreToolUse\": [\n      {\n        \"type\": \"http\",\n        \"url\": \"https://audit.internal.company.com/claude/pre-tool\",\n        \"method\": \"POST\",\n        \"headers\": {\n          \"Authorization\": \"Bearer ${AUDIT_API_KEY}\",\n          \"Content-Type\": \"application/json\"\n        }\n      }\n    ]\n  }\n}\n```\n\n```python\n# Audit service endpoint (FastAPI example)\nfrom fastapi import FastAPI, Request\nfrom fastapi.responses import JSONResponse\n\napp = FastAPI()\n\n@app.post(\"/claude/pre-tool\")\nasync def audit_pre_tool(request: Request):\n    body = await request.json()\n    tool_name = body.get(\"tool_name\")\n    tool_input = body.get(\"tool_input\")\n\n    # Block dangerous operations\n    if tool_name == \"Bash\" and \"rm -rf\" in str(tool_input):\n        return JSONResponse(status_code=403, content={\"block\": True, \"reason\": \"Dangerous rm -rf blocked\"})\n\n    # Allow everything else\n    return JSONResponse(status_code=200, content={\"allow\": True})\n```",
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
      "`context: fork` en el frontmatter de un skill hace que el skill se ejecute en una nueva ventana de contexto aislada, bifurcada desde el estado de sesión actual. Esto es distinto del comportamiento predeterminado de continuar en el mismo contexto de conversación. Es útil para skills que necesitan realizar trabajo exploratorio sin contaminar la conversación principal, o para skills que necesitan un contexto limpio para un razonamiento preciso. `model:` especifica qué modelo usar, no si bifurcar. `agent: true` marca el skill como un agente pero no implica bifurcación de contexto.\n\nComo implementarlo:\n```markdown\n---\ncontext: fork\nuser-invocable: true\nmodel: claude-sonnet-4-5\ndescription: \"Explore refactoring options without affecting main session\"\n---\n\n# explore-refactor\n\nYou are exploring (not implementing) a refactoring strategy for $ARGUMENTS.\n\n1. Read the target files\n2. Draft 3 different refactoring approaches with trade-offs\n3. Return your recommendation summary to the parent context\n\nDo NOT make any file edits — this is exploratory only.\n```\n\n```markdown\n---\ncontext: fork\nuser-invocable: true\ndescription: \"Run security audit in isolated context\"\nallowed-tools: [Read, Grep, Glob]\n---\n\n# security-audit\n\nAudit the codebase for security vulnerabilities.\nThis runs in a forked context so findings don't pollute the main conversation.\n\nReturn a structured JSON report.\n```",
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
      "`--resume` acepta un ID de sesión para restaurar el historial de conversación de una sesión guardada previamente. En modo headless combinado con `--output-format stream-json`, esto permite a un pipeline continuar una tarea de larga duración a través de múltiples invocaciones. El flag `--continue` continúa la sesión más reciente sin necesitar un ID específico. `--session-id`, `--restore` y `--attach` no son flags válidos de Claude Code.\n\nComo implementarlo:\n```bash\n# First run — capture the session ID from the output\nSESSION_ID=$(claude \\\n  --output-format stream-json \\\n  --permission-mode bypassPermissions \\\n  \"Process files 1-100 in /data/batch\" \\\n  | jq -r 'select(.type==\"result\") | .session_id' \\\n  | tail -1)\n\necho \"$SESSION_ID\" > .session-id\n\n# Resume the session later (e.g., next CI run)\nSESSION_ID=$(cat .session-id)\nclaude \\\n  --resume \"$SESSION_ID\" \\\n  --output-format stream-json \\\n  \"Continue processing — files 1-100 are done, now do 101-200\"\n```\n\n```bash\n# --continue (no ID needed) — resumes most recent session\nclaude --continue \"What was the last file you processed?\"\n\n# --resume [id] — resumes a specific named session\nclaude --resume abc123def \"Continue the migration from where you left off\"\n```",
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
      "Las respuestas asistente pre-completadas (inyectar texto parcial al inicio del turno del asistente para guiar el formato de salida) están deprecadas en Claude 4.6 y versiones posteriores. Los enfoques de reemplazo son: (1) usar `output_config.format` con `type: \"json_schema\"` para salida JSON estructurada garantizada mediante decodificación restringida, o (2) confiar en el seguimiento mejorado de instrucciones de Claude 4.6 con instrucciones de formato explícitas en el prompt. La deprecación aplica a todos los tamaños de respuesta.\n\nComo implementarlo:\n```python\n# OLD — prefilled response (deprecated in Claude 4.6)\nresponse_old = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=1024,\n    messages=[\n        {\"role\": \"user\", \"content\": \"Extract the name and age\"},\n        {\"role\": \"assistant\", \"content\": '{\"name\":'}, # ← DEPRECATED prefill\n    ]\n)\n\n# NEW — Option 1: structured output with json_schema\nresponse_new = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=1024,\n    output_config={\n        \"format\": {\n            \"type\": \"json_schema\",\n            \"json_schema\": {\n                \"type\": \"object\",\n                \"properties\": {\n                    \"name\": {\"type\": \"string\"},\n                    \"age\": {\"type\": \"integer\"}\n                },\n                \"required\": [\"name\", \"age\"],\n                \"additionalProperties\": False\n            }\n        }\n    },\n    messages=[{\"role\": \"user\", \"content\": \"Extract the name and age from: John, 34 years old\"}]\n)\n\n# NEW — Option 2: instruction following (Claude 4.6 handles well)\nresponse_instruct = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=1024,\n    system=\"Always respond with valid JSON only. No explanation.\",\n    messages=[{\"role\": \"user\", \"content\": \"Extract {name, age} from: John, 34 years old\"}]\n)\n```",
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
      "`output_config.format.type = \"json_schema\"` con un esquema proporcionado habilita la decodificación restringida — la generación de tokens del modelo está restringida en la capa de muestreo para producir solo tokens válidos según el esquema. Esto proporciona una garantía sólida en tiempo de ejecución del cumplimiento del esquema, a diferencia de las instrucciones en el prompt (que dependen del comportamiento del modelo y pueden fallar) o el modo `json_object` (que garantiza JSON válido pero no una forma específica del esquema). Llamar a una herramienta con parámetros de esquema es una alternativa válida pero agrega sobrecarga de ida y vuelta.\n\nComo implementarlo:\n```python\nimport anthropic\nimport json\n\nclient = anthropic.Anthropic()\n\nORDER_SCHEMA = {\n    \"type\": \"object\",\n    \"properties\": {\n        \"order_id\": {\"type\": \"string\"},\n        \"items\": {\n            \"type\": \"array\",\n            \"items\": {\n                \"type\": \"object\",\n                \"properties\": {\n                    \"name\": {\"type\": \"string\"},\n                    \"qty\": {\"type\": \"integer\"}\n                },\n                \"required\": [\"name\", \"qty\"],\n                \"additionalProperties\": False\n            }\n        },\n        \"total\": {\"type\": \"number\"},\n        \"shipping_address\": {\"type\": \"string\"}\n    },\n    \"required\": [\"order_id\", \"items\", \"total\", \"shipping_address\"],\n    \"additionalProperties\": False\n}\n\nresponse = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=1024,\n    output_config={\n        \"format\": {\n            \"type\": \"json_schema\",\n            \"json_schema\": ORDER_SCHEMA\n        }\n    },\n    messages=[{\n        \"role\": \"user\",\n        \"content\": f\"Extract order from email: {email_text}\"\n    }]\n)\n\norder = json.loads(response.content[0].text)\nprint(order[\"order_id\"])  # Guaranteed to exist per schema\n```",
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
      "Los esquemas JSON en modo estricto tienen limitaciones específicas: `minimum`, `maximum`, `minLength`, `maxLength`, `pattern`, `const` y los combinadores de esquema no están soportados. Además, `additionalProperties: false` es obligatorio en todos los tipos de objeto en modo estricto. El esquema falla por dos razones: (1) `count` usa `minimum` y `maximum` que no están soportados, y (2) al objeto le falta `additionalProperties: false`. `enum` es válido en modo estricto. El tipo `integer` está soportado. Todas las propiedades definidas deben estar en `required`, lo cual están.\n\nComo implementarlo:\n```python\n# BROKEN schema — fails in strict mode\nbroken_schema = {\n    \"type\": \"object\",\n    \"properties\": {\n        \"status\": {\"type\": \"string\", \"enum\": [\"active\", \"inactive\"]},\n        \"count\": {\"type\": \"integer\", \"minimum\": 0, \"maximum\": 100}  # ← not allowed\n    },\n    \"required\": [\"status\", \"count\"]\n    # Missing: \"additionalProperties\": False  ← required\n}\n\n# FIXED schema — works in strict mode\nfixed_schema = {\n    \"type\": \"object\",\n    \"properties\": {\n        \"status\": {\"type\": \"string\", \"enum\": [\"active\", \"inactive\"]},  # enum ✅\n        \"count\": {\"type\": \"integer\"}  # removed min/max constraints\n    },\n    \"required\": [\"status\", \"count\"],\n    \"additionalProperties\": False  # ← required in strict mode\n}\n\n# For server-side validation of min/max:\ndef validate_output(data: dict):\n    if not 0 <= data[\"count\"] <= 100:\n        raise ValueError(f\"count {data['count']} out of range [0, 100]\")\n    return data\n```",
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
      "La decodificación restringida en modo estricto construye una máquina de estados finita a partir del esquema JSON en el momento de la solicitud para restringir la generación de tokens. Las referencias circulares/recursivas (donde un tipo se referencia a sí mismo) crearían máquinas de estados infinitas, que no pueden construirse. Por tanto, las referencias circulares están explícitamente no soportadas en los esquemas de modo estricto. Para estructuras de árbol, debes usar un esquema no estricto (con validación del lado del servidor) o limitar la profundidad inlineando el tipo hasta una profundidad fija en lugar de usar referencias recursivas.\n\nComo implementarlo:\n```python\n# BROKEN — circular/recursive reference, rejected in strict mode\nbroken_node_schema = {\n    \"$defs\": {\n        \"Node\": {\n            \"type\": \"object\",\n            \"properties\": {\n                \"value\": {\"type\": \"string\"},\n                \"children\": {\n                    \"type\": \"array\",\n                    \"items\": {\"$ref\": \"#/$defs/Node\"}  # ← circular reference\n                }\n            },\n            \"required\": [\"value\", \"children\"],\n            \"additionalProperties\": False\n        }\n    },\n    \"$ref\": \"#/$defs/Node\"\n}\n\n# FIXED option 1 — inline to fixed depth (strict: True works)\nfixed_schema_depth2 = {\n    \"type\": \"object\",\n    \"properties\": {\n        \"value\": {\"type\": \"string\"},\n        \"children\": {\n            \"type\": \"array\",\n            \"items\": {\n                \"type\": \"object\",\n                \"properties\": {\n                    \"value\": {\"type\": \"string\"},\n                    \"children\": {\"type\": \"array\", \"items\": {\"type\": \"object\"}}\n                },\n                \"required\": [\"value\", \"children\"],\n                \"additionalProperties\": False\n            }\n        }\n    },\n    \"required\": [\"value\", \"children\"],\n    \"additionalProperties\": False\n}\n\n# FIXED option 2 — use strict: False and validate server-side\nflexible_schema = {\n    \"type\": \"object\",\n    \"properties\": {\n        \"value\": {\"type\": \"string\"},\n        \"children\": {\"type\": \"array\"}\n    }\n    # No strict mode — allows recursive structures\n}\n```",
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
      "La Batch API está diseñada exactamente para cargas de trabajo de alto volumen y no en tiempo real, como las tareas de clasificación nocturna. Especificaciones clave: hasta 100,000 solicitudes o 256 MB por lote, la mayoría de los lotes se completan en menos de 1 hora (no 14 horas), los resultados están disponibles durante 29 días, los lotes vencen a las 24 horas si no se completan, y el precio es típicamente menor que las llamadas síncronas. Las llamadas síncronas paralelas alcanzarían los límites de tasa. El streaming reduce la latencia pero no el rendimiento. Solicitar aumentos de límite de tasa es lento y costoso.\n\nComo implementarlo:\n```python\nimport anthropic\n\nclient = anthropic.Anthropic()\n\n# Build batch requests for all 50,000 tickets\ndef build_batch_requests(tickets: list[dict]) -> list[dict]:\n    return [\n        {\n            \"custom_id\": f\"ticket-{t['id']}\",\n            \"params\": {\n                \"model\": \"claude-haiku-4-5\",\n                \"max_tokens\": 100,\n                \"messages\": [{\n                    \"role\": \"user\",\n                    \"content\": f\"Classify this ticket as: billing/technical/shipping/other\\n\\n{t['text']}\"\n                }]\n            }\n        }\n        for t in tickets\n    ]\n\n# Submit batch (up to 100,000 requests per batch)\nrequests = build_batch_requests(all_tickets[:50000])\nbatch = client.messages.batches.create(requests=requests)\nprint(f\"Batch ID: {batch.id}, Status: {batch.processing_status}\")\n\n# Poll for completion (typically < 1 hour)\nimport time\nwhile batch.processing_status == \"in_progress\":\n    time.sleep(60)\n    batch = client.messages.batches.retrieve(batch.id)\n\n# Retrieve results (available for 29 days)\nfor result in client.messages.batches.results(batch.id):\n    if result.result.type == \"succeeded\":\n        classification = result.result.message.content[0].text\n        print(f\"{result.custom_id}: {classification}\")\n```",
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
      "Los trabajos de Batch API tienen una ventana de procesamiento de 24 horas: si el lote no se ha completado dentro de las 24 horas desde el envío, vence y se cancela. Los resultados de las solicitudes completadas dentro de un lote vencido aún son recuperables. Los resultados en sí permanecen disponibles durante 29 días desde la fecha de envío original, después de los cuales se eliminan. No hay mecanismo de reintento automático ni de reanudación manual — debes reenviar los lotes fallidos.\n\nComo implementarlo:\n```python\nimport anthropic\nfrom datetime import datetime, timedelta\n\nclient = anthropic.Anthropic()\n\ndef monitor_and_handle_batch(batch_id: str):\n    batch = client.messages.batches.retrieve(batch_id)\n    submitted_at = batch.created_at\n    expires_at = submitted_at + timedelta(hours=24)\n    results_expire_at = submitted_at + timedelta(days=29)\n\n    print(f\"Submitted: {submitted_at}\")\n    print(f\"Expires (cancelled if incomplete): {expires_at}\")\n    print(f\"Results available until: {results_expire_at}\")\n\n    if batch.processing_status == \"expired\":\n        print(\"Batch expired! Retrieving partial results...\")\n        completed_ids = set()\n        for result in client.messages.batches.results(batch_id):\n            if result.result.type == \"succeeded\":\n                completed_ids.add(result.custom_id)\n\n        # Identify which requests need resubmission\n        failed = [r for r in original_requests if r[\"custom_id\"] not in completed_ids]\n        print(f\"Need to resubmit: {len(failed)} requests\")\n        new_batch = client.messages.batches.create(requests=failed)\n        return new_batch.id\n\n    return batch_id\n```",
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
      "La investigación sobre el manejo de contexto de Claude muestra que colocar documentos largos al inicio del prompt, seguidos de instrucciones de tarea, con la consulta específica al final puede mejorar la precisión hasta en un 30% en comparación con otros órdenes. Esta estructura refleja cómo trabajaría un experto humano: absorber primero el contexto completo del documento, entender la estructura de la tarea, luego aplicarla a la pregunta específica. Colocar las consultas antes del documento significa que el modelo procesa la pregunta sin el contexto que necesita.\n\nComo implementarlo:\n```python\ndef build_document_qa_prompt(document: str, instructions: str, query: str) -> str:\n    # Optimal ordering: document → instructions → query\n    return f\"\"\"<document>\n{document}\n</document>\n\n<instructions>\n{instructions}\n</instructions>\n\n<query>\n{query}\n</query>\"\"\"\n\n# Usage\nprompt = build_document_qa_prompt(\n    document=fifty_page_technical_doc,  # Long document FIRST\n    instructions=\"\"\"\n        Answer based only on the document above.\n        Cite specific sections when possible.\n        If the answer is not in the document, say so.\n    \"\"\",\n    query=\"What are the performance benchmarks for the caching layer?\"  # Query LAST\n)\n```\n\n```python\n# BAD ordering — query before document (up to 30% worse accuracy)\nbad_prompt = f\"\"\"\nQuery: What are the performance benchmarks?\n\nInstructions: Answer from the document below.\n\n{fifty_page_document}  ← document at the end\n\"\"\"\n```",
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
      "Las etiquetas XML se recomiendan para estructurar prompts complejos porque proporcionan límites semánticos con nombre (`<context>`, `<instructions>`, `<input>`) que delimitan claramente las secciones incluso cuando el contenido de la sección en sí contiene texto de apariencia similar. Los encabezados markdown (`##`) o los delimitadores simples (`---`) pueden aparecer naturalmente en el contenido, causando ambigüedad sobre dónde termina una sección y comienza otra. El entrenamiento de Claude incluye prompts estructurados con XML y los analiza de manera confiable. Las etiquetas XML no son requeridas por la API y no afectan el conteo de tokens.\n\nComo implementarlo:\n```python\ndef build_support_prompt(customer_context: str, instructions: str, complaint: str) -> str:\n    return f\"\"\"<context>\n{customer_context}\n</context>\n\n<instructions>\n{instructions}\n</instructions>\n\n<input>\n{complaint}\n</input>\"\"\"\n\nprompt = build_support_prompt(\n    customer_context=\"Customer has been a member since 2019. Gold tier.\",\n    instructions=\"Draft a professional, empathetic response. Escalate billing issues > $500.\",\n    complaint=\"I was charged twice for my subscription this month. Order #12345.\"\n)\n```\n\n```python\n# XML tags also useful for few-shot examples\nexamples_prompt = \"\"\"\n<examples>\n<example>\n<input>My package hasn't arrived</input>\n<output>I'm sorry to hear your package is delayed. Let me look up tracking #...</output>\n</example>\n<example>\n<input>Wrong item sent</input>\n<output>I apologize for the mix-up. I'll arrange a replacement shipment immediately...</output>\n</example>\n</examples>\n\n<input>{{complaint}}</input>\n\"\"\"\n```",
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
      "El patrón de auto-verificación es una técnica de ingeniería de prompts donde, después de generar una respuesta inicial, se instruye al modelo (en el mismo prompt o como un turno de seguimiento) a releer su salida y verificarla contra criterios explícitos (por ejemplo, '¿Este código maneja el caso null? ¿Coincide con la firma de la función?'). Esto aprovecha la capacidad de razonamiento del modelo para detectar errores que pudo haber cometido en la generación inicial. Se realiza en una sola llamada API (como parte del prompt) o como un segundo turno, no mediante una llamada API separada, y no requiere ningún flag especial.\n\nComo implementarlo:\n```python\n# Self-check via single-prompt instruction\nself_check_prompt = \"\"\"\nGenerate a TypeScript function that parses a date string in ISO 8601 format.\n\nAfter writing the function, review your own code by checking:\n1. Does it handle null/undefined input?\n2. Does it return the correct TypeScript type?\n3. Does it handle invalid date strings without throwing?\n4. Are edge cases (empty string, partial dates) covered?\n\nIf you find issues during your review, fix them before finalizing.\n\"\"\"\n\n# Self-check as second turn (multi-turn approach)\nresponse1 = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=1024,\n    messages=[{\"role\": \"user\", \"content\": \"Write a TypeScript date parser function.\"}]\n)\n\ncode = response1.content[0].text\n\nresponse2 = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=512,\n    messages=[\n        {\"role\": \"user\", \"content\": \"Write a TypeScript date parser function.\"},\n        {\"role\": \"assistant\", \"content\": code},\n        {\"role\": \"user\", \"content\": \"\"\"\n            Review your code above. Check:\n            - Null safety\n            - Correct return type\n            - Invalid input handling\n            Output only the corrected final version.\n        \"\"\"}\n    ]\n)\n```",
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
      "Un antipatrón bien documentado al actualizar a Claude 4.6 (o modelos igualmente capaces) es el exceso de instrucciones en el prompt. Los modelos más antiguos y menos capaces a veces necesitaban instrucciones muy explícitas y detalladas para activar llamadas a herramientas de manera confiable. Cuando esos mismos prompts se usan con el seguimiento de instrucciones más fuerte de Claude 4.6, las herramientas que antes se subactivaban ahora se sobreactivan. La solución es simplificar los prompts — eliminar o suavizar el lenguaje de activación explícita que estaba compensando las limitaciones del modelo anterior.\n\nComo implementarlo:\n```python\n# OLD prompt (tuned for Claude 3.5 — overtriggers in Claude 4.6)\nold_system_prompt = \"\"\"\nYou are a support assistant. You MUST ALWAYS use the lookup_order tool\nwhenever ANY message is received. Do not respond without first calling\nlookup_order. ALWAYS call lookup_order. It is REQUIRED on every message.\n\"\"\"\n\n# NEW prompt for Claude 4.6 — simplified, trusts instruction following\nnew_system_prompt = \"\"\"\nYou are a support assistant. Use the lookup_order tool when the user\nreferences a specific order, order number, or asks about an order status.\n\"\"\"\n\n# Testing tool trigger rate\ndef measure_trigger_rate(system_prompt: str, test_messages: list[str]) -> float:\n    triggered = 0\n    for msg in test_messages:\n        response = client.messages.create(\n            model=\"claude-opus-4-6\",\n            max_tokens=512,\n            system=system_prompt,\n            tools=[lookup_order_tool],\n            messages=[{\"role\": \"user\", \"content\": msg}]\n        )\n        if response.stop_reason == \"tool_use\":\n            triggered += 1\n    return triggered / len(test_messages)\n\n# Compare: old prompt likely shows ~95%+, new ~60% (expected)\nprint(\"Old:\", measure_trigger_rate(old_system_prompt, test_msgs))\nprint(\"New:\", measure_trigger_rate(new_system_prompt, test_msgs))\n```",
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
      "En modo estricto, todas las propiedades definidas en el objeto `properties` DEBEN aparecer en el array `required` — no hay campos opcionales en el sentido estándar. Para representar 'opcionalidad' (el valor puede o no ser significativo), el enfoque canónico es requerir el campo pero permitir `null` como su tipo usando `type: [\"string\", \"null\"]`. Cuando no existen notas, el modelo produce `null`. No hay flag `required: false` a nivel de propiedad, y `anyOf` no está soportado en modo estricto.\n\nComo implementarlo:\n```python\n# Strict mode: all properties required, use null for \"optional\" fields\nstrict_schema = {\n    \"type\": \"object\",\n    \"properties\": {\n        \"ticket_id\": {\"type\": \"string\"},\n        \"summary\": {\"type\": \"string\"},\n        # \"Optional\" notes field — required but nullable\n        \"notes\": {\"type\": [\"string\", \"null\"]},\n        # Optional array — required but can be empty or null\n        \"tags\": {\n            \"type\": [\"array\", \"null\"],\n            \"items\": {\"type\": \"string\"}\n        }\n    },\n    # ALL properties must appear in required\n    \"required\": [\"ticket_id\", \"summary\", \"notes\", \"tags\"],\n    \"additionalProperties\": False\n}\n\n# Result when notes are absent:\n# { \"ticket_id\": \"T123\", \"summary\": \"Login issue\", \"notes\": null, \"tags\": null }\n\n# Consuming the output safely\nimport json\ndata = json.loads(response.content[0].text)\nif data[\"notes\"] is not None:\n    print(f\"Notes: {data['notes']}\")\n```",
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
      "`error_max_structured_output_retries` es un subtipo de ResultMessage que indica que Claude intentó generar salida que se ajustara al esquema JSON especificado múltiples veces pero no logró producir un resultado válido dentro del presupuesto de reintentos permitido. Esto ocurre típicamente cuando el esquema es altamente restrictivo en relación con el contenido de entrada — por ejemplo, requiriendo valores enum que no coinciden con los datos reales, o requiriendo campos que no pueden extraerse de la fuente. La solución es revisar el esquema en busca de restricciones excesivamente estrictas, simplificar el esquema o mejorar el prompt para guiar al modelo hacia salidas válidas.\n\nComo implementarlo:\n```python\nimport anthropic\n\nclient = anthropic.Anthropic()\n\n# Process batch results and handle schema retry failures\nfailed_schema = []\nsucceeded = []\n\nfor result in client.messages.batches.results(batch_id):\n    if result.result.type == \"errored\":\n        stop_reason = getattr(result.result, \"stop_reason\", None)\n        if stop_reason == \"error_max_structured_output_retries\":\n            failed_schema.append(result.custom_id)\n    else:\n        succeeded.append(result.custom_id)\n\nprint(f\"Schema retry failures: {len(failed_schema)}\")\n\n# Fix: review and loosen the schema for problematic inputs\n# Common fixes:\n# 1. Add more enum values or remove enum constraints\n# 2. Make required fields nullable: {\"type\": [\"string\", \"null\"]}\n# 3. Simplify nested schema structures\n# 4. Add guidance in the prompt: \"If X cannot be determined, output null\"\n\nLOOSER_SCHEMA = {\n    \"type\": \"object\",\n    \"properties\": {\n        \"category\": {\n            \"type\": [\"string\", \"null\"],  # Allow null if extraction fails\n            \"enum\": [\"billing\", \"technical\", \"shipping\", \"other\", None]  # Added null\n        },\n        \"priority\": {\"type\": [\"string\", \"null\"]}\n    },\n    \"required\": [\"category\", \"priority\"],\n    \"additionalProperties\": False\n}\n```",
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
      "Especificaciones de ventana de contexto: Claude Opus 4.6 y Claude Sonnet 4.6 tienen ventanas de contexto nativas de 1M tokens. Claude Sonnet 4.5 y Claude 4 (sin el sufijo 4.6) tienen ventanas de contexto nativas de 200K tokens pero pueden extenderse a 1M tokens usando el header de solicitud beta de contexto extendido. Para un documento de 800K tokens, Opus 4.6 y Sonnet 4.6 lo manejan de forma nativa; Sonnet 4.5 requiere el header beta. Todos los modelos Claude 4.x están muy por debajo de la afirmación de 2M.\n\nComo implementarlo:\n```python\nimport anthropic\n\nclient = anthropic.Anthropic()\n\n# Sonnet 4.6 — 1M context natively, no beta header needed\nresponse_native = client.messages.create(\n    model=\"claude-sonnet-4-6\",\n    max_tokens=4096,\n    messages=[{\"role\": \"user\", \"content\": [{\"type\": \"text\", \"text\": large_800k_document}]}]\n)\n\n# Sonnet 4.5 — requires beta header for >200K tokens\nresponse_extended = client.beta.messages.create(\n    model=\"claude-sonnet-4-5\",\n    max_tokens=4096,\n    betas=[\"extended-context-2025\"],  # Unlock 1M tokens\n    messages=[{\"role\": \"user\", \"content\": [{\"type\": \"text\", \"text\": large_800k_document}]}]\n)\n```\n\n```typescript\n// TypeScript — extended context beta for Sonnet 4.5\nconst response = await client.beta.messages.create({\n  model: \"claude-sonnet-4-5\",\n  max_tokens: 4096,\n  betas: [\"extended-context-2025\"],\n  messages: [{ role: \"user\", content: largeDocument }],\n});\n\nconsole.log(\"Input tokens used:\", response.usage.input_tokens);\n```",
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
      "El sistema de gestión de contexto de Claude Code inyecta XML `<token_budget>` en el contexto, proporcionando a Claude información sobre el presupuesto de tokens restante y actualizaciones de uso después de cada llamada a herramienta. Esta conciencia del contexto es por diseño: Claude puede usar esta información para tomar decisiones informadas, como escribir respuestas más cortas, evitar lanzar nuevos subagentes que consumirían contexto adicional, o priorizar sus pasos restantes. No es una notificación de facturación, no es configurable directamente por el usuario y no activa la compactación.\n\nComo implementarlo:\n```typescript\n// Parse token_budget events from stream-json output\nconst output = execSync(\n  'claude --output-format stream-json \"Analyze 500 files\"',\n  { encoding: 'utf8' }\n);\n\nfor (const line of output.split('\\n').filter(Boolean)) {\n  const event = JSON.parse(line);\n  if (event.type === 'system' && event.content?.includes('token_budget')) {\n    // Extract remaining budget\n    const match = event.content.match(/remaining=\"(\\d+)\"/);\n    if (match) {\n      const remaining = parseInt(match[1]);\n      console.log(`Token budget remaining: ${remaining}`);\n      if (remaining < 50000) {\n        console.warn('Low context budget — agent should wrap up');\n      }\n    }\n  }\n}\n```\n\n```markdown\n<!-- System prompt guidance for context-aware behavior -->\n## Context Budget Awareness\nWhen you receive a <token_budget> message:\n- If remaining > 200,000: proceed normally\n- If remaining < 100,000: write shorter responses, avoid spawning new subagents\n- If remaining < 50,000: save state to disk and plan for graceful continuation\n- If remaining < 20,000: immediately write final summary and stop\n```",
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
      "El hook `PreCompact` se activa específicamente antes de que comience el proceso de compactación de contexto de Claude Code. Este es el hook correcto para implementar comportamiento de compactación personalizado: el hook puede escribir un resumen estructurado, guardar estado clave en archivos o realizar cualquier lógica de preservación antes de que se resuma el historial de conversación. `PostToolUse` es demasiado frecuente y no es activado por la compactación. `SessionStart` se activa después de que la compactación ocurrió y comienza una nueva sesión, lo cual es demasiado tarde. El SystemMessage `compact_boundary` es observable pero no interceptable como hook.\n\nComo implementarlo:\n```bash\n#!/bin/bash\n# .claude/hooks/pre-compact.sh\n# Runs before context compaction — save structured state\n\nTIMESTAMP=$(date -u +\"%Y-%m-%dT%H:%M:%SZ\")\nSTATE_FILE=\".claude/state/pre-compact-$(date +%s).json\"\nmkdir -p .claude/state\n\n# Save current progress snapshot\ncat > \"$STATE_FILE\" << EOF\n{\n  \"timestamp\": \"$TIMESTAMP\",\n  \"git_branch\": \"$(git branch --show-current)\",\n  \"last_commit\": \"$(git log --oneline -1)\",\n  \"progress_note\": \"Compaction checkpoint\"\n}\nEOF\n\necho \"Pre-compact state saved to $STATE_FILE\" >&2\nexit 0\n```\n\n```json\n// .claude/settings.json\n{\n  \"hooks\": {\n    \"PreCompact\": [\n      {\n        \"type\": \"command\",\n        \"command\": \".claude/hooks/pre-compact.sh\"\n      }\n    ]\n  }\n}\n```",
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
      "Los subagentes en ventanas de contexto nuevas son significativamente más eficientes en contexto para el procesamiento a gran escala. Cada subagente comienza con un contexto limpio, procesa su lote y devuelve solo el resultado final al coordinador. Los pasos de procesamiento intermedios (cientos de llamadas a herramientas, resultados parciales) nunca se acumulan en el contexto del coordinador. Con compactación, aunque el historial se resume, ocurre pérdida de información y el contexto del coordinador aún crece con el tiempo. El patrón de múltiples ventanas de contexto es el enfoque recomendado para flujos de trabajo que exceden la capacidad de una sola ventana de contexto.\n\nComo implementarlo:\n```typescript\n// Coordinator: spawn subagents in fresh contexts for each batch\nimport { query } from \"@anthropic-ai/claude-code\";\n\nasync function processDocumentBatches(allDocs: string[]) {\n  const BATCH_SIZE = 25;\n  const results: string[] = [];\n\n  for (let i = 0; i < allDocs.length; i += BATCH_SIZE) {\n    const batch = allDocs.slice(i, i + BATCH_SIZE);\n\n    // Each Agent call spawns a fresh context window\n    // Only the final summary returns to coordinator\n    const batchResult = await query({\n      prompt: `\n        Use the Agent tool to analyze documents ${i + 1}-${i + batch.length}.\n        The documents are: ${batch.join(', ')}\n        Return only: 3-sentence summary + key findings list.\n      `,\n    });\n\n    results.push(batchResult.result);\n    // Coordinator's context grows by ~200 tokens (summary) not ~50,000 (full transcript)\n  }\n\n  return results;\n}\n```",
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
      "Los archivos de estado (por ejemplo, `tests.json`, `progress.txt`) escritos en el sistema de archivos son el patrón recomendado para pasar estado estructurado entre límites de ventana de contexto en flujos de trabajo de múltiples sesiones. Cada sesión lee el archivo de estado al inicio (mediante un hook SessionStart o una llamada inicial a herramienta), procesa su trabajo y escribe un archivo de estado actualizado. Esto es explícito, inspeccionable y no depende de la continuidad de la sesión. Incluir el historial completo de conversación en los system prompts desperdicia tokens. `--continue` solo reanuda la sesión inmediatamente anterior. Las variables de entorno son efímeras en la mayoría de los sistemas de CI.\n\nComo implementarlo:\n```json\n// .claude/state/tests.json — written at end of each run\n{\n  \"lastRun\": \"2025-01-15T09:00:00Z\",\n  \"passing\": [\"auth.test.ts\", \"user.test.ts\", \"billing.test.ts\"],\n  \"failing\": [\"payment.test.ts\", \"webhook.test.ts\"],\n  \"skipped\": [\"e2e/checkout.test.ts\"],\n  \"coverage\": 74.3\n}\n```\n\n```bash\n#!/bin/bash\n# .claude/hooks/session-start.sh — read state file at session start\nSTATE_FILE=\".claude/state/tests.json\"\nif [ -f \"$STATE_FILE\" ]; then\n  echo \"=== Previous Test State ===\"  >&2\n  echo \"Failing tests from last run:\" >&2\n  jq -r '.failing[]' \"$STATE_FILE\" >&2\n  echo \"Coverage: $(jq -r '.coverage' $STATE_FILE)%\" >&2\nfi\n```\n\n```typescript\n// CI pipeline: write state at end of each run\nasync function runCISession(sessionNum: number) {\n  const prevState = JSON.parse(fs.readFileSync('.claude/state/tests.json', 'utf8'));\n\n  const result = await query({\n    prompt: `\n      Previous test run state: ${JSON.stringify(prevState)}\n      Fix the failing tests and write updated state to .claude/state/tests.json\n    `,\n  });\n}\n```",
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
      "Git es un excelente mecanismo de estado entre sesiones porque los commits crean un registro persistente y direccionable por contenido de exactamente qué cambió y cuándo. La siguiente sesión de Claude Code puede usar `git status` para ver cambios sin confirmar, `git log` para ver qué se completó en sesiones anteriores y `git diff` para entender el estado actual relativo a cualquier línea base. Esto le da a Claude información de estado precisa y consultable sin consumir ventana de contexto con el historial de conversación sin procesar. Git no inyecta automáticamente en CLAUDE.md y su área de staging no es un mecanismo de memoria nativo de Claude.\n\nComo implementarlo:\n```bash\n# Session prompt that leverages git as state\nclaude \"\nRun these commands to understand current refactoring state:\n  git log --oneline --since='1 week ago' -- 'src/**/*.ts'\n  git diff main --name-only --diff-filter=M\n  git status --short\n\nThen continue refactoring the remaining class components to functional.\nCommit each file you refactor with: 'refactor: convert X to functional component'\n\"\n```\n\n```bash\n# After pipeline, verify progress via git\ngit log --oneline --grep=\"refactor:\" | wc -l  # Count refactored files\ngit diff main --name-only | grep -v refactor    # Find remaining files\n```\n\n```typescript\n// CI: each Claude session commits progress, next session reads git log\nasync function refactorPipeline() {\n  for (let batch = 0; batch < totalBatches; batch++) {\n    await query({\n      prompt: `\n        Check git log to see which files have already been refactored:\n        Run: git log --oneline --grep=\"refactor:\" -- src/\n\n        Pick the next 5 unrefactored .tsx files and convert them.\n        After each file, commit: git commit -m \"refactor: convert {filename}\"\n      `,\n    });\n  }\n}\n```",
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
      "Cada servidor MCP inyecta todos sus esquemas de herramientas (nombres, descripciones, tipos de parámetros, documentación) en cada solicitud API. Con 12 servidores, cada uno potencialmente con entre 5 y 20 herramientas con esquemas detallados, el contexto combinado de definición de herramientas puede llegar fácilmente a miles de tokens. Esta sobrecarga está presente en cada solicitud antes de que se procese cualquier contenido de tarea, explicando la base alta. Las definiciones de subagentes no se pre-cargan. Los system prompts y CLAUDE.md pueden contribuir pero típicamente son más pequeños que los esquemas de herramientas de 12 servidores.\n\nComo implementarlo:\n```bash\n# Audit tool schema token footprint\n# Count tools per server\nclaude mcp list --verbose  # Shows tool count per server\n\n# Disable servers not needed for current task\nclaude mcp disable reporting-server\nclaude mcp disable legacy-crm\n\n# Or use a minimal .mcp.json for specific tasks\ncat > .mcp.research.json << 'EOF'\n{\n  \"mcpServers\": {\n    \"file-search\": { \"command\": \"node\", \"args\": [\"./mcp/search.js\"] },\n    \"web-fetch\": { \"command\": \"node\", \"args\": [\"./mcp/fetch.js\"] }\n  }\n}\nEOF\nclaude --mcp-config .mcp.research.json \"Research the topic\"\n```\n\n```python\n# Programmatically estimate schema token overhead\ndef estimate_schema_tokens(tools: list[dict]) -> int:\n    import json\n    total_chars = sum(len(json.dumps(t)) for t in tools)\n    return total_chars // 4\n\n# With 12 servers × 15 tools × avg 500 tokens/tool schema = ~90,000 tokens baseline\nprint(f\"Estimated baseline tokens: {12 * 15 * 500:,}\")\n# → 90,000 tokens before any user content!\n```",
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
      "La compactación funciona de la siguiente manera: CLAUDE.md se relee desde disco y se inyecta de nuevo — siempre sobrevive de forma literal. El historial de conversación (incluyendo hallazgos importantes, resultados intermedios y cualquier instrucción dada conversacionalmente) se resume mediante compresión con pérdida. El resumen preserva la narrativa general pero puede perder detalles específicos, números o conclusiones. Por eso la información crítica debe escribirse en CLAUDE.md o en archivos de estado en lugar de dejarse en mensajes conversacionales si necesita sobrevivir a la compactación.\n\nComo implementarlo:\n```bash\n# Strategy: use PreCompact hook to persist findings before compaction\n# .claude/hooks/pre-compact.sh\n#!/bin/bash\n\n# Append to CLAUDE.md so it survives verbatim\necho \"\\n## Research Findings (auto-saved $(date))\" >> .claude/CLAUDE.md\necho \"See .claude/research-findings.md for details\" >> .claude/CLAUDE.md\nexit 0\n```\n\n```markdown\n<!-- In CLAUDE.md — findings survive compaction since CLAUDE.md is re-injected -->\n## Key Research Findings (Persistent)\n<!-- Claude should append findings here when instructed -->\n- Document batch 1-50: 3 anomalies found in Q3 data (see findings-batch1.json)\n- Document batch 51-100: Market trends confirm hypothesis H2\n```\n\n```typescript\n// Guide Claude to write findings to CLAUDE.md during session\nconst sessionPrompt = `\nAs you analyze each batch of documents:\n1. Process the documents\n2. Append key findings to .claude/CLAUDE.md under \"## Research Findings\"\n3. These findings will survive context compaction\n\nDo not rely on conversational memory for important numbers or conclusions.\n`;\n```",
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
      "El patrón de flujo de trabajo de múltiples ventanas de contexto funciona de la siguiente manera: dividir la tarea general en lotes; cada lote inicia una sesión de Claude Code nueva que comienza leyendo el estado actual del sistema de archivos (un archivo de estado, git status o una salida estructurada del lote anterior) en lugar del historial de conversación; la sesión procesa su lote y escribe los resultados de vuelta al sistema de archivos; la siguiente sesión repite esto. Esto mantiene cada ventana de contexto pequeña y limpia. No existe ningún flag `--context-budget` y la compactación por llamada no es una opción configurable.\n\nComo implementarlo:\n```bash\n#!/bin/bash\n# pipeline.sh — multi-context window workflow\n\nTOTAL_ITEMS=500\nBATCH_SIZE=50\n\nfor start in $(seq 0 $BATCH_SIZE $((TOTAL_ITEMS - 1))); do\n  end=$((start + BATCH_SIZE - 1))\n  echo \"Processing items $start-$end...\"\n\n  # Each run is a fresh session — reads state file, writes results\n  claude \\\n    --output-format stream-json \\\n    --permission-mode bypassPermissions \\\n    --max-turns 30 \\\n    \"\n      Read .claude/state/progress.json to understand what's been done.\n      Process analysis items ${start} through ${end} from /data/items/.\n      Write results to /data/results/batch-${start}.json.\n      Update .claude/state/progress.json with completed range ${start}-${end}.\n    \"\n\n  echo \"Batch $start-$end complete\"\ndone\n```\n\n```json\n// .claude/state/progress.json — shared state across sessions\n{\n  \"totalItems\": 500,\n  \"completedRanges\": [{\"start\": 0, \"end\": 49}, {\"start\": 50, \"end\": 99}],\n  \"lastUpdated\": \"2025-01-15T10:30:00Z\",\n  \"status\": \"in_progress\"\n}\n```",
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
      "Ambos enfoques son técnicamente válidos para este escenario. La opción A (actualizar a Claude Sonnet 4.6) admite 1M tokens de forma nativa sin ninguna configuración adicional — sencillo y confiable. La opción B (agregar el header beta de contexto extendido) habilita contexto de 1M tokens para Claude Sonnet 4.5 sin cambiar modelos, útil si hay razones de costo, latencia o paridad de características para permanecer en 4.5. La elección depende de restricciones operativas. No existe ninguna configuración `extended_context` en `.mcp.json`.\n\nComo implementarlo:\n```python\nimport anthropic\n\nclient = anthropic.Anthropic()\n\n# Option A: Upgrade to Sonnet 4.6 (1M native, no header needed)\nresponse_a = client.messages.create(\n    model=\"claude-sonnet-4-6\",  # Native 1M context\n    max_tokens=4096,\n    messages=[{\"role\": \"user\", \"content\": very_long_ticket_thread}]\n)\n\n# Option B: Stay on Sonnet 4.5 with extended context beta header\nresponse_b = client.beta.messages.create(\n    model=\"claude-sonnet-4-5\",\n    max_tokens=4096,\n    betas=[\"extended-context-2025\"],  # Unlocks 1M tokens\n    messages=[{\"role\": \"user\", \"content\": very_long_ticket_thread}]\n)\n```\n\n```typescript\n// TypeScript — choose based on operational needs\nasync function processLongTicket(ticketThread: string, useExtendedBeta = false) {\n  if (useExtendedBeta) {\n    return client.beta.messages.create({\n      model: \"claude-sonnet-4-5\",\n      betas: [\"extended-context-2025\"],\n      max_tokens: 4096,\n      messages: [{ role: \"user\", content: ticketThread }],\n    });\n  } else {\n    return client.messages.create({\n      model: \"claude-sonnet-4-6\",\n      max_tokens: 4096,\n      messages: [{ role: \"user\", content: ticketThread }],\n    });\n  }\n}\n```",
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
      "La conciencia del contexto de Claude (mediante XML `<token_budget>`) está diseñada para habilitar comportamiento adaptativo. Con 45,000 tokens restantes y 8 subagentes consumiendo cada uno ~10,000 tokens, lanzar los 8 excedería el presupuesto (80,000 > 45,000). La respuesta bien diseñada es priorizar los subagentes más críticos, lanzar solo tantos como permita el presupuesto, persistir los resultados intermedios en un archivo de estado para mayor durabilidad y planificar con gracia la continuación en una nueva ventana de contexto. No puedes cambiar modelos a mitad de sesión, y activar la compactación a mitad de tarea arriesga perder estado crítico.\n\nComo implementarlo:\n```markdown\n<!-- System prompt for context-budget-aware orchestrator -->\n## Context Budget Management\n\nYou will receive `<token_budget remaining=\"N\">` updates.\n\nWhen remaining > 100,000: spawn subagents normally.\nWhen remaining < 50,000:\n1. Write all completed results to .claude/state/results.json\n2. Write remaining work to .claude/state/pending.json\n3. Spawn only the highest-priority remaining subagents\n4. End the session gracefully with a continuation summary\n\nWhen remaining < 20,000:\n1. Stop spawning subagents immediately\n2. Write final state to .claude/state/checkpoint.json\n3. Output: \"CONTINUATION NEEDED: see .claude/state/checkpoint.json\"\n```\n\n```typescript\n// Orchestrator that reads token_budget events and adapts\nasync function adaptiveOrchestrator(tasks: Task[]) {\n  const BUDGET_PER_SUBAGENT = 10000;\n  let remainingBudget = 1000000; // Start estimate\n\n  for (const task of tasks) {\n    if (remainingBudget < BUDGET_PER_SUBAGENT * 2) {\n      // Save remaining tasks for next session\n      fs.writeFileSync('.claude/state/pending.json',\n        JSON.stringify({ pendingTasks: tasks.slice(tasks.indexOf(task)) })\n      );\n      console.log('Budget low — saved pending tasks, graceful stop');\n      break;\n    }\n    remainingBudget -= BUDGET_PER_SUBAGENT;\n  }\n}\n```",
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
      "La memoria en sesión (opción A) se pierde cuando una sesión de Claude Code termina y se degrada con la compactación. No puede rastrear estado de manera confiable entre múltiples sesiones. Los enfoques basados en el sistema de archivos (B y C) persisten independientemente de cualquier sesión de Claude Code: `progress.txt` está diseñado explícitamente para este patrón, y los commits de git proporcionan un registro consultable y controlado por versiones del progreso que cualquier sesión nueva puede inspeccionar mediante `git log`. Tanto B como C son patrones recomendados para la gestión de estado entre sesiones.\n\nComo implementarlo:\n```bash\n# Option B: progress.txt — simple, explicit, readable\n# Written by Claude during session:\necho \"Processed: item-001, item-002, item-003\" >> progress.txt\necho \"Failed: item-004 (timeout)\" >> progress.txt\necho \"Last updated: $(date)\" >> progress.txt\n\n# Read at next session start:\ncat progress.txt\n# → New Claude session knows exactly where to resume\n```\n\n```bash\n# Option C: git commits — structured, queryable, version-controlled\n# After each batch, Claude commits:\ngit add data/processed/\ngit commit -m \"progress: processed items 001-050 [50/1000]\"\n\ngit add data/processed/\ngit commit -m \"progress: processed items 051-100 [100/1000]\"\n\n# New session queries git to find progress:\ngit log --oneline --grep=\"progress:\" | head -5\n# → progress: processed items 051-100 [100/1000]\n# → progress: processed items 001-050 [50/1000]\n```\n\n```typescript\n// Option A (UNRELIABLE): in-session memory\n// Never rely on this across sessions:\n// \"We processed items 1-50\" ← lost when session ends\n```",
    keyConcept: "El estado basado en el sistema de archivos (progress.txt, git) sobrevive a los reinicios de sesión; la memoria en contexto no",
  },
};
