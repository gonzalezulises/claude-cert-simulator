// ============================================================
// Claude Certified Architect – Foundations
// Exam Question Bank
// ============================================================

export type Scenario =
  | "Customer Support Resolution Agent"
  | "Code Generation with Claude Code"
  | "Multi-Agent Research System"
  | "Developer Productivity with Claude"
  | "Claude Code for Continuous Integration"
  | "Structured Data Extraction";

export type Domain = 1 | 2 | 3 | 4 | 5;

export type Difficulty = "basic" | "intermediate" | "advanced";

export type OptionId = "A" | "B" | "C" | "D";

// A key is the correct letters in order: "C" for single response, "BD" for "select two".
export type AnswerKey = OptionId | "AB" | "AC" | "AD" | "BC" | "BD" | "CD";

export interface Option {
  id: OptionId;
  text: string;
}

export interface Question {
  id: string;
  scenario: Scenario;
  domain: Domain;
  domainName: string;
  taskStatement: string;
  difficulty: Difficulty;
  question: string;
  options: Option[];
  correctAnswer: AnswerKey;
  explanation: string;
  keyConcept: string;
  sources?: { title: string; url: string }[];
}

// ============================================================
// DOMAIN 1 – Agentic Architecture & Orchestration (27%)
// ============================================================

