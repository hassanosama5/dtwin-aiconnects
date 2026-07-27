# Foundation

- [x] Expo Setup
- [x] Supabase (schema written; live project not yet provisioned — see ROADMAP Blockers)
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

(All four implemented and type-checked; not yet run against a live Claude/Supabase call — no `.env` yet.)

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
