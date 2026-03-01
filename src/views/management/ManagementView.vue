<template>
  <div class="grid gap-6">
    <div class="flex items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">
          {{ roleLabel }} 관리
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          {{ roleLabel }} 전용 메뉴를 선택하세요
        </p>
      </div>
      <UiBadge tone="solid" :color="roleValue === 'ADMIN' ? 'slate' : 'red'">
        {{ roleValue }}
      </UiBadge>
    </div>

    <!-- 주최자 메뉴 -->
    <div v-if="roleValue === 'ORGANIZER'" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="item in organizerMenus"
        :key="item.to"
        :to="item.to"
        class="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-red-200 hover:shadow-md"
      >
        <span class="text-2xl">{{ item.icon }}</span>
        <div>
          <div class="font-semibold text-slate-900 group-hover:text-red-600">{{ item.label }}</div>
          <div class="mt-0.5 text-xs text-slate-500">{{ item.desc }}</div>
        </div>
        <span class="mt-auto text-sm font-medium text-red-600 opacity-0 transition group-hover:opacity-100">
          이동 →
        </span>
      </RouterLink>
    </div>

    <!-- 관리자 메뉴 -->
    <div v-if="roleValue === 'ADMIN'" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="item in adminMenus"
        :key="item.to"
        :to="item.to"
        class="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
      >
        <span class="text-2xl">{{ item.icon }}</span>
        <div>
          <div class="font-semibold text-slate-900 group-hover:text-slate-700">{{ item.label }}</div>
          <div class="mt-0.5 text-xs text-slate-500">{{ item.desc }}</div>
        </div>
        <span class="mt-auto text-sm font-medium text-slate-600 opacity-0 transition group-hover:opacity-100">
          이동 →
        </span>
      </RouterLink>
    </div>

    <div v-if="!isManagementRole" class="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
      <p class="text-sm font-medium text-amber-800">접근 권한이 없습니다.</p>
      <p class="mt-2 text-xs text-amber-700">주최자 또는 관리자 계정으로 로그인해 주세요.</p>
      <UiButton class="mt-4" @click="$router.push('/')">홈으로</UiButton>
    </div>
  </div>
</template>

<script>
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { getRole } from '../../composables/useRole'

const ORGANIZER_MENUS = [
  { to: '/organizer', label: '대시보드', desc: '판매 현황, 오픈/마감 알림', icon: '📊' },
  { to: '/organizer/concerts', label: '공연 목록', desc: '내 공연 관리', icon: '🎭' },
  { to: '/organizer/concerts/new', label: '공연 등록', desc: '새 공연 등록', icon: '➕' },
  { to: '/organizer/performers', label: '아티스트 관리', desc: '출연진 관리', icon: '👤' },
]

const ADMIN_MENUS = [
  { to: '/admin', label: '대시보드', desc: '운영 요약', icon: '📊' },
  { to: '/admin/venues', label: '공연장', desc: '공연장·좌석맵 관리', icon: '🏟️' },
  { to: '/admin/users', label: '회원관리', desc: '사용자 관리', icon: '👥' },
  { to: '/admin/orders', label: '주문', desc: '주문 조회', icon: '📦' },
  { to: '/admin/pending-organizers', label: '주최자 승인', desc: '주최자 신청 검토', icon: '✅' },
]

export default {
  name: 'ManagementView',
  components: {
    UiBadge,
    UiButton,
  },
  data() {
    return {
      organizerMenus: ORGANIZER_MENUS,
      adminMenus: ADMIN_MENUS,
    }
  },
  computed: {
    roleValue() {
      const r = getRole()
      if (!r) return 'GUEST'
      const s = String(r).toUpperCase()
      if (s === 'ORGANIZER' || s === 'ADMIN') return s
      return r
    },
    roleLabel() {
      return this.roleValue === 'ORGANIZER' ? '주최자' : this.roleValue === 'ADMIN' ? '관리자' : ''
    },
    isManagementRole() {
      return this.roleValue === 'ORGANIZER' || this.roleValue === 'ADMIN'
    },
  },
}
</script>
