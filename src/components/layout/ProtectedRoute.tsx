import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Drumstick } from "lucide-react";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-ink-soft">
        <Drumstick className="h-8 w-8 animate-flame text-primary" />
        <p className="text-sm">Getting your system ready...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}