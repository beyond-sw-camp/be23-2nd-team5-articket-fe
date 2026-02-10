<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import UiCard from '../../components/common/UiCard.vue'
import UiTable from '../../components/common/UiTable.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

const api = useApi()
const route = useRoute()

const loading = ref(false)
const items = ref([])

const columns = [
  { key: 'startsAt', label: '일시' },
  { key: 'status', label: '상태' },
  { key: 'occupancy', label: '판매율(%)' },
  { key: 'sold', label: 'SOLD' },
  { key: 'hold', label: 'HOLD' },
  { key: 'total', label: '총 좌석' },
]

async function load() {
  loading.value = true
  try {
    const concertId = route.params.concertId
    const res = await api.get(ENDPOINTS.organizerConcertSchedules(concertId))
    items.value = res.items || []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">회차 목록</div>
          <div class="mt-1 text-sm text-slate-500">/organizer/concerts/:concertId/schedules · 판매율 포함(mock)</div>
        </div>
        <UiBadge tone="soft">ORGANIZER</UiBadge>
      </div>
    </UiCard>

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <UiTable v-else :columns="columns" :rows="items">
      <template #cell:startsAt="{ row }">
        {{ new Date(row.startsAt).toLocaleString() }}
      </template>
      <template #cell:status="{ row }">
        <UiBadge :tone="row.status === 'OPEN' ? 'solid' : 'soft'" :color="row.status === 'OPEN' ? 'red' : 'slate'">
          {{ row.status }}
        </UiBadge>
      </template>
    </UiTable>
  </div>
</template>


