import { MOCK_VENUES } from './venues'

export const MOCK_CONCERTS = [
  {
    id: 'c-coldplay',
    title: 'COLDPLAY WORLD TOUR',
    category: 'concert',
    posterUrl:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=60',
    shortDesc: '드디어 한국 상륙! 역대급 스케일의 공연을 직접 확인하세요.',
    description:
      '전 세계를 뜨겁게 달군 월드 투어. 현장감 넘치는 라이브와 무대 연출을 경험하세요.',
    rating: 4.7,
    priceRange: '₩99,000 ~ ₩198,000',
    statusBadge: '매진임박',
    organizerStatus: 'PUBLISHED',
    venueId: 'v-olympic',
    tags: ['월드투어', '스테디셀러', '대형공연'],
  },
  {
    id: 'c-musical-1',
    title: '뮤지컬 〈별의 노래〉',
    category: 'musical',
    posterUrl:
      'https://images.unsplash.com/photo-1521334726092-b509a19597c1?auto=format&fit=crop&w=1200&q=60',
    shortDesc: '감성으로 채운 오리지널 뮤지컬.',
    description: '삶과 사랑을 노래하는 오리지널 뮤지컬. 배우들의 깊은 호흡을 느껴보세요.',
    rating: 4.5,
    priceRange: '₩70,000 ~ ₩160,000',
    statusBadge: '오픈예정',
    organizerStatus: 'DRAFT',
    venueId: 'v-blue',
    tags: ['오리지널', '감성', 'OST'],
  },
  {
    id: 'c-classic-1',
    title: '클래식 나이트: 베토벤',
    category: 'classic',
    posterUrl:
      'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=1200&q=60',
    shortDesc: '베토벤 교향곡의 정수.',
    description: '오케스트라와 함께하는 베토벤 명곡의 밤. 깊은 울림을 선사합니다.',
    rating: 4.8,
    priceRange: '₩50,000 ~ ₩120,000',
    statusBadge: '판매중',
    organizerStatus: 'ENDED',
    venueId: 'v-sejong',
    tags: ['오케스트라', '명곡', '대극장'],
  },
]

export function getVenueForConcert(concert) {
  return MOCK_VENUES.find((v) => v.id === concert.venueId)
}

