<template>
  <div class="mx-auto space-y-6 pb-12">
    <!-- Header -->
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

    <!-- Loading State -->
    <div
      v-if="loading && page === 0"
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
        <span class="text-sm font-medium">좋아요 목록을 불러오는 중…</span>
      </div>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="rows.length === 0"
      title="좋아요한 공연이 없습니다."
      description="마음에 드는 공연을 찾아보세요!"
    >
      <RouterLink
        to="/"
        class="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        공연 보러가기
      </RouterLink>
    </EmptyState>

    <!-- List -->
    <div v-else class="space-y-4">
      <div
        v-for="row in rows"
        :key="row.concertId"
        class="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 sm:flex-row sm:items-center sm:p-5"
      >
        <RouterLink
          :to="`/concerts/${row.concertId}`"
          class="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center"
        >
          <!-- Poster Thumbnail -->
          <div class="h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-36 sm:w-28">
            <img
              v-if="row.posterUrl"
              :src="row.posterUrl"
              :alt="row.title"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div v-else class="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
              <ImageIcon class="h-8 w-8" />
            </div>
          </div>

          <!-- Concert Info -->
          <div class="min-w-0 flex-1 space-y-1.5">
            <div class="flex items-center gap-2">
              <UiBadge tone="soft" :color="getCategoryColor(row.category)">
                {{ row.categoryLabel }}
              </UiBadge>
            </div>
            <h3 class="line-clamp-1 text-lg font-bold text-slate-900 group-hover:text-red-600 transition">
              {{ row.title }}
            </h3>
            <div class="flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:items-center sm:gap-3">
              <div v-if="row.venueName" class="flex items-center gap-1">
                <MapPin class="h-3.5 w-3.5" />
                <span>{{ row.venueName }}</span>
              </div>
            </div>
          </div>
        </RouterLink>

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
            @click.stop="cancelLike(row)"
          >
            <Heart class="h-4 w-4 fill-red-500 text-red-500" />
            좋아요 취소
          </button>
          <RouterLink
            :to="`/concerts/${row.concertId}`"
            class="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            상세 보기
          </RouterLink>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="!last" class="flex justify-center pt-4">
        <UiButton variant="ghost" :disabled="loading" @click="loadMore">
          <template v-if="loading">
            <svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            불러오는 중...
          </template>
          <template v-else>
            더 보기
          </template>
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script>
import { Heart, MapPin, Image as ImageIcon } from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { getCategoryLabel } from '../../lib/constants/concertCategory'
import EmptyState from '../../components/common/EmptyState.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'

export default {
  name: 'MyConcertLikesView',
  components: {
    Heart,
    MapPin,
    ImageIcon,
    EmptyState,
    UiBadge,
    UiButton
  },
  data() {
    return {
      api: null,
      rows: [],
      loading: false,
      page: 0,
      size: 10,
      totalElements: 0,
      last: true
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  methods: {
    async load(isMore = false) {
      if (!isMore) {
        this.page = 0
        this.rows = []
      }
      this.loading = true
      try {
        const res = await this.api.get(ENDPOINTS.concertLikeList({
          page: this.page,
          size: this.size
        }))

        // Spring Pageable Response Handling
        const content = res?.content ?? []
        const mapped = content.map((item) => ({
          concertId: item.concertId,
          title: item.title || '제목 없음',
          posterUrl: item.posterUrl,
          category: item.category,
          categoryLabel: getCategoryLabel(item.category),
          venueName: item.venueName
        }))

        if (isMore) {
          this.rows = [...this.rows, ...mapped]
        } else {
          this.rows = mapped
        }

        this.totalElements = res?.totalElements ?? this.rows.length
        this.last = res?.last ?? true
      } catch (err) {
        console.error('Failed to load liked concerts:', err)
        if (!isMore) this.rows = []
      } finally {
        this.loading = false
      }
    },
    loadMore() {
      if (this.last || this.loading) return
      this.page += 1
      this.load(true)
    },
    async cancelLike(row) {
      const id = row?.concertId
      if (!id) return

      try {
        // Toggle like (POST to the same endpoint toggles in this system)
        await this.api.post(ENDPOINTS.concertLike(id))
        // Remove from list
        this.rows = this.rows.filter((r) => r.concertId !== id)
        this.totalElements -= 1

        // If page becomes empty and it's not the last page, maybe load more or adjust
        if (this.rows.length === 0 && !this.last) {
          this.load()
        }
      } catch (err) {
        console.warn('Concert like cancel failed:', err)
      }
    },
    getCategoryColor(category) {
      const map = {
        MUSICAL: 'red',
        CONCERT: 'blue',
        THEATRE: 'amber',
        CLASSIC: 'green',
        SPORTS: 'slate',
        EXHIBITION: 'emerald', // emerald is not in UiBadge colors, map to blue or green
        FAMILY: 'amber'
      }
      return map[category] || 'slate'
    }
  }
}
</script>
