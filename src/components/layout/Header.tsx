import { useLocation } from "react-router-dom"
import { LogOut, User } from "lucide-react"
import { NAV_ITEMS } from "@/components/layout/navConfig"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { Avatar, AvatarFallback } from "@/components/ui/Avatar"
import { useAuth, useLogout } from "@/features/auth"

export function Header() {
  const location = useLocation()
  const { profile } = useAuth()
  const { logout } = useLogout()

  const currentPage = NAV_ITEMS.find((item) =>
    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
  )

  const initials = (profile?.full_name ?? "Manager")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm md:px-6">
      <h1 className="font-display text-xl font-semibold text-char-900">
        {currentPage?.label ?? "Dashboard"}
      </h1>

      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-char-900">
              {profile?.full_name ?? "Manager"}
            </p>
            <p className="text-xs text-muted-foreground">Manager account</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <User className="size-4" />
            Account settings
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => logout()}>
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}