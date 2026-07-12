import { LockKeyhole } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function LoginPlaceholderPage() {
  return (
    <section className="mx-auto max-w-md rounded-md border border-border bg-card p-6 shadow-sm">
      <LockKeyhole className="mb-4 h-6 w-6 text-primary" aria-hidden="true" />
      <h1 className="text-2xl font-semibold text-foreground">Login</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Auth store, role redirects, and protected routes are scheduled for Day 16.
      </p>
      <Button className="mt-6 w-full" disabled>
        Coming next
      </Button>
    </section>
  )
}
