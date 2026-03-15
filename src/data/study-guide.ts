export interface DomainGuide {
  domain: number;
  name: string;
  weight: number;
  keyRule: string;
  keyRuleEs: string;
  concepts: { title: string; titleEs: string; content: string; contentEs: string }[];
  antiPatterns: { pattern: string; patternEs: string; why: string; whyEs: string }[];
  examTraps: { trap: string; trapEs: string }[];
  buildExercise: string;
  buildExerciseEs: string;
  resources: { title: string; url: string }[];
}

export const studyGuide: DomainGuide[] = [
  {
    domain: 1,
    name: "Agentic Architecture & Orchestration",
    weight: 27,
    keyRule: "When stakes are financial or security-critical, prompt instructions alone are not enough. You must enforce tool ordering programmatically with hooks and prerequisite gates.",
    keyRuleEs: "Cuando hay riesgo financiero o de seguridad, las instrucciones en el prompt no son suficientes. Debes forzar el orden de tools programaticamente con hooks y prerequisite gates.",
    concepts: [
      {
        title: "Agentic Loop Lifecycle",
        titleEs: "Ciclo de vida del Agentic Loop",
        content: "1. Send request to Claude via Messages API\n2. Inspect `stop_reason` in the response\n3. If `stop_reason` is `\"tool_use\"`: execute tool(s), append results to conversation history, send updated conversation back\n4. If `stop_reason` is `\"end_turn\"`: agent finished, present final response\n5. Tool results must be appended to history so the model reasons about new information",
        contentEs: "1. Enviar request a Claude via Messages API\n2. Inspeccionar `stop_reason` en la respuesta\n3. Si `stop_reason` es `\"tool_use\"`: ejecutar tool(s), agregar resultados al historial, enviar conversacion actualizada\n4. Si `stop_reason` es `\"end_turn\"`: agente termino, presentar respuesta final\n5. Los resultados de tools deben agregarse al historial para que el modelo razone sobre nueva informacion",
      },
      {
        title: "Subagent Isolation Principle",
        titleEs: "Principio de aislamiento de subagentes",
        content: "**The single biggest mistake:** people assume subagents share memory with the coordinator. They do NOT.\n\n- Subagents do NOT inherit the coordinator's conversation history\n- Subagents do NOT share memory between invocations\n- Every piece of information must be passed explicitly in the prompt\n- Only the final result returns to the parent (not the full transcript)",
        contentEs: "**El error mas grande:** asumir que los subagentes comparten memoria con el coordinador. NO lo hacen.\n\n- Los subagentes NO heredan el historial de conversacion del coordinador\n- Los subagentes NO comparten memoria entre invocaciones\n- Toda informacion debe pasarse explicitamente en el prompt\n- Solo el resultado final regresa al padre (no el transcript completo)",
      },
      {
        title: "Hub-and-Spoke Architecture",
        titleEs: "Arquitectura Hub-and-Spoke",
        content: "- Coordinator agent sits at the center\n- Subagents are spokes invoked for specialized tasks\n- ALL communication flows through the coordinator\n- Coordinator handles: task decomposition, subagent selection, context passing, result aggregation, error handling\n- Subagents never communicate directly with each other",
        contentEs: "- El agente coordinador esta en el centro\n- Los subagentes son invocados para tareas especializadas\n- TODA la comunicacion fluye a traves del coordinador\n- El coordinador maneja: descomposicion de tareas, seleccion de subagentes, paso de contexto, agregacion de resultados, manejo de errores\n- Los subagentes nunca se comunican directamente entre si",
      },
      {
        title: "Enforcement Spectrum",
        titleEs: "Espectro de enforcement",
        content: "- **Prompt-based guidance:** works most of the time, has non-zero failure rate\n- **Programmatic enforcement (hooks/gates):** works every time\n- **Decision rule:** financial, security, or compliance consequences → programmatic enforcement. Low-stakes preferences → prompt-based guidance.",
        contentEs: "- **Guia basada en prompt:** funciona la mayoria del tiempo, tiene tasa de fallo no-cero\n- **Enforcement programatico (hooks/gates):** funciona siempre\n- **Regla de decision:** consecuencias financieras, de seguridad o compliance → enforcement programatico. Preferencias de bajo riesgo → guia basada en prompt.",
      },
      {
        title: "Task Decomposition Patterns",
        titleEs: "Patrones de descomposicion de tareas",
        content: "**Fixed sequential (prompt chaining):** predetermined steps, predictable, consistent. Best for structured tasks like code reviews.\n\n**Dynamic adaptive:** subtasks generated based on discoveries. Best for open-ended investigation.\n\n**Attention dilution fix:** split large reviews into per-file local passes + separate cross-file integration pass.",
        contentEs: "**Secuencial fijo (prompt chaining):** pasos predeterminados, predecible, consistente. Mejor para tareas estructuradas como code reviews.\n\n**Adaptativo dinamico:** subtareas generadas basadas en descubrimientos. Mejor para investigacion abierta.\n\n**Solucion a dilucion de atencion:** dividir reviews grandes en pasadas locales por archivo + pasada separada de integracion cross-file.",
      },
    ],
    antiPatterns: [
      {
        pattern: "Parsing natural language to determine loop termination (e.g., checking if assistant said \"I'm done\")",
        patternEs: "Parsear lenguaje natural para determinar terminacion del loop (ej: verificar si el asistente dijo \"termine\")",
        why: "Natural language is ambiguous. The stop_reason field exists for exactly this purpose.",
        whyEs: "El lenguaje natural es ambiguo. El campo stop_reason existe exactamente para esto.",
      },
      {
        pattern: "Arbitrary iteration caps as primary stopping mechanism (e.g., \"stop after 10 loops\")",
        patternEs: "Caps de iteracion arbitrarios como mecanismo principal de parada (ej: \"parar despues de 10 loops\")",
        why: "Either cuts off useful work or runs unnecessary iterations. The model signals completion via stop_reason.",
        whyEs: "O corta trabajo util o ejecuta iteraciones innecesarias. El modelo senala completitud via stop_reason.",
      },
      {
        pattern: "Checking for assistant text content as completion indicator",
        patternEs: "Verificar contenido de texto del asistente como indicador de completitud",
        why: "The model can return text alongside tool_use blocks. Text presence does not mean completion.",
        whyEs: "El modelo puede retornar texto junto con bloques tool_use. La presencia de texto no significa completitud.",
      },
      {
        pattern: "Narrow task decomposition by coordinator",
        patternEs: "Descomposicion de tareas demasiado estrecha por el coordinador",
        why: "If coordinator decomposes 'creative industries' into only visual arts subtopics, downstream agents work correctly but coverage is incomplete. Trace failures to origin.",
        whyEs: "Si el coordinador descompone 'industrias creativas' solo en subtemas de artes visuales, los agentes downstream funcionan correctamente pero la cobertura es incompleta. Trazar fallos al origen.",
      },
    ],
    examTraps: [
      { trap: "Prompt-based solutions presented for high-stakes scenarios — always reject these", trapEs: "Soluciones basadas en prompt presentadas para escenarios de alto riesgo — siempre rechazarlas" },
      { trap: "Blaming downstream agents when the root cause is coordinator's task decomposition", trapEs: "Culpar agentes downstream cuando la causa raiz es la descomposicion de tareas del coordinador" },
      { trap: "Assuming subagents automatically inherit parent context", trapEs: "Asumir que los subagentes heredan automaticamente el contexto del padre" },
    ],
    buildExercise: "Build a coordinator agent with two subagents (web search and document analysis), proper context passing with structured metadata, a programmatic prerequisite gate blocking refunds before customer verification, and a PostToolUse normalization hook converting timestamps to ISO 8601. Test with a multi-concern request.",
    buildExerciseEs: "Construir un agente coordinador con dos subagentes (busqueda web y analisis de documentos), paso de contexto con metadata estructurada, un prerequisite gate programatico que bloquee reembolsos antes de verificacion de cliente, y un hook PostToolUse que normalice timestamps a ISO 8601. Probar con un request multi-concern.",
    resources: [
      { title: "Agent SDK Overview", url: "https://platform.claude.com/docs/en/agent-sdk/overview" },
      { title: "Building Agents with Claude Agent SDK", url: "https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk" },
      { title: "Agent SDK Python Examples", url: "https://github.com/anthropics/claude-agent-sdk-python" },
    ],
  },
  {
    domain: 2,
    name: "Tool Design & MCP Integration",
    weight: 18,
    keyRule: "Tool descriptions are THE primary mechanism Claude uses for tool selection. If yours are vague or overlapping, selection becomes unreliable. Better descriptions is always the correct first step.",
    keyRuleEs: "Las descripciones de tools son EL mecanismo principal que Claude usa para seleccion de tools. Si son vagas o se solapan, la seleccion se vuelve poco confiable. Mejores descripciones es siempre el primer paso correcto.",
    concepts: [
      {
        title: "Tool Description Quality",
        titleEs: "Calidad de descripciones de tools",
        content: "A good tool description includes:\n- What the tool does (primary purpose)\n- Expected inputs (formats, types, constraints)\n- Example queries it handles well\n- Edge cases and limitations\n- Explicit boundaries: when to use THIS tool vs similar tools\n\nThe exam's Q2: `get_customer` and `lookup_order` with near-identical descriptions causing misrouting. Fix = better descriptions, NOT few-shot examples or routing classifiers.",
        contentEs: "Una buena descripcion de tool incluye:\n- Que hace el tool (proposito principal)\n- Inputs esperados (formatos, tipos, restricciones)\n- Queries de ejemplo que maneja bien\n- Casos borde y limitaciones\n- Limites explicitos: cuando usar ESTE tool vs tools similares\n\nQ2 del examen: `get_customer` y `lookup_order` con descripciones casi identicas causando misrouting. Solucion = mejores descripciones, NO few-shot examples ni routing classifiers.",
      },
      {
        title: "Error Categories",
        titleEs: "Categorias de errores",
        content: "Four categories with different handling:\n- **Transient:** timeouts, service unavailability → retryable\n- **Validation:** invalid input, wrong format → fix input, retry\n- **Business:** policy violations (refund exceeds limit) → NOT retryable, needs alternative workflow\n- **Permission:** access denied → needs escalation\n\n**Critical distinction:** Access failure (can't reach data) vs Valid empty result (reached source, no matches). Confusing these breaks recovery logic.",
        contentEs: "Cuatro categorias con manejo diferente:\n- **Transient:** timeouts, servicio no disponible → reintentable\n- **Validation:** input invalido, formato incorrecto → corregir input, reintentar\n- **Business:** violaciones de politica (reembolso excede limite) → NO reintentable, necesita workflow alternativo\n- **Permission:** acceso denegado → necesita escalacion\n\n**Distincion critica:** Fallo de acceso (no puede alcanzar datos) vs Resultado vacio valido (alcanzo la fuente, sin coincidencias). Confundir estos rompe la logica de recuperacion.",
      },
      {
        title: "Tool Distribution",
        titleEs: "Distribucion de tools",
        content: "- Giving an agent 18 tools degrades selection reliability\n- Optimal: 4-5 tools per agent, scoped to its role\n- A synthesis agent should NOT have web search tools\n- Replace generic tools with constrained alternatives (e.g., `load_document` instead of `fetch_url`)\n\n**tool_choice options:**\n- `\"auto\"`: model decides whether to call a tool (default)\n- `\"any\"`: MUST call a tool, chooses which\n- `{\"type\": \"tool\", \"name\": \"...\"}`: MUST call this specific tool",
        contentEs: "- Dar a un agente 18 tools degrada la confiabilidad de seleccion\n- Optimo: 4-5 tools por agente, limitados a su rol\n- Un agente de sintesis NO deberia tener tools de busqueda web\n- Reemplazar tools genericos con alternativas restringidas (ej: `load_document` en vez de `fetch_url`)\n\n**Opciones de tool_choice:**\n- `\"auto\"`: modelo decide si llamar un tool (default)\n- `\"any\"`: DEBE llamar un tool, elige cual\n- `{\"type\": \"tool\", \"name\": \"...\"}`: DEBE llamar este tool especifico",
      },
      {
        title: "MCP Server Configuration",
        titleEs: "Configuracion de servidores MCP",
        content: "- **Project-level (.mcp.json):** version-controlled, shared with team\n- **User-level (~/.claude.json):** personal, NOT shared\n- Environment variable expansion: `${GITHUB_TOKEN}` keeps credentials out of version control\n- Use community MCP servers for standard integrations (Jira, GitHub). Only build custom for team-specific workflows.\n- MCP resources expose content catalogs to reduce exploratory tool calls.",
        contentEs: "- **Nivel proyecto (.mcp.json):** bajo control de versiones, compartido con el equipo\n- **Nivel usuario (~/.claude.json):** personal, NO compartido\n- Expansion de variables: `${GITHUB_TOKEN}` mantiene credenciales fuera del control de versiones\n- Usar servidores MCP comunitarios para integraciones estandar (Jira, GitHub). Solo construir custom para workflows especificos del equipo.\n- Los recursos MCP exponen catalogos de contenido para reducir llamadas exploratorias de tools.",
      },
    ],
    antiPatterns: [
      {
        pattern: "Using few-shot examples to fix tool misrouting caused by poor descriptions",
        patternEs: "Usar few-shot examples para arreglar misrouting causado por descripciones pobres",
        why: "Adds token overhead without fixing the root cause. Better descriptions is the correct first step.",
        whyEs: "Agrega overhead de tokens sin arreglar la causa raiz. Mejores descripciones es el primer paso correcto.",
      },
      {
        pattern: "Confusing access failures with valid empty results",
        patternEs: "Confundir fallos de acceso con resultados vacios validos",
        why: "Leads to unnecessary retries (wasting resources) or missed retry opportunities (returning incorrect empty results).",
        whyEs: "Lleva a reintentos innecesarios (desperdiciando recursos) o oportunidades perdidas de reintento (retornando resultados vacios incorrectos).",
      },
      {
        pattern: "Giving all agents access to all tools",
        patternEs: "Dar a todos los agentes acceso a todos los tools",
        why: "18 tools degrades selection. Agents with tools outside their specialization tend to misuse them.",
        whyEs: "18 tools degradan la seleccion. Agentes con tools fuera de su especializacion tienden a usarlos mal.",
      },
    ],
    examTraps: [
      { trap: "Routing classifiers presented as first fix for misrouting — over-engineered when descriptions are the issue", trapEs: "Routing classifiers presentados como primera solucion para misrouting — sobre-ingenieria cuando las descripciones son el problema" },
      { trap: "Tool consolidation as quick fix — valid but more effort than warranted when descriptions are inadequate", trapEs: "Consolidacion de tools como solucion rapida — valida pero mas esfuerzo del necesario cuando las descripciones son inadecuadas" },
    ],
    buildExercise: "Create 3 MCP tools with one intentionally ambiguous pair. Write error responses with all four error categories (transient, validation, business, permission). Configure in .mcp.json with environment variable expansion. Test tool_choice forced selection for mandatory first steps.",
    buildExerciseEs: "Crear 3 tools MCP con un par intencionalmente ambiguo. Escribir respuestas de error con las cuatro categorias (transient, validation, business, permission). Configurar en .mcp.json con expansion de variables. Probar tool_choice con seleccion forzada para pasos obligatorios.",
    resources: [
      { title: "MCP Integration for Claude Code", url: "https://code.claude.com/docs/en/mcp" },
      { title: "MCP Specification", url: "https://github.com/modelcontextprotocol" },
      { title: "Claude Agent SDK (npm)", url: "https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk" },
    ],
  },
  {
    domain: 3,
    name: "Claude Code Configuration & Workflows",
    weight: 20,
    keyRule: "The CLAUDE.md hierarchy is critical. The exam's favorite trap: a team member missing instructions because they live in user-level config (not version-controlled, not shared).",
    keyRuleEs: "La jerarquia de CLAUDE.md es critica. La trampa favorita del examen: un miembro del equipo no recibe instrucciones porque estan en config a nivel de usuario (no versionada, no compartida).",
    concepts: [
      {
        title: "CLAUDE.md Hierarchy",
        titleEs: "Jerarquia de CLAUDE.md",
        content: "Three levels:\n- **User-level (~/.claude/CLAUDE.md):** applies only to YOU. Not version-controlled. Not shared.\n- **Project-level (.claude/CLAUDE.md or root CLAUDE.md):** applies to everyone. Version-controlled. Team-wide standards.\n- **Directory-level (subdirectory CLAUDE.md):** applies when working in that directory.\n\nCLAUDE.md **survives compaction** (re-injected from disk). Conversation instructions do NOT.",
        contentEs: "Tres niveles:\n- **Nivel usuario (~/.claude/CLAUDE.md):** aplica solo a TI. No versionado. No compartido.\n- **Nivel proyecto (.claude/CLAUDE.md o root CLAUDE.md):** aplica a todos. Versionado. Estandares del equipo.\n- **Nivel directorio (CLAUDE.md en subdirectorio):** aplica al trabajar en ese directorio.\n\nCLAUDE.md **sobrevive la compactacion** (re-inyectado desde disco). Las instrucciones de conversacion NO.",
      },
      {
        title: "Path-Specific Rules (.claude/rules/)",
        titleEs: "Reglas por ruta (.claude/rules/)",
        content: "```yaml\n---\npaths: [\"**/*.test.tsx\"]\n---\n# Test conventions here\n```\n\n- Glob patterns match files across the ENTIRE codebase\n- Load ONLY when editing matching files (token efficient)\n- Superior to directory-level CLAUDE.md for conventions spanning many directories\n- Example: `**/*.test.tsx` catches every test file regardless of location",
        contentEs: "```yaml\n---\npaths: [\"**/*.test.tsx\"]\n---\n# Convenciones de tests aqui\n```\n\n- Los patrones glob coinciden con archivos en TODO el codebase\n- Se cargan SOLO al editar archivos coincidentes (eficiente en tokens)\n- Superior a CLAUDE.md de directorio para convenciones que abarcan muchos directorios\n- Ejemplo: `**/*.test.tsx` captura cada archivo de test sin importar la ubicacion",
      },
      {
        title: "Skills & Commands",
        titleEs: "Skills y Commands",
        content: "- `.claude/commands/` = project-scoped, shared via version control\n- `~/.claude/commands/` = personal, not shared\n- `.claude/skills/` with SKILL.md = on-demand invocation with config\n\n**Skill frontmatter:**\n- `context: fork` — runs in isolated sub-agent (verbose output stays contained)\n- `allowed-tools` — restricts tool access during skill execution\n- `argument-hint` — prompts for required parameters\n\n**Key distinction:** Skills = on-demand workflows. CLAUDE.md = always-loaded universal standards.",
        contentEs: "- `.claude/commands/` = nivel proyecto, compartido via control de versiones\n- `~/.claude/commands/` = personal, no compartido\n- `.claude/skills/` con SKILL.md = invocacion on-demand con configuracion\n\n**Frontmatter de skills:**\n- `context: fork` — ejecuta en sub-agente aislado (output verboso queda contenido)\n- `allowed-tools` — restringe acceso a tools durante ejecucion\n- `argument-hint` — solicita parametros requeridos\n\n**Distincion clave:** Skills = workflows on-demand. CLAUDE.md = estandares universales siempre cargados.",
      },
      {
        title: "Plan Mode vs Direct Execution",
        titleEs: "Modo plan vs ejecucion directa",
        content: "**Plan mode when:**\n- Complex tasks with large-scale changes\n- Multiple valid approaches exist\n- Architectural decisions required\n- Multi-file modifications (45+ files)\n\n**Direct execution when:**\n- Well-understood, limited scope changes\n- Single-file bug fix with clear stack trace\n- The correct approach is already known\n\n**Combination pattern:** plan mode for investigation → direct execution for implementation.",
        contentEs: "**Modo plan cuando:**\n- Tareas complejas con cambios a gran escala\n- Multiples approaches validos existen\n- Se requieren decisiones arquitecturales\n- Modificaciones multi-archivo (45+ archivos)\n\n**Ejecucion directa cuando:**\n- Cambios bien entendidos con alcance limitado\n- Bug fix en un solo archivo con stack trace claro\n- El approach correcto ya se conoce\n\n**Patron combinado:** modo plan para investigacion → ejecucion directa para implementacion.",
      },
      {
        title: "CI/CD Integration",
        titleEs: "Integracion CI/CD",
        content: "- **`-p` flag:** non-interactive mode. Without it, CI hangs waiting for input. Memorize this.\n- **`--output-format json` + `--json-schema`:** machine-parseable structured output for automated PR comments\n- **Session context isolation:** same session that generated code is LESS effective at reviewing it (retains reasoning context). Use independent review instance.\n- **Incremental reviews:** include prior findings, instruct to report only new/unaddressed issues.",
        contentEs: "- **Flag `-p`:** modo no interactivo. Sin este, CI se cuelga esperando input. Memorizar.\n- **`--output-format json` + `--json-schema`:** output estructurado parseable por maquina para comentarios automaticos en PRs\n- **Aislamiento de contexto de sesion:** la misma sesion que genero codigo es MENOS efectiva revisandolo (retiene contexto de razonamiento). Usar instancia independiente de review.\n- **Reviews incrementales:** incluir hallazgos previos, instruir a reportar solo issues nuevos/no resueltos.",
      },
    ],
    antiPatterns: [
      {
        pattern: "Putting team standards in user-level config (~/.claude/CLAUDE.md)",
        patternEs: "Poner estandares del equipo en config a nivel de usuario (~/.claude/CLAUDE.md)",
        why: "Not version-controlled, not shared. New team members won't receive instructions.",
        whyEs: "No versionado, no compartido. Nuevos miembros del equipo no recibiran las instrucciones.",
      },
      {
        pattern: "Using directory-level CLAUDE.md for conventions spanning many directories",
        patternEs: "Usar CLAUDE.md de directorio para convenciones que abarcan muchos directorios",
        why: "Directory-bound. Path-specific rules with glob patterns apply across the entire codebase.",
        whyEs: "Limitado al directorio. Reglas path-specific con patrones glob aplican en todo el codebase.",
      },
      {
        pattern: "Same session generating and reviewing code",
        patternEs: "Misma sesion generando y revisando codigo",
        why: "Retains reasoning context, less likely to question own decisions. Use independent instance.",
        whyEs: "Retiene contexto de razonamiento, menos probable que cuestione sus propias decisiones. Usar instancia independiente.",
      },
    ],
    examTraps: [
      { trap: "Running Claude Code in CI without -p flag — hangs waiting for interactive input", trapEs: "Ejecutar Claude Code en CI sin flag -p — se cuelga esperando input interactivo" },
      { trap: "Skills in .claude/skills/ presented as solution for universal standards — those belong in CLAUDE.md", trapEs: "Skills en .claude/skills/ presentados como solucion para estandares universales — esos van en CLAUDE.md" },
    ],
    buildExercise: "Set up a project with CLAUDE.md hierarchy (project + directory level), .claude/rules/ with glob patterns for test files (**/*.test.tsx) and API files (src/api/**/*), a custom skill with context: fork and allowed-tools restrictions, and a CI script using -p flag with --output-format json.",
    buildExerciseEs: "Configurar un proyecto con jerarquia CLAUDE.md (nivel proyecto + directorio), .claude/rules/ con patrones glob para archivos de test (**/*.test.tsx) y archivos API (src/api/**/*), un skill custom con context: fork y restricciones de allowed-tools, y un script CI usando flag -p con --output-format json.",
    resources: [
      { title: "Claude Code Official Docs", url: "https://code.claude.com/docs/en/mcp" },
      { title: "Claude Code CLI Cheatsheet", url: "https://shipyard.build/blog/claude-code-cheat-sheet/" },
      { title: "Creating the Perfect CLAUDE.md", url: "https://dometrain.com/blog/creating-the-perfect-claudemd-for-claude-code/" },
    ],
  },
  {
    domain: 4,
    name: "Prompt Engineering & Structured Output",
    weight: 20,
    keyRule: "Be explicit. \"Be conservative\" does not improve precision. Define exactly which issues to report vs skip, with concrete code examples for each severity level.",
    keyRuleEs: "Se explicito. \"Se conservador\" no mejora la precision. Define exactamente que issues reportar vs omitir, con ejemplos de codigo concretos para cada nivel de severidad.",
    concepts: [
      {
        title: "Explicit Criteria > Vague Instructions",
        titleEs: "Criterios explicitos > Instrucciones vagas",
        content: "**Wrong:** \"Be conservative.\" \"Only report high-confidence findings.\"\n**Right:** \"Flag comments only when claimed behavior contradicts actual code behavior. Report bugs and security vulnerabilities. Skip minor style preferences and local patterns.\"\n\n**False positive trust problem:** High false positive rates in one category destroy trust in ALL categories. Fix: temporarily disable high-FP categories while improving prompts.",
        contentEs: "**Mal:** \"Se conservador.\" \"Solo reporta hallazgos de alta confianza.\"\n**Bien:** \"Marca comentarios solo cuando el comportamiento declarado contradice el comportamiento real del codigo. Reporta bugs y vulnerabilidades de seguridad. Omite preferencias de estilo menores y patrones locales.\"\n\n**Problema de confianza por falsos positivos:** Altas tasas de falsos positivos en una categoria destruyen la confianza en TODAS las categorias. Solucion: deshabilitar temporalmente categorias con altos FP mientras se mejoran los prompts.",
      },
      {
        title: "Few-Shot Examples",
        titleEs: "Ejemplos Few-Shot",
        content: "**The highest-leverage technique tested.** Deploy when:\n- Detailed instructions alone produce inconsistent formatting\n- Model makes inconsistent judgment calls on ambiguous cases\n- Extraction produces empty/null for info that exists in the document\n\n**How to construct:**\n- 2-4 targeted examples for ambiguous scenarios\n- Show REASONING for why one action was chosen over alternatives\n- This teaches generalization to novel patterns, not just pattern-matching",
        contentEs: "**La tecnica de mayor impacto evaluada.** Usar cuando:\n- Instrucciones detalladas solas producen formato inconsistente\n- El modelo toma decisiones inconsistentes en casos ambiguos\n- La extraccion produce empty/null para info que existe en el documento\n\n**Como construir:**\n- 2-4 ejemplos enfocados para escenarios ambiguos\n- Mostrar RAZONAMIENTO de por que se eligio una accion sobre alternativas\n- Esto enseña generalizacion a patrones nuevos, no solo pattern-matching",
      },
      {
        title: "Structured Output via tool_use",
        titleEs: "Output estructurado via tool_use",
        content: "**Reliability hierarchy:**\n- `tool_use` with JSON schemas = eliminates syntax errors entirely\n- Prompt-based JSON = model can produce malformed JSON\n\n**What tool_use does NOT prevent:**\n- Semantic errors (line items don't sum to total)\n- Field placement errors (values in wrong fields)\n- Fabrication (model invents values for required fields)\n\n**Schema design:** nullable fields for absent data (prevents fabrication), \"unclear\" enum, \"other\" + detail string.",
        contentEs: "**Jerarquia de confiabilidad:**\n- `tool_use` con JSON schemas = elimina errores de sintaxis completamente\n- JSON basado en prompt = el modelo puede producir JSON malformado\n\n**Lo que tool_use NO previene:**\n- Errores semanticos (items no suman al total)\n- Errores de ubicacion de campos (valores en campos incorrectos)\n- Fabricacion (modelo inventa valores para campos requeridos)\n\n**Diseno de schema:** campos nullable para datos ausentes (previene fabricacion), enum \"unclear\", \"other\" + string de detalle.",
      },
      {
        title: "Message Batches API",
        titleEs: "Message Batches API",
        content: "- 50% cost savings\n- Up to 24-hour processing window, no latency SLA\n- Does NOT support multi-turn tool calling\n- Uses `custom_id` for correlating request/response pairs\n\n**Matching rule:**\n- Synchronous API → blocking workflows (pre-merge checks)\n- Batch API → latency-tolerant workflows (overnight reports, weekly audits)\n\n**Failure handling:** identify failed docs by `custom_id`, resubmit only failures with modifications.",
        contentEs: "- 50% de ahorro en costos\n- Ventana de procesamiento de hasta 24 horas, sin SLA de latencia\n- NO soporta tool calling multi-turn\n- Usa `custom_id` para correlacionar pares request/response\n\n**Regla de match:**\n- API sincrona → workflows bloqueantes (pre-merge checks)\n- Batch API → workflows tolerantes a latencia (reportes nocturnos, auditorias semanales)\n\n**Manejo de fallos:** identificar docs fallidos por `custom_id`, reenviar solo fallos con modificaciones.",
      },
    ],
    antiPatterns: [
      {
        pattern: "Using vague confidence-based filtering (\"only report high-confidence findings\")",
        patternEs: "Usar filtrado vago basado en confianza (\"solo reportar hallazgos de alta confianza\")",
        why: "Fails to improve precision. Specific categorical criteria work. Concrete code examples for each severity level work.",
        whyEs: "No mejora la precision. Criterios categoricos especificos funcionan. Ejemplos de codigo concretos para cada nivel de severidad funcionan.",
      },
      {
        pattern: "Retrying extraction when information is genuinely absent from source",
        patternEs: "Reintentar extraccion cuando la informacion genuinamente no esta en la fuente",
        why: "Retry-with-error-feedback works for format mismatches, NOT for absent information. Use nullable fields instead.",
        whyEs: "Retry-with-error-feedback funciona para desajustes de formato, NO para informacion ausente. Usar campos nullable en su lugar.",
      },
      {
        pattern: "Using Batch API for blocking pre-merge checks",
        patternEs: "Usar Batch API para pre-merge checks bloqueantes",
        why: "No guaranteed latency SLA. Processing can take up to 24 hours. Use synchronous API for blocking workflows.",
        whyEs: "Sin SLA de latencia garantizada. El procesamiento puede tomar hasta 24 horas. Usar API sincrona para workflows bloqueantes.",
      },
    ],
    examTraps: [
      { trap: "Manager proposes batch for everything to save 50% — correct answer keeps blocking workflows synchronous", trapEs: "Manager propone batch para todo para ahorrar 50% — respuesta correcta mantiene workflows bloqueantes sincronos" },
      { trap: "Self-review in same session presented as viable — independent instance catches more", trapEs: "Auto-review en la misma sesion presentado como viable — instancia independiente captura mas" },
    ],
    buildExercise: "Create an extraction tool with JSON schema (required, optional, nullable fields, enums with 'other' + detail). Implement validation-retry loop. Process 10 documents with few-shot examples for varied formats. Run a batch through the Batches API. Handle failures by custom_id.",
    buildExerciseEs: "Crear un tool de extraccion con JSON schema (campos required, optional, nullable, enums con 'other' + detalle). Implementar loop de validation-retry. Procesar 10 documentos con few-shot examples para formatos variados. Ejecutar un batch a traves del Batches API. Manejar fallos por custom_id.",
    resources: [
      { title: "Prompt Engineering Best Practices", url: "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview" },
      { title: "Tool Use Documentation", url: "https://platform.claude.com/docs/en/release-notes/overview" },
    ],
  },
  {
    domain: 5,
    name: "Context Management & Reliability",
    weight: 15,
    keyRule: "Progressive summarization kills transactional data. Fix: persistent \"case facts\" block with extracted amounts, dates, order numbers — never summarized, included in every prompt.",
    keyRuleEs: "La sumarizacion progresiva mata datos transaccionales. Solucion: bloque persistente de \"case facts\" con montos, fechas, numeros de orden extraidos — nunca sumarizado, incluido en cada prompt.",
    concepts: [
      {
        title: "Case Facts Pattern",
        titleEs: "Patron de Case Facts",
        content: "Extract transactional data into a persistent block:\n```\n=== CASE FACTS (do not summarize) ===\nCustomer: Jane Smith (ID: 12345)\nOrder: #8891, placed 2024-03-03\nAmount: $247.83\nIssue: Damaged item, requests refund\n===================================\n```\nInclude in every prompt. Never allow it to be summarized or compressed.",
        contentEs: "Extraer datos transaccionales en un bloque persistente:\n```\n=== CASE FACTS (no sumarizar) ===\nCliente: Jane Smith (ID: 12345)\nOrden: #8891, colocada 2024-03-03\nMonto: $247.83\nProblema: Articulo danado, solicita reembolso\n===================================\n```\nIncluir en cada prompt. Nunca permitir que sea sumarizado o comprimido.",
      },
      {
        title: "Lost-in-the-Middle Effect",
        titleEs: "Efecto lost-in-the-middle",
        content: "- Models process beginning and end of long inputs reliably\n- Findings buried in the middle may be missed\n- **Fix:** Place key summaries at the beginning. Use explicit section headers. Long documents at the top, queries at the bottom (up to 30% quality improvement).\n- Trim verbose tool results to only relevant fields before appending to context.",
        contentEs: "- Los modelos procesan el inicio y final de inputs largos de manera confiable\n- Hallazgos en el medio pueden perderse\n- **Solucion:** Colocar resumenes clave al inicio. Usar encabezados de seccion explicitos. Documentos largos arriba, queries abajo (hasta 30% de mejora en calidad).\n- Recortar resultados verbosos de tools a solo campos relevantes antes de agregar al contexto.",
      },
      {
        title: "Escalation Triggers",
        titleEs: "Disparadores de escalacion",
        content: "**Three VALID triggers:**\n1. Customer explicitly requests a human → honor immediately, do NOT attempt to resolve first\n2. Policy exceptions or gaps (request outside documented policy)\n3. Inability to make meaningful progress\n\n**Two UNRELIABLE triggers the exam will tempt you with:**\n1. Sentiment-based escalation (frustration ≠ case complexity)\n2. Self-reported confidence scores (model is incorrectly confident on hard cases)",
        contentEs: "**Tres disparadores VALIDOS:**\n1. Cliente explicitamente pide un humano → cumplir inmediatamente, NO intentar resolver primero\n2. Excepciones o vacios de politica (solicitud fuera de politica documentada)\n3. Incapacidad de hacer progreso significativo\n\n**Dos disparadores NO CONFIABLES con los que el examen te tentara:**\n1. Escalacion basada en sentimiento (frustracion ≠ complejidad del caso)\n2. Scores de confianza auto-reportados (modelo incorrectamente confiado en casos dificiles)",
      },
      {
        title: "Error Propagation",
        titleEs: "Propagacion de errores",
        content: "**Structured error context:**\n- Failure type (transient/validation/business/permission)\n- What was attempted (query, parameters)\n- Partial results gathered before failure\n- Potential alternative approaches\n\n**Two anti-patterns:**\n- Silent suppression: returning empty results as success → prevents recovery\n- Workflow termination: killing entire pipeline on single failure → wastes partial results",
        contentEs: "**Contexto de error estructurado:**\n- Tipo de fallo (transient/validation/business/permission)\n- Que se intento (query, parametros)\n- Resultados parciales recopilados antes del fallo\n- Approaches alternativos potenciales\n\n**Dos anti-patrones:**\n- Supresion silenciosa: retornar resultados vacios como exito → previene recuperacion\n- Terminacion del workflow: matar todo el pipeline por un solo fallo → desperdicia resultados parciales",
      },
      {
        title: "Information Provenance",
        titleEs: "Proveniencia de la informacion",
        content: "Each finding must include: claim + source URL + document name + excerpt + publication date.\n\n**Conflict handling:** Two sources report different statistics → annotate with BOTH values and attribution. Do NOT arbitrarily select one.\n\n**Temporal awareness:** Require publication dates. Different dates explain different numbers (not contradictions).\n\n**Content-appropriate rendering:** Financial = tables, News = prose, Technical = structured lists. Don't flatten everything.",
        contentEs: "Cada hallazgo debe incluir: afirmacion + URL fuente + nombre de documento + extracto + fecha de publicacion.\n\n**Manejo de conflictos:** Dos fuentes reportan estadisticas diferentes → anotar con AMBOS valores y atribucion. NO seleccionar uno arbitrariamente.\n\n**Conciencia temporal:** Requerir fechas de publicacion. Fechas diferentes explican numeros diferentes (no son contradicciones).\n\n**Renderizado apropiado:** Financiero = tablas, Noticias = prosa, Tecnico = listas estructuradas. No aplanar todo.",
      },
    ],
    antiPatterns: [
      {
        pattern: "Using sentiment analysis for escalation decisions",
        patternEs: "Usar analisis de sentimiento para decisiones de escalacion",
        why: "Frustration does not correlate with case complexity. A frustrated customer with a simple issue should get resolution, not escalation.",
        whyEs: "La frustracion no correlaciona con la complejidad del caso. Un cliente frustrado con un issue simple deberia obtener resolucion, no escalacion.",
      },
      {
        pattern: "Silently suppressing errors (returning empty results as success)",
        patternEs: "Suprimir errores silenciosamente (retornar resultados vacios como exito)",
        why: "Prevents any recovery. The coordinator cannot make informed decisions without knowing a failure occurred.",
        whyEs: "Previene cualquier recuperacion. El coordinador no puede tomar decisiones informadas sin saber que ocurrio un fallo.",
      },
      {
        pattern: "Arbitrarily selecting one value when sources conflict",
        patternEs: "Seleccionar arbitrariamente un valor cuando las fuentes conflictan",
        why: "Loses information. Annotate both values with source attribution and let the consumer decide.",
        whyEs: "Pierde informacion. Anotar ambos valores con atribucion de fuente y dejar que el consumidor decida.",
      },
    ],
    examTraps: [
      { trap: "Self-reported confidence scores presented as reliable escalation proxy — they are poorly calibrated", trapEs: "Scores de confianza auto-reportados presentados como proxy confiable de escalacion — estan pobremente calibrados" },
      { trap: "97% overall accuracy presented as sufficient — can hide 40% error rate on specific document types", trapEs: "97% de precision general presentado como suficiente — puede ocultar 40% de tasa de error en tipos de documento especificos" },
    ],
    buildExercise: "Build a coordinator with two subagents. Implement persistent case facts block. Simulate a timeout with structured error propagation (failure type, attempted query, partial results). Test with conflicting sources and verify synthesis preserves both values with attribution.",
    buildExerciseEs: "Construir un coordinador con dos subagentes. Implementar bloque persistente de case facts. Simular un timeout con propagacion de error estructurado (tipo de fallo, query intentado, resultados parciales). Probar con fuentes conflictivas y verificar que la sintesis preserva ambos valores con atribucion.",
    resources: [
      { title: "Building Agents with Claude Agent SDK", url: "https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk" },
      { title: "Agent SDK Session Docs", url: "https://platform.claude.com/docs/en/agent-sdk/overview" },
      { title: "Everything Claude Code Repo", url: "https://github.com/affaan-m/everything-claude-code" },
    ],
  },
];
