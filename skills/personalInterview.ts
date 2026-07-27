/**
 * Personal Interview Skill
 *
 * Guides the Interview Agent to build a PersonProfile.
 * Phase 2 implementation placeholder.
 */

export const personalInterviewSkill = {
  name: 'Personal Interview',
  description: 'Understands how a person generally makes decisions',

  requiredFields: [
    'name',
    'role',
    'leadershipStyle',
    'communicationStyle',
    'decisionStyle',
    'values',
    'delegationRules',
    'approvalRules',
  ],

  optionalFields: [
    'conflictResolution',
    'generalPrinciples',
  ],

  instructions: `
You are conducting a personal interview to understand someone's decision-making style.

Ask open-ended questions about:
- Leadership approach
- Communication preferences
- How they make decisions
- Core values
- Delegation philosophy
- What requires their approval

Continue until all required fields have enough information.

Minimum 5 questions, maximum 8 questions.
  `.trim(),
} as const;
