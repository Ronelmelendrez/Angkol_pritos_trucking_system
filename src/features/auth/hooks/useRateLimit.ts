import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "login_rate_limit";
export const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

interface RateLimitState {
  attempts: number;
  lockedUntil: number | null;
}

function loadState(): RateLimitState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { attempts: 0, lockedUntil: null };
    const parsed = JSON.parse(raw) as RateLimitState;
    if (parsed.lockedUntil && Date.now() > parsed.lockedUntil) {
      localStorage.removeItem(STORAGE_KEY);
      return { attempts: 0, lockedUntil: null };
    }
    return parsed;
  } catch {
    return { attempts: 0, lockedUntil: null };
  }
}

function saveState(state: RateLimitState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useRateLimit() {
  const [state, setState] = useState<RateLimitState>(loadState);
  const [now, setNow] = useState(() => Date.now());

  const isLocked = !!state.lockedUntil && now < state.lockedUntil;
  const remainingSeconds = isLocked
    ? Math.ceil((state.lockedUntil! - now) / 1000)
    : 0;
  const remainingAttempts = isLocked ? 0 : MAX_ATTEMPTS - state.attempts;

  useEffect(() => {
    if (!isLocked) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isLocked]);

  const recordFailure = useCallback(() => {
    setState((prev) => {
      const attempts = prev.attempts + 1;
      if (attempts >= MAX_ATTEMPTS) {
        const lockedUntil = Date.now() + LOCKOUT_SECONDS * 1000;
        const next = { attempts, lockedUntil };
        saveState(next);
        return next;
      }
      const next = { attempts, lockedUntil: null };
      saveState(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const next = { attempts: 0, lockedUntil: null };
    setState(next);
    saveState(next);
  }, []);

  return { isLocked, remainingSeconds, remainingAttempts, recordFailure, reset };
}
