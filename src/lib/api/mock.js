import { MOCK_CONCERTS, getVenueForConcert } from '../../mocks/concerts'
import { MOCK_SCHEDULES } from '../../mocks/schedules'
import { MOCK_PROFILE, MOCK_ORDERS } from '../../mocks/orders'
import { MOCK_SEAT_MAPS, MOCK_VENUES } from '../../mocks/venues'
import { SEAT_STATUS, buildInitialSeatsForSeatMap } from '../../mocks/seats'

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function ok(data, status = 200) {
  return { ok: true, status, data }
}

function bad(message, status = 400) {
  return { ok: false, status, error: { message } }
}

function parseUrl(path) {
  const [pathname, qs] = path.split('?')
  const query = Object.fromEntries(new URLSearchParams(qs || '').entries())
  return { pathname, query }
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ---- in-memory state (mock) ----
const state = {
  seatByScheduleId: new Map(), // scheduleId -> seats[]
  holds: new Map(), // holdId -> {holdId,holdToken,expiresAt,scheduleId,seats[]}
  orders: [...MOCK_ORDERS],
  blocklist: [],
  auditLogs: [{ id: 'a-1', at: new Date().toISOString(), action: 'BOOT', actor: 'SYSTEM', detail: 'mock started' }],
}

function ensureSeats(scheduleId) {
  if (state.seatByScheduleId.has(scheduleId)) return state.seatByScheduleId.get(scheduleId)
  const schedule = MOCK_SCHEDULES.find((s) => s.id === scheduleId)
  const seatMap = MOCK_SEAT_MAPS.find((sm) => sm.id === schedule?.seatMapId)
  const initial = buildInitialSeatsForSeatMap(seatMap)

  // seed some sold seats
  for (let i = 0; i < Math.min(12, initial.length); i++) {
    const s = initial[Math.floor(Math.random() * initial.length)]
    s.status = Math.random() < 0.45 ? SEAT_STATUS.SOLD : SEAT_STATUS.AVAILABLE
  }

  state.seatByScheduleId.set(scheduleId, initial)
  return initial
}

function rollbackExpiredHolds() {
  const now = Date.now()
  for (const [holdId, hold] of state.holds.entries()) {
    if (new Date(hold.expiresAt).getTime() > now) continue
    const seats = ensureSeats(hold.scheduleId)
    for (const seatId of hold.seats) {
      const seat = seats.find((s) => s.id === seatId)
      if (seat && seat.status === SEAT_STATUS.HOLD) seat.status = SEAT_STATUS.AVAILABLE
    }
    state.holds.delete(holdId)
  }
}

function maskPII(email) {
  const [u, d] = String(email || '').split('@')
  if (!u || !d) return email
  return `${u.slice(0, 2)}***@${d}`
}

export async function mockFetch(path, init = {}) {
  rollbackExpiredHolds()
  await sleep(250 + Math.floor(Math.random() * 350))

  const { pathname, query } = parseUrl(path)
  const method = (init.method || 'GET').toUpperCase()
  const body = init.body ? JSON.parse(init.body) : undefined

  // ---- GUEST ----
  if (method === 'GET' && pathname === '/concerts') {
    const q = String(query.q || '').toLowerCase()
    const cat = String(query.cat || '')
    const filtered = MOCK_CONCERTS.filter((c) => {
      const matchQ = !q || c.title.toLowerCase().includes(q)
      const matchCat = !cat || c.category === cat
      return matchQ && matchCat
    })
    return ok({ items: filtered })
  }

  if (method === 'GET' && pathname.startsWith('/concerts/')) {
    const parts = pathname.split('/').filter(Boolean)
    const concertId = parts[1]
    if (parts.length === 2) {
      const concert = MOCK_CONCERTS.find((c) => c.id === concertId)
      if (!concert) return bad('concert not found', 404)
      return ok({ ...concert, venue: getVenueForConcert(concert) })
    }
    if (parts.length === 3 && parts[2] === 'schedules') {
      const items = MOCK_SCHEDULES.filter((s) => s.concertId === concertId)
      return ok({ items })
    }
  }

  if (method === 'GET' && pathname.startsWith('/schedules/')) {
    const parts = pathname.split('/').filter(Boolean)
    const scheduleId = parts[1]
    const schedule = MOCK_SCHEDULES.find((s) => s.id === scheduleId)
    if (!schedule) return bad('schedule not found', 404)

    if (parts.length === 2) return ok(schedule)
    if (parts.length === 3 && parts[2] === 'seat-map') {
      const seatMap = MOCK_SEAT_MAPS.find((sm) => sm.id === schedule.seatMapId)
      return ok(seatMap)
    }
    if (parts.length === 3 && parts[2] === 'seats') {
      const seats = ensureSeats(scheduleId)
      return ok({ items: seats })
    }
  }

  // ---- AUTH ----
  if (method === 'POST' && pathname === '/member/create') {
    state.auditLogs.unshift({
      id: `a-${Date.now()}`,
      at: new Date().toISOString(),
      action: 'SIGNUP',
      actor: 'GUEST',
      detail: `email=${maskPII(body?.email)}`,
    })
    return ok({ ok: true })
  }
  if (method === 'POST' && pathname === '/member/doLogin') {
    state.auditLogs.unshift({
      id: `a-${Date.now()}`,
      at: new Date().toISOString(),
      action: 'LOGIN',
      actor: 'GUEST',
      detail: `email=${maskPII(body?.email)}`,
    })
    return ok({ ok: true })
  }

  // ---- USER ----
  if (method === 'GET' && pathname === '/users/me') return ok(MOCK_PROFILE)
  if (method === 'GET' && pathname === '/users/me/orders') return ok({ items: state.orders })
  if (method === 'GET' && pathname.startsWith('/users/me/orders/')) {
    const orderId = pathname.split('/').pop()
    const item = state.orders.find((o) => o.id === orderId)
    if (!item) return bad('order not found', 404)
    return ok(item)
  }

  if (method === 'POST' && pathname === '/seat-holds') {
    const scheduleId = body?.scheduleId
    const seats = Array.isArray(body?.seats) ? body.seats : []
    if (!scheduleId || seats.length === 0) return bad('invalid hold payload', 422)

    const allSeats = ensureSeats(scheduleId)
    for (const seatId of seats) {
      const seat = allSeats.find((s) => s.id === seatId)
      if (!seat || seat.status !== SEAT_STATUS.AVAILABLE) return bad('seat not available', 409)
    }
    for (const seatId of seats) {
      const seat = allSeats.find((s) => s.id === seatId)
      seat.status = SEAT_STATUS.HOLD
    }

    const holdId = `h-${Math.floor(100000 + Math.random() * 900000)}`
    const holdToken = `ht_${Math.random().toString(36).slice(2)}`
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    const hold = { holdId, holdToken, expiresAt, scheduleId, seats }
    state.holds.set(holdId, hold)
    return ok(hold, 201)
  }

  if (method === 'GET' && pathname.startsWith('/seat-holds/')) {
    const holdId = pathname.split('/').pop()
    const hold = state.holds.get(holdId)
    if (!hold) return bad('hold not found (expired)', 404)
    return ok(hold)
  }

  if (method === 'DELETE' && pathname.startsWith('/seat-holds/')) {
    const holdId = pathname.split('/').pop()
    const hold = state.holds.get(holdId)
    if (!hold) return ok({ ok: true })
    const seats = ensureSeats(hold.scheduleId)
    for (const seatId of hold.seats) {
      const seat = seats.find((s) => s.id === seatId)
      if (seat && seat.status === SEAT_STATUS.HOLD) seat.status = SEAT_STATUS.AVAILABLE
    }
    state.holds.delete(holdId)
    return ok({ ok: true })
  }

  if (method === 'POST' && pathname === '/orders') {
    const holdId = body?.holdId
    const hold = state.holds.get(holdId)
    if (!hold) return bad('hold not found (expired)', 404)

    const orderId = `o-${Math.floor(1000 + Math.random() * 9000)}`
    const order = {
      id: orderId,
      concertId: pickRandom(MOCK_CONCERTS).id,
      scheduleId: hold.scheduleId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      totalAmount: 198000,
      seats: hold.seats,
    }
    state.orders.unshift(order)
    state.auditLogs.unshift({
      id: `a-${Date.now()}`,
      at: new Date().toISOString(),
      action: 'CREATE_ORDER',
      actor: 'USER',
      detail: `orderId=${orderId}`,
    })
    return ok(order, 201)
  }

  if (method === 'POST' && pathname === '/payments') {
    state.auditLogs.unshift({
      id: `a-${Date.now()}`,
      at: new Date().toISOString(),
      action: 'PAYMENT_TRIGGER',
      actor: 'USER',
      detail: `mock`,
    })
    return ok({ ok: true }, 201)
  }

  if (method === 'GET' && pathname.startsWith('/orders/')) {
    const parts = pathname.split('/').filter(Boolean)
    const orderId = parts[1]
    const order = state.orders.find((o) => o.id === orderId)
    if (!order) return bad('order not found', 404)

    // simulate polling progress
    if (order.status === 'PENDING' && Math.random() < 0.35) {
      order.status = Math.random() < 0.85 ? 'SUCCESS' : 'FAILED'
      // confirm seats sold on success
      if (order.status === 'SUCCESS') {
        const seats = ensureSeats(order.scheduleId)
        for (const seatId of order.seats) {
          const seat = seats.find((s) => s.id === seatId)
          if (seat) seat.status = SEAT_STATUS.SOLD
        }
      }
    }
    return ok(order)
  }

  if (method === 'POST' && pathname.endsWith('/cancel')) {
    const orderId = pathname.split('/').filter(Boolean)[1]
    const order = state.orders.find((o) => o.id === orderId)
    if (!order) return bad('order not found', 404)
    order.status = 'CANCELLED'
    state.auditLogs.unshift({
      id: `a-${Date.now()}`,
      at: new Date().toISOString(),
      action: 'CANCEL_ORDER',
      actor: 'USER',
      detail: `orderId=${orderId}`,
    })
    return ok({ ok: true })
  }

  // ---- GEO / VENUES ----
  if (method === 'GET' && pathname === '/venue/address') {
    const lat = Number(query.lat || 37.5665)
    const lng = Number(query.lng || 126.978)
    const radiusKm = Number(query.radiusKm || 5)
    const withDistance = MOCK_VENUES.map((v) => {
      const d = haversineKm(lat, lng, v.lat, v.lng)
      return { ...v, distanceKm: Number(d.toFixed(2)) }
    })
      .filter((v) => v.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
    return ok({ items: withDistance, center: { lat, lng }, radiusKm })
  }

  if (method === 'GET' && pathname.startsWith('/venues/')) {
    const parts = pathname.split('/').filter(Boolean)
    const venueId = parts[1]
    const venue = MOCK_VENUES.find((v) => v.id === venueId)
    if (!venue) return bad('venue not found', 404)
    if (parts.length === 2) return ok(venue)
    if (parts.length === 3 && parts[2] === 'concerts') {
      const items = MOCK_CONCERTS.filter((c) => c.venueId === venueId)
      return ok({ items })
    }
  }

  // ---- ORGANIZER ----
  if (pathname === '/organizer/concerts' && method === 'GET') {
    const items = MOCK_CONCERTS.map((c) => {
      const schedules = MOCK_SCHEDULES.filter((s) => s.concertId === c.id)
      const orders = state.orders.filter((o) => o.concertId === c.id)
      const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
      const today = new Date().toISOString().slice(0, 10)
      const todayOpen = schedules.filter((s) => s.status === 'OPEN' && s.startsAt.slice(0, 10) === today).length
      const todayClose = schedules.filter((s) => s.status === 'CLOSED' && s.startsAt.slice(0, 10) === today).length
      return {
        id: c.id,
        title: c.title,
        category: c.category,
        status: c.organizerStatus || 'PUBLISHED',
        scheduleCount: schedules.length,
        orderCount: orders.length,
        revenue,
        todayOpen,
        todayClose,
      }
    })
    return ok({ items })
  }

  if (pathname.startsWith('/organizer/concerts/') && method === 'GET') {
    const parts = pathname.split('/').filter(Boolean)
    const concertId = parts[2]
    const base = MOCK_CONCERTS.find((c) => c.id === concertId)
    if (!base) return bad('concert not found', 404)
    if (parts.length === 3) {
      const schedules = MOCK_SCHEDULES.filter((s) => s.concertId === concertId)
      const orders = state.orders.filter((o) => o.concertId === concertId)
      const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
      return ok({
        id: base.id,
        title: base.title,
        category: base.category,
        status: base.organizerStatus || 'PUBLISHED',
        scheduleCount: schedules.length,
        revenue,
      })
    }
    if (parts.length === 4 && parts[3] === 'schedules') {
      const schedules = MOCK_SCHEDULES.filter((s) => s.concertId === concertId)
      const items = schedules.map((s) => {
        const seats = ensureSeats(s.id)
        const total = seats.length
        const sold = seats.filter((x) => x.status === SEAT_STATUS.SOLD).length
        const hold = seats.filter((x) => x.status === SEAT_STATUS.HOLD).length
        const rate = total === 0 ? 0 : Math.round(((sold + hold) / total) * 100)
        return {
          id: s.id,
          startsAt: s.startsAt,
          status: s.status,
          sold,
          hold,
          total,
          occupancy: rate,
        }
      })
      return ok({ items })
    }
    if (parts.length === 4 && parts[3] === 'orders') {
      const orders = state.orders.filter((o) => o.concertId === concertId)
      const items = orders.map((o) => ({
        id: o.id,
        status: o.status,
        totalAmount: o.totalAmount,
        seats: o.seats,
        createdAt: o.createdAt,
      }))
      return ok({ items })
    }
  }

  if (pathname.startsWith('/organizer/schedules/') && method === 'GET') {
    const parts = pathname.split('/').filter(Boolean)
    const scheduleId = parts[2]
    if (parts.length === 4 && parts[3] === 'stats') {
      const seats = ensureSeats(scheduleId)
      const total = seats.length
      const sold = seats.filter((x) => x.status === SEAT_STATUS.SOLD).length
      const hold = seats.filter((x) => x.status === SEAT_STATUS.HOLD).length
      const available = seats.filter((x) => x.status === SEAT_STATUS.AVAILABLE).length
      return ok({ scheduleId, total, sold, hold, available })
    }
  }

  if (pathname.startsWith('/organizer/orders/') && method === 'GET') {
    const orderId = pathname.split('/').pop()
    const order = state.orders.find((o) => o.id === orderId)
    if (!order) return bad('order not found', 404)
    return ok(order)
  }

  if (pathname.includes('/price-history') && method === 'GET') {
    const concertId = pathname.split('/').filter(Boolean)[2]
    const nowIso = new Date().toISOString()
    return ok({
      concertId,
      items: [
        { id: 'ph-1', changedAt: nowIso, field: 'R석', from: 120000, to: 135000 },
        { id: 'ph-2', changedAt: nowIso, field: 'S석', from: 90000, to: 99000 },
      ],
    })
  }

  if (pathname.includes('/policy-history') && method === 'GET') {
    const concertId = pathname.split('/').filter(Boolean)[2]
    const nowIso = new Date().toISOString()
    return ok({
      concertId,
      items: [
        { id: 'pl-1', changedAt: nowIso, field: '환불 정책', from: '공연 7일 전', to: '공연 5일 전' },
        { id: 'pl-2', changedAt: nowIso, field: '지연 입장', from: '1곡 후', to: '2곡 후' },
      ],
    })
  }

  if (pathname.startsWith('/organizer/')) {
    return ok({ ok: true, stub: true })
  }

  // ---- ADMIN ----
  if (pathname.startsWith('/admin/')) {
    if (method === 'GET' && pathname === '/admin/audit-logs') return ok({ items: state.auditLogs.slice(0, 50) })
    return ok({ ok: true, stub: true })
  }

  return bad(`unhandled mock route: ${method} ${pathname}`, 404)
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

