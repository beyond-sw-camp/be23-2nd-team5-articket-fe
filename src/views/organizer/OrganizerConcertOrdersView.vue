<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">주문 목록(개인정보 마스킹)</div>
          <div class="mt-1 text-sm text-slate-500">/organizer/concerts/:concertId/orders · 좌석/금액만 노출</div>
        </div>
        <UiBadge tone="soft">ORGANIZER</UiBadge>
      </div>
    </UiCard>

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <UiTable v-else :columns="columns" :rows="items">
      <template #cell:id="{ row }">
        <button
          class="font-semibold text-slate-900 hover:underline"
          type="button"
          @click="$router.push(`/organizer/orders/${row.id}`)"
        >
          {{ row.id }}
        </button>
      </template>
      <template #cell:status="{ row }">
        <UiBadge
          :tone="row.status === 'SUCCESS' ? 'solid' : 'soft'"
          :color="row.status === 'SUCCESS' ? 'green' : 'slate'"
        >
          {{ row.status }}
        </UiBadge>
      </template>
      <template #cell:createdAt="{ row }">
        {{ new Date(row.createdAt).toLocaleString() }}
      </template>
      <template #cell:totalAmount="{ row }">
        ₩{{ Number(row.totalAmount || 0).toLocaleString() }}
      </template>
      <template #cell:seats="{ row }">
        {{ (row.seats || []).join(', ') }}
      </template>
    </UiTable>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiTable from '../../components/common/UiTable.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'OrganizerConcertOrdersView',
  components: {
    UiCard,
    UiTable,
    UiBadge
  },
  data() {
    return {
      loading: false,
      items: [],
      api: null,
      columns: [
        { key: 'id', label: '주문ID' },
        { key: 'status', label: '상태' },
        { key: 'createdAt', label: '시각' },
        { key: 'totalAmount', label: '금액' },
        { key: 'seats', label: '좌석' }
      ]
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
        const concertId = this.$route.params.concertId
        const res = await this.api.get(ENDPOINTS.organizerConcertOrders(concertId))
        this.items = (res.items || []).map((o) => ({
          ...o
        }))
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
