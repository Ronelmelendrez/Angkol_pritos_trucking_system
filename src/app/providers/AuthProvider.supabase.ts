import { supabase } from "@/lib/supabaseClient";
import type { AuthProvider, AuthUser, LoginCredentials } from "@/features/auth/types";

/**
 * Supabase auth provider — implements the AuthProvider contract against
 * `supabase.auth.*`, so useAuth() and all consuming components need no changes.
 */
export const supabaseAuthProvider: AuthProvider = {
  async getSession(): Promise<AuthUser | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, email, role")
      .eq("id", session.user.id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
    };
  },

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    if (!credentials.email || !credentials.password) {
      throw new Error("Email and password are required");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Invalid email or password.");
      }
      if (error.message.includes("Email not confirmed")) {
        throw new Error("Email not confirmed. Please contact admin.");
      }
      throw new Error(error.message);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, email, role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      console.error("[auth] Profile lookup failed:", profileError?.message ?? "row not found");
      throw new Error("Profile not found. Please contact admin.");
    }

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
    };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
