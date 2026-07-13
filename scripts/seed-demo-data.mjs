const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080'
const runId = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
const password = 'Demo123456'

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

async function registerOwner() {
  const email = `owner.demo.${runId}@example.com`
  const auth = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Anh Minh Nguyen',
      email,
      password,
      role: 'OWNER',
    }),
  })

  return { email, token: auth.accessToken }
}

async function createRoom(token, room) {
  return request('/rooms', {
    method: 'POST',
    token,
    body: JSON.stringify(room),
  })
}

async function createTenant(token, tenant, index) {
  return request('/tenants', {
    method: 'POST',
    token,
    body: JSON.stringify({
      ...tenant,
      email: tenant.email.replace('@', `.${runId}.${index}@`),
      password,
    }),
  })
}

async function createContract(token, contract) {
  return request('/contracts', {
    method: 'POST',
    token,
    body: JSON.stringify(contract),
  })
}

async function createBill(token, bill) {
  return request('/bills', {
    method: 'POST',
    token,
    body: JSON.stringify(bill),
  })
}

async function markBillPaid(token, billId) {
  return request(`/bills/${billId}/mark-paid`, {
    method: 'PATCH',
    token,
  })
}

const rooms = [
  ['A101 - Studio balcony', '18 Nguyen Huu Canh, Binh Thanh', 27, 4200000, 'AVAILABLE', 'Bright studio with balcony, private kitchen, and morning light.'],
  ['A102 - Compact garden room', '18 Nguyen Huu Canh, Binh Thanh', 21, 3600000, 'AVAILABLE', 'Ground-floor room near parking area, good for one tenant.'],
  ['B201 - Corner studio', '42 Tran Hung Dao, District 1', 30, 5200000, 'AVAILABLE', 'Corner unit with two windows, quiet hallway, elevator access.'],
  ['B202 - Furnished mini apartment', '42 Tran Hung Dao, District 1', 34, 6500000, 'AVAILABLE', 'Fully furnished room with desk, washer access, and city view.'],
  ['C301 - Rooftop studio', '7 Phan Xich Long, Phu Nhuan', 29, 4800000, 'AVAILABLE', 'Top-floor studio close to cafes and convenience stores.'],
  ['C302 - Maintenance unit', '7 Phan Xich Long, Phu Nhuan', 25, 3900000, 'MAINTENANCE', 'Temporarily offline for repainting and bathroom fixture replacement.'],
  ['D401 - Family room', '95 Cach Mang Thang Tam, District 10', 38, 7000000, 'AVAILABLE', 'Large room suitable for two people, separate sleeping and work zones.'],
  ['D402 - Quiet rear room', '95 Cach Mang Thang Tam, District 10', 24, 4100000, 'AVAILABLE', 'Rear-facing room with less street noise and stable airflow.'],
  ['E501 - River view studio', '2 Ton Duc Thang, District 1', 32, 7600000, 'AVAILABLE', 'Premium studio with river view, high floor, and security desk.'],
  ['E502 - Long-term suite', '2 Ton Duc Thang, District 1', 36, 8200000, 'AVAILABLE', 'Large furnished suite designed for long-term tenants.'],
  ['F601 - Student room', '11 Le Van Sy, District 3', 20, 3300000, 'AVAILABLE', 'Affordable room near bus routes and universities.'],
  ['F602 - Newly renovated room', '11 Le Van Sy, District 3', 23, 3900000, 'AVAILABLE', 'Fresh paint, new lighting, compact layout, shared laundry.'],
].map(([name, address, area, price, status, description]) => ({
  name,
  address,
  area,
  price,
  status,
  description,
}))

