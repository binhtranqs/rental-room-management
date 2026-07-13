import { cn } from '@/lib/utils'
import type { BillStatus } from '@/types/bill'

const statusLabels: Record<BillStatus, string> = {
  UNPAID: 'Unpaid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
}

const statusClasses: Record<BillStatus, string> = {
  UNPAID: 'border-[#ecc77c] bg-[#fff1d7] text-[#8a5425]',
  PAID: 'border-[#9ecfb9] bg-[#e8f6e9] text-[#0b654e]',
  OVERDUE: 'border-[#efb7aa] bg-[#fff1ec] text-[#a34a34]',
}

export function BillStatusBadge({ status }: { status: BillStatus }) {
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
