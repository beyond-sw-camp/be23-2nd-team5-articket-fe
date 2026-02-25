export const ENDPOINTS = {
  // GUEST
  concerts: () => `/concerts`,
  concert: (concertId) => `/concerts/${concertId}`,
  concertSchedules: (concertId) => `/concerts/${concertId}/schedules`,
  schedule: (scheduleId) => `/schedules/${scheduleId}`,
  seatMap: (scheduleId) => `/schedules/${scheduleId}/seat-map`,
  seats: (scheduleId) => `/schedule/${scheduleId}/seats`,

  // AUTH
  signup: () => `/member/create`,
  login: () => `/member/doLogin`,
  refreshAt: () => `/member/refresh-at`,
  inicis: () => `/member/inicis`,

  // USER
  me: () => `/users/me`,
  requestOrganizer: () => `/users/requestOrganizer`,
  myOrders: () => `/users/me/orders`,
  myOrder: (orderId) => `/users/me/orders/${orderId}`,
  seatHold: (seatId) => `/seat-holds/${seatId}`,
  orders: () => `/orders`,
  payment: () => `/payment`,
  order: (orderId) => `/order/${orderId}`,
  orderCancel: (orderId) => `/orders/${orderId}/cancel`,
  concertLike: (concertId) => `/user-concerts/${concertId}/like`,
  concertReview: (concertId) => `/user-concerts/${concertId}/review`,
  concertUserInteraction: (concertId) => `/user-concerts/${concertId}/user-interaction`,
  concertStats: (concertId) => `/user-concerts/${concertId}/stats`,
  concertReviews: (concertId) => `/user-concerts/${concertId}/reviews`,

  // ORGANIZER (백엔드 ConcertController 기준)
  organizerConcerts: () => `/concerts/organizer`,
  organizerConcertStats: (concertId) => `/concerts/organizer/${concertId}/stats`,
  organizerCreateConcert: () => `/concerts/organizer/create`,
  organizerUpdateConcert: (concertId) => `/concerts/organizer/${concertId}`,
  organizerPublishConcert: (concertId) => `/concerts/organizer/${concertId}/publish`,
  organizerCreateSchedule: (concertId) => `/concerts/organizer/${concertId}/schedules`,
  organizerBulkCreateSchedules: (concertId) => `/concerts/organizer/${concertId}/schedules/bulk`,
  organizerUpdateSchedule: (scheduleId) => `/concerts/organizer/schedules/${scheduleId}`,
  concertPolicies: (concertId) => `/concerts/${concertId}/policies`,
  organizerCreatePolicy: (concertId) => `/concerts/organizer/${concertId}/policies`,
  organizerUpdatePolicy: (policyId) => `/concerts/organizer/policies/${policyId}`,
  organizerDeletePolicy: (policyId) => `/concerts/organizer/policies/${policyId}`,
  organizerConcertOrders: (concertId) => `/concerts/organizer/${concertId}/orders`,
  organizerOrder: (orderId) => `/concerts/organizer/orders/${orderId}`,
  organizerPriceHistory: (concertId) => `/concerts/organizer/${concertId}/prices/history`,
  organizerPolicyHistory: (concertId) => `/concerts/organizer/${concertId}/policies/history`,

  // ADMIN (venue: base /venues, admin actions under /venues/admin/...)
  adminCreateVenue: () => `/venues/admin/create`,
  adminVenueList: (params = {}) => {
    const p = new URLSearchParams()
    if (params.page != null) p.set('page', params.page)
    if (params.size != null) p.set('size', params.size)
    const q = p.toString()
    return `/venues${q ? `?${q}` : ''}`
  },
  adminVenueDetail: (venueId) => `/venues/${venueId}`,
  adminUpdateVenue: (venueId) => `/venues/admin/update/${venueId}`,
  venueSeatMapsList: (venueId, params = {}) => {
    const p = new URLSearchParams()
    if (params.page != null) p.set('page', params.page)
    if (params.size != null) p.set('size', params.size)
    const q = p.toString()
    return `/venues/${venueId}/seat-maps${q ? `?${q}` : ''}`
  },
  adminVenueSeatMapsList: (venueId, params = {}) => {
    const p = new URLSearchParams()
    if (params.page != null) p.set('page', params.page)
    if (params.size != null) p.set('size', params.size)
    const q = p.toString()
    return `/venues/admin/${venueId}/seat-maps${q ? `?${q}` : ''}`
  },
  adminCreateSeatMap: () => `/seat-maps/admin/create`,
  adminCreateSeatMapWithSections: () => `/seat-maps/admin/createWithSections`,
  adminAddSeatMapSection: (seatMapId) => `/seat-maps/admin/${seatMapId}/create`,
  adminSeatMapDetail: (seatMapId) => `/seat-maps/admin/${seatMapId}`,
  adminUpdateSeatMapName: (seatMapId) => `/seat-maps/admin/updateName/${seatMapId}`,
  adminUpdateSeatMapStatus: (seatMapId, status) => `/seat-maps/admin/updateStatus/${seatMapId}?status=${status}`,
  adminPublishSeatMap: (seatMapId) => `/seat-maps/admin/updateStatus/${seatMapId}?status=PUBLISHED`,
  adminUpdateSeatMapLayout: (seatMapId) => `/seat-maps/admin/${seatMapId}/layout`,
  adminSeatDefinitionsBySection: (sectionId) => `/seat-definitions/admin/sections/${sectionId}/definitions`,
  adminUpdateSeatDefinitionGrade: (definitionId) => `/seat-definitions/admin/definitions/${definitionId}/grade`,
  adminBulkUpdateSeatDefinitionsGrade: (sectionId) => `/seat-definitions/admin/sections/${sectionId}/definitions/grade`,
  adminSeatSectionsBySeatMap: (seatMapId) => `/seat-sections/admin/${seatMapId}`,
  adminUpdateSeatSection: (sectionId) => `/seat-sections/admin/update/${sectionId}`,
  adminDeleteSeatSection: (sectionId) => `/seat-sections/admin/${sectionId}`,
  adminBlocklist: () => `/admin/blocklist`,
  adminUnblock: (id) => `/admin/blocklist/${id}`,
  adminAuditLogs: () => `/admin/audit-logs`,
  adminPendingOrganizers: (params = {}) => {
    const p = new URLSearchParams()
    if (params.page != null) p.set('page', params.page)
    if (params.size != null) p.set('size', params.size)
    const q = p.toString()
    return `/admin/pending-organizers${q ? `?${q}` : ''}`
  },
  adminApproveOrganizer: (id) => `/admin/organizer-requests/${id}/approve`,
  adminRejectOrganizer: (id) => `/admin/organizer-requests/${id}/reject`,

  // GEO / VENUES
  venueNearby: ({ latitude, longitude, radiusKm, page, size }) =>
    `/venues/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}&page=${page}&size=${size}`,
  venue: (venueId) => `/venues/${venueId}`,
  venueConcerts: (venueId) => `/venues/${venueId}/concerts`,
  venues: () => `/venues`,
  venueSeatMaps: (venueId, params) => ENDPOINTS.venueSeatMapsList(venueId, params || {}),

  // PERFORMERS (COMMON / MEMBER / ORGANIZER)
  performers: (params = {}) => {
    const p = new URLSearchParams()
    if (params.name != null && params.name !== '') p.set('name', params.name)
    if (params.page != null) p.set('page', params.page)
    if (params.size != null) p.set('size', params.size)
    const q = p.toString()
    return `/performers${q ? `?${q}` : ''}`
  },
  performerDetail: (performerId) => `/performers/${performerId}`,
  performerConcerts: (performerId) => `/performers/${performerId}/concerts`,
  performerSchedules: (performerId) => `/performers/${performerId}/schedules`,
  performerLike: () => `/performers/like`,
  performerDeleteLike: () => `/performers/deleteLike`,
  performerLikeList: () => `/performers/likeList`,
  performerCreate: () => `/performers/create`,

  // SCHEDULE CASTINGS (COMMON read / ORGANIZER write)
  schedulePerformers: (scheduleId) => `/schedules/${scheduleId}/performers`,
  schedulePerformerDetail: (scheduleId, performerId) => `/schedules/${scheduleId}/performers/${performerId}`,
  scheduleOrganizerAddPerformer: (scheduleId) => `/schedules/organizer/${scheduleId}/performers`,
  scheduleOrganizerUpdatePerformer: (scheduleId, performerId) => `/schedules/organizer/${scheduleId}/performers/${performerId}`,
  scheduleOrganizerDeletePerformer: (scheduleId, performerId) => `/schedules/organizer/${scheduleId}/performers/${performerId}`,
}

