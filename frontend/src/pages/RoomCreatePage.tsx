import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { createRoomRequest } from '@/api/rooms'
import { RoomForm } from '@/components/rooms/RoomForm'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import type { RoomPayload } from '@/types/room'

export function RoomCreatePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(payload: RoomPayload) {
    setIsSubmitting(true)
    setError('')

    try {
      const room = await createRoomRequest(payload)
      navigate(`/owner/rooms/${room.id}`)
    } catch (exception) {
      setError(getErrorMessage(exception, 'Cannot create room'))
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-md border border-border bg-card p-6 shadow-sm">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
          <Link to="/owner/rooms">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold text-foreground">New room</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Add a room and make it available for contracts.
        </p>
      </div>

      <div className="rounded-md border border-border bg-card p-6 shadow-sm">
        {error ? (
          <p className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <RoomForm
          isSubmitting={isSubmitting}
          submitLabel="Create room"
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  )
}
