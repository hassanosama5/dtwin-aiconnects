# ROADMAP.md

**Decision Twin — Implementation Roadmap**

This document is the single source of truth for implementation progress. It reflects the ACTUAL state of the codebase (verified by inspection), not the aspirational state described in `PROJECT_SPEC.md`.

Strategy: **architecture-outward**, not vertical slicing. We build full horizontal layers (agents → app logic → frontend → polish) rather than one complete feature at a time. Within each phase, work is split between two developers by **domain**, not by layer, so each person owns a distinct set of files end-to-end within that phase and merge conflicts stay low.

- **Developer A** — owns the *Twin & Project* domain: Coordinator + Interview Agents, profile/project data, twin/project screens.
- **Developer B** — owns the *Decision & Chat* domain: Decision + Review Agents, conversation data, chat screen and agent-execution visualization.

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

Goal: make all four agents real, wired to prompts/skills/tools, callable end-to-end with no UI involved yet (tested via scripts/console, not screens).

| Task | Owner | Status | Dependencies | Description |
|---|---|---|---|---|
| Scaffold `hooks/` and `middleware/` folders | A | 🔲 | Phase 1 | One-time folder creation so A and B never both create the same folder in parallel. A creates both empty folders with a placeholder `index.ts`/README so each dev's first file lands cleanly. |
| Coordinator Agent | A | 🔲 | `prompts/coordinator.ts` ✅, `services/anthropic.ts` ✅ | Implement `agents/coordinator.ts`: call Claude with the coordinator prompt, validate against `CoordinatorResponseSchema`, return `{ workflow }`. Shared dependency for both devs' pipelines. |
| Interview Agent | A | 🔲 | Coordinator Agent, `skills/personalInterview.ts` ✅, `skills/projectInterview.ts` ✅ | Implement `agents/interview.ts`: adaptive question loop, detects completeness, returns next question or final profile JSON. |
| `validateProfileCompleteness()` tool | A | 🔲 | `types/profile.ts` ✅ | New tool (spec-recommended, currently missing). Checks required fields per `personalInterviewSkill`/`projectInterviewSkill` field lists; returns `{ complete, missingFields }`. Used by Interview Agent to decide the next question. |
| Tool integration — profile/project | A | 🔲 | `tools/profile.ts` ✅, `tools/project.ts` ✅ (already built) | Wire existing `savePersonProfile`, `getPersonProfile`, `saveProjectProfile`, `getProjectProfile`, `listTwins`, `listProjects` into the Interview Agent's completion step. |
| `useInterview()` hook | A | 🔲 | Interview Agent | `hooks/useInterview.ts` — drives the interview conversation state for the UI (Phase 4 consumer). |
| `useTwins()` / `useProjects()` hooks | A | 🔲 | Tool integration (A) | `hooks/useTwins.ts`, `hooks/useProjects.ts` — list/fetch data for Home and Twin Profile screens. |
| Decision Agent | B | 🔲 | Coordinator Agent, `skills/decisionReasoning.ts` ✅ | Implement `agents/decision.ts`: load context (via Middleware), call Claude with decision skill, return `{ answer, reasoning, confidence }`. |
| Review Agent | B | 🔲 | Decision Agent, `skills/answerReview.ts` ✅ | Implement `agents/review.ts`: validate Decision Agent output, apply the 70% confidence threshold, return `{ approved, confidence, requiresHuman }`. |
| Tool integration — conversation | B | 🔲 | `tools/conversation.ts` ✅ (already built) | Wire existing `saveMessage`, `getConversationHistory`, `clearConversationHistory` into the Decision Agent's context loading and post-answer save step. |
| Middleware — context injection | B | 🔲 | Decision Agent, Tool integration (B) | `middleware/loadDecisionContext.ts` — the spec's required context-injection layer: auto-loads Personal Profile + Project Profile + last 10–20 messages before the Decision Agent runs, so the agent never fetches data itself. |
| `useChat()` hook | B | 🔲 | Decision Agent, Review Agent, Middleware | `hooks/useChat.ts` — drives the chat screen's send/receive/agent-status state (Phase 4 consumer). |
| End-to-end pipeline — Twin/Project creation | A | 🔲 | Coordinator, Interview Agent, tool integration (A) | Verify `Coordinator → Interview Agent → save*Profile → Done` runs correctly for both CREATE_TWIN and CREATE_PROJECT workflows via a console/script test. |
| End-to-end pipeline — Chat | B | 🔲 | Coordinator, Decision Agent, Review Agent, Middleware | Verify `Coordinator → Decision Agent → Review Agent → Answer` runs correctly via a console/script test, including the low-confidence escalation path. |
| Agent testing — Coordinator/Interview | A | 🔲 | End-to-end pipeline (A) | Manual test scripts covering all 4 workflow routes + interview completion edge cases. |
| Agent testing — Decision/Review | B | 🔲 | End-to-end pipeline (B) | Manual test scripts covering high-confidence, low-confidence/escalation, and missing-context cases from the spec's Error States section. |

