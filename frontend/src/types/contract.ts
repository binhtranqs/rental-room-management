import type { RoomStatus } from '@/types/room'

export type ContractStatus = 'ACTIVE' | 'ENDED' | 'CANCELLED'

export type Contract = {
  id: number
  ownerId: number
  tenantId: number
  tenantName: string
  tenantEmail: string
  roomId: number
  roomName: string
  roomStatus: RoomStatus
  startDate: string
  endDate: string
  deposit: number
  monthlyRent: number
  status: ContractStatus
  createdAt: string
  updatedAt: string
}

export type ContractPayload = {
  tenantId: number
  roomId: number
  startDate: string
  endDate: string
  deposit: number
  monthlyRent: number
  status: ContractStatus
}

export type ContractSearchParams = {
  keyword?: string
  status?: ContractStatus | ''
  page?: number
  size?: number
  sort?: string
}
