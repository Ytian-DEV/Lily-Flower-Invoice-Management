import { supabase } from '@/lib/supabase';
import type { LoginCredentials } from '@/features/auth/types';

export function getCurrentSession() {
  return supabase.auth.getSession();
}

export function loginWithEmailPassword({ email, password }: LoginCredentials) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function logout() {
  return supabase.auth.signOut();
}

export function onAuthStateChange(
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
) {
  return supabase.auth.onAuthStateChange(callback);
}

export function getUserProfile(authUserId: string) {
  return supabase
    .from('users')
    .select('id, auth_user_id, full_name, role')
    .eq('auth_user_id', authUserId)
    .single();
}
