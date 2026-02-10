<script setup>
import UiBadge from '../common/UiBadge.vue'
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
    <div class="text-xs font-semibold text-slate-500">Legend</div>
    <div class="ml-2 flex items-center gap-2">
      <span class="h-3 w-3 rounded border border-emerald-200 bg-emerald-200"></span>
      <UiBadge tone="soft" color="green">AVAILABLE</UiBadge>
    </div>
    <div class="flex items-center gap-2">
      <span class="h-3 w-3 rounded border border-amber-200 bg-amber-200"></span>
      <UiBadge tone="soft" color="amber">HOLD</UiBadge>
    </div>
    <div class="flex items-center gap-2">
      <span class="h-3 w-3 rounded border border-slate-300 bg-slate-300"></span>
      <UiBadge tone="soft" color="slate">SOLD</UiBadge>
    </div>
    <div class="ml-auto text-xs text-slate-500">클릭해서 선택(AVAILABLE만)</div>
  </div>
</template>

