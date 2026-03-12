<template>
  <div class="min-h-screen" style="overflow-x: clip">
    <header class="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white">
      <div class="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <!-- Logo -->
        <RouterLink to="/" class="flex shrink-0 items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600">
            <Ticket class="h-5 w-5 text-white" />
          </div>
          <span class="text-lg font-bold uppercase tracking-tight text-red-600">ARTICKET</span>
        </RouterLink>

        <!-- Search -->
        <form class="flex flex-1 max-w-xl items-center ml-2" @submit.prevent="submitSearch">
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
        <div class="ml-auto flex shrink-0 items-center gap-4">
          <!-- 예매내역 (일반 사용자 전용) -->
          <button
            v-if="isLoggedIn && roleValue === 'USER'"
            type="button"
            class="flex items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            title="예매내역"
            @click="$router.push('/me/orders')"
          >
            <Ticket class="h-5 w-5" />
          </button>

          <!-- 알림 (로그인 시) -->
          <NotificationPanel v-if="isLoggedIn" />

          <!-- 구분선 -->
          <div v-if="isLoggedIn" class="h-6 w-px bg-slate-200" />

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
              v-else-if="showOrganizerEntry"
              to="/management"
              class="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
            >관리자 페이지</RouterLink>
            <ProfileDropdown />
          </template>
        </div>
      </div>

      <Transition name="nav-slide">
      <nav v-if="showNav" class="border-t border-slate-100 pt-3">
        <div class="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4">
          <RouterLink
            v-for="c in categories"
            :key="c.key"
            :to="c.to"
            class="relative whitespace-nowrap px-4 pb-3 pt-2 text-[16px] transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:bg-red-600 after:transition-transform after:duration-300"
            :class="currentCat === c.key
              ? 'font-extrabold text-red-600 after:scale-x-100'
              : 'font-medium text-slate-600 after:scale-x-0 hover:text-slate-900 hover:after:scale-x-100'"
          >
            {{ c.label }}
          </RouterLink>

          <!-- 구분선 -->
          <div class="mx-2 h-4 w-px shrink-0 bg-slate-300" />

          <!-- 특별 메뉴 -->
          <RouterLink
            to="/concerts/ranking"
            class="relative whitespace-nowrap px-4 pb-3 pt-2 text-[16px] text-red-600 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:bg-red-600 after:transition-transform after:duration-300"
            :class="currentSpecial === 'ranking' ? 'font-extrabold after:scale-x-100' : 'font-normal after:scale-x-0 hover:text-red-700 hover:after:scale-x-100'"
          >랭킹</RouterLink>
          <RouterLink
            to="/concerts/upcoming"
            class="relative whitespace-nowrap px-4 pb-3 pt-2 text-[16px] text-red-600 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:bg-red-600 after:transition-transform after:duration-300"
            :class="currentSpecial === 'upcoming' ? 'font-extrabold after:scale-x-100' : 'font-normal after:scale-x-0 hover:text-red-700 hover:after:scale-x-100'"
          >오픈예정</RouterLink>
          <RouterLink
            to="/nearby"
            class="relative whitespace-nowrap px-4 pb-3 pt-2 text-[16px] text-red-600 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:bg-red-600 after:transition-transform after:duration-300"
            :class="currentSpecial === 'nearby' ? 'font-extrabold after:scale-x-100' : 'font-normal after:scale-x-0 hover:text-red-700 hover:after:scale-x-100'"
          >내 주변</RouterLink>
        </div>
      </nav>
      </Transition>
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

    <main
      class="mx-auto min-h-screen max-w-6xl px-4 pb-16"
      :class="showOrganizerBanner ? 'pt-40' : showNav ? 'pt-[122px]' : 'pt-24'"
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

    <footer class="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div class="mx-auto max-w-6xl px-4 py-12">
        <!-- 상단: 브랜드 + 링크 그룹 + 고객센터 -->
        <div class="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div class="flex items-center gap-2">
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600">
              <Ticket class="h-5 w-5 text-white" />
            </div>
            <span class="text-lg font-bold uppercase tracking-tight text-white">ARTICKET</span>
          </div>

          <div class="flex flex-wrap gap-x-10 gap-y-8">
            <!-- 서비스 -->
            <div>
              <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">서비스</h3>
              <ul class="space-y-2 text-sm">
                <li><RouterLink to="/" class="hover:text-white">공연 예매</RouterLink></li>
                <li><RouterLink to="/concerts/ranking" class="hover:text-white">공연 랭킹</RouterLink></li>
                <li><RouterLink to="/performers" class="hover:text-white">아티스트</RouterLink></li>
                <li><RouterLink to="/nearby" class="hover:text-white">내 주변 공연</RouterLink></li>
              </ul>
            </div>
            <!-- 고객지원 -->
            <div>
              <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">고객지원</h3>
              <ul class="space-y-2 text-sm">
                <li><a href="#" class="hover:text-white">자주 묻는 질문</a></li>
                <li><a href="#" class="hover:text-white">1:1 문의</a></li>
                <li><a href="#" class="hover:text-white">단체/기업 문의</a></li>
              </ul>
            </div>
            <!-- 고객센터 -->
            <div>
              <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">고객센터</h3>
              <p class="text-lg font-bold text-white">1544-0000</p>
              <p class="mt-1 text-xs text-slate-400">평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00)</p>
              <p class="text-xs text-slate-400">주말·공휴일 휴무</p>
            </div>
          </div>
        </div>

        <!-- 약관 링크 -->
        <div class="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-700 pt-8">
          <a href="#" class="text-sm text-slate-400 hover:text-white">이용약관</a>
          <a href="#" class="text-sm font-medium text-slate-300 hover:text-white">개인정보처리방침</a>
          <a href="#" class="text-sm text-slate-400 hover:text-white">취소/환불 정책</a>
        </div>

        <!-- 사업자 정보 -->
        <div class="mt-6 text-xs text-slate-500 leading-relaxed">
          <p>주식회사 아티켓 · 대표이사 홍길동 · 서울특별시 강남구 테헤란로 123 아티켓타워 10층</p>
          <p class="mt-1">사업자등록번호 123-45-67890 · 통신판매업신고 제2026-서울강남-00000호</p>
        </div>

        <p class="mt-6 text-xs text-slate-600">
          © 2026 ARTICKET. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import { Search, Bell, LogIn, Ticket } from 'lucide-vue-next'
