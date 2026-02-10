import { createApiClient } from '../lib/api/client'

const api = createApiClient({ baseUrl: 'mock' })

export function useApi() {
  return api
}

