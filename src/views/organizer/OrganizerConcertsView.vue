<script setup>
import { computed, onMounted, ref } from 'vue'
import UiTabs from '../../components/common/UiTabs.vue'
import UiTable from '../../components/common/UiTable.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

const api = useApi()

const tab = ref('published')
const tabs = [
  { key: 'draft', label: '초안' },
  { key: 'published', label: '게시' },
  { key: 'ended', label: '종료' },
]

const columns = [
  { key: 'title', label: '공연' },
  { key: 'status', label: '상태' },
  { key: 'scheduleCount', label: '회차 수' },
  { key: 'orderCount', label: '주문 수' },
  { key: 'revenue', label: '매출' },
]

const loading = ref(false)
const items = ref([])

async function load() {
  loading.value = true
  try {
    const res = await api.get(ENDPOINTS.organizerConcerts())
    items.value = res.items || []
  } finally {
    loading.value = false
  }
}

onMounted(load)

const filtered = computed(() =>
  items.value.filter((c) => {
    if (tab.value === 'draft') return c.status === 'DRAFT'
    if (tab.value === 'ended') return c.status === 'ENDED'
    return c.status === 'PUBLISHED'
  }),
)
</script>

<template>
  <div class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">내 공연 목록</div>
        <div class="mt-1 text-sm text-slate-500">초안/게시/종료 · 회차/주문/매출 요약(mock)</div>
      </div>
      <UiButton class="h-11 px-5" @click="$router.push('/organizer/concerts/new')">공연 생성</UiButton>
    </div>

    <UiTabs v-model="tab" :tabs="tabs" />

    <UiTable :columns="columns" :rows="filtered">
      <template #cell:title="{ row }">
        <button class="font-semibold text-slate-900 hover:underline" type="button" @click="$router.push(`/organizer/concerts/${row.id}`)">
          {{ row.title }}
        </button>
      </template>
      <template #cell:status="{ row }">
        <UiBadge :tone="row.status === 'PUBLISHED' ? 'solid' : 'soft'" :color="row.status === 'PUBLISHED' ? 'red' : 'slate'">
          {{ row.status }}
        </UiBadge>
      </template>
      <template #cell:revenue="{ row }">
        ₩{{ Number(row.revenue || 0).toLocaleString() }}
      </template>
    </UiTable>
  </div>
</template>

