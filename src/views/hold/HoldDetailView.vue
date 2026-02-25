<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <UiCard v-else-if="!item">
      <div class="text-sm text-slate-500">선점 정보를 찾을 수 없습니다.</div>
      <div class="mt-4">
        <UiButton class="h-11 px-5" @click="$router.push('/')">홈으로</UiButton>
      </div>
    </UiCard>

    <UiCard v-else-if="item">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">좌석 선점</div>
          <div class="mt-1 text-sm text-slate-500">
            {{ item.holdId }}
            <span v-if="item.scheduleId !== null && item.scheduleId !== undefined"> · schedule {{ item.scheduleId }}</span>
          </div>
        </div>
        <UiBadge :tone="expired ? 'solid' : 'soft'" :color="expired ? 'slate' : 'red'">
          {{ expired ? 'EXPIRED' : 'HOLDING' }}
        </UiBadge>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Timer class="h-4 w-4 text-slate-600" />
            남은 시간
          </div>
          <div class="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{{ remainingText }}</div>
          <div class="mt-1 text-xs text-slate-500">만료 시각: {{ new Date(item.expiresAt).toLocaleString() }}</div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">선점 좌석</div>
          <div class="mt-2 flex flex-wrap gap-2">
            <UiBadge v-for="s in item.seats" :key="s" tone="outline">{{ s }}</UiBadge>
          </div>
        </div>
      </div>

      <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <UiButton variant="ghost" class="h-12 px-5" @click="open = true">선점 취소</UiButton>
        <UiButton class="h-12 px-6" :disabled="expired" @click="$router.push({ path: '/checkout', query: { holdId: item.holdId } })">
          결제 진행
        </UiButton>
      </div>
    </UiCard>
  </div>

  <UiModal :open="open" title="선점 취소" @close="open = false">
    <div class="text-sm text-slate-600">선점 좌석을 해제할까요?</div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UiButton variant="ghost" class="h-11 px-4" @click="open = false">닫기</UiButton>
        <UiButton class="h-11 px-5" @click="cancelHold">해제</UiButton>
      </div>
    </template>
  </UiModal>
</template>

<script>
import { Timer } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiModal from '../../components/common/UiModal.vue'
import { useSeatHoldMock } from '../../composables/useSeatHoldMock'
import { showErrorAlert } from '../../composables/useErrorToast'

export default {
  name: 'HoldDetailView',
  components: {
    Timer,
    UiCard,
    UiButton,
    UiBadge,
    UiModal
  },
  data() {
    return {
      loading: false,
      item: null,
      now: Date.now(),
      open: false,
      timer: null,
      seatHoldMock: null
    }
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
  created() {
    this.seatHoldMock = useSeatHoldMock()
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
    }
  }
}
</script>
