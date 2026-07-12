import { apiClient } from '@/api/client'
import type { AuthResponse, LoginPayload, User } from '@/types/auth'

export async function loginRequest(payload: LoginPayload) {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload)

  return response.data
}

export async function getCurrentUserRequest() {
  const response = await apiClient.get<User>('/auth/me')

  return response.data
}
