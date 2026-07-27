/**
 * Review Agent
 *
 * Validates the Decision Agent's response before it reaches the user.
 * Declares no tools — it only reviews structured outputs it's given.
 */

import { BaseAgent } from './BaseAgent';
import { ClaudeMessage } from '../services/anthropic';
import { reviewPrompt } from '../prompts/review';
import { answerReviewSkill } from '../skills/answerReview';
import { ReviewResponseSchema } from '../utils/validation';
import { AgentContext, ReviewRequest, ReviewResponse } from '../types/agent';

export class ReviewAgent extends BaseAgent<ReviewRequest, ReviewResponse> {
  constructor(model?: string) {
    super({
      name: 'Review',
      description: "Validates the Decision Agent's response before it reaches the user.",
      responsibility:
        'Verify the answer is supported by the provided profiles, evaluate confidence, and decide whether to escalate to the represented person. Never modify the answer — only approve or reject it.',
      model,
      systemPrompt: reviewPrompt,
      skills: [answerReviewSkill],
      tools: [],
      outputSchema: ReviewResponseSchema,
      errorOutput: { approved: false, confidence: 0, requiresHuman: true, reason: 'Review failed' },
    });
  }

  protected buildMessages(request: ReviewRequest, context?: AgentContext): ClaudeMessage[] {
    const sections: string[] = [];

    if (context?.personProfile) {
      sections.push(`Personal Profile:\n${JSON.stringify(context.personProfile, null, 2)}`);
    }
    if (context?.projectProfile) {
      sections.push(`Project Profile:\n${JSON.stringify(context.projectProfile, null, 2)}`);
    }
    sections.push(`Decision Agent Response:\n${JSON.stringify(request.decision, null, 2)}`);

    return [{ role: 'user', content: sections.join('\n\n') }];
  }
}
