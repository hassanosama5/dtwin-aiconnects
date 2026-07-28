# Foundation

- [x] Expo Setup
- [x] Supabase (`.env` populated; `twins` table confirmed live and queryable — `projects`/`messages` not yet checked, see ROADMAP Blockers)
- [x] Navigation (shell only — screens are placeholders)
- [x] Theme
- [x] Folder Structure

# Agent Framework

- [x] BaseAgent abstract class
- [x] Skill interface
- [x] Tool interface
- [x] AgentRegistry

# Agents

- [x] Coordinator (orchestrates Interview / Decision+Review — single orchestration layer)
- [x] Interview
- [x] Decision
- [x] Review

(All four implemented, type-checked, and live-tested end-to-end against real Claude/Supabase: CREATE_TWIN interview kickoff & full save, and CHAT Decision → Review pipeline.)

# Skills

- [x] Personal Interview
- [x] Project Interview
- [x] Decision Reasoning
- [x] Answer Review

# Tools

- [x] Save Profile / Get Profile / List Twins (ProfileTool)
- [x] Save Project / Get Project / List Projects (ProjectTool)
- [x] Save Message / Get Chat History (ConversationTool)
- [x] Validate Profile Completeness (ValidationTool)

# Middleware

- [x] Decision context injection (loadDecisionContext)

# Hooks

- [x] useInterview (live-tested to full completion + save)
- [x] useTwins
- [ ] useProjects
- [x] useChat (live-verified via Coordinator pipeline integration)

# UI

- [x] Home (real twin list, search, empty state, FAB)
- [x] Create Twin (conversational interview screen)
- [ ] Twin Profile
- [ ] Project
- [ ] Chat

(Home/Create Twin not visually verified — no emulator/simulator/device available in this environment. Compilation, bundling, and the full data path were verified instead.)

# Polish

- [ ] Animations
- [ ] Icons
- [ ] Demo Data
