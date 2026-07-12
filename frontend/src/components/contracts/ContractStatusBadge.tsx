import { cn } from '@/lib/utils'
import type { ContractStatus } from '@/types/contract'

const statusLabels: Record<ContractStatus, string> = {
  ACTIVE: 'Active',
  ENDED: 'Ended',
  CANCELLED: 'Cancelled',
}

const statusClasses: Record<ContractStatus, string> = {
  ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  ENDED: 'border-slate-200 bg-slate-50 text-slate-700',
  CANCELLED: 'border-red-200 bg-red-50 text-red-700',
}

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
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
