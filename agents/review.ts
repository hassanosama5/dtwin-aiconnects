/**
 * Review Agent
 *
<<<<<<< HEAD
 * Validates decision agent responses.
 */

import { chat } from '../services/anthropic';
import { reviewPrompt } from '../prompts/review';
import { answerReviewSkill } from '../skills/answerReview';
import { ReviewRequest, ReviewResponse, AgentResponse } from '../types/agent';
import { ReviewResponseSchema } from '../utils/validation';
import { logger } from '../utils/logger';
=======
 * Validates the Decision Agent's response before it reaches the user.
 * Declares no tools — it only reviews structured outputs it's given.
 */

import { BaseAgent } from './BaseAgent';
import { ClaudeMessage } from '../services/anthropic';
import { reviewPrompt } from '../prompts/review';
import { answerReviewSkill } from '../skills/answerReview';
import { ReviewResponseSchema } from '../utils/validation';
import { AgentContext, ReviewRequest, ReviewResponse } from '../types/agent';
>>>>>>> origin/habiba

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

<<<<<<< HEAD
  try {
    const systemPrompt = `${reviewPrompt}\n\n${answerReviewSkill.instructions}`;
    const userContent = JSON.stringify({
      decision: request.decision,
      personProfile: request.personProfile,
      projectProfile: request.projectProfile,
    }, null, 2);

    const response = await chat({
      systemPrompt,
      messages: [{ role: 'user', content: userContent }],
      schema: ReviewResponseSchema,
      maxRetries: 1,
    });

    if (!response.parsed) {
      throw new Error('Review agent did not return structured JSON');
    }

    return {
      success: true,
      agent: 'Review',
      output: response.parsed,
      executionTime: performance.now() - startTime,
    };
  } catch (error) {
    logger.error('Review agent failed', error);

    return {
      success: true,
      agent: 'Review',
      output: buildFallbackReview(request),
      executionTime: performance.now() - startTime,
    };
=======
    if (context?.personProfile) {
      sections.push(`Personal Profile:\n${JSON.stringify(context.personProfile, null, 2)}`);
    }
    if (context?.projectProfile) {
      sections.push(`Project Profile:\n${JSON.stringify(context.projectProfile, null, 2)}`);
    }
    sections.push(`Decision Agent Response:\n${JSON.stringify(request.decision, null, 2)}`);

    return [{ role: 'user', content: sections.join('\n\n') }];
>>>>>>> origin/habiba
  }
}

function buildFallbackReview(request: ReviewRequest): ReviewResponse {
  const confidence = request.decision.confidence;
  const requiresHuman = confidence < answerReviewSkill.confidenceThreshold;

  return {
    approved: !requiresHuman,
    confidence,
    requiresHuman,
    reason: requiresHuman
      ? 'Confidence fell below the human-review threshold.'
      : 'The decision is consistent with the provided profiles.',
  };
}