**Phase 2 exit criteria:** both pipelines can be triggered from a script/console call (no UI) and return correctly-shaped, schema-valid JSON.

---

## Phase 3 — Application Logic

Goal: connect Phase 2's agents/hooks to real persisted data and real navigation — still minimal UI.

| Task | Owner | Status | Dependencies | Description |
|---|---|---|---|---|
| Supabase project provisioning + apply migration | A | 🔲 | Phase 1 migration file ✅ | **Blocking task** — create a real Supabase project, run `001_initial_schema.sql`, populate `.env` with real `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` / `EXPO_PUBLIC_ANTHROPIC_API_KEY`. Both developers are blocked on this for any live testing. |
| Twin creation flow | A | 🔲 | Interview Agent, `useInterview()`, `useTwins()` | Wire `app/interview/create-twin.tsx` to the real interview hook/agent instead of placeholder text. |
| Project creation flow | A | 🔲 | Interview Agent, `useInterview()`, `useProjects()` | Wire `app/interview/create-project.tsx` similarly. |
| Persistence — profile/project data | A | 🔲 | Tool integration (A) | Confirm round-trip: interview → save → reload on Home/Twin screens. |
| Routing — Home → Twin → Project | A | 🔲 | Twin/Project creation flows | Add the currently-missing **Project screen route** (`app/project/[id].tsx`) and wire navigation params (`twinId`, `projectId`) through Home → Twin Profile → Project. Touches `app/_layout.tsx` — coordinate with B before editing (shared file). |
| Persistence — conversation data | B | 🔲 | Tool integration (B) | Confirm round-trip: chat message → save → reload conversation history. |
| Routing — Project → Chat | B | 🔲 | `useChat()` | Wire navigation from the new Project screen's "Chat with Decision Twin" button into `app/chat/[projectId].tsx`. Also touches `app/_layout.tsx` — coordinate with A. |
| State management review | A | 🔲 | Twin/Project flows | Confirm `store/appStore.ts` (already built) needs no changes for currentTwin/currentProject; add interview-draft state only if the interview UI needs it. |
| State management review | B | 🔲 | Chat flow | Confirm `agentExecution` state in `store/appStore.ts` (already built) is sufficient for driving the Chat screen's visualization; extend only if needed. |

**Phase 3 exit criteria:** creating a twin, creating a project, and exchanging a chat message all persist to and reload from a real Supabase project.

---

## Phase 4 — Frontend

Goal: replace every placeholder screen with the real, polished UI described in `PROJECT_SPEC.md` Section 2.

| Task | Owner | Status | Dependencies | Description |
|---|---|---|---|---|
| Home screen | A | 🔲 | `useTwins()`, Phase 3 | Real twin list with search bar, twin cards (name/role/project count), FAB "Create Twin", empty state ("No Twins yet"). |
| Twin Profile screen | A | 🔲 | `useTwins()`, `useProjects()` | Header, role, summary tags, project list, "Ask [Name]" primary action, "Edit Twin" (owner only). |
| Project screen (new) | A | 🔲 | Routing (A, Phase 3) | New screen: Goal / Priorities / Constraints / Decision Rules / Escalation Rules cards + "Chat with Decision Twin" button. This is the screen identified as missing during spec review. |
| Interview UI | A | 🔲 | `useInterview()` | Conversational chat-style UI for both create-twin and create-project flows; "Generating Decision Twin..." transition; animated profile reveal on completion. |
| Loading states — Twin/Project/Interview | A | 🔲 | Above screens | "Loading Profile...", "Interviewing..." per spec's Visual Feedback section. |
| Empty states | A | 🔲 | Home, Twin Profile | "No Twins yet" / "No projects found" per spec text. |
| Error states — Interview | A | 🔲 | Interview UI | "The Decision Twin needs more project context..." per spec. |
| Chat screen | B | 🔲 | `useChat()`, Phase 3 | iMessage-style chat UI: message bubbles, answer with reasoning bullets + confidence %. |
| Agent execution visualization — wiring | B | 🔲 | Chat screen, `useChat()` | Connect the **already-built** `AgentExecution.tsx` component to real `agentExecution` store state driven by the live Coordinator → Decision → Review pipeline (currently only animates in isolation). |
| Loading states — Chat | B | 🔲 | Chat screen | "Reasoning...", "Reviewing..." per spec's Visual Feedback section. |
| Error states — Chat | B | 🔲 | Chat screen | "This decision requires Hassan's approval" (low confidence) per spec's Error States section. |

