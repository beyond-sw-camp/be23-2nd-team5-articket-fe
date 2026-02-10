<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { MOCK_SEAT_MAPS } from '../../mocks/venues'

const route = useRoute()
const seatMap = computed(() => MOCK_SEAT_MAPS.find((sm) => sm.id === route.params.seatMapId))
</script>

<template>
  <UiCard v-if="seatMap">
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">좌석맵 미리보기</div>
        <div class="mt-1 text-sm text-slate-500">{{ seatMap.name }} · v{{ seatMap.version }}</div>
      </div>
      <UiBadge tone="soft">ADMIN</UiBadge>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-3">
      <div v-for="sec in seatMap.sections" :key="sec.key" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div class="text-sm font-semibold text-slate-900">Section {{ sec.key }}</div>
        <div class="mt-1 text-sm text-slate-500">{{ sec.rows }} x {{ sec.cols }}</div>
      </div>
    </div>

    <div class="mt-4 flex gap-2">
      <UiButton variant="ghost" class="h-11 px-4" @click="$router.back()">뒤로</UiButton>
      <UiButton class="h-11 px-5" @click="$router.push(`/admin/seat-maps/${seatMap.id}/publish`)">게시/폐기</UiButton>
    </div>
  </UiCard>
</template>

