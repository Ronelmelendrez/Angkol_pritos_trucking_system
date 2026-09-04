import { useMemo } from "react";
import { useSales } from "@/features/sales/hooks/useSales";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useAdvances } from "@/features/advances/hooks/useAdvances";
import { useOwnerWithdrawals } from "@/features/withdrawals/hooks/useWithdrawals";
import { useCashOpenings } from "./useCashOpenings";
import { useCashCounts } from "./useCashCounts";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useAllOrderPayments } from "@/features/orders/hooks/useOrderPayments";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import type { CashMovementItem, DailyCashData } from "../types";

export function useDailyCash(date: string, branchId?: string) {
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(branchId);
  const { data: advances = [], isLoading: advancesLoading } = useAdvances();
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useOwnerWithdrawals(branchId);
  const { data: openings = [], isLoading: openingsLoading } = useCashOpenings(branchId);
  const { data: counts = [], isLoading: countsLoading } = useCashCounts(branchId);
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: orderPayments = [], isLoading: paymentsLoading } = useAllOrderPayments(branchId);
  const { data: employees = [] } = useEmployees();

  const isLoading =
    salesLoading || expensesLoading || advancesLoading || withdrawalsLoading ||
    openingsLoading || countsLoading || productsLoading || paymentsLoading;

  const data = useMemo<DailyCashData>(() => {
    const productNames = new Map(products.map((p) => [p.id, p.name]));

    const employeeBranchMap = new Map(employees.map((e) => [e.id, e.branchId]));

    // Filter sales by branch (sales already has branchId from DB)
    const branchSales = branchId
      ? sales.filter((s) => s.branchId === branchId)
      : sales;

    // Walk-in sales only. Sale rows linked to a scheduled order are excluded:
    // that order's cash is already captured as deposit/balance payments on the
    // days they were actually received.
    const daySales = branchSales
      .filter((s) => s.date === date && !s.orderId)
      .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));

    // Filter expenses by branch (expenses now has branchId from DB)
    const dayExpenses = expenses
      .filter(
        (e) =>
          e.date === date &&
          e.paymentMethod === "Cash" &&
          e.fundSource !== "separate",
      )
      .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));

    // Filter advances by branch via employee's branch
    const branchAdvances = branchId
      ? advances.filter((a) => employeeBranchMap.get(a.employeeId) === branchId)
      : advances;
    const dayAdvances = branchAdvances
      .filter((a) => a.date === date)
      .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));

    // Filter withdrawals by branch (owner_withdrawals now has branchId from DB)
    const dayWithdrawals = withdrawals
      .filter((w) => w.date === date)
      .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));

    // All order payments received this day are real cash movements.
    // Deposits are shown separately from balance/final payments so deposits
    // are never double-counted as sales.
    // Order payments are already filtered by branch via the useAllOrderPayments hook.
    const dayOrderPayments = orderPayments
      .filter((p) => p.paymentDate === date)
      .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
    const dayDeposits = dayOrderPayments.filter((p) => p.paymentType === "deposit");
    const dayBalancePayments = dayOrderPayments.filter((p) => p.paymentType !== "deposit");

    const opening = openings.find((o) => o.date === date) ?? null;
    const cashCount = counts.find((c) => c.date === date) ?? null;

    const cashSales = daySales.reduce((sum, s) => sum + s.amount, 0);
    const depositTotal = dayDeposits.reduce((sum, p) => sum + p.amount, 0);
    const balancePaymentsTotal = dayBalancePayments.reduce((sum, p) => sum + p.amount, 0);
    const cashExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const cashAdvances = dayAdvances.reduce((sum, a) => sum + a.amount, 0);
    const ownerWithdrawals = dayWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const otherIncome = 0;

    const totalCashIn = cashSales + depositTotal + balancePaymentsTotal + otherIncome;
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
    for (const p of dayDeposits) {
      events.push({
        id: `deposit-${p.id}`,
        time: p.createdAt ?? `${date}T00:00:00`,
        type: "order_deposit",
        label: "Order deposit",
        amount: p.amount,
      });
    }
    for (const p of dayBalancePayments) {
      events.push({
        id: `order-payment-${p.id}`,
        time: p.createdAt ?? `${date}T00:00:00`,
        type: "order_deposit",
        label: p.paymentType === "final" ? "Order balance payment" : "Order extra payment",
        amount: p.amount,
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
      orderDeposits: depositTotal,
      orderBalancePayments: balancePaymentsTotal,
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
  }, [date, branchId, sales, expenses, advances, withdrawals, openings, counts, products, orderPayments, employees]);

  return { data, isLoading };
}
