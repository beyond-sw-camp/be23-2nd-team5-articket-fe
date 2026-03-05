<template>
  <div class="mx-auto max-w-4xl space-y-6 pb-12">
    <!-- 헤더 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">좋아요한 아티스트</h1>
        <p class="mt-1 text-sm text-slate-500">마이페이지 · 내가 좋아요한 아티스트 목록</p>
      </div>
      <RouterLink
        to="/me"
        class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        마이페이지
      </RouterLink>
    </div>

    <!-- 로딩 -->
    <div
      v-if="loading"
      class="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white py-12"
    >
      <div class="flex flex-col items-center gap-3 text-slate-500">
        <svg
          class="h-8 w-8 animate-spin text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span class="text-sm">불러오는 중…</span>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div
      v-else-if="rows.length === 0"
      class="rounded-2xl border border-slate-200 bg-white py-16 text-center"
    >
      <p class="text-sm text-slate-500">좋아요한 아티스트가 없습니다.</p>
      <RouterLink
        to="/performers"
        class="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        아티스트 탐색
      </RouterLink>
    </div>

    <!-- 목록 -->
    <div
      v-else
      class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <ul class="divide-y divide-slate-100">
        <li
          v-for="row in rows"
          :key="row.performerId"
          class="flex items-center gap-4 px-4 py-4 transition hover:bg-slate-50 sm:px-5 sm:py-5"
        >
          <!-- 프로필 이미지 -->
          <div class="shrink-0">
            <img
              v-if="row.performerProfileImgUrl"
              :src="row.performerProfileImgUrl"
              :alt="row.performerName"
              class="h-16 w-16 rounded-full border border-slate-200 object-cover shadow-sm"
            />
            <div
              v-else
              class="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-2xl font-bold text-slate-400"
            >
              {{ (row.performerName || '?').charAt(0) }}
            </div>
          </div>

          <!-- 이름 + 소개 (클릭 시 아티스트 상세) -->
          <RouterLink
            :to="`/performers/${row.performerId}`"
            class="min-w-0 flex-1 cursor-pointer"
          >
            <div class="truncate text-base font-bold text-slate-900">{{ row.performerName || '아티스트' }}</div>
            <div class="mt-1 text-xs font-medium text-emerald-600">좋아요한 아티스트</div>
            <p
              v-if="row.performerDescription"
              class="mt-1.5 line-clamp-2 text-xs text-slate-500"
            >
              {{ row.performerDescription }}
            </p>
          </RouterLink>

          <!-- 좋아요 취소 -->
          <button
            type="button"
            class="flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
            @click.stop="cancelLike(row)"
          >
            <Heart class="h-4 w-4 fill-red-500 text-red-500" />
            좋아요 취소
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { Heart } from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'MyPerformerLikesView',
  components: { Heart },
  data() {
    return {
      api: null,
      rows: [],
      loading: false,
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
        const list = await this.api.get(ENDPOINTS.performerLikeList())
        const arr = Array.isArray(list) ? list : list?.content ?? []
        this.rows = arr.map((item) => ({
          id: item.id,
          performerId: item.performerId,
          performerName: item.performerName ?? '',
          performerProfileImgUrl: item.performerProfileImgUrl ?? null,
          performerDescription: item.performerDescription ?? null,
          memberId: item.memberId,
        }))
      } catch {
        this.rows = []
      } finally {
        this.loading = false
      }
    },
    async cancelLike(row) {
      const performerId = row?.performerId
      if (performerId == null || performerId === '') return
      try {
        await this.api.del(ENDPOINTS.performerDeleteLike(performerId))
        this.rows = this.rows.filter((r) => r.performerId !== row.performerId)
      } catch (e) {
        console.warn('Like cancel failed', e)
      }
    },
  },
}
</script>
