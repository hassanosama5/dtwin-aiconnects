/**
 * Conversation Types
 *
 * Types for chat messages and conversations
 */

// Message role
export type MessageRole = 'user' | 'assistant' | 'system';

// Chat message (UI representation)
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  reasoning?: string[];
  confidence?: number;
  requiresHuman?: boolean;
  timestamp: Date;
}

// Conversation context for agents
export interface ConversationContext {
  projectId: string;
  messages: ChatMessage[];
  maxMessages?: number; // Limit context window
}

// Interview message (during twin/project creation)
export interface InterviewMessage {
  id: string;
  role: 'agent' | 'user';
  content: string;
  timestamp: Date;
}

// Interview state
export interface InterviewState {
  messages: InterviewMessage[];
  isComplete: boolean;
  currentField?: string;
}
