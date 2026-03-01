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
        <div v-if="!sseState?.notifications?.length" class="py-8 text-center text-sm text-slate-400">알림이 없습니다.</div>
        <ul v-else class="divide-y divide-slate-100">
          <li
            v-for="n in sseState.notifications"
            :key="n.id"
            class="flex items-start gap-3 px-4 py-3"
            :class="n.read ? 'opacity-60' : 'bg-slate-50'"
          >
            <span class="mt-0.5 text-base">{{ notifIcon(n.eventName) }}</span>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-semibold text-slate-500">{{ notifTitle(n.eventName) }}</div>
              <div class="mt-0.5 text-sm text-slate-700">{{ n.message }}</div>
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
    notifTitle(eventName) {
      if (eventName === 'payment') return '결제 알림'
      if (eventName === 'concert') return '공연 알림'
      if (eventName === 'admin') return '관리자 알림'
      return '알림'
    },
  },
}
</script>
