<script setup>
defineProps({
  as: { type: String, default: 'div' },
  padded: { type: Boolean, default: true },
})
</script>

<template>
  <component
    :is="as"
    class="rounded-2xl border border-slate-200 bg-white shadow-sm"
    :class="padded ? 'p-4 sm:p-5' : ''"
  >
    <slot />
  </component>
</template>

