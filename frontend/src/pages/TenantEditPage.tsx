import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { getTenantRequest, updateTenantRequest } from '@/api/tenants'
import { TenantForm } from '@/components/tenants/TenantForm'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import type { Tenant, TenantCreatePayload, TenantUpdatePayload } from '@/types/tenant'

export function TenantEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tenantId = Number(id)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTenant() {
      setIsLoading(true)
      setError('')

      try {
        const data = await getTenantRequest(tenantId)
        setTenant(data)
      } catch (exception) {
        setError(getErrorMessage(exception, 'Cannot load tenant'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadTenant()
  }, [tenantId])

  async function handleSubmit(
    payload: TenantCreatePayload | TenantUpdatePayload,
  ) {
    setIsSubmitting(true)
    setError('')

    try {
      const updatedTenant = await updateTenantRequest(
        tenantId,
        payload as TenantUpdatePayload,
      )
      navigate(`/owner/tenants/${updatedTenant.id}`)
    } catch (exception) {
      setError(getErrorMessage(exception, 'Cannot update tenant'))
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-md border border-border bg-card shadow-sm" />
    )
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-md border border-border bg-card p-6 shadow-sm">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
          <Link to={tenant ? `/owner/tenants/${tenant.id}` : '/owner/tenants'}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold text-foreground">Edit tenant</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Update contact and identity information.
        </p>
      </div>

      <div className="rounded-md border border-border bg-card p-6 shadow-sm">
        {error ? (
          <p className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {tenant ? (
          <TenantForm
            initialTenant={tenant}
            mode="edit"
            isSubmitting={isSubmitting}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
          />
        ) : null}
      </div>
    </section>
  )
}
