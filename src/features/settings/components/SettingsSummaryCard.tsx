import { usePayRuleSettings } from "../hooks/usePayRuleSettings";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

export function SettingsSummaryCard() {
  const { data: settings } = usePayRuleSettings();

  if (!settings) return null;

  return (
    <Card>
      <CardHeader><CardTitle>Pay rules (global defaults)</CardTitle></CardHeader>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-6 pb-6 text-sm">
        <Row label="Standard hours/day" value={`${settings.standardHoursPerDay}h`} />
        <Row label="Rounding" value={settings.roundHoursTo === 0 ? "None" : `Nearest ${settings.roundHoursTo}h`} />
        <Row label="Half-day threshold" value={`≤${settings.halfDayThresholdHours}h`} />
        <Row label="Half-day rate" value={`${(settings.halfDayRateMultiplier * 100).toFixed(0)}%`} />
        <Row label="Late grace" value={`${settings.lateGraceMinutes} min`} />
        <Row label="Late deduction" value={`₱${settings.lateDeductionPerMinute}/min`} />
        <Row label="Rest day" value={`${settings.restDayRateMultiplier}×`} />
        <Row label="Holiday" value={`${settings.holidayRateMultiplier}×`} />
        <Row label="Night differential" value={`${settings.nightDifferentialPercent}%`} />
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-ink-faint">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
