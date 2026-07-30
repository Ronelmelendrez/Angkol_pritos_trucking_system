import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useSales } from "@/features/sales/hooks/useSales";
import { usePayrollHistory } from "@/features/payroll/hooks/usePayrollHistory";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { CategoryBreakdown, DailyProfitPoint, PayrollRow } from "../types";

export function useReports(dateFrom?: string, dateTo?: string) {
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: paidRuns = [], isLoading: payrollLoading } = usePayrollHistory();

  const isLoading = expensesLoading || employeesLoading || salesLoading || payrollLoading;

  const effectiveFrom = dateFrom ?? format(startOfMonth(new Date()), "yyyy-MM-dd");
  const effectiveTo = dateTo ?? format(endOfMonth(new Date()), "yyyy-MM-dd");

  const filteredExpenses = useMemo(
    () => expenses.filter((e) => e.date >= effectiveFrom && e.date <= effectiveTo),
    [expenses, effectiveFrom, effectiveTo],
  );

  const filteredSales = useMemo(
    () => sales.filter((s) => s.date >= effectiveFrom && s.date <= effectiveTo),
    [sales, effectiveFrom, effectiveTo],
  );

  const categoryBreakdown = useMemo<CategoryBreakdown[]>(() => {
    const totals = new Map<string, number>();
    filteredExpenses.forEach((e) => totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount));
    return Array.from(totals.entries())
      .map(([category, total]) => ({
        category,
        total,
        color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ?? "#A08D86",
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  const dailyProfit = useMemo<DailyProfitPoint[]>(() => {
    const start = new Date(effectiveFrom + "T00:00:00");
    const end = new Date(effectiveTo + "T00:00:00");
    const days = eachDayOfInterval({ start, end });
    return days.map((date) => {
      const key = format(date, "yyyy-MM-dd");
      const dayExpenses = filteredExpenses
        .filter((e) => e.date === key)
        .reduce((sum, e) => sum + e.amount, 0);
      const daySales = filteredSales
        .filter((s) => s.date === key)
        .reduce((sum, s) => sum + s.amount, 0);
      return {
        date: key,
        label: format(date, "MMM d"),
        expenses: dayExpenses,
        sales: daySales,
        profit: daySales - dayExpenses,
      };
    });
  }, [filteredExpenses, filteredSales, effectiveFrom, effectiveTo]);

  const payroll = useMemo<PayrollRow[]>(() => {
    const paid = paidRuns.filter(
      (r) => r.status === "paid" && r.periodStart >= effectiveFrom && r.periodEnd <= effectiveTo,
    );
    return paid.map((r) => ({
      employeeId: r.employeeId,
      name: r.employeeName,
      hoursWorked: r.hoursWorked,
      dailyRate: r.dailyRate,
      grossPay: r.grossPay,
      pendingAdvances: r.advanceDeductions,
      netPay: r.netPay,
    }));
  }, [paidRuns, effectiveFrom, effectiveTo]);

  const totals = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalSales = filteredSales.reduce((sum, s) => sum + s.amount, 0);
    return { totalExpenses, totalSales };
  }, [filteredExpenses, filteredSales]);

  return { categoryBreakdown, dailyProfit, payroll, totals, filteredSales, isLoading };
}