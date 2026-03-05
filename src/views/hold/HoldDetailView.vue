<template>
  <div class="mx-auto max-w-4xl space-y-6 p-4 pb-12 pt-10 md:p-8">
    <div>
      <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">좌석 선점</h1>
      <p class="mt-1 text-sm text-slate-500">선점한 좌석을 확인하고 결제를 진행하세요.</p>
    </div>

    <!-- 로딩 -->
    <div
      v-if="loading"
      class="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white py-12 shadow-sm"
    >
      <div class="flex flex-col items-center gap-3 text-slate-500">
        <svg class="h-8 w-8 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span class="text-sm">불러오는 중…</span>
      </div>
    </div>

    <!-- 없음 -->
    <div
      v-else-if="!item"
      class="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"
    >
      <p class="text-sm text-slate-600">선점 정보를 찾을 수 없습니다.</p>
      <RouterLink
        to="/"
        class="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        홈으로
      </RouterLink>
    </div>

    <!-- 선점 정보 카드 -->
    <div
      v-else
      class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-slate-500">선점 ID · {{ item.scheduleId != null ? `일정 ${item.scheduleId}` : '' }}</p>
        <span
          class="rounded-full px-3 py-1 text-xs font-semibold"
          :class="expired ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-600'"
        >
          {{ expired ? '만료됨' : '선점 중' }}
        </span>
      </div>

      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <div class="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Timer class="h-4 w-4 shrink-0 text-slate-400" />
            남은 시간
          </div>
          <p class="mt-2 text-2xl font-bold tabular-nums text-slate-900">{{ remainingText }}</p>
          <p class="mt-1 text-xs text-slate-400">만료 시각: {{ new Date(item.expiresAt).toLocaleString('ko-KR') }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <p class="text-xs font-medium text-slate-500">선점 좌석</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="s in item.seats"
              :key="s"
              class="rounded-full border border-slate-200 bg-white px-3 py-0.5 text-xs font-medium text-slate-700"
            >
              {{ s }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          class="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          @click="open = true"
        >
          선점 취소
        </button>
        <button
          type="button"
          class="inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white transition disabled:opacity-50"
          :class="expired || paying ? 'cursor-not-allowed bg-slate-300' : 'bg-red-600 hover:bg-red-700'"
          :disabled="expired || paying"
          @click="goToOrder"
        >
          {{ paying ? '결제 페이지로 이동 중…' : '결제 진행' }}
        </button>
      </div>
    </div>

    <!-- 선점 취소 모달 -->
    <Teleport to="body">
      <div v-if="open" class="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" aria-hidden="true" @click="open = false" />
        <div class="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h3 class="text-base font-bold text-slate-900">선점 취소</h3>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              @click="open = false"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
          <p class="px-5 py-4 text-sm text-slate-600">선점 좌석을 해제할까요?</p>
          <div class="flex gap-2 px-5 pb-5">
            <button
              type="button"
              class="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              @click="open = false"
            >
              닫기
            </button>
            <button
              type="button"
              class="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              @click="cancelHold"
            >
              해제
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { Timer, X } from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { useSeatHoldMock } from '../../composables/useSeatHoldMock'
import { showErrorAlert } from '../../composables/useErrorToast'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'HoldDetailView',
  components: { Timer, X },
  data() {
    return {
      loading: false,
      item: null,
      now: Date.now(),
      open: false,
      timer: null,
      seatHoldMock: null,
      api: null,
      paying: false
    }
  },
  created() {
    this.api = useApi()
    this.seatHoldMock = useSeatHoldMock()
  },
  computed: {
    remainingMs() {
      const exp = this.item?.expiresAt ? new Date(this.item.expiresAt).getTime() : 0
      return Math.max(0, exp - this.now)
    },
    remainingText() {
      const s = Math.floor(this.remainingMs / 1000)
      const mm = String(Math.floor(s / 60)).padStart(2, '0')
      const ss = String(s % 60).padStart(2, '0')
      return `${mm}:${ss}`
    },
    expired() {
      return this.remainingMs <= 0
    }
  },
  mounted() {
    this.load()
    this.timer = setInterval(() => {
      this.now = Date.now()
      if (this.expired) this.load()
    }, 500)
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    async load() {
      this.loading = true
      try {
        this.item = await this.seatHoldMock.getHold(this.$route.params.holdId)
      } catch (e) {
        this.item = null
        showErrorAlert(e?.message ? new Error(e.message) : new Error('선점 정보를 찾을 수 없어요. (만료되었을 수 있어요)'))
      } finally {
        this.loading = false
      }
    },
    async cancelHold() {
      try {
        await this.seatHoldMock.releaseHold(this.$route.params.holdId)
        this.open = false
        this.$router.push('/')
      } catch (e) {
        showErrorAlert(e?.message ? new Error(e.message) : new Error('좌석 해제에 실패했어요.'))
      }
    },
    async goToOrder() {
      if (!this.item?.seats?.length || this.expired) return
      this.paying = true
      try {
        const seatIds = this.item.seats.map((id) => Number(id)).filter(Number.isFinite)
        const res = await this.api.post(ENDPOINTS.orderCreate(), { seats: seatIds })
        const orderId = res?.orderId ?? res?.id ?? res
        this.$router.push(`/order?orderId=${orderId}&holdId=${encodeURIComponent(this.item.holdId)}`)
      } catch (e) {
        this.paying = false
      }
    }
  }
}
</script>
