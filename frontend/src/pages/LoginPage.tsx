import { AxiosError } from 'axios'
import { LogIn } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { getDefaultRouteForRole } from '@/auth/routes'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/button'

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
      if (exception instanceof AxiosError) {
        setError(exception.response?.data?.message ?? 'Login failed')
      } else {
        setError('Login failed')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-md border border-border bg-card p-6 shadow-sm">
      <LogIn className="mb-4 h-6 w-6 text-primary" aria-hidden="true" />
      <h1 className="text-2xl font-semibold text-foreground">Login</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Use your owner or tenant account from the backend API.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-foreground">Email</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">Password</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </section>
  )
}
