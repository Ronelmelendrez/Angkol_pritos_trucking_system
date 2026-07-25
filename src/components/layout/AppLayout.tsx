import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { NAV_ITEMS } from "@/components/layout/navConfig"

/**
 * Main application layout.
 * - Desktop (md+): Sidebar (left, sticky) + Header + content area
 * - Mobile (<md): Header + content area + BottomTabNav + slide-in sidebar
 * Content area has bottom padding on mobile to account for the fixed bottom nav.
 */
export function AppLayout() {
  const location = useLocation()
  const title = NAV_ITEMS.find((item) => item.path === location.pathname)?.label ?? "Dashboard"

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — sticky on md+, overlay on mobile */}
      <Sidebar />

      {/* Main content column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4 md:px-6 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab navigation – hidden on md+ */}
      <MobileBottomNav />
    </div>
  )
}
