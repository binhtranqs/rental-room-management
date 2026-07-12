import { cn } from '@/lib/utils'
import type { BillStatus } from '@/types/bill'

const statusLabels: Record<BillStatus, string> = {
  UNPAID: 'Unpaid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
}

const statusClasses: Record<BillStatus, string> = {
  UNPAID: 'border-amber-200 bg-amber-50 text-amber-700',
  PAID: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  OVERDUE: 'border-red-200 bg-red-50 text-red-700',
}

export function BillStatusBadge({ status }: { status: BillStatus }) {
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
