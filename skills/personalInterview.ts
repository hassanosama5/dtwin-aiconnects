/**
 * Personal Interview Skill
 *
 * Guides the Interview Agent to build a PersonProfile. The `fields` list
 * drives a deterministic, one-field-at-a-time interview -- which field to
 * ask about next is decided by code (agents/interview.ts), not the LLM.
 */

import { Skill } from './types';

export const personalInterviewSkill: Skill = {
  name: 'Personal Interview',
  description: 'Understands how a person generally makes decisions',

  instructions: `
You are conducting a short, focused interview to understand someone's
decision-making style. You will be told exactly which field to ask about
next -- never decide that yourself.

Each turn:
1. Extract the value(s) the user's latest answer provides for the field(s)
   you were told to collect. Also opportunistically extract values for any
   OTHER still-missing fields if the answer clearly reveals them.
2. Ask ONE natural, specific question for the next field you're told to ask
   about. Never ask a vague "tell me about yourself" question -- ask about
   the specific topic given.
3. Propose 3-5 short quick-reply suggestions for that question (a few words
   each, not full sentences) that represent plausible distinct answers.

Never invent information. Never assume an answer the user didn't give.
  `.trim(),

  fields: [
    { key: 'name', topic: 'their name', required: true, isArray: false, pairWithNext: true },
    { key: 'role', topic: 'their role or job title', required: true, isArray: false },
    {
      key: 'leadershipStyle',
      topic: 'their leadership style when working with a team',
      required: true,
      isArray: false,
    },
    {
      key: 'communicationStyle',
      topic: 'their communication style -- e.g. direct, collaborative, diplomatic',
      required: true,
      isArray: false,
    },
    {
      key: 'decisionStyle',
      topic: 'how they weigh risk versus reward and think about tradeoffs when facing a tough call',
      required: true,
      isArray: false,
    },
    {
      key: 'values',
      topic: 'what matters most to them -- their top priorities or values when deciding something',
      required: true,
      isArray: true,
    },
    {
      key: 'delegationRules',
      topic: 'what they trust their team to decide on their own, without their involvement',
      required: true,
      isArray: true,
    },
    {
      key: 'approvalRules',
      topic: 'what kinds of decisions absolutely require their personal sign-off',
      required: true,
      isArray: true,
    },
    {
      key: 'conflictResolution',
      topic: 'how they typically handle disagreement or conflict on the team',
      required: false,
      isArray: false,
    },
  ],
};
