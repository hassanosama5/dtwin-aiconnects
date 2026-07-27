This is a hackathon project. The goal is not to build the most advanced AI system, but to build the most convincing demonstration of agentic AI. Every architectural decision should improve the clarity of the demo, not the complexity of the implementation. If a feature does not make the demo stronger, it should be removed or postponed.

PROJECT SPECIFICATION
Decision Twin
Version 1.0 (Hackathon MVP)

1. Executive Summary
   Project Name

Decision Twin

Tagline

An AI representative that answers as a specific person within the context of a specific project.

Vision

Decision Twin allows professionals to create AI representatives that mirror how they make decisions.

Instead of repeatedly answering similar questions, team members can ask the person's Decision Twin.

Unlike traditional AI assistants, Decision Twin does not imitate personality.

Instead, it imitates:

decision making
priorities
values
reasoning
communication style
project-specific constraints

The goal is to reduce repetitive meetings while ensuring answers remain aligned with the represented person's thinking.

Problem Statement

Modern software teams rely heavily on key decision makers such as:

Project Managers
Product Owners
Team Leads
Engineering Managers

These people spend significant time answering repetitive questions.

Examples include:

Can we delay this feature?
Should we prioritize this bug?
Is this feature required?
Can we change the timeline?

Many of these questions follow consistent decision patterns.

Decision Twin captures these patterns and answers on behalf of the represented person.

Scope

This project is a hackathon MVP.

The objective is not to build a complete enterprise solution.

Instead, the objective is to demonstrate a clear and understandable agentic workflow using multiple collaborating agents.

The architecture should prioritize simplicity, explainability, and presentation quality.

Success Criteria

A successful MVP should demonstrate:

✅ Multiple collaborating agents

✅ Agent skills

✅ Tool usage

✅ Middleware

✅ Human-in-the-loop

✅ Shared memory

✅ Beautiful mobile interface

Elevator Pitch

Imagine every important person on your team had an AI representative.

Instead of interrupting your Project Manager every hour, you simply ask their Decision Twin.

The AI answers according to that person's own decision-making style and the current project's rules.

If the AI is uncertain, it escalates the question to the real person.

Target Users

Primary users:

Project Managers
Product Owners
Team Leads
Engineering Managers

Secondary users:

Developers
Designers
QA Engineers
Product Teams
Example Scenario

Hassan Osama is the Project Manager of a Banking Application.

Instead of answering the same questions every day,

Hassan spends five minutes creating his Decision Twin.

The Interview Agent learns:

his values
leadership style
communication style
decision rules

Hassan then creates a project called

"Banking App"

The Interview Agent gathers:

project priorities
constraints
deadlines
escalation rules

Later,

a developer asks:

Can we delay the release by two days to improve onboarding animations?

The Coordinator routes the request.

The Decision Agent reasons using Hassan's Personal Profile and the Banking App Project Profile.

The Review Agent verifies the answer.

The app responds:

Hassan would likely reject delaying the release because this project prioritizes shipping on time unless security is affected.

Confidence: 94%

Design Philosophy

The application should feel like:

Linear
Apple
Notion

NOT like

ChatGPT
Sci-fi AI
Neon dashboards

The interface should feel like a professional productivity application.

MVP Philosophy

Every feature should answer one question:

"Will this make the demo more impressive?"

If not,

remove it.

Technical Principles
Keep the architecture modular.
Use multiple simple agents instead of one complex agent.
Use structured JSON rather than complex memory systems.
Prefer deterministic workflows over autonomous planning.
Build a polished user experience before adding advanced AI features.

2. User Experience & User Flow
   Design Goal

The application should feel like you are interacting with real digital representatives of people, not AI chatbots.

The user should never think about agents, prompts, or AI.

Instead, they simply think:

"Who do I want to ask?"

The agent architecture remains completely hidden except for a small execution visualization while answering.

User Types

The application has two user types.

1. Twin Owner

The person creating their own Decision Twin.

Example:

Hassan Osama
Project Manager

The owner creates and manages their twins.

2. Visitor

A teammate who wants to ask questions.

Example:

Developer

Designer

QA Engineer

Product Manager

Visitors only interact with existing twins.

Owner Flow
Open App

↓

Create Decision Twin

↓

AI Interview

↓

Personal Profile Generated

↓

Create Project

↓

Project Interview

↓

Project Profile Generated

↓

Twin Ready
Visitor Flow
Open App

↓

Choose Twin

↓

Choose Project

↓

Ask Question

↓

Coordinator

↓

Decision Agent

↓

Review Agent

↓

Receive Answer
Navigation

The application contains only four main screens.

Home

Twin Profile

Project

Chat

No complex navigation.

No settings pages for the MVP.

Screen 1 — Home

Purpose

Display all available Decision Twins.

Header

Decision Twin

Subtitle

Who would you like to ask?

Search Bar

Search Twins...

Twin Cards

👤 Hassan Osama

Project Manager

3 Projects

Open
👤 Khaled Ashraf

Team Lead

2 Projects

Open

Floating Action Button

- Create Twin
  Screen 2 — Twin Profile

