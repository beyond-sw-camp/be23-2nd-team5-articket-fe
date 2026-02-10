<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import { useAuthMock } from '../../composables/useAuthMock'

const route = useRoute()
const router = useRouter()
const { loading, error, login } = useAuthMock()

const email = ref('hong@example.com')
const password = ref('password')
const nextRole = ref('USER')

async function submit() {
  const ok = await login({ email: email.value, password: password.value }, nextRole.value)
  if (!ok) return
  const redirect = route.query.redirect ? String(route.query.redirect) : '/me'
  router.push(redirect)
}
</script>

<template>
  <div class="mx-auto grid max-w-xl gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">로그인</div>
          <div class="mt-1 text-sm text-slate-500">mock 로그인 성공 시 Role을 전환할 수 있어요.</div>
        </div>
        <UiBadge tone="soft">Mock</UiBadge>
      </div>

      <form class="mt-4 grid gap-3" @submit.prevent="submit">
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
        <div class="grid gap-2">
          <label class="text-xs font-semibold text-slate-600">성공 시 Role</label>
          <select
            v-model="nextRole"
            class="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none"
          >
            <option value="USER">USER</option>
            <option value="ORGANIZER">ORGANIZER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {{ error }}
        </div>

        <div class="mt-1 flex items-center justify-between gap-2">
          <UiButton variant="ghost" class="h-11 px-4" type="button" @click="$router.push('/auth/signup')">
            회원가입
          </UiButton>
          <UiButton class="h-11 px-6" :disabled="loading" type="submit">로그인</UiButton>
        </div>
      </form>
    </UiCard>
  </div>
</template>

