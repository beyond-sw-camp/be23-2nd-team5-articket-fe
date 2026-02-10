import { mockFetch } from './mock'

const DEFAULTS = {
  baseUrl: 'mock', // later: real api base url
}

export function createApiClient(opts = {}) {
  const baseUrl = opts.baseUrl || DEFAULTS.baseUrl

  async function request(method, path, body) {
    const url = `${baseUrl}${path}`
    const init = {
      method,
      headers: { 'Content-Type': 'application/json' },
    }
    if (body !== undefined) init.body = JSON.stringify(body)

    if (baseUrl === 'mock') {
      const res = await mockFetch(path, init)
      if (!res.ok) throw Object.assign(new Error(res.error?.message || 'Mock API Error'), { status: res.status })
      return res.data
    }

    const res = await fetch(url, init)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw Object.assign(new Error(data?.message || 'API Error'), { status: res.status })
    return data
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    del: (path) => request('DELETE', path),
  }
}

