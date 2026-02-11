<script setup>
import { ref } from 'vue'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import { useAuthMock } from '../../composables/useAuthMock'

const { loading, error, signup } = useAuthMock()

const name = ref('')
const email = ref('')
const password = ref('')

const done = ref(false)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 

async function submit() {
  done.value = false

  try {
    const res = await fetch(`${API_BASE_URL}/member/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value,
      }),
    })

    if (!res.ok) {
      let msg = '회원가입에 실패했어요.'
      try {
        const data = await res.json()
        msg = data?.message || data?.error || msg
      } catch (e) {}

      console.error(msg)
      return
    }

    // (선택) 서버가 유저 객체/ID 등을 내려주면 읽기
    // const data = await res.json()

  } catch (e) {
    console.error(e)
    return
  }

  // 2) 기존 mock signup도 호출해 UI 흐름(loading/error/done)을 유지
  const ok = await signup({ name: name.value, email: email.value, password: password.value })
  done.value = ok
}
</script>

<template>
  <div class="mx-auto grid max-w-xl gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">회원가입</div>
          <div class="mt-1 text-sm text-slate-500">폼 UI + mock</div>
        </div>
        <UiBadge tone="soft">Mock</UiBadge>
      </div>

      <div
        v-if="done"
        class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"
      >
        회원가입 완료! 이제 로그인할 수 있어요.
      </div>

      <form class="mt-4 grid gap-3" @submit.prevent="submit">
        <div class="grid gap-2">
          <label class="text-xs font-semibold text-slate-600">이름</label>
          <input
            v-model="name"
            class="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>

        <div class="grid gap-2">
          <label class="text-xs font-semibold text-slate-600">이메일</label>
          <input
            v-model="email"
            class="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>

        <div class="grid gap-2">
          <label class="text-xs font-semibold text-slate-600">비밀번호</label>
          <input
            v-model="password"
            type="password"
            class="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>

        <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {{ error }}
        </div>

        <div class="mt-1 flex items-center justify-between gap-2">
          <UiButton variant="ghost" class="h-11 px-4" type="button" @click="$router.push('/member/doLogin')">
            로그인
          </UiButton>
          <UiButton class="h-11 px-6" :disabled="loading" type="submit">가입하기</UiButton>
        </div>
      </form>
    </UiCard>
  </div>
</template>

