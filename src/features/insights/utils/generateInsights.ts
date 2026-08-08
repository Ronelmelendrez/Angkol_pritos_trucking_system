import { formatCurrency, formatQty } from "@/utils/currency";
import { isLossReason } from "@/features/inventory/utils/reasonMeta";
import type { Insight, InsightsData } from "../types";

/** Percent change from previous period; null when there's no meaningful baseline. */
function pctChange(current: number, previous: number): number | null {
  if (previous > 0) return Math.round(((current - previous) / previous) * 100);
  if (current > 0) return null;
  return 0;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export function generateInsights(data: InsightsData): Insight[] {
  const {
    sales,
    expenses,
    attendance,
    employees,
    products,
    advances,
    loans,
    payroll,
    stock,
    adjustments,
    prevPeriodSales,
    prevPeriodExpenses,
    defaultReorderThreshold,
  } = data;

  const insights: Insight[] = [];

  const periodSales = sales.reduce((sum, s) => sum + s.amount, 0);
  const periodExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Sales trend vs previous period
  const salesPct = pctChange(periodSales, prevPeriodSales);
  if (salesPct !== null && Math.abs(salesPct) >= 5) {
    const up = salesPct >= 0;
    insights.push({
      id: "sales-trend",
      title: up ? "Sales are growing" : "Sales are down",
      message: `Sales ${up ? "rose" : "dropped"} ${Math.abs(salesPct)}% versus the previous period (${formatCurrency(periodSales)} vs ${formatCurrency(prevPeriodSales)}).`,
      tone: up ? "positive" : "warning",
      category: "sales",
      link: "/dashboard/sales",
      priority: up ? 20 : 10,
    });
  }

  // Thin profit margin
  if (periodSales > 0) {
    const margin = ((periodSales - periodExpenses) / periodSales) * 100;
    if (margin < 20) {
      const costShare = periodExpenses >= periodSales
        ? "spending has caught up with revenue"
        : `expenses are eating ${((periodExpenses / periodSales) * 100).toFixed(0)}% of revenue`;
      insights.push({
        id: "margin",
        title: "Thin profit margin",
        message: `Profit margin is at ${margin.toFixed(1)}% this period — ${costShare}.`,
        tone: "warning",
        category: "profit",
        link: "/dashboard/expenses",
        priority: 11,
      });
    }
  }

  // Best-selling product
  if (sales.length > 0) {
    const byProduct = new Map<string, { total: number; qty: number }>();
    for (const s of sales) {
      const cur = byProduct.get(s.productId) ?? { total: 0, qty: 0 };
      cur.total += s.amount;
      cur.qty += s.quantitySold;
      byProduct.set(s.productId, cur);
    }
    const productNames = new Map(products.map((p) => [p.id, p.name]));
    const top = Array.from(byProduct.entries()).sort((a, b) => b[1].total - a[1].total)[0];
    if (top && top[1].total > 0) {
      insights.push({
        id: "best-product",
        title: `${productNames.get(top[0]) ?? "Your top product"} is the top seller`,
        message: `Brought in ${formatCurrency(top[1].total)} across ${plural(top[1].qty, "unit")} this period.`,
        tone: "positive",
        category: "sales",
        link: "/dashboard/products",
        priority: 21,
      });
    }
  }

  // Expense spike vs previous period
  const expensePct = pctChange(periodExpenses, prevPeriodExpenses);
  if (expensePct !== null && expensePct >= 15) {
    insights.push({
      id: "expense-spike",
      title: "Expenses are up sharply",
      message: `Spending rose ${expensePct}% versus the previous period (${formatCurrency(periodExpenses)} total).`,
      tone: "warning",
      category: "expenses",
      link: "/dashboard/expenses",
      priority: 12,
    });
  }

  // Biggest cost driver + fuel share
  const byCategory = new Map<string, number>();
  for (const e of expenses) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);

  if (byCategory.size > 0) {
    const topCat = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1])[0];
    const share = (topCat[1] / periodExpenses) * 100;
    insights.push({
      id: "top-cost-driver",
      title: `${topCat[0]} is your biggest cost`,
      message: `Accounts for ${formatCurrency(topCat[1])} — ${share.toFixed(0)}% of total expenses this period.`,
      tone: share >= 40 ? "warning" : "neutral",
      category: "expenses",
      link: "/dashboard/expenses",
      priority: share >= 40 ? 13 : 40,
    });

    const fuel = byCategory.get("Fuel & Energy") ?? 0;
    const fuelShare = (fuel / periodExpenses) * 100;
    if (fuelShare >= 40) {
      insights.push({
        id: "fuel-share",
        title: "Fuel is consuming the budget",
        message: `Fuel & Energy makes up ${fuelShare.toFixed(0)}% of expenses this period (${formatCurrency(fuel)}).`,
        tone: "warning",
        category: "expenses",
        link: "/dashboard/expenses",
        priority: 14,
      });
    }
  }

  // Crew attendance rate + most absent employee
  let present = 0;
  let absent = 0;
  const perEmployee = new Map<string, { present: number; absent: number }>();
  for (const r of attendance) {
    const cur = perEmployee.get(r.employeeId) ?? { present: 0, absent: 0 };
    if (r.status === "absent") {
      absent++;
      cur.absent++;
    } else if (r.status === "present" || r.clockIn !== null) {
      present++;
      cur.present++;
    }
    perEmployee.set(r.employeeId, cur);
  }

  const attendanceTotal = present + absent;
  if (attendanceTotal >= 5) {
    const rate = (present / attendanceTotal) * 100;
    if (rate < 85) {
      insights.push({
        id: "attendance-rate",
        title: "Attendance is slipping",
        message: `Crew attendance is at ${rate.toFixed(0)}% over the period (${plural(absent, "absence")}).`,
        tone: "warning",
        category: "attendance",
        link: "/dashboard/attendance",
        priority: 15,
      });
    }

    const employeeNames = new Map(employees.map((e) => [e.id, e.name]));
    const worst = Array.from(perEmployee.entries())
      .filter(([, c]) => c.absent > 0)
      .sort((a, b) => b[1].absent - a[1].absent)[0];
    if (worst) {
      insights.push({
        id: "worst-attendance",
        title: `${employeeNames.get(worst[0]) ?? "An employee"} has missed the most days`,
        message: `${plural(worst[1].absent, "absence")} recorded this period.`,
        tone: "warning",
        category: "attendance",
        link: "/dashboard/attendance",
        priority: 16,
      });
    }
  }

  // Labor cost ratio
  const payrollTotal = payroll.reduce((sum, p) => sum + p.grossPay, 0);
  if (periodSales > 0 && payrollTotal > 0) {
    const ratio = (payrollTotal / periodSales) * 100;
    if (ratio > 40) {
      insights.push({
        id: "labor-ratio",
        title: "Labor costs are high",
        message: `Payroll is ${ratio.toFixed(0)}% of sales for the period (${formatCurrency(payrollTotal)} paid).`,
        tone: "warning",
        category: "payroll",
        link: "/dashboard/payroll",
        priority: 17,
      });
    }
  }

  // Outstanding advances + loans
  const pendingAdvances = advances
    .filter((a) => a.status === "pending")
    .reduce((sum, a) => sum + a.amount, 0);
  const activeLoans = loans
    .filter((l) => l.status === "active")
    .reduce((sum, l) => sum + l.remainingBalance, 0);
  const outstanding = pendingAdvances + activeLoans;
  if (outstanding > 0) {
    insights.push({
      id: "outstanding",
      title: "Cash tied up in advances & loans",
      message: `Total outstanding is ${formatCurrency(outstanding)} — ${formatCurrency(pendingAdvances)} in advances and ${formatCurrency(activeLoans)} in loans.`,
      tone: "neutral",
      category: "cashflow",
      link: "/dashboard/loans",
      priority: 50,
    });
  }

  // Low stock
  const productMap = new Map(products.map((p) => [p.id, p]));
  const low = stock
    .filter((s) => {
      const threshold = productMap.get(s.productId)?.reorderThreshold ?? defaultReorderThreshold;
      return s.closingQty <= threshold || s.closingQty <= 0;
    })
    .sort((a, b) => a.closingQty - b.closingQty);
  if (low.length > 0) {
    const names = low.slice(0, 3).map((s) => s.productName).join(", ");
    const rest = low.length - 3;
    insights.push({
      id: "low-stock",
      title: "Low stock alert",
      message: `${plural(low.length, "product")} at or below reorder level — ${names}${rest > 0 ? ` (+${rest} more)` : ""}.`,
      tone: "warning",
      category: "inventory",
      link: "/dashboard/inventory",
      priority: 18,
    });
  }

  // Inventory losses
  const losses = adjustments.filter((a) => isLossReason(a.reason));
  if (losses.length > 0) {
    const lossQty = losses.reduce((sum, a) => sum + a.quantity, 0);
    const names = Array.from(new Set(losses.slice(0, 3).map((a) => a.productName))).join(", ");
    insights.push({
      id: "inventory-losses",
      title: "Inventory losses detected",
      message: `${plural(losses.length, "loss")} logged (${formatQty(lossQty)} ${lossQty === 1 ? "unit" : "units"}) — mostly ${names}.`,
      tone: "warning",
      category: "inventory",
      link: "/dashboard/inventory",
      priority: 19,
    });
  }

  // Slow-moving stock (stock on hand but no sales this period)
  if (sales.length > 0) {
    const soldThisPeriod = new Set(sales.map((s) => s.productId));
    const slow = stock
      .filter((s) => !soldThisPeriod.has(s.productId) && s.closingQty > 0)
      .sort((a, b) => b.closingQty - a.closingQty)
      .slice(0, 3);
    if (slow.length > 0) {
      const items = slow.map((s) => `${s.productName} (${formatQty(s.closingQty)} ${s.unit})`).join(", ");
      insights.push({
        id: "slow-movers",
        title: "Slow-moving stock",
        message: `${items} ${slow.length === 1 ? "has" : "have"} stock but sold nothing this period.`,
        tone: "neutral",
        category: "inventory",
        link: "/dashboard/inventory",
        priority: 51,
      });
    }
  }

  return insights.sort((a, b) => a.priority - b.priority);
}
