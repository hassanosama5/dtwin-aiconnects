/**
 * Agent Types
 *
 * Request/response types for all agents
 */

import { PersonProfile, ProjectProfile } from './profile';
import { ChatMessage } from './conversation';

// Workflow types
export type WorkflowType = 'CREATE_TWIN' | 'CREATE_PROJECT' | 'CHAT' | 'UPDATE_PROFILE';

// Base agent response
export interface AgentResponse<T = unknown> {
  success: boolean;
  agent: string;
  output: T;
  executionTime: number;
  error?: string;
}

// Coordinator Agent
export interface CoordinatorRequest {
  message: string;
  context?: {
    twinId?: string;
    projectId?: string;
  };
}

export interface CoordinatorResponse {
  workflow: WorkflowType;
}

// Interview Agent
export interface InterviewRequest {
  type: 'personal' | 'project';
  messages: Array<{ role: 'agent' | 'user'; content: string }>;
  twinId?: string; // For project interviews
}

export interface InterviewResponse {
  complete: boolean;
  nextQuestion?: string;
  profile?: PersonProfile | ProjectProfile;
  missingFields?: string[];
}

// Decision Agent
export interface DecisionRequest {
  question: string;
  twinId: string;
  projectId: string;
  conversationHistory: ChatMessage[];
  context?: {
    personProfile?: PersonProfile;
    projectProfile?: ProjectProfile;
    contextSummary?: string;
  };
}

export interface DecisionResponse {
  answer: string;
  reasoning: string[];
  confidence: number;
}

// Review Agent
export interface ReviewRequest {
  decision: DecisionResponse;
  personProfile: PersonProfile;
  projectProfile: ProjectProfile;
}

export interface ReviewResponse {
  approved: boolean;
  confidence: number;
  requiresHuman: boolean;
  reason?: string;
}

// Agent execution state (for UI visualization)
export type AgentExecutionState = 'idle' | 'coordinator' | 'decision' | 'review' | 'complete' | 'error';

export interface AgentExecutionStatus {
  state: AgentExecutionState;
  currentAgent?: string;
  progress: number; // 0-100
  message?: string;
}
