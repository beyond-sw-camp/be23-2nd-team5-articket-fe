<template>
  <div class="grid gap-4">
    <div class="flex items-center gap-3">
      <UiButton variant="ghost" class="h-9 px-3" @click="$router.push('/admin/users')">← 목록</UiButton>
      <div>
        <h1 class="mgmt-page-title">회원 주문내역</h1>
        <p class="mgmt-page-subtitle">회원 ID: {{ userId }}</p>
      </div>
    </div>

    <!-- 기간 필터 -->
    <div class="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-4">
      <button
        v-for="f in filters"
        :key="f"
        :class="[
          'h-9 rounded-xl border px-4 text-sm font-medium transition-colors',
          activeFilter === f
            ? 'border-red-500 bg-red-500 text-white'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
        ]"
        @click="activeFilter = f"
      >
        {{ f }}
      </button>
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      불러오는 중…
    </div>

    <div v-else-if="orders.length === 0" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      주문 내역이 없습니다.
    </div>

    <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table class="w-full text-sm">
        <thead class="border-b border-slate-100 bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">예매일/예매번호</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">상품정보</th>
            <th class="px-4 py-3 text-center font-semibold text-slate-600">관람인원</th>
            <th class="px-4 py-3 text-center font-semibold text-slate-600">금액</th>
            <th class="px-4 py-3 text-center font-semibold text-slate-600">진행상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.bookingNumber" class="border-b border-slate-100 last:border-0">
            <td class="px-4 py-4 align-top">
              <div class="text-slate-700">{{ order.bookingDate }}</div>
              <div class="mt-1 font-bold text-blue-600">{{ order.bookingNumber }}</div>
            </td>
            <td class="px-4 py-4">
              <div class="flex items-center gap-3">
                <img :src="order.posterUrl" alt="포스터" class="h-16 w-12 rounded object-cover bg-slate-200" />
                <div>
                  <div class="font-bold text-slate-900">{{ order.title }}</div>
                  <div class="mt-1 text-xs text-slate-500">관람일시: {{ order.viewDate }}</div>
                  <div class="text-xs text-slate-500">장소: {{ order.location }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-4 text-center text-slate-700">{{ order.ticketCount }}매</td>
            <td class="px-4 py-4 text-center font-medium text-slate-900">{{ Number(order.amount).toLocaleString() }}원</td>
            <td class="px-4 py-4 text-center">
              <UiBadge
                :tone="order.status === '예매완료' ? 'soft' : 'outline'"
                :color="order.status === '예매완료' ? 'blue' : 'slate'"
              >
                {{ order.status }}
              </UiBadge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

const STATUS_MAP = {
  PAID: '예매완료',
  PENDING: '결제대기',
  CANCELLED: '취소완료',
  CANCELED: '취소완료'
}

const PERIOD_MAP = {
  '전체': null,
  '1개월': 1,
  '3개월': 3,
  '6개월': 6
}

function formatDateTime(isoStr) {
  if (!isoStr) return '-'
  const dt = new Date(isoStr)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const d = String(dt.getDate()).padStart(2, '0')
  const h = String(dt.getHours()).padStart(2, '0')
  const min = String(dt.getMinutes()).padStart(2, '0')
  return `${y}.${m}.${d} ${h}:${min}`
}

export default {
  name: 'AdminUserOrdersView',
  components: { UiButton, UiBadge },
  data() {
    return {
      filters: ['전체', '1개월', '3개월', '6개월'],
      activeFilter: '전체',
      orders: [],
      loading: false,
      api: null
    }
  },
  computed: {
    userId() {
      return this.$route.params.userId
    },
    isOrganizer() {
      return this.$route.query.role === 'ORGANIZER'
    }
  },
  watch: {
    activeFilter() {
      this.loadOrders()
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.loadOrders()
  },
  methods: {
    async loadOrders() {
      this.loading = true
      try {
        const period = PERIOD_MAP[this.activeFilter]
        const res = await this.api.get(ENDPOINTS.adminUserOrders(this.userId, period))
        const list = res?.content || (Array.isArray(res) ? res : [])
        this.orders = list.map(order => ({
          bookingDate: order.createdAt?.slice(0, 10) ?? '-',
          bookingNumber: order.paymentId ? 'T' + order.paymentId.slice(-8) : '-',
          posterUrl: order.concertUrl,
          title: order.concertName || '-',
          viewDate: formatDateTime(order.scheduleDate),
          location: order.venueName || '-',
          ticketCount: order.seatDetails ? order.seatDetails.length : 0,
          amount: order.totalAmount || order.amount || 0,
          status: STATUS_MAP[order.status] || order.status || '-'
        }))
      } catch (e) {
        console.error('주문 내역 로드 실패', e)
        this.orders = []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
