<script setup>
defineProps({
  modelValue: { type: String, required: true },
  tabs: { type: Array, default: () => [] }, // [{key,label}]
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
    <button
      v-for="t in tabs"
      :key="t.key"
      type="button"
      class="whitespace-nowrap rounded-2xl border px-3 py-2 text-sm font-semibold transition"
      :class="
        modelValue === t.key
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
      "
      @click="emit('update:modelValue', t.key)"
    >
      {{ t.label }}
    </button>
  </div>
</template>

