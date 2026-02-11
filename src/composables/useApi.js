import { createApiClient } from '../lib/api/client'

export function useApi() {
  return createApiClient()
}
