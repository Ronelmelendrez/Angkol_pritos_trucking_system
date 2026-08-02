import type { ReactNode } from "react"
import { QueryProvider } from "@/app/providers/QueryProvider"
import { Toaster } from "@/components/ui/Sonner"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster />
    </QueryProvider>
  )
}