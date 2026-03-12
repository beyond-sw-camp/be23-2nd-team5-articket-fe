<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중...</div>
    </UiCard>

    <UiCard v-else-if="item">
      <!-- 헤더: 예매번호 + 상태 -->
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">주문 상세</div>
          <div class="mt-1 font-mono text-xs text-slate-400 break-all">{{ item.paymentId || $route.params.orderId }}</div>
        </div>
        <UiBadge
          :tone="item.status === 'PAID' ? 'solid' : 'soft'"
          :color="statusColor(item.status)"
        >
          {{ statusLabel(item.status) }}
        </UiBadge>
      </div>

      <!-- 기본 정보 그리드 -->
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">예매일</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ formatDate(item.createdAt) }}</div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">결제 금액</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ formatWon(item.amount) }}</div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">공연명</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ item.concertName || '-' }}</div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">공연일시</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ item.scheduleDate || '-' }}</div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">공연 장소</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ item.venueName || '-' }}</div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">구매자</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ item.memberName || '-' }}</div>
        </div>

        <!-- 취소/환불 처리 시각 (해당 상태만) -->
        <div
          v-if="item.processedAt && ['CANCELED', 'REFUNDED'].includes(item.status)"
          class="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm sm:col-span-2"
        >
          <div class="text-xs font-semibold text-amber-600">
            {{ item.status === 'CANCELED' ? '취소 처리 시각' : '환불 처리 시각' }}
          </div>
          <div class="mt-1 text-sm font-semibold text-amber-800">{{ formatDate(item.processedAt) }}</div>
        </div>

        <!-- 좌석 목록 -->
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:col-span-2">
          <div class="text-xs font-semibold text-slate-500">좌석</div>
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="seat in item.seatDetails || []"
              :key="seat.id ?? seat.seatDefName"
              class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
              :class="seat.status === 'SOLD'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-slate-100 text-slate-400 line-through'"
            >
              <span
                class="h-1.5 w-1.5 rounded-full"
                :class="seat.status === 'SOLD' ? 'bg-emerald-500' : 'bg-slate-300'"
              ></span>
              {{ seat.seatDefName }}
            </span>
          </div>
        </div>
      </div>

      <!-- ───────────────────────────────────────────
           내 좌석 위치 확인 (좌석맵 썸네일)
      ─────────────────────────────────────────────── -->
      <div v-if="item.scheduleId" class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <!-- 섹션 헤더 -->
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div>
            <p class="text-sm font-semibold text-slate-900">내 좌석 위치</p>
            <p class="mt-0.5 text-xs text-slate-400">공연장 배치도에서 내 자리를 확인하세요.</p>
          </div>
          <!-- 줌 컨트롤 -->
          <div v-if="seatMapThumbnail" class="flex items-center gap-1">
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-500 hover:bg-slate-50 transition"
              @click="smZoomOut"
            >−</button>
            <span class="min-w-[2.5rem] text-center text-[11px] font-mono text-slate-400">{{ Math.round(smScale * 100) }}%</span>
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-500 hover:bg-slate-50 transition"
              @click="smZoomIn"
            >+</button>
            <button
              type="button"
              class="ml-1 flex h-7 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-500 hover:bg-slate-50 transition"
              @click="smReset"
            >↺</button>
          </div>
        </div>

        <!-- 좌석맵 뷰어 -->
        <div
          class="relative select-none overflow-hidden bg-slate-50"
          style="height: 260px;"
          :class="smThumbnailLoading ? '' : seatMapThumbnail ? (smDragging ? 'cursor-grabbing' : 'cursor-grab') : ''"
          @mousedown.left="smStartDrag"
          @mousemove="smOnDrag"
          @mouseup="smEndDrag"
          @mouseleave="smEndDrag"
          @wheel.prevent="smOnWheel"
          @touchstart.passive="smTouchStart"
          @touchmove.prevent="smTouchMove"
          @touchend="smEndDrag"
        >
          <!-- 로딩 -->
          <div v-if="smThumbnailLoading" class="absolute inset-0 flex items-center justify-center">
            <div class="flex flex-col items-center gap-2 text-slate-400">
              <svg class="h-6 w-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span class="text-xs">배치도 불러오는 중…</span>
            </div>
          </div>

          <!-- 썸네일 이미지 (줌/드래그) -->
          <img
            v-else-if="seatMapThumbnail"
            :src="seatMapThumbnail"
            alt="공연장 좌석 배치도"
            class="absolute block h-full w-full object-contain transition-transform duration-75"
            :style="{
              transform: `translate(${smOffsetX}px, ${smOffsetY}px) scale(${smScale})`,
              transformOrigin: 'center center',
              willChange: 'transform',
            }"
            draggable="false"
            @dragstart.prevent
            @error="seatMapThumbnail = null"
          />

          <!-- 썸네일 없음 (fallback) -->
          <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-slate-400">
            <svg class="h-10 w-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 16V5m0 0L9 7"/>
            </svg>
            <div>
              <p class="text-sm font-semibold text-slate-500">배치도를 표시할 수 없습니다</p>
              <p class="mt-0.5 text-xs text-slate-400">좌석명으로 위치를 확인해 주세요.</p>
            </div>
          </div>

          <!-- 내 좌석 강조 오버레이 (썸네일이 있을 때만, 하이라이트 좌표 데이터가 있을 때) -->
          <template v-if="seatMapThumbnail && highlightedSeats.length">
            <div
              v-for="hs in highlightedSeats"
              :key="hs.key"
              class="pointer-events-none absolute flex items-center justify-center"
              :style="hs.style"
            >
              <span class="relative flex h-4 w-4">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span class="relative inline-flex h-4 w-4 rounded-full bg-red-600 ring-2 ring-white"></span>
              </span>
            </div>
          </template>
        </div>

        <!-- 내 좌석 뱃지 레전드 -->
        <div class="border-t border-slate-100 px-5 py-3.5">
          <p class="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <span class="inline-block h-2 w-2 rounded-full bg-red-500"></span>
            내가 예매한 좌석
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="seat in soldSeats"
              :key="seat.id ?? seat.seatDefName"
              class="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200"
            >
              {{ seat.seatDefName }}
            </span>
            <span v-if="!soldSeats.length" class="text-xs text-slate-400">유효한 좌석 정보가 없습니다.</span>
          </div>
        </div>
      </div>

      <!-- 모바일 티켓 슬라이더 (결제 완료 + 유효 티켓만) -->
      <div v-if="ticketCount > 0" class="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between gap-2">
          <div>
            <div class="text-sm font-semibold text-slate-900">모바일 티켓</div>
            <p class="mt-0.5 text-xs text-slate-500">좌우로 넘기며 각 좌석의 QR 코드를 확인할 수 있습니다.</p>
          </div>
          <span class="text-xs font-medium text-slate-500">{{ currentTicketIndex + 1 }} / {{ ticketCount }}</span>
        </div>

        <div class="mt-3 flex items-center gap-3">
          <button
            type="button"
            class="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 sm:flex"
            :disabled="currentTicketIndex === 0"
            @click="prevTicket"
          >‹</button>

          <div class="relative flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <transition name="fade-slide" mode="out-in">
              <div v-if="currentTicket" :key="currentTicket.id" class="flex flex-col gap-3">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="text-xs font-semibold text-slate-500">좌석</div>
                    <div class="mt-0.5 text-sm font-semibold text-slate-900">{{ currentTicket.seatDefName }}</div>
                  </div>
                  <UiBadge tone="soft" color="green">사용 가능</UiBadge>
                </div>
                <div>
                  <div class="text-xs font-semibold text-slate-500">티켓 번호</div>
                  <div class="mt-0.5 font-mono text-[11px] text-slate-900">{{ currentTicket.ticketNumber || '티켓 생성 중입니다.' }}</div>
                </div>
                <div v-if="currentTicket.qrCodeUrl" class="mt-1 rounded-xl bg-white p-2 text-center">
                  <img :src="currentTicket.qrCodeUrl" alt="모바일 티켓 QR" class="mx-auto h-32 w-32 object-contain" />
                </div>
                <div v-else class="mt-1 rounded-xl border border-dashed border-slate-200 bg-white px-3 py-4 text-center text-xs text-slate-400">
                  QR 코드 준비 중입니다. 잠시 후 다시 확인해 주세요.
                </div>
              </div>
            </transition>
          </div>

          <button
            type="button"
            class="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 sm:flex"
            :disabled="currentTicketIndex >= ticketCount - 1"
            @click="nextTicket"
          >›</button>
        </div>

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
        <UiButton variant="ghost" class="h-11 px-4" @click="$router.push('/me/orders')">목록</UiButton>
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

