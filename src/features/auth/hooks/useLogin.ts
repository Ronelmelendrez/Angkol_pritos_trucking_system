import { useMutation } from "@tanstack/react-query"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import type { LoginFormValues } from "@/features/auth/types"

export function useLogin() {
  const navigate = useNavigate()
  const location = useLocation()

  const mutation = useMutation({
    mutationFn: async ({ email, password }: LoginFormValues) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success("Welcome back!")
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/"
      navigate(redirectTo, { replace: true })
    },
    onError: (error: Error) => {
      toast.error("Login failed", { description: error.message })
    },
  })

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}