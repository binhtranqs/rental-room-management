import type { UserRole } from '@/types/auth'

export function getDefaultRouteForRole(role: UserRole) {
  if (role === 'OWNER') {
    return '/owner/dashboard'
  }

  if (role === 'TENANT') {
    return '/tenant/dashboard'
  }

  return '/admin'
}
