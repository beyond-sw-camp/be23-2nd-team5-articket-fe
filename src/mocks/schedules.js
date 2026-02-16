const now = Date.now()
const day = 24 * 60 * 60 * 1000

// ERD 기반: concert_schedule 테이블 구조
// id, play_time, booking_start, booking_end, status (READY/OPEN/CLOSED), concert_id, concert_thum_img_url, concert_detail_img_url
export const MOCK_SCHEDULES = [
  {
    id: 's-coldplay-1',
    concert_id: 'c-coldplay',
    play_time: new Date(now + 3 * day).toISOString(),
    booking_start: new Date(now + 1 * day).toISOString(),
    booking_end: new Date(now + 2 * day).toISOString(),
    status: 'OPEN',
    concert_thum_img_url: null,
    concert_detail_img_url: null,
  },
  {
    id: 's-coldplay-2',
    concert_id: 'c-coldplay',
    play_time: new Date(now + 4 * day).toISOString(),
    booking_start: new Date(now + 2 * day).toISOString(),
    booking_end: new Date(now + 3 * day).toISOString(),
    status: 'CLOSED',
    concert_thum_img_url: null,
    concert_detail_img_url: null,
  },
  {
    id: 's-musical-1',
    concert_id: 'c-musical-1',
    play_time: new Date(now + 10 * day).toISOString(),
    booking_start: new Date(now + 5 * day).toISOString(),
    booking_end: new Date(now + 9 * day).toISOString(),
    status: 'CLOSED',
    concert_thum_img_url: null,
    concert_detail_img_url: null,
  },
  {
    id: 's-classic-1',
    concert_id: 'c-classic-1',
    play_time: new Date(now + 2 * day).toISOString(),
    booking_start: new Date(now).toISOString(),
    booking_end: new Date(now + 1 * day).toISOString(),
    status: 'OPEN',
    concert_thum_img_url: null,
    concert_detail_img_url: null,
  },
]

