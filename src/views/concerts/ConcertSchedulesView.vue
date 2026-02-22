<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <template v-else>
      <div class="flex items-end justify-between gap-4">
        <div>
          <div class="text-sm font-semibold text-slate-900">회차 목록</div>
          <div class="mt-1 text-sm text-slate-500">{{ concert ? concert.title : '' }}</div>
          <div class="mt-1 text-xs text-slate-400">OPEN 상태인 회차를 클릭하면 좌석 선택 화면으로 이동합니다</div>
        </div>
        <UiButton variant="ghost" class="h-11 px-4" @click="$router.push(`/concerts/${$route.params.concertId}`)">
          공연 상세
        </UiButton>
      </div>

      <div v-if="schedules.length === 0" class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <div class="text-sm font-semibold text-slate-900">등록된 회차가 없습니다</div>
        <div class="mt-1 text-xs text-slate-500">주최자가 회차를 등록하면 예매할 수 있습니다</div>
      </div>
      
      <div v-else class="grid gap-3">
        <UiCard
          v-for="s in schedules"
          :key="s.id"
          class="cursor-pointer transition hover:shadow-lg"
          @click="goToSeats(s)"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CalendarClock class="h-4 w-4 text-slate-600" />
                {{ new Date(s.play_time).toLocaleString() }}
              </div>
              <div class="mt-1 text-sm text-slate-500">
                가격 요약: ₩{{ s.summary?.minPrice?.toLocaleString() }} ~ ₩{{ s.summary?.maxPrice?.toLocaleString() }}
              </div>
              <div v-if="s.status === 'OPEN'" class="mt-2 text-xs font-semibold text-red-600">
                예매 가능
              </div>
              <div v-else-if="s.status === 'CLOSED'" class="mt-2 text-xs font-semibold text-slate-500">
                예매 마감
              </div>
            </div>
            <UiBadge v-bind="statusBadge(s.status)">{{ statusBadge(s.status).label }}</UiBadge>
          </div>
        </UiCard>
      </div>
    </template>
  </div>
</template>

<script>
import { CalendarClock } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'ConcertSchedulesView',
  components: {
    CalendarClock,
    UiCard,
    UiBadge,
    UiButton
  },
  data() {
    return {
      concert: null,
      schedules: [],
      loading: false,
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
        const concertId = this.$route.params.concertId
        try {
          this.concert = await this.api.get(ENDPOINTS.concert(concertId))
        } catch {
          this.concert = { title: '공연', id: concertId }
        }
        const res = await this.api.get(`${ENDPOINTS.concertSchedules(concertId)}?page=0&size=50&sort=playTime,asc`)
        const list = res.content ?? res.items ?? []
        this.schedules = list.map((s) => ({
          ...s,
          play_time: s.playTime ?? s.play_time,
          summary: s.summary ?? { minPrice: 50000, maxPrice: 150000 }
        }))
      } catch (err) {
        this.schedules = []
      } finally {
        this.loading = false
      }
    },
    statusBadge(st) {
      return st === 'OPEN' ? { tone: 'solid', color: 'red', label: 'OPEN' } : { tone: 'soft', color: 'slate', label: 'CLOSED' }
    },
    goToSeats(schedule) {
      // OPEN 상태인 회차만 좌석 선택으로 이동
      if (schedule.status === 'OPEN') {
        this.$router.push(`/schedules/${schedule.id}/seats`)
      } else {
        // CLOSED나 READY 상태면 회차 상세로 이동
        this.$router.push(`/schedules/${schedule.id}`)
      }
    }
  }
}
</script>
