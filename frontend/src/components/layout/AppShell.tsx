import {
  Building2,
  DoorOpen,
  FileSignature,
  LogOut,
  ReceiptText,
  Users,
} from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import { getDefaultRouteForRole } from '@/auth/routes'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/button'

export function AppShell() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-base font-semibold text-foreground">
              Rental Room
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Home</Link>
            </Button>
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to={getDefaultRouteForRole(user.role)}>Dashboard</Link>
                </Button>
                {user.role === 'OWNER' ? (
                  <>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/owner/rooms">
                        <DoorOpen className="h-4 w-4" aria-hidden="true" />
                        Rooms
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/owner/tenants">
                        <Users className="h-4 w-4" aria-hidden="true" />
                        Tenants
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/owner/contracts">
                        <FileSignature className="h-4 w-4" aria-hidden="true" />
                        Contracts
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/owner/bills">
                        <ReceiptText className="h-4 w-4" aria-hidden="true" />
                        Bills
                      </Link>
                    </Button>
                  </>
                ) : null}
                {user.role === 'TENANT' ? (
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/tenant/bills">
                      <ReceiptText className="h-4 w-4" aria-hidden="true" />
                      Bills
                    </Link>
                  </Button>
                ) : null}
                <Button type="button" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </Button>
              </>
            ) : (
              <Button asChild size="sm">
                <Link to="/login">Login</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
