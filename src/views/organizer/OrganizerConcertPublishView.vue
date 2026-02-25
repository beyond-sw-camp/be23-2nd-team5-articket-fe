<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="text-sm font-semibold text-slate-900">공연 게시</div>
      <div class="mt-1 text-sm text-slate-500">
        공연을 게시하면 일반 사용자에게 노출됩니다. 게시 전 회차와 좌석 정보를 확인하세요.
      </div>
      <div class="mt-4 flex flex-wrap gap-3">
        <UiButton class="h-11 px-5" :disabled="publishing" @click="publish">
          {{ publishing ? '처리 중…' : '게시하기' }}
        </UiButton>
        <UiButton variant="ghost" class="h-11 px-4" :disabled="publishing" @click="$router.push(`/organizer/concerts/${concertId}`)">
          취소
        </UiButton>
      </div>
      <p v-if="errorMessage" class="mt-3 text-sm text-red-600">{{ errorMessage }}</p>
      <p v-if="successMessage" class="mt-3 text-sm text-green-600">{{ successMessage }}</p>
    </UiCard>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'OrganizerConcertPublishView',
  components: {
    UiCard,
    UiButton
  },
  data() {
    return {
      publishing: false,
      errorMessage: '',
      successMessage: '',
      api: null
    }
  },
  computed: {
    concertId() {
      return this.$route.params.concertId
    }
  },
  created() {
    this.api = useApi()
  },
  methods: {
    async publish() {
      const concertId = this.concertId
      if (concertId == null || concertId === '') {
        this.errorMessage = '공연 정보를 찾을 수 없습니다.'
        return
      }
      this.errorMessage = ''
      this.successMessage = ''
      this.publishing = true
      try {
        await this.api.post(ENDPOINTS.organizerPublishConcert(concertId))
        this.successMessage = '공연이 게시되었습니다.'
        setTimeout(() => {
          this.$router.push(`/organizer/concerts/${concertId}`)
        }, 1500)
      } catch (err) {
        this.errorMessage = err.message || '게시에 실패했습니다.'
      } finally {
        this.publishing = false
      }
    }
  }
}
</script>
