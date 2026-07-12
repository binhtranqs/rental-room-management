import { apiClient } from '@/api/client'
import type { PageResponse } from '@/types/page'
import type { Room, RoomPayload, RoomSearchParams } from '@/types/room'

export async function getRoomsRequest(params: RoomSearchParams) {
  const response = await apiClient.get<PageResponse<Room>>('/rooms', {
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

export async function getRoomRequest(id: number) {
  const response = await apiClient.get<Room>(`/rooms/${id}`)

  return response.data
}

export async function createRoomRequest(payload: RoomPayload) {
  const response = await apiClient.post<Room>('/rooms', payload)

  return response.data
}

export async function updateRoomRequest(id: number, payload: RoomPayload) {
  const response = await apiClient.put<Room>(`/rooms/${id}`, payload)

  return response.data
}

export async function deleteRoomRequest(id: number) {
  await apiClient.delete(`/rooms/${id}`)
}
