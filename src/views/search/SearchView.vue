<template>
  <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
    <!-- 좌측 필터 패널 (검색어 있을 때만) -->
    <ConcertFilterPanel
      v-if="q"
      v-model="filters"
      :total-count="concertsTotalElements"
      class="w-full shrink-0 lg:sticky lg:top-36 lg:w-64"
      @apply="onFilterApply"
    />

    <!-- 우측 검색 결과 -->
    <div class="min-w-0 flex-1 space-y-8">
    <div>
      <h1 class="text-xl font-bold text-slate-900">검색 결과</h1>
      <p v-if="q" class="mt-1 text-sm text-slate-500">"{{ q }}"에 대한 검색 결과입니다.</p>
    </div>

    <div v-if="!q" class="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
      <p class="text-sm text-slate-500">검색어를 입력해 주세요.</p>
    </div>

    <template v-else>
      <!-- 아티스트 -->
      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="mb-5 text-base font-bold text-slate-900">아티스트 ({{ performersTotalElements.toLocaleString() }})</h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
          <!-- 스켈레톤: 로딩 중 -->
          <template v-if="performersLoading">
            <div
              v-for="i in performerPageSize"
              :key="`skeleton-${i}`"
              class="flex min-h-[112px] items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div class="h-14 w-14 shrink-0 animate-pulse rounded-full bg-slate-200" />
              <div class="min-w-0 flex-1 space-y-2">
                <div class="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div class="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                <div class="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          </template>
          <!-- 빈 상태 -->
          <div
            v-else-if="performers.length === 0"
            class="col-span-full py-8 text-center text-sm text-slate-500"
          >
            검색된 아티스트가 없습니다.
          </div>
          <!-- 컨텐츠 -->
          <template v-else>
            <button
              v-for="p in performers"
              :key="p.id"
              type="button"
              class="group flex min-h-[112px] items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:shadow-md"
              @click="$router.push(`/performers/${p.id}`)"
            >
              <div class="shrink-0">
                <img
                  v-if="p.profileImgUrl"
                  :src="p.profileImgUrl"
                  :alt="p.name"
                  class="h-14 w-14 rounded-full object-cover border border-slate-200"
                />
                <div
                  v-else
                  class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-lg font-bold text-slate-500"
                >
                  {{ p.name?.charAt(0) ?? '?' }}
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="font-semibold text-slate-900 truncate">{{ p.name }}</h3>
                <p v-if="p.birth" class="mt-0.5 text-xs text-slate-400">{{ p.birth }}</p>
                <p v-if="p.description" class="mt-0.5 text-xs text-slate-500 line-clamp-2">{{ p.description }}</p>
                <p class="mt-0.5 text-xs text-slate-500">좋아요 {{ (p.likeCount ?? 0).toLocaleString() }}명</p>
              </div>
            </button>
            <!-- 빈 슬롯 플레이스홀더: 레이아웃 점프 방지 -->
            <div
              v-for="i in performerPlaceholderCount"
              :key="`ph-${i}`"
              class="flex min-h-[112px] items-center gap-4 rounded-xl border border-transparent p-4 opacity-0 pointer-events-none select-none"
              aria-hidden="true"
            >
              <div class="h-14 w-14 shrink-0 rounded-full bg-slate-100" />
              <div class="min-w-0 flex-1 space-y-2">
                <div class="h-4 w-3/4 rounded bg-slate-100" />
                <div class="h-3 w-1/2 rounded bg-slate-100" />
              </div>
            </div>
          </template>
        </div>
        <!-- 아티스트 페이지네이션 -->
        <div v-if="performersTotalPages > 1" class="mt-5 flex items-center justify-center gap-2">
          <UiButton
            variant="ghost"
            class="h-10 px-3 text-sm"
            :disabled="performerPage <= 0"
            @click="goToPerformerPage(performerPage - 1)"
          >
            이전
          </UiButton>
          <span class="text-sm text-slate-600">{{ performerPage + 1 }} / {{ performersTotalPages }}</span>
          <UiButton
            variant="ghost"
            class="h-10 px-3 text-sm"
            :disabled="performerPage >= performersTotalPages - 1"
            @click="goToPerformerPage(performerPage + 1)"
          >
            다음
          </UiButton>
        </div>
      </section>

      <!-- 공연 -->
      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="mb-5 text-base font-bold text-slate-900">공연 ({{ concertsTotalElements.toLocaleString() }})</h2>
        <div v-if="concertsLoading && concerts.length === 0" class="py-8 text-center text-sm text-slate-500">불러오는 중…</div>
        <div v-else-if="concerts.length === 0" class="py-8 text-center text-sm text-slate-500">
          검색된 공연이 없습니다.
        </div>
        <template v-else>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="c in displayedConcerts"
              :key="c.id"
              type="button"
              class="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left transition hover:border-slate-300 hover:shadow-md"
              @click="$router.push(`/concerts/${c.id}`)"
            >
              <div class="aspect-[3/4] overflow-hidden bg-slate-200">
                <img
                  :src="c.posterUrl"
                  :alt="c.title"
                  class="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <div class="flex flex-1 flex-col gap-1 p-3">
                <h3 class="line-clamp-2 text-sm font-semibold text-slate-900">{{ c.title }}</h3>
                <p class="text-xs text-slate-500">{{ c.venueName || '-' }}</p>
                <p class="text-xs text-slate-400">{{ formatDateRange(c.scheduleStartDate, c.scheduleEndDate) }}</p>
              </div>
            </button>
          </div>
          <!-- 스크롤 페이징 트리거 (Intersection Observer 대상) -->
          <div ref="concertsLoadMoreRef" class="h-1 min-h-[1px]" />
          <div v-if="concertsLoadingMore" class="py-4 text-center text-sm text-slate-500">불러오는 중…</div>
        </template>
      </section>
    </template>
    </div>
  </div>
