<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="text-sm font-semibold text-slate-900">본인인증</div>
      <p class="mt-3 text-sm leading-relaxed text-slate-600">
        공연 티켓 예매 시 만 19세 미만 이용이 제한된 공연이 있습니다.
        본인인증을 완료하시면 더 많은 공연을 이용하실 수 있습니다.
      </p>
      <p class="mt-2 text-xs text-slate-500">
        이니시스(KG이니시스) 연동을 통해 본인 확인 절차가 진행됩니다.
      </p>
       <div v-if="ageVerifiedAt" class="mt-5 flex items-center gap-2">
          <UiBadge color="green" tone="soft">완료</UiBadge>
          <span class="text-sm text-slate-600">본인인증이 완료되었습니다.</span>
        </div>
      <div class="mt-6 flex flex-wrap items-center gap-3">
        <UiButton class="h-11 px-6" @click="startVerification">
          본인인증 하러가기
        </UiButton>
        <UiButton variant="ghost" class="h-11 px-5" @click="$router.push('/me')">
          마이페이지로 돌아가기
        </UiButton>
      </div>
    </UiCard>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { useInicis } from '../../composables/useInicis'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'IdentityVerificationView',
  components: {
    UiCard,
    UiBadge,
    UiButton,
  },
  data() {
    return {
      profile: null,
      loading: false,
      api: null,
    }
  },
  computed: {
    ageVerifiedAt() {
      return this.profile?.ageVerifiedAt ?? null
    },
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const data = await this.api.get(ENDPOINTS.me())
        this.profile = data?.data != null ? data.data : data
      } catch (e) {
        this.profile = null
      } finally {
        this.loading = false
      }
    },
    async startVerification() {
      const { requestIdentityVerification } = useInicis()
      await requestIdentityVerification(() => this.load())
    },
  },
}
</script>
