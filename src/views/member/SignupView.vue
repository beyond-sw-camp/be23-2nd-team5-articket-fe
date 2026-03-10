<template>
  <div class="min-h-[60vh] px-4 py-10 sm:py-14">
    <div class="mx-auto max-w-md">

      <!-- ── Step 1: 회원가입 폼 ─────────────────────────────── -->
      <template v-if="step === 'form'">
        <header class="mb-8 text-center">
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600"
            aria-hidden="true"
          >
            <Ticket class="h-7 w-7" />
          </div>
          <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">
            회원가입
          </h1>
          <p class="mt-2 text-sm text-slate-500">
            ARTICKET과 함께 최고의 공연을 예약하세요.
          </p>
        </header>

        <div
          class="rounded-3xl border border-slate-200/80 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10"
        >
          <form id="signup-form" class="grid gap-5" @submit.prevent="handleSignup">
            <!-- 가입 유형 -->
            <div class="grid gap-2">
              <label class="text-sm font-medium text-slate-700">
                가입 유형
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="flex flex-col items-center gap-1 rounded-xl border-2 px-4 py-4 text-center transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                  :class="form.signupType === 'USER'
                    ? 'border-slate-800 bg-slate-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'"
                  @click="form.signupType = 'USER'"
                >
                  <span class="text-lg" aria-hidden="true">🎫</span>
                  <span class="text-sm font-semibold text-slate-900">티켓 예매</span>
                  <span class="text-xs text-slate-500">공연을 관람하려는 분</span>
                </button>
                <button
                  type="button"
                  class="flex flex-col items-center gap-1 rounded-xl border-2 px-4 py-4 text-center transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                  :class="form.signupType === 'ORGANIZER'
                    ? 'border-slate-800 bg-slate-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'"
                  @click="form.signupType = 'ORGANIZER'"
                >
                  <span class="text-lg" aria-hidden="true">🎭</span>
                  <span class="text-sm font-semibold text-slate-900">공연 등록</span>
                  <span class="text-xs text-slate-500">공연을 등록·운영하려는 분</span>
                </button>
              </div>
            </div>

            <!-- 이름 -->
            <div class="grid gap-2">
              <label for="signup-name" class="text-sm font-medium text-slate-700">
                이름
              </label>
              <div
                class="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300"
                :class="errors.name ? 'border-red-300' : 'border-slate-200'"
              >
                <User class="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  id="signup-name"
                  ref="inputName"
                  v-model="form.name"
                  type="text"
                  placeholder="이름을 입력하세요"
                  class="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <p v-if="errors.name" class="text-xs font-medium text-red-600">
                {{ errors.name }}
              </p>
            </div>

            <!-- 이메일 -->
            <div class="grid gap-2">
              <label for="signup-email" class="text-sm font-medium text-slate-700">
                이메일
              </label>
              <div
                class="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300"
                :class="errors.email ? 'border-red-300' : 'border-slate-200'"
              >
                <Mail class="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  id="signup-email"
                  ref="inputEmail"
                  v-model="form.email"
                  type="email"
                  placeholder="example@email.com"
                  class="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <p v-if="errors.email" class="text-xs font-medium text-red-600">
                {{ errors.email }}
              </p>
            </div>

            <!-- 비밀번호 -->
            <div class="grid gap-2">
              <label for="signup-password" class="text-sm font-medium text-slate-700">
                비밀번호
              </label>
              <div
                class="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300"
                :class="errors.password ? 'border-red-300' : 'border-slate-200'"
              >
                <Lock class="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  id="signup-password"
                  ref="inputPassword"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="6자 이상 입력"
                  class="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <span
                  v-if="form.password"
                  class="shrink-0 text-xs font-semibold transition-colors"
                  :class="strengthTextColor"
                >{{ strengthLabel }}</span>
                <button
                  type="button"
                  class="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 보기'"
                  @click.prevent="showPassword = !showPassword"
                >
                  <Eye v-if="!showPassword" class="h-5 w-5" />
                  <EyeOff v-else class="h-5 w-5" />
                </button>
              </div>
              <p v-if="errors.password" class="text-xs font-medium text-red-600">
                {{ errors.password }}
              </p>
            </div>

            <!-- 휴대폰번호 -->
            <div class="grid gap-2">
              <label for="signup-phone" class="text-sm font-medium text-slate-700">
                휴대폰번호
              </label>
              <div
                class="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300"
                :class="errors.phoneNumber ? 'border-red-300' : 'border-slate-200'"
              >
                <Phone class="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  id="signup-phone"
                  ref="inputPhoneNumber"
                  v-model="form.phoneNumber"
                  type="tel"
                  placeholder="010-1234-5678"
                  class="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <p v-if="errors.phoneNumber" class="text-xs font-medium text-red-600">
                {{ errors.phoneNumber }}
              </p>
            </div>

            <!-- 가입하기 버튼 -->
            <button
              type="submit"
              form="signup-form"
              class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="loading"
            >
              <span>{{ loading ? '처리 중...' : '가입하기' }}</span>
              <ArrowRight class="h-5 w-5 shrink-0" />
            </button>
          </form>
        </div>

        <!-- 로그인 링크 -->
        <p class="mt-8 text-center text-sm text-slate-500">
          이미 계정이 있으신가요?
          <RouterLink
            to="/member/doLogin"
            class="font-semibold text-slate-700 underline decoration-slate-400 underline-offset-2 hover:text-slate-900 hover:decoration-slate-600"
          >
            로그인
          </RouterLink>
        </p>
      </template>

      <!-- ── Step 2: 본인인증 ─────────────────────────────────── -->
      <template v-else-if="step === 'verify'">
        <header class="mb-8 text-center">
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600"
            aria-hidden="true"
          >
            <ShieldCheck class="h-7 w-7" />
          </div>
          <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">
            본인인증
          </h1>
          <p class="mt-2 text-sm text-slate-500">
            회원가입이 완료됐어요. 본인인증을 진행해 주세요.
          </p>
        </header>

        <div
          class="rounded-3xl border border-slate-200/80 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10"
        >
          <!-- 단계 표시 -->
          <div class="mb-6 flex items-center gap-2">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-400">1</span>
            <div class="h-px flex-1 bg-slate-200" />
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">2</span>
          </div>

          <div class="space-y-3 text-sm leading-relaxed text-slate-600">
            <p>
              공연 티켓 예매 시 만 19세 미만 이용이 제한된 공연이 있습니다.
              본인인증을 완료하시면 더 많은 공연을 이용하실 수 있습니다.
            </p>
            <p class="text-xs text-slate-500">
              이니시스(KG이니시스) 연동을 통해 본인 확인 절차가 진행됩니다.
            </p>
          </div>

          <div class="mt-8 flex flex-col gap-3">
            <button
              type="button"
              :disabled="verifying"
              class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              @click="handleVerification"
            >
              <ShieldCheck class="h-5 w-5 shrink-0" />
              <span>{{ verifying ? '인증 중...' : '지금 인증하기' }}</span>
            </button>
            <button
              type="button"
              :disabled="verifying"
              class="flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
              @click="skipVerification"
            >
              나중에 하기
            </button>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script>
