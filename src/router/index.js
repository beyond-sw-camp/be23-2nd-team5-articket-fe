import { createRouter, createWebHistory } from 'vue-router'
import { getRole, isAuthed } from '../composables/useRole'

// layouts
import DefaultLayout from '../layouts/DefaultLayout.vue'

// guest
import HomeView from '../views/home/HomeView.vue'
import ConcertDetailView from '../views/concerts/ConcertDetailView.vue'
import ConcertSchedulesView from '../views/concerts/ConcertSchedulesView.vue'
import ScheduleDetailView from '../views/schedules/ScheduleDetailView.vue'
import SeatMapView from '../views/schedules/SeatMapView.vue'
import SeatsView from '../views/schedules/SeatsView.vue'
import NearbyView from '../views/venues/NearbyView.vue'
import VenueDetailView from '../views/venues/VenueDetailView.vue'
import LoginView from '../views/auth/LoginView.vue'
import SignupView from '../views/auth/SignupView.vue'

// user
import ProfileView from '../views/me/ProfileView.vue'
import MyOrdersView from '../views/me/MyOrdersView.vue'
import MyOrderDetailView from '../views/me/MyOrderDetailView.vue'
import HoldCreateView from '../views/hold/HoldCreateView.vue'
import HoldDetailView from '../views/hold/HoldDetailView.vue'
import CheckoutView from '../views/checkout/CheckoutView.vue'
import OrderStatusView from '../views/orders/OrderStatusView.vue'
import OrderCancelView from '../views/orders/OrderCancelView.vue'

// organizer
import OrganizerDashboardView from '../views/organizer/OrganizerDashboardView.vue'
import OrganizerConcertsView from '../views/organizer/OrganizerConcertsView.vue'
import OrganizerNewConcertView from '../views/organizer/OrganizerNewConcertView.vue'
import OrganizerConcertDetailView from '../views/organizer/OrganizerConcertDetailView.vue'
import OrganizerConcertPublishView from '../views/organizer/OrganizerConcertPublishView.vue'
import OrganizerConcertSchedulesView from '../views/organizer/OrganizerConcertSchedulesView.vue'
import OrganizerScheduleEditView from '../views/organizer/OrganizerScheduleEditView.vue'
import OrganizerSchedulePricesView from '../views/organizer/OrganizerSchedulePricesView.vue'
import OrganizerConcertPoliciesView from '../views/organizer/OrganizerConcertPoliciesView.vue'
import OrganizerPolicyDetailView from '../views/organizer/OrganizerPolicyDetailView.vue'
import OrganizerConcertOrdersView from '../views/organizer/OrganizerConcertOrdersView.vue'
import OrganizerOrderDetailView from '../views/organizer/OrganizerOrderDetailView.vue'
import OrganizerPriceHistoryView from '../views/organizer/OrganizerPriceHistoryView.vue'
import OrganizerPolicyHistoryView from '../views/organizer/OrganizerPolicyHistoryView.vue'

// admin
import AdminDashboardView from '../views/admin/AdminDashboardView.vue'
import AdminVenuesView from '../views/admin/AdminVenuesView.vue'
import AdminVenueEditView from '../views/admin/AdminVenueEditView.vue'
import AdminVenueSeatMapsView from '../views/admin/AdminVenueSeatMapsView.vue'
import AdminSeatMapPreviewView from '../views/admin/AdminSeatMapPreviewView.vue'
import AdminSeatMapPublishView from '../views/admin/AdminSeatMapPublishView.vue'
import AdminBlocklistView from '../views/admin/AdminBlocklistView.vue'
import AdminAuditLogsView from '../views/admin/AdminAuditLogsView.vue'
import AdminStubTableView from '../views/admin/AdminStubTableView.vue'

// errors
import ForbiddenView from '../views/system/ForbiddenView.vue'
import NotFoundView from '../views/system/NotFoundView.vue'

const withLayout = (component, meta = {}) => ({
  component: DefaultLayout,
  meta,
  children: [{ path: '', component }],
})

