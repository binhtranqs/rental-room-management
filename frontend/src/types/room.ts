export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'

export type Room = {
  id: number
  ownerId: number
  name: string
  address: string
  area: number
  price: number
  status: RoomStatus
  description: string | null
  createdAt: string
  updatedAt: string
}

export type RoomPayload = {
  name: string
  address: string
  area: number
  price: number
  status: RoomStatus
  description: string
}

export type RoomSearchParams = {
  keyword?: string
  status?: RoomStatus | ''
  page?: number
  size?: number
  sort?: string
}
