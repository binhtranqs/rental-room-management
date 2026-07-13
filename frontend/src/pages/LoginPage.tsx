import { ArrowRight, Building2, LogIn, ReceiptText } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { getDefaultRouteForRole } from '@/auth/routes'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'

type LocationState = {
  from?: {
    pathname?: string
  }
}

export function LoginPage() {
  const { user, isLoading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
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
      const loggedInUser = await login({ email, password })
      const state = location.state as LocationState | null
      const fallbackRoute = getDefaultRouteForRole(loggedInUser.role)
      const nextRoute = state?.from?.pathname ?? fallbackRoute

      navigate(nextRoute, { replace: true })
    } catch (exception) {
      setError(getErrorMessage(exception, 'Login failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl page-panel lg:grid-cols-[0.92fr_1.08fr]">
      <aside className="relative overflow-hidden bg-[#0a4033] p-8 text-white sm:p-10">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#b8ff68]/20 blur-3xl" />
        <div className="relative">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/12">
            <Building2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-8 text-xs font-semibold uppercase tracking-normal text-[#b8ff68]">
            Rental Room
          </p>
          <h1 className="mt-3 max-w-md text-4xl font-semibold leading-tight">
            Back to your rental operations.
          </h1>
          <div className="mt-8 grid gap-4 text-sm text-white/74">
            <div className="rounded-xl border border-white/10 bg-white/[0.055] p-4">
              Owners manage rooms, tenants, contracts, bills, and payment follow-up.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] p-4">
              Tenants review their own bills and payment history.
            </div>
          </div>
        </div>
      </aside>

      <div className="bg-white/78 p-6 sm:p-10">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#eff8d2] text-[#0b4a3a]">
          <LogIn className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-3xl font-semibold text-foreground">Login</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          Use an owner account to manage rooms, or a tenant account to review and
          pay bills.
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
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
            <span className="text-sm font-semibold text-foreground">Password</span>
            <input
              className="field-control mt-2"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-[#efb7aa] bg-[#fff1ec] px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-3 rounded-xl bg-[#f4efe3]/80 p-4 text-sm text-muted">
          <ReceiptText className="h-4 w-4 shrink-0 text-[#0b4a3a]" aria-hidden="true" />
          <p>
            Need an owner account?{' '}
            <Link className="font-semibold text-primary hover:text-emerald-800" to="/register-owner">
              Register owner
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