Purpose

Show information about the represented person.

Header

Hassan Osama

Role

Project Manager

Summary

Collaborative Leader

Security First

Data Driven

Projects

🏦 Banking App

🤖 AI Dashboard

Primary Action

Ask Hassan

Secondary Action (Owner only)

Edit Twin
Screen 3 — Project Screen

Displays project-specific information.

Banking App

Cards

Goal

Priorities

Constraints

Decision Rules

Escalation Rules

Primary Button

Chat with Decision Twin
Screen 4 — Chat

This is the main demo screen.

The design should resemble iMessage.

Example

Developer

Can we delay the release?

Instead of a loading spinner

show

Coordinator

↓

Decision Agent

↓

Review Agent

Each node lights up while running.

This animation should take less than two seconds.

It visually demonstrates the agent architecture.

Then display

Answer

Hassan would likely reject delaying the release.

Reasoning

• Deadline is fixed

• Security is prioritized

• UI improvements are negotiable

Confidence

94%
Creating a Twin

Instead of filling long forms,

the owner has a conversation.

Hi Hassan!

I'm going to learn how you make decisions.

Let's start.

The Interview Agent asks adaptive questions.

It continues until enough information has been collected.

When complete

display

Generating Decision Twin...

Then reveal the generated profile using animated cards.

Creating a Project

The process is identical.

Let's learn about your project.

The Interview Agent gathers

Goal

Priorities

Constraints

Decision Rules

Escalation Rules

Timeline

Then generates the Project Profile.

Visual Feedback

Avoid generic AI loading indicators.

Instead use meaningful execution states.

Examples

Loading Profile...
Interviewing...
Reasoning...
Reviewing...

This makes the application feel purposeful.

Empty States

No Twins

You haven't created any Decision Twins yet.

Create your first Twin.

No Projects

No projects found.

Create your first project.
Error States

Low confidence

This decision requires Hassan's approval.

Missing project information

The Decision Twin needs more project context before answering this question.
MVP Features

Only implement:

✅ Create Twin

✅ Create Project

✅ Chat with Twin

✅ View Twin

Everything else is postponed.

User Experience Principles

The app should always feel:

Fast
Minimal
Professional
Predictable
Friendly

Avoid unnecessary animations or AI-themed visuals.

The focus should be on the represented person and the conversation, not on the underlying technology.

Suggested refinement

One thing I'd change from our original idea: don't expose "Projects" on the Home screen immediately. Let the flow be:

Home (Twins)
↓
Twin Profile
↓
Select Project
↓
Chat

That makes the mental model much clearer: you're always interacting with a person first, then choosing the context (project) in which you want their Decision Twin to answer. It's simpler for users and easier to explain during your demo.

3. Agent Architecture
   Overview

Decision Twin uses a lightweight multi-agent architecture.

Instead of having one large AI assistant responsible for everything, responsibilities are divided between three specialized agents coordinated by a central router.

Each agent has:

A single responsibility
A dedicated system prompt
A small set of skills
Access only to the tools it requires

This architecture makes the system easier to understand, debug, and explain during the hackathon presentation.

Architecture Diagram
User
│
▼
Coordinator Agent
│
┌───────────┼───────────┐
▼ ▼ ▼
Interview Decision Review
Agent Agent Agent
│ │ │
└──────┬────┴────┬──────┘
▼ ▼
Skills Library Tools
│
▼
Shared Memory
(Supabase)
Shared Memory

All agents share the same memory.

Agents never communicate directly.

Instead, they:

Read from shared memory
Write to shared memory
Pass structured outputs through the Coordinator
Agent Lifecycle
Create Twin
User
↓

Coordinator

↓

Interview Agent

↓

Personal Profile JSON

↓

Save Tool

↓

Done
Create Project
User

↓

Coordinator

↓

Interview Agent

↓

Project Profile JSON

↓

Save Tool

↓

Done
Ask Twin
User

↓

Coordinator

↓

Decision Agent

↓

Review Agent

↓

Answer
Agent 1 — Coordinator Agent
Purpose

The Coordinator is the entry point of the system.

It receives every user request and determines which agent should handle it.

It never generates responses.

It never reasons.

It only routes requests.

Responsibilities
Detect user intent
Route requests
Collect outputs
Return final response
Example Routes

Create Twin

↓

Interview Agent

Create Project

↓

Interview Agent

Ask Question

↓

Decision Agent

↓

Review Agent

Skills

Intent Classification

Workflow Routing

Tools

None

Agent 2 — Interview Agent
Purpose

The Interview Agent builds structured knowledge.

Instead of filling forms,

the user has a natural conversation.

The Interview Agent continues asking questions until every required field has been collected.

Responsibilities
Conduct interviews
Ask follow-up questions
Detect missing information
Detect contradictions
Build profiles
Generate JSON
Outputs

Personal Profile

Project Profile

Success Criteria

The interview only ends when:

Personal Profile is complete

or

Project Profile is complete

depending on the workflow.

Skills
Personal Interview

Collect

values
leadership style
communication style
decision style
delegation
approval rules
Project Interview

Collect

