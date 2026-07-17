import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/useToast";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login({ email, password });
      toast({ title: "Welcome back!", description: "Logged in as manager.", variant: "success" });
      navigate("/", { replace: true });
    } catch {
      toast({ title: "Login failed", description: "Check your details and try again.", variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="manager@angkolprito.ph"
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={isLoggingIn}>
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
