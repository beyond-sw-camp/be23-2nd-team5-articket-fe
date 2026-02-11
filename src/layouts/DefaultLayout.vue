<template>
  <div class="min-h-screen bg-slate-50">
    <header class="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div class="mx-auto max-w-6xl px-4">
        <div class="flex items-center gap-3 py-3">
          <RouterLink to="/" class="flex items-center gap-2">
            <div class="h-9 w-9 rounded-xl bg-red-600 shadow-sm"></div>
            <div class="leading-tight">
              <div class="text-sm font-semibold text-slate-900">NexTicket</div>
              <div class="text-xs text-slate-500">공연, 아티스트, 공연장 검색</div>
            </div>
          </RouterLink>

          <form class="ml-2 flex flex-1 items-center gap-2" @submit.prevent="submitSearch">
            <div class="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <Search class="h-4 w-4 text-slate-500" />
              <input
                v-model="q"
                class="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                placeholder="공연, 아티스트, 공연장 검색"
              />
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
              <div class="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 py-1 shadow-sm">
                <span class="text-xs font-semibold text-slate-700">Role</span>
                <select
                  class="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
                  :value="role"
                  @change="setRole($event.target.value)"
                >
                  <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>

              <UiBadge v-if="role !== 'GUEST'" tone="solid">{{ role }}</UiBadge>
              <UiBadge v-else tone="soft">GUEST</UiBadge>

              <!-- 토큰 기반 로그인 UI -->
              <UiButton
                v-if="!isLoggedIn"
                variant="ghost"
                class="h-10 px-3"
                @click="$router.push('/member/doLogin')"
              >
                <LogIn class="h-4 w-4" />
                <span class="ml-2 text-sm">로그인</span>
              </UiButton>

              <UiButton
                v-else
                variant="ghost"
                class="h-10 px-3"
                @click="$router.push('/me')"
              >
                <User class="h-4 w-4" />
                <span class="ml-2 text-sm">내정보</span>
              </UiButton>

              <UiButton
                v-if="isLoggedIn"
                variant="ghost"
                class="h-10 px-3"
                @click="handleLogout"
              >
                <ShieldAlert class="h-4 w-4" />
                <span class="ml-2 text-sm">로그아웃</span>
              </UiButton>
            </div>
          </div>
        </div>

        <nav class="flex items-center gap-2 overflow-x-auto pb-3">
          <RouterLink
            v-for="c in categories"
            :key="c.key"
            :to="c.to"
            class="whitespace-nowrap rounded-2xl border px-3 py-2 text-sm font-semibold shadow-sm transition"
            :class="
              currentCat === c.key
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            "
          >
            {{ c.label }}
          </RouterLink>

          <div class="ml-auto hidden items-center gap-2 sm:flex">
            <UiBadge tone="soft">API</UiBadge>
            <UiBadge tone="soft">Vue Router Guard</UiBadge>
          </div>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 pb-16 pt-32">
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
      roles: ['GUEST', 'USER', 'ORGANIZER', 'ADMIN'],
      categories: [
        { key: 'all', label: '전체', to: { path: '/', query: {} } },
        { key: 'musical', label: '뮤지컬', to: { path: '/', query: { cat: 'musical' } } },
        { key: 'concert', label: '콘서트', to: { path: '/', query: { cat: 'concert' } } },
        { key: 'play', label: '연극', to: { path: '/', query: { cat: 'play' } } },
        { key: 'classic', label: '클래식', to: { path: '/', query: { cat: 'classic' } } },
        { key: 'sports', label: '스포츠', to: { path: '/', query: { cat: 'sports' } } },
        { key: 'leisure', label: '레저', to: { path: '/', query: { cat: 'leisure' } } }
      ],

      tokenVersion: 0
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
    }
  },
  created() {
    const { role, setRole, logout } = useRole()
    this.role = role
    this.setRole = setRole
    this._logoutComposable = logout

    window.addEventListener('storage', this.onStorage)
    this.bumpTokenVersion()
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.onStorage)
  },
  watch: {
    '$route.query.q'(v) {
      this.q = v || ''
    },
    $route() {
      this.bumpTokenVersion()
    }
  },
  methods: {
    bumpTokenVersion() {
      this.tokenVersion++
    },
    onStorage(e) {
      if (e.key === 'accessToken' || e.key === 'refreshToken') {
        this.bumpTokenVersion()
      }
    },
    submitSearch() {
      this.$router.push({ path: '/', query: { ...this.$route.query, q: this.q || undefined } })
    },
    async handleLogout() {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')

      if (typeof this._logoutComposable === 'function') {
        await this._logoutComposable()
      } else if (typeof this.setRole === 'function') {
        this.setRole('GUEST')
      }

      this.bumpTokenVersion()

      this.$router.push('/')
    }
  }
}
</script>
