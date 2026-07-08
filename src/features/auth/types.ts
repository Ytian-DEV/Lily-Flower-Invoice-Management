import type { Session, User } from '@supabase/supabase-js';

import type { TableRow } from '@/types/database';

export type UserProfile = Pick<
  TableRow<'users'>,
  'id' | 'auth_user_id' | 'full_name' | 'role'
>;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
