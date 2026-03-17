<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <!-- 헤더 -->
    <div class="px-1">
      <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">티켓 결제</h1>
      <p class="mt-1 text-sm text-slate-500">티켓 결제 · 주문 정보를 확인하고 결제를 완료해 주세요.</p>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div class="space-y-6 md:col-span-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div class="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Ticket class="h-5 w-5 text-red-600" />
            <h2 class="text-base font-bold text-slate-900">티켓 주문상세</h2>
          </div>
          <div v-if="order" class="space-y-4">
            <div class="border-b border-slate-100 pb-5">
              <h3 class="text-lg font-bold text-slate-900">{{ order.concertName }}</h3>
              <p class="mt-1.5 text-sm font-medium text-slate-500">{{ order.scheduleDate }} | {{ order.venueName }}</p>
            </div>
            <div
              v-for="(seat, index) in order.seatDetails"
              :key="index"
              class="flex items-center justify-between py-4"
              :class="index < order.seatDetails.length - 1 ? 'border-b border-slate-100' : ''"
            >
              <span class="text-sm font-semibold text-slate-700">{{ seat.seatDefName }} 1매</span>
              <span class="text-sm font-bold text-slate-900">{{ parseInt(seat.price).toLocaleString() }}원</span>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div class="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
            <User class="h-5 w-5 text-red-600" />
            <h2 class="text-base font-bold text-slate-900">예매자 정보</h2>
          </div>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="space-y-1">
              <p class="text-[11px] font-medium text-slate-500 uppercase">예매자 (Name)</p>
              <p class="text-sm font-semibold text-slate-900">{{ buyerName }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-[11px] font-medium text-slate-500 uppercase">생년월일 (Birth)</p>
              <p class="text-sm font-semibold text-slate-900">{{ buyerBirthLabel }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-[11px] font-medium text-slate-500 uppercase">이메일 (Email)</p>
              <p class="text-sm font-semibold text-slate-900 break-all">{{ buyerEmail }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-[11px] font-medium text-slate-500 uppercase">휴대폰 (Phone)</p>
              <p class="text-sm font-semibold text-slate-900 break-all">{{ buyerPhone }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div class="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
            <CreditCard class="h-5 w-5 text-red-600" />
            <h2 class="text-base font-bold text-slate-900">결제수단</h2>
          </div>
          <div class="rounded-xl bg-slate-50 p-4">
            <label class="flex items-center gap-3 text-sm font-bold text-slate-700">
              <input
                type="radio"
                checked
                disabled
                class="h-4 w-4 border-slate-300 text-red-600 focus:ring-red-500"
              />
              신용카드 / 간편결제
            </label>
            <p class="mt-2 ml-7 text-xs text-slate-500 font-medium leading-relaxed">
              현재 신용카드 및 간편결제 서비스만 이용 가능합니다.<br />
              결제 시 팝업창에서 원하는 수단을 선택해 주세요.
            </p>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div class="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
            <div class="flex items-center gap-2">
              <Receipt class="h-5 w-5 text-red-600" />
              <h2 class="text-base font-bold text-slate-900">예매자 동의</h2>
            </div>
            <label class="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors">
              <input type="checkbox" :checked="allAgreed" @change="toggleAllAgreed" class="h-4 w-4 rounded-md border-slate-300 text-red-600 focus:ring-red-500" />
              전체동의
            </label>
          </div>

          <div class="space-y-2">
            <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <label class="flex cursor-pointer items-start gap-3 text-sm font-bold text-slate-700">
                <input v-model="agreements.cancelFee" type="checkbox" class="mt-0.5 h-4 w-4 shrink-0 rounded-md border-slate-300 text-red-600 focus:ring-red-500" />
                [필수] 예매 및 취소 수수료/취소기한 동의
              </label>
              <div class="ml-7 mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <table class="w-full text-center text-[11px] text-slate-600">
                  <thead>
                    <tr class="border-b border-slate-200 bg-slate-50 font-bold">
                      <th class="px-3 py-2.5">취소일</th>
                      <th class="px-3 py-2.5">취소수수료</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="(row, i) in cancelPolicy" :key="i">
                      <td class="px-3 py-2.5 font-medium">{{ row.period }}</td>
                      <td class="px-3 py-2.5 font-bold text-slate-900">{{ row.fee }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <label class="flex cursor-pointer items-center gap-3 text-xs font-bold text-slate-700">
                  <input v-model="agreements.kakaoFinance" type="checkbox" class="h-4 w-4 shrink-0 rounded-md border-slate-300 text-red-600 focus:ring-red-500" />
                  전자금융 이용약관
                </label>
              </div>
              <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <label class="flex cursor-pointer items-center gap-3 text-xs font-bold text-slate-700">
                  <input v-model="agreements.privacy" type="checkbox" class="h-4 w-4 shrink-0 rounded-md border-slate-300 text-red-600 focus:ring-red-500" />
                  개인정보 수집/이용
                </label>
              </div>
              <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <label class="flex cursor-pointer items-center gap-3 text-xs font-bold text-slate-700">
                  <input v-model="agreements.thirdParty" type="checkbox" class="h-4 w-4 shrink-0 rounded-md border-slate-300 text-red-600 focus:ring-red-500" />
                  개인정보 제3자 제공
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="order" class="md:col-span-1">
        <div class="sticky top-24 space-y-6">
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div class="mb-5 border-b border-slate-100 pb-4">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <Receipt class="h-5 w-5 text-red-600" />
                  <h2 class="text-base font-bold text-slate-900">결제 정보</h2>
                </div>
                <div
                  v-if="holdExpiresAt != null"
                  class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                  :class="remainingMs > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400'"
                >
                  <Clock class="h-3.5 w-3.5" />
                  <span class="tabular-nums">
                    {{ remainingMs > 0 ? timerText : '00:00' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-4 rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-600">
              <div class="flex justify-between">
                <span>티켓금액</span>
                <span class="font-bold text-slate-900">{{ parseInt(order.amount).toLocaleString() }}원</span>
              </div>
              <div class="flex justify-between">
                <span>예매수수료</span>
                <span class="font-bold text-slate-900">{{ (2000 * order.seatDetails.length).toLocaleString() }}원</span>
              </div>
            </div>

            <div class="my-6 border-t border-dashed border-slate-200"></div>

            <div class="mb-6 flex flex-col gap-1">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Final Amount</span>
              <div class="flex items-baseline justify-between">
                <span class="text-2xl font-black text-red-600">
                  {{ (parseInt(order.amount) + 2000 * order.seatDetails.length).toLocaleString() }}원
                </span>
                <span class="text-xs font-bold text-slate-500">VAT 포함</span>
              </div>
            </div>

            <button
              type="button"
              class="h-14 w-full rounded-2xl bg-slate-900 text-base font-bold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none disabled:active:scale-100"
              :disabled="isExpired"
              @click="handlePayment"
            >
              {{ (parseInt(order.amount) + 2000 * order.seatDetails.length).toLocaleString() }}원 결제하기
            </button>
            <p class="mt-4 text-center text-[11px] font-medium text-slate-400 leading-relaxed">
              결제 완료 시 예매 내역은<br />
              <span class="font-bold text-slate-600">마이페이지 > 예매내역</span>에서 확인 가능합니다.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 좌석 선점 만료 모달 -->
    <UiModal
      :open="showExpiredModal"
      title="좌석 선점 시간 만료"
      @close="handleGoBack"
    >
      <div class="py-4 text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertCircle class="h-6 w-6 text-red-600" />
        </div>
        <h3 class="text-lg font-bold text-slate-900">선점 시간이 만료되었습니다</h3>
        <p class="mt-2 text-sm text-slate-600">
          좌석 선점 시간이 초과되어 주문을 진행할 수 없습니다.<br />
          공연 상세 페이지로 돌아가 좌석을 다시 선택해 주세요.
        </p>
      </div>
      <template #footer>
        <UiButton class="w-full" variant="primary" @click="handleGoBack">
          공연 상세로 돌아가기
        </UiButton>
      </template>
    </UiModal>
  </div>
</template>

<script>
import { Clock, Ticket, User, CreditCard, Receipt, AlertCircle } from 'lucide-vue-next'
import PortOne from '@portone/browser-sdk/v2'
import { useApi } from '../../composables/useApi'
import { useSeatHoldMock } from '../../composables/useSeatHoldMock'
import { useMe } from '../../composables/useMe'
import { ENDPOINTS } from '../../lib/api/endpoints'
import UiModal from '../../components/common/UiModal.vue'
import UiButton from '../../components/common/UiButton.vue'

export default {
  name: 'PaymentView',
  components: { Clock, Ticket, User, CreditCard, Receipt, AlertCircle, UiModal, UiButton },
  data() {
    return {
      api: null,
      seatHoldMock: null,
      me: null,
      holdExpiresAt: null,
      now: Date.now(),
      timerInterval: null,
      showExpiredModal: false,
      agreements: {
        cancelFee: false,
        kakaoFinance: false,
        privacy: false,
        thirdParty: false
      },
      order: null,
      cancelPolicy: [
        { period: '2026.02.24 ~ 2026.03.03', fee: '없음' },
        { period: '2026.03.04 ~ 2026.04.15', fee: '장당 4000원 (티켓금액의 10% 한도)' },
        { period: '2026.04.16 ~ 2026.04.18', fee: '티켓금액의 10%' },
        { period: '2026.04.19 ~ 2026.04.22', fee: '티켓금액의 20%' },
        { period: '2026.04.23 ~ 2026.04.24', fee: '티켓금액의 30%' }
      ]
    }
  },
  computed: {
    allAgreed() {
      return Object.values(this.agreements).every((v) => v)
    },
    orderId() {
      return String(this.$route.query.orderId || '')
    },
    holdId() {
      return String(this.$route.query.holdId || '').trim()
    },
    remainingMs() {
      if (!this.holdExpiresAt) return 0
      return Math.max(0, new Date(this.holdExpiresAt).getTime() - this.now)
    },
    isExpired() {
      return this.holdExpiresAt != null && this.remainingMs <= 0
    },
    timerText() {
      const s = Math.floor(this.remainingMs / 1000)
      const mm = String(Math.floor(s / 60)).padStart(2, '0')
      const ss = String(s % 60).padStart(2, '0')
      return `${mm}:${ss}`
    },
    meProfile() {
      const me = this.me
      return me?.profile?.value ?? me?.profile ?? null
    },
    buyerName() {
      const p = this.meProfile
      return p?.name || p?.nickname || '-'
    },
    buyerEmail() {
      const p = this.meProfile
      return p?.email || '-'
    },
    buyerPhone() {
      const p = this.meProfile
      return p?.phoneNumber || p?.phone || '-'
    },
    buyerBirthLabel() {
      const p = this.meProfile
      const raw = p?.verifiedBirthDate ?? p?.birthDate ?? p?.ageVerifiedAt ?? null
      if (!raw) return '-'
      const d = new Date(raw)
      if (Number.isNaN(d.getTime())) return '-'
      return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },
  },
  watch: {
    remainingMs(newVal) {
      if (newVal <= 0 && this.holdExpiresAt != null && !this.showExpiredModal) {
        this.showExpiredModal = true
      }
    }
  },
  created() {
    this.api = useApi()
    this.seatHoldMock = useSeatHoldMock()
    this.me = useMe()
  },
  async mounted() {
    try {
      const result = await this.api.get(ENDPOINTS.order(this.orderId))
      this.order = result
    } catch (error) {
      console.error('주문 정보를 불러오는데 실패했습니다.', error)
    }

    if (this.holdId) {
      try {
        const hold = await this.seatHoldMock.getHold(this.holdId)
        this.holdExpiresAt = hold?.expiresAt ?? null
        // 페이지 진입 시 이미 만료된 경우
        if (this.isExpired) {
          this.showExpiredModal = true
        }
      } catch (_) {
        this.holdExpiresAt = null
      }
    }
    this.timerInterval = setInterval(() => {
      this.now = Date.now()
    }, 1000)
  },
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  },
  methods: {
    toggleAllAgreed(e) {
      const checked = e.target.checked
      Object.keys(this.agreements).forEach((key) => {
        this.agreements[key] = checked
      })
    },
    handleGoBack() {
      if (this.order?.concertId) {
        this.$router.push(`/concerts/${this.order.concertId}`)
      } else {
        this.$router.push('/')
      }
    },
    async handlePayment() {
      if (this.isExpired) {
        this.showExpiredModal = true
        return
      }

      if (!this.allAgreed) {
        alert('모든 필수 항목에 동의해주세요.')
        return
      }

      if (!this.order) {
        alert('주문 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
        return
      }

      console.log('신용카드, 간편결제 로직 실행')
      let seatDefNames = ''
      for (let i = 0; i < this.order.seatDetails.length; i++) {
        seatDefNames += this.order.seatDetails[i].seatDefName + '\n'
      }
      try {
        if (this.order.status !== 'PENDING') {
          alert('이미 처리된 주문입니다.')
          return
        }
        const response = await PortOne.requestPayment({
          storeId: 'store-6ac42987-375b-44fc-bbc9-d9650b676666',
          channelKey: 'channel-key-cec20f2e-a187-41b7-9956-308d32850cc3',
          paymentId: `payment-${crypto.randomUUID()}`,
          orderName:
            this.order.scheduleDate +
            '\n' +
            this.order.concertName +
            '\n' +
            seatDefNames,
          totalAmount:
            parseInt(this.order.amount) + 2000 * this.order.seatDetails.length,
          currency: 'CURRENCY_KRW',
          payMethod: 'CARD'
        })
        if (response.code !== undefined) {
          return alert(response.message)
        }
        const verificationResult = await this.api.post(ENDPOINTS.payment(), {
          orderId: this.orderId,
          paymentId: response.paymentId
        })
        console.log('결제 검증 완료', verificationResult)
        localStorage.setItem(
          'orderData',
          JSON.stringify({
            order: this.order,
            payMethod: 'CARD'
          })
        )
        this.$router.push('/orderComplete')
      } catch (error) {
        console.error('결제 중 오류 발생:', error)
        alert('결제 처리 중 오류가 발생했습니다.')
      }
    }
  }
}
</script>

<style scoped>
/* Tailwind를 사용하므로 추가적인 CSS 작성을 최소화했습니다. */
/* input 등의 폼 요소는 tailwindcss/forms 플러그인이 있으면 더 예쁘게 렌더링 됩니다. */
</style>