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

  async function updateProfile(payload) {
    loading.value = true
    error.value = ''
    try {
      const res = await api.patch(ENDPOINTS.meUpdate(), payload)
      // 성공 후 내 정보 다시 불러오기
      await refetch()
      return res?.data != null ? res.data : res
    } catch (e) {
      error.value = e.message || '프로필 수정에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteAccount() {
    loading.value = true
    error.value = ''
    try {
      const res = await api.del(ENDPOINTS.meDelete())
      clear()
      return res?.data != null ? res.data : res
    } catch (e) {
      error.value = e.message || '회원 탈퇴에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchGenrePreferences() {
    try {
      const res = await api.get(ENDPOINTS.myGenrePreferences())
      return res?.data != null ? res.data : res
    } catch (e) {
      console.error('Failed to fetch genre preferences:', e)
      return []
    }
  }

  async function fetchRecentActivities(params = { page: 0, size: 10 }) {
    try {
      const res = await api.get(ENDPOINTS.myRecentActivities(params))
      return res?.data != null ? res.data : res
    } catch (e) {
      console.error('Failed to fetch recent activities:', e)
      return { content: [], totalPages: 0, totalElements: 0 }
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
    updateProfile,
    deleteAccount,
    fetchGenrePreferences,
    fetchRecentActivities,
    clear
  }
}
