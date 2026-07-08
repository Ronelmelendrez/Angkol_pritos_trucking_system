import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useAdvances } from "@/features/advances/hooks/useAdvances";
import { useSales } from "@/features/sales/hooks/useSales";
import { usePayRuleSettings } from "@/features/settings/hooks/usePayRuleSettings";
import { resolvePayRules, computeGrossPay } from "@/features/settings/utils/resolvePayRules";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { CategoryBreakdown, DailyProfitPoint, PayrollRow } from "../types";

export function useReports(dateFrom?: string, dateTo?: string) {
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: attendance = [], isLoading: attendanceLoading } = useAttendance();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: advances = [], isLoading: advancesLoading } = useAdvances();
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: globalSettings } = usePayRuleSettings();

  const isLoading = expensesLoading || attendanceLoading || employeesLoading || advancesLoading || salesLoading;

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

  const filteredAttendance = useMemo(
    () => attendance.filter((a) => {
      if (!a.date) return false;
      return a.date >= effectiveFrom && a.date <= effectiveTo;
    }),
    [attendance, effectiveFrom, effectiveTo],
  );

  const filteredAdvances = useMemo(
    () => advances.filter((a) => {
      if (!a.date) return false;
      return a.date >= effectiveFrom && a.date <= effectiveTo;
    }),
    [advances, effectiveFrom, effectiveTo],
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
    if (!globalSettings) return [];
    return employees
      .filter((e) => e.isActive)
      .map((emp) => {
        const empAttendance = filteredAttendance.filter(
          (a) => a.employeeId === emp.id && a.hoursWorked != null,
        );
        const hoursWorked = empAttendance.reduce((sum, a) => sum + (a.hoursWorked ?? 0), 0);
        const grossPayInputs = empAttendance.map((a) => ({
          hoursWorked: a.hoursWorked ?? 0,
          shift: a.shift,
          clockIn: a.clockIn,
          clockOut: a.clockOut,
        }));
        const rules = resolvePayRules(globalSettings);
        const grossPay = computeGrossPay(grossPayInputs, emp.dailyRate, rules);
        const pendingAdvances = filteredAdvances
          .filter((a) => a.employeeId === emp.id && a.status === "pending")
          .reduce((sum, a) => sum + a.amount, 0);
        return {
          employeeId: emp.id,
          name: emp.name,
          hoursWorked: Math.round(hoursWorked * 100) / 100,
          dailyRate: emp.dailyRate,
          grossPay,
          pendingAdvances,
          netPay: grossPay - pendingAdvances,
        };
      });
  }, [employees, filteredAttendance, filteredAdvances, globalSettings]);

  const totals = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalSales = filteredSales.reduce((sum, s) => sum + s.amount, 0);
    return { totalExpenses, totalSales };
  }, [filteredExpenses, filteredSales]);

  return { categoryBreakdown, dailyProfit, payroll, totals, filteredSales, isLoading };
}