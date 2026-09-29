import { useMemo, useState } from "react";
import { Minus, Plus, Scale, ShoppingBasket, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatChip } from "@/components/ui/StatChip";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { formatCurrency, formatQty } from "@/utils/currency";
import { useChickenPartConversions } from "../hooks/useChickenPartConversions";
import { calculateBreakdown } from "../utils/calculateBreakdown";
import { buildPartRollup } from "../utils/partRollup";

/** Quick head counts for "how many of each size today". */
const PRESETS = [1, 5, 10, 25, 50, 100];

export function ConversionOverview() {
  const { data: conversions = [], isLoading } = useChickenPartConversions(false);
  // Every row starts at 0 heads: nothing is counted until it is entered, so a
  // fresh page shows 0 instead of guessing.
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  function setQty(id: string, value: number) {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.round((Number.isFinite(value) ? value : 0) * 1000) / 1000),
    }));
  }

  function setAll(value: number) {
    setQuantities(Object.fromEntries(conversions.map((c) => [c.id, value])));
  }

  const rows = useMemo(
    () =>
      conversions.map((conversion) => {
        const quantity = quantities[conversion.id] ?? 0;
        return { conversion, quantity, result: calculateBreakdown(conversion, quantity) };
      }),
    [conversions, quantities],
  );

  /** Only conversions with a quantity entered contribute to the totals. */
  const counted = rows.filter((r) => r.quantity > 0);
  const totals = useMemo(
    () => ({
      quantity: counted.reduce((s, r) => s + r.quantity, 0),
      weight: counted.reduce((s, r) => s + r.result.totalWeightKg, 0),
      price: counted.reduce((s, r) => s + r.result.grandTotal, 0),
      pieces: counted.reduce((s, r) => s + r.result.totalPieces, 0),
    }),
    [counted],
  );

  const partRows = useMemo(() => buildPartRollup(counted), [counted]);

  if (isLoading) {
    return <p className="text-sm text-ink-soft">Loading conversions…</p>;
  }

  if (conversions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
        <ShoppingBasket className="mb-2 h-8 w-8 text-ink-faint" />
        <p className="text-sm font-medium text-ink">No active conversions</p>
        <p className="text-xs text-ink-faint">
          Create a conversion first, then enter how many heads of each size you have.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          Set every quantity
        </span>
        {PRESETS.map((preset) => (
          <Button key={preset} type="button" variant="outline" size="sm" onClick={() => setAll(preset)}>
            {preset}
          </Button>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={() => setAll(0)}>
          Clear
        </Button>
      </div>

      {totals.quantity === 0 && (
        <p className="text-xs text-ink-faint">
          Every conversion starts at 0 heads. Enter how many of each size you
          have to see the totals and the parts breakdown.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatChip label="Total heads" value={formatQty(totals.quantity)} icon={ShoppingBasket} tone="primary" />
        <StatChip label="Total weight" value={`${kg(totals.weight)} kg`} icon={Scale} />
        <StatChip label="Total pieces" value={formatQty(totals.pieces)} icon={ShoppingBasket} />
        <StatChip label="Total value" value={formatCurrency(totals.price)} icon={Wallet} tone="success" />
      </div>

      <div className="overflow-hidden rounded-xl border border-line">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conversion</TableHead>
              <TableHead>Base weight</TableHead>
              <TableHead>Parts</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="text-right">Total weight</TableHead>
              <TableHead className="text-right">Total price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ conversion, quantity, result }) => (
              <TableRow key={conversion.id}>
                <TableCell className="font-medium text-ink">{conversion.name}</TableCell>
                <TableCell>{kg(conversion.baseWeightKg)} kg</TableCell>
                <TableCell>
                  <span className="text-xs text-ink-soft">
                    {conversion.items.length} part{conversion.items.length === 1 ? "" : "s"}
                  </span>
                </TableCell>
                <TableCell>
                  <QuantityInput
                    value={quantity}
                    onChange={(v) => setQty(conversion.id, v)}
                    label={`Quantity for ${conversion.name}`}
                  />
                </TableCell>
                <TableCell className="text-right">{kg(result.totalWeightKg)} kg</TableCell>
                <TableCell className="text-right font-semibold text-ink">
                  {formatCurrency(result.grandTotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="hover:bg-transparent">
              <TableCell className="text-ink-soft">Total</TableCell>
              <TableCell className="text-ink-soft">—</TableCell>
              <TableCell className="text-ink-soft">—</TableCell>
              <TableCell className="font-semibold text-ink">{formatQty(totals.quantity)}</TableCell>
              <TableCell className="text-right font-semibold text-ink">{kg(totals.weight)} kg</TableCell>
              <TableCell className="text-right font-semibold text-ink">
                {formatCurrency(totals.price)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {partRows.parts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Parts across all conversions
          </p>
          <div className="overflow-hidden rounded-xl border border-line">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part</TableHead>
                  {partRows.columns.map((c) => (
                    <TableHead key={c.id} className="text-right">
                      {c.name}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Total qty</TableHead>
                  <TableHead className="text-right">Total price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partRows.parts.map((part) => (
                  <TableRow key={part.partName}>
                    <TableCell className="font-medium text-ink">{part.partName}</TableCell>
                    {partRows.columns.map((c) => {
                      const value = part.cells[c.id] ?? 0;
                      return (
                        <TableCell key={c.id} className="text-right text-ink-soft">
                          {value > 0 ? formatQty(value) : "—"}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right font-semibold text-ink">
                      {formatQty(part.totalQuantity)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-ink">
                      {formatCurrency(part.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="hover:bg-transparent">
                  <TableCell className="text-ink-soft">Total</TableCell>
                  {partRows.columns.map((c) => (
                    <TableCell key={c.id} className="text-right text-ink-soft">
                      —
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-semibold text-ink">
                    {formatQty(totals.pieces)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-ink">
                    {formatCurrency(totals.price)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

function QuantityInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => onChange(value - 1)}
        disabled={value <= 0}
        aria-label={`Decrease ${label}`}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <Input
        type="number"
        min="0"
        step="0.001"
        inputMode="decimal"
        // Left blank until a number is typed, so the field never shows a
        // pre-filled 0; the value itself is still 0 for the totals.
        value={value > 0 ? value : ""}
        placeholder="0"
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-8 w-20 text-center tabular-nums"
        aria-label={label}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => onChange(value + 1)}
        aria-label={`Increase ${label}`}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

/** Weights need 3 decimals (numeric(10,3)), unlike quantities. */
function kg(value: number): string {
  return Number(value.toFixed(3)).toLocaleString("en-PH", { maximumFractionDigits: 3 });
}
