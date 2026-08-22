/**
 * Database Types
 *
 * TypeScript interfaces for Supabase tables.
 * These match the database schema exactly.
 */

import { PersonProfile, ProjectProfile } from './profile';

// Twin table
export interface Twin {
  id: string;
  owner_id: string | null;
  name: string;
  role: string;
  avatar_url: string | null;
  personal_profile: PersonProfile;
  created_at: string;
}

export interface TwinInsert {
  owner_id: string;
  name: string;
  role: string;
  avatar_url?: string | null;
  personal_profile: PersonProfile;
}

// Project table -- independent of any one Twin. twin_id is an optional
// "default/suggested twin" hint, not a required binding; which Twin
// actually answers is chosen at chat-time (see hooks/useChat.ts).
export interface Project {
  id: string;
  owner_id: string | null;
  twin_id: string | null;
  name: string;
  description: string | null;
  project_profile: ProjectProfile;
  created_at: string;
}

export interface ProjectInsert {
  owner_id: string;
  twin_id?: string | null;
  name: string;
  description?: string | null;
  project_profile: ProjectProfile;
}

// Message table
export interface Message {
  id: string;
  project_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: MessageMetadata | null;
  created_at: string;
}

export interface MessageInsert {
  project_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: MessageMetadata | null;
}

// Message metadata (stored in JSONB)
export interface MessageMetadata {
  reasoning?: string[];
  confidence?: number;
  requiresHuman?: boolean;
  agentExecutionTime?: number;
  // Which Twin answered this turn -- recorded at save time since Projects
  // are independent of Twins now (project.twin_id is not reliable), see
  // tools/conversation.ts's getRecentConversations().
  twinId?: string;
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      twins: {
        Row: Twin;
        Insert: TwinInsert;
        Update: Partial<TwinInsert>;
      };
      projects: {
        Row: Project;
        Insert: ProjectInsert;
        Update: Partial<ProjectInsert>;
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: Partial<MessageInsert>;
      };
    };
  };
}
