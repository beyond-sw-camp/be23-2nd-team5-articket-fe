<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <UiCard v-else-if="item">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CalendarClock class="h-4 w-4 text-slate-600" />
            {{ new Date(item.play_time).toLocaleString() }}
          </div>
          <div class="mt-1 text-sm text-slate-500">
            상태: <span class="font-semibold text-slate-700">{{ item.status }}</span>
          </div>
          <div class="mt-1 text-sm text-slate-500">
            가격 요약: ₩{{ item.summary?.minPrice?.toLocaleString() }} ~ ₩{{ item.summary?.maxPrice?.toLocaleString() }}
          </div>
        </div>
        <UiBadge :tone="item.status === 'OPEN' ? 'solid' : 'soft'" :color="item.status === 'OPEN' ? 'red' : 'slate'">
          {{ item.status }}
        </UiBadge>
      </div>

      <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div class="text-xs font-semibold text-slate-600">예매 진행</div>
        <div class="mt-1 text-xs text-slate-500">
          좌석을 선택하고 선점한 후 결제를 진행하세요. 선점은 5분간 유지됩니다.
          <span v-if="isAgeLimited" class="block mt-1 text-[11px] text-red-500">
            이 공연은 만 {{ item.ageLimit }}세 이상 관람가입니다. 로그인 및 연령 인증이 필요한 경우가 있습니다.
          </span>
        </div>
      </div>
      
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <UiButton variant="ghost" class="h-12" @click="$router.push(`/schedules/${$route.params.scheduleId}/seat-map`)">
          <LayoutGrid class="h-4 w-4" />
          <span class="ml-2">좌석맵 구조 보기</span>
        </UiButton>
        <UiButton
          class="h-12"
          :disabled="isAgeLimited && !canEnterSeats"
          @click="handleSeatsClick"
        >
          <Timer class="h-4 w-4" />
          <span class="ml-2">좌석 선택 및 선점</span>
        </UiButton>
      </div>
    </UiCard>
  </div>
</template>

<script>
import { CalendarClock, LayoutGrid, Timer } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import { useApi } from '../../composables/useApi'
import { useMe } from '../../composables/useMe'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'ScheduleDetailView',
  components: {
    CalendarClock,
    LayoutGrid,
    Timer,
    UiCard,
    UiButton,
    UiBadge
  },
  data() {
    return {
      loading: false,
      item: null,
      api: null,
      me: null,
    }
  },
  created() {
    this.api = useApi()
    this.me = useMe()
  },
  mounted() {
    this.load()
  },
  computed: {
    isAgeLimited() {
      const limit = this.item?.ageLimit ?? this.item?.age_limit
      return typeof limit === 'number' && limit > 0
    },
    isLoggedIn() {
      if (typeof localStorage === 'undefined') return false
      return !!localStorage.getItem('accessToken')
    },
    profile() {
      return this.me?.profile?.value ?? null
    },
    isAgeVerified() {
      const p = this.profile
      return !!(p && (p.ageVerifiedAt || p.age_verified_at))
    },
    canEnterSeats() {
      if (!this.isAgeLimited) return true
      if (!this.isLoggedIn) return false
      return this.isAgeVerified
    },
  },
  methods: {
    async load() {
      const scheduleId = this.$route.params.scheduleId
      if (scheduleId == null || scheduleId === '') {
        this.loading = false
        return
      }
      this.loading = true
      try {
        this.item = await this.api.get(ENDPOINTS.schedule(scheduleId))
        if (this.isLoggedIn && this.me && typeof this.me.refetch === 'function') {
          // 최신 연령 인증 정보 확보
          this.me.refetch().catch(() => {})
        }
      } finally {
        this.loading = false
      }
    },
    handleSeatsClick() {
      const scheduleId = this.$route.params.scheduleId
      if (!scheduleId) return

      if (!this.isAgeLimited) {
        this.$router.push(`/schedules/${scheduleId}/seats`)
        return
      }

      if (!this.isLoggedIn) {
        alert('연령 제한이 있는 공연입니다. 로그인 후 이용해 주세요.')
        this.$router.push({
          path: '/member/doLogin',
          query: { redirect: this.$route.fullPath },
        })
        return
      }

      if (!this.isAgeVerified) {
        alert('연령 인증이 되지 않은 사용자입니다. 본인 인증을 먼저 진행해 주세요.')
        this.$router.push('/me/verify-identity')
        return
      }

      this.$router.push(`/schedules/${scheduleId}/seats`)
    }
  }
}
</script>
