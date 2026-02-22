import { ref } from 'vue'
import { useApi } from './useApi'
import { ENDPOINTS } from '../lib/api/endpoints'

const loading = ref(false)
const error = ref('')

export function useSeatHoldMock() {
  const api = useApi()

  function normalizeSeatId(seatId) {
    if (seatId == null) return null
    const num = Number(seatId)
    return Number.isFinite(num) ? num : seatId
  }

  function parseHoldIdToSeatIds(holdId) {
    if (!holdId) return []
    return String(holdId)
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  }

  function buildHoldId(seatIds) {
    return seatIds.map(String).join(',')
  }

  async function createHold({ scheduleId, seats }) {
    loading.value = true
    error.value = ''
    try {
      const seatIds = (Array.isArray(seats) ? seats : [])
        .map(normalizeSeatId)
        .filter((id) => id !== null)
      if (seatIds.length === 0) {
        throw new Error('선점할 좌석을 선택해주세요.')
      }

      // 백엔드 스펙: POST /seat-holds/{seatId}
      await Promise.all(seatIds.map((seatId) => api.post(ENDPOINTS.seatHold(seatId))))

      // 상세 화면 유지용 로컬 메타데이터
      const result = {
        holdId: buildHoldId(seatIds),
        scheduleId,
        seats: seatIds,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      }
      const stored = JSON.parse(localStorage.getItem('seatHolds') || '[]')
      stored.push(result)
      localStorage.setItem('seatHolds', JSON.stringify(stored))
      return result
    } catch (e) {
      error.value = e?.message || '선점에 실패했어요.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function getHold(holdId) {
    const seatIds = parseHoldIdToSeatIds(holdId)
    const stored = JSON.parse(localStorage.getItem('seatHolds') || '[]')
    const found = stored.find((item) => String(item.holdId) === String(holdId))
    if (found) return found
    if (seatIds.length > 0) {
      return {
        holdId,
        scheduleId: null,
        seats: seatIds,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      }
    }
    throw new Error('선점 정보를 찾을 수 없습니다.')
  }

  async function releaseHold(holdId) {
    const seatIds = parseHoldIdToSeatIds(holdId).map(normalizeSeatId).filter((id) => id !== null)
    if (seatIds.length === 0) return null
    // 백엔드 스펙: DELETE /seat-holds/{seatId}
    await Promise.all(seatIds.map((seatId) => api.del(ENDPOINTS.seatHold(seatId))))
    const stored = JSON.parse(localStorage.getItem('seatHolds') || '[]')
    const filtered = stored.filter((item) => String(item.holdId) !== String(holdId))
    localStorage.setItem('seatHolds', JSON.stringify(filtered))
    return null
  }

  return { loading, error, createHold, getHold, releaseHold }
}

