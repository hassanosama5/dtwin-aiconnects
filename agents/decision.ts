/**
 * Decision Agent
 *
 * Answers questions as the represented person would.
 * Phase 2 implementation placeholder.
 */

import { DecisionRequest, DecisionResponse, AgentResponse } from '../types/agent';
import { decisionPrompt } from '../prompts/decision';
import { logger } from '../utils/logger';

export async function decisionAgent(
  request: DecisionRequest
): Promise<AgentResponse<DecisionResponse>> {
  const startTime = performance.now();

  logger.agent('Decision', 'Processing question');

  try {
    // TODO: Phase 2 - Implement decision logic
    // 1. Load person profile
    // 2. Load project profile
    // 3. Load conversation history
    // 4. Build context
    // 5. Call Anthropic service with decision skill
    // 6. Parse and validate response

    throw new Error('Decision agent not yet implemented');
  } catch (error) {
    logger.error('Decision agent failed', error);

    return {
      success: false,
      agent: 'Decision',
      output: {
        answer: '',
        reasoning: [],
        confidence: 0,
      },
      executionTime: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
