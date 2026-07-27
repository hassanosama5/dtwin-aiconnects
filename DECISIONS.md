DECISIONS.md

# Decision 001

Profiles are stored as JSON.

Reason

Allows schema evolution and easier prompt injection.

---

# Decision 002

Review Agent performs confidence estimation.

Reason

Keeps Decision Agent focused on reasoning.

---

# Decision 003

No vector database.

Reason

Not needed for MVP.

---

# Decision 004

Agents are class-based (`BaseAgent` subclasses), constructed only via `createAgentRegistry()`.

Reason

The original stub agents (plain functions closing over a prompt string) would have been structurally identical across all four, with no shared lifecycle, no declared skills/tools, and no way for the Coordinator to actually invoke the others. `BaseAgent` gives every agent one inherited lifecycle (`execute()`); subclasses only implement `buildMessages()` and, where needed, `postProcess()`. See `ARCHITECTURE.md`.

---

# Decision 005

The Coordinator is the single orchestration layer — no separate workflow-runner.

Reason

Two orchestration surfaces (Coordinator classifying, plus a runner invoking) would be an unnecessary duplicate layer. The Coordinator's own LLM call still only classifies intent; its `postProcess()` invokes Interview or (Middleware → Decision → Review) directly, based on the classified workflow.

---

# Decision 006

The Coordinator owns `ConversationTool`, deviating from `PROJECT_SPEC.md`'s original "Coordinator Tools: None."

Reason

That line held when the Coordinator only classified intent. Now that it also orchestrates the CHAT pipeline end-to-end and decides whether Review runs, something has to record the user's question and the final approved answer (or escalation notice) — and only the Coordinator sees the whole picture (workflow + review outcome) needed to do that correctly. Decision and Review agents declare no tools; all their context arrives via `AgentContext` from Middleware rather than being fetched by any agent itself.

---

# Decision 007

`CoordinatorRequest.activeWorkflow` lets a caller override the Coordinator's own intent classification.

Reason

Critical bug, live-tested and confirmed: classifying a free-text interview answer (e.g. "Security first, always.") in isolation is unreliable — it was misclassified as `CHAT` even when given the full conversation transcript as context. A caller that already knows it's continuing an active interview (e.g. `useInterview` on turn 2+) now passes `activeWorkflow`, which `CoordinatorAgent.postProcess()` prefers over the LLM's classification. The classify call still runs every turn — this is a `postProcess()`-only change, not an `execute()` override, so `BaseAgent`'s lifecycle and error handling stay untouched. Falls under the "unless a critical bug is discovered" exception to treating the architecture layer as stable.
