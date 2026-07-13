export type AiInsight = {
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  detail: string
  action: string
}

export type AiInsightResponse = {
  aiEnabled: boolean
  source: string
  generatedAt: string
  summary: string
  insights: AiInsight[]
}

export type AiAssistantResponse = {
  aiEnabled: boolean
  source: string
  generatedAt: string
  answer: string
}

export type ReminderTone = 'POLITE' | 'FIRM' | 'OVERDUE'

export type AiReminderResponse = {
  aiEnabled: boolean
  source: string
  generatedAt: string
  recipientEmail: string
  subject: string
  body: string
}
