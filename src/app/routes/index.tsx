import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { LoginPage } from "@/app/routes/pages/LoginPage"
import { DashboardPage } from "@/app/routes/pages/DashboardPage"
import { ExpensesPage } from "@/app/routes/pages/ExpensesPage"
import { EmployeesPage } from "@/app/routes/pages/EmployeesPage"
import { AttendancePage } from "@/app/routes/pages/AttendancePage"
import { AdvancesPage } from "@/app/routes/pages/AdvancesPage"
import { LoansPage } from "@/app/routes/pages/LoansPage"
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
      { path: "expenses", element: <ExpensesPage /> },
      { path: "employees", element: <EmployeesPage /> },
      { path: "attendance", element: <AttendancePage /> },
      { path: "advances", element: <AdvancesPage /> },
      { path: "loans", element: <LoansPage /> },
      { path: "reports", element: <ReportsPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])