goal
priorities
constraints
deadlines
escalation rules
trade-offs
Tools

save_person_profile()

save_project_profile()

Agent 3 — Decision Agent
Purpose

This is the actual Decision Twin.

It answers exactly as the represented person would.

Responsibilities
Load Personal Profile
Load Project Profile
Load Chat History
Answer questions
Explain reasoning
Estimate confidence
Inputs

Personal Profile

Project Profile

Conversation

Question

Outputs

Answer

Reasoning

Confidence

Skills

Decision Reasoning

Context Interpretation

Answer Generation

Tools

get_person_profile()

get_project_profile()

get_chat_history()

Agent 4 — Review Agent
Purpose

The Review Agent verifies every response before it reaches the user.

It improves trust and demonstrates Human-in-the-Loop.

Responsibilities
Review generated answer
Verify consistency
Detect unsupported claims
Estimate confidence
Decide whether escalation is needed
Decision Logic

High Confidence

↓

Return Answer

Low Confidence

↓

Escalate

Skills

Answer Review

Confidence Estimation

Consistency Checking

Tools

None

The Review Agent only reviews structured outputs.

Human-in-the-Loop

If confidence falls below a configurable threshold (e.g., 70%), the Review Agent returns:

Status:
Needs Approval

Reason:
Insufficient confidence.

Recommendation:
Ask Hassan directly.

For the MVP, no approval workflow needs to be implemented.

Displaying this message is sufficient to demonstrate the concept.

Agent Communication

Agents communicate only through structured objects.

Example:

Coordinator → Decision Agent

{
"twinId": "...",
"projectId": "...",
"question": "Can we delay the release?"
}

Decision Agent → Review Agent

{
"answer": "...",
"reasoning": [
"...",
"..."
],
"confidence": 91
}

This keeps communication deterministic and easy to debug.

Why Multiple Agents?

Although a single prompt could perform the same task, separating responsibilities demonstrates the core concepts from the workshop:

Task decomposition
Specialized agents
Skills
Tool usage
Orchestration
Human-in-the-loop

At the same time, each agent remains simple enough to implement during a three-day hackathon.

Design Principles

Each agent must follow these rules:

One clear responsibility.
Small system prompt.
Limited tools.
Limited skills.
Structured inputs and outputs.
No duplicated logic.
No direct communication with other agents.
Easy to test independently.
Suggested improvement

I would make one small change to better match the workshop.

Instead of the Coordinator containing routing logic directly, implement it as a simple workflow controller with explicit states:

CREATE_TWIN
CREATE_PROJECT
CHAT
UPDATE_PROFILE

The Coordinator simply switches on the current workflow state and invokes the appropriate agent. This makes the orchestration easier to explain to judges ("the Coordinator manages workflows") and much easier to extend later without changing the individual agents.

4. Skills Architecture
   Philosophy

Agents are intentionally kept lightweight.

They should not contain all of their logic inside their system prompts.

Instead, reusable capabilities are implemented as Skills.

A skill is a reusable capability that contains:

Purpose
Instructions
Examples
Expected inputs
Expected outputs

An agent loads only the skills it needs.

This follows the architecture introduced during the workshop.

Skills Directory
skills/
│
├── personal_interview/
│ ├── SKILL.md
│ └── examples.md
│
├── project_interview/
│ ├── SKILL.md
│ └── examples.md
│
├── decision_reasoning/
│ ├── SKILL.md
│ └── examples.md
│
└── answer_review/
├── SKILL.md
└── examples.md

Each skill should be self-contained and reusable.

Skill 1 — Personal Interview
Used By

Interview Agent

Purpose

Understand how a person generally makes decisions.

The objective is not to learn facts.

The objective is to build a reusable decision profile.

Information To Collect

Identity

Role

Leadership Style

Communication Style

Core Values

Decision Style

Delegation Style

Approval Rules

General Principles

Conflict Resolution

Behaviour

The Interview Agent should:

Ask open-ended questions.

Ask follow-up questions.

Detect contradictions.

Summarize information.

Continue until all required fields are complete.

Output

Personal Profile JSON

Skill 2 — Project Interview
Used By

Interview Agent

Purpose

Understand one specific project.

Information To Collect

Project Name

Description

Goal

Timeline

Priorities

Constraints

Decision Rules

Escalation Rules

Trade-offs

Current Challenges

Behaviour

Continue asking questions until every field has enough information.

Avoid fixed questionnaires.

Questions should adapt based on previous answers.

Output

Project Profile JSON

Skill 3 — Decision Reasoning
Used By

Decision Agent

Purpose

Answer as the represented person.

Never answer as a generic AI assistant.

Every answer should reflect:

Personal Profile

Project Profile

Behaviour

Load context.

Identify relevant rules.

Reason using only stored information.

Explain reasoning.

Estimate confidence.

Never invent missing information.

Output
{
"answer": "...",
"reasoning": [
"...",
"..."
],
"confidence": 92
}
Skill 4 — Answer Review
Used By

Review Agent

Purpose

Review every generated answer before it reaches the user.

Checks

Does the answer follow the profiles?

