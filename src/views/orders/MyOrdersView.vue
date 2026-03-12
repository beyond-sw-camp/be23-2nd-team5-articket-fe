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
          :key="filter.label"
          type="button"
          class="rounded-full px-4 py-2 text-sm font-semibold transition"
          :class="activeFilter === filter.label
            ? 'bg-slate-900 text-white'
            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
          @click="changeFilter(filter.label)"
        >
          {{ filter.label }}
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
    <template v-else>
      <div class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.orderId"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 sm:p-5"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <!-- 포스터 -->
            <div class="h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-20">
              <img
                v-if="order.posterUrl"
                :src="order.posterUrl"
                :alt="order.title"
                class="h-full w-full object-cover"
              />
              <div v-else class="flex h-full items-center justify-center text-xs text-slate-400">
                이미지 없음
              </div>
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

            <!-- 관람인원 / 금액 / 상태 -->
            <div class="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              <span class="text-sm font-semibold text-slate-700">{{ order.ticketCount }}매</span>
              <span class="text-sm font-bold text-slate-900">{{ formatWon(order.amount) }}</span>
              <span
                class="rounded-full px-3 py-1 text-xs font-semibold"
                :class="statusBadgeClass(order.status)"
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

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-2">
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          :disabled="currentPage === 0"
          @click="goToPage(0)"
        >
          «
        </button>
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          :disabled="currentPage === 0"
          @click="goToPage(currentPage - 1)"
        >
          ‹
        </button>

        <div class="flex gap-1">
          <button
            v-for="p in pageNumbers"
            :key="p"
            type="button"
            class="flex h-10 min-w-[2.5rem] items-center justify-center rounded-xl border px-3 text-sm font-semibold transition"
            :class="p === currentPage
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
            @click="goToPage(p)"
          >
            {{ p + 1 }}
          </button>
        </div>

        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          :disabled="currentPage >= totalPages - 1"
          @click="goToPage(currentPage + 1)"
        >
          ›
        </button>
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          :disabled="currentPage >= totalPages - 1"
          @click="goToPage(totalPages - 1)"
        >
          »
        </button>
      </div>
      <p v-if="totalElements > 0" class="text-center text-xs text-slate-400">
        전체 {{ totalElements }}건 · {{ currentPage + 1 }} / {{ totalPages }} 페이지
      </p>
    </template>

    <!-- 주문 상세 모달 -->
    <UiModal
      :open="detailOpen"
      max-width-class="max-w-2xl"
      title="예매 상세"
      @close="detailOpen = false"
    >
      <div v-if="detailLoading" class="py-10 text-center text-sm text-slate-500">
        불러오는 중...
      </div>
      <div v-else-if="detailItem" class="space-y-5">

        <!-- 공연 정보 헤더 (포스터 + 공연명 + 상태) -->
        <div class="flex gap-4">
          <div v-if="detailItem.concertUrl" class="h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            <img :src="detailItem.concertUrl" :alt="detailItem.concertName" class="h-full w-full object-cover" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p class="text-xs text-slate-400">공연명</p>
                <p class="mt-0.5 text-base font-bold text-slate-900">{{ detailItem.concertName || '-' }}</p>
              </div>
              <span
                class="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                :class="statusBadgeClass(STATUS_MAP[detailItem.status] || detailItem.status)"
              >
                {{ STATUS_MAP[detailItem.status] || detailItem.status }}
              </span>
            </div>
            <p class="mt-1 text-sm text-slate-600">
              <span class="font-medium text-slate-400">장소</span>
              {{ detailItem.venueName || '-' }}
            </p>
            <p class="mt-0.5 text-sm text-slate-600">
              <span class="font-medium text-slate-400">공연일시</span>
              {{ detailItem.scheduleDate || '-' }}
            </p>
          </div>
        </div>

        <!-- 예매/결제 정보 그리드 -->
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-semibold text-slate-400">예매번호</label>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 break-all">
              {{ detailItem.paymentId || '-' }}
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-semibold text-slate-400">예매일</label>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
              {{ formatDate(detailItem.createdAt) }}
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-semibold text-slate-400">결제 금액</label>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900">
              {{ formatWon(detailItem.amount) }}
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-semibold text-slate-400">구매자명</label>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
              {{ detailItem.memberName || '-' }}
            </div>
          </div>

          <!-- 취소/환불 처리 시각 (해당 상태일 때만) -->
          <div
            v-if="detailItem.processedAt && ['CANCELED', 'REFUNDED'].includes(detailItem.status)"
            class="flex flex-col gap-1 sm:col-span-2"
          >
            <label class="text-[11px] font-semibold text-amber-500">
              {{ detailItem.status === 'CANCELED' ? '취소 처리 시각' : '환불 처리 시각' }}
            </label>
            <div class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {{ formatDate(detailItem.processedAt) }}
            </div>
          </div>
        </div>

        <!-- 좌석 목록 -->
        <div v-if="detailItem.seatDetails && detailItem.seatDetails.length">
          <p class="mb-2 text-[11px] font-semibold text-slate-400">좌석 정보 ({{ detailItem.seatDetails.length }}매)</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="seat in detailItem.seatDetails"
              :key="seat.id ?? seat.seatDefName"
              class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
              :class="seat.status === 'SOLD'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : seat.status === 'CANCELED'
                  ? 'border-slate-200 bg-slate-100 text-slate-400 line-through'
                  : 'border-slate-200 bg-slate-50 text-slate-700'"
            >
              <span
                class="inline-block h-1.5 w-1.5 rounded-full"
                :class="seat.status === 'SOLD' ? 'bg-emerald-500' : seat.status === 'CANCELED' ? 'bg-slate-300' : 'bg-slate-400'"
              ></span>
              {{ seat.seatDefName || seat.seatName || '좌석 정보' }}
              <span v-if="seat.status === 'CANCELED'" class="font-normal text-slate-400">(취소)</span>
            </span>
          </div>
        </div>

        <!-- 모바일 티켓 슬라이더 (PAID + SOLD 좌석만) -->
        <div v-if="detailTickets.length > 0" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between gap-2">
            <div>
              <p class="text-sm font-semibold text-slate-900">모바일 티켓</p>
              <p class="mt-0.5 text-xs text-slate-500">좌우 버튼으로 각 좌석의 QR 코드를 확인하세요.</p>
            </div>
            <span class="text-xs font-medium text-slate-500">
              {{ detailTicketIndex + 1 }} / {{ detailTickets.length }}
            </span>
          </div>

          <div class="mt-3 flex items-center gap-3">
            <button
              type="button"
              class="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 sm:flex"
              :disabled="detailTicketIndex === 0"
              @click="detailTicketIndex--"
            >
              ‹
            </button>

            <div class="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div v-if="detailCurrentTicket" class="flex flex-col gap-3">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="text-xs font-semibold text-slate-500">좌석</div>
                    <div class="mt-0.5 text-sm font-bold text-slate-900">
                      {{ detailCurrentTicket.seatDefName || detailCurrentTicket.seatName }}
                    </div>
                  </div>
                  <span class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">사용 가능</span>
                </div>

                <div>
                  <div class="text-xs font-semibold text-slate-400">티켓 번호</div>
                  <div class="mt-0.5 font-mono text-[11px] text-slate-800 break-all">
                    {{ detailCurrentTicket.ticketNumber || '티켓 생성 중입니다.' }}
                  </div>
                </div>

                <div v-if="detailCurrentTicket.qrCodeUrl" class="mt-1 rounded-xl bg-white p-3 text-center">
                  <img
                    :src="detailCurrentTicket.qrCodeUrl"
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
            </div>

            <button
              type="button"
              class="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 sm:flex"
              :disabled="detailTicketIndex >= detailTickets.length - 1"
              @click="detailTicketIndex++"
            >
              ›
            </button>
          </div>

          <!-- 모바일: 도트 네비게이션 -->
          <div v-if="detailTickets.length > 1" class="mt-3 flex justify-center gap-1 sm:hidden">
            <button
              v-for="(_, idx) in detailTickets"
              :key="idx"
              type="button"
              class="h-1.5 rounded-full transition-all"
              :class="idx === detailTicketIndex ? 'w-4 bg-slate-700' : 'w-2 bg-slate-300'"
              @click="detailTicketIndex = idx"
            />
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

