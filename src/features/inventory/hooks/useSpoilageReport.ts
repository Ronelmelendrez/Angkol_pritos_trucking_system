import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { useAdjustmentsLog } from "./useAdjustmentsLog";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useProducts } from "@/features/products/hooks/useProducts";
import { estimateUnitCost } from "../utils/estimateUnitCost";
import { LOSS_REASONS, REASON_META } from "../utils/reasonMeta";
import type { AdjustmentReason } from "../types";

export interface SpoilageIncident {
  id: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number; // negative for a loss
  reason: AdjustmentReason;
  note?: string;
  cost: number | null;
}

export interface SpoilageTrendPoint {
  date: string;
  label: string;
  cost: number;
}

export interface SpoilageByProductRow {
  productId: string;
  name: string;
  qty: number;
  cost: number | null;
}

export interface SpoilageByReasonRow {
  reason: AdjustmentReason;
  qty: number;
  cost: number;
}

export interface SpoilageReportData {
  incidents: SpoilageIncident[];
  totalQty: number; // spoiled qty, positive
  totalCost: number | null; // null when no cost data exists for any loss
  missingCostCount: number;
  purchasedQty: number; // purchased qty in the period
  spoilageRate: number | null; // percent; null when there were no purchases
  priorRate: number | null; // percent for the window immediately before the period
  trend: SpoilageTrendPoint[];
  byProduct: SpoilageByProductRow[];
  byReason: SpoilageByReasonRow[];
}

function inRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

/**
 * Aggregates the spoilage/waste report for a date range (and optionally a
 * single product). Everything is computed client-side over the same
 * `stock_adjustments` + `expenses` data the rest of Inventory already uses.
 */
export function useSpoilageReport(dateRange: string[], selectedProductId: string): SpoilageReportData {
  const { log: adjustments, purchases } = useAdjustmentsLog();
  const { data: expenses = [] } = useExpenses();
  const { data: products = [] } = useProducts();

  return useMemo(() => {
    const rangeStart = dateRange[0];
    const rangeEnd = dateRange[dateRange.length - 1];

    const productMatch = (productId: string) => !selectedProductId || productId === selectedProductId;

    const lossIncidents = adjustments.filter(
      (a) =>
        LOSS_REASONS.includes(a.reason) &&
        a.quantity < 0 &&
        productMatch(a.productId) &&
        inRange(a.date, rangeStart, rangeEnd),
    );

    const allLossAdjustments = adjustments.filter(
      (a) => a.quantity < 0 && productMatch(a.productId) && inRange(a.date, rangeStart, rangeEnd),
    );

    const unitCosts = new Map<string, number | null>();
    const costFor = (productId: string) => {
      if (!unitCosts.has(productId)) unitCosts.set(productId, estimateUnitCost(productId, products, expenses));
      return unitCosts.get(productId);
    };

    const incidents: SpoilageIncident[] = lossIncidents.map((a) => {
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

    const totalQty = lossIncidents.reduce((sum, a) => sum + Math.abs(a.quantity), 0);
    const costs = incidents.map((i) => i.cost).filter((c): c is number => c != null);
    const missingCostCount = incidents.filter((i) => i.cost == null).length;
    const totalCost = incidents.length > 0 && costs.length === 0 ? null : costs.reduce((sum, c) => sum + c, 0);

    const purchasesInRange = purchases.filter(
      (p) => p.quantity > 0 && productMatch(p.productId) && inRange(p.date, rangeStart, rangeEnd),
    );
    const purchasedQty = purchasesInRange.reduce((sum, p) => sum + p.quantity, 0);
    const spoilageRate = purchasedQty > 0 ? (totalQty / purchasedQty) * 100 : null;

    const periodLength = dateRange.length;
    const priorStart = format(subDays(new Date(`${rangeStart}T00:00:00`), periodLength), "yyyy-MM-dd");
    const priorEnd = format(subDays(new Date(`${rangeStart}T00:00:00`), 1), "yyyy-MM-dd");
    const priorSpoiled = adjustments
      .filter((a) => LOSS_REASONS.includes(a.reason) && a.quantity < 0 && productMatch(a.productId) && inRange(a.date, priorStart, priorEnd))
      .reduce((sum, a) => sum + Math.abs(a.quantity), 0);
    const priorPurchased = purchases
      .filter((p) => p.quantity > 0 && productMatch(p.productId) && inRange(p.date, priorStart, priorEnd))
      .reduce((sum, p) => sum + p.quantity, 0);
    const priorRate = priorPurchased > 0 ? (priorSpoiled / priorPurchased) * 100 : null;

    const trend: SpoilageTrendPoint[] = dateRange.map((date) => {
      const cost = incidents
        .filter((i) => i.date === date)
        .reduce((sum, i) => sum + (i.cost ?? 0), 0);
      return { date, label: format(new Date(`${date}T00:00:00`), "MMM d"), cost };
    });

    const byProductMap = new Map<string, SpoilageByProductRow>();
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

    const byReasonMap = new Map<AdjustmentReason, SpoilageByReasonRow>();
    for (const a of allLossAdjustments) {
      const unitCost = costFor(a.productId);
      const existing = byReasonMap.get(a.reason);
      if (existing) {
        existing.qty += Math.abs(a.quantity);
        existing.cost += unitCost != null ? Math.abs(a.quantity) * unitCost : 0;
      } else {
        byReasonMap.set(a.reason, {
          reason: a.reason,
          qty: Math.abs(a.quantity),
          cost: unitCost != null ? Math.abs(a.quantity) * unitCost : 0,
        });
      }
    }
    const byReason = Object.keys(REASON_META) as AdjustmentReason[];
    const byReasonSorted = byReason
      .map((r) => byReasonMap.get(r))
      .filter((r): r is SpoilageByReasonRow => r != null);

    return {
      incidents,
      totalQty,
      totalCost,
      missingCostCount,
      purchasedQty,
      spoilageRate,
      priorRate,
      trend,
      byProduct,
      byReason: byReasonSorted,
    };
  }, [adjustments, purchases, expenses, products, dateRange, selectedProductId]);
}
