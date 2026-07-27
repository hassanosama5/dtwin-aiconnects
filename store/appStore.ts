/**
 * Global State Store (Zustand)
 *
 * Minimal global state for the application.
 * Only stores what truly needs to be global.
 */

import { create } from 'zustand';
import { Twin, Project } from '../types/database';
import { AgentExecutionState } from '../types/agent';

interface AppState {
  // Current context
  currentTwin: Twin | null;
  currentProject: Project | null;

  // Agent execution state (for UI visualization)
  agentExecution: {
    state: AgentExecutionState;
    currentAgent?: string;
    progress: number;
  };

  // Actions
  setCurrentTwin: (twin: Twin | null) => void;
  setCurrentProject: (project: Project | null) => void;
  setAgentExecution: (state: AgentExecutionState, currentAgent?: string, progress?: number) => void;
  resetAgentExecution: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  currentTwin: null,
  currentProject: null,
  agentExecution: {
    state: 'idle',
    currentAgent: undefined,
    progress: 0,
  },

  // Actions
  setCurrentTwin: (twin) => set({ currentTwin: twin }),

  setCurrentProject: (project) => set({ currentProject: project }),

  setAgentExecution: (state, currentAgent, progress = 0) =>
    set({
      agentExecution: {
        state,
        currentAgent,
        progress,
      },
    }),

  resetAgentExecution: () =>
    set({
      agentExecution: {
        state: 'idle',
        currentAgent: undefined,
        progress: 0,
      },
    }),
}));

// Selectors (for optimized re-renders)
export const selectCurrentTwin = (state: AppState) => state.currentTwin;
export const selectCurrentProject = (state: AppState) => state.currentProject;
export const selectAgentExecution = (state: AppState) => state.agentExecution;
