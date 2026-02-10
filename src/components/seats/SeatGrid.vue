<script setup>
import { computed } from 'vue'
import { seatColorClass, SEAT_STATUS } from '../../mocks/seats'

const props = defineProps({
  seats: { type: Array, default: () => [] },
  selected: { type: Array, default: () => [] },
})
const emit = defineEmits(['toggle'])

const selectedSet = computed(() => new Set(props.selected))

function canPick(seat) {
  return seat.status === SEAT_STATUS.AVAILABLE
}

function onClick(seat) {
  if (!canPick(seat) && !selectedSet.value.has(seat.id)) return
  emit('toggle', seat.id)
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="grid grid-cols-10 gap-1 sm:grid-cols-12 md:grid-cols-14">
      <button
        v-for="s in seats"
        :key="s.id"
        type="button"
        class="h-7 w-7 rounded border text-[10px] font-semibold text-slate-700 transition"
        :class="[
          seatColorClass(s.status),
          selectedSet.has(s.id) ? 'ring-2 ring-red-300' : '',
          s.status === 'SOLD' ? 'cursor-not-allowed opacity-70' : 'hover:opacity-90',
        ]"
        @click="onClick(s)"
        :title="`${s.section}-${s.row}-${s.col} (${s.grade})`"
      >
        {{ s.section }}
      </button>
    </div>
  </div>
</template>

