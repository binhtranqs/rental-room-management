export type PaymentMethod = 'MOCK_BANK_TRANSFER' | 'MOCK_CASH' | 'MOCK_E_WALLET'

export type PaymentStatus = 'SUCCESS'

export type Payment = {
  id: number
  billId: number
  ownerId: number
  tenantId: number
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  paidAt: string
  createdAt: string
  updatedAt: string
}
