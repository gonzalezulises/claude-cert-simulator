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
  correctAnswer: OptionId;
  explanation: string;
  keyConcept: string;
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
      "A customer support agent is mid-conversation when it calls a `lookup_order` tool. The API response comes back successfully. Which `stop_reason` value should the orchestration loop check for in order to know it must send the tool result back to Claude before the conversation can continue?",
    options: [
      { id: "A", text: "\"end_turn\" — the model has finished its response and is waiting for input" },
      { id: "B", text: "\"tool_use\" — the model has emitted a tool call and the loop must supply the result" },
      { id: "C", text: "\"max_tokens\" — the model ran out of space and needs the result to continue" },
      { id: "D", text: "\"stop_sequence\" — a custom stop token was hit, signalling a tool call" },
    ],
    correctAnswer: "B",
    explanation:
      "When Claude emits a tool call it sets stop_reason to \"tool_use\". The orchestration loop must detect this value, execute the tool, and return a user-role message containing a tool_result block. Only after that round-trip will Claude continue generating. \"end_turn\" means the model finished without needing a tool. \"max_tokens\" and \"stop_sequence\" are unrelated to tool invocations.\n\nHow to implement:\n```typescript\nasync function runAgentLoop(messages: Message[]) {\n  while (true) {\n    const response = await anthropic.messages.create({\n      model: \"claude-opus-4-5\",\n      max_tokens: 4096,\n      tools: [lookupOrderTool],\n      messages,\n    });\n\n    if (response.stop_reason === \"end_turn\") {\n      // Extract final text and return to user\n      const text = response.content.find(b => b.type === \"text\")?.text;\n      return text;\n    }\n\n    if (response.stop_reason === \"tool_use\") {\n      // Append assistant message with tool call\n      messages.push({ role: \"assistant\", content: response.content });\n\n      // Execute each tool call and collect results\n      const toolResults = [];\n      for (const block of response.content) {\n        if (block.type === \"tool_use\") {\n          const result = await executeTool(block.name, block.input);\n          toolResults.push({\n            type: \"tool_result\",\n            tool_use_id: block.id,\n            content: JSON.stringify(result),\n          });\n        }\n      }\n      // Return tool results to Claude\n      messages.push({ role: \"user\", content: toolResults });\n    }\n  }\n}\n```",
    keyConcept: "Agentic loop lifecycle – stop_reason values",
  },
  {
    id: "D1-002",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.2",
    difficulty: "intermediate",
    question:
      "Your multi-agent research system uses a coordinator that spawns specialist subagents for literature review, data analysis, and citation checking. The coordinator needs each subagent to work with only the information relevant to its task, not the full research context. Which architectural pattern best achieves this isolation?",
    options: [
      { id: "A", text: "Pass the entire conversation history to each subagent so they have full context" },
      { id: "B", text: "Hub-and-spoke: coordinator holds the master context and passes only task-specific instructions to each subagent in an isolated conversation" },
      { id: "C", text: "Chain each subagent sequentially, appending their outputs to a shared context window" },
      { id: "D", text: "Use a single Claude instance with system-prompt switching between roles" },
    ],
    correctAnswer: "B",
    explanation:
      "The hub-and-spoke (coordinator-subagent) pattern gives each subagent its own isolated conversation context. The coordinator summarizes and relays only what the subagent needs, preventing context pollution and keeping token counts manageable. Option A floods subagents with irrelevant data. Option C creates a growing monolithic context. Option D is not a multi-agent architecture.\n\nHow to implement:\n```typescript\nclass ResearchCoordinator {\n  private findings: Record<string, string> = {};\n\n  async runLiteratureReview(topic: string) {\n    // Subagent gets ONLY what it needs — isolated conversation\n    const response = await anthropic.messages.create({\n      model: \"claude-opus-4-5\",\n      system: \"You are a literature review specialist. Focus only on the task given.\",\n      messages: [{\n        role: \"user\",\n        content: `Review literature on: ${topic}. Return key findings as bullet points.`\n      }],\n      tools: [webSearchTool, fetchPaperTool],\n      max_tokens: 2048,\n    });\n    this.findings.literature = extractText(response);\n  }\n\n  async runDataAnalysis() {\n    // Coordinator passes ONLY the literature findings, not full history\n    const response = await anthropic.messages.create({\n      model: \"claude-opus-4-5\",\n      system: \"You are a data analysis specialist.\",\n      messages: [{\n        role: \"user\",\n        content: `Analyze these findings statistically:\\n${this.findings.literature}`\n      }],\n      tools: [statsTool, chartTool],\n      max_tokens: 2048,\n    });\n    this.findings.analysis = extractText(response);\n  }\n}\n```",
    keyConcept: "Hub-and-spoke coordinator-subagent architecture with isolated context",
  },
  {
    id: "D1-003",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.3",
    difficulty: "advanced",
    question:
      "You are configuring an AgentDefinition for a subagent that must be able to spawn its own child tasks. Your configuration currently lists `allowedTools: [\"Read\", \"Grep\", \"WebSearch\"]`. The subagent is failing to spawn child tasks at runtime. What is the most likely cause?",
    options: [
      { id: "A", text: "The subagent needs the \"Bash\" tool to spawn child processes" },
      { id: "B", text: "\"Task\" must be explicitly included in allowedTools for an agent to spawn subagents" },
      { id: "C", text: "Subagents cannot spawn child tasks; only the top-level orchestrator can use Task" },
      { id: "D", text: "The AgentDefinition needs a parentAgentId field pointing to the coordinator" },
    ],
    correctAnswer: "B",
    explanation:
      "The Task tool is the mechanism for spawning subagents in Claude Code's agentic framework. It must be explicitly listed in allowedTools in the AgentDefinition; it is not included by default. Without it, the agent cannot delegate work to child agents, regardless of what other tools are available. Option C is wrong — nested spawning is supported. Options A and D describe non-existent requirements.\n\nHow to implement:\n```typescript\n// AgentDefinition with Task tool explicitly included\nconst subagentDefinition = {\n  name: \"research-subagent\",\n  description: \"Subagent that can spawn child tasks for deep research\",\n  allowedTools: [\n    \"Read\",\n    \"Grep\",\n    \"WebSearch\",\n    \"Task\",  // <-- Required to spawn child subagents\n  ],\n  systemPrompt: `You are a research agent. When a topic requires deep investigation,\n    spawn a child task using the Task tool with a specific focused prompt.`,\n};\n\n// In CLAUDE.md or agent config:\n// allowed_tools:\n//   - Read\n//   - Grep\n//   - WebSearch\n//   - Task   # Must be explicit\n```",
    keyConcept: "Task tool and allowedTools configuration in AgentDefinition",
  },
  {
    id: "D1-004",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.4",
    difficulty: "advanced",
    question:
      "A research team wants to explore three different analytical approaches to the same dataset simultaneously, then merge the best findings. Which Claude Code mechanism is specifically designed for this divergent exploration use case?",
    options: [
      { id: "A", text: "Use --resume to restore a previous session for each approach" },
      { id: "B", text: "Create three separate CLAUDE.md files, one per approach" },
      { id: "C", text: "Use fork_session to create independent branches from the current session state" },
      { id: "D", text: "Spawn three Task tools sequentially and concatenate their outputs" },
    ],
    correctAnswer: "C",
    explanation:
      "fork_session is the purpose-built mechanism for divergent exploration. It creates an independent copy of the current session — including conversation history and context — that can evolve in a different direction without affecting the original. --resume restores a single session (not branching). Separate CLAUDE.md files change configuration, not session state. Sequential Tasks cannot run truly divergent parallel explorations.\n\nHow to implement:\n```bash\n# In Claude Code interactive session:\n# After loading the dataset and establishing baseline context:\n\n# Fork session for Approach A (clustering analysis)\n/fork approach-a\n# Now in branch A — explore clustering\nclaude \"Apply k-means clustering to the dataset with k=3,5,7 and compare silhouette scores\"\n\n# Return to original and fork for Approach B\n/switch main\n/fork approach-b\nclaude \"Apply PCA dimensionality reduction and analyze top 3 principal components\"\n\n# Return to original and fork for Approach C\n/switch main\n/fork approach-c\nclaude \"Run regression analysis using all features and identify top predictors\"\n\n# Later: review all branches and merge best findings\n/switch main\nclaude \"Summarize findings from branches approach-a, approach-b, approach-c\"\n```",
    keyConcept: "fork_session for divergent exploration",
  },
  {
    id: "D1-005",
    scenario: "Customer Support Resolution Agent",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.5",
    difficulty: "intermediate",
    question:
      "Your customer support agent workflow requires that a sentiment analysis step always runs before an escalation decision step. A junior architect proposes adding this instruction to the system prompt: \"Always analyze sentiment before deciding on escalation.\" A senior architect says this is insufficient for production. What is the more reliable enforcement mechanism?",
    options: [
      { id: "A", text: "Add the instruction to both the system prompt and the first user message for redundancy" },
      { id: "B", text: "Use a PostToolUse hook that programmatically blocks the escalation tool from being called until the sentiment tool has been invoked in the current session" },
      { id: "C", text: "Include a numbered list of steps in the system prompt and ask Claude to follow them in order" },
      { id: "D", text: "Set temperature to 0 so the model reliably follows the ordering instruction" },
    ],
    correctAnswer: "B",
    explanation:
      "Prompt-based ordering guidance (options A and C) is probabilistic — the model may not always comply under adversarial inputs or edge cases. A PostToolUse hook is programmatic enforcement: it runs in the application layer and can inspect state to reject or redirect tool calls that violate the required ordering. Temperature (option D) affects randomness, not compliance with procedural requirements.\n\nHow to implement:\n```typescript\nconst sessionState = { sentimentAnalyzed: false };\n\nconst hooks = {\n  PostToolUse: async ({ toolName }) => {\n    if (toolName === \"analyze_sentiment\") {\n      sessionState.sentimentAnalyzed = true;\n    }\n  },\n  PreToolUse: async ({ toolName }) => {\n    if (toolName === \"escalate_to_human\" && !sessionState.sentimentAnalyzed) {\n      return {\n        decision: \"deny\",\n        reason: \"Sentiment analysis must run before escalation. Call analyze_sentiment first.\",\n      };\n    }\n    return { decision: \"allow\" };\n  },\n};\n\n// Register hooks when creating the agent\nconst agent = new ClaudeAgent({ tools, hooks, systemPrompt });\n```",
    keyConcept: "Programmatic enforcement via hooks vs prompt-based guidance for workflow ordering",
  },
  {
    id: "D1-006",
    scenario: "Customer Support Resolution Agent",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.5",
    difficulty: "intermediate",
    question:
      "Your support agent calls a `get_customer_data` tool which returns phone numbers in various formats: `(555) 123-4567`, `555-123-4567`, `5551234567`. You need all phone numbers stored in E.164 format before they reach the database. Where is the most appropriate place to implement this normalization?",
    options: [
      { id: "A", text: "In the system prompt, instruct Claude to normalize phone numbers in its responses" },
      { id: "B", text: "In a PostToolUse hook that intercepts tool results and normalizes phone numbers before they are passed back to Claude" },
      { id: "C", text: "In a PreToolUse hook that modifies the tool call arguments before the tool executes" },
      { id: "D", text: "In the tool itself, but only when the output will be written to the database" },
    ],
    correctAnswer: "B",
    explanation:
      "PostToolUse hooks intercept the tool result after execution and before it reaches Claude. This is the correct layer for data normalization because it operates on the actual data flowing through the pipeline, regardless of what Claude does next. Option A relies on Claude's output being perfect, which is unreliable. Option C (PreToolUse) modifies inputs, not outputs. Option D is inconsistent — normalization should happen at every exit point.\n\nHow to implement:\n```typescript\nfunction toE164(phone: string, defaultCountry = \"US\"): string {\n  // Strip all non-digits\n  const digits = phone.replace(/\\D/g, \"\");\n  // US numbers: add +1 prefix\n  if (digits.length === 10) return `+1${digits}`;\n  if (digits.length === 11 && digits.startsWith(\"1\")) return `+${digits}`;\n  return `+${digits}`; // international fallback\n}\n\nconst hooks = {\n  PostToolUse: async ({ toolName, result }) => {\n    if (toolName === \"get_customer_data\" && result?.phone) {\n      return {\n        ...result,\n        phone: toE164(result.phone),\n      };\n    }\n    return result;\n  },\n};\n```",
    keyConcept: "PostToolUse hooks for data normalization and compliance enforcement",
  },
  {
    id: "D1-007",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.6",
    difficulty: "basic",
    question:
      "A research pipeline has a fixed sequence: (1) fetch papers, (2) extract key claims, (3) cross-reference citations, (4) generate summary. Each step's input depends entirely on the previous step's output, and the task structure is known upfront. Which decomposition strategy is most appropriate here?",
    options: [
      { id: "A", text: "Dynamic adaptive decomposition — let the agent decide its next action at each step" },
      { id: "B", text: "Prompt chaining — define the sequence upfront and pass outputs as inputs through each step" },
      { id: "C", text: "Parallel execution — run all four steps simultaneously and merge results" },
      { id: "D", text: "Single-shot — provide all instructions in one prompt and let Claude complete everything at once" },
    ],
    correctAnswer: "B",
    explanation:
      "Prompt chaining is ideal when the task sequence is known, deterministic, and each step depends on the prior step's output. It gives full control over the pipeline and allows error handling at each boundary. Dynamic adaptive decomposition is better when the task structure is unknown or may change based on intermediate findings. Parallel execution requires independent tasks. Single-shot is unreliable for complex multi-step work.\n\nHow to implement:\n```typescript\nasync function runResearchPipeline(topic: string) {\n  // Step 1: Fetch papers\n  const papers = await callClaude(\n    `Fetch the 5 most relevant papers on: ${topic}`,\n    [fetchPaperTool]\n  );\n\n  // Step 2: Extract claims — receives Step 1 output\n  const claims = await callClaude(\n    `Extract the key scientific claims from these papers:\\n${papers}`,\n    []\n  );\n\n  // Step 3: Cross-reference — receives Step 2 output\n  const verified = await callClaude(\n    `Cross-reference these claims against citations:\\n${claims}`,\n    [citationTool]\n  );\n\n  // Step 4: Generate summary — receives Step 3 output\n  const summary = await callClaude(\n    `Generate a research summary from these verified claims:\\n${verified}`,\n    []\n  );\n\n  return summary;\n}\n```",
    keyConcept: "Task decomposition: prompt chaining vs dynamic adaptive decomposition",
  },
  {
    id: "D1-008",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.6",
    difficulty: "advanced",
    question:
      "A research agent is investigating a new scientific topic where it doesn't know in advance what sub-questions will emerge. After fetching the first paper, it discovers three unexpected sub-topics that each require different tools and approaches. Which decomposition strategy is designed for this scenario?",
    options: [
      { id: "A", text: "Prompt chaining — predefine three parallel chains, one per sub-topic" },
      { id: "B", text: "Dynamic adaptive decomposition — the agent decides its next actions based on what it discovers" },
      { id: "C", text: "Static orchestration — define all possible paths upfront in the system prompt" },
      { id: "D", text: "Sequential chaining — process each sub-topic serially with the same fixed prompt template" },
    ],
    correctAnswer: "B",
    explanation:
      "Dynamic adaptive decomposition allows the agent to observe intermediate results and decide what to do next based on what it finds, including spawning new sub-tasks for unexpected topics. This is the right choice when the task structure is emergent rather than known upfront. Prompt chaining requires the structure to be defined in advance. Static orchestration cannot handle unexpected branches. Sequential chaining with a fixed template cannot adapt to varied sub-topic types.\n\nHow to implement:\n```typescript\n// System prompt that enables adaptive behavior\nconst systemPrompt = `You are a research agent exploring scientific topics.\nAfter each discovery, decide dynamically what to investigate next.\nYou may spawn child tasks, search for papers, or change direction based on findings.\nAlways explain your reasoning before each action.`;\n\n// The agent loop runs until end_turn with no further tool calls\nconst response = await anthropic.messages.create({\n  model: \"claude-opus-4-5\",\n  system: systemPrompt,\n  messages: [{ role: \"user\", content: `Investigate: ${topic}` }],\n  tools: [\n    fetchPaperTool,\n    webSearchTool,\n    spawnSubtaskTool, // Task tool for creating child agents\n    saveNotesTool,\n  ],\n  max_tokens: 8192,\n});\n// Agent will dynamically chain tool calls based on discoveries\n```",
    keyConcept: "Dynamic adaptive decomposition for emergent task structures",
  },
  {
    id: "D1-009",
    scenario: "Customer Support Resolution Agent",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.7",
    difficulty: "basic",
    question:
      "An agent was interrupted mid-workflow after completing steps 1–4 of a 7-step customer onboarding process. The session state was saved. How should you resume the workflow from step 5 without repeating the completed steps?",
    options: [
      { id: "A", text: "Start a new session and include a summary of steps 1–4 in the system prompt" },
      { id: "B", text: "Use --resume with the saved session ID to restore the conversation history and continue from where it left off" },
      { id: "C", text: "Re-run the entire workflow from step 1; the model will detect completed steps and skip them" },
      { id: "D", text: "Use fork_session on the saved session to branch into a new continuation" },
    ],
    correctAnswer: "B",
    explanation:
      "--resume accepts a session ID and restores the full conversation history, allowing the agent to continue from exactly where it stopped. This is the purpose of session resumption. Starting a new session with a summary (option A) loses context fidelity and may cause inconsistencies. Re-running from step 1 is wasteful and risks side effects. fork_session is for creating divergent branches, not linear resumption.\n\nHow to implement:\n```bash\n# Save the session ID when starting\nclaude --session-id onboarding-customer-123 -p \"Begin 7-step onboarding for customer ORD-9912\"\n\n# Later, if interrupted, resume with the same session ID\nclaude --resume onboarding-customer-123\n# Claude restores full conversation history and continues from step 5\n\n# Programmatically:\nconst { sessionId } = await startClaudeSession({ task: onboardingTask });\nawait saveToDatabase({ customerId, sessionId }); // persist for recovery\n\n// On recovery:\nconst { sessionId } = await getFromDatabase({ customerId });\nawait resumeClaudeSession({ sessionId });\n```",
    keyConcept: "Session resumption with --resume",
  },
  {
    id: "D1-010",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.7",
    difficulty: "advanced",
    question:
      "A multi-step research workflow requires that a literature review be approved by a human before the data analysis phase begins. The architecture should prevent the next phase from starting automatically. Which mechanism correctly implements this prerequisite gate?",
    options: [
      { id: "A", text: "Instruct Claude in the system prompt to wait for user confirmation before proceeding to data analysis" },
      { id: "B", text: "Use a PostToolUse hook on the literature-review completion tool that pauses execution and emits an approval request to the human-in-the-loop interface, blocking the next tool call until approval is received" },
      { id: "C", text: "Set a max_tokens limit on the literature review response to force Claude to stop" },
      { id: "D", text: "Use a stop_sequence that Claude will emit when the review is complete" },
    ],
    correctAnswer: "B",
    explanation:
      "A PostToolUse hook that programmatically blocks further execution until an approval signal arrives is the reliable implementation of a prerequisite gate. It operates at the application layer, not inside Claude's generation, making it resistant to prompt injection and model non-compliance. Option A is prompt-based and unreliable. max_tokens and stop_sequence interrupt generation but do not implement conditional gate logic tied to human approval.\n\nHow to implement:\n```typescript\nlet humanApproved = false;\n\nconst hooks = {\n  PostToolUse: async ({ toolName, result }) => {\n    if (toolName === \"complete_literature_review\") {\n      // Emit approval request to human-in-the-loop interface\n      await notifyHuman({\n        type: \"approval_required\",\n        phase: \"literature_review\",\n        summary: result.summary,\n        approvalUrl: `https://your-app.com/approve/${result.reviewId}`,\n      });\n\n      // Block until human approves (poll or use webhook)\n      while (!humanApproved) {\n        await sleep(5000);\n        humanApproved = await checkApprovalStatus(result.reviewId);\n      }\n\n      return { ...result, approved: true };\n    }\n  },\n};\n\n// Webhook endpoint to receive approval\napp.post(\"/approve/:reviewId\", (req, res) => {\n  humanApproved = true;\n  res.json({ status: \"approved\" });\n});\n```",
    keyConcept: "Multi-step workflows with prerequisite gates using hooks",
  },
  {
    id: "D1-011",
    scenario: "Customer Support Resolution Agent",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.1",
    difficulty: "basic",
    question:
      "After your support agent calls `lookup_order(order_id=\"ORD-9912\")`, the tool returns successfully. You assemble the tool result and send it back to Claude. Claude responds with stop_reason: \"end_turn\" and provides a complete answer to the customer. What does this signal?",
    options: [
      { id: "A", text: "Claude needs another tool call to finish the response" },
      { id: "B", text: "Claude finished its generation and no more tool calls are needed for this turn" },
      { id: "C", text: "The response was truncated due to token limits" },
      { id: "D", text: "Claude is waiting for the next tool result before it can continue" },
    ],
    correctAnswer: "B",
    explanation:
      "stop_reason: \"end_turn\" means Claude has completed its generation naturally — it produced a full response and has no pending tool calls. The orchestration loop should present this response to the user. If another tool call were needed, stop_reason would be \"tool_use\". \"max_tokens\" indicates truncation. There is no state where \"end_turn\" means waiting for more data.\n\nHow to implement:\n```typescript\nasync function runLoop(messages: Message[]): Promise<string> {\n  const response = await anthropic.messages.create({\n    model: \"claude-opus-4-5\",\n    max_tokens: 1024,\n    tools: [lookupOrderTool],\n    messages,\n  });\n\n  switch (response.stop_reason) {\n    case \"end_turn\":\n      // Done — extract and return the final text to the user\n      const text = response.content\n        .filter(b => b.type === \"text\")\n        .map(b => b.text)\n        .join(\"\");\n      return text;\n\n    case \"tool_use\":\n      // Not done — must supply tool results and loop again\n      messages.push({ role: \"assistant\", content: response.content });\n      const results = await executeToolCalls(response.content);\n      messages.push({ role: \"user\", content: results });\n      return runLoop(messages); // recurse\n\n    case \"max_tokens\":\n      throw new Error(\"Response truncated — increase max_tokens\");\n\n    default:\n      throw new Error(`Unexpected stop_reason: ${response.stop_reason}`);\n  }\n}\n```",
    keyConcept: "Agentic loop lifecycle – end_turn stop reason",
  },
  {
    id: "D1-012",
    scenario: "Multi-Agent Research System",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    taskStatement: "1.2",
    difficulty: "advanced",
    question:
      "In your hub-and-spoke research system, the coordinator agent has accumulated 180k tokens of context across 12 subagent interactions. You notice the coordinator is starting to lose track of early subagent findings. Which architectural adjustment best addresses this?",
    options: [
      { id: "A", text: "Increase the context window by upgrading to a larger model" },
      { id: "B", text: "Have the coordinator maintain a structured \"findings register\" as a scratchpad file, writing key discoveries after each subagent interaction and reading it at the start of each new coordination step" },
      { id: "C", text: "Send all 180k tokens to each new subagent so they can help the coordinator remember" },
      { id: "D", text: "Disable context for older subagent interactions by truncating the conversation history" },
    ],
    correctAnswer: "B",
    explanation:
      "A structured scratchpad file (findings register) persists key information outside the context window, allowing the coordinator to access it selectively without carrying the entire history. This is a standard pattern for long-running agentic workflows. Simply upgrading models defers but does not solve the problem. Sending all tokens to subagents misplaces the problem and bloats subagent contexts. Truncating without summarization loses information irreversibly.\n\nHow to implement:\n```typescript\n// findings-register.json — written after each subagent interaction\nconst findingsRegister = {\n  lastUpdated: \"2024-01-15T10:30:00Z\",\n  subagentFindings: [\n    {\n      agent: \"literature-review\",\n      completedAt: \"2024-01-15T09:00:00Z\",\n      keyFindings: [\"Climate sensitivity is 3°C per doubling CO2\", \"Paper DOI: 10.1234/xyz\"],\n    },\n    {\n      agent: \"data-analysis\",\n      completedAt: \"2024-01-15T10:00:00Z\",\n      keyFindings: [\"Correlation r=0.87 between emissions and temperature\"],\n    },\n  ],\n};\n\n// Coordinator reads register at start of each step\nconst coordinatorPrompt = `\nPrevious findings (from findings-register.json):\n${JSON.stringify(findingsRegister, null, 2)}\n\nYour next task: delegate citation checking to the citation-subagent.\n`;\n\n// After each subagent completes, write new findings to file\nawait fs.writeFile(\"findings-register.json\", JSON.stringify(updatedRegister));\n```",
    keyConcept: "Context management in long-running coordinator agents using scratchpad files",
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
      "Your support agent has two tools: `search_knowledge_base(query: string)` with description \"Searches internal documentation\" and `search_orders(query: string)` with description \"Searches customer data\". Agents consistently route order-status questions to `search_knowledge_base`. What is the most likely root cause?",
    options: [
      { id: "A", text: "The tools have the same parameter names, causing the model to treat them as equivalent" },
      { id: "B", text: "The tool descriptions are too similar and ambiguous — the model uses descriptions as its primary routing signal and cannot distinguish them" },
      { id: "C", text: "The system prompt does not explicitly list which tool to use for each question type" },
      { id: "D", text: "The model ignores tool descriptions and routes randomly when tools share parameters" },
    ],
    correctAnswer: "B",
    explanation:
      "Tool descriptions are the primary mechanism by which LLMs select tools. Vague or overlapping descriptions like \"searches internal documentation\" vs \"searches customer data\" are insufficiently distinctive. The fix is to make descriptions unambiguous and specific about what each tool does and does not cover. Option C may help but is secondary to the description quality. Options A and D are incorrect — parameter names do not drive routing and the model does not ignore descriptions.\n\nHow to implement:\n```typescript\nconst tools = [\n  {\n    name: \"search_knowledge_base\",\n    description:\n      \"Searches the internal product documentation, FAQs, and policy articles. \" +\n      \"Use for questions about HOW features work, product policies, and how-to guides. \" +\n      \"Do NOT use for customer-specific data like order status, account info, or transaction history.\",\n    input_schema: {\n      type: \"object\",\n      properties: { query: { type: \"string\", description: \"The documentation topic to search\" } },\n      required: [\"query\"],\n    },\n  },\n  {\n    name: \"search_orders\",\n    description:\n      \"Searches customer order records, shipment status, and transaction history. \" +\n      \"Use for questions about a specific customer's orders, refunds, or deliveries. \" +\n      \"Do NOT use for general product questions or policy lookups.\",\n    input_schema: {\n      type: \"object\",\n      properties: { query: { type: \"string\", description: \"Customer order query, e.g. order ID or customer email\" } },\n      required: [\"query\"],\n    },\n  },\n];\n```",
    keyConcept: "Tool descriptions as the primary mechanism for LLM tool selection",
  },
  {
    id: "D2-002",
    scenario: "Customer Support Resolution Agent",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.1",
    difficulty: "advanced",
    question:
      "You redesign the two search tools with clearer descriptions. `search_knowledge_base` now reads: \"Searches the internal product documentation and FAQ articles. Use this for questions about how features work, policies, or general how-to guidance. Do NOT use for customer-specific data like orders or account info.\" After deployment, routing accuracy improves from 60% to 94%. What principle does this demonstrate?",
    options: [
      { id: "A", text: "Negative constraints in descriptions help the model understand tool boundaries as much as positive descriptions do" },
      { id: "B", text: "Longer descriptions always produce better tool selection regardless of content" },
      { id: "C", text: "The model relies on system prompt instructions, not tool descriptions, for routing decisions" },
      { id: "D", text: "Tool descriptions should avoid specifying what the tool does NOT do to prevent confusion" },
    ],
    correctAnswer: "A",
    explanation:
      "Explicit negative constraints (\"Do NOT use for...\") in tool descriptions are highly effective because they define the tool's boundaries, not just its capabilities. The model uses both positive and negative signals to make routing decisions. Longer descriptions without clarity do not improve routing (B is wrong). The model primarily uses tool descriptions, not system prompts alone, for tool selection (C is wrong). Omitting negative constraints was the original problem (D is wrong).\n\nHow to implement:\n```typescript\n// BEFORE (60% accuracy — ambiguous):\nconst badDescription = \"Searches internal documentation\";\n\n// AFTER (94% accuracy — positive + negative constraints):\nconst goodDescription =\n  \"Searches the internal product documentation and FAQ articles. \" +\n  // Positive: what it IS for\n  \"Use this for questions about how features work, policies, or general how-to guidance. \" +\n  // Negative constraint: what it is NOT for\n  \"Do NOT use for customer-specific data like orders, account balances, or transaction history.\";\n\n// Template for writing effective tool descriptions:\n// 1. One sentence: what data/system does this tool access?\n// 2. 'Use this for:' — 2-3 specific use cases\n// 3. 'Do NOT use for:' — the most common misrouting case\n```",
    keyConcept: "Effective tool description design with explicit boundaries",
  },
  {
    id: "D2-003",
    scenario: "Customer Support Resolution Agent",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.2",
    difficulty: "intermediate",
    question:
      "Your MCP server's `update_order_status` tool is called with an order_id that doesn't exist in the database. The server needs to return an error that tells Claude this is a permanent validation failure (not worth retrying) and what happened. Which response structure is most appropriate?",
    options: [
      { id: "A", text: "Return HTTP 404 and let the MCP client handle the error interpretation" },
      {
        id: "B",
        text: "Return: `{ \"isError\": true, \"content\": [{ \"type\": \"text\", \"text\": \"Order ORD-9912 not found\" }], \"errorCategory\": \"validation\", \"isRetryable\": false }`",
      },
      { id: "C", text: "Throw an exception in the tool handler; the MCP protocol will convert it to an error response" },
      { id: "D", text: "Return: `{ \"error\": \"NOT_FOUND\", \"message\": \"Order not found\" }` without the isError flag" },
    ],
    correctAnswer: "B",
    explanation:
      "MCP structured error responses should use the isError flag to signal errors explicitly to the Claude model layer, include a human-readable description in the content array, and carry metadata like errorCategory and isRetryable so the orchestrator can decide whether to retry or escalate. HTTP status codes (A) are transport-layer concerns, not MCP semantics. Throwing exceptions (C) does not give Claude structured error metadata. Omitting isError (D) means Claude may not recognize the response as an error.\n\nHow to implement:\n```typescript\n// MCP server tool handler\nserver.setRequestHandler(CallToolRequestSchema, async (request) => {\n  if (request.params.name === \"update_order_status\") {\n    const { order_id, status } = request.params.arguments;\n\n    const order = await db.orders.findById(order_id);\n    if (!order) {\n      // Structured MCP error response\n      return {\n        isError: true,\n        content: [{\n          type: \"text\",\n          text: `Order ${order_id} not found in the database. Verify the order ID and try again.`,\n        }],\n        errorCategory: \"validation\",  // permanent — do not retry\n        isRetryable: false,\n      };\n    }\n\n    await db.orders.updateStatus(order_id, status);\n    return {\n      isError: false,\n      content: [{ type: \"text\", text: `Order ${order_id} updated to ${status}` }],\n    };\n  }\n});\n```",
    keyConcept: "MCP isError flag and structured error responses with errorCategory and isRetryable",
  },
  {
    id: "D2-004",
    scenario: "Multi-Agent Research System",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.2",
    difficulty: "advanced",
    question:
      "A research subagent's `fetch_paper` tool fails because the external academic API is rate-limited (HTTP 429). You need Claude to understand whether to retry immediately, wait and retry, or escalate. Which error classification and response is most appropriate?",
    options: [
      {
        id: "A",
        text: "errorCategory: \"transient\", isRetryable: true, with a retryAfterSeconds field indicating the wait time",
      },
      { id: "B", text: "errorCategory: \"validation\", isRetryable: false, because the request format was rejected" },
      { id: "C", text: "errorCategory: \"business\", isRetryable: true, because it is a business logic constraint" },
      { id: "D", text: "errorCategory: \"permission\", isRetryable: false, because access was denied" },
    ],
    correctAnswer: "A",
    explanation:
      "A rate limit (HTTP 429) is a transient error — the service is temporarily unavailable, not permanently refusing the request. Classifying it as transient with isRetryable: true and providing a retryAfterSeconds hint allows the orchestrator to implement a smart backoff strategy. Validation errors are for malformed inputs (B is wrong). Business errors are for logical constraints like insufficient funds (C is wrong). Permission errors are for authorization failures (D is wrong). Rate limits are temporary capacity constraints, hence transient.\n\nHow to implement:\n```typescript\nasync function fetchPaper(doi: string) {\n  try {\n    const response = await academicApi.fetch(doi);\n    return {\n      isError: false,\n      content: [{ type: \"text\", text: JSON.stringify(response) }],\n    };\n  } catch (err) {\n    if (err.status === 429) {\n      const retryAfter = parseInt(err.headers[\"retry-after\"] ?? \"60\");\n      return {\n        isError: true,\n        content: [{\n          type: \"text\",\n          text: `Academic API rate limit hit. Please wait ${retryAfter}s before retrying DOI: ${doi}`,\n        }],\n        errorCategory: \"transient\",\n        isRetryable: true,\n        retryAfterSeconds: retryAfter,\n      };\n    }\n    if (err.status === 404) {\n      return {\n        isError: true,\n        content: [{ type: \"text\", text: `Paper not found: ${doi}` }],\n        errorCategory: \"validation\",\n        isRetryable: false,\n      };\n    }\n  }\n}\n```",
    keyConcept: "Transient vs validation vs business vs permission error classification",
  },
  {
    id: "D2-005",
    scenario: "Multi-Agent Research System",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.3",
    difficulty: "intermediate",
    question:
      "Your research system has 18 tools across web search, database access, file operations, citation checking, and statistical analysis. You have a literature-review subagent and a data-analysis subagent. How should you distribute tools across these agents?",
    options: [
      { id: "A", text: "Give all 18 tools to both agents so they can handle any unexpected task that arises" },
      { id: "B", text: "Give each agent 4–5 tools scoped to its specific function: literature agent gets web search and citation tools; data agent gets database, file, and statistics tools" },
      { id: "C", text: "Give the coordinator all 18 tools and have subagents request tools through the coordinator" },
      { id: "D", text: "Randomly assign 9 tools to each agent to balance the load" },
    ],
    correctAnswer: "B",
    explanation:
      "Scoped tool access (4–5 tools per agent) is a best practice for several reasons: it reduces cognitive load on the model (fewer tools means less confusion), limits the blast radius of errors, and enforces the principle of least privilege. Giving all 18 tools to both agents (A) creates ambiguity and security risk. Having all tools on the coordinator (C) breaks the separation of concerns. Random assignment (D) ignores functional requirements.\n\nHow to implement:\n```typescript\n// Literature Review Subagent — scoped to 4 tools\nconst literatureAgent = await anthropic.messages.create({\n  model: \"claude-opus-4-5\",\n  system: \"You are a literature review specialist.\",\n  tools: [\n    webSearchTool,       // Find papers online\n    fetchPaperTool,      // Download paper by DOI\n    checkCitationTool,   // Validate citations\n    saveNotesTool,       // Save findings to scratchpad\n  ],\n  messages,\n});\n\n// Data Analysis Subagent — scoped to 5 different tools\nconst dataAgent = await anthropic.messages.create({\n  model: \"claude-opus-4-5\",\n  system: \"You are a data analysis specialist.\",\n  tools: [\n    queryDatabaseTool,   // Access research datasets\n    readFileTool,        // Read data files\n    writeFileTool,       // Save processed data\n    runStatsTool,        // Statistical computations\n    generateChartTool,   // Visualizations\n  ],\n  messages,\n});\n// Neither agent has access to the other's tools\n```",
    keyConcept: "Scoped tool access — 4–5 tools per agent, not all tools",
  },
  {
    id: "D2-006",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.3",
    difficulty: "intermediate",
    question:
      "You are building a code review tool using Claude. The tool should always call the `analyze_code` function rather than choosing whether to call it or just respond in text. Which tool_choice configuration enforces this?",
    options: [
      { id: "A", text: "tool_choice: { type: \"auto\" } — Claude will call the tool when it thinks it is needed" },
      { id: "B", text: "tool_choice: { type: \"any\" } — Claude must call at least one tool but chooses which one" },
      {
        id: "C",
        text: "tool_choice: { type: \"tool\", name: \"analyze_code\" } — forces Claude to always call analyze_code specifically",
      },
      { id: "D", text: "tool_choice: { type: \"none\" } — prevents tool calls so the analysis is always in prose" },
    ],
    correctAnswer: "C",
    explanation:
      "tool_choice: { type: \"tool\", name: \"analyze_code\" } forces Claude to call that specific tool on every turn, guaranteeing structured output for every review. \"auto\" means Claude may choose not to call any tool. \"any\" means Claude must call a tool but can pick any available one. \"none\" disables tool calling entirely. When you need a guaranteed specific tool invocation, forced selection is the only reliable option.\n\nHow to implement:\n```typescript\nconst response = await anthropic.messages.create({\n  model: \"claude-opus-4-5\",\n  max_tokens: 2048,\n  tools: [\n    {\n      name: \"analyze_code\",\n      description: \"Analyzes code for bugs, style issues, and security vulnerabilities\",\n      input_schema: {\n        type: \"object\",\n        properties: {\n          bugs: { type: \"array\", items: { type: \"string\" } },\n          security_issues: { type: \"array\", items: { type: \"string\" } },\n          style_violations: { type: \"array\", items: { type: \"string\" } },\n          overall_score: { type: \"number\", minimum: 0, maximum: 10 },\n        },\n        required: [\"bugs\", \"security_issues\", \"style_violations\", \"overall_score\"],\n      },\n    },\n  ],\n  // Force Claude to ALWAYS call analyze_code — never respond in prose\n  tool_choice: { type: \"tool\", name: \"analyze_code\" },\n  messages: [{ role: \"user\", content: `Review this code:\\n\\n${codeToReview}` }],\n});\n\n// Guaranteed: response.content[0].type === \"tool_use\"\nconst review = response.content[0].input;\n```",
    keyConcept: "tool_choice forced selection for guaranteed tool invocation",
  },
  {
    id: "D2-007",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "intermediate",
    question:
      "Your team wants to share an MCP server configuration for a database tool across the whole project. An individual developer also wants a personal MCP server for their local testing environment that should NOT affect other team members. Where should each configuration live?",
    options: [
      {
        id: "A",
        text: "Both in `.mcp.json` at the project root — individual settings can be commented out per developer",
      },
      {
        id: "B",
        text: "Both in `~/.claude.json` — personal and project settings are merged at runtime",
      },
      {
        id: "C",
        text: "Team server in `.mcp.json` (project root, committed to git); personal server in `~/.claude.json` (user-level, not committed)",
      },
      {
        id: "D",
        text: "Team server in `~/.claude.json` on each machine; personal server in `.mcp.json` so it can be gitignored",
      },
    ],
    correctAnswer: "C",
    explanation:
      ".mcp.json at the project root is the project-scoped MCP configuration committed to version control, making the team's shared servers available to all developers. ~/.claude.json is the user-level configuration on each developer's machine, affecting only that user and not shared via git. Options A and B conflate the two scoping levels. Option D inverts the semantics — user-level config should be in ~/.claude.json, not in a project file.\n\nHow to implement:\n```jsonc\n// .mcp.json — committed to git, shared with all team members\n{\n  \"mcpServers\": {\n    \"team-database\": {\n      \"command\": \"node\",\n      \"args\": [\"./mcp-servers/database/index.js\"],\n      \"env\": {\n        \"DB_CONNECTION_STRING\": \"${DB_CONNECTION_STRING}\"  // from env vars\n      }\n    }\n  }\n}\n\n// ~/.claude.json — NOT committed, personal only\n{\n  \"mcpServers\": {\n    \"local-test-db\": {\n      \"command\": \"node\",\n      \"args\": [\"/Users/alice/personal-mcp/test-db/index.js\"],\n      \"env\": {\n        \"DB_URL\": \"postgresql://localhost:5432/mytest\"\n      }\n    }\n  }\n}\n// Both configs are merged at runtime — Alice gets both servers\n// Other team members only get team-database\n```",
    keyConcept: "MCP server scoping: .mcp.json (project) vs ~/.claude.json (user)",
  },
  {
    id: "D2-008",
    scenario: "Developer Productivity with Claude",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.4",
    difficulty: "advanced",
    question:
      "Your `.mcp.json` configures a database MCP server that requires a connection string. The connection string varies by environment (dev/staging/prod) and must not be committed to version control. How should you handle this in the configuration?",
    options: [
      { id: "A", text: "Hardcode the production connection string and use gitignore to prevent .mcp.json from being committed" },
      { id: "B", text: "Use environment variable expansion in .mcp.json: `\"connectionString\": \"${DB_CONNECTION_STRING}\"` so the actual value is read from the environment at runtime" },
      { id: "C", text: "Store the connection string in a separate .env file and import it using @import syntax in .mcp.json" },
      { id: "D", text: "Pass the connection string as a command-line argument when starting the Claude Code session" },
    ],
    correctAnswer: "B",
    explanation:
      "Environment variable expansion in .mcp.json (using ${VAR_NAME} syntax) allows the configuration file to be safely committed to version control while keeping secrets out. The actual values are supplied via environment variables which are set differently per environment. Gitignoring .mcp.json (A) prevents team sharing. @import is a CLAUDE.md feature, not .mcp.json (C). CLI arguments are not a standard MCP server configuration mechanism (D).\n\nHow to implement:\n```jsonc\n// .mcp.json — safe to commit, no secrets\n{\n  \"mcpServers\": {\n    \"postgres-db\": {\n      \"command\": \"npx\",\n      \"args\": [\"-y\", \"@modelcontextprotocol/server-postgres\"],\n      \"env\": {\n        // ${VAR} is expanded at runtime from the process environment\n        \"POSTGRES_CONNECTION_STRING\": \"${DB_CONNECTION_STRING}\"\n      }\n    }\n  }\n}\n\n# .env.development (gitignored)\nDB_CONNECTION_STRING=postgresql://user:pass@localhost:5432/myapp_dev\n\n# .env.production (set in CI/CD secrets)\nDB_CONNECTION_STRING=postgresql://user:prod-pass@prod-host:5432/myapp\n\n# .gitignore — only the .env files are ignored, not .mcp.json\n.env*\n!.env.example\n```",
    keyConcept: "Environment variable expansion in .mcp.json for secret management",
  },
  {
    id: "D2-009",
    scenario: "Code Generation with Claude Code",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.5",
    difficulty: "basic",
    question:
      "A developer asks Claude Code to find all TypeScript files in the `src/` directory that import from `'../utils/auth'`. Which built-in tool is most appropriate for this task?",
    options: [
      { id: "A", text: "Read — to read each TypeScript file and check its imports" },
      { id: "B", text: "Bash — to run a custom grep command" },
      {
        id: "C",
        text: "Grep — to search file contents for the import pattern across multiple files",
      },
      { id: "D", text: "Glob — to list all TypeScript files by pattern" },
    ],
    correctAnswer: "C",
    explanation:
      "Grep is designed for content search across files — finding a specific import pattern (`from '../utils/auth'`) across many files is exactly its use case. Read would require loading each file individually and is inefficient for search. Bash running grep bypasses the built-in tool optimization. Glob finds files by name pattern but does not search their contents. When searching file contents across multiple files, Grep is the correct built-in.\n\nHow to implement:\n```typescript\n// Claude Code internally uses Grep like this:\n// Grep tool call:\n{\n  \"tool\": \"Grep\",\n  \"input\": {\n    \"pattern\": \"from ['\\\"]\\\\.\\\\.?\\\\/.*utils\\\\/auth['\\\"]?\",\n    \"path\": \"src/\",\n    \"glob\": \"**/*.ts\",\n    \"output_mode\": \"files_with_matches\"\n  }\n}\n\n// Equivalent bash for reference (but prefer the built-in Grep tool):\n// grep -r --include='*.ts' -l \"from.*utils/auth\" src/\n\n// The Grep tool is preferred because:\n// 1. It respects .claudeignore file exclusions\n// 2. It has optimized permissions in the sandbox\n// 3. Results are structured for Claude to parse reliably\n```",
    keyConcept: "Built-in tool selection: Grep for content search across files",
  },
  {
    id: "D2-010",
    scenario: "Code Generation with Claude Code",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.5",
    difficulty: "basic",
    question:
      "Claude Code is helping refactor a project. It needs to find all files matching the pattern `*.service.ts` within the `src/` directory tree to understand what services exist. Which built-in tool should it use?",
    options: [
      { id: "A", text: "Grep — to search for the .service.ts extension in file contents" },
      { id: "B", text: "Bash with `find` — to list files matching the name pattern" },
      { id: "C", text: "Glob — to match files by name pattern across the directory tree" },
      { id: "D", text: "Read — to read the project root and discover files from directory listings" },
    ],
    correctAnswer: "C",
    explanation:
      "Glob is the correct built-in for finding files by name pattern (like `**/*.service.ts`). It efficiently matches file names across directory trees without reading file contents. Grep searches file contents, not file names. Bash with find bypasses the built-in tools unnecessarily. Read operates on individual files and cannot perform directory-wide name-pattern matching.\n\nHow to implement:\n```typescript\n// Claude Code internally uses Glob like this:\n{\n  \"tool\": \"Glob\",\n  \"input\": {\n    \"pattern\": \"**/*.service.ts\",\n    \"path\": \"src/\"\n  }\n}\n// Returns: [\"src/auth/auth.service.ts\", \"src/orders/order.service.ts\", ...]\n\n// Common Glob patterns for code navigation:\n// Find all test files:        \"**/*.spec.ts\" or \"**/*.test.ts\"\n// Find all React components:  \"src/components/**/*.tsx\"\n// Find all config files:      \"**/*.config.{js,ts}\"\n// Find all index files:       \"**/index.ts\"\n\n// After Glob lists the files, use Read to inspect specific ones:\n// { \"tool\": \"Read\", \"input\": { \"file_path\": \"src/auth/auth.service.ts\" } }\n```",
    keyConcept: "Built-in tool selection: Glob for file name pattern matching",
  },
  {
    id: "D2-011",
    scenario: "Customer Support Resolution Agent",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.2",
    difficulty: "advanced",
    question:
      "Your support agent calls `charge_refund(order_id, amount)`. The payment gateway rejects the request because the refund exceeds the original charge amount. This is a permanent, logical constraint — no retry will succeed. Which error response is most accurate?",
    options: [
      {
        id: "A",
        text: "errorCategory: \"transient\", isRetryable: true — the gateway may process it later",
      },
      {
        id: "B",
        text: "errorCategory: \"business\", isRetryable: false — the refund amount exceeds the original charge, a permanent business rule violation",
      },
      {
        id: "C",
        text: "errorCategory: \"validation\", isRetryable: false — the amount field is malformed",
      },
      {
        id: "D",
        text: "errorCategory: \"permission\", isRetryable: false — the agent lacks permission to issue refunds",
      },
    ],
    correctAnswer: "B",
    explanation:
      "A business error represents a violation of a domain-specific rule — in this case, that a refund cannot exceed the original charge. No retry will resolve this; a different action (like a partial refund) is needed. A transient error is for temporary service unavailability. A validation error is for malformed input (wrong types, missing fields). A permission error is for authorization failures. The refund amount constraint is a business logic boundary, not a technical one.\n\nHow to implement:\n```typescript\nasync function chargeRefund(orderId: string, amount: number) {\n  const order = await db.orders.findById(orderId);\n  const originalCharge = order.chargedAmount;\n\n  // Business rule violation — permanent, not retryable\n  if (amount > originalCharge) {\n    return {\n      isError: true,\n      content: [{\n        type: \"text\",\n        text: `Refund of $${amount} exceeds original charge of $${originalCharge} for order ${orderId}. ` +\n              `Maximum refundable amount is $${originalCharge}. ` +\n              `Consider issuing a partial refund instead.`,\n      }],\n      errorCategory: \"business\",\n      isRetryable: false,\n      // Hint to agent about what action IS valid\n      suggestedAction: `charge_refund(\"${orderId}\", ${originalCharge})`,\n    };\n  }\n\n  // Proceed with valid refund...\n}\n\n// Error category decision tree:\n// transient  → HTTP 429, 503, network timeout (retry after wait)\n// validation → wrong types, missing required fields (fix input)\n// business   → domain rule violated (different action needed)\n// permission → 401, 403 (check auth credentials)\n```",
    keyConcept: "Business error classification for permanent domain rule violations",
  },
  {
    id: "D2-012",
    scenario: "Multi-Agent Research System",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    taskStatement: "2.1",
    difficulty: "intermediate",
    question:
      "A research agent has three tools with these descriptions: `fetch_paper`: \"Gets academic papers\", `search_database`: \"Searches the database\", `download_content`: \"Downloads content from the web\". The agent consistently chooses `download_content` when told to fetch a specific paper by DOI. What is the most effective fix?",
    options: [
      { id: "A", text: "Rename `fetch_paper` to `get_academic_paper_by_doi` to make the name self-explanatory" },
      {
        id: "B",
        text: "Rewrite `fetch_paper`'s description to be specific: \"Retrieves full academic paper metadata and PDF by DOI or arXiv ID from the academic repository index. Use this — not download_content — when you have a specific paper identifier.\"",
      },
      { id: "C", text: "Remove `download_content` to eliminate the conflicting option" },
      { id: "D", text: "Add a system prompt rule: \"Always use fetch_paper for papers\"" },
    ],
    correctAnswer: "B",
    explanation:
      "Specific, differentiated descriptions are the primary fix for tool misrouting. The revised description tells the model exactly what fetch_paper handles (DOI/arXiv IDs), explicitly distinguishes it from download_content, and provides the routing signal the model needs. Renaming helps but is insufficient without a good description. Removing tools limits functionality. System prompt rules are secondary to tool descriptions and less reliable.\n\nHow to implement:\n```typescript\nconst tools = [\n  {\n    name: \"fetch_paper\",\n    // BEFORE: \"Gets academic papers\"  ← too vague, misrouting occurs\n    // AFTER: specific + differentiating + negative constraint\n    description:\n      \"Retrieves full academic paper metadata and PDF by DOI or arXiv ID \" +\n      \"from the academic repository index (PubMed, arXiv, Semantic Scholar). \" +\n      \"Use this — NOT download_content — when you have a specific paper identifier (DOI or arXiv ID). \" +\n      \"Example: fetch_paper({ doi: \\\"10.1038/nature12373\\\" })\",\n    input_schema: {\n      type: \"object\",\n      properties: {\n        doi: { type: \"string\", description: \"DOI like 10.1234/abc or arXiv ID like 2301.00001\" },\n      },\n      required: [\"doi\"],\n    },\n  },\n  {\n    name: \"download_content\",\n    description:\n      \"Downloads arbitrary web content from a URL (HTML pages, PDFs, JSON). \" +\n      \"Use for general web scraping and non-academic content. \" +\n      \"Do NOT use when you have a paper DOI — use fetch_paper instead.\",\n    input_schema: {\n      type: \"object\",\n      properties: { url: { type: \"string\" } },\n      required: [\"url\"],\n    },\n  },\n];\n```",
    keyConcept: "Tool description specificity to prevent misrouting",
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
      "A developer has a personal preference to always use snake_case for variable names. They work on multiple projects, some of which have their own coding standards. Where should they place the CLAUDE.md containing their personal snake_case preference so it applies as a default across all their projects?",
    options: [
      { id: "A", text: "In the root of each project as `.claude/CLAUDE.md`" },
      { id: "B", text: "In `~/.claude/CLAUDE.md` — the user-level location that applies globally" },
      { id: "C", text: "In the system `/etc/claude/CLAUDE.md` for machine-wide application" },
      { id: "D", text: "In each project's root as `CLAUDE.md` (not inside .claude/)" },
    ],
    correctAnswer: "B",
    explanation:
      "~/.claude/CLAUDE.md is the user-level CLAUDE.md that applies across all projects for the current user. It is the correct location for personal preferences that should serve as defaults regardless of which project is active. Project-level CLAUDE.md files in .claude/ override or extend user-level settings for that specific project. /etc/claude/ is not a supported location. CLAUDE.md at the project root is valid but project-scoped.\n\nHow to implement:\n```bash\n# Create the user-level CLAUDE.md\nmkdir -p ~/.claude\ncat > ~/.claude/CLAUDE.md << 'EOF'\n# Personal Coding Preferences\n\n## Naming Conventions\n- Use snake_case for all variable and function names\n- Use PascalCase for classes and type names\n- Use SCREAMING_SNAKE_CASE for constants\n\n## Code Style\n- Prefer explicit types over `any`\n- Always add return type annotations to functions\nEOF\n\n# Project-level can override if needed:\n# .claude/CLAUDE.md in a specific project:\n# ## Naming Conventions\n# - Use camelCase (this project follows JS conventions)\n# This overrides the user-level snake_case preference for this project only\n```",
    keyConcept: "CLAUDE.md hierarchy: user (~/.claude/CLAUDE.md) for personal defaults",
  },
  {
    id: "D3-002",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.1",
    difficulty: "intermediate",
    question:
      "A large monorepo has a root `.claude/CLAUDE.md` with general guidelines and a `services/payments/` subdirectory with payment-specific compliance rules. The team wants the compliance rules to apply only when Claude is working inside `services/payments/`. How should they structure this?",
    options: [
      { id: "A", text: "Add payment rules to the root `.claude/CLAUDE.md` behind a comment saying \"applies to payments only\"" },
      { id: "B", text: "Create `.claude/CLAUDE.md` inside `services/payments/` — Claude loads CLAUDE.md files hierarchically by directory" },
      { id: "C", text: "Use @import in the root CLAUDE.md to conditionally import payment rules" },
      { id: "D", text: "Create a separate Claude Code project for the payments service" },
    ],
    correctAnswer: "B",
    explanation:
      "Claude loads CLAUDE.md files hierarchically: it applies the user-level, then project-root, then subdirectory CLAUDE.md files as it descends into directories. Placing a CLAUDE.md inside `services/payments/.claude/` ensures those rules are only active when Claude is operating in that subtree. Adding everything to the root file ignores context (A). @import includes files unconditionally (C). Creating a separate project is heavy-handed (D).\n\nHow to implement:\n```\nmonorepo/\n├── .claude/\n│   └── CLAUDE.md          ← Root: general guidelines for all code\n├── services/\n│   ├── payments/\n│   │   ├── .claude/\n│   │   │   └── CLAUDE.md  ← Loaded ONLY when working in services/payments/\n│   │   └── src/\n│   └── inventory/\n│       └── src/\n```\n\n```markdown\n# services/payments/.claude/CLAUDE.md\n\n## PCI-DSS Compliance Rules\n- NEVER log card numbers, CVVs, or full PANs\n- All payment data must be encrypted at rest (AES-256)\n- Use the `mask_pan()` utility before displaying card numbers\n- All payment mutations require dual approval in production\n- Always import from `@payments/secure-utils`, never from `lodash` directly\n```",
    keyConcept: "CLAUDE.md directory-level hierarchy for context-specific rules",
  },
  {
    id: "D3-003",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.1",
    difficulty: "intermediate",
    question:
      "A project's `.claude/CLAUDE.md` is becoming very long with sections for testing guidelines, API conventions, and security rules. The team wants to split it into modular files. What is the correct syntax to include a separate security rules file from within CLAUDE.md?",
    options: [
      { id: "A", text: "`#include .claude/rules/security.md`" },
      { id: "B", text: "`@import .claude/rules/security.md`" },
      { id: "C", text: "`!import rules/security.md`" },
      { id: "D", text: "`{{.claude/rules/security.md}}`" },
    ],
    correctAnswer: "B",
    explanation:
      "@import is the correct Claude Code syntax for including external files within a CLAUDE.md. This enables modular configuration where each concern (testing, security, APIs) lives in its own file and is composed together. #include is a C preprocessor directive, not CLAUDE.md syntax. !import and the double-brace syntax are not supported. Using @import, the team can maintain each rules file independently.\n\nHow to implement:\n```markdown\n# .claude/CLAUDE.md — main configuration file\n\n## Project Overview\nThis is the payments microservice. Follow all rules below.\n\n@import .claude/rules/testing.md\n@import .claude/rules/api-conventions.md\n@import .claude/rules/security.md\n@import .claude/rules/database.md\n```\n\n```markdown\n# .claude/rules/security.md\n\n## Security Rules\n- Never commit secrets or API keys\n- Always validate and sanitize user input\n- Use parameterized queries — never concatenate SQL strings\n- Run `npm audit` before each PR\n```\n\n```markdown\n# .claude/rules/testing.md\n\n## Testing Guidelines\n- Every new function needs a corresponding unit test\n- Use `describe/it` blocks, not `test()`\n- Mock external HTTP calls with `msw`\n```",
    keyConcept: "@import syntax for modular CLAUDE.md composition",
  },
  {
    id: "D3-004",
    scenario: "Claude Code for Continuous Integration",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.2",
    difficulty: "intermediate",
    question:
      "You need Claude Code to perform a code review in a CI pipeline. The pipeline must capture Claude's structured review as JSON for downstream processing, and Claude should not wait for interactive input. Which combination of flags achieves this?",
    options: [
      { id: "A", text: "`claude --interactive --format json`" },
      { id: "B", text: "`claude -p \"Review this code\" --output-format json`" },
      { id: "C", text: "`claude --batch --json-output`" },
      { id: "D", text: "`claude --ci-mode --structured`" },
    ],
    correctAnswer: "B",
    explanation:
      "-p (--print) is the non-interactive flag that submits a single prompt and exits, making it suitable for CI pipelines. --output-format json instructs Claude to output in JSON format for machine consumption. Together they provide non-interactive JSON output. --interactive is the opposite of what CI needs. --batch and --ci-mode are not valid Claude Code flags.\n\nHow to implement:\n```yaml\n# .github/workflows/code-review.yml\njobs:\n  claude-review:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n\n      - name: Run Claude Code Review\n        env:\n          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}\n        run: |\n          # -p: non-interactive (single prompt, then exit)\n          # --output-format json: structured JSON output\n          claude -p \"Review the changed files for bugs and security issues. \\\n            Return findings as JSON with fields: severity, file, line, message.\" \\\n            --output-format json \\\n            > review-results.json\n\n      - name: Process review results\n        run: |\n          # Parse JSON output for downstream use\n          cat review-results.json | jq '.findings[] | select(.severity == \"high\")'\n\n      - name: Fail if high severity issues found\n        run: |\n          HIGH=$(cat review-results.json | jq '[.findings[] | select(.severity==\"high\")] | length')\n          if [ \"$HIGH\" -gt 0 ]; then exit 1; fi\n```",
    keyConcept: "-p flag for CI non-interactive use, --output-format json for structured output",
  },
  {
    id: "D3-005",
    scenario: "Claude Code for Continuous Integration",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.2",
    difficulty: "advanced",
    question:
      "A CI job uses Claude Code to validate API contracts. The job must ensure Claude returns a specific JSON schema matching `{ \"valid\": boolean, \"violations\": string[] }`. Which flag enforces that Claude's JSON output conforms to this schema?",
    options: [
      { id: "A", text: "`--output-format json` alone guarantees schema conformance" },
      { id: "B", text: "`--json-schema <schema-file>` enforces the output against a JSON schema definition" },
      { id: "C", text: "Include the schema definition in the prompt and ask Claude to follow it" },
      { id: "D", text: "`--structured-output <schema>` validates output at the Claude API level" },
    ],
    correctAnswer: "B",
    explanation:
      "--json-schema accepts a schema file and constrains Claude Code's JSON output to conform to that schema. This provides machine-enforced schema conformance rather than relying on Claude's probabilistic adherence. --output-format json ensures JSON format but does not validate against a specific schema. Including the schema in the prompt is prompt-based (probabilistic). --structured-output is not a valid Claude Code CLI flag.\n\nHow to implement:\n```bash\n# 1. Define the schema file\ncat > /tmp/contract-validation-schema.json << 'EOF'\n{\n  \"type\": \"object\",\n  \"required\": [\"valid\", \"violations\"],\n  \"properties\": {\n    \"valid\": { \"type\": \"boolean\" },\n    \"violations\": {\n      \"type\": \"array\",\n      \"items\": { \"type\": \"string\" }\n    }\n  },\n  \"additionalProperties\": false\n}\nEOF\n\n# 2. Run Claude Code with schema enforcement\nclaude -p \"Validate this OpenAPI contract for compliance: $(cat api-contract.yaml)\" \\\n  --output-format json \\\n  --json-schema /tmp/contract-validation-schema.json \\\n  > validation-result.json\n\n# 3. Output is guaranteed to match the schema\ncat validation-result.json\n# { \"valid\": false, \"violations\": [\"Missing required field 'operationId' on POST /users\"] }\n```",
    keyConcept: "--json-schema flag for enforcing output schema conformance in CI",
  },
  {
    id: "D3-006",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.3",
    difficulty: "intermediate",
    question:
      "Your project has a custom slash command `/generate-component` that scaffolds React components following project conventions. You want this command available to everyone on the team. Where should the command definition file be placed?",
    options: [
      { id: "A", text: "`~/.claude/commands/generate-component.md` — in each developer's home directory" },
      { id: "B", text: "`.claude/commands/generate-component.md` — in the project repository, committed to git" },
      { id: "C", text: "`.claude/skills/generate-component/SKILL.md` — as a skill rather than a command" },
      { id: "D", text: "`CLAUDE.md` — embed command definitions directly in the main configuration file" },
    ],
    correctAnswer: "B",
    explanation:
      ".claude/commands/ at the project root is the location for project-scoped slash commands that should be shared with the team via version control. ~/.claude/commands/ is for personal commands that apply to the individual developer across all projects. Skills (SKILL.md) are for reusable agentic behaviors with specific context and tool configurations, not simple commands. Embedding in CLAUDE.md is not the correct mechanism for slash command definitions.\n\nHow to implement:\n```\n# File: .claude/commands/generate-component.md\n# This file defines the /generate-component slash command\n# Committed to git — available to all team members\n```\n\n```markdown\n# .claude/commands/generate-component.md\n\nGenerate a React component following project conventions.\n\nArguments: $COMPONENT_NAME $COMPONENT_TYPE (functional|class)\n\nSteps:\n1. Create `src/components/$COMPONENT_NAME/$COMPONENT_NAME.tsx`\n2. Create `src/components/$COMPONENT_NAME/$COMPONENT_NAME.test.tsx`\n3. Create `src/components/$COMPONENT_NAME/index.ts` (barrel export)\n4. Follow the component template in `.claude/templates/component.tsx`\n5. Add proper TypeScript props interface\n6. Export from `src/components/index.ts`\n```\n\n```bash\n# Usage in Claude Code:\n/generate-component UserProfile functional\n```",
    keyConcept: ".claude/commands/ (project) vs ~/.claude/commands/ (personal) for slash commands",
  },
  {
    id: "D3-007",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.3",
    difficulty: "advanced",
    question:
      "You are creating a skill for Claude Code that performs a security audit of authentication modules. The skill needs its own isolated context (not the main session's conversation history), access to only the Read and Grep tools, and should accept a target module path as an argument. Which SKILL.md configuration fields enable this?",
    options: [
      {
        id: "A",
        text: "`context: shared`, `allowed-tools: [Read, Grep, Bash]`, `argument-hint: <target-module>`",
      },
      {
        id: "B",
        text: "`context: fork`, `allowed-tools: [Read, Grep]`, `argument-hint: <module-path>`",
      },
      {
        id: "C",
        text: "`context: new`, `tools: [Read, Grep]`, `args: <module-path>`",
      },
      {
        id: "D",
        text: "`isolation: true`, `allowed-tools: [Read, Grep]`, `parameter: <module-path>`",
      },
    ],
    correctAnswer: "B",
    explanation:
      "`context: fork` creates an isolated context branched from the current session, preventing the skill from polluting or reading the main conversation. `allowed-tools: [Read, Grep]` scopes the skill to only the tools it needs. `argument-hint: <module-path>` provides the hint shown when invoking the skill. Option A includes Bash (unnecessary security risk) and uses `context: shared` (breaks isolation). Options C and D use non-existent field names.\n\nHow to implement:\n```markdown\n---\ncontext: fork\nallowed-tools:\n  - Read\n  - Grep\nargument-hint: <module-path>\n---\n\n# Security Audit Skill\n\nPerform a security audit on the authentication module at `$ARGUMENTS`.\n\nCheck for:\n1. Hard-coded credentials or secrets (grep for password=, secret=, api_key=)\n2. SQL injection vulnerabilities (unparameterized queries)\n3. Missing input validation on user-controlled fields\n4. Insecure token storage patterns\n5. Missing rate limiting on auth endpoints\n6. Weak password hashing (MD5, SHA1 without salt)\n\nFor each finding, report:\n- File path and line number\n- Vulnerability type\n- Severity: critical/high/medium/low\n- Recommended fix\n```\n\n```bash\n# Usage: invoke the skill with the module path as argument\n/security-audit src/auth/\n```",
    keyConcept: "SKILL.md configuration: context fork, allowed-tools, and argument-hint",
  },
  {
    id: "D3-008",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.4",
    difficulty: "intermediate",
    question:
      "A developer is about to ask Claude Code to refactor a critical authentication module. Before Claude makes any changes, the developer wants to see Claude's plan and approve it. Which mode should they activate?",
    options: [
      { id: "A", text: "Direct execution mode — Claude executes immediately and explains after" },
      { id: "B", text: "Plan mode — Claude presents a detailed plan for review and approval before executing any actions" },
      { id: "C", text: "Dry-run mode — Claude simulates changes without writing files" },
      { id: "D", text: "Review mode — Claude generates a report but requires a separate execution command" },
    ],
    correctAnswer: "B",
    explanation:
      "Plan mode is the Claude Code feature that causes it to present a step-by-step plan of what it intends to do and wait for human approval before executing any file modifications. This is the appropriate safety gate for sensitive operations like auth refactoring. Direct execution mode makes changes immediately (A). \"Dry-run mode\" and \"Review mode\" are not named features of Claude Code; plan mode is the correct term.\n\nHow to implement:\n```bash\n# Activate plan mode before sensitive operations\nclaude --plan \"Refactor the authentication module in src/auth/ to use JWT instead of sessions\"\n\n# Claude will output something like:\n# PLAN:\n# 1. Read src/auth/session.ts to understand current implementation\n# 2. Read src/auth/middleware.ts to identify session checks\n# 3. Install jsonwebtoken package\n# 4. Create src/auth/jwt.ts with token generation/validation\n# 5. Update src/auth/middleware.ts to validate JWTs instead of sessions\n# 6. Update src/auth/login.ts to return JWT on successful login\n# 7. Update src/auth/logout.ts to invalidate tokens\n# 8. Update tests in src/auth/__tests__/\n#\n# Proceed? (y/n)\n\n# Only after developer types 'y' does Claude begin executing\n```\n\n```markdown\n# You can also set plan mode in CLAUDE.md to always require approval:\n## Workflow\n- Always use plan mode before modifying files in src/auth/ or src/payments/\n```",
    keyConcept: "Plan mode for human-in-the-loop approval before execution",
  },
  {
    id: "D3-009",
    scenario: "Claude Code for Continuous Integration",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.5",
    difficulty: "advanced",
    question:
      "Your CI pipeline uses Claude Code to generate test cases for new code, then in a separate step uses Claude Code to review those test cases. You want the review step to have no memory of the generation step's reasoning. How do you implement this context isolation?",
    options: [
      { id: "A", text: "Use --resume with a blank session ID to start fresh" },
      { id: "B", text: "Pipe the generated test file as input to a new Claude Code session started with -p; each -p invocation is a fresh session with no prior context" },
      { id: "C", text: "Clear the context by sending a 'forget previous' message before the review prompt" },
      { id: "D", text: "Use --no-cache to prevent Claude from accessing previous responses" },
    ],
    correctAnswer: "B",
    explanation:
      "Each invocation of `claude -p` starts a completely new session with no conversation history, providing true context isolation. The review session cannot access the generation session's reasoning because they are separate processes with separate contexts. --resume with any session ID restores a prior session (A). \"Forget previous\" instructions are prompt-based and unreliable (C). --no-cache is not a valid Claude Code flag and would not achieve session isolation (D).\n\nHow to implement:\n```yaml\n# .github/workflows/test-generation-and-review.yml\njobs:\n  generate-and-review:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n\n      # Step 1: Generate tests (fresh session via -p)\n      - name: Generate test cases\n        run: |\n          claude -p \"Generate comprehensive unit tests for src/payments/refund.ts. \\\n            Save tests to src/payments/__tests__/refund.test.ts\" \\\n            --output-format json > generation-log.json\n        # Session ends here — no state carries over\n\n      # Step 2: Review tests (completely NEW session via -p)\n      - name: Review generated tests\n        run: |\n          # -p starts a FRESH session with no knowledge of generation step\n          # The review only sees the test FILE, not generation reasoning\n          claude -p \"Review the test file at src/payments/__tests__/refund.test.ts. \\\n            Check for: missing edge cases, incorrect assertions, missing error scenarios. \\\n            Return findings as JSON.\" \\\n            --output-format json > review-results.json\n        # Truly independent review — no generation bias\n```",
    keyConcept: "Session context isolation using separate -p invocations for review vs generation",
  },
  {
    id: "D3-010",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.6",
    difficulty: "intermediate",
    question:
      "You want Claude Code to iteratively improve a function using a test-driven approach: write tests first, then implement until the tests pass, then refine. Which workflow pattern best describes this?",
    options: [
      { id: "A", text: "Interview pattern — Claude asks the developer clarifying questions before writing code" },
      { id: "B", text: "Test-driven iteration — provide failing tests as the specification, have Claude implement until tests pass, then refine" },
      { id: "C", text: "I/O examples pattern — provide input-output pairs as specifications for code generation" },
      { id: "D", text: "Single-shot generation — write the full specification upfront and generate all code at once" },
    ],
    correctAnswer: "B",
    explanation:
      "Test-driven iteration is an iterative refinement pattern where failing tests serve as the specification. Claude implements code, runs tests, observes failures, and revises until all tests pass. This creates a feedback loop that converges on correct behavior. The interview pattern is for gathering requirements (A). I/O examples specify behavior through data pairs (C) — useful but not the same as running tests. Single-shot has no iterative feedback loop (D).\n\nHow to implement:\n```bash\n# Step 1: Write the failing tests first (specification)\ncat > src/utils/formatPrice.test.ts << 'EOF'\ndescribe('formatPrice', () => {\n  it('formats integer cents to dollar string', () => {\n    expect(formatPrice(1999)).toBe('$19.99');\n  });\n  it('handles zero', () => {\n    expect(formatPrice(0)).toBe('$0.00');\n  });\n  it('handles negative (refund)', () => {\n    expect(formatPrice(-500)).toBe('-$5.00');\n  });\n});\nEOF\n\n# Step 2: Ask Claude to implement until tests pass\nclaude \"Implement formatPrice(cents: number): string in src/utils/formatPrice.ts.\nThe tests in src/utils/formatPrice.test.ts define the expected behavior.\nRun the tests with 'npm test formatPrice' and iterate until all tests pass.\"\n\n# Claude will:\n# 1. Read the test file\n# 2. Implement the function\n# 3. Run npm test\n# 4. See failures, revise implementation\n# 5. Repeat until all tests pass\n```",
    keyConcept: "Test-driven iteration as an iterative refinement workflow",
  },
  {
    id: "D3-011",
    scenario: "Developer Productivity with Claude",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.1",
    difficulty: "advanced",
    question:
      "Your project has a `.claude/rules/` directory. You want a rule file `api-versioning.yaml` to only be loaded when Claude is working in the `src/api/` subdirectory. What mechanism enables this conditional loading?",
    options: [
      { id: "A", text: "YAML frontmatter in the rule file with a `paths:` key specifying `src/api/**`" },
      { id: "B", text: "An @import statement in the project CLAUDE.md with a conditional expression" },
      { id: "C", text: "A `.claudeignore` file that excludes the rule when not in the api directory" },
      { id: "D", text: "Naming the file `api-versioning.api.yaml` — the extension pattern triggers directory-based loading" },
    ],
    correctAnswer: "A",
    explanation:
      "YAML frontmatter in `.claude/rules/` files supports a `paths:` key that specifies glob patterns. When Claude is operating in a path matching the pattern (like `src/api/**`), the rule is loaded; otherwise it is ignored. This is the built-in mechanism for conditional rule loading. @import includes files unconditionally. .claudeignore controls which project files Claude can see, not rule loading. File naming conventions do not control rule activation.\n\nHow to implement:\n```yaml\n# .claude/rules/api-versioning.yaml\n---\npaths:\n  - src/api/**          # Only loaded when working in src/api/\n  - src/api-gateway/**  # Also applies to the gateway module\n---\n\n# API Versioning Rules\n\n## Versioning Requirements\n- All new endpoints must include an API version prefix: /v1/, /v2/\n- Never remove fields from existing response schemas (additive only)\n- Deprecated endpoints must return a Deprecation header with sunset date\n- Version negotiation via Accept header is required for v3+\n\n## Breaking Change Policy\n- Any breaking change requires a new version number\n- Maintain backward compatibility for N-1 versions minimum\n```\n\n```yaml\n# .claude/rules/database.yaml\n---\npaths:\n  - src/db/**\n  - src/migrations/**\n---\n# Database rules — only loaded in db/migrations directories\n```",
    keyConcept: ".claude/rules/ with YAML frontmatter paths for conditional rule loading",
  },
  {
    id: "D3-012",
    scenario: "Code Generation with Claude Code",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    taskStatement: "3.6",
    difficulty: "intermediate",
    question:
      "A developer wants Claude Code to understand the exact shape of data their API returns before generating a parser. Instead of a long prose description, they want to show Claude what the input looks like and what the output should look like. Which iterative refinement pattern is most appropriate?",
    options: [
      { id: "A", text: "Test-driven iteration — write unit tests for the parser and let Claude implement" },
      { id: "B", text: "I/O examples pattern — provide concrete input JSON samples and expected output structures as the specification" },
      { id: "C", text: "Interview pattern — have Claude ask questions about the API schema" },
      { id: "D", text: "Prompt chaining — first describe the API in prose, then generate the parser in a second prompt" },
    ],
    correctAnswer: "B",
    explanation:
      "The I/O examples pattern is ideal when you can demonstrate the transformation with concrete data. Showing Claude sample API responses (input) and the desired parsed structure (output) removes ambiguity and gives it a precise specification to work from. Test-driven iteration requires writing test code, which may be premature. The interview pattern is for requirements gathering. Prompt chaining solves a different problem (multi-step pipelines).\n\nHow to implement:\n```typescript\n// Prompt using the I/O examples pattern:\nconst prompt = `\nGenerate a TypeScript parser function for this API response.\n\nINPUT (raw API response):\n${JSON.stringify({\n  \"product_id\": \"SKU-123\",\n  \"product_name\": \"Blue Widget\",\n  \"price_cents\": 1999,\n  \"in_stock\": true,\n  \"tags\": [\"electronics\", \"widgets\"],\n  \"created_at\": \"2024-01-15T10:30:00Z\"\n}, null, 2)}\n\nEXPECTED OUTPUT (parsed structure):\n${JSON.stringify({\n  id: \"SKU-123\",\n  name: \"Blue Widget\",\n  priceUsd: 19.99,\n  available: true,\n  categories: [\"electronics\", \"widgets\"],\n  createdAt: new Date(\"2024-01-15T10:30:00Z\")\n}, null, 2)}\n\nThe parser should handle:\n- snake_case to camelCase conversion\n- cents to dollars conversion\n- ISO string to Date object conversion\n- Array field renaming (tags -> categories)\n`;\n```",
    keyConcept: "I/O examples pattern for specification through concrete data",
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
      "You are building a contract review system. Your current prompt says: \"Review this contract and flag any problems.\" The output is inconsistent — sometimes a bullet list, sometimes prose, sometimes nothing. What is the most effective change to the prompt?",
    options: [
      { id: "A", text: "Add \"Be thorough\" to the prompt to encourage more comprehensive output" },
      {
        id: "B",
        text: "Replace with explicit criteria: \"Identify clauses that: (1) limit liability beyond $10k, (2) include automatic renewal, (3) restrict IP ownership. For each finding, state the clause number, the exact text, and why it is flagged.\"",
      },
      { id: "C", text: "Add few-shot examples of good reviews to the prompt" },
      { id: "D", text: "Increase temperature to get more diverse outputs and then filter" },
    ],
    correctAnswer: "B",
    explanation:
      "Explicit, measurable criteria produce consistent outputs because they tell Claude exactly what to look for and how to structure each finding. Vague instructions like \"flag any problems\" or \"be thorough\" leave too much to interpretation. Few-shot examples (C) help with format consistency but do not define what to look for. Increasing temperature (D) increases variability, making consistency worse, not better.\n\nHow to implement:\n```typescript\nconst systemPrompt = `You are a contract review specialist.\nFor each contract provided, identify clauses that meet ANY of these criteria:\n1. Limit liability below $10,000\n2. Include automatic renewal without explicit opt-out\n3. Restrict the client's ownership of IP created during the engagement\n\nFor EACH finding, output exactly:\n- Clause number (e.g., \"Section 8.2\")\n- Exact quoted text from the contract\n- Which criterion it triggers (1, 2, or 3 from above)\n- Risk level: HIGH / MEDIUM / LOW\n- Recommended action\n\nIf no clauses match the criteria, output: \"No flagged clauses found.\"`;\n\nconst response = await anthropic.messages.create({\n  model: \"claude-opus-4-5\",\n  system: systemPrompt,\n  messages: [{ role: \"user\", content: `Review this contract:\\n\\n${contractText}` }],\n  max_tokens: 2048,\n});\n```",
    keyConcept: "Explicit criteria over vague instructions for consistent review outputs",
  },
  {
    id: "D4-002",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.2",
    difficulty: "intermediate",
    question:
      "You are extracting product attributes from e-commerce descriptions. Your prompt with instructions alone produces inconsistent formatting: sometimes `color: blue`, sometimes `Color: Blue`, sometimes `colour: blue`. What technique most reliably fixes format inconsistency?",
    options: [
      { id: "A", text: "Add \"Use consistent lowercase field names\" to the prompt instructions" },
      { id: "B", text: "Provide 3–5 few-shot examples that all demonstrate the exact output format you want" },
      { id: "C", text: "Use a JSON schema with tool_use to enforce the output structure programmatically" },
      { id: "D", text: "Post-process the output with a regex normalization step" },
    ],
    correctAnswer: "C",
    explanation:
      "Using tool_use with a JSON schema provides guaranteed structural conformance — the model must produce output that matches the schema, eliminating format variability entirely. Few-shot examples (B) significantly improve consistency but are still probabilistic. Prompt instructions (A) are the weakest form — the model may not perfectly follow them. Post-processing (D) is a workaround, not a solution, and may miss edge cases. For guaranteed structure, tool_use with schema is superior.\n\nHow to implement:\n```typescript\nconst response = await anthropic.messages.create({\n  model: \"claude-opus-4-5\",\n  tools: [\n    {\n      name: \"extract_product_attributes\",\n      description: \"Extracts structured product attributes from a description\",\n      input_schema: {\n        type: \"object\",\n        properties: {\n          // Schema enforces lowercase field names and specific types\n          color: { type: \"string\", description: \"Product color in lowercase (e.g., 'blue', 'red')\" },\n          size: { type: \"string\", enum: [\"xs\", \"s\", \"m\", \"l\", \"xl\", \"xxl\"] },\n          material: { type: \"string\" },\n          price_usd: { type: \"number\" },\n          brand: { type: \"string\" },\n        },\n        required: [\"color\", \"size\", \"material\"],\n      },\n    },\n  ],\n  tool_choice: { type: \"tool\", name: \"extract_product_attributes\" },\n  messages: [{ role: \"user\", content: `Extract attributes from: ${productDescription}` }],\n  max_tokens: 1024,\n});\n// Schema guarantees: always lowercase 'color', always valid size enum, etc.\nconst attrs = response.content[0].input;\n```",
    keyConcept: "tool_use with JSON schema for guaranteed structured output",
  },
  {
    id: "D4-003",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.2",
    difficulty: "intermediate",
    question:
      "You are designing a JSON schema for extracting product reviews. Some products have a warranty, others don't. The `warrantyMonths` field should be included when present and omitted when absent. How should this be modeled?",
    options: [
      { id: "A", text: "Make `warrantyMonths` required with a default value of 0 when absent" },
      { id: "B", text: "Make `warrantyMonths` a required field typed as `integer | null`, always present but nullable" },
      { id: "C", text: "Make `warrantyMonths` an optional field (not in the required array) with type `integer`" },
      { id: "D", text: "Use a string field `hasWarranty: \"yes\" | \"no\"` instead of a nullable integer" },
    ],
    correctAnswer: "C",
    explanation:
      "Making `warrantyMonths` optional (absent from the `required` array in the JSON schema) allows it to be present when data exists and omitted when it does not. This produces cleaner data than always including null. Option B (nullable required field) is also valid but forces the field to always appear. Option A's default-0 conflates \"no warranty\" with \"unknown\". Option D loses type safety and the duration information.\n\nHow to implement:\n```typescript\nconst productReviewSchema = {\n  type: \"object\",\n  properties: {\n    productName: { type: \"string\" },\n    rating: { type: \"integer\", minimum: 1, maximum: 5 },\n    reviewText: { type: \"string\" },\n    // Optional field — omitted when no warranty info in the review\n    warrantyMonths: {\n      type: \"integer\",\n      minimum: 0,\n      description: \"Warranty duration in months. Omit entirely if no warranty mentioned.\",\n    },\n    // Optional field — omitted if not mentioned\n    verifiedPurchase: { type: \"boolean\" },\n  },\n  // warrantyMonths is NOT in required — it can be absent\n  required: [\"productName\", \"rating\", \"reviewText\"],\n};\n\n// With warranty:    { productName: \"Widget\", rating: 4, reviewText: \"...\", warrantyMonths: 24 }\n// Without warranty: { productName: \"Widget\", rating: 4, reviewText: \"...\" }\n// vs. nullable approach (always present):\n//                   { productName: \"Widget\", rating: 4, reviewText: \"...\", warrantyMonths: null }\n```",
    keyConcept: "Schema design: required vs optional fields for conditional data",
  },
  {
    id: "D4-004",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.2",
    difficulty: "advanced",
    question:
      "You are extracting product categories from text. Most products fall into a known set: \"Electronics\", \"Clothing\", \"Books\", \"Home\". But some products don't fit. How should you model the category field to handle both cases reliably?",
    options: [
      { id: "A", text: "Use `type: \"string\"` with no constraints and rely on Claude to pick from the list" },
      {
        id: "B",
        text: "Use an enum: `[\"Electronics\", \"Clothing\", \"Books\", \"Home\"]` and accept that unknown categories will fail validation",
      },
      {
        id: "C",
        text: "Use enum: `[\"Electronics\", \"Clothing\", \"Books\", \"Home\", \"other\"]` combined with an optional `categoryDetail: string` field for when \"other\" is selected",
      },
      { id: "D", text: "Use `type: \"string\"` and add a separate boolean `isKnownCategory` field" },
    ],
    correctAnswer: "C",
    explanation:
      "The \"other\" + detail pattern is a best practice for open-ended categorical extraction. It preserves the benefit of a constrained enum (enabling filtering and grouping on known categories) while allowing graceful handling of unknowns through the detail field. Pure enum without \"other\" (B) breaks on valid unknowns. Unconstrained string (A) loses the enum's machine-readability benefits. The boolean + string approach (D) duplicates logic and is harder to use downstream.\n\nHow to implement:\n```typescript\nconst categorySchema = {\n  type: \"object\",\n  properties: {\n    productName: { type: \"string\" },\n    category: {\n      type: \"string\",\n      // Known categories as enum values + escape hatch\n      enum: [\"Electronics\", \"Clothing\", \"Books\", \"Home\", \"other\"],\n      description: \"Primary product category. Use 'other' if none of the known categories fit.\",\n    },\n    // Optional — only populated when category === 'other'\n    categoryDetail: {\n      type: \"string\",\n      description: \"Specific category name when 'other' is selected. E.g., 'Sporting Goods', 'Automotive'\",\n    },\n  },\n  required: [\"productName\", \"category\"],\n};\n\n// Usage in downstream processing:\nfunction displayCategory(product: Product): string {\n  if (product.category === \"other\") {\n    return product.categoryDetail ?? \"Uncategorized\";\n  }\n  return product.category; // Always one of the known enum values\n}\n\n// Filter known categories efficiently:\nconst electronics = products.filter(p => p.category === \"Electronics\");\nconst unknowns = products.filter(p => p.category === \"other\");\n```",
    keyConcept: "Schema design: enum with 'other' + detail field for open-ended categories",
  },
  {
    id: "D4-005",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.3",
    difficulty: "advanced",
    question:
      "Your extraction pipeline occasionally produces JSON where Claude hallucinates a `price` field as `\"free\"` (a string) instead of `0` (a number) for no-cost products. You have a JSON schema validator in your pipeline. What is the correct retry strategy when validation fails?",
    options: [
      { id: "A", text: "Retry with the original prompt — the model may produce a valid response on the second attempt" },
      {
        id: "B",
        text: "Retry with error feedback: include the original output, the validation error message, and instruct Claude to fix only the failing field",
      },
      { id: "C", text: "Post-process the output: detect string prices and coerce them to numbers" },
      { id: "D", text: "Lower the temperature to 0 to prevent the hallucination from occurring" },
    ],
    correctAnswer: "B",
    explanation:
      "Retry-with-error-feedback is the correct validation-retry loop pattern. By including the exact validation error (\"price must be a number, got string 'free'\") in the retry prompt, Claude has precise information to fix the specific field without regenerating everything. Retrying with the same prompt (A) is probabilistic and wastes tokens. Post-processing (C) is a workaround that may miss cases. Temperature 0 reduces randomness but does not prevent all format errors, especially for edge cases like \"free\".\n\nHow to implement:\n```typescript\nasync function extractWithRetry(text: string, schema: object, maxRetries = 2) {\n  let lastOutput: string | null = null;\n  let lastError: string | null = null;\n\n  for (let attempt = 0; attempt <= maxRetries; attempt++) {\n    // Build messages: on retry, include the error feedback\n    const userMessage = attempt === 0\n      ? `Extract product data from: ${text}`\n      : `Your previous extraction had a validation error. Please fix it.\n\nYour previous output:\n${lastOutput}\n\nValidation error: ${lastError}\n\nPlease return corrected JSON fixing ONLY the invalid field(s).`;\n\n    const response = await anthropic.messages.create({\n      model: \"claude-opus-4-5\",\n      tools: [{ name: \"extract\", input_schema: schema }],\n      tool_choice: { type: \"tool\", name: \"extract\" },\n      messages: [{ role: \"user\", content: userMessage }],\n      max_tokens: 1024,\n    });\n\n    const output = response.content[0].input;\n    const validation = validateAgainstSchema(output, schema);\n\n    if (validation.valid) return output;\n\n    lastOutput = JSON.stringify(output, null, 2);\n    lastError = validation.errors[0].message; // e.g., \"price must be number, got string\"\n  }\n\n  throw new Error(`Extraction failed after ${maxRetries} retries: ${lastError}`);\n}\n```",
    keyConcept: "Validation-retry loops with error feedback for structured output correction",
  },
  {
    id: "D4-006",
    scenario: "Claude Code for Continuous Integration",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.4",
    difficulty: "intermediate",
    question:
      "Your CI pipeline needs to run Claude-based code reviews on 500 files overnight. Cost is a concern but latency is not — results must be ready by the next morning. Which API feature reduces cost by 50% for this use case?",
    options: [
      { id: "A", text: "Prompt caching — cache the system prompt to reduce input token costs" },
      { id: "B", text: "Message Batches API — submit all reviews as a batch for 50% cost reduction, with results available within 24 hours" },
      { id: "C", text: "Streaming API — stream responses to reduce time-to-first-token and overall latency costs" },
      { id: "D", text: "Parallel API calls — run 50 simultaneous requests to reduce wall-clock time" },
    ],
    correctAnswer: "B",
    explanation:
      "The Message Batches API provides a 50% cost reduction by processing requests asynchronously within a 24-hour window, making it ideal for bulk workloads where real-time response is not needed. Prompt caching reduces costs for repeated system prompts but not by 50% across all tokens. Streaming reduces latency, not cost. Parallel requests hit rate limits and do not reduce per-token cost.\n\nHow to implement:\n```typescript\nimport Anthropic from \"@anthropic-ai/sdk\";\nconst anthropic = new Anthropic();\n\n// Step 1: Create the batch with all 500 file reviews\nconst batch = await anthropic.beta.messages.batches.create({\n  requests: files.map((file, i) => ({\n    custom_id: `review-${file.name}-${i}`,\n    params: {\n      model: \"claude-opus-4-5\",\n      max_tokens: 1024,\n      system: \"You are a code reviewer. Identify bugs, security issues, and style violations.\",\n      messages: [{\n        role: \"user\",\n        content: `Review this file:\\n\\n${file.content}`,\n      }],\n    },\n  })),\n});\n\nconsole.log(`Batch created: ${batch.id}`);\n// 50% cheaper than 500 individual API calls\n\n// Step 2: Poll until complete (up to 24 hours)\nasync function waitForBatch(batchId: string) {\n  while (true) {\n    const status = await anthropic.beta.messages.batches.retrieve(batchId);\n    if (status.processing_status === \"ended\") break;\n    await new Promise(r => setTimeout(r, 60_000)); // poll every minute\n  }\n  return anthropic.beta.messages.batches.results(batchId);\n}\n```",
    keyConcept: "Message Batches API: 50% cost reduction for non-real-time bulk processing",
  },
  {
    id: "D4-007",
    scenario: "Claude Code for Continuous Integration",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.4",
    difficulty: "advanced",
    question:
      "Your team submits 500 code review requests via the Message Batches API. One reviewer asks: \"Can we use tool_use in the batch to get structured JSON reviews?\" Another says that tool calling is not supported in batch mode. Who is correct?",
    options: [
      { id: "A", text: "The first reviewer — tool_use works identically in batch and real-time modes" },
      { id: "B", text: "The second reviewer — the Message Batches API does not support tool calling; use JSON mode or prompt-based structured output instead" },
      { id: "C", text: "Both are partially right — tool definitions can be included but tool execution is deferred" },
      { id: "D", text: "Neither — batch mode only supports plain text responses, not structured data at all" },
    ],
    correctAnswer: "B",
    explanation:
      "The Message Batches API does not support tool calling. For structured output in batch mode, you must use alternative approaches: prompt-based JSON (asking Claude to output JSON directly) or JSON mode if available. Tool execution requires a real-time agentic loop, which is incompatible with the async batch model. Option A is incorrect. Option C misrepresents the behavior. Option D is too restrictive — structured JSON output via prompting is possible, just not via tool_use.\n\nHow to implement:\n```typescript\n// WRONG: tool_use is not supported in batch mode\n// const badBatchRequest = {\n//   custom_id: \"review-1\",\n//   params: {\n//     tools: [analyzeCodeTool],       // ← NOT supported\n//     tool_choice: { type: \"tool\" },  // ← NOT supported\n//     ...\n//   }\n// };\n\n// CORRECT: Use prompt-based JSON instead\nconst batchRequest = {\n  custom_id: \"review-file-1\",\n  params: {\n    model: \"claude-opus-4-5\",\n    max_tokens: 1024,\n    system: `You are a code reviewer. Always respond with valid JSON only.\nSchema: { \"bugs\": string[], \"security\": string[], \"style\": string[], \"score\": number }`,\n    messages: [{\n      role: \"user\",\n      content: `Review and return JSON:\\n\\n${fileContent}`,\n    }],\n    // No tools field — use prompt to enforce JSON structure\n  },\n};\n\n// Parse and validate the JSON response after batch completes\nconst result = JSON.parse(batchResult.message.content[0].text);\n```",
    keyConcept: "Message Batches API: no tool calling; use prompt-based structured output",
  },
  {
    id: "D4-008",
    scenario: "Code Generation with Claude Code",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.5",
    difficulty: "advanced",
    question:
      "A code review pipeline sends each file to Claude individually, then receives 50 separate reviews. Reviewers complain that Claude misses cross-file issues like circular dependencies and architectural inconsistencies. How should the pipeline be restructured?",
    options: [
      { id: "A", text: "Send all 50 files in a single prompt so Claude can review them all at once" },
      { id: "B", text: "Use a multi-pass review: first pass does per-file local reviews; second pass sends summaries of all files plus the per-file findings to identify cross-file integration issues" },
      { id: "C", text: "Ask each per-file review to also check for cross-file issues by including the full codebase as context" },
      { id: "D", text: "Run three separate single-file reviews per file and vote on the findings" },
    ],
    correctAnswer: "B",
    explanation:
      "Multi-pass review is the correct pattern: the first pass efficiently handles local, file-scoped issues. The second pass focuses specifically on integration issues using the outputs of the first pass — it can see patterns across files without needing to re-read all source code. Sending all 50 files at once (A) may exceed context limits and is unfocused. Adding cross-file instructions to each per-file review (C) scales poorly and produces redundant cross-file analysis. Voting (D) does not solve the cross-file visibility problem.\n\nHow to implement:\n```typescript\nasync function multiPassCodeReview(files: SourceFile[]) {\n  // Pass 1: Per-file local reviews (can run in parallel)\n  const localReviews = await Promise.all(\n    files.map(file => reviewFile(file))\n  );\n\n  // Compile summaries from pass 1 (not full source)\n  const fileSummaries = localReviews.map((review, i) => ({\n    file: files[i].path,\n    exports: review.exports,\n    imports: review.imports,\n    localIssues: review.issues,\n  }));\n\n  // Pass 2: Cross-file integration review\n  // Only sends summaries (~5% of original token count)\n  const crossFileReview = await anthropic.messages.create({\n    model: \"claude-opus-4-5\",\n    system: \"You are an architecture reviewer. Analyze cross-file issues.\",\n    messages: [{\n      role: \"user\",\n      content: `Analyze these file summaries for cross-file issues:\\n` +\n               `- Circular dependencies\\n` +\n               `- Architecture violations\\n` +\n               `- Inconsistent error handling patterns\\n\\n` +\n               `File summaries:\\n${JSON.stringify(fileSummaries, null, 2)}`,\n    }],\n    max_tokens: 4096,\n  });\n\n  return { localReviews, crossFileIssues: crossFileReview };\n}\n```",
    keyConcept: "Multi-pass review: per-file local pass + cross-file integration pass",
  },
  {
    id: "D4-009",
    scenario: "Code Generation with Claude Code",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.5",
    difficulty: "intermediate",
    question:
      "A developer submits a code review and asks Claude to review it in the same session where the code was generated. The review comes back unusually lenient, missing the same bugs Claude just wrote. What is the most likely cause?",
    options: [
      { id: "A", text: "Claude is biased toward code it generated because it was trained to prefer its own output" },
      { id: "B", text: "Self-review in the same session retains the reasoning context from generation, making Claude likely to reproduce the same blind spots rather than approaching the code fresh" },
      { id: "C", text: "The code review prompt was not specific enough about what to look for" },
      { id: "D", text: "The model temperature was too low, preventing the model from identifying creative bugs" },
    ],
    correctAnswer: "B",
    explanation:
      "Self-review in the same session is a known limitation: Claude retains the reasoning and assumptions from the generation phase in its context window. When reviewing, it approaches the code with those same assumptions already active, reducing the likelihood of catching bugs that stem from incorrect assumptions. The solution is to use a separate session for review (fresh context) or have a different agent perform the review. Option A is not accurate. Option C may also be true but is not the root cause here. Option D is irrelevant.\n\nHow to implement:\n```typescript\n// PROBLEMATIC: review in same session as generation\nasync function badWorkflow(task: string) {\n  const session = await startSession();\n  await session.send(`Generate a function to: ${task}`);\n  // Same session — retains generation reasoning\n  const review = await session.send(\"Now review the code you just wrote\");\n  // Review is biased — Claude already \"committed\" to its implementation decisions\n}\n\n// CORRECT: separate sessions for generation and review\nasync function goodWorkflow(task: string) {\n  // Session 1: Generation\n  const genResult = await anthropic.messages.create({\n    model: \"claude-opus-4-5\",\n    messages: [{ role: \"user\", content: `Generate a function to: ${task}` }],\n    max_tokens: 2048,\n  });\n  const generatedCode = extractCode(genResult);\n\n  // Session 2: Review — completely fresh context, no generation history\n  const reviewResult = await anthropic.messages.create({\n    model: \"claude-opus-4-5\",\n    system: \"You are a critical code reviewer. Find all bugs and security issues.\",\n    messages: [{ role: \"user\", content: `Review this code for bugs:\\n\\n${generatedCode}` }],\n    max_tokens: 2048,\n  });\n  // Fresh perspective — no blind spots from generation\n}\n```",
    keyConcept: "Self-review limitation: same session retains generation reasoning context",
  },
  {
    id: "D4-010",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.2",
    difficulty: "advanced",
    question:
      "You are extracting medical diagnosis codes from clinical notes. The task is ambiguous: the same symptoms can map to multiple valid codes, and different notations are used across clinics. Which technique most reliably addresses this ambiguity?",
    options: [
      { id: "A", text: "Use a very detailed system prompt explaining all possible notations" },
      { id: "B", text: "Provide few-shot examples that cover the ambiguous cases — each example shows an ambiguous clinical note mapped to the correct code with an explanation" },
      { id: "C", text: "Use the Message Batches API to process all notes simultaneously" },
      { id: "D", text: "Force tool_use with a schema that only allows one code per diagnosis" },
    ],
    correctAnswer: "B",
    explanation:
      "Few-shot examples are the most effective technique for resolving task ambiguity, especially when the ambiguity is semantic (multiple valid interpretations) rather than structural. Showing concrete examples of how to resolve ambiguous cases teaches the model the decision logic through demonstration. Detailed system prompts help but are less effective than examples for complex disambiguation. The Batches API is a cost/latency optimization, not a quality technique. Forcing a single code via schema does not resolve which code is correct.\n\nHow to implement:\n```typescript\nconst systemPrompt = `You are a medical coding specialist extracting ICD-10 codes from clinical notes.\n\nHere are examples showing how to handle ambiguous cases:\n\n--- EXAMPLE 1 ---\nNote: \"Patient presents with chest pain, radiating to left arm, diaphoresis\"\nCoding reasoning: Symptoms strongly suggest acute MI. Without test confirmation, use rule-out code.\nOutput: { primary: \"R07.9\", secondary: [], confidence: \"probable\", reasoning: \"Radiating chest pain pattern\" }\n\n--- EXAMPLE 2 ---\nNote: \"Pt c/o SOB x3 days, hx of CHF\"\nCoding reasoning: SOB with CHF history — could be CHF exacerbation or separate respiratory issue.\nOutput: { primary: \"I50.9\", secondary: [\"R06.00\"], confidence: \"probable\", reasoning: \"Known CHF history makes cardiac etiology primary\" }\n\n--- EXAMPLE 3 ---\nNote: \"Fever, cough, positive rapid flu test\"\nCoding reasoning: Confirmed flu — use confirmed diagnosis code not suspected.\nOutput: { primary: \"J11.1\", secondary: [], confidence: \"confirmed\", reasoning: \"Positive rapid test confirms influenza\" }\n\nFor each note, follow the same reasoning pattern shown above.`;\n```",
    keyConcept: "Few-shot examples for resolving ambiguity in complex extraction tasks",
  },
  {
    id: "D4-011",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.4",
    difficulty: "intermediate",
    question:
      "You submit 1000 records to the Message Batches API at 2:00 PM. A stakeholder asks for results at 2:30 PM. The batch has not completed. What should you tell the stakeholder about the Message Batches API's processing model?",
    options: [
      { id: "A", text: "The batch failed — batches should complete within minutes" },
      { id: "B", text: "The batch is working normally — the Message Batches API processes requests asynchronously within a 24-hour window, not in real time" },
      { id: "C", text: "The batch is delayed — contact Anthropic support to expedite it" },
      { id: "D", text: "The batch size exceeds limits — split it into batches of 100 for faster processing" },
    ],
    correctAnswer: "B",
    explanation:
      "The Message Batches API is designed for asynchronous bulk processing with a completion window of up to 24 hours. It trades latency for cost savings (50% reduction). It is not a low-latency API. 30 minutes is well within the normal processing window. The stakeholder's expectation of sub-minute results is incompatible with the batch API model. If real-time results were needed, the standard synchronous API should have been used.\n\nHow to implement:\n```typescript\n// Choosing the right API based on latency requirements:\n\n// Use SYNCHRONOUS API when:\n// - Results needed in < 30 seconds\n// - Real-time user interaction\n// - Latency-sensitive workflows\nconst realtimeResult = await anthropic.messages.create({ ... });\n\n// Use MESSAGE BATCHES API when:\n// - Results can wait up to 24 hours\n// - Overnight processing jobs\n// - Cost is more important than speed\nconst batch = await anthropic.beta.messages.batches.create({ requests: [...] });\n\n// Polling pattern for batch completion:\nasync function pollBatchCompletion(batchId: string): Promise<BatchResults> {\n  const maxWait = 24 * 60 * 60 * 1000; // 24 hours\n  const pollInterval = 5 * 60 * 1000;  // Poll every 5 minutes\n  const startTime = Date.now();\n\n  while (Date.now() - startTime < maxWait) {\n    const batch = await anthropic.beta.messages.batches.retrieve(batchId);\n    if (batch.processing_status === \"ended\") {\n      return anthropic.beta.messages.batches.results(batchId);\n    }\n    console.log(`Batch ${batch.processing_status} — ${batch.request_counts.processing} remaining`);\n    await new Promise(r => setTimeout(r, pollInterval));\n  }\n  throw new Error(\"Batch did not complete within 24 hours\");\n}\n```",
    keyConcept: "Message Batches API: 24-hour processing window, not real-time",
  },
  {
    id: "D4-012",
    scenario: "Structured Data Extraction",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    taskStatement: "4.1",
    difficulty: "basic",
    question:
      "You need to extract product names, prices, and stock status from retail listings. The extraction must return valid JSON on every call for downstream processing. Which approach provides the strongest guarantee of valid JSON output?",
    options: [
      { id: "A", text: "Include \"Output valid JSON only\" in the system prompt" },
      { id: "B", text: "Use few-shot examples showing JSON output" },
      {
        id: "C",
        text: "Define a tool (e.g., `extract_product`) with a JSON schema and use tool_choice to force Claude to call it — the API enforces schema conformance",
      },
      { id: "D", text: "Ask Claude to double-check its own JSON before responding" },
    ],
    correctAnswer: "C",
    explanation:
      "Using tool_use with a defined JSON schema and forcing the tool call via tool_choice is the strongest guarantee of structured output. The API enforces that the tool call arguments conform to the schema before returning the response. Prompt instructions (A) and few-shot examples (B) are probabilistic. Self-checking (D) is also probabilistic and adds latency. For mission-critical JSON conformance, tool_use with schema is the definitive approach.\n\nHow to implement:\n```typescript\nconst response = await anthropic.messages.create({\n  model: \"claude-opus-4-5\",\n  max_tokens: 1024,\n  tools: [\n    {\n      name: \"extract_product\",\n      description: \"Extracts structured product data from a retail listing\",\n      input_schema: {\n        type: \"object\",\n        properties: {\n          name: {\n            type: \"string\",\n            description: \"Full product name\",\n          },\n          price_usd: {\n            type: \"number\",\n            description: \"Price in USD as a decimal number (e.g., 29.99)\",\n          },\n          in_stock: {\n            type: \"boolean\",\n            description: \"True if product is currently available\",\n          },\n        },\n        required: [\"name\", \"price_usd\", \"in_stock\"],\n      },\n    },\n  ],\n  // API-enforced: Claude MUST call extract_product with a valid schema\n  tool_choice: { type: \"tool\", name: \"extract_product\" },\n  messages: [{ role: \"user\", content: `Extract product data from: ${listingText}` }],\n});\n\n// Guaranteed valid structure — API rejected any non-conforming response\nconst product = response.content[0].input as {\n  name: string;\n  price_usd: number;\n  in_stock: boolean;\n};\n```",
    keyConcept: "tool_use with forced tool_choice for guaranteed JSON schema conformance",
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
      "A support agent has been running for 2 hours and has accumulated 80k tokens of conversation. To reduce context size, a developer applies progressive summarization — condensing earlier conversation turns into summaries. The agent starts giving incorrect refund amounts that differ from what was discussed earlier. What is the most likely cause?",
    options: [
      { id: "A", text: "The model became confused by having both summaries and full conversation turns in context" },
      { id: "B", text: "Progressive summarization condensed specific numbers and dates from earlier turns, causing the agent to lose precise factual data like the exact refund amount agreed upon" },
      { id: "C", text: "The summarization prompt was too brief — longer summaries would preserve more detail" },
      { id: "D", text: "The model's context window was reset, losing all earlier context" },
    ],
    correctAnswer: "B",
    explanation:
      "Progressive summarization is known to risk condensing or dropping specific quantitative data (numbers, dates, amounts, identifiers) during the summarization process. Prose summaries capture themes and intent but frequently lose exact figures. The solution is to extract and preserve critical facts (like agreed refund amounts) in a structured \"case facts\" block outside the summarization scope. Options A and C mischaracterize the problem. Option D describes a different failure mode.\n\nHow to implement:\n```typescript\ninterface CaseFacts {\n  customerId: string;\n  caseNumber: string;\n  agreedRefundAmount: number | null;\n  originalOrderAmount: number;\n  escalationStatus: \"open\" | \"escalated\" | \"resolved\";\n  keyDates: Record<string, string>; // ISO dates\n}\n\n// Extract and freeze critical facts BEFORE summarizing\nfunction buildSummarizationPrompt(conversation: Message[], facts: CaseFacts): string {\n  return `Summarize this support conversation into 3-4 sentences capturing the customer's issue and the resolution direction.\nDO NOT include specific numbers — those are preserved separately.\n\nConversation:\n${conversation.map(m => `${m.role}: ${m.content}`).join(\"\\n\")}`;\n}\n\n// The case facts block is NEVER summarized — always included verbatim\nfunction buildContextForNextTurn(summary: string, facts: CaseFacts): string {\n  return `CASE FACTS (exact values — do not modify):\n${JSON.stringify(facts, null, 2)}\n\nCONVERSATION SUMMARY:\n${summary}`;\n}\n```",
    keyConcept: "Progressive summarization risks: condensing numbers, dates, and specific facts",
  },
  {
    id: "D5-002",
    scenario: "Customer Support Resolution Agent",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.1",
    difficulty: "advanced",
    question:
      "To prevent loss of critical facts during context compression, your team decides to maintain a structured block at the top of each support conversation. This block always contains: customer_id, case_number, agreed_resolution, refund_amount, and escalation_status. What is this pattern called and why does it work?",
    options: [
      { id: "A", text: "System prompt injection — facts in the system prompt are never summarized" },
      { id: "B", text: "Structured \"case facts\" block — critical, precisely-typed data is maintained separately from the flowing conversation, ensuring it is never compressed away" },
      { id: "C", text: "Context anchoring — placing facts at the top ensures they are in the primacy position and weighted more heavily" },
      { id: "D", text: "Token budgeting — reserving tokens for facts prevents them from being displaced" },
    ],
    correctAnswer: "B",
    explanation:
      "The structured case facts block pattern separates critical factual data (numbers, IDs, agreed values) from the narrative conversation. Because it is maintained as a distinct structured block rather than embedded in prose, it is not subject to progressive summarization and can be explicitly preserved or updated. Option A is related but \"system prompt injection\" is not the canonical name for this pattern. Option C (primacy) is a real effect but describes position bias, not this pattern. Option D describes token management strategy.\n\nHow to implement:\n```typescript\n// The case facts block is maintained as the FIRST user message\n// It gets UPDATED in-place as the conversation progresses, never summarized\n\nfunction formatCaseFactsBlock(facts: CaseFacts): string {\n  return `<case_facts>\ncustomer_id: ${facts.customerId}\ncase_number: ${facts.caseNumber}\nagreed_resolution: ${facts.agreedResolution ?? \"pending\"}\nrefund_amount: ${facts.refundAmount !== null ? `$${facts.refundAmount.toFixed(2)}` : \"not yet agreed\"}\nescalation_status: ${facts.escalationStatus}\norder_date: ${facts.orderDate}\noriginal_amount: $${facts.originalAmount.toFixed(2)}\n</case_facts>`;\n}\n\n// When building messages for Claude:\nconst messages: Message[] = [\n  {\n    role: \"user\",\n    // Facts block always first — never compressed\n    content: formatCaseFactsBlock(currentFacts) + \"\\n\\n\" + conversationSummary,\n  },\n  // ... recent turns follow ...\n];\n\n// After each tool call that updates a fact, update the block:\nasync function afterRefundAgreed(amount: number) {\n  currentFacts.refundAmount = amount;\n  currentFacts.agreedResolution = \"full_refund\";\n  // The next turn's case facts block will reflect the update\n}\n```",
    keyConcept: "Structured 'case facts' blocks for persistent critical data across context boundaries",
  },
  {
    id: "D5-003",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.2",
    difficulty: "intermediate",
    question:
      "A research agent receives a single API response containing 40 documents as tool results, totaling 60k tokens. The agent needs to synthesize all findings but you notice it consistently ignores documents 15–30 while accurately processing documents 1–10 and 35–40. Which context reliability phenomenon explains this?",
    options: [
      { id: "A", text: "Token budget exhaustion — the agent runs out of tokens before reaching the middle documents" },
      { id: "B", text: "Lost-in-the-middle effect — LLMs attend more reliably to content at the beginning and end of the context window than to content in the middle" },
      { id: "C", text: "Tool result truncation — MCP automatically truncates tool results that exceed 4k tokens" },
      { id: "D", text: "Attention decay — the model's attention mechanism degrades linearly across the context" },
    ],
    correctAnswer: "B",
    explanation:
      "The lost-in-the-middle effect is a well-documented phenomenon: LLMs have lower recall and attention for content in the middle of long context windows compared to the beginning and end. This is especially pronounced for retrieval tasks. The solution is to reorder important documents to the beginning or end, or to restructure how information is presented. Token exhaustion (A) would cut off all subsequent content, not skip the middle. Tool result truncation (C) is not automatic. Attention decay (D) is not linear — the pattern is U-shaped.\n\nHow to implement:\n```typescript\n// Strategy: reorder documents to mitigate lost-in-the-middle\nfunction orderDocumentsForReliableRetrieval(\n  documents: Document[],\n  relevanceScores: number[]\n): Document[] {\n  // Sort by relevance descending\n  const sorted = documents\n    .map((doc, i) => ({ doc, score: relevanceScores[i] })\n    .sort((a, b) => b.score - a.score);\n\n  const n = sorted.length;\n  const result: Document[] = new Array(n);\n\n  // Place most relevant at beginning and end (avoid the middle)\n  // Even-indexed positions go to the front, odd-indexed to the back\n  let front = 0, back = n - 1;\n  sorted.forEach(({ doc }, i) => {\n    if (i % 2 === 0) result[front++] = doc;\n    else result[back--] = doc;\n  });\n\n  return result;\n}\n\n// Alternative: use multiple smaller requests instead of one giant context\nasync function synthesizeInChunks(documents: Document[], chunkSize = 10) {\n  const chunks = [];\n  for (let i = 0; i < documents.length; i += chunkSize) {\n    const chunk = documents.slice(i, i + chunkSize);\n    const summary = await summarizeChunk(chunk);\n    chunks.push(summary);\n  }\n  return synthesizeSummaries(chunks); // final synthesis on summaries\n}\n```",
    keyConcept: "Lost-in-the-middle effect: reliability drops for middle-of-context content",
  },
  {
    id: "D5-004",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.2",
    difficulty: "advanced",
    question:
      "Your research system makes 15 sequential tool calls, each returning 5k tokens of data. By tool call 12, the agent is struggling to recall findings from tool calls 1–4. You check the context and find that the tool results alone are consuming 75k tokens. What structural change best addresses disproportionate tool result token accumulation?",
    options: [
      { id: "A", text: "Increase the context window to 200k tokens to accommodate more tool results" },
      { id: "B", text: "After each tool call, have a summarization step that distills the result to key findings before appending to context, rather than appending raw results" },
      { id: "C", text: "Limit each tool to returning a maximum of 1k tokens" },
      { id: "D", text: "Store tool results in a database and have Claude query them as needed" },
    ],
    correctAnswer: "B",
    explanation:
      "Summarizing tool results before appending them to context is the correct mitigation for tool result token accumulation. Raw tool results (especially database query outputs and web content) tend to be verbose. A summarization step extracts the essential findings (key facts, numbers, conclusions) and discards the noise, dramatically reducing token usage while preserving the information that matters. Simply increasing context size (A) is not scalable. Hard limits on tool output (C) may truncate necessary data. Option D (D) is a valid pattern but more complex and still doesn't solve the in-context accumulation problem for an ongoing session.\n\nHow to implement:\n```typescript\nasync function runToolWithSummarization(\n  toolName: string,\n  toolArgs: object,\n  maxSummaryTokens = 500\n): Promise<{ raw: string; summary: string }> {\n  // Execute the tool\n  const rawResult = await executeTool(toolName, toolArgs);\n\n  // Summarize if result is large (> 1k tokens estimated)\n  const estimatedTokens = rawResult.length / 4;\n  if (estimatedTokens < 1000) {\n    return { raw: rawResult, summary: rawResult };\n  }\n\n  // Distill to key findings only\n  const summaryResponse = await anthropic.messages.create({\n    model: \"claude-haiku-4-5\", // Use faster/cheaper model for summarization\n    system: \"Extract only the key findings, numbers, dates, and conclusions. Be concise.\",\n    messages: [{ role: \"user\", content: `Summarize these tool results in ${maxSummaryTokens} tokens:\\n${rawResult}` }],\n    max_tokens: maxSummaryTokens,\n  });\n\n  return {\n    raw: rawResult, // Store full result externally if needed\n    summary: extractText(summaryResponse), // Use summary in context\n  };\n}\n\n// In the agentic loop, append SUMMARIES not raw results:\nmessages.push({\n  role: \"user\",\n  content: [{ type: \"tool_result\", tool_use_id: block.id, content: summary }],\n});\n```",
    keyConcept: "Tool results accumulating tokens disproportionately; summarize before appending",
  },
  {
    id: "D5-005",
    scenario: "Customer Support Resolution Agent",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.3",
    difficulty: "intermediate",
    question:
      "Your support agent should escalate to a human agent when the customer explicitly requests a human, when no policy covers the customer's issue, or when the agent has attempted 3 times without resolution. A developer suggests also adding sentiment escalation: \"escalate when the customer seems frustrated.\" Why is sentiment-based escalation unreliable?",
    options: [
      { id: "A", text: "Sentiment analysis requires a separate model and adds latency to each turn" },
      { id: "B", text: "Sentiment detection is subjective and inconsistent — the same text may be classified differently across turns, leading to unpredictable escalation triggers" },
      { id: "C", text: "Customer sentiment is not visible to Claude in text-only interactions" },
      { id: "D", text: "Adding sentiment escalation would conflict with the explicit request trigger" },
    ],
    correctAnswer: "B",
    explanation:
      "Sentiment-based escalation is unreliable because sentiment is subjective, context-dependent, and inconsistently classified. A customer saying \"this is ridiculous\" might be frustrated or joking depending on context. Sentiment signals also vary by culture, communication style, and context. The three triggers listed (explicit request, policy gap, repeated failure to progress) are objective and deterministic. Reliable escalation triggers should be unambiguous and based on observable facts, not inferred emotional states.\n\nHow to implement:\n```typescript\n// RELIABLE: objective, deterministic escalation conditions\ninterface EscalationState {\n  attemptCount: number;\n  policyFound: boolean;\n  customerRequestedHuman: boolean;\n}\n\nfunction shouldEscalate(state: EscalationState, latestMessage: string): boolean {\n  // Condition 1: Explicit request (deterministic text matching)\n  const explicitRequest = [\n    \"speak to a human\", \"talk to an agent\", \"human please\",\n    \"real person\", \"supervisor\", \"escalate\"\n  ].some(phrase => latestMessage.toLowerCase().includes(phrase));\n\n  // Condition 2: Policy gap (objective fact)\n  const noPolicy = !state.policyFound;\n\n  // Condition 3: Repeated failure (countable fact)\n  const repeatedFailure = state.attemptCount >= 3;\n\n  return explicitRequest || noPolicy || repeatedFailure;\n}\n\n// UNRELIABLE: do NOT use sentiment as an escalation trigger\n// function seemsFrustrated(message: string): boolean {\n//   // Same message classifies differently each call — inconsistent\n//   // \"This is ridiculous\" — frustrated or sarcastic? Context-dependent.\n//   // Different cultures express frustration differently\n// }\n```",
    keyConcept: "Sentiment-based escalation is unreliable; use objective escalation triggers",
  },
  {
    id: "D5-006",
    scenario: "Customer Support Resolution Agent",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.3",
    difficulty: "advanced",
    question:
      "A support agent attempts to process a refund but the payment API returns an error. The agent must communicate the failure to the orchestrator with enough information to decide whether to retry, try an alternative, or escalate. Which error propagation structure is most complete?",
    options: [
      {
        id: "A",
        text: "`{ \"success\": false, \"message\": \"Refund failed\" }`",
      },
      {
        id: "B",
        text: "`{ \"success\": false, \"failureType\": \"transient\", \"failedStep\": \"payment_api\", \"partialResults\": { \"orderUpdated\": true, \"paymentProcessed\": false }, \"retryable\": true, \"userMessage\": \"Your refund is being processed. Please wait a moment.\" }`",
      },
      {
        id: "C",
        text: "`{ \"error\": true, \"code\": 503, \"timestamp\": \"2024-01-15T10:30:00Z\" }`",
      },
      {
        id: "D",
        text: "`{ \"success\": false, \"stackTrace\": \"PaymentGatewayError at line 42...\" }`",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Structured error propagation should include: failure type (to classify the error), failed step (to identify where in the workflow it failed), partial results (to know what succeeded so it is not retried), retryable flag (to guide the orchestrator's next action), and a user-facing message. Option A is too sparse for orchestrator decision-making. Option C provides HTTP-level information without semantic context. Option D exposes internal stack traces — a security risk that is also useless for orchestration decisions.\n\nHow to implement:\n```typescript\ninterface WorkflowErrorResult {\n  success: false;\n  failureType: \"transient\" | \"validation\" | \"business\" | \"permission\";\n  failedStep: string;\n  partialResults: Record<string, boolean>;\n  retryable: boolean;\n  retryAfterSeconds?: number;\n  userMessage: string;         // Safe to show customer\n  internalDetails?: string;    // For logging only — NEVER send to customer\n}\n\nasync function processRefund(orderId: string, amount: number): Promise<WorkflowResult> {\n  const orderUpdated = await updateOrderStatus(orderId, \"refund_pending\");\n\n  try {\n    await paymentGateway.issueRefund(orderId, amount);\n    return { success: true, orderId, amount };\n  } catch (err) {\n    // Structured error with full orchestrator context\n    return {\n      success: false,\n      failureType: err.status === 503 ? \"transient\" : \"business\",\n      failedStep: \"payment_api\",\n      partialResults: {\n        orderUpdated: true,   // Already done — don't retry this\n        paymentProcessed: false, // Failed — retry only this\n      },\n      retryable: err.status === 503,\n      retryAfterSeconds: err.status === 503 ? 30 : undefined,\n      userMessage: \"Your refund request is processing. You'll receive confirmation within 24 hours.\",\n      // internalDetails logged separately, never returned to Claude context\n    };\n  }\n}\n```",
    keyConcept: "Structured error propagation with failure type, partial results, and retryable flag",
  },
  {
    id: "D5-007",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.4",
    difficulty: "intermediate",
    question:
      "A research agent is exploring a large codebase across many sessions. After each session, important findings (function signatures, architectural patterns, dependency graphs) are lost and must be re-discovered. What is the most appropriate mechanism to persist these findings across context boundaries?",
    options: [
      { id: "A", text: "Use --resume to restore the full conversation history each time" },
      { id: "B", text: "Use scratchpad files to write key findings in a structured format at the end of each session, and read them at the start of the next session" },
      { id: "C", text: "Increase the context window to hold the entire research history" },
      { id: "D", text: "Use fork_session to branch from the previous session state" },
    ],
    correctAnswer: "B",
    explanation:
      "Scratchpad files are the correct mechanism for persisting key findings across context boundaries. Writing structured notes (function signatures, patterns, dependencies) to a file at session end and reading them at session start is more efficient than --resume (which restores full conversation history including all the noise) and more reliable than relying on context window size. fork_session is for creating exploration branches within a session, not for cross-session persistence.\n\nHow to implement:\n```typescript\n// At session END — write structured findings to scratchpad\nconst findings = {\n  sessionDate: new Date().toISOString(),\n  exploredPaths: [\n    \"src/auth/\",\n    \"src/middleware/\",\n  ],\n  keyFunctions: [\n    { name: \"validateJWT\", path: \"src/auth/jwt.ts:42\", signature: \"(token: string) => Promise<Payload>\" },\n    { name: \"authMiddleware\", path: \"src/middleware/auth.ts:15\", signature: \"(req, res, next) => void\" },\n  ],\n  architectureNotes: [\n    \"Auth uses stateless JWT — no session store\",\n    \"Middleware checks Authorization header, falls back to cookie\",\n    \"Token refresh handled in src/auth/refresh.ts\",\n  ],\n  unexploredAreas: [\"src/admin/\", \"src/api/v2/\"],\n  nextSteps: [\"Map dependency graph of src/admin/\", \"Check for circular deps in api/v2\"],\n};\nawait fs.writeFile(\"research-scratchpad.json\", JSON.stringify(findings, null, 2));\n\n// At session START — read scratchpad to restore context efficiently\nconst scratchpad = JSON.parse(await fs.readFile(\"research-scratchpad.json\", \"utf-8\"));\nconst systemMessage = `Previous research findings:\\n${JSON.stringify(scratchpad, null, 2)}\\n\\nContinue from next steps listed above.`;\n```",
    keyConcept: "Scratchpad files for persisting key findings across context boundaries",
  },
  {
    id: "D5-008",
    scenario: "Code Generation with Claude Code",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.4",
    difficulty: "basic",
    question:
      "A developer has been exploring a complex refactoring task for 45 minutes. The Claude Code session context has grown to 120k tokens with many exploratory dead ends and abandoned approaches. The developer wants to continue the core work but with a cleaner, more focused context. What is the recommended approach?",
    options: [
      { id: "A", text: "Start a completely new session and summarize the work in the first message" },
      { id: "B", text: "Use /compact to summarize the conversation history, reducing context size while preserving the essential thread of work" },
      { id: "C", text: "Use --resume to reload from an earlier checkpoint before the dead ends" },
      { id: "D", text: "Delete the .claude/ directory to reset all session state" },
    ],
    correctAnswer: "B",
    explanation:
      "/compact is the Claude Code command designed for exactly this scenario — it summarizes the conversation history in-place, removing exploratory dead ends and redundant content while preserving the important thread of work. This reduces context size without losing the active session's key insights. Starting completely new (A) loses the current session's accumulated valid findings. --resume restores a prior state, reverting completed work. Deleting .claude/ is destructive and may delete project configuration.\n\nHow to implement:\n```bash\n# In an active Claude Code session that has grown too large:\n# Check current context size\n/status\n# → Context: 120,847 tokens (85% of limit)\n\n# Run /compact to summarize and reduce context\n/compact\n# Claude will:\n# 1. Identify the core thread of productive work\n# 2. Discard exploratory dead ends and abandoned approaches\n# 3. Preserve key decisions, code changes, and active task state\n# 4. Replace the full history with a concise summary\n# → Context: 12,400 tokens (8% of limit)\n\n# Continue working with the cleaned context\nclaude \"Now refactor the authentication module as we discussed\"\n\n# The /compact summary will include:\n# - What was decided/agreed\n# - What files were modified\n# - What the current task is\n# - Key constraints discovered during exploration\n```",
    keyConcept: "/compact for reducing context size in exploration sessions",
  },
  {
    id: "D5-009",
    scenario: "Structured Data Extraction",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.5",
    difficulty: "advanced",
    question:
      "Your extraction pipeline produces confidence scores for each extracted field. For a financial dataset of 10,000 records, you want to validate accuracy without manually reviewing all records. You decide to sample records for manual review. Which sampling strategy most efficiently identifies systemic errors?",
    options: [
      { id: "A", text: "Simple random sampling — randomly select 100 records from the 10,000" },
      {
        id: "B",
        text: "Stratified sampling by confidence score — sample heavily from low-confidence records, lightly from high-confidence records, and include a random baseline sample from high-confidence records",
      },
      { id: "C", text: "Sequential sampling — review the first 100 records in order" },
      { id: "D", text: "Outlier sampling — only review records where any field is null" },
    ],
    correctAnswer: "B",
    explanation:
      "Stratified sampling by confidence score is the most efficient approach for finding systemic errors. Low-confidence records are most likely to contain errors and should be reviewed at a higher rate. High-confidence records are likely correct but a small random sample validates that confidence scoring is calibrated correctly. Simple random sampling (A) is inefficient because most sampled records will be high-confidence and error-free. Sequential sampling (C) may be biased if the first records share a pattern. Outlier-only sampling (D) misses non-null errors.\n\nHow to implement:\n```typescript\ninterface SamplingConfig {\n  lowConfidenceThreshold: number;   // e.g., 0.7\n  highConfidenceThreshold: number;  // e.g., 0.95\n  lowConfidenceSampleRate: number;  // e.g., 0.3 (review 30% of low-conf records)\n  highConfidenceSampleRate: number; // e.g., 0.02 (review 2% of high-conf records as baseline)\n}\n\nfunction stratifiedSample(\n  records: ExtractionResult[],\n  config: SamplingConfig\n): ExtractionResult[] {\n  const lowConf = records.filter(r => r.confidence < config.lowConfidenceThreshold);\n  const midConf = records.filter(\n    r => r.confidence >= config.lowConfidenceThreshold &&\n         r.confidence < config.highConfidenceThreshold\n  );\n  const highConf = records.filter(r => r.confidence >= config.highConfidenceThreshold);\n\n  return [\n    // Heavy sampling from low-confidence (most likely to have errors)\n    ...sample(lowConf, Math.ceil(lowConf.length * config.lowConfidenceSampleRate)),\n    // Medium sampling from mid-confidence\n    ...sample(midConf, Math.ceil(midConf.length * 0.1)),\n    // Baseline sample from high-confidence (validates calibration)\n    ...sample(highConf, Math.ceil(highConf.length * config.highConfidenceSampleRate)),\n  ];\n}\n```",
    keyConcept: "Stratified sampling by confidence score for efficient validation",
  },
  {
    id: "D5-010",
    scenario: "Multi-Agent Research System",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.5",
    difficulty: "advanced",
    question:
      "Your research system extracts claims from papers. A stakeholder asks: \"How do we know which paper each extracted claim came from, so we can verify it?\" You implement a provenance tracking mechanism. Which approach best satisfies this requirement?",
    options: [
      { id: "A", text: "Store the full text of each paper alongside each claim in the database" },
      {
        id: "B",
        text: "Maintain claim-source mappings: each extracted claim includes the source paper DOI, page number, and verbatim quote used as evidence",
      },
      { id: "C", text: "Include a bibliography section in the final research report" },
      { id: "D", text: "Log all tool calls so the source papers can be inferred from call history" },
    ],
    correctAnswer: "B",
    explanation:
      "Claim-source mappings that link each claim to its source paper (DOI), location (page/section), and verbatim evidence quote provide direct, auditable provenance. This allows any claim to be verified by going directly to the source with precise location information. Storing full paper text (A) is storage-intensive and doesn't create explicit linkages. A bibliography (C) lists sources but doesn't map individual claims to specific sources. Inferring provenance from call logs (D) is fragile and indirect.\n\nHow to implement:\n```typescript\ninterface ExtractedClaim {\n  claim: string;               // The extracted claim text\n  confidence: number;          // 0-1 confidence score\n  provenance: ClaimProvenance;\n}\n\ninterface ClaimProvenance {\n  doi: string;                 // e.g., \"10.1038/nature12373\"\n  paperTitle: string;\n  authorLastName: string;      // For quick reference: \"Smith et al. (2024)\"\n  year: number;\n  pageNumber?: number;         // Page where claim appears\n  sectionTitle?: string;       // e.g., \"Results\", \"Discussion\"\n  verbatimQuote: string;       // Exact text from paper — the evidence\n  quoteContext: string;        // Surrounding sentence(s) for context\n}\n\n// In the extraction prompt:\nconst extractionSchema = {\n  name: \"extract_claims\",\n  input_schema: {\n    type: \"object\",\n    properties: {\n      claims: {\n        type: \"array\",\n        items: {\n          type: \"object\",\n          properties: {\n            claim: { type: \"string\" },\n            doi: { type: \"string\" },\n            verbatimQuote: { type: \"string\", description: \"Exact quote from paper supporting this claim\" },\n            pageNumber: { type: \"integer\" },\n          },\n          required: [\"claim\", \"doi\", \"verbatimQuote\"],\n        },\n      },\n    },\n  },\n};\n```",
    keyConcept: "Claim-source mappings for extraction provenance and verifiability",
  },
  {
    id: "D5-011",
    scenario: "Structured Data Extraction",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.5",
    difficulty: "intermediate",
    question:
      "Your extraction pipeline processes news articles and extracts a `publishedDate` field. Some articles say \"yesterday\" or \"last Tuesday\" rather than an absolute date. How should you handle this to maintain data reliability?",
    options: [
      { id: "A", text: "Extract the relative date expression as-is (\"yesterday\", \"last Tuesday\") and resolve it in post-processing" },
      { id: "B", text: "Use the article's crawl timestamp as a proxy for the publish date" },
      {
        id: "C",
        text: "Include temporal context in the extraction prompt (e.g., the article's crawl date) so Claude can resolve relative dates to absolute ISO 8601 dates, and add a `dateConfidence: \"inferred\" | \"explicit\"` field",
      },
      { id: "D", text: "Reject articles with relative dates and exclude them from the dataset" },
    ],
    correctAnswer: "C",
    explanation:
      "Providing temporal context (the crawl date or article metadata date) allows Claude to resolve relative date expressions to absolute dates at extraction time. Adding a confidence field (\"explicit\" vs \"inferred\") preserves the provenance information about how the date was determined, enabling downstream consumers to filter or handle inferred dates differently. Option A defers resolution and may lose the reference point. Option B is inaccurate — crawl dates and publish dates differ. Option D loses valid data unnecessarily.\n\nHow to implement:\n```typescript\nasync function extractArticleData(article: NewsArticle) {\n  const systemPrompt = `You are extracting data from news articles.\nToday's date (article crawl date): ${article.crawledAt.toISOString().split('T')[0]}\n\nWhen extracting publishedDate:\n- If the article states an absolute date (\"January 15, 2024\"), extract it as-is and set dateConfidence to \"explicit\"\n- If relative (\"yesterday\", \"last Tuesday\", \"3 days ago\"), resolve using the crawl date and set dateConfidence to \"inferred\"\n- Always return dates in ISO 8601 format: YYYY-MM-DD`;\n\n  const response = await anthropic.messages.create({\n    model: \"claude-opus-4-5\",\n    system: systemPrompt,\n    tools: [{\n      name: \"extract_article\",\n      input_schema: {\n        type: \"object\",\n        properties: {\n          headline: { type: \"string\" },\n          publishedDate: { type: \"string\", pattern: \"^\\\\d{4}-\\\\d{2}-\\\\d{2}$\" },\n          dateConfidence: { type: \"string\", enum: [\"explicit\", \"inferred\"] },\n          // \"explicit\" = \"January 15\" in article\n          // \"inferred\" = \"yesterday\" resolved using crawl date\n        },\n        required: [\"headline\", \"publishedDate\", \"dateConfidence\"],\n      },\n    }],\n    tool_choice: { type: \"tool\", name: \"extract_article\" },\n    messages: [{ role: \"user\", content: article.text }],\n    max_tokens: 512,\n  });\n}\n```",
    keyConcept: "Temporal data handling: resolving relative dates with context and confidence metadata",
  },
  {
    id: "D5-012",
    scenario: "Customer Support Resolution Agent",
    domain: 5,
    domainName: "Context Management & Reliability",
    taskStatement: "5.5",
    difficulty: "intermediate",
    question:
      "Your support agent rates its confidence in its own responses. After analysis, you find that fields with confidence > 0.9 have a 12% error rate, while the agent claimed near-certainty. The confidence scores are not reflecting actual accuracy. What does this indicate and how should it be addressed?",
    options: [
      { id: "A", text: "The agent is hallucinating — disable confidence scoring and rely on deterministic rules" },
      { id: "B", text: "The confidence scores are poorly calibrated — the model's self-reported confidence does not correlate with actual accuracy. Implement field-level calibration by comparing predicted confidence to observed accuracy across historical samples and recalibrating thresholds." },
      { id: "C", text: "The 12% error rate is within acceptable bounds for a 0.9 confidence threshold" },
      { id: "D", text: "Increase the confidence threshold to 0.99 to reduce errors" },
    ],
    correctAnswer: "B",
    explanation:
      "Miscalibration means the confidence scores are systematically overconfident — a 0.9 confidence should have ~10% error rate, not 12%, but more importantly the pattern indicates the model assigns high confidence to uncertain answers. The solution is field-level calibration: measure the relationship between predicted confidence and actual accuracy on a held-out set, then adjust thresholds or add a calibration layer. Simply raising the threshold (D) selects fewer records without fixing the underlying miscalibration. Disabling confidence (A) removes useful signal. 12% error at 0.9 confidence may or may not be acceptable depending on the domain, but miscalibration is the core issue.\n\nHow to implement:\n```typescript\n// Step 1: Build a calibration dataset\n// Run extraction on 500 known-good records, collect (predicted_confidence, actual_correct) pairs\nconst calibrationData: Array<{ predictedConf: number; wasCorrect: boolean }> = [];\n\n// Step 2: Compute calibration curve (expected vs observed accuracy per confidence bucket)\nfunction computeCalibrationCurve(data: typeof calibrationData) {\n  const buckets = [0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1.0];\n  return buckets.map((upperBound, i) => {\n    const lowerBound = buckets[i - 1] ?? 0;\n    const bucket = data.filter(d => d.predictedConf >= lowerBound && d.predictedConf < upperBound);\n    const observedAccuracy = bucket.filter(d => d.wasCorrect).length / bucket.length;\n    return { range: `${lowerBound}-${upperBound}`, predicted: (lowerBound + upperBound) / 2, observed: observedAccuracy };\n  });\n}\n// If model says 0.9 but observedAccuracy is 0.88, the model is overconfident\n\n// Step 3: Apply calibration mapping in production\nfunction calibrateConfidence(rawConfidence: number, calibrationMap: Map<number, number>): number {\n  // Map raw model confidence to calibrated confidence using the curve\n  const bucket = Math.floor(rawConfidence * 10) / 10;\n  return calibrationMap.get(bucket) ?? rawConfidence;\n}\n\n// Step 4: Use calibrated thresholds for routing decisions\nconst HUMAN_REVIEW_THRESHOLD = 0.85; // Calibrated, not raw model confidence\n```",
    keyConcept: "Confidence scoring calibration: predicted confidence vs observed accuracy",
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

export function getExamSampleFromPool(pool: Question[], totalQuestions: number = 30): Question[] {
  const sample: Question[] = [];
  const domainList: Domain[] = [1, 2, 3, 4, 5];

  for (const domain of domainList) {
    const weight = domainWeights[domain] / 100;
    const count = Math.round(totalQuestions * weight);
    const domainQs = pool.filter((q) => q.domain === domain);
    const shuffled = [...domainQs].sort(() => Math.random() - 0.5);
    sample.push(...shuffled.slice(0, count));
  }

  return sample.sort(() => Math.random() - 0.5);
}
