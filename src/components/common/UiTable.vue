<script setup>
defineProps({
  columns: { type: Array, default: () => [] }, // [{key,label,align}]
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
})
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <table class="w-full text-left text-sm">
      <thead class="bg-slate-50 text-xs font-semibold text-slate-600">
        <tr>
          <th v-for="c in columns" :key="c.key" class="px-4 py-3" :class="c.align ? `text-${c.align}` : ''">
            {{ c.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200">
        <tr v-for="r in rows" :key="r[rowKey]" class="hover:bg-slate-50">
          <td v-for="c in columns" :key="c.key" class="px-4 py-3 text-slate-700">
            <slot :name="`cell:${c.key}`" :row="r">
              {{ r[c.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="rows.length === 0" class="px-4 py-8 text-center text-sm text-slate-500">표시할 데이터가 없습니다.</div>
  </div>
</template>

