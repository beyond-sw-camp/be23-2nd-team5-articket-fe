export const ENDPOINTS = {
  // GUEST
  concerts: () => `/concerts`,
  concert: (concertId) => `/concerts/${concertId}`,
  concertSchedules: (concertId) => `/concerts/${concertId}/schedules`,
  schedule: (scheduleId) => `/schedules/${scheduleId}`,
  seatMap: (scheduleId) => `/schedules/${scheduleId}/seat-map`,
  seats: (scheduleId) => `/schedules/${scheduleId}/seats`,

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

  // ORGANIZER
  organizerConcerts: () => `/organizer/concerts`,
  organizerConcertStats: (concertId) => `/organizer/concerts/${concertId}/stats`,
  organizerScheduleStats: (scheduleId) => `/organizer/schedules/${scheduleId}/stats`,
  organizerCreateConcert: () => `/organizer/concerts/create`,
  organizerUpdateConcert: (concertId) => `/organizer/concerts/${concertId}`,
  organizerConcert: (concertId) => `/organizer/concerts/${concertId}`,
  organizerPublishConcert: (concertId) => `/organizer/concerts/${concertId}/publish`,
  organizerCreateSchedule: (concertId) => `/organizer/concerts/${concertId}/schedules`,
  organizerUpdateSchedule: (scheduleId) => `/organizer/concerts/schedules/${scheduleId}`,
  organizerDeleteSchedule: (scheduleId) => `/organizer/schedules/${scheduleId}`,
  organizerConcertSchedules: (concertId) => `/organizer/concerts/${concertId}/schedules`,
  organizerSchedulePrices: (scheduleId) => `/organizer/schedules/${scheduleId}/prices`,
  organizerCreatePolicy: (concertId) => `/organizer/concerts/${concertId}/policies`,
  organizerUpdatePolicy: (policyId) => `/organizer/policies/${policyId}`,
  organizerDeletePolicy: (policyId) => `/organizer/policies/${policyId}`,
  organizerConcertPolicies: (concertId) => `/organizer/concerts/${concertId}/policies`,
  organizerConcertOrders: (concertId) => `/organizer/concerts/${concertId}/orders`,
  organizerOrder: (orderId) => `/organizer/orders/${orderId}`,
  organizerPriceHistory: (concertId) => `/organizer/concerts/${concertId}/price-history`,
  organizerPolicyHistory: (concertId) => `/organizer/concerts/${concertId}/policy-history`,

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
  adminCreateSeatMap: () => `/seat-maps/admin/create`,
  adminCreateSeatMapWithSections: () => `/seat-maps/admin/createWithSections`,
  adminAddSeatMapSection: (seatMapId) => `/seat-maps/admin/${seatMapId}/create`,
  adminSeatMapDetail: (seatMapId) => `/seat-maps/admin/${seatMapId}`,
  adminUpdateSeatMapName: (seatMapId) => `/seat-maps/admin/updateName/${seatMapId}`,
  adminUpdateSeatMapStatus: (seatMapId, status) => `/seat-maps/admin/updateStatus/${seatMapId}?status=${status}`,
  adminPublishSeatMap: (seatMapId) => `/seat-maps/admin/updateStatus/${seatMapId}?status=PUBLISHED`,
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

