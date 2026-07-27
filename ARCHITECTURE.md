# ARCHITECTURE.md

**Decision Twin — AI Layer Architecture**

This document describes how the multi-agent system is actually implemented at runtime, not just how the folders are named. It supersedes the two placeholder diagrams that previously lived here.

---

## Layered Call Chain

```
Screen
  ↓
Hook
  ↓
Service
  ↓
CoordinatorAgent.execute()
  ↓
Middleware (only when the target agent needs assembled context — currently: Decision)
  ↓
InterviewAgent.execute()   or   DecisionAgent.execute()
  ↓
ReviewAgent.execute()      (only for the CHAT workflow)
  ↓
Shared Memory (Supabase, accessed only through Tools)
```

There is **one orchestration layer**: the Coordinator. It classifies intent, decides which agent(s) run, invokes them directly, and decides whether Review runs. No separate `WorkflowRunner` or workflow-service class exists — that responsibility lives inside `CoordinatorAgent`.

---

## Agent Registry

Agents are constructed once, wired together, and handed out through a registry — not instantiated ad hoc wherever they're needed.

```ts
const registry = createAgentRegistry();

registry.coordinator   // CoordinatorAgent — holds references to the other three
registry.interview      // InterviewAgent
registry.decision       // DecisionAgent
registry.review         // ReviewAgent
```

`createAgentRegistry()` does exactly one thing: construct the four agent instances and inject `interview`/`decision`/`review` into `CoordinatorAgent`'s constructor so it can invoke them. **It performs no orchestration itself** — that stays inside the Coordinator. A caller (a hook, or a test script) only ever talks to `registry.coordinator`.

---

## BaseAgent

Every agent extends one abstract class. It owns everything static; a subclass only implements the two behavioral hooks.

```ts
abstract class BaseAgent<TRequest, TSchemaOutput, TResult = TSchemaOutput> {
  readonly name: string;
  readonly description: string;
  readonly responsibility: string;
  readonly model: string;
  protected readonly systemPrompt: string;
  protected readonly skills: Skill[];
  protected readonly tools: Tool[];
  protected readonly outputSchema: ZodSchema<TSchemaOutput>;
  protected readonly logger: Logger;

  // Inherited by every agent — do not override:
  async execute(request: TRequest, context?: AgentContext): Promise<AgentResponse<TResult>>;
  protected buildPrompt(context?: AgentContext): string; // systemPrompt + skills' instructions

  // The only two extension points:
  protected abstract buildMessages(request: TRequest, context?: AgentContext): ClaudeMessage[];
  protected async postProcess(parsed: TSchemaOutput, request: TRequest, context?: AgentContext): Promise<TResult>;
}
```

`execute()` is the single lifecycle every agent shares:

```
execute(request, context?)
  1. log start
  2. buildPrompt(context)      = systemPrompt + this.skills.map(s => s.instructions).join()
  3. buildMessages(request, context)   [subclass-specific]
  4. chat({ systemPrompt, messages, schema: outputSchema })   — services/anthropic.ts, unchanged
  5. postProcess(parsed, request, context)   [subclass-specific — default: identity]
  6. return AgentResponse<TResult> { success, agent: name, output, executionTime, error? }
  (any thrown error at any step is caught once, here, and returned as { success:false, ... })
```

For Interview/Decision/Review, `postProcess` is where an agent uses **its own declared tools** (e.g. Interview validates completeness then saves the profile). For Coordinator, `postProcess` is where **orchestration** happens — it's the one agent whose `TResult` is richer than what the LLM call itself validates, because the LLM only classifies; the Coordinator's `postProcess` is what actually invokes the other agents and assembles the final result.

There is exactly **one shared Claude model** — `services/anthropic.ts`'s `chat()` — imported by `BaseAgent`. No agent instantiates the Anthropic client itself. `model` on `BaseAgent` is descriptive metadata (defaults to `getModelConfig().model`), not a separate client per agent.

---

## Skills

A skill is a first-class, stateless, importable module — not a prompt fragment.

