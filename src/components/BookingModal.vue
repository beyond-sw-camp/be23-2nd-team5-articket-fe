<template>
  <UiModal :open="open" title="예매 진행" @close="$emit('close')">
    <div class="grid gap-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">{{ concert ? concert.title : '공연' }}</div>
          <div class="mt-1 text-sm text-slate-500">{{ hint }}</div>
        </div>
        <UiBadge tone="soft">Mock Flow</UiBadge>
      </div>

      <StepIndicator :steps="steps" :active="active" />

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        이 모달은 "날짜 선택 → 좌석 선택 → 결제" 스텝퍼 UI를 고정합니다. 실제 동작은 각 페이지에서 mock
        API로 시뮬레이션됩니다.
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-2">
        <UiButton variant="ghost" class="h-11 px-4" :disabled="active === 0" @click="prevStep">
          이전
        </UiButton>
        <div class="flex gap-2">
          <UiButton
            variant="ghost"
            class="h-11 px-4"
            @click="goToSchedules"
          >
            회차로 이동
          </UiButton>
          <UiButton class="h-11 px-4" @click="nextStep">다음</UiButton>
        </div>
      </div>
    </template>
  </UiModal>
</template>

<script>
import UiModal from './common/UiModal.vue'
import StepIndicator from './common/StepIndicator.vue'
import UiButton from './common/UiButton.vue'
import UiBadge from './common/UiBadge.vue'

export default {
  name: 'BookingModal',
  components: {
    UiModal,
    StepIndicator,
    UiButton,
    UiBadge
  },
  props: {
    open: { type: Boolean, default: false },
    concert: { type: Object, default: null }
  },
  emits: ['close'],
  data() {
    return {
      active: 0,
      steps: [
        { key: 'schedule', label: '날짜 선택' },
        { key: 'seats', label: '좌석 선택' },
        { key: 'pay', label: '결제' }
      ]
    }
  },
  computed: {
    hint() {
      if (this.active === 0) return '회차 목록에서 날짜/시간을 선택해요.'
      if (this.active === 1) return '좌석 상태(AVAILABLE/HOLD/SOLD)를 확인하고 선택해요.'
      return '선점(hold) 기반으로 주문/결제를 진행해요.'
    }
  },
  watch: {
    open(v) {
      if (v) this.active = 0
    }
  },
  methods: {
    prevStep() {
      this.active = Math.max(0, this.active - 1)
    },
    nextStep() {
      this.active = Math.min(2, this.active + 1)
    },
    goToSchedules() {
      this.active = 0
      this.$router.push(`/concerts/${this.concert?.id}/schedules`)
      this.$emit('close')
    }
  }
}
</script>
