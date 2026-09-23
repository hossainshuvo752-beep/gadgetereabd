"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * App-wide auth state (session + optional profile row).
 *
 * Supabase Auth owns credentials/sessions in its internal auth.users
 * table — this context never touches passwords. `profiles` holds the
 * display name only (RLS: users read/update their own row).
 */

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string | null;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  /** Display name: profile.full_name, falling back to signup metadata. */
  displayName: string | null;
  /** Full profile row (name, phone, created_at) or null when absent. */
  profile: Profile | null;
  /** True once the initial session check has completed. */
  authReady: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

/** Map raw Supabase auth errors to short, user-friendly messages. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Invalid email or password.';
  if (m.includes('email not confirmed')) return 'Please confirm your email first — check your inbox.';
  if (m.includes('already registered')) return 'This email is already registered. Try logging in instead.';
  if (m.includes('rate limit')) return 'Too many attempts — please wait a minute and try again.';
  if (m.includes('password')) return message;
  if (m.includes('failed to fetch') || m.includes('network')) return 'Network error — check your connection and try again.';
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setAuthReady(true);
      })
      .catch(() => active && setAuthReady(true));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Load the profile row whenever a session appears.
  useEffect(() => {
    let active = true;
    setProfile(null);
    if (!session?.user) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, phone, created_at')
        .eq('id', session.user.id)
        .maybeSingle();
      if (active) setProfile((data as Profile) ?? null);
    })();
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const displayName =
    profile?.full_name ??
    (session?.user.user_metadata?.full_name as string | undefined) ??
    null;

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        displayName,
        profile,
        authReady,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
