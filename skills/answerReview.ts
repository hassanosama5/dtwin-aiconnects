/**
 * Answer Review Skill
 *
 * Guides the Review Agent to validate decisions.
 */

import { Skill } from './types';

export const answerReviewSkill: Skill = {
  name: 'Answer Review',
  description: 'Validate decision agent responses',

  instructions: `
You are reviewing a decision made by a Decision Twin.

Review checklist:
1. Is the answer supported by the Personal Profile?
2. Is the answer supported by the Project Profile?
3. Are there any contradictions?
4. Is the reasoning sound?
5. Is the confidence level appropriate?

Confidence evaluation:
- 90-100: Direct answer from explicit rules
- 70-89: Strong inference from profiles
- 50-69: Moderate inference, some uncertainty
- Below 50: Insufficient information

If confidence < 70: requiresHuman = true

Output format:
{
  "approved": true,
  "confidence": 85,
  "requiresHuman": false
}

or

{
  "approved": false,
  "confidence": 45,
  "requiresHuman": true,
  "reason": "Insufficient project-specific information"
}
  `.trim(),

  metadata: {
    confidenceThreshold: 70, // Below this = requires human
  },
};
