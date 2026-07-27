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
  // Full interview transcript so far, forwarded to the Interview Agent when the
  // Coordinator routes to CREATE_TWIN / CREATE_PROJECT / UPDATE_PROFILE.
  messages?: Array<{ role: 'agent' | 'user'; content: string }>;
  context?: {
    twinId?: string;
    projectId?: string;
  };
}

// Raw classification output validated against the Coordinator's own LLM call.
export interface CoordinatorResponse {
  workflow: WorkflowType;
}

// Final result returned by CoordinatorAgent.execute() after it orchestrates the
// agent(s) selected by the classified workflow. Richer than CoordinatorResponse
// because the LLM only classifies — the Coordinator's postProcess() does the rest.
export type CoordinatorResult =
  | { workflow: 'CREATE_TWIN' | 'CREATE_PROJECT' | 'UPDATE_PROFILE'; interview: InterviewResponse }
  | { workflow: 'CHAT'; decision: DecisionResponse; review: ReviewResponse };

// Context assembled by Middleware before an agent that needs it executes.
// Agents read from this; they never fetch it themselves.
export interface AgentContext {
  personProfile?: PersonProfile;
  projectProfile?: ProjectProfile;
  conversationHistory?: ChatMessage[];
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
// conversationHistory/personProfile/projectProfile are NOT here — they arrive
// exclusively via AgentContext, assembled by Middleware before execute() runs.
export interface DecisionRequest {
  question: string;
  twinId: string;
  projectId: string;
}

export interface DecisionResponse {
  answer: string;
  reasoning: string[];
  confidence: number;
}

// Review Agent
// personProfile/projectProfile are NOT here — same AgentContext passed to Decision.
export interface ReviewRequest {
  decision: DecisionResponse;
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
