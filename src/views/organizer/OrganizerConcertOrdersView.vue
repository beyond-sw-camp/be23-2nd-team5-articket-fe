<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">주문 목록</div>
          <div class="mt-1 text-sm text-slate-500">주문 ID를 클릭하면 상세 내역을 확인할 수 있습니다.</div>
        </div>
        <div class="flex items-center gap-2">
          <UiButton variant="ghost" class="h-10 px-4" @click="goBack">뒤로가기</UiButton>
          <UiBadge tone="soft">ORGANIZER</UiBadge>
        </div>
      </div>
    </UiCard>

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중...</div>
    </UiCard>

    <UiCard v-else-if="errorMessage">
      <div class="text-sm text-red-600">{{ errorMessage }}</div>
    </UiCard>

    <UiCard v-else-if="!items.length">
      <div class="text-sm text-slate-500">주문 내역이 없습니다.</div>
    </UiCard>

    <UiTable v-else :columns="columns" :rows="items">
      <template #cell:id="{ row }">
        <button
          class="font-semibold text-red-600 hover:underline"
          type="button"
          @click="openDetail(row.id)"
        >
          {{ row.id }}
        </button>
      </template>

      <template #cell:status="{ row }">
        <UiBadge :tone="statusTone(row.status)" :color="statusColor(row.status)">
          {{ row.status }}
        </UiBadge>
      </template>

      <template #cell:createdAt="{ row }">
        {{ formatDateTime(row.createdAt) }}
      </template>

      <template #cell:amount="{ row }">
        {{ formatWon(row.amount) }}
      </template>

      <template #cell:seats="{ row }">
        <span class="text-slate-600">{{ formatSeats(row.seatDetails) }}</span>
      </template>

      <template #cell:detail="{ row }">
        <UiButton variant="ghost" class="h-8 px-2 text-sm" @click="openDetail(row.id)">
          상세
        </UiButton>
      </template>
    </UiTable>

    <UiModal :open="detailModalOpen" title="주문 상세" @close="closeDetail">
      <div v-if="detailLoading" class="text-sm text-slate-500">불러오는 중...</div>
      <div v-else-if="detailError" class="text-sm text-red-600">{{ detailError }}</div>
      <template v-else-if="detailItem">
        <div class="mb-4 flex items-center justify-between">
          <span class="text-xs text-slate-400">주문 #{{ detailItem.id }}</span>
          <UiBadge :tone="statusTone(detailItem.status)" :color="statusColor(detailItem.status)">
            {{ detailItem.status }}
          </UiBadge>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div class="text-xs font-semibold text-slate-500">결제 금액</div>
            <div class="mt-1 text-sm font-bold text-slate-900">
              {{ formatWon(detailItem.amount) }}
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div class="text-xs font-semibold text-slate-500">주문 시각</div>
            <div class="mt-1 text-sm font-semibold text-slate-900">
              {{ formatDateTime(detailItem.createdAt) }}
            </div>
          </div>
          <div class="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div class="text-xs font-semibold text-slate-500">좌석</div>
            <div class="mt-1 text-sm font-semibold text-slate-900">
              {{ formatSeats(detailItem.seatDetails) }}
            </div>
          </div>
        </div>

        <div v-if="detailItem.scheduleDate" class="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs font-semibold text-slate-500">회차</div>
          <div class="mt-1 text-sm text-slate-700">
            {{ detailItem.scheduleDate }}
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end">
          <UiButton variant="ghost" @click="closeDetail">닫기</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiTable from '../../components/common/UiTable.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiModal from '../../components/common/UiModal.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'OrganizerConcertOrdersView',
  components: { UiCard, UiTable, UiBadge, UiButton, UiModal },
  data() {
    return {
      loading: false,
      items: [],
      errorMessage: '',
      api: null,
      detailModalOpen: false,
      detailItem: null,
      detailLoading: false,
      detailError: '',
      columns: [
        { key: 'id', label: '주문ID' },
        { key: 'status', label: '상태' },
        { key: 'createdAt', label: '주문 시각' },
        { key: 'amount', label: '금액' },
        { key: 'seats', label: '좌석' },
        { key: 'detail', label: '' }
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
      const concertId = this.$route.params.concertId
      if (!concertId) {
        this.loading = false
        return
      }
      this.loading = true
      this.errorMessage = ''
      try {
        const res = await this.api.get(`${ENDPOINTS.organizerConcertOrders(concertId)}?page=0&size=50`)
        this.items = res.content ?? res.items ?? (Array.isArray(res) ? res : [])
      } catch (err) {
        this.errorMessage = err.message || '주문 목록을 불러오지 못했습니다.'
      } finally {
        this.loading = false
      }
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
        return
      }
      this.$router.push('/organizer/reports/details')
    },
    async openDetail(orderId) {
      this.detailItem = null
      this.detailError = ''
      this.detailLoading = true
      this.detailModalOpen = true
      try {
        this.detailItem = await this.api.get(ENDPOINTS.organizerOrder(orderId))
      } catch (err) {
        this.detailError = err.message || '주문 상세를 불러오지 못했습니다.'
      } finally {
        this.detailLoading = false
      }
    },
    closeDetail() {
      this.detailModalOpen = false
      this.detailItem = null
    },
    formatDateTime(value) {
      if (!value) return '-'
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return value
      return date.toLocaleString()
    },
    formatWon(value) {
      return `${Number(value || 0).toLocaleString()}원`
    },
    formatSeats(seatDetails) {
      const seats = (seatDetails || []).map((seat) => seat.seatDefName).filter(Boolean)
      return seats.length ? seats.join(', ') : '-'
    },
    statusTone(status) {
      if (status === 'SUCCESS' || status === 'PAID') return 'solid'
      return 'soft'
    },
    statusColor(status) {
      if (status === 'SUCCESS' || status === 'PAID') return 'green'
      if (status === 'CANCELLED' || status === 'FAILED' || status === 'REFUNDED') return 'red'
      return 'slate'
    }
  }
}
</script>
