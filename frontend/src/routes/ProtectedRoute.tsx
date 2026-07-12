import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/auth/useAuth'
import type { UserRole } from '@/types/auth'

type ProtectedRouteProps = {
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="rounded-md border border-border bg-card p-6 text-sm text-muted shadow-sm">
        Loading session...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
