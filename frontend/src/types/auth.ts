export type UserRole = 'ADMIN' | 'OWNER' | 'TENANT'

export type User = {
  id: number
  name: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type AuthResponse = {
  accessToken: string
  tokenType: 'Bearer'
}
