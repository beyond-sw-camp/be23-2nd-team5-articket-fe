export const ENDPOINTS = {
  // GUEST
  concerts: () => `/concerts`,
  concert: (concertId) => `/concerts/${concertId}`,
  concertSchedules: (concertId) => `/concerts/${concertId}/schedules`,
  schedule: (scheduleId) => `/schedules/${scheduleId}`,
  seatMap: (scheduleId) => `/schedules/${scheduleId}/seat-map`,
  seats: (scheduleId) => `/schedules/${scheduleId}/seats`,

  // AUTH
  signup: () => `/auth/signup`,
  login: () => `/auth/login`,

  // USER
  me: () => `/users/me`,
  myOrders: () => `/users/me/orders`,
  myOrder: (orderId) => `/users/me/orders/${orderId}`,
  seatHolds: () => `/seat-holds`,
  seatHold: (holdId) => `/seat-holds/${holdId}`,
  orders: () => `/orders`,
  payments: () => `/payments`,
  order: (orderId) => `/orders/${orderId}`,
  orderCancel: (orderId) => `/orders/${orderId}/cancel`,

  // ORGANIZER
  organizerConcerts: () => `/organizer/concerts`,
  organizerConcertStats: (concertId) => `/organizer/concerts/${concertId}/stats`,
  organizerScheduleStats: (scheduleId) => `/organizer/schedules/${scheduleId}/stats`,
  organizerCreateConcert: () => `/organizer/concerts`,
  organizerUpdateConcert: (concertId) => `/organizer/concerts/${concertId}`,
  organizerConcert: (concertId) => `/organizer/concerts/${concertId}`,
  organizerPublishConcert: (concertId) => `/organizer/concerts/${concertId}/publish`,
  organizerCreateSchedule: (concertId) => `/organizer/concerts/${concertId}/schedules`,
  organizerUpdateSchedule: (scheduleId) => `/organizer/schedules/${scheduleId}`,
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

  // ADMIN
  adminCreateVenue: () => `/admin/venues`,
  adminUpdateVenue: (venueId) => `/admin/venues/${venueId}`,
  adminCreateSeatMap: (venueId) => `/admin/venues/${venueId}/seat-maps`,
  adminPublishSeatMap: (seatMapId) => `/admin/seat-maps/${seatMapId}/publish`,
  adminBlocklist: () => `/admin/blocklist`,
  adminUnblock: (id) => `/admin/blocklist/${id}`,
  adminAuditLogs: () => `/admin/audit-logs`,

  // GEO / VENUES
  venueAddress: ({ lat, lng, radiusKm }) => `/venue/address?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`,
  venue: (venueId) => `/venues/${venueId}`,
  venueConcerts: (venueId) => `/venues/${venueId}/concerts`,
}

