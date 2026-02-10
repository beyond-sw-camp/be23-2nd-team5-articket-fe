<script setup>
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import EmptyState from '../../components/common/EmptyState.vue'
</script>

<template>
  <div class="grid gap-4">
    <EmptyState
      title="좌석 선점은 좌석 선택에서 시작해요"
      description="/schedules/:scheduleId/seats 에서 AVAILABLE 좌석을 선택한 뒤 선점 버튼을 눌러주세요."
    >
      <div class="flex justify-center gap-2">
        <UiButton variant="ghost" class="h-11 px-4" @click="$router.push('/')">홈</UiButton>
        <UiButton class="h-11 px-5" @click="$router.push('/nearby')">내 주변</UiButton>
      </div>
    </EmptyState>

    <UiCard>
      <div class="text-sm font-semibold text-slate-900">참고</div>
      <div class="mt-2 text-sm text-slate-500">
        Mock에서 선점 생성 시 holdId/holdToken/expiresAt을 반환하고, 만료 시 좌석이 AVAILABLE로 롤백됩니다.
      </div>
    </UiCard>
  </div>
</template>

