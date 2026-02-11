<template>
  <div class="mx-auto grid max-w-xl gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">로그인</div>
        </div>
      </div>

      <div class="mt-4 grid gap-3">
        <div class="grid gap-2">
          <label class="text-xs font-semibold text-slate-600">이메일</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="hong@example.com"
            class="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
            required
          />
        </div>
        
        <div class="grid gap-2">
          <label class="text-xs font-semibold text-slate-600">비밀번호</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="비밀번호 입력"
            class="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
            required
            minlength="6"
          />
        </div>

        <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {{ error }}
        </div>

        <div v-if="socialSuccess" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          {{ socialSuccess }}
        </div>

        <div class="mt-1 flex items-center justify-between gap-2">
          <UiButton 
            variant="ghost" 
            class="h-11 px-4" 
            type="button" 
            @click="goToSignup"
          >
            회원가입
          </UiButton>
          <UiButton 
            class="h-11 px-6" 
            :disabled="loading" 
            @click="handleLogin"
          >
            {{ loading ? '로그인 중...' : '로그인' }}
          </UiButton>
        </div>
      </div>

      <div class="mt-5 flex items-center gap-3">
        <div class="h-px flex-1 bg-slate-200"></div>
        <span class="text-xs font-semibold text-slate-400">또는</span>
        <div class="h-px flex-1 bg-slate-200"></div>
      </div>

      <!-- 간편 로그인 섹션 -->
      <div class="mt-4 grid gap-3">
        <div class="text-xs font-semibold text-slate-500">간편 로그인</div>
        
        <button
          type="button"
          class="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-transparent bg-[#FEE500] px-4 text-sm font-semibold text-[#191919] shadow-sm transition hover:bg-[#F5DC00] focus:outline-none focus:ring-2 focus:ring-yellow-300"
          :disabled="socialLoading"
          @click="handleKakaoLogin"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.652 1.752 4.984 4.397 6.32-.152.548-.977 3.527-1.01 3.762 0 0-.02.167.088.231.108.064.235.015.235.015.31-.043 3.59-2.357 4.157-2.758.375.055.76.084 1.153.084 5.523 0 10-3.463 10-7.654C21 6.463 17.523 3 12 3z"/>
          </svg>
          <span>{{ socialLoading === 'kakao' ? '카카오 로그인 중...' : '카카오로 시작하기' }}</span>
        </button>

        <button
          type="button"
          class="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
          :disabled="socialLoading"
          @click="handleGoogleLogin"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>{{ socialLoading === 'google' ? 'Google 로그인 중...' : 'Google로 시작하기' }}</span>
        </button>
      </div>
    </UiCard>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useAuthApi } from '../../composables/useAuthApi'

export default {
  name: 'MemberLogin',
  components: {
    UiCard,
    UiButton
  },
  data() {
    return {
      form: {
        email: null,
        password: null
      },
      loading: false,
      socialLoading: null, // 'kakao' | 'google' | null
      error: '',
      socialSuccess: '',
      authApi: null,
    }
  },
  created() {
    this.authApi = useAuthApi()
  },
  methods: {
    async handleLogin() {
      const data = {
        email: this.form.email,
        password: this.form.password
      }
      
      this.loading = true
      this.error = ''
      
      try {
        const success = await this.authApi.login(data)
        
        if (success) {
          const redirect = this.$route.query.redirect || '/me'
          this.$router.push(redirect)
        } else {
          this.error = this.authApi.error.value || '로그인에 실패했어요.'
        }
      } catch (e) {
        this.error = e.message || '로그인에 실패했어요.'
      } finally {
        this.loading = false
      }
    },

    // 카카오 간편 로그인 (더미)
    handleKakaoLogin() {
      const redirect = this.$route.query.redirect || '/me'
      this.$router.push(redirect)
    },

    // 구글 간편 로그인 (더미)
    handleGoogleLogin() {
      const redirect = this.$route.query.redirect || '/me'
      this.$router.push(redirect)
    },


    goToSignup() {
      this.$router.push('/member/create')
    }
  }
}
</script>
