const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080'
const runId = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
const password = 'Demo123456'

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} failed: ${response.status} ${text}`)
  }

  return data
}

function todayOffset(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

async function main() {
  console.log(`Smoke testing business workflow against ${API_BASE_URL}`)

  const ownerEmail = `smoke.owner.${runId}@example.com`
  const tenantEmail = `smoke.tenant.${runId}@example.com`

  const ownerAuth = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Smoke Owner',
      email: ownerEmail,
      password,
      role: 'OWNER',
    }),
  })
  assert(ownerAuth.accessToken, 'Owner register did not return an access token')
  const ownerToken = ownerAuth.accessToken

  const ownerLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: ownerEmail, password }),
  })
  assert(ownerLogin.accessToken, 'Owner login did not return an access token')

  const room = await request('/rooms', {
    method: 'POST',
    token: ownerToken,
    body: JSON.stringify({
      name: `Smoke room ${runId}`,
      address: '88 Nguyen Hue, District 1',
      area: 27.5,
      price: 5200000,
      status: 'AVAILABLE',
      description: 'Smoke workflow room for deploy verification.',
    }),
  })
  assert(room.status === 'AVAILABLE', 'New room should start as available')

  const tenant = await request('/tenants', {
    method: 'POST',
    token: ownerToken,
    body: JSON.stringify({
      name: 'Smoke Tenant',
      email: tenantEmail,
      password,
      phone: '0909000001',
      identityNumber: `SMOKE${runId}`,
      emergencyContact: 'Smoke Contact - 0909000002',
    }),
  })
  assert(tenant.email === tenantEmail, 'Tenant account email mismatch')

  const contract = await request('/contracts', {
    method: 'POST',
    token: ownerToken,
    body: JSON.stringify({
      tenantId: tenant.id,
      roomId: room.id,
      startDate: todayOffset(0),
      endDate: todayOffset(180),
      deposit: 5200000,
      monthlyRent: 5200000,
      status: 'ACTIVE',
    }),
  })
  assert(contract.status === 'ACTIVE', 'Contract should be active')
  assert(contract.roomStatus === 'OCCUPIED', 'Active contract should occupy the room')

  const bill = await request('/bills', {
    method: 'POST',
    token: ownerToken,
    body: JSON.stringify({
      contractId: contract.id,
      month: todayOffset(0).slice(0, 7) + '-01',
      roomRent: 5200000,
      electricityFee: 320000,
      waterFee: 90000,
      serviceFee: 180000,
      status: 'UNPAID',
      dueDate: todayOffset(7),
    }),
  })
  assert(bill.status === 'UNPAID', 'Bill should start unpaid')

  const tenantLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: tenantEmail, password }),
  })
  assert(tenantLogin.accessToken, 'Tenant login did not return an access token')
  const tenantToken = tenantLogin.accessToken

  const tenantBills = await request('/bills?page=0&size=20', { token: tenantToken })
  assert(
    tenantBills.content.some((item) => item.id === bill.id),
    'Tenant should see their own bill',
  )
  assert(
    tenantBills.content.every((item) => item.tenantEmail === tenantEmail),
    'Tenant bill list should only contain their own bills',
  )

  const tenantBill = await request(`/bills/${bill.id}`, { token: tenantToken })
  assert(tenantBill.id === bill.id, 'Tenant should open their own bill detail')

  const payment = await request('/payments/mock', {
    method: 'POST',
    token: tenantToken,
    body: JSON.stringify({
      billId: bill.id,
      method: 'MOCK_BANK_TRANSFER',
    }),
  })
  assert(payment.status === 'SUCCESS', 'Mock payment should succeed')

  const paidBill = await request(`/bills/${bill.id}`, { token: ownerToken })
  assert(paidBill.status === 'PAID', 'Paid bill should update bill status')

  const dashboard = await request('/dashboard/owner', { token: ownerToken })
  assert(dashboard.monthlyRevenue > 0, 'Owner dashboard revenue should include paid bill')

  const endedContract = await request(`/contracts/${contract.id}/end`, {
    method: 'PATCH',
    token: ownerToken,
  })
  assert(endedContract.status === 'ENDED', 'Ended contract should have ENDED status')
  assert(endedContract.roomStatus === 'AVAILABLE', 'Ended contract should release room')

  const releasedRoom = await request(`/rooms/${room.id}`, { token: ownerToken })
  assert(releasedRoom.status === 'AVAILABLE', 'Room should remain available after ending contract')

  console.log('Smoke workflow passed')
  console.log(`Owner:  ${ownerEmail} / ${password}`)
  console.log(`Tenant: ${tenantEmail} / ${password}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
