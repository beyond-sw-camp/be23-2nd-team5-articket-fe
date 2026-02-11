<template>
  <div class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">공연 생성</div>
        <div class="mt-1 text-sm text-slate-500">스텝퍼 UI (읽기 전용 공연장/좌석맵 선택 포함)</div>
      </div>
      <UiBadge tone="soft">ORGANIZER</UiBadge>
    </div>

    <StepIndicator :steps="steps" :active="active" />

    <UiCard>
      <div class="text-sm font-semibold text-slate-900">현재 단계</div>
      <div class="mt-2 text-sm text-slate-600">{{ steps[active].label }} (stub)</div>
      <div class="mt-4 flex items-center justify-between gap-2">
        <UiButton variant="ghost" class="h-11 px-4" :disabled="active===0" @click="prevStep">이전</UiButton>
        <UiButton class="h-11 px-5" :disabled="active===steps.length-1" @click="nextStep">다음</UiButton>
      </div>
    </UiCard>
  </div>
</template>

<script>
import StepIndicator from '../../components/common/StepIndicator.vue'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'

export default {
  name: 'OrganizerNewConcertView',
  components: {
    StepIndicator,
    UiCard,
    UiButton,
    UiBadge
  },
  data() {
    return {
      active: 0,
      steps: [
        { key: 'base', label: '기본정보' },
        { key: 'venue', label: '공연장 선택' },
        { key: 'seatMap', label: '좌석맵 선택' },
        { key: 'schedules', label: '회차 추가' },
        { key: 'prices', label: '가격 설정' },
        { key: 'policies', label: '정책 설정' },
        { key: 'review', label: '검토/게시' }
      ]
    }
  },
  methods: {
    prevStep() {
      this.active = Math.max(0, this.active - 1)
    },
    nextStep() {
      this.active = Math.min(this.steps.length - 1, this.active + 1)
    }
  }
}
</script>
