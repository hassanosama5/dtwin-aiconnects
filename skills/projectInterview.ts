/**
 * Project Interview Skill
 *
 * Guides the Interview Agent to build a ProjectProfile. Same deterministic,
 * one-field-at-a-time design as personalInterviewSkill -- field selection is
 * code-driven (agents/interview.ts), not left to the LLM.
 */

import { Skill } from './types';

export const projectInterviewSkill: Skill = {
  name: 'Project Interview',
  description: 'Understands one specific project context',

  instructions: `
You are conducting a short, focused interview to understand a specific
project's context. You will be told exactly which field to ask about next
-- never decide that yourself.

Each turn:
1. Extract the value(s) the user's latest answer provides for the field(s)
   you were told to collect. Also opportunistically extract values for any
   OTHER still-missing fields if the answer clearly reveals them.
2. Ask ONE natural, specific question for the next field you're told to ask
   about. Avoid fixed, generic questionnaire language -- adapt phrasing to
   what's already been shared.
3. Propose 3-5 short quick-reply suggestions for that question (a few words
   each, not full sentences) that represent plausible distinct answers.

Never invent information. Never assume an answer the user didn't give.
  `.trim(),

  fields: [
    { key: 'name', topic: 'the project name', required: true, isArray: false },
    { key: 'goal', topic: 'the main goal of this project', required: true, isArray: false },
    {
      key: 'priorities',
      topic: 'the top priorities for this project',
      required: true,
      isArray: true,
    },
    {
      key: 'constraints',
      topic: 'technical, budget, or resource constraints they are working within',
      required: true,
      isArray: true,
    },
    {
      key: 'decisionRules',
      topic: 'specific decision rules for this project -- e.g. what wins when priorities conflict',
      required: true,
      isArray: true,
    },
    {
      key: 'escalationRules',
      topic: 'what situations should be escalated to them directly',
      required: true,
      isArray: true,
    },
    {
      key: 'timeline',
      topic: 'the deadline and how flexible it is',
      required: false,
      isArray: false,
    },
    {
      key: 'stakeholders',
      topic: 'who the key stakeholders are',
      required: false,
      isArray: true,
      pairWithNext: true,
    },
    {
      key: 'successMetrics',
      topic: 'how success will be measured for this project',
      required: false,
      isArray: true,
    },
  ],
};
