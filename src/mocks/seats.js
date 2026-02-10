export const SEAT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  HOLD: 'HOLD',
  SOLD: 'SOLD',
}

export const SEAT_GRADE = {
  VIP: 'VIP',
  R: 'R',
  S: 'S',
  A: 'A',
}

export function buildInitialSeatsForSeatMap(seatMap) {
  const seats = []
  for (const sec of seatMap.sections) {
    for (let r = 1; r <= sec.rows; r++) {
      for (let c = 1; c <= sec.cols; c++) {
        const grade = sec.key === 'A' || sec.key === 'R' ? SEAT_GRADE.VIP : sec.key === 'B' ? SEAT_GRADE.R : SEAT_GRADE.S
        seats.push({
          id: `${sec.key}-${r}-${c}`,
          section: sec.key,
          row: r,
          col: c,
          grade,
          status: SEAT_STATUS.AVAILABLE,
        })
      }
    }
  }
  return seats
}

export function seatColorClass(status) {
  if (status === SEAT_STATUS.SOLD) return 'bg-slate-300 border-slate-300'
  if (status === SEAT_STATUS.HOLD) return 'bg-amber-200 border-amber-200'
  return 'bg-emerald-200 border-emerald-200'
}

