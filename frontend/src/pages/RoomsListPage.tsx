import { Plus, Search } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { getRoomsRequest } from '@/api/rooms'
import { RoomStatusBadge } from '@/components/rooms/RoomStatusBadge'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import { currencyFormatter, numberFormatter } from '@/lib/formatters'
import type { PageResponse } from '@/types/page'
import type { Room, RoomStatus } from '@/types/room'

const roomStatuses: Array<RoomStatus | ''> = [
  '',
  'AVAILABLE',
  'OCCUPIED',
  'MAINTENANCE',
]

export function RoomsListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [roomsPage, setRoomsPage] = useState<PageResponse<Room> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '')
  const [status, setStatus] = useState<RoomStatus | ''>(
    (searchParams.get('status') as RoomStatus | null) ?? '',
  )

  const page = Number(searchParams.get('page') ?? 0)
  const activeKeyword = searchParams.get('keyword') ?? ''
  const activeStatus = (searchParams.get('status') as RoomStatus | null) ?? ''

  useEffect(() => {
    async function loadRooms() {
      setIsLoading(true)
      setError('')

      try {
        const data = await getRoomsRequest({
          keyword: activeKeyword,
          status: activeStatus,
          page,
          size: 10,
          sort: 'createdAt,desc',
        })
        setRoomsPage(data)
      } catch (exception) {
        setError(getErrorMessage(exception, 'Cannot load rooms'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadRooms()
  }, [activeKeyword, activeStatus, page])

  function updateParams(nextPage: number, nextKeyword = keyword, nextStatus = status) {
    const params = new URLSearchParams()

    if (nextKeyword.trim()) {
      params.set('keyword', nextKeyword.trim())
    }
    if (nextStatus) {
      params.set('status', nextStatus)
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
            Rooms
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">
            Manage rooms
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Search, filter, create, update, and inspect every room you own.
          </p>
        </div>

        <Button asChild>
          <Link to="/owner/rooms/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New room
          </Link>
        </Button>
      </div>

      <form
        className="grid gap-3 rounded-lg form-surface p-4 md:grid-cols-[1fr_220px_auto]"
        onSubmit={handleSearch}
      >
        <label className="block">
          <span className="sr-only">Search rooms</span>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              className="field-control pl-9"
              placeholder="Search by name, address, description"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
        </label>

        <label className="block">
          <span className="sr-only">Filter by status</span>
          <select
            className="field-control"
            value={status}
            onChange={(event) => setStatus(event.target.value as RoomStatus | '')}
          >
            {roomStatuses.map((roomStatus) => (
              <option key={roomStatus || 'ALL'} value={roomStatus}>
                {roomStatus || 'All statuses'}
              </option>
            ))}
          </select>
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

      {!isLoading && !error && roomsPage?.content.length === 0 ? (
        <div className="rounded-lg page-panel p-8 text-center">
          <h2 className="text-xl font-bold text-foreground">
            No rooms found
          </h2>
          <p className="mt-2 text-sm text-muted">
            Create your first room or adjust the filters.
          </p>
          <Button asChild className="mt-5">
            <Link to="/owner/rooms/new">Create room</Link>
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && roomsPage && roomsPage.content.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {roomsPage.content.map((room) => (
              <article
                className="rounded-lg data-card p-5"
                key={room.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {room.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted">{room.address}</p>
                  </div>
                  <RoomStatusBadge status={room.status} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted">Area</p>
                    <p className="mt-1 font-semibold text-foreground metric-number">
                      {numberFormatter.format(room.area)} m2
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">Price</p>
                    <p className="mt-1 font-semibold text-foreground metric-number">
                      {currencyFormatter.format(room.price)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link to={`/owner/rooms/${room.id}`}>Detail</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/owner/rooms/${room.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-lg form-surface p-4 text-sm text-muted">
            <span>
              Page {roomsPage.number + 1} of {Math.max(roomsPage.totalPages, 1)}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={roomsPage.number === 0}
                onClick={() => updateParams(roomsPage.number - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={roomsPage.number + 1 >= roomsPage.totalPages}
                onClick={() => updateParams(roomsPage.number + 1)}
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
