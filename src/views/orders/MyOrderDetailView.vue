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

      <!-- 모바일 티켓 슬라이더 (결제 완료 + 유효 티켓만) -->
      <div
        v-if="ticketCount > 0"
        class="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div class="flex items-center justify-between gap-2">
          <div>
            <div class="text-sm font-semibold text-slate-900">모바일 티켓</div>
            <p class="mt-0.5 text-xs text-slate-500">
              좌우로 넘기며 각 좌석의 QR 코드를 확인할 수 있습니다.
            </p>
          </div>
          <span class="text-xs font-medium text-slate-500">
            {{ currentTicketIndex + 1 }} / {{ ticketCount }}
          </span>
        </div>

        <div class="mt-3 flex items-center gap-3">
          <button
            type="button"
            class="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 sm:flex"
            :disabled="currentTicketIndex === 0"
            @click="prevTicket"
          >
            ‹
          </button>

          <div class="relative flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <transition name="fade-slide" mode="out-in">
              <div
                v-if="currentTicket"
                :key="currentTicket.id"
                class="flex flex-col gap-3"
              >
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="text-xs font-semibold text-slate-500">좌석</div>
                    <div class="mt-0.5 text-sm font-semibold text-slate-900">
                      {{ currentTicket.seatDefName }}
                    </div>
                  </div>
                  <UiBadge
                    :tone="'soft'"
                    :color="'green'"
                  >
                    사용 가능
                  </UiBadge>
                </div>

                <div class="text-xs text-slate-600">
                  <div class="font-semibold text-slate-500">티켓 번호</div>
                  <div class="mt-0.5 font-mono text-[11px] text-slate-900">
                    {{ currentTicket.ticketNumber || '티켓 생성 중입니다.' }}
                  </div>
                </div>

                <div v-if="currentTicket.qrCodeUrl" class="mt-1 rounded-xl bg-white p-2 text-center">
                  <img
                    :src="currentTicket.qrCodeUrl"
                    alt="모바일 티켓 QR"
                    class="mx-auto h-32 w-32 object-contain"
                  />
                </div>

                <div
                  v-else
                  class="mt-1 rounded-xl border border-dashed border-slate-200 bg-white px-3 py-4 text-center text-xs text-slate-400"
                >
                  QR 코드 준비 중입니다. 잠시 후 다시 확인해 주세요.
                </div>
              </div>
            </transition>
          </div>

          <button
            type="button"
            class="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 sm:flex"
            :disabled="currentTicketIndex >= ticketCount - 1"
            @click="nextTicket"
          >
            ›
          </button>
        </div>

        <!-- 모바일에서는 하단 도트만 표시 -->
        <div class="mt-3 flex justify-center gap-1 sm:hidden">
          <button
            v-for="(_, idx) in tickets"
            :key="idx"
            type="button"
            class="h-1.5 rounded-full transition-all"
            :class="idx === currentTicketIndex ? 'w-4 bg-slate-700' : 'w-2 bg-slate-300'"
            @click="currentTicketIndex = idx"
          />
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
      api: null,
      currentTicketIndex: 0
    }
  },
  computed: {
    canCancel() {
      return !!this.item?.paymentId &&
       (this.item?.seatDetails || []).some((seat) => seat.status === 'SOLD')
    },
    // 주문 상태가 PAID 이고 좌석 상태가 SOLD인 티켓만 노출
    tickets() {
      if (!this.item || this.item.status !== 'PAID') return []
      return (this.item.seatDetails || []).filter((seat) => seat.status === 'SOLD')
    },
    ticketCount() {
      return this.tickets.length
    },
    currentTicket() {
      if (!this.ticketCount) return null
      return this.tickets[Math.min(this.currentTicketIndex, this.ticketCount - 1)]
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

    prevTicket() {
      if (this.currentTicketIndex > 0) this.currentTicketIndex -= 1
    },
    nextTicket() {
      if (this.currentTicketIndex < this.ticketCount - 1) this.currentTicketIndex += 1
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
