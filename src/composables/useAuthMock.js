import { ref } from 'vue'
import { useApi } from './useApi'
import { useRole } from './useRole'
import { ENDPOINTS } from '../lib/api/endpoints'

const loading = ref(false)
const error = ref('')

export function useAuthMock() {
  const api = useApi()
  const { setRole } = useRole()

  async function signup(payload) {
    loading.value = true
    error.value = ''
    try {
      await api.post(ENDPOINTS.signup(), payload)
      return true
    } catch (e) {
      error.value = e?.message || '회원가입에 실패했어요.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function login(payload, nextRole = 'USER') {
    loading.value = true
    error.value = ''
    try {
      await api.post(ENDPOINTS.login(), payload)
      setRole(nextRole)
      return true
    } catch (e) {
      error.value = e?.message || '로그인에 실패했어요.'
      return false
    } finally {
      loading.value = false
    }
  }

  return { loading, error, signup, login }
}

