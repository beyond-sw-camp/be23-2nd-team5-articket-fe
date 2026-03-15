<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="mgmt-page-title">공연 게시</div>
      <div class="mgmt-page-subtitle">
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
      <p v-if="successMessage" class="mt-3 text-sm text-green-600">{{ successMessage }}</p>
    </UiCard>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { showErrorAlert } from '../../composables/useErrorToast'
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
        showErrorAlert(new Error('공연 정보를 찾을 수 없습니다.'))
        return
      }
      this.successMessage = ''
      this.publishing = true
      try {
        await this.api.post(ENDPOINTS.organizerPublishConcert(concertId))
        this.successMessage = '공연이 게시되었습니다.'
        setTimeout(() => {
          this.$router.push(`/organizer/concerts/${concertId}`)
        }, 1500)
      } catch (err) {
        // 에러는 ErrorAlertModal에서 표시됨
      } finally {
        this.publishing = false
      }
    }
  }
}
</script>
