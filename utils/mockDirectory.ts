/**
 * Mock Directory
 *
 * In-memory registry for mock entities created at runtime (e.g. via the
 * Create Twin interview), so Home, Twin Profile, Project, and Chat can all
 * resolve the same data without Zustand or a backend.
 *
 * Plain module-level state — resets whenever the app reloads. This is not
 * global app state management (no subscriptions, no reducers, no
 * dependency); it's just a shared in-memory lookup table, playing the same
 * role a real backend will once useTwins()/useProjects() land in Phase 3.
 */

export interface MockProjectSummary {
  id: string;
  name: string;
  subtitle: string;
}

export interface MockTwinProfile {
  id: string;
  name: string;
  role: string;
  decisionStyle: string;
  values: string[];
  communicationStyle: string[];
  projects: MockProjectSummary[];
}

export interface MockProjectProfile {
  name: string;
  twinName: string;
  goal: string;
  priorities: string[];
  constraints: string[];
  decisionRules: string[];
  escalationRules: string[];
}

const createdTwins = new Map<string, MockTwinProfile>();
const createdProjects = new Map<string, MockProjectProfile>();

export function registerCreatedTwin(
  twin: MockTwinProfile,
  project: { id: string } & MockProjectProfile
): void {
  createdTwins.set(twin.id, twin);
  createdProjects.set(project.id, project);
}

export function listCreatedTwins(): MockTwinProfile[] {
  return Array.from(createdTwins.values());
}

export function getCreatedTwin(id: string): MockTwinProfile | undefined {
  return createdTwins.get(id);
}

export function getCreatedProject(id: string): MockProjectProfile | undefined {
  return createdProjects.get(id);
}
