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
import { showErrorAlert } from '../../composables/useErrorToast'
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
      const orderId = this.$route.params.orderId
      if (orderId == null || orderId === '') {
        showErrorAlert(new Error('주문 정보를 찾을 수 없습니다.'))
        return
      }
      this.loading = true
      try {
        await this.api.post(ENDPOINTS.orderCancel(orderId), {})
        this.open = false
        this.$router.push(`/orders/${orderId}`)
      } catch (e) {
        // 에러는 ErrorAlertModal에서 표시됨
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
