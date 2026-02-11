import { ref } from 'vue'
import { useApi } from './useApi'
import { useRole } from './useRole'
import { ENDPOINTS } from '../lib/api/endpoints'

const loading = ref(false)
const error = ref('')

export function useAuthApi() {
  const api = useApi()
  const { syncFromToken } = useRole()

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

  async function login(payload) {
    loading.value = true
    error.value = ''
    try {
      const raw = await api.post(ENDPOINTS.login(), payload)
      const body = raw?.data != null ? raw.data : raw

      const accessToken = body.access_token ?? body.accessToken
      const refreshToken = body.refresh_token ?? body.refreshToken
      if (!accessToken) {
        throw new Error('로그인 응답에 토큰이 없습니다.')
      }

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken ?? '')
      syncFromToken()

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
