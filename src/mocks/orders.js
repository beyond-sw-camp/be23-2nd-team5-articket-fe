const now = Date.now()

export const MOCK_PROFILE = {
  id: 'u-1',
  name: '홍길동',
  email: 'hong@example.com',
  phone: '010-1234-5678',
  grade: 'SILVER',
}

export const MOCK_ORDERS = [
  {
    id: 'o-1001',
    concertId: 'c-coldplay',
    scheduleId: 's-coldplay-1',
    status: 'SUCCESS', // PENDING | SUCCESS | FAILED | CANCELLED
    createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    totalAmount: 198000,
    seats: ['A-1-1', 'A-1-2'],
  },
  {
    id: 'o-1002',
    concertId: 'c-classic-1',
    scheduleId: 's-classic-1',
    status: 'CANCELLED',
    createdAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
    totalAmount: 120000,
    seats: ['R-2-3'],
  },
]

