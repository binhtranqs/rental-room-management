import { AlertCircle, CheckCircle2, Clock, ReceiptText } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { getBillsRequest } from '@/api/bills'
import { useAuth } from '@/auth/useAuth'
import { BillStatusBadge } from '@/components/bills/BillStatusBadge'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import { currencyFormatter } from '@/lib/formatters'
import type { Bill } from '@/types/bill'

export function TenantDashboardPage() {
  const { user } = useAuth()
  const [bills, setBills] = useState<Bill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadBills() {
      setIsLoading(true)
      setError('')

      try {
        const data = await getBillsRequest({
          page: 0,
          size: 100,
          sort: 'createdAt,desc',
        })
        setBills(data.content)
      } catch (exception) {
        setError(getErrorMessage(exception, 'Cannot load tenant dashboard'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadBills()
  }, [])

  const summary = useMemo(() => {
    const unpaid = bills.filter((bill) => bill.status === 'UNPAID')
    const overdue = bills.filter((bill) => bill.status === 'OVERDUE')
    const paid = bills.filter((bill) => bill.status === 'PAID')

    return {
      unpaidCount: unpaid.length,
      overdueCount: overdue.length,
      paidCount: paid.length,
      amountDue: [...unpaid, ...overdue].reduce(
        (total, bill) => total + bill.totalAmount,
        0,
      ),
      recentBills: bills.slice(0, 5),
    }
  }, [bills])

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase text-secondary">
          Tenant dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">
          Welcome, {user?.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Track unpaid bills, overdue charges, and recent billing history.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="h-32 animate-pulse rounded-md border border-border bg-card shadow-sm"
              key={index}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-5 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {!isLoading && !error ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard
              label="Amount due"
              value={currencyFormatter.format(summary.amountDue)}
              icon={ReceiptText}
            />
            <MetricCard
              label="Unpaid"
              value={summary.unpaidCount.toString()}
              icon={Clock}
            />
            <MetricCard
              label="Overdue"
              value={summary.overdueCount.toString()}
              icon={AlertCircle}
            />
            <MetricCard
              label="Paid"
              value={summary.paidCount.toString()}
              icon={CheckCircle2}
            />
          </div>

          <article className="rounded-md border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Recent bills
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Latest bills visible to your tenant account.
                </p>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link to="/tenant/bills">View all</Link>
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              {summary.recentBills.length === 0 ? (
                <p className="text-sm text-muted">No bills yet.</p>
              ) : null}
              {summary.recentBills.map((bill) => (
                <Link
                  to={`/tenant/bills/${bill.id}`}
                  className="flex flex-col justify-between gap-3 rounded-md border border-border p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center"
                  key={bill.id}
                >
                  <div>
                    <p className="font-medium text-foreground">{bill.roomName}</p>
                    <p className="mt-1 text-sm text-muted">
                      {bill.month} - due {bill.dueDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <BillStatusBadge status={bill.status} />
                    <span className="font-semibold text-foreground">
                      {currencyFormatter.format(bill.totalAmount)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </article>
        </>
      ) : null}
    </section>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof ReceiptText
}) {
  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-sm">
      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      <p className="mt-4 text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}
