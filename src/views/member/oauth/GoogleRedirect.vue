<template>
  <div class="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12">
    <div
      class="w-full max-w-sm rounded-3xl border border-slate-200/80 bg-white px-8 py-10 text-center shadow-sm"
    >

      <!-- 본인인증 스텝 -->
      <template v-if="needsVerification">
        <div
          class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600"
          aria-hidden="true"
        >
          <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <h2 class="text-lg font-bold text-slate-900">본인인증</h2>
        <p class="mt-2 text-sm text-slate-500">
          Google 계정으로 로그인했어요.<br />본인인증을 진행해 주세요.
        </p>

        <div class="mt-5 space-y-2 text-left text-sm leading-relaxed text-slate-600">
          <p>
            만 19세 미만 이용이 제한된 공연 예매를 위해 본인인증이 필요합니다.
          </p>
          <p class="text-xs text-slate-400">
            이니시스(KG이니시스) 연동으로 본인 확인이 진행됩니다.
          </p>
        </div>

        <div class="mt-6 flex flex-col gap-3">
          <button
            type="button"
            :disabled="verifying"
            class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            @click="handleVerification"
          >
            <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>{{ verifying ? '인증 중...' : '지금 인증하기' }}</span>
          </button>
          <button
            type="button"
            :disabled="verifying"
            class="inline-flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            @click="skipVerification"
          >
            나중에 하기
          </button>
        </div>
      </template>

      <!-- 로딩 -->
      <template v-else-if="!error">
        <div
          class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100"
          aria-hidden="true"
        >
          <svg
            class="h-7 w-7 animate-spin text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h2 class="text-lg font-bold text-slate-900">Google 계정으로 로그인하는 중이에요</h2>
        <p class="mt-2 text-sm text-slate-500">잠시만 기다려 주세요.</p>
      </template>

      <!-- 에러 -->
      <template v-else>
        <div
          class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600"
          aria-hidden="true"
        >
          <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-lg font-bold text-slate-900">로그인에 실패했어요</h2>
        <p class="mt-2 text-sm text-slate-600">{{ errorMessage }}</p>
        <div class="mt-6 flex flex-col gap-3">
          <RouterLink to="/member/doLogin" class="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 font-semibold text-white transition hover:bg-slate-800">
            로그인 화면으로 돌아가기
          </RouterLink>
          <button type="button" class="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 font-semibold text-slate-700 transition hover:bg-slate-50" @click="retry">
            다시 시도
          </button>
        </div>
      </template>

    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { useInicis } from '../../../composables/useInicis'

const API_BASE = 'http://localhost:8080'

export default {
  name: 'GoogleRedirect',
  data() {
    return {
      error: false,
      errorMessage: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
      needsVerification: false,
      pendingRedirect: '/',
      verifying: false,
    }
  },
  mounted() {
    const code = new URL(window.location.href).searchParams.get('code')
    if (!code) {
      this.error = true
      this.errorMessage = '인증 코드를 받지 못했어요. 로그인 화면에서 다시 시도해 주세요.'
      return
    }
    this.sendCodeToServer(code)
  },
  methods: {
    async sendCodeToServer(code) {
      try {
        const pendingMerge = localStorage.getItem('pendingMerge')
        const body = { code }
        if (pendingMerge) {
          body.merge = true
          localStorage.removeItem('pendingMerge')
        }

        const response = await axios.post(`${API_BASE}/member/google/doLogin`, body)
        const access_token = response.data.access_token
        const refresh_token = response.data.refresh_token
        localStorage.setItem('accessToken', access_token)
        localStorage.setItem('refreshToken', refresh_token)

        const redirect = this.$route.query.redirect || '/'
        this.pendingRedirect = redirect

        // 본인인증 여부 확인
        let isVerified = false
        try {
          await axios.get(`${API_BASE}/member/isVerified`, {
            headers: { Authorization: `Bearer ${access_token}` },
          })
          isVerified = true
          localStorage.setItem('isVerified', true)
        } catch (_) {}

        if (isVerified) {
          window.location.href = redirect
        } else {
          // 미인증 → 본인인증 스텝 표시
          this.needsVerification = true
        }
      } catch (e) {
        const status = e?.response?.status
        const responseData = e?.response?.data
        const code = responseData?.code || responseData?.error?.code
        const errorMsg = responseData?.error?.error_message || responseData?.message || ''

        // 소셜 계정 중복 감지 (409 / 에러코드 / 메시지 키워드)
        const isDuplicate =
          status === 409 ||
          code === 'DUPLICATE_SOCIAL_EMAIL' ||
          (typeof errorMsg === 'string' && errorMsg.includes('소셜') && errorMsg.includes('중복'))

        if (isDuplicate) {
          const conflictType = responseData?.conflictSocialType || 'KAKAO'
          this.$router.replace({
            path: '/member/doLogin',
            query: { mergeConflict: conflictType },
          })
          return
        }
        this.error = true
        if (errorMsg) this.errorMessage = typeof errorMsg === 'string' ? errorMsg : '로그인 처리에 실패했어요.'
      }
    },

    async handleVerification() {
      this.verifying = true
      let verified = false

      const { requestIdentityVerification } = useInicis()
      await requestIdentityVerification(() => {
        verified = true
        localStorage.setItem('isVerified', true)
      })

      this.verifying = false

      // 인증 완료 시 목적지로 이동, 취소 시 현재 스텝 유지
      if (verified) {
        window.location.href = this.pendingRedirect
      }
    },

    skipVerification() {
      window.location.href = this.pendingRedirect
    },

    retry() {
      this.error = false
      this.errorMessage = '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'
      window.location.href = '/member/doLogin'
    },
  },
}
</script>