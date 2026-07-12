import { apiClient } from '@/api/client'
import type { OwnerDashboard } from '@/types/dashboard'

export async function getOwnerDashboardRequest() {
  const response = await apiClient.get<OwnerDashboard>('/dashboard/owner')

  return response.data
}