const PAGE_SIZE = 10

export default {
  name: 'MyOrdersView',
  components: { UiModal },
  data() {
    return {
      STATUS_MAP,
      filters: [
        { label: '전체', period: 0 },
        { label: '1개월', period: 1 },
        { label: '3개월', period: 3 },
        { label: '6개월', period: 6 },
      ],
      activeFilter: '1개월',
      orders: [],
      loading: false,
      api: null,
      // 페이징
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      // 상세 모달
      detailOpen: false,
      detailLoading: false,
      detailItem: null,
      detailTicketIndex: 0,
    }
  },
  computed: {
    pageNumbers() {
      const start = Math.max(0, this.currentPage - 2)
      const end = Math.min(this.totalPages - 1, this.currentPage + 2)
      const pages = []
      for (let i = start; i <= end; i++) pages.push(i)
      return pages
    },
    detailTickets() {
      if (!this.detailItem || this.detailItem.status !== 'PAID') return []
      return (this.detailItem.seatDetails || []).filter((s) => s.status === 'SOLD')
    },
    detailCurrentTicket() {
      if (!this.detailTickets.length) return null
      return this.detailTickets[Math.min(this.detailTicketIndex, this.detailTickets.length - 1)]
    },
  },
  watch: {
    activeFilter() {
      this.currentPage = 0
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
    changeFilter(label) {
      this.activeFilter = label
    },
    goToPage(page) {
      if (page < 0 || page >= this.totalPages) return
      this.currentPage = page
      this.loadOrders()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    canCancel(order) {
      const hasCancelableSeat = (order.seatDetails || []).some((seat) => seat.status === 'SOLD')
      return !!(order.orderId ?? order.id) && !!order.paymentId && hasCancelableSeat
    },
    statusBadgeClass(status) {
      if (status === '예매완료') return 'bg-emerald-100 text-emerald-800'
      if (status === '부분환불') return 'bg-amber-100 text-amber-800'
      if (status === '결제대기') return 'bg-blue-100 text-blue-800'
      return 'bg-slate-100 text-slate-600'
    },
    async loadOrders() {
      this.loading = true
      try {
        const filter = this.filters.find((f) => f.label === this.activeFilter)
        const period = filter?.period ?? 0
        const result = await this.api.get(
          ENDPOINTS.myOrders({ period: period || undefined, page: this.currentPage, size: PAGE_SIZE })
        )
        const list = result.content ?? []
        this.totalPages = result.totalPages ?? 1
        this.totalElements = result.totalElements ?? list.length
        this.orders = list.map((order) => ({
          orderId: order.id ?? order.orderId ?? null,
          paymentId: order.paymentId,
          concertId: order.concertId ?? order.concert_id ?? null,
          bookingDate: order.createdAt,
          bookingNumber: order.paymentId ? `T${String(order.paymentId).slice(-8)}` : '-',
          posterUrl: order.concertUrl || order.posterUrl || '',
          title: order.concertName || '-',
          viewDate: formatDateTime(order.scheduleDate),
          location: order.venueName || '-',
          ticketCount: order.seatDetails ? order.seatDetails.length : 0,
          seatDetails: (order.seatDetails || []).map((seat) => ({ ...seat })),
          amount: order.totalAmount || order.amount || 0,
          status: STATUS_MAP[order.status] || order.status,
        }))
      } catch {
        this.orders = []
        this.totalPages = 0
        this.totalElements = 0
      } finally {
        this.loading = false
      }
    },
    formatWon(value) {
      return `${Number(value || 0).toLocaleString()}원`
    },
    formatDate(value) {
      if (!value) return '-'
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return value
      return d.toLocaleString('ko-KR')
    },
    async openDetail(orderSummary) {
      if (!(orderSummary?.orderId ?? orderSummary?.id)) return
      this.detailOpen = true
      this.detailLoading = true
      this.detailItem = null
      this.detailTicketIndex = 0
      try {
        const id = orderSummary.orderId ?? orderSummary.id
        const full = await this.api.get(ENDPOINTS.myOrder(id))
        this.detailItem = full
      } catch {
        this.detailItem = null
      } finally {
        this.detailLoading = false
      }
    },
  },
}
</script>