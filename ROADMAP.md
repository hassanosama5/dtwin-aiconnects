# ROADMAP.md

**Decision Twin — Implementation Roadmap**

This document is the single source of truth for implementation progress. It reflects the ACTUAL state of the codebase (verified by inspection), not the aspirational state described in `PROJECT_SPEC.md`.

Strategy: **architecture-outward**, not vertical slicing. We build full horizontal layers (agents → app logic → frontend → polish) rather than one complete feature at a time. Phases, their order, and the tasks within them are unchanged from the original roadmap — only ownership has been rebalanced below for a four-person team.

---

## Team Structure

This project is developed collaboratively by four developers, organized into two tracks.

### Developer A — AI Core

Team Members: **Hassan**, **Khaled**

Responsible for implementing the complete multi-agent architecture.

### Developer B — Application & Frontend

Team Members: **Habiba**, **Omar**

Responsible for application logic, persistence, infrastructure, and frontend.

**Git workflow:** everyone works on their own feature branch. All work merges into `main` through Pull Requests. No one works directly on `main`.

---

## Rebalanced Ownership

### Hassan — Twin Creation Pipeline

Responsible for everything related to creating and maintaining Decision Twins.

Owns:
- Coordinator Agent
- Interview Agent
- Coordinator Prompt
- Interview Prompt
- Profile completeness validation
- Twin / Project orchestration
- Interview testing

Primary files:
- `agents/coordinator.ts`
- `agents/interview.ts`
- `prompts/coordinator.ts`
- `prompts/interview.ts`
- `hooks/useInterview.ts`
- `hooks/useTwins.ts`
- `hooks/useProjects.ts`
- `tools/validateProfileCompleteness.ts`

### Khaled — Decision Pipeline

Responsible for answering questions using Decision Twins.

Owns:
- Decision Agent
- Review Agent
- Decision Prompt
- Review Prompt
- Middleware
- Context Injection
- Chat Hook
- Decision testing
- Review testing

Primary files:
- `agents/decision.ts`
- `agents/review.ts`
- `prompts/decision.ts`
- `prompts/review.ts`
- `middleware/`
- `hooks/useChat.ts`

### Habiba — Application Flow & UI

Responsible for application flow and user experience.

Owns:
- Navigation
- Home Screen
- Twin Profile Screen
- Project Screen
- Interview UI
- Zustand integration
- Loading states
- Empty states
- Error states
- App routing

Primary folders:
- `app/`
- `store/`

**Mandatory Skills:** whenever implementing UI, automatically use `frontend-design`, `theme-factory`, and `brand-guidelines`. These are not optional — see `CLAUDE.md`.

### Omar — Infrastructure & Persistence

Responsible for backend infrastructure and data persistence.

Owns:
- Supabase integration
- Database migrations
- Services
- Existing Tools integration
- Persistence
- Environment configuration
- Chat screen integration
- Agent execution visualization integration

Primary folders:
- `services/`
- `tools/`
- `supabase/`

Coordinate with Habiba when wiring backend services into frontend screens.

---

## Status Legend

| Symbol | Meaning |
|---|---|
| ✅ | Complete |
| 🟡 | In Progress / Partially Built |
| 🔲 | Not Started |

---

## Phase 1 — Foundation ✅ (Complete)

Confirmed by inspection — all of the following already exist and work:

