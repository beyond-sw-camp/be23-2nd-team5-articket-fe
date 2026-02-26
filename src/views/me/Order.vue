<template>
  <div class="relative mx-auto max-w-5xl p-4 py-10 md:p-8">
    <div v-if="timer"
      class="fixed right-8 top-12 z-[100000] flex items-center gap-2 rounded-xl border-2 border-red-500 bg-white px-4 py-2 text-lg font-bold text-red-600 shadow-lg">
      <Clock class="h-5 w-5" />
      남은 시간: {{ timerText }}
    </div>

    <h2 class="mb-6 text-2xl font-bold text-slate-900">티켓 결제</h2>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div class="space-y-6 md:col-span-2">
        <UiCard>
          <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Ticket class="h-5 w-5 text-slate-500" />
            <span class="text-base font-semibold text-slate-800">티켓 주문상세</span>
          </div>
          <div class="p-2" v-if="order">
            <div class="border-b border-slate-100 pb-4">
              <div class="text-base font-bold text-slate-900">{{ order.concertName }}</div>
              <div class="mt-1 text-sm text-slate-500">{{ order.scheduleDate }} | {{ order.venueName }}</div>
            </div>
            <div v-for="(seat, index) in order.seatDetails" :key="index"
              class="flex items-center justify-between py-4"
              :class="index < order.seatDetails.length - 1 ? 'border-b border-slate-100' : ''">
              <span class="text-sm font-medium text-slate-700">{{ seat.seatDefName }} 1매</span>
              <span class="text-sm font-semibold text-slate-900">{{ parseInt(seat.price).toLocaleString() }}원</span>
            </div>
          </div>
        </UiCard>

        <UiCard>
          <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User class="h-5 w-5 text-slate-500" />
            <span class="text-base font-semibold text-slate-800">예매자 정보</span>
          </div>
          <div class="p-2">
            <div class="flex items-center gap-4 border-b border-slate-100 py-4">
              <span class="w-20 shrink-0 text-sm font-medium text-slate-500">예매자</span>
              <input v-model="buyer.name" type="text"
                class="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div class="flex items-center gap-4 border-b border-slate-100 py-4">
              <span class="w-20 shrink-0 text-sm font-medium text-slate-500">생년월일</span>
              <input v-model="buyer.birth" type="text" placeholder="YYYY-MM-DD"
                class="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div class="flex items-center gap-4 border-b border-slate-100 py-4">
              <span class="w-20 shrink-0 text-sm font-medium text-slate-500">이메일</span>
              <input v-model="buyer.email" type="email"
                class="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div class="flex items-center gap-4 py-4">
              <span class="w-20 shrink-0 text-sm font-medium text-slate-500">휴대폰</span>
              <input v-model="buyer.phone" type="tel"
                class="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
        </UiCard>

        <UiCard>
          <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard class="h-5 w-5 text-slate-500" />
            <span class="text-base font-semibold text-slate-800">결제수단</span>
          </div>
          <div class="p-2">
            <label class="flex cursor-pointer items-center gap-3 border-b border-slate-100 py-4 text-sm font-medium text-slate-700">
              <input v-model="payMethod" type="radio" value="CARD"
                class="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500" />
              신용카드, 간편결제
            </label>
            <label class="flex cursor-pointer items-center gap-3 py-4 text-sm font-medium text-slate-700">
              <input v-model="payMethod" type="radio" value="VIRTUAL_ACCOUNT"
                class="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500" />
              무통장입금
            </label>
          </div>
        </UiCard>

        <UiCard>
          <div class="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <span class="text-base font-semibold text-slate-800">예매자동의</span>
            <label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" :checked="allAgreed" @change="toggleAllAgreed"
                class="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500" />
              전체동의
            </label>
          </div>

          <div class="p-2">
            <div class="border-b border-slate-100 pb-4">
              <label class="flex cursor-pointer items-start gap-2 text-sm font-medium text-slate-700">
                <input v-model="agreements.cancelFee" type="checkbox"
                  class="mt-0.5 h-4 w-4 shrink-0 border-slate-300 text-blue-600 focus:ring-blue-500" />
                [필수] 예매 및 취소 수수료/취소기한을 확인하였으며 동의합니다.
              </label>
              <div class="ml-6 mt-3">
                <table class="w-full border border-slate-200 text-center text-xs text-slate-600">
                  <thead>
                    <tr class="border-b border-slate-200 bg-slate-50">
                      <th class="px-3 py-2 font-medium">취소일</th>
                      <th class="px-3 py-2 font-medium">취소수수료</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in cancelPolicy" :key="i" class="border-b border-slate-100 last:border-0">
                      <td class="px-3 py-2">{{ row.period }}</td>
                      <td class="px-3 py-2">{{ row.fee }}</td>
                    </tr>
                  </tbody>
                </table>
                <div class="mt-2 space-y-1 text-xs text-slate-500">
                  <p>- 예매 당일 취소할 경우에는 예매수수료 및 취소수수료 환불이 가능합니다. (취소수수료는 취소 기한 내에 한함)</p>
                  <p>- 취소수수료는 예매내역에 표기된 예매일 기준으로 부과됩니다. (경로:마이티켓&gt;예매내역&gt;예매상세)</p>
                </div>
              </div>
            </div>

            <div class="border-b border-slate-100 py-4">
              <label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input v-model="agreements.kakaoFinance" type="checkbox"
                  class="h-4 w-4 shrink-0 border-slate-300 text-blue-600 focus:ring-blue-500" />
                [필수] 카카오 전자금융 이용약관 동의
                <button type="button"
                  class="ml-1 rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50">상세보기</button>
              </label>
            </div>

            <div class="border-b border-slate-100 py-4">
              <label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input v-model="agreements.privacy" type="checkbox"
                  class="h-4 w-4 shrink-0 border-slate-300 text-blue-600 focus:ring-blue-500" />
                [필수] 개인정보 수집/이용에 동의합니다.
                <button type="button"
                  class="ml-1 rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50">상세보기</button>
              </label>
            </div>

            <div class="pt-4">
              <label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input v-model="agreements.thirdParty" type="checkbox"
                  class="h-4 w-4 shrink-0 border-slate-300 text-blue-600 focus:ring-blue-500" />
                [필수] 개인정보 제3자 제공 동의 및 주의사항
                <button type="button"
                  class="ml-1 rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50">상세보기</button>
              </label>
            </div>
          </div>
        </UiCard>
      </div>

      <div class="md:col-span-1" v-if="order">
        <div class="sticky top-24">
          <UiCard class="shadow-md border-slate-200">
            <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Receipt class="h-5 w-5 text-slate-500" />
              <span class="text-base font-semibold text-slate-800">결제 정보</span>
            </div>

            <div class="space-y-3 p-2 text-sm text-slate-600">
              <div class="flex justify-between">
                <span>티켓금액</span>
                <span class="font-medium text-slate-800">{{ parseInt(order.amount).toLocaleString() }}원</span>
              </div>
              <div class="flex justify-between">
                <span>예매수수료</span>
                <span class="font-medium text-slate-800">{{ (2000 * order.seatDetails.length).toLocaleString()
                }}원</span>
              </div>
            </div>

            <div class="my-4 border-t border-slate-100"></div>

            <div class="mb-6 flex items-end justify-between p-2">
              <span class="font-bold text-slate-800">최종 결제금액</span>
              <span class="text-2xl font-bold text-blue-600">
                {{ (parseInt(order.amount) + 2000 * order.seatDetails.length).toLocaleString() }}원
              </span>
            </div>

            <UiButton class="h-14 w-full bg-blue-600 text-base font-bold text-white hover:bg-blue-700"
              @click="handlePayment">
              {{ (parseInt(order.amount) + 2000 * order.seatDetails.length).toLocaleString() }}원 결제하기
            </UiButton>
          </UiCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Clock, Ticket, User, CreditCard, Receipt } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'    // 경로 확인 필요
