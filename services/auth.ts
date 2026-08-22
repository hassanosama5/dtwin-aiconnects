/**
 * Auth Service
 *
 * Thin wrapper around Supabase Auth's email/password methods, returning the
 * same structured-result shape every other service in this app uses.
 */

import { supabase } from './supabase';
import { logger } from '../utils/logger';

export type AuthResult =
  | { success: true }
  | { success: false; error: string };

/**
 * `signUp` needs its own richer result: when the project still requires
 * email confirmation, Supabase returns success (no error) but `session` is
 * null -- there is no signed-in user yet. Collapsing that into plain
 * `{success:true}` (as this used to) left the caller thinking sign-up fully
 * completed when really nothing would happen until the user confirmed their
 * email, which usually isn't configured in a hackathon environment. This
 * distinguishes the two so the UI can say so explicitly.
 */
export type SignUpResult =
  | { success: true; needsEmailConfirmation: false }
  | { success: true; needsEmailConfirmation: true }
  | { success: false; error: string };

export async function signUp(email: string, password: string): Promise<SignUpResult> {
  try {
    logger.info('Signing up', { email });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (!data.session) {
      logger.warning('Sign up succeeded but no session was returned — email confirmation is required on this project');
      return { success: true, needsEmailConfirmation: true };
    }

    return { success: true, needsEmailConfirmation: false };
  } catch (error) {
    logger.error('Sign up failed', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    logger.info('Signing in', { email });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error('Sign in failed', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function signOut(): Promise<AuthResult> {
  try {
    logger.info('Signing out');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error('Sign out failed', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
