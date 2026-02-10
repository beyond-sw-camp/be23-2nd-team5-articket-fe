<script setup>
import UiCard from '../../components/common/UiCard.vue'
import UiTable from '../../components/common/UiTable.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import { MOCK_VENUES } from '../../mocks/venues'

const columns = [
  { key: 'name', label: '공연장' },
  { key: 'address', label: '주소' },
  { key: 'seatMaps', label: '좌석맵' },
]

const rows = MOCK_VENUES.map((v) => ({
  ...v,
  seatMaps: (v.seatMapIds || []).length,
}))
</script>

<template>
  <div class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">공연장 생성/목록</div>
        <div class="mt-1 text-sm text-slate-500">POST /admin/venues (stub) · 목록은 mock 데이터</div>
      </div>
      <UiBadge tone="soft">ADMIN</UiBadge>
    </div>

    <UiCard>
      <div class="flex items-center justify-between gap-3">
        <div class="text-sm text-slate-600">새 공연장 생성 UI는 추후 연동용으로 stub 처리합니다.</div>
        <UiButton class="h-11 px-5">공연장 생성</UiButton>
      </div>
    </UiCard>

    <UiTable :columns="columns" :rows="rows">
      <template #cell:name="{ row }">
        <button class="font-semibold text-slate-900 hover:underline" type="button" @click="$router.push(`/admin/venues/${row.id}`)">
          {{ row.name }}
        </button>
      </template>
      <template #cell:seatMaps="{ row }">
        <button class="font-semibold text-slate-700 hover:underline" type="button" @click="$router.push(`/admin/venues/${row.id}/seat-maps`)">
          {{ row.seatMaps }}개
        </button>
      </template>
    </UiTable>
  </div>
</template>

