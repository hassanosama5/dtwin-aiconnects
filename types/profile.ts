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

// Project Profile (stored as JSONB) -- a Project is an independent
// workspace, not a Twin-style decision profile. No agent/interview is
// involved in producing this; it's filled in directly via a plain form
// (app/project/create.tsx).
export interface ProjectProfile {
  title: string;
  description: string;
  objectives: string[];
  deadline?: string;
  stakeholders?: string[];
  constraints: string[];
  notes?: string;
}

// Helper types
export type ProfileCompleteness = {
  complete: boolean;
  missingFields: string[];
  completedFields: string[];
};
