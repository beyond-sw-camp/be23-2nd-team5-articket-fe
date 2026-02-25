import { ref } from 'vue'
import { useApi } from './useApi'
import { useRole } from './useRole'
import { getMessageFromResponse } from '../lib/api/client'
import { ENDPOINTS } from '../lib/api/endpoints'

const loading = ref(false)
const error = ref('')
const lastErrorData = ref(null)

export function useAuthApi() {
  const api = useApi()
  const { syncFromToken } = useRole()

  async function signup(payload) {
    loading.value = true
    error.value = ''
    lastErrorData.value = null
    try {
      await api.post(ENDPOINTS.signup(), payload)
      return true
    } catch (e) {
      const data = e.responseData
      lastErrorData.value = data
      // 서버가 준 메시지를 그대로 사용 (client에서 이미 e.message에 넣었지만, response에서 한 번 더 추출)
      error.value = getMessageFromResponse(data) ?? e.message ?? '회원가입 실패'
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

      return { success: true }
    } catch (e) {
      const data = e.responseData ?? e.response?.data
      lastErrorData.value = data
      const msg =
        getMessageFromResponse(data) ??
        (data?.error && typeof data.error === 'object' ? (data.error.error_message ?? data.error.message) : null) ??
        e.message
      const displayMsg = (typeof msg === 'string' && msg.trim() ? msg.trim() : null) || '로그인에 실패했어요.'
      error.value = displayMsg
      return { success: false, message: displayMsg }
    } finally {
      loading.value = false
    }
  }

  return { loading, error, lastErrorData, signup, login }
}
