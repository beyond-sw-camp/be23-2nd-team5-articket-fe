import { ref, computed } from 'vue'
import { useApi } from './useApi'
import { ENDPOINTS } from '../lib/api/endpoints'

const profile = ref(null)
const loading = ref(false)
const error = ref('')

export function useMe() {
  const api = useApi()

  const organizerStatus = computed(() => profile.value?.organizerStatus ?? null)
  const isOrganizerPending = computed(() => organizerStatus.value === 'PENDING')

  async function refetch() {
    loading.value = true
    error.value = ''
    try {
      const res = await api.get(ENDPOINTS.me())
      const body = res?.data != null ? res.data : res
      profile.value = body ?? null
      return profile.value
    } catch (e) {
      error.value = e.message || '내 정보를 불러오지 못했습니다.'
      profile.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  function clear() {
    profile.value = null
    error.value = ''
  }

  return {
    profile,
    loading,
    error,
    organizerStatus,
    isOrganizerPending,
    refetch,
    clear
  }
}
