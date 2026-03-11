<template>
  <div class="min-h-[60vh] px-4 py-10 sm:py-14">
    <div class="mx-auto max-w-md">
      <!-- 완료 카드 -->
      <div
        class="rounded-3xl border border-slate-200/80 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10"
      >
        <div class="flex flex-col items-center text-center">
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600"
            aria-hidden="true"
          >
            <Ticket class="h-7 w-7" />
          </div>
          <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">
            회원가입 완료
          </h1>
          <p class="text-base font-semibold leading-relaxed text-slate-900">
            ARTICKET 회원이 되신 것을 환영해요.
          </p>
          <p class="mt-2 text-sm text-slate-500">
            로그인 후 공연 예매와 맞춤 서비스를 이용하실 수 있어요.
          </p>
        </div>

        <div class="mt-8 flex flex-col gap-3">
          <RouterLink
            to="/"
            class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            홈으로 가기
            <ArrowRight class="h-5 w-5 shrink-0" />
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Ticket, CheckCircle, ArrowRight } from 'lucide-vue-next'

export default {
  name: 'SignupCompleteView',
  components: { Ticket, CheckCircle, ArrowRight },
}
</script>
