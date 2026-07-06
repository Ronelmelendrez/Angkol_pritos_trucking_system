import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useAdvances } from "@/features/advances/hooks/useAdvances";
import { useSales } from "@/features/sales/hooks/useSales";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { CategoryBreakdown, DailyProfitPoint, PayrollRow } from "../types";

/**
 * Reports are computed client-side from the other features' cached data.
 * When Supabase is added, this can either stay as-is (querying the same
 * feature hooks) or be replaced with a Postgres view / RPC call that
 * returns pre-aggregated rows — the component contracts below wouldn't
 * need to change either way.
 */
export function useReports(days: number = 30) {
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: attendance = [], isLoading: attendanceLoading } = useAttendance();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: advances = [], isLoading: advancesLoading } = useAdvances();
  const { data: sales = [], isLoading: salesLoading } = useSales();

  const isLoading = expensesLoading || attendanceLoading || employeesLoading || advancesLoading || salesLoading;

  const categoryBreakdown = useMemo<CategoryBreakdown[]>(() => {
    const totals = new Map<string, number>();
    expenses.forEach((e) => totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount));
    return Array.from(totals.entries())
      .map(([category, total]) => ({
        category,
        total,
        color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ?? "#A08D86",
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const dailyProfit = useMemo<DailyProfitPoint[]>(() => {
    const range = Array.from({ length: days }).map((_, i) => subDays(new Date(), days - 1 - i));
    return range.map((date) => {
      const key = format(date, "yyyy-MM-dd");
      const dayExpenses = expenses
        .filter((e) => e.date === key)
        .reduce((sum, e) => sum + e.amount, 0);
      const daySales = sales
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
  }, [expenses, sales, days]);

  const payroll = useMemo<PayrollRow[]>(() => {
    return employees
      .filter((e) => e.isActive)
      .map((emp) => {
        const hoursWorked = attendance
          .filter((a) => a.employeeId === emp.id && a.hoursWorked != null)
          .reduce((sum, a) => sum + (a.hoursWorked ?? 0), 0);
        const grossPay = hoursWorked * emp.hourlyRate;
        const pendingAdvances = advances
          .filter((a) => a.employeeId === emp.id && a.status === "pending")
          .reduce((sum, a) => sum + a.amount, 0);
        return {
          employeeId: emp.id,
          name: emp.name,
          hoursWorked: Math.round(hoursWorked * 100) / 100,
          hourlyRate: emp.hourlyRate,
          grossPay,
          pendingAdvances,
          netPay: grossPay - pendingAdvances,
        };
      });
  }, [employees, attendance, advances]);

  const totals = useMemo(() => {
    const totalExpensesToday = expenses
      .filter((e) => e.date === format(new Date(), "yyyy-MM-dd"))
      .reduce((sum, e) => sum + e.amount, 0);
    const totalExpensesAllTime = expenses.reduce((sum, e) => sum + e.amount, 0);
    return { totalExpensesToday, totalExpensesAllTime };
  }, [expenses]);

  return { categoryBreakdown, dailyProfit, payroll, totals, isLoading };
}