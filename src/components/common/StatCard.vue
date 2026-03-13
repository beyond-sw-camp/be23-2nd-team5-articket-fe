<template>
  <div
    class="rounded-2xl border border-slate-200 bg-white shadow-sm"
    :class="[
      compact ? 'px-4 py-2.5' : 'p-4',
      fill ? 'flex flex-col justify-center flex-1' : ''
    ]"
  >
    <div class="text-xs font-semibold text-slate-500">{{ label }}</div>
    <div
      class="font-semibold text-slate-900"
      :class="compact ? 'mt-0.5 text-lg' : 'mt-1 text-xl'"
    >{{ value }}</div>
    <div v-if="hint" class="text-xs text-slate-500" :class="compact ? 'mt-0.5' : 'mt-1'">{{ hint }}</div>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    label: { type: String, default: '' },
    value: { type: String, default: '' },
    hint: { type: String, default: '' },
    compact: { type: Boolean, default: false },
    fill: { type: Boolean, default: false }
  }
}
</script>

