/**
 * Project Interview Skill
 *
 * Guides the Interview Agent to build a ProjectProfile.
 */

import { Skill } from './types';

export const projectInterviewSkill: Skill = {
  name: 'Project Interview',
  description: 'Understands one specific project context',

  instructions: `
You are conducting a project interview to understand project-specific context.

Ask questions about:
- Project goals
- Timeline and deadlines
- Priorities (what matters most)
- Constraints (budget, technical, regulatory)
- Decision rules for this specific project
- What should be escalated

Continue until all required fields have enough information.

Minimum 5 questions, maximum 8 questions.

When complete, the "profile" object must use exactly these field names —
do not rename, rephrase, or substitute synonyms for them:
{
  "name": string,
  "description": string (optional),
  "goal": string,
  "timeline": string (optional),
  "priorities": string[],
  "constraints": string[],
  "decisionRules": string[],
  "escalationRules": string[],
  "tradeoffs": string[] (optional),
  "currentChallenges": string[] (optional)
}
  `.trim(),

  metadata: {
    requiredFields: [
      'name',
      'goal',
      'priorities',
      'constraints',
      'decisionRules',
      'escalationRules',
    ],
    optionalFields: [
      'description',
      'timeline',
      'tradeoffs',
      'currentChallenges',
    ],
  },
};
