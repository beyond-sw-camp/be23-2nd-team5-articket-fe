import { ref } from 'vue'
import { useApi } from './useApi'
import { ENDPOINTS } from '../lib/api/endpoints'

const loading = ref(false)
const error = ref('')

export function useSeatHoldMock() {
  const api = useApi()

  async function createHold({ scheduleId, seats }) {
    loading.value = true
    error.value = ''
    try {
      // API 호출 시도
      let result
      try {
        result = await api.post(ENDPOINTS.seatHolds(), { scheduleId, seats })
      } catch (e) {
        // API 실패 시 더미 데이터 생성
        console.warn('API call failed, using dummy data', e)
        const holdId = `hold-${Date.now()}`
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5분 후
        
        result = {
          holdId,
          scheduleId,
          seats,
          expiresAt: expiresAt.toISOString(),
          createdAt: new Date().toISOString()
        }
        
        // localStorage에 저장
        const stored = JSON.parse(localStorage.getItem('seatHolds') || '[]')
        stored.push(result)
        localStorage.setItem('seatHolds', JSON.stringify(stored))
        
        // 좌석 상태를 HOLD로 업데이트
        const scheduleSeats = JSON.parse(localStorage.getItem(`scheduleSeats_${scheduleId}`) || '[]')
        seats.forEach((seatId) => {
          const seat = scheduleSeats.find((s) => s.id === seatId)
          if (seat) {
            seat.status = 'HOLD'
          }
        })
        localStorage.setItem(`scheduleSeats_${scheduleId}`, JSON.stringify(scheduleSeats))
      }
      
      return result
    } catch (e) {
      error.value = e?.message || '선점에 실패했어요.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function getHold(holdId) {
    return await api.get(ENDPOINTS.seatHold(holdId))
  }

  async function releaseHold(holdId) {
    return await api.del(ENDPOINTS.seatHold(holdId))
  }

  return { loading, error, createHold, getHold, releaseHold }
}

