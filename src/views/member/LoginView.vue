<template>
  <div class="min-h-[60vh] px-4 py-10 sm:py-14">
    <div class="mx-auto max-w-md">
      <!-- 헤더: 로고 + 인사말 + 슬로건 -->
      <header class="mb-8 text-center">
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600"
          aria-hidden="true"
        >
          <Ticket class="h-7 w-7" />
        </div>
        <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">
          다시 만나서 반가워요!
        </h1>
        <p class="mt-2 text-sm text-slate-500">
          ARTICKET과 함께 최고의 공연을 예약하세요.
        </p>
      </header>

      <!-- 로그인 폼 카드 -->
      <div
        class="rounded-3xl border border-slate-200/80 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10"
      >
        <form class="grid gap-5" @submit.prevent="handleLogin">
          <!-- 이메일 -->
          <div class="grid gap-2">
            <label for="login-email" class="text-sm font-medium text-slate-700">
              이메일
            </label>
            <div
              class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300"
            >
              <Mail class="h-5 w-5 shrink-0 text-slate-400" />
              <input
                id="login-email"
                v-model="form.email"
                type="email"
                placeholder="example@email.com"
                class="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <!-- 비밀번호 -->
          <div class="grid gap-2">
            <label for="login-password" class="text-sm font-medium text-slate-700">
              비밀번호
            </label>
            <div
              class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300"
            >
              <Lock class="h-5 w-5 shrink-0 text-slate-400" />
              <input
                id="login-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                required
                minlength="6"
              />
              <button
                type="button"
                class="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
                :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 보기'"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="!showPassword" class="h-5 w-5" />
                <EyeOff v-else class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- 소셜 성공 메시지 -->
          <div
            v-if="socialSuccess"
            class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
          >
            {{ socialSuccess }}
          </div>

          <!-- 로그인하기 버튼 -->
          <button
            type="submit"
            class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="loading"
          >
            <span>{{ loading ? '로그인 중...' : '로그인하기' }}</span>
            <ArrowRight class="h-5 w-5 shrink-0" />
          </button>
        </form>

        <!-- 소셜 로그인 -->
        <div class="mt-8">
          <p class="mb-4 text-center text-xs text-slate-500">
            간편하게 소셜 계정으로 로그인하세요
          </p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              class="flex h-12 items-center justify-center gap-3 rounded-xl border border-transparent bg-[#FEE500] px-4 text-sm font-semibold text-[#191919] shadow-sm transition hover:bg-[#F5DC00] focus:outline-none focus:ring-2 focus:ring-[#FEE500] focus:ring-offset-2 disabled:opacity-70"
              :disabled="!!socialLoading"
              @click="handleKakaoLogin"
            >
              <span class="flex h-5 w-5 shrink-0 items-center justify-center text-base leading-none">K</span>
              <span>{{ socialLoading === 'kakao' ? '이동 중…' : '카카오로 시작하기' }}</span>
            </button>
            <button
              type="button"
              class="flex h-12 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-70"
              :disabled="!!socialLoading"
              @click="handleGoogleLogin"
            >
              <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>{{ socialLoading === 'google' ? '이동 중…' : 'Google로 시작하기' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 회원가입 링크 -->
      <p class="mt-8 text-center text-sm text-slate-500">
        아직 계정이 없으신가요?
        <RouterLink
          to="/member/create"
          class="font-semibold text-slate-700 underline decoration-slate-400 underline-offset-2 hover:text-slate-900 hover:decoration-slate-600"
        >
          회원가입
        </RouterLink>
      </p>
    </div>

    <!-- 소셜 계정 통합 안내 모달 -->
    <UiModal
      :open="!!mergeConflict"
      title="같은 이메일을 쓰는 계정이 있어요"
      max-width-class="max-w-sm"
      @close="closeMergeModal"
    >
      <div class="text-center">
        <p class="text-sm text-slate-600">
          아래 계정으로 로그인하면, 지금 인증한 간편 로그인 수단이 자동으로 연결돼요.
        </p>

        <!-- 소셜 타입 표시 카드 -->
        <div class="mx-auto mt-5 flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
          <!-- 카카오 -->
          <template v-if="mergeConflict === 'KAKAO'">
            <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#FEE500] text-xs font-bold text-[#191919]">K</span>
            <span class="text-sm font-medium text-slate-800">카카오 계정으로 로그인</span>
          </template>
          <!-- 구글 -->
          <template v-else-if="mergeConflict === 'GOOGLE'">
            <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span class="text-sm font-medium text-slate-800">Google 계정으로 로그인</span>
          </template>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="flex h-12 w-full items-center justify-center rounded-xl font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2"
          :class="mergeConflict === 'KAKAO'
            ? 'bg-[#FEE500] text-[#191919] hover:bg-[#F5DC00] focus:ring-[#FEE500]'
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-400'"
          @click="handleMergeLogin"
        >
          로그인하고 연결하기
        </button>
      </template>
    </UiModal>
  </div>
</template>

<script>
import { Mail, Lock, Eye, EyeOff, ArrowRight, Ticket } from 'lucide-vue-next'
import { useAuthApi } from '../../composables/useAuthApi'
import UiModal from '../../components/common/UiModal.vue'
import axios from 'axios'

export default {
  name: 'MemberLogin',
  components: {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Ticket,
    UiModal,
  },
  data() {
    return {
      form: {
        email: null,
        password: null,
      },
      showPassword: false,

      baseUrl: import.meta.env.VITE_API_BASE || 'http://localhost:8080',
      googleUrl: 'https://accounts.google.com/o/oauth2/auth',
      googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      googleRedirectUrl: `${import.meta.env.VITE_API_BASE || 'http://localhost:8080'}/oauth/google/redirect`,
      googleScope: 'openid email profile',
      kakaoUrl: 'https://kauth.kakao.com/oauth/authorize',
      kakaoClientId: import.meta.env.VITE_KAKAO_CLIENT_ID || '',
      kakaoRedirectUrl: `${import.meta.env.VITE_API_BASE || 'http://localhost:8080'}/oauth/kakao/redirect`,

      loading: false,
      socialLoading: null,
      socialSuccess: '',
      authApi: null,

      // 소셜 계정 통합 모달
      mergeConflict: null,   // 'KAKAO' or 'GOOGLE'
    }
  },
  created() {
    this.authApi = useAuthApi()

    // query param으로 전달된 소셜 충돌 정보 읽기
    const conflict = this.$route.query.mergeConflict
    if (conflict) {
      this.mergeConflict = conflict
    }
  },
  methods: {
    async handleLogin() {
      const data = {
        email: this.form.email,
        password: this.form.password,
      }

      this.loading = true

      try {
        const result = await this.authApi.login(data)

        if (result.success) {
          const redirect = this.$route.query.redirect || '/'
          try {
            const accessToken = localStorage.getItem('accessToken')
            const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
            await axios.get(`${API_BASE}/member/isVerified`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })
            localStorage.setItem('isVerified', true)
          } catch (e) {
            console.log(e)
          }
          window.location.href = redirect
        }
      } catch (e) {
        // 에러는 ErrorAlertModal에서 표시됨
      } finally {
        this.loading = false
      }
    },

    handleGoogleLogin() {
      if (this.socialLoading) return
      this.socialLoading = 'google'
      const auth_uri = `${this.googleUrl}?client_id=${this.googleClientId}&redirect_uri=${this.googleRedirectUrl}&response_type=code&scope=${this.googleScope}`
      window.location.href = auth_uri
    },

    handleKakaoLogin() {
      if (this.socialLoading) return
      this.socialLoading = 'kakao'
      const auth_uri = `${this.kakaoUrl}?client_id=${this.kakaoClientId}&redirect_uri=${this.kakaoRedirectUrl}&response_type=code`
      window.location.href = auth_uri
    },

    closeMergeModal() {
      this.mergeConflict = null
      // URL에서 query param 제거
      this.$router.replace({ path: '/member/doLogin' })
    },

    handleMergeLogin() {
      // pendingMerge 플래그 저장 후 해당 소셜 로그인으로 이동
      localStorage.setItem('pendingMerge', 'true')
      if (this.mergeConflict === 'KAKAO') {
        this.handleKakaoLogin()
      } else if (this.mergeConflict === 'GOOGLE') {
        this.handleGoogleLogin()
      }
    },
  },
}
</script>
