import { FilePlus, Search } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { getContractsRequest } from '@/api/contracts'
import { ContractStatusBadge } from '@/components/contracts/ContractStatusBadge'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import { currencyFormatter } from '@/lib/formatters'
import type { Contract, ContractStatus } from '@/types/contract'
import type { PageResponse } from '@/types/page'

const statuses: Array<ContractStatus | ''> = [
  '',
  'ACTIVE',
  'ENDED',
  'CANCELLED',
]

export function ContractsListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [contractsPage, setContractsPage] =
    useState<PageResponse<Contract> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '')
  const [status, setStatus] = useState<ContractStatus | ''>(
    (searchParams.get('status') as ContractStatus | null) ?? '',
  )

  const page = Number(searchParams.get('page') ?? 0)
  const activeKeyword = searchParams.get('keyword') ?? ''
  const activeStatus =
    (searchParams.get('status') as ContractStatus | null) ?? ''

  useEffect(() => {
    async function loadContracts() {
      setIsLoading(true)
      setError('')

      try {
        const data = await getContractsRequest({
          keyword: activeKeyword,
          status: activeStatus,
          page,
          size: 10,
          sort: 'createdAt,desc',
        })
        setContractsPage(data)
      } catch (exception) {
        setError(getErrorMessage(exception, 'Cannot load contracts'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadContracts()
  }, [activeKeyword, activeStatus, page])

  function updateParams(
    nextPage: number,
    nextKeyword = keyword,
    nextStatus = status,
  ) {
    const params = new URLSearchParams()

    if (nextKeyword.trim()) {
      params.set('keyword', nextKeyword.trim())
    }
    if (nextStatus) {
      params.set('status', nextStatus)
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
      <div className="flex flex-col justify-between gap-4 rounded-lg page-panel p-6 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            Contracts
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">
            Manage contracts
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Create rental agreements and end active contracts when tenants move
            out.
          </p>
        </div>

        <Button asChild>
          <Link to="/owner/contracts/new">
            <FilePlus className="h-4 w-4" aria-hidden="true" />
            New contract
          </Link>
        </Button>
      </div>

      <form
        className="grid gap-3 rounded-lg form-surface p-4 md:grid-cols-[1fr_220px_auto]"
        onSubmit={handleSearch}
      >
        <label className="block">
          <span className="sr-only">Search contracts</span>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              className="field-control pl-9"
              placeholder="Search by tenant, email, room, address"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
        </label>

        <select
          className="field-control"
          value={status}
          onChange={(event) => setStatus(event.target.value as ContractStatus | '')}
        >
          {statuses.map((contractStatus) => (
            <option key={contractStatus || 'ALL'} value={contractStatus}>
              {contractStatus || 'All statuses'}
            </option>
          ))}
        </select>

        <Button>Apply</Button>
      </form>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="h-40 animate-pulse rounded-lg data-card"
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

      {!isLoading && !error && contractsPage?.content.length === 0 ? (
        <div className="rounded-lg page-panel p-8 text-center">
          <h2 className="text-xl font-bold text-foreground">
            No contracts found
          </h2>
          <p className="mt-2 text-sm text-muted">
            Create your first contract or adjust the filters.
          </p>
          <Button asChild className="mt-5">
            <Link to="/owner/contracts/new">Create contract</Link>
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && contractsPage && contractsPage.content.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {contractsPage.content.map((contract) => (
              <article
                className="rounded-lg data-card p-5"
                key={contract.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {contract.roomName}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {contract.tenantName} - {contract.tenantEmail}
                    </p>
                  </div>
                  <ContractStatusBadge status={contract.status} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted">Monthly rent</p>
                    <p className="mt-1 font-semibold text-foreground metric-number">
                      {currencyFormatter.format(contract.monthlyRent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">Period</p>
                    <p className="mt-1 font-semibold text-foreground metric-number">
                      {contract.startDate} to {contract.endDate}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <Button asChild variant="secondary" size="sm">
                    <Link to={`/owner/contracts/${contract.id}`}>Detail</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-lg form-surface p-4 text-sm text-muted">
            <span>
              Page {contractsPage.number + 1} of{' '}
              {Math.max(contractsPage.totalPages, 1)}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={contractsPage.number === 0}
                onClick={() => updateParams(contractsPage.number - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={contractsPage.number + 1 >= contractsPage.totalPages}
                onClick={() => updateParams(contractsPage.number + 1)}
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
