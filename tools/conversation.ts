/**
 * Conversation Tools
 *
 * Tools for managing chat messages and conversation history.
 */

import { supabase } from '../services/supabase';
import { Message, MessageInsert, MessageMetadata } from '../types/database';
import { ChatMessage } from '../types/conversation';
import { logger } from '../utils/logger';
import { Tool } from './types';

/**
 * Save a message to the conversation
 */
export async function saveMessage(
  projectId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: MessageMetadata
): Promise<{ success: true; message: Message } | { success: false; error: string }> {
  try {
    logger.info('Saving message', { projectId, role });

    const messageData: MessageInsert = {
      project_id: projectId,
      role,
      content,
      metadata: metadata || null,
    };

    const { data, error } = await supabase
      .from('messages')
      .insert([messageData] as any)
      .select()
      .single() as { data: Message | null; error: any };

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    return { success: true, message: data };
  } catch (error) {
    logger.error('Failed to save message', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get conversation history for a project
 */
export async function getConversationHistory(
  projectId: string,
  limit: number = 20
): Promise<{ success: true; messages: ChatMessage[] } | { success: false; error: string }> {
  try {
    logger.info('Loading conversation history', { projectId, limit });

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
      .limit(limit) as { data: Message[] | null; error: any };

    if (error) throw error;

    // Convert database messages to chat messages
    const chatMessages: ChatMessage[] = (data || []).map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      reasoning: msg.metadata?.reasoning,
      confidence: msg.metadata?.confidence,
      requiresHuman: msg.metadata?.requiresHuman,
      timestamp: new Date(msg.created_at),
    }));

    return { success: true, messages: chatMessages };
  } catch (error) {
    logger.error('Failed to load conversation history', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** One project's most recent conversation activity, joined with its project
 *  and twin display info -- for the Home screen's "Continue Working"
 *  section and the Conversations tab. `twinId` is null when the message
 *  predates twinId being recorded on the message itself (see below). */
export interface RecentConversationItem {
  projectId: string;
  projectName: string;
  twinId: string | null;
  twinName: string;
  twinAvatarUrl: string | null;
  lastMessage: string;
  lastMessageRole: 'user' | 'assistant' | 'system';
  lastMessageAt: string;
}

/**
 * The most recently active conversations, one per project, newest first.
 *
 * Which Twin a conversation was with cannot be reliably read off
 * `project.twin_id` anymore -- Projects are independent of Twins (see
 * tools/project.ts), so that column is usually null and, even when set, is
 * only ever a "default twin" hint (e.g. scripts/seed-demo-data.cjs), not the
 * twin actually consulted. The Twin actually consulted is recorded on each
 * message's own `metadata.twinId` at save time instead (see
 * agents/coordinator.ts's runChat()); this reads that back first and falls
 * back to `project.twin_id` only for messages saved before that existed,
 * then resolves twin display info with one batched follow-up query rather
 * than a `projects(twins(...))` join.
 *
 * There's no cheap "latest message per project" query via PostgREST without
 * a dedicated database view, and this only backs a lightweight homepage
 * teaser / activity list, not a full inbox -- so this over-fetches recent
 * messages and de-duplicates by project in JS instead of adding a migration.
 */
export async function getRecentConversations(
  limit: number = 5
): Promise<{ success: true; conversations: RecentConversationItem[] } | { success: false; error: string }> {
  try {
    logger.info('Loading recent conversations', { limit });

    const { data, error } = await supabase
      .from('messages')
      .select('project_id, role, content, created_at, metadata, projects(name, twin_id)')
      .order('created_at', { ascending: false })
      .limit(limit * 4) as { data: any[] | null; error: any };

    if (error) throw error;

    const seenProjects = new Set<string>();
    const rows: { projectId: string; projectName: string; twinId: string | null; content: string; role: string; createdAt: string }[] = [];

    for (const row of data || []) {
      if (!row.projects || seenProjects.has(row.project_id)) continue;
      seenProjects.add(row.project_id);
      rows.push({
        projectId: row.project_id,
        projectName: row.projects.name,
        twinId: row.metadata?.twinId ?? row.projects.twin_id ?? null,
        content: row.content,
        role: row.role,
        createdAt: row.created_at,
      });
      if (rows.length >= limit) break;
    }

    const twinIds = [...new Set(rows.map((r) => r.twinId).filter((id): id is string => !!id))];
    const twinById = new Map<string, { name: string; avatar_url: string | null }>();
    if (twinIds.length > 0) {
      const { data: twinsData } = await supabase
        .from('twins')
        .select('id, name, avatar_url')
        .in('id', twinIds) as { data: { id: string; name: string; avatar_url: string | null }[] | null; error: any };
      for (const twin of twinsData || []) {
        twinById.set(twin.id, { name: twin.name, avatar_url: twin.avatar_url });
      }
    }

    const conversations: RecentConversationItem[] = rows.map((r) => ({
      projectId: r.projectId,
      projectName: r.projectName,
      twinId: r.twinId,
      twinName: (r.twinId && twinById.get(r.twinId)?.name) ?? 'Unknown twin',
      twinAvatarUrl: (r.twinId && twinById.get(r.twinId)?.avatar_url) ?? null,
      lastMessage: r.content,
      lastMessageRole: r.role as 'user' | 'assistant' | 'system',
      lastMessageAt: r.createdAt,
    }));

    return { success: true, conversations };
  } catch (error) {
    logger.error('Failed to load recent conversations', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Clear conversation history for a project
 */
export async function clearConversationHistory(
  projectId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    logger.info('Clearing conversation history', { projectId });

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('project_id', projectId);

    if (error) throw error;

    logger.success('Conversation history cleared');

    return { success: true };
  } catch (error) {
    logger.error('Failed to clear conversation history', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ConversationTool
 *
 * Groups the conversation functions above under one named tool so agents can
 * declare ownership (e.g. `tools: [ConversationTool]`) instead of importing
 * these functions ad hoc.
 */
export const ConversationTool: Tool & {
  save: typeof saveMessage;
  getHistory: typeof getConversationHistory;
  clear: typeof clearConversationHistory;
  listRecent: typeof getRecentConversations;
} = {
  name: 'ConversationTool',
  description: 'Save and load chat message history for a project.',
  save: saveMessage,
  getHistory: getConversationHistory,
  clear: clearConversationHistory,
  listRecent: getRecentConversations,
};
