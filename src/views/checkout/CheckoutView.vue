<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">주문 생성 + 결제 트리거</div>
          <div class="mt-1 text-sm text-slate-500">POST /orders, POST /payments (mock)</div>
        </div>
        <UiBadge tone="soft">Checkout</UiBadge>
      </div>

      <div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div class="text-xs font-semibold text-slate-500">holdId</div>
        <div class="mt-1 text-sm font-semibold text-slate-900">{{ holdId || '(없음)' }}</div>
        <div class="mt-2 text-sm text-slate-500">
          holdId가 없으면 선점 페이지(`/hold/:holdId`)에서 결제를 시작해 주세요.
        </div>
      </div>

      <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <UiButton variant="ghost" class="h-12 px-5" @click="$router.push('/')">둘러보기</UiButton>
        <UiButton class="h-12 px-6" :disabled="!holdId || loading" @click="open = true">
          <CreditCard class="h-4 w-4" />
          <span class="ml-2">결제하기</span>
        </UiButton>
      </div>
    </UiCard>
  </div>

  <UiModal :open="open" title="결제 확인" @close="open = false">
    <div class="text-sm text-slate-600">mock 결제를 진행할까요?</div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UiButton variant="ghost" class="h-11 px-4" @click="open = false">취소</UiButton>
        <UiButton class="h-11 px-5" :disabled="loading" @click="createOrderAndPay">진행</UiButton>
      </div>
    </template>
  </UiModal>
</template>

<script>
import { CreditCard } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiModal from '../../components/common/UiModal.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'CheckoutView',
  components: {
    CreditCard,
    UiCard,
    UiButton,
    UiBadge,
    UiModal
  },
  data() {
    return {
      loading: false,
      open: false,
      api: null
    }
  },
  computed: {
    holdId() {
      return String(this.$route.query.holdId || '')
    }
  },
  created() {
    this.api = useApi()
  },
  methods: {
    async createOrderAndPay() {
      if (!this.holdId) return
      this.loading = true
      try {
        const order = await this.api.post(ENDPOINTS.orders(), { holdId: this.holdId })
        await this.api.post(ENDPOINTS.payments(), { orderId: order.id, method: 'MOCK_CARD' })
        this.$router.push(`/orders/${order.id}`)
      } catch (e) {
        // 에러는 ErrorAlertModal에서 표시됨
      } finally {
        this.loading = false
        this.open = false
      }
    }
  }
}
</script>
