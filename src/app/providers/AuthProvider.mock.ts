import type { AuthProvider, AuthUser, LoginCredentials } from "../types";
import { MOCK_LATENCY } from "@/lib/constants";

const SESSION_KEY = "ft_session";

const DEMO_MANAGER: AuthUser = {
  id: "user_manager_1",
  name: "Nanay Chit",
  email: "manager@manongsgrill.ph",
  role: "manager",
};

function delay<T>(value: T, ms = MOCK_LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * Mock auth provider — simulates a logged-in manager by default and
 * accepts any email/password matching the demo account.
 *
 * WHEN SUPABASE IS ADDED:
 * Create a `authProvider.supabase.ts` that implements the same
 * `AuthProvider` interface using `supabase.auth.signInWithPassword`,
 * `supabase.auth.signOut`, and `supabase.auth.getSession`, then swap the
 * import in `useAuth.ts`. No component code changes.
 */
export const mockAuthProvider: AuthProvider = {
  async getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return delay(raw ? (JSON.parse(raw) as AuthUser) : null, 200);
  },

  async login(credentials: LoginCredentials) {
    if (!credentials.email || !credentials.password) {
      throw new Error("Email and password are required");
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(DEMO_MANAGER));
    return delay(DEMO_MANAGER);
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY);
    return delay(undefined);
  },
};