Is the reasoning supported?

Are there contradictions?

Is confidence acceptable?

Should this be escalated?

Output
{
"approved": true,
"confidence": 91,
"requiresHuman": false
}

or

{
"approved": false,
"requiresHuman": true,
"reason": "Insufficient context."
}
Skill Design Rules

Every skill should follow these principles:

Single Responsibility

Each skill solves one problem.

Reusable

Skills should be reusable by different agents if needed.

Stateless

Skills should never store data.

They receive input.

They produce output.

Independent

Skills should not call each other.

The agent orchestrates them.

Deterministic

Given the same input,

the skill should produce similar outputs.

Why Skills?

Instead of creating large prompts like:

"You are an interviewer, reviewer, planner..."

we divide behaviour into focused capabilities.

This makes:

prompts smaller
agents easier to understand
responsibilities clearer
future extensions simpler
Future Skills (Not MVP)

These are intentionally excluded from the hackathon MVP but fit naturally into the architecture.

Learning from approved decisions
Email summarization
Calendar awareness
Slack context retrieval
Meeting summarization
GitHub PR context
Organization policy lookup

The architecture should allow these skills to be added later without modifying existing agents.

Skill Loading

When an agent starts executing,

it should load only the skills required for the current task.

Example:

Interview Agent
│
├── Personal Interview
└── Project Interview
Decision Agent
│
└── Decision Reasoning
Review Agent
│
└── Answer Review

This keeps each agent focused and minimizes unnecessary instructions.

Design Decision

One important design choice for the implementation:

Skills should not be "AI agents."

A skill is simply a documented capability (for example, a SKILL.md file plus helper logic) that an agent uses while completing its task. The agent remains the decision-maker; the skill provides the guidance. This matches what you learned in the workshop and keeps the implementation lightweight.

I think the next section should be Tools & Shared Memory, because once we define the tools, the agents become almost trivial to implement. The flow becomes:

Coordinator → Agent → Skill → Tool → Shared Memory → Response

5. Tools & Shared Memory
   Philosophy

Agents should never access the database directly.

Instead, every interaction with data happens through Tools.

This follows the workshop principle:

An agent reasons. A tool performs actions.

This separation makes the system modular, testable, and easier to extend.

Tool Architecture
Agent
│
Calls Tool
│
▼
Tool executes action
│
▼
Shared Memory
(Supabase)

Agents never execute SQL or database logic.

They simply request actions through tools.

Tool Categories

The MVP contains four categories of tools.

Profile Tools

Project Tools

Conversation Tools

Future External Tools

1. Profile Tools

These manage the represented person's long-term profile.

savePersonProfile()

Purpose

Save the generated Personal Profile after the interview.

Input

{
"personId": "...",
"profile": { ... }
}

Output

{
"success": true
}
getPersonProfile()

Purpose

Load the Personal Profile before answering.

Input

{
"personId": "..."
}

Output

{
"profile": { ... }
}
updatePersonProfile()

Purpose

Update the profile after re-interviewing the owner.

This is optional for the MVP.

2. Project Tools

Manage project-specific information.

saveProjectProfile()

Purpose

Store a project's profile after the interview.

getProjectProfile()

Purpose

Load project context before answering.

listProjects()

Purpose

Display all projects belonging to a twin.

Used by the UI.

3. Conversation Tools

These support chat history.

saveConversation()

Purpose

Store messages exchanged with the Decision Twin.

getConversationHistory()

Purpose

Provide conversation history to the Decision Agent.

The MVP should only retrieve the most recent messages (for example, the last 10–20) to keep prompts manageable.

searchPreviousAnswers()

Purpose

Look for similar previous decisions made by the Decision Twin.

This can initially be implemented with a simple keyword search over stored conversations.

No vector database or embeddings are required for the MVP.

Future External Tools

These tools are not implemented in the hackathon.

They exist as interfaces to demonstrate extensibility.

calendarTool()

emailTool()

slackTool()

githubTool()

notionTool()

During the presentation you can explain:

"The architecture already supports external connectors. For the MVP, we implemented internal profile and conversation tools, while enterprise connectors can be added later."

Shared Memory

All persistent information is stored in Supabase.

The agents share this memory.

They never communicate directly.

Instead:

Interview Agent

↓

savePersonProfile()

↓

Supabase

↓

Decision Agent

↓

getPersonProfile()

This creates a single source of truth.

Data Stored

The MVP stores:

Twins

Projects

Personal Profiles

Project Profiles

Conversations

Messages

No additional storage systems are required.

Personal Profile Schema

The Personal Profile represents the person's general decision-making style.

Example

{
"name": "Hassan Osama",
"role": "Project Manager",
"leadershipStyle": "Collaborative",
"communicationStyle": "Direct",
"decisionStyle": "Data Driven",
"values": [
"Security",
"Customer First",
"Honesty"
],
"delegationRules": [
"Developers can decide implementation details."
],
"approvalRules": [
"Timeline changes require approval."
]
}
Project Profile Schema

Represents one project.

Example

