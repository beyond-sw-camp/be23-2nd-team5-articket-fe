<template>
  <component :is="as" :class="cls" :disabled="disabled">
    <slot />
  </component>
</template>

<script>
export default {
  name: 'UiButton',
  props: {
    variant: { type: String, default: 'primary' }, // primary | ghost | subtle
    as: { type: String, default: 'button' },
    disabled: { type: Boolean, default: false }
  },
  computed: {
    cls() {
      const base =
        'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60'
      const map = {
        primary: 'bg-red-600 text-white hover:bg-red-700',
        ghost: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
        subtle: 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }
      return `${base} ${map[this.variant] || map.primary}`
    }
  }
}
</script>

