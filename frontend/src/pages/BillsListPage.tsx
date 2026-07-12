import { Search } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { getBillsRequest } from '@/api/bills'
import { useAuth } from '@/auth/useAuth'
import { BillStatusBadge } from '@/components/bills/BillStatusBadge'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import { currencyFormatter } from '@/lib/formatters'
import type { Bill, BillStatus } from '@/types/bill'
import type { PageResponse } from '@/types/page'

const statuses: Array<BillStatus | ''> = ['', 'UNPAID', 'PAID', 'OVERDUE']

export function BillsListPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [billsPage, setBillsPage] = useState<PageResponse<Bill> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '')
  const [status, setStatus] = useState<BillStatus | ''>(
    (searchParams.get('status') as BillStatus | null) ?? '',
  )
  const [month, setMonth] = useState(searchParams.get('month') ?? '')

  const page = Number(searchParams.get('page') ?? 0)
  const activeKeyword = searchParams.get('keyword') ?? ''
  const activeStatus = (searchParams.get('status') as BillStatus | null) ?? ''
  const activeMonth = searchParams.get('month') ?? ''
  const detailPrefix = user?.role === 'TENANT' ? '/tenant/bills' : '/owner/bills'

  useEffect(() => {
    async function loadBills() {
      setIsLoading(true)
      setError('')

      try {
        const data = await getBillsRequest({
          keyword: activeKeyword,
          status: activeStatus,
          month: activeMonth,
          page,
          size: 10,
          sort: 'createdAt,desc',
        })
        setBillsPage(data)
      } catch (exception) {
        setError(getErrorMessage(exception, 'Cannot load bills'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadBills()
  }, [activeKeyword, activeStatus, activeMonth, page])

  function updateParams(
    nextPage: number,
    nextKeyword = keyword,
    nextStatus = status,
    nextMonth = month,
  ) {
    const params = new URLSearchParams()

    if (nextKeyword.trim()) {
      params.set('keyword', nextKeyword.trim())
    }
    if (nextStatus) {
      params.set('status', nextStatus)
    }
    if (nextMonth) {
      params.set('month', nextMonth)
    }
    if (nextPage > 0) {
      params.set('page', nextPage.toString())
    }

    setSearchParams(params)
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateParams(0)
  }

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase text-secondary">Bills</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">
          {user?.role === 'TENANT' ? 'My bills' : 'Manage bills'}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Review bill status, due dates, and payment totals.
        </p>
      </div>

      <form
        className="grid gap-3 rounded-md border border-border bg-card p-4 shadow-sm lg:grid-cols-[1fr_180px_180px_auto]"
        onSubmit={handleSearch}
      >
        <label className="block">
          <span className="sr-only">Search bills</span>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              className="h-11 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
              placeholder="Search by tenant, email, room"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
        </label>

        <select
          className="h-11 rounded-md border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
          value={status}
          onChange={(event) => setStatus(event.target.value as BillStatus | '')}
        >
          {statuses.map((billStatus) => (
            <option key={billStatus || 'ALL'} value={billStatus}>
              {billStatus || 'All statuses'}
            </option>
          ))}
        </select>

        <input
          className="h-11 rounded-md border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
          type="date"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
        />

        <Button>Apply</Button>
      </form>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="h-40 animate-pulse rounded-md border border-border bg-card shadow-sm"
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

      {!isLoading && !error && billsPage?.content.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">No bills found</h2>
          <p className="mt-2 text-sm text-muted">Adjust the filters and try again.</p>
        </div>
      ) : null}

      {!isLoading && !error && billsPage && billsPage.content.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {billsPage.content.map((bill) => (
              <article
                className="rounded-md border border-border bg-card p-5 shadow-sm"
                key={bill.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {bill.roomName}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {bill.tenantName} - {bill.month}
                    </p>
                  </div>
                  <BillStatusBadge status={bill.status} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted">Total</p>
                    <p className="mt-1 font-medium text-foreground">
                      {currencyFormatter.format(bill.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">Due date</p>
                    <p className="mt-1 font-medium text-foreground">
                      {bill.dueDate}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <Button asChild variant="secondary" size="sm">
                    <Link to={`${detailPrefix}/${bill.id}`}>Detail</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-md border border-border bg-card p-4 text-sm text-muted shadow-sm">
            <span>
              Page {billsPage.number + 1} of {Math.max(billsPage.totalPages, 1)}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={billsPage.number === 0}
                onClick={() => updateParams(billsPage.number - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={billsPage.number + 1 >= billsPage.totalPages}
                onClick={() => updateParams(billsPage.number + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
