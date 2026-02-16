const now = Date.now()

export const MOCK_PROFILE = {
  id: 'u-1',
  name: '홍길동',
  email: 'hong@example.com',
  phone: '010-1234-5678',
  grade: 'SILVER',
}

// ERD 기반: order 테이블 구조 (참고용)
export const MOCK_ORDERS = [
  {
    id: 'o-1001',
    concert_id: 'c-coldplay', // ERD: concert_id (FK)
    schedule_id: 's-coldplay-1', // ERD: schedule_id (FK)
    status: 'SUCCESS', // PENDING | SUCCESS | FAILED | CANCELLED
    created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    total_amount: 198000,
    seats: ['A-1-1', 'A-1-2'],
  },
  {
    id: 'o-1002',
    concert_id: 'c-classic-1',
    schedule_id: 's-classic-1',
    status: 'CANCELLED',
    created_at: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
    total_amount: 120000,
    seats: ['R-2-3'],
  },
]

