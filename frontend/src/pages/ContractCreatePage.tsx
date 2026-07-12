import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { createContractRequest } from '@/api/contracts'
import { getRoomsRequest } from '@/api/rooms'
import { getTenantsRequest } from '@/api/tenants'
import { ContractForm } from '@/components/contracts/ContractForm'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import type { ContractPayload } from '@/types/contract'
import type { Room } from '@/types/room'
import type { Tenant } from '@/types/tenant'

export function ContractCreatePage() {
  const navigate = useNavigate()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOptions() {
      setIsLoading(true)
      setError('')

      try {
        const [tenantsPage, roomsPage] = await Promise.all([
          getTenantsRequest({ page: 0, size: 100, sort: 'createdAt,desc' }),
          getRoomsRequest({
            status: 'AVAILABLE',
            page: 0,
            size: 100,
            sort: 'createdAt,desc',
          }),
        ])

        setTenants(tenantsPage.content)
        setRooms(roomsPage.content)
      } catch (exception) {
        setError(getErrorMessage(exception, 'Cannot load contract options'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadOptions()
  }, [])

  async function handleSubmit(payload: ContractPayload) {
    setIsSubmitting(true)
    setError('')

    try {
      const contract = await createContractRequest(payload)
      navigate(`/owner/contracts/${contract.id}`)
    } catch (exception) {
      setError(getErrorMessage(exception, 'Cannot create contract'))
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-md border border-border bg-card p-6 shadow-sm">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
          <Link to="/owner/contracts">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold text-foreground">
          New contract
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Pick a tenant and an available room to start a rental contract.
        </p>
      </div>

      <div className="rounded-md border border-border bg-card p-6 shadow-sm">
        {error ? (
          <p className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <div className="h-80 animate-pulse rounded-md border border-border bg-background" />
        ) : null}

        {!isLoading && tenants.length === 0 ? (
          <p className="text-sm text-muted">
            Create a tenant before creating a contract.
          </p>
        ) : null}

        {!isLoading && tenants.length > 0 && rooms.length === 0 ? (
          <p className="text-sm text-muted">
            No available rooms. Mark a room as available before creating an
            active contract.
          </p>
        ) : null}

        {!isLoading && tenants.length > 0 && rooms.length > 0 ? (
          <ContractForm
            tenants={tenants}
            rooms={rooms}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        ) : null}
      </div>
    </section>
  )
}
