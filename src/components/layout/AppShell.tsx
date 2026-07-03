import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/expenses": "Expenses",
  "/employees": "Employees",
  "/attendance": "Attendance",
  "/advances": "Cash Advances",
  "/loans": "Loans (Utang)",
  "/reports": "Reports",
};

export function AppShell() {
  const location = useLocation();
  const title = TITLES[location.pathname] ?? "Manong's Grill";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}