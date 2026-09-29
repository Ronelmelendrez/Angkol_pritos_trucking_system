import type { ConversionBreakdown, ChickenPartConversion } from "../types";

export interface CountedConversion {
  conversion: ChickenPartConversion;
  quantity: number;
  result: ConversionBreakdown;
}

export interface PartRollupRow {
  partName: string;
  /** conversionId → quantity produced by that conversion */
  cells: Record<string, number>;
  totalQuantity: number;
  totalPrice: number;
}

export interface PartRollup {
  /** Conversions that contributed at least one part, in first-seen order. */
  columns: { id: string; name: string }[];
  parts: PartRollupRow[];
}

/**
 * Rolls every part up across conversions: the same part name
 * (case-insensitive) in two conversions becomes one row with a quantity per
 * conversion column. Conversions with no quantity, and parts that no
 * conversion currently produces, are left out.
 */
export function buildPartRollup(counted: CountedConversion[]): PartRollup {
  const cells = new Map<string, PartRollupRow>();
  const columns: { id: string; name: string }[] = [];

  for (const { conversion, result } of counted) {
    if (result.quantity <= 0) continue;

    let contributed = false;

    for (const row of result.rows) {
      if (row.totalQuantity <= 0) continue;
      contributed = true;

      const key = row.partName.trim().toLowerCase();
      const existing = cells.get(key);
      if (existing) {
        existing.cells[conversion.id] = row.totalQuantity;
        existing.totalQuantity += row.totalQuantity;
        existing.totalPrice += row.totalPrice;
      } else {
        cells.set(key, {
          partName: row.partName,
          cells: { [conversion.id]: row.totalQuantity },
          totalQuantity: row.totalQuantity,
          totalPrice: row.totalPrice,
        });
      }
    }

    if (contributed && !columns.some((c) => c.id === conversion.id)) {
      columns.push({ id: conversion.id, name: conversion.name });
    }
  }

  return {
    columns,
    parts: Array.from(cells.values()).sort((a, b) => b.totalQuantity - a.totalQuantity),
  };
}
