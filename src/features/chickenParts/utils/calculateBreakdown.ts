/**
 * Chicken parts calculation rules.
 *
 * Base weight is per whole chicken, not per kilogram, so a 0.65 kg small
 * chicken is configured with the same part counts as a 1 kg standard one.
 *
 *   totalWeightKg      = quantity × baseWeightKg
 *   totalPartQuantity  = quantity × quantityPerBase
 *   totalPartPrice     = totalPartQuantity × pricePerPiece
 */

import type { ConversionBreakdown, ConversionBreakdownRow } from "../types";

/** Rounds to `dp` decimals while avoiding float artifacts like 0.1+0.2. */
function round(value: number, dp: number): number {
  const factor = 10 ** dp;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calculateBreakdown(
  conversion: { name: string; baseWeightKg: number; items: { partName: string; quantityPerBase: number; pricePerPiece: number }[] },
  quantity: number,
): ConversionBreakdown {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;

  const rows: ConversionBreakdownRow[] = conversion.items.map((item) => {
    const totalQuantity = round(safeQuantity * item.quantityPerBase, 2);
    return {
      partName: item.partName,
      quantityPerBase: item.quantityPerBase,
      pricePerPiece: item.pricePerPiece,
      totalQuantity,
      totalPrice: round(totalQuantity * item.pricePerPiece, 2),
    };
  });

  return {
    conversionName: conversion.name,
    baseWeightKg: conversion.baseWeightKg,
    quantity: safeQuantity,
    totalWeightKg: round(safeQuantity * conversion.baseWeightKg, 3),
    rows,
    totalPieces: round(rows.reduce((sum, r) => sum + r.totalQuantity, 0), 2),
    grandTotal: round(rows.reduce((sum, r) => sum + r.totalPrice, 0), 2),
  };
}
