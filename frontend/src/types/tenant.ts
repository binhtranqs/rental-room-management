export type Tenant = {
  id: number
  userId: number
  ownerId: number
  name: string
  email: string
  phone: string
  identityNumber: string
  emergencyContact: string | null
  createdAt: string
  updatedAt: string
}

export type TenantCreatePayload = {
  name: string
  email: string
  password: string
  phone: string
  identityNumber: string
  emergencyContact: string
}

export type TenantUpdatePayload = Omit<TenantCreatePayload, 'password'>

export type TenantSearchParams = {
  keyword?: string
  page?: number
  size?: number
  sort?: string
}