const tenants = [
  ['Linh Tran', 'linh.tran@example.com', '0908123456', '079301456821', 'Chi Hoa - 0911222333'],
  ['Bao Nguyen', 'bao.nguyen@example.com', '0917348890', '052302778901', 'Anh Khoa - 0933444555'],
  ['Mai Pham', 'mai.pham@example.com', '0932198765', '031298776543', 'Me Huong - 0988777666'],
  ['Quang Le', 'quang.le@example.com', '0966453321', '024299665432', 'Chi Thao - 0909988776'],
  ['Nhi Vo', 'nhi.vo@example.com', '0888123098', '075300112244', 'Ba Cuong - 0977123456'],
  ['Duc Hoang', 'duc.hoang@example.com', '0899234567', '001302345678', 'Anh Tuan - 0944556677'],
  ['Hanh Do', 'hanh.do@example.com', '0922456789', '048300987654', 'Me Lan - 0903344556'],
  ['Kiet Bui', 'kiet.bui@example.com', '0977788899', '056299123789', 'Chi Vy - 0912888999'],
].map(([name, email, phone, identityNumber, emergencyContact]) => ({
  name,
  email,
  phone,
  identityNumber,
  emergencyContact,
}))

const activeContractRoomIndexes = [0, 2, 3, 4, 6, 8, 9, 10]
const today = new Date()
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

function dateString(date) {
  return date.toISOString().slice(0, 10)
}

function addMonths(date, months) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

function billMonth(offset) {
  return dateString(addMonths(monthStart, offset))
}

function dueDate(offset, day = 25) {
  const next = addMonths(monthStart, offset)
  next.setDate(day)
  return dateString(next)
}

async function main() {
  console.log(`Seeding demo data into ${API_BASE_URL}`)
  const owner = await registerOwner()
  console.log(`Owner: ${owner.email} / ${password}`)

  const createdRooms = []
  for (const room of rooms) {
    createdRooms.push(await createRoom(owner.token, room))
  }
  console.log(`Rooms created: ${createdRooms.length}`)

  const createdTenants = []
  for (let index = 0; index < tenants.length; index += 1) {
    createdTenants.push(await createTenant(owner.token, tenants[index], index + 1))
  }
  console.log(`Tenants created: ${createdTenants.length}`)

  const contracts = []
  for (let index = 0; index < activeContractRoomIndexes.length; index += 1) {
    const room = createdRooms[activeContractRoomIndexes[index]]
    const tenant = createdTenants[index]
    const start = addMonths(monthStart, -index - 1)
    const end = addMonths(monthStart, 12 - (index % 3))

    contracts.push(
      await createContract(owner.token, {
        tenantId: tenant.id,
        roomId: room.id,
        startDate: dateString(start),
        endDate: dateString(end),
        deposit: room.price,
        monthlyRent: room.price,
        status: 'ACTIVE',
      }),
    )
  }
  console.log(`Active contracts created: ${contracts.length}`)

  const bills = []
  for (let index = 0; index < contracts.length; index += 1) {
    const contract = contracts[index]
    const rent = contract.monthlyRent
    const patterns = [
      { offset: -2, status: 'UNPAID', pay: true },
      { offset: -1, status: index % 3 === 0 ? 'OVERDUE' : 'UNPAID', pay: index % 2 === 0 },
      { offset: 0, status: index % 4 === 0 ? 'OVERDUE' : 'UNPAID', pay: false },
    ]

    for (const pattern of patterns) {
      const electricityFee = 180000 + index * 23000 + Math.abs(pattern.offset) * 11000
      const waterFee = 70000 + index * 7000
      const serviceFee = 120000 + (index % 3) * 30000
      const bill = await createBill(owner.token, {
        contractId: contract.id,
        month: billMonth(pattern.offset),
        roomRent: rent,
        electricityFee,
        waterFee,
        serviceFee,
        status: pattern.status,
        dueDate: dueDate(pattern.offset),
      })

      bills.push(pattern.pay ? await markBillPaid(owner.token, bill.id) : bill)
    }
  }
  console.log(`Bills created: ${bills.length}`)
  console.log(`Paid bills: ${bills.filter((bill) => bill.status === 'PAID').length}`)
  console.log(`Unpaid bills: ${bills.filter((bill) => bill.status === 'UNPAID').length}`)
  console.log(`Overdue bills: ${bills.filter((bill) => bill.status === 'OVERDUE').length}`)

  console.log('\nTenant demo accounts:')
  for (const tenant of createdTenants) {
    console.log(`- ${tenant.name}: ${tenant.email} / ${password}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
