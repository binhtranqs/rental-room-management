import { Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import type { Room, RoomPayload, RoomStatus } from '@/types/room'

const statuses: RoomStatus[] = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE']

type RoomFormProps = {
  initialRoom?: Room
  isSubmitting: boolean
  submitLabel: string
  onSubmit: (payload: RoomPayload) => Promise<void>
}

export function RoomForm({
  initialRoom,
  isSubmitting,
  submitLabel,
  onSubmit,
}: RoomFormProps) {
  const [name, setName] = useState(initialRoom?.name ?? '')
  const [address, setAddress] = useState(initialRoom?.address ?? '')
  const [area, setArea] = useState(initialRoom?.area.toString() ?? '')
  const [price, setPrice] = useState(initialRoom?.price.toString() ?? '')
  const [status, setStatus] = useState<RoomStatus>(
    initialRoom?.status ?? 'AVAILABLE',
  )
  const [description, setDescription] = useState(initialRoom?.description ?? '')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onSubmit({
      name,
      address,
      area: Number(area),
      price: Number(price),
      status,
      description,
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Room name</span>
          <input
            className="field-control mt-2"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">Status</span>
          <select
            className="field-control mt-2"
            value={status}
            onChange={(event) => setStatus(event.target.value as RoomStatus)}
            required
          >
            {statuses.map((roomStatus) => (
              <option key={roomStatus} value={roomStatus}>
                {roomStatus}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-foreground">Address</span>
        <input
          className="field-control mt-2"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          required
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Area (m2)</span>
          <input
            className="field-control mt-2"
            type="number"
            min="0"
            step="0.1"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">Price</span>
          <input
            className="field-control mt-2"
            type="number"
            min="0"
            step="1000"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-foreground">Description</span>
        <textarea
          className="field-control mt-2 min-h-28 resize-y py-3"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      <Button disabled={isSubmitting}>
        <Save className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
