const now = Date.now()
const day = 24 * 60 * 60 * 1000

export const MOCK_SCHEDULES = [
  {
    id: 's-coldplay-1',
    concertId: 'c-coldplay',
    startsAt: new Date(now + 3 * day).toISOString(),
    status: 'OPEN', // OPEN | CLOSED
    seatMapId: 'sm-olympic-1',
    summary: { minPrice: 99000, maxPrice: 198000 },
  },
  {
    id: 's-coldplay-2',
    concertId: 'c-coldplay',
    startsAt: new Date(now + 4 * day).toISOString(),
    status: 'CLOSED',
    seatMapId: 'sm-olympic-1',
    summary: { minPrice: 99000, maxPrice: 198000 },
  },
  {
    id: 's-musical-1',
    concertId: 'c-musical-1',
    startsAt: new Date(now + 10 * day).toISOString(),
    status: 'CLOSED',
    seatMapId: 'sm-blue-1',
    summary: { minPrice: 70000, maxPrice: 160000 },
  },
  {
    id: 's-classic-1',
    concertId: 'c-classic-1',
    startsAt: new Date(now + 2 * day).toISOString(),
    status: 'OPEN',
    seatMapId: 'sm-sejong-1',
    summary: { minPrice: 50000, maxPrice: 120000 },
  },
]

