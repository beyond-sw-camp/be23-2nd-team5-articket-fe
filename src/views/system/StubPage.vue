<script setup>
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'

defineProps({
  title: { type: String, default: 'Stub Page' },
  description: { type: String, default: '' },
  badge: { type: String, default: 'stub' },
})
</script>

<template>
  <UiCard>
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">{{ title }}</div>
        <div v-if="description" class="mt-1 text-sm text-slate-500">{{ description }}</div>
      </div>
      <UiBadge tone="soft">{{ badge }}</UiBadge>
    </div>
    <div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 shadow-sm">
      이 페이지는 UI/라우팅/권한 가드 구조를 고정하기 위한 stub입니다. 추후 실제 API 연동 시 화면/컴포넌트는 그대로 두고
      데이터 레이어만 교체하면 됩니다.
    </div>
  </UiCard>
</template>

