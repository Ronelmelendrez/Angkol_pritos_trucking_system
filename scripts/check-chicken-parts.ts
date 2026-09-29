/**
 * Self-check for the Chicken Parts rules (calculation + form validation).
 * No test runner is configured in this project, so this runs as a script and
 * exits non-zero on the first failed assertion.
 *
 *   npm run check:chicken-parts
 */
import assert from "node:assert/strict";
import { calculateBreakdown } from "../src/features/chickenParts/utils/calculateBreakdown";
import { chickenPartConversionSchema } from "../src/utils/Validators";
import { nextCopyName } from "../src/features/chickenParts/utils/nextCopyName";
import { buildPartRollup } from "../src/features/chickenParts/utils/partRollup";

const conversion = {
  name: "Standard Chicken",
  baseWeightKg: 0.65,
  items: [
    { partName: "Wings", quantityPerBase: 2, pricePerPiece: 30 },
    { partName: "Legs", quantityPerBase: 2, pricePerPiece: 35 },
    { partName: "Breast", quantityPerBase: 6, pricePerPiece: 40.5 },
  ],
};

// quantity x baseWeightKg
const r = calculateBreakdown(conversion, 3);
assert.equal(r.totalWeightKg, 1.95);
assert.deepEqual(
  r.rows.map((x) => [x.partName, x.totalQuantity, x.totalPrice]),
  [
    ["Wings", 6, 180],
    ["Legs", 6, 210],
    ["Breast", 18, 729],
  ],
);
assert.equal(r.totalPieces, 30);
assert.equal(r.grandTotal, 1119);

// 1 unit = per-base value (2x30 + 2x35 + 6x40.5)
const one = calculateBreakdown(conversion, 1);
assert.equal(one.totalWeightKg, 0.65);
assert.equal(one.grandTotal, 373);

// fractional quantity, no float noise (1x30 + 1x35 + 3x40.5)
const frac = calculateBreakdown(conversion, 0.5);
assert.equal(frac.rows[0].totalQuantity, 1);
assert.equal(frac.rows[0].totalPrice, 30);
assert.equal(frac.rows[2].totalQuantity, 3);
assert.equal(frac.rows[2].totalPrice, 121.5);
assert.equal(frac.totalPieces, 5);
assert.equal(frac.grandTotal, 186.5);
assert.equal(frac.totalWeightKg, 0.325);

// zero / negative / NaN are clamped
for (const q of [0, -2, Number.NaN]) {
  assert.equal(calculateBreakdown(conversion, q).grandTotal, 0);
}

// 3 decimals allowed in base weight
assert.equal(calculateBreakdown({ ...conversion, baseWeightKg: 1.234 }, 2).totalWeightKg, 2.468);

// --- validators ---
const ok = chickenPartConversionSchema.safeParse({
  name: "Standard Chicken",
  baseWeightKg: 0.65,
  isActive: true,
  items: [{ partName: " Wings ", quantityPerBase: 2, pricePerPiece: 30 }],
});
assert.equal(ok.success, true, "valid form should pass");

const dupPart = chickenPartConversionSchema.safeParse({
  name: "Standard Chicken",
  baseWeightKg: 1,
  isActive: true,
  items: [
    { partName: "Wings", quantityPerBase: 2, pricePerPiece: 30 },
    { partName: "wings", quantityPerBase: 1, pricePerPiece: 1 },
  ],
});
assert.equal(dupPart.success, false, "case-insensitive duplicate part must fail");
assert.match(dupPart.error?.issues[0]?.message ?? "", /Duplicate part/);

const zeroWeight = chickenPartConversionSchema.safeParse({
  name: "Test Conversion",
  baseWeightKg: 0,
  isActive: true,
  items: [{ partName: "Wings", quantityPerBase: 2, pricePerPiece: 30 }],
});
assert.equal(zeroWeight.success, false, "base weight must be > 0");

const noItems = chickenPartConversionSchema.safeParse({
  name: "Test Conversion",
  baseWeightKg: 1,
  isActive: true,
  items: [],
});
assert.equal(noItems.success, false, "at least one part required");

const zeroQty = chickenPartConversionSchema.safeParse({
  name: "Test Conversion",
  baseWeightKg: 1,
  isActive: true,
  items: [{ partName: "Wings", quantityPerBase: 0, pricePerPiece: 0 }],
});
assert.equal(zeroQty.success, true, "0 qty / 0 price are allowed");