import {
  Ticket,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-vue-next'
import { useAuthApi } from '../../composables/useAuthApi'
import { useInicis } from '../../composables/useInicis'

export default {
  name: 'MemberSignup',
  components: {
    Ticket,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Phone,
    ArrowRight,
    ShieldCheck,
  },
  data() {
    return {
      step: 'form',   // 'form' | 'verify'
      form: {
        signupType: 'USER',
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
      },
      errors: {
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
      },
      showPassword: false,
      loading: false,
      verifying: false,
      authApi: null,
    }
  },
  computed: {
    passwordStrengthScore() {
      const p = this.form.password
      if (!p) return 0
      let score = 0
      if (/[A-Z]/.test(p)) score++
      if (/[a-z]/.test(p)) score++
      if (/[0-9]/.test(p)) score++
      if (/[^A-Za-z0-9]/.test(p)) score++
      return score
    },
    strengthLabel() {
      if (this.passwordStrengthScore === 4) return '안전'
      if (this.passwordStrengthScore >= 2) return '보통'
      return '약함'
    },
    strengthTextColor() {
      if (this.passwordStrengthScore === 4) return 'text-green-600'
      if (this.passwordStrengthScore >= 2) return 'text-yellow-500'
      return 'text-red-500'
    },
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
        const phoneRe = /^010-\d{4}-\d{4}$/
        if (!phoneRe.test(phone)) {
          e.phoneNumber = '전화번호는 010-xxxx-xxxx 형식이어야 합니다.'
          valid = false
        }
      }

      this.errors = e
      return valid
    },

    focusFirstInvalid() {
      const refOrder = [
        'inputName',
        'inputEmail',
        'inputPassword',
        'inputPhoneNumber',
      ]
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
          phoneNumber: this.form.phoneNumber.trim(),
        })

        if (success) {
          // 본인인증을 위해 토큰이 필요하므로 자동 로그인 수행
          const loginResult = await this.authApi.login({
            email: this.form.email.trim(),
            password: this.form.password,
          })

          if (loginResult.success) {
            // 자동 로그인 성공 → 본인인증 스텝으로 이동
            this.step = 'verify'
          } else {
            // 자동 로그인 실패 시 완료 페이지로 (인증은 마이페이지에서 가능)
            this.$router.replace('/member/complete')
          }
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

    async handleVerification() {
      this.verifying = true
      let verified = false

      const { requestIdentityVerification } = useInicis()
      await requestIdentityVerification(() => {
        verified = true
        localStorage.setItem('isVerified', true)
      })

      this.verifying = false

      // 인증 완료 시 완료 페이지로, 취소 시 현재 스텝 유지
      if (verified) {
        this.$router.replace('/member/complete')
      }
    },

    skipVerification() {
      this.$router.replace('/member/complete')
    },

    applyServerDetails(data) {
      if (!data?.details || !Array.isArray(data.details)) return
      const e = { ...this.errors }
      for (const { field, reason } of data.details) {
        if (!reason) continue
        const key = field
        if (key in e) e[key] = reason
      }
      this.errors = e
    },
  },
}
</script>