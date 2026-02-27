<template>
  <div class="mx-auto max-w-md px-4 py-12">
    <!-- 입장 완료 애니메이션 -->
    <div
      v-if="showAdmittedAnimation"
      class="rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-lg transition-opacity"
    >
      <div class="mb-4 text-5xl">✅</div>
      <h2 class="mb-2 text-xl font-bold text-green-800">입장 완료!</h2>
      <p class="mb-4 text-sm text-green-700">좌석 선택 화면으로 이동합니다</p>
      <p class="text-xs text-amber-700">⚠ 입장 권한은 10분간 유효합니다</p>
    </div>

    <!-- 대기 화면 -->
    <div
      v-else
      class="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg"
    >
      <h2 class="mb-6 text-center text-xl font-bold text-slate-900">
        🎵 예매 대기 중...
      </h2>

      <!-- 순번 -->
      <div class="mb-6">
        <div class="mb-2 text-center text-sm text-slate-500">현재 내 순번</div>
        <div
          class="rounded-xl border-2 border-blue-200 bg-blue-50 py-6 text-center text-3xl font-bold text-blue-700"
        >
          {{ position.toLocaleString('ko-KR') }} 번째
        </div>
      </div>

      <!-- 전체 인원 -->
      <div class="mb-4 text-center text-sm text-slate-600">
        전체 대기 인원: {{ total.toLocaleString('ko-KR') }}명
      </div>

      <!-- 예상 대기 시간 -->
      <div class="mb-6 text-center text-sm text-slate-600">
        예상 대기 시간: 약 {{ estimatedWaitText }}
      </div>

      <!-- 진행률 바 -->
      <div class="mb-6">
        <div class="mb-2 flex justify-between text-xs text-slate-500">
          <span>진행률</span>
          <span>{{ progressPercent }}%</span>
        </div>
        <div class="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            class="h-full rounded-full bg-blue-500 transition-all duration-500"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
      </div>

      <!-- 업데이트 안내 -->
      <div class="mb-6 text-center text-xs text-slate-400">
        ⏱ {{ countdownToNext }} 후 자동 업데이트
      </div>

      <!-- 에러/재진입 안내 -->
      <div v-if="queueError" class="mb-4 rounded-xl bg-red-50 p-4 text-center text-sm text-red-600">
        {{ queueError }}
        <button
          v-if="queueError.includes('등록되지 않았습니다')"
          type="button"
          class="mt-3 block w-full rounded-lg border border-red-300 bg-white py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          @click="$router.replace(`/schedules/${scheduleId}`)"
        >
          스케줄 상세로 이동
        </button>
      </div>

      <!-- 취소하기 -->
      <div class="flex justify-center">
        <button
          type="button"
          class="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          @click="handleCancel"
        >
          취소하기
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useApi } from '../../composables/useApi'
import { useQueueStore } from '../../stores/useQueueStore'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { parseErrorResponse } from '../../lib/api/parseError'

const POLL_INTERVAL_MS = 5000
const ADMITTED_ANIMATION_MS = 1500
const MAX_RETRIES = 3

export default {
  name: 'QueueWaitingView',

  data() {
    return {
      scheduleId: null,
      position: 0,
      total: 0,
      api: null,
      pollTimer: null,
      countdownSec: POLL_INTERVAL_MS / 1000,
      countdownTimer: null,
      queueError: null,
      retryCount: 0,
      showAdmittedAnimation: false,
    }
  },

  computed: {
    progressPercent() {
      if (this.total <= 0) return 0
      const remaining = Math.max(0, this.position - 1)
      if (remaining <= 0) return 100
      return Math.round(((this.total - remaining) / this.total) * 100)
    },
    estimatedWaitText() {
      const batches = Math.ceil(Math.max(1, this.position) / 100)
      const totalSec = batches * 3
      if (totalSec < 60) return `${totalSec}초`
      const m = Math.floor(totalSec / 60)
      const s = totalSec % 60
      return s > 0 ? `${m}분 ${s}초` : `${m}분`
    },
    countdownToNext() {
      return `${this.countdownSec}초`
    },
    queueStoreAdmitted() {
      return useQueueStore().state.admitted
    },
  },

  created() {
    this.api = useApi()
    const scheduleId = this.$route.params.scheduleId
    if (!scheduleId) {
      this.$router.replace('/')
      return
    }
    this.scheduleId = Number(scheduleId)
    const { state } = useQueueStore()
    this.position = state.position || 0
    this.total = state.total || 0
  },

  mounted() {
    const qs = useQueueStore()
    qs.state.isPolling = true
    this.startPolling()
    this.startCountdown()
    window.addEventListener('beforeunload', this.handleBeforeUnload)
  },

  beforeUnmount() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
    this.stopPolling()
    this.stopCountdown()
    useQueueStore().stopPolling()
  },

  watch: {
    queueStoreAdmitted: {
      handler(admitted) {
        const qs = useQueueStore()
        if (admitted && this.scheduleId && String(qs.state.scheduleId) === String(this.scheduleId)) {
          this.onAdmitted()
        }
      },
    },
  },

  methods: {
    startPolling() {
      this.stopPolling()
      const poll = async () => {
        const { state, stopPolling } = useQueueStore()
        if (!state.isPolling) return
        try {
          const res = await this.api.get(ENDPOINTS.queuePosition(this.scheduleId), { skipErrorAlert: true })
          const data = res?.data ?? res
          const position = data.position ?? 0
          const total = data.total ?? 0
          const admitted = data.admitted ?? false

          useQueueStore().updatePosition(position, total, admitted)
          this.position = position
          this.total = total
          this.queueError = null
          this.retryCount = 0

          if (admitted || position === 0) {
            stopPolling()
            this.onAdmitted()
            return
          }
        } catch (err) {
          const msg = parseErrorResponse(err?.responseData)?.message ?? err?.message ?? ''
          if (msg.includes('대기열에 등록되지 않은 사용자')) {
            stopPolling()
            this.queueError = '대기열에 등록되지 않았습니다. 다시 예매를 시작해 주세요.'
            return
          }
          this.retryCount++
          if (this.retryCount >= MAX_RETRIES) {
            this.queueError = '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
          }
        }
        this.pollTimer = setTimeout(poll, POLL_INTERVAL_MS)
      }
      poll()
    },

    stopPolling() {
      if (this.pollTimer) {
        clearTimeout(this.pollTimer)
        this.pollTimer = null
      }
    },

    startCountdown() {
      this.stopCountdown()
      this.countdownSec = POLL_INTERVAL_MS / 1000
      this.countdownTimer = setInterval(() => {
        this.countdownSec = Math.max(0, this.countdownSec - 1)
        if (this.countdownSec <= 0) this.countdownSec = POLL_INTERVAL_MS / 1000
      }, 1000)
    },

    stopCountdown() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
    },

    onAdmitted() {
      this.stopPolling()
      this.stopCountdown()
      useQueueStore().handleAdmitted(this.scheduleId)
      this.showAdmittedAnimation = true
      setTimeout(() => {
        this.$router.replace(`/schedules/${this.scheduleId}/seats`)
      }, ADMITTED_ANIMATION_MS)
    },

    handleCancel() {
      if (!window.confirm('취소하면 대기열 순번이 소멸됩니다. 계속하시겠습니까?')) return
      useQueueStore().reset()
      this.$router.back()
    },

    handleBeforeUnload(e) {
      e.preventDefault()
      e.returnValue = '대기열에서 나가면 순번이 초기화됩니다'
    },
  },
}
</script>
