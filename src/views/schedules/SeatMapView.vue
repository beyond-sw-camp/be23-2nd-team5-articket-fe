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
          <div class="mt-1 text-sm text-slate-500">
            ID: {{ seatMap.id }} · 
            <span v-if="seatMap.version">v{{ seatMap.version }}</span>
            <span v-else>버전 없음</span>
            <span v-if="seatMap.row_count && seatMap.col_count">
              · {{ seatMap.row_count }}행 × {{ seatMap.col_count }}열
            </span>
          </div>
        </div>
        <UiBadge tone="soft">{{ seatMap.status }}</UiBadge>
      </div>

      <!-- ERD 기반: row_count/col_count 표시 -->
      <div v-if="seatMap.row_count && seatMap.col_count" class="mt-4">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-sm font-semibold text-slate-900">좌석 배치 (ERD: row_count × col_count)</div>
          <div class="mt-2 text-sm text-slate-500">
            <span class="font-semibold">{{ seatMap.row_count }}</span>행 × 
            <span class="font-semibold">{{ seatMap.col_count }}</span>열
          </div>
          <div class="mt-3 text-xs text-slate-400">
            총 {{ seatMap.row_count * seatMap.col_count }}석
          </div>
        </div>
      </div>
      
      <!-- 좌석맵 정보가 없는 경우 -->
      <div v-else class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <div class="text-sm font-semibold text-slate-900">좌석맵 정보가 없습니다</div>
        <div class="mt-1 text-xs text-slate-500">공연장의 좌석맵이 등록되지 않았습니다</div>
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
        const scheduleId = this.$route.params.scheduleId
        this.seatMap = await this.api.get(ENDPOINTS.seatMap(scheduleId))
      } catch (err) {
        this.seatMap = null
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
