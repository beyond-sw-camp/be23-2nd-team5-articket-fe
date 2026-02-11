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
        </div>
        <UiButton variant="ghost" class="h-11 px-4" @click="$router.push(`/concerts/${$route.params.concertId}`)">
          공연 상세
        </UiButton>
      </div>

      <div class="grid gap-3">
        <UiCard
          v-for="s in schedules"
          :key="s.id"
          class="cursor-pointer transition hover:shadow-lg"
          @click="$router.push(`/schedules/${s.id}`)"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CalendarClock class="h-4 w-4 text-slate-600" />
                {{ new Date(s.startsAt).toLocaleString() }}
              </div>
              <div class="mt-1 text-sm text-slate-500">
                가격 요약: ₩{{ s.summary?.minPrice?.toLocaleString() }} ~ ₩{{ s.summary?.maxPrice?.toLocaleString() }}
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
        this.concert = await this.api.get(ENDPOINTS.concert(this.$route.params.concertId))
        const res = await this.api.get(ENDPOINTS.concertSchedules(this.$route.params.concertId))
        this.schedules = res.items || []
      } finally {
        this.loading = false
      }
    },
    statusBadge(st) {
      return st === 'OPEN' ? { tone: 'solid', color: 'red', label: 'OPEN' } : { tone: 'soft', color: 'slate', label: 'CLOSED' }
    }
  }
}
</script>
