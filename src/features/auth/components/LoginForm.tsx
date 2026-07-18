import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogIn, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useRateLimit, MAX_ATTEMPTS } from "../hooks/useRateLimit";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/useToast";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoggingIn } = useAuth();
  const { isLocked, remainingSeconds, remainingAttempts, recordFailure, reset } = useRateLimit();
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLocked) return;
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Email and password are required.");
      return;
    }

    try {
      await login({ email: trimmedEmail, password: trimmedPassword });
      reset();
      toast({ title: "Welcome back!", description: "Logged in as manager.", variant: "success" });
      navigate("/", { replace: true });
    } catch (err) {
      recordFailure();
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast({ title: "Login failed", description: message, variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@angkolpritos.com"
          disabled={isLocked}
          autoComplete="off"
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="pr-10"
            disabled={isLocked}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-faint hover:text-ink transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isLocked && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Too many failed attempts. Try again in {remainingSeconds}s.</span>
        </div>
      )}

      {!isLocked && remainingAttempts < MAX_ATTEMPTS && (
        <p className="text-xs text-ink-faint">
          {remainingAttempts} attempt{remainingAttempts !== 1 ? "s" : ""} remaining before lockout.
        </p>
      )}

      {error && !isLocked && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isLoggingIn || isLocked}>
        {isLoggingIn ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        {isLoggingIn ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
