<template>
  <div class="notif-panel-root relative flex h-10 items-center">
    <button
      type="button"
      class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      @click="togglePanel"
    >
      <Bell class="h-5 w-5" />
      <span
        v-if="unreadCount > 0"
        class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
      >{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>
    <div
      v-show="panelOpen"
      class="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl"
    >
      <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <span class="text-sm font-semibold text-slate-900">알림</span>
        <button
          v-if="sseState?.notifications?.length"
          type="button"
          class="text-xs text-slate-400 hover:text-slate-600"
          @click="markAllRead"
        >모두 읽음</button>
      </div>
      <div class="max-h-72 overflow-y-auto">
        <div
          v-if="!sseState?.notifications?.length"
          class="py-8 text-center text-sm text-slate-400"
        >
          알림이 없습니다.
        </div>
        <ul v-else class="divide-y divide-slate-100">
          <li
            v-for="n in sseState.notifications"
            :key="n.id"
            class="flex items-start gap-3 px-4 py-3 cursor-pointer"
            :class="notifItemClass(n)"
            @click="handleClick(n)"
          >
            <span class="mt-0.5 text-base">{{ notifIcon(n.eventName) }}</span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <div class="text-xs font-semibold" :class="notifTitleClass(n)">
                  {{ notifTitle(n.eventName, n.type) }}
                </div>
                <span v-if="n.time" class="text-[10px] text-slate-400">
                  {{ formatTime(n.time) }}
                </span>
              </div>
              <div class="mt-0.5 text-sm text-slate-700">
                {{ n.message }}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { Bell } from 'lucide-vue-next'
import { useSSE } from '../../composables/useSSE'

export default {
  name: 'NotificationPanel',
  components: { Bell },
  data() {
    return {
      panelOpen: false,
      _sse: null,
    }
  },
  computed: {
    sseState() {
      return this._sse?.state ?? null
    },
    unreadCount() {
      return this.sseState?.notifications?.filter((n) => !n.read).length ?? 0
    },
  },
  mounted() {
    this._sse = useSSE()
    window.addEventListener('click', this.onClickOutside)
  },
  beforeUnmount() {
    window.removeEventListener('click', this.onClickOutside)
  },
  methods: {
    togglePanel() {
      this.panelOpen = !this.panelOpen
      if (this.panelOpen) this._sse?.markAllRead()
    },
    markAllRead() {
      this._sse?.markAllRead()
    },
    onClickOutside(e) {
      if (this.panelOpen && !e.target.closest('.notif-panel-root')) {
        this.panelOpen = false
      }
    },
    notifIcon(eventName) {
      if (eventName === 'payment') return '💳'
      if (eventName === 'concert') return '🎭'
      if (eventName === 'admin') return '🔔'
      return '📢'
    },
    notifItemClass(n) {
      const base = n.read ? 'opacity-60' : ''
      // 중요 알림 타입에 약간 강조 배경
      const t = n.type
      if (t === 'HOLD_EXPIRING_SOON' || t === 'SCHEDULE_CANCELED') {
        return [base, 'bg-red-50']
      }
      if (t === 'PAYMENT_SUCCESS' || t === 'REFUND_SUCCESS') {
        return [base, 'bg-green-50']
      }
      if (t === 'ORGANIZER_APPROVED' || t === 'ORGANIZER_REQUEST') {
        return [base, 'bg-amber-50']
      }
      return base
    },
    notifTitleClass(n) {
      const { eventName, type } = n
      if (type === 'HOLD_EXPIRING_SOON' || type === 'SCHEDULE_CANCELED') return 'text-red-700'
      if (type === 'PAYMENT_SUCCESS' || type === 'REFUND_SUCCESS') return 'text-green-700'
      if (type === 'ORGANIZER_APPROVED' || type === 'ORGANIZER_REQUEST') return 'text-amber-700'
      if (eventName === 'payment') return 'text-green-700'
      if (eventName === 'concert') return 'text-red-700'
      if (eventName === 'admin') return 'text-amber-700'
      return 'text-slate-500'
    },
    notifTitle(eventName, type) {
      if (type === 'PAYMENT_SUCCESS') return '결제 완료'
      if (type === 'REFUND_SUCCESS') return '환불 완료'
      if (type === 'NEW_ORDER') return '새 주문 발생'
      if (type === 'HIGH_VALUE_ORDER') return '고액 주문 알림'
      if (type === 'ORDER_REFUNDED') return '주문 환불 알림'

      if (type === 'HOLD_SUCCESS') return '좌석 선점 완료'
      if (type === 'HOLD_EXPIRING_SOON') return '선점 좌석 만료 임박'
      if (type === 'HOLD_EXPIRED') return '선점 좌석 만료'
      if (type === 'CONCERT_UPDATED') return '공연 정보 변경'
      if (type === 'SCHEDULE_UPDATED') return '공연 회차 변경'
      if (type === 'SCHEDULE_CANCELED') return '공연 회차 취소'
      if (type === 'REVIEW_INVITATION') return '관람 후기 요청'

      if (type === 'ORGANIZER_REQUEST') return '주최자 승인 요청'
      if (type === 'ORGANIZER_APPROVED') return '주최자 승인 완료'
      if (type === 'ORGANIZER_REJECTED') return '주최자 승인 반려'

      if (eventName === 'payment') return '결제 알림'
      if (eventName === 'concert') return '공연 알림'
      if (eventName === 'admin') return '관리자 알림'
      return '알림'
    },
    handleClick(n) {
      // linkUrl이 있으면 해당 경로로 이동
      if (n.linkUrl) {
        try {
          this.$router.push(n.linkUrl)
        } catch (_) {}
      }
      // 클릭 시 읽음 처리
      n.read = true
    },
    formatTime(time) {
      try {
        const d = time instanceof Date ? time : new Date(time)
        if (Number.isNaN(d.getTime())) return ''
        const now = new Date()
        const diffMs = now - d
        const diffSec = Math.floor(diffMs / 1000)
        const diffMin = Math.floor(diffSec / 60)
        const diffHour = Math.floor(diffMin / 60)
        if (diffSec < 60) return '방금 전'
        if (diffMin < 60) return `${diffMin}분 전`
        if (diffHour < 24) return `${diffHour}시간 전`
        return d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
      } catch {
        return ''
      }
    },
  },
}
</script>
