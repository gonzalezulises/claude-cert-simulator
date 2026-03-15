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
      "`error_max_turns` is a ResultMessage subtype indicating the agentic run hit the configured maximum turn count (not a token limit or network failure). The task did not complete. The correct response is to inspect what was accomplished, potentially raise the turn limit, or redesign the workflow to complete in fewer steps. It is distinct from `error_max_budget_usd` (cost limit) and `error_during_execution` (runtime exception).\n\nHow to implement:\n```typescript\n// Handling error_max_turns in a Node.js orchestration loop\nimport Anthropic from \"@anthropic-ai/sdk\";\n\nconst client = new Anthropic();\n\nasync function runWithRetry(prompt: string, maxTurns = 20) {\n  const result = await client.beta.messages.create({\n    model: \"claude-opus-4-6\",\n    max_tokens: 4096,\n    // @ts-ignore – SDK typings may vary\n    max_turns: maxTurns,\n    messages: [{ role: \"user\", content: prompt }],\n  });\n\n  if (result.stop_reason === \"error_max_turns\") {\n    console.warn(`Agent hit turn limit (${maxTurns}). Inspecting transcript…`);\n    // Inspect last assistant message to find partial progress\n    const lastMsg = result.messages?.at(-1);\n    console.log(\"Last message:\", lastMsg?.content);\n    // Retry with a higher limit or redesigned workflow\n    return runWithRetry(prompt, maxTurns * 2);\n  }\n\n  return result;\n}\n```\n\nTo raise the turn limit via the CLI:\n```bash\nclaude --max-turns 50 \"Analyze all 200 documents and produce a summary\"\n```",
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
      "`error_max_budget_usd` means the cumulative USD cost ceiling was reached. The session transcript (available in the ResultMessage or via --output-format stream-json) contains all tool calls and results, allowing the operator to identify the last document that was processed. There is no `/sessions` cost endpoint or `stop_reason_detail` flag. Rerunning from the beginning would waste the work already completed.\n\nHow to implement:\n```bash\n# Stream JSON events to a file for later inspection\nclaude --output-format stream-json \\\n  --max-budget-usd 2.00 \\\n  \"Process all 200 documents\" > session-transcript.jsonl\n\n# Parse transcript to find last successfully processed doc\nnode -e \"\nconst lines = require('fs').readFileSync('session-transcript.jsonl','utf8').trim().split('\\n');\nconst toolResults = lines\n  .map(l => JSON.parse(l))\n  .filter(e => e.type === 'tool_result');\nconsole.log('Last tool result:', toolResults.at(-1));\n\"\n```\n\n```typescript\n// Programmatic budget-aware pipeline with checkpoint resumption\nasync function processBatch(docs: string[], budgetUsd: number) {\n  const result = await runHeadless({ docs, maxBudgetUsd: budgetUsd });\n  if (result.stop_reason === \"error_max_budget_usd\") {\n    const lastProcessed = extractLastProcessedDoc(result.transcript);\n    console.log(`Processed up to doc: ${lastProcessed}. Resume from next.`);\n    await saveCheckpoint(lastProcessed);\n  }\n}\n```",
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
      "`bypassPermissions` disables all permission checks, allowing the agent to perform file edits, shell commands, and other actions without any confirmation prompts. This is the appropriate mode for fully automated CI/CD pipelines running in trusted, sandboxed environments. `acceptEdits` only suppresses file-edit prompts. `plan` shows an upfront plan but still requires approval. `dontAsk` is not a standard Claude Code permission mode.\n\nHow to implement:\n```bash\n# CI/CD pipeline step — run fully autonomously inside a sandboxed runner\nclaude --permission-mode bypassPermissions \\\n  --output-format stream-json \\\n  \"Run eslint --fix on all TypeScript files, then run npm test, then commit changes\"\n```\n\n```typescript\n// SDK usage with bypassPermissions\nimport { query } from \"@anthropic-ai/claude-code\";\n\nconst result = await query({\n  prompt: \"Apply lint fixes and run tests\",\n  options: {\n    permissionMode: \"bypassPermissions\", // Only in sandboxed/trusted envs\n  },\n});\n```\n\n```yaml\n# GitHub Actions example\n- name: Claude Code Auto-Fix\n  run: |\n    claude --permission-mode bypassPermissions \\\n      \"Fix all eslint errors and run npm test\"\n  env:\n    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}\n```",
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
      "The `plan` permission mode is specifically designed for this workflow: Claude generates the full execution plan (all intended tool calls) and presents it to the user before executing any action. The user can review and cancel before anything is changed. `default` asks per-tool-call but does not give an upfront overview. `acceptEdits` auto-approves file changes without an upfront plan. `bypassPermissions` executes without any confirmation.\n\nHow to implement:\n```bash\n# Interactive session: show plan before executing refactor\nclaude --permission-mode plan \\\n  \"Refactor all React class components to functional components with hooks\"\n# Claude will print something like:\n# Plan:\n# 1. Read src/components/Header.tsx\n# 2. Edit src/components/Header.tsx (convert class → function)\n# 3. Read src/components/Footer.tsx\n# ...\n# Proceed? (y/n)\n```\n\n```typescript\n// SDK — plan mode returns the plan for programmatic review\nimport { query } from \"@anthropic-ai/claude-code\";\n\nconst result = await query({\n  prompt: \"Refactor class components\",\n  options: { permissionMode: \"plan\" },\n});\n// Inspect result.plan before approving\nconsole.log(result.plan);\n```",
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
      "In Claude Code's agentic framework, subagents defined via AgentDefinition cannot create their own subagents — the `Agent` tool (or its predecessor `Task`) is not permitted in a subagent's allowedTools. This is a deliberate architectural constraint that prevents unbounded recursive spawning and keeps the orchestration graph manageable. Option C is misleading: in v2.1.63 the tool was renamed from `Task` to `Agent`, not deprecated. Option D describes a non-existent delegation mechanism.\n\nHow to implement:\n```typescript\n// Correct AgentDefinition — subagent tools must NOT include \"Agent\"\nconst summarizerAgent = {\n  name: \"summarizer\",\n  description: \"Summarizes a single document section\",\n  allowedTools: [\"Read\", \"Grep\"], // ✅ No \"Agent\" tool here\n  systemPrompt: \"You summarize text. You do not spawn subagents.\",\n};\n\n// Top-level orchestrator CAN include \"Agent\" tool\nconst orchestrator = {\n  name: \"orchestrator\",\n  allowedTools: [\"Agent\", \"Read\", \"Write\"], // ✅ Agent tool at top level only\n};\n```\n\n```jsonc\n// .claude/agents/summarizer.json\n{\n  \"name\": \"summarizer\",\n  \"allowedTools\": [\"Read\", \"Grep\"],\n  // \"Agent\" intentionally omitted — subagents cannot spawn subagents\n  \"systemPrompt\": \"Summarize the provided document section.\"\n}\n```",
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
      "In Claude Code v2.1.63, the `Task` tool was renamed to `Agent`. Any AgentDefinition that previously listed `\"Task\"` in allowedTools to permit subagent spawning must be updated to `\"Agent\"`. The functionality is identical; only the name changed. There is no `Spawn` or `SubAgent` tool name, and subagent spawning is not automatic.\n\nHow to implement:\n```jsonc\n// Before v2.1.63 (old — broken after upgrade)\n{\n  \"allowedTools\": [\"Task\", \"Read\", \"Write\"]\n}\n\n// After v2.1.63 (correct)\n{\n  \"allowedTools\": [\"Agent\", \"Read\", \"Write\"]\n}\n```\n\n```bash\n# Quick migration: find all AgentDefinition configs using old \"Task\" name\ngrep -r '\"Task\"' .claude/agents/ --include=\"*.json\"\n\n# Replace in all agent config files\nsed -i 's/\"Task\"/\"Agent\"/g' .claude/agents/*.json\n\n# Verify\ngrep -r 'allowedTools' .claude/agents/\n```",
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
      "By design, subagents return only their final result (a text summary or structured output) to the parent orchestrator. The intermediate tool calls, reasoning steps, and partial outputs within the subagent's execution are not propagated back. This is intentional: it keeps the coordinator's context window manageable and enforces clean boundaries between agents. There is no `get_subagent_logs` endpoint and no `subagent_transcript` key in the parent context.\n\nHow to implement:\n```typescript\n// Coordinator spawning a subagent — only receives final result\nimport { query } from \"@anthropic-ai/claude-code\";\n\nconst coordinatorResult = await query({\n  prompt: `\n    Use the Agent tool to analyze all 200 documents in /data/.\n    Return only: total count, top 3 themes, and any anomalies.\n  `,\n  // Coordinator receives a short summary — not the 200-step transcript\n});\n\nconsole.log(coordinatorResult.result); // Short final summary only\n```\n\n```typescript\n// If you need detailed logs from subagents, write them to disk inside the subagent\n// Subagent system prompt:\nconst subagentPrompt = `\nAnalyze the documents. After each document, append a JSON line to /tmp/agent-log.jsonl.\nAt the end, return a concise summary.\n`;\n// Coordinator can then Read /tmp/agent-log.jsonl if needed\n```",
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
      "Subagents operate in independent context windows. They do NOT receive the parent orchestrator's system prompt or conversation history. They only receive whatever is explicitly included in the task description passed to the Agent tool. If escalation rules are critical for the subagent, they must be included explicitly in that task prompt. There is no `share_context` flag and no automatic system prompt inheritance.\n\nHow to implement:\n```typescript\n// BAD — subagent won't see coordinator's system prompt with escalation rules\nconst bad = await query({\n  prompt: \"Use Agent tool to handle ticket #1234\", // subagent gets no escalation rules!\n});\n\n// GOOD — explicitly include required rules in the subagent task description\nconst ESCALATION_RULES = `\nEscalation rules:\n- Billing issues over $500 must be escalated to billing-team@company.com\n- Security complaints must be escalated immediately to security@company.com\n- All other issues: attempt resolution, escalate after 2 failed attempts\n`;\n\nconst good = await query({\n  prompt: `\n    Use the Agent tool with this task:\n    \"Handle support ticket #1234. ${ESCALATION_RULES}\"\n  `,\n});\n```\n\n```markdown\n<!-- Alternative: put shared rules in .claude/CLAUDE.md so all subagents get them -->\n<!-- .claude/CLAUDE.md -->\n## Escalation Rules\n- Billing > $500 → billing-team@company.com\n- Security issues → security@company.com immediately\n```",
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
      "Subagents receive the CLAUDE.md from the project directory they are operating in — this is injected automatically from disk, just as it is for any Claude Code session in that directory. This is independent of the parent's conversation. What subagents do NOT receive is the parent's system prompt or conversation history. CLAUDE.md injection is directory-based, not parent-inherited, and does not require any explicit flag.\n\nHow to implement:\n```markdown\n<!-- .claude/CLAUDE.md (project root) -->\n<!-- This file is automatically injected into ALL subagents operating in this directory -->\n\n## Coding Standards\n- Use TypeScript strict mode\n- All functions must have explicit return types\n- No `any` types\n\n## Security Rules\n- Never log secrets or API keys\n- All SQL must use parameterized queries\n```\n\n```bash\n# Verify what a subagent will see by checking project CLAUDE.md\ncat .claude/CLAUDE.md\n\n# Check for subdirectory-specific rules (also auto-injected for that dir)\nfind . -name \"CLAUDE.md\" -not -path \"*/node_modules/*\"\n```\n\n```typescript\n// Subagent operating in /project/src/ will receive:\n// 1. /project/.claude/CLAUDE.md (project root)\n// 2. /project/src/.claude/CLAUDE.md (if it exists)\n// It will NOT receive the parent coordinator's system prompt\n```",
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
      "A `SystemMessage` with `subtype: \"compact_boundary\"` signals that Claude Code is about to compact the context. After compaction, the conversation history is summarized (lossy compression), but CLAUDE.md is re-injected from disk and is fully preserved — it is never part of the compacted history. However, any instructions given only in the conversation (not in CLAUDE.md) may be lost after compaction. Tool permissions are not affected by compaction.\n\nHow to implement:\n```typescript\n// Listen for compact_boundary events in stream-json output\nimport { execSync } from \"child_process\";\n\n// Run with streaming and pipe through parser\n// $ claude --output-format stream-json \"Migrate 500 files\" | node parser.js\n\nprocess.stdin.setEncoding(\"utf8\");\nprocess.stdin.on(\"data\", (chunk: string) => {\n  for (const line of chunk.split(\"\\n\").filter(Boolean)) {\n    const event = JSON.parse(line);\n    if (event.type === \"system\" && event.subtype === \"compact_boundary\") {\n      console.log(\"Compaction imminent — saving critical state to CLAUDE.md...\");\n      // Write any critical state to CLAUDE.md before compaction completes\n    }\n  }\n});\n```\n\n```bash\n# Use PreCompact hook to save state before compaction\n# .claude/hooks/pre-compact.sh\n#!/bin/bash\necho \"## Current Progress (auto-saved before compaction)\" >> .claude/CLAUDE.md\necho \"Files processed: $(cat .progress/count.txt)\" >> .claude/CLAUDE.md\nexit 0\n```",
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
      "`error_during_execution` means an exception occurred while the agent was running — potentially after several tool calls had already succeeded. Blindly retrying may cause duplicate writes, double-sends, or other side effects. Safe retry requires either idempotency in the downstream tools, checkpoint-aware retry logic that resumes from the last successful step, or a full rollback mechanism. Claude Code does not automatically roll back side effects.\n\nHow to implement:\n```typescript\n// Idempotency-safe retry using a checkpoint file\nasync function runWithCheckpoint(items: string[]) {\n  const checkpointPath = \"./.checkpoint.json\";\n  let checkpoint = { lastIndex: -1 };\n\n  try {\n    checkpoint = JSON.parse(fs.readFileSync(checkpointPath, \"utf8\"));\n  } catch { /* no checkpoint yet */ }\n\n  const remaining = items.slice(checkpoint.lastIndex + 1);\n\n  const result = await query({\n    prompt: `Process these items (already processed up to index ${checkpoint.lastIndex}): ${remaining.join(\", \")}`,\n  });\n\n  if (result.stop_reason === \"error_during_execution\") {\n    // Save progress before retrying\n    const lastSuccess = extractLastSuccessIndex(result);\n    fs.writeFileSync(checkpointPath, JSON.stringify({ lastIndex: lastSuccess }));\n    console.log(`Saved checkpoint at index ${lastSuccess}. Safe to retry.`);\n  }\n}\n```\n\n```bash\n# Make downstream tools idempotent using upsert patterns\n# Instead of INSERT, use INSERT ... ON CONFLICT DO NOTHING\n# Instead of creating files, check existence first\nif [ ! -f \"output/$ID.json\" ]; then\n  process_item \"$ID\"\nfi\n```",
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
      "The `effort` parameter controls how much internal reasoning and exploration the model performs. `low` is appropriate for straightforward tasks like summarizing short documents where the overhead of extended reasoning would waste tokens and money. `max` is for highly complex tasks requiring deep analysis. `high` is for production tasks needing thorough reasoning. `medium` is a sensible default but not optimal for explicitly simple, cost-sensitive work.\n\nHow to implement:\n```bash\n# CLI: set effort level for a non-interactive run\nclaude --effort low --output-format stream-json \\\n  \"Summarize each of these 10 documents in 2 sentences\"\n\n# For complex architectural analysis, use max\nclaude --effort max \\\n  \"Analyze this codebase for security vulnerabilities and suggest fixes\"\n```\n\n```typescript\n// SDK: effort parameter in API call\nconst result = await client.messages.create({\n  model: \"claude-opus-4-6\",\n  max_tokens: 1024,\n  thinking: { type: \"enabled\", budget_tokens: 500 }, // low effort = low budget\n  messages: [{ role: \"user\", content: \"Summarize this document: ...\" }],\n});\n\n// effort: \"max\" maps to higher thinking budget\nconst complexResult = await client.messages.create({\n  model: \"claude-opus-4-6\",\n  max_tokens: 4096,\n  thinking: { type: \"enabled\", budget_tokens: 10000 }, // max effort\n  messages: [{ role: \"user\", content: \"Deeply analyze this architecture...\" }],\n});\n```",
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
      "The MCP protocol distinguishes two error layers: `isError: true` in a tool result is a semantic, LLM-visible error — Claude receives it in its context and can reason about it, decide to retry, or take corrective action. A JSON-RPC error at the transport layer (e.g., the server is unreachable, malformed JSON) is a transport failure that the MCP client handles before the model sees anything. Conflating these leads to poor error handling: transport errors require infrastructure-level retry, while `isError` results require model-level reasoning.\n\nHow to implement:\n```typescript\n// MCP server: return isError:true for LLM-visible application errors\nimport { Server } from \"@modelcontextprotocol/sdk/server/index.js\";\n\nserver.setRequestHandler(CallToolRequestSchema, async (request) => {\n  if (request.params.name === \"query_database\") {\n    try {\n      const rows = await db.query(request.params.arguments.sql);\n      return { content: [{ type: \"text\", text: JSON.stringify(rows) }] };\n    } catch (err) {\n      // SQL timeout — LLM-visible: Claude can reason about this\n      return {\n        isError: true,\n        content: [{ type: \"text\", text: `SQL timeout: ${err.message}` }],\n      };\n    }\n  }\n});\n\n// MCP client: handle JSON-RPC transport errors separately\ntry {\n  const result = await mcpClient.callTool(\"query_database\", { sql: \"SELECT...\" });\n  if (result.isError) {\n    // Forward to model — let Claude decide what to do\n    return result;\n  }\n} catch (transportErr) {\n  // JSON-RPC transport failure — handle at infra level, don't forward to model\n  await retryWithBackoff(() => mcpClient.callTool(...));\n}\n```",
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
      "The MCP specification identifies three transport types: HTTP (Streamable HTTP, recommended for network-deployed servers), SSE (deprecated, being phased out), and stdio (for local process-based servers). SSE has been superseded by Streamable HTTP, which supports both streaming and standard request/response patterns. stdio is for locally spawned processes, not network servers. WebSocket and gRPC are not MCP transport types.\n\nHow to implement:\n```bash\n# Add an HTTP (Streamable HTTP) MCP server\nclaude mcp add --transport http my-production-api https://api.example.com/mcp\n\n# Add a local stdio MCP server\nclaude mcp add --transport stdio local-tool -- node /path/to/server.js\n\n# List all configured servers and their transports\nclaude mcp list\n```\n\n```json\n// .mcp.json — HTTP transport for network server\n{\n  \"mcpServers\": {\n    \"my-api\": {\n      \"transport\": \"http\",\n      \"url\": \"https://api.example.com/mcp\",\n      \"headers\": {\n        \"Authorization\": \"Bearer ${API_TOKEN}\"\n      }\n    },\n    \"local-tool\": {\n      \"command\": \"node\",\n      \"args\": [\"/path/to/mcp-server.js\"]\n    }\n  }\n}\n```",
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
      "MCP scope precedence follows a strict hierarchy: local > project > user. A local configuration (stored in the `.claude/` directory's local settings) overrides both the project-level `.mcp.json` and the user-level `~/.claude.json`. This mirrors how most configuration layering systems work — more specific, closer-to-code configs take precedence over broader defaults. The ordering is deterministic, not file-system-dependent.\n\nHow to implement:\n```bash\n# User-level config (~/.claude.json) — applies to all projects\nclaude mcp add --scope user shared-tool -- node ~/tools/shared-mcp.js\n\n# Project-level config (.mcp.json in repo root) — applies to all team members\nclaude mcp add --scope project team-db -- node ./scripts/db-mcp.js\n\n# Local override (.claude/ local settings) — overrides project & user for this machine\nclaude mcp add --scope local my-override -- node ./local-dev-server.js\n```\n\n```jsonc\n// Precedence example: same server \"analytics\" defined in multiple scopes\n// ~/.claude.json (user scope) — lowest priority\n{ \"mcpServers\": { \"analytics\": { \"url\": \"https://prod.analytics.com/mcp\" } } }\n\n// .mcp.json (project scope) — overrides user\n{ \"mcpServers\": { \"analytics\": { \"url\": \"https://staging.analytics.com/mcp\" } } }\n\n// .claude/settings.local.json (local scope) — wins\n{ \"mcpServers\": { \"analytics\": { \"url\": \"http://localhost:3001/mcp\" } } }\n```",
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
      "MCP tool schemas are injected into every request for every connected server. With 12 MCP servers, each potentially defining 5–20 tools with parameter schemas, descriptions, and type definitions, the cumulative token overhead before any user content is processed can be thousands of tokens. This is a critical architectural consideration: reduce the number of active MCP servers, use ToolSearch activation, or limit active servers to those needed for the current task.\n\nHow to implement:\n```bash\n# Check how many tools are loaded (and their approximate token footprint)\nclaude mcp list\n\n# Disable servers not needed for current task\nclaude mcp disable analytics-server\nclaude mcp disable legacy-crm-server\n\n# Force-enable ToolSearch to reduce per-request schema overhead\nexport ENABLE_TOOL_SEARCH=1\nclaude \"Research the codebase and summarize architecture\"\n\n# Or disable specific servers inline via --disabledMcpServers flag\nclaude --disabledMcpServers \"server1,server2\" \"Your task here\"\n```\n\n```json\n// .mcp.json — only include servers needed for this project role\n{\n  \"mcpServers\": {\n    \"file-ops\": { \"command\": \"node\", \"args\": [\"./mcp/file-ops.js\"] },\n    \"git-tools\": { \"command\": \"node\", \"args\": [\"./mcp/git.js\"] }\n    // Intentionally excluded: analytics, crm, reporting, etc.\n  }\n}\n```",
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
      "ToolSearch is a context management mechanism that activates when context window utilization exceeds approximately 10%, helping the model prioritize which tools to include in the working set. It can be force-enabled regardless of utilization using the `ENABLE_TOOL_SEARCH` environment variable. This is important when you have many MCP servers and want to reduce per-request token consumption from schema injection. It does not have a configurable threshold via `TOOL_SEARCH_THRESHOLD`.\n\nHow to implement:\n```bash\n# Force-enable ToolSearch regardless of context utilization\nexport ENABLE_TOOL_SEARCH=1\n\n# Then run Claude Code normally — it will use ToolSearch from the start\nclaude \"Analyze the database schema and suggest optimizations\"\n\n# In a CI environment\nENABLE_TOOL_SEARCH=1 claude --output-format stream-json \"Process documents\"\n```\n\n```yaml\n# GitHub Actions — enable ToolSearch for high-MCP-server-count runs\njobs:\n  claude-analysis:\n    steps:\n      - name: Run Claude with ToolSearch\n        env:\n          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}\n          ENABLE_TOOL_SEARCH: \"1\"\n        run: claude --output-format stream-json \"Analyze codebase\"\n```\n\n```typescript\n// SDK equivalent: pass tools selectively instead of all at once\n// ToolSearch handles this automatically when ENABLE_TOOL_SEARCH=1\n// Manually, you can filter tools before the API call:\nconst relevantTools = allTools.filter(t =>\n  t.name.includes(\"database\") || t.name.includes(\"schema\")\n);\n```",
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
      ".mcp.json supports two variable expansion syntaxes: `${VAR}` for simple substitution and `${VAR:-default}` for substitution with a fallback value when the variable is unset or empty. The `:-` notation is borrowed from POSIX shell parameter expansion. JavaScript-style operators (`||`, `??`) are not supported. There is no ternary `?` syntax in .mcp.json variable expansion.\n\nHow to implement:\n```json\n{\n  \"mcpServers\": {\n    \"my-service\": {\n      \"command\": \"node\",\n      \"args\": [\"./mcp-server.js\"],\n      \"env\": {\n        \"API_KEY\": \"${API_KEY:-dev-key-local}\",\n        \"DB_URL\": \"${DATABASE_URL:-postgres://localhost:5432/devdb}\",\n        \"LOG_LEVEL\": \"${LOG_LEVEL:-info}\"\n      }\n    }\n  }\n}\n```\n\n```bash\n# With API_KEY set: uses the real key\nexport API_KEY=sk-prod-abc123\nclaude \"Query the database\"\n\n# Without API_KEY: falls back to dev-key-local\nunset API_KEY\nclaude \"Query the database\"\n# → server starts with API_KEY=dev-key-local\n\n# Simple substitution (no default — fails if unset):\n# \"API_KEY\": \"${REQUIRED_KEY}\"  ← will be empty string if unset\n```",
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
      "The `.mcp.json` variable expansion feature supports `${VAR}` and `${VAR:-default}` syntax in the following specific fields: `command`, `args`, `env`, `url`, and `headers`. This covers both stdio-based servers (command/args/env) and HTTP-based servers (url/headers). Variable expansion does not apply to the server name keys or other structural fields in the JSON. The example correctly uses expansion in both `url` and `headers`.\n\nHow to implement:\n```json\n{\n  \"mcpServers\": {\n    \"api-server\": {\n      \"url\": \"${API_BASE_URL:-https://staging.api.com}/v2\",\n      \"headers\": {\n        \"Authorization\": \"Bearer ${AUTH_TOKEN}\",\n        \"X-Environment\": \"${APP_ENV:-development}\"\n      }\n    },\n    \"local-tool\": {\n      \"command\": \"${NODE_PATH:-node}\",\n      \"args\": [\"${MCP_SERVER_SCRIPT:-./mcp/server.js}\"],\n      \"env\": {\n        \"DB_HOST\": \"${DB_HOST:-localhost}\",\n        \"DB_PORT\": \"${DB_PORT:-5432}\"\n      }\n    }\n  }\n}\n```\n\n```bash\n# Verify expansion by checking which env vars are set\nenv | grep -E 'API_BASE_URL|AUTH_TOKEN|APP_ENV'\n\n# Set for current session\nexport API_BASE_URL=https://prod.api.com\nexport AUTH_TOKEN=$(cat ~/.secrets/api-token)\nclaude \"Use the API to fetch user data\"\n```",
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
      "`strict: true` on a tool definition enables constrained decoding: the model's token generation is constrained to only produce outputs that are valid against the JSON schema. This is a strong runtime guarantee of schema compliance. However, it comes with schema limitations: all object properties must be listed in `required`, `additionalProperties` must be `false`, and combiners like `allOf`, `anyOf`, `oneOf` are not supported. Features like `minimum`/`maximum`, `minLength`, `maxLength`, `pattern`, and `const` are also unavailable in strict mode.\n\nHow to implement:\n```python\nimport anthropic\n\nclient = anthropic.Anthropic()\n\n# Tool with strict: True — constrained decoding guarantees schema compliance\nresponse = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=1024,\n    tools=[{\n        \"name\": \"extract_order\",\n        \"description\": \"Extract order details from text\",\n        \"strict\": True,  # Enable constrained decoding\n        \"input_schema\": {\n            \"type\": \"object\",\n            \"properties\": {\n                \"order_id\": {\"type\": \"string\"},\n                \"total\": {\"type\": \"number\"},\n                \"status\": {\"type\": \"string\", \"enum\": [\"pending\", \"shipped\", \"delivered\"]}\n            },\n            \"required\": [\"order_id\", \"total\", \"status\"],  # ALL properties must be required\n            \"additionalProperties\": False  # REQUIRED in strict mode\n        }\n    }],\n    messages=[{\"role\": \"user\", \"content\": \"Extract: Order #1234, $59.99, shipped\"}]\n)\n```\n\n```typescript\n// TypeScript equivalent\nconst response = await client.messages.create({\n  model: \"claude-opus-4-6\",\n  max_tokens: 1024,\n  tools: [{\n    name: \"extract_order\",\n    strict: true,\n    input_schema: {\n      type: \"object\" as const,\n      properties: {\n        order_id: { type: \"string\" },\n        total: { type: \"number\" },\n        status: { type: \"string\", enum: [\"pending\", \"shipped\", \"delivered\"] },\n      },\n      required: [\"order_id\", \"total\", \"status\"],\n      additionalProperties: false,\n    },\n  }],\n  messages: [{ role: \"user\", content: \"Extract order details...\" }],\n});\n```",
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
      "In `strict: true` mode, `pattern`, `minLength`, `maxLength`, `minimum`, `maximum`, `const`, and schema combiners (`allOf`, `anyOf`, `oneOf`) are not supported. If you need regex-level validation, the options are: (1) use `strict: false` and implement the validation in the tool handler server-side, or (2) use `strict: false` and rely on the model's instruction following. Option A is wrong because `minLength`/`maxLength` are also unavailable in strict mode. Option C is wrong because `oneOf` is not allowed in strict mode either.\n\nHow to implement:\n```python\n# WRONG — strict: True rejects pattern, minLength, maxLength\ntools_broken = [{\n    \"name\": \"validate_phone\",\n    \"strict\": True,\n    \"input_schema\": {\n        \"type\": \"object\",\n        \"properties\": {\n            \"phone\": {\n                \"type\": \"string\",\n                \"pattern\": \"^\\\\+[1-9]\\\\d{1,14}$\"  # NOT allowed in strict mode\n            }\n        },\n        \"required\": [\"phone\"],\n        \"additionalProperties\": False\n    }\n}]\n\n# CORRECT — strict: False, validate server-side\ntools_correct = [{\n    \"name\": \"validate_phone\",\n    \"strict\": False,  # Allow pattern in schema (for documentation)\n    \"input_schema\": {\n        \"type\": \"object\",\n        \"properties\": {\n            \"phone\": {\n                \"type\": \"string\",\n                \"description\": \"E.164 format: +[country][number], e.g. +14155552671\"\n            }\n        },\n        \"required\": [\"phone\"]\n    }\n}]\n\n# Server-side validation in tool handler\nimport re\ndef handle_validate_phone(phone: str):\n    if not re.match(r'^\\+[1-9]\\d{1,14}$', phone):\n        raise ValueError(f\"Invalid phone format: {phone}\")\n    return {\"valid\": True, \"phone\": phone}\n```",
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
      "On macOS, `/Library/Application Support/ClaudeCode/CLAUDE.md` is the managed policy location for Claude Code. IT departments can deploy configuration here (via MDM or similar tools), and this file takes precedence over user-level and project-level settings. Users cannot override managed policy. `.mcp.json` requires the file to be present in each repo. `~/.claude.json` is per-user and can be modified. `/etc/claude/policy.json` is not a real Claude Code path.\n\nHow to implement:\n```bash\n# IT/admin: create the managed policy file (requires admin/sudo)\nsudo mkdir -p \"/Library/Application Support/ClaudeCode\"\n\nsudo tee \"/Library/Application Support/ClaudeCode/CLAUDE.md\" << 'EOF'\n# Company Managed Policy — DO NOT MODIFY\n\n## Required MCP Servers\nAll Claude Code sessions must use the security scanning server.\n\n## Prohibited Actions\n- Never commit to main branch directly\n- Never disable the security-scanner MCP server\n- All file writes outside project directory require approval\nEOF\n```\n\n```bash\n# Deploy via Jamf Pro (MDM) — example payload\n# Use \"Files and Processes\" policy to write:\n# Path: /Library/Application Support/ClaudeCode/CLAUDE.md\n# Content: (your policy content)\n\n# Verify managed policy is in place on a user's machine\ncat \"/Library/Application Support/ClaudeCode/CLAUDE.md\"\n```\n\n```json\n// Managed .mcp.json can also be placed here to enforce MCP servers\n// /Library/Application Support/ClaudeCode/mcp.json\n{\n  \"mcpServers\": {\n    \"security-scanner\": {\n      \"command\": \"/usr/local/bin/claude-security-mcp\",\n      \"args\": [\"--policy\", \"strict\"]\n    }\n  }\n}\n```",
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
      "ToolSearch is a retrieval mechanism that selects the most contextually relevant tools from the full registry and includes only those schemas in a given request. This reduces (but does not eliminate) schema context consumption. A baseline set of tool descriptions is still needed to enable the search itself. ToolSearch works independently of transport type (stdio vs HTTP). There is no universal JSON input tool that replaces all schemas.\n\nHow to implement:\n```bash\n# Enable ToolSearch to reduce per-request tool schema overhead\nexport ENABLE_TOOL_SEARCH=1\n\n# With 8 servers × 12 tools = 96 tool schemas\n# Without ToolSearch: all 96 schemas in every request\n# With ToolSearch: only ~10 most relevant schemas per request\n\nclaude \"Query the user database for active accounts created this month\"\n# ToolSearch selects: query_database, list_tables, get_schema\n# Excludes: file_ops, git_tools, email_sender, etc.\n```\n\n```typescript\n// Monitor token usage with and without ToolSearch\nconst withoutToolSearch = await client.messages.create({\n  model: \"claude-opus-4-6\",\n  tools: allTools, // All 96 tools\n  messages: [{ role: \"user\", content: \"Query the database\" }],\n  max_tokens: 1024,\n});\nconsole.log(\"Input tokens without ToolSearch:\", withoutToolSearch.usage.input_tokens);\n\n// With ToolSearch (ENABLE_TOOL_SEARCH=1), Claude Code automatically\n// reduces the active tool set. The baseline overhead remains for the\n// search index itself, but full schemas are only sent for relevant tools.\n```",
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
      "stdio transport is designed for MCP servers that run as local processes, spawned and managed by Claude Code on the same machine. Communication happens over standard input/output pipes. HTTP transport is for network-deployed servers. SSE is deprecated. WebSocket is not an MCP transport type. For co-located local servers, stdio is the correct and most efficient choice.\n\nHow to implement:\n```bash\n# Add a local stdio MCP server\nclaude mcp add --transport stdio support-tools -- node /path/to/support-mcp-server.js\n\n# Or with Python\nclaude mcp add support-tools -- python3 /path/to/support_mcp_server.py\n\n# Check it was added with stdio transport\nclaude mcp list\n# support-tools: stdio — node /path/to/support-mcp-server.js\n```\n\n```json\n// .mcp.json — stdio for local co-deployed server\n{\n  \"mcpServers\": {\n    \"support-tools\": {\n      \"command\": \"node\",\n      \"args\": [\"/opt/support-agent/mcp-server.js\"],\n      \"env\": {\n        \"DB_URL\": \"${SUPPORT_DB_URL:-postgres://localhost/support}\",\n        \"LOG_LEVEL\": \"info\"\n      }\n    }\n  }\n}\n```\n\n```typescript\n// MCP server skeleton using stdio transport\nimport { Server } from \"@modelcontextprotocol/sdk/server/index.js\";\nimport { StdioServerTransport } from \"@modelcontextprotocol/sdk/server/stdio.js\";\n\nconst server = new Server({ name: \"support-tools\", version: \"1.0.0\" });\nconst transport = new StdioServerTransport();\nawait server.connect(transport); // Listens on stdin/stdout\n```",
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
      "CLAUDE.md is re-injected from disk after every compaction event — it always survives. What is lost during compaction is conversation history, which is summarized (lossy). If the developer's guidelines were delivered as conversational messages rather than written into CLAUDE.md, they will not survive compaction. The fix is to put persistent instructions in CLAUDE.md. The 200-line guideline is a recommendation for keeping files manageable, not a hard limit that causes partial injection.\n\nHow to implement:\n```markdown\n<!-- .claude/CLAUDE.md — persistent instructions that survive compaction -->\n\n## Code Style\n- Use 2-space indentation (not tabs)\n- Prefer `const` over `let`; never use `var`\n- All async functions must have explicit error handling\n\n## Testing Requirements\n- Every new function needs a unit test in __tests__/\n- Use Jest with ts-jest for TypeScript files\n- Test file naming: `<module>.test.ts`\n\n## Architecture Decisions\n- Use Repository pattern for all DB access\n- No business logic in API route handlers\n```\n\n```bash\n# Bad: conversational instruction (won't survive compaction)\n# User says: \"Always use 2-space indentation\"\n# → This will be lost after context compaction\n\n# Good: write it to CLAUDE.md before starting a long session\necho \"\\n## Style: use 2-space indentation\" >> .claude/CLAUDE.md\n# → Now it survives compaction\n```",
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
      "The recommended approach for large CLAUDE.md files is to split content into topic-specific files under `.claude/rules/` subdirectories. Claude Code discovers these recursively. The main CLAUDE.md should stay under 200 lines (the target) and can use `@import` directives to selectively load additional rule files when relevant. This reduces per-request context consumption because not all rules need to be loaded for every task. Compressing or splitting between user and project levels would lose scoping clarity.\n\nHow to implement:\n```bash\n# Create a well-organized rules directory structure\nmkdir -p .claude/rules\n\n# Split by topic\ncat > .claude/rules/coding-standards.md << 'EOF'\n## TypeScript Standards\n- strict mode enabled\n- explicit return types required\n- no `any` types\nEOF\n\ncat > .claude/rules/security.md << 'EOF'\n## Security Rules\n- parameterized SQL only\n- no hardcoded secrets\n- validate all inputs with Zod\nEOF\n\ncat > .claude/rules/testing.md << 'EOF'\n## Testing Requirements\n- 80% coverage minimum\n- unit tests for all utils\n- e2e tests for critical flows\nEOF\n```\n\n```markdown\n<!-- .claude/CLAUDE.md — keep under 200 lines, import selectively -->\n# Project: MyApp\n\n## Quick Reference\n- Tech: Next.js 15, TypeScript, Postgres\n- Deploy: Vercel\n\n@import .claude/rules/coding-standards.md\n@import .claude/rules/security.md\n<!-- Only import testing rules when needed: @import .claude/rules/testing.md -->\n```",
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
      "`disable-model-invocation: true` means the skill executes its defined actions (shell commands, file operations, etc.) without making any Claude model API calls — it runs as pure automation. `user-invocable: false` means the skill does not appear in the slash command menu and cannot be directly triggered by users typing `/skill-name`; it can only be invoked programmatically by the system or other agents. Together, these define a non-interactive, automated skill.\n\nHow to implement:\n```markdown\n---\ndisable-model-invocation: true\nuser-invocable: false\n---\n\n# sync-dependencies\n\nThis skill runs without any Claude model calls and is not user-facing.\n\n```bash\nnpm install\nnpm audit fix\ngit add package-lock.json\ngit commit -m \"chore: sync dependencies\"\n```\n```\n\n```markdown\n---\n# Contrast: user-invocable skill with model invocation\ndisable-model-invocation: false\nuser-invocable: true\ndescription: \"Review the current PR for issues\"\n---\n\n# review-pr\n\nUse the GitHub MCP server to fetch the PR diff, then analyze it for:\n- Security vulnerabilities\n- Performance issues  \n- Missing tests\nProvide a structured review with severity ratings.\n```\n\n```bash\n# User-invocable skill appears in slash commands\n# User types: /review-pr\n# Non-user-invocable skills are hidden from this menu\nclaude /review-pr  # ✅ works\nclaude /sync-dependencies  # ❌ not in menu — system-only\n```",
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
      "The `!\\`command\\`` syntax in CLAUDE.md and skill files is the dynamic context injection syntax. When the skill is loaded, Claude Code executes the shell command and replaces the `!\\`...\\`` expression with the command's stdout output. This allows skills and CLAUDE.md files to inject dynamic runtime information (like the current git branch, environment name, or tool versions) into the context. It is not a Bash tool call during the conversation and does not escape shell injection — it runs the command at load time.\n\nHow to implement:\n```markdown\n<!-- .claude/CLAUDE.md — dynamic context injection examples -->\n\n# Project Context\n\nCurrent git branch: !`git branch --show-current`\nNode version: !`node --version`\nLast deploy: !`git log --oneline -1 origin/main`\nOpen PRs: !`gh pr list --limit 3 --json title,number | jq -r '.[] | \"#\\(.number): \\(.title)\"'`\n\n## Environment\nApp running: !`curl -s -o /dev/null -w \"%{http_code}\" http://localhost:3000/health 2>/dev/null || echo \"not running\"`\n```\n\n```markdown\n<!-- .claude/skills/code-review.md -->\n---\nuser-invocable: true\ndescription: Review code on current branch\n---\n\nYou are reviewing code on branch: !`git branch --show-current`\nChanged files: !`git diff --name-only main`\nTest coverage: !`cat coverage/coverage-summary.json 2>/dev/null | jq '.total.lines.pct'`\n\nReview the changed files for issues.\n```",
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
      "In Claude Code skills, `$ARGUMENTS` contains the full arguments string passed after the skill name. `$ARGUMENTS[N]` provides positional access to space-separated tokens: `$ARGUMENTS[0]` is the first token (`main`), `$ARGUMENTS[1]` is the second (`production`), and so on. `$N` (e.g., `$1`, `$2`) is an equivalent shorthand. The skill name itself is not included in the arguments. Both `$ARGUMENTS` (full string) and `$ARGUMENTS[N]` (indexed) are supported.\n\nHow to implement:\n```markdown\n<!-- .claude/skills/deploy.md -->\n---\nuser-invocable: true\ndescription: Deploy a branch to an environment\nallowed-tools: [Bash]\n---\n\n# Deploy Skill\n\nDeploy branch `$ARGUMENTS[0]` (or `$1`) to environment `$ARGUMENTS[1]` (or `$2`).\n\nSteps:\n1. Verify branch `$1` exists: run `git branch -a | grep $1`\n2. Check environment `$2` is valid (staging/production/preview)\n3. Run the deployment: `./scripts/deploy.sh $1 $2`\n4. Confirm deployment succeeded\n\nFull arguments string: $ARGUMENTS\n```\n\n```bash\n# Usage examples:\n# /deploy main production\n#   → $ARGUMENTS[0] = \"main\", $ARGUMENTS[1] = \"production\"\n#   → $1 = \"main\", $2 = \"production\"\n\n# /deploy feature/auth staging\n#   → $ARGUMENTS[0] = \"feature/auth\", $ARGUMENTS[1] = \"staging\"\n\n# /deploy main\n#   → $ARGUMENTS[0] = \"main\", $ARGUMENTS[1] = undefined\n#   → $ARGUMENTS = \"main\" (full string)\n```",
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
      "`--output-format stream-json` is the flag that enables streaming JSON output in Claude Code's headless mode. Each event (assistant message, tool call, tool result, completion) is emitted as a JSON object on a new line, enabling the CI pipeline to process events in real time. There is no `--headless`, `--ci-mode`, `--stream`, or `--no-interactive` flag for this purpose. The `--continue` flag can be combined with `--output-format stream-json` to resume a previous session.\n\nHow to implement:\n```bash\n# Basic headless run with streaming JSON\nclaude --output-format stream-json \\\n  --permission-mode bypassPermissions \\\n  \"Run tests and fix any failures\" \\\n  2>&1 | tee ci-output.jsonl\n\n# Parse specific event types in CI\nclaude --output-format stream-json \"Analyze code\" | \\\n  node -e \"\n  const readline = require('readline');\n  const rl = readline.createInterface({ input: process.stdin });\n  rl.on('line', line => {\n    const event = JSON.parse(line);\n    if (event.type === 'result') {\n      console.log('Final result:', event.result);\n      process.exit(event.subtype === 'success' ? 0 : 1);\n    }\n  });\n  \"\n```\n\n```yaml\n# GitHub Actions CI step\n- name: Claude Code Analysis\n  run: |\n    claude \\\n      --output-format stream-json \\\n      --allowedTools Read,Grep,Glob \\\n      --max-turns 20 \\\n      \"Check for security vulnerabilities in changed files\" \\\n      | jq -r 'select(.type==\"result\") | .result'\n  env:\n    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}\n```",
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
      "`--allowedTools` creates an explicit whitelist of permitted tools for a Claude Code session. Any tool not listed — including built-in tools like Bash, Edit, and Write — is blocked. Claude will receive an error when attempting to use a denied tool and must reason about alternatives within the allowed set. There is no automatic substitution or bypass for built-in tools. This mechanism is used in CI to enforce the principle of least privilege.\n\nHow to implement:\n```bash\n# Read-only analysis — only allow read tools\nclaude --allowedTools Read,Grep,Glob \\\n  --output-format stream-json \\\n  \"Analyze code quality and report issues (no changes)\"\n\n# Allow specific operations needed for linting\nclaude --allowedTools Read,Grep,Glob,Edit,Bash \\\n  \"Run eslint --fix on all TypeScript files\"\n\n# Explicitly deny all tools except MCP server tools\nclaude --allowedTools \"mcp__my-server__query_db,mcp__my-server__list_tables\" \\\n  \"What tables exist and how many rows in each?\"\n```\n\n```typescript\n// SDK: specify allowed tools in the tools array directly\nconst result = await client.messages.create({\n  model: \"claude-opus-4-6\",\n  max_tokens: 2048,\n  // Only include tool definitions for tools you want to allow\n  tools: [\n    { name: \"Read\", description: \"Read file contents\", input_schema: {...} },\n    { name: \"Grep\", description: \"Search file contents\", input_schema: {...} },\n    // Bash, Edit, Write intentionally excluded\n  ],\n  messages: [{ role: \"user\", content: \"Analyze the codebase\" }],\n});\n```",
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
      "Claude Code shell hooks use a three-value exit code convention: exit code 0 means proceed (allow the tool call), exit code 2 means block (deny the tool call, and Claude receives the hook's stderr as the reason), and any other non-zero code means proceed but log the error. Exit code 2 is the specific value for programmatic blocking. This allows hooks to function as policy enforcement gates — the hook can explain exactly why a tool call was denied by writing to stderr.\n\nHow to implement:\n```bash\n#!/bin/bash\n# .claude/hooks/pre-tool-use.sh\n# Blocks writes/deletes to files outside the project directory\n\nTOOL_NAME=\"$1\"\nTOOL_INPUT=\"$2\"  # JSON string of tool arguments\n\n# Block file operations outside project dir\nif echo \"$TOOL_INPUT\" | grep -qE '\"path\":\\s*\"/etc|\"path\":\\s*\"/usr|\"path\":\\s*\"/home'; then\n  echo \"Blocked: Cannot modify system files outside project directory\" >&2\n  exit 2  # Block the action — stderr message goes to Claude\nfi\n\n# Block production env file modifications\nif echo \"$TOOL_INPUT\" | grep -q 'production.env\\|.env.prod'; then\n  echo \"Blocked: Direct modification of production env files is prohibited. Use secrets manager.\" >&2\n  exit 2\nfi\n\nexit 0  # Allow the action\n```\n\n```json\n// .claude/settings.json — register the hook\n{\n  \"hooks\": {\n    \"PreToolUse\": [\n      {\n        \"type\": \"command\",\n        \"command\": \".claude/hooks/pre-tool-use.sh\"\n      }\n    ]\n  }\n}\n```",
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
      "`SessionStart` fires exactly once when a Claude Code session initializes, before any user interaction. It is the correct hook for one-time setup actions like injecting environment context, initializing state files, or running pre-session scripts. `UserPromptSubmit` fires on each user message, not just the first. `PreToolUse` fires before tool calls, which have not yet occurred at session start. `SubagentStart` is specific to subagent lifecycle events, not the main session start.\n\nHow to implement:\n```bash\n#!/bin/bash\n# .claude/hooks/session-start.sh\n# Runs once when a Claude Code session starts\n\n# Build dynamic context for CLAUDE.md\ncat > .claude/SESSION_CONTEXT.md << EOF\n## Session Context (auto-generated at start)\nDate: $(date)\nBranch: $(git branch --show-current)\nUncommitted changes: $(git status --porcelain | wc -l | tr -d ' ') files\nFailing tests: $(npm test 2>/dev/null | grep -c 'FAIL' || echo 'unknown')\nEnvironment: ${APP_ENV:-development}\nEOF\n\necho \"Session context initialized\" >&2\nexit 0\n```\n\n```json\n// .claude/settings.json\n{\n  \"hooks\": {\n    \"SessionStart\": [\n      {\n        \"type\": \"command\",\n        \"command\": \".claude/hooks/session-start.sh\"\n      }\n    ],\n    \"PreToolUse\": [...],\n    \"PostToolUse\": [...]\n  }\n}\n```",
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
      "Claude Code supports four hook types: `command` (shell script), `http` (HTTP request), `prompt` (prompt injection), and `agent` (subagent invocation). For real-time HTTP audit calls before each tool executes, the `http` hook type on the `PreToolUse` event is the correct combination. The HTTP hook sends a request to the specified URL and can block the tool call if the response indicates denial. Using `PostToolUse` would be post-hoc and cannot block the call.\n\nHow to implement:\n```json\n// .claude/settings.json — HTTP hook for real-time audit\n{\n  \"hooks\": {\n    \"PreToolUse\": [\n      {\n        \"type\": \"http\",\n        \"url\": \"https://audit.internal.company.com/claude/pre-tool\",\n        \"method\": \"POST\",\n        \"headers\": {\n          \"Authorization\": \"Bearer ${AUDIT_API_KEY}\",\n          \"Content-Type\": \"application/json\"\n        }\n      }\n    ],\n    \"PostToolUse\": [\n      {\n        \"type\": \"http\",\n        \"url\": \"https://audit.internal.company.com/claude/post-tool\",\n        \"method\": \"POST\"\n      }\n    ]\n  }\n}\n```\n\n```python\n# Audit service endpoint (FastAPI example)\nfrom fastapi import FastAPI, Request\nfrom fastapi.responses import JSONResponse\n\napp = FastAPI()\n\n@app.post(\"/claude/pre-tool\")\nasync def audit_pre_tool(request: Request):\n    body = await request.json()\n    tool_name = body.get(\"tool_name\")\n    tool_input = body.get(\"tool_input\")\n    \n    # Log the audit event\n    await log_audit(tool_name, tool_input)\n    \n    # Block dangerous operations\n    if tool_name == \"Bash\" and \"rm -rf\" in str(tool_input):\n        return JSONResponse(status_code=403, content={\"block\": True, \"reason\": \"Dangerous rm -rf blocked\"})\n    \n    # Allow everything else\n    return JSONResponse(status_code=200, content={\"allow\": True})\n```",
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
      "`context: fork` in a skill's frontmatter causes the skill to execute in a new, isolated context window forked from the current session state. This is distinct from the default behavior of continuing in the same conversation context. It is useful for skills that need to do exploratory work without polluting the main conversation, or for skills that need a clean context for accurate reasoning. `model:` specifies which model to use, not whether to fork. `agent: true` marks the skill as an agent but does not imply context forking.\n\nHow to implement:\n```markdown\n---\ncontext: fork\nuser-invocable: true\nmodel: claude-sonnet-4-5\ndescription: \"Explore refactoring options without affecting main session\"\n---\n\n# explore-refactor\n\nYou are exploring (not implementing) a refactoring strategy for $ARGUMENTS.\n\n1. Read the target files\n2. Draft 3 different refactoring approaches with trade-offs\n3. Return your recommendation summary to the parent context\n\nDo NOT make any file edits — this is exploratory only.\n```\n\n```markdown\n---\ncontext: fork\nuser-invocable: true\ndescription: \"Run security audit in isolated context\"\nallowed-tools: [Read, Grep, Glob]\n---\n\n# security-audit\n\nAudit the codebase for security vulnerabilities.\nThis runs in a forked context so findings don't pollute the main conversation.\n\nScan for:\n- SQL injection patterns\n- Hardcoded secrets\n- Unsafe eval/exec usage\n- Missing input validation\n\nReturn a structured JSON report.\n```",
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
      "`--resume` accepts a session ID to restore the conversation history of a previously saved session. In headless mode combined with `--output-format stream-json`, this allows a pipeline to continue a long-running task across multiple invocations. The `--continue` flag continues the most recent session without needing a specific ID. `--session-id`, `--restore`, and `--attach` are not valid Claude Code flags.\n\nHow to implement:\n```bash\n# First run — capture the session ID from the output\nSESSION_ID=$(claude \\\n  --output-format stream-json \\\n  --permission-mode bypassPermissions \\\n  \"Process files 1-100 in /data/batch\" \\\n  | jq -r 'select(.type==\"result\") | .session_id' \\\n  | tail -1)\n\necho \"Session ID: $SESSION_ID\"\necho \"$SESSION_ID\" > .session-id\n\n# Resume the session later (e.g., next CI run)\nSESSION_ID=$(cat .session-id)\nclaude \\\n  --resume \"$SESSION_ID\" \\\n  --output-format stream-json \\\n  \"Continue processing — files 1-100 are done, now do 101-200\"\n```\n\n```bash\n# --continue (no ID needed) — resumes most recent session\nclaude --continue \"What was the last file you processed?\"\n\n# --resume [id] — resumes a specific named session\nclaude --resume abc123def \"Continue the migration from where you left off\"\n```",
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
      "Prefilled assistant responses (injecting partial text at the start of the assistant turn to guide output format) are deprecated in Claude 4.6 and later. The replacement approaches are: (1) use `output_config.format` with `type: \"json_schema\"` for guaranteed structured JSON output via constrained decoding, or (2) rely on Claude 4.6's improved instruction following with explicit format instructions in the prompt. The deprecation applies to all response sizes.\n\nHow to implement:\n```python\n# OLD — prefilled response (deprecated in Claude 4.6)\nresponse_old = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=1024,\n    messages=[\n        {\"role\": \"user\", \"content\": \"Extract the name and age\"},\n        {\"role\": \"assistant\", \"content\": '{\"name\":'}, # ← DEPRECATED prefill\n    ]\n)\n\n# NEW — Option 1: structured output with json_schema\nresponse_new = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=1024,\n    output_config={\n        \"format\": {\n            \"type\": \"json_schema\",\n            \"json_schema\": {\n                \"type\": \"object\",\n                \"properties\": {\n                    \"name\": {\"type\": \"string\"},\n                    \"age\": {\"type\": \"integer\"}\n                },\n                \"required\": [\"name\", \"age\"],\n                \"additionalProperties\": False\n            }\n        }\n    },\n    messages=[{\"role\": \"user\", \"content\": \"Extract the name and age from: John, 34 years old\"}]\n)\n\n# NEW — Option 2: instruction following (Claude 4.6 handles well)\nresponse_instruct = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=1024,\n    system=\"Always respond with valid JSON only. No explanation.\",\n    messages=[{\"role\": \"user\", \"content\": \"Extract {name, age} from: John, 34 years old\"}]\n)\n```",
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
      "`output_config.format.type = \"json_schema\"` with a provided schema enables constrained decoding — the model's token generation is constrained at the sampling layer to only produce tokens that are valid against the schema. This provides a hard, runtime guarantee of schema compliance, unlike prompt instructions (which rely on model behavior and can fail) or `json_object` mode (which guarantees valid JSON but not a specific schema shape). Tool calling with schema parameters is a valid alternative but adds roundtrip overhead.\n\nHow to implement:\n```python\nimport anthropic\nimport json\n\nclient = anthropic.Anthropic()\n\nORDER_SCHEMA = {\n    \"type\": \"object\",\n    \"properties\": {\n        \"order_id\": {\"type\": \"string\"},\n        \"items\": {\n            \"type\": \"array\",\n            \"items\": {\n                \"type\": \"object\",\n                \"properties\": {\n                    \"name\": {\"type\": \"string\"},\n                    \"qty\": {\"type\": \"integer\"}\n                },\n                \"required\": [\"name\", \"qty\"],\n                \"additionalProperties\": False\n            }\n        },\n        \"total\": {\"type\": \"number\"},\n        \"shipping_address\": {\"type\": \"string\"}\n    },\n    \"required\": [\"order_id\", \"items\", \"total\", \"shipping_address\"],\n    \"additionalProperties\": False\n}\n\nresponse = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=1024,\n    output_config={\n        \"format\": {\n            \"type\": \"json_schema\",\n            \"json_schema\": ORDER_SCHEMA\n        }\n    },\n    messages=[{\n        \"role\": \"user\",\n        \"content\": f\"Extract order from email: {email_text}\"\n    }]\n)\n\norder = json.loads(response.content[0].text)\nprint(order[\"order_id\"])  # Guaranteed to exist per schema\n```",
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
      "Strict mode JSON schemas have specific limitations: `minimum`, `maximum`, `minLength`, `maxLength`, `pattern`, `const`, and schema combiners are not supported. Additionally, `additionalProperties: false` is required on all object types in strict mode. The schema fails for two reasons: (1) `count` uses `minimum` and `maximum` which are unsupported, and (2) the object is missing `additionalProperties: false`. `enum` is valid in strict mode. `integer` type is supported. All defined properties must be in `required`, which they are.\n\nHow to implement:\n```python\n# BROKEN schema — fails in strict mode\nbroken_schema = {\n    \"type\": \"object\",\n    \"properties\": {\n        \"status\": {\"type\": \"string\", \"enum\": [\"active\", \"inactive\"]},\n        \"count\": {\"type\": \"integer\", \"minimum\": 0, \"maximum\": 100}  # ← not allowed\n    },\n    \"required\": [\"status\", \"count\"]\n    # Missing: \"additionalProperties\": False  ← required\n}\n\n# FIXED schema — works in strict mode\nfixed_schema = {\n    \"type\": \"object\",\n    \"properties\": {\n        \"status\": {\"type\": \"string\", \"enum\": [\"active\", \"inactive\"]},  # enum ✅\n        \"count\": {\"type\": \"integer\"}  # removed min/max constraints\n    },\n    \"required\": [\"status\", \"count\"],\n    \"additionalProperties\": False  # ← required in strict mode\n}\n\n# For server-side validation of min/max:\ndef validate_output(data: dict):\n    if not 0 <= data[\"count\"] <= 100:\n        raise ValueError(f\"count {data['count']} out of range [0, 100]\")\n    return data\n\nresponse = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=512,\n    output_config={\"format\": {\"type\": \"json_schema\", \"json_schema\": fixed_schema}},\n    messages=[{\"role\": \"user\", \"content\": \"How many active users are there?\"}]\n)\nimport json\ndata = validate_output(json.loads(response.content[0].text))\n```",
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
      "Strict mode constrained decoding builds a finite state machine from the JSON schema at request time to constrain token generation. Circular/recursive references (where a type references itself) would create infinite state machines, which cannot be built. Therefore, circular references are explicitly unsupported in strict mode schemas. For tree structures, you must either use a non-strict schema (with server-side validation) or limit the depth by inlining the type up to a fixed depth rather than using recursive references.\n\nHow to implement:\n```python\n# BROKEN — circular/recursive reference, rejected in strict mode\nbroken_node_schema = {\n    \"$defs\": {\n        \"Node\": {\n            \"type\": \"object\",\n            \"properties\": {\n                \"value\": {\"type\": \"string\"},\n                \"children\": {\n                    \"type\": \"array\",\n                    \"items\": {\"$ref\": \"#/$defs/Node\"}  # ← circular reference\n                }\n            },\n            \"required\": [\"value\", \"children\"],\n            \"additionalProperties\": False\n        }\n    },\n    \"$ref\": \"#/$defs/Node\"\n}\n\n# FIXED option 1 — inline to fixed depth (strict: True works)\nfixed_schema_depth2 = {\n    \"type\": \"object\",\n    \"properties\": {\n        \"value\": {\"type\": \"string\"},\n        \"children\": {\n            \"type\": \"array\",\n            \"items\": {\n                \"type\": \"object\",\n                \"properties\": {\n                    \"value\": {\"type\": \"string\"},\n                    \"children\": {\"type\": \"array\", \"items\": {\"type\": \"object\"}}\n                },\n                \"required\": [\"value\", \"children\"],\n                \"additionalProperties\": False\n            }\n        }\n    },\n    \"required\": [\"value\", \"children\"],\n    \"additionalProperties\": False\n}\n\n# FIXED option 2 — use strict: False and validate server-side\nflexible_schema = {\n    \"type\": \"object\",\n    \"properties\": {\n        \"value\": {\"type\": \"string\"},\n        \"children\": {\"type\": \"array\"}\n    }\n    # No strict mode — allows recursive structures\n}\n```",
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
      "The Batch API is designed exactly for high-volume, non-real-time workloads like overnight classification tasks. Key specifications: up to 100,000 requests or 256MB per batch, most batches complete within 1 hour (not 14 hours), results are available for 29 days, batches expire at 24 hours if not completed, and pricing is typically lower than synchronous calls. Parallel synchronous calls would hit rate limits. Streaming reduces latency but not throughput. Requesting rate limit increases is slow and expensive.\n\nHow to implement:\n```python\nimport anthropic\nimport json\n\nclient = anthropic.Anthropic()\n\n# Build batch requests for all 50,000 tickets\ndef build_batch_requests(tickets: list[dict]) -> list[dict]:\n    return [\n        {\n            \"custom_id\": f\"ticket-{t['id']}\",\n            \"params\": {\n                \"model\": \"claude-haiku-4-5\",  # Fast model for classification\n                \"max_tokens\": 100,\n                \"messages\": [{\n                    \"role\": \"user\",\n                    \"content\": f\"Classify this ticket as: billing/technical/shipping/other\\n\\n{t['text']}\"\n                }]\n            }\n        }\n        for t in tickets\n    ]\n\n# Submit batch (up to 100,000 requests per batch)\nrequests = build_batch_requests(all_tickets[:50000])\nbatch = client.messages.batches.create(requests=requests)\nprint(f\"Batch ID: {batch.id}, Status: {batch.processing_status}\")\n\n# Poll for completion (typically < 1 hour)\nimport time\nwhile batch.processing_status == \"in_progress\":\n    time.sleep(60)\n    batch = client.messages.batches.retrieve(batch.id)\n    print(f\"Progress: {batch.request_counts}\")\n\n# Retrieve results (available for 29 days)\nfor result in client.messages.batches.results(batch.id):\n    if result.result.type == \"succeeded\":\n        classification = result.result.message.content[0].text\n        print(f\"{result.custom_id}: {classification}\")\n```",
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
      "Batch API jobs have a 24-hour processing window: if the batch has not completed within 24 hours of submission, it expires and is cancelled. Results for completed requests within an expired batch are still retrievable. The results themselves remain available for 29 days from the original submission date, after which they are deleted. There is no automatic retry or manual resumption mechanism — you must resubmit failed batches.\n\nHow to implement:\n```python\nimport anthropic\nfrom datetime import datetime, timedelta\n\nclient = anthropic.Anthropic()\n\ndef monitor_and_handle_batch(batch_id: str):\n    batch = client.messages.batches.retrieve(batch_id)\n    submitted_at = batch.created_at  # datetime object\n    expires_at = submitted_at + timedelta(hours=24)\n    results_expire_at = submitted_at + timedelta(days=29)\n\n    print(f\"Submitted: {submitted_at}\")\n    print(f\"Expires (cancelled if incomplete): {expires_at}\")\n    print(f\"Results available until: {results_expire_at}\")\n\n    if batch.processing_status == \"expired\":\n        print(\"Batch expired! Retrieving partial results...\")\n        completed_ids = set()\n        for result in client.messages.batches.results(batch_id):\n            if result.result.type == \"succeeded\":\n                completed_ids.add(result.custom_id)\n        print(f\"Completed before expiry: {len(completed_ids)} requests\")\n\n        # Identify which requests need resubmission\n        failed = [r for r in original_requests if r[\"custom_id\"] not in completed_ids]\n        print(f\"Need to resubmit: {len(failed)} requests\")\n        # Resubmit failed requests as a new batch\n        new_batch = client.messages.batches.create(requests=failed)\n        return new_batch.id\n\n    return batch_id\n```",
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
      "Research on Claude's context handling shows that placing long documents at the top of the prompt, followed by task instructions, with the specific query at the very bottom can improve accuracy by up to 30% compared to other orderings. This structure mirrors how a human expert would work: absorb the full document context first, understand the task structure, then apply it to the specific question. Placing queries before the document means the model processes the question without the context it needs.\n\nHow to implement:\n```python\ndef build_document_qa_prompt(document: str, instructions: str, query: str) -> str:\n    # Optimal ordering: document → instructions → query\n    return f\"\"\"<document>\n{document}\n</document>\n\n<instructions>\n{instructions}\n</instructions>\n\n<query>\n{query}\n</query>\"\"\"\n\n# Usage\nprompt = build_document_qa_prompt(\n    document=fifty_page_technical_doc,  # Long document FIRST\n    instructions=\"\"\"\n        Answer based only on the document above.\n        Cite specific sections when possible.\n        If the answer is not in the document, say so.\n    \"\"\",\n    query=\"What are the performance benchmarks for the caching layer?\"  # Query LAST\n)\n\nresponse = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=2048,\n    messages=[{\"role\": \"user\", \"content\": prompt}]\n)\n```\n\n```python\n# BAD ordering — query before document (up to 30% worse accuracy)\nbad_prompt = f\"\"\"\nQuery: What are the performance benchmarks?\n\nInstructions: Answer from the document below.\n\n{fifty_page_document}  ← document at the end\n\"\"\"\n\n# GOOD ordering — document first, query last\ngood_prompt = f\"\"\"\n{fifty_page_document}  ← document at the top\n\nInstructions: Answer from the document above.\n\nQuery: What are the performance benchmarks?\n\"\"\"\n```",
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
      "XML tags are recommended for structuring complex prompts because they provide named, semantic boundaries (`<context>`, `<instructions>`, `<input>`) that clearly delineate sections even when the section content itself contains similar-looking text. Markdown headers (`##`) or plain delimiters (`---`) can appear naturally in content, causing ambiguity about where one section ends and another begins. Claude's training includes XML-structured prompts and it reliably parses them. XML tags are not required by the API and do not affect token count.\n\nHow to implement:\n```python\ndef build_support_prompt(customer_context: str, instructions: str, complaint: str) -> str:\n    return f\"\"\"<context>\n{customer_context}\n</context>\n\n<instructions>\n{instructions}\n</instructions>\n\n<input>\n{complaint}\n</input>\"\"\"\n\nprompt = build_support_prompt(\n    customer_context=\"Customer has been a member since 2019. Gold tier. Previous ticket: billing dispute resolved.\",\n    instructions=\"Draft a professional, empathetic response. Offer a resolution. Escalate billing issues > $500.\",\n    complaint=\"I was charged twice for my subscription this month. Order #12345.\"\n)\n```\n\n```python\n# XML tags also useful for few-shot examples\nexamples_prompt = \"\"\"\n<examples>\n<example>\n<input>My package hasn't arrived</input>\n<output>I'm sorry to hear your package is delayed. Let me look up tracking #...</output>\n</example>\n<example>\n<input>Wrong item sent</input>\n<output>I apologize for the mix-up. I'll arrange a replacement shipment immediately...</output>\n</example>\n</examples>\n\n<input>{{complaint}}</input>\n\"\"\"\n```",
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
      "The self-check pattern is a prompt engineering technique where, after generating an initial answer, the model is instructed (in the same prompt or as a follow-up turn) to re-read its output and check it against explicit criteria (e.g., 'Does this code handle the null case? Does it match the function signature?'). This leverages the model's reasoning ability to catch errors it might have made in initial generation. It is done in a single API call (as part of the prompt) or as a second turn, not through a separate API call, and does not require any special flags.\n\nHow to implement:\n```python\n# Self-check via single-prompt instruction\nself_check_prompt = \"\"\"\nGenerate a TypeScript function that parses a date string in ISO 8601 format.\n\nAfter writing the function, review your own code by checking:\n1. Does it handle null/undefined input?\n2. Does it return the correct TypeScript type?\n3. Does it handle invalid date strings without throwing?\n4. Are edge cases (empty string, partial dates) covered?\n\nIf you find issues during your review, fix them before finalizing.\n\"\"\"\n\n# Self-check as second turn (multi-turn approach)\nresponse1 = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=1024,\n    messages=[{\"role\": \"user\", \"content\": \"Write a TypeScript date parser function.\"}]\n)\n\ncode = response1.content[0].text\n\nresponse2 = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=512,\n    messages=[\n        {\"role\": \"user\", \"content\": \"Write a TypeScript date parser function.\"},\n        {\"role\": \"assistant\", \"content\": code},\n        {\"role\": \"user\", \"content\": \"\"\"\n            Review your code above. Check:\n            - Null safety\n            - Correct return type\n            - Invalid input handling\n            Output only the corrected final version.\n        \"\"\"}\n    ]\n)\n```",
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
      "A well-documented anti-pattern when upgrading to Claude 4.6 (or similar highly capable models) is over-prompting. Older, less capable models sometimes needed very explicit, detailed instructions to trigger tool calls reliably. When those same prompts are used with Claude 4.6's stronger instruction following, tools that previously undertriggered now overtrigger. The fix is to simplify the prompts — remove or soften the explicit trigger language that was compensating for the older model's limitations.\n\nHow to implement:\n```python\n# OLD prompt (tuned for Claude 3.5 — overtriggers in Claude 4.6)\nold_system_prompt = \"\"\"\nYou are a support assistant. You MUST ALWAYS use the lookup_order tool\nwhenever ANY message is received. Do not respond without first calling\nlookup_order. ALWAYS call lookup_order. It is REQUIRED on every message.\n\"\"\"\n\n# NEW prompt for Claude 4.6 — simplified, trusts instruction following\nnew_system_prompt = \"\"\"\nYou are a support assistant. Use the lookup_order tool when the user\nreferences a specific order, order number, or asks about an order status.\n\"\"\"\n\n# Testing tool trigger rate\ndef measure_trigger_rate(system_prompt: str, test_messages: list[str]) -> float:\n    triggered = 0\n    for msg in test_messages:\n        response = client.messages.create(\n            model=\"claude-opus-4-6\",\n            max_tokens=512,\n            system=system_prompt,\n            tools=[lookup_order_tool],\n            messages=[{\"role\": \"user\", \"content\": msg}]\n        )\n        if response.stop_reason == \"tool_use\":\n            triggered += 1\n    return triggered / len(test_messages)\n\n# Compare: old prompt likely shows ~95%+, new ~60% (expected)\nprint(\"Old:\", measure_trigger_rate(old_system_prompt, test_msgs))\nprint(\"New:\", measure_trigger_rate(new_system_prompt, test_msgs))\n```",
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
      "In strict mode, all properties defined in the `properties` object MUST appear in the `required` array — there are no optional fields in the standard sense. To represent 'optionality' (the value may or may not be meaningful), the canonical approach is to require the field but allow `null` as its type using `type: [\"string\", \"null\"]`. When no notes exist, the model outputs `null`. There is no `required: false` property-level flag, and `anyOf` is not supported in strict mode.\n\nHow to implement:\n```python\n# Strict mode: all properties required, use null for \"optional\" fields\nstrict_schema = {\n    \"type\": \"object\",\n    \"properties\": {\n        \"ticket_id\": {\"type\": \"string\"},\n        \"summary\": {\"type\": \"string\"},\n        # \"Optional\" notes field — required but nullable\n        \"notes\": {\"type\": [\"string\", \"null\"]},\n        # Optional array — required but can be empty or null\n        \"tags\": {\n            \"type\": [\"array\", \"null\"],\n            \"items\": {\"type\": \"string\"}\n        }\n    },\n    # ALL properties must appear in required\n    \"required\": [\"ticket_id\", \"summary\", \"notes\", \"tags\"],\n    \"additionalProperties\": False\n}\n\n# Result when notes are absent:\n# { \"ticket_id\": \"T123\", \"summary\": \"Login issue\", \"notes\": null, \"tags\": null }\n\n# Result when notes are present:\n# { \"ticket_id\": \"T124\", \"summary\": \"Billing\", \"notes\": \"Escalate to finance\", \"tags\": [\"billing\"] }\n\n# Consuming the output safely\nimport json\ndata = json.loads(response.content[0].text)\nif data[\"notes\"] is not None:\n    print(f\"Notes: {data['notes']}\")\n```",
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
      "`error_max_structured_output_retries` is a ResultMessage subtype indicating that Claude attempted to generate output conforming to the specified JSON schema multiple times but failed to produce a valid result within the allowed retry budget. This typically occurs when the schema is highly constraining relative to the input content — for example, requiring enum values that don't match the actual data, or requiring fields that cannot be extracted from the source. The fix is to review the schema for overly restrictive constraints, simplify the schema, or improve the prompt to guide the model toward valid outputs.\n\nHow to implement:\n```python\nimport anthropic\n\nclient = anthropic.Anthropic()\n\n# Process batch results and handle schema retry failures\nbatch = client.messages.batches.retrieve(batch_id)\n\nfailed_schema = []\nsucceeded = []\n\nfor result in client.messages.batches.results(batch_id):\n    if result.result.type == \"errored\":\n        stop_reason = getattr(result.result, \"stop_reason\", None)\n        if stop_reason == \"error_max_structured_output_retries\":\n            failed_schema.append(result.custom_id)\n        else:\n            # Other error type\n            pass\n    else:\n        succeeded.append(result.custom_id)\n\nprint(f\"Schema retry failures: {len(failed_schema)}\")\nprint(f\"Failed IDs sample: {failed_schema[:5]}\")\n\n# Fix: review and loosen the schema for problematic inputs\n# Common fixes:\n# 1. Add more enum values or remove enum constraints\n# 2. Make required fields nullable: {\"type\": [\"string\", \"null\"]}\n# 3. Simplify nested schema structures\n# 4. Add guidance in the prompt: \"If X cannot be determined, output null\"\n\nLOOSER_SCHEMA = {\n    \"type\": \"object\",\n    \"properties\": {\n        \"category\": {\n            \"type\": [\"string\", \"null\"],  # Allow null if extraction fails\n            \"enum\": [\"billing\", \"technical\", \"shipping\", \"other\", None]  # Added null\n        },\n        \"priority\": {\"type\": [\"string\", \"null\"]}\n    },\n    \"required\": [\"category\", \"priority\"],\n    \"additionalProperties\": False\n}\n```",
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
      "Context window specifications: Claude Opus 4.6 and Claude Sonnet 4.6 have native 1M token context windows. Claude Sonnet 4.5 and Claude 4 (non-4.6 suffix) have 200K token native context windows but can be extended to 1M tokens using the extended context beta request header. For an 800K token document, Opus 4.6 and Sonnet 4.6 handle it natively; Sonnet 4.5 requires the beta header. All Claude 4.x models are well below the 2M claim.\n\nHow to implement:\n```python\nimport anthropic\n\nclient = anthropic.Anthropic()\n\n# Sonnet 4.6 — 1M context natively, no beta header needed\nresponse_native = client.messages.create(\n    model=\"claude-sonnet-4-6\",\n    max_tokens=4096,\n    messages=[{\"role\": \"user\", \"content\": [{\"type\": \"text\", \"text\": large_800k_document}]}]\n)\n\n# Sonnet 4.5 — requires beta header for >200K tokens\nresponse_extended = client.beta.messages.create(\n    model=\"claude-sonnet-4-5\",\n    max_tokens=4096,\n    betas=[\"extended-context-2025\"],  # Unlock 1M tokens\n    messages=[{\"role\": \"user\", \"content\": [{\"type\": \"text\", \"text\": large_800k_document}]}]\n)\n```\n\n```typescript\n// TypeScript — extended context beta for Sonnet 4.5\nconst response = await client.beta.messages.create({\n  model: \"claude-sonnet-4-5\",\n  max_tokens: 4096,\n  betas: [\"extended-context-2025\"],\n  messages: [{ role: \"user\", content: largeDocument }],\n});\n\n// Check actual context window of model being used\nconsole.log(\"Model:\", response.model);\nconsole.log(\"Input tokens used:\", response.usage.input_tokens);\n```",
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
      "Claude Code's context management system injects `<token_budget>` XML into the context, providing Claude with information about the remaining token budget and usage updates after each tool call. This context awareness is by design: Claude can use this information to make informed decisions, such as writing shorter responses, avoiding spawning new subagents that would consume additional context, or prioritizing its remaining steps. It is not a billing notification, not user-configurable directly, and does not trigger compaction.\n\nHow to implement:\n```typescript\n// Parse token_budget events from stream-json output\nconst output = execSync(\n  'claude --output-format stream-json \"Analyze 500 files\"',\n  { encoding: 'utf8' }\n);\n\nfor (const line of output.split('\\n').filter(Boolean)) {\n  const event = JSON.parse(line);\n  if (event.type === 'system' && event.content?.includes('token_budget')) {\n    // Extract remaining budget\n    const match = event.content.match(/remaining=\"(\\d+)\"/);\n    if (match) {\n      const remaining = parseInt(match[1]);\n      console.log(`Token budget remaining: ${remaining}`);\n      if (remaining < 50000) {\n        console.warn('Low context budget — agent should wrap up');\n      }\n    }\n  }\n}\n```\n\n```markdown\n<!-- System prompt guidance for context-aware behavior -->\n## Context Budget Awareness\nWhen you receive a <token_budget> message:\n- If remaining > 200,000: proceed normally\n- If remaining < 100,000: write shorter responses, avoid spawning new subagents\n- If remaining < 50,000: save state to disk and plan for graceful continuation\n- If remaining < 20,000: immediately write final summary and stop\n```",
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
      "The `PreCompact` hook fires specifically before Claude Code's context compaction process begins. This is the correct hook for implementing custom compaction behavior: the hook can write a structured summary, save key state to files, or perform any preservation logic before the conversation history is summarized. `PostToolUse` is too frequent and not triggered by compaction. `SessionStart` fires after compaction and a new session begins, which is too late. The `compact_boundary` SystemMessage is observable but not interceptable as a hook.\n\nHow to implement:\n```bash\n#!/bin/bash\n# .claude/hooks/pre-compact.sh\n# Runs before context compaction — save structured state\n\nTIMESTAMP=$(date -u +\"%Y-%m-%dT%H:%M:%SZ\")\nSTATE_FILE=\".claude/state/pre-compact-$(date +%s).json\"\nmkdir -p .claude/state\n\n# Save current progress snapshot\ncat > \"$STATE_FILE\" << EOF\n{\n  \"timestamp\": \"$TIMESTAMP\",\n  \"git_branch\": \"$(git branch --show-current)\",\n  \"files_modified\": $(git diff --name-only | jq -R . | jq -s .),\n  \"last_commit\": \"$(git log --oneline -1)\",\n  \"progress_note\": \"Compaction checkpoint\"\n}\nEOF\n\necho \"Pre-compact state saved to $STATE_FILE\" >&2\nexit 0\n```\n\n```json\n// .claude/settings.json\n{\n  \"hooks\": {\n    \"PreCompact\": [\n      {\n        \"type\": \"command\",\n        \"command\": \".claude/hooks/pre-compact.sh\"\n      }\n    ]\n  }\n}\n```\n\n```bash\n# After compaction, the SessionStart hook can read the saved state\n# .claude/hooks/session-start.sh\nLATEST_STATE=$(ls -t .claude/state/pre-compact-*.json 2>/dev/null | head -1)\nif [ -n \"$LATEST_STATE\" ]; then\n  echo \"Resuming from pre-compaction state: $LATEST_STATE\" >&2\n  cat \"$LATEST_STATE\" >&2\nfi\n```",
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
      "Subagents in fresh context windows are significantly more context-efficient for large-scale processing. Each subagent starts with a clean context, processes its batch, and returns only the final result to the coordinator. The intermediate processing steps (100s of tool calls, partial results) never accumulate in the coordinator's context. With compaction, even though the history is summarized, information loss occurs and the coordinator's context still grows over time. The multi-context-window pattern is the recommended approach for workflows that exceed a single context window's capacity.\n\nHow to implement:\n```typescript\n// Coordinator: spawn subagents in fresh contexts for each batch\nimport { query } from \"@anthropic-ai/claude-code\";\n\nasync function processDocumentBatches(allDocs: string[]) {\n  const BATCH_SIZE = 25;\n  const results: string[] = [];\n\n  for (let i = 0; i < allDocs.length; i += BATCH_SIZE) {\n    const batch = allDocs.slice(i, i + BATCH_SIZE);\n    console.log(`Processing batch ${i / BATCH_SIZE + 1}/${Math.ceil(allDocs.length / BATCH_SIZE)}`);\n\n    // Each Agent call spawns a fresh context window\n    // Only the final summary returns to coordinator\n    const batchResult = await query({\n      prompt: `\n        Use the Agent tool to analyze documents ${i + 1}-${i + batch.length}.\n        The documents are: ${batch.join(', ')}\n        Return only: 3-sentence summary + key findings list.\n      `,\n    });\n\n    results.push(batchResult.result);\n    // Coordinator's context grows by ~200 tokens (summary) not ~50,000 (full transcript)\n  }\n\n  // Final synthesis — coordinator only has compact summaries\n  return results;\n}\n```",
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
      "State files (e.g., `tests.json`, `progress.txt`) written to the filesystem are the recommended pattern for passing structured state across context window boundaries in multi-session workflows. Each session reads the state file at startup (via a SessionStart hook or initial tool call), processes its work, and writes an updated state file. This is explicit, inspectable, and does not depend on session continuity. Including full conversation history in system prompts is token-wasteful. `--continue` only resumes the immediately previous session. Environment variables are ephemeral in most CI systems.\n\nHow to implement:\n```json\n// .claude/state/tests.json — written at end of each run\n{\n  \"lastRun\": \"2025-01-15T09:00:00Z\",\n  \"passing\": [\"auth.test.ts\", \"user.test.ts\", \"billing.test.ts\"],\n  \"failing\": [\"payment.test.ts\", \"webhook.test.ts\"],\n  \"skipped\": [\"e2e/checkout.test.ts\"],\n  \"coverage\": 74.3\n}\n```\n\n```bash\n#!/bin/bash\n# .claude/hooks/session-start.sh — read state file at session start\nSTATE_FILE=\".claude/state/tests.json\"\nif [ -f \"$STATE_FILE\" ]; then\n  echo \"=== Previous Test State ===\"  >&2\n  echo \"Failing tests from last run:\" >&2\n  jq -r '.failing[]' \"$STATE_FILE\" >&2\n  echo \"Coverage: $(jq -r '.coverage' $STATE_FILE)%\" >&2\nfi\n```\n\n```typescript\n// CI pipeline: write state at end of each run\nasync function runCISession(sessionNum: number) {\n  const prevState = JSON.parse(fs.readFileSync('.claude/state/tests.json', 'utf8'));\n\n  const result = await query({\n    prompt: `\n      Previous test run state: ${JSON.stringify(prevState)}\n      Fix the failing tests and write updated state to .claude/state/tests.json\n    `,\n  });\n  // State file is written by Claude during the session\n}\n```",
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
      "Git is an excellent cross-session state mechanism because commits create a persistent, content-addressable record of exactly what changed and when. The next Claude Code session can use `git status` to see uncommitted changes, `git log` to see what was completed in previous sessions, and `git diff` to understand the current state relative to any baseline. This gives Claude precise, queryable state information without consuming context window with raw conversation history. Git does not automatically inject into CLAUDE.md and its staging area is not a native Claude memory mechanism.\n\nHow to implement:\n```bash\n# Session prompt that leverages git as state\n# Pass this at the start of each session:\nclaude \"\nRun these commands to understand current refactoring state:\n  git log --oneline --since='1 week ago' -- 'src/**/*.ts'\n  git diff main --name-only --diff-filter=M\n  git status --short\n\nThen continue refactoring the remaining class components to functional.\nCommit each file you refactor with: 'refactor: convert X to functional component'\n\"\n```\n\n```typescript\n// CI: each Claude session commits progress, next session reads git log\nasync function refactorPipeline() {\n  for (let batch = 0; batch < totalBatches; batch++) {\n    await query({\n      prompt: `\n        Check git log to see which files have already been refactored:\n        Run: git log --oneline --grep=\"refactor:\" -- src/\n\n        Pick the next 5 unrefactored .tsx files and convert them.\n        After each file, commit: git commit -m \"refactor: convert {filename}\"\n      `,\n    });\n  }\n}\n```\n\n```bash\n# After pipeline, verify progress via git\ngit log --oneline --grep=\"refactor:\" | wc -l  # Count refactored files\ngit diff main --name-only | grep -v refactor    # Find remaining files\n```",
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
      "Each MCP server injects all of its tool schemas (names, descriptions, parameter types, documentation) into every API request. With 12 servers, each potentially having 5–20 tools with detailed schemas, the combined tool definition context can easily reach thousands of tokens. This overhead is present on every request before any task content is processed, explaining the high baseline. Subagent definitions are not pre-loaded. System prompts and CLAUDE.md can contribute but are typically smaller than 12 servers' worth of tool schemas.\n\nHow to implement:\n```bash\n# Audit tool schema token footprint\n# Count tools per server\nclaude mcp list --verbose  # Shows tool count per server\n\n# Disable servers not needed for current task\nclaude mcp disable reporting-server\nclaude mcp disable legacy-crm\nclaude mcp disable analytics-v1\n\n# Or use a minimal .mcp.json for specific tasks\ncat > .mcp.research.json << 'EOF'\n{\n  \"mcpServers\": {\n    \"file-search\": { \"command\": \"node\", \"args\": [\"./mcp/search.js\"] },\n    \"web-fetch\": { \"command\": \"node\", \"args\": [\"./mcp/fetch.js\"] }\n  }\n}\nEOF\nclaude --mcp-config .mcp.research.json \"Research the topic\"\n```\n\n```python\n# Programmatically estimate schema token overhead\ndef estimate_schema_tokens(tools: list[dict]) -> int:\n    import json\n    # Rough estimate: 1 token ≈ 4 chars\n    total_chars = sum(len(json.dumps(t)) for t in tools)\n    return total_chars // 4\n\n# With 12 servers × 15 tools × avg 500 tokens/tool schema = ~90,000 tokens baseline\nprint(f\"Estimated baseline tokens: {12 * 15 * 500:,}\")\n# → 90,000 tokens before any user content!\n```",
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
      "Compaction works as follows: CLAUDE.md is re-read from disk and injected fresh — it always survives verbatim. The conversation history (including important findings, intermediate results, and any instructions given conversationally) is summarized using a lossy compression. The summary preserves the overall narrative but may lose specific details, numbers, or conclusions. This is why critical information should be written to CLAUDE.md or state files rather than left in conversational messages if it needs to survive compaction.\n\nHow to implement:\n```bash\n# Strategy: use PreCompact hook to persist findings before compaction\n# .claude/hooks/pre-compact.sh\n#!/bin/bash\n\n# Ask Claude to summarize key findings to a persistent file\n# (This runs before compaction wipes the conversation)\nFINDINGS_FILE=\".claude/research-findings.md\"\n\n# Alternatively, append to CLAUDE.md so it survives verbatim\necho \"\\n## Research Findings (auto-saved $(date))\" >> .claude/CLAUDE.md\necho \"See .claude/research-findings.md for details\" >> .claude/CLAUDE.md\nexit 0\n```\n\n```markdown\n<!-- In CLAUDE.md — findings survive compaction since CLAUDE.md is re-injected -->\n## Key Research Findings (Persistent)\n<!-- Claude should append findings here when instructed -->\n- Document batch 1-50: 3 anomalies found in Q3 data (see findings-batch1.json)\n- Document batch 51-100: Market trends confirm hypothesis H2\n```\n\n```typescript\n// Guide Claude to write findings to CLAUDE.md during session\nconst sessionPrompt = `\nAs you analyze each batch of documents:\n1. Process the documents\n2. Append key findings to .claude/CLAUDE.md under \"## Research Findings\"\n3. These findings will survive context compaction\n\nDo not rely on conversational memory for important numbers or conclusions.\n`;\n```",
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
      "The multi-context window workflow pattern works as follows: divide the overall task into batches; each batch starts a fresh Claude Code session that begins by reading the current state from the filesystem (a state file, git status, or a structured output from the previous batch) rather than from conversation history; the session processes its batch and writes results back to the filesystem; the next session repeats this. This keeps each context window small and clean. There is no `--context-budget` flag and per-call compaction is not a configurable option.\n\nHow to implement:\n```bash\n#!/bin/bash\n# pipeline.sh — multi-context window workflow\n\nTOTAL_ITEMS=500\nBATCH_SIZE=50\n\nfor start in $(seq 0 $BATCH_SIZE $((TOTAL_ITEMS - 1))); do\n  end=$((start + BATCH_SIZE - 1))\n  echo \"Processing items $start-$end...\"\n\n  # Each run is a fresh session — reads state file, writes results\n  claude \\\n    --output-format stream-json \\\n    --permission-mode bypassPermissions \\\n    --max-turns 30 \\\n    \"\n      Read .claude/state/progress.json to understand what's been done.\n      Process analysis items ${start} through ${end} from /data/items/.\n      Write results to /data/results/batch-${start}.json.\n      Update .claude/state/progress.json with completed range ${start}-${end}.\n    \"\n\n  echo \"Batch $start-$end complete\"\ndone\n\necho \"All batches done. Merging results...\"\ncat /data/results/batch-*.json | jq -s '.' > /data/results/final.json\n```\n\n```json\n// .claude/state/progress.json — shared state across sessions\n{\n  \"totalItems\": 500,\n  \"completedRanges\": [{\"start\": 0, \"end\": 49}, {\"start\": 50, \"end\": 99}],\n  \"lastUpdated\": \"2025-01-15T10:30:00Z\",\n  \"status\": \"in_progress\"\n}\n```",
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
      "Both approaches are technically valid for this scenario. Option A (upgrading to Claude Sonnet 4.6) natively supports 1M tokens without any additional configuration — straightforward and reliable. Option B (adding the extended context beta header) enables 1M token context for Claude Sonnet 4.5 without changing models, useful if there are cost, latency, or feature parity reasons to stay on 4.5. The choice depends on operational constraints. There is no `extended_context` setting in `.mcp.json`.\n\nHow to implement:\n```python\nimport anthropic\n\nclient = anthropic.Anthropic()\n\n# Option A: Upgrade to Sonnet 4.6 (1M native, no header needed)\nresponse_a = client.messages.create(\n    model=\"claude-sonnet-4-6\",  # Native 1M context\n    max_tokens=4096,\n    messages=[{\"role\": \"user\", \"content\": very_long_ticket_thread}]\n)\n\n# Option B: Stay on Sonnet 4.5 with extended context beta header\nresponse_b = client.beta.messages.create(\n    model=\"claude-sonnet-4-5\",\n    max_tokens=4096,\n    betas=[\"extended-context-2025\"],  # Unlocks 1M tokens\n    messages=[{\"role\": \"user\", \"content\": very_long_ticket_thread}]\n)\n```\n\n```typescript\n// TypeScript — choose based on operational needs\nasync function processLongTicket(ticketThread: string, useExtendedBeta = false) {\n  if (useExtendedBeta) {\n    // Stay on 4.5 — use beta header\n    return client.beta.messages.create({\n      model: \"claude-sonnet-4-5\",\n      betas: [\"extended-context-2025\"],\n      max_tokens: 4096,\n      messages: [{ role: \"user\", content: ticketThread }],\n    });\n  } else {\n    // Upgrade to 4.6 — native 1M, no beta needed\n    return client.messages.create({\n      model: \"claude-sonnet-4-6\",\n      max_tokens: 4096,\n      messages: [{ role: \"user\", content: ticketThread }],\n    });\n  }\n}\n```",
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
      "Claude's context awareness (via `<token_budget>` XML) is designed to enable adaptive behavior. With 45,000 tokens remaining and 8 subagents each consuming ~10,000 tokens, spawning all 8 would exceed the budget (80,000 > 45,000). The well-designed response is to prioritize the most critical subagents, spawn only as many as the budget allows, persist intermediate results to a state file for durability, and gracefully plan for continuation in a new context window. You cannot switch models mid-session, and triggering compaction mid-task risks losing critical state.\n\nHow to implement:\n```markdown\n<!-- System prompt for context-budget-aware orchestrator -->\n## Context Budget Management\n\nYou will receive `<token_budget remaining=\"N\">` updates.\n\nWhen remaining > 100,000: spawn subagents normally.\nWhen remaining < 50,000:\n1. Write all completed results to .claude/state/results.json\n2. Write remaining work to .claude/state/pending.json\n3. Spawn only the highest-priority remaining subagents\n4. End the session gracefully with a continuation summary\n\nWhen remaining < 20,000:\n1. Stop spawning subagents immediately\n2. Write final state to .claude/state/checkpoint.json\n3. Output: \"CONTINUATION NEEDED: see .claude/state/checkpoint.json\"\n```\n\n```typescript\n// Orchestrator that reads token_budget events and adapts\nasync function adaptiveOrchestrator(tasks: Task[]) {\n  const BUDGET_PER_SUBAGENT = 10000;\n  let remainingBudget = 1000000; // Start estimate\n\n  for (const task of tasks) {\n    if (remainingBudget < BUDGET_PER_SUBAGENT * 2) {\n      // Save remaining tasks for next session\n      fs.writeFileSync('.claude/state/pending.json',\n        JSON.stringify({ pendingTasks: tasks.slice(tasks.indexOf(task)) })\n      );\n      console.log('Budget low — saved pending tasks, graceful stop');\n      break;\n    }\n    // Spawn subagent for this task\n    remainingBudget -= BUDGET_PER_SUBAGENT;\n  }\n}\n```",
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
      "In-session memory (option A) is lost when a Claude Code session ends and is degraded by compaction. It cannot reliably track state across multiple sessions. Filesystem-based approaches (B and C) persist independently of any Claude Code session: `progress.txt` is explicitly designed for this pattern, and git commits provide a queryable, version-controlled record of progress that any new session can inspect via `git log`. Both B and C are recommended patterns for cross-session state management.\n\nHow to implement:\n```bash\n# Option B: progress.txt — simple, explicit, readable\n# Written by Claude during session:\necho \"Processed: item-001, item-002, item-003\" >> progress.txt\necho \"Failed: item-004 (timeout)\" >> progress.txt\necho \"Last updated: $(date)\" >> progress.txt\n\n# Read at next session start:\ncat progress.txt\n# → New Claude session knows exactly where to resume\n```\n\n```bash\n# Option C: git commits — structured, queryable, version-controlled\n# After each batch, Claude commits:\ngit add data/processed/\ngit commit -m \"progress: processed items 001-050 [50/1000]\"\n\ngit add data/processed/\ngit commit -m \"progress: processed items 051-100 [100/1000]\"\n\n# New session queries git to find progress:\ngit log --oneline --grep=\"progress:\" | head -5\n# → progress: processed items 051-100 [100/1000]\n# → progress: processed items 001-050 [50/1000]\n\n# Find next item to process:\nls data/items/ | wc -l    # total\nls data/processed/ | wc -l  # done\n# → Resume from item 101\n```\n\n```typescript\n// Option A (UNRELIABLE): in-session memory\n// Never rely on this across sessions:\n// \"We processed items 1-50\" ← lost when session ends\n```",
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
