<script setup>
import { Info } from 'lucide-vue-next'

defineProps({
  title: { type: String, default: '비어있어요' },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
    <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
      <Info class="h-5 w-5 text-slate-600" />
    </div>
    <div class="mt-3 text-sm font-semibold text-slate-900">{{ title }}</div>
    <div v-if="description" class="mt-1 text-sm text-slate-500">{{ description }}</div>
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>

