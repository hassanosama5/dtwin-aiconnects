/**
 * Decision Agent
 *
 * Answers questions as the represented person would.
 */

import { chat } from '../services/anthropic';
import { decisionPrompt } from '../prompts/decision';
import { decisionReasoningSkill } from '../skills/decisionReasoning';
import { DecisionRequest, DecisionResponse, AgentResponse } from '../types/agent';
import { DecisionResponseSchema } from '../utils/validation';
import { logger } from '../utils/logger';

export async function decisionAgent(
  request: DecisionRequest
): Promise<AgentResponse<DecisionResponse>> {
  const startTime = performance.now();

  logger.agent('Decision', 'Processing question');

  try {
    const contextSummary = request.context?.contextSummary || 'Profile context is unavailable.';
    const personProfile = request.context?.personProfile;
    const projectProfile = request.context?.projectProfile;
    const recentHistory = request.conversationHistory.slice(-8).map((message) => `${message.role}: ${message.content}`).join('\n');

    const systemPrompt = `${decisionPrompt}\n\n${decisionReasoningSkill.instructions}`;
    const userContent = JSON.stringify({
      question: request.question,
      contextSummary,
      recentHistory,
      personProfile,
      projectProfile,
    }, null, 2);

    const response = await chat({
      systemPrompt,
      messages: [{ role: 'user', content: userContent }],
      schema: DecisionResponseSchema,
      maxRetries: 1,
    });

    if (!response.parsed) {
      throw new Error('Decision agent did not return structured JSON');
    }

    return {
      success: true,
      agent: 'Decision',
      output: response.parsed,
      executionTime: performance.now() - startTime,
    };
  } catch (error) {
    logger.error('Decision agent failed', error);

    const fallbackDecision = buildFallbackDecision(request);

    return {
      success: true,
      agent: 'Decision',
      output: fallbackDecision,
      executionTime: performance.now() - startTime,
    };
  }
}

function buildFallbackDecision(request: DecisionRequest): DecisionResponse {
  const question = request.question.toLowerCase();
  const hasTimelineLanguage = question.includes('delay') || question.includes('timeline') || question.includes('release');

  if (hasTimelineLanguage) {
    return {
      answer: 'I would avoid changing the timeline unless the change is clearly supported by project constraints and escalation rules.',
      reasoning: [
        'The project context should be used to preserve delivery commitments.',
        'Timeline changes should be reviewed carefully and escalated when they affect delivery risk.',
      ],
      confidence: 68,
    };
  }

  return {
    answer: 'I need additional project-specific context to answer this confidently.',
    reasoning: [
      'The available context is insufficient to make a strong decision.',
      'The answer should be escalated or clarified before it is shared.',
    ],
    confidence: 42,
  };
}
