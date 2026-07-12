import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { getRoomRequest, updateRoomRequest } from '@/api/rooms'
import { RoomForm } from '@/components/rooms/RoomForm'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import type { Room, RoomPayload } from '@/types/room'

export function RoomEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const roomId = Number(id)
  const [room, setRoom] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  async function handleSubmit(payload: RoomPayload) {
    setIsSubmitting(true)
    setError('')

    try {
      const updatedRoom = await updateRoomRequest(roomId, payload)
      navigate(`/owner/rooms/${updatedRoom.id}`)
    } catch (exception) {
      setError(getErrorMessage(exception, 'Cannot update room'))
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
          <Link to={room ? `/owner/rooms/${room.id}` : '/owner/rooms'}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold text-foreground">Edit room</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Update room details, pricing, and availability status.
        </p>
      </div>

      <div className="rounded-md border border-border bg-card p-6 shadow-sm">
        {error ? (
          <p className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {room ? (
          <RoomForm
            initialRoom={room}
            isSubmitting={isSubmitting}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
          />
        ) : null}
      </div>
    </section>
  )
}
