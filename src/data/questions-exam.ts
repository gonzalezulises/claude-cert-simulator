// ============================================================
// Claude Certified Architect – Foundations
// Exam Mode Question Bank (60 questions, IDs E1-E5)
// ============================================================

import { Question } from "./questions";

// ============================================================
// DOMAIN 1 – Agentic Architecture & Orchestration (16 questions: pesa 27 %)
// ============================================================

const examDomain1Questions: Question[] = [
  {
    id: "E1-001",
    scenario: "Customer Support Resolution Agent",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.1",
    difficulty: "intermediate",
    question:
      "To decide when to stop, your support loop scans each Claude reply for phrases like \"Is there anything else I can help with?\" After a prompt update changed the agent's wording, some conversations end before the refund is processed and others keep looping after the customer has been helped. What should drive loop termination?",
    options: [
      { id: "A", text: "A longer list of closing phrases, kept in a config file the team updates after each prompt change" },
      { id: "B", text: "The stop_reason field: keep looping while it is \"tool_use\" and finish when it is \"end_turn\"" },
      { id: "C", text: "Whether the latest reply contains any text at all, since tool-calling turns never include text" },
      { id: "D", text: "A separate classifier model that reads every reply and judges whether the issue looks resolved" },
    ],
    correctAnswer: "B",
    explanation:
      "`stop_reason` is the structured signal built for this decision: `\"tool_use\"` means Claude wants a tool result and the loop must continue; `\"end_turn\"` means it has finished. It does not change when the wording does.\n\nOption A keeps parsing natural language, the anti-pattern that broke here, and makes it a maintenance chore. Option C rests on a false premise: a `tool_use` turn often contains text, so text presence is not a completion indicator. Option D adds a second model to guess at something the API already states exactly.",
    keyConcept: "Terminate the loop on stop_reason, not on parsed natural language",
    sources: [
      { title: "Handling stop reasons", url: "https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons" },
      { title: "Handle tool calls", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E1-002",
    scenario: "Customer Support Resolution Agent",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.4",
    difficulty: "intermediate",
    question:
      "The business wants the agent to offer store credit before a cash refund, but calls it a preference: customers who decline must get the refund without friction, and skipping the offer now and then costs little. An engineer proposes a hook that blocks process_refund until offer_store_credit has run. What should you recommend?",
    options: [
      { id: "A", text: "Ship the hook, because every ordering rule in a support workflow is safer when enforced in code" },
      { id: "B", text: "Ship the hook and add a bypass flag that the agent can set when it judges the offer unnecessary" },
      { id: "C", text: "Drop the requirement, since nothing the system cannot guarantee should be specified at all" },
      { id: "D", text: "Put the preference in the prompt with examples, and keep hooks for rules that must always hold" },
    ],
    correctAnswer: "D",
    explanation:
      "Programmatic enforcement is for rules where a single miss is unacceptable, such as identity checks before money moves or hard refund limits. This rule is explicitly a preference with a cheap failure mode, so prompt guidance with clear criteria and a few examples is the proportionate tool. A hard gate here would add friction to exactly the customers the business wants to protect.\n\nOption A treats every ordering rule as a guarantee and over-engineers a preference. Option B builds the gate and then hands the model a way around it, so it guarantees nothing while adding complexity. Option C ignores a legitimate business goal that prompt guidance can serve well.",
    keyConcept: "Prompt guidance for preferences, programmatic enforcement only where compliance must be deterministic",
    sources: [
      { title: "Intercept and control agent behavior with hooks", url: "https://code.claude.com/docs/en/agent-sdk/hooks" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E1-003",
    scenario: "Code Generation with Claude Code",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.7",
    difficulty: "intermediate",
    question:
      "Yesterday's named session, \"checkout-refactor\", analyzed 30 files and produced a refactoring plan. Overnight a teammate edited only `cart.ts` and `pricing.ts`; the other 28 files are unchanged. You want to continue today with the least wasted work and no stale assumptions. What do you do?",
    options: [
      { id: "A", text: "Resume the session and tell it which two files changed, so it re-reads only those before going on" },
      { id: "B", text: "Resume the session without comment; the agent will detect the changed files and adapt by itself" },
      { id: "C", text: "Start a fresh session and have the agent re-explore all thirty files to rebuild the analysis" },
      { id: "D", text: "Fork the session with fork_session, so that the edited files get picked up in the new branch" },
    ],
    correctAnswer: "A",
    explanation:
      "Most of yesterday's context is still valid, so resuming is the right base. But a resumed session still holds the old reads of `cart.ts` and `pricing.ts`, and nothing makes the agent re-read them on its own. Telling it exactly which files changed gives a targeted re-analysis: two files instead of thirty.\n\nOption B relies on the agent noticing a change it has no signal about. Option C discards valid analysis of 28 untouched files; starting fresh is for when most prior tool results are stale. Option D copies the same stale reads into a new branch, because forking branches the conversation, not its view of the files.",
    keyConcept: "When resuming after code changes, tell the agent exactly what changed for targeted re-analysis",
    sources: [
      { title: "Work with sessions", url: "https://code.claude.com/docs/en/agent-sdk/sessions" },
      { title: "CLI reference", url: "https://code.claude.com/docs/en/cli-reference" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.7", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E1-004",
    scenario: "Developer Productivity with Claude",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.6",
    difficulty: "advanced",
    question:
      "An incident-triage agent follows a fixed chain: read the error logs, check the last deploy, check database metrics, write a report. In one incident the logs pointed to an expired certificate on a third-party API, but the chain still checked the deploy and the database, and the report blamed a slow query. What decomposition fits this task?",
    options: [
      { id: "A", text: "Keep the fixed chain but add a fifth step that checks external dependencies right after the database" },
      { id: "B", text: "Run all four steps in parallel so that no single step's findings bias how the next one is read" },
      { id: "C", text: "Adaptive decomposition: start from the evidence and derive each next subtask from what it shows" },
      { id: "D", text: "Replace the chain with one long prompt that asks the agent to weigh every possible root cause" },
    ],
    correctAnswer: "C",
    explanation:
      "Incident triage is open-ended: what to check next depends on what the last check revealed. Adaptive decomposition lets the logs' pointer to the certificate become the next subtask, instead of being ignored in favor of a fixed script. Prompt chaining suits predictable multi-step work; this task is not predictable.\n\nOption A patches this incident's path and will miss the next unexpected cause. Option B removes the ordering but keeps the fixed list of checks, so evidence still cannot redirect the investigation. Option D asks for everything at once, which dilutes attention and gives up the step-by-step investigation that found the clue in the first place.",
    keyConcept: "Use dynamic decomposition for open-ended investigation; chaining for predictable work",
    sources: [
      { title: "Building effective agents", url: "https://www.anthropic.com/research/building-effective-agents" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.6", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E1-005",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.3",
    difficulty: "advanced",
    question:
      "Your coordinator must research four independent subtopics. Traces show it emits one Task call, waits for that subagent's result, then emits the next, so total latency is the sum of all four runs. The subtopics have no dependencies on each other. What change lets them run concurrently?",
    options: [
      { id: "A", text: "Have the coordinator emit all four Task calls in a single response so the subagents run in parallel" },
      { id: "B", text: "Tell each subagent to spawn the next one when it is done, so the coordinator no longer has to wait" },
      { id: "C", text: "Merge the four subtopics into one Task call and ask that subagent to divide the work up internally" },
      { id: "D", text: "Give the four subagents a shared memory store so that each can see the others' progress as it works" },
    ],
    correctAnswer: "A",
    explanation:
      "Parallel spawning happens when the coordinator emits several Task calls in the same response. Independent subtasks then finish in roughly the time of the slowest one instead of the sum. (In current releases the tool is named `Agent`, and subagents run in the background by default.)\n\nOption B is still a chain: current Claude Code does let subagents spawn their own (up to three layers by default), but handing off one after another stays sequential and takes the coordinator out of the routing. Option C puts four topics back into one context, losing both parallelism and focus. Option D assumes a shared memory between subagents that does not exist; each runs with isolated context.",
    keyConcept: "Spawn parallel subagents with multiple Task calls in one coordinator response",
    sources: [
      { title: "Subagents in the SDK", url: "https://code.claude.com/docs/en/agent-sdk/subagents" },
      { title: "Create custom subagents", url: "https://code.claude.com/docs/en/sub-agents" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E1-006",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.3",
    difficulty: "intermediate",
    question:
      "The coordinator's prompt to the search subagent is a 12-step procedure: run exactly these three search strings, open the top five results, extract two quotes from each, and so on. On topics where those strings return weak results, the subagent follows the steps anyway and returns thin findings. What should the prompt contain instead?",
    options: [
      { id: "A", text: "The same twelve steps, plus extra branches that say what to do whenever a step returns weak results" },
      { id: "B", text: "Nothing beyond the topic name, so the subagent is free to pick its own direction with no constraints" },
      { id: "C", text: "Fewer steps, each made stricter, with exact query strings and a required minimum number of sources" },
      { id: "D", text: "The research goal and the quality bar: what to cover, source standards and when coverage is enough" },
    ],
    correctAnswer: "D",
    explanation:
      "A subagent can adapt only if it knows what it is trying to achieve. A prompt that states the goal and the quality criteria (what must be covered, which sources qualify, when to stop) lets it change queries when results are weak, while still giving the coordinator a predictable standard to check against.\n\nOption A tries to anticipate every failure with more procedure, which grows without end and still misses cases. Option B swings to the other extreme: with no criteria, the coordinator cannot judge whether the result is good enough. Option C makes the procedure even more rigid, which is the cause of the thin findings.",
    keyConcept: "Coordinator prompts should state goals and quality criteria, not step-by-step procedures",
    sources: [
      { title: "How we built our multi-agent research system", url: "https://www.anthropic.com/research/multi-agent-research-system" },
      { title: "Subagents in the SDK", url: "https://code.claude.com/docs/en/agent-sdk/subagents" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E1-007",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.2",
    difficulty: "advanced",
    question:
      "A coordinator delegates a 200-step code analysis to a subagent and gets back a concise summary. A junior developer wants the coordinator to double-check the intermediate steps and is surprised it cannot see any of the subagent's tool calls. What is true, and what should the developer do?",
    options: [
      { id: "A", text: "Its transcript sits in the coordinator's context under a subagent_transcript key; read it from there" },
      { id: "B", text: "Only the final message returns; ask the subagent to put the evidence it needs in its final report" },
      { id: "C", text: "The coordinator must call a get_subagent_logs tool to load the transcript into its own context" },
      { id: "D", text: "The transcript is in the raw API response but hidden from the coordinator; parse it out of there" },
    ],
    correctAnswer: "B",
    explanation:
      "Context isolation works both ways. A subagent's intermediate tool calls and results stay inside its own context, and only its final message returns to the parent. That is what keeps a 200-step analysis from flooding the coordinator. If the coordinator needs to verify something, the subagent's prompt should ask for that evidence (file paths, line numbers, the checks it ran) in a structured final report. For auditing outside the model, transcripts are stored separately, and a SubagentStop hook receives their path.\n\nOptions A, C and D each invent a channel that would put the transcript back into the coordinator's context, which is exactly what the design avoids. None of them exists.",
    keyConcept: "Subagents return only their final message; request needed evidence in that report",
    sources: [
      { title: "Subagents in the SDK", url: "https://code.claude.com/docs/en/agent-sdk/subagents" },
      { title: "Intercept and control agent behavior with hooks", url: "https://code.claude.com/docs/en/agent-sdk/hooks" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E1-008",
    scenario: "Customer Support Resolution Agent",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.3",
    difficulty: "intermediate",
    question:
      "A coordinator has a 5,000-token system prompt with brand-voice guidelines and escalation rules. It delegates a refund question to a subagent with the task prompt \"Handle ticket #1234.\" The subagent's reply violates the escalation rules. What is the most likely cause?",
    options: [
      { id: "A", text: "Subagents start fresh: no parent system prompt or history, only their own prompt and the task given" },
      { id: "B", text: "The subagent runs a different model version that reads the same inherited instructions differently" },
      { id: "C", text: "The coordinator has to set share_context: true in the AgentDefinition to pass on its system prompt" },
      { id: "D", text: "Subagents inherit the system prompt but ignore any instructions that arrive after the first turn" },
    ],
    correctAnswer: "A",
    explanation:
      "A non-fork subagent's context starts without the parent's conversation history or system prompt. It receives its own system prompt (`AgentDefinition.prompt`), the Agent tool's prompt string, project CLAUDE.md and its tool definitions. The escalation rules lived only in the coordinator's system prompt, so the subagent never saw them. The fix is to put the rules it needs in the subagent's own prompt or in the delegated task.\n\nOption B blames the model when the instructions were simply absent. Option C describes a flag that does not exist. Option D invents a partial inheritance that also does not exist.",
    keyConcept: "Subagents do not inherit the parent's system prompt or history; pass context explicitly",
    sources: [
      { title: "Subagents in the SDK", url: "https://code.claude.com/docs/en/agent-sdk/subagents" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E1-009",
    scenario: "Customer Support Resolution Agent",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.4",
    difficulty: "advanced",
    question:
      "A customer writes: \"Order #8812 arrived damaged, I was billed twice this month, and I need to change my shipping address.\" The agent handles the damaged order, answers the billing question from general knowledge without checking the account, and never touches the address. How should the workflow handle messages like this?",
    options: [
      { id: "A", text: "Handle only the first concern and invite the customer to open new tickets for the other two issues" },
      { id: "B", text: "Escalate any message with more than one concern to a human, since mixed requests are too risky" },
      { id: "C", text: "Split it into distinct items, investigate each in parallel with shared context, then reply once" },
      { id: "D", text: "Take the concerns strictly one at a time, waiting for the customer to confirm each before moving on" },
    ],
    correctAnswer: "C",
    explanation:
      "Multi-concern requests should be decomposed into explicit items first, so none is dropped. Each item is then investigated with the tools it needs (order lookup, billing records, address update), in parallel where possible and sharing the customer context already gathered, and the results are combined into one coherent resolution.\n\nOption A pushes work back onto the customer and lowers first-contact resolution. Option B escalates cases the agent can solve, which wastes human capacity and misses the 80% target. Option D avoids dropping items but turns one conversation into several round trips for no benefit, since the three concerns are independent.",
    keyConcept: "Decompose multi-concern requests, investigate each item, then synthesize one resolution",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 1.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E1-010",
    scenario: "Claude Code for Continuous Integration",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.5",
    difficulty: "advanced",
    question:
      "In a CI agent, a hook is meant to stop any `git push --force` to main. It is registered on PostToolUse with a `Bash` matcher and returns a block decision when it sees that command. Last night a force push still rewrote main, and the logs show the hook fired. Why, and what is the fix?",
    options: [
      { id: "A", text: "The matcher must be \"git\" rather than \"Bash\", and the rule should also be repeated in the prompt" },
      { id: "B", text: "PostToolUse is right, but the matcher needs onFailure: \"block\" so the hook's decision is enforced" },
      { id: "C", text: "PostToolUse runs after the command executes; the check belongs in a PreToolUse hook that denies it" },
      { id: "D", text: "Hooks cannot read Bash arguments, so the rule has to live in CLAUDE.md as a project-wide team policy" },
    ],
    correctAnswer: "C",
    explanation:
      "Timing is the whole difference. PostToolUse fires after the tool has run, so by the time the hook \"blocks\", the push has already rewritten main; at that point Claude only receives feedback. Enforcement of a rule that must prevent an action belongs in PreToolUse, which sees `tool_input.command` before execution and can return `permissionDecision: \"deny\"` with a reason.\n\nOption A is wrong twice: matchers match tool names, so `Bash` is the correct matcher, and adding prompt text does not make the rule deterministic. Option B misreads `onFailure`, which decides what happens when the hook callback itself fails; it cannot undo a command that already ran. Option D is false: hooks receive the full tool input, including the Bash command.\n\nHow to implement:\n```typescript\nconst noForcePush: HookCallback = async (input) => {\n  const cmd = String(((input as PreToolUseHookInput).tool_input as any).command ?? \"\");\n  if (/git\\s+push\\b.*(--force|-f\\b)/.test(cmd) && /\\bmain\\b/.test(cmd)) {\n    return { hookSpecificOutput: { hookEventName: \"PreToolUse\", permissionDecision: \"deny\",\n      permissionDecisionReason: \"Force-pushing to main is not allowed. Open a PR instead.\" } };\n  }\n  return {};\n};\n// options.hooks = { PreToolUse: [{ matcher: \"Bash\", hooks: [noForcePush] }] }\n```",
    keyConcept: "Blocking hooks must run before execution (PreToolUse); PostToolUse is too late to prevent",
    sources: [
      { title: "Intercept and control agent behavior with hooks", url: "https://code.claude.com/docs/en/agent-sdk/hooks" },
      { title: "Hooks reference", url: "https://code.claude.com/docs/en/hooks" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E1-011",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.1",
    difficulty: "advanced",
    question:
      "A research agent's loop is hard-coded to stop after 8 iterations. Simple queries finish well inside that, but deep ones are cut off mid-investigation, and the report is assembled from partial findings with no sign that anything is missing. What is the better design?",
    options: [
      { id: "A", text: "Raise the cap to 25 iterations so that the deep queries have room to finish inside the fixed limit" },
      { id: "B", text: "Loop until stop_reason is \"end_turn\", keeping a high cap only as a safety net that flags the run" },
      { id: "C", text: "Have the agent state in each reply how many more steps it expects, and stop when that reaches zero" },
      { id: "D", text: "Remove the loop and request the whole report in one call, with every tool made available at once" },
    ],
    correctAnswer: "B",
    explanation:
      "The model signals completion through `stop_reason`; the loop should run until `\"end_turn\"`. A cap is still useful against runaway loops, but as a backstop: hitting it means the run is incomplete and must be surfaced as such, not silently treated as a finished report. In the Agent SDK this cap is `maxTurns`, and reaching it ends the run with a ResultMessage whose `subtype` is `error_max_turns`; that is a result subtype, not a `stop_reason` value.\n\nOption A moves the arbitrary cutoff instead of removing it as the primary stop. Option C parses natural language to decide termination, another anti-pattern. Option D removes the agentic loop entirely, so the model cannot act on what its tools return.",
    keyConcept: "Iteration caps are a safety net, not the primary stopping mechanism",
    sources: [
      { title: "Handling stop reasons", url: "https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons" },
      { title: "How the agent loop works", url: "https://code.claude.com/docs/en/agent-sdk/agent-loop" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E1-012",
    scenario: "Developer Productivity with Claude",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.6",
    difficulty: "intermediate",
    question:
      "You ask an agent to \"add comprehensive tests to this legacy codebase\": 400 files, almost no existing tests, and unclear dependencies between modules. Which plan is most likely to produce useful coverage?",
    options: [
      { id: "A", text: "Generate a test file for every source file in alphabetical order until the whole tree is covered" },
      { id: "B", text: "Map the structure, rank the high-impact areas, then follow a prioritized plan that adapts as it goes" },
      { id: "C", text: "Write a fixed list of twenty test tasks up front, then execute them in order without any changes" },
      { id: "D", text: "Start with the files that are easiest to test so that the coverage number climbs as fast as possible" },
    ],
    correctAnswer: "B",
    explanation:
      "Open-ended tasks are decomposed by first understanding the territory. Mapping the structure shows what exists and how it connects; ranking high-impact areas (payment paths, shared utilities, code that changes often) points effort where tests matter most; and an adaptive plan absorbs the dependencies that only appear once you start writing tests.\n\nOption A spends effort evenly on code of very different importance and ignores dependencies. Option C commits to a plan before learning anything about the codebase. Option D optimizes the metric rather than the goal: easy-to-test code is often the least risky code.",
    keyConcept: "Decompose open-ended work by mapping, prioritizing and adapting the plan as you learn",
    sources: [
      { title: "Building effective agents", url: "https://www.anthropic.com/research/building-effective-agents" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.6", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E1-013",
    scenario: "Claude Code for Continuous Integration",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.4",
    difficulty: "intermediate",
    question:
      "A CI pipeline runs Claude Code to review pull requests. The system prompt says the agent must run the test suite before posting any review comment, but roughly one run in twenty posts the comment first. The team needs the ordering to hold every time. What should they implement?",
    options: [
      { id: "A", text: "Stronger system prompt wording, \"CRITICAL: run tests before commenting\", copied into CLAUDE.md too" },
      { id: "B", text: "A lower effort level so the model follows the instruction more literally and improvises less often" },
      { id: "C", text: "A PreToolUse hook that blocks the comment tool until the test tool has passed in this session" },
      { id: "D", text: "A PostToolUse hook that deletes any review comment the agent posted before the tests ran" },
    ],
    correctAnswer: "C",
    explanation:
      "When compliance has to be deterministic, the prompt is the wrong layer. A prompt is a probabilistic instruction: it has a non-zero failure rate, which is exactly the one in twenty being observed. A PreToolUse hook is application code that inspects the pending call and refuses it unless the prerequisite is met, so the failure rate is zero by construction.\n\nOption A changes the wording, not the mechanism. Option B confuses effort with obedience: effort tunes reasoning depth, not rule-following. Option D reacts after the fact: the comment has already been posted and its notifications sent, so the ordering still breaks one run in twenty. A PostToolUse hook runs after the tool; only PreToolUse can stop the call.\n\nHow to implement:\n```typescript\nlet testsPassed = false;\nconst hooks = {\n  PreToolUse: [{ matcher: \"post_review_comment\", hooks: [async () => testsPassed ? {} : {\n    hookSpecificOutput: { hookEventName: \"PreToolUse\", permissionDecision: \"deny\",\n      permissionDecisionReason: \"Run the test suite first; commenting is gated on a green run.\" } }] }],\n  PostToolUse: [{ matcher: \"run_tests\", hooks: [async (input: any) => {\n    testsPassed = input.tool_response?.exitCode === 0; return {}; }] }],\n};\n```",
    keyConcept: "Prompt for preferences, hooks for guarantees: a prerequisite gate belongs in code",
    sources: [
      { title: "Intercept and control agent behavior with hooks", url: "https://code.claude.com/docs/en/agent-sdk/hooks" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E1-014",
    scenario: "Structured Data Extraction",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.5",
    difficulty: "intermediate",
    question:
      "An extraction agent pulls records from three MCP servers. One returns dates as Unix timestamps, another as ISO 8601 strings and the third as DD/MM/YYYY. The agent keeps ordering records wrongly because it compares the three formats as if they were the same. What is the most reliable fix?",
    options: [
      { id: "A", text: "Describe all three formats in the system prompt and tell the model to convert them before comparing" },
      { id: "B", text: "Raise the effort level so the model reasons more carefully about each date before comparing them" },
      { id: "C", text: "A PostToolUse hook that rewrites every date field to ISO 8601 before the model sees the tool result" },
      { id: "D", text: "Ask the owners of the three MCP servers to agree on one shared date format for all their responses" },
    ],
    correctAnswer: "C",
    explanation:
      "PostToolUse hooks intercept a tool result on its way back and can transform it before the model sees it. Normalizing the three formats there means the model always receives one consistent shape, so the comparison stops being a reasoning problem and becomes a data problem solved once, in code. (In the current SDK the hook replaces the output with `updatedToolOutput`; the older `updatedMCPToolOutput` covers MCP tools only.)\n\nOption A moves a mechanical conversion into the model's reasoning, where it costs tokens on every record and still fails sometimes. Option B is the same bet with a bigger budget. Option D is clean in principle but rarely available: you seldom control three third-party servers, and a fourth source would bring the problem back.\n\nHow to implement:\n```typescript\nconst normalizeDates: HookCallback = async (input) => {\n  const out = (input as PostToolUseHookInput).tool_response as Record<string, unknown>;\n  return { hookSpecificOutput: { hookEventName: \"PostToolUse\", updatedToolOutput: toIsoDates(out) } };\n};\n// options.hooks = { PostToolUse: [{ matcher: \"^mcp__\", hooks: [normalizeDates] }] }\n```",
    keyConcept: "PostToolUse hooks normalize heterogeneous formats before the model sees them",
    sources: [
      { title: "Intercept and control agent behavior with hooks", url: "https://code.claude.com/docs/en/agent-sdk/hooks" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E1-015",
    scenario: "Code Generation with Claude Code",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.7",
    difficulty: "intermediate",
    question:
      "Yesterday an engineer used a named session to analyze the payments module and agreed a refactoring plan with the agent. Overnight a colleague rewrote most of that module. The engineer wants to continue the work today. What is the more reliable way to pick it up?",
    options: [
      { id: "A", text: "Resume the named session with --resume; the agent will notice the files changed and re-read them" },
      { id: "B", text: "Start fresh with a structured summary of yesterday's conclusions, since the old tool results are stale" },
      { id: "C", text: "Use fork_session to branch from yesterday's session and continue all of the refactoring in the new branch" },
      { id: "D", text: "Resume the session and raise the effort level so the agent double-checks every file before acting" },
    ],
    correctAnswer: "B",
    explanation:
      "A resumed session carries its old tool results, and those are reads of code that has since been rewritten. The agent will reason over that stale content unless something forces a re-read, and nothing does automatically. Starting fresh with a structured summary keeps what is still true (the conclusions and the plan) and drops what is not (the file contents).\n\nThe decision rule: resume when prior context is mostly valid; start fresh with an injected summary when prior tool results have gone stale. Here most of the module changed. Option A assumes an automatic re-read that does not happen. Option C copies the same stale history into a branch. Option D spends more reasoning on outdated inputs, which does not make them current.",
    keyConcept: "With most prior tool results stale, start fresh with a structured summary instead of resuming",
    sources: [
      { title: "Work with sessions", url: "https://code.claude.com/docs/en/agent-sdk/sessions" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.7", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E1-016",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.2",
    difficulty: "advanced",
    question:
      "Your coordinator always runs the full pipeline (web search, document analysis, synthesis and report) for every query. For broad questions it works well, but \"What year was the transformer paper published?\" takes four minutes and returns a multi-page report. How should the coordinator change?",
    options: [
      { id: "A", text: "Split the system into two separate products, one for quick facts and another for full research reports" },
      { id: "B", text: "Add a keyword router in front that sends any question shorter than 15 words to a single agent" },
      { id: "C", text: "Keep the full pipeline and tell each subagent to finish faster whenever the question looks simple" },
      { id: "D", text: "Have the coordinator assess what each query needs and invoke only the subagents it actually requires" },
    ],
    correctAnswer: "D",
    explanation:
      "Deciding which subagents to invoke, based on the query's complexity, is part of the coordinator's job. A simple factual question may need one search call; a broad topic needs the whole pipeline with iterative refinement. Putting that judgment in the coordinator keeps one system that scales effort to the question.\n\nOption A duplicates the system and pushes the routing decision onto users. Option B replaces judgment with a brittle proxy: a short question can be deep and a long one trivial. Option C still pays for every stage on every query and only asks each stage to hurry.",
    keyConcept: "The coordinator dynamically selects subagents instead of always running the full pipeline",
    sources: [
      { title: "How we built our multi-agent research system", url: "https://www.anthropic.com/research/multi-agent-research-system" },
      { title: "CCAR-F Exam Guide v1.0 — Task 1.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E1-017",
    scenario: "Customer Support Resolution Agent",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.5",
    difficulty: "advanced",
    question:
      "Policy says refunds above $500 need a human, and accounts flagged for fraud review must never be refunded. The system prompt states both rules, yet audits still find a few violations each week. Separately, `lookup_order` returns `refund_status` as numeric codes (0, 1, 2) that the agent sometimes misreads. Which two changes give deterministic guarantees? (Select two.)",
    options: [
      { id: "A", text: "A PostToolUse hook on process_refund that checks the amount after the refund runs and alerts a supervisor above $500" },
      { id: "B", text: "A stronger system prompt section, written in capitals, that repeats both rules with three worked examples of refusals" },
      { id: "C", text: "A PreToolUse hook on process_refund that blocks calls over $500 or on fraud-flagged accounts and routes them to escalation" },
      { id: "D", text: "A PostToolUse hook on lookup_order that maps the numeric refund_status codes to labels before the model ever sees them" },
    ],
    correctAnswer: "CD",
    explanation:
      "Option C is right because a hook that intercepts the outgoing tool call runs before the refund happens and enforces the rule in code. The guide calls for blocking policy-violating actions (such as refunds over $500) and redirecting them to an alternative workflow such as human escalation, and for choosing hooks over prompts when compliance must be guaranteed.\n\nOption D is right because PostToolUse hooks can transform tool results before the model processes them. Normalizing numeric status codes into clear labels removes the misreading deterministically instead of hoping the model remembers what each code means.\n\nOption A is wrong because a PostToolUse hook on process_refund fires after the money has moved. Alerting afterwards detects the violation; it does not prevent it.\n\nOption B is wrong because prompt instructions are probabilistic: the rules are already in the prompt and still fail a few times a week. Louder wording lowers the rate at best; it cannot make it zero.",
    keyConcept: "Use hooks that intercept outgoing tool calls to block policy violations, and PostToolUse hooks to normalize tool results; prompts alone give only probabilistic compliance.",
    sources: [
      { title: "Intercept and control agent behavior with hooks", url: "https://code.claude.com/docs/en/agent-sdk/hooks" },
    ],
  },
  {
    id: "E1-018",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.2",
    difficulty: "intermediate",
    question:
      "A request to research \"how AI is changing the creative industries\" produces a report that covers only visual art. Traces show the coordinator split the topic into three subtasks: digital painting, graphic design and photography. Each subagent completed its subtask well, and the synthesis is accurate for what it received. Which two coordinator changes address the root cause? (Select two.)",
    options: [
      { id: "A", text: "Decompose broad topics into distinct subtopics that span the whole domain, such as music, writing, film and visual art" },
      { id: "B", text: "Have the coordinator check the synthesis for coverage gaps and re-delegate targeted searches until coverage is sufficient" },
      { id: "C", text: "Let the subagents message each other directly to agree on who covers what, so the coordinator no longer manages scope" },
      { id: "D", text: "Raise the web search subagent's results limit per query, so it can collect more sources on each subtopic it is given" },
    ],
    correctAnswer: "AB",
    explanation:
      "Option A is right because the failure is in task decomposition: the coordinator chose three overlapping slices of one sub-area. The guide warns that overly narrow decomposition leaves broad topics incompletely covered, and recommends partitioning scope into distinct subtopics that minimize duplication.\n\nOption B is right because the guide describes iterative refinement: the coordinator evaluates the synthesis for gaps, re-delegates targeted queries to the search and analysis subagents, and re-runs synthesis until coverage is sufficient. That loop would catch missing areas like music or film.\n\nOption C is wrong because it breaks the hub-and-spoke pattern. The coordinator should route all inter-subagent communication for observability and controlled information flow; peer negotiation also does nothing to widen the scope.\n\nOption D is wrong because the subagents already did their assigned work well. More results on the same narrow subtopics still leave the rest of the domain uncovered.",
    keyConcept: "The coordinator owns decomposition: partition broad topics into distinct subtopics, and loop on synthesis gaps with targeted re-delegation.",
    sources: [
      { title: "How we built our multi-agent research system", url: "https://www.anthropic.com/research/multi-agent-research-system" },
      { title: "Effective context engineering for AI agents", url: "https://www.anthropic.com/research/effective-context-engineering-for-ai-agents" },
    ],
  },
];

// ============================================================
// DOMAIN 2 – Tool Design & MCP Integration (12 questions)
// ============================================================

const examDomain2Questions: Question[] = [
  {
    id: "E2-001",
    scenario: "Customer Support Resolution Agent",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.2",
    difficulty: "intermediate",
    question:
      "Company policy forbids refunds above $500 without manager approval. When `process_refund` is called for $720, your MCP server returns `isError: true` with the text \"Error 4012\". The agent retries the call, then tries $719, and finally tells the customer that \"something went wrong.\" What should the tool return so the agent handles this case correctly?",
    options: [
      { id: "A", text: "`isError: true` with `errorCategory: \"transient\"` and `isRetryable: true`, so the agent waits and resubmits once the refund service recovers." },
      { id: "B", text: "A JSON-RPC protocol error, so the MCP client blocks the request and the agent never sees a policy violation it can't resolve by itself." },
      { id: "C", text: "`isError: true`, `errorCategory: \"business\"`, `isRetryable: false`, and a customer-friendly note that refunds over $500 need a manager." },
      { id: "D", text: "A successful result that quietly caps the refund at $500, so the customer still gets most of the money and the conversation can continue." },
    ],
    correctAnswer: "C",
    explanation:
      "C is correct. This is a business rule violation: no retry will succeed, and the agent needs to know why so it can explain the rule and escalate (for example with `escalate_to_human`). A non-retryable business error with a customer-friendly explanation gives it exactly that. The opaque \"Error 4012\" is why the agent probed with $719.\n\nA mislabels a permanent policy limit as a temporary outage and invites more wasted retries. B uses the wrong channel: protocol errors are for malformed requests, and the agent loses the information it needs to talk to the customer. D silently changes a financial action without the customer's agreement.\n\nHow to implement:\n```typescript\nif (amount > 500 && !managerApproved) {\n  return { isError: true, content: [{ type: \"text\", text: JSON.stringify({\n    errorCategory: \"business\", isRetryable: false,\n    customerMessage: \"Refunds over $500 need a manager's approval. I can request it for you now.\",\n    suggestedAction: \"escalate_to_human\",\n  }) }] };\n}\n```",
    keyConcept: "Non-retryable business errors with customer-friendly explanations",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 2.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "MCP specification — Tools (error handling)", url: "https://modelcontextprotocol.io/specification/2026-07-28/server/tools" },
    ],
  },
  {
    id: "E2-002",
    scenario: "Code Generation with Claude Code",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.5",
    difficulty: "advanced",
    question:
      "Claude Code must change the timeout in one of four retry blocks in `client.ts`. The blocks were generated from a template and are byte-for-byte identical, and the nearest unique text, the name of the enclosing function `uploadFile`, is 60 lines above the third block. The Edit call fails because its `old_string` matches four locations. Only the block inside `uploadFile` should change. What is the reliable way to make this change?",
    options: [
      { id: "A", text: "Retry Edit with `replace_all: true`, which applies the new timeout wherever the string appears and clears the uniqueness error." },
      { id: "B", text: "Grep for the timeout line with `output_mode: \"content\"`, then pass the line number it returns to Edit as the location to change." },
      { id: "C", text: "Use Write to overwrite `client.ts` from what Claude remembers of it, with the new timeout, without reading the file again first." },
      { id: "D", text: "Read the full file, change the timeout only in the third block of the loaded content, and Write the complete updated file back." },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct. When Edit can't find unique anchor text, Read followed by Write is the reliable fallback: Claude loads the current content, changes exactly the block inside `uploadFile`, and writes the whole file back.\n\nA changes all four blocks, three of them wrongly. B assumes Edit accepts a line number, but Edit only does exact string replacement with `old_string` and `new_string`. C overwrites the file from memory, which can silently drop changes made since it was last read. Product note: the current Edit tool can also pin one occurrence with a longer `old_string` that includes enough surrounding context; when the nearest unique text is 60 lines away, as here, that anchor is fragile, which is why the guide's Read + Write fallback applies.\n\nHow to implement:\n```text\n1. Read  client.ts                       (full current content)\n2. In the loaded text, change timeoutMs: 5000 -> 15000 only inside uploadFile()\n3. Write client.ts  <complete updated content>\n```",
    keyConcept: "Read + Write as the fallback when Edit has no unique anchor",
    sources: [
      { title: "Claude Code tools reference", url: "https://code.claude.com/docs/en/tools-reference" },
      { title: "CCAR-F Exam Guide v1.0 — Task 2.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E2-003",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "intermediate",
    question:
      "Your agent uses an internal MCP server whose `query_docs(path)` tool reads one page of a 1,200-page documentation set organized in a deep hierarchy. Traces show that before every answer the agent makes 10–15 exploratory `query_docs` calls with guessed paths, and many return \"not found\". What should the MCP server add?",
    options: [
      { id: "A", text: "Expose the documentation hierarchy as MCP resources, so the agent can see which pages exist and read the right one directly." },
      { id: "B", text: "Raise the server's timeout and rate limit, so the exploratory calls finish faster and the agent can afford more guesses per answer." },
      { id: "C", text: "Add a `list_everything` tool that returns the full text of all 1,200 pages at once, so the agent never needs to guess a path again." },
      { id: "D", text: "Add a system prompt rule capping the agent at three `query_docs` calls per answer, and tell it to answer from whatever it finds." },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct. MCP resources are the mechanism for exposing a content catalog, such as a documentation hierarchy, an issue list or database schemas, so the agent can see what data exists without exploratory tool calls. In Claude Code, resources appear in `@` mentions and can be listed and read through built-in resource tools.\n\nB makes the waste faster instead of removing it. C replaces a catalog with the full content: it floods the context, and very large outputs trigger Claude Code's MCP output warnings and limits. D caps the guessing, so the agent answers from worse evidence.\n\nHow to implement:\n```typescript\nserver.registerResource(\n  \"docs-index\",\n  \"docs://index\",\n  { title: \"Documentation index\", mimeType: \"application/json\" },\n  async () => ({ contents: [{ uri: \"docs://index\", text: JSON.stringify(buildTree()) }] }),\n);\n```",
    keyConcept: "MCP resources expose content catalogs and reduce exploratory tool calls",
    sources: [
      { title: "MCP specification — Resources", url: "https://modelcontextprotocol.io/specification/2026-07-28/server/resources" },
      { title: "Connect Claude Code to tools via MCP", url: "https://code.claude.com/docs/en/mcp" },
      { title: "CCAR-F Exam Guide v1.0 — Task 2.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E2-004",
    scenario: "Customer Support Resolution Agent",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.1",
    difficulty: "intermediate",
    question:
      "`get_customer` has the description \"Returns customer information.\" It returns name, email, tier and account status, but no order history. Traces show that when a customer asks \"what did I order last month?\", the agent calls `get_customer` repeatedly with different arguments and then tells the customer they have no recent orders, although `lookup_order` would have answered. What is the best fix?",
    options: [
      { id: "A", text: "Raise the agent's maximum number of turns, so it has room to keep exploring after `get_customer` and eventually try `lookup_order`." },
      { id: "B", text: "Extend `get_customer` so it also returns the full order history, making it the single place to look for any question about a customer." },
      { id: "C", text: "Add a system prompt rule: \"if get_customer does not answer the question, try the other tools before you reply to the customer.\"" },
      { id: "D", text: "Rewrite the `get_customer` description to list its fields, say it has no order data, and point to `lookup_order` for purchases." },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct. Descriptions are the main signal the model uses to choose tools, and a good description also states what the tool returns and what it doesn't. Saying explicitly that `get_customer` has no order data and naming `lookup_order` for purchases removes the false expectation that drives the repeated calls.\n\nA gives a misinformed agent more room to wander. B creates overlap between two tools and bloats every customer lookup. C is a generic fallback rule that still leaves the agent guessing which tool covers what.\n\nHow to implement:\n```typescript\n{\n  name: \"get_customer\",\n  description: \"Returns the profile of one verified customer: name, email, tier and account status. \" +\n    \"Does NOT return orders, purchases or shipments; for those, use lookup_order. \" +\n    \"Input: customer_id (CUS-######) or the email on the account.\",\n  input_schema: { /* ... */ },\n}\n```",
    keyConcept: "Tool descriptions should state outputs and limits, and point to the alternative tool",
    sources: [
      { title: "Define tools (Claude API docs)", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools" },
      { title: "CCAR-F Exam Guide v1.0 — Task 2.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E2-005",
    scenario: "Structured Data Extraction",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.3",
    difficulty: "intermediate",
    question:
      "Your pipeline defines one extraction tool per document type: `extract_invoice`, `extract_receipt` and `extract_purchase_order`, each with a strict schema. Documents arrive unlabeled. In about 6% of calls Claude replies with a prose summary instead of calling any tool, and the downstream parser fails. Which `tool_choice` setting fixes this without hard-coding the document type?",
    options: [
      { id: "A", text: "`{\"type\": \"auto\"}`, plus a system prompt instruction saying \"always answer by calling one of the extraction tools, never with text.\"" },
      { id: "B", text: "`{\"type\": \"tool\", \"name\": \"extract_invoice\"}`, since invoices are the most common type and the schema can absorb the other types." },
      { id: "C", text: "`{\"type\": \"any\"}`, so Claude must call one of the provided tools but still decides which extraction schema fits the document." },
      { id: "D", text: "`{\"type\": \"none\"}`, and then parse the prose reply with regular expressions that map each document type onto its expected fields." },
    ],
    correctAnswer: "C",
    explanation:
      "C is correct. `any` guarantees that Claude calls one of the provided tools instead of returning text, and it still lets the model pick the schema that matches each unlabeled document.\n\nA is the default behavior plus a probabilistic instruction, which is what produces the 6% of prose today. B forces a single schema onto receipts and purchase orders. D gives up structured output altogether and replaces it with brittle parsing. Product note: current docs say Claude Opus 5.5 and Sonnet 5.5 reject `any` and forced `tool` with a 400 error; on those models, use `auto` with strict tool use or structured outputs.\n\nHow to implement:\n```python\nresponse = client.messages.create(\n    model=\"claude-haiku-5-5\",\n    max_tokens=2048,\n    tools=[extract_invoice, extract_receipt, extract_purchase_order],\n    tool_choice={\"type\": \"any\"},\n    messages=[{\"role\": \"user\", \"content\": document_text}],\n)\n```",
    keyConcept: "tool_choice \"any\" guarantees a tool call while the model chooses which tool",
    sources: [
      { title: "Define tools (Claude API docs)", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools" },
      { title: "CCAR-F Exam Guide v1.0 — Task 2.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E2-006",
    scenario: "Multi-Agent Research System",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.1",
    difficulty: "advanced",
    question:
      "A teammate added \"Always check the source for every statistic\" to the synthesis agent's system prompt. Since then the agent calls `fetch_source_document` (description: \"Downloads the full text of a source by URL; use only when a finding lacks a citation or a quote must be checked against the original\") for every number in the findings, although each finding already carries its citation and quote. Latency has tripled. What should you change?",
    options: [
      { id: "A", text: "Rename `fetch_source_document` to `download_full_text`, so the word \"source\" in the prompt no longer matches the tool's name." },
      { id: "B", text: "Remove `fetch_source_document` from the synthesis agent and send every source check back through the coordinator and search agent." },
      { id: "C", text: "Set `tool_choice: {\"type\": \"none\"}` on the synthesis agent's requests, so it can't call any tool while it combines the findings." },
      { id: "D", text: "Reword the prompt line so each statistic keeps the citation from its finding, and fetch only when a finding has no citation." },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct. The tool description already states when to fetch; the new system prompt line is a keyword-sensitive instruction (\"check the source\") that overrides it. Rewriting the instruction around the actual requirement, that every statistic keeps its citation, removes the unintended association with the fetch tool.\n\nA treats a matching word as the cause and hides it, leaving a vague instruction that can attach to some other tool. B removes a tool the agent legitimately needs for findings without citations and adds coordinator round trips. C blocks the legitimate fetches as well.\n\nHow to implement:\n```text\n# BEFORE\nAlways check the source for every statistic.\n\n# AFTER\nEvery statistic in the report must keep the citation and quote from its finding.\nCall fetch_source_document only if a finding has no citation or its quote\nlooks inconsistent with the claim.\n```",
    keyConcept: "Reviewing system prompts for keyword-sensitive instructions that override tool descriptions",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 2.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Define tools (Claude API docs)", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools" },
    ],
  },
  {
    id: "E2-007",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "intermediate",
    question:
      "Your team connected a `code_intel` MCP server whose `find_references` tool resolves a symbol across 40 repositories using a prebuilt call graph, including calls made through dependency injection. Its description is \"Finds references.\" Traces show the agent almost always uses Grep instead and misses callers in the other repositories. What change makes the agent use the MCP tool when it should?",
    options: [
      { id: "A", text: "Remove Grep from the agent's tool list, so that `find_references` becomes the only search option for every kind of code lookup." },
      { id: "B", text: "Expand the description to explain that it resolves symbols across all 40 repos, including injected calls, and what it returns." },
      { id: "C", text: "Add a system prompt sentence telling the agent to \"prefer MCP tools over built-in tools whenever both of them might be able to help.\"" },
      { id: "D", text: "Rename the tool to `grep_all_repos`, so the agent links it with the familiar Grep behavior it already prefers for code lookups." },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct. With a two-word description, the agent has no reason to think the MCP tool can do more than Grep. Describing its capabilities and outputs in detail (cross-repository resolution, injected calls, what each result contains) lets the agent see when it is the better tool.\n\nA removes the right tool for plain text searches, such as error messages or config keys. C is a blanket rule that will pick MCP tools even where a built-in is better. D gives the tool a misleading name: it doesn't do text matching, so the agent would use it for the wrong jobs.\n\nHow to implement:\n```typescript\n{\n  name: \"find_references\",\n  description: \"Finds every caller of a function, class or method across all 40 company \" +\n    \"repositories using a prebuilt call graph, including calls through dependency \" +\n    \"injection and re-exports that text search misses. Input: a fully qualified symbol. \" +\n    \"Returns repo, file, line and the calling symbol for each reference. Use Grep instead \" +\n    \"for plain text such as log messages or config keys.\",\n}\n```",
    keyConcept: "Detailed MCP tool descriptions keep the agent from defaulting to built-in tools",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 2.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Connect Claude Code to tools via MCP", url: "https://code.claude.com/docs/en/mcp" },
    ],
  },
  {
    id: "E2-008",
    scenario: "Multi-Agent Research System",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.3",
    difficulty: "intermediate",
    question:
      "The document-analysis subagent has a generic `fetch_url(url)` tool so it can load the papers the search agent found. Audits show it sometimes fetches arbitrary web pages mentioned inside those papers, pulling unvetted content into the analysis, and once it tried to fetch an internal admin URL that appeared in a document. What is the best change to the subagent's tooling?",
    options: [
      { id: "A", text: "Keep `fetch_url`, and add a system prompt rule telling the subagent to fetch only documents that the coordinator explicitly assigned." },
      { id: "B", text: "Remove all fetching from the subagent and have the coordinator paste the full text of every assigned paper into the subagent's prompt." },
      { id: "C", text: "Replace `fetch_url` with a `load_document` tool that accepts only document IDs or URLs from approved sources and rejects the rest." },
      { id: "D", text: "Keep `fetch_url` but log every request, then review the logs each week to find misuse and adjust the subagent's instructions." },
    ],
    correctAnswer: "C",
    explanation:
      "C is correct. Replacing a generic tool with a constrained one that validates its input enforces the subagent's role in code: it can load the documents it is meant to analyze and nothing else, which also blocks the internal URL.\n\nA depends on prompt compliance, and the content being read (URLs inside papers) is exactly what pulls the model off course. B overloads the coordinator and the subagent's context with full texts, and loses on-demand loading. D detects misuse a week after it has already happened.\n\nHow to implement:\n```typescript\nconst APPROVED = [/^https:\\/\\/arxiv\\.org\\//, /^https:\\/\\/doi\\.org\\//, /^archive:\\/\\//];\n\nasync function loadDocument({ ref }: { ref: string }) {\n  if (!APPROVED.some(rx => rx.test(ref))) {\n    return { isError: true, content: [{ type: \"text\", text: JSON.stringify({\n      errorCategory: \"validation\", isRetryable: false,\n      message: \"Only approved document sources can be loaded.\" }) }] };\n  }\n  return { content: [{ type: \"text\", text: await fetchDocument(ref) }] };\n}\n```",
    keyConcept: "Replacing generic tools with constrained alternatives",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 2.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Writing effective tools for agents (Anthropic Engineering)", url: "https://www.anthropic.com/research/writing-tools-for-agents" },
    ],
  },
  {
    id: "E2-009",
    scenario: "Code Generation with Claude Code",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.3",
    difficulty: "intermediate",
    question:
      "You defined a Claude Code subagent in `.claude/agents/security-reviewer.md` to review diffs and report findings, and you left out the `tools` field. In two sessions the reviewer \"fixed\" the issues it found by editing files, and once it ran a migration script through Bash. Its job is only to read and search code. What is the right fix?",
    options: [
      { id: "A", text: "Add `tools: Read, Grep, Glob` to its frontmatter so it can only read and search, and no longer inherits edit or shell tools." },
      { id: "B", text: "Add a sentence to the subagent's prompt saying \"You are a reviewer; never edit files or run commands\", and keep inheriting all tools." },
      { id: "C", text: "Add `disallowedTools: Write` to the subagent's frontmatter, so the reviewer can no longer create or overwrite files during a review." },
      { id: "D", text: "Move the reviewer's instructions into the main CLAUDE.md, so the main agent does reviews itself and the subagent is no longer needed." },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct. When `tools` is omitted, a subagent inherits every tool available to subagents, including Edit, Write and Bash. Listing only Read, Grep and Glob restricts it to what its role needs and prevents the misuse in the first place.\n\nB relies on prompt compliance, which is the mechanism that already failed. C removes Write but leaves Edit and Bash, the two tools it actually misused. D gives up the subagent's isolated context and specialization, and the main agent has every tool anyway.\n\nHow to implement:\n```markdown\n---\nname: security-reviewer\ndescription: Reviews diffs for security issues and reports findings. Never modifies code.\ntools: Read, Grep, Glob\n---\nYou review the changes you are given and report each finding with file, line and severity.\n```",
    keyConcept: "Restricting a subagent's tool set to its role",
    sources: [
      { title: "Create custom subagents (Claude Code)", url: "https://code.claude.com/docs/en/sub-agents" },
      { title: "CCAR-F Exam Guide v1.0 — Task 2.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E2-010",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "intermediate",
    question:
      "Security requires every developer's Claude Code to connect to exactly the company-approved set of MCP servers, including a mandatory secrets-scanning server, and developers must not be able to add others. All machines are managed macOS laptops. A colleague proposes writing this requirement into the managed CLAUDE.md at `/Library/Application Support/ClaudeCode/CLAUDE.md`. What should you do instead?",
    options: [
      { id: "A", text: "Deploy `/Library/Application Support/ClaudeCode/managed-mcp.json` with the approved servers, giving that file exclusive control of MCP." },
      { id: "B", text: "Keep the managed CLAUDE.md but write the rule in capital letters, telling Claude to connect only to the approved servers listed there." },
      { id: "C", text: "Commit the approved servers to each repository's `.mcp.json`, so they load automatically for every developer who clones a company repo." },
      { id: "D", text: "Push the approved servers into each developer's `~/.claude.json` with an onboarding script that IT re-runs on every laptop each month." },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct. `managed-mcp.json` deploys a fixed set of MCP servers with exclusive control: Claude Code loads the servers in that file, and `claude mcp add` fails with an enterprise-policy error. CLAUDE.md, managed or not, only provides instructions and context; it doesn't configure or block MCP connections.\n\nB is the same misconception with more emphasis. C works per repository, does nothing outside company repos, and doesn't stop developers from adding their own servers. D writes to a user-editable file, so developers can change it between runs. If developers should keep their own servers and receive the company ones in addition, the docs point to the `managedMcpServers` managed setting instead, with `allowedMcpServers` and `deniedMcpServers` for filtering.\n\nHow to implement:\n```text\n# Deployed by MDM to /Library/Application Support/ClaudeCode/managed-mcp.json\n{\n  \"mcpServers\": {\n    \"secrets-scanner\": { \"type\": \"http\", \"url\": \"https://scanner.internal.example.com/mcp\" },\n    \"tickets\": { \"type\": \"http\", \"url\": \"https://tickets.internal.example.com/mcp\" }\n  }\n}\n\n# Check on a developer machine\nclaude mcp list    # shows only the managed servers\n```",
    keyConcept: "managed-mcp.json enforces MCP servers; CLAUDE.md only carries instructions",
    sources: [
      { title: "Control MCP server access for your organization", url: "https://code.claude.com/docs/en/managed-mcp" },
      { title: "How Claude remembers your project (CLAUDE.md)", url: "https://code.claude.com/docs/en/memory" },
      { title: "Connect Claude Code to tools via MCP", url: "https://code.claude.com/docs/en/mcp" },
    ],
  },
  {
    id: "E2-011",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.2",
    difficulty: "intermediate",
    question:
      "Your agent uses a `deploy_preview` MCP tool. When the service account lacks access to a repository, the tool returns `isError: true` with \"Request failed, please try again.\" The agent does as told and retries up to its limit of 8 attempts on each such repository, burning several minutes per task before it gives up. What should the tool return for this case?",
    options: [
      { id: "A", text: "The same message, plus a server-side retry loop with exponential backoff, so the agent only sees the failure once the retries run out." },
      { id: "B", text: "`isError: false` with an empty list of deployments, so the agent treats the repository as having nothing to deploy and simply moves on." },
      { id: "C", text: "`isError: true` with `errorCategory: \"transient\"` and a `retryAfterSeconds` hint, so that the agent's retries are at least spaced out." },
      { id: "D", text: "`isError: true`, `errorCategory: \"permission\"`, `isRetryable: false`, and a description of the missing access and who can grant it." },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct. A missing permission won't fix itself, so retrying wastes time. Structured metadata that labels it a non-retryable permission error, with a human-readable description of what access is missing, lets the agent stop at once and report or escalate.\n\nA hides the same uninformative error behind slower server-side retries. B disguises a failure as a valid empty result, so the task silently skips the repository. C mislabels the error as transient, and the agent keeps retrying, just more slowly.\n\nHow to implement:\n```typescript\nif (res.status === 403) {\n  return { isError: true, content: [{ type: \"text\", text: JSON.stringify({\n    errorCategory: \"permission\", isRetryable: false,\n    message: `Service account lacks deploy access to ${repo}. A repo admin must grant the 'preview-deployer' role.`,\n  }) }] };\n}\n```",
    keyConcept: "Retryable vs non-retryable errors: structured metadata prevents wasted retries",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 2.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "MCP specification — Tools (error handling)", url: "https://modelcontextprotocol.io/specification/2026-07-28/server/tools" },
    ],
  },
  {
    id: "E2-012",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.5",
    difficulty: "advanced",
    question:
      "Before changing the signature of `formatCurrency`, the agent must find every caller. A Grep for `formatCurrency(` returns only 3 call sites, but QA says the function is used on dozens of screens. Investigation shows that `utils/money.ts` re-exports it as `fmtMoney`, and `ui/index.ts` re-exports it inside a `Money` object as `Money.format`. How should the agent find all usages?",
    options: [
      { id: "A", text: "Read every file in the `ui/` and `utils/` directories from start to end, and list each place where currency formatting seems to happen." },
      { id: "B", text: "Glob for `**/*money*` and `**/*currency*`, and treat every file whose name matches one of those patterns as a caller of the function." },
      { id: "C", text: "Repeat the Grep for `formatCurrency(` with case-insensitive and multiline matching turned on, so that it also catches the other forms." },
      { id: "D", text: "Find every name the function is exported under, including `fmtMoney` and `Money.format`, then Grep for each name across the codebase." },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct. To trace a function through wrapper modules, first identify every exported name it travels under, then search the codebase for each of those names. That catches the callers that a search for the original name can't see.\n\nA reads whole directories upfront, spends context, and still misses callers outside those two folders. B finds files by name, which says nothing about whether they call the function. C still searches for the original name, which the aliased callers never use.\n\nHow to implement:\n```text\n1. Grep  \"formatCurrency\"  output_mode=content   -> find re-exports and aliases\n2. Read  utils/money.ts, ui/index.ts            -> confirm fmtMoney, Money.format\n3. Grep  \"formatCurrency\\(|fmtMoney\\(|Money\\.format\\(\"  output_mode=files_with_matches\n```",
    keyConcept: "Tracing usage across wrapper modules: collect exported names, then Grep each",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 2.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Claude Code tools reference", url: "https://code.claude.com/docs/en/tools-reference" },
    ],
  },
  {
    id: "E2-013",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "intermediate",
    question:
      "Your team wants Claude Code to work with Jira and with an internal service catalog that lists 400 services and their owners. One engineer also wants to try an experimental vector-search MCP server. Today, engineers see the agent make dozens of exploratory calls just to learn which services exist before it can answer. Which two choices are right? (Select two.)",
    options: [
      { id: "A", text: "Build a custom Jira MCP server in-house, because community servers cannot be configured in a project's .mcp.json file" },
      { id: "B", text: "Expose the service catalog as an MCP resource, so the agent can see which services exist without exploratory tool calls" },
      { id: "C", text: "Add the experimental vector-search server to the project .mcp.json, so the whole team can help test it right away" },
      { id: "D", text: "Use an existing community Jira MCP server in the project .mcp.json, with its API token referenced as ${JIRA_TOKEN}" },
    ],
    correctAnswer: "BD",
    explanation:
      "Option B is right because the guide describes MCP resources as the way to expose content catalogs, such as issue summaries, documentation hierarchies or database schemas, so the agent sees what data exists without exploratory tool calls.\n\nOption D is right because the guide recommends existing community MCP servers for standard integrations like Jira, reserving custom servers for team-specific workflows. A shared server belongs in the project-scoped .mcp.json, and environment variable expansion keeps the token out of version control.\n\nOption A is wrong because its premise is false: any MCP server, community or custom, can be configured in .mcp.json. Building a custom Jira server adds maintenance with no benefit for a standard integration.\n\nOption C is wrong because personal or experimental servers belong in user scope (~/.claude.json). Putting one in the committed project file pushes an untested server onto every teammate.",
    keyConcept: "Use community servers for standard integrations in project .mcp.json with ${VAR} credentials, keep experiments in user scope, and expose catalogs as MCP resources.",
    sources: [
      { title: "Connect Claude Code to tools via MCP", url: "https://code.claude.com/docs/en/mcp" },
    ],
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
      "Two developers on the same commit see different behavior: in Ana's sessions Claude always runs `make lint` before committing; in Ben's it never does. Both have clean working trees, and the repository's CLAUDE.md never mentions linting. Ben runs `/memory` and sees only the project CLAUDE.md and his own empty user file. What is the most likely cause, and the fix that works for the whole team?",
    options: [
      { id: "A", text: "The lint rule is in Ana's `~/.claude/CLAUDE.md`; move it into the committed project CLAUDE.md" },
      { id: "B", text: "Ben's session is using a cached copy of CLAUDE.md; clear the cache and restart so it reloads" },
      { id: "C", text: "The rule is missing from Ben's user file; copy it into his `~/.claude/CLAUDE.md` so both match" },
      { id: "D", text: "Ana's project CLAUDE.md differs from Ben's; Ben must pull so he receives the same project file" },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct: the repository file is identical for both developers, so the extra instruction must come from a level that only Ana loads. User-level instructions in `~/.claude/CLAUDE.md` are not shared through version control; running `/memory` in Ana's session would list that file. Moving the rule into the project CLAUDE.md gives it to everyone. B describes a cache that does not exist: CLAUDE.md is read from disk. C fixes Ben's machine only; the next teammate has the same problem. D is ruled out by the stem: both are on the same commit with clean working trees.\n\nHow to implement:\n```markdown\n<!-- CLAUDE.md at the repository root (committed) -->\n## Before committing\n- Run `make lint` and fix every error before creating a commit\n```",
    keyConcept: "Diagnose hierarchy issues with /memory: user-level instructions are not shared with teammates",
    sources: [
      { title: "Claude Code docs — How Claude remembers your project (CLAUDE.md, imports, rules)", url: "https://code.claude.com/docs/en/memory" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E3-002",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.1",
    difficulty: "basic",
    question:
      "A 450-line project CLAUDE.md mixes testing, API, security and deployment guidance. Four different leads own those topics, and their edits collide in the same file nearly every release. They want each topic maintained in its own file while Claude keeps loading all of it as project instructions in every session. What is the recommended structure?",
    options: [
      { id: "A", text: "Split it into four CLAUDE.md files placed in `tests/`, `api/`, `security/` and `deploy/`" },
      { id: "B", text: "Split it into topic files in `.claude/rules/`, such as `testing.md` and `api-conventions.md`" },
      { id: "C", text: "Move each lead's section into that lead's own `~/.claude/CLAUDE.md` so their edits never collide" },
      { id: "D", text: "Keep one file and add a CODEOWNERS rule so only one lead at a time can edit the CLAUDE.md" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct: `.claude/rules/` is the documented way to split a monolithic CLAUDE.md into focused topic files. Rule files without a `paths` field load at launch like CLAUDE.md, so Claude keeps all the guidance, and each lead edits a separate file. A changes behavior: subdirectory CLAUDE.md files load only when Claude works with files in those folders, so security or deployment rules would vanish from most sessions. C removes the guidance from the shared project; teammates would no longer receive it. D keeps the collisions, just serialized, and the file stays monolithic.\n\nHow to implement:\n```text\n.claude/\n  CLAUDE.md            # short: build commands, project overview\n  rules/\n    testing.md\n    api-conventions.md\n    security.md\n    deployment.md\n```",
    keyConcept: "Split a large CLAUDE.md into topic files in .claude/rules/",
    sources: [
      { title: "Claude Code docs — How Claude remembers your project (CLAUDE.md, imports, rules)", url: "https://code.claude.com/docs/en/memory" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E3-003",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.2",
    difficulty: "intermediate",
    question:
      "Your team's `/scaffold-endpoint` skill needs a resource name and an HTTP method. Developers often type `/scaffold-endpoint` with nothing after it, and Claude then guesses a resource name from whatever file is open. You want developers to be shown which parameters the skill expects when they invoke it. What should you add?",
    options: [
      { id: "A", text: "A `context: fork` line so the skill runs in a subagent that asks for the missing values" },
      { id: "B", text: "An `argument-hint: [resource] [method]` line in the skill's SKILL.md frontmatter" },
      { id: "C", text: "A line in the project CLAUDE.md listing the arguments that each skill expects to receive" },
      { id: "D", text: "A `disable-model-invocation: true` line so only developers can start it, with arguments" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct: `argument-hint` in SKILL.md frontmatter tells developers which parameters the skill expects when they invoke it. A isolates the skill's context but does not tell anyone what to pass. C loads a list into every session and does nothing at invocation time. D controls who can invoke the skill (only the user, not Claude on its own) but says nothing about its parameters. Product note: the current docs describe `argument-hint` as the hint shown during autocomplete, so also tell the skill to stop and ask when `$ARGUMENTS` is empty.\n\nHow to implement:\n```markdown\n---\nname: scaffold-endpoint\ndescription: Scaffold a REST endpoint with handler, schema and tests\nargument-hint: [resource] [method]\n---\nIf $ARGUMENTS is empty, ask for the resource name and HTTP method before doing anything.\nScaffold the endpoint for: $ARGUMENTS\n```",
    keyConcept: "argument-hint frontmatter shows developers the parameters a skill needs",
    sources: [
      { title: "Claude Code docs — Skills", url: "https://code.claude.com/docs/en/skills" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E3-004",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.4",
    difficulty: "advanced",
    question:
      "Product asks for real-time order updates in the mobile app. The backend could push them over WebSockets, which needs a new connection gateway and sticky sessions, or through a managed pub/sub service, which means a new vendor with different authentication. Either way the change touches the API layer, the mobile client and the deployment config. How should you start with Claude Code?",
    options: [
      { id: "A", text: "Use direct execution with WebSockets, since it is the more common choice, and adjust later" },
      { id: "B", text: "Use direct execution, telling Claude to stop and ask whenever it reaches an infrastructure choice" },
      { id: "C", text: "Have Claude prototype both options directly on the main branch and keep the faster one" },
      { id: "D", text: "Use plan mode to explore the code and compare both approaches before any file is edited" },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct: two valid approaches with different infrastructure requirements, across several layers, is exactly the kind of architectural decision plan mode is for. Claude explores the code read-only and lays out the trade-offs before anything changes. A commits to an approach before comparing them, risking a costly rewrite. B starts editing before the decision is made, so work already done may have to be discarded. C writes two half-built implementations into the main branch to settle a question that analysis can answer first.\n\nHow to implement:\n```bash\nclaude --permission-mode plan\n# > Compare a WebSocket gateway vs managed pub/sub for real-time order updates.\n# > For each: files and services touched, infra and auth changes, risks. Recommend one.\n```",
    keyConcept: "Plan mode for choosing between approaches with different infrastructure requirements",
    sources: [
      { title: "Claude Code docs — Permission modes (plan mode)", url: "https://code.claude.com/docs/en/permission-modes" },
      { title: "Claude Code docs — Common workflows (plan mode, subagents)", url: "https://code.claude.com/docs/en/common-workflows" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E3-005",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.5",
    difficulty: "intermediate",
    question:
      "A developer new to caching must add a read-through cache in front of a slow pricing service. Their prompt is one line: 'add caching to getPrice'. You suspect there are decisions they have not considered, such as invalidation when prices change and what happens when the cache is down. What should they do before Claude writes any code?",
    options: [
      { id: "A", text: "Ask Claude to interview them about the design until it could write a spec, then build" },
      { id: "B", text: "Ask Claude to implement the most common caching approach and review the diff afterward" },
      { id: "C", text: "Add a CLAUDE.md line saying 'consider cache invalidation' so it applies in all sessions" },
      { id: "D", text: "Have Claude write the code and a test suite at once, and treat passing tests as proof" },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct: the interview pattern has Claude ask questions that surface considerations the developer has not anticipated, such as invalidation strategy, TTLs and failure modes, before anything is implemented in an unfamiliar domain. B bakes in defaults the developer never chose, and a diff review cannot show the decisions that were silently made. C adds an always-loaded line for one task and names only one of the open questions. D cannot help: tests written from the same unexamined assumptions will pass and prove nothing about the missing decisions.\n\nHow to implement:\n```text\nI need a read-through cache in front of getPrice() but haven't designed it.\nInterview me until you could write the spec (invalidation, TTL, behavior when\nthe cache is down, consistency needs), then write it to SPEC.md. Don't write code yet.\n```",
    keyConcept: "Interview pattern: have Claude ask design questions before implementing in an unfamiliar domain",
    sources: [
      { title: "Claude Code docs — Best practices", url: "https://code.claude.com/docs/en/best-practices" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E3-006",
    scenario: "Claude Code for Continuous Integration",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.6",
    difficulty: "intermediate",
    question:
      "Your pull request review job runs `claude -p \"Review this diff\" --output-format json`, and a script reads the `result` field to post inline comments. About one run in ten breaks the script because the review text changes shape, sometimes a list and sometimes paragraphs. Every run must yield findings with file, line, severity and message. What change fixes this?",
    options: [
      { id: "A", text: "Add 'always answer as a JSON array' to the prompt and parse `result` with a lenient parser" },
      { id: "B", text: "Add `--json-schema` with a findings schema and read the `structured_output` field instead" },
      { id: "C", text: "Switch to `--output-format stream-json` and assemble the findings from the event stream" },
      { id: "D", text: "Run a regex over `result` for file:line patterns and drop every line that doesn't match" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct: `--output-format json` only wraps Claude's free text in a JSON envelope (`result`, session ID, metadata). Adding `--json-schema` makes Claude return output that conforms to the schema, in the `structured_output` field, which the script can post as inline comments. A still depends on the model following an instruction, so some runs will still break. C changes how output is delivered (newline-delimited events), not the shape of the review. D guesses structure from free text and silently loses findings. The docs add that `structured_output` is absent if the run ends without valid output, so check for it.\n\nHow to implement:\n```bash\ngh pr diff \"$PR\" | claude -p \"Review this diff for bugs and security issues\" \\\n  --output-format json \\\n  --json-schema '{\"type\":\"object\",\"properties\":{\"findings\":{\"type\":\"array\",\"items\":{\"type\":\"object\",\"properties\":{\"file\":{\"type\":\"string\"},\"line\":{\"type\":\"integer\"},\"severity\":{\"type\":\"string\",\"enum\":[\"high\",\"medium\",\"low\"]},\"message\":{\"type\":\"string\"}},\"required\":[\"file\",\"line\",\"severity\",\"message\"]}}},\"required\":[\"findings\"]}' \\\n  | jq '.structured_output.findings'\n```",
    keyConcept: "--output-format json with --json-schema yields machine-parseable findings in structured_output",
    sources: [
      { title: "Claude Code docs — Run Claude Code programmatically (-p)", url: "https://code.claude.com/docs/en/headless" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.6", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E3-007",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.5",
    difficulty: "advanced",
    question:
      "After Claude refactors a checkout module you find three problems: the new discount function rounds before tax is applied, the tax function now assumes its input is already rounded, and the order summary shows values from both. Fixing any one of them changes what the other two should do. How should you give Claude this feedback?",
    options: [
      { id: "A", text: "Describe all three problems and how they interact in one message so they are fixed together" },
      { id: "B", text: "Report the rounding problem first, wait for its fix, then report tax, then the order summary" },
      { id: "C", text: "Open three new sessions, one per problem, so each fix gets a clean and focused context" },
      { id: "D", text: "Revert the refactor and have Claude redo it from scratch using the same original prompt" },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct: when fixes interact, giving every issue and the relationship between them in one detailed message lets Claude design a consistent fix, for example deciding once where rounding happens. B is the right pattern for independent problems; here each sequential fix would be built on assumptions the next fix changes, causing churn. C is worse still: three isolated sessions cannot see each other's changes, so their fixes will conflict. D repeats the same prompt, which is likely to reproduce the same design and discards the useful parts of the refactor.\n\nHow to implement:\n```text\nThree linked problems in the checkout refactor; fix them together:\n1. applyDiscount() rounds before tax; rounding must happen once, after tax.\n2. computeTax() now assumes rounded input; it must accept unrounded amounts.\n3. OrderSummary shows both values; it should show only the final rounded total.\nAdd a test covering a discounted, taxed order with fractional cents.\n```",
    keyConcept: "Send interacting issues in one detailed message; iterate sequentially only for independent issues",
    sources: [
      { title: "Claude Code docs — Best practices", url: "https://code.claude.com/docs/en/best-practices" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E3-008",
    scenario: "Claude Code for Continuous Integration",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.6",
    difficulty: "intermediate",
    question:
      "A CI step asks Claude Code to generate tests for each pull request. Reviewers reject most of them: they assert getters and constants, build their own database mocks even though the repository has shared fixtures in `tests/fixtures/`, and ignore the team rule that every bug fix needs a regression test. The prompt is 'write tests for the changed files'. What change most improves the output across all pull requests?",
    options: [
      { id: "A", text: "Generate twice as many tests per pull request and let reviewers keep the useful ones" },
      { id: "B", text: "Add a per-run instruction to the CI prompt saying 'write high-value tests only'" },
      { id: "C", text: "Document the test standards, what makes a test valuable, and the fixtures in CLAUDE.md" },
      { id: "D", text: "Run the test generator on a higher-tier model so it can infer the team's preferences" },
    ],
    correctAnswer: "C",
    explanation:
      "C is correct: CLAUDE.md is how CI-invoked Claude Code receives project context. Writing down the testing standards, which tests the team values (such as regression tests for bug fixes) and which fixtures exist gives every run the knowledge it was missing. A multiplies low-value output and the reviewers' workload. B is a vague instruction that does not say what 'high-value' means or that fixtures exist. D cannot infer conventions that are not written anywhere it can see. Product note: `claude -p` loads CLAUDE.md by default, but `--bare` skips it, so do not run this step in bare mode.\n\nHow to implement:\n```markdown\n<!-- CLAUDE.md -->\n## Testing standards\n- Every bug fix includes a regression test that fails before the fix\n- Do not test trivial getters, setters or constants\n- Use the shared fixtures in tests/fixtures/ (db.ts, users.ts); never hand-roll DB mocks\n- Test behavior through public APIs, including error paths\n```",
    keyConcept: "CLAUDE.md gives CI-invoked Claude Code the testing standards and fixtures it needs",
    sources: [
      { title: "Claude Code docs — How Claude remembers your project (CLAUDE.md, imports, rules)", url: "https://code.claude.com/docs/en/memory" },
      { title: "Claude Code docs — Run Claude Code programmatically (-p)", url: "https://code.claude.com/docs/en/headless" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.6", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E3-009",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.4",
    difficulty: "intermediate",
    question:
      "You are planning a change to how a legacy system handles user sessions. Discovery means reading dozens of files across three services. In an earlier attempt, raw file contents filled the session, and by the implementation phase Claude had lost track of decisions made at the start. How should you run the discovery phase this time?",
    options: [
      { id: "A", text: "Delegate discovery to the Explore subagent so only a summary comes back to the main session" },
      { id: "B", text: "Paste the relevant files into the main session yourself so Claude reads them all in one place" },
      { id: "C", text: "Run discovery in direct execution, then use `/compact` after it finishes reading everything" },
      { id: "D", text: "Skip the discovery and rely on a CLAUDE.md architecture section to describe the services" },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct: the Explore subagent reads files in its own context and returns a summary, so the verbose discovery output never crowds out the decisions in the main conversation. B puts the same raw content into the main session, which is what failed before. C lets the context fill first and then relies on a lossy summary of everything, including the early decisions. D trusts a description that may be outdated for a legacy system and skips the investigation the change needs. Product note: the current docs say context exhaustion is rarer with 1M-token windows, but they still recommend subagents to keep noisy exploration out of the main conversation.\n\nHow to implement:\n```text\nUse the Explore subagent (very thorough) to find how sessions are created,\nrefreshed and invalidated across auth-service, gateway and web-app. Return\na summary: files involved, data flow, and anything surprising. No edits.\n```",
    keyConcept: "Explore subagent isolates verbose discovery and returns a summary to the main conversation",
    sources: [
      { title: "Claude Code docs — Subagents (Explore, Plan)", url: "https://code.claude.com/docs/en/sub-agents" },
      { title: "Claude Code docs — Common workflows (plan mode, subagents)", url: "https://code.claude.com/docs/en/common-workflows" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E3-010",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.3",
    difficulty: "advanced",
    question:
      "`.claude/rules/api.md` begins with the frontmatter `paths: [\"src/api/*.ts\"]`. Claude applies the rules when editing `src/api/router.ts` but ignores them when editing `src/api/v2/orders.ts` and `src/api/v2/users.ts`. What are the cause and the fix?",
    options: [
      { id: "A", text: "Path rules load only at startup; restart the session after opening a file under `src/api/v2/`" },
      { id: "B", text: "`*` matches a single directory level; change the pattern to `src/api/**/*.ts` for subfolders" },
      { id: "C", text: "Rules can't match nested folders; add a CLAUDE.md inside `src/api/v2/` with the same rules" },
      { id: "D", text: "The glob must be absolute; change it to the full path of `src/api` on each developer machine" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct: in a `paths` glob, `src/api/*.ts` matches only files directly inside `src/api/`; `**` is needed to match files in subfolders. A is wrong because path-scoped rules load during the session, when Claude reads or edits a matching file. C is wrong because globs with `**` match nested folders, which is the main advantage of rules over per-directory CLAUDE.md files. D is wrong because patterns are relative to the project directory that contains `.claude/`; absolute paths would break on every other machine.\n\nHow to implement:\n```markdown\n---\npaths:\n  - \"src/api/**/*.ts\"\n---\n# API rules\n- Validate every request body with the shared schema helper\n```",
    keyConcept: "Glob patterns in paths: * stays in one directory, ** spans subdirectories",
    sources: [
      { title: "Claude Code docs — How Claude remembers your project (CLAUDE.md, imports, rules)", url: "https://code.claude.com/docs/en/memory" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E3-011",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.2",
    difficulty: "advanced",
    question:
      "Your `/map-dependencies` skill walks the whole repository and prints hundreds of lines of import graphs before giving a ten-line summary. Developers run it in the middle of a task, and afterward their session is cluttered and harder to steer. They need only the summary in the main conversation. Which frontmatter change fits best?",
    options: [
      { id: "A", text: "Set `disable-model-invocation: true` so the skill runs only when a developer types its name" },
      { id: "B", text: "Set `allowed-tools: Read Grep Glob` so the skill cannot write anything while it runs" },
      { id: "C", text: "Set `context: fork` so the skill runs in an isolated subagent and returns only its result" },
      { id: "D", text: "Set `user-invocable: false` so Claude runs it on its own instead of the developer" },
    ],
    correctAnswer: "C",
    explanation:
      "C is correct: `context: fork` runs the skill in an isolated subagent. The verbose graph output stays in that context, and only the result returns to the main conversation. A changes who can trigger the skill; the output would still land in the main session. B pre-approves read-only tools; it does nothing about where the output goes. D hides the skill from the `/` menu so only Claude can invoke it, and the output still enters the conversation. Product note: the docs point out that a forked skill does not see the conversation history, so its prompt must be self-contained.\n\nHow to implement:\n```markdown\n---\nname: map-dependencies\ndescription: Map module dependencies and summarize hotspots\ncontext: fork\nagent: Explore\n---\nBuild the import graph for the repository. Return only a summary of at most\n10 lines: cycles, most-imported modules, and suspicious cross-layer imports.\n```",
    keyConcept: "context: fork runs verbose skills in an isolated subagent so only the result reaches the main session",
    sources: [
      { title: "Claude Code docs — Skills", url: "https://code.claude.com/docs/en/skills" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E3-012",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.3",
    difficulty: "intermediate",
    question:
      "A teammate added `.claude/rules/graphql.yaml`, which starts with frontmatter between `---` markers containing `paths: [\"**/*.graphql\"]`, followed by the schema conventions. Weeks later, Claude still ignores those conventions when editing `.graphql` files anywhere in the repository, and the file never appears among the loaded rules. What is the fix?",
    options: [
      { id: "A", text: "Rename the `paths` key to `globs`, because `paths` only accepts directories, not file types" },
      { id: "B", text: "Import the file with `@.claude/rules/graphql.yaml` from the root CLAUDE.md so it is loaded" },
      { id: "C", text: "Rename it to `graphql.md`, keeping its frontmatter, because rule files must be Markdown" },
      { id: "D", text: "Place a CLAUDE.md beside each `.graphql` file, since rules cannot match by file extension" },
    ],
    correctAnswer: "C",
    explanation:
      "C is correct: Claude Code discovers only `.md` files in `.claude/rules/`. The frontmatter and the `**/*.graphql` glob are already right; the file is simply never read because of its extension. A is wrong: `paths` is the field rules use, and it accepts extension globs such as `**/*.ts`. B would load the text at launch in every session, whatever file is being edited, so the conventions would no longer be path-scoped. D is wrong on the facts and would scatter copies across the repository.\n\nHow to implement:\n```bash\ngit mv .claude/rules/graphql.yaml .claude/rules/graphql.md\n```\n```markdown\n---\npaths:\n  - \"**/*.graphql\"\n---\n# GraphQL schema conventions\n- Types are PascalCase; fields are camelCase\n```",
    keyConcept: "Rules in .claude/rules/ are Markdown files with YAML frontmatter; paths globs scope them",
    sources: [
      { title: "Claude Code docs — How Claude remembers your project (CLAUDE.md, imports, rules)", url: "https://code.claude.com/docs/en/memory" },
      { title: "CCAR-F Exam Guide v1.0 — Task 3.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E3-013",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.2",
    difficulty: "intermediate",
    question:
      "You are writing a `/release-notes` skill for your team. It must be available to everyone who clones the repository; it reads hundreds of commits, producing verbose output you do not want in the main conversation; and it must not run shell commands, only read files and write NOTES.md. Which two configuration choices meet these requirements? (Select two.)",
    options: [
      { id: "A", text: "Commit it as .claude/skills/release-notes/SKILL.md in the repository, with context: fork in its frontmatter" },
      { id: "B", text: "Save it in ~/.claude/skills/release-notes/ so that every teammate picks it up when they open the project" },
      { id: "C", text: "Write the procedure into the root CLAUDE.md so it is always loaded and ready whenever someone asks for notes" },
      { id: "D", text: "Set allowed-tools in the skill frontmatter to Read, Grep, Glob and Write, leaving Bash out of the allowed set" },
    ],
    correctAnswer: "AD",
    explanation:
      "Option A is right on two counts. Project skills in .claude/skills/ are shared through version control, so every clone gets the skill. The context: fork frontmatter runs the skill in an isolated sub-agent context, so the verbose commit analysis does not pollute the main conversation.\n\nOption D is right because the guide describes allowed-tools in skill frontmatter as the way to restrict tool access while the skill runs, for example limiting it to read and write operations so it cannot run destructive commands.\n\nOption B is wrong because ~/.claude/skills/ is personal scope. It exists only on the author's machine; teammates never receive it.\n\nOption C is wrong because CLAUDE.md is for always-loaded, universal standards. An on-demand, task-specific workflow belongs in a skill; putting it in CLAUDE.md spends context in every session and still gives neither isolation nor tool restrictions.\n\nProduct note: in current Claude Code, `allowed-tools` pre-approves the listed tools so they run without a permission prompt; to block a tool outright, use permission deny rules. The exam guide treats it as a restriction, and this item follows the guide.",
    keyConcept: "Project skills in .claude/skills/ are shared via git; context: fork isolates verbose output and allowed-tools restricts what the skill can use.",
    sources: [
      { title: "Claude Code docs — Skills", url: "https://code.claude.com/docs/en/skills" },
    ],
  },
  {
    id: "E3-014",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.4",
    difficulty: "intermediate",
    question:
      "Engineers on your team have four Claude Code tasks queued this week. Which two should start in plan mode rather than direct execution? (Select two.)",
    options: [
      { id: "A", text: "Add a null check to formatDate(), where a stack trace shows it throws when the input value is missing" },
      { id: "B", text: "Replace the in-house logging library with OpenTelemetry across about 60 files spread over three services" },
      { id: "C", text: "Choose between a message queue and scheduled polling for inventory sync, each with different infrastructure" },
      { id: "D", text: "Rename a misspelled local variable inside one function and update its three references in that same file" },
    ],
    correctAnswer: "BC",
    explanation:
      "Option B is right because a library migration touching about 60 files across three services is a large-scale, multi-file change. The guide names migrations affecting 45+ files as a case for plan mode, so the approach is explored and agreed before edits begin.\n\nOption C is right because it is an architectural decision between valid approaches with different infrastructure requirements, which is exactly what plan mode is designed for: explore and design before committing to changes.\n\nOption A is wrong because it is a well-scoped fix with a clear stack trace pointing to one function. The guide lists this kind of single-file bug fix as a case for direct execution.\n\nOption D is wrong because it is a trivial, single-file change with an obvious scope. Planning it adds overhead and no safety.",
    keyConcept: "Plan mode suits large multi-file changes and architectural choices between approaches; direct execution suits clear, well-scoped changes.",
    sources: [
      { title: "Claude Code docs — Common workflows (plan mode, subagents)", url: "https://code.claude.com/docs/en/common-workflows" },
      { title: "Claude Code docs — Best practices", url: "https://code.claude.com/docs/en/best-practices" },
    ],
  },
  {
    id: "E3-015",
    scenario: "Claude Code for Continuous Integration",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.6",
    difficulty: "intermediate",
    question:
      "Your GitHub Actions job runs `claude \"Review this PR and list the issues\"`. In CI the job hangs until it times out. When a developer runs the same command locally it finishes, but the posting script cannot reliably turn the prose output into inline PR comments. Which two changes fix the pipeline? (Select two.)",
    options: [
      { id: "A", text: "Run Claude Code with the -p flag, so it works non-interactively, prints its result and exits instead of awaiting input" },
      { id: "B", text: "Pipe the yes command into claude, so any interactive prompt that appears is answered automatically and the job goes on" },
      { id: "C", text: "Add --output-format json with a --json-schema that defines file, line, severity and message for each of the findings" },
      { id: "D", text: "Ask in the prompt for \"valid JSON only, no prose\" and strip any text before the first brace before parsing the output" },
    ],
    correctAnswer: "AC",
    explanation:
      "Option A is right because without -p (--print) Claude Code starts an interactive session and waits for input that never arrives in CI. The guide names -p as the way to run Claude Code in automated pipelines and prevent interactive hangs.\n\nOption C is right because the guide pairs --output-format json with --json-schema to produce machine-parseable structured findings that a script can post as inline PR comments.\n\nOption B is wrong because it does not make Claude Code non-interactive; it feeds arbitrary text into an interactive session. The session still has no defined end and no structured output.\n\nOption D is wrong because a prompt request is not enforcement, and stripping text before the first brace is fragile. The CLI flags give structure the script can rely on; prose instructions do not.",
    keyConcept: "In CI, run Claude Code with -p and enforce machine-parseable output with --output-format json plus --json-schema.",
    sources: [
      { title: "Claude Code docs — Run Claude Code programmatically (-p)", url: "https://code.claude.com/docs/en/headless" },
      { title: "Claude Code CLI reference", url: "https://code.claude.com/docs/en/cli-reference" },
    ],
  },
];

// ============================================================
// DOMAIN 4 – Prompt Engineering & Structured Output (18%)
// ============================================================

const examDomain4Questions: Question[] = [
  {
    id: "E4-001",
    scenario: "Claude Code for Continuous Integration",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.1",
    difficulty: "intermediate",
    question:
      "Your CI reviewer labels each finding critical, major or minor. Audits show the same issue type gets different labels across PRs: an unparameterized SQL query was \"critical\" in one PR and \"minor\" in another, so teams cannot use severity to gate merges. The prompt currently says: \"Assign severity based on impact.\" What change most improves consistency?",
    options: [
      { id: "A", text: "Have the model output a numeric confidence with each finding and derive the severity label from it in post-processing." },
      { id: "B", text: "Replace the three labels with a 1–10 severity scale so the model has finer granularity and fewer borderline decisions." },
      { id: "C", text: "Define each severity level with explicit criteria and a short code example, e.g. critical: injectable SQL or leaked secrets." },
      { id: "D", text: "Add \"be consistent with severity labels across reviews\" and remind the model that severity is used to gate merges." },
    ],
    correctAnswer: "C",
    explanation:
      "\"Based on impact\" leaves every PR to a fresh judgment call. Explicit criteria for each level, each anchored by a concrete code example, give the model a fixed reference, which is how the guide says to achieve consistent classification. Option A confuses confidence (how sure the model is) with severity (how bad the issue is). Option B adds more boundaries to place inconsistently. Option D asks for consistency without defining what consistent means.",
    keyConcept: "Severity criteria with concrete code examples for consistent classification",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Prompting best practices", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices" },
    ],
  },
  {
    id: "E4-002",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.3",
    difficulty: "intermediate",
    question:
      "Your intake pipeline receives invoices, purchase orders and contracts without knowing each file's type. You defined three extraction tools (`extract_invoice`, `extract_po`, `extract_contract`) with JSON schemas and use `tool_choice: {\"type\": \"auto\"}`. In 4% of calls Claude replies with prose such as \"This looks like an invoice\" and calls no tool, which breaks the pipeline. What should you change?",
    options: [
      { id: "A", text: "Force `tool_choice: {\"type\": \"tool\", \"name\": \"extract_invoice\"}`, since invoices are the most common type in intake." },
      { id: "B", text: "Set `tool_choice: {\"type\": \"any\"}` so that Claude must call one of the three tools but still chooses which one fits." },
      { id: "C", text: "Keep `auto` and add \"always respond by calling a tool, never with text\" to the system prompt and each tool description." },
      { id: "D", text: "Drop the tools and request raw JSON in the text reply, with a `document_type` field that the pipeline uses for routing." },
    ],
    correctAnswer: "B",
    explanation:
      "With `auto` the model may answer in text. `any` guarantees a tool call while letting the model pick the schema that matches the document, which is exactly the case of multiple schemas and an unknown document type. Option A guarantees a call but forces the invoice schema onto contracts and POs. Option C keeps the same optional behavior and only makes a text reply less likely. Option D gives up tool use, which the guide calls the most reliable route to schema-compliant output, and brings back JSON parsing errors. (The current API also offers `strict: true` on tools and `output_config.format`; they constrain the schema but do not replace choosing the right `tool_choice`.) Product note: Claude Opus 5.5 and Sonnet 5.5 reject forced `tool_choice` (`any` or `tool`) with a 400; the exam guide still tests forced selection, so the example uses `claude-haiku-5-5`, which accepts it. On the newer models, use `auto` with `strict: true` tools or structured outputs.\n\nHow to implement:\n```typescript\nconst res = await client.messages.create({\n  model: \"claude-haiku-5-5\",\n  max_tokens: 2048,\n  tools: [extractInvoice, extractPo, extractContract],\n  tool_choice: { type: \"any\" },\n  messages: [{ role: \"user\", content: fileText }],\n});\nconst call = res.content.find((b) => b.type === \"tool_use\");\n```",
    keyConcept: "tool_choice \"any\" guarantees a tool call when the document type is unknown",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Define tools (tool_choice)", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools" },
    ],
  },
  {
    id: "E4-003",
    scenario: "Claude Code for Continuous Integration",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.6",
    difficulty: "advanced",
    question:
      "Your CI review produces about 40 findings per large PR, and the two senior reviewers can verify only about 10 by hand. Some findings are clearly right; others are borderline. You want human attention to go where it matters most, without silently discarding findings. Which design fits best?",
    options: [
      { id: "A", text: "Have the generating session double-check all 40 findings at the end and remove any it now doubts, then post the rest." },
      { id: "B", text: "Add a verification pass that reports a confidence per finding; post high-confidence ones, queue the rest for humans." },
      { id: "C", text: "Post only security findings automatically and drop every other category until the reviewers have time to check them." },
      { id: "D", text: "Give the generation pass a larger extended-thinking budget so every finding is reliable enough to post without review." },
    ],
    correctAnswer: "B",
    explanation:
      "A verification pass in which the model self-reports confidence alongside each finding enables calibrated review routing: confident findings go straight to the PR and borderline ones go to the limited human time. Calibrate the threshold against past dismissal data; the confidence is used for routing, not as a substitute for explicit review criteria. Option A is same-session self-review, which tends to keep the model's own decisions and silently drops findings. Option C discards valid findings by category. Option D assumes extended thinking makes review unnecessary; the guide says it does not catch subtle issues as well as a separate review step.",
    keyConcept: "Verification pass with per-finding confidence for calibrated routing",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.6", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E4-004",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.4",
    difficulty: "advanced",
    question:
      "Some receipts in your extraction pipeline print a total that does not match their own line items (supplier errors), while in other cases the model misreads a line item. Downstream accounting needs to tell these two situations apart instead of silently trusting either number. How should you design the extraction?",
    options: [
      { id: "A", text: "Extract only `stated_total` and have code reject any receipt whose line items don't add up, sending it for a fresh retry." },
      { id: "B", text: "Extract only the line items and compute the total in code, ignoring the printed total since it may hold supplier errors." },
      { id: "C", text: "Ask the model to correct the printed total whenever it disagrees with the items, so downstream gets a consistent record." },
      { id: "D", text: "Extract `stated_total` and a `calculated_total` summed from the items, plus a `conflict_detected` flag when they differ." },
    ],
    correctAnswer: "D",
    explanation:
      "Capturing both totals and a conflict flag turns a silent inconsistency into data: code can retry with specific feedback when a misread is likely, and route true supplier errors to accounting with the evidence intact. Option A retries every mismatch, but a receipt that is wrong at the source will never reconcile, so it loops or ends in a fabricated fix. Option B throws away the printed total, so supplier errors disappear. Option C asks the model to overwrite source data, hiding the conflict accounting needs to see.",
    keyConcept: "calculated_total vs stated_total with conflict_detected for self-correction",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E4-005",
    scenario: "Customer Support Resolution Agent",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.5",
    difficulty: "intermediate",
    question:
      "Your support platform runs three Claude workloads: (1) a draft reply shown to a live agent while the customer waits in chat, (2) nightly tagging of the day's closed tickets for an analytics report reviewed the following week, and (3) a quarterly re-classification of 2 million historical tickets. Finance wants the 50% Message Batches API discount wherever it does not hurt the customer experience. Which assignment is correct?",
    options: [
      { id: "A", text: "Batch the nightly tagging and the quarterly re-classification; keep live-chat drafts on the synchronous Messages API." },
      { id: "B", text: "Batch all three, polling the live-chat batch every few seconds, since most batches finish well within an hour anyway." },
      { id: "C", text: "Batch only the quarterly job; nightly tagging must stay synchronous, since batches can take up to 24 hours to finish." },
      { id: "D", text: "Batch the live-chat drafts to cut the largest cost, and run the two analytics workloads synchronously for reliability." },
    ],
    correctAnswer: "A",
    explanation:
      "Batch processing fits non-blocking, latency-tolerant work and does not fit blocking flows. The live-chat draft blocks a waiting customer, so it needs the synchronous API. Nightly tagging read a week later and the quarterly job tolerate up to 24 hours easily. Option B ignores that batches have no latency SLA; \"usually within an hour\" is not acceptable for a waiting customer. Option C treats a 24-hour window as a problem for a report read a week later. Option D puts the only latency-critical workload on batch.",
    keyConcept: "Batch for latency-tolerant work, synchronous for blocking workflows",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Batch processing", url: "https://platform.claude.com/docs/en/build-with-claude/batch-processing" },
    ],
  },
  {
    id: "E4-006",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.5",
    difficulty: "intermediate",
    question:
      "A batch of 20,000 contract extractions ends with 19,640 `succeeded` and 360 `errored` results; the errors say those requests exceeded the model's context window. Your result-handling code currently pairs each result with its input by its position in the results file. What should you do?",
    options: [
      { id: "A", text: "Resubmit the full 20,000-request batch; a fresh batch keeps all results in one place and in the same order as inputs." },
      { id: "B", text: "Resubmit the 360 failed requests unchanged in a new batch, since an `errored` result usually means a transient error." },
      { id: "C", text: "Match results by `custom_id`, then resubmit only the 360 failed documents, split into chunks that fit the context." },
      { id: "D", text: "Keep matching by position, but sort the results file by timestamp first so that it lines up with the input order." },
    ],
    correctAnswer: "C",
    explanation:
      "Batch results can come back in any order, so `custom_id` is the only reliable way to correlate a result with its request and to identify which documents failed. A context-window overflow is deterministic, so the failed documents must be modified (chunked) before resubmission, and only those should be resent. Option A pays again for 19,640 successes and still doesn't guarantee order. Option B resends requests that will fail the same way. Option D keeps relying on order, which the API does not guarantee. Testing the prompt on a sample before large batches reduces these resubmissions.\n\nHow to implement:\n```typescript\nconst failed: string[] = [];\nfor await (const r of await client.messages.batches.results(batchId)) {\n  if (r.result.type === \"succeeded\") save(r.custom_id, r.result.message);\n  else failed.push(r.custom_id);\n}\nconst retry = failed.flatMap((id) => chunk(docs[id]).map((part, i) => ({\n  custom_id: `${id}-part${i}`,\n  params: { model: \"claude-sonnet-5-5\", max_tokens: 2048, messages: [{ role: \"user\", content: part }] },\n})));\nawait client.messages.batches.create({ requests: retry });\n```",
    keyConcept: "Use custom_id to resubmit only failed requests, modified as needed",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Batch processing", url: "https://platform.claude.com/docs/en/build-with-claude/batch-processing" },
    ],
  },
  {
    id: "E4-007",
    scenario: "Claude Code for Continuous Integration",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.2",
    difficulty: "intermediate",
    question:
      "Claude Code generates unit tests in your CI pipeline. The generated tests mostly cover the happy path: for functions with early returns, error branches or boundary checks, those branches stay untested. You already added \"cover all branches and edge cases\" to the prompt, with little effect. What is the most effective next change?",
    options: [
      { id: "A", text: "Fail the CI job whenever coverage drops and send the coverage percentage back to Claude, asking it for more tests." },
      { id: "B", text: "Expand the instruction into a full paragraph defining branch coverage, boundary values and error paths precisely." },
      { id: "C", text: "Require the model to list every function it tested in a JSON summary, so reviewers can spot skipped functions." },
      { id: "D", text: "Add 2–3 examples pairing a function with its untested branch, why it matters, and the test that covers it." },
    ],
    correctAnswer: "D",
    explanation:
      "When instructions alone don't change behavior, few-shot examples show the judgment you want. Examples that walk from a function to the specific uncovered branch, explain why it matters and show the resulting test teach the model to find branch-level gaps in code it has not seen. Option A gives feedback too vague to act on: a percentage does not say which branch is missing. Option B is more of the instruction that already failed. Option C adds reporting but does not change which branches get tested.",
    keyConcept: "Few-shot examples demonstrating branch-level coverage gaps",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Prompting best practices", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices" },
    ],
  },
  {
    id: "E4-008",
    scenario: "Claude Code for Continuous Integration",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.1",
    difficulty: "intermediate",
    question:
      "One CI check asks Claude to \"check that code comments are accurate.\" It flags outdated TODOs, informal wording and missing punctuation, and developers dismiss nearly all of it. The team cares about one thing: comments that would mislead a reader about what the code does. How should you rewrite the instruction?",
    options: [
      { id: "A", text: "Keep the instruction, but add \"only report comment issues when you are highly confident they matter\" to cut the noise." },
      { id: "B", text: "Have the model rate every comment from 1 to 5 for accuracy and post only the comments that score 2 or lower in review." },
      { id: "C", text: "Keep the instruction and add few-shot examples of well-written comments so the model learns the team's preferred style." },
      { id: "D", text: "Flag a comment only when its claimed behavior contradicts what the code does; explicitly skip style, wording and TODOs." },
    ],
    correctAnswer: "D",
    explanation:
      "The vague goal \"accurate\" lets the model include style issues. An explicit criterion (claimed behavior contradicts actual behavior) plus an explicit skip list defines exactly what to report, which is what improves precision. Option A is a confidence instruction, which does not improve precision compared with categorical criteria. Option B is confidence-style filtering on a score that still has no definition. Option C pushes the model toward style, the very noise developers are dismissing.",
    keyConcept: "Explicit report/skip criteria instead of vague goals",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Prompting best practices", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices" },
    ],
  },
  {
    id: "E4-009",
    scenario: "Code Generation with Claude Code",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.6",
    difficulty: "advanced",
    question:
      "A team's Claude Code workflow generates a database migration and then, in the same session, prompts Claude to \"self-check the migration against our checklist before finishing.\" A migration that dropped a column still used by a reporting job passed this self-check and reached staging. What change gives the most effective review?",
    options: [
      { id: "A", text: "Run the checklist in a fresh Claude session given the migration, schema and checklist, but not the history." },
      { id: "B", text: "Keep the same-session self-check but move the checklist to the end of the prompt so the model reads it last." },
      { id: "C", text: "Enable extended thinking during generation so the model reasons through each dependent table before writing." },
      { id: "D", text: "Have the generating session explain each change and approve the migration only if its explanation is consistent." },
    ],
    correctAnswer: "A",
    explanation:
      "A self-check in the same session inherits the reasoning that produced the migration, so the model is unlikely to question its own decision to drop the column. An independent instance without that context, given the migration, schema and checklist (and ideally tool access to search for column usages), reviews it fresh and is more effective than self-review or extended thinking. Option B is still self-review. Option C improves generation but adds no independent check. Option D grades the generator on its own explanation, which will naturally sound consistent.",
    keyConcept: "Independent instance without generation context for review",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.6", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E4-010",
    scenario: "Claude Code for Continuous Integration",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.2",
    difficulty: "advanced",
    question:
      "Your security review flags every use of dynamic code evaluation and every raw SQL string. Many are fine: a sandboxed expression evaluator with an allowlist, and SQL built only from constants. You tried listing the known-safe files by path in the prompt, but new safe code elsewhere keeps getting flagged. What approach generalizes best?",
    options: [
      { id: "A", text: "Keep extending the list of safe file paths and function names in the prompt every time a new false positive appears." },
      { id: "B", text: "Lower the severity of all dynamic-code and raw-SQL findings to informational so they no longer block or alarm anyone." },
      { id: "C", text: "Add few-shot examples contrasting safe patterns (allowlisted evaluator, constant SQL) with truly injectable ones." },
      { id: "D", text: "Tell the model to report dynamic code and raw SQL only when it is very confident the usage is truly exploitable." },
    ],
    correctAnswer: "C",
    explanation:
      "A list of paths only matches pre-specified cases. Few-shot examples that contrast acceptable patterns with genuine issues, and explain the difference, let the model generalize the judgment to new code, cutting false positives without hiding real injections. Option A is the approach that is already failing. Option B also downgrades the real vulnerabilities. Option D is a confidence instruction, which does not improve precision the way concrete contrasting examples do.",
    keyConcept: "Few-shot examples contrasting acceptable patterns with real issues",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Prompting best practices", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices" },
    ],
  },
  {
    id: "E4-011",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.3",
    difficulty: "intermediate",
    question:
      "Your strict tool schema for purchase orders lists `discount_code` in `required`, because a teammate believes Claude's strict mode needs every property to be required. Most orders have no discount code, and the model fills in invented codes such as \"SAVE10\". What is the correct fix?",
    options: [
      { id: "A", text: "Keep `discount_code` required, as strict mode demands, and add a post-filter that deletes codes absent from the promotions table." },
      { id: "B", text: "Turn off `strict: true` for this tool so that the schema rules relax and the model no longer feels forced to fill the field." },
      { id: "C", text: "Let the field be absent or null: Claude's strict mode accepts properties left out of `required` and `[\"string\", \"null\"]`." },
      { id: "D", text: "Keep the field required and add to the tool description that fabricated discount codes will be rejected by billing." },
    ],
    correctAnswer: "C",
    explanation:
      "The teammate is applying another vendor's rule. Claude's strict mode accepts properties that are not in `required` (they count toward a limit of 24 optional parameters) and nullable type arrays or `anyOf`. Making the field optional or nullable removes the pressure that causes fabrication, as guide 4.3 recommends. Option A keeps the pressure and lets an invented code that happens to exist (\"SAVE10\") pass the filter. Option B keeps `required` in the schema, so the pressure stays while you lose the schema guarantee. Option D relies on an instruction that competes with the schema.",
    keyConcept: "Claude strict mode supports optional and nullable fields; use them to avoid fabrication",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Structured outputs", url: "https://platform.claude.com/docs/en/build-with-claude/structured-outputs" },
      { title: "Strict tool use", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use" },
    ],
  },
  {
    id: "E4-012",
    scenario: "Claude Code for Continuous Integration",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.4",
    difficulty: "advanced",
    question:
      "Developers dismiss about 30% of your CI reviewer's findings, but you cannot tell why: the findings are free text and cover many different code constructs. You want to learn which kinds of findings drive dismissals so you can fix the prompt systematically. What should you add?",
    options: [
      { id: "A", text: "Ask developers to write a short free-text reason whenever they dismiss a finding, and read a sample of them periodically." },
      { id: "B", text: "Have the model self-report a confidence score for each finding and drop all findings below a fixed confidence threshold." },
      { id: "C", text: "Rerun the dismissed findings through a second Claude pass that decides whether the developer was right to dismiss them." },
      { id: "D", text: "Add a `detected_pattern` field to each structured finding naming the construct that triggered it; group dismissals by it." },
    ],
    correctAnswer: "D",
    explanation:
      "A `detected_pattern` field makes every finding countable by the code construct that triggered it, so dismissal rates can be grouped by pattern and the worst offenders fixed in the prompt. That is the feedback-loop design the guide describes. Option A collects unstructured text that is hard to aggregate and depends on developer effort. Option B filters findings without explaining which patterns are wrong. Option C second-guesses developers instead of measuring where the reviewer goes wrong.",
    keyConcept: "detected_pattern field enables systematic analysis of dismissals",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 4.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
    ],
  },
  {
    id: "E4-013",
    scenario: "Code Generation with Claude Code",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.6",
    difficulty: "advanced",
    question:
      "A developer used one long Claude Code session to write a 14-file payment reconciliation feature. Before merging, they want the review most likely to catch subtle issues, including a mismatch between how the importer and the ledger module handle currency rounding. Which two approaches should they use? (Select two.)",
    options: [
      { id: "A", text: "In the same session, ask Claude to re-read its code with extended thinking on and list anything it would now change" },
      { id: "B", text: "Start a new, independent Claude instance given only the diff and the requirements, without the session's reasoning" },
      { id: "C", text: "Review all 14 files in one single pass, so the reviewer sees everything together and can relate any file to any other" },
      { id: "D", text: "Run focused per-file passes for local issues, plus a separate integration pass that traces data flow across the files" },
    ],
    correctAnswer: "BD",
    explanation:
      "Option B is right because a model that generated the code retains its reasoning context and is less likely to question its own decisions. The guide says an independent instance without that context is more effective at catching subtle issues than self-review instructions or extended thinking.\n\nOption D is right because the guide recommends splitting large multi-file reviews into per-file passes for local issues and a separate integration pass for cross-file data flow. The rounding mismatch between the importer and the ledger is a cross-file issue that the integration pass is designed to find.\n\nOption A is wrong because it is self-review in the same session. Extended thinking gives the same reasoning more room; it does not remove the bias toward the decisions already made.\n\nOption C is wrong because a single pass over 14 files dilutes attention, which leads to missed issues and contradictory findings. Seeing everything at once is not the same as analyzing it carefully.",
    keyConcept: "Review generated code with an independent instance, and split large reviews into per-file passes plus a cross-file integration pass.",
    sources: [
      { title: "Claude Code docs — Best practices", url: "https://code.claude.com/docs/en/best-practices" },
      { title: "Define success criteria and build evaluations", url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests" },
    ],
  },
  {
    id: "E4-014",
    scenario: "Multi-Agent Research System",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.2",
    difficulty: "intermediate",
    question:
      "Your document-analysis subagent extracts a `citations` list of {author, year, title} from each paper. It works well on papers with a bibliography section but returns an empty list for papers that cite inline (\"as Smith (2021) showed\") or in footnotes. A paragraph of instructions describing these styles did not help. Which two prompt changes are most effective? (Select two.)",
    options: [
      { id: "A", text: "Add longer prose rules for each citation style, explaining in more detail how footnotes differ from inline citations" },
      { id: "B", text: "Make citations a required field with minItems: 1, so the model can no longer return an empty list for any paper" },
      { id: "C", text: "Add 2-4 few-shot examples showing correct extraction from a bibliography paper, an inline-cite paper and a footnote paper" },
      { id: "D", text: "Have each example include a short note on why an inline mention counts as a citation, so the model generalizes" },
    ],
    correctAnswer: "CD",
    explanation:
      "Option C is right because the guide names few-shot examples as the most effective fix when detailed instructions alone produce inconsistent results, and specifically for handling varied document structures (inline citations versus bibliographies) and empty extractions of required fields.\n\nOption D is right because the guide recommends examples that show the reasoning for a choice. Explaining why an inline mention is a citation helps the model generalize to styles the examples do not cover, instead of matching only the exact patterns shown.\n\nOption A is wrong because prose instructions were already tried and did not work. More of the same kind of instruction does not address the problem.\n\nOption B is wrong because forcing a non-empty list pushes the model to fabricate citations for papers it cannot parse, and some papers legitimately cite nothing. It hides the failure instead of fixing it.",
    keyConcept: "When instructions fail on varied document structures, add 2-4 targeted few-shot examples that show the correct extraction and the reasoning behind it.",
    sources: [
      { title: "Prompting best practices", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices" },
      { title: "Reduce hallucinations", url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations" },
    ],
  },
  {
    id: "E4-015",
    scenario: "Claude Code for Continuous Integration",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.5",
    difficulty: "intermediate",
    question:
      "Your CI runs three Claude workloads: (1) a blocking pre-merge review that developers wait on, (2) nightly test generation for files changed that day, and (3) a weekly license-header audit of 3,000 files. Finance asks you to cut API costs without hurting developers. Which two decisions are right? (Select two.)",
    options: [
      { id: "A", text: "Move the nightly test generation and the weekly audit to the Message Batches API; keep the pre-merge review synchronous" },
      { id: "B", text: "Move the pre-merge review to the Message Batches API too, since most batches finish well within the 24-hour window" },
      { id: "C", text: "Send the weekly audit as one batch whose requests call a read_file tool mid-request to load each file when needed" },
      { id: "D", text: "Give each batch request a custom_id derived from its file, like src-auth-login, then resubmit only failed ones" },
    ],
    correctAnswer: "AD",
    explanation:
      "Option A is right because the Message Batches API cuts cost by 50% and suits latency-tolerant, non-blocking work like nightly generation and weekly audits. It has no latency guarantee, so the blocking pre-merge review stays on the synchronous API.\n\nOption D is right because custom_id correlates each request with its result. It accepts only letters, digits, hyphens and underscores (up to 64 characters), so derive it from the path instead of using the raw path. After a run you can identify exactly which files failed and resubmit only those, with changes if needed, instead of reprocessing the whole batch.\n\nOption B is wrong because a batch can take up to 24 hours with no latency SLA. \"Most finish quickly\" is not a guarantee a blocking check can rely on; developers would sometimes wait for hours.\n\nOption C is wrong because the batch API does not support multi-turn tool calling within a request: your code cannot run a tool mid-request and return its result. Each request must already contain the file content it needs.",
    keyConcept: "Use batches for latency-tolerant work and the synchronous API for blocking checks; correlate results with custom_id and resubmit only failures.",
    sources: [
      { title: "Batch processing", url: "https://platform.claude.com/docs/en/build-with-claude/batch-processing" },
    ],
  },
  {
    id: "E4-016",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.4",
    difficulty: "advanced",
    question:
      "Your purchase-order extractor uses a strict tool schema and validates every result. Three failure groups appear: (1) `delivery_date` returned as \"next Tuesday\" instead of ISO 8601, although the PO's issue date is printed on it; (2) line items that do not add up to the stated total; (3) `contract_reference` empty because the PO only says \"per master agreement,\" a document the pipeline never receives. Which two statements about retries are correct? (Select two.)",
    options: [
      { id: "A", text: "For group 1, a retry that includes the document, the failed extraction and the specific validation error should fix it" },
      { id: "B", text: "For group 3, retrying will not help: the value exists only in the master agreement, which the model never receives" },
      { id: "C", text: "For group 3, retrying up to five times with firmer wording will eventually surface the reference from the PO itself" },
      { id: "D", text: "For group 2, the strict schema already rules out sum mismatches, so these cases must come from a bug in your parser" },
    ],
    correctAnswer: "AB",
    explanation:
      "Option A is right because a format error is exactly what retry-with-error-feedback fixes. Sending the original document, the failed extraction and the specific validation error (\"delivery_date must be ISO 8601\") gives the model what it needs to correct itself, and the PO's issue date is the reference that turns \"next Tuesday\" into a date.\n\nOption B is right because the guide is explicit about the limits of retry: when the information is absent from the source, for example because it lives in an external document not provided, no number of retries will produce it.\n\nOption C is wrong for the same reason B is right. Firmer wording on a document that lacks the value can only push the model toward fabricating a reference.\n\nOption D is wrong because strict schemas eliminate syntax errors, not semantic ones. Line items that do not sum to the total are a semantic error the schema cannot catch; the guide recommends checks such as extracting a calculated_total alongside the stated_total to flag discrepancies.",
    keyConcept: "Retry with specific error feedback fixes format and structure errors, not information missing from the source; strict schemas stop syntax errors, not semantic ones.",
    sources: [
      { title: "Structured outputs", url: "https://platform.claude.com/docs/en/build-with-claude/structured-outputs" },
      { title: "Reduce hallucinations", url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations" },
    ],
  },
];

// ============================================================
// DOMAIN 5 – Context Management & Reliability (17%)
// ============================================================

const examDomain5Questions: Question[] = [
  {
    id: "E5-001",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.1",
    difficulty: "advanced",
    question:
      "For each paper, the document-analysis subagent returns a 3,000-word narrative of its reasoning with long quotations. The synthesis agent receives 25 of these and works under a tight context budget; its reports omit key numbers and mix up which paper said what. What should you change first?",
    options: [
      { id: "A", text: "Have the analysis subagent return structured key facts, citations and relevance scores, not reasoning prose" },
      { id: "B", text: "Give the synthesis agent a larger max_tokens value so it has more room to work through all 25 of the narratives" },
      { id: "C", text: "Add a second synthesis pass that re-reads all 25 narratives and corrects any numbers the first pass got wrong" },
      { id: "D", text: "Have the coordinator cut each narrative down to its first 500 words before forwarding it to the synthesis agent" },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct. When a downstream agent has a limited context budget, the upstream agent should return structured data (key facts, citations, relevance scores) rather than verbose content and reasoning chains. The synthesis agent then receives the facts it needs, each tied to its paper, in a fraction of the tokens.\n\nB confuses limits: max_tokens caps the length of the model's output, not how much input it can use well. C doubles the cost and feeds the second pass the same overloaded input that caused the errors. D truncates by position, so any key number that appears after word 500 is lost.\n\nHow to implement:\n```typescript\ninterface PaperAnalysis {\n  paperId: string;\n  citation: string;            // \"Lee et al., 2025, J. Energy Policy\"\n  keyFacts: { fact: string; value?: string; page?: number }[];\n  relevance: number;           // 0-1, against the research question\n  method: string;              // \"RCT, n=1,200\"\n}\n// The subagent's final message must be a JSON array of PaperAnalysis, nothing else\n```",
    keyConcept: "Upstream agents return structured facts, citations and relevance, not reasoning prose",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "How we built our multi-agent research system", url: "https://www.anthropic.com/research/multi-agent-research-system" },
      { title: "Effective context engineering for AI agents", url: "https://www.anthropic.com/research/effective-context-engineering-for-ai-agents" },
    ],
  },
  {
    id: "E5-002",
    scenario: "Customer Support Resolution Agent",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.2",
    difficulty: "intermediate",
    question:
      "A customer writes: \"This is the THIRD time my package arrived damaged. Ridiculous.\" They attach photos. Policy covers a standard replacement, which the agent is allowed to issue, and the customer has not asked for a person. Which response pattern is best?",
    options: [
      { id: "A", text: "Escalate to a human right away, since strong negative sentiment signals the case is too sensitive for the agent" },
      { id: "B", text: "Acknowledge the frustration, offer the replacement now, and escalate only if the customer insists on a human" },
      { id: "C", text: "Open a full investigation into the carrier's damage history first, so that the reply can address the root cause" },
      { id: "D", text: "Issue the replacement with a brief policy-only reply and close the case, since no human was requested" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct. When the issue is within the agent's capability and the customer has not asked for a human, the agent should acknowledge the frustration and offer the resolution, escalating only if the customer reiterates that they want a person.\n\nA uses sentiment as an escalation trigger; frustration is not a measure of case complexity, and this case is a standard covered replacement. C delays a resolution the customer can have now; a carrier investigation is a separate follow-up. D resolves the case but ignores the frustration and gives the customer no clear path to a human if they want one, which tends to produce a repeat contact.\n\nHow to implement (few-shot example in the system prompt):\n```markdown\n<example>\nCustomer: \"Third damaged package. Ridiculous.\" (photos attached)\nAgent: \"I'm sorry, three damaged deliveries is frustrating. I can send a\nreplacement today at no cost. Would you like me to do that, or would you\nprefer to speak with a member of our team?\"\n</example>\n```",
    keyConcept: "Acknowledge frustration and offer resolution; escalate only if the customer reiterates",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Customer support agent guide", url: "https://platform.claude.com/docs/en/about-claude/use-case-guides/customer-support-chat" },
    ],
  },
  {
    id: "E5-003",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.3",
    difficulty: "intermediate",
    question:
      "The patent-search subagent returns an empty list in two situations: when the patent API times out, and when a query legitimately has no matching patents. The coordinator treats both as \"no prior art found\" and has published reports claiming novelty for topics that were never actually searched. What fix addresses the root cause?",
    options: [
      { id: "A", text: "Return a distinct error for access failures (type, query, retries) and keep [] for successful empty searches" },
      { id: "B", text: "Have the coordinator re-run every search that comes back empty, in case the empty list came from a timeout" },
      { id: "C", text: "Make the subagent raise an exception on any empty result so that the coordinator halts the workflow for review" },
      { id: "D", text: "Raise the patent API timeout from 10 to 60 seconds so that timeouts become rare enough to be safely ignored" },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct. An access failure (the search never ran) and a valid empty result (the search ran and found nothing) mean different things and need different decisions. Reporting the failure as a structured error, with its type, the attempted query and retry information, lets the coordinator retry, try another source or flag the gap, while [] keeps meaning \"searched, nothing found\".\n\nB spends calls re-running valid empty searches and still cannot tell the two cases apart. C turns legitimate \"no matches\" results into failures and stops the whole workflow, which is the opposite anti-pattern. D makes timeouts less frequent but still reports the ones that happen as \"no prior art\".\n\nHow to implement:\n```typescript\ntype SearchResult =\n  | { ok: true; query: string; results: Patent[] }            // [] = truly none\n  | { ok: false; failureType: \"timeout\" | \"auth\" | \"unavailable\";\n      query: string; attempts: number; partialResults: Patent[];\n      alternatives: string[] };                                 // e.g. [\"EPO mirror\"]\n```",
    keyConcept: "Distinguish access failures from valid empty results",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "MCP specification: Tools (error handling)", url: "https://modelcontextprotocol.io/specification/2025-06-18/server/tools" },
      { title: "Writing effective tools for agents", url: "https://www.anthropic.com/research/writing-tools-for-agents" },
    ],
  },
  {
    id: "E5-004",
    scenario: "Developer Productivity with Claude",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.4",
    difficulty: "intermediate",
    question:
      "Your agent must answer \"How does a refund flow from the API to the ledger?\" in a 400,000-line monorepo. In the current design the main agent runs every grep and file read itself; after 30 minutes its context is mostly raw search output and it loses track of the original question. What design keeps the main agent effective?",
    options: [
      { id: "A", text: "Spawn subagents for focused questions, such as tracing refund dependencies, that return only summaries" },
      { id: "B", text: "Load as much of the monorepo as fits into context at the start so the agent rarely has to search afterwards" },
      { id: "C", text: "Have the main agent cap every grep at 20 results while it keeps running all of the searches in its own context" },
      { id: "D", text: "Run the same question in five parallel sessions and keep the answer that most of the sessions agree on" },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct. Delegating focused investigations (\"find all refund entry points\", \"trace refund dependencies into the ledger\") to subagents keeps the verbose exploration output in their own context windows; the main agent receives only the summaries and preserves the high-level coordination of the question.\n\nB fills the context with mostly irrelevant code before any work starts, which accelerates the degradation. C still accumulates every search in the main context, and capping results can hide the one match that matters. D multiplies the same flawed design five times and adds cost without fixing context accumulation. (The guide calls the spawning tool \"Task\"; current Agent SDK docs name it \"Agent\" in allowedTools.)\n\nHow to implement (Agent SDK, TypeScript):\n```typescript\nconst options = {\n  model: \"claude-sonnet-5-5\",\n  allowedTools: [\"Read\", \"Grep\", \"Glob\", \"Agent\"],\n  agents: {\n    \"code-tracer\": {\n      description: \"Traces one call path and returns a short summary with file:line refs\",\n      prompt: \"Investigate only the question given. Return <=20 lines: path, key functions, file:line.\",\n      tools: [\"Read\", \"Grep\", \"Glob\"],\n    },\n  },\n};\n```",
    keyConcept: "Subagent delegation isolates verbose exploration output from the coordinating agent",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Claude Code: Create custom subagents", url: "https://code.claude.com/docs/en/sub-agents" },
      { title: "Agent SDK: Subagents", url: "https://code.claude.com/docs/en/agent-sdk/subagents" },
    ],
  },
  {
    id: "E5-005",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.4",
    difficulty: "advanced",
    question:
      "A six-hour research run with a coordinator and eight subagents crashed at hour four when the host restarted. All progress lived in memory, so the run started over from zero. How should you design the system so the next crash costs minutes instead of hours?",
    options: [
      { id: "A", text: "Have each agent export state to a known location; on resume, the coordinator loads a manifest into prompts" },
      { id: "B", text: "Rely on resuming the coordinator's session after a crash, since its transcript holds every result returned so far" },
      { id: "C", text: "Save the draft of the final report every hour and, on resume, let all subagents restart their research from scratch" },
      { id: "D", text: "Run two identical copies of the whole system on separate hosts so one of them survives if the other one crashes" },
    ],
    correctAnswer: "A",
    explanation:
      "A is correct. Structured state persistence makes recovery explicit: each agent writes its progress (completed subtasks, findings, pending work) to a known location, and on resume the coordinator loads a manifest of those exports and injects the relevant state into each agent's prompt, so work continues from the last checkpoint.\n\nB recovers only results that subagents had already returned; work in progress inside each subagent is lost, and reloading a four-hour transcript brings back its context problems. C protects the report text but throws away per-agent progress, so most of the research is repeated. D doubles cost and does not help when both copies fail for the same reason.\n\nHow to implement:\n```json\n// state/manifest.json, rewritten by the coordinator after each checkpoint\n{\n  \"runId\": \"batt-2026-11-20\",\n  \"agents\": {\n    \"web-search\": { \"state\": \"state/web-search.json\", \"status\": \"done\" },\n    \"doc-analysis\": { \"state\": \"state/doc-analysis.json\", \"status\": \"in_progress\",\n                      \"completed\": 14, \"remaining\": [\"paper-15\", \"paper-16\"] }\n  }\n}\n```",
    keyConcept: "Crash recovery: agents export state; the coordinator loads a manifest on resume",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.4", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "How we built our multi-agent research system", url: "https://www.anthropic.com/research/multi-agent-research-system" },
      { title: "Effective harnesses for long-running agents", url: "https://www.anthropic.com/research/effective-harnesses-for-long-running-agents" },
    ],
  },
  {
    id: "E5-006",
    scenario: "Structured Data Extraction",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.5",
    difficulty: "intermediate",
    question:
      "Your extraction system reports 97% field accuracy across 50,000 documents, and leadership wants to remove human review for all high-confidence outputs. Typed invoices make up 85% of the volume; handwritten receipts and multi-page contracts make up the rest. What should you do before reducing review?",
    options: [
      { id: "A", text: "Approve the change, since 97% beats the 95% target and high-confidence outputs are the most accurate of all" },
      { id: "B", text: "Measure accuracy by document type and by field, and reduce review only for segments that meet the target" },
      { id: "C", text: "Remove review for typed invoices only, since they are the majority, and keep everything else under review" },
      { id: "D", text: "Reduce review everywhere for a two-week trial, then roll it back if downstream teams report more errors" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct. An aggregate figure weighted toward typed invoices can hide poor accuracy on handwritten receipts or on specific fields in contracts. Validating accuracy by document type and by field segment shows where automation is safe, and review is reduced only where each segment meets the target.\n\nA trusts the aggregate, which is exactly the number that can mask a failing segment. C is a guess without segment data; even typed invoices may have a weak field, such as tax IDs. D uses downstream complaints as the metric, but many extraction errors pass silently and are never reported.\n\nHow to implement:\n```python\nimport pandas as pd\ndf = pd.DataFrame(validation_rows)  # doc_type, field, correct (bool)\nseg = df.groupby([\"doc_type\", \"field\"])[\"correct\"].agg([\"mean\", \"count\"])\nsafe = seg[(seg[\"mean\"] >= 0.97) & (seg[\"count\"] >= 200)]\n# only (doc_type, field) pairs in `safe` may skip human review\n```",
    keyConcept: "Aggregate accuracy can mask weak segments; validate by document type and field first",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Define success criteria and build evaluations", url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests" },
    ],
  },
  {
    id: "E5-007",
    scenario: "Customer Support Resolution Agent",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.1",
    difficulty: "intermediate",
    question:
      "Each lookup_order call returns 45 fields (warehouse codes, carrier scan events, marketing flags and more). In return conversations the agent calls it six to eight times, and by mid-session these results dominate the context, although only order_id, items, purchase_date, status and return_eligible matter. What is the best fix?",
    options: [
      { id: "A", text: "Move the agent to a model with a larger context window so all the lookup results fit for the whole session" },
      { id: "B", text: "Trim each lookup_order result to the return-relevant fields before it is added to the conversation context" },
      { id: "C", text: "Tell the agent in the system prompt to ignore the irrelevant fields when it reads lookup_order results later" },
      { id: "D", text: "Keep lookup results out of the conversation entirely and have the agent call the tool again whenever needed" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct. Tool results accumulate in context and consume tokens out of proportion to their relevance. Trimming each result to the fields the task needs, before it is appended, keeps the important facts and removes the noise, for example with a PostToolUse hook or a wrapper around the tool.\n\nA leaves 40 irrelevant fields per call in context; it raises cost without making the important fields easier to find. C still sends every field on every turn, so the tokens and the distraction remain. D forces repeated calls and drops the facts the agent needs between turns. (Tool definitions are a separate cost: Claude Code already defers MCP tool schemas through tool search, which is on by default; the problem here is the tool results.)\n\nHow to implement:\n```typescript\nconst RETURN_FIELDS = [\"order_id\", \"items\", \"purchase_date\", \"status\", \"return_eligible\"] as const;\n\nfunction trimOrder(raw: Record<string, unknown>) {\n  return Object.fromEntries(RETURN_FIELDS.map(k => [k, raw[k]]));\n}\n// tool handler: return { content: [{ type: \"text\", text: JSON.stringify(trimOrder(raw)) }] };\n```",
    keyConcept: "Trim verbose tool outputs to relevant fields before they accumulate in context",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.1", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Writing effective tools for agents", url: "https://www.anthropic.com/research/writing-tools-for-agents" },
      { title: "Claude Code: Connect to tools via MCP (tool search)", url: "https://code.claude.com/docs/en/mcp" },
    ],
  },
  {
    id: "E5-008",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.6",
    difficulty: "intermediate",
    question:
      "Two credible sources disagree: an industry association reports 2024 battery-recycling capacity in the region at 1.2 million tonnes, while a government agency reports 0.8 million tonnes for the same year and region. The document-analysis subagent currently keeps whichever value has more citations and discards the other. What should it do instead?",
    options: [
      { id: "A", text: "Keep the government figure, because public agencies are more neutral and so are the more authoritative source" },
      { id: "B", text: "Report the average of the two values, 1.0 million tonnes, labeled as an estimate that reconciles both sources" },
      { id: "C", text: "Drop both figures from the analysis and note that reliable 2024 capacity data could not be found for the region" },
      { id: "D", text: "Include both values with source attribution and flag the conflict so the coordinator can reconcile it" },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct. When credible sources report conflicting statistics, the analysis should complete with both values included and the conflict annotated with source attribution, leaving reconciliation to the coordinator, which can check definitions, scope or methodology before synthesis.\n\nA and B both reconcile arbitrarily: A picks a winner by assumption, and B invents a figure that neither source reported. C discards two credible data points and reports a gap that does not exist. Like the current design, all three hide from the reader that the sources disagree.\n\nHow to implement:\n```json\n{\n  \"metric\": \"battery recycling capacity, 2024, region X\",\n  \"values\": [\n    { \"value\": 1.2, \"unit\": \"Mt\", \"source\": \"Industry association report\", \"url\": \"https://...\", \"method\": \"member survey\" },\n    { \"value\": 0.8, \"unit\": \"Mt\", \"source\": \"Government agency statistics\", \"url\": \"https://...\", \"method\": \"permitted capacity\" }\n  ],\n  \"conflict\": true,\n  \"note\": \"Possible definitional difference: surveyed vs permitted capacity\"\n}\n```",
    keyConcept: "Annotate conflicting statistics with source attribution instead of picking one",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.6", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "How we built our multi-agent research system", url: "https://www.anthropic.com/research/multi-agent-research-system" },
    ],
  },
  {
    id: "E5-009",
    scenario: "Structured Data Extraction",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.5",
    difficulty: "advanced",
    question:
      "Reviewers can check 300 of the 5,000 contracts extracted each day. Some contracts contain two different termination dates in different clauses, and the model extracts one of them with high confidence. Which routing rule makes the best use of the limited reviewer capacity?",
    options: [
      { id: "A", text: "Randomly pick 300 contracts each day so that every document has an equal chance of reaching a human reviewer" },
      { id: "B", text: "Send the 300 longest contracts to review, because longer documents contain more clauses and so more errors" },
      { id: "C", text: "Prioritize low-confidence fields and contracts with contradictory source text, like two termination dates" },
      { id: "D", text: "Route by confidence score alone, since high confidence means the source document itself was unambiguous" },
    ],
    correctAnswer: "C",
    explanation:
      "C is correct. With limited capacity, review should go first to extractions with low model confidence and to documents whose source is ambiguous or contradictory. Detecting conflicting values in the source (two termination dates) catches cases the confidence score misses.\n\nA is a good way to measure error rates, which is a separate need, but as the only routing rule it spends most of the reviewers' time on easy, correct documents. B uses length as a proxy for risk without evidence that it predicts errors. D is contradicted by the scenario itself: the model gave high confidence to one of two conflicting dates.\n\nHow to implement:\n```python\ndef review_priority(doc):\n    score = 0\n    score += sum(1 for f in doc.fields if f.confidence < f.calibrated_threshold) * 2\n    score += 5 if doc.source_conflicts else 0   # e.g. two distinct termination dates found\n    return score\n\nqueue = sorted(today_docs, key=review_priority, reverse=True)[:300]\n```",
    keyConcept: "Route low-confidence and contradictory-source extractions to limited reviewer capacity first",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.5", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Reduce hallucinations", url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations" },
    ],
  },
  {
    id: "E5-010",
    scenario: "Customer Support Resolution Agent",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.2",
    difficulty: "intermediate",
    question:
      "A customer asks the agent to match a competitor's lower price on a TV they bought last week. Your policy describes price adjustments when your own site drops its price within 14 days of purchase, and says nothing about competitor prices. What should the agent do?",
    options: [
      { id: "A", text: "Apply the 14-day own-site adjustment rule to the competitor's price, since the intent of the policy is similar" },
      { id: "B", text: "Decline politely, explaining that competitor price matching is not offered because the policy does not list it" },
      { id: "C", text: "Ask for a screenshot of the competitor's price and approve the match if the purchase was within the 14 days" },
      { id: "D", text: "Escalate to a human, because the policy is silent on competitor matching and the case needs a policy decision" },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct. A policy gap is an escalation trigger even when the case looks simple: the policy covers own-site adjustments but is silent on competitor matching, so granting or refusing the request would be a policy decision the agent is not authorized to make.\n\nA and C extend the policy by analogy and commit the company to a rule nobody approved. B treats silence as a prohibition; refusing is also a policy decision, and it may contradict what the business would choose.\n\nHow to implement (system prompt excerpt):\n```markdown\n## Escalate when policy is ambiguous or silent\nIf a request is not explicitly covered by the policy documents\n(e.g. competitor price matching when policy only covers our own\nprice drops), do not approve or deny it. Call escalate_to_human\nwith: the request, the closest policy section, and why it does not apply.\n```",
    keyConcept: "Escalate when policy is ambiguous or silent on the customer's specific request",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.2", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "Customer support agent guide", url: "https://platform.claude.com/docs/en/about-claude/use-case-guides/customer-support-chat" },
    ],
  },
  {
    id: "E5-011",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.6",
    difficulty: "intermediate",
    question:
      "The synthesis agent flags a \"contradiction\": one source says 34% of retailers use AI demand forecasting, another says 61%. On inspection, the first figure comes from a 2021 survey and the second from a 2025 survey, but neither subagent output included a date. How should you prevent this class of error?",
    options: [
      { id: "A", text: "Instruct the synthesis agent to prefer the higher figure whenever two sources report the same statistic" },
      { id: "B", text: "Have the synthesis agent search the web again for each conflict to work out which figure is more recent" },
      { id: "C", text: "Let the synthesis agent drop any statistic that conflicts, keeping only figures that all the sources agree on" },
      { id: "D", text: "Require subagents to include publication and data-collection dates in the structured output for each claim" },
    ],
    correctAnswer: "D",
    explanation:
      "D is correct. Without publication or data-collection dates, a change over time looks like a contradiction. Requiring subagents to include those dates in their structured output lets the synthesis agent read 34% (2021) and 61% (2025) as a trend instead of a conflict.\n\nA picks a value by rule and hides the time dimension. B patches the symptom with extra round trips for information the subagents already had when they read the sources. C throws away valid data, and here it would erase the very trend the report should show.\n\nHow to implement:\n```typescript\ninterface DatedClaim {\n  claim: string;            // \"34% of retailers use AI demand forecasting\"\n  sourceUrl: string;\n  publishedAt: string;      // \"2021-06-01\"\n  dataCollectedAt?: string; // \"2021-Q1\"\n}\n// Synthesis rule: compare values only within the same collection period;\n// otherwise report them as a time series.\n```",
    keyConcept: "Require publication and collection dates so temporal differences are not read as contradictions",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.6", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "How we built our multi-agent research system", url: "https://www.anthropic.com/research/multi-agent-research-system" },
    ],
  },
  {
    id: "E5-012",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.3",
    difficulty: "advanced",
    question:
      "Your web-search subagent often hits brief network timeouts that succeed on a second attempt. Today it forwards every timeout to the coordinator, which spends a turn deciding to retry each one. Occasionally a source returns 403 Forbidden, which no retry fixes. How should the subagent handle failures?",
    options: [
      { id: "A", text: "Forward every failure, including each timeout, so the coordinator keeps full visibility of all that happens" },
      { id: "B", text: "Retry transient timeouts locally; propagate only unresolved errors like the 403, with attempts and partials" },
      { id: "C", text: "Retry every failure locally until it succeeds, including the 403s, so the coordinator never handles errors" },
      { id: "D", text: "Treat a 403 as an empty result so the run continues, and retry timeouts once before giving up silently" },
    ],
    correctAnswer: "B",
    explanation:
      "B is correct. Subagents should recover locally from transient failures and propagate only the errors they cannot resolve, together with what was attempted and any partial results. The coordinator stops spending turns on routine retries and still gets the context it needs for the 403 (try another source, or flag a coverage gap).\n\nA floods the coordinator with decisions the subagent can make on its own. C retries a permanent error that will never succeed, wasting time, and hides it from the coordinator. D silently suppresses errors: a 403 reported as \"no results\" looks like a successful empty search.\n\nHow to implement:\n```typescript\nasync function fetchWithRecovery(url: string) {\n  for (let attempt = 1; attempt <= 3; attempt++) {\n    const r = await fetchSource(url);\n    if (r.ok) return { ok: true, data: r.data };\n    if (r.kind !== \"timeout\") {\n      return { ok: false, failureType: r.kind, url, attempts: attempt,\n               partialResults: r.partial ?? [], alternatives: [\"search cached copy\"] };\n    }\n    await sleep(500 * attempt); // transient: handle locally\n  }\n  return { ok: false, failureType: \"timeout\", url, attempts: 3, partialResults: [] };\n}\n```",
    keyConcept: "Recover transient failures locally; propagate only unresolved errors with context",
    sources: [
      { title: "CCAR-F Exam Guide v1.0 — Task 5.3", url: "https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" },
      { title: "How we built our multi-agent research system", url: "https://www.anthropic.com/research/multi-agent-research-system" },
    ],
  },
  {
    id: "E5-013",
    scenario: "Customer Support Resolution Agent",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.2",
    difficulty: "intermediate",
    question:
      "Your support agent can resolve standard returns, refunds and account changes on its own. Which two of these situations should it escalate to a human with escalate_to_human? (Select two.)",
    options: [
      { id: "A", text: "A customer wants a standard return that is within policy, and the sentiment model scores the message as very angry" },
      { id: "B", text: "A customer asks to be reimbursed for a hotel night lost to a late delivery; the policy covers refunds but not such costs" },
      { id: "C", text: "After several attempts, the agent cannot find the order with any identifier the customer gives and cannot progress" },
      { id: "D", text: "The agent reports confidence of 0.55 on a routine address change that the customer has already fully confirmed" },
    ],
    correctAnswer: "BC",
    explanation:
      "Option B is right because the guide lists policy exceptions and gaps as escalation triggers. When the policy is silent on what the customer asks for, here reimbursement of a consequential cost, the agent should not invent a rule; a human should decide.\n\nOption C is right because inability to make meaningful progress is another trigger the guide names. Continuing to loop helps no one; a handoff with what was tried does.\n\nOption A is wrong because the guide says sentiment is an unreliable proxy for case complexity. The request is straightforward and within policy, so the agent should acknowledge the frustration and resolve it, escalating only if the customer asks for a human.\n\nOption D is wrong because self-reported confidence is also an unreliable proxy. A fully confirmed, routine change is squarely within the agent's capability.",
    keyConcept: "Escalate on explicit human requests, policy gaps and lack of progress, not on sentiment scores or self-reported confidence.",
    sources: [
      { title: "Customer support agent guide", url: "https://platform.claude.com/docs/en/about-claude/use-case-guides/customer-support-chat" },
    ],
  },
  {
    id: "E5-014",
    scenario: "Structured Data Extraction",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.5",
    difficulty: "advanced",
    question:
      "Your pipeline extracts fields from invoices, credit notes and customs declarations. Field accuracy on last month's 40,000 documents is 98% overall, and the team proposes ending human review for every extraction with model confidence of 0.9 or higher. Customs declarations are only 4% of volume. Which two steps should come before review is reduced? (Select two.)",
    options: [
      { id: "A", text: "Break accuracy down by document type and by field, to confirm customs declarations and rare fields also meet the bar" },
      { id: "B", text: "Adopt the 0.9 threshold as proposed, because the model's own confidence scores already reflect its real accuracy" },
      { id: "C", text: "Calibrate the thresholds on a labeled validation set, then keep stratified random sampling of high-confidence output" },
      { id: "D", text: "Review only extractions below 0.9 from now on, since the 98% aggregate shows high-confidence items need no checks" },
    ],
    correctAnswer: "AC",
    explanation:
      "Option A is right because the guide warns that aggregate metrics can mask poor performance on specific document types or fields. At 4% of volume, customs declarations could be far below 98% without moving the overall number, so accuracy must be validated by segment before automating.\n\nOption C is right because the guide calls for field-level confidence thresholds calibrated on labeled validation sets, and for ongoing stratified random sampling of high-confidence extractions to measure error rates and detect novel error patterns after review is reduced.\n\nOption B is wrong because raw model confidence is not calibrated by default. Without a labeled set you do not know whether 0.9 actually means 90% (or more) correct.\n\nOption D is wrong because it relies on the aggregate the guide warns about and stops all checking of high-confidence output, so new error patterns would go unnoticed.",
    keyConcept: "Validate accuracy per document type and field, calibrate confidence on labeled data, and keep sampling high-confidence output before cutting review.",
    sources: [
      { title: "Define success criteria and build evaluations", url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests" },
      { title: "Reduce hallucinations", url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations" },
    ],
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
