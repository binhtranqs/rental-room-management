import { AxiosError } from 'axios'
import {
  Banknote,
  DoorClosed,
  DoorOpen,
  FileSignature,
  Home,
  RefreshCw,
  ReceiptText,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { getOwnerDashboardRequest } from '@/api/dashboard'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/button'
import type { OwnerDashboard } from '@/types/dashboard'

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('vi-VN')

export function OwnerDashboardPage() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<OwnerDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadDashboard() {
    setIsLoading(true)
    setError('')

    try {
      const data = await getOwnerDashboardRequest()
      setDashboard(data)
    } catch (exception) {
      if (exception instanceof AxiosError) {
        setError(exception.response?.data?.message ?? 'Cannot load dashboard')
      } else {
        setError('Cannot load dashboard')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
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
      <div className="flex flex-col justify-between gap-4 rounded-md border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-secondary">
            Owner dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
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
              className="h-36 animate-pulse rounded-md border border-border bg-card shadow-sm"
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-md border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-muted">{metric.label}</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-primary">
                  <metric.icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold text-foreground">
                {metric.value}
              </p>
              <p className="mt-2 text-sm text-muted">{metric.helper}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
