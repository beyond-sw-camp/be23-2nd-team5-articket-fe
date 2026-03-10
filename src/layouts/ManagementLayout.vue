<template>
  <div class="flex min-h-screen bg-slate-50 min-w-0" :class="{ 'overflow-x-hidden': isSeatMapLayoutEditor }">
    <aside class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white">
      <RouterLink
        to="/management"
        class="flex h-16 shrink-0 items-center gap-2 border-b border-slate-100 px-5 transition hover:bg-slate-50"
      >
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600">
          <Ticket class="h-5 w-5 text-white" />
        </div>
        <div>
          <div class="text-base font-bold uppercase tracking-tight text-slate-900">ARTICKET</div>
          <div class="text-xs text-slate-500">관리자 페이지</div>
        </div>
      </RouterLink>

      <nav class="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
          :class="isActive(item.to)
            ? 'bg-red-50 text-red-600'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="border-t border-slate-100 p-4 space-y-2">
        <RouterLink
          to="/management/me"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
          :class="isActive('/management/me')
            ? 'bg-red-50 text-red-600'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
        >
          <User class="h-5 w-5 shrink-0" />
          마이페이지
        </RouterLink>
        <RouterLink
          to="/"
          class="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          ARTICKET 둘러보기
        </RouterLink>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col pl-64">
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div class="h-5 w-5 shrink-0" />
        <div class="flex items-center gap-4">
          <NotificationPanel />
          <ProfileDropdown compact />
        </div>
      </header>

      <main class="min-w-0 flex-1 p-6 min-h-0 overflow-x-hidden" :class="{ 'overflow-hidden': isSeatMapLayoutEditor }">
        <RouterView />
      </main>
    </div>

    <ToastNotification v-if="sseState" :notifications="sseState.notifications" />
  </div>
</template>

<script>
import { Ticket, LayoutGrid, CirclePlus, Users2, User, LineChart, ReceiptText, Megaphone } from 'lucide-vue-next'
import { getRole } from '../composables/useRole'
import { useMe } from '../composables/useMe'
import { useSSE } from '../composables/useSSE'
import NotificationPanel from '../components/common/NotificationPanel.vue'
import ProfileDropdown from '../components/common/ProfileDropdown.vue'
import ToastNotification from '../components/common/ToastNotification.vue'

const ORGANIZER_NAV = [
  { to: '/organizer/dashboard', label: '대시보드', icon: LayoutGrid },
  { to: '/organizer/reports', label: '정산/리포트', icon: ReceiptText },
  { to: '/organizer/seat-insights', label: '좌석 인사이트', icon: LineChart },
  { to: '/organizer/concerts', label: '공연 관리', icon: Ticket },
  { to: '/organizer/performers', label: '아티스트 관리', icon: Users2 }
]

const ADMIN_NAV = [
  { to: '/admin/dashboard', label: '대시보드', icon: LayoutGrid },
  { to: '/admin/venues', label: '공연장', icon: Ticket },
  { to: '/admin/users', label: '회원관리', icon: Users2 },
  { to: '/admin/pending-organizers', label: '주최자 승인', icon: CirclePlus },
  { to: '/admin/promotions', label: '프로모션 배너', icon: Megaphone }
]

export default {
  name: 'ManagementLayout',
  components: {
    Ticket,
    LayoutGrid,
    CirclePlus,
    Users2,
    User,
    LineChart,
    ReceiptText,
    Megaphone,
    NotificationPanel,
    ProfileDropdown,
    ToastNotification
  },
  data() {
    return {
      _sse: null
    }
  },
  computed: {
    sseState() {
      return this._sse?.state ?? null
    },
    isSeatMapLayoutEditor() {
      return this.$route.path.includes('/seat-maps/') && this.$route.path.endsWith('/layout')
    },
    roleValue() {
      const r = getRole()
      return r ? String(r).toUpperCase() : 'GUEST'
    },
    navItems() {
      return this.roleValue === 'ADMIN' ? ADMIN_NAV : ORGANIZER_NAV
    },
    isOrganizerReportOrderRoute() {
      const path = this.$route.path
      return /^\/organizer\/concerts\/\d+\/orders$/.test(path) || /^\/organizer\/orders\/\d+$/.test(path)
    }
  },
  watch: {
    isSeatMapLayoutEditor: {
      handler(v) {
        document.documentElement.style.overflowX = v ? 'hidden' : ''
        document.body.style.overflowX = v ? 'hidden' : ''
      },
      immediate: true
    }
  },
  mounted() {
    const me = useMe()
    if (me?.refetch) me.refetch()
    this._sse = useSSE()
    if (localStorage.getItem('accessToken')) this._sse.connect()
  },
  beforeUnmount() {
    document.documentElement.style.overflowX = ''
    document.body.style.overflowX = ''
    if (this._sse) this._sse.disconnect()
  },
  methods: {
    isActive(to) {
      const path = this.$route.path
      if (to === '/organizer/reports' && this.isOrganizerReportOrderRoute) {
        return true
      }
      if (to === '/organizer/concerts' && this.isOrganizerReportOrderRoute) {
        return false
      }
      if (to === '/organizer' || to === '/admin') {
        return path === to || path.startsWith(to + '/')
      }
      if (to === '/management/me') {
        return path === '/management/me'
      }
      return path === to || path.startsWith(to + '/')
    }
  }
}
</script>
