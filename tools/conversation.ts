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
} = {
  name: 'ConversationTool',
  description: 'Save and load chat message history for a project.',
  save: saveMessage,
  getHistory: getConversationHistory,
  clear: clearConversationHistory,
};
