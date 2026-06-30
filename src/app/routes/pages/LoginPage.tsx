import { Navigate } from "react-router-dom"
import { useAuth } from "@/features/auth"
import { LoginForm } from "@/features/auth"
import { Drumstick } from "lucide-react"

export function LoginPage() {
  const { session } = useAuth()

  if (session) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ember-50 px-4">
      <div className="mx-auto w-full max-w-sm space-y-6">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Drumstick className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-char-900">
            Angkol Prito's
          </h1>
          <p className="text-sm text-muted-foreground">
            Trucking System — Sign in to manage your food truck
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-ticket">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}