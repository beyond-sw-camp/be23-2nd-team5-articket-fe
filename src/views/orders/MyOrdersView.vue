<template>
  <div class="mx-auto space-y-6 pb-12">
    <!-- 헤더 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">예매내역</h1>
        <p class="mt-1 text-sm text-slate-500">마이페이지 · 예매한 공연 내역입니다.</p>
      </div>
      <RouterLink
        to="/me"
        class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        마이페이지
      </RouterLink>
    </div>

    <!-- 기간 필터 -->
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm font-medium text-slate-600">조회 기간</span>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="filter in filters"
          :key="filter"
          type="button"
          class="rounded-full px-4 py-2 text-sm font-semibold transition"
          :class="activeFilter === filter
            ? 'bg-slate-900 text-white'
            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
          @click="activeFilter = filter"
        >
          {{ filter }}
        </button>
      </div>
      <p class="text-sm text-slate-500">최근 {{ activeFilter }} 예매내역입니다.</p>
    </div>

    <!-- 로딩 -->
    <div
      v-if="loading"
      class="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white py-12"
    >
      <div class="flex flex-col items-center gap-3 text-slate-500">
        <svg
          class="h-8 w-8 animate-spin text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span class="text-sm">불러오는 중…</span>
      </div>
    </div>

    <!-- 빈 목록 -->
    <div
      v-else-if="orders.length === 0"
      class="rounded-2xl border border-slate-200 bg-white py-16 text-center"
    >
      <p class="text-sm text-slate-500">예매 내역이 없습니다.</p>
      <RouterLink
        to="/"
        class="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        공연 둘러보기
      </RouterLink>
    </div>

    <!-- 예매 목록 카드 -->
    <div v-else class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.bookingNumber"
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 sm:p-5"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <!-- 포스터 -->
          <div class="h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-20">
            <img
              :src="order.posterUrl"
              :alt="order.title"
              class="h-full w-full object-cover"
            />
          </div>

          <!-- 정보 -->
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-slate-500">
              {{ order.bookingDate?.slice(0, 10) }} · {{ order.bookingNumber }}
            </p>
            <RouterLink
              :to="order.concertId ? `/concerts/${order.concertId}` : '#'"
              class="mt-1 block text-base font-bold text-slate-900 hover:text-slate-700 hover:underline"
            >
              {{ order.title }}
            </RouterLink>
            <p class="mt-1 text-sm text-slate-600">관람일시: {{ order.viewDate }}</p>
            <p class="text-sm text-slate-600">장소: {{ order.location }}</p>
          </div>

          <!-- 관람인원 / 상태 -->
          <div class="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <span class="text-sm font-semibold text-slate-700">{{ order.ticketCount }}매</span>
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold"
              :class="order.status === '예매완료'
                ? 'bg-emerald-100 text-emerald-800'
                : order.status === '부분환불'
                  ? 'bg-amber-100 text-amber-800'
                  : order.status === '취소완료'
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-slate-100 text-slate-600'"
            >
              {{ order.status }}
            </span>

            <div class="mt-2 flex flex-wrap justify-end gap-2">
              <button
                v-if="order.orderId"
                type="button"
                class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                @click="openDetail(order)"
              >
                상세보기
              </button>

              <RouterLink
                v-if="canCancel(order)"
                :to="`/orders/${order.orderId}/cancel`"
                class="inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                취소하기
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 주문 상세 모달 -->
    <UiModal
      :open="detailOpen"
      max-width-class="max-w-xl"
      title="주문 상세"
      @close="detailOpen = false"
    >
      <div v-if="detailLoading" class="py-10 text-center text-sm text-slate-500">
        불러오는 중...
      </div>
      <div v-else-if="detailItem" class="space-y-6">
        <!-- 상단 요약 (이미지와 동일한 구조로 구성) -->
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-medium text-slate-500">예매일 (date)</label>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
              {{ formatDate(detailItem.createdAt) }}
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-medium text-slate-500">결제 금액 (amount)</label>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
              {{ formatWon(detailItem.amount) }}
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-medium text-slate-500">공연명 (name)</label>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
              {{ detailItem.concertName || '-' }}
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-medium text-slate-500">공연일시 (date)</label>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
              {{ detailItem.scheduleDate || '-' }}
            </div>
          </div>
        </div>

        <!-- 모바일 티켓 영역 (간단화 버전: 첫 티켓만 카드 형식으로 표시) -->
        <div v-if="detailItem.seatDetails && detailItem.seatDetails.length" class="space-y-2">
          <p class="text-xs font-semibold text-slate-500">모바일 티켓 (Mobile Ticket)</p>
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 text-white">
            <div class="flex items-center justify-between px-4 py-3">
              <div>
                <p class="text-[11px] font-semibold tracking-[0.12em] text-slate-300">SEAT INFO</p>
                <p class="mt-1 text-sm font-bold">
                  {{ detailItem.seatDetails[0].seatDefName || '좌석 정보' }}
                </p>
              </div>
              <span class="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white">
                사용 가능
              </span>
            </div>
            <div class="bg-slate-900 px-4 pb-4">
              <div class="rounded-xl bg-white px-6 py-8 text-center">
                <div class="mx-auto mb-4 h-24 w-24 rounded-lg bg-slate-900/90 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="detailItem.seatDetails[0].qrCodeUrl"
                    :src="detailItem.seatDetails[0].qrCodeUrl"
                    alt="모바일 티켓 QR"
                    class="h-full w-full object-contain"
                  />
                </div>
                <p class="text-[11px] font-mono text-slate-500">
                  {{ detailItem.seatDetails[0].ticketNumber || 'TICKET' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            @click="detailOpen = false"
          >
            닫기
          </button>
          <RouterLink
            v-if="detailItem && canCancel(detailItem)"
            :to="`/orders/${detailItem.id}/cancel`"
            class="inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            예매 취소
          </RouterLink>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script>
import UiModal from '../../components/common/UiModal.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

const STATUS_MAP = {
  PAID: '예매완료',
  PENDING: '결제대기',
  CANCELED: '취소완료',
  REFUNDED: '부분환불',
}

function formatDateTime(isoStr) {
  if (!isoStr) return '-'
  const dt = new Date(isoStr)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const d = String(dt.getDate()).padStart(2, '0')
  const h = String(dt.getHours()).padStart(2, '0')
  const min = String(dt.getMinutes()).padStart(2, '0')
  return `${y}.${m}.${d} ${h}:${min}`
}

const PERIOD_MAP = {
  전체: 0,
  '1개월': 1,
  '3개월': 3,
  '6개월': 6,
}

export default {
  name: 'MyOrdersView',
  components: { UiModal },
  data() {
    return {
      filters: ['전체', '1개월', '3개월', '6개월'],
      activeFilter: '1개월',
      orders: [],
      loading: false,
      api: null,
      detailOpen: false,
      detailLoading: false,
      detailItem: null,
    }
  },
  watch: {
    activeFilter() {
      this.loadOrders()
    },
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.loadOrders()
  },
  methods: {
    canCancel(order) {
      const hasCancelableSeat = (order.seatDetails || []).some((seat) => seat.status === 'SOLD')
      return !!order.orderId && !!order.paymentId && hasCancelableSeat
    },
    async loadOrders() {
      this.loading = true
      try {
        const period = PERIOD_MAP[this.activeFilter]
        const result = await this.api.get(ENDPOINTS.myOrders(period))
        const list = result.content || []
        console.log(list)
        this.orders = list.map((order) => ({
          orderId: order.id ?? order.orderId ?? null,
          paymentId: order.paymentId,
          concertId: order.concertId ?? order.concert_id ?? null,
          bookingDate: order.createdAt,
          bookingNumber: order.paymentId ? `T${order.paymentId.slice(-8)}` : '-',
          posterUrl: order.concertUrl || order.posterUrl || '',
          title: order.concertName || '-',
          viewDate: formatDateTime(order.scheduleDate),
          location: order.venueName || '-',
          ticketCount: order.seatDetails ? order.seatDetails.length : 0,
          seatDetails: (order.seatDetails || []).map((seat) => ({ ...seat, cancelling: false })),
          amount: order.totalAmount || order.amount || 0,
          status: STATUS_MAP[order.status] || order.status,
          cancelling: false,
        }))
      } catch (e) {
        this.orders = []
      } finally {
        this.loading = false
      }
    },
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
    async openDetail(orderSummary) {
      if (!orderSummary?.orderId) return
      this.detailOpen = true
      this.detailLoading = true
      this.detailItem = null
      try {
        const full = await this.api.get(ENDPOINTS.myOrder(orderSummary.orderId))
        this.detailItem = full
      } catch (_) {
        this.detailItem = null
      } finally {
        this.detailLoading = false
      }
    },
  },
}
</script>
