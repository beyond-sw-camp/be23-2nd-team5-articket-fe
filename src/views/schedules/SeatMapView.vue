<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <UiCard v-else-if="seatMap">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <LayoutGrid class="h-4 w-4 text-slate-600" />
            좌석맵 구조
          </div>
          <div class="mt-1 text-sm text-slate-500">{{ seatMap.name }} · v{{ seatMap.version }}</div>
        </div>
        <UiBadge tone="soft">{{ seatMap.status }}</UiBadge>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <div
          v-for="sec in seatMap.sections"
          :key="sec.key"
          class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
        >
          <div class="text-sm font-semibold text-slate-900">Section {{ sec.key }}</div>
          <div class="mt-1 text-sm text-slate-500">{{ sec.rows }} rows · {{ sec.cols }} cols</div>
        </div>
      </div>

      <div class="mt-4">
        <UiButton class="h-12 px-5" @click="$router.push(`/schedules/${$route.params.scheduleId}/seats`)">
          좌석 선택으로 이동
        </UiButton>
      </div>
    </UiCard>
  </div>
</template>

<script>
import { LayoutGrid } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'SeatMapView',
  components: {
    LayoutGrid,
    UiCard,
    UiButton,
    UiBadge
  },
  data() {
    return {
      loading: false,
      seatMap: null,
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
        this.seatMap = await this.api.get(ENDPOINTS.seatMap(this.$route.params.scheduleId))
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
