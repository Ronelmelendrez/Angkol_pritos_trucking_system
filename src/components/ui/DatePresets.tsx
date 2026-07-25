import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export type DatePreset = "today" | "this-week" | "this-month" | "custom";

interface Props {
  value: DatePreset;
  onChange: (preset: DatePreset) => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
}

export function DatePresets({ value, onChange, customFrom, customTo, onCustomFromChange, onCustomToChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1">
        {(["today", "this-week", "this-month"] as const).map((p) => (
          <Button
            key={p}
            variant={value === p ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(p)}
          >
            {p === "today" ? "Today" : p === "this-week" ? "This week" : "This month"}
          </Button>
        ))}
      </div>
      {value === "custom" ? (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-36"
            value={customFrom}
            onChange={(e) => onCustomFromChange(e.target.value)}
          />
          <span className="text-xs text-ink-faint">–</span>
          <Input
            type="date"
            className="w-36"
            value={customTo}
            onChange={(e) => onCustomToChange(e.target.value)}
          />
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => onChange("custom")}>
          Custom range
        </Button>
      )}
    </div>
  );
}