const STATUS_LABEL = { PAID: '예매완료', PENDING: '결제대기', CANCELED: '취소완료', REFUNDED: '부분환불' }
const STATUS_COLOR = { PAID: 'green', PENDING: 'blue', CANCELED: 'slate', REFUNDED: 'amber' }

export default {
  name: 'MyOrderDetailView',
  components: { UiCard, UiBadge, UiButton },
  data() {
    return {
      loading: false,
      item: null,
      api: null,
      currentTicketIndex: 0,
      // 좌석맵
      seatMapThumbnail: null,
      smThumbnailLoading: false,
      // 줌/드래그
      smScale: 1,
      smOffsetX: 0,
      smOffsetY: 0,
      smDragging: false,
      smDragStartX: 0,
      smDragStartY: 0,
      smTouchStartDist: null,
      smTouchLastScale: 1,
    }
  },
  computed: {
    canCancel() {
      return !!this.item?.paymentId &&
        (this.item?.seatDetails || []).some((s) => s.status === 'SOLD')
    },
    soldSeats() {
      return (this.item?.seatDetails || []).filter((s) => s.status === 'SOLD')
    },
    tickets() {
      if (!this.item || this.item.status !== 'PAID') return []
      return this.soldSeats
    },
    ticketCount() { return this.tickets.length },
    currentTicket() {
      if (!this.ticketCount) return null
      return this.tickets[Math.min(this.currentTicketIndex, this.ticketCount - 1)]
    },
    // 백엔드가 seatDetails에 좌표(relX, relY)를 포함하면 핑 마커 렌더링
    highlightedSeats() {
      if (!this.seatMapThumbnail) return []
      return this.soldSeats
        .filter((s) => s.relX != null && s.relY != null)
        .map((s) => ({
          key: s.id ?? s.seatDefName,
          style: {
            left: `calc(${s.relX * 100}% - 8px)`,
            top: `calc(${s.relY * 100}% - 8px)`,
            width: '16px',
            height: '16px',
          },
        }))
    },
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  beforeUnmount() {
    this.smDragging = false
  },
  methods: {
    statusLabel: (s) => STATUS_LABEL[s] || s || '-',
    statusColor: (s) => STATUS_COLOR[s] || 'slate',
    formatWon(value) { return `${Number(value || 0).toLocaleString()}원` },
    formatDate(value) {
      if (!value) return '-'
      const d = new Date(value)
      return Number.isNaN(d.getTime()) ? value : d.toLocaleString('ko-KR')
    },
    prevTicket() { if (this.currentTicketIndex > 0) this.currentTicketIndex-- },
    nextTicket() { if (this.currentTicketIndex < this.ticketCount - 1) this.currentTicketIndex++ },

    async load() {
      const orderId = this.$route.params.orderId
      if (!orderId) { this.loading = false; return }
      this.loading = true
      try {
        this.item = await this.api.get(ENDPOINTS.myOrder(orderId))
        // 주문 로드 후 좌석맵 비동기 로드 (실패해도 주문 상세에는 영향 없음)
        if (this.item?.scheduleId) this.loadSeatMap(this.item.scheduleId)
      } finally {
        this.loading = false
      }
    },

    async loadSeatMap(scheduleId) {
      this.smThumbnailLoading = true
      this.seatMapThumbnail = null
      try {
        const res = await this.api.get(ENDPOINTS.seatMap(scheduleId))
        // 백엔드가 thumbnailUrl 또는 thumbnail_url 포함 시 표시
        this.seatMapThumbnail = res?.thumbnailUrl ?? res?.thumbnail_url ?? null
      } catch {
        this.seatMapThumbnail = null
      } finally {
        this.smThumbnailLoading = false
      }
    },

    // ── 줌 컨트롤 ──
    smZoomIn() { this.smScale = Math.min(4, +(this.smScale + 0.2).toFixed(2)) },
    smZoomOut() { this.smScale = Math.max(0.5, +(this.smScale - 0.2).toFixed(2)) },
    smReset() { this.smScale = 1; this.smOffsetX = 0; this.smOffsetY = 0 },
    smOnWheel(e) {
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      this.smScale = Math.min(4, Math.max(0.5, +(this.smScale + delta).toFixed(2)))
    },

    // ── 드래그 ──
    smStartDrag(e) {
      if (!this.seatMapThumbnail) return
      this.smDragging = true
      this.smDragStartX = e.clientX - this.smOffsetX
      this.smDragStartY = e.clientY - this.smOffsetY
    },
    smOnDrag(e) {
      if (!this.smDragging) return
      this.smOffsetX = e.clientX - this.smDragStartX
      this.smOffsetY = e.clientY - this.smDragStartY
    },
    smEndDrag() { this.smDragging = false },

    // ── 터치 핀치 줌 ──
    smTouchStart(e) {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        this.smTouchStartDist = Math.sqrt(dx * dx + dy * dy)
        this.smTouchLastScale = this.smScale
      } else if (e.touches.length === 1) {
        this.smDragging = true
        this.smDragStartX = e.touches[0].clientX - this.smOffsetX
        this.smDragStartY = e.touches[0].clientY - this.smOffsetY
      }
    },
    smTouchMove(e) {
      if (e.touches.length === 2 && this.smTouchStartDist) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const ratio = dist / this.smTouchStartDist
        this.smScale = Math.min(4, Math.max(0.5, +(this.smTouchLastScale * ratio).toFixed(2)))
      } else if (e.touches.length === 1 && this.smDragging) {
        this.smOffsetX = e.touches[0].clientX - this.smDragStartX
        this.smOffsetY = e.touches[0].clientY - this.smDragStartY
      }
    },
  },
}
</script>