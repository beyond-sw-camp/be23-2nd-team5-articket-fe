<script setup>
import { onMounted, ref } from 'vue'
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiTable from '../../components/common/UiTable.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

const api = useApi()
const loading = ref(false)
const items = ref([])

const columns = [
  { key: 'id', label: '주문ID' },
  { key: 'status', label: '상태' },
  { key: 'createdAt', label: '생성일' },
  { key: 'totalAmount', label: '금액' },
]

async function load() {
  loading.value = true
  try {
    const res = await api.get(ENDPOINTS.myOrders())
    items.value = res.items || []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">내 주문 목록</div>
        <div class="mt-1 text-sm text-slate-500">GET /users/me/orders</div>
      </div>
      <UiButton variant="ghost" class="h-11 px-4" @click="$router.push('/me')">내 정보</UiButton>
    </div>

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <UiTable v-else :columns="columns" :rows="items">
      <template #cell:id="{ row }">
        <button class="font-semibold text-slate-900 hover:underline" type="button" @click="$router.push(`/me/orders/${row.id}`)">
          {{ row.id }}
        </button>
      </template>
      <template #cell:status="{ row }">
        <UiBadge :tone="row.status === 'SUCCESS' ? 'solid' : 'soft'" :color="row.status === 'SUCCESS' ? 'green' : 'slate'">
          {{ row.status }}
        </UiBadge>
      </template>
      <template #cell:createdAt="{ row }">
        {{ new Date(row.createdAt).toLocaleString() }}
      </template>
      <template #cell:totalAmount="{ row }">
        ₩{{ Number(row.totalAmount).toLocaleString() }}
      </template>
    </UiTable>
  </div>
</template>