const domain1Questions: Question[] = [
  {
    id: "D1-001",
    scenario: "Customer Support Resolution Agent",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.1",
    difficulty: "intermediate",
    question:
      "Your support agent's loop sends a request with the `lookup_order` and `process_refund` tools. The response has `stop_reason: \"tool_use\"`, a short text block saying \"Let me check that order for you,\" and a `tool_use` block for `lookup_order`. What should the loop do next?",
    options: [
      { id: "A", text: "Run lookup_order, append the assistant turn and a matching tool_result, then call Claude again" },
      { id: "B", text: "Show the text block to the customer and wait for their next message, since the model has replied" },
      { id: "C", text: "Treat the text block as the final answer and end the turn, leaving the pending tool call unanswered" },
      { id: "D", text: "Run lookup_order and send its raw output straight to the customer, skipping another call to Claude" },
    ],
    correctAnswer: "A",
    explanation:
      "`stop_reason: \"tool_use\"` means Claude is asking for a tool result before it can go on. The loop runs the tool, appends the assistant content unchanged, adds a user message with one `tool_result` per `tool_use` block, and calls Claude again. It repeats until `stop_reason` is `\"end_turn\"`.\n\nOption B and Option C both treat the text block as a sign the turn is over. Checking for assistant text is one of the completion anti-patterns the guide names: a `tool_use` turn often includes text. Option D skips the model, so Claude never reasons over the order data (for example, to decide whether a refund applies).\n\nHow to implement:\n```typescript\nlet messages = [{ role: \"user\", content: customerMessage }];\nwhile (true) {\n  const res = await client.messages.create({\n    model: \"claude-sonnet-5-5\", max_tokens: 2048, tools, messages,\n  });\n  messages.push({ role: \"assistant\", content: res.content });\n  if (res.stop_reason !== \"tool_use\") break; // \"end_turn\": done\n  const results = await Promise.all(\n    res.content.filter(b => b.type === \"tool_use\").map(async b => ({\n      type: \"tool_result\", tool_use_id: b.id, content: await runTool(b.name, b.input),\n    })),\n  );\n  messages.push({ role: \"user\", content: results });\n}\n```",
    keyConcept: "stop_reason \"tool_use\" means run the tool, return the result and call again",
    sources: [
      { title: "Handle tool calls", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls" },
      { title: "Handling stop reasons", url: "https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D1-002",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.2",
    difficulty: "intermediate",
    question:
      "In your research system, the search, analysis and synthesis subagents read and write a shared \"blackboard\" document directly, and the coordinator only starts them. A final report contains a wrong statistic, and nobody can tell which agent introduced it; a failed analysis step also flowed into synthesis unnoticed. Which change fixes both problems?",
    options: [
      { id: "A", text: "Have each subagent re-read the shared blackboard more often so the agents catch each other's errors" },
      { id: "B", text: "Route all traffic between subagents through the coordinator, which passes each only what it needs" },
      { id: "C", text: "Merge the three subagents into one agent with a longer prompt, so no information has to move at all" },
      { id: "D", text: "Give every subagent the coordinator's full conversation history so that they all share one picture" },
    ],
    correctAnswer: "B",
    explanation:
      "Hub-and-spoke puts the coordinator in charge of all inter-subagent communication. Every handoff then passes through one place, so you can see what each subagent received and returned, catch and classify failures before they reach synthesis, and control which information flows where. That addresses both the untraceable statistic and the silent failure.\n\nOption A keeps the unobserved shared channel and adds more reads of possibly wrong data. Option C removes the specialization and the context isolation that made subagents useful. Option D floods each subagent with irrelevant context, and subagents do not inherit the coordinator's history anyway: the coordinator has to pass context explicitly.\n\nHow to implement:\n```typescript\nconst search = await runSubagent(\"web-search\", { topic, subtopics });\nif (search.status === \"error\") return handleSearchFailure(search); // caught at the hub\nconst analysis = await runSubagent(\"doc-analysis\", { documents: search.documents });\nlog({ step: \"analysis\", input: search.documents.length, output: analysis.findings.length });\nconst report = await runSubagent(\"synthesis\", { findings: analysis.findings });\n```",
    keyConcept: "Route all subagent communication through the coordinator for observability and error handling",
    sources: [
      { title: "How we built our multi-agent research system", url: "https://www.anthropic.com/research/multi-agent-research-system" },
      { title: "Subagents in the SDK", url: "https://code.claude.com/docs/en/agent-sdk/subagents" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D1-003",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.3",
    difficulty: "advanced",
    question:
      "A coordinator built with the Agent SDK defines `web-search` and `doc-analysis` subagents in its `agents` option and runs headless with `allowedTools: [\"Read\", \"Grep\", \"WebSearch\"]`. Logs show the coordinator doing all the searching itself, and every attempt to delegate is refused. The subagent definitions are valid. What is the cause?",
    options: [
      { id: "A", text: "Each subagent's own tools list must include \"Task\" before the coordinator is able to call it" },
      { id: "B", text: "Subagents load only from .claude/agents/ files; definitions passed in code are ignored headless" },
      { id: "C", text: "The coordinator's allowedTools lacks \"Task\", the tool through which it spawns its subagents" },
      { id: "D", text: "Delegation needs a parentAgentId on every AgentDefinition, pointing back to the coordinator" },
    ],
    correctAnswer: "C",
    explanation:
      "A coordinator spawns subagents through the Task tool, so its `allowedTools` must include `\"Task\"`. Without it, each delegation attempt is refused and the coordinator falls back to doing the work itself, which is exactly what the logs show. In the current product the tool is named `Agent` (renamed in Claude Code v2.1.63); `Task` still works as an alias.\n\nOption A puts the requirement on the wrong agent: a subagent's own `tools` only matter if that subagent spawns subagents of its own, which current Claude Code allows up to three layers deep by default (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`). Option B is false: programmatic definitions are the recommended approach for SDK apps and override file-based agents with the same name. Option D describes a field that does not exist.\n\nHow to implement:\n```typescript\nfor await (const msg of query({\n  prompt: \"Research the impact of AI on creative industries\",\n  options: {\n    allowedTools: [\"Read\", \"Grep\", \"WebSearch\", \"Task\"], // \"Agent\" in current releases\n    agents: {\n      \"web-search\": { description: \"Finds sources on the web\", prompt: searchPrompt, tools: [\"WebSearch\", \"WebFetch\"] },\n      \"doc-analysis\": { description: \"Analyzes documents\", prompt: analysisPrompt, tools: [\"Read\", \"Grep\"] },\n    },\n  },\n})) { /* ... */ }\n```",
    keyConcept: "The coordinator's allowedTools must include Task (now Agent) to spawn subagents",
    sources: [
      { title: "Subagents in the SDK", url: "https://code.claude.com/docs/en/agent-sdk/subagents" },
      { title: "Create custom subagents", url: "https://code.claude.com/docs/en/sub-agents" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D1-004",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.7",
    difficulty: "advanced",
    question:
      "After an hour-long session that mapped a dataset's quirks, your team wants to try two analysis strategies, clustering and regression, without either one contaminating the other, while keeping the original analysis intact for comparison. What should you do?",
    options: [
      { id: "A", text: "Fork the analyzed session twice with fork_session, so each strategy runs on its own branch" },
      { id: "B", text: "Resume the original session with --resume and run both strategies in it one after the other" },
      { id: "C", text: "Start two brand-new sessions and let each one re-explore the whole dataset from the beginning" },
      { id: "D", text: "Run both strategies in subagents that write their interim results into the same session log" },
    ],
    correctAnswer: "A",
    explanation:
      "fork_session creates a new session that starts with a copy of the original's history and then diverges, with its own session ID. Forking twice gives each strategy the shared baseline analysis without either seeing the other's work, and the original session stays unchanged for comparison.\n\nOption B mixes both strategies into one history, so the second is influenced by the first. Option C throws away an hour of valid analysis. Option D brings the strategies back together in one shared log, which is the contamination you wanted to avoid. Note that forking branches the conversation, not the filesystem: if a branch edits files, the other branches see those edits.\n\nHow to implement:\n```bash\nclaude --resume dataset-analysis --fork-session -p \"Try k-means clustering on the cleaned data\"\nclaude --resume dataset-analysis --fork-session -p \"Try a regression model on the cleaned data\"\n# SDK: query({ prompt, options: { resume: sessionId, forkSession: true } })\n```",
    keyConcept: "fork_session branches a shared baseline into independent explorations",
    sources: [
      { title: "Work with sessions", url: "https://code.claude.com/docs/en/agent-sdk/sessions" },
      { title: "CLI reference", url: "https://code.claude.com/docs/en/cli-reference" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.7", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D1-005",
    scenario: "Customer Support Resolution Agent",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.4",
    difficulty: "intermediate",
    question:
      "Mid-conversation, your agent decides a billing dispute needs a human: the customer was charged twice and wants one charge reversed, which is above the agent's authority. Human agents work in a separate queue tool and cannot see the chat transcript. What should the agent send through `escalate_to_human`?",
    options: [
      { id: "A", text: "A one-line note such as \"Billing dispute, needs review\" so the human can look at the case fresh" },
      { id: "B", text: "The raw transcript pasted in full, so the human can read everything the customer and agent said" },
      { id: "C", text: "A structured summary: customer ID, root cause found, amount at stake and the recommended action" },
      { id: "D", text: "Only the customer ID, since the human can open the account and ask the customer to explain again" },
    ],
    correctAnswer: "C",
    explanation:
      "A mid-process handoff has to let someone without the transcript act at once. A structured summary (customer ID, what the agent verified and the root cause, the amount involved, and the action it recommends) gives the human the decision instead of the research. That is the handoff protocol the guide describes for humans who lack access to the conversation.\n\nOption A forces the human to redo the whole investigation. Option B technically carries everything, but buries the root cause and the requested amount in a conversation the human must re-read. Option D makes the customer repeat their story, which is the opposite of first-contact resolution.\n\nHow to implement:\n```typescript\nawait tools.escalate_to_human({\n  customer_id: \"C-48213\",\n  issue: \"Duplicate charge\",\n  root_cause: \"Payment retried after gateway timeout; both captures settled on 2026-11-03\",\n  amount: { value: 89.0, currency: \"USD\" },\n  verified: [\"identity\", \"both charges in ledger\"],\n  recommended_action: \"Reverse capture ch_2 (89.00 USD)\",\n});\n```",
    keyConcept: "Structured handoff summaries for humans who cannot see the conversation",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 1.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D1-006",
    scenario: "Customer Support Resolution Agent",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.5",
    difficulty: "intermediate",
    question:
      "Policy lets the support agent refund up to $500; anything larger must go to a human. The system prompt states the rule clearly, yet weekly audits still find a few refunds of $700 to $900 processed with no human involved. What is the right fix?",
    options: [
      { id: "A", text: "Add few-shot examples of large refunds being escalated so the model learns where the threshold is" },
      { id: "B", text: "A PreToolUse hook on process_refund that denies amounts over $500 and tells the agent to escalate" },
      { id: "C", text: "A PostToolUse hook on process_refund that flags any refund over $500 for a human to check later" },
      { id: "D", text: "Remove process_refund from the agent so that humans handle every refund, whatever the amount is" },
    ],
    correctAnswer: "B",
    explanation:
      "A business rule that must hold every time needs a deterministic check, not a better instruction. A PreToolUse hook inspects the pending `process_refund` call, denies it when the amount exceeds $500, and its reason redirects the agent to `escalate_to_human`. The refund never executes, and the conversation continues down the right path.\n\nOption A improves the odds but stays probabilistic, so the leak shrinks without closing. Option C detects the violation after the money has moved. Option D enforces the rule by destroying the 80% first-contact resolution target: small refunds the agent should handle would all go to humans.\n\nHow to implement:\n```typescript\nconst refundLimit: HookCallback = async (input) => {\n  const { tool_input } = input as PreToolUseHookInput;\n  if ((tool_input as { amount: number }).amount > 500) {\n    return { hookSpecificOutput: { hookEventName: \"PreToolUse\", permissionDecision: \"deny\",\n      permissionDecisionReason: \"Refunds over $500 need a human. Call escalate_to_human with a summary.\" } };\n  }\n  return {};\n};\n// options.hooks = { PreToolUse: [{ matcher: \"mcp__support__process_refund\", hooks: [refundLimit] }] }\n```",
    keyConcept: "Interception hooks block policy-violating tool calls and redirect to escalation",
    sources: [
      { title: "Intercept and control agent behavior with hooks", url: "https://code.claude.com/docs/en/agent-sdk/hooks" },
      { title: "Hooks reference", url: "https://code.claude.com/docs/en/hooks" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D1-007",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.6",
    difficulty: "basic",
    question:
      "A research pipeline always runs the same four steps: (1) fetch papers, (2) extract key claims, (3) cross-check citations, (4) write a summary. Each step's input is entirely the previous step's output, and the structure never changes between topics. Which decomposition strategy fits best?",
    options: [
      { id: "A", text: "Dynamic adaptive decomposition, letting the agent pick its next action after each of the steps" },
      { id: "B", text: "Parallel execution, running all four steps at the same time and merging all of their outputs at the end" },
      { id: "C", text: "Prompt chaining: fix the sequence in advance and pass each step's output as input to the next one" },
      { id: "D", text: "A single prompt holding every instruction, so that Claude completes all four steps in one reply" },
    ],
    correctAnswer: "C",
    explanation:
      "When the steps are known in advance and each depends on the previous one, prompt chaining is the right pattern. Each call has one focused job, and you can validate or handle errors at every boundary before passing the output on.\n\nOption A pays for flexibility the task does not need and makes runs less predictable. Option B is impossible here: step 2 needs step 1's output, so the steps are not independent. Option D asks one call to do four focused jobs at once, which dilutes attention and removes the checkpoints between steps.\n\nHow to implement:\n```typescript\nconst papers = await step(\"Fetch the most relevant papers on: \" + topic);\nconst claims = await step(\"Extract the key claims from these papers:\\n\" + papers);\nconst checked = await step(\"Cross-check the citations behind these claims:\\n\" + claims);\nconst summary = await step(\"Write a summary of the verified claims:\\n\" + checked);\n```",
    keyConcept: "Prompt chaining for fixed, predictable sequences of dependent steps",
    sources: [
      { title: "Building effective agents", url: "https://www.anthropic.com/research/building-effective-agents" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.6", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D1-008",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.6",
    difficulty: "advanced",
    question:
      "A research agent is investigating a new scientific topic and cannot know in advance which sub-questions will matter. After reading the first paper, it finds three unexpected sub-topics, each needing different sources and tools. Which decomposition strategy is designed for this situation?",
    options: [
      { id: "A", text: "Adaptive decomposition: generate the next subtasks from what each step has actually uncovered" },
      { id: "B", text: "Prompt chaining with three predefined chains, one per sub-topic, written before the search starts" },
      { id: "C", text: "A static plan in the system prompt that lists every path the investigation could possibly take" },
      { id: "D", text: "Sequential passes that apply one fixed prompt template to each sub-topic, one after the other" },
    ],
    correctAnswer: "A",
    explanation:
      "Open-ended investigation is where dynamic, adaptive decomposition earns its cost: the plan is generated from intermediate findings, so new subtasks appear as the evidence reveals them, and each can get the sources and tools it needs.\n\nOption B needs the structure before the search, but these sub-topics only appeared after reading the first paper. Option C tries to enumerate the unknown in advance and still misses what nobody predicted. Option D adapts the order but not the approach: one template cannot fit sub-topics that need different sources and tools.\n\nHow to implement:\n```typescript\nlet queue = [initialQuestion];\nwhile (queue.length) {\n  const q = queue.shift()!;\n  const result = await investigate(q);              // returns findings + newQuestions\n  findings.push(...result.findings);\n  queue.push(...prioritize(result.newQuestions));    // plan grows from what was found\n}\n```",
    keyConcept: "Dynamic adaptive decomposition for open-ended tasks whose structure emerges",
    sources: [
      { title: "Building effective agents", url: "https://www.anthropic.com/research/building-effective-agents" },
      { title: "How we built our multi-agent research system", url: "https://www.anthropic.com/research/multi-agent-research-system" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.6", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D1-009",
    scenario: "Developer Productivity with Claude",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.7",
    difficulty: "basic",
    question:
      "On Monday an engineer ran a named session, \"billing-legacy\", that traced how an old billing module works. Nobody has touched that code since. On Tuesday she wants to keep investigating where she left off. What is the most efficient way to continue?",
    options: [
      { id: "A", text: "Resume it by name with claude --resume billing-legacy and carry on from Monday's context" },
      { id: "B", text: "Start a fresh session and paste in a summary, because resumed context is never reliable" },
      { id: "C", text: "Fork Monday's session with fork_session so the original is kept as a backup of the work" },
      { id: "D", text: "Open a fresh session and have the agent re-read the module to rebuild what it knew before" },
    ],
    correctAnswer: "A",
    explanation:
      "Resume when the prior context is still valid. The code has not changed, so Monday's file reads and conclusions are accurate, and `claude --resume billing-legacy` brings them all back by name.\n\nOption B applies the rule for stale context to a case where nothing is stale; a summary would only lose detail. Option C creates a branch nobody needs: resuming adds to the session, and there is no divergent approach to explore. Option D repeats an investigation whose results are still correct.\n\nHow to implement:\n```bash\nclaude -n billing-legacy            # Monday: name the session (or /rename in-session)\nclaude --resume billing-legacy      # Tuesday: continue with full prior context\n```",
    keyConcept: "Resume a named session when its prior context is still valid",
    sources: [
      { title: "CLI reference", url: "https://code.claude.com/docs/en/cli-reference" },
      { title: "Manage sessions", url: "https://code.claude.com/docs/en/sessions" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.7", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D1-010",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.4",
    difficulty: "advanced",
    question:
      "Policy says data analysis may start only after a human has approved the literature review. In testing, the coordinator sometimes calls `run_analysis` right after `complete_literature_review`, even though its system prompt tells it to wait for approval. What enforces the required order?",
    options: [
      { id: "A", text: "A stronger system prompt that lists the phases in order and repeats that approval comes first" },
      { id: "B", text: "A stop_sequence after the review, so generation halts there until a person types the approval" },
      { id: "C", text: "A PostToolUse hook on run_analysis that discards its output when no approval has been recorded" },
      { id: "D", text: "A PreToolUse hook that denies run_analysis until a human approval for this review is recorded" },
    ],
    correctAnswer: "D",
    explanation:
      "When an order must hold every time, the check belongs in code that runs before the downstream tool executes. A PreToolUse hook sees the pending `run_analysis` call and denies it, with a reason, until the approval is on record. The model cannot skip it, because the gate is not an instruction to the model.\n\nOption A is still prompt-based guidance with a non-zero failure rate, which is what testing already showed. Option B controls where text generation stops; it does not tie anything to a human approval or to tool calls. Option C fires too late: PostToolUse runs after the analysis has already executed, so the cost and any side effects have happened.\n\nHow to implement:\n```typescript\nconst approved = new Set<string>();\nconst gate: HookCallback = async (input) => {\n  const { tool_name, tool_input } = input as PreToolUseHookInput;\n  if (tool_name === \"run_analysis\" && !approved.has((tool_input as any).review_id)) {\n    return { hookSpecificOutput: { hookEventName: \"PreToolUse\", permissionDecision: \"deny\",\n      permissionDecisionReason: \"Waiting for human approval of the literature review.\" } };\n  }\n  return {};\n};\n// options.hooks = { PreToolUse: [{ matcher: \"run_analysis\", hooks: [gate] }] }\n```",
    keyConcept: "Programmatic prerequisite gates block downstream tools until earlier steps are done",
    sources: [
      { title: "Intercept and control agent behavior with hooks", url: "https://code.claude.com/docs/en/agent-sdk/hooks" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D1-011",
    scenario: "Customer Support Resolution Agent",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.1",
    difficulty: "basic",
    question:
      "A developer's loop runs each tool Claude requests, then sends a new request containing only the customer's original message and the latest `tool_result`. In production the agent keeps calling `get_customer` again and forgets facts it found two steps earlier. What is the fix?",
    options: [
      { id: "A", text: "Keep the full history: append every assistant tool_use turn and its tool_result before the next call" },
      { id: "B", text: "Add a system prompt line telling the agent to remember earlier tool results instead of calling again" },
      { id: "C", text: "Cache get_customer responses so that repeated calls return instantly and cost nothing on later turns" },
      { id: "D", text: "Raise max_tokens so that the model has more room to carry its earlier findings forward in reasoning" },
    ],
    correctAnswer: "A",
    explanation:
      "Claude has no memory between requests: what it knows is what is in `messages`. The loop must append each assistant turn (with its `tool_use` blocks) and the user turn with the matching `tool_result` blocks, so each iteration builds on the last. The API also requires every `tool_result` to immediately follow the `tool_use` it answers, which a stripped history breaks.\n\nOption B asks the model to remember something it was never sent. Option C makes the repeated calls cheaper but leaves the agent just as blind to its earlier findings. Option D enlarges the output budget; it does not put the missing results back into the input.\n\nHow to implement:\n```typescript\nmessages.push({ role: \"assistant\", content: response.content });\nmessages.push({ role: \"user\", content: toolResults }); // tool_result blocks first\nconst next = await client.messages.create({ model: \"claude-sonnet-5-5\", max_tokens: 2048, tools, messages });\n```",
    keyConcept: "Tool results are appended to the conversation history so the next iteration can use them",
    sources: [
      { title: "Handle tool calls", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D1-012",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.3",
    difficulty: "intermediate",
    question:
      "Your coordinator passes the synthesis subagent the findings from the search and document-analysis subagents as one long block of concatenated prose. The resulting reports make correct claims but often attach the wrong source to them, or none at all. How should the coordinator pass these findings?",
    options: [
      { id: "A", text: "Ask the synthesis subagent to infer each claim's source from the wording and context of the prose" },
      { id: "B", text: "Send only a short summary of each finding so the synthesis prompt stays small and centered on claims" },
      { id: "C", text: "Keep the prose as it is but append one bibliography of every URL consulted at the end of the prompt" },
      { id: "D", text: "Send structured records that keep each claim apart from its metadata: source URL, document and page" },
    ],
    correctAnswer: "D",
    explanation:
      "Attribution survives a handoff only if it travels with each claim. Structured records (for example, JSON objects with `claim`, `source_url`, `document`, `page`) separate content from metadata, so the synthesis subagent can cite exactly what supports each statement. Subagents only know what is in their prompt, so the coordinator has to include these complete findings directly.\n\nOption A asks the model to reconstruct a mapping that was thrown away; it will guess. Option B shrinks the input but deletes the very metadata that is missing. Option C keeps the sources, but a flat list at the end no longer says which claim came from which document.\n\nHow to implement:\n```typescript\nconst findings = [\n  { claim: \"Streaming royalties fell 12% in 2025\", source_url: \"https://example.org/report\", document: \"IFPI Global Report\", page: 14 },\n  { claim: \"...\", source_url: \"...\", document: \"...\", page: 3 },\n];\nawait runSubagent(\"synthesis\", `Write the section. Cite source_url and page for every claim.\\n${JSON.stringify(findings)}`);\n```",
    keyConcept: "Pass context between agents as structured data that keeps claims and source metadata together",
    sources: [
      { title: "Subagents in the SDK", url: "https://code.claude.com/docs/en/agent-sdk/subagents" },
      { title: "How we built our multi-agent research system", url: "https://www.anthropic.com/research/multi-agent-research-system" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
];

// ============================================================
// DOMAIN 2 – Tool Design & MCP Integration (18%)
// ============================================================

const domain2Questions: Question[] = [
  {
    id: "D2-001",
    scenario: "Customer Support Resolution Agent",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.1",
    difficulty: "intermediate",
    question:
      "Your support agent's tools have detailed, clearly separated descriptions: `lookup_order` says to use it only when the customer gives an order number or asks about a specific purchase, and `search_policies` covers general questions about return windows, refund rules and fees. Last week someone added this line to the system prompt: \"Whenever a customer mentions a refund, call lookup_order first.\" Since then, 40% of general questions such as \"What is your refund policy for opened items?\" trigger a `lookup_order` call that fails for lack of an order number. What should you change first?",
    options: [
      { id: "A", text: "Reword the system prompt line so it covers only refund requests about a specific order, and let the descriptions route general questions." },
      { id: "B", text: "Make the `lookup_order` description longer, stating in capital letters that it must never be used for general questions about refund policies or fees." },
      { id: "C", text: "Add a pre-processing classifier that strips the word \"refund\" from general questions before the customer's message reaches the agent." },
      { id: "D", text: "Force `tool_choice` to `search_policies` whenever the customer's message contains the word \"policy\" or \"refund\", and leave the prompt as it is." },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct. The evidence isolates the cause: the descriptions were already good, and the misrouting started when a keyword-triggered instruction was added to the system prompt. An instruction like \"whenever a customer mentions a refund, call lookup_order\" creates an unintended association between a word and a tool, and it overrides well-written descriptions. Scoping the instruction to order-specific refund requests removes the conflict at its source.\n\nB fights the system prompt with the description: the boundary is already stated there and the prompt still wins, so capital letters only escalate the conflict. C adds an over-engineered layer that rewrites customer input and hides the real defect. D replaces model judgment with another keyword rule: \"refund\" also appears in order-specific requests, so forcing `search_policies` would break the legitimate case.\n\nHow to implement:\n```text\n# BEFORE (keyword trigger)\nWhenever a customer mentions a refund, call lookup_order first.\n\n# AFTER (scoped to the real need)\nWhen a customer asks for a refund on a specific purchase, confirm the order\nwith lookup_order before discussing eligibility. For general questions about\nrefund rules, follow the tool descriptions.\n```",
    keyConcept: "Keyword-sensitive system prompt instructions can override well-written tool descriptions",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 2.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Define tools (Claude API docs)", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools" },
    ],
  },
  {
    id: "D2-002",
    scenario: "Multi-Agent Research System",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.1",
    difficulty: "advanced",
    question:
      "The document-analysis subagent has one tool, `analyze_document(document_id, instructions)`, described as \"Analyzes a document according to the instructions.\" The coordinator uses it for three different jobs: pulling numeric data points, writing a summary, and checking whether a specific claim is supported by a source. Logs show that claim checks often come back as summaries, and downstream code can't parse the results because the output shape changes from call to call. What is the most effective redesign?",
    options: [
      { id: "A", text: "Keep the single tool but add a free-text `output_format` parameter, so the coordinator can describe the shape it wants on every call it makes." },
      { id: "B", text: "Split it into `extract_data_points`, `summarize_content` and `verify_claim_against_source`, each with its own description and contract." },
      { id: "C", text: "Keep the single tool and add five few-shot examples to the subagent's system prompt showing the correct output for each of the three request types." },
      { id: "D", text: "Post-process every result with a second model call that classifies the output type and reformats it into the shape the coordinator was expecting." },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct. A generic tool that does three jobs forces the model to infer the purpose from free-text instructions, and it gives downstream code no stable output contract. Splitting it into purpose-specific tools gives each job a precise description, its own input schema and a fixed output, for example `{ supported, evidence_quote }` for claim verification, so the model picks the right operation and the coordinator gets parseable results.\n\nA keeps the ambiguity and moves the contract into per-call prose that nothing validates. C adds token overhead without creating a contract, and the single tool still covers three jobs. D treats the symptom after the fact, adds latency and cost, and cannot turn a summary back into the verification that was needed. Anthropic's docs also recommend grouping related operations behind one tool with an `action` parameter; that works when the operations share a contract, which these three do not.\n\nHow to implement:\n```typescript\nconst tools = [\n  { name: \"extract_data_points\",\n    description: \"Extracts numeric facts (value, unit, page) from one document. Returns a list; never summarizes.\",\n    input_schema: { type: \"object\", properties: { document_id: { type: \"string\" } }, required: [\"document_id\"] } },\n  { name: \"summarize_content\",\n    description: \"Writes a summary of one document of at most 200 words. Does not check claims.\",\n    input_schema: { type: \"object\", properties: { document_id: { type: \"string\" } }, required: [\"document_id\"] } },\n  { name: \"verify_claim_against_source\",\n    description: \"Checks one claim against one document. Returns { supported: boolean, evidence_quote: string | null }.\",\n    input_schema: { type: \"object\", properties: { document_id: { type: \"string\" }, claim: { type: \"string\" } }, required: [\"document_id\", \"claim\"] } },\n];\n```",
    keyConcept: "Splitting a generic tool into purpose-specific tools with defined contracts",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 2.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Define tools (Claude API docs)", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools" },
      { title: "Writing effective tools for agents (Anthropic Engineering)", url: "https://www.anthropic.com/research/writing-tools-for-agents" },
    ],
  },
  {
    id: "D2-003",
    scenario: "Customer Support Resolution Agent",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.2",
    difficulty: "intermediate",
    question:
      "Your MCP tool `update_order_status` is called with an order ID that does not exist. The server currently returns a normal result whose only text is \"Operation failed\". Logs show the agent retries the same call four or five times and then tells the customer that \"the system is down.\" What should the tool return instead?",
    options: [
      { id: "A", text: "A JSON-RPC protocol error with code -32602, so the MCP client stops the call before the result ever reaches the model's context." },
      { id: "B", text: "An empty successful result, so the agent assumes the update wasn't needed and moves on to the next step of the conversation." },
      { id: "C", text: "The same \"Operation failed\" text, plus a system prompt rule telling the agent never to retry a tool call more than twice." },
      { id: "D", text: "A result with `isError: true` saying the order wasn't found, plus `errorCategory: \"validation\"` and `isRetryable: false`." },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct. The MCP specification reports tool execution errors, including input validation errors, inside the tool result with `isError: true`, so the model can see what went wrong and correct course. Adding `errorCategory: \"validation\"` and `isRetryable: false` tells the agent that repeating the call is pointless and that it should ask the customer to confirm the order number instead.\n\nA misuses protocol errors, which the spec reserves for unknown tools, malformed requests and server errors; the client may not pass them to the model, and the \"order not found\" meaning is lost. B disguises a failure as success, so the agent proceeds as if nothing happened. C keeps the uniform \"Operation failed\" message, so the agent still can't tell a bad ID from an outage and simply fails faster.\n\nHow to implement:\n```typescript\nif (!order) {\n  return {\n    isError: true,\n    content: [{ type: \"text\", text: JSON.stringify({\n      errorCategory: \"validation\",\n      isRetryable: false,\n      message: `Order ${orderId} does not exist. Ask the customer to confirm the order number.`,\n    }) }],\n  };\n}\n```",
    keyConcept: "MCP isError with structured, non-retryable validation metadata",
    sources: [
      { title: "MCP specification — Tools (error handling)", url: "https://modelcontextprotocol.io/specification/2026-07-28/server/tools" },
      { title: "CCAR-F Exam Guide v1.0 — Task 2.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D2-004",
    scenario: "Multi-Agent Research System",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.2",
    difficulty: "intermediate",
    question:
      "The document-search subagent calls `search_archive(query)`. When the archive index is unreachable, the tool catches the exception and returns `{ \"results\": [] }`, exactly what it returns when a query matches nothing. Last night the index was down for an hour, and three reports stated that \"no prior research exists\" on topics that are well covered in the archive. What change fixes this at the source?",
    options: [
      { id: "A", text: "Have the synthesis agent treat every empty result list as suspicious and always rerun the same query twice before concluding there is no coverage." },
      { id: "B", text: "Remove the try/catch from the tool, so any exception propagates upward and terminates the research workflow before the report is written." },
      { id: "C", text: "Add a `status: \"ok\"` field to every response and tell the subagent in its system prompt to double-check its results when the list is empty." },
      { id: "D", text: "Return `isError: true`, `errorCategory: \"transient\"` and `isRetryable: true` when the index is down; keep `[]` for true no-match results." },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct. An access failure and a valid empty result are different outcomes and need different decisions: the first calls for a retry or a reported gap, the second is a successful query with no matches. Returning a structured transient error for the outage, and a successful empty list only for real no-match queries, lets the agent tell them apart.\n\nA wastes calls on every genuine empty result and still can't tell an outage from a real absence. B overreacts: it kills the whole workflow, and all its finished work, for a recoverable outage. C adds a field that always says \"ok\", so the failure is still disguised as success; no prompt can recover information the tool threw away.\n\nHow to implement:\n```typescript\ntry {\n  const hits = await archive.search(query);\n  return { content: [{ type: \"text\", text: JSON.stringify({ results: hits }) }] }; // [] = real no-match\n} catch (err) {\n  return {\n    isError: true,\n    content: [{ type: \"text\", text: JSON.stringify({\n      errorCategory: \"transient\", isRetryable: true,\n      message: \"Archive index unreachable; results unknown, not empty.\",\n    }) }],\n  };\n}\n```",
    keyConcept: "Distinguishing access failures from valid empty results",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 2.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "MCP specification — Tools (error handling)", url: "https://modelcontextprotocol.io/specification/2026-07-28/server/tools" },
    ],
  },
  {
    id: "D2-005",
    scenario: "Multi-Agent Research System",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.3",
    difficulty: "intermediate",
    question:
      "To \"keep things flexible,\" every subagent in your research system was given all 18 tools: web search, PDF parsing, citation formatting, statistics, report rendering and more. Traces now show the synthesis agent running its own web searches instead of working from the findings it receives, and the report agent sometimes calling statistics tools. Tool selection errors have tripled since the change. What should you do?",
    options: [
      { id: "A", text: "Keep all 18 tools on every subagent, but add a paragraph to each system prompt listing the tools it should use and the ones it should avoid." },
      { id: "B", text: "Give each subagent only the 4–5 tools its role needs, such as search tools for the search agent and formatting tools for the report agent." },
      { id: "C", text: "Merge the four subagents into one agent that holds all 18 tools, so there is no longer any question about which agent owns which tool." },
      { id: "D", text: "Move all 18 tools to the coordinator, and have each subagent ask the coordinator to run a tool on its behalf whenever it needs one." },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct. Giving an agent many tools increases decision complexity and degrades selection, and agents with tools outside their specialization tend to misuse them, as the synthesis agent's web searches show. Scoping each subagent to the tools of its role removes the wrong options instead of asking the model to ignore them.\n\nA keeps the 18-way decision and relies on probabilistic compliance with a list. C makes the problem worse: one agent with every role and every tool, and no specialization. D turns the coordinator into a bottleneck with a round trip per tool call, and the 18 tools are still concentrated in one place.\n\nHow to implement:\n```typescript\nimport { query } from \"@anthropic-ai/claude-agent-sdk\";\n\nconst agents = {\n  \"web-searcher\": { description: \"Finds sources\", prompt: \"...\",\n    tools: [\"mcp__research__web_search\", \"mcp__research__fetch_page\"] },\n  \"synthesizer\": { description: \"Combines findings\", prompt: \"...\",\n    tools: [\"Read\", \"mcp__research__merge_findings\"] },\n  \"reporter\": { description: \"Renders the report\", prompt: \"...\",\n    tools: [\"mcp__research__format_citations\", \"mcp__research__render_report\"] },\n};\n\nfor await (const msg of query({ prompt: topic, options: { agents, allowedTools: [\"Agent\"] } })) { /* ... */ }\n```",
    keyConcept: "Scoped tool access per subagent role",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 2.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Subagents in the Agent SDK", url: "https://code.claude.com/docs/en/agent-sdk/subagents" },
    ],
  },
  {
    id: "D2-006",
    scenario: "Structured Data Extraction",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.3",
    difficulty: "advanced",
    question:
      "Your extraction pipeline processes contracts with three tools: `extract_metadata` (parties, dates, contract type), `lookup_company_registry` and `classify_clauses`. Both enrichment tools depend on the metadata, but in 20% of runs Claude calls `lookup_company_registry` first with guessed company names. How do you guarantee that metadata extraction always happens first?",
    options: [
      { id: "A", text: "Set `tool_choice: {\"type\": \"any\"}` on every request so Claude must call a tool, and list `extract_metadata` first in the tools array." },
      { id: "B", text: "Keep `tool_choice: {\"type\": \"auto\"}` and add a system prompt sentence saying `extract_metadata` must always be the first tool call." },
      { id: "C", text: "Force `{\"type\": \"tool\", \"name\": \"extract_metadata\"}` on every request in the conversation, so enrichment can't run on guessed names." },
      { id: "D", text: "Force `{\"type\": \"tool\", \"name\": \"extract_metadata\"}` on the first request only, then use `\"auto\"` in follow-up turns for enrichment." },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct. Forced tool selection guarantees that a specific tool is called, so forcing `extract_metadata` on the first request makes the ordering deterministic. Switching back to `auto` in the follow-up turns lets Claude call the enrichment tools with real metadata.\n\nA only guarantees that some tool is called, not which one, and array order is not a priority signal. B is the probabilistic approach that is already failing in 20% of runs. C overshoots: forcing the same tool on every turn means the enrichment tools can never run. Product note: current docs say Claude Opus 5.5 and Sonnet 5.5 reject `any` and forced `tool` with a 400 error; on those models, call the first step from your code or use `auto` with strict tool use.\n\nHow to implement:\n```python\nfirst = client.messages.create(\n    model=\"claude-haiku-5-5\", max_tokens=2048, tools=tools,\n    tool_choice={\"type\": \"tool\", \"name\": \"extract_metadata\"},\n    messages=[{\"role\": \"user\", \"content\": contract_text}],\n)\n# append first.content and the tool_result, then continue with:\nnext_turn = client.messages.create(\n    model=\"claude-haiku-5-5\", max_tokens=2048, tools=tools,\n    tool_choice={\"type\": \"auto\"}, messages=messages,\n)\n```",
    keyConcept: "Forced tool_choice for the first step, auto for follow-up turns",
    sources: [
      { title: "Define tools (Claude API docs)", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools" },
      { title: "CCAR-F Exam Guide v1.0 — Task 2.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D2-007",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "basic",
    question:
      "Your team's productivity agent needs an MCP server for the internal ticket system that every engineer gets automatically when they clone the repository. Separately, one engineer wants to try an experimental vector-search MCP server across all of her own projects without affecting anyone else. Where should each server be configured?",
    options: [
      { id: "A", text: "Both in the project's `.mcp.json`, with the experimental entry marked `\"disabled\": true` so the other engineers skip it." },
      { id: "B", text: "Both in each engineer's `~/.claude.json`, set up by an onboarding script that copies the shared ticket server for everyone." },
      { id: "C", text: "The ticket server in the project's `.mcp.json`, committed to the repo; the experiment in her user scope in `~/.claude.json`." },
      { id: "D", text: "The ticket server in her own `~/.claude.json` user scope, and the experimental one in a `.mcp.json` listed in `.gitignore`." },
    ],
    correctAnswer: "C",
    explanation:
      "C is correct. Project scope (`.mcp.json` at the repository root, checked into version control) is how a team shares MCP servers: everyone who clones the repo gets them. User scope, stored in `~/.claude.json`, keeps a server private to one person and available in all of her projects, which fits an experiment.\n\nA puts a personal experiment in a shared file and relies on a `disabled` field that `.mcp.json` doesn't define. B makes shared tooling depend on a copy script instead of version control, so it drifts. D inverts the two scopes: the shared server would reach only one person, and a gitignored `.mcp.json` would hide the experiment in just one project. Claude Code also has a local scope (the default), stored in `~/.claude.json` under one project's path; it fits a private server for a single project, not one she wants everywhere.\n\nHow to implement:\n```bash\n# Shared: writes .mcp.json in the repo root (commit it)\nclaude mcp add --scope project --transport http tickets https://tickets.internal.example.com/mcp\n\n# Personal, all of her projects: writes ~/.claude.json\nclaude mcp add --scope user vector-search -- npx -y @example/vector-search-mcp\n```",
    keyConcept: "MCP scopes: project (.mcp.json) for shared tooling, user (~/.claude.json) for personal servers",
    sources: [
      { title: "Connect Claude Code to tools via MCP", url: "https://code.claude.com/docs/en/mcp" },
      { title: "CCAR-F Exam Guide v1.0 — Task 2.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D2-008",
    scenario: "Code Generation with Claude Code",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "intermediate",
    question:
      "Your team wants to commit a `.mcp.json` that connects Claude Code to a GitHub MCP server. The server needs a personal access token in an `Authorization` header, and every developer has a different token. A teammate's draft has his own token pasted into the file. How should the shared configuration handle the credential?",
    options: [
      { id: "A", text: "Keep the token in the file but add `.mcp.json` to `.gitignore`, so each developer maintains a private copy with their own token." },
      { id: "B", text: "Move the token into the project's CLAUDE.md under a \"Credentials\" heading, so Claude can read it and pass it on when it connects." },
      { id: "C", text: "Commit the file with the teammate's token, and ask each developer to replace it locally with their own before starting Claude Code." },
      { id: "D", text: "Commit the header as `\"Bearer ${GITHUB_TOKEN}\"`, and have each developer set `GITHUB_TOKEN` in their own shell environment." },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct. Claude Code expands environment variables in `.mcp.json` (in `command`, `args`, `env`, `url` and `headers`), so the team can commit one shared file while each developer's secret stays in their own environment.\n\nA stops sharing the configuration, which defeats the purpose of project scope. B puts a secret in a file that is committed and loaded into the model's context, and CLAUDE.md doesn't configure MCP connections anyway. C commits a real secret to version control, where it stays in the history even after someone replaces it locally. Product note: `${VAR:-default}` supplies a fallback, and some credential variables, such as `ANTHROPIC_API_KEY`, read as empty in a remote server's `url` and `headers`, so they can't leak to that server.\n\nHow to implement:\n```json\n{\n  \"mcpServers\": {\n    \"github\": {\n      \"type\": \"http\",\n      \"url\": \"https://api.githubcopilot.com/mcp/\",\n      \"headers\": { \"Authorization\": \"Bearer ${GITHUB_TOKEN}\" }\n    }\n  }\n}\n```",
    keyConcept: "Environment variable expansion in .mcp.json keeps secrets out of version control",
    sources: [
      { title: "Connect Claude Code to tools via MCP", url: "https://code.claude.com/docs/en/mcp" },
      { title: "CCAR-F Exam Guide v1.0 — Task 2.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D2-009",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.5",
    difficulty: "intermediate",
    question:
      "An engineer asks your agent, built with the Agent SDK and given Read, Write, Edit, Bash, Grep and Glob, to explain how a payment request flows through an unfamiliar legacy repository of 4,000 files. The first prototype read files one by one from the top of the tree and ran out of context before it reached any payment code. Which exploration strategy should the agent follow?",
    options: [
      { id: "A", text: "Use Glob to list every source file, then Read all of them in one batch, so the model has the whole codebase in context before it answers." },
      { id: "B", text: "Use Bash to concatenate the repository into one text file, then Read that file in chunks from beginning to end until the flow is clear." },
      { id: "C", text: "Grep for entry points such as the payment route or handler name, then Read those files and follow their imports step by step." },
      { id: "D", text: "Read only the README and the directory layout, then answer from naming conventions without opening source files, to save context." },
    ],
    correctAnswer: "C",
    explanation:
      "C is correct. Building understanding incrementally, with Grep to find the entry points and Read to follow the imports from there, spends context only on the files that matter to the payment flow.\n\nA and B are the same upfront-reading mistake as the prototype: they load thousands of files, or one giant file, and run out of context. D saves context by not looking at the code, so the explanation is guesswork. Product note: in interactive Claude Code on macOS, Linux and WSL, Glob and Grep are left out of the default tool set and searches run as `grep` or `find` through Bash; naming them in `allowedTools`, as this agent does, brings them back, and the strategy is the same either way.\n\nHow to implement:\n```text\n1. Grep  pattern=\"router\\.(post|put)\\(['\\\"]/payments\"   output_mode=files_with_matches\n2. Read  src/routes/payments.ts          -> imports PaymentService\n3. Read  src/services/payment-service.ts -> imports gateway/stripe-adapter\n4. Read  src/gateway/stripe-adapter.ts   -> end of the flow\n```",
    keyConcept: "Incremental exploration: Grep for entry points, then Read along the imports",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 2.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Claude Code tools reference", url: "https://code.claude.com/docs/en/tools-reference" },
    ],
  },
  {
    id: "D2-010",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.5",
    difficulty: "basic",
    question:
      "Before a test-framework migration, your agent must list every React component test in a monorepo. The tests sit next to their components in dozens of packages and all follow the naming pattern `*.test.tsx`. Some of them don't import the testing library directly because they use a shared helper instead. Which built-in tool fits this step?",
    options: [
      { id: "A", text: "Grep for `@testing-library/react` across the repository, since every component test has to import that package somewhere." },
      { id: "B", text: "Read the root `package.json` and every workspace config to find out where each package keeps its component test files." },
      { id: "C", text: "Bash with a custom script that walks the directory tree and opens each file to check whether it contains a `describe(` block." },
      { id: "D", text: "Glob with the pattern `**/*.test.tsx`, because the target set is defined by the file name, not by anything inside the files." },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct. Glob finds files by name or extension pattern, and the requirement here is a naming pattern, so `**/*.test.tsx` returns exactly the target set at any depth.\n\nA searches file contents, and the stem already tells you that some tests import the library only through a shared helper, so Grep would miss them. B looks in configuration that doesn't list individual test files. C rebuilds Glob by hand, opens every file without need, and a `describe(` check is not what defines a component test. Product note: Glob results are capped at 100 files, so in a large monorepo you may need to narrow the pattern per package; and in interactive Claude Code on macOS and Linux, the same search runs as `find` through Bash unless Glob is enabled.\n\nHow to implement:\n```json\n{ \"tool\": \"Glob\", \"input\": { \"pattern\": \"packages/**/*.test.tsx\" } }\n```",
    keyConcept: "Glob for file name patterns; Grep for file contents",
    sources: [
      { title: "Claude Code tools reference", url: "https://code.claude.com/docs/en/tools-reference" },
      { title: "CCAR-F Exam Guide v1.0 — Task 2.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D2-011",
    scenario: "Multi-Agent Research System",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.2",
    difficulty: "advanced",
    question:
      "Your web-search subagent fetches 8 sources for a subtopic. Two fetches fail with a 503 \"service temporarily unavailable\"; the other six succeed. Today the subagent immediately returns an error to the coordinator, which re-dispatches the whole subtopic and repeats the six fetches that had already worked. How should the subagent handle this?",
    options: [
      { id: "A", text: "Retry the two failed fetches locally with backoff; if they still fail, return the six results plus which sources failed and what was tried." },
      { id: "B", text: "Return only the six successful results and report full success without mentioning the failures, so the coordinator has no extra work to do." },
      { id: "C", text: "Keep retrying the two failed fetches for as long as it takes, so the coordinator always receives a complete set of eight results at the end." },
      { id: "D", text: "Keep escalating the 503 errors to the coordinator right away, but ask it to assign fewer sources per subtopic so failures are less likely." },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct. A 503 is transient, so the subagent should recover locally first and propagate to the coordinator only what it couldn't resolve, together with its partial results and what it attempted. The coordinator can then decide whether six sources are enough or whether it should try an alternative, without repeating work that already succeeded.\n\nB hides the failure, so the coordinator believes coverage is complete when two sources are missing. C has no bound: a long outage blocks the whole research run. D keeps the wasteful escalation and changes the workload instead of the error handling.\n\nHow to implement:\n```typescript\nconst results = await Promise.all(urls.map(u => fetchWithRetry(u, { retries: 3, backoffMs: 500 })));\nconst ok = results.filter(r => r.ok);\nconst failed = results.filter(r => !r.ok).map(r => ({ url: r.url, error: \"503\", attempts: 4 }));\nreturn { findings: ok.map(r => r.data), partial: failed.length > 0, failed };\n```",
    keyConcept: "Local recovery of transient errors in subagents; propagate only unresolved errors with partial results",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 2.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "How we built our multi-agent research system", url: "https://www.anthropic.com/research/multi-agent-research-system" },
    ],
  },
  {
    id: "D2-012",
    scenario: "Multi-Agent Research System",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.1",
    difficulty: "intermediate",
    question:
      "The document-analysis agent has two tools with near-identical descriptions: `analyze_content` (\"Analyzes content and extracts key information\"), which only handles snippets returned by web search, and `analyze_document` (\"Analyzes a document and extracts key information\"), which handles PDFs from the archive. Traces show that archive PDFs are routed to `analyze_content` in about a third of calls, and those calls return garbled results. What is the most effective fix?",
    options: [
      { id: "A", text: "Delete `analyze_content`, since it overlaps with `analyze_document`, and let the document tool handle web search snippets as well." },
      { id: "B", text: "Add a system prompt line: \"prefer analyze_document for anything that looks like a document\", so the agent can break the tie." },
      { id: "C", text: "Rename `analyze_content` to `extract_web_results` and state in its description that it accepts search snippets only, never files." },
      { id: "D", text: "Add a `source_type` parameter to both tools and return a validation error whenever it doesn't match the tool that was called." },
    ],
    correctAnswer: "C",
    explanation:
      "C is correct. The two tools overlap in both name and description, so the model has no signal to tell them apart. Renaming the web tool and rewriting its description around its real input (search-result snippets, not files) removes the functional overlap that causes the misrouting.\n\nA removes a capability: `analyze_document` was not built for web snippets, so their results would degrade. B adds a vague, keyword-sensitive instruction; web pages also \"look like documents\", so it creates a new kind of misrouting. D catches the mistake after a wasted call and leaves the ambiguity in place.\n\nHow to implement:\n```typescript\n{\n  name: \"extract_web_results\",\n  description: \"Extracts facts from web search result snippets (title, url, snippet text) \" +\n    \"returned by web_search. Input: the raw results array. Does NOT accept PDFs, \" +\n    \"archive files or document IDs; use analyze_document for those.\",\n  input_schema: { type: \"object\", properties: { results: { type: \"array\" } }, required: [\"results\"] },\n}\n```",
    keyConcept: "Renaming tools and rewriting descriptions to eliminate functional overlap",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 2.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Define tools (Claude API docs)", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools" },
    ],
  },
];

// ============================================================
// DOMAIN 3 – Claude Code Configuration & Workflows (20%)
// ============================================================

const domain3Questions: Question[] = [
  {
    id: "D3-001",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.1",
    difficulty: "basic",
    question:
      "Priya prefers early-return guard clauses and detailed commit messages. She works in six repositories, each with its own committed CLAUDE.md, and her teammates do not share these preferences. She wants Claude Code to apply them in every repository without changing anything her teammates load. Where should she write them?",
    options: [
      { id: "A", text: "In each repository's root `CLAUDE.md`, under a heading marked as personal preferences" },
      { id: "B", text: "In each repository's `.claude/CLAUDE.md`, committed so the preference persists" },
      { id: "C", text: "In `~/.claude/CLAUDE.md`, the user-level file that loads for her in every project" },
      { id: "D", text: "In a `.claude/rules/priya.md` file in each repository, with no `paths` frontmatter" },
    ],
    correctAnswer: "C",
    explanation:
      "C is correct: `~/.claude/CLAUDE.md` is the user-level file. It loads in every project on her machine and is not shared through version control, so teammates never see it. A and B are project-level files; once committed, every teammate loads them. D puts the preference in the project's `.claude/rules/` directory, which is also committed, and a rule with no `paths` field loads in every session for everyone. Product note: `CLAUDE.local.md` is another personal option, but it is per project, so she would need six copies.\n\nHow to implement:\n```markdown\n<!-- ~/.claude/CLAUDE.md (personal, not in any repo) -->\n## My preferences\n- Prefer early-return guard clauses over nested if/else\n- Write commit messages with a summary line and a body explaining why\n```",
    keyConcept: "User-level CLAUDE.md (~/.claude/CLAUDE.md) holds personal defaults that are not shared with the team",
    sources: [
      { title: "Claude Code docs — How Claude remembers your project (CLAUDE.md, imports, rules)", url: "https://code.claude.com/docs/en/memory" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D3-002",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.3",
    difficulty: "intermediate",
    question:
      "A monorepo keeps 90 lines of Terraform conventions in `.claude/rules/terraform.md`, with no frontmatter. All Terraform files live under `infra/`. Front-end developers, who never touch `infra/`, see those rules loaded in every session, and Claude sometimes applies Terraform-style naming to their React code. What is the most targeted fix?",
    options: [
      { id: "A", text: "Move the Terraform rules into the root CLAUDE.md under an 'Infrastructure only' heading" },
      { id: "B", text: "Turn the rules into a `.claude/skills/terraform/` skill that developers run on demand" },
      { id: "C", text: "Add YAML frontmatter with `paths: [\"infra/**/*\"]` so the file loads only for those files" },
      { id: "D", text: "Import the file with `@.claude/rules/terraform.md` from `infra/CLAUDE.md` and nowhere else" },
    ],
    correctAnswer: "C",
    explanation:
      "C is correct: a `paths` field in the rule's YAML frontmatter makes it conditional. Claude Code loads it only when Claude reads or edits a matching file, so front-end sessions stop paying for it and stop being influenced by it. A keeps the rules in a file that loads in every session, and relies on Claude to infer when a heading applies. B loses automatic application: infrastructure work would depend on someone remembering to invoke the skill. D does not help: the file stays in `.claude/rules/` with no `paths`, so it keeps loading for everyone; the import only adds a second copy when working in `infra/`.\n\nHow to implement:\n```markdown\n---\npaths:\n  - \"infra/**/*\"\n---\n\n# Terraform conventions\n- Module names use snake_case\n- Every resource has `owner` and `cost_center` tags\n```",
    keyConcept: "Path-scoped rules (paths frontmatter) load only for matching files, cutting irrelevant context",
    sources: [
      { title: "Claude Code docs — How Claude remembers your project (CLAUDE.md, imports, rules)", url: "https://code.claude.com/docs/en/memory" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D3-003",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.1",
    difficulty: "intermediate",
    question:
      "A monorepo has `packages/billing` and `packages/search`, each with its own CLAUDE.md. Shared standards live in `docs/standards/`: `security.md`, `pii-handling.md` and `query-performance.md`. The billing maintainers know their package needs the security and PII files; the search maintainers need only the query-performance file. How should the maintainers bring in the right standards?",
    options: [
      { id: "A", text: "In billing's CLAUDE.md, add `@../../docs/standards/security.md` and `@../../docs/standards/pii-handling.md`" },
      { id: "B", text: "Add one `@import docs/standards/*` line to the root CLAUDE.md so every package receives all three files" },
      { id: "C", text: "Paste all three standards into the root CLAUDE.md and tell Claude to skip whatever is not relevant" },
      { id: "D", text: "Write 'see docs/standards/security.md and pii-handling.md' in billing's CLAUDE.md so Claude reads them" },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct: CLAUDE.md imports use `@path/to/file`, and relative paths resolve from the file that contains the import. Each package's CLAUDE.md can import only the standards its maintainers know it needs, which keeps context focused. B uses a syntax that does not exist (`@import` with a glob) and would give every package every file anyway. C builds the monolith that imports are meant to avoid and leaves relevance to inference. D is plain prose: Claude sees that file only if it decides to open it, while an `@` import is expanded and loaded together with the CLAUDE.md.\n\nHow to implement:\n```markdown\n<!-- packages/billing/CLAUDE.md -->\n# Billing package\n@../../docs/standards/security.md\n@../../docs/standards/pii-handling.md\n\n<!-- packages/search/CLAUDE.md -->\n# Search package\n@../../docs/standards/query-performance.md\n```",
    keyConcept: "@path imports let each package's CLAUDE.md include only the standards it needs",
    sources: [
      { title: "Claude Code docs — How Claude remembers your project (CLAUDE.md, imports, rules)", url: "https://code.claude.com/docs/en/memory" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D3-004",
    scenario: "Claude Code for Continuous Integration",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.6",
    difficulty: "advanced",
    question:
      "Your CI job runs `claude -p` on every push to an open pull request and posts each finding as an inline comment. After a developer pushes two fix commits, the PR shows three copies of several comments, including comments about lines that were already fixed. Reviewers are starting to ignore the bot. What change addresses this most directly?",
    options: [
      { id: "A", text: "Run the review only once per pull request, on the first push, and skip it on later commits" },
      { id: "B", text: "Pass the previous run's findings into the prompt and ask only for new or still-open issues" },
      { id: "C", text: "Raise the severity threshold so only critical findings get posted on the later pushes" },
      { id: "D", text: "Add a CLAUDE.md rule telling Claude not to repeat comments it posted on earlier runs" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct: each `-p` run starts a fresh session that knows nothing about earlier comments. Giving it the prior findings and asking it to report only issues that are new or still unaddressed removes duplicates and stale comments while still reviewing the new commits. A stops reviewing the fixes, which can introduce new bugs. C hides real but non-critical issues and does not stop critical duplicates. D asks Claude to avoid something it cannot see: without the earlier findings in context, it has no way of knowing what it already said.\n\nHow to implement:\n```bash\ngh api repos/$REPO/pulls/$PR/comments --jq '[.[] | select(.user.login==\"review-bot\") | {path, line, body}]' > prior.json\n\ngit diff origin/main...HEAD | claude -p \"Review this diff. prior.json lists findings already posted. Report only issues that are new or still present in the current code; do not repeat fixed ones.\" \\\n  --output-format json --json-schema \"$(cat findings.schema.json)\" > review.json\n```",
    keyConcept: "Re-reviews include prior findings and report only new or unaddressed issues",
    sources: [
      { title: "Claude Code docs — Run Claude Code programmatically (-p)", url: "https://code.claude.com/docs/en/headless" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.6", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D3-005",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.4",
    difficulty: "advanced",
    question:
      "You must move a service off a deprecated ORM. A first look shows about 50 files use it, some through a custom repository wrapper and some through raw query builders, and there are two viable strategies: add an adapter shim first, or rewrite file by file. Your lead wants the approach reviewed before edits start, and the edits finished today. Which workflow fits?",
    options: [
      { id: "A", text: "Use direct execution from the start and let Claude migrate files in the order it finds them" },
      { id: "B", text: "Use plan mode to explore usages and choose a strategy, then execute the approved plan directly" },
      { id: "C", text: "Use plan mode for the whole job so all of the ~50 file edits stay read-only until they are done" },
      { id: "D", text: "Write a detailed prompt for the adapter shim and run it in direct execution without exploring" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct: the investigation has architectural weight (many files, two valid strategies), so plan mode lets Claude explore the codebase and present a plan without touching files. Once the plan is approved, the implementation is well defined and can run with direct execution. A commits to edits before anyone has compared the strategies, which risks costly rework. C misunderstands plan mode: it is read-only, so it cannot finish the migration; you leave it after approving the plan. D picks a strategy before exploring the two usage patterns, so the prompt may be wrong for half the files.\n\nHow to implement:\n```bash\nclaude --permission-mode plan\n# > Investigate every use of LegacyORM, compare an adapter shim vs a file-by-file rewrite, and propose a plan\n# Review and approve the plan, then leave plan mode (Shift+Tab) and let Claude execute it\n```",
    keyConcept: "Combine plan mode for investigation with direct execution for the approved implementation",
    sources: [
      { title: "Claude Code docs — Permission modes (plan mode)", url: "https://code.claude.com/docs/en/permission-modes" },
      { title: "Claude Code docs — Common workflows (plan mode, subagents)", url: "https://code.claude.com/docs/en/common-workflows" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D3-006",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.2",
    difficulty: "intermediate",
    question:
      "Your team's committed `.claude/skills/review/SKILL.md` runs the standard code review checklist. You want a stricter version for your own work that also checks for missing telemetry, while teammates keep getting the standard `/review` unchanged. What should you do?",
    options: [
      { id: "A", text: "Edit `.claude/skills/review/SKILL.md` to add the telemetry checks and push the change" },
      { id: "B", text: "Create `~/.claude/skills/review-strict/SKILL.md`, a personal copy with a different name" },
      { id: "C", text: "Add `.claude/commands/review-strict.md` to the repository and commit it for your own use" },
      { id: "D", text: "Add the telemetry checks to the project CLAUDE.md so they apply whenever reviews run" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct: skills in `~/.claude/skills/` are personal and load only on your machine, and a different name keeps the team's `/review` available to you as well. A changes the shared skill for the whole team. C is project scope: anything committed to `.claude/commands/` appears for every teammate. D adds always-loaded instructions that every teammate gets in every session. Product note: if a personal skill used the same name, the current docs give the personal one precedence over the project one for you, so you would lose access to the standard version.\n\nHow to implement:\n```markdown\n---\nname: review-strict\ndescription: Team review checklist plus telemetry checks (personal variant)\n---\nRun the checklist in .claude/skills/review/SKILL.md, then also flag any new\nendpoint or job that emits no metrics or structured logs.\n```",
    keyConcept: "Personal skill variants go in ~/.claude/skills/ under a different name so teammates are unaffected",
    sources: [
      { title: "Claude Code docs — Skills", url: "https://code.claude.com/docs/en/skills" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D3-007",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.2",
    difficulty: "intermediate",
    question:
      "Your root CLAUDE.md has grown to 300 lines. 140 of them are a step-by-step procedure for preparing release notes, a task the team does once a week. Developers say everyday coding sessions follow the core standards less reliably than before. What is the best restructuring?",
    options: [
      { id: "A", text: "Move the procedure to `~/.claude/CLAUDE.md` on the release manager's machine only" },
      { id: "B", text: "Keep the procedure in CLAUDE.md but move it to the end under a 'Release only' heading" },
      { id: "C", text: "Move the procedure into a project skill in `.claude/skills/` and invoke it when needed" },
      { id: "D", text: "Move it to `docs/release.md` and add an `@docs/release.md` line to the root CLAUDE.md" },
    ],
    correctAnswer: "C",
    explanation:
      "C is correct: CLAUDE.md is for universal standards that every session needs; a weekly multi-step workflow belongs in a skill, which loads only when invoked. A hides the procedure from everyone else on the team and still loads it in every one of the release manager's sessions. B leaves 140 lines in context on every task, which is the cause of the problem. D only moves the text: an imported file loads together with the CLAUDE.md that imports it, so the context cost stays the same.\n\nHow to implement:\n```markdown\n<!-- .claude/skills/release-notes/SKILL.md -->\n---\nname: release-notes\ndescription: Prepare the weekly release notes from merged PRs\ndisable-model-invocation: true\n---\n1. List PRs merged since the last tag\n2. Group them by area and write user-facing notes\n3. Save to docs/releases/<version>.md\n```",
    keyConcept: "Skills hold on-demand, task-specific workflows; CLAUDE.md holds always-loaded universal standards",
    sources: [
      { title: "Claude Code docs — Skills", url: "https://code.claude.com/docs/en/skills" },
      { title: "Claude Code docs — How Claude remembers your project (CLAUDE.md, imports, rules)", url: "https://code.claude.com/docs/en/memory" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D3-008",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.4",
    difficulty: "basic",
    question:
      "A production error report includes a stack trace pointing to `parseInvoiceDate()` in `billing/dates.ts`: it throws on ISO strings that carry a timezone offset. The function is 30 lines long, has unit tests, and nothing else needs to change. How should you have Claude Code handle it?",
    options: [
      { id: "A", text: "Enter plan mode so Claude explores the billing module and proposes options before any edit" },
      { id: "B", text: "Use direct execution: give Claude the trace and the file, fix it, and run the existing tests" },
      { id: "C", text: "Have the Explore subagent map every caller of the function before any change is attempted" },
      { id: "D", text: "Ask Claude to interview you about the date-handling requirements across the whole application" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct: this is a well-understood, single-file fix with a clear stack trace and existing tests, which is what direct execution is for. A, C and D all add investigation the task does not need. Plan mode (A) pays off for architectural changes or several valid approaches, not for a localized bug. Mapping every caller (C) is unnecessary because the function's contract does not change. The interview pattern (D) is for unfamiliar design spaces, not for a defect with a known cause.\n\nHow to implement:\n```text\nThis stack trace shows parseInvoiceDate() in billing/dates.ts throwing on\n\"2026-03-01T10:00:00+02:00\". Fix it to accept timezone offsets, add a test\nfor that input, and run the billing tests.\n```",
    keyConcept: "Direct execution for simple, well-scoped changes with a clear cause",
    sources: [
      { title: "Claude Code docs — Common workflows (plan mode, subagents)", url: "https://code.claude.com/docs/en/common-workflows" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D3-009",
    scenario: "Claude Code for Continuous Integration",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.6",
    difficulty: "advanced",
    question:
      "Your pipeline has Claude Code generate tests for a new module and, in a later step of the same job, review those tests. The review step runs with `--continue`, so it picks up the generation session, and it approves nearly everything, including tests that assert the wrong behavior. How should you restructure the review step?",
    options: [
      { id: "A", text: "Keep `--continue` and add 'be critical of your own earlier work' to the review prompt" },
      { id: "B", text: "Run the review as a new `claude -p` call that receives only the diff and the test files" },
      { id: "C", text: "Keep `--continue` and switch the review step to a larger model with more reasoning effort" },
      { id: "D", text: "Ask the generation step to append a self-review section before it finishes its work" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct: a session that produced the code carries its own reasoning and tends to confirm it. A new `claude -p` invocation without `--continue` or `--resume` starts an independent session that judges the tests only from the diff and the files. A, C and D all keep the reviewer inside the context that wrote the tests: a prompt line (A) or a bigger model (C) does not remove that bias, and a self-review (D) is the same session grading itself. Product note: the docs make the same point for interactive work, where `/code-review` reviews a diff in a fresh subagent that never saw the conversation.\n\nHow to implement:\n```bash\n# Step 1: generate\nclaude -p \"Write unit tests for src/pricing/\" --allowedTools \"Read,Write,Bash(npm test *)\"\n\n# Step 2: independent review, new session (no --continue / --resume)\ngit diff origin/main -- tests/ | claude -p \"Review these tests against src/pricing/. Flag tests that assert incorrect behavior.\" --output-format json\n```",
    keyConcept: "Session context isolation: an independent instance reviews better than the session that wrote the code",
    sources: [
      { title: "Claude Code docs — Run Claude Code programmatically (-p)", url: "https://code.claude.com/docs/en/headless" },
      { title: "Claude Code docs — Best practices", url: "https://code.claude.com/docs/en/best-practices" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.6", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D3-010",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.5",
    difficulty: "intermediate",
    question:
      "You need a `normalizePhone()` function that handles international prefixes, extensions and blank input, and it must process 100,000 numbers in under a second. Two earlier attempts built from a prose description each passed your manual spot check, then broke a different edge case in production. What approach gives the most reliable progress?",
    options: [
      { id: "A", text: "Write tests for formats, edge cases and the time limit first, then iterate on their failures" },
      { id: "B", text: "Rewrite the prose specification in more detail and ask Claude to generate it in one shot" },
      { id: "C", text: "Ask Claude for three alternative implementations and choose the one that reads cleanest" },
      { id: "D", text: "Have Claude implement it now and add tests afterward for whichever bugs turn up next" },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct: a test suite written first, covering expected formats, edge cases and the performance requirement, gives Claude a pass/fail check it can run, and sharing the failing tests guides each iteration. B still depends on a prose description, which has already been interpreted inconsistently. C picks by readability, which says nothing about correctness. D repeats the pattern that failed: bugs are found in production instead of before.\n\nHow to implement:\n```text\nHere is tests/normalizePhone.test.ts: 24 cases (prefixes, extensions, blank and\nnull input) plus a test that 100k numbers finish in under 1 s. Implement\nnormalizePhone() so they pass. Run the tests after each change and fix\nthe failures until all pass.\n```",
    keyConcept: "Test-driven iteration: write the tests first, then iterate by sharing the failures",
    sources: [
      { title: "Claude Code docs — Best practices", url: "https://code.claude.com/docs/en/best-practices" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D3-011",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.3",
    difficulty: "intermediate",
    question:
      "Database migrations live in 14 service folders (`services/orders/db/migrations/`, `services/users/db/migrations/` and so on), and new services are added every month. Every migration must be reversible and must avoid locking large tables, yet Claude keeps writing irreversible ones. Which configuration applies this convention in the most maintainable way?",
    options: [
      { id: "A", text: "Add a CLAUDE.md to every `db/migrations/` folder and copy it into each new service" },
      { id: "B", text: "Put the convention in the root CLAUDE.md under a 'Migrations' heading for all sessions" },
      { id: "C", text: "Create `.claude/rules/migrations.md` with `paths: [\"services/*/db/migrations/**\"]`" },
      { id: "D", text: "Add `@services/*/db/migrations/RULES.md` to the root CLAUDE.md to import each folder" },
    ],
    correctAnswer: "C",
    explanation:
      "C is correct: one Markdown rule file with a glob in its `paths` frontmatter covers every current and future service folder and loads only when Claude works on a matching migration. A works but needs 14 copies, plus a new one per service, which will drift. B loads the convention in every session, including the many that never touch migrations, and relies on Claude to infer when it applies. D is not valid: `@` imports take a file path, not a glob, and an import would load the content in every session anyway.\n\nHow to implement:\n```markdown\n<!-- .claude/rules/migrations.md -->\n---\npaths:\n  - \"services/*/db/migrations/**\"\n---\n# Migration rules\n- Every migration has a working down() step\n- Add indexes with CONCURRENTLY; never lock tables over 1M rows\n```",
    keyConcept: "Glob-scoped rules beat directory CLAUDE.md files for conventions spread across many directories",
    sources: [
      { title: "Claude Code docs — How Claude remembers your project (CLAUDE.md, imports, rules)", url: "https://code.claude.com/docs/en/memory" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D3-012",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.5",
    difficulty: "intermediate",
    question:
      "You ask Claude Code to write a converter from a legacy CSV export to your API's JSON shape. Your prose explanation ('merge the name fields, normalize the dates, nest the address') has produced three different interpretations across attempts: one drops middle names and another keeps dates as text. What should you do next?",
    options: [
      { id: "A", text: "Expand the prose with stricter wording and add capital-letter emphasis to every rule" },
      { id: "B", text: "Ask Claude to infer the target format by reading the API handler code before converting" },
      { id: "C", text: "Split the request into three prompts: the names first, then the dates, then the address" },
      { id: "D", text: "Give 2-3 sample CSV rows with the exact JSON you expect, including the edge cases" },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct: when prose is interpreted inconsistently, two or three concrete input/output pairs are the most effective way to show the transformation, and including a middle name and an odd date format pins down exactly the cases that went wrong. A adds more of the prose that is already ambiguous; emphasis does not remove ambiguity. B may reveal the field names but not the transformation rules, such as how to merge names. C splits the work but leaves each part just as ambiguous.\n\nHow to implement:\n```text\nInput:  \"Ana\",\"María\",\"Pérez\",\"03/01/2026\",\"Calle 50\",\"Panamá\"\nOutput: {\"name\":\"Ana María Pérez\",\"createdAt\":\"2026-01-03\",\n         \"address\":{\"street\":\"Calle 50\",\"city\":\"Panamá\"}}\n\nInput:  \"Luis\",\"\",\"Gómez\",\"12/11/2025\",\"\",\"\"\nOutput: {\"name\":\"Luis Gómez\",\"createdAt\":\"2025-11-12\",\"address\":null}\n```",
    keyConcept: "Concrete input/output examples clarify transformations that prose leaves ambiguous",
    sources: [
      { title: "Claude Code docs — Best practices", url: "https://code.claude.com/docs/en/best-practices" },
      { title: "Claude API docs — Prompting best practices (use examples)", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
];

// ============================================================
// DOMAIN 4 – Prompt Engineering & Structured Output (20%)
// ============================================================

const domain4Questions: Question[] = [
  {
    id: "D4-001",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.1",
    difficulty: "intermediate",
    question:
      "A contract-risk extractor flags clauses for the legal team. Its prompt says: \"Flag risky clauses. Be conservative and only flag clauses you are highly confident about.\" After two weeks, lawyers dismiss 70% of the flags: standard confidentiality boilerplate and routine payment terms are flagged next to genuinely unusual liability caps, and lawyers now skim past every flag. What change most directly improves precision?",
    options: [
      { id: "A", text: "Replace the confidence wording with categories: flag liability caps under $50k, auto-renewal without opt-out and IP assignment; skip boilerplate." },
      { id: "B", text: "Tighten the instruction to \"flag only clauses you are at least 90% confident are risky\" and require a numeric confidence score on every flag it returns." },
      { id: "C", text: "Add few-shot examples showing the desired layout for each flag (clause number, quoted text, reason) so that lawyers can triage the flags faster." },
      { id: "D", text: "Have a second Claude pass re-read each flag and delete the ones it considers low-risk, keeping the current definition of a risky clause." },
    ],
    correctAnswer: "A",
    explanation:
      "The root cause is that \"risky\" is never defined, so the model applies its own threshold. Option A states which categories to report and which to skip, which is what raises precision. Option B is confidence-based filtering: the guide notes that \"be conservative\" or \"only high-confidence\" wording does not improve precision, because the model's confidence is not anchored to the lawyers' definition. Option C fixes the format of the flags, not which clauses qualify. Option D runs a second pass with the same vague definition, so its deletions are as arbitrary as the original flags and the cost doubles. High false-positive rates also erode trust in the accurate flags, which is why fixing the criteria matters.\n\nHow to implement:\n```typescript\nconst systemPrompt = `Flag a clause ONLY if it matches one of these categories:\n1. Liability cap below $50,000\n2. Automatic renewal without an opt-out window\n3. Assignment of client IP to the vendor\nDo NOT flag: confidentiality boilerplate, standard Net-30/60 payment terms, governing-law clauses.\nFor each flag return: clause number, quoted text, category (1-3).`;\n```",
    keyConcept: "Explicit categorical criteria, not confidence wording, raise precision",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Prompting best practices", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices" },
    ],
  },
  {
    id: "D4-002",
    scenario: "Claude Code for Continuous Integration",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.2",
    difficulty: "intermediate",
    question:
      "Your CI reviewer already returns findings through a `report_finding` tool whose schema requires `file`, `line`, `issue`, `severity` and `suggested_fix`. Every response is schema-valid, yet developers complain that quality varies: some `suggested_fix` values just say \"consider refactoring\" while others give a concrete code change, and similar issues get different severities. Detailed written instructions about being specific have not helped. What should you add?",
    options: [
      { id: "A", text: "Tighten the schema: add a `minLength: 80` constraint to `suggested_fix` and an enum for `severity` so that vague fixes are rejected by the API." },
      { id: "B", text: "Repeat the specificity instructions in capital letters at the start and end of the system prompt so that the model is less likely to overlook them." },
      { id: "C", text: "Lower the temperature to 0 so that the same kind of issue always produces the same wording and the same severity across different reviews." },
      { id: "D", text: "Add 2–4 example findings that show a concrete location, issue, severity and code-level fix, including one borderline case with its reasoning." },
    ],
    correctAnswer: "D",
    explanation:
      "The structure is already guaranteed by the tool schema; what varies is the content. When detailed instructions alone produce inconsistent results, few-shot examples are the most effective way to show what an actionable finding looks like, and a borderline example teaches how to calibrate severity. Option A cannot enforce actionability: a long vague sentence still passes a length check (and string-length constraints such as `minLength` are not supported by Claude's strict mode anyway). Option B repeats the same instructions that already failed. Option C reduces randomness but does not show the model what \"specific\" means, so it would just be consistently vague.\n\nHow to implement:\n```typescript\nconst examples = `<example>\nfile: src/cart.ts  line: 42  severity: major\nissue: total is computed before discounts are applied, so the order is charged full price\nsuggested_fix: move applyDiscounts(cart) above computeTotal(cart) on line 40\n</example>\n<example>\nfile: src/log.ts  line: 8  severity: minor\nissue: debug log prints the full request body, including the email address\nsuggested_fix: log only request.id; why minor: internal logs, no secrets\n</example>`;\n```",
    keyConcept: "Few-shot examples fix inconsistent content that schemas cannot enforce",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Prompting best practices", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices" },
    ],
  },
  {
    id: "D4-003",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.3",
    difficulty: "intermediate",
    question:
      "An invoice extractor uses a tool schema in which `purchase_order_number` is a required string. About 30% of supplier invoices have no PO number at all. Auditors discover that for those invoices the model returns plausible-looking PO numbers that do not exist in the ERP. How should you change the design?",
    options: [
      { id: "A", text: "Keep the field required and add \"never invent values\" to the tool description, so that the model knows fabrication is forbidden." },
      { id: "B", text: "Add a validator that rejects unknown PO numbers and retries with the error message until the model returns a real PO number." },
      { id: "C", text: "Keep the field required but tell the model to write the placeholder string \"PO-UNKNOWN\" whenever the number is missing." },
      { id: "D", text: "Make the field nullable (`[\"string\", \"null\"]`) and tell the model to return null when the invoice shows no PO number." },
    ],
    correctAnswer: "D",
    explanation:
      "A required field forces the model to produce a value even when the source has none, which is exactly what drives fabrication. Making the field nullable lets the schema express \"not present\", which the guide names as the way to stop the model from inventing values to satisfy required fields. Option A leaves the schema pressure in place and relies on an instruction that competes with it. Option B cannot work: retries fail when the information is simply absent from the document, so the loop either exhausts its attempts or produces a different invented number. Option C replaces a typed null with a magic string that downstream systems must special-case and that can leak into reports. (Claude's strict mode also accepts leaving the field out of `required`; nullable keeps the key present on every record.)\n\nHow to implement:\n```typescript\nconst schema = {\n  type: \"object\",\n  properties: {\n    invoice_number: { type: \"string\" },\n    purchase_order_number: {\n      type: [\"string\", \"null\"],\n      description: \"PO number exactly as printed. null if the invoice shows none.\",\n    },\n  },\n  required: [\"invoice_number\", \"purchase_order_number\"],\n  additionalProperties: false,\n};\n```",
    keyConcept: "Nullable fields prevent fabrication when the source may lack the data",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Structured outputs", url: "https://platform.claude.com/docs/en/build-with-claude/structured-outputs" },
      { title: "Reduce hallucinations", url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations" },
    ],
  },
  {
    id: "D4-004",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.3",
    difficulty: "advanced",
    question:
      "You extract a `complaint_category` from customer emails into a fixed set used by downstream dashboards: billing, shipping, product_defect, account_access. In production, 8% of emails fit none of these and some are too vague to classify. With a plain four-value enum, the model forces these emails into the nearest category, skewing the dashboards. Which schema change fixes this while keeping the field machine-filterable?",
    options: [
      { id: "A", text: "Add `other` and `unclear` to the enum, plus a nullable `category_detail` string that the model fills in whenever it picks `other`." },
      { id: "B", text: "Change the field to free text so the model can describe any category in its own words, and normalize it later with a mapping table." },
      { id: "C", text: "Keep the four-value enum and add a `confidence` number so that the dashboards can filter out the low-confidence classifications." },
      { id: "D", text: "Make `complaint_category` optional so that the model can omit it whenever the email does not match one of the four known values." },
    ],
    correctAnswer: "A",
    explanation:
      "The enum + \"other\" + detail pattern keeps the known categories filterable while giving genuine outliers an honest place to go, and an \"unclear\" value covers emails that are too ambiguous to classify. Option B throws away the enum, so dashboards must reconcile endless spellings. Option C keeps the forced misclassification; a confidence number does not tell you which category the email actually belongs to. Option D makes missing data indistinguishable from \"didn't fit\" versus \"too vague\", and downstream code cannot count either.\n\nHow to implement:\n```typescript\nconst schema = {\n  type: \"object\",\n  properties: {\n    complaint_category: {\n      type: \"string\",\n      enum: [\"billing\", \"shipping\", \"product_defect\", \"account_access\", \"other\", \"unclear\"],\n    },\n    category_detail: { type: [\"string\", \"null\"], description: \"Short label when category is 'other', else null\" },\n  },\n  required: [\"complaint_category\", \"category_detail\"],\n  additionalProperties: false,\n};\n```",
    keyConcept: "Enum with 'other' + detail and 'unclear' for extensible categories",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Structured outputs", url: "https://platform.claude.com/docs/en/build-with-claude/structured-outputs" },
    ],
  },
  {
    id: "D4-005",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.4",
    difficulty: "advanced",
    question:
      "Your invoice extraction uses tool use with a strict schema, so every response parses. A validator then finds that in 6% of cases the extracted line items do not add up to the extracted `total`; checking the source shows the numbers are present and correct in the documents themselves. What retry strategy should you implement?",
    options: [
      { id: "A", text: "Resend the identical request; sampling variation means a second attempt usually produces line items that add up correctly." },
      { id: "B", text: "Enable strict mode on the other schemas too, since constrained decoding also guarantees the extracted values add up correctly." },
      { id: "C", text: "Skip the retry and overwrite `total` with the sum of the extracted line items, so that every record passes validation downstream." },
      { id: "D", text: "Send a follow-up with the original document, the failed extraction and the specific error (items sum to 1,240 vs. total 1,420)." },
    ],
    correctAnswer: "D",
    explanation:
      "This is a semantic error, not a syntax error: the schema is satisfied but the values are inconsistent. Because the correct numbers are in the source, a retry that includes the document, the failed output and the precise validation error gives the model what it needs to self-correct. Option A gives the model no new information. Option B confuses the two error types: strict schemas eliminate syntax errors but do not prevent values that don't sum. Option C hides the error by trusting whichever line item was misread, so a wrong record is stored as valid. Product note: Claude Opus 5.5 and Sonnet 5.5 reject forced `tool_choice` (`any` or `tool`) with a 400; the exam guide still tests forced selection, so the example uses `claude-haiku-5-5`, which accepts it. On the newer models, use `auto` with `strict: true` tools or structured outputs.\n\nHow to implement:\n```typescript\nconst retry = await client.messages.create({\n  model: \"claude-haiku-5-5\",\n  max_tokens: 2048,\n  tools: [extractInvoiceTool],\n  tool_choice: { type: \"tool\", name: \"extract_invoice\" },\n  messages: [{ role: \"user\", content:\n    `<document>${doc}</document>\\n<previous_extraction>${JSON.stringify(prev)}</previous_extraction>\\n` +\n    `<validation_error>line_items sum to 1240.00 but total is 1420.00. Re-read the line items and correct the extraction.</validation_error>` }],\n});\n```",
    keyConcept: "Retry with document, failed output and specific error fixes semantic errors",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Strict tool use", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use" },
    ],
  },
  {
    id: "D4-006",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.5",
    difficulty: "intermediate",
    question:
      "Scanned insurance claims arrive continuously throughout the day. Your contract guarantees extracted results within 30 hours of each document's arrival, and finance requires you to keep the 50% Message Batches API discount. A batch can take up to 24 hours to finish. How often should you submit batches?",
    options: [
      { id: "A", text: "Once a day at midnight, so each batch is as large as possible and the per-request overhead stays at its lowest." },
      { id: "B", text: "Every 12 hours, which halves the waiting time compared with a nightly batch while still keeping the batches large." },
      { id: "C", text: "Every 4 hours, so the worst case is about 4 hours of waiting plus 24 hours of processing, inside the 30-hour SLA." },
      { id: "D", text: "Stop batching and call the synchronous Messages API for each document as it arrives, which always meets the SLA." },
    ],
    correctAnswer: "C",
    explanation:
      "The worst case for a document is the time it waits for the next submission plus the maximum processing window: interval + 24 h must stay under 30 h, so the interval must be at most 6 h. A 4-hour cadence (28 h worst case) leaves a margin for resubmitting failures. Option A can reach 48 h and option B 36 h, both breaking the SLA. Option D meets the SLA but gives up the 50% discount, which the requirement rules out. Most batches finish in under an hour, but there is no latency guarantee, so the plan must assume the full 24 hours.",
    keyConcept: "Batch submission frequency = SLA minus the 24-hour processing window",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Batch processing", url: "https://platform.claude.com/docs/en/build-with-claude/batch-processing" },
    ],
  },
  {
    id: "D4-007",
    scenario: "Claude Code for Continuous Integration",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.5",
    difficulty: "advanced",
    question:
      "Your team wants to move two nightly jobs to the Message Batches API. Job 1 sends each changed file with an `emit_findings` tool and a forced `tool_choice`, then reads the `tool_use` input as the result. Job 2 is an agent that must call `run_tests`, read the results and decide what to fix next. A teammate says batches \"don't support tools at all.\" What is the correct plan?",
    options: [
      { id: "A", text: "Batch neither job: the Batches API rejects any request that includes tool definitions, so both must stay synchronous." },
      { id: "B", text: "Batch both jobs: the Batches API runs the agent loop for you, executing `run_tests` and feeding results back in." },
      { id: "C", text: "Batch Job 1 with its tool definition; keep Job 2 synchronous, since a batch request can't run a tool and continue." },
      { id: "D", text: "Batch Job 2 only, and switch Job 1 to JSON mode in the batch, because forced tool_choice isn't accepted in batches." },
    ],
    correctAnswer: "C",
    explanation:
      "Batch requests accept tool definitions, so a single-turn extraction with a forced tool works: the result already contains the `tool_use` block you need. What a batch cannot do is multi-turn tool calling within one request, because nothing executes `run_tests` and returns the result mid-request; that loop needs the synchronous API. Option A is the teammate's misconception. Option B invents an automatic tool loop that does not exist. Option D is doubly wrong: forced `tool_choice` works in batches, and Claude has no \"JSON mode\" (structured output comes from tool use or, in the current API, `output_config.format`).",
    keyConcept: "Batches support single-turn tool use, not multi-turn tool loops",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Batch processing", url: "https://platform.claude.com/docs/en/build-with-claude/batch-processing" },
    ],
  },
  {
    id: "D4-008",
    scenario: "Code Generation with Claude Code",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.6",
    difficulty: "advanced",
    question:
      "A developer has Claude Code generate a rate-limiter module, then in the same conversation asks: \"Now review the code you just wrote for bugs.\" The review approves it; a week later a race condition in the token-refill logic causes an outage. The team wants reviews that catch issues like this before merge. What should they change?",
    options: [
      { id: "A", text: "Keep reviewing in the same conversation, but add \"be extremely critical of your own code\" and a concurrency checklist." },
      { id: "B", text: "Enable extended thinking with a large budget on the generation step so the model reasons through concurrency first." },
      { id: "C", text: "Ask the same conversation to review the code three times and approve it only if all three self-reviews find nothing." },
      { id: "D", text: "Send only the code and requirements to a separate Claude instance with no access to the generation conversation." },
    ],
    correctAnswer: "D",
    explanation:
      "In the same session the model still holds the reasoning that produced the code, so it tends to re-confirm its own decisions. An independent instance that sees only the code and the requirements reviews it without those assumptions, and the guide states that this catches subtle issues more effectively than self-review instructions or extended thinking. Option A is still self-review with stronger wording. Option B improves generation but adds no independent check. Option C repeats the same biased review three times.\n\nHow to implement:\n```typescript\nconst review = await client.messages.create({\n  model: \"claude-opus-5-5\",\n  max_tokens: 4096,\n  system: \"You are reviewing code you did not write. Look for concurrency and correctness bugs.\",\n  messages: [{ role: \"user\", content: `<requirements>${spec}</requirements>\\n<code>${generatedCode}</code>` }],\n});\n```",
    keyConcept: "Independent review instance beats same-session self-review",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.6", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D4-009",
    scenario: "Claude Code for Continuous Integration",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.6",
    difficulty: "intermediate",
    question:
      "Your CI review already runs one focused pass per changed file, and its local findings are good. A PR changed an API handler to send `amount` in cents while the billing module still treated it as dollars. Each file looked correct on its own and no pass flagged the mismatch. How should you extend the review?",
    options: [
      { id: "A", text: "Merge all changed files into one large prompt per PR so the model sees everything at once instead of file by file." },
      { id: "B", text: "Keep the per-file passes and add a separate integration pass that gets the changed interfaces and traces data flow." },
      { id: "C", text: "Tell each per-file pass to also consider how other files use its code, attaching the whole repository as context." },
      { id: "D", text: "Run each per-file pass three times and keep only the findings that at least two of the three runs agree on." },
    ],
    correctAnswer: "B",
    explanation:
      "Per-file passes are the right tool for local issues, but a units mismatch lives between files. A separate integration pass focused on the changed interfaces and the data that crosses them is the multi-pass pattern the guide describes. Option A brings back attention dilution: one huge prompt gives uneven coverage and can lose the local findings that already work. Option C asks every local pass to do integration work over a whole repository, which dilutes attention and duplicates effort. Option D votes among runs that all lack cross-file visibility, so the bug still goes unseen.",
    keyConcept: "Multi-pass review: per-file local passes plus a cross-file integration pass",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.6", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "D4-010",
    scenario: "Multi-Agent Research System",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.2",
    difficulty: "advanced",
    question:
      "A document-analysis subagent extracts `methodology` and `sample_size` (both required) from research papers. It works on papers with a dedicated Methods section but returns empty strings for papers that describe their methods inline in the introduction or in figure captions. Adding the sentence \"methods may appear anywhere in the paper\" changed little. What is the most effective next step?",
    options: [
      { id: "A", text: "Make both fields optional so the subagent can omit them, and let the synthesis agent note which papers lacked methods." },
      { id: "B", text: "Split each paper into sections, run one extraction per section and keep whichever section returns a non-empty value." },
      { id: "C", text: "Add 2–3 few-shot examples showing correct extraction from papers whose methods sit inline or in captions." },
      { id: "D", text: "Expand the sentence into a detailed list of every place methods text might appear, ordered by how likely each one is." },
    ],
    correctAnswer: "C",
    explanation:
      "The information is present; the model just does not recognize it in unfamiliar layouts. Few-shot examples that demonstrate extraction from varied document structures are the guide's remedy for empty or null extraction of required fields, and they generalize to layouts that were not listed. Option A hides a recall problem as missing data, even though the details are in the papers. Option B loses cross-section context (a sample size in a caption, a method in the introduction), multiplies cost, and \"first non-empty\" may keep the wrong value. Option D is more instructions of the kind that already failed, and a list only matches the cases it names.",
    keyConcept: "Few-shot examples for varied document structures fix empty extractions",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Prompting best practices", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices" },
    ],
  },
  {
    id: "D4-011",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.4",
    difficulty: "intermediate",
    question:
      "Your loan-document extractor retries with error feedback whenever validation fails. Logs show two failing groups: (1) dates returned as \"March 3rd\" instead of ISO 8601, and (2) `interest_rate` missing on contracts that say \"rate as per Schedule B\", a schedule not included in the submission. Retries fix group 1, but group 2 still fails after three attempts. What should you do?",
    options: [
      { id: "A", text: "Raise the retry limit to six for group 2, since each attempt includes the error and the model will eventually find the rate." },
      { id: "B", text: "Keep retries for format errors like group 1 and route group 2 to a missing-source path, since Schedule B is not in the input." },
      { id: "C", text: "Remove retries completely and normalize all dates in code, because retries are not a reliable fix for any extraction error." },
      { id: "D", text: "Make the retry prompt stricter for group 2, telling the model `interest_rate` is mandatory and must be returned on retry." },
    ],
    correctAnswer: "B",
    explanation:
      "Retries work when the error is about format or structure and the information is in the document, which is why group 1 succeeds. They are ineffective when the information exists only in an external document that was not provided: no amount of feedback can produce a rate from Schedule B. The right move is to keep the retry loop for group 1 and detect group 2 as \"source incomplete\" (request the schedule or flag for review). Option A burns tokens and invites fabrication. Option C discards a retry loop that is working. Option D pressures the model to invent a value.",
    keyConcept: "Retries fix format errors, not information absent from the source",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Reduce hallucinations", url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations" },
    ],
  },
  {
    id: "D4-012",
    scenario: "Claude Code for Continuous Integration",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.1",
    difficulty: "intermediate",
    question:
      "Your automated PR reviewer reports four categories. Last month's dismissal rates: security 6%, correctness bugs 11%, performance 14%, and \"comment/documentation accuracy\" 72%. Team leads say developers now skim past every finding, including real security issues. What should you do first?",
    options: [
      { id: "A", text: "Disable the documentation-accuracy category for now and rewrite its criteria (flag only comments that contradict the code)." },
      { id: "B", text: "Add \"only report findings you are highly confident about\" to the whole prompt so that every category becomes more conservative." },
      { id: "C", text: "Keep all four categories but cap each review at five findings, sorted by the model's self-reported confidence, to reduce noise." },
      { id: "D", text: "Move documentation findings into a collapsed section at the bottom of the PR comment so they're less visible but still reported." },
    ],
    correctAnswer: "A",
    explanation:
      "One noisy category is undermining trust in the accurate ones. Temporarily disabling the high false-positive category restores trust right away, and rewriting its criteria (for example, flag a comment only when its claimed behavior contradicts the code) lets you bring it back once it is precise. Option B is a general confidence instruction, which the guide says does not improve precision and would also suppress valid security findings. Option C uses confidence ranking that can crowd out real bugs. Option D keeps posting the noise that developers have learned to ignore.",
    keyConcept: "Temporarily disable high false-positive categories to restore trust",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
];

// ============================================================
// DOMAIN 5 – Context Management & Reliability (15%)
// ============================================================

const domain5Questions: Question[] = [
  {
    id: "D5-001",
    scenario: "Customer Support Resolution Agent",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.1",
    difficulty: "intermediate",
    question:
      "Your support agent is 90 minutes into a billing dispute. To save tokens, the harness summarizes every turn older than 20 messages. Late in the session the agent offers a $40 credit, although the transcript shows it agreed to a $112.50 refund on order #8812 by March 14. The summarized history now reads: \"customer was promised a partial refund soon.\" What change most directly prevents this?",
    options: [
      { id: "A", text: "Raise the summarization threshold from 20 to 60 messages so that fewer turns get condensed in a typical session" },
      { id: "B", text: "Tell the summarizer to be more detailed and to keep important numbers whenever it judges them to be relevant" },
      { id: "C", text: "Put the full unsummarized transcript into the system prompt so the agent re-reads every turn on each request" },
      { id: "D", text: "Move amounts, dates, order IDs and agreed outcomes into a case-facts block sent each turn, outside the summary" },
    ],
    correctAnswer: "D",
    explanation:
      "D wins because progressive summarization turns precise transactional facts ($112.50, March 14, #8812) into vague prose (\"a partial refund soon\"). Pulling those facts into a persistent, structured block that is sent verbatim with every request, and that the summarizer never rewrites, keeps them exact however much history is condensed.\n\nA only delays the loss: long sessions still cross the higher threshold. B still trusts a lossy summarizer to decide what is \"important\", which is the same mechanism that already dropped the figure. C undoes the summarization: the token problem returns, and a very long transcript invites lost-in-the-middle errors.\n\nHow to implement:\n```typescript\ninterface CaseFacts {\n  orderId: string;            // \"8812\"\n  agreedRefund: number | null; // 112.50\n  refundDueBy: string | null;  // \"2026-03-14\"\n  status: \"open\" | \"agreed\" | \"escalated\" | \"resolved\";\n}\n\nfunction buildPrompt(facts: CaseFacts, summary: string, recent: string) {\n  // Facts are never summarized: they travel verbatim on every turn\n  return `<case_facts>\\n${JSON.stringify(facts, null, 2)}\\n</case_facts>\\n` +\n         `<history_summary>\\n${summary}\\n</history_summary>\\n${recent}`;\n}\n```",
    keyConcept: "Keep transactional facts in a persistent case-facts block outside summarized history",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Effective context engineering for AI agents", url: "https://www.anthropic.com/research/effective-context-engineering-for-ai-agents" },
    ],
  },
  {
    id: "D5-002",
    scenario: "Customer Support Resolution Agent",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.2",
    difficulty: "intermediate",
    question:
      "A caller says: \"I'm Maria Lopez, please cancel my subscription.\" get_customer returns three active accounts named Maria Lopez in different cities. Logs show the agent currently picks the account with the most recent activity and cancels it. What should the agent be instructed to do instead?",
    options: [
      { id: "A", text: "Keep the most-recent-activity rule but send a confirmation message once the cancellation has gone through" },
      { id: "B", text: "Ask the caller for one more identifier, such as email or an order number, before acting on any account" },
      { id: "C", text: "Escalate to a human every time get_customer returns more than one match, since the identity is uncertain" },
      { id: "D", text: "Pick the account whose city matches the caller's phone area code, then go ahead with the cancellation" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct: when a lookup returns several matches, the agent should ask for an additional identifier rather than choose by heuristic. One extra question resolves the ambiguity and keeps the case within the agent's capability.\n\nA still acts on a guess; the confirmation arrives after a stranger's subscription may already be cancelled. C over-escalates a case the agent can resolve with one question, which hurts first-contact resolution. D is just another heuristic: phone area codes do not reliably map to account ownership.\n\nHow to implement (system prompt excerpt):\n```markdown\n## Identity\nIf get_customer returns more than one match, do NOT pick one.\nAsk for one more identifier (email on file, order number, or last 4\ndigits of the payment card) and call get_customer again with it.\nOnly act on an account after exactly one match remains.\n```",
    keyConcept: "Multiple customer matches require asking for another identifier, not heuristic selection",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Customer support agent guide", url: "https://platform.claude.com/docs/en/about-claude/use-case-guides/customer-support-chat" },
    ],
  },
  {
    id: "D5-003",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.1",
    difficulty: "intermediate",
    question:
      "The coordinator concatenates the outputs of 12 subagents into one 70k-token input for the synthesis agent, in the order the subagents finished. Reports consistently use findings from the first two and last two outputs, while the middle outputs, which hold the strongest evidence, are rarely cited. Every subagent output was checked and is correct. What should you change?",
    options: [
      { id: "A", text: "Run synthesis 12 times, once per subagent output, and then concatenate the twelve resulting report sections" },
      { id: "B", text: "Sort the subagent outputs by length so that the shortest come first and the longest fall to the end of the input" },
      { id: "C", text: "Tell the synthesis agent to read the input twice and to confirm it considered every subagent's output" },
      { id: "D", text: "Open the aggregated input with a key-findings summary and give each subagent's detail an explicit section header" },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct. The pattern (beginning and end used, middle ignored) is the \"lost in the middle\" effect: models process the start and end of long inputs reliably and may skip findings in the middle. A key-findings summary at the top puts the most important evidence in the strongest position, and explicit section headers make every block addressable.\n\nA removes the effect by removing synthesis: twelve isolated sections cannot compare or reconcile sources. B reorders by a property unrelated to importance, so the strongest evidence may still sit in the middle. C relies on the model's self-report; asking it to confirm does not change how position affects attention.\n\nHow to implement:\n```typescript\nfunction buildSynthesisInput(outputs: SubagentOutput[]): string {\n  const keyFindings = outputs.flatMap(o => o.topFindings).slice(0, 15);\n  return [\n    \"## KEY FINDINGS (read first)\",\n    ...keyFindings.map(f => `- ${f.claim} [${f.sourceId}]`),\n    ...outputs.map(o => `\\n## SUBAGENT: ${o.topic}\\n${o.detail}`),\n  ].join(\"\\n\");\n}\n```",
    keyConcept: "Mitigate lost-in-the-middle: key findings first, explicit section headers",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Prompting best practices (long context prompting)", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices" },
    ],
  },
  {
    id: "D5-004",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.3",
    difficulty: "advanced",
    question:
      "For a report on battery recycling regulation, the legal-database subagent failed after its retries (the source API was down) and the patent subagent got only partial results from a paywalled source. The other three subagents succeeded. Stakeholders later complain that the final report reads as complete and authoritative on legal topics it barely covered. How should the synthesis output be structured?",
    options: [
      { id: "A", text: "Hold the whole report until every subagent succeeds, retrying the failed sources on a schedule until they respond" },
      { id: "B", text: "Leave out any section whose sources were incomplete, so the report holds only content from successful subagents" },
      { id: "C", text: "Add coverage annotations that mark well-supported findings and the topic areas with gaps from unavailable sources" },
      { id: "D", text: "Fill the legal section from the synthesis agent's general knowledge of regulation so the report has no visible gaps" },
    ],
    correctAnswer: "C",
    explanation:
      "C is correct. Coverage annotations tell the reader which findings rest on solid sources and which areas have gaps because a source was unavailable, so a partial failure is visible instead of silently shaping the conclusions.\n\nA turns one failed source into a stalled workflow, the \"terminate or block on a single failure\" anti-pattern. B hides the gap: the reader cannot tell that the legal topics were never researched, which is the complaint you started with. D fills the gap with unsourced content and makes the report look more complete than the research was.\n\nHow to implement:\n```typescript\ninterface CoverageNote {\n  topic: string;                         // \"EU legal framework\"\n  status: \"well_supported\" | \"partial\" | \"gap\";\n  reason?: string;                       // \"legal DB unavailable after 3 retries\"\n  sourcesUsed: number;\n}\n// The synthesis prompt requires a \"Coverage\" section built from these notes\n```",
    keyConcept: "Coverage annotations in synthesis output expose gaps from unavailable sources",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "How we built our multi-agent research system", url: "https://www.anthropic.com/research/multi-agent-research-system" },
    ],
  },
  {
    id: "D5-005",
    scenario: "Customer Support Resolution Agent",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.2",
    difficulty: "basic",
    question:
      "A customer's first message is: \"I want to talk to a human. Not a bot.\" Their account shows a straightforward duplicate charge that the agent could refund with one tool call. What should the agent do?",
    options: [
      { id: "A", text: "Refund the duplicate charge first, then offer the transfer if the customer still wants a human afterwards" },
      { id: "B", text: "Explain that it can fix duplicate charges instantly and ask the customer to let it try before transferring" },
      { id: "C", text: "Honor the request at once: call escalate_to_human with a short case summary, without investigating first" },
      { id: "D", text: "Look up the account to gather the charge details, then escalate with a full diagnosis attached for the human" },
    ],
    correctAnswer: "C",
    explanation:
      "C is correct. An explicit request for a human is an escalation trigger on its own; the agent should honor it immediately, without first attempting investigation or resolution. Passing along what the customer said keeps the hand-off useful.\n\nA ignores the stated preference and acts first. B is the right pattern for a frustrated customer who has not asked for a person (acknowledge, offer to resolve, escalate if they insist), but here the request is explicit. D delays the transfer to investigate, which is exactly what the customer declined.\n\nHow to implement (system prompt excerpt):\n```markdown\n## Escalation\n- If the customer explicitly asks for a human, call escalate_to_human\n  immediately. Do not investigate or attempt a fix first.\n- If the customer is frustrated but has NOT asked for a human and the\n  issue is within your capability, acknowledge it and offer to resolve.\n```",
    keyConcept: "Honor explicit requests for a human immediately, without investigating first",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Customer support agent guide", url: "https://platform.claude.com/docs/en/about-claude/use-case-guides/customer-support-chat" },
    ],
  },
  {
    id: "D5-006",
    scenario: "Customer Support Resolution Agent",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.3",
    difficulty: "advanced",
    question:
      "Your refund subagent calls process_refund, which updates the order record and then times out on the payment gateway. The coordinator receives {\"status\": \"error\", \"message\": \"refund failed\"} and has twice re-run the whole refund, producing duplicate order updates. Which information, added to the error, would most directly stop the duplicates?",
    options: [
      { id: "A", text: "Partial results stating that the order record was already updated and that the payment state is unconfirmed" },
      { id: "B", text: "The HTTP status code and response time of the failed gateway call, so the coordinator can see what went wrong" },
      { id: "C", text: "A retryable: true flag, so the coordinator knows the timeout was transient and that a retry is safe to run" },
      { id: "D", text: "A customer-facing message the coordinator can relay, explaining that the refund is delayed and will follow" },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct. The duplicates happen because the coordinator cannot see that part of the operation already succeeded. Structured error context should include what was attempted and the partial results; with \"order updated, payment unconfirmed\" the coordinator can retry only the payment step or check its status instead of repeating the whole refund.\n\nB adds transport detail but still says nothing about which steps completed. C is the most tempting option and makes things worse: \"retryable\" with no partial results invites exactly the full re-run that caused the duplicates. D helps the customer conversation but gives the coordinator nothing to decide with.\n\nHow to implement:\n```typescript\ntype RefundError = {\n  isError: true;\n  failureType: \"transient_timeout\";\n  attempted: { tool: \"process_refund\"; orderId: string; amount: number };\n  partialResults: { orderRecordUpdated: true; paymentStatus: \"unconfirmed\" };\n  alternatives: [\"check_payment_status\", \"retry_payment_only\"];\n};\n```",
    keyConcept: "Structured errors must carry what was attempted and partial results",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "MCP specification: Tools (error handling)", url: "https://modelcontextprotocol.io/specification/2025-06-18/server/tools" },
    ],
  },
  {
    id: "D5-007",
    scenario: "Developer Productivity with Claude",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.4",
    difficulty: "intermediate",
    question:
      "An engineer has used your exploration agent for three hours on a legacy billing system. Early on, the agent identified the InvoiceLedger and RetryScheduler classes. Now its answers contradict those findings and describe \"a typical scheduler pattern\" instead of naming RetryScheduler. What design change best counters this?",
    options: [
      { id: "A", text: "Have the agent log key findings in a scratchpad file and read that file before answering later questions" },
      { id: "B", text: "Restart the session every hour and ask the engineer to restate the important classes in the first message" },
      { id: "C", text: "Add a system prompt rule that forbids describing typical patterns and requires naming specific classes only" },
      { id: "D", text: "Resume the session before each new question so the entire three-hour history is loaded back into context" },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct. Inconsistent answers and references to \"typical patterns\" instead of classes found earlier are the signature of context degradation in long sessions. A scratchpad file persists key findings outside the conversation, and reading it before each answer brings the specific facts back into a strong position.\n\nB pushes the memory work onto the engineer and loses anything they forget to restate. C treats the symptom: the model cannot reliably name what it no longer holds well, so the rule may produce confident wrong names. D reloads the same long, degraded history, which is the cause, not the cure.\n\nHow to implement:\n```markdown\n<!-- notes/exploration.md, maintained by the agent -->\n## Confirmed classes\n- InvoiceLedger (src/billing/ledger.ts): append-only, owns totals\n- RetryScheduler (src/billing/retry.ts): custom backoff, NOT a cron\n## Open questions\n- Who calls RetryScheduler.flush()?\n```\nSystem prompt: \"Before answering, read notes/exploration.md. After each discovery, update it.\"",
    keyConcept: "Scratchpad files counter context degradation in long exploration sessions",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Effective context engineering for AI agents", url: "https://www.anthropic.com/research/effective-context-engineering-for-ai-agents" },
      { title: "Claude Code: Best practices", url: "https://code.claude.com/docs/en/best-practices" },
    ],
  },
  {
    id: "D5-008",
    scenario: "Code Generation with Claude Code",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.4",
    difficulty: "basic",
    question:
      "Midway through a refactor, a Claude Code session is close to full. Most of the context is output from dozens of grep runs and file reads, many in dead-end directories. The developer wants to keep working in the same session with the refactoring decisions intact. What should they do?",
    options: [
      { id: "A", text: "Exit, start a fresh session and paste the last few messages back in so that Claude remembers the current plan" },
      { id: "B", text: "Delete the project's .claude/ directory so that Claude Code clears its cached context and starts out lighter" },
      { id: "C", text: "Raise max_tokens for the session so the model has more room to hold the remaining exploration output" },
      { id: "D", text: "Run /compact with instructions to keep the refactoring decisions, so history is summarized and space is freed" },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct. /compact summarizes the conversation so far and frees context in the same session; adding instructions (for example \"/compact keep the refactoring decisions and the list of files changed\") tells Claude what to preserve while the verbose discovery output is condensed. Claude Code also auto-compacts near the limit, but running it yourself with focus instructions controls what survives.\n\nA loses every decision that is not in the last few messages. B deletes project configuration (settings, commands, rules) and does nothing to the live conversation. C confuses limits: max_tokens caps the length of the model's output, not the size of the context window.\n\nHow to implement:\n```text\n/compact Keep: the target module layout, the 6 files already migrated,\nand the decision to keep the legacy adapter until phase 2. Drop grep output.\n```",
    keyConcept: "/compact with focus instructions reduces context filled by verbose discovery output",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Claude Code: Manage costs effectively (/compact)", url: "https://code.claude.com/docs/en/costs" },
    ],
  },
  {
    id: "D5-009",
    scenario: "Structured Data Extraction",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.5",
    difficulty: "advanced",
    question:
      "Your invoice pipeline auto-approves extractions with confidence of 0.95 or higher and sends the rest to reviewers. After six months nobody looks at the auto-approved stream, and finance discovers that a new supplier template's tax field has been misread for weeks. How should you monitor the auto-approved stream going forward?",
    options: [
      { id: "A", text: "Lower the auto-approve threshold to 0.90 so more invoices reach the reviewers and errors are caught sooner" },
      { id: "B", text: "Review a stratified random sample of high-confidence extractions to measure errors and find new patterns" },
      { id: "C", text: "Review only the high-confidence extractions that downstream systems reject, as those are known to be wrong" },
      { id: "D", text: "Have the model re-score each auto-approved extraction and review the ones whose two scores disagree" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct. A stratified random sample of high-confidence extractions (stratified by supplier, template or document type) gives an ongoing, unbiased error rate for the stream nobody reviews, and it surfaces novel error patterns such as a new template before they spread for weeks.\n\nA moves the threshold without measuring anything; a template that is read confidently wrong stays above 0.90 too. C only catches errors that a downstream system happens to reject, and a misread tax amount usually passes validation. D checks the model against itself: a confidently wrong extraction tends to get the same high score twice.\n\nHow to implement:\n```python\nimport random\ndef daily_audit_sample(auto_approved, per_stratum=10):\n    by_stratum = {}\n    for doc in auto_approved:\n        by_stratum.setdefault((doc.supplier_template, doc.doc_type), []).append(doc)\n    # every stratum is sampled, including new, low-volume templates\n    return [d for docs in by_stratum.values()\n              for d in random.sample(docs, min(per_stratum, len(docs)))]\n```",
    keyConcept: "Stratified random sampling of high-confidence extractions measures error rates and finds novel patterns",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Define success criteria and build evaluations", url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests" },
    ],
  },
  {
    id: "D5-010",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.6",
    difficulty: "intermediate",
    question:
      "Your research pipeline runs search subagent → summarizer subagent (which compresses each source into three bullet points) → synthesis agent. Reviewers can no longer tell which source supports which statement in the final report, even though the search subagent returns URLs. How should you fix it?",
    options: [
      { id: "A", text: "Add a bibliography at the end of the report that lists every URL the search subagent returned during the run" },
      { id: "B", text: "Have subagents output claim-source mappings (claim, URL, excerpt) that summary and synthesis must keep and merge" },
      { id: "C", text: "Ask the synthesis agent to infer the likely source of each claim from the topic and wording of the bullet points" },
      { id: "D", text: "Remove the summarizer and pass the full text of every source to synthesis so the originals are always in context" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct. Attribution is lost at the summarization step because findings are compressed without their claim-source mapping. Making every subagent emit structured mappings (claim, source URL or document name, supporting excerpt), and requiring the summarizer and the synthesis agent to preserve and merge them, keeps each statement traceable end to end.\n\nA lists sources but does not say which source backs which claim. C asks the model to guess attribution, which produces plausible but unverifiable citations. D inflates the synthesis input with full documents, adds lost-in-the-middle risk, and still produces no explicit mapping.\n\nHow to implement:\n```typescript\ninterface ClaimSource {\n  claim: string;\n  sourceUrl: string;\n  documentTitle: string;\n  excerpt: string;          // verbatim supporting text\n  publishedAt?: string;\n}\n// Summarizer contract: input ClaimSource[] -> output ClaimSource[] (merged, never dropped)\n```",
    keyConcept: "Structured claim-source mappings must survive summarization and synthesis",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.6", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Citations", url: "https://platform.claude.com/docs/en/build-with-claude/citations" },
      { title: "How we built our multi-agent research system", url: "https://www.anthropic.com/research/multi-agent-research-system" },
    ],
  },
  {
    id: "D5-011",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.6",
    difficulty: "advanced",
    question:
      "On the topic of intermittent fasting and metabolic health, subagents return three large randomized trials that agree on modest weight loss, plus two smaller studies (one an observational cohort) with conflicting results on insulin sensitivity. The current report merges everything into one confident sentence: \"Intermittent fasting improves weight and insulin sensitivity.\" How should the report be structured?",
    options: [
      { id: "A", text: "Report only the three randomized trials and drop the insulin studies, since they are smaller and in conflict" },
      { id: "B", text: "Separate well-established from contested findings, keeping each source's wording and study design" },
      { id: "C", text: "Average the effect sizes of all five studies and present one pooled estimate per outcome in the summary" },
      { id: "D", text: "Keep the single sentence and add a disclaimer that some findings in the report may be contested by others" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct. The report should have explicit sections that distinguish well-established findings (weight loss, three large trials agreeing) from contested ones (insulin sensitivity, small and conflicting studies), preserving how each source characterized its result and the methodological context, such as trial versus observational cohort.\n\nA hides real but contested evidence, so the reader never learns the question is open. C pools studies with different designs into one number, which erases the methodological differences the reader needs. D is a vague disclaimer that does not say which claim is contested or why.\n\nHow to implement (synthesis prompt excerpt):\n```markdown\nStructure the report as:\n## Well-established (consistent, high-quality evidence)\n## Contested or emerging (conflicting or limited evidence)\nFor each finding keep: the source's own wording, study design\n(RCT / cohort / survey), sample size, and the citation.\n```",
    keyConcept: "Separate well-established from contested findings, preserving methodological context",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.6", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "How we built our multi-agent research system", url: "https://www.anthropic.com/research/multi-agent-research-system" },
    ],
  },
  {
    id: "D5-012",
    scenario: "Structured Data Extraction",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.5",
    difficulty: "intermediate",
    question:
      "Your extraction model outputs a confidence score per field. On 2,000 labeled documents, fields scored 0.9 or higher are correct only 78% of the time for contract_end_date but 99% of the time for party_name. Today a single global threshold of 0.9 decides which fields go to human review. What should you do?",
    options: [
      { id: "A", text: "Calibrate a review threshold per field on the labeled validation set, so each field routes by its accuracy" },
      { id: "B", text: "Drop model confidence entirely and send a fixed 30% random share of all documents to the reviewers each day" },
      { id: "C", text: "Keep the global 0.9 threshold and add a prompt telling the model to be more conservative when scoring dates" },
      { id: "D", text: "Raise the global threshold to 0.99 for every field, which removes most of the overconfident date extractions" },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct. The labeled set shows the same score means different accuracy for different fields, so one global threshold is miscalibrated. Field-level thresholds tuned on a labeled validation set (for example, the score at which each field reaches 98% observed accuracy) route review attention where errors actually occur.\n\nB discards a useful signal and spends review capacity on fields that are almost always right. C asks the model to calibrate itself through wording; self-reported confidence does not become calibrated because a prompt says so, and the result still has to be measured. D over-routes party_name, which was already 99% accurate, and still has not checked where contract_end_date becomes reliable.\n\nHow to implement:\n```python\ndef calibrate_threshold(scores, correct, target=0.98):\n    # lowest threshold whose accepted set meets the target accuracy\n    for t in sorted(set(scores)):\n        kept = [c for s, c in zip(scores, correct) if s >= t]\n        if kept and sum(kept) / len(kept) >= target:\n            return t\n    return None  # field always goes to review\n\nthresholds = {f: calibrate_threshold(val[f].scores, val[f].correct) for f in FIELDS}\n```",
    keyConcept: "Calibrate field-level confidence thresholds with a labeled validation set",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Define success criteria and build evaluations", url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests" },
    ],
  },
];

// ============================================================
// Exported question bank
// ============================================================

export const questions: Question[] = [
  ...domain1Questions,
  ...domain2Questions,
  ...domain3Questions,
  ...domain4Questions,
  ...domain5Questions,
];

export const domainNames: Record<Domain, string> = {
  1: "Agentic Architecture & Orchestration",
  2: "Tool Design & MCP Integration",
  3: "Claude Code Configuration & Workflows",
  4: "Prompt Engineering & Structured Output",
  5: "Context Management & Reliability",
};

export const domainWeights: Record<Domain, number> = {
  1: 27,
  2: 18,
  3: 20,
  4: 20,
  5: 15,
};

export const scenarios: Scenario[] = [
  "Customer Support Resolution Agent",
  "Code Generation with Claude Code",
  "Multi-Agent Research System",
  "Developer Productivity with Claude",
  "Claude Code for Continuous Integration",
  "Structured Data Extraction",
];

export const difficultyLevels: Difficulty[] = ["basic", "intermediate", "advanced"];

// Utility: get questions by domain
export function getQuestionsByDomain(domain: Domain): Question[] {
  return questions.filter((q) => q.domain === domain);
}

// Utility: get questions by scenario
export function getQuestionsByScenario(scenario: Scenario): Question[] {
  return questions.filter((q) => q.scenario === scenario);
}

// Utility: get questions by difficulty
export function getQuestionsByDifficulty(difficulty: Difficulty): Question[] {
  return questions.filter((q) => q.difficulty === difficulty);
}

// Utility: get a weighted random exam sample (proportional to domain weights)
export function getExamSample(totalQuestions: number = 60): Question[] {
  const sample: Question[] = [];
  const domainList: Domain[] = [1, 2, 3, 4, 5];

  for (const domain of domainList) {
    const weight = domainWeights[domain] / 100;
    const count = Math.round(totalQuestions * weight);
    const domainQs = getQuestionsByDomain(domain);
    const shuffled = [...domainQs].sort(() => Math.random() - 0.5);
    sample.push(...shuffled.slice(0, count));
  }

  return sample.sort(() => Math.random() - 0.5);
}

function shuffled<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const EXAM_SCENARIO_COUNT = 4;

// Like the real exam: 4 of the 6 scenarios at random, then items weighted by domain.
// `primary` items go first; `backup` fills a domain the chosen scenarios lack in `primary`.
export function getScenarioExamSample(primary: Question[], backup: Question[], totalQuestions: number) {
  const chosen = shuffled(scenarios).slice(0, EXAM_SCENARIO_COUNT);
  const inExam = (q: Question) => chosen.includes(q.scenario);
  const candidates = (pool: Question[], d: Domain) => shuffled(pool.filter((q) => inExam(q) && q.domain === d));
  const sample: Question[] = [];
  const leftovers: Question[] = [];
  for (const d of [1, 2, 3, 4, 5] as Domain[]) {
    const ranked = [...candidates(primary, d), ...candidates(backup, d)];
    const count = Math.round((totalQuestions * domainWeights[d]) / 100);
    sample.push(...ranked.slice(0, count));
    leftovers.push(...ranked.slice(count));
  }
  // A domain short on items gives its slots to the rest, primary bank first.
  const fill = leftovers.sort((a, b) => Number(backup.includes(a)) - Number(backup.includes(b)));
  sample.push(...fill.slice(0, totalQuestions - sample.length));
  return { questions: shuffled(sample), scenarios: chosen };
}
