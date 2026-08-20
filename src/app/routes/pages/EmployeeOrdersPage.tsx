import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { OrdersList, OrderStats, OrderForm } from "@/features/orders";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatCurrency } from "@/utils/currency";
import { type OrderStatus } from "@/lib/constants";

const STATUS_FILTERS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export function EmployeeOrdersPage() {
  const { data: orders = [] } = useOrders();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const myOrders = useMemo(() => orders.filter((o) => !user?.id || o.createdBy === user.id), [orders, user]);

  const filtered = useMemo(() => {
    return myOrders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.customerName.toLowerCase().includes(q) && !o.notes?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [myOrders, statusFilter, search]);

  const totalSales = filtered.reduce((sum, o) => sum + o.total, 0);

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

        <div className="flex flex-wrap items-center gap-3 px-6 pb-4">
          <input
            type="text"
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-line bg-bg px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-primary/10 text-primary-dark"
                    : "text-ink-soft hover:bg-ink/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <OrdersList orders={filtered} />
    </div>
  );
}
