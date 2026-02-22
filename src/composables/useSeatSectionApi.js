import { useApi } from './useApi'
import { ENDPOINTS } from '../lib/api/endpoints'

export function useSeatSectionApi() {
  const api = useApi()

  return {
    getBySeatMap: (seatMapId) => api.get(ENDPOINTS.adminSeatSectionsBySeatMap(seatMapId)),
    updateSection: (sectionId, sectionDto) => api.put(ENDPOINTS.adminUpdateSeatSection(sectionId), sectionDto),
    deleteSection: (sectionId) => api.del(ENDPOINTS.adminDeleteSeatSection(sectionId))
  }
}
