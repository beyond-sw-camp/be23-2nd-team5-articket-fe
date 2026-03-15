<template>
  <component :is="as" class="mgmt-section-title">
    <slot />
  </component>
</template>

<script>
export default {
  name: 'SectionTitle',
  props: {
    as: { type: String, default: 'h2' }
  }
}
</script>
