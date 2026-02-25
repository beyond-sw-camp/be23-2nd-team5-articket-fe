<template>
  <div class="mx-auto grid max-w-xl gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">회원가입</div>
        </div>
      </div>

      <form id="signup-form" class="mt-4 grid gap-3" @submit.prevent="handleSignup">
        <div class="grid gap-2">
          <label class="text-xs font-semibold text-slate-600">가입 유형</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="flex flex-col items-center gap-1 rounded-2xl border-2 p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              :class="form.signupType === 'USER' ? 'border-slate-800 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'"
              @click="form.signupType = 'USER'"
            >
              <span class="text-lg" aria-hidden="true">🎫</span>
              <span class="text-sm font-semibold text-slate-900">티켓 예매</span>
              <span class="text-xs text-slate-500">공연을 관람하려는 분</span>
            </button>
            <button
              type="button"
              class="flex flex-col items-center gap-1 rounded-2xl border-2 p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              :class="form.signupType === 'ORGANIZER' ? 'border-slate-800 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'"
              @click="form.signupType = 'ORGANIZER'"
            >
              <span class="text-lg" aria-hidden="true">🎭</span>
              <span class="text-sm font-semibold text-slate-900">공연 등록</span>
              <span class="text-xs text-slate-500">공연을 등록·운영하려는 분</span>
            </button>
          </div>
        </div>

        <div class="grid gap-2">
          <label class="text-xs font-semibold text-slate-600">이름</label>
          <input
            ref="inputName"
            v-model="form.name"
            type="text"
            placeholder="이름을 입력하세요"
            class="h-11 rounded-2xl border bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2"
            :class="errors.name ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-red-200'"
          />
          <p v-if="errors.name" class="text-xs font-medium text-red-600">{{ errors.name }}</p>
        </div>

        <div class="grid gap-2">
          <label class="text-xs font-semibold text-slate-600">이메일</label>
          <input
            ref="inputEmail"
            v-model="form.email"
            type="email"
            placeholder="example@email.com"
            class="h-11 rounded-2xl border bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2"
            :class="errors.email ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-red-200'"
          />
          <p v-if="errors.email" class="text-xs font-medium text-red-600">{{ errors.email }}</p>
        </div>

        <div class="grid gap-2">
          <label class="text-xs font-semibold text-slate-600">비밀번호</label>
          <input
            ref="inputPassword"
            v-model="form.password"
            type="password"
            placeholder="6자 이상 입력"
            class="h-11 rounded-2xl border bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2"
            :class="errors.password ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-red-200'"
          />
          <p v-if="errors.password" class="text-xs font-medium text-red-600">{{ errors.password }}</p>
        </div>

        <div class="grid gap-2">
          <label class="text-xs font-semibold text-slate-600">휴대폰번호</label>
          <input
            ref="inputPhoneNumber"
            v-model="form.phoneNumber"
            type="tel"
            placeholder="010-1234-5678"
            class="h-11 rounded-2xl border bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2"
            :class="errors.phoneNumber ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-red-200'"
          />
          <p v-if="errors.phoneNumber" class="text-xs font-medium text-red-600">{{ errors.phoneNumber }}</p>
        </div>

        <div class="mt-1 flex items-center justify-between gap-2">
          <UiButton
            variant="ghost"
            class="h-11 px-4"
            type="button"
            @click="goToLogin"
          >
            로그인
          </UiButton>
          <UiButton
            class="h-11 px-6"
            :disabled="loading"
            type="submit"
            form="signup-form"
          >
            {{ loading ? '처리 중...' : '가입하기' }}
          </UiButton>
        </div>
      </form>
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
        signupType: 'USER', // 'USER' = 티켓 예매, 'ORGANIZER' = 공연 등록
        name: '',
        email: '',
        password: '',
        phoneNumber: ''
      },
      errors: {
        name: '',
        email: '',
        password: '',
        phoneNumber: ''
      },
      loading: false,
      authApi: null
    }
  },
  created() {
    this.authApi = useAuthApi()
  },
  methods: {
    validateForm() {
      const e = { name: '', email: '', password: '', phoneNumber: '' }
      let valid = true

      const name = (this.form.name || '').trim()
      if (!name) {
        e.name = '이름을 입력해 주세요.'
        valid = false
      }

      const email = (this.form.email || '').trim()
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!email) {
        e.email = '이메일을 입력해 주세요.'
        valid = false
      } else if (!emailRe.test(email)) {
        e.email = '올바른 이메일 형식으로 입력해 주세요.'
        valid = false
      }

      const password = this.form.password || ''
      if (!password) {
        e.password = '비밀번호를 입력해 주세요.'
        valid = false
      } else if (password.length < 6) {
        e.password = '비밀번호는 6자 이상 입력해 주세요.'
        valid = false
      }

      const phone = (this.form.phoneNumber || '').trim()
      if (phone) {
        const phoneRe = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/
        const digitsOnly = phone.replace(/\D/g, '')
        if (digitsOnly.length < 10 || digitsOnly.length > 11 || !phoneRe.test(phone.replace(/\s/g, ''))) {
          e.phoneNumber = '올바른 휴대폰 번호를 입력해 주세요. (예: 010-1234-5678)'
          valid = false
        }
      }

      this.errors = e
      return valid
    },

    focusFirstInvalid() {
      const refOrder = ['inputName', 'inputEmail', 'inputPassword', 'inputPhoneNumber']
      const errKeys = ['name', 'email', 'password', 'phoneNumber']
      for (let i = 0; i < refOrder.length; i++) {
        if (!this.errors[errKeys[i]]) continue
        const el = this.$refs[refOrder[i]]
        if (el) {
          const node = el.$el || el
          if (node && typeof node.focus === 'function') node.focus()
          return
        }
      }
    },

    async handleSignup() {
      this.errors = { name: '', email: '', password: '', phoneNumber: '' }

      if (!this.validateForm()) {
        this.$nextTick(() => this.focusFirstInvalid())
        return
      }

      this.loading = true
      try {
        const success = await this.authApi.signup({
          role: this.form.signupType,
          name: this.form.name.trim(),
          email: this.form.email.trim(),
          password: this.form.password,
          phone_number: this.form.phoneNumber.trim()
        })

        if (success) {
          this.$router.replace('/member/complete')
          return
        } else {
          const data = this.authApi.lastErrorData?.value
          this.applyServerDetails(data?.error ?? data)
        }
      } catch (e) {
        const data = e?.responseData ?? e?.response?.data
        this.applyServerDetails(data?.error ?? data)
      } finally {
        this.loading = false
      }
    },

    applyServerDetails(data) {
      if (!data?.details || !Array.isArray(data.details)) return
      const e = { ...this.errors }
      for (const { field, reason } of data.details) {
        if (!reason) continue
        const key = field === 'phone_number' ? 'phoneNumber' : field
        if (key in e) e[key] = reason
      }
      this.errors = e
    },

    goToLogin() {
      this.$router.push('/member/doLogin')
    }
  }
}
</script>