{
"project": "Banking App",
"goal": "Ship MVP",
"priorities": [
"Security",
"Performance"
],
"constraints": [
"Fixed Deadline"
],
"decisionRules": [
"Delay only for security issues."
],
"escalationRules": [
"Budget changes"
]
}
Tool Design Principles

Every tool should follow these rules.

One Responsibility

A tool performs one action only.

Stateless

A tool does not remember previous executions.

It simply receives input and returns output.

Deterministic

The same input should produce the same output.

Independent

Tools never call other tools.

Agents coordinate tool usage.

Easy to Test

Every tool should be executable independently of the agents.

Tool Execution Examples
Creating a Twin
Interview Agent

↓

savePersonProfile()

↓

Success
Asking a Question
Decision Agent

↓

getPersonProfile()

↓

getProjectProfile()

↓

getConversationHistory()

↓

Generate Answer
Updating a Twin
Interview Agent

↓

updatePersonProfile()

↓

Success
Why This Design?

This architecture keeps the responsibilities clear:

Agents think
Skills define how they perform a task
Tools interact with data
Shared Memory stores persistent information

This separation mirrors the concepts introduced in the workshop while remaining lightweight enough for a hackathon MVP.

One improvement I strongly recommend

I think we should add one more tool because it will make the interview agent feel much smarter without much extra work.

validateProfileCompleteness()

Purpose:

The Interview Agent calls this tool after every answer.

It checks whether all required sections of the profile have been collected.

Example output:

{
"complete": false,
"missingFields": [
"Approval Rules",
"Conflict Resolution"
]
}

Then the Interview Agent knows exactly what to ask next.

6. AI Architecture & Prompt Design
   Philosophy

Decision Twin is not a chatbot.

It is a collection of specialized AI agents working together to complete a workflow.

Each agent has:

One responsibility
A focused system prompt
A limited set of skills
A limited set of tools

No agent should attempt to solve problems outside its responsibility.

AI Execution Flow
Creating a Twin
User

↓

Coordinator

↓

Interview Agent

↓

Personal Interview Skill

↓

validateProfileCompleteness()

↓

savePersonProfile()

↓

Done
Creating a Project
User

↓

Coordinator

↓

Interview Agent

↓

Project Interview Skill

↓

validateProfileCompleteness()

↓

saveProjectProfile()

↓

Done
Asking a Question
User

↓

Coordinator

↓

Decision Agent

↓

Review Agent

↓

Answer
Prompt Design Principles

Every prompt should follow the same structure.

SYSTEM PROMPT

↓

Loaded Skills

↓

Available Tools

↓

Current Context

↓

User Request

The system prompt should remain short.

Most behaviour belongs inside Skills.

Coordinator Agent Prompt

Purpose

Identify the user's current workflow.

The Coordinator should never answer questions.

It should only decide which workflow is required.

Possible workflows

CREATE_TWIN

CREATE_PROJECT

CHAT

UPDATE_PROFILE

Expected Output

{
"workflow":"CHAT"
}
Interview Agent Prompt

Mission

Build a complete representation of the represented person or project.

The Interview Agent must continue asking questions until the profile is complete.

Never stop early.

Never assume missing information.

If a field is missing,

ask another question.

Expected Outputs

Personal Profile JSON

or

Project Profile JSON

Decision Agent Prompt

Mission

Represent one specific person.

Never answer as ChatGPT.

Never answer using general knowledge unless it supports the stored context.

Always reason using

Personal Profile

Project Profile

Conversation

Every response must contain

Answer

Reasoning

Confidence

Example

{
"answer":"...",
"reasoning":[
"...",
"..."
],
"confidence":91
}
Review Agent Prompt

Mission

Review the Decision Agent's response.

Questions to answer

Does the answer follow the profiles?

Is there enough evidence?

Is confidence high enough?

Should the response be escalated?

Expected Output

{
"approved":true,
"confidence":91,
"requiresHuman":false
}
Context Injection

Before every Decision Agent execution,

the middleware automatically loads

Personal Profile

-

Project Profile

-

Conversation History

The Decision Agent never manually loads data.

It always receives complete context.

Structured Outputs

Every agent returns structured JSON.

Never free-form text.

Examples

Coordinator

{
"workflow":"CHAT"
}

Interview

{
"complete":true,
"profile":{}
}

Decision

{
"answer":"...",
"reasoning":[...],
"confidence":91
}

Review

{
"approved":true
}

Structured outputs make the agents predictable and easier to debug.

Confidence

Confidence should not be random.

The Decision Agent estimates confidence based on:

Completeness of the Personal Profile.
Completeness of the Project Profile.
Whether the decision is directly covered by existing rules.
Amount of ambiguity in the question.

The Review Agent validates this estimate.

If confidence falls below the configured threshold (e.g., 70%), the response is marked for human review.

Prompt Engineering Rules

All prompts should follow these principles:

Be concise.
Never duplicate instructions already defined in Skills.
Never describe UI behavior.
Never mention implementation details.
Never invent missing information.
Prefer asking for clarification over guessing.
Produce structured outputs whenever possible.
Shared Context

The Decision Agent should think of its inputs as three layers:

