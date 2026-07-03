import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Drumstick, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/useToast";

export function LoginForm() {
  const [email, setEmail] = useState("manager@manongsgrill.ph");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login({ email, password: password || "demo" });
      toast({ title: "Welcome back!", description: "Logged in as manager.", variant: "success" });
      navigate("/", { replace: true });
    } catch {
      toast({ title: "Login failed", description: "Check your details and try again.", variant: "error" });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-ticket">
            <Drumstick className="h-7 w-7" />
          </div>
          <h1 className="stamp text-2xl font-semibold text-ink">Manong's Grill &amp; Lechon</h1>
          <p className="mt-1 text-sm text-ink-soft">Sign in to manage today's operations</p>
        </div>

        <form onSubmit={handleSubmit} className="ticket p-6">
          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@manongsgrill.ph"
              required
            />
          </div>
          <div className="mb-5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Any password works in demo mode"
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isLoggingIn}>
            {isLoggingIn && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoggingIn ? "Signing in..." : "Sign in"}
          </Button>
          <p className="mt-4 text-center text-xs text-ink-faint">
            Demo mode — this is a stub login. Real authentication arrives with Supabase.
          </p>
        </form>
      </div>
    </div>
  );
}