import UiButton from '../../components/common/UiButton.vue' // 경로 확인 필요
import PortOne from '@portone/browser-sdk/v2'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'PaymentView',
  components: {
    Clock,
    Ticket,
    User,
    CreditCard,
    Receipt,
    UiCard,
    UiButton
  },
  data() {
    return {
      //1
      api: null,
      timer: true,
      timerText: "08:52",
      payMethod: "CARD",
      agreements: {
        cancelFee: false,
        kakaoFinance: false,
        privacy: false,
        thirdParty: false
      },
      buyer: {
        name: "김진경",
        birth: "2000-01-25",
        email: "example@gmail.com",
        phone: "010-1234-5678"
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
      return Object.values(this.agreements).every(v => v)
    },
    orderId() {
      return String(this.$route.query.orderId || '')
    }
  },
  created() {
    this.api = useApi();
  },
  async mounted() {
    try {
      const result = await this.api.get(ENDPOINTS.order(this.orderId));
      // const result = await axios.get("http://localhost:8082/order/1");
      this.order = result;
    } catch (error) {
      console.error("주문 정보를 불러오는데 실패했습니다.", error);
    }
  },
  methods: {
    toggleAllAgreed(e) {
      const checked = e.target.checked
      Object.keys(this.agreements).forEach(key => {
        this.agreements[key] = checked
      })
    },
    async handlePayment() {
      if (!this.allAgreed) {
        alert('모든 필수 항목에 동의해주세요.')
        return
      }

      if (!this.payMethod) {
        alert('결제 수단을 선택해주세요!');
        return;
      }

      if (!this.order) {
        alert('주문 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      if (this.payMethod === 'CARD') {
        console.log('신용카드, 간편결제 로직 실행');
        let seatDefNames = "";
        for (let i = 0; i < this.order.seatDetails.length; i++) {
          seatDefNames += this.order.seatDetails[i].seatDefName + "\n";
        }
        try {
          if (this.order.status !== 'PENDING') {
            alert('이미 처리된 주문입니다.');
            return;
          }
          const response = await PortOne.requestPayment({
            storeId: "store-6ac42987-375b-44fc-bbc9-d9650b676666",
            channelKey: "channel-key-cec20f2e-a187-41b7-9956-308d32850cc3",
            paymentId: `payment-${crypto.randomUUID()}`,
            orderName: this.order.scheduleDate + "\n"
              + this.order.concertName + "\n"
              + seatDefNames,
            totalAmount: parseInt(this.order.amount) + 2000 * this.order.seatDetails.length,
            // totalAmount: Number(this.order.amount) + 2000 * this.order.seatDetails.length,
            currency: "CURRENCY_KRW",
            payMethod: "CARD",
          });
          if (response.code !== undefined) {
            return alert(response.message);
          }
          const verificationResult = await this.api.post(ENDPOINTS.payment(), {
            // const verificationResult = await axios.post("http://localhost:8082/payment", {
            orderId: this.orderId,
            paymentId: response.paymentId,
          });
          console.log('결제 검증 완료', verificationResult);
          localStorage.setItem('orderData', JSON.stringify({
            order: this.order,
            payMethod: this.payMethod
          }))
          //결제완료화면으로 이동
          this.$router.push("/orderComplete");
        } catch (error) {
          console.error('결제 중 오류 발생:', error);
          alert('결제 처리 중 오류가 발생했습니다.');
        }
      } else if (this.payMethod === 'VIRTUAL_ACCOUNT') {
        console.log('무통장 입금 로직 실행');
         localStorage.setItem('orderData', JSON.stringify({
            order: this.order,
            payMethod: this.payMethod
          }))
        this.$router.push("/orderComplete");
      } else {
        console.log('기타 결제 방식');
      }
    }
  }
}
</script>

<style scoped>
/* Tailwind를 사용하므로 추가적인 CSS 작성을 최소화했습니다. */
/* input 등의 폼 요소는 tailwindcss/forms 플러그인이 있으면 더 예쁘게 렌더링 됩니다. */
</style>