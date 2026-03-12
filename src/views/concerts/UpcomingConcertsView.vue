<template>
  <div class="mx-auto max-w-6xl space-y-8 pb-12 pt-8 px-4">
    <!-- 헤더 -->
    <header class="flex items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">오픈 예정</h1>
        <p class="mt-1 text-sm text-slate-500">
          곧 티켓 오픈 예정인 공연들을 한눈에 모아봤어요.
        </p>
      </div>
      <p class="text-xs text-slate-400">
        총
        <span class="font-semibold text-slate-700">{{ totalCount.toLocaleString() }}</span>
        개 공연
      </p>
    </header>

    <!-- 상단: 오픈 예정 메인 캐러셀 (필터 무관, 오픈일 기준 상위 10개) -->
    <section class="space-y-4">
      <div v-if="heroLoading" class="flex gap-4 overflow-hidden py-2">
        <div
          v-for="i in 5"
          :key="'hero-skeleton-' + i"
          class="h-[340px] w-[260px] flex-shrink-0 animate-pulse rounded-2xl bg-slate-200"
        />
      </div>
      <template v-else-if="heroItems.length">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-semibold text-slate-900">가장 먼저 오픈하는 공연</h2>
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
            :disabled="!canScrollHeroLeft"
            @click="scrollHero('left')"
          >
            <ChevronLeft class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
            :disabled="!canScrollHeroRight"
            @click="scrollHero('right')"
          >
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div class="relative">
        <div
          ref="heroScrollRef"
          class="flex gap-4 overflow-x-auto scroll-smooth pb-2"
          style="scrollbar-width:none;-ms-overflow-style:none"
          @scroll="updateHeroScrollState"
        >
          <button
            v-for="c in heroItems"
            :key="c.id"
            type="button"
            class="group flex w-[260px] flex-shrink-0 flex-col rounded-2xl bg-white text-left shadow-sm ring-1 ring-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            @click="$router.push(`/concerts/${c.id}`)"
          >
            <div class="relative overflow-hidden rounded-t-2xl bg-slate-900" style="aspect-ratio:3/4">
              <img
                :src="c.posterUrl"
                :alt="c.title"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div class="space-y-1.5 px-3.5 py-3">
              <p class="text-[11px] font-semibold text-indigo-600">
                {{ formatOpenDateTime(c.ticketingOpenAt) }}
              </p>
              <p class="line-clamp-2 text-sm font-bold leading-snug text-slate-900">
                {{ c.title }}
              </p>
              <p class="text-[11px] text-slate-500">
                {{ c.venueName || '-' }}
              </p>
            </div>
          </button>
        </div>
      </div>
      </template>
    </section>

    <!-- 필터 바 -->
    <section class="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div class="flex items-center gap-2 text-xs font-semibold text-slate-600">
        <span class="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white">
          1년 오픈순
        </span>
        <span class="text-slate-400">오늘 기준 1년 이내 오픈 예정 공연</span>
      </div>
      <div class="ml-auto flex flex-wrap items-center gap-2">
        <!-- 장르 -->
        <div class="relative">
          <select
            v-model="filters.category"
            class="h-8 rounded-full border border-slate-200 bg-white px-3 pr-7 text-xs font-medium text-slate-700 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="">장르 전체</option>
            <option
              v-for="opt in categoryOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
        <!-- 지역 -->
        <div class="relative">
          <select
            v-model="filters.region"
            class="h-8 rounded-full border border-slate-200 bg-white px-3 pr-7 text-xs font-medium text-slate-700 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="">지역 전체</option>
            <option
              v-for="opt in regionOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
        <!-- 필터 초기화 -->
        <button
          v-if="hasActiveFilters"
          type="button"
          class="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
          @click="resetFilters"
        >
          <RotateCcw class="h-3.5 w-3.5" />
          <span>필터 초기화</span>
        </button>
      </div>
    </section>

    <!-- 목록 -->
    <section>
      <div v-if="loading" class="py-12 text-center text-sm text-slate-400">
        오픈 예정 공연을 불러오는 중입니다…
      </div>
      <div
        v-else-if="items.length === 0"
        class="py-12 text-center text-sm text-slate-400"
      >
        조건에 맞는 오픈 예정 공연이 없습니다.
      </div>
      <div
        v-else
        class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6"
      >
        <button
          v-for="c in items"
          :key="'grid-' + c.id"
          type="button"
          class="group flex flex-col text-left"
          @click="$router.push(`/concerts/${c.id}`)"
        >
          <div class="overflow-hidden rounded-2xl bg-slate-900" style="aspect-ratio:3/4">
            <img
              :src="c.posterUrl"
              :alt="c.title"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <p class="mt-2 text-[11px] font-semibold text-indigo-600">
            {{ formatOpenShort(c.ticketingOpenAt) }}
          </p>
          <p class="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-slate-900">
            {{ c.title }}
          </p>
          <p class="mt-0.5 text-[11px] text-slate-500">
            {{ c.venueName || '-' }}
          </p>
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { CONCERT_CATEGORY_OPTIONS, getCategoryLabel } from '../../lib/constants/concertCategory'

