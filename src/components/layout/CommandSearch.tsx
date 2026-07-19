import { useState, useRef, useEffect } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NAV_ITEMS } from "@/components/layout/navConfig";

interface CommandSearchProps {
  open: boolean;
  onClose: () => void;
}

export function CommandSearch({ open, onClose }: CommandSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const filtered = query.trim()
    ? NAV_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  function handleSelect(path: string) {
    navigate(path);
    setQuery("");
    onClose();
  }

  function handleClear() {
    setQuery("");
    inputRef.current?.focus();
  }

  function handleClose() {
    setQuery("");
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-ink/40 backdrop-blur-[2px] pt-[15vh]">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-ink-faint" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Go to..."
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          {query && (
            <button
              onClick={handleClear}
              className="rounded-md p-1 text-ink-faint transition-colors hover:bg-ink/5 hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="rounded-md border border-line bg-background px-2 py-1 text-[11px] font-medium text-ink-faint transition-colors hover:text-ink"
          >
            Cancel
          </button>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto border-t border-line p-1">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.path}
                onClick={() => handleSelect(item.path)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-primary/10"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-ink-faint" />
                  {item.label}
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-ink-faint" />
              </button>
            ))
          ) : (
            <p className="px-3 py-4 text-center text-sm text-ink-faint">
              {query ? "No results found." : "Type to search pages..."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
