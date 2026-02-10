<script setup>
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
</script>

<template>
  <UiCard>
    <div class="text-sm font-semibold text-slate-900">접근 권한이 없어요 (403)</div>
    <div class="mt-2 text-sm text-slate-500">현재 Role로는 이 페이지에 접근할 수 없습니다.</div>
    <div class="mt-4 flex gap-2">
      <UiButton variant="ghost" @click="$router.back()">뒤로</UiButton>
      <UiButton @click="$router.push('/')">홈으로</UiButton>
    </div>
  </UiCard>
</template>

