import { ref } from 'vue'
import { useApi } from './useApi'
import { useRole } from './useRole'
import { ENDPOINTS } from '../lib/api/endpoints'

const loading = ref(false)
const error = ref('')

export function useAuthApi() {
  const api = useApi()
  const { setRole } = useRole()

  async function signup(payload) {
    loading.value = true
    error.value = ''
    try {
      await api.post(ENDPOINTS.signup(), payload)
      return true
    } catch (e) {
      error.value = e.message || '회원가입 실패'
      return false
    } finally {
      loading.value = false
    }
  }

  async function login(payload, nextRole = 'USER') {
    loading.value = true
    error.value = ''
    try {
      // 1. Role 설정 API
      await api.post(ENDPOINTS.login(), payload)
      setRole(nextRole)

      // 2. Token 발급 API (동일 payload 재사용)
      const token = await api.post('/member/doLogin', payload)

      // 3. localStorage 저장
      localStorage.setItem('accessToken', token.access_token)
      localStorage.setItem('refreshToken', token.refresh_token)

      return true
    } catch (e) {
      error.value = e.message || '로그인에 실패했어요.'
      return false
    } finally {
      loading.value = false
    }
  }

  return { loading, error, signup, login }
}
