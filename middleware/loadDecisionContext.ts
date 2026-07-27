/**
 * Decision Context Middleware
 *
 * Assembles the Personal Profile, Project Profile, and recent Conversation
 * History the Decision Agent needs — BEFORE it executes. Invoked by the
 * Coordinator, never by the Decision Agent itself, so the agent never
 * manually fetches its own context (PROJECT_SPEC.md §6/§8).
 *
 * Missing profile/history data degrades gracefully (the field is simply
 * omitted from context) rather than throwing — a Decision Agent given a
 * thinner context is expected to lower its own confidence, not crash.
 */

import { ProfileTool } from '../tools/profile';
import { ProjectTool } from '../tools/project';
import { ConversationTool } from '../tools/conversation';
import { AgentContext } from '../types/agent';
import { logger } from '../utils/logger';

const DEFAULT_HISTORY_LIMIT = 20;

export async function loadDecisionContext(
  twinId: string,
  projectId: string,
  historyLimit: number = DEFAULT_HISTORY_LIMIT
): Promise<AgentContext> {
  const [profileResult, projectResult, historyResult] = await Promise.all([
    ProfileTool.get(twinId),
    ProjectTool.get(projectId),
    ConversationTool.getHistory(projectId, historyLimit),
  ]);

  if (!profileResult.success) {
    logger.warning('Middleware: could not load Personal Profile', profileResult.error);
  }
  if (!projectResult.success) {
    logger.warning('Middleware: could not load Project Profile', projectResult.error);
  }
  if (!historyResult.success) {
    logger.warning('Middleware: could not load Conversation History', historyResult.error);
  }

  return {
    personProfile: profileResult.success ? profileResult.twin.personal_profile : undefined,
    projectProfile: projectResult.success ? projectResult.project.project_profile : undefined,
    conversationHistory: historyResult.success ? historyResult.messages : [],
  };
}
