<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="text-xs font-semibold text-slate-500">{{ label }}</div>
    <div class="mt-1 text-xl font-semibold text-slate-900">{{ value }}</div>
    <div v-if="hint" class="mt-1 text-xs text-slate-500">{{ hint }}</div>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    label: { type: String, default: '' },
    value: { type: String, default: '' },
    hint: { type: String, default: '' }
  }
}
</script>

