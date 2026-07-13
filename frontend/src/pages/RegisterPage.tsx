import { ArrowRight, Building2, KeyRound, UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { getDefaultRouteForRole } from '@/auth/routes'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'

export function RegisterPage() {
  const { user, isLoading, register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isLoading && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const registeredUser = await register({
        name,
        email,
        password,
        role: 'OWNER',
      })

      navigate(getDefaultRouteForRole(registeredUser.role), { replace: true })
    } catch (exception) {
      setError(getErrorMessage(exception, 'Registration failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl page-panel lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="relative overflow-hidden bg-[#0a4033] p-8 text-white sm:p-10">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#b8ff68]/20 blur-3xl" />
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/12">
            <Building2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-normal text-[#b8ff68]">
            Owner setup
          </p>
          <h1 className="mt-3 max-w-md text-4xl font-semibold leading-tight">
            Create the account that owns rooms, tenants, contracts, and bills.
          </h1>
          <div className="mt-8 grid gap-4 text-sm text-white/76">
            <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.055] p-4">
              <UserPlus className="mt-0.5 h-4 w-4 shrink-0 text-[#b8ff68]" aria-hidden="true" />
              <p>Tenant accounts are created later from the tenant screen.</p>
            </div>
            <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.055] p-4">
              <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[#b8ff68]" aria-hidden="true" />
              <p>The backend returns a JWT, so you can start working immediately.</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="bg-white/78 p-6 sm:p-10">
        <p className="text-sm font-semibold text-secondary">Register owner</p>
        <h2 className="mt-2 text-3xl font-semibold text-foreground">
          Start a new rental workspace
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          Use a real email format and a password with at least six characters.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Name</span>
            <input
              className="field-control mt-2"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-foreground">Email</span>
            <input
              className="field-control mt-2"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-foreground">
              Password
            </span>
            <input
              className="field-control mt-2"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-[#efb7aa] bg-[#fff1ec] px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}

          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create owner account'}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted">
          Already have an account?{' '}
          <Link className="font-semibold text-primary hover:text-emerald-800" to="/login">
            Login
          </Link>
        </p>
      </div>
    </section>
  )
}
