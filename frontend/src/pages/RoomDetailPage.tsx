import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { deleteRoomRequest, getRoomRequest } from '@/api/rooms'
import { RoomStatusBadge } from '@/components/rooms/RoomStatusBadge'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import {
  currencyFormatter,
  formatDateTime,
  numberFormatter,
} from '@/lib/formatters'
import type { Room } from '@/types/room'

export function RoomDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const roomId = Number(id)
  const [room, setRoom] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadRoom() {
      setIsLoading(true)
      setError('')

      try {
        const data = await getRoomRequest(roomId)
        setRoom(data)
      } catch (exception) {
        setError(getErrorMessage(exception, 'Cannot load room'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadRoom()
  }, [roomId])

  async function handleDelete() {
    if (!window.confirm('Delete this room?')) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      await deleteRoomRequest(roomId)
      navigate('/owner/rooms')
    } catch (exception) {
      setError(getErrorMessage(exception, 'Cannot delete room'))
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-72 animate-pulse rounded-md border border-border bg-card shadow-sm" />
    )
  }

  if (error) {
    return (
      <section className="rounded-md border border-red-200 bg-red-50 p-5 text-sm text-destructive">
        {error}
      </section>
    )
  }

  if (!room) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-md border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-start">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
            <Link to="/owner/rooms">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-foreground">
              {room.name}
            </h1>
            <RoomStatusBadge status={room.status} />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">{room.address}</p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link to={`/owner/rooms/${room.id}/edit`}>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Area" value={`${numberFormatter.format(room.area)} m2`} />
        <InfoCard label="Price" value={currencyFormatter.format(room.price)} />
        <InfoCard label="Created" value={formatDateTime(room.createdAt)} />
        <InfoCard label="Updated" value={formatDateTime(room.updatedAt)} />
      </div>

      <article className="rounded-md border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Description</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          {room.description || 'No description'}
        </p>
      </article>
    </section>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}
