import {
  Banknote,
  Bot,
  DoorClosed,
  DoorOpen,
  FileSignature,
  Home,
  Send,
  RefreshCw,
  ReceiptText,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { askAiAssistantRequest, getOwnerAiInsightsRequest } from '@/api/ai'
import { getOwnerDashboardRequest } from '@/api/dashboard'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import type { AiInsightResponse } from '@/types/ai'
import type { OwnerDashboard } from '@/types/dashboard'

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('vi-VN')

type ChatMessage = {
  id: string
  role: 'owner' | 'assistant'
  content: string
}

export function OwnerDashboardPage() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<OwnerDashboard | null>(null)
  const [aiInsights, setAiInsights] = useState<AiInsightResponse | null>(null)
  const [aiQuestion, setAiQuestion] = useState('Which bills should I handle first?')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Ask about unpaid bills, overdue tenants, available rooms, or monthly revenue.',
    },
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [isAiLoading, setIsAiLoading] = useState(true)
  const [isAskingAi, setIsAskingAi] = useState(false)
  const [error, setError] = useState('')
  const [aiError, setAiError] = useState('')

  async function loadDashboard() {
    setIsLoading(true)
    setError('')

    try {
      const data = await getOwnerDashboardRequest()
      setDashboard(data)
    } catch (exception) {
      setError(getErrorMessage(exception, 'Cannot load dashboard'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [])

  async function loadAiInsights() {
    setIsAiLoading(true)
    setAiError('')

    try {
      const data = await getOwnerAiInsightsRequest()
      setAiInsights(data)
    } catch (exception) {
      setAiError(getErrorMessage(exception, 'Cannot load AI insights'))
    } finally {
      setIsAiLoading(false)
    }
  }

  async function askAiAssistant() {
    const question = aiQuestion.trim()
    if (!question) {
      return
    }

    setIsAskingAi(true)
    setAiError('')
    setAiQuestion('')

    const ownerMessage: ChatMessage = {
      id: `owner-${Date.now()}`,
      role: 'owner',
      content: question,
    }
    setChatMessages((messages) => [...messages, ownerMessage])

    try {
      const data = await askAiAssistantRequest(question)
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
      }
      setChatMessages((messages) => [...messages, assistantMessage])
    } catch (exception) {
      setAiError(getErrorMessage(exception, 'Cannot ask AI assistant'))
    } finally {
      setIsAskingAi(false)
    }
  }

  useEffect(() => {
    void loadAiInsights()
  }, [])

  const occupancyRate = useMemo(() => {
    if (!dashboard || dashboard.totalRooms === 0) {
      return 0
    }

    return Math.round((dashboard.occupiedRooms / dashboard.totalRooms) * 100)
  }, [dashboard])

  const metrics = dashboard
    ? [
        {
          label: 'Total rooms',
          value: numberFormatter.format(dashboard.totalRooms),
          helper: `${occupancyRate}% occupied`,
          icon: Home,
        },
        {
          label: 'Occupied rooms',
          value: numberFormatter.format(dashboard.occupiedRooms),
          helper: 'Rooms with active tenants',
          icon: DoorClosed,
        },
        {
          label: 'Available rooms',
          value: numberFormatter.format(dashboard.availableRooms),
          helper: 'Ready to rent',
          icon: DoorOpen,
        },
        {
          label: 'Active contracts',
          value: numberFormatter.format(dashboard.activeContracts),
          helper: 'Currently running',
          icon: FileSignature,
        },
        {
          label: 'Unpaid bills',
          value: numberFormatter.format(dashboard.unpaidBills),
          helper: 'Need follow-up',
          icon: ReceiptText,
        },
        {
          label: 'Monthly revenue',
          value: currencyFormatter.format(dashboard.monthlyRevenue),
          helper: 'Paid bills this month',
          icon: Banknote,
        },
      ]
    : []

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-lg page-panel p-6 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            Owner dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Track room occupancy, active contracts, unpaid bills, and paid
            revenue for the current month.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => void loadDashboard()}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-lg data-card"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-5 text-sm text-destructive">
          <p className="font-medium">{error}</p>
          <Button
            type="button"
            className="mt-4"
            variant="secondary"
            onClick={() => void loadDashboard()}
          >
            Try again
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && dashboard ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-lg data-card p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-muted">{metric.label}</p>
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-primary">
                    <metric.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold text-foreground">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm text-muted">{metric.helper}</p>
              </article>
            ))}
          </div>

          <article className="rounded-lg page-panel p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-950 text-white">
                    <Bot className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                      AI operations assistant
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-foreground">
                      Portfolio signals and quick answers
                    </h2>
                  </div>
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
                  {aiInsights?.summary ??
                    'AI reads your rooms, contracts, and bills to surface what needs attention.'}
                </p>
              </div>

              {aiInsights ? (
                <span className="w-fit rounded-md border border-border bg-white/70 px-3 py-2 text-xs font-semibold text-muted">
                  {aiInsights.aiEnabled ? 'OpenAI' : 'Rules fallback'}
                </span>
              ) : null}
            </div>

            {isAiLoading ? (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-lg data-card"
                  />
                ))}
              </div>
            ) : null}

            {aiError ? (
              <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-destructive">
                {aiError}
              </p>
            ) : null}

            {!isAiLoading && aiInsights ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {aiInsights.insights.map((insight) => (
                  <div key={insight.title} className="rounded-lg data-card p-4">
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-primary">
                      {insight.severity}
                    </span>
                    <h3 className="mt-3 font-bold text-foreground">
                      {insight.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {insight.detail}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-foreground">
                      {insight.action}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-6 space-y-3 rounded-lg border border-border bg-white/72 p-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === 'owner'
                      ? 'ml-auto max-w-3xl rounded-lg bg-emerald-950 px-4 py-3 text-sm leading-6 text-white'
                      : 'max-w-3xl rounded-lg bg-stone-50 px-4 py-3 text-sm leading-6 text-foreground'
                  }
                >
                  {message.content}
                </div>
              ))}

              {isAskingAi ? (
                <div className="max-w-3xl rounded-lg bg-stone-50 px-4 py-3 text-sm font-semibold text-muted">
                  Thinking...
                </div>
              ) : null}
            </div>

            <form
              className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]"
              onSubmit={(event) => {
                event.preventDefault()
                void askAiAssistant()
              }}
            >
              <input
                className="field-control"
                value={aiQuestion}
                onChange={(event) => setAiQuestion(event.target.value)}
                placeholder="Ask about overdue bills, available rooms, revenue..."
              />
              <Button
                type="submit"
                disabled={isAskingAi || !aiQuestion.trim()}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {isAskingAi ? 'Thinking...' : 'Ask AI'}
              </Button>
            </form>
          </article>
        </>
      ) : null}
    </section>
  )
}
