<template>
  <div class="mx-auto max-w-2xl space-y-6 pb-12">
    <!-- 로딩 -->
    <div
      v-if="loading && !profile"
      class="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white py-12"
    >
      <div class="flex flex-col items-center gap-3 text-slate-500">
        <svg
          class="h-8 w-8 animate-spin text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span class="text-sm">불러오는 중…</span>
      </div>
    </div>

    <!-- 에러 -->
    <div
      v-else-if="!profile"
      class="rounded-2xl border border-slate-200 bg-white p-8 text-center"
    >
      <p class="text-sm text-slate-600">정보를 불러오지 못했습니다.</p>
      <button
        type="button"
        class="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        @click="load"
      >
        다시 시도
      </button>
    </div>

    <!-- 본인인증 카드 -->
    <div
      v-else
      class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <ShieldCheck class="h-6 w-6" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-900">본인인증</h2>
          <p class="mt-0.5 text-sm text-slate-500">
            만 19세 미만 이용 제한 공연 예매를 위해 필요합니다.
          </p>
        </div>
      </div>

      <div class="mt-6 space-y-3 text-sm leading-relaxed text-slate-600">
        <p>
          공연 티켓 예매 시 만 19세 미만 이용이 제한된 공연이 있습니다.
          본인인증을 완료하시면 더 많은 공연을 이용하실 수 있습니다.
        </p>
        <p class="text-xs text-slate-500">
          이니시스(KG이니시스) 연동을 통해 본인 확인 절차가 진행됩니다.
        </p>
      </div>

      <!-- 완료 상태 -->
      <div
        v-if="ageVerifiedAt"
        class="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3"
      >
        <span class="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          완료
        </span>
        <span class="text-sm text-green-800">본인인증이 완료되었습니다.</span>
      </div>

      <div class="mt-8 flex flex-wrap gap-3">
        <button
          v-if="!ageVerifiedAt"
          type="button"
          class="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          @click="startVerification"
        >
          본인인증 하러가기
        </button>
        <RouterLink
          to="/me"
          class="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          마이페이지로 돌아가기
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script>
import { ShieldCheck } from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { useInicis } from '../../composables/useInicis'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'IdentityVerificationView',
  components: { ShieldCheck },
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
