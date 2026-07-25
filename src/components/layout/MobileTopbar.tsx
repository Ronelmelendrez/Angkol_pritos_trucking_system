import { Drumstick } from "lucide-react";

export function MobileTopbar() {
  return (
    <div className="flex items-center gap-2.5 border-b border-line bg-surface px-4 py-3 md:hidden">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
        <Drumstick className="h-4 w-4" />
      </div>
      <div className="whitespace-nowrap">
        <p className="stamp text-sm font-semibold leading-tight text-ink">
          Angkol Prito"s
        </p>
        <p className="text-[10px] leading-tight text-ink-faint">
          &amp; Lechon Manok
        </p>
      </div>
    </div>
  );
}
