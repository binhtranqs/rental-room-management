import { apiClient } from '@/api/client'
import type { Payment, PaymentMethod } from '@/types/payment'

export async function createMockPaymentRequest(
  billId: number,
  method: PaymentMethod,
) {
  const response = await apiClient.post<Payment>('/payments/mock', {
    billId,
    method,
  })

  return response.data
}
