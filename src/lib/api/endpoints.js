export const ENDPOINTS = {
  // GUEST
  concerts: () => `/concerts`,
  searchConcerts: (params = {}) => {
    const p = new URLSearchParams()
    if (params.keyword != null && params.keyword !== '') p.set('keyword', params.keyword)
    if (params.title != null && params.title !== '') p.set('title', params.title)
    if (params.category) p.set('category', params.category)
    if (params.page != null) p.set('page', String(params.page))
    if (params.size != null) p.set('size', String(params.size))
    if (params.sort) p.set('sort', params.sort)
    if (params.status != null && params.status !== '') p.set('status', params.status)
    if (params.categories?.length) params.categories.forEach((c) => p.append('categories', c))
    if (params.regions?.length) params.regions.forEach((r) => p.append('regions', r))
    if (params.filterStartDate) p.set('filterStartDate', params.filterStartDate)
    if (params.filterEndDate) p.set('filterEndDate', params.filterEndDate)
    const q = p.toString()
    return `/concerts${q ? `?${q}` : ''}`
  },
  concert: (concertId) => `/concerts/${concertId}`,
  concertSchedules: (concertId) => `/concerts/${concertId}/schedules`,
  schedule: (scheduleId) => `/schedule/${scheduleId}`,
  seatMap: (scheduleId) => `/schedule/${scheduleId}/seat-map`,
  seats: (scheduleId) => `/schedule/${scheduleId}/seats`,

  // AUTH
  signup: () => `/member/create`,
  login: () => `/member/doLogin`,
  googleLogin: () => `/member/google/doLogin`,
  kakaoLogin: () => `/member/kakao/doLogin`,
  refreshAt: () => `/member/refresh-at`,
  inicis: () => `/member/inicis`,
  memberIsVerified: () => `/member/isVerified`,

  // USER
  me: () => `/users/me`,
  requestOrganizer: () => `/users/requestOrganizer`,
  myOrders: (period) => period != null ? `/users/me/orders?period=${period}` : `/users/me/orders`,
  myOrder: (orderId) => `/users/me/orders/${orderId}`,
  seatHold: (seatId) => `/seat-holds/${seatId}`,

  orderCreate: () => `/order/create`,
  orders: () => `/orders`,
  payment: () => `/payment`,
  order: (orderId) => `/order/${orderId}`,
  orderCancel: () => `/order/cancel`,
  concertLike: (concertId) => `/user-concerts/${concertId}/like`,
  concertReview: (concertId) => `/user-concerts/${concertId}/review`,
  concertUserInteraction: (concertId) => `/user-concerts/${concertId}/user-interaction`,
  concertStats: (concertId) => `/user-concerts/${concertId}/stats`,
  concertReviews: (concertId) => `/user-concerts/${concertId}/reviews`,
  bestReviews: (size = 4) => `/user-concerts/reviews/best?size=${size}`,

  // ORGANIZER (백엔드 ConcertController 기준)
  organizerConcerts: (params = {}) => {
    const p = new URLSearchParams()
    if (params.page != null) p.set('page', String(params.page))
    if (params.size != null) p.set('size', String(params.size))
    const q = p.toString()
    return `/concerts/organizer${q ? `?${q}` : ''}`
  },
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
    if (params.page != null) p.set('page', String(params.page))
    if (params.size != null) p.set('size', String(params.size))
    if (params.name != null && params.name !== '') p.set('name', params.name)
    if (params.address != null && params.address !== '') p.set('address', params.address)
    if (params.keyword != null && params.keyword !== '') p.set('keyword', params.keyword)
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
    if (params.page != null) p.set('page', String(params.page))
    if (params.size != null) p.set('size', String(params.size))
    if (params.keyword != null && params.keyword !== '') p.set('keyword', params.keyword)
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
  adminUsers: (params = {}) => {
    const p = new URLSearchParams()
    if (params.page != null) p.set('page', params.page)
    if (params.size != null) p.set('size', params.size)
    const q = p.toString()
    return `/admin/users${q ? `?${q}` : ''}`
  },
  adminMemberDetail: (memberId) => `/member/${memberId}`,

  // PROMOTIONS (히어로 배너 관리용 / Admin CRUD)
  promotions: (params = {}) => {
    const p = new URLSearchParams()
    if (params.keyword != null && params.keyword !== '') p.set('keyword', params.keyword)
    if (params.page != null) p.set('page', String(params.page))
    if (params.size != null) p.set('size', String(params.size))
    if (params.sort != null) p.set('sort', params.sort)
    const q = p.toString()
    return `/promotions${q ? `?${q}` : ''}`
  },
  promotion: (id) => `/promotions/${id}`,
  createPromotion: () => `/promotions`,
  updatePromotion: (id) => `/promotions/${id}/update`,
  deletePromotion: (id) => `/promotions/${id}`,

  // SSE
  sseConnect: () => `/sse/connect`,
  sseDisconnect: () => `/sse/disconnect`,

  // GEO / VENUES
  venueNearby: ({ latitude, longitude, radiusKm, page, size }) =>
    `/venues/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}&page=${page}&size=${size}`,
  venue: (venueId) => `/venues/${venueId}`,
  venueConcerts: (venueId) => `/venues/${venueId}/concerts`,
  venues: () => `/venues`,
  searchVenues: (params = {}) => {
    const p = new URLSearchParams()
    if (params.keyword != null && params.keyword !== '') p.set('keyword', params.keyword)
    if (params.name != null && params.name !== '') p.set('name', params.name)
    if (params.page != null) p.set('page', String(params.page))
    if (params.size != null) p.set('size', String(params.size))
    const q = p.toString()
    return `/venues${q ? `?${q}` : ''}`
  },
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
  performerLike: (performerId) => `/performers/like${performerId != null ? `?id=${performerId}` : ''}`,
  performerDeleteLike: (performerId) => `/performers/deleteLike${performerId != null ? `?id=${performerId}` : ''}`,
  performerLikeList: () => `/performers/likeList`,
  performerCreate: () => `/performers/create`,

  // SCHEDULE CASTINGS (COMMON read / ORGANIZER write)
  schedulePerformers: (scheduleId) => `/schedules/${scheduleId}/performers`,
  schedulePerformerDetail: (scheduleId, performerId) => `/schedules/${scheduleId}/performers/${performerId}`,
  scheduleOrganizerAddPerformer: (scheduleId) => `/schedules/organizer/${scheduleId}/performers`,
  scheduleOrganizerUpdatePerformer: (scheduleId, performerId) => `/schedules/organizer/${scheduleId}/performers/${performerId}`,
  scheduleOrganizerDeletePerformer: (scheduleId, performerId) => `/schedules/organizer/${scheduleId}/performers/${performerId}`,
}

