import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { deleteTenantRequest, getTenantRequest } from '@/api/tenants'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import { formatDateTime } from '@/lib/formatters'
import type { Tenant } from '@/types/tenant'

export function TenantDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tenantId = Number(id)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
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

  async function handleDelete() {
    if (!window.confirm('Delete this tenant profile?')) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      await deleteTenantRequest(tenantId)
      navigate('/owner/tenants')
    } catch (exception) {
      setError(getErrorMessage(exception, 'Cannot delete tenant'))
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-72 animate-pulse rounded-lg data-card" />
    )
  }

  if (error) {
    return (
      <section className="rounded-md border border-red-200 bg-red-50 p-5 text-sm text-destructive">
        {error}
      </section>
    )
  }

  if (!tenant) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-lg page-panel p-6 sm:flex-row sm:items-start">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
            <Link to="/owner/tenants">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            {tenant.name}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">{tenant.email}</p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link to={`/owner/tenants/${tenant.id}/edit`}>
              <Edit className="h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard label="Phone" value={tenant.phone} />
        <InfoCard label="Identity number" value={tenant.identityNumber} />
        <InfoCard
          label="Emergency contact"
          value={tenant.emergencyContact || 'None'}
        />
        <InfoCard label="Tenant user ID" value={tenant.userId.toString()} />
        <InfoCard label="Created" value={formatDateTime(tenant.createdAt)} />
        <InfoCard label="Updated" value={formatDateTime(tenant.updatedAt)} />
      </div>
    </section>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg data-card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}
