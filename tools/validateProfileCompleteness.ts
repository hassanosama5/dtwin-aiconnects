/**
 * Validation Tool
 *
 * Checks whether a profile (personal or project) has all required fields
 * filled in, per the owning skill's `metadata.requiredFields`. Pure,
 * stateless, deterministic — no Supabase access.
 */

import { Tool } from './types';

export interface CompletenessResult {
  complete: boolean;
  missingFields: string[];
}

function isFilled(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function checkCompleteness(
  requiredFields: string[],
  profile: Record<string, unknown> | undefined
): CompletenessResult {
  if (!profile) {
    return { complete: false, missingFields: [...requiredFields] };
  }

  const missingFields = requiredFields.filter((field) => !isFilled(profile[field]));

  return { complete: missingFields.length === 0, missingFields };
}

export const ValidationTool: Tool & {
  checkCompleteness: typeof checkCompleteness;
} = {
  name: 'ValidationTool',
  description: "Checks a profile's completeness against a skill's required fields.",
  checkCompleteness,
};
