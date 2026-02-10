<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import UiCard from '../../components/common/UiCard.vue'
import UiTable from '../../components/common/UiTable.vue'
import UiBadge from '../../components/common/UiBadge.vue'

const route = useRoute()
const key = computed(() => String(route.meta.stubKey || 'stub'))

const presets = {
  users: {
    title: '사용자',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status' },
    ],
    rows: [
      { id: 'u-1', email: 'ho***@example.com', status: 'ACTIVE' },
      { id: 'u-2', email: 'ki***@example.com', status: 'BLOCKED' },
    ],
  },
  concerts: {
    title: '공연',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'status', label: 'Status' },
    ],
    rows: [{ id: 'c-1', title: 'COLDPLAY WORLD TOUR', status: 'PUBLISHED' }],
  },
  schedules: {
    title: '회차',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'startsAt', label: 'StartsAt' },
      { key: 'status', label: 'Status' },
    ],
    rows: [{ id: 's-1', startsAt: new Date().toISOString(), status: 'OPEN' }],
  },
  orders: {
    title: '주문',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'status', label: 'Status' },
      { key: 'amount', label: 'Amount' },
    ],
    rows: [{ id: 'o-1001', status: 'SUCCESS', amount: 198000 }],
  },
  statsRevenue: {
    title: '매출 통계',
    columns: [
      { key: 'day', label: 'Day' },
      { key: 'revenue', label: 'Revenue' },
    ],
    rows: [{ day: '2026-02-11', revenue: 12345000 }],
  },
  statsRanking: {
    title: '공연 랭킹',
    columns: [
      { key: 'rank', label: 'Rank' },
      { key: 'title', label: 'Title' },
      { key: 'score', label: 'Score' },
    ],
    rows: [{ rank: 1, title: 'COLDPLAY WORLD TOUR', score: 98 }],
  },
  serverStatus: {
    title: '서버 상태',
    columns: [
      { key: 'service', label: 'Service' },
      { key: 'status', label: 'Status' },
    ],
    rows: [
      { service: 'API', status: 'OK' },
      { service: 'DB', status: 'OK' },
    ],
  },
}

const preset = computed(() => presets[key.value] || { title: key.value, columns: [], rows: [] })
</script>

<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">ADMIN Stub: {{ preset.title }}</div>
          <div class="mt-1 text-sm text-slate-500">요구사항: stub 페이지 + 테이블 UI</div>
        </div>
        <UiBadge tone="soft">ADMIN</UiBadge>
      </div>
    </UiCard>

    <UiTable :columns="preset.columns" :rows="preset.rows" />
  </div>
</template>

