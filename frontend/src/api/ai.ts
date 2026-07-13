import { apiClient } from '@/api/client'
import type {
  AiAssistantResponse,
  AiInsightResponse,
  AiReminderResponse,
  ReminderTone,
} from '@/types/ai'

export async function getOwnerAiInsightsRequest() {
  const response = await apiClient.get<AiInsightResponse>('/ai/owner-insights')

  return response.data
}

export async function askAiAssistantRequest(question: string) {
  const response = await apiClient.post<AiAssistantResponse>('/ai/assistant', {
    question,
  })

  return response.data
}

export async function generateBillReminderRequest(
  billId: number,
  tone: ReminderTone,
) {
  const response = await apiClient.post<AiReminderResponse>(
    `/ai/bills/${billId}/reminder`,
    { tone },
  )

  return response.data
}
