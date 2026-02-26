<template>
  <div class="min-h-screen bg-slate-50">
    <header
      class="fixed inset-x-0 top-0 z-50 border-b transition-all duration-500"
      :class="scrolled ? 'border-slate-200 bg-white/85 py-4 shadow-sm backdrop-blur-xl' : 'border-transparent bg-transparent py-6'"
    >
      <div class="mx-auto max-w-6xl px-4 py-1">
        <div class="flex items-center gap-3">
          <RouterLink to="/" class="flex items-center gap-2">
            <div class="h-9 w-9 rounded-xl bg-red-600 shadow-sm"></div>
            <div class="leading-tight">
              <div class="text-sm font-semibold text-slate-900">NexTicket</div>
              <div class="text-xs text-slate-500">공연, 아티스트, 공연장 검색</div>
            </div>
          </RouterLink>

          <form class="ml-2 flex flex-1 items-center gap-2" @submit.prevent="submitSearch">
            <div
              class="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <Search class="h-4 w-4 text-slate-500" />
              <input v-model="q"
                class="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                placeholder="공연, 아티스트, 공연장 검색" />
            </div>
          </form>

          <div class="hidden items-center gap-2 sm:flex">
            <UiButton variant="ghost" class="h-10 px-3" @click="$router.push('/nearby')">
              <MapPin class="h-4 w-4" />
              <span class="ml-2 text-sm">내 주변</span>
            </UiButton>

            <!-- 알림 Bell (로그인 시에만 표시) -->
            <div v-if="isLoggedIn" class="notif-panel-root relative">
              <UiButton variant="ghost" class="h-10 px-3" @click="toggleNotifPanel">
                <Bell class="h-4 w-4" />
                <span
                  v-if="unreadCount > 0"
                  class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                >{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
              </UiButton>
              <!-- 알림 드롭다운 -->
              <div
                v-show="notifPanelOpen"
                class="absolute right-0 top-full z-50 mt-1 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl"
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
                  <div v-if="!sseState.notifications.length" class="py-8 text-center text-sm text-slate-400">
                    알림이 없습니다.
                  </div>
                  <ul v-else class="divide-y divide-slate-100">
                    <li
                      v-for="n in sseState.notifications"
                      :key="n.id"
                      class="flex items-start gap-3 px-4 py-3"
                      :class="n.read ? 'opacity-60' : 'bg-slate-50'"
                    >
                      <span class="mt-0.5 text-base">{{ notifIcon(n.eventName) }}</span>
                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-semibold text-slate-500">{{ notifTitle(n.eventName) }}</div>
                        <div class="mt-0.5 text-sm text-slate-700">{{ n.message }}</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <!-- 주최자 승인 대기 (USER + organizerStatus PENDING): 클릭 시 모달 -->
              <div v-if="isOrganizerPending" class="inline-block">
                <UiButton
                  variant="tonal"
                  class="h-10 rounded-xl px-3 text-slate-600"
                  @click="showOrganizerPendingModal = true"
                >
                  주최자 (승인 대기)
                </UiButton>
              </div>
              <!-- ORGANIZER 메뉴 (JWT role 기준) -->
              <div v-else-if="roleValue === 'ORGANIZER'" class="relative inline-block">
                <UiButton variant="tonal" class="h-10 px-3 rounded-xl text-slate-800"
                  @click="organizerMenuOpen = !organizerMenuOpen">
                  주최자
                </UiButton>
                <div v-show="organizerMenuOpen"
                  class="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  <RouterLink to="/organizer"
                    class="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    @click="organizerMenuOpen = false">대시보드</RouterLink>
                  <RouterLink to="/organizer/concerts"
                    class="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    @click="organizerMenuOpen = false">공연 목록</RouterLink>
                  <RouterLink to="/organizer/concerts/new"
                    class="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    @click="organizerMenuOpen = false">공연 등록</RouterLink>
                  <RouterLink to="/organizer/performers"
                    class="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    @click="organizerMenuOpen = false">아티스트 관리</RouterLink>
                </div>
              </div>

              <!-- ADMIN 메뉴 (JWT role 기준) -->
              <div v-if="roleValue === 'ADMIN'" class="relative inline-block">
                <UiButton variant="tonal" class="h-10 px-3 rounded-xl text-slate-800"
                  @click="adminMenuOpen = !adminMenuOpen">
                  관리자
                </UiButton>
                <div v-show="adminMenuOpen"
                  class="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  <RouterLink to="/admin" class="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    @click="adminMenuOpen = false">대시보드</RouterLink>
                  <RouterLink to="/admin/venues"
                    class="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    @click="adminMenuOpen = false">공연장</RouterLink>
                  <RouterLink to="/admin/users"
                    class="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    @click="adminMenuOpen = false">회원관리</RouterLink>
                  <RouterLink to="/admin/orders"
                    class="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    @click="adminMenuOpen = false">주문</RouterLink>
                  <RouterLink to="/admin/pending-organizers"
                    class="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    @click="adminMenuOpen = false">주최자 승인</RouterLink>
                </div>
              </div>

              <UiBadge v-if="roleValue !== 'GUEST'" tone="solid">{{ roleValue }}</UiBadge>
              <UiBadge v-else tone="soft">GUEST</UiBadge>

              <!-- 토큰 기반 로그인 UI -->
              <UiButton v-if="!isLoggedIn" variant="ghost" class="h-10 px-3" @click="$router.push('/member/doLogin')">
                <LogIn class="h-4 w-4" />
                <span class="ml-2 text-sm">로그인</span>
              </UiButton>

              <UiButton v-else variant="ghost" class="h-10 px-3" @click="$router.push('/me')">
                <User class="h-4 w-4" />
                <span class="ml-2 text-sm">마이페이지</span>
              </UiButton>

              <UiButton v-if="isLoggedIn" variant="ghost" class="h-10 px-3" @click="handleLogout">
                <ShieldAlert class="h-4 w-4" />
                <span class="ml-2 text-sm">로그아웃</span>
              </UiButton>
            </div>
          </div>
        </div>

        <nav class="mt-3 flex items-center gap-2 overflow-x-auto py-3">
          <RouterLink v-for="c in categories" :key="c.key" :to="c.to"
            class="whitespace-nowrap rounded-2xl border px-3 py-2 text-sm font-semibold shadow-sm transition" :class="currentCat === c.key
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              ">
            {{ c.label }}
          </RouterLink>

          <div class="ml-auto hidden items-center gap-2 sm:flex">
            <UiBadge tone="soft">API</UiBadge>
            <UiBadge tone="soft">Vue Router Guard</UiBadge>
          </div>
        </nav>
      </div>
    </header>

    <!-- 주최자 신청 검토 중 배너 (오늘 하루 닫기) -->
    <div
      v-if="showOrganizerBanner"
      class="fixed left-0 right-0 top-[var(--header-height,140px)] z-40 border-b border-amber-200 bg-amber-50 px-4 py-3 shadow-sm"
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
      :class="showOrganizerBanner ? 'pt-52' : 'pt-40'"
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
import { Search, Bell, User, LogIn, MapPin, ShieldAlert } from 'lucide-vue-next'
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
    MapPin,
    ShieldAlert,
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
      adminMenuOpen: false,
      organizerMenuOpen: false,
      scrolled: false,
      notifPanelOpen: false,
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
      this.adminMenuOpen = false
      this.organizerMenuOpen = false
      this.bumpTokenVersion()
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
