import { ArrowRight, Database, DoorOpen, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

const features = [
  {
    title: 'Owner workspace',
    description: 'Rooms, tenants, contracts, bills, and payments share one flow.',
    icon: DoorOpen,
  },
  {
    title: 'Backend ready',
    description: 'JWT auth, role access, PostgreSQL, Redis, Swagger, and tests are in place.',
    icon: Database,
  },
  {
    title: 'Role first',
    description: 'Owner and tenant screens will be split cleanly from the start.',
    icon: ShieldCheck,
  },
]

export function HomePage() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <div className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase text-secondary">
            Frontend foundation
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Rental room management starts here.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted">
            React, Vite, TypeScript, Tailwind, routing, and API client are wired
            so the next days can focus on real screens.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/login">
              Continue to login
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <a href="http://localhost:8080/swagger-ui/index.html">
              Backend docs
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-md border border-border bg-card p-5 shadow-sm"
          >
            <feature.icon className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
