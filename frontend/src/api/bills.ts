import { apiClient } from '@/api/client'
import type { Bill, BillSearchParams } from '@/types/bill'
import type { PageResponse } from '@/types/page'

export async function getBillsRequest(params: BillSearchParams) {
  const response = await apiClient.get<PageResponse<Bill>>('/bills', {
    params: {
      keyword: params.keyword || undefined,
      status: params.status || undefined,
      month: params.month || undefined,
      page: params.page ?? 0,
      size: params.size ?? 10,
      sort: params.sort ?? 'createdAt,desc',
    },
  })

  return response.data
}

export async function getBillRequest(id: number) {
  const response = await apiClient.get<Bill>(`/bills/${id}`)

  return response.data
}

export async function markBillPaidRequest(id: number) {
  const response = await apiClient.patch<Bill>(`/bills/${id}/mark-paid`)

  return response.data
}
