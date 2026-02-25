<template>
  <Teleport to="body">
    <div v-if="state.open" class="fixed inset-0 z-[9999]">
      <div class="absolute inset-0 bg-black/40" @click="close"></div>
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div
          class="flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-lg"
          role="alertdialog"
          aria-labelledby="error-title"
          aria-describedby="error-message"
        >
          <div class="px-5 py-5">
            <div id="error-title" class="text-sm font-semibold text-slate-800">오류</div>
            <div id="error-message" class="mt-1.5 text-sm text-slate-600">{{ state.message }}</div>
            <div v-if="state.code || (state.details && state.details.length)" class="mt-3 max-h-40 overflow-y-auto">
              <div v-if="state.code" class="text-xs text-slate-400">{{ state.code }}</div>
              <ul v-if="state.details?.length" class="mt-1.5 space-y-1 text-xs text-slate-500">
                <li v-for="(d, i) in state.details" :key="i">
                  {{ formatDetail(d) }}
                </li>
              </ul>
            </div>
          </div>
          <div class="border-t border-slate-200 px-5 py-3">
            <button
              type="button"
              class="w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
              @click="close"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { useErrorAlert } from '../../composables/useErrorToast'

export default {
  name: 'ErrorAlertModal',
  setup() {
    const { state, close } = useErrorAlert()
    return { state, close }
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
