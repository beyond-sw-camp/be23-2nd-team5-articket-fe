<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex items-center justify-between">
      <div class="text-sm font-semibold text-slate-900">진행 단계</div>
      <div class="text-xs font-semibold text-slate-500">{{ active + 1 }} / {{ steps.length }}</div>
    </div>

    <div class="mt-3 h-2 w-full overflow-hidden rounded-xl bg-slate-100">
      <div class="h-full bg-red-600" :style="{ width: pct }"></div>
    </div>

    <div class="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
      <div
        v-for="(s, idx) in steps"
        :key="s.key || idx"
        class="rounded-xl border px-3 py-2 text-xs font-semibold"
        :class="
          idx === active
            ? 'border-red-200 bg-red-50 text-red-700'
            : idx < active
              ? 'border-slate-200 bg-slate-50 text-slate-700'
              : 'border-slate-200 bg-white text-slate-500'
        "
      >
        {{ s.label || s }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StepIndicator',
  props: {
    steps: { type: Array, default: () => [] },
    active: { type: Number, default: 0 }
  },
  computed: {
    pct() {
      const total = Math.max(1, this.steps.length - 1)
      return `${Math.round((this.active / total) * 100)}%`
    }
  }
}
</script>

