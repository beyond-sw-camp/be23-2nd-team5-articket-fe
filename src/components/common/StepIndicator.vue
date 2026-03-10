<template>
  <div class="relative flex items-center justify-between px-2">
    <!-- Connecting Line -->
    <div class="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-slate-100"></div>
    <div
      class="absolute left-0 top-1/2 h-0.5 bg-red-600 transition-all duration-500 -translate-y-1/2"
      :style="{ width: pct }"
    ></div>

    <!-- Steps -->
    <div
      v-for="(s, idx) in steps"
      :key="s.key || idx"
      class="relative flex flex-col items-center gap-2"
    >
      <div
        class="z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 shadow-sm"
        :class="
          idx === active
            ? 'border-red-600 bg-white text-red-600 ring-4 ring-red-50'
            : idx < active
              ? 'border-red-600 bg-red-600 text-white'
              : 'border-slate-200 bg-white text-slate-400'
        "
      >
        <Check v-if="idx < active" class="h-4 w-4" />
        <span v-else>{{ idx + 1 }}</span>
      </div>
      <div
        class="absolute -bottom-7 whitespace-nowrap text-xs font-semibold transition-colors duration-300"
        :class="idx <= active ? 'text-slate-900' : 'text-slate-400'"
      >
        {{ s.label || s }}
      </div>
    </div>
  </div>
</template>

<script>
import { Check } from 'lucide-vue-next'

export default {
  name: 'StepIndicator',
  components: { Check },
  props: {
    steps: { type: Array, default: () => [] },
    active: { type: Number, default: 0 }
  },
  computed: {
    pct() {
      if (this.steps.length <= 1) return '0%'
      return `${(this.active / (this.steps.length - 1)) * 100}%`
    }
  }
}
</script>

<style scoped>
/* No extra styles needed beyond Tailwind */
</style>
