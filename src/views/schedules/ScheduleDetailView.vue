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
        </div>
      </div>
      
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <UiButton variant="ghost" class="h-12" @click="$router.push(`/schedules/${$route.params.scheduleId}/seat-map`)">
          <LayoutGrid class="h-4 w-4" />
          <span class="ml-2">좌석맵 구조 보기</span>
        </UiButton>
        <UiButton class="h-12" @click="$router.push(`/schedules/${$route.params.scheduleId}/seats`)">
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
      api: null
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const scheduleId = this.$route.params.scheduleId
        let schedule
        try {
          schedule = await this.api.get(ENDPOINTS.schedule(scheduleId))
        } catch (err) {
          // API 실패 시 localStorage에서 더미 데이터 로드
          console.warn('API call failed, using dummy data', err)
          const stored = JSON.parse(localStorage.getItem('createdSchedules') || '[]')
          schedule = stored.find((s) => s.id === scheduleId)
          
          if (schedule) {
            schedule = {
              ...schedule,
              summary: {
                minPrice: 50000,
                maxPrice: 150000
              }
            }
          }
        }
        
        this.item = schedule
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
