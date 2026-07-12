import { cn } from '@/lib/utils'
import type { RoomStatus } from '@/types/room'

const statusLabels: Record<RoomStatus, string> = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  MAINTENANCE: 'Maintenance',
}

const statusClasses: Record<RoomStatus, string> = {
  AVAILABLE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  OCCUPIED: 'border-blue-200 bg-blue-50 text-blue-700',
  MAINTENANCE: 'border-amber-200 bg-amber-50 text-amber-700',
}

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium',
        statusClasses[status],
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
