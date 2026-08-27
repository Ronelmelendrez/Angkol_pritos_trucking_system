import { BarChart2, CalendarClock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useBranchSalesComparison } from "@/features/sales/hooks/useBranchSales";
import { useUpcomingOrdersByBranch } from "@/features/orders/hooks/useOrders";
import { formatCurrency } from "@/utils/currency";
import { cn } from "@/utils/cn";

interface Props {
  className?: string;
}

const BAR_COLORS = [
  "bg-primary",
  "bg-primary/60",
  "bg-primary/40",
  "bg-ink/25",
  "bg-ink/18",
  "bg-ink/12",
];

export function BranchSalesDashboard({ className }: Props) {
  const { data: branchSales = [], isLoading } = useBranchSalesComparison("month");
  const { data: upcomingOrders = [], isLoading: upcomingLoading } = useUpcomingOrdersByBranch();

  const maxSales = branchSales[0]?.totalSales ?? 0;

  if (isLoading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Branch Sales Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (branchSales.length === 0) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Branch Sales Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
            <BarChart2 className="mb-2 h-8 w-8 text-ink-faint" />
            <p className="text-sm font-medium text-ink">No sales data yet</p>
            <p className="text-xs text-ink-faint">Sales will appear here once recorded.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          Branch Sales Performance
        </CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {branchSales.map((branch, index) => {
            const pct = maxSales > 0 ? (branch.totalSales / maxSales) * 100 : 0;
            return (
              <div key={branch.branchId} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className={cn("truncate font-medium", index === 0 ? "text-ink" : "text-ink-soft")}>
                    {branch.branchName}
                  </span>
                  <span className={cn("shrink-0 tabular-nums font-semibold", index === 0 ? "text-primary-dark" : "text-ink")}>
                    {formatCurrency(branch.totalSales)}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink/6">
                  <div
                    className={cn("h-full rounded-full transition-all", BAR_COLORS[index] ?? BAR_COLORS[5])}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <div className="mb-3 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary-dark" />
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Upcoming orders
            </p>
          </div>

          {upcomingLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : upcomingOrders.length === 0 ? (
            <p className="text-xs text-ink-faint">No upcoming orders scheduled.</p>
          ) : (
            <div className="space-y-2.5">
              {upcomingOrders.map((item) => (
                <div key={item.branchId} className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium text-ink">
                    {item.branchName}
                  </span>
                  <span className="shrink-0 text-xs text-ink-soft">
                    {item.count} {item.count === 1 ? "order" : "orders"}
                    <span className="mx-1 text-ink-faint">·</span>
                    <span className="tabular-nums text-ink">{formatCurrency(item.totalValue)}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
