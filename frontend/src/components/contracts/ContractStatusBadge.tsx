import { cn } from '@/lib/utils'
import type { ContractStatus } from '@/types/contract'

const statusLabels: Record<ContractStatus, string> = {
  ACTIVE: 'Active',
  ENDED: 'Ended',
  CANCELLED: 'Cancelled',
}

const statusClasses: Record<ContractStatus, string> = {
  ACTIVE: 'border-[#9ecfb9] bg-[#e8f6e9] text-[#0b654e]',
  ENDED: 'border-[#d8ddd5] bg-[#f1f4ef] text-[#617068]',
  CANCELLED: 'border-[#efb7aa] bg-[#fff1ec] text-[#a34a34]',
}

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
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
