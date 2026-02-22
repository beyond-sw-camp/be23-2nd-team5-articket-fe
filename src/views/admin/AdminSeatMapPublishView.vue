<template>
  <UiCard>
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">좌석맵 게시/폐기</div>
        <div class="mt-1 text-sm text-slate-500">PATCH /seat-maps/admin/updateStatus/{{ seatMapId }}?status=...</div>
      </div>
      <UiBadge tone="soft">ADMIN</UiBadge>
    </div>

    <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div class="text-xs text-slate-500">대상 좌석맵 ID</div>
      <div class="mt-1 text-sm font-semibold text-slate-900">{{ seatMapId }}</div>
      <div class="mt-3 text-xs text-slate-500">
        현재 상태:
        <span class="font-semibold text-slate-700">{{ currentStatus || '-' }}</span>
      </div>
    </div>

    <p v-if="errorMessage" class="mt-3 text-sm text-red-600">{{ errorMessage }}</p>
    <p v-if="successMessage" class="mt-3 text-sm text-green-600">{{ successMessage }}</p>

    <div class="mt-4 flex flex-wrap gap-2">
      <UiButton variant="ghost" class="h-11 px-4" @click="$router.back()">뒤로</UiButton>
      <UiButton class="h-11 px-4" :disabled="loading" @click="updateStatus('DRAFT')">DRAFT</UiButton>
      <UiButton class="h-11 px-4" :disabled="loading" @click="updateStatus('PUBLISHED')">PUBLISHED</UiButton>
      <UiButton class="h-11 px-4" :disabled="loading" @click="updateStatus('ARCHIVED')">ARCHIVED</UiButton>
    </div>
  </UiCard>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'AdminSeatMapPublishView',
  components: {
    UiCard,
    UiBadge,
    UiButton
  },
  data() {
    return {
      api: null,
      loading: false,
      currentStatus: '',
      errorMessage: '',
      successMessage: ''
    }
  },
  computed: {
    seatMapId() {
      return this.$route.params.seatMapId
    }
  },
  created() {
    this.api = useApi()
    this.loadDetail()
  },
  methods: {
    async loadDetail() {
      try {
        const detail = await this.api.get(ENDPOINTS.adminSeatMapDetail(this.seatMapId))
        this.currentStatus = detail?.status || ''
      } catch (err) {
        this.errorMessage = err.message || '좌석맵 정보를 불러오지 못했습니다.'
      }
    },
    async updateStatus(status) {
      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''
      try {
        await this.api.patch(ENDPOINTS.adminUpdateSeatMapStatus(this.seatMapId, status))
        this.currentStatus = status
        this.successMessage = `상태가 ${status}(으)로 변경되었습니다.`
      } catch (err) {
        this.errorMessage = err.message || '상태 변경에 실패했습니다.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
