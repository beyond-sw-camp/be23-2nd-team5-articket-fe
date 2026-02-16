export const MOCK_VENUES = [
  {
    id: 'v-olympic',
    name: '올림픽공원 체조경기장',
    address: '서울 송파구 올림픽로 424',
    description: '대형 콘서트가 열리는 대표 공연장입니다.',
    lat: 37.5163,
    lng: 127.1219,
    seatMapIds: ['sm-olympic-1'],
  },
  {
    id: 'v-blue',
    name: '블루스퀘어',
    address: '서울 용산구 이태원로 294',
    description: '뮤지컬/공연에 최적화된 복합문화공간입니다.',
    lat: 37.5394,
    lng: 126.9993,
    seatMapIds: ['sm-blue-1'],
  },
  {
    id: 'v-sejong',
    name: '세종문화회관',
    address: '서울 종로구 세종대로 175',
    description: '클래식/공연의 중심, 세종문화회관입니다.',
    lat: 37.5725,
    lng: 126.9769,
    seatMapIds: ['sm-sejong-1'],
  },
]

// ERD 기반: seat_map 테이블 구조
// id, version (NULL 가능), status (DRAFT/PUBLISHED/ARCHIVED, NULL 가능), row_count (NOT NULL), col_count (NOT NULL), venue_id (NOT NULL)
export const MOCK_SEAT_MAPS = [
  {
    id: 'sm-olympic-1',
    venue_id: 'v-olympic',
    row_count: 22,
    col_count: 10,
    version: 1,
    status: 'PUBLISHED',
  },
  {
    id: 'sm-blue-1',
    venue_id: 'v-blue',
    row_count: 16,
    col_count: 12,
    version: 1,
    status: 'PUBLISHED',
  },
  {
    id: 'sm-sejong-1',
    venue_id: 'v-sejong',
    row_count: 24,
    col_count: 12,
    version: 1,
    status: 'PUBLISHED',
  },
]

