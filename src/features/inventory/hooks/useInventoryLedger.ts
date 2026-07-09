import { useMemo } from "react";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useSales } from "@/features/sales/hooks/useSales";
import { adjustmentsTable } from "@/lib/mockData";
import { buildLedger } from "../utils/buildLedger";

export function useInventoryLedger(productId: string, dateRange: string[]) {
  const { data: expenses = [] } = useExpenses();
  const { data: sales = [] } = useSales();
  const adjustments = adjustmentsTable.list();

  return useMemo(
    () => buildLedger(productId, dateRange, expenses, sales, adjustments),
    [productId, dateRange, expenses, sales, adjustments],
  );
}
