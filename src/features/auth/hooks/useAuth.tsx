import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { mockAuthProvider as authProvider } from "@/app/providers/AuthProvider.mock";
import type { LoginCredentials } from "../types";

const SESSION_QUERY_KEY = ["auth", "session"] as const;

export function useAuth() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => authProvider.getSession(),
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authProvider.login(credentials),
    onSuccess: (user) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authProvider.logout(),
    onSuccess: () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
    },
  });

  return {
    user: sessionQuery.data ?? null,
    isAuthenticated: !!sessionQuery.data,
    isLoading: sessionQuery.isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error as Error | null,
    logout: logoutMutation.mutateAsync,
  };
}