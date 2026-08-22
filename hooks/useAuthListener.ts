/**
 * useAuthListener
 *
 * Mounted exactly once, at the root layout (app/_layout.tsx) -- subscribes
 * to Supabase's session state and mirrors it into authStore. Every other
 * screen/hook reads the session via useAuth()/useAuthStore, never this
 * directly, so there's only ever one subscription.
 *
 * TEMPORARY: console logging added to diagnose a report that the app skips
 * straight to the tabbed main app instead of showing Welcome/Sign In, even
 * after a full Expo Go reopen (ruling out a stale bundle). Remove once
 * that's root-caused.
 */

import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';

export function useAuthListener() {
  const setSession = useAuthStore((s) => s.setSession);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  useEffect(() => {
    console.log('[AUTH DEBUG] useAuthListener mounted, calling getSession()...');

    supabase.auth.getSession().then(({ data, error }) => {
      console.log(
        '[AUTH DEBUG] getSession() resolved:',
        JSON.stringify({
          hasSession: !!data.session,
          userEmail: data.session?.user?.email,
          userId: data.session?.user?.id,
          expiresAt: data.session?.expires_at,
          error: error?.message,
        })
      );
      setSession(data.session);
      setInitializing(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(
        '[AUTH DEBUG] onAuthStateChange fired:',
        JSON.stringify({ event, hasSession: !!session, userEmail: session?.user?.email })
      );
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, [setSession, setInitializing]);
}
