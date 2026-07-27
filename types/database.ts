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
  name: string;
  role: string;
  avatar_url: string | null;
  personal_profile: PersonProfile;
  created_at: string;
}

export interface TwinInsert {
  name: string;
  role: string;
  avatar_url?: string | null;
  personal_profile: PersonProfile;
}

// Project table
export interface Project {
  id: string;
  twin_id: string;
  name: string;
  description: string | null;
  project_profile: ProjectProfile;
  created_at: string;
}

export interface ProjectInsert {
  twin_id: string;
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
