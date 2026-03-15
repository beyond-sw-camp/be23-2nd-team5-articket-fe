<template>
  <component :is="as" class="mgmt-page-title">
    <slot />
  </component>
</template>

<script>
export default {
  name: 'PageTitle',
  props: {
    as: { type: String, default: 'h1' }
  }
}
</script>
