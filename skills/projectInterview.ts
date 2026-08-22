/**
 * Project Interview Skill
 *
 * Field plan kept in sync with types/profile.ts's ProjectProfile. Not
 * currently invoked by the app -- Project creation is a plain form (see
 * app/project/create.tsx) since a Project is an independent workspace, not
 * a Twin-style decision profile -- but kept internally consistent rather
 * than left pointing at a stale schema, per "don't change agent
 * architecture" (this branch of the Interview Agent still works if ever
 * re-invoked, it's just unused today).
 */

import { Skill } from './types';

export const projectInterviewSkill: Skill = {
  name: 'Project Interview',
  description: 'Understands one specific project workspace',

  instructions: `
You are conducting a short, focused interview to understand a project
workspace. You will be told exactly which field to ask about next -- never
decide that yourself.

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
    { key: 'title', topic: 'the project title', required: true, isArray: false },
    {
      key: 'description',
      topic: 'a short description of what this project is',
      required: true,
      isArray: false,
    },
    {
      key: 'objectives',
      topic: 'the main objectives of this project',
      required: true,
      isArray: true,
    },
    {
      key: 'deadline',
      topic: 'the deadline for this project, if any',
      required: false,
      isArray: false,
    },
    {
      key: 'stakeholders',
      topic: 'who the key stakeholders are',
      required: false,
      isArray: true,
    },
    {
      key: 'constraints',
      topic: 'technical, budget, or resource constraints for this project',
      required: true,
      isArray: true,
    },
    {
      key: 'notes',
      topic: 'anything else worth noting about this project',
      required: false,
      isArray: false,
    },
  ],
};