const routes = [
  { path: '/', ...withLayout(HomeView, { roleScope: 'guest' }) },
  { path: '/concerts/:concertId', ...withLayout(ConcertDetailView, { roleScope: 'guest' }) },
  { path: '/concerts/:concertId/schedules', ...withLayout(ConcertSchedulesView, { roleScope: 'guest' }) },
  { path: '/schedules/:scheduleId', ...withLayout(ScheduleDetailView, { roleScope: 'guest' }) },
  { path: '/schedules/:scheduleId/seat-map', ...withLayout(SeatMapView, { roleScope: 'guest' }) },
  { path: '/schedules/:scheduleId/seats', ...withLayout(SeatsView, { roleScope: 'guest' }) },
  { path: '/nearby', ...withLayout(NearbyView, { roleScope: 'guest' }) },
  { path: '/venues/:venueId', ...withLayout(VenueDetailView, { roleScope: 'guest' }) },

  { path: '/auth/login', ...withLayout(LoginView, { roleScope: 'auth' }) },
  { path: '/auth/signup', ...withLayout(SignupView, { roleScope: 'auth' }) },

  { path: '/me', ...withLayout(ProfileView, { requiresAuth: true, requiredRole: 'USER' }) },
  { path: '/me/orders', ...withLayout(MyOrdersView, { requiresAuth: true, requiredRole: 'USER' }) },
  { path: '/me/orders/:orderId', ...withLayout(MyOrderDetailView, { requiresAuth: true, requiredRole: 'USER' }) },
  { path: '/hold', ...withLayout(HoldCreateView, { requiresAuth: true, requiredRole: 'USER' }) },
  { path: '/hold/:holdId', ...withLayout(HoldDetailView, { requiresAuth: true, requiredRole: 'USER' }) },
  { path: '/checkout', ...withLayout(CheckoutView, { requiresAuth: true, requiredRole: 'USER' }) },
  { path: '/orders/:orderId', ...withLayout(OrderStatusView, { requiresAuth: true, requiredRole: 'USER' }) },
  { path: '/orders/:orderId/cancel', ...withLayout(OrderCancelView, { requiresAuth: true, requiredRole: 'USER' }) },

  { path: '/organizer', ...withLayout(OrganizerDashboardView, { requiresAuth: true, requiredRole: 'ORGANIZER' }) },
  { path: '/organizer/concerts', ...withLayout(OrganizerConcertsView, { requiresAuth: true, requiredRole: 'ORGANIZER' }) },
  { path: '/organizer/concerts/new', ...withLayout(OrganizerNewConcertView, { requiresAuth: true, requiredRole: 'ORGANIZER' }) },
  { path: '/organizer/concerts/:concertId', ...withLayout(OrganizerConcertDetailView, { requiresAuth: true, requiredRole: 'ORGANIZER' }) },
  { path: '/organizer/concerts/:concertId/publish', ...withLayout(OrganizerConcertPublishView, { requiresAuth: true, requiredRole: 'ORGANIZER' }) },
  { path: '/organizer/concerts/:concertId/schedules', ...withLayout(OrganizerConcertSchedulesView, { requiresAuth: true, requiredRole: 'ORGANIZER' }) },
  { path: '/organizer/schedules/:scheduleId', ...withLayout(OrganizerScheduleEditView, { requiresAuth: true, requiredRole: 'ORGANIZER' }) },
  { path: '/organizer/schedules/:scheduleId/prices', ...withLayout(OrganizerSchedulePricesView, { requiresAuth: true, requiredRole: 'ORGANIZER' }) },
  { path: '/organizer/concerts/:concertId/policies', ...withLayout(OrganizerConcertPoliciesView, { requiresAuth: true, requiredRole: 'ORGANIZER' }) },
  { path: '/organizer/policies/:policyId', ...withLayout(OrganizerPolicyDetailView, { requiresAuth: true, requiredRole: 'ORGANIZER' }) },
  { path: '/organizer/concerts/:concertId/orders', ...withLayout(OrganizerConcertOrdersView, { requiresAuth: true, requiredRole: 'ORGANIZER' }) },
  { path: '/organizer/orders/:orderId', ...withLayout(OrganizerOrderDetailView, { requiresAuth: true, requiredRole: 'ORGANIZER' }) },
  { path: '/organizer/concerts/:concertId/price-history', ...withLayout(OrganizerPriceHistoryView, { requiresAuth: true, requiredRole: 'ORGANIZER' }) },
  { path: '/organizer/concerts/:concertId/policy-history', ...withLayout(OrganizerPolicyHistoryView, { requiresAuth: true, requiredRole: 'ORGANIZER' }) },

  { path: '/admin', ...withLayout(AdminDashboardView, { requiresAuth: true, requiredRole: 'ADMIN' }) },
  { path: '/admin/venues', ...withLayout(AdminVenuesView, { requiresAuth: true, requiredRole: 'ADMIN' }) },
  { path: '/admin/venues/:venueId', ...withLayout(AdminVenueEditView, { requiresAuth: true, requiredRole: 'ADMIN' }) },
  { path: '/admin/venues/:venueId/seat-maps', ...withLayout(AdminVenueSeatMapsView, { requiresAuth: true, requiredRole: 'ADMIN' }) },
  { path: '/admin/seat-maps/:seatMapId', ...withLayout(AdminSeatMapPreviewView, { requiresAuth: true, requiredRole: 'ADMIN' }) },
  { path: '/admin/seat-maps/:seatMapId/publish', ...withLayout(AdminSeatMapPublishView, { requiresAuth: true, requiredRole: 'ADMIN' }) },
  { path: '/admin/blocklist', ...withLayout(AdminBlocklistView, { requiresAuth: true, requiredRole: 'ADMIN' }) },
  { path: '/admin/audit-logs', ...withLayout(AdminAuditLogsView, { requiresAuth: true, requiredRole: 'ADMIN' }) },

  // stub table pages (ADMIN)
  { path: '/admin/users', ...withLayout(AdminStubTableView, { requiresAuth: true, requiredRole: 'ADMIN', stubKey: 'users' }) },
  { path: '/admin/concerts', ...withLayout(AdminStubTableView, { requiresAuth: true, requiredRole: 'ADMIN', stubKey: 'concerts' }) },
  { path: '/admin/schedules', ...withLayout(AdminStubTableView, { requiresAuth: true, requiredRole: 'ADMIN', stubKey: 'schedules' }) },
  { path: '/admin/orders', ...withLayout(AdminStubTableView, { requiresAuth: true, requiredRole: 'ADMIN', stubKey: 'orders' }) },
  { path: '/admin/stats/revenue', ...withLayout(AdminStubTableView, { requiresAuth: true, requiredRole: 'ADMIN', stubKey: 'statsRevenue' }) },
  { path: '/admin/stats/concerts/ranking', ...withLayout(AdminStubTableView, { requiresAuth: true, requiredRole: 'ADMIN', stubKey: 'statsRanking' }) },
  { path: '/admin/stats/server-status', ...withLayout(AdminStubTableView, { requiresAuth: true, requiredRole: 'ADMIN', stubKey: 'serverStatus' }) },

  { path: '/403', ...withLayout(ForbiddenView, { roleScope: 'system' }) },
  { path: '/:pathMatch(.*)*', ...withLayout(NotFoundView, { roleScope: 'system' }) },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const meta = to.meta || {}

  if (!meta.requiresAuth && !meta.requiredRole) return true

  const role = getRole()
  const authed = isAuthed()

  if (role === 'GUEST' || !authed) {
    return { path: '/auth/login', query: { redirect: to.fullPath } }
  }

  if (meta.requiredRole && role !== meta.requiredRole) {
    return { path: '/403', query: { redirect: to.fullPath } }
  }

  return true
})

export default router

