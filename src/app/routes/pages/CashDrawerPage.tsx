import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Wallet, ArrowDownLeft, ArrowUpRight, CircleDollarSign, Scale, PiggyBank, ShoppingBag } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatChip } from "@/components/ui/StatChip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { CashOpeningForm, CashCountForm } from "@/features/cash";
import { useDailyCash } from "@/features/cash/hooks/useDailyCash";
import { useBranches } from "@/features/branches";
import { todayISO, formatDate } from "@/utils/date";
import { formatCurrency } from "@/utils/currency";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function CashDrawerPage() {
  const { user } = useAuth();
  const isEmployee = user?.role === "staff";
  const { branchId: urlBranchId } = useParams<{ branchId?: string }>();
  const navigate = useNavigate();
  const { data: branches = [] } = useBranches();

  // Resolve branch: staff = their branch, manager = URL param or first active branch
  const activeBranches = branches.filter((b) => b.isActive);
  const resolvedBranchId = isEmployee
    ? (user?.branchId ?? "")
    : (urlBranchId ?? activeBranches[0]?.id ?? "");

  const [date, setDate] = useState(todayISO);
  const { data, isLoading } = useDailyCash(date, resolvedBranchId);

  function handleBranchChange(newBranchId: string) {
    navigate(`/dashboard/cash/${newBranchId}`, { replace: true });
  }

  // Employee: only show opening cash form
  if (isEmployee) {
    return (
      <div className="space-y-5">
        <Card>
          <CardHeader className="flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Opening cash</CardTitle>
              <CardDescription>Set the starting cash for today's shift.</CardDescription>
            </div>
            <div className="w-full max-w-52">
              <Label htmlFor="cash-date">Business day</Label>
              <Input id="cash-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </CardHeader>
          <div className="px-6 pb-6">
            <CashOpeningForm date={date} branchId={resolvedBranchId} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
        <Card>
          <CardHeader className="flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Cash drawer</CardTitle>
              <CardDescription>
                Record the day's opening cash at the start of your shift and submit the closing cash count at the end.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-full max-w-52">
                <Label htmlFor="cash-date">Business day</Label>
                <Input id="cash-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="w-full max-w-52">
                <Label>Branch</Label>
                <Select value={resolvedBranchId} onValueChange={handleBranchChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeBranches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-[68px] w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          <StatChip label="Opening cash" value={formatCurrency(data.openingCash ?? 0)} icon={Wallet} />
          <StatChip label="Cash in" value={formatCurrency(data.totalCashIn)} icon={ArrowDownLeft} tone="success" />
          {data.orderDeposits > 0 && (
            <StatChip label="Order deposits" value={formatCurrency(data.orderDeposits)} icon={ShoppingBag} tone="primary" />
          )}
          <StatChip label="Cash out" value={formatCurrency(data.totalCashOut)} icon={ArrowUpRight} tone="danger" />
          <StatChip label="Expected cash" value={formatCurrency(data.expectedCash)} icon={PiggyBank} tone="primary" />
          <StatChip label="Actual cash" value={data.actualCash != null ? formatCurrency(data.actualCash) : "—"} icon={CircleDollarSign} />
          <StatChip
            label="Difference"
            value={data.difference != null ? formatCurrency(data.difference) : "—"}
            icon={Scale}
            tone={data.difference != null && data.difference !== 0 ? "danger" : undefined}
          />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-primary-dark" />
              <div>
                <CardTitle>Opening cash</CardTitle>
                <CardDescription>{formatDate(date)}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <div className="p-6 pt-0">
            <CashOpeningForm date={date} branchId={resolvedBranchId} />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Closing cash count</CardTitle>
              <CardDescription>Reconcile the drawer at end of day · {formatDate(date)}</CardDescription>
            </div>
          </CardHeader>
          <div className="p-6 pt-0">
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <CashCountForm date={date} branchId={resolvedBranchId} expectedCash={data.expectedCash} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
