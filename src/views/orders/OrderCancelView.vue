<template>
  <UiCard>
    <div class="text-sm font-semibold text-slate-900">주문 취소</div>
    <div class="mt-2 text-sm text-slate-500">확인 모달에서 취소를 진행합니다.</div>
    <div class="mt-4">
      <UiButton variant="ghost" class="h-11 px-4" @click="$router.push(`/orders/${$route.params.orderId}`)">돌아가기</UiButton>
    </div>
  </UiCard>

  <UiModal :open="open" title="주문을 취소할까요?" @close="open = false">
    <div class="text-sm text-slate-600">취소 후에는 복구할 수 없어요.</div>
    <div v-if="error" class="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
      {{ error }}
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UiButton variant="ghost" class="h-11 px-4" @click="open = false">닫기</UiButton>
        <UiButton class="h-11 px-5" :disabled="loading" @click="cancel">취소 진행</UiButton>
      </div>
    </template>
  </UiModal>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiModal from '../../components/common/UiModal.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'OrderCancelView',
  components: {
    UiCard,
    UiButton,
    UiModal
  },
  data() {
    return {
      loading: false,
      open: true,
      error: '',
      api: null
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.open = true
  },
  methods: {
    async cancel() {
      this.loading = true
      this.error = ''
      try {
        await this.api.post(ENDPOINTS.orderCancel(this.$route.params.orderId), {})
        this.open = false
        this.$router.push(`/orders/${this.$route.params.orderId}`)
      } catch (e) {
        this.error = e?.message || '취소에 실패했어요.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
