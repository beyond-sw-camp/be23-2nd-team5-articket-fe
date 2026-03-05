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
                : order.status === '취소완료' || order.status === '관람완료'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-amber-100 text-amber-800'"
            >
              {{ order.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

const STATUS_MAP = {
  PAID: '예매완료',
  PENDING: '결제대기',
  CANCELLED: '취소완료',
  CANCELED: '취소완료',
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
  '전체': 0,
  '1개월': 1,
  '3개월': 3,
  '6개월': 6,
}

export default {
  name: 'MyOrdersView',
  data() {
    return {
      filters: ['전체', '1개월', '3개월', '6개월'],
      activeFilter: '1개월',
      orders: [],
      loading: false,
      api: null,
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
    async loadOrders() {
      this.loading = true
      try {
        const period = PERIOD_MAP[this.activeFilter]
        const result = await this.api.get(ENDPOINTS.myOrders(period))
        const list = result.content || []
        this.orders = list.map((order) => ({
          paymentId: order.paymentId,
          concertId: order.concertId ?? order.concert_id ?? null,
          bookingDate: order.createdAt,
          bookingNumber: order.paymentId ? 'T' + order.paymentId.slice(-8) : '-',
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
  },
}
</script>
