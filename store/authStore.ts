/**
 * Auth Store (Zustand)
 *
 * Holds the current Supabase session/user. Populated exclusively by
 * hooks/useAuthListener.ts (mounted once, at the root layout) via
 * supabase.auth.getSession()/onAuthStateChange -- nothing else should call
 * setSession directly.
 */

import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  /** True until the initial getSession() call resolves -- distinguishes
   *  "still checking" from "checked, and there's no session." */
  isInitializing: boolean;
  setSession: (session: Session | null) => void;
  setInitializing: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isInitializing: true,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setInitializing: (value) => set({ isInitializing: value }),
}));

export const selectSession = (state: AuthState) => state.session;
export const selectUser = (state: AuthState) => state.user;
export const selectIsInitializing = (state: AuthState) => state.isInitializing;
