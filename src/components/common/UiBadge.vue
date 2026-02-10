<script setup>
import { computed } from 'vue'

const props = defineProps({
  tone: { type: String, default: 'soft' }, // soft | solid | outline
  color: { type: String, default: 'slate' }, // slate | red | green | amber | blue
})

const cls = computed(() => {
  const base = 'inline-flex items-center rounded-xl px-2 py-1 text-xs font-semibold'
  const palette = {
    slate: {
      soft: 'bg-slate-100 text-slate-700',
      solid: 'bg-slate-900 text-white',
      outline: 'border border-slate-200 text-slate-700',
    },
    red: {
      soft: 'bg-red-50 text-red-700',
      solid: 'bg-red-600 text-white',
      outline: 'border border-red-200 text-red-700',
    },
    green: {
      soft: 'bg-emerald-50 text-emerald-700',
      solid: 'bg-emerald-600 text-white',
      outline: 'border border-emerald-200 text-emerald-700',
    },
    amber: {
      soft: 'bg-amber-50 text-amber-800',
      solid: 'bg-amber-500 text-white',
      outline: 'border border-amber-200 text-amber-800',
    },
    blue: {
      soft: 'bg-blue-50 text-blue-700',
      solid: 'bg-blue-600 text-white',
      outline: 'border border-blue-200 text-blue-700',
    },
  }
  const p = palette[props.color] || palette.slate
  const variant = p[props.tone] || p.soft
  return `${base} ${variant}`
})
</script>

<template>
  <span :class="cls"><slot /></span>
</template>

