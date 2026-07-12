export type PaymentMethod =
  | 'MOCK_BANK_TRANSFER'
  | 'MOCK_CASH'
  | 'MOCK_E_WALLET'
  | 'MOMO'

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export type Payment = {
  id: number
  billId: number
  ownerId: number
  tenantId: number
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export type MomoPayment = {
  paymentId: number
  billId: number
  amount: number
  method: 'MOMO'
  status: PaymentStatus
  partnerCode: string
  orderId: string
  requestId: string
  payUrl: string | null
  deeplink: string | null
  qrCodeUrl: string | null
  resultCode: number | null
  message: string | null
}
