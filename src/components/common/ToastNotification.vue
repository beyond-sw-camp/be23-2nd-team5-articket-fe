<template>
  <!-- Toast stack (화면 우측 하단, 아래부터 쌓임) -->
  <div class="fixed right-4 bottom-4 z-[9999] flex flex-col-reverse gap-2 w-80">
    <transition-group name="toast">
      <div
        v-for="toast in visibleToasts"
        :key="toast.id"
        class="flex items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-lg"
        :class="toastBorder(toast.eventName)"
      >
        <!-- Icon -->
        <div
          class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm"
          :class="toastIconBg(toast.eventName)"
        >
          {{ toastIcon(toast.eventName) }}
        </div>
        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="text-xs font-semibold" :class="toastLabel(toast.eventName)">
            {{ toastTitle(toast.eventName) }}
          </div>
          <div class="mt-0.5 text-sm text-slate-700 break-words">{{ toast.message }}</div>
        </div>
        <!-- Close -->
        <button
          type="button"
          class="shrink-0 text-slate-400 hover:text-slate-600"
          @click="dismiss(toast.id)"
        >×</button>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'ToastNotification',
  props: {
    notifications: { type: Array, default: () => [] },
  },
  data() {
    return {
      dismissed: new Set(),
      timers: {},
    }
  },
  computed: {
    visibleToasts() {
      return this.notifications
        .filter((n) => !this.dismissed.has(n.id))
        .slice(0, 5) // 최대 5개
    },
  },
  watch: {
    notifications(toasts) {
      // 새 알림이 추가되면 5초 뒤 자동 dismiss
      toasts.forEach((n) => {
        if (!this.timers[n.id] && !this.dismissed.has(n.id)) {
          this.timers[n.id] = setTimeout(() => this.dismiss(n.id), 5000)
        }
      })
    },
  },
  methods: {
    dismiss(id) {
      this.dismissed.add(id)
      clearTimeout(this.timers[id])
      delete this.timers[id]
    },
    toastBorder(eventName) {
      if (eventName === 'payment') return 'border-green-200'
      if (eventName === 'concert') return 'border-red-200'
      if (eventName === 'admin')   return 'border-amber-200'
      return 'border-slate-200'
    },
    toastIconBg(eventName) {
      if (eventName === 'payment') return 'bg-green-100'
      if (eventName === 'concert') return 'bg-red-100'
      if (eventName === 'admin')   return 'bg-amber-100'
      return 'bg-slate-100'
    },
    toastIcon(eventName) {
      if (eventName === 'payment') return '💳'
      if (eventName === 'concert') return '🎭'
      if (eventName === 'admin')   return '🔔'
      return '📢'
    },
    toastTitle(eventName) {
      if (eventName === 'payment') return '결제 알림'
      if (eventName === 'concert') return '공연 알림'
      if (eventName === 'admin')   return '관리자 알림'
      return '알림'
    },
    toastLabel(eventName) {
      if (eventName === 'payment') return 'text-green-700'
      if (eventName === 'concert') return 'text-red-700'
      if (eventName === 'admin')   return 'text-amber-700'
      return 'text-slate-700'
    },
  },
  beforeUnmount() {
    Object.values(this.timers).forEach(clearTimeout)
  },
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease;
}
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
