import { Drumstick } from "lucide-react";
import { cn } from "@/utils/cn";

interface LogoProps {
  /** sm = compact (sidebar, header), md = prominent (login) */
  size?: "sm" | "md";
  /** brand = dark wordmark for light surfaces, onDark = white wordmark for dark surfaces (same orange mark in both) */
  tone?: "brand" | "onDark";
  /** Show the wordmark ("Angkol Prito's & Lechon Manok") */
  showText?: boolean;
  className?: string;
}

export function Logo({
  size = "sm",
  tone = "brand",
  showText = true,
  className,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center bg-primary text-white",
          size === "sm" ? "h-9 w-9 rounded-xl" : "h-11 w-11 rounded-2xl",
          tone === "brand" ? "shadow-sm" : "shadow-ticket",
        )}
      >
        <Drumstick className={size === "sm" ? "h-5 w-5" : "h-5.5 w-5.5"} />
      </div>
      {showText && (
        <div className="leading-tight">
          <p
            className={cn(
              "stamp font-semibold",
              size === "sm" ? "text-sm" : "text-base",
              tone === "brand" ? "text-ink" : "text-white",
            )}
          >
            Angkol Prito's
          </p>
          <p
            className={cn(
              "text-[11px]",
              tone === "brand" ? "text-ink-faint" : "text-white/60",
            )}
          >
            &amp; Lechon Manok
          </p>
        </div>
      )}
    </div>
  );
}
