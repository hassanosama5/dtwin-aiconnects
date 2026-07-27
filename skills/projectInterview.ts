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
