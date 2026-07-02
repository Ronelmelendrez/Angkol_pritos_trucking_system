import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToastStore } from "./useToast";
import { cn } from "@/utils/cn";

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[92vw] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "ticket pointer-events-auto flex items-start gap-3 p-3.5 pr-2 animate-in slide-in-from-bottom-2 fade-in",
            t.variant === "success" && "border-l-4 border-l-success",
            t.variant === "error" && "border-l-4 border-l-danger",
            (!t.variant || t.variant === "default") && "border-l-4 border-l-primary"
          )}
        >
          <div className="mt-0.5 shrink-0">
            {t.variant === "success" && <CheckCircle2 className="h-5 w-5 text-success" />}
            {t.variant === "error" && <XCircle className="h-5 w-5 text-danger" />}
            {(!t.variant || t.variant === "default") && <Info className="h-5 w-5 text-primary" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{t.title}</p>
            {t.description && <p className="mt-0.5 text-xs text-ink-soft">{t.description}</p>}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 rounded-full p-1 text-ink-faint hover:bg-ink/5 hover:text-ink"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}