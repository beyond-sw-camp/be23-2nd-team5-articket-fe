import { createRouter, createWebHistory } from 'vue-router'
import { getRole, isAuthed } from '../composables/useRole'


// layouts
import DefaultLayout from '../layouts/DefaultLayout.vue'
import ManagementLayout from '../layouts/ManagementLayout.vue'

// guest
import HomeView from '../views/home/HomeView.vue'
import ConcertDetailView from '../views/concerts/ConcertDetailView.vue'
import GenreConcertsView from '../views/concerts/GenreConcertsView.vue'
import ConcertSchedulesView from '../views/concerts/ConcertSchedulesView.vue'
import ScheduleDetailView from '../views/schedules/ScheduleDetailView.vue'
import SeatMapView from '../views/schedules/SeatMapView.vue'
import SeatSelectionView from '../views/concerts/SeatSelectionView.vue'
import SeatsView from '../views/schedules/SeatsView.vue'
import NearbyView from '../views/venues/NearbyView.vue'
import VenueDetailView from '../views/venues/VenueDetailView.vue'
import PerformersListView from '../views/performers/PerformersListView.vue'
import PerformerDetailView from '../views/performers/PerformerDetailView.vue'
import PromotionDetailView from '../views/promotions/PromotionDetailView.vue'
import SearchView from '../views/search/SearchView.vue'
import LoginView from '../views/member/LoginView.vue'
import SignupView from '../views/member/SignupView.vue'
import SignupCompleteView from '../views/member/SignupCompleteView.vue'

// user
import ProfileView from '../views/me/ProfileView.vue'
import IdentityVerificationView from '../views/me/IdentityVerificationView.vue'
import MyOrdersView from '../views/orders/MyOrdersView.vue'
import MyOrderDetailView from '../views/orders/MyOrderDetailView.vue'
import MyPerformerLikesView from '../views/me/MyPerformerLikesView.vue'
import ForUView from '../views/me/ForUView.vue'
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
import OrganizerConcertEditView from '../views/organizer/OrganizerConcertEditView.vue'
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
import OrganizerSchedulePerformersView from '../views/organizer/OrganizerSchedulePerformersView.vue'

// management (organizer / admin hub)
import ManagementView from '../views/management/ManagementView.vue'

// admin
import AdminDashboardView from '../views/admin/AdminDashboardView.vue'
import AdminVenuesView from '../views/admin/AdminVenuesView.vue'
import AdminVenueDetailView from '../views/admin/AdminVenueDetailView.vue'
import AdminVenueEditView from '../views/admin/AdminVenueEditView.vue'
import AdminVenueSeatMapsView from '../views/admin/AdminVenueSeatMapsView.vue'
import AdminSeatMapPreviewView from '../views/admin/AdminSeatMapPreviewView.vue'
import AdminSeatMapPublishView from '../views/admin/AdminSeatMapPublishView.vue'
import SeatMapLayoutEditorView from '../views/admin/SeatMapLayoutEditorView.vue'
import AdminBlocklistView from '../views/admin/AdminBlocklistView.vue'
import AdminAuditLogsView from '../views/admin/AdminAuditLogsView.vue'
import AdminPendingOrganizersView from '../views/admin/AdminPendingOrganizersView.vue'
import AdminStubTableView from '../views/admin/AdminStubTableView.vue'

// errors
import ForbiddenView from '../views/system/ForbiddenView.vue'
import NotFoundView from '../views/system/NotFoundView.vue'
import GoogleRedirect from '../views/member/oauth/GoogleRedirect.vue'
import KakaoRedirect from '../views/member/oauth/KakaoRedirect.vue'
import Order from '../views/orders/Order.vue'
import OrderComplete from '../views/orders/OrderComplete.vue'

