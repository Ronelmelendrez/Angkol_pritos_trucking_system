import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { useSales } from "@/features/sales/hooks/useSales";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useAdvances } from "@/features/advances/hooks/useAdvances";
import { useLoans } from "@/features/loans/hooks/useLoans";
import { usePayRuleSettings } from "@/features/settings/hooks/usePayRuleSettings";
import { useAdjustmentsLog } from "@/features/inventory/hooks/useAdjustmentsLog";
import { useAllProductStock } from "@/features/inventory/hooks/useAllProductStock";
import { useReports } from "@/features/reports/hooks/useReports";
import { generateInsights } from "../utils/generateInsights";
import type { InsightsData } from "../types";

const DEFAULT_DAYS = 30;

export function useInsights(dateFrom?: string, dateTo?: string) {
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: attendance = [], isLoading: attendanceLoading } = useAttendance();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: products = [] } = useProducts();
  const { data: advances = [] } = useAdvances();
  const { data: loans = [] } = useLoans();
  const { data: settings } = usePayRuleSettings();
  const { log: adjustments = [] } = useAdjustmentsLog();
  const stock = useAllProductStock();

  const defaultFrom = dateFrom ?? format(subDays(new Date(), DEFAULT_DAYS - 1), "yyyy-MM-dd");
  const defaultTo = dateTo ?? format(new Date(), "yyyy-MM-dd");
  const { payroll = [], isLoading: reportsLoading } = useReports(defaultFrom, defaultTo);

  const isLoading = salesLoading || expensesLoading || attendanceLoading || employeesLoading || reportsLoading;

  const range = useMemo(() => {
    const prevTo = format(subDays(new Date(`${defaultFrom}T00:00:00`), 1), "yyyy-MM-dd");
    const prevFrom = format(subDays(new Date(`${defaultFrom}T00:00:00`), DEFAULT_DAYS), "yyyy-MM-dd");
    return { from: defaultFrom, to: defaultTo, prevFrom, prevTo };
  }, [defaultFrom, defaultTo]);

  const bundle = useMemo<InsightsData>(() => {
    const inPeriod = (date: string) => date >= range.from && date <= range.to;
    const inPrev = (date: string) => date >= range.prevFrom && date <= range.prevTo;

    return {
      sales: sales.filter((s) => inPeriod(s.date)),
      expenses: expenses.filter((e) => inPeriod(e.date)),
      attendance: attendance.filter((a) => inPeriod(a.date)),
      employees,
      products,
      advances,
      loans,
      payroll,
      stock,
      adjustments: adjustments.filter((a) => inPeriod(a.date)),
      prevPeriodSales: sales.filter((s) => inPrev(s.date)).reduce((sum, s) => sum + s.amount, 0),
      prevPeriodExpenses: expenses.filter((e) => inPrev(e.date)).reduce((sum, e) => sum + e.amount, 0),
      defaultReorderThreshold: settings?.defaultReorderThreshold ?? 0,
    };
  }, [sales, expenses, attendance, employees, products, advances, loans, payroll, stock, adjustments, range, settings]);

  const insights = useMemo(() => generateInsights(bundle), [bundle]);

  return { insights, isLoading };
}
