/**
 * Profile Merge
 *
 * Deterministic, non-AI text merging for the "improve an existing Decision
 * Twin" interview flow (Sprint 7.2). Each function takes the twin's current
 * value plus a raw interview answer and returns the merged value alongside
 * a description of what changed, if anything — used to build both the
 * comparison screen and the Profile Evolution history.
 *
 * Deliberately simple string logic (dedup, append, replace) — no NLP, no
 * AI, per this sprint's constraints. A few common "no change" phrases are
 * recognized by exact match so answering "no"/"same" doesn't register as
 * a spurious update.
 */

export interface ProfileChange {
  type: 'added' | 'updated';
  /** Section label, e.g. "Core Values", "Decision Style". */
  field: string;
  before?: string;
  after: string;
}

const NO_CHANGE_PHRASES = ['no', 'none', 'no change', 'not really', 'nope', 'same', 'n/a', 'nothing'];

function isMeaningfulAnswer(answer: string | undefined): answer is string {
  if (!answer) return false;
  const trimmed = answer.trim();
  if (!trimmed) return false;
  return !NO_CHANGE_PHRASES.includes(trimmed.toLowerCase());
}

/** Role is a single current-state field — a meaningful new answer replaces it outright. */
export function mergeRole(existing: string, answer: string | undefined): { value: string; change?: ProfileChange } {
  if (!isMeaningfulAnswer(answer)) return { value: existing };
  const trimmed = answer.trim();
  if (trimmed.toLowerCase() === existing.toLowerCase()) return { value: existing };
  return { value: trimmed, change: { type: 'updated', field: 'Role', before: existing, after: trimmed } };
}

/** Decision Style is a free-text paragraph — a new, not-already-covered answer is appended. */
export function mergeDecisionStyle(
  existing: string,
  answer: string | undefined
): { value: string; change?: ProfileChange } {
  if (!isMeaningfulAnswer(answer)) return { value: existing };
  const trimmed = answer.trim();
  if (existing.toLowerCase().includes(trimmed.toLowerCase())) return { value: existing };
  const addition = trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
  const merged = `${existing} Also values ${addition}.`;
  return { value: merged, change: { type: 'updated', field: 'Decision Style', before: existing, after: merged } };
}

/**
 * Core Values (and similar bullet lists) — splits the answer on commas/"and",
 * appends any items not already present (case-insensitive), one 'added'
 * change per new item.
 */
export function mergeList(
  existing: string[],
  answer: string | undefined,
  itemLabel: string
): { value: string[]; changes: ProfileChange[] } {
  if (!isMeaningfulAnswer(answer)) return { value: existing, changes: [] };
  const candidates = answer
    .split(/,| and /i)
    .map((item) => item.trim())
    .filter(Boolean);

  const value = [...existing];
  const changes: ProfileChange[] = [];
  for (const candidate of candidates) {
    const alreadyPresent = value.some((item) => item.toLowerCase() === candidate.toLowerCase());
    if (!alreadyPresent) {
      value.push(candidate);
      changes.push({ type: 'added', field: itemLabel, after: candidate });
    }
  }
  return { value, changes };
}

/** Communication Style — appends one new trait, reported as a single "updated" change (not per-item). */
export function mergeCommunicationStyle(
  existing: string[],
  answer: string | undefined
): { value: string[]; change?: ProfileChange } {
  if (!isMeaningfulAnswer(answer)) return { value: existing };
  const trimmed = answer.trim();
  const alreadyPresent = existing.some((item) => item.toLowerCase() === trimmed.toLowerCase());
  if (alreadyPresent) return { value: existing };
  const value = [...existing, trimmed];
  return {
    value,
    change: {
      type: 'updated',
      field: 'Communication Style',
      before: existing.join(', '),
      after: value.join(', '),
    },
  };
}

export function changeToHistoryLabel(change: ProfileChange): string {
  if (change.type === 'added') {
    return `Added ${change.after} as a ${change.field}`;
  }
  return `Updated ${change.field}`;
}
