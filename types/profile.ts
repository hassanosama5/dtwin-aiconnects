/**
 * Profile Types
 *
 * PersonProfile: Represents how a person generally makes decisions
 * ProjectProfile: Represents project-specific context and rules
 */

// Personal Profile (stored as JSONB)
export interface PersonProfile {
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
}

// Project Profile (stored as JSONB)
export interface ProjectProfile {
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
  stakeholders?: string[];
  successMetrics?: string[];
}

// Helper types
export type ProfileCompleteness = {
  complete: boolean;
  missingFields: string[];
  completedFields: string[];
};