```ts
interface Skill {
  name: string;
  description: string;
  instructions: string;
  examples?: string[];
  metadata?: Record<string, unknown>; // e.g. requiredFields, confidenceThreshold
}
```

An agent declares the skills it needs in its config; `BaseAgent.buildPrompt()` concatenates their `instructions` into the system prompt for that call. Skills never call tools, never call other skills, and hold no state between calls.

---

## Tools

A tool is something an agent explicitly declares ownership of — not a function imported ad hoc from wherever it's convenient.

```ts
interface Tool<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
}
```

Concrete tools (`ProfileTool`, `ProjectTool`, `ConversationTool`, `ValidationTool`) wrap the existing, unmodified Supabase-backed functions in `tools/*.ts` under one named object per resource, so an agent's config can read as a declaration: `tools: [ProfileTool, ValidationTool]`. Internals are unchanged — still stateless, deterministic, independently testable.

| Agent | Declared Tools |
|---|---|
| Coordinator | ConversationTool (see note below) |
| Interview | ProfileTool, ProjectTool, ValidationTool |
| Decision | none — all context arrives via Middleware |
| Review | none |

**Deviation from `PROJECT_SPEC.md`, disclosed:** the spec originally lists the Coordinator's tools as "None," which held when it only classified intent. Now that it also orchestrates the CHAT pipeline end-to-end (per the approved single-orchestration-layer design), it owns `ConversationTool` to record the user's question and the final approved answer or escalation notice — nothing else touches conversation persistence for chat. Recorded in `DECISIONS.md`.

---

## Middleware

Middleware assembles execution context **before** an agent that needs it runs. It is invoked by the Coordinator, never by the target agent itself.

```
loadDecisionContext(twinId, projectId): Promise<AgentContext>
  → ProfileTool.get(twinId)
  → ProjectTool.get(projectId)
  → ConversationTool.getHistory(projectId, 20)
  → { personProfile, projectProfile, conversationHistory }
```

`DecisionAgent.buildMessages()` reads only from the `AgentContext` it's given — it never fetches its own data. Context is recomputed fresh on every call; nothing is cached, so Supabase remains the single source of truth.

---

## Execution Sequences

**Create Twin**
```
Hook → registry.coordinator.execute({ message, context: { twinId? } })
  → LLM classifies → { workflow: 'CREATE_TWIN' }
  → postProcess: registry.interview.execute({ type: 'personal', messages })
      → validates via ValidationTool, saves via ProfileTool once genuinely complete
  → returns { workflow: 'CREATE_TWIN', interview: InterviewResponse }
```

**Create Project** — identical shape, `type: 'project'`, `twinId` threaded through, `ProjectTool` instead of `ProfileTool`.

**Chat**
```
Hook → registry.coordinator.execute({ message: question, context: { twinId, projectId } })
  → LLM classifies → { workflow: 'CHAT' }
  → postProcess:
      context = loadDecisionContext(twinId, projectId)
      decisionResult = registry.decision.execute({ question, twinId, projectId }, context)
      reviewResult   = registry.review.execute({ decision: decisionResult.output, ... }, context)
      if reviewResult.output.approved → ConversationTool.save(assistant answer)
  → returns { workflow: 'CHAT', decision: DecisionResponse, review: ReviewResponse }
```

Saving the assistant's message happens **after** Review approves — an escalated/rejected answer is never persisted as if it were an approved one.

---

## What This Replaces

Before this refactor, every "agent" was a single stub function that would (once implemented) close over one prompt string and call the shared LLM service directly — structurally identical across all four, with duplicated try/catch and no shared contract. Skills were plain data objects with no formal shape and no `examples`. Tools were plain exported functions imported wherever convenient, with no declared ownership. There was no Coordinator orchestration surface, and `middleware/` did not exist at all. This document reflects the corrected design: `Agent` is a class with a lifecycle, `Skill`/`Tool` are formal interfaces, the Coordinator is the single orchestrator, and Middleware is a real pre-execution step.
