import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-md rounded-md border border-border bg-card p-6 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase text-secondary">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">
        Page not found
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        The route does not exist yet.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Back home</Link>
      </Button>
    </section>
  )
}
