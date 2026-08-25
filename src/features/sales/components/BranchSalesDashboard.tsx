import { useState } from "react";
import { DollarSign, ShoppingCart, BarChart2, Building2, Trophy, Target } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useBranchSalesComparison } from "@/features/sales/hooks/useBranchSales";
import { formatCurrency } from "@/utils/currency";
import { cn } from "@/utils/cn";

interface Props {
  className?: string;
}

export function BranchSalesDashboard({ className }: Props) {
  const [period, setPeriod] = useState<"today" | "week" | "month">("month");
  const { data: branchSales = [], isLoading } = useBranchSalesComparison(period);

  const topBranch = branchSales[0];
  const totalSales = branchSales.reduce((sum, b) => sum + b.totalSales, 0);
  const totalTransactions = branchSales.reduce((sum, b) => sum + b.transactionCount, 0);

  if (isLoading) {
    return (
      <Card className={cn("p-8", className)}>
        <div className="flex items-center justify-center gap-3 text-ink-soft">
          <BarChart2 className="h-8 w-8 animate-flame text-primary" />
          <p className="text-sm">Loading branch analytics...</p>
        </div>
      </Card>
    );
  }

  if (branchSales.length === 0) {
    return (
      <Card className={cn("p-8", className)}>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
          <BarChart2 className="mb-2 h-8 w-8 text-ink-faint" />
          <p className="text-sm font-medium text-ink">No sales data yet</p>
          <p className="text-xs text-ink-faint">Sales will appear here once recorded.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          Branch Performance
        </CardTitle>
        <Select value={period} onValueChange={setPeriod as (v: "today" | "week" | "month") => void}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-line bg-accent-subtle p-4 text-center">
            <DollarSign className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-1 text-xs text-ink-soft">Total Sales</p>
            <p className="text-lg font-bold text-ink">{formatCurrency(totalSales)}</p>
          </div>
          <div className="rounded-lg border border-line bg-accent-subtle p-4 text-center">
            <ShoppingCart className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-1 text-xs text-ink-soft">Transactions</p>
            <p className="text-lg font-bold text-ink">{totalTransactions}</p>
          </div>
          <div className="rounded-lg border border-line bg-accent-subtle p-4 text-center">
            <Building2 className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-1 text-xs text-ink-soft">Active Branches</p>
            <p className="text-lg font-bold text-ink">{branchSales.length}</p>
          </div>
        </div>

        {topBranch && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Trophy className="h-4 w-4" />
              Top Performing Branch: <span className="font-bold">{topBranch.branchName}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-ink-soft">Sales</span>
              <span className="font-bold text-primary">{formatCurrency(topBranch.totalSales)}</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ink/6">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${((topBranch.totalSales / totalSales) * 100).toFixed(0)}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-ink-soft uppercase tracking-wider">
            <div className="w-32">Branch</div>
            <div className="w-24 text-right">Sales</div>
            <div className="w-20 text-right">Qty</div>
            <div className="w-20 text-right">Txns</div>
            <div className="flex-1">Share</div>
          </div>
          {branchSales.map((branch, index) => (
            <div
              key={branch.branchId}
              className={cn(
                "flex items-center gap-2 text-sm",
                index === 0 && "bg-primary/5 rounded-lg px-3 py-2"
              )}
            >
              <span className="w-8 text-center">
                {index === 0 && <Trophy className="mx-auto h-4 w-4 text-yellow-500" />}
                {index === 1 && <Target className="mx-auto h-4 w-4 text-gray-400" />}
                {index === 2 && <Target className="mx-auto h-4 w-4 text-amber-600" />}
                {index > 2 && <span className="text-ink-faint">#{index + 1}</span>}
              </span>
              <div className="w-32 font-medium text-ink truncate">{branch.branchName}</div>
              <div className="w-24 text-right font-medium text-primary">{formatCurrency(branch.totalSales)}</div>
              <div className="w-20 text-right text-ink-soft">{branch.totalQuantity}</div>
              <div className="w-20 text-right text-ink-soft">{branch.transactionCount}</div>
              <div className="flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-ink/6">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      index === 0 ? "bg-primary" : "bg-ink/20"
                    )}
                    style={{ width: `${((branch.totalSales / totalSales) * 100).toFixed(1)}%` }}
                  />
                </div>
              </div>
              <span className="w-12 text-right text-xs text-ink-soft">
                {((branch.totalSales / totalSales) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}