<template>
  <div class="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-12">
    <div class="w-full rounded-3xl border border-slate-200 p-8 shadow-lg sm:p-10">
      <!-- 아이콘 -->
      <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle class="h-12 w-12 text-emerald-600" />
      </div>

      <h1 class="text-center text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
        회원가입 완료
      </h1>
      <p class="mt-3 text-center text-sm font-medium leading-relaxed text-slate-500 sm:text-base">
        NexTicket 회원이 되신 것을 환영해요.<br />
        로그인 후 공연 예매와 맞춤 서비스를 이용하실 수 있어요.
      </p>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <UiButton
          class="h-12 flex-1 px-6 font-semibold sm:flex-initial sm:min-w-[180px]"
          @click="goToLogin"
        >
          로그인하러 가기
        </UiButton>
        <UiButton
          variant="ghost"
          class="h-12 flex-1 border border-slate-200 font-semibold sm:flex-initial sm:min-w-[140px]"
          @click="goToHome"
        >
          홈으로
        </UiButton>
      </div>

      <p class="mt-6 text-center text-xs text-slate-400">
        이미 로그인되어 있다면 홈에서 서비스를 이용해 주세요.
      </p>
    </div>
  </div>
</template>

<script>
import { CheckCircle } from 'lucide-vue-next'
import UiButton from '../../components/common/UiButton.vue'

export default {
  name: 'SignupCompleteView',
  components: { CheckCircle, UiButton },
  methods: {
    goToLogin() {
      this.$router.replace({ path: '/member/doLogin', query: { from: 'signup' } })
    },
    goToHome() {
      this.$router.replace('/')
    }
  }
}
</script>