// 단일 DefaultLayout 하에 모든 자식 라우트 → 레이아웃 리마운트 없이 RouterView만 교체 (헤더 깜빡임 방지)
const childRoute = (path, component, meta = {}, props = {}) => ({
  path,
  component,
  meta,
  ...(Object.keys(props).length ? { props } : {}),
})

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      childRoute('', HomeView, { roleScope: 'guest' }),
      childRoute('genre/:genre', GenreConcertsView, { roleScope: 'guest' }),
      childRoute('concerts/:concertId', ConcertDetailView, { roleScope: 'guest' }),
      childRoute('concerts/:concertId/schedules', ConcertSchedulesView, { roleScope: 'guest' }),
      childRoute('schedules/:scheduleId', ScheduleDetailView, { roleScope: 'guest' }),
      childRoute('concerts/schedules/:scheduleId/seats', SeatSelectionView, { roleScope: 'guest' }),
      childRoute('schedules/:scheduleId/seat-map', SeatMapView, { roleScope: 'guest' }),
      childRoute('schedules/:scheduleId/seats', SeatsView, { roleScope: 'guest' }),
      childRoute('promotions/:promotionId', PromotionDetailView, { roleScope: 'guest' }),
      childRoute('search', SearchView, { roleScope: 'guest' }),
      childRoute('nearby', NearbyView, { roleScope: 'guest' }),
      childRoute('venues/:venueId', VenueDetailView, { roleScope: 'guest' }),
      childRoute('performers', PerformersListView, { roleScope: 'guest' }),
      childRoute('performers/:performerId', PerformerDetailView, { roleScope: 'guest' }),

      childRoute('member/doLogin', LoginView, { roleScope: 'auth' }),
      childRoute('member/create', SignupView, { roleScope: 'auth' }),
      childRoute('member/complete', SignupCompleteView, { roleScope: 'auth' }),

      childRoute('oauth/google/redirect', GoogleRedirect, { roleScope: 'auth' }),
      childRoute('oauth/kakao/redirect', KakaoRedirect, { roleScope: 'auth' }),

      childRoute('me', ProfileView, { requiresAuth: true }),
      childRoute('me/verify-identity', IdentityVerificationView, { requiresAuth: true }),
      childRoute('me/orders', MyOrdersView, { requiresAuth: true }),
      childRoute('me/orders/:orderId', MyOrderDetailView, { requiresAuth: true }),
      childRoute('me/performers/likes', MyPerformerLikesView, { requiresAuth: true }),
      childRoute('me/foru', ForUView, { requiresAuth: true }),
      childRoute('hold', HoldCreateView, { requiresAuth: true }),
      childRoute('hold/:holdId', HoldDetailView, { requiresAuth: true }),
      childRoute('checkout', CheckoutView, { requiresAuth: true }),
      childRoute('orders/:orderId', OrderStatusView, { requiresAuth: true }),
      childRoute('orders/:orderId/cancel', OrderCancelView, { requiresAuth: true }),

      childRoute('order', Order, { requiresAuth: true }),
      childRoute('orderComplete', OrderComplete, { requiresAuth: true }),

      childRoute('403', ForbiddenView, { roleScope: 'system' }),
      { path: ':pathMatch(.*)*', component: NotFoundView, meta: { roleScope: 'system' } },
    ],
  },

  // Management (organizer/admin) - 전용 레이아웃
  {
    path: '/management',
    component: ManagementLayout,
    meta: { requiresAuth: true },
    children: [
      childRoute('', ManagementView),
      childRoute('me', ProfileView),
    ],
  },
  {
    path: '/organizer',
    component: ManagementLayout,
    meta: { requiresAuth: true, requiredRole: 'ORGANIZER' },
    children: [
      { path: '', redirect: '/organizer/dashboard' },
      childRoute('dashboard', OrganizerDashboardView),
      childRoute('concerts', OrganizerConcertsView),
      childRoute('concerts/new', OrganizerNewConcertView),
      childRoute('concerts/:concertId', OrganizerConcertDetailView),
      childRoute('concerts/:concertId/edit', OrganizerConcertEditView),
      childRoute('concerts/:concertId/publish', OrganizerConcertPublishView),
      childRoute('concerts/:concertId/schedules', OrganizerConcertSchedulesView),
      childRoute('schedules/:scheduleId', OrganizerScheduleEditView),
      childRoute('schedules/:scheduleId/prices', OrganizerSchedulePricesView),
      childRoute('concerts/:concertId/policies', OrganizerConcertPoliciesView),
      childRoute('policies/:policyId', OrganizerPolicyDetailView),
      childRoute('concerts/:concertId/orders', OrganizerConcertOrdersView),
      childRoute('orders/:orderId', OrganizerOrderDetailView),
      childRoute('concerts/:concertId/price-history', OrganizerPriceHistoryView),
      childRoute('concerts/:concertId/policy-history', OrganizerPolicyHistoryView),
      // 아티스트 목록: 동일 컴포넌트 재사용, canManage=true로 관리자 기능 노출
      childRoute('performers', PerformersListView, {}, { canManage: true }),
      childRoute('performers/:performerId', PerformerDetailView, {}, { canManage: true }),
      childRoute('schedules/:scheduleId/performers', OrganizerSchedulePerformersView),
    ],
  },
  {
    path: '/admin',
    component: ManagementLayout,
    meta: { requiresAuth: true, requiredRole: 'ADMIN' },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      childRoute('dashboard', AdminDashboardView),
      childRoute('venues', AdminVenuesView),
      childRoute('venues/:venueId', AdminVenueDetailView),
      childRoute('venues/:venueId/edit', AdminVenueEditView),
      childRoute('venues/:venueId/seat-maps', AdminVenueSeatMapsView),
      childRoute('seat-maps/:seatMapId', AdminSeatMapPreviewView),
      childRoute('seat-maps/:seatMapId/publish', AdminSeatMapPublishView),
      childRoute('seat-maps/:seatMapId/layout', SeatMapLayoutEditorView),
      childRoute('blocklist', AdminBlocklistView),
      childRoute('audit-logs', AdminAuditLogsView),
      childRoute('pending-organizers', AdminPendingOrganizersView),
      childRoute('users', AdminStubTableView, { stubKey: 'users' }),
      childRoute('concerts', AdminStubTableView, { stubKey: 'concerts' }),
      childRoute('schedules', AdminStubTableView, { stubKey: 'schedules' }),
      childRoute('orders', AdminStubTableView, { stubKey: 'orders' }),
      childRoute('stats/revenue', AdminStubTableView, { stubKey: 'statsRevenue' }),
      childRoute('stats/concerts/ranking', AdminStubTableView, { stubKey: 'statsRanking' }),
      childRoute('stats/server-status', AdminStubTableView, { stubKey: 'serverStatus' }),
    ],
  },
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

  if (!meta.requiresAuth && !meta.requiredRole && !meta.requiredRoles?.length) return true

  const role = getRole()
  const authed = isAuthed()

  if (role === 'GUEST' || !authed) {
    return { path: '/member/doLogin', query: { redirect: to.fullPath } }
  }

  if (meta.requiredRole && role !== meta.requiredRole) {
    return { path: '/403', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