Layer 1
Personal Profile

↓

Layer 2
Project Profile

↓

Layer 3
Conversation History

↓

Current Question

This ordering is intentional.

General decision-making style influences project-specific rules, and both influence the current conversation.

Why This Architecture?

This design keeps the AI layer modular:

The Coordinator decides what should happen.
The Interview Agent gathers information.
The Decision Agent reasons.
The Review Agent validates.

Each agent is simple, focused, and independently testable, which is ideal for a hackathon MVP and closely matches the agent-skill-tool architecture you learned in the workshop.

7. Technical Architecture
   Philosophy

The project follows a feature-based architecture with a clear separation between:

UI
Business Logic
AI Agents
Skills
Tools
Database
Shared Types

Each layer has a single responsibility.

The application should remain easy to navigate even as new features are added.

Technology Stack
Mobile
React Native
Expo
TypeScript
Expo Router
Styling
NativeWind
TailwindCSS
React Native Reanimated
Backend
Supabase
AI
OpenAI SDK
GPT-5 (or latest OpenAI model)
State Management
Zustand
Validation
Zod
Forms
React Hook Form
Database
PostgreSQL (Supabase)
Authentication

Supabase Authentication

Email only (for MVP)

Folder Structure
app/
│
├── (tabs)/
│
├── twins/
│
├── projects/
│
├── chat/
│
├── interview/
│
└── settings/

components/
│
├── ui/
├── cards/
├── chat/
├── twin/
└── shared/

agents/
│
├── coordinator/
├── interview/
├── decision/
└── review/

skills/
│
├── personal_interview/
├── project_interview/
├── decision_reasoning/
└── answer_review/

tools/
│
├── profile/
├── project/
├── conversation/
└── validation/

services/
│
├── ai/
├── supabase/
└── storage/

hooks/

store/

types/

middleware/

constants/

utils/

assets/

Every folder has a single purpose.

Feature Flow

Every feature should follow the same architecture.

Example

Screen

↓

Hook

↓

Service

↓

Coordinator

↓

Agent

↓

Skill

↓

Tool

↓

Database

No screen should directly call the database.

Shared Types

Create shared TypeScript interfaces.

Example

PersonProfile

ProjectProfile

DecisionResponse

ReviewResponse

Conversation

Message

Twin

Project

These types should be used everywhere.

Services

Services contain reusable business logic.

Example

AIService

TwinService

ProjectService

ConversationService

No UI code inside services.

Hooks

React hooks should manage UI state.

Example

useInterview()

useChat()

useTwins()

useProjects()

Business logic stays in services.

State Management

Use Zustand.

Global state should remain minimal.

Store only:

Current User

Current Twin

Current Project

Theme

Authentication

Do not store chat history globally.

Fetch it when needed.

Environment Variables

Store all secrets inside .env.

Example

OPENAI_API_KEY

SUPABASE_URL

SUPABASE_ANON_KEY

Never hardcode keys.

Database Schema
twins
id

owner_id

name

role

avatar

created_at
personal_profiles
id

twin_id

profile_json

updated_at
projects
id

twin_id

name

description

created_at
project_profiles
id

project_id

profile_json

updated_at
conversations
id

project_id

created_at
messages
id

conversation_id

role

content

created_at
Why JSON?

Both profiles should be stored as JSON.

Reasons:

Flexible
Easy to evolve
Perfect for LLM prompts
No complex relational schema

Example

{
"values": [],
"communicationStyle": "",
"decisionRules": []
}
Repository Pattern

The MVP does not need repositories.

Services can communicate directly with Supabase.

Avoid unnecessary abstractions.

Coding Standards

Every file should follow these rules.

Single Responsibility

One file.

One purpose.

Small Components

Components should stay under ~200 lines where practical.

Strong Typing

Avoid any.

Use TypeScript interfaces.

Reusable Components

Do not duplicate UI.

Create reusable:

Cards
Buttons
Inputs
Chat Bubbles
Agent Status Indicator
No Business Logic in Screens

Screens should:

Display UI.

Call hooks.

Nothing else.

Logging

During development,

every agent execution should print:

Coordinator

↓

Interview Agent

↓

Decision Agent

↓

Review Agent

This makes debugging much easier.

Error Handling

Every service should return structured errors.

Example

{
success:false,
error:"Profile not found."
}

Avoid throwing exceptions inside UI components.

Development Principles

Always prefer:

Simple

Readable

Maintainable

Hackathon-friendly

over

Complex

Enterprise

Over-engineered

Scalability

The architecture should make it easy to add future features such as:

Slack Connector
Email Connector
Calendar Integration
GitHub Context
Organization Knowledge Base
Learning from Approved Decisions

without modifying the existing agent architecture.

Development Workflow

The project should be built in the following order:

Phase 1 — Foundation
Expo project
Navigation
Theme
Database
Folder structure
Authentication
Phase 2 — Twin Creation
Create Twin UI
Interview Agent
Personal Profile generation
Save profile
Phase 3 — Project Creation
Create Project UI
Project Interview
Project Profile generation
Phase 4 — Chat
Coordinator
Decision Agent
Review Agent
Chat UI
Confidence
Reasoning
Phase 5 — Polish
Animations
Loading states
Empty states
Icons
Bug fixing
Demo preparation
Final Development Rules

