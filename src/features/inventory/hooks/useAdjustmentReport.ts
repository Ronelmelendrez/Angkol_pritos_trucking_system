import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { useAdjustmentsLog } from "./useAdjustmentsLog";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useProducts } from "@/features/products/hooks/useProducts";
import { estimateUnitCost } from "../utils/estimateUnitCost";
import { REASON_META } from "../utils/reasonMeta";
import type { AdjustmentReason } from "../types";

export interface AdjustmentIncident {
  id: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number; // negative for a loss
  reason: AdjustmentReason;
  note?: string;
  cost: number | null;
}

export interface AdjustmentTrendPoint {
  date: string;
  label: string;
  cost: number;
}

export interface AdjustmentByProductRow {
  productId: string;
  name: string;
  qty: number;
  cost: number | null;
}

export interface AdjustmentByReasonRow {
  reason: AdjustmentReason;
  qtyLost: number; // units written off (negative adjustments)
  qtyFound: number; // units recovered (positive adjustments, e.g. recount)
  cost: number; // est. ₱ lost
}

export interface AdjustmentReportData {
  incidents: AdjustmentIncident[];
  totalQty: number; // lost qty, positive
  totalCost: number | null; // null when no cost data exists for any loss
  missingCostCount: number;
  purchasedQty: number; // purchased qty in the period
  lossRate: number | null; // percent; null when there were no purchases
  priorRate: number | null; // percent for the window immediately before the period
  trend: AdjustmentTrendPoint[];
  byProduct: AdjustmentByProductRow[];
  byReason: AdjustmentByReasonRow[];
}

function inRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

/**
 * Aggregates the stock loss/adjustment report for a date range (and
 * optionally a single product). Covers every adjustment reason — spoilage,
 * waste, theft, recount shortages and other write-offs all count as losses;
 * positive adjustments (e.g. recount surpluses) are tracked separately as
 * "found" stock. Everything is computed client-side over the same
 * `stock_adjustments` + `expenses` data the rest of Inventory already uses.
 */
export function useAdjustmentReport(dateRange: string[], selectedProductId: string): AdjustmentReportData {
  const { log: adjustments, purchases } = useAdjustmentsLog();
  const { data: expenses = [] } = useExpenses();
  const { data: products = [] } = useProducts();

  return useMemo(() => {
    const rangeStart = dateRange[0];
    const rangeEnd = dateRange[dateRange.length - 1];

    const productMatch = (productId: string) => !selectedProductId || productId === selectedProductId;

    const losses = adjustments.filter(
      (a) => a.quantity < 0 && productMatch(a.productId) && inRange(a.date, rangeStart, rangeEnd),
    );

    const unitCosts = new Map<string, number | null>();
    const costFor = (productId: string) => {
      if (!unitCosts.has(productId)) unitCosts.set(productId, estimateUnitCost(productId, products, expenses));
      return unitCosts.get(productId);
    };

    const incidents: AdjustmentIncident[] = losses.map((a) => {
      const unitCost = costFor(a.productId);
      return {
        id: a.id,
        date: a.date,
        productId: a.productId,
        productName: a.productName,
        quantity: a.quantity,
        reason: a.reason,
        note: a.note,
        cost: unitCost != null ? Math.abs(a.quantity) * unitCost : null,
      };
    });

    const totalQty = losses.reduce((sum, a) => sum + Math.abs(a.quantity), 0);
    const costs = incidents.map((i) => i.cost).filter((c): c is number => c != null);
    const missingCostCount = incidents.filter((i) => i.cost == null).length;
    const totalCost = incidents.length > 0 && costs.length === 0 ? null : costs.reduce((sum, c) => sum + c, 0);

    const purchasesInRange = purchases.filter(
      (p) => p.quantity > 0 && productMatch(p.productId) && inRange(p.date, rangeStart, rangeEnd),
    );
    const purchasedQty = purchasesInRange.reduce((sum, p) => sum + p.quantity, 0);
    const lossRate = purchasedQty > 0 ? (totalQty / purchasedQty) * 100 : null;

    const periodLength = dateRange.length;
    const priorStart = format(subDays(new Date(`${rangeStart}T00:00:00`), periodLength), "yyyy-MM-dd");
    const priorEnd = format(subDays(new Date(`${rangeStart}T00:00:00`), 1), "yyyy-MM-dd");
    const priorLosses = adjustments
      .filter((a) => a.quantity < 0 && productMatch(a.productId) && inRange(a.date, priorStart, priorEnd))
      .reduce((sum, a) => sum + Math.abs(a.quantity), 0);
    const priorPurchased = purchases
      .filter((p) => p.quantity > 0 && productMatch(p.productId) && inRange(p.date, priorStart, priorEnd))
      .reduce((sum, p) => sum + p.quantity, 0);
    const priorRate = priorPurchased > 0 ? (priorLosses / priorPurchased) * 100 : null;

    const trend: AdjustmentTrendPoint[] = dateRange.map((date) => {
      const cost = incidents
        .filter((i) => i.date === date)
        .reduce((sum, i) => sum + (i.cost ?? 0), 0);
      return { date, label: format(new Date(`${date}T00:00:00`), "MMM d"), cost };
    });

    const byProductMap = new Map<string, AdjustmentByProductRow>();
    for (const incident of incidents) {
      const existing = byProductMap.get(incident.productId);
      if (existing) {
        existing.qty += Math.abs(incident.quantity);
        existing.cost = existing.cost != null && incident.cost != null ? existing.cost + incident.cost : null;
      } else {
        byProductMap.set(incident.productId, {
          productId: incident.productId,
          name: incident.productName,
          qty: Math.abs(incident.quantity),
          cost: incident.cost,
        });
      }
    }
    const byProduct = [...byProductMap.values()].sort(
      (a, b) => (b.cost ?? -1) - (a.cost ?? -1) || b.qty - a.qty,
    );

    const byReasonMap = new Map<AdjustmentReason, AdjustmentByReasonRow>();
    for (const a of adjustments) {
      if (!productMatch(a.productId) || !inRange(a.date, rangeStart, rangeEnd)) continue;
      const unitCost = costFor(a.productId);
      const existing = byReasonMap.get(a.reason);
      if (existing) {
        if (a.quantity < 0) {
          existing.qtyLost += Math.abs(a.quantity);
          existing.cost += unitCost != null ? Math.abs(a.quantity) * unitCost : 0;
        } else {
          existing.qtyFound += a.quantity;
        }
      } else {
        byReasonMap.set(a.reason, {
          reason: a.reason,
          qtyLost: a.quantity < 0 ? Math.abs(a.quantity) : 0,
          qtyFound: a.quantity > 0 ? a.quantity : 0,
          cost: a.quantity < 0 && unitCost != null ? Math.abs(a.quantity) * unitCost : 0,
        });
      }
    }
    const byReason = (Object.keys(REASON_META) as AdjustmentReason[])
      .map((r) => byReasonMap.get(r))
      .filter((r): r is AdjustmentByReasonRow => r != null);

    return {
      incidents,
      totalQty,
      totalCost,
      missingCostCount,
      purchasedQty,
      lossRate,
      priorRate,
      trend,
      byProduct,
      byReason,
    };
  }, [adjustments, purchases, expenses, products, dateRange, selectedProductId]);
}