const REGION_OPTIONS = [
  { value: '서울', label: '서울' },
  { value: '경기', label: '경기' },
  { value: '인천', label: '인천' },
  { value: '부산', label: '부산' },
  { value: '대구', label: '대구' },
  { value: '대전', label: '대전' },
  { value: '광주', label: '광주' },
  { value: '울산', label: '울산' },
  { value: '세종', label: '세종' },
  { value: '강원', label: '강원' },
  { value: '충북', label: '충북' },
  { value: '충남', label: '충남' },
  { value: '전북', label: '전북' },
  { value: '전남', label: '전남' },
  { value: '경북', label: '경북' },
  { value: '경남', label: '경남' },
  { value: '제주', label: '제주' },
]

const DEFAULT_IMG =
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=400&q=60'

export default {
  name: 'UpcomingConcertsView',
  components: { ChevronLeft, ChevronRight, RotateCcw },
  data() {
    return {
      api: null,
      /** 상단 캐러셀: 필터 없이 오픈일 기준 상위 10개만 (필터와 무관) */
      heroItems: [],
      /** 하단 그리드: 필터 적용된 목록 */
      items: [],
      totalCount: 0,
      loading: false,
      heroLoading: false,
      filters: {
        category: '',
        region: '',
      },
      categoryOptions: CONCERT_CATEGORY_OPTIONS,
      regionOptions: REGION_OPTIONS,

      heroScrollLeft: 0,
      heroScrollWidth: 0,
      heroClientWidth: 0,
    }
  },
  computed: {
    hasActiveFilters() {
      return !!(this.filters.category || this.filters.region)
    },
    canScrollHeroLeft() {
      return this.heroScrollLeft > 2
    },
    canScrollHeroRight() {
      const max = this.heroScrollWidth - this.heroClientWidth
      return max > 2 && this.heroScrollLeft < max - 2
    },
  },
  watch: {
    'filters.category'() {
      this.load()
    },
    'filters.region'() {
      this.load()
    },
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.loadHero()
    this.load()
    window.addEventListener('resize', this.updateHeroScrollState)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateHeroScrollState)
  },
  methods: {
    getCategoryLabel,
    resetFilters() {
      this.filters.category = ''
      this.filters.region = ''
      // watch에서 load() 호출됨
    },
    mapConcert(c) {
      return {
        id: c.id,
        title: c.title ?? c.name,
        category: c.category ?? '',
        posterUrl:
          c.thumImgUrl ??
          c.thum_img_url ??
          c.posterUrl ??
          c.thumbnailUrl ??
          c.imageUrl ??
          DEFAULT_IMG,
        venueName: c.venueName ?? c.venue?.name ?? null,
        ticketingOpenAt: c.ticketingOpenAt ?? c.ticketing_open_at ?? null,
      }
    },
    /** 상단 "가장 먼저 오픈하는 공연": 필터 없이 오픈일 기준 10개만 (최초 1회) */
    async loadHero() {
      this.heroLoading = true
      try {
        const res = await this.api.get(
          ENDPOINTS.concertsUpcoming({
            page: 0,
            size: 10,
            sort: 'ticketingOpenAt,asc',
          }),
        )
        const list = Array.isArray(res) ? res : res?.content ?? res?.items ?? []
        this.heroItems = list.map(this.mapConcert)
        this.$nextTick(this.updateHeroScrollState)
      } finally {
        this.heroLoading = false
      }
    },
    /** 하단 그리드: 장르/지역 필터 적용, 필터 변경 시에만 재요청 */
    async load() {
      this.loading = true
      try {
        const res = await this.api.get(
          ENDPOINTS.concertsUpcoming({
            page: 0,
            size: 60,
            category: this.filters.category || undefined,
            regions: this.filters.region ? [this.filters.region] : [],
            sort: 'ticketingOpenAt,asc',
          }),
        )
        const list = Array.isArray(res) ? res : res?.content ?? res?.items ?? []
        this.items = list.map(this.mapConcert)
        this.totalCount = res?.totalElements ?? this.items.length
      } finally {
        this.loading = false
      }
    },
    updateHeroScrollState() {
      const el = this.$refs.heroScrollRef
      if (!el) return
      this.heroScrollLeft = el.scrollLeft
      this.heroScrollWidth = el.scrollWidth
      this.heroClientWidth = el.clientWidth
    },
    scrollHero(dir) {
      const el = this.$refs.heroScrollRef
      if (!el) return
      const step = Math.max(260, el.clientWidth * 0.8)
      el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' })
    },
    formatOpenDateTime(dateStr) {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return '-'
      const days = ['일', '월', '화', '수', '목', '금', '토']
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const mi = String(d.getMinutes()).padStart(2, '0')
      return `${mm}.${dd}(${days[d.getDay()]}) ${hh}:${mi}`
    },
    formatOpenShort(dateStr) {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return '-'
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const base = new Date(d)
      base.setHours(0, 0, 0, 0)
      const diff = Math.round((base - today) / (1000 * 60 * 60 * 24))
      const hh = String(d.getHours()).padStart(2, '0')
      const mi = String(d.getMinutes()).padStart(2, '0')
      if (diff === 0) return `오늘 ${hh}:${mi}`
      if (diff === 1) return `내일 ${hh}:${mi}`
      if (diff === 2) return `모레 ${hh}:${mi}`
      const days = ['일', '월', '화', '수', '목', '금', '토']
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${mm}.${dd}(${days[d.getDay()]}) ${hh}:${mi}`
    },
  },
}
</script>

