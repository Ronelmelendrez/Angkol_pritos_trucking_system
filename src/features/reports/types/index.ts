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

export interface PayrollRow {
  employeeId: string;
  name: string;
  hoursWorked: number;
  hourlyRate: number;
  grossPay: number;
  pendingAdvances: number;
  netPay: number;
}