import { useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { startOfWeek } from "date-fns/startOfWeek";
import { endOfWeek } from "date-fns/endOfWeek";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { DatePresets, type DatePreset } from "@/components/ui/DatePresets";
import { TransactionViewTabs } from "@/components/layout/TransactionViewTabs";
import { OrdersList } from "@/features/orders/components/OrdersList";
import { OrderGridCard } from "@/features/orders/components/OrderGridCard";
import { OrderForm } from "@/features/orders/components/OrderForm";
import { OrderFiltersBar } from "@/features/orders/components/OrderFilters";
import { OrderStats } from "@/features/orders/components/OrderStats";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { formatCurrency } from "@/utils/currency";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "#F59E0B",
  confirmed: "#3B82F6",
  completed: "#22C55E",
  cancelled: "#EF4444",
};

export function EmployeeOrdersPage() {
  const { data: orders = [] } = useOrders();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [datePreset, setDatePreset] = useState<DatePreset>("this-month");
  const [customFrom, setCustomFrom] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customTo, setCustomTo] = useState(format(new Date(), "yyyy-MM-dd"));

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const dateFrom = useMemo(() => {
    switch (datePreset) {
      case "today": return todayStr;
      case "this-week": return format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "this-month": return format(startOfMonth(today), "yyyy-MM-dd");
      case "custom": return customFrom;
    }
  }, [datePreset, customFrom, todayStr]);

  const dateTo = useMemo(() => {
    switch (datePreset) {
      case "today": return todayStr;
      case "this-week": return format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "this-month": return format(endOfMonth(today), "yyyy-MM-dd");
      case "custom": return customTo;
    }
  }, [datePreset, customTo, todayStr]);

  const myOrders = useMemo(() => orders.filter((o) => !user?.id || o.createdBy === user.id), [orders, user]);

  const filtered = useMemo(() => {
    return myOrders.filter((o) => {
      if (dateFrom && o.date < dateFrom) return false;
      if (dateTo && o.date > dateTo) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.customerName.toLowerCase().includes(q) && !o.notes?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [myOrders, dateFrom, dateTo, statusFilter, search]);

  const totalSales = filtered.reduce((sum, o) => sum + o.total, 0);

  const renderTable = useCallback(
    (data: typeof filtered) => <OrdersList orders={data} />,
    [],
  );

  const renderGridCard = useCallback(
    (order: typeof filtered[number]) => <OrderGridCard order={order} />,
    [],
  );

  return (
    <div className="space-y-5">
      <OrderStats orders={myOrders} />

      <Card>
        <CardHeader>
          <div className="min-w-0 flex-1">
            <CardTitle>All Orders</CardTitle>
            <CardDescription>
              {filtered.length} order{filtered.length === 1 ? "" : "s"} · Total{" "}
              <span className="font-semibold text-ink">{formatCurrency(totalSales)}</span>
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Schedule order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule a new order</DialogTitle>
              </DialogHeader>
              <OrderForm onDone={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardHeader>

        <div className="mb-4">
          <OrderFiltersBar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </div>

        <TransactionViewTabs
          data={filtered}
          isLoading={false}
          getDate={(o) => o.date}
          getAmount={(o) => o.total}
          renderTable={renderTable}
          renderGridCard={renderGridCard}
          groupedTabLabel="By Status"
          getGroupKey={(o) => o.status}
          getGroupLabel={(key) => ORDER_STATUS_LABELS[key as OrderStatus] ?? key}
          getGroupColor={(key) => STATUS_COLORS[key as OrderStatus] ?? "#888"}
          emptyMessage="No orders match these filters"
          filters={
            <DatePresets
              value={datePreset}
              onChange={setDatePreset}
              customFrom={customFrom}
              customTo={customTo}
              onCustomFromChange={setCustomFrom}
              onCustomToChange={setCustomTo}
            />
          }
        />
      </Card>
    </div>
  );
}