Claude should follow these rules throughout the project:

Never rewrite the architecture without approval.
Build one feature at a time.
Explain before coding.
Use reusable components.
Keep agents independent.
Keep skills reusable.
Keep tools stateless.
Prioritize completing a polished MVP over adding features.
One final improvement I'd make

I would add one more folder:

prompts/
│
├── coordinator.ts
├── interview.ts
├── decision.ts
└── review.ts

Instead of embedding prompts inside services, every agent's system prompt lives in its own file. This keeps prompt engineering separate from application logic, makes prompts easy to iterate on during the hackathon, and mirrors the separation you've already established between agents, skills, and tools.

8. System Prompts
   Philosophy

Each agent should have a concise system prompt.

The prompt defines the agent's role and objectives.

Detailed behavior should come from:

Skills
Tools
Context
Structured Outputs

This keeps prompts maintainable and easier to iterate during the hackathon.

Coordinator Agent
Purpose

Identify the user's intent.

Select the correct workflow.

Invoke the correct agent.

Never answer the user directly.

Available Workflows
CREATE_TWIN

CREATE_PROJECT

CHAT

UPDATE_PROFILE
System Prompt
You are the Coordinator Agent.

Your responsibility is to identify the user's intent and route the request to the appropriate workflow.

You never answer user questions.

You never generate content.

You only decide which workflow should execute.

Possible workflows:

- CREATE_TWIN
- CREATE_PROJECT
- CHAT
- UPDATE_PROFILE

Return only structured JSON.

Never explain your reasoning.
Interview Agent
Purpose

Create structured representations of people and projects.

Goal

Continue asking questions until the required profile is complete.

Do not stop because the conversation feels "good enough."

Stop only when every required field has enough information.

System Prompt
You are the Interview Agent.

Your responsibility is to understand the represented person or project.

Your goal is to build complete structured profiles.

Ask open-ended questions.

Ask intelligent follow-up questions.

Detect contradictions.

Summarize information when useful.

Never invent information.

Never assume missing information.

Continue interviewing until the profile is complete.

Use available tools to validate profile completeness.

When complete, generate structured JSON only.
Decision Agent
Purpose

Represent one specific person.

Not a generic AI assistant.

System Prompt
You are the Decision Agent.

You represent one specific person's decision-making process.

You do not answer using your own opinions.

Base every answer on:

- Personal Profile
- Project Profile
- Conversation History

Never contradict the stored profiles.

Never invent missing preferences.

If information is missing, lower your confidence or recommend escalation.

Every response must include:

- Answer
- Reasoning
- Confidence

Return structured JSON only.
Review Agent
Purpose

Validate every generated response.

System Prompt
You are the Review Agent.

Review every response generated by the Decision Agent.

Verify that the answer is supported by the provided profiles.

Check for contradictions.

Evaluate confidence.

If confidence is below the configured threshold, recommend Human-in-the-Loop.

Never modify the answer.

Only approve or reject it.

Return structured JSON only.
Prompt Construction

Every execution follows the same pattern.

System Prompt

↓

Loaded Skills

↓

Available Tools

↓

Loaded Context

↓

Current User Input

This structure should remain consistent for all agents.

Context Injection

The middleware is responsible for injecting context before an agent executes.

The agent should never manually retrieve context.

For example, before the Decision Agent runs, it automatically receives:

Personal Profile

Project Profile

Conversation History

Current User Question

This keeps the agent focused on reasoning rather than data retrieval.

Prompt Design Rules

All prompts should follow these principles:

Keep prompts under one page whenever possible.
Define responsibilities, not implementation details.
Rely on Skills for domain-specific behavior.
Rely on Tools for external actions.
Always prefer structured outputs.
Never duplicate instructions already defined elsewhere.
Structured Outputs

Every agent returns JSON.

Coordinator

{
"workflow": "CHAT"
}

Interview

{
"complete": true,
"profile": { }
}

Decision

{
"answer": "...",
"reasoning": [
"...",
"..."
],
"confidence": 91
}

Review

{
"approved": true,
"requiresHuman": false
}

This ensures predictable communication between agents.

Prompt Evolution

The prompts are intentionally minimal.

Future improvements should be made by:

Improving Skills
Adding Tools
Enhancing Context

Avoid continuously increasing prompt size.

This keeps the architecture scalable and maintainable.

Design Principles

Every prompt should satisfy the following:

One responsibility.
Clear objective.
No duplicated instructions.
No business logic.
No UI behavior.
No database operations.
No implementation details.
Why This Design?

This prompt strategy aligns with the architecture of the application:

Agents define responsibilities.
Skills define behavior.
Tools perform actions.
Middleware provides context.
Shared memory stores knowledge.

The prompts remain simple because the surrounding architecture carries most of the intelligence.

One improvement I recommend before implementation

One thing I'd add is a shared response schema used by every agent.

For example:

