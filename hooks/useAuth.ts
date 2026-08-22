/**
 * useAuth
 *
 * Read the current session/user and perform sign-in/up/out. Session state
 * itself is owned by authStore, kept in sync by useAuthListener() (mounted
 * once at the root layout) -- this hook never writes to it directly.
 */

import { useAuthStore } from '../store/authStore';
import { signIn, signUp, signOut } from '../services/auth';

export function useAuth() {
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const isInitializing = useAuthStore((s) => s.isInitializing);

  return {
    session,
    user,
    isInitializing,
    isAuthenticated: !!session,
    signIn,
    signUp,
    signOut,
  };
}
