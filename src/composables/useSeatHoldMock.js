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
      return await api.post(ENDPOINTS.seatHolds(), { scheduleId, seats })
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

