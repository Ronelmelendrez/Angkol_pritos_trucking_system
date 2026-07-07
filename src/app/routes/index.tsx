import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { LoginPage } from "@/app/routes/pages/LoginPage"
import { DashboardPage } from "@/app/routes/pages/DashboardPage"
import { SalesPage } from "@/app/routes/pages/SalesPage"
import { ProductsPage } from "@/app/routes/pages/ProductsPage"
import { ExpensesPage } from "@/app/routes/pages/ExpensesPage"
import { EmployeesPage } from "@/app/routes/pages/EmployeesPage"
import { AttendancePage } from "@/app/routes/pages/AttendancePage"
import { AdvancesPage } from "@/app/routes/pages/AdvancesPage"
import { LoansPage } from "@/app/routes/pages/LoansPage"
import { PayrollPage } from "@/app/routes/pages/PayrollPage"
import { ReportsPage } from "@/app/routes/pages/ReportsPage"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "sales", element: <SalesPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "expenses", element: <ExpensesPage /> },
      { path: "employees", element: <EmployeesPage /> },
      { path: "attendance", element: <AttendancePage /> },
      { path: "advances", element: <AdvancesPage /> },
      { path: "loans", element: <LoansPage /> },
      { path: "payroll", element: <PayrollPage /> },
      { path: "reports", element: <ReportsPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])