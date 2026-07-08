import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import type { PayFrequencyFilter } from "../utils/payPeriods";

interface Props {
  periodLabel: string;
  frequency: PayFrequencyFilter;
  onFrequencyChange: (f: PayFrequencyFilter) => void;
  onPrev: () => void;
  onNext: () => void;
  canGoNext: boolean;
}

export function PayPeriodPicker({ periodLabel, frequency, onFrequencyChange, onPrev, onNext, canGoNext }: Props) {
  const isAll = frequency === "all";

  return (
    <div className="flex items-center gap-3">
      <Select value={frequency} onValueChange={(v) => onFrequencyChange(v as PayFrequencyFilter)}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All frequencies</SelectItem>
          <SelectItem value="semi_monthly">Semi-monthly</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={onPrev} disabled={isAll}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-40 text-center text-sm font-medium text-ink">{isAll ? "All frequencies" : periodLabel}</span>
        <Button variant="outline" size="icon" onClick={onNext} disabled={isAll || !canGoNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
