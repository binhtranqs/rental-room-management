import { apiClient } from '@/api/client'
import type { MomoPayment, Payment, PaymentMethod } from '@/types/payment'

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

export async function createMomoPaymentRequest(billId: number) {
  const response = await apiClient.post<MomoPayment>('/payments/momo', {
    billId,
  })

  return response.data
}