interface AgentResponse<T> {
success: boolean;
agent: string;
output: T;
executionTime: number;
}

That means every agent—Coordinator, Interview, Decision, and Review—returns results in the same envelope. It makes orchestration, logging, debugging, and future observability much cleaner, and it's a small addition that pays off quickly during development.

9. Development Roadmap
   Philosophy

The application should never be built all at once.

Every feature should be completed end-to-end before moving to the next.

Each phase should leave the application in a working state.

Phase 1 — Project Foundation

Goal:

Create a clean, scalable foundation.

Deliverables

Expo project
TypeScript
Navigation
Theme
NativeWind
Supabase integration
Folder structure
Shared types
Base UI components
Environment variables
Zustand store
AI service skeleton

The application should compile successfully.

No AI functionality yet.

Phase 2 — Agent Foundation

Goal

Build the architecture before the features.

Deliverables

Coordinator Agent

Interview Agent

Decision Agent

Review Agent

Shared interfaces

Skills folder

Tools folder

Prompt folder

Middleware

Logging

No UI yet.

Just architecture.

Phase 3 — Twin Creation

Goal

Allow users to create Decision Twins.

Deliverables

Create Twin Screen

Interview UI

Interview Agent

Personal Interview Skill

Profile validation

Personal Profile generation

Save Profile Tool

Twin successfully appears on Home.

Phase 4 — Project Creation

Goal

Allow a Twin to own multiple projects.

Deliverables

Create Project Screen

Project Interview

Project Skill

Project Profile generation

Save Project Tool

Project successfully appears inside Twin.

Phase 5 — Chat

Goal

Complete the Decision Twin experience.

Deliverables

Chat UI

Coordinator routing

Decision Agent

Review Agent

Reasoning

Confidence

Conversation history

Save conversation

The full workflow should function.

Phase 6 — Polish

Goal

Create a presentation-quality application.

Deliverables

Animations

Loading states

Agent execution animation

Icons

Dark mode

Spacing

Typography

Bug fixes

Phase 7 — Demo Preparation

Goal

Prepare the presentation.

Deliverables

Seed data

Example Twins

Example Projects

Prepared demo questions

Screenshots

Architecture diagram

Presentation slides

Development Rules

During implementation

Claude must:

Never rewrite previous architecture.
Never introduce unnecessary libraries.
Keep components reusable.
Build vertically.
Explain before coding.
Wait after every completed feature.
Definition of Done

A feature is complete only if it includes:

UI
Business logic
AI integration
Database integration
Error handling
Loading state
Basic testing
Code Quality

Every feature should leave the application deployable.

The application should compile after every milestone.

No broken branches.

10. Demo Script
    Goal

Demonstrate both the product value and the multi-agent architecture in under five minutes.

Step 1

Introduce the problem.

"Hassan is constantly interrupted by repetitive project questions."

Step 2

Create Hassan's Decision Twin.

The audience watches the Interview Agent ask adaptive questions.

After a few questions

Personal Profile appears.

Step 3

Create Banking App.

The Interview Agent asks about

Goal

Constraints

Priorities

Decision Rules

Project Profile appears.

Step 4

Open Chat.

Developer asks

Can we delay release by two days to improve onboarding animations?

Step 5

Display agent execution.

The UI briefly shows

Coordinator

↓

Decision Agent

↓

Review Agent

Each node lights up.

Step 6

Display answer.

Answer

Reasoning

Confidence

Example

Hassan would likely reject delaying the release because the project prioritizes fixed deadlines unless security is affected.

Confidence

94%

Step 7

Ask an ambiguous question.

Example

Can we increase the project budget?

Review Agent returns

This decision requires Hassan's approval.

This demonstrates Human-in-the-Loop.

Step 8

Finish.

Explain:

"Our architecture separates routing, interviewing, reasoning, and reviewing into specialized agents using skills, tools, middleware, and shared memory."

11. Future Work

The architecture is intentionally designed for extension.

Possible future improvements include:

External Connectors
Gmail
Slack
Calendar
GitHub
Notion
Jira

using MCP.

Learning

Allow the Decision Twin to learn from decisions approved by the represented person.

Team Twins

Multiple Decision Twins collaborating to answer organization-wide questions.

Organization Memory

Shared company policies

Documentation

Meeting notes

Knowledge base

Voice Mode

Interview users through voice instead of text.

Evaluation

Benchmark Decision Twin responses against the real person's answers to measure accuracy.

Final Principles

Decision Twin should always follow these principles:

Keep agents small and focused.
Skills define behavior.
Tools perform actions.
Middleware provides context.
Shared memory stores knowledge.
UI remains simple and professional.
Build the smallest implementation that clearly demonstrates the agentic architecture.
Final Instructions for Claude

For the remainder of this project:

Treat this specification as the single source of truth.
Do not change the architecture without asking.
Build incrementally, one feature at a time.
Before coding any feature:
Explain the approach.
List the files to create or modify.
Describe how it integrates with the existing architecture.
After implementing a feature, stop and wait for approval.
Prefer readability and maintainability over clever solutions.
Keep the project realistic for a three-day hackathon.
