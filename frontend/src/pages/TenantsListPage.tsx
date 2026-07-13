import { Plus, Search } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { getTenantsRequest } from '@/api/tenants'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import { formatDateTime } from '@/lib/formatters'
import type { PageResponse } from '@/types/page'
import type { Tenant } from '@/types/tenant'

export function TenantsListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tenantsPage, setTenantsPage] = useState<PageResponse<Tenant> | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '')

  const page = Number(searchParams.get('page') ?? 0)
  const activeKeyword = searchParams.get('keyword') ?? ''

  useEffect(() => {
    async function loadTenants() {
      setIsLoading(true)
      setError('')

      try {
        const data = await getTenantsRequest({
          keyword: activeKeyword,
          page,
          size: 10,
          sort: 'createdAt,desc',
        })
        setTenantsPage(data)
      } catch (exception) {
        setError(getErrorMessage(exception, 'Cannot load tenants'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadTenants()
  }, [activeKeyword, page])

  function updateParams(nextPage: number, nextKeyword = keyword) {
    const params = new URLSearchParams()

    if (nextKeyword.trim()) {
      params.set('keyword', nextKeyword.trim())
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
            Tenants
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">
            Manage tenants
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Create tenant accounts and keep their profile information updated.
          </p>
        </div>

        <Button asChild>
          <Link to="/owner/tenants/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New tenant
          </Link>
        </Button>
      </div>

      <form
        className="grid gap-3 rounded-lg form-surface p-4 md:grid-cols-[1fr_auto]"
        onSubmit={handleSearch}
      >
        <label className="block">
          <span className="sr-only">Search tenants</span>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              className="field-control pl-9"
              placeholder="Search by name, email, phone, identity number"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
        </label>

        <Button>Apply</Button>
      </form>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="h-36 animate-pulse rounded-lg data-card"
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

      {!isLoading && !error && tenantsPage?.content.length === 0 ? (
        <div className="rounded-lg page-panel p-8 text-center">
          <h2 className="text-xl font-bold text-foreground">
            No tenants found
          </h2>
          <p className="mt-2 text-sm text-muted">
            Create your first tenant or adjust the search.
          </p>
          <Button asChild className="mt-5">
            <Link to="/owner/tenants/new">Create tenant</Link>
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && tenantsPage && tenantsPage.content.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {tenantsPage.content.map((tenant) => (
              <article
                className="rounded-lg data-card p-5"
                key={tenant.id}
              >
                <h2 className="text-xl font-bold text-foreground">
                  {tenant.name}
                </h2>
                <p className="mt-1 text-sm text-muted">{tenant.email}</p>

                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted">Phone</p>
                    <p className="mt-1 font-semibold text-foreground metric-number">
                      {tenant.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">Created</p>
                    <p className="mt-1 font-semibold text-foreground metric-number">
                      {formatDateTime(tenant.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link to={`/owner/tenants/${tenant.id}`}>Detail</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/owner/tenants/${tenant.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-lg form-surface p-4 text-sm text-muted">
            <span>
              Page {tenantsPage.number + 1} of{' '}
              {Math.max(tenantsPage.totalPages, 1)}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={tenantsPage.number === 0}
                onClick={() => updateParams(tenantsPage.number - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={tenantsPage.number + 1 >= tenantsPage.totalPages}
                onClick={() => updateParams(tenantsPage.number + 1)}
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
