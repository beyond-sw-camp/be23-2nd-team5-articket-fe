<template>
  <div class="mx-auto space-y-6 pb-12">
    <!-- 헤더 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">좋아요한 공연</h1>
        <p class="mt-1 text-sm text-slate-500">마이페이지 · 내가 좋아요한 공연 목록</p>
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
      <p class="text-sm text-slate-500">좋아요한 공연이 없습니다.</p>
      <RouterLink
        to="/"
        class="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        공연 둘러보기
      </RouterLink>
    </div>

    <!-- 목록 -->
    <div v-else class="space-y-4">
      <div
        v-for="row in rows"
        :key="row.id"
        class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 sm:flex-row sm:items-center sm:p-5"
      >
        <RouterLink
          :to="`/concerts/${row.id}`"
          class="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center"
        >
          <div class="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-32 sm:w-24">
            <img
              :src="row.posterUrl || ''"
              :alt="row.title"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-base font-bold text-slate-900">{{ row.title || '공연' }}</p>
            <p v-if="row.categoryLabel" class="mt-1 text-sm text-slate-500">{{ row.categoryLabel }}</p>
            <p v-if="row.venueName" class="mt-0.5 text-xs text-slate-400">{{ row.venueName }}</p>
          </div>
        </RouterLink>
        <div class="flex shrink-0 items-center gap-2">
          <RouterLink
            :to="`/concerts/${row.id}`"
            class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            자세히 보기
          </RouterLink>
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
            @click.stop="cancelLike(row)"
          >
            <Heart class="h-4 w-4 fill-red-500 text-red-500" />
            좋아요 취소
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Heart } from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { getCategoryLabel } from '../../lib/constants/concertCategory'

export default {
  name: 'MyConcertLikesView',
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
        const res = await this.api.get(ENDPOINTS.concertLikeList({ page: 0, size: 50 }))
        const arr = Array.isArray(res) ? res : res?.content ?? res?.items ?? []
        this.rows = arr.map((item) => ({
          id: item.concertId ?? item.id ?? item.concert_id,
          title: item.title ?? item.concertName ?? '-',
          posterUrl: item.posterUrl ?? item.poster_url ?? item.concertUrl ?? item.thumbnailUrl ?? '',
          category: item.category ?? null,
          categoryLabel: getCategoryLabel(item.category),
          venueName: item.venueName ?? item.venue_name ?? null,
        }))
      } catch {
        this.rows = []
      } finally {
        this.loading = false
      }
    },
    async cancelLike(row) {
      const id = row?.id
      if (id == null || id === '') return
      try {
        await this.api.del(ENDPOINTS.concertUnlike(id))
        this.rows = this.rows.filter((r) => r.id !== id)
      } catch (e) {
        console.warn('Concert like cancel failed', e)
      }
    },
  },
}
</script>
