<template>
  <div class="mx-auto max-w-md space-y-6 pb-12">
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 class="text-xl font-bold text-slate-900">프로필 수정</h2>
      <p class="mt-1 text-sm text-slate-500">이름과 연락처를 수정할 수 있습니다.</p>

      <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
        <div>
          <label for="name" class="block text-sm font-semibold text-slate-700">이름</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            placeholder="이름을 입력하세요"
          />
        </div>

        <div>
          <label for="phoneNumber" class="block text-sm font-semibold text-slate-700">연락처</label>
          <input
            id="phoneNumber"
            v-model="form.phoneNumber"
            type="tel"
            required
            class="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            placeholder="010-0000-0000"
          />
        </div>

        <div v-if="error" class="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600">
          {{ error }}
        </div>

        <div class="flex gap-3 pt-2">
          <RouterLink
            to="/me"
            class="flex-1 inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            취소
          </RouterLink>
          <button
            type="submit"
            :disabled="submitting"
            class="flex-[2] inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            <svg
              v-if="submitting"
              class="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            저장하기
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useMe } from '../../composables/useMe'

export default {
  name: 'ProfileEditView',
  data() {
    return {
      form: {
        name: '',
        phoneNumber: '',
      },
      submitting: false,
      error: '',
      me: null,
    }
  },
  async created() {
    const { profile, refetch, updateProfile } = useMe()
    this.me = { profile, refetch, updateProfile }
    
    // 프로필 정보가 없으면 불러오기
    if (!this.me.profile.value) {
      await this.me.refetch()
    }
    
    if (this.me.profile.value) {
      this.form.name = this.me.profile.value.name || ''
      this.form.phoneNumber = this.me.profile.value.phoneNumber || ''
    }
  },
  methods: {
    async handleSubmit() {
      if (this.submitting) return
      this.submitting = true
      this.error = ''
      
      try {
        await this.me.updateProfile({
          name: this.form.name,
          phoneNumber: this.form.phoneNumber,
        })
        this.$router.push('/me')
      } catch (e) {
        this.error = e.response?.data?.message || e.message || '저장 중 오류가 발생했습니다.'
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>
