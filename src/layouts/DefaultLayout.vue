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

            <UiButton variant="ghost" class="h-10 px-3">
              <Bell class="h-4 w-4" />
            </UiButton>

            <div class="flex items-center gap-2">
              <!-- ORGANIZER 메뉴 (JWT role 기준) -->
              <div v-if="roleValue === 'ORGANIZER'" class="relative inline-block">
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
                <span class="ml-2 text-sm">내정보</span>
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

    <main class="mx-auto max-w-6xl px-4 pb-16 pt-40">
      <slot />
      <RouterView />
    </main>

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
import { useRole } from '../composables/useRole'
import PortOne from '@portone/browser-sdk/v2';

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
    UiBadge
  },
  data() {
    return {
      q: this.$route.query.q || '',
      categories: [
        { key: 'all', label: '전체', to: { path: '/', query: {} } },
        { key: 'musical', label: '뮤지컬', to: { path: '/', query: { cat: 'musical' } } },
        { key: 'concert', label: '콘서트', to: { path: '/', query: { cat: 'concert' } } },
        { key: 'play', label: '연극', to: { path: '/', query: { cat: 'play' } } },
        { key: 'classic', label: '클래식', to: { path: '/', query: { cat: 'classic' } } },

        { key: 'sports', label: '스포츠', to: { path: '/', query: { cat: 'sports' } } },
        { key: 'leisure', label: '레저', to: { path: '/', query: { cat: 'leisure' } } }
      ],

      tokenVersion: 0,
      adminMenuOpen: false,
      organizerMenuOpen: false,
      scrolled: false
    }
  },
  computed: {
    currentCat() {
      return String(this.$route.query.cat || 'all')
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
    }
  },
  created() {
    const { role, logout, syncFromToken } = useRole()
    this.role = role
    this._logoutComposable = logout
    this._syncFromToken = syncFromToken
    window.addEventListener('storage', this.onStorage)
    this.bumpTokenVersion()
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll, { passive: true })
    this.onScroll()
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.onStorage)
    window.removeEventListener('scroll', this.onScroll)
  },
  watch: {
    '$route.query.q'(v) {
      this.q = v || ''
    },
    $route() {
      this.adminMenuOpen = false
      this.organizerMenuOpen = false
      this.bumpTokenVersion()
    }
  },
  methods: {
    onScroll() {
      this.scrolled = window.scrollY > 20
    },
    bumpTokenVersion() {
      this.tokenVersion++
    },
    onStorage(e) {
      if (e.key === 'accessToken' || e.key === 'refreshToken') {
        if (typeof this._syncFromToken === 'function') this._syncFromToken()
        this.bumpTokenVersion()
      }
    },
    submitSearch() {
      this.$router.push({ path: '/', query: { ...this.$route.query, q: this.q || undefined } })
    },

    async handleLogout() {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('isVerified')
      if (typeof this._logoutComposable === 'function') {
        await this._logoutComposable()
      }

      this.bumpTokenVersion()

      this.$router.push('/')
    }
  }
}
</script>
