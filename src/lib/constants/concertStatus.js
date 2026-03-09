export const CONCERT_STATUS = {
  RESERVED: 'RESERVED',
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
  CLOSED: 'CLOSED',
}

const STATUS_CONFIG = {
  [CONCERT_STATUS.RESERVED]: {
    label: '오픈 예정',
    tone: 'soft',
    color: 'amber',
  },
  [CONCERT_STATUS.AVAILABLE]: {
    label: '예매 중',
    tone: 'soft',
    color: 'green',
  },
  [CONCERT_STATUS.UNAVAILABLE]: {
    label: '예매 중지',
    tone: 'soft',
    color: 'red',
  },
  [CONCERT_STATUS.CLOSED]: {
    label: '공연 종료',
    tone: 'soft',
    color: 'slate',
  },
}

export function getConcertStatusConfig(status) {
  if (!status) return null
  const key = String(status).toUpperCase()
  return STATUS_CONFIG[key] ?? null
}

