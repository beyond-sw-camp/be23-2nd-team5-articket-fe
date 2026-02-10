import { ref } from 'vue'
import { SEAT_STATUS } from '../mocks/seats'

export function useRealtimeSeatMock() {
  const enabled = ref(false)

  function toggle() {
    enabled.value = !enabled.value
  }

  function applyRandomMutation(seats) {
    if (!enabled.value) return seats
    const copy = seats.map((s) => ({ ...s }))
    const n = Math.min(8, copy.length)
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * copy.length)
      const seat = copy[idx]
      const r = Math.random()
      seat.status = r < 0.2 ? SEAT_STATUS.SOLD : r < 0.55 ? SEAT_STATUS.HOLD : SEAT_STATUS.AVAILABLE
    }
    return copy
  }

  return { enabled, toggle, applyRandomMutation }
}

