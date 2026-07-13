import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { createTenantRequest } from '@/api/tenants'
import { TenantForm } from '@/components/tenants/TenantForm'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import type { TenantCreatePayload, TenantUpdatePayload } from '@/types/tenant'

export function TenantCreatePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(
    payload: TenantCreatePayload | TenantUpdatePayload,
  ) {
    setIsSubmitting(true)
    setError('')

    try {
      const tenant = await createTenantRequest(payload as TenantCreatePayload)
      navigate(`/owner/tenants/${tenant.id}`)
    } catch (exception) {
      setError(getErrorMessage(exception, 'Cannot create tenant'))
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-lg page-panel p-6">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
          <Link to="/owner/tenants">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-foreground">New tenant</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Create a tenant account and profile.
        </p>
      </div>

      <div className="rounded-lg page-panel p-6">
        {error ? (
          <p className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <TenantForm
          mode="create"
          isSubmitting={isSubmitting}
          submitLabel="Create tenant"
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  )
}
