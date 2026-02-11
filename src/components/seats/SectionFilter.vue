<template>
  <UiCard>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="text-sm font-semibold text-slate-900">필터</div>
      <div class="flex flex-wrap gap-2">
        <select
          class="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none"
          :value="section"
          @change="$emit('update:section', $event.target.value)"
        >
          <option value="">전체 구역</option>
          <option v-for="s in sections" :key="s" :value="s">{{ s }}</option>
        </select>
        <select
          class="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none"
          :value="grade"
          @change="$emit('update:grade', $event.target.value)"
        >
          <option value="">전체 등급</option>
          <option v-for="g in grades" :key="g" :value="g">{{ g }}</option>
        </select>
      </div>
    </div>
  </UiCard>
</template>

<script>
import UiCard from '../common/UiCard.vue'

export default {
  name: 'SectionFilter',
  components: {
    UiCard
  },
  props: {
    sections: { type: Array, default: () => [] },
    grades: { type: Array, default: () => [] },
    section: { type: String, default: '' },
    grade: { type: String, default: '' }
  },
  emits: ['update:section', 'update:grade']
}
</script>