</template>

<script>
import { MapPin } from 'lucide-vue-next'
import ConcertFilterPanel from '../../components/concert/ConcertFilterPanel.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

const MAX_PREVIEW = 3
const MAX_FULL = 50
const PERFORMER_PAGE_SIZE = 3
const CONCERT_PAGE_SIZE = 3

export default {
  name: 'SearchView',
  components: {
    MapPin,
    ConcertFilterPanel,
    UiButton,
  },
  data() {
    return {
      concerts: [],
      concertPage: 0,
      concertsTotalPages: 1,
      concertsTotalElements: 0,
      concertsDisplayLimit: CONCERT_PAGE_SIZE,
      concertsObserver: null,
      performers: [],
      performerPage: 0,
      performersTotalElements: 0,
      performersTotalPages: 0,
      venues: [],
      filters: {},
      concertsLoading: false,
      concertsLoadingMore: false,
      performersLoading: false,
      venuesLoading: false,
      api: null,
      performerPageSize: PERFORMER_PAGE_SIZE,
    }
  },
  computed: {
    q() {
      return this.$route.query.q || ''
    },
    tab() {
      return this.$route.query.tab || ''
    },
    expandVenues() {
      return this.tab === 'venues'
    },
    displayedConcerts() {
      return this.concerts.slice(0, this.concertsDisplayLimit)
    },
    concertsHasMore() {
      return this.concertPage < this.concertsTotalPages - 1
    },
    displayedVenues() {
      if (this.expandVenues) return this.venues
      return this.venues.slice(0, MAX_PREVIEW)
    },
    performerPlaceholderCount() {
      if (this.performersLoading || this.performers.length === 0) return 0
      return Math.max(0, this.performerPageSize - this.performers.length)
    },
  },
  watch: {
    q: {
      immediate: true,
      handler(v) {
        if (v && v.trim()) {
          this.$nextTick(() => {
            this.search()
            this.setupConcertsObserver()
          })
        }
      },
    },
    tab() {
      if (this.q && this.q.trim()) this.search()
    },
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.setupConcertsObserver()
  },
  beforeUnmount() {
    this.concertsObserver?.disconnect()
  },
  methods: {
    formatDateRange(start, end) {
      if (!start && !end) return '-'
      const fmt = (d) => {
        if (!d) return ''
        const date = typeof d === 'string' ? new Date(d) : d
        if (isNaN(date.getTime())) return ''
        return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
      }
      const s = fmt(start)
      const e = fmt(end)
      return s && e && s !== e ? `${s} ~ ${e}` : s || e || '-'
    },
    async search() {
      const q = this.q?.trim()
      if (!q) return

      this.concertsLoading = true
      this.performersLoading = true
      this.venuesLoading = true

      this.performerPage = 0
      this.concertPage = 0
      this.concertsDisplayLimit = CONCERT_PAGE_SIZE
      await Promise.all([
        this.loadConcerts(q, 0, false),
        this.loadPerformers(q, 0),
        this.loadVenues(q),
      ])

      this.concertsLoading = false
      this.performersLoading = false
      this.venuesLoading = false
      this.$nextTick(() => this.setupConcertsObserver())
    },
    buildConcertParams(q, page) {
      const params = { keyword: q, size: CONCERT_PAGE_SIZE, page }
      if (this.filters.genres?.length) params.categories = this.filters.genres
      if (this.filters.salesStatus) params.status = this.filters.salesStatus
      if (this.filters.regions?.length) params.regions = this.filters.regions
      if (this.filters.selectedDateStart) {
        const d = new Date(this.filters.selectedDateStart)
        // LocalDateTime 포맷(yyyy-MM-ddTHH:mm:ss)으로 하루 시작 시각 전달
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
        params.filterStartDate = start.toISOString().slice(0, 19)
      }
      if (this.filters.selectedDateEnd) {
        const d = new Date(this.filters.selectedDateEnd)
        // LocalDateTime 포맷(yyyy-MM-ddTHH:mm:ss)으로 하루 끝 시각 전달
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
        params.filterEndDate = end.toISOString().slice(0, 19)
      }
      return params
    },
    async loadConcerts(q, page = 0, append = false) {
      try {
        const apiParams = this.buildConcertParams(q, page)
        const res = await this.api.get(ENDPOINTS.searchConcerts(apiParams))
        const list = res.content ?? res.items ?? []
        const mapped = list.map((c) => ({
          id: c.id,
          title: c.title ?? c.name,
          category: c.category ?? '',
          status: c.status ?? 'PUBLISHED',
          posterUrl:
            c.thumImgUrl ?? c.thum_img_url ?? c.posterUrl ?? c.thumbnailUrl ?? c.imageUrl ??
            'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=60',
          venueName: c.venueName ?? c.venue?.name ?? null,
          scheduleStartDate: c.scheduleStartDate ?? c.schedule_start_date,
          scheduleEndDate: c.scheduleEndDate ?? c.schedule_end_date,
        }))
        if (append) {
          const existingIds = new Set(this.concerts.map((x) => x.id))
          const newItems = mapped.filter((x) => !existingIds.has(x.id))
          this.concerts = [...this.concerts, ...newItems]
        } else {
          this.concerts = mapped
        }
        this.concertPage = page
        this.concertsTotalPages = Math.max(1, res?.totalPages ?? 1)
        if (!append) {
          this.concertsTotalElements = res?.totalElements ?? this.concerts.length
        }
      } catch {
        if (!append) {
          this.concerts = []
          this.concertsTotalElements = 0
        }
      }
    },
    onConcertsIntersect(entries) {
      const el = entries[0]
      if (!el?.isIntersecting) return
      const q = this.q?.trim()
      if (!q || this.concertsLoading || this.concertsLoadingMore) return
      if (this.concertsDisplayLimit < this.concerts.length) {
        this.concertsDisplayLimit = Math.min(
          this.concertsDisplayLimit + CONCERT_PAGE_SIZE,
          this.concerts.length
        )
        return
      }
      if (!this.concertsHasMore) return
      this.concertsLoadingMore = true
      this.loadConcerts(q, this.concertPage + 1, true).then(() => {
        this.concertsDisplayLimit = Math.min(
          this.concertsDisplayLimit + CONCERT_PAGE_SIZE,
          this.concerts.length
        )
      }).finally(() => {
        this.concertsLoadingMore = false
      })
    },
    async loadPerformers(q, page = 0) {
      try {
        const res = await this.api.get(ENDPOINTS.performers({ name: q, size: PERFORMER_PAGE_SIZE, page }))
        const list = res.content ?? res.items ?? []
        this.performers = list.map((p) => ({
          id: p.id,
          name: p.name ?? '-',
          profileImgUrl: p.profileImgUrl ?? p.profile_img_url ?? p.imageUrl ?? null,
          likeCount: p.likeCount ?? p.like_count ?? 0,
          birth: p.birth ?? null,
          description: p.description ?? '',
        }))
        this.performersTotalElements = res?.totalElements ?? this.performers.length
        this.performersTotalPages = Math.max(1, res?.totalPages ?? 1)
      } catch {
        this.performers = []
        this.performersTotalElements = 0
        this.performersTotalPages = 1
      }
    },
    goToPerformerPage(page) {
      const q = this.q?.trim()
      if (!q || page < 0) return
      this.performerPage = page
      this.performersLoading = true
      this.loadPerformers(q, page).finally(() => {
        this.performersLoading = false
      })
    },
    async loadVenues(q) {
      const size = this.expandVenues ? MAX_FULL : MAX_PREVIEW + 1
      try {
        const res = await this.api.get(
          ENDPOINTS.searchVenues({ keyword: q, name: q, size, page: 0 })
        )
        const list = res.content ?? res.items ?? Array.isArray(res) ? res : []
        this.venues = list.map((v) => ({
          id: v.id,
          name: v.name ?? '-',
          formattedAddress: v.formattedAddress ?? v.formatted_address,
          address: v.address,
        }))
      } catch {
        this.venues = []
      }
    },
    setupConcertsObserver() {
      this.concertsObserver?.disconnect()
      this.$nextTick(() => {
        const el = this.$refs.concertsLoadMoreRef
        if (!el || !this.q?.trim()) return
        this.concertsObserver = new IntersectionObserver(
          (entries) => this.onConcertsIntersect(entries),
          { rootMargin: '100px', threshold: 0 }
        )
        this.concertsObserver.observe(el)
      })
    },
    onFilterApply() {
      const q = this.q?.trim()
      if (!q) return
      this.concertPage = 0
      this.concertsDisplayLimit = CONCERT_PAGE_SIZE
      this.concertsLoading = true
      this.loadConcerts(q, 0, false).finally(() => {
        this.concertsLoading = false
        this.$nextTick(() => this.setupConcertsObserver())
      })
    },
    goToTab(tab) {
      this.$router.replace({
        path: '/search',
        query: { q: this.q, ...(tab ? { tab } : {}) },
      })
    },
  },
}
</script>
