<template>
  <UiCard>
    <div class="text-sm font-semibold text-slate-900">페이지를 찾을 수 없어요 (404)</div>
    <div class="mt-2 text-sm text-slate-500">주소가 잘못되었거나, 이동된 페이지입니다.</div>
    <div class="mt-4">
      <UiButton @click="$router.push('/')">홈으로</UiButton>
    </div>
  </UiCard>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'

export default {
  name: 'NotFoundView',
  components: {
    UiCard,
    UiButton
  }
}
</script>
