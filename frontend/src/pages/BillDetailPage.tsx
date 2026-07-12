import { ArrowLeft, Banknote, CheckCircle2, ExternalLink, QrCode } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getBillRequest, markBillPaidRequest } from '@/api/bills'
import { createMockPaymentRequest, createMomoPaymentRequest } from '@/api/payments'
import { useAuth } from '@/auth/useAuth'
import { BillStatusBadge } from '@/components/bills/BillStatusBadge'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import { currencyFormatter, formatDateTime } from '@/lib/formatters'
import type { Bill } from '@/types/bill'
import type { PaymentMethod } from '@/types/payment'

export function BillDetailPage() {
  const { user } = useAuth()
  const { id } = useParams()
  const billId = Number(id)
  const [bill, setBill] = useState<Bill | null>(null)
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('MOCK_BANK_TRANSFER')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isMomoRedirecting, setIsMomoRedirecting] = useState(false)
  const [error, setError] = useState('')

  const listPath = user?.role === 'TENANT' ? '/tenant/bills' : '/owner/bills'
  const canPay = user?.role === 'TENANT' && bill?.status !== 'PAID'
  const canMarkPaid = user?.role === 'OWNER' && bill?.status !== 'PAID'

  useEffect(() => {
    async function loadBill() {
      setIsLoading(true)
      setError('')

      try {
        const data = await getBillRequest(billId)
        setBill(data)
      } catch (exception) {
        setError(getErrorMessage(exception, 'Cannot load bill'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadBill()
  }, [billId])

  async function handleMarkPaid() {
    setIsUpdating(true)
    setError('')

    try {
      const paidBill = await markBillPaidRequest(billId)
      setBill(paidBill)
    } catch (exception) {
      setError(getErrorMessage(exception, 'Cannot mark bill as paid'))
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleMockPayment() {
    setIsUpdating(true)
    setError('')

    try {
      await createMockPaymentRequest(billId, paymentMethod)
      const paidBill = await getBillRequest(billId)
      setBill(paidBill)
    } catch (exception) {
      setError(getErrorMessage(exception, 'Cannot pay bill'))
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleMomoPayment() {
    setIsMomoRedirecting(true)
    setError('')

    try {
      const payment = await createMomoPaymentRequest(billId)

      if (!payment.payUrl) {
        setError(payment.message ?? 'MoMo did not return a payment URL')
        setIsMomoRedirecting(false)
        return
      }

      window.location.assign(payment.payUrl)
    } catch (exception) {
      setError(getErrorMessage(exception, 'Cannot create MoMo payment'))
      setIsMomoRedirecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-72 animate-pulse rounded-md border border-border bg-card shadow-sm" />
    )
  }

  if (error && !bill) {
    return (
      <section className="rounded-md border border-red-200 bg-red-50 p-5 text-sm text-destructive">
        {error}
      </section>
    )
  }

  if (!bill) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-md border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-start">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
            <Link to={listPath}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-foreground">
              {bill.roomName}
            </h1>
            <BillStatusBadge status={bill.status} />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            {bill.tenantName} - {bill.month}
          </p>
        </div>

        {canMarkPaid ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleMarkPaid()}
            disabled={isUpdating}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {isUpdating ? 'Updating...' : 'Mark paid'}
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Room rent" value={currencyFormatter.format(bill.roomRent)} />
        <InfoCard
          label="Electricity"
          value={currencyFormatter.format(bill.electricityFee)}
        />
        <InfoCard label="Water" value={currencyFormatter.format(bill.waterFee)} />
        <InfoCard
          label="Service"
          value={currencyFormatter.format(bill.serviceFee)}
        />
        <InfoCard label="Total" value={currencyFormatter.format(bill.totalAmount)} />
        <InfoCard label="Due date" value={bill.dueDate} />
        <InfoCard label="Contract ID" value={bill.contractId.toString()} />
        <InfoCard
          label="Paid at"
          value={bill.paidAt ? formatDateTime(bill.paidAt) : 'Not paid'}
        />
      </div>

      {canPay ? (
        <article className="rounded-md border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Payment</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div className="rounded-md border border-border bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-pink-50 text-pink-600">
                  <QrCode className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-medium text-foreground">MoMo sandbox</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Create a MoMo payment request and continue on the MoMo page.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                className="mt-4 w-full sm:w-auto"
                onClick={() => void handleMomoPayment()}
                disabled={isUpdating || isMomoRedirecting}
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                {isMomoRedirecting ? 'Redirecting...' : 'Pay with MoMo'}
              </Button>
            </div>

            <div className="rounded-md border border-border bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary">
                  <Banknote className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-medium text-foreground">Mock payment</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Complete this bill immediately in local development.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <select
                  className="h-10 rounded-md border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value as PaymentMethod)
                  }
                >
                  <option value="MOCK_BANK_TRANSFER">MOCK_BANK_TRANSFER</option>
                  <option value="MOCK_CASH">MOCK_CASH</option>
                  <option value="MOCK_E_WALLET">MOCK_E_WALLET</option>
                </select>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleMockPayment()}
                  disabled={isUpdating || isMomoRedirecting}
                >
                  <Banknote className="h-4 w-4" aria-hidden="true" />
                  {isUpdating ? 'Paying...' : 'Pay mock'}
                </Button>
              </div>
            </div>
          </div>
        </article>
      ) : null}
    </section>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}
