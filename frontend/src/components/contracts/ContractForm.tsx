import { Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import type { ContractPayload, ContractStatus } from '@/types/contract'
import type { Room } from '@/types/room'
import type { Tenant } from '@/types/tenant'

type ContractFormProps = {
  tenants: Tenant[]
  rooms: Room[]
  isSubmitting: boolean
  onSubmit: (payload: ContractPayload) => Promise<void>
}

export function ContractForm({
  tenants,
  rooms,
  isSubmitting,
  onSubmit,
}: ContractFormProps) {
  const [tenantId, setTenantId] = useState(tenants[0]?.id.toString() ?? '')
  const [roomId, setRoomId] = useState(rooms[0]?.id.toString() ?? '')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState('')
  const [deposit, setDeposit] = useState('')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [status, setStatus] = useState<ContractStatus>('ACTIVE')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onSubmit({
      tenantId: Number(tenantId),
      roomId: Number(roomId),
      startDate,
      endDate,
      deposit: Number(deposit),
      monthlyRent: Number(monthlyRent),
      status,
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Tenant</span>
          <select
            className="field-control mt-2"
            value={tenantId}
            onChange={(event) => setTenantId(event.target.value)}
            required
          >
            <option value="" disabled>
              Select tenant
            </option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name} - {tenant.email}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">Room</span>
          <select
            className="field-control mt-2"
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
            required
          >
            <option value="" disabled>
              Select room
            </option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} - {room.address}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Start date</span>
          <input
            className="field-control mt-2"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">End date</span>
          <input
            className="field-control mt-2"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">Status</span>
          <select
            className="field-control mt-2"
            value={status}
            onChange={(event) => setStatus(event.target.value as ContractStatus)}
            required
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Deposit</span>
          <input
            className="field-control mt-2"
            type="number"
            min="0"
            step="1000"
            value={deposit}
            onChange={(event) => setDeposit(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">
            Monthly rent
          </span>
          <input
            className="field-control mt-2"
            type="number"
            min="0"
            step="1000"
            value={monthlyRent}
            onChange={(event) => setMonthlyRent(event.target.value)}
            required
          />
        </label>
      </div>

      <Button disabled={isSubmitting || !tenantId || !roomId}>
        <Save className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? 'Saving...' : 'Create contract'}
      </Button>
    </form>
  )
}