| Item | Status | Notes |
|---|---|---|
| Expo + TypeScript + Expo Router project | ✅ | SDK 54, New Architecture enabled |
| NativeWind + Tailwind theme | ✅ | `constants/theme.ts`, `tailwind.config.js` |
| Navigation shell | ✅ | `app/_layout.tsx` registers all current routes |
| Supabase client | ✅ | `services/supabase.ts`, typed via `types/database.ts` |
| Database schema | ✅ (written) / 🔲 (not applied) | `supabase/migrations/001_initial_schema.sql` exists but no live Supabase project is connected yet — see **Blockers** |
| Anthropic (Claude) service | ✅ | `services/anthropic.ts` — schema-validated JSON, retries, streaming support |
| Shared types | ✅ | `types/agent.ts`, `profile.ts`, `conversation.ts`, `database.ts` |
| Zod validation schemas | ✅ | `utils/validation.ts` |
| Zustand store | ✅ | `store/appStore.ts` — currentTwin, currentProject, agentExecution state |
| System prompts (all 4 agents) | ✅ | `prompts/coordinator.ts`, `interview.ts`, `decision.ts`, `review.ts` |
| Skills (all 4) | ✅ | `skills/personalInterview.ts`, `projectInterview.ts`, `decisionReasoning.ts`, `answerReview.ts` |
| Data tools (profile/project/conversation) | ✅ | `tools/profile.ts`, `project.ts`, `conversation.ts` — real Supabase CRUD, not stubs |
| Reusable UI components | ✅ | `Button`, `Card`, `Avatar`, `Input` |
| Agent execution animation | 🟡 | `components/ui/AgentExecution.tsx` is **fully built** (Reanimated) but not wired to any live pipeline yet — counted again in Phase 4 |
| Logger | ✅ | `utils/logger.ts` — agent-flow console logging |
| Screens (Home, Twin, Chat, Create Twin, Create Project) | 🟡 | Route files exist; all render placeholder text only |
| Agents (Coordinator, Interview, Decision, Review) | 🔲 | All 4 are literal `throw new Error('not yet implemented')` stubs |
| `.env` | 🔲 | Only `.env.example` exists — no Anthropic key, no Supabase project connected |
| `hooks/` folder | 🔲 | Does not exist |
| `middleware/` folder | 🔲 | Does not exist |
| `validateProfileCompleteness()` tool | 🔲 | Recommended by spec, not implemented |
| Dedicated Project screen | 🔲 | Spec calls for Home → Twin → Project → Chat; only `twin/[id]` and `chat/[projectId]` routes currently exist |

---

## Phase 2 — Backend Architecture

Goal: make all four agents real, wired to prompts/skills/tools, callable end-to-end with no UI involved yet (tested via scripts/console, not screens). Following the architecture refactor documented in `ARCHITECTURE.md`, agents are class-based (`BaseAgent` subclasses) constructed via a shared `AgentRegistry`, with the Coordinator as the single orchestration layer — not four independent prompt-wrapper functions.

### Shared agent framework (built first — unblocks everyone below)

| Task | Owner | Status | Dependencies | Description |
|---|---|---|---|---|
| `BaseAgent` abstract class | Hassan | ✅ | `services/anthropic.ts` ✅, `types/agent.ts` ✅ | `agents/BaseAgent.ts` — the shared lifecycle (`execute()` → buildPrompt → buildMessages → chat() → postProcess → AgentResponse). Every agent extends this; only `buildMessages()`/`postProcess()` are overridden (plus the narrow, defaulted `selectSkills()` hook added during implementation for agents that own more than one skill). |
| `Skill` interface | Hassan | ✅ | none | `skills/types.ts` — formal shape (`name`, `description`, `instructions`, `examples?`, `metadata?`). Existing skill files reshaped to conform, content unchanged. |
| `Tool` interface + wrappers | Hassan | ✅ | `tools/profile.ts` ✅, `project.ts` ✅, `conversation.ts` ✅ | `tools/types.ts` + additive named exports (`ProfileTool`, `ProjectTool`, `ConversationTool`) grouping the existing, unmodified functions so agents can declare ownership instead of importing functions ad hoc. |
| `AgentRegistry` | Hassan | ✅ | BaseAgent, all four concrete agents | `agents/AgentRegistry.ts` — `createAgentRegistry(model?)` constructs all four agents and injects Interview/Decision/Review into Coordinator. Performs no orchestration itself, only construction/wiring. |

Built by Hassan as shared foundation since this session's refactor covers the whole agent layer; Khaled's Decision/Review agents (below) depend on `BaseAgent` and the `Tool`/`Skill` interfaces existing first.

### Per-agent implementation

