import type { UserRole } from "@/lib/constants";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Contract every auth provider (mock or Supabase) must satisfy.
 * Swapping to Supabase Auth later means implementing this interface
 * against `supabase.auth.*` instead of localStorage — nothing that
 * consumes `useAuth()` needs to change.
 */
export interface AuthProvider {
  getSession(): Promise<AuthUser | null>;
  login(credentials: LoginCredentials): Promise<AuthUser>;
  logout(): Promise<void>;
}