**Phase 4 exit criteria:** the full demo flow (create twin → create project → chat → see agent animation → get answer with reasoning/confidence) works from real UI, no placeholders remaining.

---

## Phase 5 — Polish

Goal: presentation-quality finish for the demo.

| Task | Owner | Status | Dependencies | Description |
|---|---|---|---|---|
| Animations — navigation/lists | A | 🔲 | Phase 4 (A screens) | Screen transitions, card reveal animations (profile generation reveal). |
| Visual refinements — Twin/Project/Interview | A | 🔲 | Phase 4 (A screens) | Spacing, typography, icon polish per Linear/Apple/Notion direction. |
| Demo seed data — twins & projects | A | 🔲 | Phase 3 persistence | Seed Hassan Osama / Khaled Ashraf twins + Banking App / AI Dashboard projects, matching the spec's example scenario (the migration file already has a commented-out seed insert to adapt). |
| Animations — chat/agent visualization | B | 🔲 | Phase 4 (B screens) | Refine timing so the Coordinator→Decision→Review animation reliably completes in <2 seconds per spec. |
| Visual refinements — Chat | B | 🔲 | Phase 4 (B screens) | Bubble styling, confidence badge styling. |
| Demo seed data — sample conversation | B | 🔲 | Demo seed data (A), Phase 3 persistence | Pre-seeded chat messages supporting the demo script's two example questions (delay release; budget increase → escalation). |
| Bug fixing | A + B | 🔲 | All above | Ongoing, each dev fixes bugs within their own domain files. |
| Performance improvements | A + B | 🔲 | All above | Reduce agent round-trip latency, verify list rendering performance. |
| Final demo preparation | A + B | 🔲 | All above | Rehearse the spec's 8-step demo script; prepare architecture diagram/slides. |

---

## Current Milestone

**Phase 1 (Foundation) is complete.** The project has a full type system, working Supabase/Anthropic service wrappers, real (not stubbed) data tools, all prompts and skills written, reusable UI components, and a fully-built (but unwired) agent-execution animation. No agent logic and no real screens exist yet — everything user-facing is a placeholder.

## Next Priority

1. **Unblock testing** — provision a real Supabase project and populate `.env` (currently the single biggest blocker; owner: A, but both devs need it).
2. **In parallel:** Developer A implements the Coordinator + Interview Agents; Developer B implements the Decision + Review Agents. These are independent file sets (`agents/coordinator.ts`+`interview.ts` vs. `agents/decision.ts`+`review.ts`) and can start immediately without waiting on each other, since both only depend on already-complete Phase 1 work (prompts, skills, services).

## Blockers

- **No `.env` configured** — no Anthropic API key, no Supabase project. Nothing beyond static UI can be tested until this exists.
- **Database migration not yet applied** — `001_initial_schema.sql` is written but has never been run against a live database.
- **No dedicated Project screen** — spec requires Home → Twin → Project → Chat, but no `app/project/[id].tsx` route exists yet. Needs to be created in Phase 3/4 before Developer A's routing work can complete.
- **Shared file coordination** — `app/_layout.tsx` will be edited by both developers when registering new routes (Project screen by A, any Chat-related route changes by B). Coordinate via small, frequent commits to this one file rather than large simultaneous edits.
- **`hooks/` and `middleware/` folders don't exist yet** — first tasks in Phase 2 create these; recommend A scaffolds both empty folders in one small commit before either developer adds their first hook, so folder creation itself isn't a merge conflict.

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
