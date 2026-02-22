import { useApi } from './useApi'
import { ENDPOINTS } from '../lib/api/endpoints'

export function useSeatDefinitionApi() {
  const api = useApi()

  return {
    getBySection: (sectionId) => api.get(ENDPOINTS.adminSeatDefinitionsBySection(sectionId)),
    updateGrade: (definitionId, grade) =>
      api.patch(ENDPOINTS.adminUpdateSeatDefinitionGrade(definitionId), { grade }),
    updateGradeBulk: (sectionId, definitionIds, grade) =>
      api.patch(ENDPOINTS.adminBulkUpdateSeatDefinitionsGrade(sectionId), { definitionIds, grade })
  }
}
