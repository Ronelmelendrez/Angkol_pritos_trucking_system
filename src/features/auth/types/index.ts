import type { Session, User } from "@supabase/supabase-js"

export type { Session, User }

export interface Profile {
  id: string
  full_name: string | null
  role: "manager" | "staff"
  created_at: string
}

export interface LoginFormValues {
  email: string
  password: string
}

export interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  isLoading: boolean
}