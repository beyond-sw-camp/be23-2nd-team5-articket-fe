<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중...</div>
    </UiCard>

    <UiCard v-else-if="item">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">주문 상세</div>
          <div class="mt-1 text-sm text-slate-500">{{ item.paymentId || $route.params.orderId }}</div>
        </div>

        <UiBadge
          :tone="item.status === 'PAID' ? 'solid' : 'soft'"
          :color="item.status === 'PAID' ? 'green' : 'slate'"
        >
          {{ item.status }}
        </UiBadge>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">예매일</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">
            {{ formatDate(item.createdAt) }}
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">결제 금액</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">
            {{ formatWon(item.amount) }}
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">공연명</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">
            {{ item.concertName || '-' }}
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">공연일시</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">
            {{ item.scheduleDate || '-' }}
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:col-span-2">
          <div class="text-xs font-semibold text-slate-500">좌석</div>
          <div class="mt-2 flex flex-wrap gap-2">
            <UiBadge
              v-for="seat in item.seatDetails || []"
              :key="seat.id"
              tone="outline"
            >
              {{ seat.seatDefName }}
            </UiBadge>
          </div>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <UiButton variant="ghost" class="h-11 px-4" @click="$router.push('/me/orders')">
          목록
        </UiButton>

        <UiButton
          v-if="canCancel"
          variant="ghost"
          class="h-11 px-4 text-red-600"
          @click="$router.push(`/orders/${$route.params.orderId}/cancel`)"
        >
          예매 취소
        </UiButton>
      </div>
    </UiCard>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'MyOrderDetailView',
  components: {
    UiCard,
    UiBadge,
    UiButton
  },
  data() {
    return {
      loading: false,
      item: null,
      api: null
    }
  },
  computed: {
    canCancel() {
      return !!this.item?.paymentId &&
       (this.item?.seatDetails || []).some((seat) => seat.status === 'SOLD')
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  methods: {
    formatWon(value) {
      const amount = Number(value || 0)
      return `${amount.toLocaleString()}원`
    },

    formatDate(value) {
      if (!value) return '-'
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return value
      return d.toLocaleString()
    },

    async load() {
      const orderId = this.$route.params.orderId
      if (orderId == null || orderId === '') {
        this.loading = false
        return
      }

      this.loading = true
      try {
        this.item = await this.api.get(ENDPOINTS.myOrder(orderId))
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
