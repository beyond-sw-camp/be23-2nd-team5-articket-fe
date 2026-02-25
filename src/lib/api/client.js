import axios from 'axios'
import { parseErrorResponse } from './parseError'
import { showErrorAlert } from '../../composables/useErrorToast'

export { parseErrorResponse, getMessageFromResponse } from './parseError'

const DEFAULTS = {
  baseUrl: import.meta.env.VITE_API_BASE || 'http://localhost:8082',
}

const REFRESH_PATH = '/member/refresh-at'

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

      // 403: 권한 없음 → 홈으로 이동
      if (status === 403) {
        if (typeof window !== 'undefined') window.location.href = '/'
        return Promise.reject(err)
      }

      if (status !== 401 || originalRequest._retried) {
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

  async function request(method, path, body) {
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
      if (status !== 403) showErrorAlert(err)
      throw err
    }
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    patch: (path, body) => request('PATCH', path, body),
    del: (path, body) => request('DELETE', path, body),
  }
}
