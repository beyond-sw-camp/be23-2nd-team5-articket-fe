<template>
  <div class="space-y-4">
    <UiCard>
      <div class="text-sm font-semibold text-slate-900">예매 취소</div>
      <div class="mt-2 text-sm text-slate-500">
        취소할 좌석을 선택한 뒤 예상 수수료와 환불 금액을 확인할 수 있습니다.
      </div>

      <div class="mt-5">
        <div class="text-sm font-semibold text-slate-900">취소할 좌석 선택</div>

        <div v-if="cancelableSeats.length === 0" class="mt-3 text-sm text-slate-500">
          취소 가능한 좌석이 없습니다.
        </div>

        <div v-else class="mt-3 space-y-2">
          <label
            v-for="seat in cancelableSeats"
            :key="seat.id"
            class="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
          >
            <div class="flex items-center gap-3">
              <input
                v-model="selectedSeatIds"
                type="checkbox"
                :value="seat.id"
                class="h-4 w-4 rounded border-slate-300"
              />
              <div>
                <div class="text-sm font-medium text-slate-900">{{ seat.seatDefName }}</div>
                <div class="text-xs text-slate-500">{{ seat.status }}</div>
              </div>
            </div>
            <div class="text-sm font-semibold text-slate-700">
              {{ formatWon(seat.price) }}
            </div>
          </label>
        </div>
        <div class="mt-4 rounded-xl bg-slate-50 p-4">
        <div class="flex items-center justify-between text-sm text-slate-600">
          <span>선택 좌석 수</span>
          <strong class="text-slate-900">{{ selectedSeatCount }}석</strong>
        </div>
        <div class="mt-2 flex items-center justify-between text-sm text-slate-600">
          <span>선택 좌석 금액</span>
          <strong class="text-slate-900">{{ formatWon(selectedSeatAmount) }}</strong>
        </div>
        </div>
      </div>

      <div class="mt-5">
        <label class="block text-sm font-semibold text-slate-900">취소 사유</label>
        <input
          v-model="cancelReason"
          type="text"
          class="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
          placeholder="취소 사유를 입력해 주세요"
        />
      </div>

      <div class="mt-5 flex gap-2">
        <UiButton
          variant="ghost"
          class="h-11 px-4"
          :disabled="previewLoading || selectedSeatIds.length === 0"
          @click="fetchPreview"
        >
          {{ previewLoading ? '계산 중...' : '취소 금액 확인' }}
        </UiButton>

        <UiButton
          variant="ghost"
          class="h-11 px-4"
          @click="$router.push(`/me/orders/${$route.params.orderId}`)"
        >
          돌아가기
        </UiButton>
      </div>
    </UiCard>

    <UiModal :open="open" title="선택한 좌석을 취소할까요?" @close="open = false">
      <div class="space-y-3">
        <div class="text-sm text-slate-600">
          예매 수수료는 환불되지 않습니다.
        </div>

        <div class="rounded-xl bg-slate-50 p-4">
          <div class="flex items-center justify-between text-sm text-slate-600">
            <span>취소 좌석 금액</span>
            <strong class="text-slate-900">{{ formatWon(cancelPreview?.originalAmount) }}</strong>
          </div>

          <div class="mt-2 flex items-center justify-between text-sm text-slate-600">
            <span>취소 수수료</span>
            <strong class="text-slate-900">{{ formatWon(cancelPreview?.cancellationFee) }}</strong>
          </div>

          <div class="mt-3 border-t border-slate-200 pt-3 flex items-center justify-between text-sm font-semibold">
            <span class="text-slate-900">환불 예정 금액</span>
            <strong class="text-red-600">{{ formatWon(cancelPreview?.refundAmount) }}</strong>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 p-4">
          <div class="text-sm font-semibold text-slate-900">선택된 좌석</div>
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="seat in selectedSeatObjects"
              :key="seat.id"
              class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {{ seat.seatDefName }}
            </span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" class="h-11 px-4" @click="open = false">
            닫기
          </UiButton>
          <UiButton
            class="h-11 px-5"
            :disabled="loading || !cancelPreview || selectedSeatIds.length === 0"
            @click="cancel"
          >
            {{ loading ? '취소 처리 중...' : '최종 취소하기' }}
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
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
      previewLoading: false,
      open: false,
      api: null,
      order: null,
      cancelPreview: null,
      cancelReason: '단순 변심',
      selectedSeatIds: []
    }
  },
  computed: {
    cancelableSeats() {
      return (this.order?.seatDetails || []).filter((seat) => seat.status === 'SOLD')
    },
    selectedSeatObjects() {
      return this.cancelableSeats.filter((seat) => this.selectedSeatIds.includes(seat.id))
    },
        selectedSeatCount() {
      return this.selectedSeatIds.length
    },
    selectedSeatAmount() {
      return this.selectedSeatObjects.reduce((sum, seat) => sum + Number(seat.price || 0), 0)
    }
  },
  created() {
    this.api = useApi()
  },
  async mounted() {
    await this.fetchOrder()
  },
  methods: {
    formatWon(value) {
      const amount = Number(value || 0)
      return `${amount.toLocaleString()}원`
    },

    async fetchOrder() {
      const orderId = this.$route.params.orderId
      if (orderId == null || orderId === '') {
        showErrorAlert(new Error('주문 정보를 찾을 수 없습니다.'))
        return
      }

      try {
        this.order = await this.api.get(ENDPOINTS.myOrder(orderId))
        this.selectedSeatIds = []
      } catch (e) {
        // useApi 내부에서 에러 알림 처리
      }
    },

    async fetchPreview() {
      if (!this.order?.paymentId) {
        showErrorAlert(new Error('결제 정보를 찾을 수 없습니다.'))
        return
      }

      if (this.selectedSeatIds.length === 0) {
        showErrorAlert(new Error('취소할 좌석을 선택해 주세요.'))
        return
      }

      this.previewLoading = true
      try {
        this.cancelPreview = await this.api.post(ENDPOINTS.paymentCancelPreview(), {
          paymentId: this.order.paymentId,
          amount: 0,
          seatList: this.selectedSeatIds,
          reason: this.cancelReason
        })
        this.open = true
      } catch (e) {
        // useApi 내부에서 에러 알림 처리
      } finally {
        this.previewLoading = false
      }
    },

    async cancel() {
      if (!this.order?.paymentId) {
        showErrorAlert(new Error('결제 정보를 찾을 수 없습니다.'))
        return
      }

      if (this.selectedSeatIds.length === 0) {
        showErrorAlert(new Error('취소할 좌석을 선택해 주세요.'))
        return
      }

      this.loading = true
      try {
        await this.api.post(ENDPOINTS.paymentCancel(), {
          paymentId: this.order.paymentId,
          amount: 0,
          seatList: this.selectedSeatIds,
          reason: this.cancelReason
        })

        this.open = false
        this.cancelPreview = null
        await this.fetchOrder()
        this.$router.push(`/me/orders/${this.$route.params.orderId}`)
      } catch (e) {
        // useApi 내부에서 에러 알림 처리
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
