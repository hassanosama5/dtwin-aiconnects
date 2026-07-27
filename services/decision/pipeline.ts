/**
 * Decision pipeline service
 *
 * Orchestrates the Coordinator → Decision → Review flow for chat requests.
 * This keeps the hook thin and makes the pipeline testable.
 */

import { decisionAgent } from '../../agents/decision';
import { reviewAgent } from '../../agents/review';
import { loadDecisionContext } from '../../middleware/loadDecisionContext';
import { saveMessage } from '../../tools/conversation';
import type { DecisionRequest, DecisionResponse, ReviewRequest, ReviewResponse } from '../../types/agent';
import { logger } from '../../utils/logger';

export interface DecisionPipelineResult {
  decision: DecisionResponse;
  review: ReviewResponse;
  approved: boolean;
}

export async function runDecisionPipeline(
  request: DecisionRequest
): Promise<{ success: true; result: DecisionPipelineResult } | { success: false; error: string }> {
  try {
    logger.agent('Service', 'Starting decision pipeline');

    const contextResult = await loadDecisionContext(request);
    if (!contextResult.success) {
      return contextResult;
    }

    const decisionResult = await decisionAgent({
      ...request,
      conversationHistory: contextResult.context.conversationHistory,
    });

    if (!decisionResult.success) {
      return {
        success: false,
        error: decisionResult.error || 'Decision agent failed',
      };
    }

    const reviewRequest: ReviewRequest = {
      decision: decisionResult.output,
      personProfile: contextResult.context.personProfile as any,
      projectProfile: contextResult.context.projectProfile as any,
    };

    const reviewResult = await reviewAgent(reviewRequest);

    if (!reviewResult.success) {
      return {
        success: false,
        error: reviewResult.error || 'Review agent failed',
      };
    }

    await saveMessage(
      request.projectId,
      'assistant',
      decisionResult.output.answer,
      {
        reasoning: decisionResult.output.reasoning,
        confidence: decisionResult.output.confidence,
        requiresHuman: reviewResult.output.requiresHuman,
      }
    );

    return {
      success: true,
      result: {
        decision: decisionResult.output,
        review: reviewResult.output,
        approved: reviewResult.output.approved,
      },
    };
  } catch (error) {
    logger.error('Decision pipeline failed', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
