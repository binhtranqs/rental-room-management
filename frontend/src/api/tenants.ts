import { apiClient } from '@/api/client'
import type { PageResponse } from '@/types/page'
import type {
  Tenant,
  TenantCreatePayload,
  TenantSearchParams,
  TenantUpdatePayload,
} from '@/types/tenant'

export async function getTenantsRequest(params: TenantSearchParams) {
  const response = await apiClient.get<PageResponse<Tenant>>('/tenants', {
    params: {
      keyword: params.keyword || undefined,
      page: params.page ?? 0,
      size: params.size ?? 10,
      sort: params.sort ?? 'createdAt,desc',
    },
  })

  return response.data
}

export async function getTenantRequest(id: number) {
  const response = await apiClient.get<Tenant>(`/tenants/${id}`)

  return response.data
}

export async function createTenantRequest(payload: TenantCreatePayload) {
  const response = await apiClient.post<Tenant>('/tenants', payload)

  return response.data
}

export async function updateTenantRequest(
  id: number,
  payload: TenantUpdatePayload,
) {
  const response = await apiClient.put<Tenant>(`/tenants/${id}`, payload)

  return response.data
}

export async function deleteTenantRequest(id: number) {
  await apiClient.delete(`/tenants/${id}`)
}
