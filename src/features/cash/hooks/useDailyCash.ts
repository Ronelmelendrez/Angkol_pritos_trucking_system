import { useMemo } from "react";
import { useSales } from "@/features/sales/hooks/useSales";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useAdvances } from "@/features/advances/hooks/useAdvances";
import { useOwnerWithdrawals } from "@/features/withdrawals/hooks/useWithdrawals";
import { useCashOpenings } from "./useCashOpenings";
import { useCashCounts } from "./useCashCounts";
import { useProducts } from "@/features/products/hooks/useProducts";
import type { CashMovementItem, DailyCashData } from "../types";

export function useDailyCash(date: string) {
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: advances = [], isLoading: advancesLoading } = useAdvances();
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useOwnerWithdrawals();
  const { data: openings = [], isLoading: openingsLoading } = useCashOpenings();
  const { data: counts = [], isLoading: countsLoading } = useCashCounts();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  const isLoading =
    salesLoading || expensesLoading || advancesLoading || withdrawalsLoading ||
    openingsLoading || countsLoading || productsLoading;

  const data = useMemo<DailyCashData>(() => {
    const productNames = new Map(products.map((p) => [p.id, p.name]));

    const daySales = sales
      .filter((s) => s.date === date)
      .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
    const dayExpenses = expenses
      .filter((e) => e.date === date && e.paymentMethod === "Cash")
      .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
    const dayAdvances = advances
      .filter((a) => a.date === date)
      .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
    const dayWithdrawals = withdrawals
      .filter((w) => w.date === date)
      .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));

    const opening = openings.find((o) => o.date === date) ?? null;
    const cashCount = counts.find((c) => c.date === date) ?? null;

    const cashSales = daySales.reduce((sum, s) => sum + s.amount, 0);
    const cashExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const cashAdvances = dayAdvances.reduce((sum, a) => sum + a.amount, 0);
    const ownerWithdrawals = dayWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const otherIncome = 0;

    const totalCashIn = cashSales + otherIncome;
    const totalCashOut = cashExpenses + cashAdvances + ownerWithdrawals;
    const expectedCash = (opening?.openingCash ?? 0) + totalCashIn - totalCashOut;

    const events: Omit<CashMovementItem, "balance">[] = [];
    if (opening) {
      events.push({
        id: `opening-${opening.id}`,
        time: opening.createdAt ?? `${date}T00:00:00`,
        type: "opening",
        label: "Opening cash",
        amount: opening.openingCash,
      });
    }
    for (const s of daySales) {
      events.push({
        id: `sale-${s.id}`,
        time: s.createdAt ?? `${date}T00:00:00`,
        type: "sale",
        label: `Sale — ${productNames.get(s.productId) ?? "Unknown"}`,
        amount: s.amount,
      });
    }
    for (const e of dayExpenses) {
      events.push({
        id: `expense-${e.id}`,
        time: e.createdAt ?? `${date}T00:00:00`,
        type: "expense",
        label: `Expense — ${e.category}`,
        amount: -e.amount,
      });
    }
    for (const a of dayAdvances) {
      events.push({
        id: `advance-${a.id}`,
        time: a.createdAt ?? `${date}T00:00:00`,
        type: "advance",
        label: "Cash advance",
        amount: -a.amount,
      });
    }
    for (const w of dayWithdrawals) {
      events.push({
        id: `withdrawal-${w.id}`,
        time: w.createdAt ?? `${date}T00:00:00`,
        type: "withdrawal",
        label: "Owner withdrawal",
        amount: -w.amount,
      });
    }

    const sorted = events.sort((a, b) => a.time.localeCompare(b.time));
    const movements: CashMovementItem[] = sorted.reduce<CashMovementItem[]>(
      (acc, event) => {
        const balance = (acc.at(-1)?.balance ?? 0) + event.amount;
        return [...acc, { ...event, balance }];
      },
      [],
    );

    return {
      date,
      openingCash: opening?.openingCash ?? null,
      cashSales,
      cashExpenses,
      cashAdvances,
      ownerWithdrawals,
      otherIncome,
      totalCashIn,
      totalCashOut,
      expectedCash,
      cashCount,
      actualCash: cashCount?.actualCash ?? null,
      difference: cashCount?.difference ?? null,
      movements,
    };
  }, [date, sales, expenses, advances, withdrawals, openings, counts, products]);

  return { data, isLoading };
}
