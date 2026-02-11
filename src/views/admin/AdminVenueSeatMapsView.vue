<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">좌석맵 목록/버전 생성</div>
          <div class="mt-1 text-sm text-slate-500">{{ venue ? venue.name : '' }}</div>
        </div>
        <UiBadge tone="soft">ADMIN</UiBadge>
      </div>
      <div class="mt-4 flex items-center justify-between">
        <UiButton variant="ghost" class="h-11 px-4" @click="$router.push(`/admin/venues/${$route.params.venueId}`)">공연장</UiButton>
        <UiButton class="h-11 px-5">버전 생성</UiButton>
      </div>
    </UiCard>

    <UiTable :columns="columns" :rows="rows">
      <template #cell:name="{ row }">
        <button class="font-semibold text-slate-900 hover:underline" type="button" @click="$router.push(`/admin/seat-maps/${row.id}`)">
          {{ row.name }}
        </button>
      </template>
      <template #cell:status="{ row }">
        <UiBadge :tone="row.status==='PUBLISHED'?'solid':'soft'" :color="row.status==='PUBLISHED'?'red':'slate'">
          {{ row.status }}
        </UiBadge>
      </template>
    </UiTable>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiTable from '../../components/common/UiTable.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import { MOCK_SEAT_MAPS, MOCK_VENUES } from '../../mocks/venues'

export default {
  name: 'AdminVenueSeatMapsView',
  components: {
    UiCard,
    UiTable,
    UiButton,
    UiBadge
  },
  data() {
    return {
      columns: [
        { key: 'name', label: '좌석맵' },
        { key: 'version', label: '버전' },
        { key: 'status', label: '상태' }
      ]
    }
  },
  computed: {
    venue() {
      return MOCK_VENUES.find((v) => v.id === this.$route.params.venueId)
    },
    rows() {
      return MOCK_SEAT_MAPS.filter((sm) => sm.venueId === this.$route.params.venueId)
    }
  }
}
</script>
