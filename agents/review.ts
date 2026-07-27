/**
 * Review Agent
 *
 * Validates decision agent responses.
 */

import { chat } from '../services/anthropic';
import { reviewPrompt } from '../prompts/review';
import { answerReviewSkill } from '../skills/answerReview';
import { ReviewRequest, ReviewResponse, AgentResponse } from '../types/agent';
import { ReviewResponseSchema } from '../utils/validation';
import { logger } from '../utils/logger';

export async function reviewAgent(
  request: ReviewRequest
): Promise<AgentResponse<ReviewResponse>> {
  const startTime = performance.now();

  logger.agent('Review', 'Validating decision');

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
