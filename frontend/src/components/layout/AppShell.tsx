import { Building2 } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function AppShell() {
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
            <Button asChild size="sm">
              <Link to="/login">Login</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
