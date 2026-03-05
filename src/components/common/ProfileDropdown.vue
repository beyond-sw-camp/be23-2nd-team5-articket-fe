<template>
  <div class="profile-panel-root relative flex h-10 items-center">
    <button
      type="button"
      class="flex h-10 items-center gap-3 hover:opacity-80"
      @click="menuOpen = !menuOpen"
    >
      <div class="flex flex-col items-start">
        <span class="text-xs font-bold uppercase tracking-wide text-slate-900">{{ roleLabel }}</span>
        <span class="text-sm font-medium text-slate-500">{{ userName }} 님</span>
      </div>
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900">
        <User class="h-5 w-5 text-white" />
      </div>
    </button>
    <div
      v-show="menuOpen"
      class="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1.5 shadow-md"
    >
      <template v-if="!compact">
      <RouterLink
        to="/me"
        class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        @click="menuOpen = false"
      >
        <User class="h-4 w-4 shrink-0 text-slate-400" />
        마이페이지
      </RouterLink>
      <RouterLink
        to="/me/orders"
        class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        @click="menuOpen = false"
      >
        <Package class="h-4 w-4 shrink-0 text-slate-400" />
        내 주문 목록
      </RouterLink>
      <RouterLink
        to="/me/foru"
        class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        @click="menuOpen = false"
      >
        <Star class="h-4 w-4 shrink-0 text-slate-400" />
        FOR U
      </RouterLink>
      <div class="my-1 border-t border-slate-100" />
      </template>
      <button
        type="button"
        class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
        @click="menuOpen = false; handleLogout()"
      >
        <LogOut class="h-4 w-4 shrink-0 text-slate-400" />
        로그아웃
      </button>
    </div>
  </div>
</template>

<script>
import { User, Package, Star, LogOut } from 'lucide-vue-next'
import { getRole, useRole } from '../../composables/useRole'
import { useMe } from '../../composables/useMe'
import { useSSE } from '../../composables/useSSE'

export default {
  name: 'ProfileDropdown',
  props: {
    /** 관리자 페이지에서 true 시 로그아웃만 표시 */
    compact: { type: Boolean, default: false },
  },
  components: {
    User,
    Package,
    Star,
    LogOut,
  },
  data() {
    return {
      menuOpen: false,
    }
  },
  computed: {
    roleValue() {
      const r = getRole()
      return r ? String(r).toUpperCase() : 'GUEST'
    },
    roleLabel() {
      const r = this.roleValue
      if (r === 'ORGANIZER') return 'ORGANIZER'
      if (r === 'ADMIN') return 'ADMIN'
      return 'MEMBER'
    },
    userName() {
      const { profile } = useMe()
      const p = profile?.value ?? null
      return p?.name ?? p?.email?.split('@')[0] ?? '회원'
    },
  },
  mounted() {
    window.addEventListener('click', this.onClickOutside)
  },
  beforeUnmount() {
    window.removeEventListener('click', this.onClickOutside)
  },
  watch: {
    $route() {
      this.menuOpen = false
    },
  },
  methods: {
    onClickOutside(e) {
      if (this.menuOpen && !e.target.closest('.profile-panel-root')) {
        this.menuOpen = false
      }
    },
    async handleLogout() {
      const sse = useSSE()

      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('isVerified')
      sse?.disconnect?.()

      // 전체 리로드로 헤더 등 UI가 확실히 갱신되도록 함
      window.location.href = '/'
    },
  },
}
</script>
