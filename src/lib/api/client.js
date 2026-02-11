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
      const errMsg = error.response?.data?.message || error.message
      throw Object.assign(new Error(errMsg || 'API Error'), {
        status: error.response?.status || 500
      })
    }
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    del: (path, body) => request('DELETE', path, body),
  }
}
