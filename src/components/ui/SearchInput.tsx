import { Search } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/Input";
import { cn } from "@/utils/cn";

interface SearchInputProps extends Omit<InputProps, "ref"> {
  wrapperClassName?: string;
}

export function SearchInput({ className, wrapperClassName, ...props }: SearchInputProps) {
  return (
    <div className={cn("relative w-full sm:w-48", wrapperClassName)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
      <Input className={cn("pl-9", className)} {...props} />
    </div>
  );
}
