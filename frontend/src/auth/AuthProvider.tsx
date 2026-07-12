import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { getCurrentUserRequest, loginRequest } from '@/api/auth'
import {
  clearAccessToken,
  getAccessToken,
  saveAccessToken,
} from '@/api/client'
import { AuthContext } from '@/auth/auth-context'
import type { LoginPayload, User } from '@/types/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    clearAccessToken()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null)
      setIsLoading(false)
      return null
    }

    try {
      const currentUser = await getCurrentUserRequest()
      setUser(currentUser)
      return currentUser
    } catch {
      logout()
      return null
    } finally {
      setIsLoading(false)
    }
  }, [logout])

  const login = useCallback(async (payload: LoginPayload) => {
    const auth = await loginRequest(payload)
    saveAccessToken(auth.accessToken)

    const currentUser = await getCurrentUserRequest()
    setUser(currentUser)

    return currentUser
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
