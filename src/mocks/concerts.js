import { MOCK_VENUES } from './venues'

// ERD 기반: concert 테이블 구조
// id, title, status (DRAFT/PUBLISHED), seat_map_id (FK), age_limit (NULL 가능), member_id (FK)
export const MOCK_CONCERTS = [
  {
    id: 'c-coldplay',
    title: 'COLDPLAY WORLD TOUR',
    status: 'PUBLISHED',
    seat_map_id: 'sm-olympic-1',
    age_limit: null,
    member_id: 1,
  },
  {
    id: 'c-musical-1',
    title: '뮤지컬 〈별의 노래〉',
    status: 'DRAFT',
    seat_map_id: 'sm-blue-1',
    age_limit: null,
    member_id: 1,
  },
  {
    id: 'c-classic-1',
    title: '클래식 나이트: 베토벤',
    status: 'PUBLISHED',
    seat_map_id: 'sm-sejong-1',
    age_limit: null,
    member_id: 1,
  },
]

