export type BillStatus = 'UNPAID' | 'PAID' | 'OVERDUE'

export type Bill = {
  id: number
  ownerId: number
  tenantId: number
  tenantName: string
  tenantEmail: string
  contractId: number
  roomId: number
  roomName: string
  month: string
  roomRent: number
  electricityFee: number
  waterFee: number
  serviceFee: number
  totalAmount: number
  status: BillStatus
  dueDate: string
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export type BillSearchParams = {
  keyword?: string
  status?: BillStatus | ''
  month?: string
  page?: number
  size?: number
  sort?: string
}
