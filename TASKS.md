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

(All four implemented and type-checked. Live-tested against real Claude/Supabase: CREATE_TWIN kickoff + a follow-up turn, and the CHAT missing-context guard. Not yet live-tested: full interview completion/save, CREATE_PROJECT, live Decision→Review.)

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

# UI

- [ ] Home
- [ ] Twin
- [ ] Project
- [ ] Chat

# Polish

- [ ] Animations
- [ ] Icons
- [ ] Demo Data
