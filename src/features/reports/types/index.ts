export interface CategoryBreakdown {
  category: string;
  total: number;
  color: string;
}

export interface DailyProfitPoint {
  date: string;
  label: string;
  expenses: number;
  sales: number;
  profit: number;
}

export interface RevenueByProduct {
  productId: string;
  productName: string;
  total: number;
  quantity: number;
}

export interface PayrollRow {
  employeeId: string;
  name: string;
  hoursWorked: number;
  dailyRate: number;
  grossPay: number;
  pendingAdvances: number;
  netPay: number;
}