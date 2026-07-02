import { cn } from "@/utils/cn";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-ink/8", className)}
      {...props}
    />
  );
}

export { Skeleton };