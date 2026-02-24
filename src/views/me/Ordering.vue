<template>
  <div class="relative mx-auto max-w-5xl p-4 py-10 md:p-8">
    <div v-if="timer"
      class="fixed right-8 top-24.5 z-[100000] flex items-center gap-2 rounded-xl border-2 border-red-500 bg-white px-4 py-2 text-lg font-bold text-red-600 shadow-lg">
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
          <div class="p-2">
            <div class="mb-1 text-lg font-bold text-slate-900" v-if="order">{{ order.concertName }}</div>
            <div class="mb-4 text-sm text-slate-500" v-if="order">{{ order.scheduleDate }} | 블루스퀘어 신한카드홀</div>

            <div v-if="order" class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div v-for="(seat, index) in order.seatDetails" :key="index">
                <div class="py-2 flex justify-between items-center">
                  <div class="font-bold text-slate-900">{{ seat.seatDefName }} 1매</div>
                  <div class="font-medium text-slate-700">{{ parseInt(seat.price).toLocaleString() }}원</div>
                </div>
                <div v-if="index < order.seatDetails.length - 1" class="border-t border-slate-200"></div>
              </div>
            </div>
          </div>
        </UiCard>

        <UiCard>
          <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User class="h-5 w-5 text-slate-500" />
            <span class="text-base font-semibold text-slate-800">예매자 정보</span>
            <span class="text-red-500">*</span>
          </div>
          <div class="grid grid-cols-1 gap-4 p-2 sm:grid-cols-4 sm:items-center">
            <label class="text-sm font-medium text-slate-600 sm:col-span-1">예매자</label>
            <div class="sm:col-span-3">
              <input v-model="buyer.name" type="text"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>

            <label class="text-sm font-medium text-slate-600 sm:col-span-1">생년월일</label>
            <div class="sm:col-span-3">
              <input v-model="buyer.birth" type="text" placeholder="YYYY-MM-DD"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>

            <label class="text-sm font-medium text-slate-600 sm:col-span-1">이메일</label>
            <div class="sm:col-span-3">
              <input v-model="buyer.email" type="email"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>

            <label class="text-sm font-medium text-slate-600 sm:col-span-1">휴대폰</label>
            <div class="sm:col-span-3">
              <input v-model="buyer.phone" type="tel"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
        </UiCard>

        <UiCard>
          <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard class="h-5 w-5 text-slate-500" />
            <span class="text-base font-semibold text-slate-800">결제수단</span>
          </div>
          <div class="flex flex-wrap gap-6 p-2">
            <label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
              <input v-model="payMethod" type="radio" value="CARD"
                class="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500" />
              신용카드, 간편결제
            </label>
            <label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
              <input v-model="payMethod" type="radio" value="VIRTUAL_ACCOUNT"
                class="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500" />
              무통장입금
            </label>
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
      buyer: {
        name: "김진경",
        birth: "2000-01-25",
        email: "example@gmail.com",
        phone: "010-1234-5678"
      },
      order: null
    }
  },
  created() {
    this.api = useApi();
  },
  async mounted() {
    try {
      const result = await this.api.get(ENDPOINTS.order(1));
      // const result = await axios.get("http://localhost:8082/order/1");
      console.log(result);
      this.order = result;
    } catch (error) {
      console.error("주문 정보를 불러오는데 실패했습니다.", error);
    }
  },
  methods: {
    async handlePayment() {
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
          const response = await PortOne.requestPayment({
            storeId: "store-6ac42987-375b-44fc-bbc9-d9650b676666",
            channelKey: "channel-key-cec20f2e-a187-41b7-9956-308d32850cc3",
            paymentId: this.order.uuid,
            orderName: this.order.scheduleDate + "\n"
              + this.order.concertName + "\n"
              + seatDefNames,
            totalAmount: Number(this.order.amount) + 2000 * this.order.seatDetails.length,
            currency: "CURRENCY_KRW",
            payMethod: "CARD",
          });

          if (response.code !== undefined) {
            return alert(response.message);
          }
          const verificationResult = await this.api.get(ENDPOINTS.payment(), {

            // const verificationResult = await axios.post("http://localhost:8082/payment", {
            paymentId: response.paymentId,
          });
          console.log('결제 검증 완료', verificationResult);
          // 결제 완료 후 라우팅 로직 추가 필요 ($router.push('/success') 등)

        } catch (error) {
          console.error('결제 중 오류 발생:', error);
          alert('결제 처리 중 오류가 발생했습니다.');
        }
      } else if (this.payMethod === 'VIRTUAL_ACCOUNT') {
        console.log('무통장 입금 로직 실행');
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