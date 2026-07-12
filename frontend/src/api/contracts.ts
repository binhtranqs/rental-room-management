import { apiClient } from '@/api/client'
import type {
  Contract,
  ContractPayload,
  ContractSearchParams,
} from '@/types/contract'
import type { PageResponse } from '@/types/page'

export async function getContractsRequest(params: ContractSearchParams) {
  const response = await apiClient.get<PageResponse<Contract>>('/contracts', {
    params: {
      keyword: params.keyword || undefined,
      status: params.status || undefined,
      page: params.page ?? 0,
      size: params.size ?? 10,
      sort: params.sort ?? 'createdAt,desc',
    },
  })

  return response.data
}

export async function getContractRequest(id: number) {
  const response = await apiClient.get<Contract>(`/contracts/${id}`)

  return response.data
}

export async function createContractRequest(payload: ContractPayload) {
  const response = await apiClient.post<Contract>('/contracts', payload)

  return response.data
}

export async function endContractRequest(id: number) {
  const response = await apiClient.patch<Contract>(`/contracts/${id}/end`)

  return response.data
}
