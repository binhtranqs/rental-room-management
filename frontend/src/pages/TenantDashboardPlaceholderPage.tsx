import { ReceiptText } from 'lucide-react'

import { useAuth } from '@/auth/useAuth'

export function TenantDashboardPlaceholderPage() {
  const { user } = useAuth()

  return (
    <section className="rounded-md border border-border bg-card p-6 shadow-sm">
      <ReceiptText className="mb-4 h-6 w-6 text-primary" aria-hidden="true" />
      <p className="text-sm font-semibold uppercase text-secondary">
        Tenant dashboard
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">
        Welcome, {user?.name}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Tenant bill and payment screens are scheduled after the owner workflows.
      </p>
    </section>
  )
}
