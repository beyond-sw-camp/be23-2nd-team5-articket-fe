<template>
  <ErrorAlertModal />
  <RouterView />
</template>

<script>
import ErrorAlertModal from './components/common/ErrorAlertModal.vue'
export default {
  components: { ErrorAlertModal }
}
</script>
