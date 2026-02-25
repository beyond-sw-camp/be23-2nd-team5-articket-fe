<template>
  <div class="fixed right-4 top-20 z-[9998] flex flex-col gap-2 w-96 max-h-[50vh] overflow-hidden">
    <transition-group name="error-toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-lg"
      >
        <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle class="h-5 w-5" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-semibold text-red-800">{{ t.message }}</div>
          <div v-if="t.code" class="mt-0.5 text-xs text-red-600">{{ t.code }}</div>
          <ul v-if="t.details?.length" class="mt-1.5 space-y-0.5 text-xs text-red-700">
            <li v-for="(d, i) in t.details" :key="i">
              {{ formatDetail(d) }}
            </li>
          </ul>
        </div>
        <button
          type="button"
          class="shrink-0 rounded p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
          aria-label="닫기"
          @click="dismiss(t.id)"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { AlertCircle, X } from 'lucide-vue-next'
import { useErrorToast } from '../../composables/useErrorToast'

export default {
  name: 'ErrorToast',
  components: { AlertCircle, X },
  setup() {
    const { toasts, dismiss } = useErrorToast()
    return { toasts, dismiss }
  },
  methods: {
    formatDetail(d) {
      if (typeof d === 'string') return d
      if (d?.field && d?.reason) return `${d.field}: ${d.reason}`
      if (d?.reason) return d.reason
      return JSON.stringify(d)
    }
  }
}
</script>

<style scoped>
.error-toast-enter-active,
.error-toast-leave-active {
  transition: all 0.3s ease;
}
.error-toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.error-toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
