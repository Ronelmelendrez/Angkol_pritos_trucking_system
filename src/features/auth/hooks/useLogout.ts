import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.clear()
      navigate("/login", { replace: true })
    },
    onError: (error: Error) => {
      toast.error("Couldn't log out", { description: error.message })
    },
  })

  return {
    logout: mutation.mutate,
    isLoading: mutation.isPending,
  }
}