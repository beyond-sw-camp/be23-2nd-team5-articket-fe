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
        
        <div class="grid gap-2">
          <label class="text-xs font-semibold text-slate-600">성공 시 Role</label>
          <select
            v-model="form.nextRole"
            class="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none"
          >
            <option value="USER">USER (고객)</option>
            <option value="ORGANIZER">ORGANIZER (주최자)</option>
            <option value="ADMIN">ADMIN (관리자)</option>
          </select>
        </div>

        <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {{ error }}
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
    </UiCard>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useAuthApi } from '../../composables/useAuthApi'
import { useRoute } from 'vue-router'

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
        password: null,
        nextRole: 'USER'
      }
    }
  },
  setup(props, { expose }) {
    const route = useRoute()
    const { loading, error, login } = useAuthApi()
    return { route, loading, error, login }
  },
  methods: {
    async handleLogin() {
      const data = {
        email: this.form.email,
        password: this.form.password
      }
      
      const success = await this.login(data, this.form.nextRole)
      
      if (success) {
        const redirect = this.route.query.redirect || '/me'
        this.$router.push(redirect)
      }
    },
    
    // 회원가입 이동
    goToSignup() {
      this.$router.push('/member/create')
    }
  }
}
</script>
