<template>
  <div class="py-4">
    <!-- 로딩 -->
    <div v-if="loading" class="py-20 text-center text-sm text-slate-400">불러오는 중…</div>

    <!-- 에러 / 미존재 -->
    <div
      v-else-if="!promotion"
      class="rounded-xl border border-slate-100 py-20 text-center text-sm text-slate-400"
    >
      프로모션 정보를 찾을 수 없습니다.
    </div>

    <!-- 상세 이미지 -->
    <div v-else>
      <img
        :src="promotion.detailImageUrl ?? promotion.imageUrl"
        :alt="promotion.title ?? '프로모션 상세'"
        class="w-full block"
      />
    </div>
  </div>
</template>

<script>
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'PromotionDetailView',

  data() {
    return {
      loading: false,
      promotion: null,
      api: null,
    }
  },

  created() {
    this.api = useApi()
  },

  mounted() {
    this.load()
  },

  methods: {
    async load() {
      const id = this.$route.params.promotionId
      if (!id) return
      this.loading = true
      try {
        this.promotion = await this.api.get(ENDPOINTS.promotion(id))
      } catch (_) {
        this.promotion = null
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