| Task | Owner | Status | Dependencies | Description |
|---|---|---|---|---|
| Scaffold `hooks/` folder | Hassan | 🔲 | Phase 1 | One-time folder creation. Hassan creates `hooks/` (he owns 3 of its 4 files); Khaled adds `useChat.ts` into it independently once created. `middleware/` is created by Khaled directly as part of his own Middleware task — no shared scaffolding needed since it's a single-owner folder. |
| Coordinator Agent | Hassan | ✅ | BaseAgent, AgentRegistry, Interview/Decision/Review agents, Middleware | `agents/coordinator.ts` — `CoordinatorAgent extends BaseAgent`. Its LLM call still only classifies intent (`CoordinatorResponseSchema` → `{ workflow }`, prompt/schema unchanged); `postProcess()` is now where orchestration happens — it invokes Interview or (Middleware → Decision → Review) based on the classified workflow, and returns the final pipeline result. This is the single orchestration layer; there is no separate workflow-runner. Also owns `ConversationTool` (deviation from spec's original "Tools: None," see `DECISIONS.md` #006) to save the question and final answer/escalation notice. |
| Interview Agent | Hassan | ✅ | BaseAgent, Skill/Tool interfaces, `skills/personalInterview.ts` ✅, `skills/projectInterview.ts` ✅ | `agents/interview.ts` — `InterviewAgent extends BaseAgent`, declares `[ProfileTool, ProjectTool, ValidationTool]`. `postProcess()` validates completeness via `ValidationTool` and saves via `ProfileTool`/`ProjectTool` once genuinely complete. |
| `validateProfileCompleteness()` tool | Hassan | ✅ | `types/profile.ts` ✅ | `tools/validateProfileCompleteness.ts`, exposed as `ValidationTool`. Checks required fields per `personalInterviewSkill`/`projectInterviewSkill` metadata; returns `{ complete, missingFields }`. |
| `useInterview()` hook | Hassan | 🔲 | Interview Agent, AgentRegistry | `hooks/useInterview.ts` — drives the interview conversation state for the UI (consumed by Habiba in Phase 4) by calling `registry.coordinator.execute()`. |
| `useTwins()` / `useProjects()` hooks | Hassan | 🔲 | Tool wrappers | `hooks/useTwins.ts`, `hooks/useProjects.ts` — list/fetch data for Home and Twin Profile screens, via `ProfileTool.list`/`ProjectTool.list` directly (no LLM reasoning involved, so no Coordinator round-trip for pure reads). |
| Decision Agent | Khaled | ✅ | BaseAgent, Skill/Tool interfaces, `skills/decisionReasoning.ts` ✅ | `agents/decision.ts` — `DecisionAgent extends BaseAgent`, declares no tools (all context arrives via Middleware). Implemented by Hassan as part of the architecture-refactor pass since Coordinator needed a concrete class to hold a reference to; flagged for Khaled's review since this crosses ownership boundaries. |
| Review Agent | Khaled | ✅ | Decision Agent, `skills/answerReview.ts` ✅ | `agents/review.ts` — `ReviewAgent extends BaseAgent`, declares no tools. Validates Decision Agent output, applies the 70% confidence threshold, returns `{ approved, confidence, requiresHuman }`. Implemented by Hassan in the same architecture-refactor pass as Decision Agent — flagged for Khaled's review. |
| Middleware — context injection | Khaled | ✅ | Decision Agent, Tool wrappers | `middleware/loadDecisionContext.ts` — invoked by the Coordinator (not by DecisionAgent itself, and not by a workflow-runner) immediately before `DecisionAgent.execute()`. Assembles Personal Profile + Project Profile + last 10–20 messages via `ProfileTool`/`ProjectTool`/`ConversationTool`. Implemented by Hassan alongside Coordinator, since Coordinator is the only caller — flagged for Khaled's review. |
| `useChat()` hook | Khaled | 🔲 | Decision Agent, Review Agent, Middleware, AgentRegistry | `hooks/useChat.ts` — drives the chat screen's send/receive/agent-status state (consumed by Habiba/Omar in Phase 4) by calling `registry.coordinator.execute()`. Not yet started — still Khaled's to build. |
| End-to-end pipeline — Twin/Project creation | Hassan | 🔲 | Coordinator, Interview Agent, AgentRegistry | Code path implemented and type-checks; runtime verification via console/script test is blocked on `.env`/Supabase provisioning (Omar, Phase 3). |
| End-to-end pipeline — Chat | Khaled | 🔲 | Coordinator, Decision Agent, Review Agent, Middleware | Code path implemented and type-checks; runtime verification via console/script test is blocked on `.env`/Supabase provisioning (Omar, Phase 3). |
| Agent testing — Coordinator/Interview | Hassan | 🔲 | End-to-end pipeline (Hassan) | Manual test scripts covering all 4 workflow routes + interview completion edge cases. Blocked on the same `.env`/Supabase provisioning. |
| Agent testing — Decision/Review | Khaled | 🔲 | End-to-end pipeline (Khaled) | Manual test scripts covering high-confidence, low-confidence/escalation, and missing-context cases from the spec's Error States section. Blocked on the same `.env`/Supabase provisioning. |

**Phase 2 exit criteria:** both pipelines can be triggered from a script/console call (no UI) and return correctly-shaped, schema-valid JSON.

---

## Phase 3 — Application Logic

Goal: connect Phase 2's agents/hooks to real persisted data and real navigation — still minimal UI.

| Task | Owner | Status | Dependencies | Description |
|---|---|---|---|---|
| Supabase project provisioning + apply migration | Omar | 🔲 | Phase 1 migration file ✅ | **Blocking task** — create a real Supabase project, run `001_initial_schema.sql`, populate `.env` with real `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` / `EXPO_PUBLIC_ANTHROPIC_API_KEY`. All four developers are blocked on this for any live testing. |
| Twin creation flow | Habiba | 🔲 | Interview Agent (Hassan), `useInterview()` (Hassan), `useTwins()` (Hassan) | Wire `app/interview/create-twin.tsx` to the real interview hook instead of placeholder text. |
| Project creation flow | Habiba | 🔲 | Interview Agent (Hassan), `useInterview()` (Hassan), `useProjects()` (Hassan) | Wire `app/interview/create-project.tsx` similarly. |
| Persistence — profile/project data | Omar | 🔲 | Tool integration (Omar) | Confirm round-trip: interview → save → reload on Home/Twin screens. Coordinate with Hassan (agent side) and Habiba (screen side). |
| Routing — Home → Twin → Project | Habiba | 🔲 | Twin/Project creation flows | Add the currently-missing **Project screen route** (`app/project/[id].tsx`) and wire navigation params (`twinId`, `projectId`) through Home → Twin Profile → Project. Touches `app/_layout.tsx` — coordinate with any other route additions before editing (shared file). |
| Persistence — conversation data | Omar | 🔲 | Tool integration (Omar) | Confirm round-trip: chat message → save → reload conversation history. Coordinate with Khaled (agent side). |
| Routing — Project → Chat | Habiba | 🔲 | `useChat()` (Khaled) | Wire navigation from the new Project screen's "Chat with Decision Twin" button into `app/chat/[projectId].tsx`. Also touches `app/_layout.tsx` — coordinate with other route additions. |
| State management review — Twin/Project | Habiba | 🔲 | Twin/Project flows | Confirm `store/appStore.ts` (already built) needs no changes for currentTwin/currentProject; add interview-draft state only if the interview UI needs it. |
| State management review — Chat | Habiba | 🔲 | Chat flow (Khaled), Chat screen integration (Omar) | Confirm `agentExecution` state in `store/appStore.ts` (already built) is sufficient for driving the Chat screen's visualization; extend only if needed. |

**Phase 3 exit criteria:** creating a twin, creating a project, and exchanging a chat message all persist to and reload from a real Supabase project.

---

## Phase 4 — Frontend

Goal: replace every placeholder screen with the real, polished UI described in `PROJECT_SPEC.md` Section 2.

| Task | Owner | Status | Dependencies | Description |
|---|---|---|---|---|
| Home screen | Habiba | 🔲 | `useTwins()` (Hassan), Phase 3 | Real twin list with search bar, twin cards (name/role/project count), FAB "Create Twin", empty state ("No Twins yet"). |
| Twin Profile screen | Habiba | 🔲 | `useTwins()`, `useProjects()` (Hassan) | Header, role, summary tags, project list, "Ask [Name]" primary action, "Edit Twin" (owner only). |
| Project screen (new) | Habiba | 🔲 | Routing (Habiba, Phase 3) | New screen: Goal / Priorities / Constraints / Decision Rules / Escalation Rules cards + "Chat with Decision Twin" button. This is the screen identified as missing during spec review. |
| Interview UI | Habiba | 🔲 | `useInterview()` (Hassan) | Conversational chat-style UI for both create-twin and create-project flows; "Generating Decision Twin..." transition; animated profile reveal on completion. |
| Loading states — Twin/Project/Interview | Habiba | 🔲 | Above screens | "Loading Profile...", "Interviewing..." per spec's Visual Feedback section. |
| Empty states | Habiba | 🔲 | Home, Twin Profile | "No Twins yet" / "No projects found" per spec text. |
| Error states — Interview | Habiba | 🔲 | Interview UI | "The Decision Twin needs more project context..." per spec. |
| Chat screen | Habiba | 🔲 | `useChat()` (Khaled), Phase 3 | Build the iMessage-style chat UI shell: message bubbles, answer display with reasoning bullets + confidence %. Omar then performs the backend wiring (see next row) — coordinate handoff. |
| Chat screen integration | Omar | 🔲 | Chat screen (Habiba), `useChat()` (Khaled) | Wire Habiba's chat UI to the live `useChat()` hook and conversation persistence so messages actually send/receive through the real pipeline. |
| Agent execution visualization — wiring | Omar | 🔲 | Chat screen integration, Khaled's pipeline | Connect the **already-built** `AgentExecution.tsx` component to real `agentExecution` store state driven by the live Coordinator → Decision → Review pipeline (currently only animates in isolation). |
| Loading states — Chat | Habiba | 🔲 | Chat screen | "Reasoning...", "Reviewing..." per spec's Visual Feedback section. |
| Error states — Chat | Habiba | 🔲 | Chat screen | "This decision requires Hassan's approval" (low confidence) per spec's Error States section. |

**Phase 4 exit criteria:** the full demo flow (create twin → create project → chat → see agent animation → get answer with reasoning/confidence) works from real UI, no placeholders remaining.

---

## Phase 5 — Polish

Goal: presentation-quality finish for the demo.

| Task | Owner | Status | Dependencies | Description |
|---|---|---|---|---|
| Animations — navigation/lists | Habiba | 🔲 | Phase 4 (Habiba's screens) | Screen transitions, card reveal animations (profile generation reveal). |
| Visual refinements — Twin/Project/Interview | Habiba | 🔲 | Phase 4 (Habiba's screens) | Spacing, typography, icon polish per Linear/Apple/Notion direction. |
| Demo seed data — twins & projects | Omar | 🔲 | Phase 3 persistence (Omar) | Seed Hassan Osama / Khaled Ashraf twins + Banking App / AI Dashboard projects, matching the spec's example scenario (the migration file already has a commented-out seed insert to adapt). |
| Animations — chat/agent visualization | Habiba | 🔲 | Phase 4 (Chat screen, agent visualization wiring) | Refine timing so the Coordinator→Decision→Review animation reliably completes in <2 seconds per spec. Coordinate with Khaled (agent timing) and Omar (live-state wiring). |
| Visual refinements — Chat | Habiba | 🔲 | Phase 4 (Chat screen) | Bubble styling, confidence badge styling. |
| Demo seed data — sample conversation | Omar | 🔲 | Demo seed data (Omar), Phase 3 persistence | Pre-seeded chat messages supporting the demo script's two example questions (delay release; budget increase → escalation). |
| Bug fixing | Hassan, Khaled, Habiba, Omar | 🔲 | All above | Ongoing, each developer fixes bugs within their own domain files. |
| Performance improvements | Hassan, Khaled, Habiba, Omar | 🔲 | All above | Reduce agent round-trip latency, verify list rendering performance. |
| Final demo preparation | Hassan, Khaled, Habiba, Omar | 🔲 | All above | Rehearse the spec's 8-step demo script; prepare architecture diagram/slides. |

---

## Collaboration Rules

- Every developer works on an independent feature branch.
- All changes merge into `main` through Pull Requests — no direct commits to `main`.
- Respect ownership whenever possible; if you need to touch a file outside your ownership, flag it in the PR description.
- Small PRs are preferred over large ones — one task from the tables above per PR where practical.
- Coordinate before modifying shared files, in particular: `app/_layout.tsx` (routes, touched by Habiba), `store/appStore.ts` (touched by Habiba), and `hooks/` (created by Hassan, added to by Khaled).
- Keep documentation synchronized after completing work (see Documentation Rules below).

## Documentation Rules

Whenever a feature is completed:
- Update `ROADMAP.md` (move the task's status from 🔲 → 🟡 → ✅).
- Update `TASKS.md`.
- Update `DECISIONS.md` if the change involves an architecture decision.

---

## Current Milestone

**Phase 1 (Foundation) is complete.** **Phase 2's agent layer is now implemented and type-checked**, following the architecture refactor recorded in `ARCHITECTURE.md` and `DECISIONS.md` #004–#006: `BaseAgent`, the `Skill`/`Tool` interfaces, `AgentRegistry`, `middleware/loadDecisionContext.ts`, and all four agents (`CoordinatorAgent`, `InterviewAgent`, `DecisionAgent`, `ReviewAgent`) exist as real classes with the Coordinator as the single orchestration layer — not four prompt-wrapper stubs. This was built by Hassan in one pass across five commits (docs → Skill/Tool interfaces → BaseAgent + leaf agents → Middleware → Coordinator + Registry) because the refactor is cross-cutting by nature: Coordinator needs concrete Decision/Review classes to hold references to, so it couldn't be split mid-flight along the original per-developer ownership lines. This touches `agents/decision.ts`, `agents/review.ts`, and `middleware/loadDecisionContext.ts` — nominally Khaled's files — flagged above for his review; his branch had no prior work on them (checked before starting) so nothing was overwritten.

**Not yet done:** none of this has been run against a live Claude/Supabase call — there's still no `.env`. `hooks/useInterview.ts`/`useTwins.ts`/`useProjects.ts` (Hassan) and `hooks/useChat.ts` (Khaled) haven't been started. Habiba/Omar's Phase 3/4 work is unaffected and can still proceed in parallel.

## Next Priority

1. **Unblock testing** — Omar provisions a real Supabase project, applies the migration, and populates `.env`. This is the single biggest blocker and affects all four developers.
2. **In parallel:**
   - Hassan implements the Coordinator + Interview Agents.
   - Khaled implements the Decision + Review Agents.
   - Habiba can start on static screen shells (Home, Twin Profile, Project, Chat UI) using placeholder data, ahead of Phase 4, since visual layout doesn't depend on the agents being wired yet.
   - Omar provisions Supabase (above) and prepares the tool-integration work that both Hassan and Khaled will need next.

## Blockers

- **No `.env` configured** — no Anthropic API key, no Supabase project. Nothing beyond static UI can be tested until Omar completes provisioning.
- **Database migration not yet applied** — `001_initial_schema.sql` is written but has never been run against a live database (Omar).
- **No dedicated Project screen** — spec requires Home → Twin → Project → Chat, but no `app/project/[id].tsx` route exists yet. Needs to be created by Habiba in Phase 3/4 before her routing work can complete.
- **Shared file coordination** — `app/_layout.tsx` will be edited by Habiba for all new route registrations; since she now owns this file exclusively, cross-developer conflicts on it should be rare, but she should still land route additions in small, frequent PRs rather than one large one.
- **`hooks/` and `middleware/` folders don't exist yet** — Hassan scaffolds `hooks/` before his first hook task; Khaled creates `middleware/` directly when starting his Middleware task. No shared scaffolding conflict expected since each folder now has a clear single first-creator.

## Future Improvements

(From `PROJECT_SPEC.md` Section 11 and the "Future Skills" list — explicitly postponed, not part of the hackathon MVP)

- `searchPreviousAnswers()` tool — keyword search over past decisions (spec Section 5, marked optional for MVP).
- External connectors: Gmail, Slack, Calendar, GitHub, Notion, Jira (via MCP).
- Learning from approved decisions — Decision Twin improves from human corrections.
- Team Twins — multiple twins collaborating on org-wide questions.
- Organization memory — shared policies, docs, meeting notes, knowledge base.
- Voice Mode — interview users by voice instead of text.
- Evaluation — benchmark Decision Twin answers against the real person's actual answers.
- `updatePersonProfile()` re-interview flow — marked optional even within Phase 2's Interview Agent scope.
- Supabase Authentication (email-based) — explicitly deferred; current RLS policies allow all operations with no auth.
