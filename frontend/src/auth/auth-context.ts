import { createContext } from 'react'

import type { LoginPayload, RegisterPayload, User } from '@/types/auth'

export type AuthContextValue = {
  user: User | null
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => void
  refreshUser: () => Promise<User | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
