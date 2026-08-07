import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export const chipTones = {
  primary: "bg-primary/10 text-primary-dark",
  success: "bg-success-bg text-success",
  danger: "bg-danger-bg text-danger",
  warning: "bg-warning-bg text-warning",
  neutral: "bg-ink/5 text-ink",
} as const;

export type ChipTone = keyof typeof chipTones;

export function StatChip({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: ChipTone;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-[0_1px_2px_rgba(62,39,35,0.04),0_4px_12px_rgba(62,39,35,0.05)]">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", chipTones[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-ink-faint">{label}</p>
        <p className="stamp mt-0.5 truncate text-base font-bold tabular-nums text-ink">{value}</p>
      </div>
    </div>
  );
}
