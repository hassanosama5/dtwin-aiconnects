/**
 * useAskQuestion
 *
 * The "Ask a Question" decision, shared by the Twin Profile screen and the
 * Home screen's Twin cards (its only two callers) so it's implemented once:
 *
 * - 0 projects exist at all -> send the owner to create one first (Projects
 *   are independent of Twins now -- there's no "this twin's projects" to
 *   check, just whether any project exists yet, see tools/project.ts).
 * - 1 project   -> open that project's chat directly, with this Twin.
 * - 2+ projects -> open the ProjectPickerSheet; picking one opens its chat,
 *   with this Twin.
 *
 * Enforces the product rule that chat always happens within a selected
 * project — there is no generic, project-less chat entry point.
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ProjectTool, ProjectWithTwin } from '../tools/project';
import { Twin } from '../types/database';

interface PickerState {
  twin: Twin;
  projects: ProjectWithTwin[];
}

export function useAskQuestion() {
  const router = useRouter();
  const [picker, setPicker] = useState<PickerState | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  async function askQuestion(twin: Twin) {
    setIsResolving(true);
    const result = await ProjectTool.listAll();
    setIsResolving(false);

    if (!result.success) return;

    if (result.projects.length === 0) {
      router.push('/project/create');
      return;
    }
    if (result.projects.length === 1) {
      router.push({ pathname: '/chat/[projectId]', params: { projectId: result.projects[0].id, twinId: twin.id } });
      return;
    }
    setPicker({ twin, projects: result.projects });
  }

  function selectProject(projectId: string) {
    const twinId = picker?.twin.id;
    setPicker(null);
    if (!twinId) return;
    router.push({ pathname: '/chat/[projectId]', params: { projectId, twinId } });
  }

  return {
    askQuestion,
    isResolving,
    picker,
    closePicker: () => setPicker(null),
    selectProject,
  };
}