const negative = chickenPartConversionSchema.safeParse({
  name: "Test Conversion",
  baseWeightKg: 1,
  isActive: true,
  items: [{ partName: "Wings", quantityPerBase: -1, pricePerPiece: 5 }],
});
assert.equal(negative.success, false, "negative qty must fail");

// string inputs from the DOM coerce cleanly
const coerced = chickenPartConversionSchema.safeParse({
  name: "Test Conversion",
  baseWeightKg: "0.65",
  isActive: true,
  items: [{ partName: "Wings", quantityPerBase: "2", pricePerPiece: "30.5" }],
});
assert.equal(coerced.success, true, "string numbers must coerce");
assert.equal(coerced.data?.baseWeightKg, 0.65);
assert.equal(coerced.data?.items[0].pricePerPiece, 30.5);

// --- duplicate names ---
assert.equal(nextCopyName("Standard Chicken"), "Standard Chicken (copy)");
assert.equal(nextCopyName("Standard Chicken (copy)"), "Standard Chicken (copy 2)");
assert.equal(nextCopyName("Standard Chicken (copy 2)"), "Standard Chicken (copy 3)");

// --- per-conversion quantities roll up into one set of totals ---
const small = { id: "small", name: "Small (0.65kg)", baseWeightKg: 0.65, isActive: true, items: conversion.items, createdAt: "", updatedAt: "" };
const large = { id: "large", name: "Large (1.1kg)", baseWeightKg: 1.1, isActive: true, items: [{ partName: "wings", quantityPerBase: 2, pricePerPiece: 32 }], createdAt: "", updatedAt: "" };

// "wings" in lowercase on the large chicken must merge with "Wings"
const counted = [
  { conversion: small, quantity: 3, result: calculateBreakdown(small, 3) },
  { conversion: large, quantity: 2, result: calculateBreakdown(large, 2) },
];
const rollup = buildPartRollup(counted);

assert.deepEqual(rollup.columns.map((c) => c.name), ["Small (0.65kg)", "Large (1.1kg)"]);

const wings = rollup.parts.find((p) => p.partName === "Wings");
assert.ok(wings, "Wings row must keep the first-seen casing");
assert.equal(wings.cells.small, 6);
assert.equal(wings.cells.large, 4);
assert.equal(wings.totalQuantity, 10);
assert.equal(wings.totalPrice, 6 * 30 + 4 * 32);

const legs = rollup.parts.find((p) => p.partName === "Legs");
assert.deepEqual(legs?.cells, { small: 6 }, "a part only in one conversion has one cell");
assert.equal(legs?.totalQuantity, 6);
assert.equal(legs?.totalPrice, 210);

// parts are sorted by total quantity, descending
assert.deepEqual(rollup.parts.map((p) => p.totalQuantity), [10, 6, 18].sort((a, b) => b - a));

// a conversion with no quantity contributes nothing at all
const zeroed = buildPartRollup([...counted, { conversion: large, quantity: 0, result: calculateBreakdown(large, 0) }]);
assert.equal(zeroed.columns.length, 2, "the zero-qty conversion is not a column");
assert.equal(zeroed.parts.length, rollup.parts.length);
assert.equal(
  zeroed.parts.find((p) => p.partName === "Wings")?.totalQuantity,
  10,
  "zero-qty conversion adds nothing",
);

// a part with 0 configured is dropped from the rollup
const noWings = { ...large, items: [{ partName: "Neck", quantityPerBase: 0, pricePerPiece: 15 }] };
const dropped = buildPartRollup([{ conversion: noWings, quantity: 5, result: calculateBreakdown(noWings, 5) }]);
assert.equal(dropped.parts.length, 0, "parts with no quantity are left out");
assert.equal(dropped.columns.length, 0);

// per-conversion totals shown in the overview table
assert.equal(counted[0].result.grandTotal, 1119);
assert.equal(counted[0].result.totalWeightKg, 1.95);
assert.equal(counted[1].result.grandTotal, 128);
assert.equal(counted[1].result.totalWeightKg, 2.2);
assert.equal(
  counted.reduce((s, r) => s + r.result.grandTotal, 0),
  1247,
  "overview grand total sums every conversion",
);
assert.equal(counted.reduce((s, r) => s + r.quantity, 0), 5, "overview total heads");

console.log("all chicken-part assertions passed");
