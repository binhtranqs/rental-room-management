import { cn } from '@/lib/utils'
import type { RoomStatus } from '@/types/room'

const statusLabels: Record<RoomStatus, string> = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  MAINTENANCE: 'Maintenance',
}

const statusClasses: Record<RoomStatus, string> = {
  AVAILABLE: 'border-[#9ee7b5] bg-[#eff8d2] text-[#355a2c]',
  OCCUPIED: 'border-[#9ecfb9] bg-[#e8f6e9] text-[#0b654e]',
  MAINTENANCE: 'border-[#ecc77c] bg-[#fff1d7] text-[#8a5425]',
}

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  return (
    <span
      className={cn(
        'status-badge border',
        statusClasses[status],
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
