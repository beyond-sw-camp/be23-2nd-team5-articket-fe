<template>
  <div class="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12">
    <div
      class="w-full max-w-sm rounded-3xl border border-slate-200/80 bg-white px-8 py-10 text-center shadow-sm"
    >
      <!-- 로딩 -->
      <template v-if="!error">
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
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <h2 class="text-lg font-bold text-slate-900">
          카카오 계정으로 로그인하는 중이에요
        </h2>
        <p class="mt-2 text-sm text-slate-500">
          잠시만 기다려 주세요.
        </p>
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
        <h2 class="text-lg font-bold text-slate-900">
          로그인에 실패했어요
        </h2>
        <p class="mt-2 text-sm text-slate-600">
          {{ errorMessage }}
        </p>
        <div class="mt-6 flex flex-col gap-3">
          <RouterLink
            to="/member/doLogin"
            class="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 font-semibold text-white transition hover:bg-slate-800"
          >
            로그인 화면으로 돌아가기
          </RouterLink>
          <button
            type="button"
            class="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 font-semibold text-slate-700 transition hover:bg-slate-50"
            @click="retry"
          >
            다시 시도
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const API_BASE = 'http://localhost:8082'

export default {
  name: 'KakaoRedirect',
  data() {
    return {
      error: false,
      errorMessage: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
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
        const response = await axios.post(`${API_BASE}/member/kakao/doLogin`, { code })
        const access_token = response.data.access_token
        const refresh_token = response.data.refresh_token
        localStorage.setItem('accessToken', access_token)
        localStorage.setItem('refreshToken', refresh_token)
        try {
          await axios.get(`${API_BASE}/member/isVerified`, {
            headers: { Authorization: `Bearer ${access_token}` },
          })
          localStorage.setItem('isVerified', true)
        } catch (_) {}
        const redirect = this.$route.query.redirect || '/'
        window.location.href = redirect
      } catch (e) {
        this.error = true
        const msg = e?.response?.data?.message || e?.response?.data?.error
        if (msg) this.errorMessage = typeof msg === 'string' ? msg : '로그인 처리에 실패했어요.'
      }
    },
    retry() {
      this.error = false
      this.errorMessage = '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'
      window.location.href = '/member/doLogin'
    },
  },
}
</script>
