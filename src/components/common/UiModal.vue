<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[80]">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="$emit('close')"></div>
      <div class="absolute inset-0 flex items-end justify-center p-4 sm:items-center">
        <div class="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div class="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
            <div class="text-sm font-semibold text-slate-900">{{ title }}</div>
            <UiButton variant="ghost" class="h-9 px-3" @click="$emit('close')">
              <X class="h-4 w-4" />
            </UiButton>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <slot />
          </div>
          <div class="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-3">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { X } from 'lucide-vue-next'
import UiButton from './UiButton.vue'

export default {
  name: 'UiModal',
  components: {
    X,
    UiButton
  },
  props: {
    open: { type: Boolean, default: false },
    title: { type: String, default: '' }
  },
  emits: ['close']
}
</script>

