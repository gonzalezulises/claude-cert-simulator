// ============================================================
// Claude Certified Architect – Foundations
// Exam Mode Question Bank (60 questions, IDs E1-E5)
// ============================================================

import { Question } from "./questions";

// ============================================================
// DOMAIN 1 – Agentic Architecture & Orchestration (12 questions)
// ============================================================

const examDomain1Questions: Question[] = [
  {
    id: "E1-001",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.1",
    difficulty: "intermediate",
    question:
      "A Claude Code non-interactive run completes but the output object has `stop_reason: \"error_max_turns\"`. What does this indicate, and what is the correct next action?",
    options: [
      {
        id: "A",
        text: "The model hit its token limit — increase max_tokens and rerun",
      },
      {
        id: "B",
        text: "The agent reached the maximum allowed turn count without finishing the task — inspect the transcript, raise the turn limit or redesign the workflow to require fewer steps",
      },
      {
        id: "C",
        text: "The session was interrupted by a network error — simply retry the same request",
      },
      {
        id: "D",
        text: "The model refused to continue due to a safety violation — review the system prompt for policy issues",
      },
    ],
    correctAnswer: "B",
    explanation:
      "`error_max_turns` is a ResultMessage subtype indicating the agentic run hit the configured maximum turn count (not a token limit or network failure). The task did not complete. The correct response is to inspect what was accomplished, potentially raise the turn limit, or redesign the workflow to complete in fewer steps. It is distinct from `error_max_budget_usd` (cost limit) and `error_during_execution` (runtime exception).",
    keyConcept: "ResultMessage subtypes: error_max_turns vs other error subtypes",
  },
  {
    id: "E1-002",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.1",
    difficulty: "advanced",
    question:
      "A headless research pipeline returns a ResultMessage with `stop_reason: \"error_max_budget_usd\"` after processing 40 of 200 planned documents. The pipeline operator needs to know exactly how far it got before the budget was exhausted. Which approach best surfaces this information?",
    options: [
      {
        id: "A",
        text: "Catch the error and re-run from the beginning with a higher budget limit",
      },
      {
        id: "B",
        text: "Parse the full session transcript: tool calls and results are included, so the operator can determine the last successfully processed document before the budget was hit",
      },
      {
        id: "C",
        text: "Query Claude's `/sessions` endpoint for the cost breakdown per document",
      },
      {
        id: "D",
        text: "Set `stop_reason_detail: true` in the API request to get a cost breakdown",
      },
    ],
    correctAnswer: "B",
    explanation:
      "`error_max_budget_usd` means the cumulative USD cost ceiling was reached. The session transcript (available in the ResultMessage or via --output-format stream-json) contains all tool calls and results, allowing the operator to identify the last document that was processed. There is no `/sessions` cost endpoint or `stop_reason_detail` flag. Rerunning from the beginning would waste the work already completed.",
    keyConcept: "ResultMessage subtype error_max_budget_usd and transcript inspection",
  },
  {
    id: "E1-003",
    scenario: "Developer Productivity with Claude",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.2",
    difficulty: "intermediate",
    question:
      "You are configuring Claude Code for a CI/CD pipeline that should autonomously apply linting fixes, run tests, and commit changes — all without any human confirmation prompts. Which permission mode should you set?",
    options: [
      {
        id: "A",
        text: "`acceptEdits` — the agent accepts file edits but still prompts for shell commands",
      },
      {
        id: "B",
        text: "`plan` — the agent plans all actions upfront and then executes them",
      },
      {
        id: "C",
        text: "`bypassPermissions` — the agent skips all permission checks and runs fully autonomously",
      },
      {
        id: "D",
        text: "`dontAsk` — the agent suppresses confirmation dialogs while preserving safety checks",
      },
    ],
    correctAnswer: "C",
    explanation:
      "`bypassPermissions` disables all permission checks, allowing the agent to perform file edits, shell commands, and other actions without any confirmation prompts. This is the appropriate mode for fully automated CI/CD pipelines running in trusted, sandboxed environments. `acceptEdits` only suppresses file-edit prompts. `plan` shows an upfront plan but still requires approval. `dontAsk` is not a standard Claude Code permission mode.",
    keyConcept: "Permission modes: bypassPermissions for fully autonomous operation",
  },
  {
    id: "E1-004",
    scenario: "Developer Productivity with Claude",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.2",
    difficulty: "intermediate",
    question:
      "A developer wants Claude Code to propose a plan for a large refactoring task and show all intended tool calls before executing any of them, so the developer can review and cancel if needed. Which permission mode enables this workflow?",
    options: [
      {
        id: "A",
        text: "`default` — Claude asks for confirmation before each tool call",
      },
      {
        id: "B",
        text: "`plan` — Claude generates and displays all planned tool calls first, then waits for approval before executing",
      },
      {
        id: "C",
        text: "`acceptEdits` — Claude accepts all edits automatically and displays a summary at the end",
      },
      {
        id: "D",
        text: "`bypassPermissions` — Claude executes everything and provides a diff for review afterward",
      },
    ],
    correctAnswer: "B",
    explanation:
      "The `plan` permission mode is specifically designed for this workflow: Claude generates the full execution plan (all intended tool calls) and presents it to the user before executing any action. The user can review and cancel before anything is changed. `default` asks per-tool-call but does not give an upfront overview. `acceptEdits` auto-approves file changes without an upfront plan. `bypassPermissions` executes without any confirmation.",
    keyConcept: "Permission mode: plan for upfront review before execution",
  },
  {
    id: "E1-005",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.3",
    difficulty: "advanced",
    question:
      "You are designing an AgentDefinition for a document-summarization subagent. A colleague proposes giving this subagent the `Agent` tool so it can delegate difficult sections to further sub-subagents. Why is this proposal architecturally invalid in Claude Code?",
    options: [
      {
        id: "A",
        text: "The `Agent` tool is only available in the paid tier of Claude Code",
      },
      {
        id: "B",
        text: "Subagents defined via AgentDefinition cannot include the `Agent` tool in their allowedTools — only top-level orchestrators can spawn subagents",
      },
      {
        id: "C",
        text: "The `Agent` tool was deprecated in v2.1.63 and replaced with `Task`",
      },
      {
        id: "D",
        text: "Subagents can use the `Agent` tool but only if the parent explicitly grants delegated permissions",
      },
    ],
    correctAnswer: "B",
    explanation:
      "In Claude Code's agentic framework, subagents defined via AgentDefinition cannot create their own subagents — the `Agent` tool (or its predecessor `Task`) is not permitted in a subagent's allowedTools. This is a deliberate architectural constraint that prevents unbounded recursive spawning and keeps the orchestration graph manageable. Option C is misleading: in v2.1.63 the tool was renamed from `Task` to `Agent`, not deprecated. Option D describes a non-existent delegation mechanism.",
    keyConcept: "AgentDefinition constraint: subagents cannot spawn further subagents",
  },
  {
    id: "E1-006",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.3",
    difficulty: "basic",
    question:
      "In Claude Code v2.1.63, the tool used to spawn subagents was renamed. A developer updating an existing AgentDefinition configuration written before this version sees that `allowedTools: [\"Task\"]` is no longer recognized. What is the correct replacement?",
    options: [
      { id: "A", text: "Replace `\"Task\"` with `\"Spawn\"` — the new tool name for subagent creation" },
      { id: "B", text: "Replace `\"Task\"` with `\"Agent\"` — the tool was renamed from Task to Agent in v2.1.63" },
      { id: "C", text: "Remove the entry; subagent spawning is now automatic and does not require a tool" },
      { id: "D", text: "Replace `\"Task\"` with `\"SubAgent\"` — the new canonical name" },
    ],
    correctAnswer: "B",
    explanation:
      "In Claude Code v2.1.63, the `Task` tool was renamed to `Agent`. Any AgentDefinition that previously listed `\"Task\"` in allowedTools to permit subagent spawning must be updated to `\"Agent\"`. The functionality is identical; only the name changed. There is no `Spawn` or `SubAgent` tool name, and subagent spawning is not automatic.",
    keyConcept: "Task tool renamed to Agent in Claude Code v2.1.63",
  },
  {
    id: "E1-007",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.4",
    difficulty: "advanced",
    question:
      "A coordinator agent spawns a subagent to perform a 200-step analysis. When the subagent finishes, the coordinator receives a concise summary. A junior developer is surprised that the coordinator cannot see any of the 200 intermediate tool calls the subagent made. What is the correct explanation?",
    options: [
      {
        id: "A",
        text: "The subagent's full transcript is available in the coordinator's context window under a `subagent_transcript` key",
      },
      {
        id: "B",
        text: "Subagents return only their final result to the parent — not the full intermediate transcript — to preserve context efficiency",
      },
      {
        id: "C",
        text: "The coordinator must explicitly request the transcript by calling `get_subagent_logs(subagent_id)`",
      },
      {
        id: "D",
        text: "The full transcript is available but only in the raw API response, not in the Claude Code interface",
      },
    ],
    correctAnswer: "B",
    explanation:
      "By design, subagents return only their final result (a text summary or structured output) to the parent orchestrator. The intermediate tool calls, reasoning steps, and partial outputs within the subagent's execution are not propagated back. This is intentional: it keeps the coordinator's context window manageable and enforces clean boundaries between agents. There is no `get_subagent_logs` endpoint and no `subagent_transcript` key in the parent context.",
    keyConcept: "Subagents return only final result to parent, not full transcript",
  },
  {
    id: "E1-008",
    scenario: "Customer Support Resolution Agent",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.5",
    difficulty: "intermediate",
    question:
      "A subagent is launched by a coordinator that has a 5,000-token system prompt containing brand voice guidelines and escalation rules. After launch, the subagent asks a question that violates the escalation rules. What is the most likely cause?",
    options: [
      {
        id: "A",
        text: "The subagent's model version is different from the coordinator's and processes instructions differently",
      },
      {
        id: "B",
        text: "Subagents do not inherit the parent's system prompt or conversation history — they start with a fresh context and only receive what is explicitly passed in their task prompt",
      },
      {
        id: "C",
        text: "The coordinator must use `share_context: true` in the AgentDefinition to pass its system prompt",
      },
      {
        id: "D",
        text: "Subagents inherit the system prompt automatically but ignore instructions added after the first user turn",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Subagents operate in independent context windows. They do NOT receive the parent orchestrator's system prompt or conversation history. They only receive whatever is explicitly included in the task description passed to the Agent tool. If escalation rules are critical for the subagent, they must be included explicitly in that task prompt. There is no `share_context` flag and no automatic system prompt inheritance.",
    keyConcept: "Subagents do not inherit parent's system prompt or conversation history",
  },
  {
    id: "E1-009",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.6",
    difficulty: "basic",
    question:
      "A subagent launched in a project directory with a `.claude/CLAUDE.md` file containing coding standards. The coordinator that spawned this subagent has no relationship to that project's CLAUDE.md. When the subagent starts, does it see the project's CLAUDE.md?",
    options: [
      {
        id: "A",
        text: "No — subagents only read CLAUDE.md files explicitly listed in their system prompt",
      },
      {
        id: "B",
        text: "No — CLAUDE.md is a per-session document and subagents run in separate sessions",
      },
      {
        id: "C",
        text: "Yes — subagents automatically receive the CLAUDE.md from the project directory they operate in, even though they do not inherit the parent's system prompt",
      },
      {
        id: "D",
        text: "Yes — but only if the parent explicitly passes `inject_claude_md: true` in the AgentDefinition",
      },
    ],
    correctAnswer: "C",
    explanation:
      "Subagents receive the CLAUDE.md from the project directory they are operating in — this is injected automatically from disk, just as it is for any Claude Code session in that directory. This is independent of the parent's conversation. What subagents do NOT receive is the parent's system prompt or conversation history. CLAUDE.md injection is directory-based, not parent-inherited, and does not require any explicit flag.",
    keyConcept: "Subagents receive project CLAUDE.md from disk but not parent system prompt",
  },
  {
    id: "E1-010",
    scenario: "Developer Productivity with Claude",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.7",
    difficulty: "intermediate",
    question:
      "A long-running code migration task needs to process 500 files. After processing 200, the agent's context window is nearly full. A `SystemMessage` with `subtype: \"compact_boundary\"` is emitted. What does this event signal, and what is preserved after compaction?",
    options: [
      {
        id: "A",
        text: "The session is about to be terminated; nothing is preserved and the agent must restart from file 1",
      },
      {
        id: "B",
        text: "Context compaction is about to occur: the conversation history will be summarized, but CLAUDE.md will be re-injected from disk and survive intact",
      },
      {
        id: "C",
        text: "The agent's tool permissions are being reset to default values after the boundary",
      },
      {
        id: "D",
        text: "A new context window has started; both the conversation history and CLAUDE.md are discarded",
      },
    ],
    correctAnswer: "B",
    explanation:
      "A `SystemMessage` with `subtype: \"compact_boundary\"` signals that Claude Code is about to compact the context. After compaction, the conversation history is summarized (lossy compression), but CLAUDE.md is re-injected from disk and is fully preserved — it is never part of the compacted history. However, any instructions given only in the conversation (not in CLAUDE.md) may be lost after compaction. Tool permissions are not affected by compaction.",
    keyConcept: "compact_boundary SystemMessage: CLAUDE.md survives compaction, conversation may not",
  },
  {
    id: "E1-011",
    scenario: "Customer Support Resolution Agent",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.1",
    difficulty: "advanced",
    question:
      "An orchestration loop receives a ResultMessage with `stop_reason: \"error_during_execution\"`. The loop has retry logic, but the engineer wants to know whether retrying is safe. What does this stop reason indicate about retry safety?",
    options: [
      {
        id: "A",
        text: "It is always safe to retry because the error occurred before any tool calls executed",
      },
      {
        id: "B",
        text: "It is never safe to retry; the task must be restarted from the beginning manually",
      },
      {
        id: "C",
        text: "`error_during_execution` indicates a runtime exception occurred mid-execution — some tool calls may have already succeeded, so naive retry may cause duplicate side effects; idempotency checks are required",
      },
      {
        id: "D",
        text: "Retrying is safe because Claude Code automatically rolls back all side effects when this error occurs",
      },
    ],
    correctAnswer: "C",
    explanation:
      "`error_during_execution` means an exception occurred while the agent was running — potentially after several tool calls had already succeeded. Blindly retrying may cause duplicate writes, double-sends, or other side effects. Safe retry requires either idempotency in the downstream tools, checkpoint-aware retry logic that resumes from the last successful step, or a full rollback mechanism. Claude Code does not automatically roll back side effects.",
    keyConcept: "error_during_execution: idempotency required for safe retry",
  },
  {
    id: "E1-012",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.6",
    difficulty: "intermediate",
    question:
      "When configuring a non-interactive headless Claude Code run, an engineer needs to balance thoroughness with cost. The `effort` parameter can be set to `low`, `medium`, `high`, or `max`. For a quick, cost-sensitive summarization of 10 short documents, which level is most appropriate?",
    options: [
      {
        id: "A",
        text: "`max` — always use maximum effort to ensure the highest quality output",
      },
      {
        id: "B",
        text: "`high` — a good balance between quality and cost for most production tasks",
      },
      {
        id: "C",
        text: "`low` — appropriate for simple, cost-sensitive tasks where speed and economy matter more than deep reasoning",
      },
      {
        id: "D",
        text: "`medium` — the default; should always be used when in doubt",
      },
    ],
    correctAnswer: "C",
    explanation:
      "The `effort` parameter controls how much internal reasoning and exploration the model performs. `low` is appropriate for straightforward tasks like summarizing short documents where the overhead of extended reasoning would waste tokens and money. `max` is for highly complex tasks requiring deep analysis. `high` is for production tasks needing thorough reasoning. `medium` is a sensible default but not optimal for explicitly simple, cost-sensitive work.",
    keyConcept: "Effort levels: low for simple cost-sensitive tasks, max for complex deep reasoning",
  },
];

// ============================================================
// DOMAIN 2 – Tool Design & MCP Integration (12 questions)
// ============================================================

const examDomain2Questions: Question[] = [
  {
    id: "E2-001",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.2",
    difficulty: "advanced",
    question:
      "An MCP server's `query_database` tool encounters a SQL timeout. The server returns `{ \"isError\": true, \"content\": [...] }`. A separate scenario has the MCP transport layer itself failing to deliver the request. What is the critical architectural distinction between these two cases?",
    options: [
      {
        id: "A",
        text: "Both cases are equivalent — the client should retry in both scenarios",
      },
      {
        id: "B",
        text: "`isError: true` in the tool result is an LLM-visible error — Claude sees it and can reason about it. A JSON-RPC transport failure is invisible to Claude and must be handled by the MCP client layer before reaching the model",
      },
      {
        id: "C",
        text: "`isError: true` is only for HTTP errors; JSON-RPC errors handle all application logic failures",
      },
      {
        id: "D",
        text: "JSON-RPC errors propagate directly to the model's context window, while `isError` is only for logging",
      },
    ],
    correctAnswer: "B",
    explanation:
      "The MCP protocol distinguishes two error layers: `isError: true` in a tool result is a semantic, LLM-visible error — Claude receives it in its context and can reason about it, decide to retry, or take corrective action. A JSON-RPC error at the transport layer (e.g., the server is unreachable, malformed JSON) is a transport failure that the MCP client handles before the model sees anything. Conflating these leads to poor error handling: transport errors require infrastructure-level retry, while `isError` results require model-level reasoning.",
    keyConcept: "MCP isError (LLM-visible) vs JSON-RPC error (transport failure) distinction",
  },
  {
    id: "E2-002",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "intermediate",
    question:
      "Your team is deploying a new MCP server for a production application. The server will be accessed by Claude Code over a network. The technical lead says SSE transport is now legacy. What should you use instead, and why?",
    options: [
      {
        id: "A",
        text: "stdio — it is the most performant transport for network-deployed servers",
      },
      {
        id: "B",
        text: "HTTP (Streamable HTTP) — it is the current recommended transport for network-deployed MCP servers, replacing the deprecated SSE transport",
      },
      {
        id: "C",
        text: "WebSocket — it is the replacement for SSE in the MCP specification",
      },
      {
        id: "D",
        text: "gRPC — the newest MCP transport for high-throughput production use",
      },
    ],
    correctAnswer: "B",
    explanation:
      "The MCP specification identifies three transport types: HTTP (Streamable HTTP, recommended for network-deployed servers), SSE (deprecated, being phased out), and stdio (for local process-based servers). SSE has been superseded by Streamable HTTP, which supports both streaming and standard request/response patterns. stdio is for locally spawned processes, not network servers. WebSocket and gRPC are not MCP transport types.",
    keyConcept: "MCP transport types: HTTP (recommended), SSE (deprecated), stdio (local)",
  },
  {
    id: "E2-003",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "intermediate",
    question:
      "A developer has an MCP server defined at the user level in `~/.claude.json`, the same server also configured at the project level in `.mcp.json`, and a third, local override in a `.claude/` local config. When all three configurations conflict on a setting for that server, which one wins?",
    options: [
      {
        id: "A",
        text: "User level (`~/.claude.json`) — user preferences always take precedence",
      },
      {
        id: "B",
        text: "Project level (`.mcp.json`) — project configuration overrides personal settings",
      },
      {
        id: "C",
        text: "Local level (`.claude/` local config) — local scope takes highest precedence, then project, then user",
      },
      {
        id: "D",
        text: "The last-loaded configuration wins, which depends on the file system ordering",
      },
    ],
    correctAnswer: "C",
    explanation:
      "MCP scope precedence follows a strict hierarchy: local > project > user. A local configuration (stored in the `.claude/` directory's local settings) overrides both the project-level `.mcp.json` and the user-level `~/.claude.json`. This mirrors how most configuration layering systems work — more specific, closer-to-code configs take precedence over broader defaults. The ordering is deterministic, not file-system-dependent.",
    keyConcept: "MCP scope precedence: local > project > user",
  },
  {
    id: "E2-004",
    scenario: "Multi-Agent Research System",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "advanced",
    question:
      "A context window usage alert fires when a research agent with 12 active MCP servers begins a task. The agent has not yet processed any documents. What is the most likely architectural cause of the high initial context usage?",
    options: [
      {
        id: "A",
        text: "The system prompt is too long and should be shortened",
      },
      {
        id: "B",
        text: "Each MCP server adds ALL of its tool schemas to EVERY request — with 12 servers each having multiple tools, the combined schema overhead consumes significant context before any task content is processed",
      },
      {
        id: "C",
        text: "The agent's conversation history from a previous session is being re-injected",
      },
      {
        id: "D",
        text: "The model's tokenizer is inefficient at encoding JSON tool schemas",
      },
    ],
    correctAnswer: "B",
    explanation:
      "MCP tool schemas are injected into every request for every connected server. With 12 MCP servers, each potentially defining 5–20 tools with parameter schemas, descriptions, and type definitions, the cumulative token overhead before any user content is processed can be thousands of tokens. This is a critical architectural consideration: reduce the number of active MCP servers, use ToolSearch activation, or limit active servers to those needed for the current task.",
    keyConcept: "MCP tool schemas consume context per request; each server adds ALL its schemas",
  },
  {
    id: "E2-005",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "advanced",
    question:
      "An agent is running with 15 MCP servers active. A senior engineer says ToolSearch should activate automatically to manage the tool overload. At what context window utilization does ToolSearch typically activate, and how can it be force-enabled?",
    options: [
      {
        id: "A",
        text: "ToolSearch activates at 50% context utilization; set `TOOL_SEARCH_THRESHOLD=0.5` to configure it",
      },
      {
        id: "B",
        text: "ToolSearch activates at >10% context window usage and can be force-enabled via the `ENABLE_TOOL_SEARCH` environment variable",
      },
      {
        id: "C",
        text: "ToolSearch activates only when explicitly called with `tool_search: true` in the API request",
      },
      {
        id: "D",
        text: "ToolSearch is always active and cannot be configured — it automatically selects the top 5 tools",
      },
    ],
    correctAnswer: "B",
    explanation:
      "ToolSearch is a context management mechanism that activates when context window utilization exceeds approximately 10%, helping the model prioritize which tools to include in the working set. It can be force-enabled regardless of utilization using the `ENABLE_TOOL_SEARCH` environment variable. This is important when you have many MCP servers and want to reduce per-request token consumption from schema injection. It does not have a configurable threshold via `TOOL_SEARCH_THRESHOLD`.",
    keyConcept: "ToolSearch activates at >10% context window, configurable via ENABLE_TOOL_SEARCH",
  },
  {
    id: "E2-006",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "intermediate",
    question:
      "A `.mcp.json` file configures an MCP server that requires an API key. The team wants a fallback value of `dev-key-local` when the environment variable `API_KEY` is not set, for local development convenience. Which variable expansion syntax achieves this?",
    options: [
      {
        id: "A",
        text: "`${API_KEY || dev-key-local}` — JavaScript-style OR operator",
      },
      {
        id: "B",
        text: "`${API_KEY ?? dev-key-local}` — nullish coalescing operator",
      },
      {
        id: "C",
        text: "`${API_KEY:-dev-key-local}` — shell-style default value expansion",
      },
      {
        id: "D",
        text: "`$API_KEY?dev-key-local` — ternary expansion syntax",
      },
    ],
    correctAnswer: "C",
    explanation:
      ".mcp.json supports two variable expansion syntaxes: `${VAR}` for simple substitution and `${VAR:-default}` for substitution with a fallback value when the variable is unset or empty. The `:-` notation is borrowed from POSIX shell parameter expansion. JavaScript-style operators (`||`, `??`) are not supported. There is no ternary `?` syntax in .mcp.json variable expansion.",
    keyConcept: "Variable expansion syntax: ${VAR} and ${VAR:-default} in .mcp.json",
  },
  {
    id: "E2-007",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "intermediate",
    question:
      "A developer writes the following `.mcp.json` snippet:\n```json\n{\n  \"mcpServers\": {\n    \"my-api\": {\n      \"url\": \"${API_BASE_URL}/v2\",\n      \"headers\": {\n        \"Authorization\": \"Bearer ${AUTH_TOKEN}\"\n      }\n    }\n  }\n}\n```\nWhich fields support variable expansion in this configuration?",
    options: [
      {
        id: "A",
        text: "Only the `url` field supports variable expansion; headers must use literal values",
      },
      {
        id: "B",
        text: "Variable expansion works in `url`, `headers`, `command`, `args`, and `env` fields of .mcp.json",
      },
      {
        id: "C",
        text: "Variable expansion is only supported in the `env` field; use env vars indirectly for other fields",
      },
      {
        id: "D",
        text: "Variable expansion works everywhere in .mcp.json including in server names and root keys",
      },
    ],
    correctAnswer: "B",
    explanation:
      "The `.mcp.json` variable expansion feature supports `${VAR}` and `${VAR:-default}` syntax in the following specific fields: `command`, `args`, `env`, `url`, and `headers`. This covers both stdio-based servers (command/args/env) and HTTP-based servers (url/headers). Variable expansion does not apply to the server name keys or other structural fields in the JSON. The example correctly uses expansion in both `url` and `headers`.",
    keyConcept: "Variable expansion supported in: command, args, env, url, headers in .mcp.json",
  },
  {
    id: "E2-008",
    scenario: "Customer Support Resolution Agent",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.3",
    difficulty: "advanced",
    question:
      "You define a tool with `strict: true` in its schema definition. A colleague asks what guarantee this provides and what limitations it introduces. Which answer is most accurate?",
    options: [
      {
        id: "A",
        text: "`strict: true` guarantees the model always calls this tool and ignores other tools",
      },
      {
        id: "B",
        text: "`strict: true` enables constrained decoding, guaranteeing the tool call output conforms exactly to the schema — but the schema must follow strict mode limitations: all properties required, no additionalProperties, and no use of patterns like `allOf`/`anyOf`",
      },
      {
        id: "C",
        text: "`strict: true` validates the schema at definition time but provides no runtime guarantees",
      },
      {
        id: "D",
        text: "`strict: true` enables schema validation on both input and output, doubling the latency",
      },
    ],
    correctAnswer: "B",
    explanation:
      "`strict: true` on a tool definition enables constrained decoding: the model's token generation is constrained to only produce outputs that are valid against the JSON schema. This is a strong runtime guarantee of schema compliance. However, it comes with schema limitations: all object properties must be listed in `required`, `additionalProperties` must be `false`, and combiners like `allOf`, `anyOf`, `oneOf` are not supported. Features like `minimum`/`maximum`, `minLength`, `maxLength`, `pattern`, and `const` are also unavailable in strict mode.",
    keyConcept: "strict: true enables constrained decoding with specific schema limitations",
  },
  {
    id: "E2-009",
    scenario: "Customer Support Resolution Agent",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.3",
    difficulty: "intermediate",
    question:
      "A developer tries to add a `pattern` constraint to a JSON tool schema with `strict: true` to enforce that a phone number field matches `^\\+[1-9]\\d{1,14}$`. The tool definition is rejected. What is the correct approach?",
    options: [
      {
        id: "A",
        text: "Use `minLength` and `maxLength` instead of `pattern` to constrain the phone number field",
      },
      {
        id: "B",
        text: "Switch to `strict: false` to allow `pattern`, then use server-side validation in the tool handler to enforce the format",
      },
      {
        id: "C",
        text: "Nest the pattern inside a `oneOf` schema combiner, which is allowed in strict mode",
      },
      {
        id: "D",
        text: "Add the regex pattern to the field description — the model will follow it via instruction following rather than constrained decoding",
      },
    ],
    correctAnswer: "B",
    explanation:
      "In `strict: true` mode, `pattern`, `minLength`, `maxLength`, `minimum`, `maximum`, `const`, and schema combiners (`allOf`, `anyOf`, `oneOf`) are not supported. If you need regex-level validation, the options are: (1) use `strict: false` and implement the validation in the tool handler server-side, or (2) use `strict: false` and rely on the model's instruction following. Option A is wrong because `minLength`/`maxLength` are also unavailable in strict mode. Option C is wrong because `oneOf` is not allowed in strict mode either.",
    keyConcept: "Strict mode schema limitations: no pattern, minLength, maxLength, combiners",
  },
  {
    id: "E2-010",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "basic",
    question:
      "A developer at a company wants to enforce a mandatory MCP security-scanning server for all Claude Code users on company macOS machines, without relying on each developer to configure it themselves. Where should this managed policy server be configured?",
    options: [
      {
        id: "A",
        text: "In the project's `.mcp.json` — it will be committed to every repo and automatically applied",
      },
      {
        id: "B",
        text: "In `~/.claude.json` on each developer's machine using an onboarding script",
      },
      {
        id: "C",
        text: "In `/Library/Application Support/ClaudeCode/CLAUDE.md` — the managed policy location on macOS that is controlled by IT and cannot be overridden by users",
      },
      {
        id: "D",
        text: "In `/etc/claude/policy.json` — the system-wide policy file for Claude Code",
      },
    ],
    correctAnswer: "C",
    explanation:
      "On macOS, `/Library/Application Support/ClaudeCode/CLAUDE.md` is the managed policy location for Claude Code. IT departments can deploy configuration here (via MDM or similar tools), and this file takes precedence over user-level and project-level settings. Users cannot override managed policy. `.mcp.json` requires the file to be present in each repo. `~/.claude.json` is per-user and can be modified. `/etc/claude/policy.json` is not a real Claude Code path.",
    keyConcept: "Managed policy CLAUDE.md at /Library/Application Support/ClaudeCode/ on macOS",
  },
  {
    id: "E2-011",
    scenario: "Multi-Agent Research System",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "advanced",
    question:
      "Your team's MCP server registry grows to 8 servers, each with an average of 12 tools. Before any user prompt is processed, you observe the request already consumes a significant portion of the context window. You want to use ToolSearch to mitigate this but need to understand its limits. Which statement is accurate?",
    options: [
      {
        id: "A",
        text: "ToolSearch eliminates tool schema context consumption entirely — schemas are only loaded when a tool is actually called",
      },
      {
        id: "B",
        text: "ToolSearch reduces the active tool set to the most relevant tools for the current request, decreasing per-request schema overhead, but some baseline schema context is still consumed",
      },
      {
        id: "C",
        text: "ToolSearch replaces all tool schemas with a single universal tool that accepts any JSON input",
      },
      {
        id: "D",
        text: "ToolSearch only works with stdio-based MCP servers; HTTP servers must include all tool schemas always",
      },
    ],
    correctAnswer: "B",
    explanation:
      "ToolSearch is a retrieval mechanism that selects the most contextually relevant tools from the full registry and includes only those schemas in a given request. This reduces (but does not eliminate) schema context consumption. A baseline set of tool descriptions is still needed to enable the search itself. ToolSearch works independently of transport type (stdio vs HTTP). There is no universal JSON input tool that replaces all schemas.",
    keyConcept: "ToolSearch reduces but does not eliminate tool schema context consumption",
  },
  {
    id: "E2-012",
    scenario: "Customer Support Resolution Agent",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "basic",
    question:
      "A support agent's MCP server is deployed locally alongside Claude Code on the same machine (not over a network). Which transport type is most appropriate for this deployment?",
    options: [
      { id: "A", text: "HTTP — always use HTTP for production deployments regardless of topology" },
      { id: "B", text: "SSE — the legacy transport is still required for local servers" },
      {
        id: "C",
        text: "stdio — the appropriate transport for locally spawned process-based MCP servers",
      },
      { id: "D", text: "WebSocket — the lowest-latency option for local inter-process communication" },
    ],
    correctAnswer: "C",
    explanation:
      "stdio transport is designed for MCP servers that run as local processes, spawned and managed by Claude Code on the same machine. Communication happens over standard input/output pipes. HTTP transport is for network-deployed servers. SSE is deprecated. WebSocket is not an MCP transport type. For co-located local servers, stdio is the correct and most efficient choice.",
    keyConcept: "MCP stdio transport for local process-based servers",
  },
];

// ============================================================
// DOMAIN 3 – Claude Code Configuration & Workflows (12 questions)
// ============================================================

const examDomain3Questions: Question[] = [
  {
    id: "E3-001",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.1",
    difficulty: "intermediate",
    question:
      "A developer adds detailed project guidelines to the project's `CLAUDE.md`. Mid-session, the context window fills and compaction occurs. After compaction, the agent no longer follows the project guidelines. What is the root cause?",
    options: [
      {
        id: "A",
        text: "Compaction deletes the CLAUDE.md file from disk, requiring the developer to restore it from version control",
      },
      {
        id: "B",
        text: "The guidelines were not in CLAUDE.md but were given as a conversational instruction — compaction summarizes the conversation and those instructions are lost, while CLAUDE.md survives by being re-injected from disk",
      },
      {
        id: "C",
        text: "CLAUDE.md has a 200-line limit and the guidelines exceeded it, causing partial injection after compaction",
      },
      {
        id: "D",
        text: "Compaction only preserves the most recent 10 messages; any instructions given before that are lost",
      },
    ],
    correctAnswer: "B",
    explanation:
      "CLAUDE.md is re-injected from disk after every compaction event — it always survives. What is lost during compaction is conversation history, which is summarized (lossy). If the developer's guidelines were delivered as conversational messages rather than written into CLAUDE.md, they will not survive compaction. The fix is to put persistent instructions in CLAUDE.md. The 200-line guideline is a recommendation for keeping files manageable, not a hard limit that causes partial injection.",
    keyConcept: "CLAUDE.md survives compaction (re-injected from disk); conversational instructions do not",
  },
  {
    id: "E3-002",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.1",
    difficulty: "basic",
    question:
      "A team's project has grown and the CLAUDE.md file is now 450 lines long, covering coding standards, architecture decisions, testing conventions, security rules, and deployment procedures. Performance is degrading and context usage is high. What is the recommended approach?",
    options: [
      {
        id: "A",
        text: "Increase the max_tokens limit to accommodate the larger CLAUDE.md",
      },
      {
        id: "B",
        text: "Split the content into multiple topic-specific files in `.claude/rules/` subdirectories — Claude Code discovers them recursively and the main CLAUDE.md can use `@import` to reference them selectively",
      },
      {
        id: "C",
        text: "Compress the CLAUDE.md using a custom minifier to reduce token count while preserving meaning",
      },
      {
        id: "D",
        text: "Move half the content to the user-level `~/.claude/CLAUDE.md` so it is split between two files",
      },
    ],
    correctAnswer: "B",
    explanation:
      "The recommended approach for large CLAUDE.md files is to split content into topic-specific files under `.claude/rules/` subdirectories. Claude Code discovers these recursively. The main CLAUDE.md should stay under 200 lines (the target) and can use `@import` directives to selectively load additional rule files when relevant. This reduces per-request context consumption because not all rules need to be loaded for every task. Compressing or splitting between user and project levels would lose scoping clarity.",
    keyConcept: "CLAUDE.md target: <200 lines; use .claude/rules/ for overflow, discovered recursively",
  },
  {
    id: "E3-003",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.2",
    difficulty: "intermediate",
    question:
      "A skill file has the following frontmatter:\n```yaml\n---\ndisable-model-invocation: true\nuser-invocable: false\n---\n```\nWhat does this configuration specify about the skill's execution behavior?",
    options: [
      {
        id: "A",
        text: "The skill runs without any Claude model calls and cannot be triggered by users via slash commands",
      },
      {
        id: "B",
        text: "The skill disables all tools but still uses the model for reasoning; users cannot invoke it",
      },
      {
        id: "C",
        text: "The skill is hidden from the UI but can be invoked by agents with `user-invocable: false` overridden at runtime",
      },
      {
        id: "D",
        text: "The skill is deprecated and will be removed; `user-invocable: false` is the deprecation flag",
      },
    ],
    correctAnswer: "A",
    explanation:
      "`disable-model-invocation: true` means the skill executes its defined actions (shell commands, file operations, etc.) without making any Claude model API calls — it runs as pure automation. `user-invocable: false` means the skill does not appear in the slash command menu and cannot be directly triggered by users typing `/skill-name`; it can only be invoked programmatically by the system or other agents. Together, these define a non-interactive, automated skill.",
    keyConcept: "Skill frontmatter: disable-model-invocation suppresses model calls; user-invocable controls slash command visibility",
  },
  {
    id: "E3-004",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.2",
    difficulty: "advanced",
    question:
      "A skill needs to include the current git branch name in its execution context. The skill prompt reads:\n```\nYou are reviewing code on branch: !`git branch --show-current`\n```\nWhat does the `!\\`` `` syntax do at skill execution time?",
    options: [
      {
        id: "A",
        text: "It escapes the backtick to prevent shell injection and passes the literal string `git branch --show-current` to the model",
      },
      {
        id: "B",
        text: "It dynamically executes the shell command at skill load time and injects the command's stdout output into the skill context",
      },
      {
        id: "C",
        text: "It marks the command as a tool call that Claude will execute using the Bash tool during the conversation",
      },
      {
        id: "D",
        text: "It is a Markdown code span and has no special execution semantics",
      },
    ],
    correctAnswer: "B",
    explanation:
      "The `!\\`command\\`` syntax in CLAUDE.md and skill files is the dynamic context injection syntax. When the skill is loaded, Claude Code executes the shell command and replaces the `!\\`...\\`` expression with the command's stdout output. This allows skills and CLAUDE.md files to inject dynamic runtime information (like the current git branch, environment name, or tool versions) into the context. It is not a Bash tool call during the conversation and does not escape shell injection — it runs the command at load time.",
    keyConcept: "Dynamic context injection: !`command` syntax executes shell command at skill load time",
  },
  {
    id: "E3-005",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.2",
    difficulty: "intermediate",
    question:
      "A skill is defined with the following invocation signature:\n```\n/deploy $ARGUMENTS[0] to $ARGUMENTS[1]\n```\nA user types `/deploy main production`. What are the values of `$ARGUMENTS[0]` and `$ARGUMENTS[1]`?",
    options: [
      {
        id: "A",
        text: "`$ARGUMENTS[0]` = `main production` (full arguments string), `$ARGUMENTS[1]` = undefined",
      },
      {
        id: "B",
        text: "`$ARGUMENTS[0]` = `main`, `$ARGUMENTS[1]` = `production`",
      },
      {
        id: "C",
        text: "`$ARGUMENTS[0]` = `/deploy`, `$ARGUMENTS[1]` = `main`",
      },
      {
        id: "D",
        text: "Indexed arguments like `$ARGUMENTS[N]` are not supported; only `$ARGUMENTS` as a whole is",
      },
    ],
    correctAnswer: "B",
    explanation:
      "In Claude Code skills, `$ARGUMENTS` contains the full arguments string passed after the skill name. `$ARGUMENTS[N]` provides positional access to space-separated tokens: `$ARGUMENTS[0]` is the first token (`main`), `$ARGUMENTS[1]` is the second (`production`), and so on. `$N` (e.g., `$1`, `$2`) is an equivalent shorthand. The skill name itself is not included in the arguments. Both `$ARGUMENTS` (full string) and `$ARGUMENTS[N]` (indexed) are supported.",
    keyConcept: "Skill string substitutions: $ARGUMENTS (full), $ARGUMENTS[N] or $N (indexed positional)",
  },
  {
    id: "E3-006",
    scenario: "Claude Code for Continuous Integration",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.3",
    difficulty: "intermediate",
    question:
      "You need to run Claude Code non-interactively in a CI pipeline. The pipeline should receive real-time streaming output as JSON events. Which command-line flags enable this behavior?",
    options: [
      {
        id: "A",
        text: "`--headless --json-output` — headless disables the UI and json-output enables JSON streaming",
      },
      {
        id: "B",
        text: "`--output-format stream-json` — enables streaming JSON output for non-interactive/headless use",
      },
      {
        id: "C",
        text: "`--ci-mode --stream` — the dedicated CI mode flag with streaming enabled",
      },
      {
        id: "D",
        text: "`--no-interactive --format json` — the standard flags for CI JSON output",
      },
    ],
    correctAnswer: "B",
    explanation:
      "`--output-format stream-json` is the flag that enables streaming JSON output in Claude Code's headless mode. Each event (assistant message, tool call, tool result, completion) is emitted as a JSON object on a new line, enabling the CI pipeline to process events in real time. There is no `--headless`, `--ci-mode`, `--stream`, or `--no-interactive` flag for this purpose. The `--continue` flag can be combined with `--output-format stream-json` to resume a previous session.",
    keyConcept: "Headless mode: --output-format stream-json for real-time JSON event streaming",
  },
  {
    id: "E3-007",
    scenario: "Claude Code for Continuous Integration",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.3",
    difficulty: "intermediate",
    question:
      "A CI pipeline runs Claude Code with `--allowedTools Read,Grep,Glob`. During execution, Claude attempts to call the `Bash` tool to run a test suite. What happens?",
    options: [
      {
        id: "A",
        text: "The Bash tool call is queued and executed after the session ends as a post-run step",
      },
      {
        id: "B",
        text: "The Bash tool call is blocked — `--allowedTools` defines a whitelist and any tool not in the list is denied",
      },
      {
        id: "C",
        text: "The Bash tool call succeeds because `Bash` is a built-in tool that cannot be restricted",
      },
      {
        id: "D",
        text: "Claude is informed that Bash is unavailable and automatically substitutes with a `Read` call",
      },
    ],
    correctAnswer: "B",
    explanation:
      "`--allowedTools` creates an explicit whitelist of permitted tools for a Claude Code session. Any tool not listed — including built-in tools like Bash, Edit, and Write — is blocked. Claude will receive an error when attempting to use a denied tool and must reason about alternatives within the allowed set. There is no automatic substitution or bypass for built-in tools. This mechanism is used in CI to enforce the principle of least privilege.",
    keyConcept: "--allowedTools whitelist blocks any tool not explicitly permitted, including built-ins",
  },
  {
    id: "E3-008",
    scenario: "Claude Code for Continuous Integration",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.3",
    difficulty: "advanced",
    question:
      "A PreToolUse hook script exits with code 2 when it detects that Claude is about to delete a file outside the project directory. What is the effect of exit code 2 from a shell hook?",
    options: [
      {
        id: "A",
        text: "Exit code 2 indicates success with warnings — the tool call proceeds but a warning is logged",
      },
      {
        id: "B",
        text: "Exit code 2 blocks the tool call and surfaces the hook's stderr output to Claude as the reason for denial",
      },
      {
        id: "C",
        text: "Exit code 2 terminates the entire Claude Code session immediately",
      },
      {
        id: "D",
        text: "Exit code 2 is treated the same as exit code 0 — non-zero exit codes only differ in severity",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Claude Code shell hooks use a three-value exit code convention: exit code 0 means proceed (allow the tool call), exit code 2 means block (deny the tool call, and Claude receives the hook's stderr as the reason), and any other non-zero code means proceed but log the error. Exit code 2 is the specific value for programmatic blocking. This allows hooks to function as policy enforcement gates — the hook can explain exactly why a tool call was denied by writing to stderr.",
    keyConcept: "Hook exit codes: 0 (proceed), 2 (block with reason), other non-zero (proceed + log)",
  },
  {
    id: "E3-009",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.3",
    difficulty: "intermediate",
    question:
      "A development team wants to run a custom context-building script before any long Claude Code session to inject relevant project state. Which hook event fires exactly once at the very beginning of a Claude Code session?",
    options: [
      {
        id: "A",
        text: "`UserPromptSubmit` — fires when the first user message is submitted",
      },
      {
        id: "B",
        text: "`PreToolUse` — fires before the first tool call in the session",
      },
      {
        id: "C",
        text: "`SessionStart` — fires once when the Claude Code session is initialized",
      },
      {
        id: "D",
        text: "`SubagentStart` — fires at the beginning of any agent execution, including the top-level session",
      },
    ],
    correctAnswer: "C",
    explanation:
      "`SessionStart` fires exactly once when a Claude Code session initializes, before any user interaction. It is the correct hook for one-time setup actions like injecting environment context, initializing state files, or running pre-session scripts. `UserPromptSubmit` fires on each user message, not just the first. `PreToolUse` fires before tool calls, which have not yet occurred at session start. `SubagentStart` is specific to subagent lifecycle events, not the main session start.",
    keyConcept: "Hook events: SessionStart fires once at session initialization",
  },
  {
    id: "E3-010",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.3",
    difficulty: "advanced",
    question:
      "A security team wants to intercept all tool calls and make a real-time HTTP request to their audit service before each tool executes. Which hook type and event combination achieves this?",
    options: [
      {
        id: "A",
        text: "Hook type: `command`; event: `PostToolUse` — runs a shell script after each tool call to log it",
      },
      {
        id: "B",
        text: "Hook type: `http`; event: `PreToolUse` — sends an HTTP request to the audit service before each tool call, and can block the call by returning a non-200 response",
      },
      {
        id: "C",
        text: "Hook type: `prompt`; event: `PermissionRequest` — adds audit context to the permission dialog",
      },
      {
        id: "D",
        text: "Hook type: `agent`; event: `PreToolUse` — spawns an audit subagent before each tool call",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Claude Code supports four hook types: `command` (shell script), `http` (HTTP request), `prompt` (prompt injection), and `agent` (subagent invocation). For real-time HTTP audit calls before each tool executes, the `http` hook type on the `PreToolUse` event is the correct combination. The HTTP hook sends a request to the specified URL and can block the tool call if the response indicates denial. Using `PostToolUse` would be post-hoc and cannot block the call.",
    keyConcept: "Hook types: command, http, prompt, agent — http+PreToolUse for real-time audit blocking",
  },
  {
    id: "E3-011",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.2",
    difficulty: "advanced",
    question:
      "A skill needs to fork its execution into a new isolated context rather than continuing in the current conversation context. Which frontmatter key enables this behavior?",
    options: [
      {
        id: "A",
        text: "`model: claude-sonnet-4-5` — specifying a model causes the skill to run in a separate API call",
      },
      {
        id: "B",
        text: "`context: fork` — explicitly forks the execution into a new isolated context window",
      },
      {
        id: "C",
        text: "`agent: true` — marks the skill as an agent, which automatically receives a fresh context",
      },
      {
        id: "D",
        text: "`user-invocable: false` — non-user-invocable skills always run in isolated contexts",
      },
    ],
    correctAnswer: "B",
    explanation:
      "`context: fork` in a skill's frontmatter causes the skill to execute in a new, isolated context window forked from the current session state. This is distinct from the default behavior of continuing in the same conversation context. It is useful for skills that need to do exploratory work without polluting the main conversation, or for skills that need a clean context for accurate reasoning. `model:` specifies which model to use, not whether to fork. `agent: true` marks the skill as an agent but does not imply context forking.",
    keyConcept: "Skill frontmatter: context: fork creates an isolated execution context",
  },
  {
    id: "E3-012",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.3",
    difficulty: "intermediate",
    question:
      "A headless Claude Code pipeline needs to continue a previous session by ID. The pipeline has the session ID from the previous run stored in a variable `$SESSION_ID`. Which flag resumes the session?",
    options: [
      {
        id: "A",
        text: "`--resume $SESSION_ID` — restores the exact conversation state of the specified session",
      },
      {
        id: "B",
        text: "`--session-id $SESSION_ID` — attaches to an existing session",
      },
      {
        id: "C",
        text: "`--continue $SESSION_ID` — the only flag that supports session resumption by ID in headless mode",
      },
      {
        id: "D",
        text: "`--restore $SESSION_ID` — the headless-specific resumption flag",
      },
    ],
    correctAnswer: "A",
    explanation:
      "`--resume` accepts a session ID to restore the conversation history of a previously saved session. In headless mode combined with `--output-format stream-json`, this allows a pipeline to continue a long-running task across multiple invocations. The `--continue` flag continues the most recent session without needing a specific ID. `--session-id`, `--restore`, and `--attach` are not valid Claude Code flags.",
    keyConcept: "Session resumption: --resume [session_id] restores a specific previous session",
  },
];

// ============================================================
// DOMAIN 4 – Prompt Engineering & Structured Outputs (18%)
// ============================================================

const examDomain4Questions: Question[] = [
  {
    id: "E4-001",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Outputs",
    taskStatement: "4.1",
    difficulty: "intermediate",
    question:
      "Your application was built on Claude 3.5 and relied on prefilled assistant responses (starting the assistant turn with partial JSON) to force structured output. You upgrade to Claude 4.6. What should you change in your integration?",
    options: [
      {
        id: "A",
        text: "Nothing — prefilled responses are fully supported in Claude 4.6 and remain the recommended approach",
      },
      {
        id: "B",
        text: "Prefilled responses are deprecated in Claude 4.6 — replace them with the `output_config.format` structured output feature or explicit instructions in the prompt",
      },
      {
        id: "C",
        text: "Increase the `max_tokens` limit; the deprecation only affects responses under 50 tokens",
      },
      {
        id: "D",
        text: "Move the prefilled content from the assistant turn to a tool result to maintain the same behavior",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Prefilled assistant responses (injecting partial text at the start of the assistant turn to guide output format) are deprecated in Claude 4.6 and later. The replacement approaches are: (1) use `output_config.format` with `type: \"json_schema\"` for guaranteed structured JSON output via constrained decoding, or (2) rely on Claude 4.6's improved instruction following with explicit format instructions in the prompt. The deprecation applies to all response sizes.",
    keyConcept: "Prefilled responses deprecated in Claude 4.6 — use structured outputs or instructions",
  },
  {
    id: "E4-002",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Outputs",
    taskStatement: "4.2",
    difficulty: "intermediate",
    question:
      "You need to extract structured order data from customer emails, guaranteed to match a specific JSON schema on every call. The schema includes `order_id`, `items`, `total`, and `shipping_address`. Which API configuration achieves a hard guarantee of schema compliance?",
    options: [
      {
        id: "A",
        text: "Add \"Respond only with valid JSON matching this schema: {...}\" to the system prompt",
      },
      {
        id: "B",
        text: "Use `output_config: { format: { type: \"json_schema\", schema: {...} } }` in the API request to enable constrained decoding",
      },
      {
        id: "C",
        text: "Set `response_format: { type: \"json_object\" }` to enable JSON mode",
      },
      {
        id: "D",
        text: "Use a tool with the schema defined as input parameters, then parse the tool call arguments as the structured output",
      },
    ],
    correctAnswer: "B",
    explanation:
      "`output_config.format.type = \"json_schema\"` with a provided schema enables constrained decoding — the model's token generation is constrained at the sampling layer to only produce tokens that are valid against the schema. This provides a hard, runtime guarantee of schema compliance, unlike prompt instructions (which rely on model behavior and can fail) or `json_object` mode (which guarantees valid JSON but not a specific schema shape). Tool calling with schema parameters is a valid alternative but adds roundtrip overhead.",
    keyConcept: "output_config.format.type = json_schema enables constrained decoding for schema compliance",
  },
  {
    id: "E4-003",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Outputs",
    taskStatement: "4.2",
    difficulty: "advanced",
    question:
      "A developer defines the following JSON schema for structured output:\n```json\n{\n  \"type\": \"object\",\n  \"properties\": {\n    \"status\": { \"type\": \"string\", \"enum\": [\"active\", \"inactive\"] },\n    \"count\": { \"type\": \"integer\", \"minimum\": 0, \"maximum\": 100 }\n  },\n  \"required\": [\"status\", \"count\"]\n}\n```\nThis schema is rejected when used with `strict: true`. Why?",
    options: [
      {
        id: "A",
        text: "The `enum` constraint on `status` is not supported in strict mode",
      },
      {
        id: "B",
        text: "`minimum` and `maximum` constraints on `count` are not supported in strict mode, and `additionalProperties: false` is missing",
      },
      {
        id: "C",
        text: "The schema uses `integer` type which is not supported — only `number` is allowed",
      },
      {
        id: "D",
        text: "The `required` array must be empty in strict mode",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Strict mode JSON schemas have specific limitations: `minimum`, `maximum`, `minLength`, `maxLength`, `pattern`, `const`, and schema combiners are not supported. Additionally, `additionalProperties: false` is required on all object types in strict mode. The schema fails for two reasons: (1) `count` uses `minimum` and `maximum` which are unsupported, and (2) the object is missing `additionalProperties: false`. `enum` is valid in strict mode. `integer` type is supported. All defined properties must be in `required`, which they are.",
    keyConcept: "Strict mode limitations: no minimum/maximum, additionalProperties must be false",
  },
  {
    id: "E4-004",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Outputs",
    taskStatement: "4.2",
    difficulty: "advanced",
    question:
      "A developer designs a structured output schema that includes a `Node` type which has a `children` field that is also an array of `Node` objects (a recursive tree structure). They attempt to use this with `strict: true`. What will happen?",
    options: [
      {
        id: "A",
        text: "It works correctly — constrained decoding handles recursive types with bounded depth automatically",
      },
      {
        id: "B",
        text: "The schema is rejected — circular/recursive references are not supported in strict mode constrained decoding",
      },
      {
        id: "C",
        text: "It works but only up to 3 levels of nesting; deeper trees are truncated",
      },
      {
        id: "D",
        text: "Recursive schemas require `circular: true` flag to be set in the schema definition",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Strict mode constrained decoding builds a finite state machine from the JSON schema at request time to constrain token generation. Circular/recursive references (where a type references itself) would create infinite state machines, which cannot be built. Therefore, circular references are explicitly unsupported in strict mode schemas. For tree structures, you must either use a non-strict schema (with server-side validation) or limit the depth by inlining the type up to a fixed depth rather than using recursive references.",
    keyConcept: "Strict mode does not support circular/recursive schema references",
  },
  {
    id: "E4-005",
    scenario: "Customer Support Resolution Agent",
    domain: 4,
    domainName: "Prompt Engineering & Structured Outputs",
    taskStatement: "4.3",
    difficulty: "intermediate",
    question:
      "A support ticket classification system needs to process 50,000 tickets overnight. Each ticket requires a single Claude call for classification. Using synchronous API calls, this takes 14 hours. What is the most appropriate API feature for this use case?",
    options: [
      {
        id: "A",
        text: "Increase the rate limit by contacting Anthropic support to allow faster synchronous throughput",
      },
      {
        id: "B",
        text: "Use the Batch API — submit all 50,000 requests in batches of up to 100,000, which processes asynchronously and typically completes within 1 hour at reduced cost",
      },
      {
        id: "C",
        text: "Use parallel synchronous API calls with 100 concurrent threads to achieve 100x throughput",
      },
      {
        id: "D",
        text: "Use streaming responses to reduce time-to-first-token for each ticket",
      },
    ],
    correctAnswer: "B",
    explanation:
      "The Batch API is designed exactly for high-volume, non-real-time workloads like overnight classification tasks. Key specifications: up to 100,000 requests or 256MB per batch, most batches complete within 1 hour (not 14 hours), results are available for 29 days, batches expire at 24 hours if not completed, and pricing is typically lower than synchronous calls. Parallel synchronous calls would hit rate limits. Streaming reduces latency but not throughput. Requesting rate limit increases is slow and expensive.",
    keyConcept: "Batch API: 100K requests/256MB per batch, <1 hour typical, results available 29 days",
  },
  {
    id: "E4-006",
    scenario: "Customer Support Resolution Agent",
    domain: 4,
    domainName: "Prompt Engineering & Structured Outputs",
    taskStatement: "4.3",
    difficulty: "intermediate",
    question:
      "A Batch API job is submitted at 9:00 AM Monday with 80,000 requests. It has not completed by 9:00 AM Tuesday. What happens to the batch, and when do results expire?",
    options: [
      {
        id: "A",
        text: "The batch continues indefinitely; there is no expiration",
      },
      {
        id: "B",
        text: "The batch expires and is cancelled at the 24-hour mark (9:00 AM Tuesday); any completed results are available for retrieval for 29 days from submission",
      },
      {
        id: "C",
        text: "The batch pauses after 12 hours and requires manual resumption; results expire 7 days after completion",
      },
      {
        id: "D",
        text: "The batch is automatically retried from scratch after 24 hours without user intervention",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Batch API jobs have a 24-hour processing window: if the batch has not completed within 24 hours of submission, it expires and is cancelled. Results for completed requests within an expired batch are still retrievable. The results themselves remain available for 29 days from the original submission date, after which they are deleted. There is no automatic retry or manual resumption mechanism — you must resubmit failed batches.",
    keyConcept: "Batch API: expires at 24h if incomplete, results available for 29 days from submission",
  },
  {
    id: "E4-007",
    scenario: "Multi-Agent Research System",
    domain: 4,
    domainName: "Prompt Engineering & Structured Outputs",
    taskStatement: "4.4",
    difficulty: "intermediate",
    question:
      "A research agent processes a 50-page technical document and then answers questions about it. Performance is poor and accuracy is low. A senior engineer suggests reordering the prompt. What is the recommended structure for long-document question answering?",
    options: [
      {
        id: "A",
        text: "Place the question first, followed by instructions, followed by the document",
      },
      {
        id: "B",
        text: "Interleave relevant document sections with each question for co-location of evidence and query",
      },
      {
        id: "C",
        text: "Place the long document at the top of the prompt, followed by instructions, with the specific query at the bottom",
      },
      {
        id: "D",
        text: "Place instructions at the top, document in the middle, and question at the bottom",
      },
    ],
    correctAnswer: "C",
    explanation:
      "Research on Claude's context handling shows that placing long documents at the top of the prompt, followed by task instructions, with the specific query at the very bottom can improve accuracy by up to 30% compared to other orderings. This structure mirrors how a human expert would work: absorb the full document context first, understand the task structure, then apply it to the specific question. Placing queries before the document means the model processes the question without the context it needs.",
    keyConcept: "Long documents at top, query at bottom — up to 30% accuracy improvement",
  },
  {
    id: "E4-008",
    scenario: "Customer Support Resolution Agent",
    domain: 4,
    domainName: "Prompt Engineering & Structured Outputs",
    taskStatement: "4.4",
    difficulty: "intermediate",
    question:
      "A support response generation prompt uses XML tags to structure its content:\n```xml\n<context>Customer has been a member since 2019...</context>\n<instructions>Draft a response that...</instructions>\n<input>Customer complaint: {{complaint}}</input>\n```\nWhy are XML tags preferred over plain delimiters for structuring complex prompts?",
    options: [
      {
        id: "A",
        text: "XML tags are required by the Anthropic API and plain text delimiters cause parsing errors",
      },
      {
        id: "B",
        text: "XML tags provide unambiguous, named semantic boundaries that Claude reliably parses — unlike markdown or plain delimiters which can appear naturally in content and cause boundary confusion",
      },
      {
        id: "C",
        text: "XML tags compress better and reduce token count compared to plain text delimiters",
      },
      {
        id: "D",
        text: "XML tags enable Claude to extract content programmatically via XPath in its internal processing",
      },
    ],
    correctAnswer: "B",
    explanation:
      "XML tags are recommended for structuring complex prompts because they provide named, semantic boundaries (`<context>`, `<instructions>`, `<input>`) that clearly delineate sections even when the section content itself contains similar-looking text. Markdown headers (`##`) or plain delimiters (`---`) can appear naturally in content, causing ambiguity about where one section ends and another begins. Claude's training includes XML-structured prompts and it reliably parses them. XML tags are not required by the API and do not affect token count.",
    keyConcept: "XML tags for unambiguous prompt structure: <example>, <instructions>, <context>, <input>",
  },
  {
    id: "E4-009",
    scenario: "Code Generation with Claude Code",
    domain: 4,
    domainName: "Prompt Engineering & Structured Outputs",
    taskStatement: "4.4",
    difficulty: "advanced",
    question:
      "A code generation prompt produces subtly incorrect outputs that are hard to catch. A prompt engineer proposes a 'self-check' pattern. What does this pattern involve, and why is it effective?",
    options: [
      {
        id: "A",
        text: "The self-check pattern calls the model twice — once to generate, once to validate — doubling cost but eliminating errors",
      },
      {
        id: "B",
        text: "The self-check pattern instructs the model to review its own output against specified criteria before finalizing it, catching errors through explicit second-pass reasoning in a single call",
      },
      {
        id: "C",
        text: "The self-check pattern adds a validation JSON schema that the model checks its output against automatically",
      },
      {
        id: "D",
        text: "The self-check pattern uses a `verify: true` flag in the API to enable internal consistency checking",
      },
    ],
    correctAnswer: "B",
    explanation:
      "The self-check pattern is a prompt engineering technique where, after generating an initial answer, the model is instructed (in the same prompt or as a follow-up turn) to re-read its output and check it against explicit criteria (e.g., 'Does this code handle the null case? Does it match the function signature?'). This leverages the model's reasoning ability to catch errors it might have made in initial generation. It is done in a single API call (as part of the prompt) or as a second turn, not through a separate API call, and does not require any special flags.",
    keyConcept: "Self-check pattern: model reviews its own output against criteria before finalizing",
  },
  {
    id: "E4-010",
    scenario: "Customer Support Resolution Agent",
    domain: 4,
    domainName: "Prompt Engineering & Structured Outputs",
    taskStatement: "4.4",
    difficulty: "advanced",
    question:
      "A team migrates their prompt from an older Claude version to Claude 4.6. A tool that was called ~60% of the time now fires on nearly every message, causing unexpected side effects. What is the most likely cause?",
    options: [
      {
        id: "A",
        text: "Claude 4.6 has a bug in tool selection that forces all tools to fire",
      },
      {
        id: "B",
        text: "The prompt was over-engineered for an older, less capable model — explicit tool-use instructions that were needed to trigger the tool now cause it to overtrigger in Claude 4.6's more capable instruction-following",
      },
      {
        id: "C",
        text: "The `tool_choice: auto` setting changed behavior between versions; set `tool_choice: none` to fix it",
      },
      {
        id: "D",
        text: "The model's context window is larger in 4.6 and it processes the tool description differently",
      },
    ],
    correctAnswer: "B",
    explanation:
      "A well-documented anti-pattern when upgrading to Claude 4.6 (or similar highly capable models) is over-prompting. Older, less capable models sometimes needed very explicit, detailed instructions to trigger tool calls reliably. When those same prompts are used with Claude 4.6's stronger instruction following, tools that previously undertriggered now overtrigger. The fix is to simplify the prompts — remove or soften the explicit trigger language that was compensating for the older model's limitations.",
    keyConcept: "Anti-pattern: over-prompting for Claude 4.6 causes tools that undertriggered before to overtrigger",
  },
  {
    id: "E4-011",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Outputs",
    taskStatement: "4.2",
    difficulty: "intermediate",
    question:
      "You are designing a JSON schema for structured extraction with `strict: true`. The schema needs an optional field `notes` that may or may not be present in the output. In standard JSON Schema, you would omit `notes` from `required`. What must you do differently in strict mode?",
    options: [
      {
        id: "A",
        text: "In strict mode, all properties defined in the schema MUST be in the `required` array — make `notes` required but allow `null` as its value using `type: [\"string\", \"null\"]`",
      },
      {
        id: "B",
        text: "Optional fields are expressed by setting `required: false` as a property-level flag",
      },
      {
        id: "C",
        text: "Optional fields are not supported in strict mode; remove `notes` from the schema entirely",
      },
      {
        id: "D",
        text: "Use `anyOf: [{\"type\": \"string\"}, {\"type\": \"null\"}]` for optional fields — anyOf is allowed for null handling",
      },
    ],
    correctAnswer: "A",
    explanation:
      "In strict mode, all properties defined in the `properties` object MUST appear in the `required` array — there are no optional fields in the standard sense. To represent 'optionality' (the value may or may not be meaningful), the canonical approach is to require the field but allow `null` as its type using `type: [\"string\", \"null\"]`. When no notes exist, the model outputs `null`. There is no `required: false` property-level flag, and `anyOf` is not supported in strict mode.",
    keyConcept: "Strict mode: all properties must be required; use type: [\"string\", \"null\"] for nullable optional fields",
  },
  {
    id: "E4-012",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Outputs",
    taskStatement: "4.3",
    difficulty: "advanced",
    question:
      "A Batch API job returns results with some requests showing `\"error_max_structured_output_retries\"` as the stop reason. What does this indicate, and what is the recommended fix?",
    options: [
      {
        id: "A",
        text: "The structured output schema was too large — reduce the number of fields",
      },
      {
        id: "B",
        text: "Claude attempted to generate valid structured output multiple times but failed to conform to the schema after the maximum allowed retry attempts — the schema may be too constraining or ambiguous for the given input",
      },
      {
        id: "C",
        text: "The batch exceeded the retry quota — wait 24 hours before resubmitting",
      },
      {
        id: "D",
        text: "The model was interrupted mid-generation; resubmit those specific requests individually",
      },
    ],
    correctAnswer: "B",
    explanation:
      "`error_max_structured_output_retries` is a ResultMessage subtype indicating that Claude attempted to generate output conforming to the specified JSON schema multiple times but failed to produce a valid result within the allowed retry budget. This typically occurs when the schema is highly constraining relative to the input content — for example, requiring enum values that don't match the actual data, or requiring fields that cannot be extracted from the source. The fix is to review the schema for overly restrictive constraints, simplify the schema, or improve the prompt to guide the model toward valid outputs.",
    keyConcept: "error_max_structured_output_retries: schema conformance repeatedly failed; review schema constraints",
  },
];

// ============================================================
// DOMAIN 5 – Context Management & Performance (17%)
// ============================================================

const examDomain5Questions: Question[] = [
  {
    id: "E5-001",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Performance",
    taskStatement: "5.1",
    difficulty: "basic",
    question:
      "A team is choosing between Claude Opus 4.6 and Claude Sonnet 4.5 for a long-document analysis task. The documents are 800,000 tokens each. Which models can handle this natively without special configuration?",
    options: [
      {
        id: "A",
        text: "Only Claude Opus 4.6 — Sonnet 4.5 has a 200K token limit and cannot process 800K token documents",
      },
      {
        id: "B",
        text: "Both Claude Opus 4.6 and Claude Sonnet 4.6 have 1M token context windows; Claude Sonnet 4.5 has 200K natively but can reach 1M with the extended context beta header",
      },
      {
        id: "C",
        text: "Neither can handle 800K tokens; documents must be chunked to under 200K regardless of model",
      },
      {
        id: "D",
        text: "All Claude 4.x models have 2M token context windows",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Context window specifications: Claude Opus 4.6 and Claude Sonnet 4.6 have native 1M token context windows. Claude Sonnet 4.5 and Claude 4 (non-4.6 suffix) have 200K token native context windows but can be extended to 1M tokens using the extended context beta request header. For an 800K token document, Opus 4.6 and Sonnet 4.6 handle it natively; Sonnet 4.5 requires the beta header. All Claude 4.x models are well below the 2M claim.",
    keyConcept: "Context windows: Opus 4.6/Sonnet 4.6 = 1M native; Sonnet 4.5/4 = 200K (1M with beta header)",
  },
  {
    id: "E5-002",
    scenario: "Developer Productivity with Claude",
    domain: 5,
    domainName: "Context Management & Performance",
    taskStatement: "5.2",
    difficulty: "intermediate",
    question:
      "Claude Code is processing a large codebase analysis task and starts receiving `<token_budget>` XML messages injected into its context. What does this mechanism do and why is it important?",
    options: [
      {
        id: "A",
        text: "It is a billing notification telling the model to reduce output verbosity to stay under budget",
      },
      {
        id: "B",
        text: "Claude receives `<token_budget>` XML with remaining budget information and usage updates after each tool call — this context awareness allows Claude to adjust its behavior (e.g., be more concise, stop spawning new subagents) as context fills",
      },
      {
        id: "C",
        text: "It is a user-configurable prompt element that restricts total output length",
      },
      {
        id: "D",
        text: "It triggers automatic compaction every time it appears in the context",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Claude Code's context management system injects `<token_budget>` XML into the context, providing Claude with information about the remaining token budget and usage updates after each tool call. This context awareness is by design: Claude can use this information to make informed decisions, such as writing shorter responses, avoiding spawning new subagents that would consume additional context, or prioritizing its remaining steps. It is not a billing notification, not user-configurable directly, and does not trigger compaction.",
    keyConcept: "Context awareness: Claude receives token_budget XML and usage updates after each tool call",
  },
  {
    id: "E5-003",
    scenario: "Developer Productivity with Claude",
    domain: 5,
    domainName: "Context Management & Performance",
    taskStatement: "5.2",
    difficulty: "advanced",
    question:
      "A team wants to implement custom compaction behavior — specifically, saving a structured summary to a file before compaction occurs, instead of relying on the default lossy summarization. Which hook enables this?",
    options: [
      {
        id: "A",
        text: "`PostToolUse` on any tool call — run the summary logic whenever any tool executes",
      },
      {
        id: "B",
        text: "`SessionStart` — run the summary logic at the beginning of each new session after compaction",
      },
      {
        id: "C",
        text: "`PreCompact` — fires before compaction occurs, allowing custom state preservation logic to run first",
      },
      {
        id: "D",
        text: "`compact_boundary` SystemMessage handler — intercept the system message and redirect compaction",
      },
    ],
    correctAnswer: "C",
    explanation:
      "The `PreCompact` hook fires specifically before Claude Code's context compaction process begins. This is the correct hook for implementing custom compaction behavior: the hook can write a structured summary, save key state to files, or perform any preservation logic before the conversation history is summarized. `PostToolUse` is too frequent and not triggered by compaction. `SessionStart` fires after compaction and a new session begins, which is too late. The `compact_boundary` SystemMessage is observable but not interceptable as a hook.",
    keyConcept: "PreCompact hook enables custom state preservation before context compaction",
  },
  {
    id: "E5-004",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Performance",
    taskStatement: "5.3",
    difficulty: "advanced",
    question:
      "A complex research workflow processes 500 documents across multiple sessions. The team is debating between: (A) using a single long-running session with compaction, or (B) spawning subagents for each batch, which return results to a coordinator. Which approach is more context-efficient and why?",
    options: [
      {
        id: "A",
        text: "Single session with compaction — it avoids overhead of spawning multiple agents and compaction preserves all relevant information",
      },
      {
        id: "B",
        text: "Subagents in fresh context windows — each subagent processes its batch in an isolated context, returns only the final result to the coordinator, preventing the coordinator's context from accumulating the full processing history",
      },
      {
        id: "C",
        text: "Both approaches are equivalent in context efficiency; choose based on code complexity",
      },
      {
        id: "D",
        text: "Single session is more efficient because context reuse across documents reduces per-document token cost",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Subagents in fresh context windows are significantly more context-efficient for large-scale processing. Each subagent starts with a clean context, processes its batch, and returns only the final result to the coordinator. The intermediate processing steps (100s of tool calls, partial results) never accumulate in the coordinator's context. With compaction, even though the history is summarized, information loss occurs and the coordinator's context still grows over time. The multi-context-window pattern is the recommended approach for workflows that exceed a single context window's capacity.",
    keyConcept: "Multi-context window workflows: subagents with fresh context preferred over compaction for scale",
  },
  {
    id: "E5-005",
    scenario: "Claude Code for Continuous Integration",
    domain: 5,
    domainName: "Context Management & Performance",
    taskStatement: "5.3",
    difficulty: "intermediate",
    question:
      "A CI pipeline runs multiple Claude Code sessions across different runs, and the team needs each session to know what tests were passing or failing in the previous run. The pipeline does not use session resumption. What is the most reliable state-passing mechanism across context windows?",
    options: [
      {
        id: "A",
        text: "Include the previous run's full conversation history in the new session's system prompt",
      },
      {
        id: "B",
        text: "Write a structured `tests.json` or `progress.txt` state file at the end of each run; the next session reads this file at startup to understand the previous state",
      },
      {
        id: "C",
        text: "Use the `--continue` flag to automatically inherit state from the previous session",
      },
      {
        id: "D",
        text: "Store state in environment variables that persist across CI runs",
      },
    ],
    correctAnswer: "B",
    explanation:
      "State files (e.g., `tests.json`, `progress.txt`) written to the filesystem are the recommended pattern for passing structured state across context window boundaries in multi-session workflows. Each session reads the state file at startup (via a SessionStart hook or initial tool call), processes its work, and writes an updated state file. This is explicit, inspectable, and does not depend on session continuity. Including full conversation history in system prompts is token-wasteful. `--continue` only resumes the immediately previous session. Environment variables are ephemeral in most CI systems.",
    keyConcept: "State files (tests.json, progress.txt) for reliable state tracking across context windows",
  },
  {
    id: "E5-006",
    scenario: "Code Generation with Claude Code",
    domain: 5,
    domainName: "Context Management & Performance",
    taskStatement: "5.3",
    difficulty: "intermediate",
    question:
      "A multi-session code refactoring workflow needs to track which files have been refactored across multiple Claude Code runs. The team considers using git as the state mechanism. Why is git particularly well-suited for this?",
    options: [
      {
        id: "A",
        text: "Git provides atomic file system operations that prevent context window overflow",
      },
      {
        id: "B",
        text: "Git commits create a persistent, queryable record of which files were changed in each session — the next session can run `git diff` or `git log` to discover exactly what was done and what remains",
      },
      {
        id: "C",
        text: "Git automatically injects commit history into Claude's context window via the CLAUDE.md system",
      },
      {
        id: "D",
        text: "Git's staging area serves as a cross-session memory store that Claude Code reads natively",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Git is an excellent cross-session state mechanism because commits create a persistent, content-addressable record of exactly what changed and when. The next Claude Code session can use `git status` to see uncommitted changes, `git log` to see what was completed in previous sessions, and `git diff` to understand the current state relative to any baseline. This gives Claude precise, queryable state information without consuming context window with raw conversation history. Git does not automatically inject into CLAUDE.md and its staging area is not a native Claude memory mechanism.",
    keyConcept: "Git as cross-session state tracking: git log/diff/status provides precise queryable history",
  },
  {
    id: "E5-007",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Performance",
    taskStatement: "5.1",
    difficulty: "advanced",
    question:
      "A research coordinator orchestrates 20 subagents. At the start of the session, before any documents are processed, the coordinator already has 15% context utilization. The coordinator has 12 MCP servers connected. What is the most likely primary contributor to the high baseline context usage?",
    options: [
      {
        id: "A",
        text: "The coordinator's system prompt is too long and must be shortened",
      },
      {
        id: "B",
        text: "The 20 subagent definitions are pre-loaded into the context window at session start",
      },
      {
        id: "C",
        text: "The 12 MCP servers each inject all of their tool schemas into every request, creating a high baseline of tool definition tokens before any task content is added",
      },
      {
        id: "D",
        text: "The CLAUDE.md file for the project is too large and consuming excessive context",
      },
    ],
    correctAnswer: "C",
    explanation:
      "Each MCP server injects all of its tool schemas (names, descriptions, parameter types, documentation) into every API request. With 12 servers, each potentially having 5–20 tools with detailed schemas, the combined tool definition context can easily reach thousands of tokens. This overhead is present on every request before any task content is processed, explaining the high baseline. Subagent definitions are not pre-loaded. System prompts and CLAUDE.md can contribute but are typically smaller than 12 servers' worth of tool schemas.",
    keyConcept: "Each MCP server adds ALL tool schemas to EVERY request — primary source of baseline context overhead",
  },
  {
    id: "E5-008",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Performance",
    taskStatement: "5.2",
    difficulty: "intermediate",
    question:
      "During a long research session, a `SystemMessage` with `subtype: \"compact_boundary\"` appears. The session had important findings shared in conversation messages (not in CLAUDE.md) and also had project-level CLAUDE.md instructions. After compaction, which elements survive intact and which are at risk?",
    options: [
      {
        id: "A",
        text: "Both conversation findings and CLAUDE.md survive — compaction only removes tool call details",
      },
      {
        id: "B",
        text: "CLAUDE.md survives intact (re-injected from disk after compaction); conversation messages including important findings are summarized lossy — some detail may be lost",
      },
      {
        id: "C",
        text: "Neither survives — compaction starts a completely fresh context with only the system prompt",
      },
      {
        id: "D",
        text: "CLAUDE.md is summarized like conversation messages; only the most recent 20 messages survive verbatim",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Compaction works as follows: CLAUDE.md is re-read from disk and injected fresh — it always survives verbatim. The conversation history (including important findings, intermediate results, and any instructions given conversationally) is summarized using a lossy compression. The summary preserves the overall narrative but may lose specific details, numbers, or conclusions. This is why critical information should be written to CLAUDE.md or state files rather than left in conversational messages if it needs to survive compaction.",
    keyConcept: "Compaction: CLAUDE.md survives verbatim; conversation history is lossy-summarized",
  },
  {
    id: "E5-009",
    scenario: "Developer Productivity with Claude",
    domain: 5,
    domainName: "Context Management & Performance",
    taskStatement: "5.3",
    difficulty: "advanced",
    question:
      "A complex analysis task is designed as a single long session but the team finds that after 60% of the task is done, the agent's quality degrades. The engineer proposes switching to a multi-context window workflow. What does this approach look like in practice?",
    options: [
      {
        id: "A",
        text: "Run the same prompt multiple times in separate sessions and merge the outputs by majority vote",
      },
      {
        id: "B",
        text: "Split the task into batches; each batch runs in a fresh session that starts by reading a state file (filesystem discovery), processes its work, and writes results back — no session history is carried across batches",
      },
      {
        id: "C",
        text: "Use the `--context-budget` flag to split the session budget across multiple API calls",
      },
      {
        id: "D",
        text: "Enable compaction on each API call individually rather than letting it accumulate",
      },
    ],
    correctAnswer: "B",
    explanation:
      "The multi-context window workflow pattern works as follows: divide the overall task into batches; each batch starts a fresh Claude Code session that begins by reading the current state from the filesystem (a state file, git status, or a structured output from the previous batch) rather than from conversation history; the session processes its batch and writes results back to the filesystem; the next session repeats this. This keeps each context window small and clean. There is no `--context-budget` flag and per-call compaction is not a configurable option.",
    keyConcept: "Multi-context window: fresh sessions + filesystem discovery preferred over long compacting sessions",
  },
  {
    id: "E5-010",
    scenario: "Customer Support Resolution Agent",
    domain: 5,
    domainName: "Context Management & Performance",
    taskStatement: "5.1",
    difficulty: "intermediate",
    question:
      "A support team is processing customer tickets with Claude Sonnet 4.5 and encounters a 180,000-token ticket thread that exceeds the model's native 200K context window with the system prompt added. They want to extend the context to 1M tokens. What is the correct technical approach?",
    options: [
      {
        id: "A",
        text: "Upgrade to Claude Sonnet 4.6 which has a native 1M context window",
      },
      {
        id: "B",
        text: "Add the extended context beta request header to unlock 1M tokens for Claude Sonnet 4.5",
      },
      {
        id: "C",
        text: "Enable `extended_context: true` in the .mcp.json MCP server configuration",
      },
      {
        id: "D",
        text: "Both A and B are valid options; A requires a model change, B extends the current model",
      },
    ],
    correctAnswer: "D",
    explanation:
      "Both approaches are technically valid for this scenario. Option A (upgrading to Claude Sonnet 4.6) natively supports 1M tokens without any additional configuration — straightforward and reliable. Option B (adding the extended context beta header) enables 1M token context for Claude Sonnet 4.5 without changing models, useful if there are cost, latency, or feature parity reasons to stay on 4.5. The choice depends on operational constraints. There is no `extended_context` setting in `.mcp.json`.",
    keyConcept: "Sonnet 4.5 reaches 1M tokens via beta header; Sonnet 4.6 has 1M natively",
  },
  {
    id: "E5-011",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Performance",
    taskStatement: "5.2",
    difficulty: "advanced",
    question:
      "An orchestrator receives `<token_budget remaining=\"45000\">` in its context while mid-way through spawning 8 more subagents (each estimated at ~10,000 tokens of result overhead). What should a well-designed orchestrator do with this information?",
    options: [
      {
        id: "A",
        text: "Ignore the budget information and continue spawning all 8 subagents as planned",
      },
      {
        id: "B",
        text: "Immediately trigger manual compaction before spawning any more subagents",
      },
      {
        id: "C",
        text: "Use the budget information to adapt: spawn only 4 of the 8 subagents (prioritizing the most critical ones), write intermediate results to a state file, and plan for continuation in a new context window for the remaining 4",
      },
      {
        id: "D",
        text: "Switch to using a model with a larger context window mid-session",
      },
    ],
    correctAnswer: "C",
    explanation:
      "Claude's context awareness (via `<token_budget>` XML) is designed to enable adaptive behavior. With 45,000 tokens remaining and 8 subagents each consuming ~10,000 tokens, spawning all 8 would exceed the budget (80,000 > 45,000). The well-designed response is to prioritize the most critical subagents, spawn only as many as the budget allows, persist intermediate results to a state file for durability, and gracefully plan for continuation in a new context window. You cannot switch models mid-session, and triggering compaction mid-task risks losing critical state.",
    keyConcept: "token_budget context awareness: adapt subagent spawning and plan graceful continuation",
  },
  {
    id: "E5-012",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Performance",
    taskStatement: "5.3",
    difficulty: "basic",
    question:
      "A data processing workflow needs to track which of 1,000 items have been processed across multiple Claude Code sessions. The team considers three options: (A) rely on Claude's memory within a single long session, (B) write a `progress.txt` file updated after each item, (C) use git commits after each batch. Which options are reliable across session restarts?",
    options: [
      {
        id: "A",
        text: "Only option A — Claude's in-context memory is the most accurate tracking mechanism",
      },
      {
        id: "B",
        text: "Only option B — text files are the only format Claude Code can read at session start",
      },
      {
        id: "C",
        text: "Options B and C — both filesystem-based approaches persist across sessions; option A is lost when the session ends or compacts",
      },
      {
        id: "D",
        text: "All three options are equally reliable across session restarts",
      },
    ],
    correctAnswer: "C",
    explanation:
      "In-session memory (option A) is lost when a Claude Code session ends and is degraded by compaction. It cannot reliably track state across multiple sessions. Filesystem-based approaches (B and C) persist independently of any Claude Code session: `progress.txt` is explicitly designed for this pattern, and git commits provide a queryable, version-controlled record of progress that any new session can inspect via `git log`. Both B and C are recommended patterns for cross-session state management.",
    keyConcept: "Filesystem-based state (progress.txt, git) survives session restarts; in-context memory does not",
  },
];

// ============================================================
// Combined export
// ============================================================

export const examQuestions: Question[] = [
  ...examDomain1Questions,
  ...examDomain2Questions,
  ...examDomain3Questions,
  ...examDomain4Questions,
  ...examDomain5Questions,
];
