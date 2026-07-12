import { Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import type {
  Tenant,
  TenantCreatePayload,
  TenantUpdatePayload,
} from '@/types/tenant'

type TenantFormProps = {
  initialTenant?: Tenant
  isSubmitting: boolean
  mode: 'create' | 'edit'
  submitLabel: string
  onSubmit: (payload: TenantCreatePayload | TenantUpdatePayload) => Promise<void>
}

export function TenantForm({
  initialTenant,
  isSubmitting,
  mode,
  submitLabel,
  onSubmit,
}: TenantFormProps) {
  const [name, setName] = useState(initialTenant?.name ?? '')
  const [email, setEmail] = useState(initialTenant?.email ?? '')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState(initialTenant?.phone ?? '')
  const [identityNumber, setIdentityNumber] = useState(
    initialTenant?.identityNumber ?? '',
  )
  const [emergencyContact, setEmergencyContact] = useState(
    initialTenant?.emergencyContact ?? '',
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = {
      name,
      email,
      phone,
      identityNumber,
      emergencyContact,
    }

    if (mode === 'create') {
      await onSubmit({
        ...payload,
        password,
      })
      return
    }

    await onSubmit(payload)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Name</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">Email</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
      </div>

      {mode === 'create' ? (
        <label className="block">
          <span className="text-sm font-medium text-foreground">Password</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
            type="password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Phone</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">
            Identity number
          </span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
            value={identityNumber}
            onChange={(event) => setIdentityNumber(event.target.value)}
            required
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-foreground">
          Emergency contact
        </span>
        <input
          className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
          value={emergencyContact}
          onChange={(event) => setEmergencyContact(event.target.value)}
        />
      </label>

      <Button disabled={isSubmitting}>
        <Save className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
