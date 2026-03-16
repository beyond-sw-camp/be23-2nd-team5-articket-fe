import axios from 'axios'
import { parseErrorResponse } from './parseError'
import { showErrorAlert } from '../../composables/useErrorToast'

export { parseErrorResponse, getMessageFromResponse } from './parseError'

const DEFAULTS = {
  baseUrl: import.meta.env.VITE_API_BASE || 'http://localhost:8080',
}

const REFRESH_PATH = '/member/refresh-at'
// 401 발생 시 자동 재시도(토큰 갱신 후 재요청)를 하면 안 되는, 멱등이 보장되지 않는 POST 엔드포인트 목록
const NON_IDEMPOTENT_RETRY_PATHS = [
  '/concerts/organizer/create', // 공연 생성
]

export function createApiClient(opts = {}) {
  const baseUrl = opts.baseUrl || DEFAULTS.baseUrl

  const api = axios.create({
    baseURL: baseUrl,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  })

  api.interceptors.request.use((config) => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  })

  let refreshPromise = null

  api.interceptors.response.use(
    (res) => res,
    async (err) => {
      const originalRequest = err.config
      const status = err.response?.status

      if (status !== 401 || originalRequest._retried) {
        return Promise.reject(err)
      }
      // 멱등이 보장되지 않는 POST 요청은 401 발생 시 토큰 갱신 후 재요청을 하지 않고 그대로 에러를 반환
      const method = (originalRequest.method || '').toUpperCase()
      if (
        method === 'POST' &&
        originalRequest.url &&
        NON_IDEMPOTENT_RETRY_PATHS.includes(originalRequest.url)
      ) {
        return Promise.reject(err)
      }
      if (originalRequest.url?.includes(REFRESH_PATH) || originalRequest.baseURL + originalRequest.url === baseUrl + REFRESH_PATH) {
        return Promise.reject(err)
      }

      const refreshToken = typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null
      if (!refreshToken) {
        return Promise.reject(err)
      }

      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const { data } = await axios.post(
              baseUrl + REFRESH_PATH,
              { refreshToken },
              { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
            )
            const accessToken = data?.access_token ?? data?.accessToken
            if (accessToken && typeof localStorage !== 'undefined') {
              localStorage.setItem('accessToken', accessToken)
            }
          } finally {
            refreshPromise = null
          }
        })()
      }

      try {
        await refreshPromise
      } catch {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
        return Promise.reject(err)
      }

      originalRequest._retried = true
      originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`
      return api.request(originalRequest)
    }
  )

  async function request(method, path, body, opts = {}) {
    try {
      let response
      switch (method) {
        case 'GET':
          response = await api.get(path)
          break
        case 'POST':
          response = await api.post(path, body)
          break
        case 'PUT':
          response = await api.put(path, body)
          break
        case 'PATCH':
          response = await api.patch(path, body)
          break
        case 'DELETE':
          response = await api.delete(path, body || {})
          break
        default:
          throw new Error(`Unsupported method: ${method}`)
      }
      return response.data
    } catch (error) {
      const status = error.response?.status
      const data = error.response?.data
      const { message, code, details } = parseErrorResponse(data)
      const errMsg = message ?? error.message ?? `API Error (${status ?? 'network'})`
      const err = new Error(errMsg)
      err.status = status
      err.code = code
      err.details = details
      err.responseData = data
      // 403은 각 화면에서 연령 제한/권한 UX에 맞게 처리하도록 글로벌 알럿은 띄우지 않는다.
      if (status !== 403 && !opts.skipErrorAlert) showErrorAlert(err)
      throw err
    }
  }

  return {
    get: (path, opts) => request('GET', path, undefined, opts),
    post: (path, body, opts) => request('POST', path, body, opts),
    put: (path, body, opts) => request('PUT', path, body, opts),
    patch: (path, body, opts) => request('PATCH', path, body, opts),
    del: (path, body, opts) => request('DELETE', path, body, opts),
  }
}
