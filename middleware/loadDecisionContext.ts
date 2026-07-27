/**
 * Decision Context Middleware
 *
 * Loads the person profile, project profile, and recent conversation history
 * before the Decision Agent runs so the agent can reason from stored context.
 */

import { getConversationHistory } from '../tools/conversation';
import { getPersonProfile } from '../tools/profile';
import { getProjectProfile } from '../tools/project';
import type { DecisionRequest } from '../types/agent';
import type { ChatMessage } from '../types/conversation';
import { logger } from '../utils/logger';

const fallbackPersonProfile = {
  name: 'Represented Person',
  role: 'Team Lead',
  leadershipStyle: 'Collaborative and clear',
  communicationStyle: 'Direct and practical',
  decisionStyle: 'Values delivery, clarity, and risk awareness',
  values: ['Delivery', 'Clarity', 'Team alignment'],
  delegationRules: ['Delegate execution details when the owner is clear on outcomes'],
  approvalRules: ['Escalate high-impact or ambiguous decisions'],
  conflictResolution: 'Focus on shared goals and decision quality',
  generalPrinciples: ['Prefer straightforward tradeoffs', 'Escalate when uncertainty is high'],
};

const fallbackProjectProfile = {
  name: 'Current Project',
  description: 'Project context is not yet available.',
  goal: 'Deliver a clear, reliable outcome',
  timeline: 'Pending',
  priorities: ['Clarity', 'Delivery', 'Risk awareness'],
  constraints: ['Need more context before making a strong decision'],
  decisionRules: ['Prefer simple, low-risk choices'],
  escalationRules: ['Escalate when confidence is low'],
  tradeoffs: ['Balanced tradeoffs over premature certainty'],
  currentChallenges: ['Context is still being gathered'],
};

export interface DecisionContext {
  personProfile: {
    name: string;
    role: string;
    leadershipStyle: string;
    communicationStyle: string;
    decisionStyle: string;
    values: string[];
    delegationRules: string[];
    approvalRules: string[];
    conflictResolution?: string;
    generalPrinciples?: string[];
  };
  projectProfile: {
    name: string;
    description?: string;
    goal: string;
    timeline?: string;
    priorities: string[];
    constraints: string[];
    decisionRules: string[];
    escalationRules: string[];
    tradeoffs?: string[];
    currentChallenges?: string[];
  };
  conversationHistory: ChatMessage[];
  contextSummary: string;
}

export async function loadDecisionContext(
  request: Pick<DecisionRequest, 'twinId' | 'projectId' | 'conversationHistory' | 'context'>
): Promise<{ success: true; context: DecisionContext } | { success: false; error: string }> {
  try {
    logger.agent('Middleware', 'Loading decision context');

    const [personResult, projectResult, historyResult] = await Promise.all([
      getPersonProfile(request.twinId).catch((error) => {
        logger.warning('Person profile lookup failed, using fallback context', error);
        return { success: false as const, error: error instanceof Error ? error.message : 'Unknown error' };
      }),
      getProjectProfile(request.projectId).catch((error) => {
        logger.warning('Project profile lookup failed, using fallback context', error);
        return { success: false as const, error: error instanceof Error ? error.message : 'Unknown error' };
      }),
      getConversationHistory(request.projectId, 20).catch((error) => {
        logger.warning('Conversation history lookup failed, using fallback context', error);
        return { success: false as const, error: error instanceof Error ? error.message : 'Unknown error' };
      }),
    ]);

    const personProfile = personResult.success
      ? personResult.twin.personal_profile
      : request.context?.personProfile || fallbackPersonProfile;
    const projectProfile = projectResult.success
      ? projectResult.project.project_profile
      : request.context?.projectProfile || fallbackProjectProfile;
    const conversationHistory = historyResult.success
      ? historyResult.messages
      : request.conversationHistory || [];

    const contextSummary = [
      `Person: ${personProfile.name}`,
      `Role: ${personProfile.role}`,
      `Project: ${projectProfile.name}`,
      `Goal: ${projectProfile.goal}`,
      `Recent messages: ${conversationHistory.length}`,
    ].join(' | ');

    const context: DecisionContext = {
      personProfile,
      projectProfile,
      conversationHistory,
      contextSummary,
    };

    logger.info('Decision context loaded', { twinId: request.twinId, projectId: request.projectId });

    return { success: true, context };
  } catch (error) {
    logger.error('Failed to load decision context', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
