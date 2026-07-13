import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-md rounded-2xl page-panel p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-normal text-secondary">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-foreground">
        Page not found
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        This route is not part of the rental workspace.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Back home</Link>
      </Button>
    </section>
  )
}
