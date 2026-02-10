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

export const MOCK_SEAT_MAPS = [
  {
    id: 'sm-olympic-1',
    venueId: 'v-olympic',
    name: '체조경기장 기본맵',
    version: 1,
    status: 'PUBLISHED',
    sections: [
      { key: 'A', rows: 8, cols: 10 },
      { key: 'B', rows: 8, cols: 10 },
      { key: 'C', rows: 6, cols: 8 },
    ],
  },
  {
    id: 'sm-blue-1',
    venueId: 'v-blue',
    name: '블루스퀘어 1층 기본',
    version: 1,
    status: 'PUBLISHED',
    sections: [
      { key: '1F', rows: 10, cols: 12 },
      { key: '2F', rows: 6, cols: 10 },
    ],
  },
  {
    id: 'sm-sejong-1',
    venueId: 'v-sejong',
    name: '세종 대극장 기본',
    version: 1,
    status: 'PUBLISHED',
    sections: [
      { key: 'R', rows: 10, cols: 12 },
      { key: 'S', rows: 8, cols: 12 },
      { key: 'A', rows: 6, cols: 10 },
    ],
  },
]

