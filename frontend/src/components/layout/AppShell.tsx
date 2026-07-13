import {
  Building2,
  DoorOpen,
  FileSignature,
  LogOut,
  ReceiptText,
  Users,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

import { getDefaultRouteForRole } from '@/auth/routes'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ownerLinks = [
  { to: '/owner/rooms', label: 'Rooms', icon: DoorOpen },
  { to: '/owner/tenants', label: 'Tenants', icon: Users },
  { to: '/owner/contracts', label: 'Contracts', icon: FileSignature },
  { to: '/owner/bills', label: 'Bills', icon: ReceiptText },
]

export function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold transition-all duration-200',
      isActive
        ? 'bg-[#0b4a3a] text-white shadow-sm shadow-emerald-950/15'
        : 'text-muted hover:bg-white/70 hover:text-foreground',
    )

  if (location.pathname === '/') {
    return (
      <div className="min-h-screen bg-transparent">
        <a
          href="#rental-room"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <Outlet />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-[#1b342b]/10 bg-[#f4efe3]/88 shadow-sm shadow-stone-900/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0b4a3a] text-primary-foreground shadow-sm shadow-emerald-950/20">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-bold leading-5 text-foreground">
                Rental Room
              </span>
              <span className="block text-xs font-medium text-muted">
                property operations
              </span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            {user ? (
              <>
                <NavLink to={getDefaultRouteForRole(user.role)} className={navLinkClass}>
                  Dashboard
                </NavLink>
                {user.role === 'OWNER' ? (
                  ownerLinks.map((item) => (
                    <NavLink key={item.to} to={item.to} className={navLinkClass}>
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  ))
                ) : null}
                {user.role === 'TENANT' ? (
                  <NavLink to="/tenant/bills" className={navLinkClass}>
                    <ReceiptText className="h-4 w-4" aria-hidden="true" />
                    Bills
                  </NavLink>
                ) : null}
                <span className="surface-chip hidden h-8 px-3 text-xs font-semibold sm:inline-flex">
                  {user.name} · {user.role}
                </span>
                <Button type="button" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="secondary" size="sm">
                  <Link to="/register-owner">Register owner</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/login">Login</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:py-10">
        <Outlet />
      </main>
    </div>
  )
}
