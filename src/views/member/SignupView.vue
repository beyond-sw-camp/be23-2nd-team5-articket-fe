<template>
  <div class="mx-auto grid max-w-xl gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">회원가입</div>
        </div>
      </div>

      <div
        v-if="done"
        class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"
      >
        회원가입 완료! 이제 로그인할 수 있어요.
      </div>

      <!-- @submit.prevent 제거, 각 버튼별 핸들러 -->
      <div class="mt-4 grid gap-3">
        <div class="grid gap-2">
          <label class="text-xs font-semibold text-slate-600">닉네임</label>
          <input
            v-model="form.nickName"
            placeholder="닉네임을 입력하세요"
            class="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>

        <div class="grid gap-2">
          <label class="text-xs font-semibold text-slate-600">이메일</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="example@email.com"
            class="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
            required
          />
        </div>

        <div class="grid gap-2">
          <label class="text-xs font-semibold text-slate-600">비밀번호</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="6자 이상 입력"
            class="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
            required
            minlength="6"
          />
        </div>

        <div class="grid gap-2">
          <label class="text-xs font-semibold text-slate-600">휴대폰번호</label>
          <input
            v-model="form.phoneNumber"
            type="tel"
            placeholder="010-1234-5678"
            class="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>

        <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {{ error }}
        </div>

        <div class="mt-1 flex items-center justify-between gap-2">
          <!-- 로그인 버튼: 별도 핸들러 -->
          <UiButton 
            variant="ghost" 
            class="h-11 px-4" 
            type="button" 
            @click="goToLogin"
          >
            로그인
          </UiButton>
          <!-- 가입 버튼: 별도 핸들러 -->
          <UiButton 
            class="h-11 px-6" 
            :disabled="loading" 
            @click="handleSignup"
          >
            {{ loading ? '처리 중...' : '가입하기' }}
          </UiButton>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useAuthApi } from '../../composables/useAuthApi'

export default {
  name: 'MemberSignup',
  components: {
    UiCard,
    UiButton
  },
  data() {
    return {
      form: {
        nickName: '',
        email: '',
        password: '',
        phoneNumber: ''
      },
      done: false
    }
  },
  setup() {
    const { loading, error, signup } = useAuthApi()
    return { loading, error, signup }
  },
  methods: {
    // 회원가입 핸들러 
    async handleSignup() {
      this.done = false
      
      const success = await this.signup({ 
        nickName: this.form.nickName, 
        email: this.form.email, 
        password: this.form.password,
        phone_number: this.form.phoneNumber 
      })
      
      if (success) {
        this.form.nickName = ''
        this.form.email = ''
        this.form.password = ''
        this.form.phoneNumber = ''
      }
      
      this.done = success
    },

    // 로그인 핸들러
    goToLogin() {
      this.$router.push('/member/doLogin')
    }
  }
}
</script>
