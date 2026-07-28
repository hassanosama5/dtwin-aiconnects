/**
 * Decision pipeline service
 *
 * Orchestrates the Coordinator → Decision → Review flow for chat requests.
 * This keeps the hook thin and makes the pipeline testable.
 */

import { DecisionAgent } from '../../agents/decision';
import { ReviewAgent } from '../../agents/review';
import { loadDecisionContext } from '../../middleware/loadDecisionContext';
import { saveMessage } from '../../tools/conversation';
import type { DecisionRequest, DecisionResponse, ReviewResponse } from '../../types/agent';
import { logger } from '../../utils/logger';

const decisionAgent = new DecisionAgent();
const reviewAgent = new ReviewAgent();

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

    const contextResult = await loadDecisionContext({
      twinId: request.twinId,
      projectId: request.projectId,
      conversationHistory: request.conversationHistory,
      context: {},
    });

    if (!contextResult.success) {
      return contextResult;
    }

    const decisionResult = await decisionAgent.execute(
      {
        ...request,
        conversationHistory: contextResult.context.conversationHistory ?? request.conversationHistory,
      },
      contextResult.context
    );

    if (!decisionResult.success) {
      return {
        success: false,
        error: decisionResult.error || 'Decision agent failed',
      };
    }

    const reviewResult = await reviewAgent.execute(
      { decision: decisionResult.output },
      contextResult.context
    );

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
