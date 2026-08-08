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
 * Contract every auth provider must satisfy. It is implemented
 * against `supabase.auth.*` — nothing that consumes `useAuth()`
 * needs to change.
 */
export interface AuthProvider {
  getSession(): Promise<AuthUser | null>;
  login(credentials: LoginCredentials): Promise<AuthUser>;
  logout(): Promise<void>;
}