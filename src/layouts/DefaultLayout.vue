<template>
  <div class="min-h-screen bg-slate-50">
    <header class="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <!-- Logo -->
        <RouterLink to="/" class="flex shrink-0 items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600">
            <Ticket class="h-5 w-5 text-white" />
          </div>
          <span class="text-lg font-bold uppercase tracking-tight text-red-600">NEXTICKET</span>
        </RouterLink>

        <!-- Search -->
        <form class="flex flex-1 max-w-xl items-center" @submit.prevent="submitSearch">
          <div
            class="flex w-full items-center gap-2 rounded-full bg-slate-100 px-4 py-2.5"
          >
            <Search class="h-4 w-4 shrink-0 text-slate-400" />
            <input
              v-model="q"
              type="text"
              class="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              placeholder="어떤 공연을 찾으시나요?"
            />
          </div>
        </form>

        <!-- Right: 내 주변, 알림, 구분선, 사용자 -->
        <div class="flex shrink-0 items-center gap-4">
          <button
            type="button"
            class="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            @click="$router.push('/nearby')"
          >
            <Navigation class="h-4 w-4 text-slate-400" />
            <span>내 주변</span>
          </button>

          <!-- 알림 (로그인 시) -->
          <div v-if="isLoggedIn" class="notif-panel-root relative">
            <button
              type="button"
              class="relative rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              @click="toggleNotifPanel"
            >
              <Bell class="h-5 w-5" />
              <span
                v-if="unreadCount > 0"
                class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
              >{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
            </button>
            <div
              v-show="notifPanelOpen"
              class="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl"
            >
              <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span class="text-sm font-semibold text-slate-900">알림</span>
                <button
                  v-if="sseState.notifications.length"
                  type="button"
                  class="text-xs text-slate-400 hover:text-slate-600"
                  @click="markAllRead"
                >모두 읽음</button>
              </div>
              <div class="max-h-72 overflow-y-auto">
                <div v-if="!sseState.notifications.length" class="py-8 text-center text-sm text-slate-400">알림이 없습니다.</div>
                <ul v-else class="divide-y divide-slate-100">
                  <li
                    v-for="n in sseState.notifications"
                    :key="n.id"
                    class="flex items-start gap-3 px-4 py-3"
                    :class="n.read ? 'opacity-60' : 'bg-slate-50'"
                  >
                    <span class="mt-0.5 text-base">{{ notifIcon(n.eventName) }}</span>
                    <div class="min-w-0 flex-1">
                      <div class="text-xs font-semibold text-slate-500">{{ notifTitle(n.eventName) }}</div>
                      <div class="mt-0.5 text-sm text-slate-700">{{ n.message }}</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 구분선 -->
          <div class="h-6 w-px bg-slate-200" />

          <!-- 사용자 영역 -->
          <template v-if="!isLoggedIn">
            <button
              type="button"
              class="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              @click="$router.push('/member/doLogin')"
            >
              로그인
            </button>
          </template>

          <template v-else>
            <RouterLink
              v-if="isOrganizerPending"
              to="#"
              class="rounded-full px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
              @click.prevent="showOrganizerPendingModal = true"
            >주최자 (승인 대기)</RouterLink>
            <RouterLink
              v-else-if="roleValue === 'ORGANIZER' || roleValue === 'ADMIN'"
              to="/management"
              class="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
            >{{ roleValue === 'ORGANIZER' ? '주최자' : '관리자' }}</RouterLink>
            <div class="profile-panel-root relative">
              <button
                type="button"
                class="flex items-center gap-3 py-1 hover:opacity-80"
                @click="profileMenuOpen = !profileMenuOpen"
              >
                <div class="flex flex-col items-start">
                  <span class="text-xs font-bold uppercase tracking-wide text-slate-900">
                    {{ roleLabel }}
                  </span>
                  <span class="text-sm font-medium text-slate-500">{{ userName }} 님</span>
                </div>
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900">
                  <User class="h-5 w-5 text-white" />
                </div>
              </button>
              <div
                v-show="profileMenuOpen"
                class="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1.5 shadow-md"
              >
                <RouterLink
                  to="/me"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  @click="profileMenuOpen = false"
                >
                  <User class="h-4 w-4 shrink-0 text-slate-400" />
                  마이페이지
                </RouterLink>
                <RouterLink
                  to="/me/orders"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  @click="profileMenuOpen = false"
                >
                  <Package class="h-4 w-4 shrink-0 text-slate-400" />
                  내 주문 목록
                </RouterLink>
                <RouterLink
                  to="/me/performers/likes"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  @click="profileMenuOpen = false"
                >
                  <Heart class="h-4 w-4 shrink-0 text-slate-400" />
                  좋아요한 아티스트
                </RouterLink>
                <RouterLink
                  to="/me/foru"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  @click="profileMenuOpen = false"
                >
                  <CalendarHeart class="h-4 w-4 shrink-0 text-slate-400" />
                  좋아요한 공연
                </RouterLink>
                <div class="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                  @click="profileMenuOpen = false; handleLogout()"
                >
                  <LogOut class="h-4 w-4 shrink-0 text-slate-400" />
                  로그아웃
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <nav class="border-t border-slate-100 py-3">
        <div class="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4">
          <RouterLink
            v-for="c in categories"
            :key="c.key"
            :to="c.to"
            class="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition"
            :class="currentCat === c.key
              ? 'bg-red-50 text-red-600'
              : 'text-slate-600 hover:bg-slate-100'"
          >
            {{ c.label }}
          </RouterLink>
        </div>
      </nav>
    </header>

    <!-- 주최자 신청 검토 중 배너 (오늘 하루 닫기) -->
    <div
      v-if="showOrganizerBanner"
      class="fixed left-0 right-0 top-[7rem] z-40 border-b border-amber-200 bg-amber-50 px-4 py-3 shadow-sm"
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <p class="text-sm font-medium text-amber-900">
          주최자 신청이 검토 중입니다. 승인 후 공연 등록 메뉴를 이용할 수 있습니다.
        </p>
        <button
          type="button"
          class="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
          @click="dismissOrganizerBanner"
        >
          오늘 하루 닫기
        </button>
      </div>
    </div>

    <!-- 실시간 알림 Toast (로그인 시에만 표시) -->
    <ToastNotification v-if="isLoggedIn && sseState" :notifications="sseState.notifications" />

    <main
      class="mx-auto max-w-6xl px-4 pb-16 transition-[padding]"
      :class="showOrganizerBanner ? 'pt-40' : 'pt-32'"
    >
      <RouterView />
    </main>

    <!-- 주최자 승인 대기 모달 (USER + PENDING일 때 주최자 메뉴 대신 클릭 시) -->
    <UiModal
      :open="showOrganizerPendingModal"
      title="주최자 메뉴"
      @close="showOrganizerPendingModal = false"
    >
      <p class="text-sm text-slate-700">
        승인 후 이용 가능합니다. 현재 검토 중입니다.
      </p>
      <template #footer>
        <UiButton class="h-10 px-4" @click="showOrganizerPendingModal = false">확인</UiButton>
      </template>
    </UiModal>

    <footer class="border-t border-slate-200 bg-white">
      <div class="mx-auto max-w-6xl px-4 py-8">
        <div class="text-sm font-semibold text-slate-900">NexTicket</div>
        <div class="mt-1 text-xs text-slate-500">
          Front UI · Tailwind / Vue Router 4
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { Search, Bell, User, LogIn, Ticket, Navigation, ShieldAlert, Package, Heart, CalendarHeart, LogOut } from 'lucide-vue-next'
import UiButton from '../components/common/UiButton.vue'
import UiBadge from '../components/common/UiBadge.vue'
import UiModal from '../components/common/UiModal.vue'
import ToastNotification from '../components/common/ToastNotification.vue'
import { useRole } from '../composables/useRole'
import { useMe } from '../composables/useMe'
import { useSSE } from '../composables/useSSE'

export default {
  name: 'DefaultLayout',
  components: {
    Search,
    Bell,
    User,
    LogIn,
    Ticket,
    Navigation,
    ShieldAlert,
    Package,
    Heart,
    CalendarHeart,
    LogOut,
    UiButton,
    UiBadge,
    UiModal,
    ToastNotification,
  },
  data() {
    return {
      q: this.$route.query.q || '',
      _me: null,
      organizerBannerDismissed: false,
      showOrganizerPendingModal: false,
      categories: [
        { key: 'all', label: '전체', to: '/' },
        { key: 'MUSICAL', label: '뮤지컬', to: '/genre/MUSICAL' },
        { key: 'CONCERT', label: '콘서트', to: '/genre/CONCERT' },
        { key: 'THEATRE', label: '연극', to: '/genre/THEATRE' },
        { key: 'CLASSIC', label: '클래식/오페라', to: '/genre/CLASSIC' },
        { key: 'SPORTS', label: '스포츠', to: '/genre/SPORTS' },
        { key: 'EXHIBITION', label: '전시/행사', to: '/genre/EXHIBITION' },
        { key: 'FAMILY', label: '가족/아동', to: '/genre/FAMILY' },
        { key: 'OTHER', label: '기타', to: '/genre/OTHER' }
      ],

      tokenVersion: 0,
      scrolled: false,
      notifPanelOpen: false,
      profileMenuOpen: false,
      sseState: null,
      _sse: null,
    }
  },
  computed: {
    unreadCount() {
      return this.sseState?.notifications.filter((n) => !n.read).length ?? 0
    },
    currentCat() {
      if (this.$route.path === '/') return 'all'
      const m = this.$route.path.match(/^\/genre\/(\w+)$/)
      return m ? m[1] : 'all'
    },
    accessToken() {
      this.tokenVersion
      return localStorage.getItem('accessToken')
    },
    isLoggedIn() {
      return !!this.accessToken
    },
    roleValue() {
      return this.role?.value ?? this.role ?? 'GUEST'
    },
    meProfile() {
      return this._me?.profile?.value ?? null
    },
    isOrganizerPending() {
      return this.meProfile?.organizerStatus === 'PENDING'
    },
    showOrganizerBanner() {
      if (!this.isLoggedIn || this.organizerBannerDismissed) return false
      if (this.meProfile?.organizerStatus !== 'PENDING') return false
      const key = 'organizerBannerDismissed'
      try {
        const dismissed = sessionStorage.getItem(key)
        const today = new Date().toISOString().slice(0, 10)
        if (dismissed === today) return false
      } catch {}
      return true
    },
    roleLabel() {
      const r = this.roleValue
      if (r === 'ORGANIZER') return 'ORGANIZER'
      if (r === 'ADMIN') return 'ADMIN'
      return 'MEMBER'
    },
    // 마이페이지(ProfileView)와 동일한 GET /users/me 응답에서 name 사용
    // profile ref를 직접 구독하여 refetch 후 UI 갱신 보장
    userName() {
      const { profile } = useMe()
      const p = profile?.value ?? null
      return p?.name ?? p?.email?.split('@')[0] ?? '회원'
    }
  },
  created() {
    const { role, logout, syncFromToken } = useRole()
    this.role = role
    this._logoutComposable = logout
    this._syncFromToken = syncFromToken
    this._me = useMe()
    const key = 'organizerBannerDismissed'
    try {
      const dismissed = sessionStorage.getItem(key)
      const today = new Date().toISOString().slice(0, 10)
      if (dismissed === today) this.organizerBannerDismissed = true
    } catch {}
    window.addEventListener('storage', this.onStorage)
    this.bumpTokenVersion()
    // SSE 초기화
    this._sse = useSSE()
    this.sseState = this._sse.state
    if (localStorage.getItem('accessToken')) this._sse.connect()
  },
  mounted() {
    if (this.isLoggedIn && this._me?.refetch) this._me.refetch()
    window.addEventListener('scroll', this.onScroll, { passive: true })
    window.addEventListener('click', this.onClickOutside)
    this.onScroll()
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.onStorage)
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('click', this.onClickOutside)
    if (this._sse) this._sse.disconnect()
  },
  watch: {
    '$route.query.q'(v) {
      this.q = v || ''
    },
    $route() {
      this.bumpTokenVersion()
      this.profileMenuOpen = false
    },
    isLoggedIn(v) {
      if (v && this._me?.refetch) this._me.refetch()
      if (v) this._sse?.connect()
      else this._sse?.disconnect()
    }
  },
  methods: {
    onScroll() {
      this.scrolled = window.scrollY > 20
    },
    bumpTokenVersion() {
      this.tokenVersion++
    },
    onClickOutside(e) {
      if (this.notifPanelOpen && !e.target.closest('.notif-panel-root')) {
        this.notifPanelOpen = false
      }
      if (this.profileMenuOpen && !e.target.closest('.profile-panel-root')) {
        this.profileMenuOpen = false
      }
    },
    onStorage(e) {
      if (e.key === 'accessToken' || e.key === 'refreshToken') {
        if (typeof this._syncFromToken === 'function') this._syncFromToken()
        this.bumpTokenVersion()
      }
    },
    submitSearch() {
      const q = this.q?.trim()
      if (q) {
        this.$router.push({ path: '/search', query: { q } })
      } else {
        this.$router.push({ path: '/' })
      }
    },
    dismissOrganizerBanner() {
      try {
        sessionStorage.setItem('organizerBannerDismissed', new Date().toISOString().slice(0, 10))
      } catch {}
      this.organizerBannerDismissed = true
    },

    toggleNotifPanel() {
      this.notifPanelOpen = !this.notifPanelOpen
      if (this.notifPanelOpen) this._sse?.markAllRead()
    },
    markAllRead() {
      this._sse?.markAllRead()
    },
    notifIcon(eventName) {
      if (eventName === 'payment') return '💳'
      if (eventName === 'concert') return '🎭'
      if (eventName === 'admin')   return '🔔'
      return '📢'
    },
    notifTitle(eventName) {
      if (eventName === 'payment') return '결제 알림'
      if (eventName === 'concert') return '공연 알림'
      if (eventName === 'admin')   return '관리자 알림'
      return '알림'
    },

    async handleLogout() {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('isVerified')
      if (this._sse) this._sse.disconnect()
      if (typeof this._logoutComposable === 'function') {
        await this._logoutComposable()
      }
      if (typeof this._me?.clear === 'function') {
        this._me.clear()
      }

      this.bumpTokenVersion()

      this.$router.push('/')
    }
  }
}
</script>
