import { LayoutDashboard } from 'lucide-react'

import { useAuth } from '@/auth/useAuth'

export function OwnerDashboardPlaceholderPage() {
  const { user } = useAuth()

  return (
    <section className="rounded-md border border-border bg-card p-6 shadow-sm">
      <LayoutDashboard className="mb-4 h-6 w-6 text-primary" aria-hidden="true" />
      <p className="text-sm font-semibold uppercase text-secondary">
        Owner dashboard
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">
        Welcome, {user?.name}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Day 17 will connect this page to the owner dashboard API and render
        room, contract, bill, and revenue metrics.
      </p>
    </section>
  )
}
