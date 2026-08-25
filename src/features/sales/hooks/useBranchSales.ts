import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useBranches } from "@/features/branches/hooks/useBranches";
import { useAuth } from "@/features/auth/hooks/useAuth";

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