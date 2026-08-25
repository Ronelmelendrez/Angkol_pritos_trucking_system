import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { LoginPage } from "@/app/routes/pages/LoginPage"
import { LandingPage } from "@/app/routes/pages/LandingPage"
import { DashboardPage } from "@/app/routes/pages/DashboardPage"
import { SalesPage } from "@/app/routes/pages/SalesPage"
import { ProductsPage } from "@/app/routes/pages/ProductsPage"
import { ExpensesPage } from "@/app/routes/pages/ExpensesPage"
import { InventoryPage } from "@/app/routes/pages/InventoryPage"
import { EmployeesPage } from "@/app/routes/pages/EmployeesPage"
import { BranchesPage } from "@/app/routes/pages/BranchesPage"
import { AttendancePage } from "@/app/routes/pages/AttendancePage"
import { AdvancesPage } from "@/app/routes/pages/AdvancesPage"
import { LoansPage } from "@/app/routes/pages/LoansPage"
import { CashDrawerPage } from "@/app/routes/pages/CashDrawerPage"
import { WithdrawalsPage } from "@/app/routes/pages/WithdrawalsPage"
import { PayrollPage } from "@/app/routes/pages/PayrollPage"
import { ReportsPage } from "@/app/routes/pages/ReportsPage"
import { SettingsPage } from "@/app/routes/pages/SettingsPage"
import { EmployeeDashboardPage } from "@/app/routes/pages/EmployeeDashboardPage"
import { EmployeeOrdersPage } from "@/app/routes/pages/EmployeeOrdersPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  // Manager routes
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["manager"]}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "sales", element: <SalesPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "expenses", element: <ExpensesPage /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "employees", element: <EmployeesPage /> },
      { path: "branches", element: <BranchesPage /> },
      { path: "attendance", element: <AttendancePage /> },
      { path: "advances", element: <AdvancesPage /> },
      { path: "loans", element: <LoansPage /> },
      { path: "cash", element: <CashDrawerPage /> },
      { path: "withdrawals", element: <WithdrawalsPage /> },
      { path: "payroll", element: <PayrollPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  // Employee routes
  {
    path: "/employee",
    element: (
      <ProtectedRoute allowedRoles={["staff"]}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
        { index: true, element: <EmployeeDashboardPage /> },
        { path: "orders", element: <EmployeeOrdersPage /> },
        { path: "expenses", element: <ExpensesPage /> },
      { path: "attendance", element: <AttendancePage /> },
      { path: "advances", element: <AdvancesPage /> },
      { path: "cash", element: <CashDrawerPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])
