import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useBranches } from "@/features/branches/hooks/useBranches";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { format, eachDayOfInterval, parseISO } from "date-fns";

export interface BranchSalesSummary {
  branchId: string;
  branchName: string;
  totalSales: number;
  totalQuantity: number;
  transactionCount: number;
}

export function useBranchSalesSummary(dateFrom?: string, dateTo?: string) {
  const { user } = useAuth();
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  
  const branchMap = Object.fromEntries(branches.map(b => [b.id, b.name]));

  return useQuery({
    queryKey: ["sales", "branch-summary", dateFrom, dateTo, user?.branchId],
    queryFn: async () => {
      // If staff, only get their branch data
      if (user?.role === "staff" && user?.branchId) {
        let query = supabase
          .from("sales")
          .select("branch_id, amount, quantity_sold")
          .eq("branch_id", user.branchId);
        
        if (dateFrom) query = query.gte("date", dateFrom);
        if (dateTo) query = query.lte("date", dateTo);
        
        const { data, error } = await query;
        if (error) throw error;
        
        const summary = data.reduce((acc, sale) => {
          const branchId = sale.branch_id;
          if (!branchId) return acc;
          if (!acc[branchId]) {
            acc[branchId] = { branchId, branchName: branchMap[branchId] || "Unknown", totalSales: 0, totalQuantity: 0, transactionCount: 0 };
          }
          acc[branchId].totalSales += Number(sale.amount);
          acc[branchId].totalQuantity += sale.quantity_sold;
          acc[branchId].transactionCount += 1;
          return acc;
        }, {} as Record<string, BranchSalesSummary>);
        
        return Object.values(summary);
      }
      
      // Manager sees all branches
      let query = supabase
        .from("sales")
        .select("branch_id, amount, quantity_sold");
      
      if (dateFrom) query = query.gte("date", dateFrom);
      if (dateTo) query = query.lte("date", dateTo);
      
      const { data, error } = await query;
      if (error) throw error;
      
      const summary = data.reduce((acc, sale) => {
        const branchId = sale.branch_id;
        if (!branchId) return acc;
        if (!acc[branchId]) {
          acc[branchId] = { branchId, branchName: branchMap[branchId] || "Unknown", totalSales: 0, totalQuantity: 0, transactionCount: 0 };
        }
        acc[branchId].totalSales += Number(sale.amount);
        acc[branchId].totalQuantity += sale.quantity_sold;
        acc[branchId].transactionCount += 1;
        return acc;
      }, {} as Record<string, BranchSalesSummary>);
      
      return Object.values(summary).sort((a, b) => b.totalSales - a.totalSales);
    },
    enabled: !(user?.role === "staff" && !user?.branchId) && !branchesLoading,
  });
}

export interface BranchSalesOverTimePoint {
  label: string;
  [branchName: string]: string | number;
}

export function useBranchSalesOverTime(dateFrom: string, dateTo: string) {
  const { user } = useAuth();
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const branchMap = Object.fromEntries(branches.map(b => [b.id, b.name]));

  return useQuery({
    queryKey: ["sales", "branch-over-time", dateFrom, dateTo, user?.branchId],
    queryFn: async () => {
      let query = supabase
        .from("sales")
        .select("branch_id, amount, date")
        .gte("date", dateFrom)
        .lte("date", dateTo);

      if (user?.role === "staff" && user?.branchId) {
        query = query.eq("branch_id", user.branchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const branchNames = [...new Set(data.map(s => branchMap[s.branch_id] ?? "Unknown"))];
      const dateMap = new Map<string, Record<string, number>>();

      for (const sale of data) {
        const branchName = branchMap[sale.branch_id] ?? "Unknown";
        const label = sale.date;
        if (!dateMap.has(label)) {
          dateMap.set(label, {});
        }
        const row = dateMap.get(label)!;
        row[branchName] = (row[branchName] ?? 0) + Number(sale.amount);
      }

      const days = eachDayOfInterval({
        start: parseISO(dateFrom),
        end: parseISO(dateTo),
      });

      return {
        data: days.map(day => {
          const label = format(day, "MMM d");
          const isoDate = format(day, "yyyy-MM-dd");
          const row = dateMap.get(isoDate) ?? {};
          const point: BranchSalesOverTimePoint = { label };
          for (const name of branchNames) {
            point[name] = row[name] ?? 0;
          }
          return point;
        }),
        branchNames,
      };
    },
    enabled: dateFrom <= dateTo && !(user?.role === "staff" && !user?.branchId) && !branchesLoading,
  });
}
export function useBranchSalesComparison(period: "today" | "week" | "month" = "month") {
  const { user } = useAuth();
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const branchMap = Object.fromEntries(branches.map(b => [b.id, b.name]));

  return useQuery({
    queryKey: ["sales", "branch-comparison", period, user?.branchId],
    queryFn: async () => {
      const now = new Date();
      const dateTo = now.toISOString().split("T")[0];
      const dateFrom = period === "today"
        ? dateTo
        : period === "week"
          ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      if (user?.role === "staff" && user?.branchId) {
        const { data, error } = await supabase
          .from("sales")
          .select("branch_id, amount, quantity_sold")
          .eq("branch_id", user.branchId)
          .gte("date", dateFrom)
          .lte("date", dateTo);
        
        if (error) throw error;
        
        const summary = data.reduce((acc, sale) => {
          const branchId = sale.branch_id;
          if (!branchId) return acc;
          if (!acc[branchId]) {
            acc[branchId] = { branchId, branchName: branchMap[branchId] || "Unknown", totalSales: 0, totalQuantity: 0, transactionCount: 0 };
          }
          acc[branchId].totalSales += Number(sale.amount);
          acc[branchId].totalQuantity += sale.quantity_sold;
          acc[branchId].transactionCount += 1;
          return acc;
        }, {} as Record<string, BranchSalesSummary>);
        
        return Object.values(summary);
      }
      
      const { data, error } = await supabase
        .from("sales")
        .select("branch_id, amount, quantity_sold")
        .gte("date", dateFrom)
        .lte("date", dateTo);
      
      if (error) throw error;
      
      const summary = data.reduce((acc, sale) => {
        const branchId = sale.branch_id;
        if (!branchId) return acc;
        if (!acc[branchId]) {
          acc[branchId] = { branchId, branchName: branchMap[branchId] || "Unknown", totalSales: 0, totalQuantity: 0, transactionCount: 0 };
        }
        acc[branchId].totalSales += Number(sale.amount);
        acc[branchId].totalQuantity += sale.quantity_sold;
        acc[branchId].transactionCount += 1;
        return acc;
      }, {} as Record<string, BranchSalesSummary>);
      
      return Object.values(summary).sort((a, b) => b.totalSales - a.totalSales);
    },
    enabled: !(user?.role === "staff" && !user?.branchId) && !branchesLoading,
  });
}