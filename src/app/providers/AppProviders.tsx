import type { ReactNode } from "react"
import { QueryProvider } from "@/app/providers/QueryProvider"
import { AuthProvider } from "@/features/auth"
import { Toaster } from "@/components/ui/sonner"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </QueryProvider>
  )
}