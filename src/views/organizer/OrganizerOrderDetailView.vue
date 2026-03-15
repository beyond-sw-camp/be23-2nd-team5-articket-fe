<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중...</div>
    </UiCard>

    <UiCard v-else-if="!item">
      <div class="text-sm text-slate-500">주문 정보를 불러오지 못했습니다.</div>
      <UiButton class="mt-3" @click="load">다시 시도</UiButton>
    </UiCard>

    <UiCard v-else>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="mgmt-page-title">주문 상세 (ORGANIZER)</div>
          <div class="mgmt-page-subtitle">{{ item.id }}</div>
        </div>
        <UiBadge :tone="item.status === 'SUCCESS' || item.status === 'PAID' ? 'solid' : 'soft'" :color="item.status === 'SUCCESS' || item.status === 'PAID' ? 'green' : 'slate'">
          {{ item.status }}
        </UiBadge>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">생성일</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">
            {{ formatDateTime(item.createdAt) }}
          </div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">금액</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">
            {{ formatWon(item.amount) }}
          </div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:col-span-2">
          <div class="text-xs font-semibold text-slate-500">좌석</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">
            {{ formatSeats(item.seatDetails) }}
          </div>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <UiButton variant="ghost" class="h-11 px-4" @click="goBackToList">이전 화면</UiButton>

        <!-- 현재 주문의 회차/좌석을 좌석 인사이트 화면에서 강조 표시 -->
        <UiButton variant="ghost" class="h-11 px-4" @click="openSeatMap">
          좌석맵 보기
        </UiButton>

        <UiButton class="h-11 px-5" @click="goToConcertOrders">
          공연 주문 목록
        </UiButton>
      </div>
    </UiCard>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { showErrorAlert } from '../../composables/useErrorToast'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'OrganizerOrderDetailView',
  components: {
    UiCard,
    UiBadge,
    UiButton
  },
  data() {
    return {
      loading: false,
      item: null,
      api: null
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      const orderId = this.$route.params.orderId
      if (orderId == null || orderId === '') {
        showErrorAlert(new Error('주문 정보를 찾을 수 없습니다.'))
        this.loading = false
        return
      }
      this.loading = true
      try {
        this.item = await this.api.get(ENDPOINTS.organizerOrder(orderId))
      } catch (e) {
        this.item = null
      } finally {
        this.loading = false
      }
    },
    goBackToList() {
      if (window.history.length > 1) {
        this.$router.back()
        return
      }
      this.goToConcertOrders()
    },
    goToConcertOrders() {
      if (!this.item?.concertId) {
        this.$router.push('/organizer/reports')
        return
      }
      this.$router.push(`/organizer/concerts/${this.item.concertId}/orders`)
    },
    openSeatMap() {
      // 공연/회차/주문 정보가 있어야 좌석맵 상세 진입 가능
      if (!this.item?.concertId || !this.item?.scheduleId || !this.item?.id) return

      this.$router.push({
        path: '/organizer/seat-insights',
        query: {
          concertId: String(this.item.concertId),
          scheduleId: String(this.item.scheduleId),
          orderId: String(this.item.id)
        }
      })
    },
    formatDateTime(value) {
      if (!value) return '-'
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return value
      return date.toLocaleString()
    },
    formatWon(value) {
      return `${Number(value || 0).toLocaleString()}원`
    },
    formatSeats(seatDetails) {
      const seats = (seatDetails || []).map((seat) => seat.seatDefName).filter(Boolean)
      return seats.length ? seats.join(', ') : '-'
    }
  }
}
</script>