import UiButton from '../components/common/UiButton.vue'
import UiBadge from '../components/common/UiBadge.vue'
import UiModal from '../components/common/UiModal.vue'
import NotificationPanel from '../components/common/NotificationPanel.vue'
import ProfileDropdown from '../components/common/ProfileDropdown.vue'
import { useRole } from '../composables/useRole'
import { useMe } from '../composables/useMe'
import { useSSE } from '../composables/useSSE'
import { useApi } from '../composables/useApi'
import { ENDPOINTS } from '../lib/api/endpoints'

export default {
  name: 'DefaultLayout',
  components: {
    Search,
    Bell,
    LogIn,
    Ticket,
    UiButton,
    UiBadge,
    UiModal,
    NotificationPanel,
    ProfileDropdown,
  },
  data() {
    return {
      q: this.$route.query.q || '',
      _me: null,
      _refreshAttempted: false,
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
      sseState: null,
      _sse: null,
    }
  },
  computed: {
    currentCat() {
      if (this.currentSpecial) return null
      const p = this.$route.path
      if (/^\/concerts\/[^/]+$/.test(p)) return null
      if (p === '/') return 'all'
      const m = p.match(/^\/genre\/(\w+)$/)
      return m ? m[1] : 'all'
    },
    currentSpecial() {
      const p = this.$route.path
      if (p === '/concerts/ranking') return 'ranking'
      if (p === '/concerts/upcoming') return 'upcoming'
      if (p === '/nearby') return 'nearby'
      return null
    },
    showNav() {
      const p = this.$route.path
      if (p === '/') return true
      if (/^\/genre\/\w+$/.test(p)) return true
      if (p === '/concerts/ranking') return true
      if (p === '/concerts/upcoming') return true
      if (p === '/nearby') return true
      if (/^\/concerts\/[^/]+$/.test(p)) return true
      return false
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
    /** 주최자 승인됐거나 이미 ORGANIZER/ADMIN 역할일 때 관리자 페이지 버튼 표시 */
    showOrganizerEntry() {
      if (this.roleValue === 'ORGANIZER' || this.roleValue === 'ADMIN') return true
      return this.meProfile?.organizerStatus === 'APPROVED'
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
    this._api = useApi()
    const key = 'organizerBannerDismissed'
    try {
      const dismissed = sessionStorage.getItem(key)
      const today = new Date().toISOString().slice(0, 10)
      if (dismissed === today) this.organizerBannerDismissed = true
    } catch {}
    window.addEventListener('storage', this.onStorage)
    window.addEventListener('focus', this.onWindowFocus)
    this.bumpTokenVersion()
    // SSE 초기화
    this._sse = useSSE()
    this.sseState = this._sse.state
    if (localStorage.getItem('accessToken')) this._sse.connect()
  },
  mounted() {
    if (this.isLoggedIn && this._me?.refetch) {
      this._me.refetch().then((profile) => this.maybeRefreshTokenAfterApproval(profile))
    }
    window.addEventListener('scroll', this.onScroll, { passive: true })
    window.addEventListener('click', this.onClickOutside)
    this.onScroll()
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.onStorage)
    window.removeEventListener('focus', this.onWindowFocus)
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
    },
    isLoggedIn(v) {
      if (v && this._me?.refetch) this._me.refetch()
      if (v) this._sse?.connect()
      else this._sse?.disconnect()
    },
    // SSE 알림 기반 추가 UX 처리
    'sseState.notifications'(list) {
      if (!Array.isArray(list) || list.length === 0) return
      const latest = list[0]
      if (!latest) return
      // 주최자 승인 알림 수신 시: 프로필/토큰을 즉시 갱신하여 UI에 반영
      if (latest.eventName === 'admin' && latest.type === 'ORGANIZER_APPROVED') {
        if (this._me?.refetch) {
          this._me
            .refetch()
            .then((profile) => this.maybeRefreshTokenAfterApproval(profile))
            .catch(() => {})
        }
      }
    },
    // 주최자 승인 후 프로필만 갱신된 경우: 토큰 갱신으로 role 반영
    meProfile: {
      handler(profile) {
        this.maybeRefreshTokenAfterApproval(profile)
      },
      deep: true
    }
  },
  methods: {
    onScroll() {
      this.scrolled = window.scrollY > 20
    },
    bumpTokenVersion() {
      this.tokenVersion++
    },
    onClickOutside() {
      // NotificationPanel, ProfileDropdown handle their own click-outside
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
    /** 탭 포커스 시 내 정보 재요청 → admin 승인 후 UI·토큰 갱신 반영 (refetch 결과를 직접 사용해 타이밍 이슈 방지) */
    onWindowFocus() {
      if (!this.isLoggedIn || !this._me?.refetch) return
      this._me.refetch().then((profile) => this.maybeRefreshTokenAfterApproval(profile))
    },
    /** 프로필에 승인(APPROVED)인데 JWT role은 아직 USER일 때만 토큰 갱신 시도 */
    maybeRefreshTokenAfterApproval(profile) {
      if (!profile || profile.organizerStatus !== 'APPROVED') return
      if (this.roleValue === 'ORGANIZER' || this.roleValue === 'ADMIN') return
      this.tryRefreshTokenForApprovedOrganizer()
    },
    /** 주최자 승인된 상태인데 JWT에는 아직 USER일 때: refresh API로 새 토큰 받아 role 동기화 */
    async tryRefreshTokenForApprovedOrganizer() {
      if (this._refreshAttempted) return
      const refreshToken = typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null
      if (!refreshToken || typeof this._syncFromToken !== 'function') return
      this._refreshAttempted = true
      try {
        const data = await this._api.post(ENDPOINTS.refreshAt(), { refreshToken }, { skipErrorAlert: true })
        const accessToken = data?.access_token ?? data?.accessToken
        if (accessToken && typeof localStorage !== 'undefined') {
          localStorage.setItem('accessToken', accessToken)
          this._syncFromToken()
          this.bumpTokenVersion()
        } else {
          this._refreshAttempted = false
        }
      } catch (_) {
        this._refreshAttempted = false
      }
    }
  }
}
</script>

<style scoped>
.nav-slide-enter-active {
  transition: opacity 0.2s ease-out;
}
.nav-slide-leave-active {
  transition: opacity 0.15s ease-in;
}
.nav-slide-enter-from,
.nav-slide-leave-to {
  opacity: 0;
}
</style>
