import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { endContractRequest, getContractRequest } from '@/api/contracts'
import { ContractStatusBadge } from '@/components/contracts/ContractStatusBadge'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import { currencyFormatter, formatDateTime } from '@/lib/formatters'
import type { Contract } from '@/types/contract'

export function ContractDetailPage() {
  const { id } = useParams()
  const contractId = Number(id)
  const [contract, setContract] = useState<Contract | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnding, setIsEnding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadContract() {
      setIsLoading(true)
      setError('')

      try {
        const data = await getContractRequest(contractId)
        setContract(data)
      } catch (exception) {
        setError(getErrorMessage(exception, 'Cannot load contract'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadContract()
  }, [contractId])

  async function handleEndContract() {
    if (!window.confirm('End this contract?')) {
      return
    }

    setIsEnding(true)
    setError('')

    try {
      const endedContract = await endContractRequest(contractId)
      setContract(endedContract)
    } catch (exception) {
      setError(getErrorMessage(exception, 'Cannot end contract'))
    } finally {
      setIsEnding(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-72 animate-pulse rounded-lg data-card" />
    )
  }

  if (error && !contract) {
    return (
      <section className="rounded-md border border-red-200 bg-red-50 p-5 text-sm text-destructive">
        {error}
      </section>
    )
  }

  if (!contract) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-lg page-panel p-6 sm:flex-row sm:items-start">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
            <Link to="/owner/contracts">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">
              {contract.roomName}
            </h1>
            <ContractStatusBadge status={contract.status} />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            {contract.tenantName} - {contract.tenantEmail}
          </p>
        </div>

        {contract.status === 'ACTIVE' ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleEndContract()}
            disabled={isEnding}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {isEnding ? 'Ending...' : 'End contract'}
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Start date" value={contract.startDate} />
        <InfoCard label="End date" value={contract.endDate} />
        <InfoCard
          label="Deposit"
          value={currencyFormatter.format(contract.deposit)}
        />
        <InfoCard
          label="Monthly rent"
          value={currencyFormatter.format(contract.monthlyRent)}
        />
        <InfoCard label="Tenant ID" value={contract.tenantId.toString()} />
        <InfoCard label="Room ID" value={contract.roomId.toString()} />
        <InfoCard label="Created" value={formatDateTime(contract.createdAt)} />
        <InfoCard label="Updated" value={formatDateTime(contract.updatedAt)} />
      </div>
    </section>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg data-card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}
