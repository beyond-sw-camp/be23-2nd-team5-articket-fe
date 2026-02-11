<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <UiCard v-else-if="profile">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">내 정보</div>
          <div class="mt-1 text-sm text-slate-500">ProfileView 스타일 (mock)</div>
        </div>
        <UiBadge tone="soft">{{ profile.grade }}</UiBadge>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">이름</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ profile.name }}</div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">이메일</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ profile.email }}</div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:col-span-2">
          <div class="text-xs font-semibold text-slate-500">연락처</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ profile.phone }}</div>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <UiButton class="h-11 px-5" @click="$router.push('/me/orders')">내 주문 목록</UiButton>
        <UiButton variant="ghost" class="h-11 px-5" @click="$router.push('/')">둘러보기</UiButton>
      </div>
    </UiCard>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'ProfileView',
  components: {
    UiCard,
    UiBadge,
    UiButton
  },
  data() {
    return {
      profile: null,
      loading: false,
      api: null
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        this.profile = await this.api.get(ENDPOINTS.me())
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
