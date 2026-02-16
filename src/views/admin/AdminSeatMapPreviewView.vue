<template>
  <UiCard v-if="seatMap">
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">좌석맵 미리보기</div>
        <div class="mt-1 text-sm text-slate-500">
          ID: {{ seatMap.id }} · 
          <span v-if="seatMap.version !== null && seatMap.version !== undefined">v{{ seatMap.version }}</span>
          <span v-else>버전 없음</span>
        </div>
      </div>
      <UiBadge tone="soft">ADMIN</UiBadge>
    </div>

    <!-- ERD 기반: row_count/col_count 방식 -->
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
        <div class="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
          <div>상태: <span class="font-semibold">{{ seatMap.status || 'DRAFT' }}</span></div>
          <div v-if="seatMap.version !== null && seatMap.version !== undefined">
            버전: <span class="font-semibold">{{ seatMap.version }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
      <div class="text-sm font-semibold text-slate-900">좌석맵 정보가 없습니다</div>
      <div class="mt-1 text-xs text-slate-500">공연장의 좌석맵이 등록되지 않았습니다</div>
    </div>

    <div class="mt-4 flex gap-2">
      <UiButton variant="ghost" class="h-11 px-4" @click="$router.back()">뒤로</UiButton>
      <UiButton class="h-11 px-5" @click="$router.push(`/admin/seat-maps/${seatMap.id}/publish`)">게시/폐기</UiButton>
    </div>
  </UiCard>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { MOCK_SEAT_MAPS } from '../../mocks/venues'

export default {
  name: 'AdminSeatMapPreviewView',
  components: {
    UiCard,
    UiBadge,
    UiButton
  },
  computed: {
    seatMap() {
      const seatMapId = this.$route.params.seatMapId
      // MOCK_SEAT_MAPS에서 찾기
      const fromMock = MOCK_SEAT_MAPS.find((sm) => sm.id === seatMapId)
      if (fromMock) return fromMock
      
      // 생성된 더미 데이터에서 찾기 (localStorage에서)
      try {
        const stored = JSON.parse(localStorage.getItem('createdSeatMaps') || '[]')
        const fromCreated = stored.find((sm) => sm.id === seatMapId)
        if (fromCreated) return fromCreated
      } catch (e) {
        console.warn('Failed to load created seat maps from localStorage', e)
      }
      
      return null
    }
  }
}
</script>
