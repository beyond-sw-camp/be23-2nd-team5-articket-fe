import axios from 'axios'

const DEFAULTS = {
  baseUrl: import.meta.env.VITE_API_BASE || 'http://localhost:8082',
}

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
    return config
  })

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
      const errMsg =
        data?.message ??
        (typeof data === 'string' ? data : null) ??
        error.message
      const err = new Error(errMsg || `API Error (${status ?? 'network'})`)
      err.status = status
      err.responseData = data
      throw err
    }
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    del: (path, body) => request('DELETE', path, body),
  }
}
