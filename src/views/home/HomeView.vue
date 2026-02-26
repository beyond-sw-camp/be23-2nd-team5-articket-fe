<template>
  <div class="relative min-h-screen w-full min-w-0 text-slate-900">
    <div class="grid w-full min-w-0 gap-8 pt-2">
      <!-- 히어로 + 아티스트 스팟라이트 (lg에서 높이 330px로 동일) -->
      <div class="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3 lg:grid-rows-[330px] lg:gap-8 lg:items-stretch">
        <!-- 좌측: 히어로 배너 (모바일 가로형 / lg에서 330px) -->
        <div
          class="group relative aspect-[2/1] min-h-[200px] min-w-0 w-full overflow-hidden rounded-[40px] shadow-2xl transition-all duration-700 hover:shadow-[#E53935]/10 lg:col-span-2 lg:row-span-1 lg:aspect-auto lg:h-full lg:min-h-0"
          @click="$router.push('/concerts')"
        >
          <img
            class="h-full w-full max-w-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
            src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1200&h=600&auto=format&fit=crop"
            alt="hero"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
          <div class="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
            <div class="flex flex-wrap items-center gap-3">
              <span class="inline-flex items-center rounded-full bg-[#E53935] px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                Hot Now
              </span>
              <span class="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                <Clock class="h-3.5 w-3.5" />
                WORLD TOUR 2026
              </span>
            </div>
            <h2 class="mt-4 text-4xl font-black leading-[0.95] tracking-tighter text-white drop-shadow-2xl lg:text-6xl">
              COLDPLAY LIVE<br />
              <span class="italic text-white/50">IN SEOUL</span>
            </h2>
            <p class="mt-2 hidden text-sm text-white/60 sm:block">드디어 한국 상륙! 역대급 스케일의 공연을 직접 확인하세요.</p>
            <div class="mt-5 flex flex-wrap items-center gap-4">
              <button
                class="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-black text-slate-900 shadow-xl transition-all duration-300 hover:bg-[#E53935] hover:text-white active:scale-95"
                type="button"
                @click.stop="$router.push('/concerts')"
              >
                티켓 예매하기
              </button>
              <button
                class="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-sm transition hover:bg-white/10"
                type="button"
                @click.stop="$router.push('/concerts')"
              >
                <Info class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- 우측: Artist Spotlight (고정 높이, 이미지 유무와 무관 동일 크기 / lg에서 히어로와 동일 높이) -->
        <div class="relative flex w-full max-w-[280px] min-w-0 flex-col self-start rounded-2xl border border-slate-200 p-4 shadow-lg transition-all duration-500 hover:shadow-xl sm:mx-auto sm:max-w-[280px] lg:mx-0 lg:h-[330px] lg:max-w-none lg:self-stretch lg:p-5">
          <div class="flex gap-1.5 justify-end">
            <span
              v-for="(_, i) in performers.slice(0, 5)"
              :key="i"
              class="rounded-full transition-all duration-500"
              :class="(currentPerformerIdx % Math.min(performers.length, 5)) === i ? 'h-0.5 w-4 bg-[#E53935]' : 'h-0.5 w-1.5 bg-slate-300'"
            />
          </div>
          <div class="mt-1 space-y-0.5">
            <h3 class="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Artist Spotlight</h3>
            <div class="h-0.5 w-6 bg-[#E53935]" />
          </div>

          <!-- 고정 높이 영역: 로딩/공연자/없음 모두 동일 높이 -->
          <div class="mt-3 flex h-[200px] flex-col items-center justify-center">
            <!-- 로딩 스켈레톤 -->
            <template v-if="performersLoading">
              <div class="h-32 w-32 animate-pulse rounded-2xl border border-slate-200" />
              <div class="mt-2 h-3 w-20 animate-pulse rounded border border-slate-200" />
              <div class="mt-1 h-4 w-24 animate-pulse rounded border border-slate-200" />
            </template>

            <template v-else-if="currentPerformer">
              <div class="flex flex-col items-center">
                <div class="relative h-[120px] w-[90px] flex-shrink-0">
                  <div
                    class="h-full w-full cursor-pointer overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:scale-105"
                    @click="$router.push(`/performers/${currentPerformer.id}`)"
                  >
                    <img
                      v-if="currentPerformer.profileImgUrl"
                      :src="currentPerformer.profileImgUrl"
                      :alt="currentPerformer.name"
                      class="h-full w-full object-cover"
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center text-2xl font-black text-white"
                      :style="{ background: avatarGradient(currentPerformerIdx) }"
                    >
                      {{ currentPerformer.name?.charAt(0) ?? '?' }}
                    </div>
                  </div>
                  <div
                    class="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-lg bg-[#E53935] text-white shadow"
                    @click="$router.push(`/performers/${currentPerformer.id}`)"
                  >
                    <Heart class="h-4 w-4 fill-white" />
                  </div>
                </div>
                <Transition name="artist-fade" mode="out-in">
                  <div :key="currentPerformerIdx" class="mt-2 space-y-0.5 text-center">
                    <p class="text-[9px] font-black uppercase tracking-widest text-[#E53935]">
                      ♥ {{ formatCount(currentPerformer.likeCount) }}
                    </p>
                    <h4 class="text-base font-black tracking-tight text-slate-900">
                      {{ currentPerformer.name }}
                    </h4>
                  </div>
                </Transition>
              </div>
            </template>

            <template v-else>
              <span class="text-xs text-slate-500">아티스트 정보 없음</span>
            </template>
          </div>

          <div class="mt-3 h-10 w-full">
            <button
              v-if="currentPerformer && !performersLoading"
              class="h-full w-full rounded-xl bg-slate-900 py-2.5 text-[10px] font-black text-white transition-all duration-300 hover:bg-[#E53935] active:scale-95"
              type="button"
              @click="$router.push(`/performers/${currentPerformer.id}`)"
            >
              <span class="inline-flex items-center gap-1.5">채널 방문 <ChevronRight class="h-3 w-3" /></span>
            </button>
          </div>
        </div>
      </div>

      <!-- For U / Next-Gen Discovery (레퍼런스 스타일 유지 + 기존 UI) -->
      <section class="min-w-0 rounded-[48px] border border-slate-100 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.02)] lg:p-16">
        <div class="relative z-10 flex min-w-0 flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
          <div class="min-w-0 flex-shrink-0 space-y-6 lg:max-w-md">
            <div class="inline-flex items-center gap-2 rounded-full border border-slate-100 px-4 py-2">
              <Sparkles class="h-4 w-4 text-[#E53935]" />
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-900">For U</span>
            </div>
            <div class="space-y-4">
              <h3 class="text-4xl font-black leading-[0.95] tracking-tighter text-slate-900 lg:text-5xl">
                당신만을 위한<br />
                <span class="text-[#E53935]">특별한 스테이지</span>
              </h3>
              <p class="max-w-sm text-base font-medium leading-relaxed text-slate-500">
                관심 아티스트와 내 주변 공연장을 기반으로 딱 맞는 공연을 찾아드려요.
              </p>
            </div>
            <button
              class="inline-flex items-center gap-4 text-sm font-black text-slate-900 transition-colors hover:text-[#E53935]"
              type="button"
              @click="$router.push('/me/foru')"
            >
              For U 시작하기
              <span class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 transition-all hover:border-[#E53935] hover:bg-[#E53935] hover:text-white">
                <ChevronRight class="h-4 w-4" />
              </span>
            </button>
          </div>
          <div class="grid min-w-0 flex-1 grid-cols-1 gap-6 sm:grid-cols-2">
            <div
              class="group/card cursor-pointer rounded-[32px] border border-slate-100 p-8 shadow-sm transition-all duration-500 hover:shadow-2xl active:scale-95"
              @click="$router.push('/performers')"
            >
              <div class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 transition-all duration-500 group-hover/card:border-[#E53935] group-hover/card:bg-[#E53935] group-hover/card:text-white">
                <Heart class="h-7 w-7" />
              </div>
              <h4 class="mb-2 text-xl font-black text-slate-900">좋아요한 아티스트</h4>
              <p class="text-xs font-bold leading-relaxed text-slate-400">관심 아티스트의 공연 소식 모아보기</p>
            </div>
            <div
              class="group/card cursor-pointer rounded-[32px] border border-slate-100 p-8 shadow-sm transition-all duration-500 hover:shadow-2xl active:scale-95 sm:mt-8"
              @click="$router.push('/nearby')"
            >
              <div class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 transition-all duration-500 group-hover/card:border-blue-600 group-hover/card:bg-blue-600 group-hover/card:text-white">
                <MapPin class="h-7 w-7" />
              </div>
              <h4 class="mb-2 text-xl font-black text-slate-900">내 주변 공연장</h4>
              <p class="text-xs font-bold leading-relaxed text-slate-400">가까운 공연장에서 열리는 공연 탐색</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 장르별 랭킹 -->
      <section class="min-w-0 space-y-4 pt-4">
        <div class="text-center">
          <h3 class="text-xl font-bold text-slate-800 lg:text-2xl">장르별 랭킹</h3>
        </div>

        <div class="flex min-w-0 flex-wrap justify-center gap-2">
          <button
            type="button"
            :class="[!rankingCat ? 'bg-slate-800 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50']"
            class="rounded-full px-4 py-2 text-sm font-medium transition"
            @click="setRankingCat('')"
          >
            전체
          </button>
          <button
            v-for="opt in categoryOptions"
            :key="opt.value"
            type="button"
            :class="[rankingCat === opt.value ? 'bg-slate-800 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50']"
            class="rounded-full px-4 py-2 text-sm font-medium transition"
            @click="setRankingCat(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>

        <div class="relative min-h-[280px] min-w-0">
          <Transition name="ranking-fade" mode="out-in">
            <div
              v-if="loading && items.length === 0"
              key="loading"
              class="rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500"
            >
              불러오는 중…
            </div>
            <div
              v-else-if="!rankingLoading && items.length === 0"
              key="empty"
              class="rounded-xl border border-slate-200 p-12"
            >
              <EmptyState title="검색 결과가 없어요" description="다른 장르를 선택해보세요." />
            </div>
            <div
              v-else
              key="carousel"
              class="relative"
            >
          <button
            type="button"
            class="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30"
            :disabled="!canScrollLeft"
            aria-label="이전"
            @click="scrollRanking('left')"
          >
            <ChevronLeft class="h-4 w-4 text-slate-700" />
          </button>
          <button
            type="button"
            class="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30"
            :disabled="!canScrollRight"
            aria-label="다음"
            @click="scrollRanking('right')"
          >
            <ChevronRight class="h-4 w-4 text-slate-700" />
          </button>
          <Transition name="ranking-fade" mode="out-in">
            <div
              :key="rankingCat"
              ref="rankingScrollRef"
              class="ranking-scroll flex min-w-0 gap-4 overflow-x-auto scroll-smooth px-10 py-2"
              style="scrollbar-width: none; -ms-overflow-style: none;"
              @scroll="updateRankingScrollState"
            >
            <div
              v-for="(c, idx) in items"
              :key="c.id"
              class="ranking-card group flex w-[200px] flex-shrink-0 cursor-pointer flex-col rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              @click="$router.push(`/concerts/${c.id}`)"
            >
              <div class="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-slate-100">
                <img
                  :src="c.posterUrl"
                  :alt="c.title"
                  class="h-full w-full object-cover"
                />
                <div class="absolute bottom-2 left-2 text-2xl font-bold leading-none text-white drop-shadow-md">
                  {{ idx + 1 }}
                </div>
              </div>
              <div class="flex flex-col gap-1 p-3 text-left">
                <h4 class="line-clamp-2 text-sm font-semibold text-slate-900">
                  {{ c.title }}
                </h4>
                <p class="text-xs text-slate-600">{{ c.venueName || '-' }}</p>
                <p class="text-xs text-slate-500">{{ c.scheduleCount != null ? c.scheduleCount + '회차' : '-' }}</p>
                <p class="text-xs text-slate-500">
                  {{ formatDateRange(c.scheduleStartDate, c.scheduleEndDate) }}
                </p>
              </div>
            </div>
          </div>
          </Transition>
          <Transition name="overlay-fade">
            <div
              v-if="rankingLoading"
              class="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/80"
            >
              <span class="text-sm text-slate-500">불러오는 중…</span>
            </div>
          </Transition>
            </div>
          </Transition>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  MapPin,
  Clock,
  Info,
  Sparkles,
  Zap
} from 'lucide-vue-next'
import EmptyState from '../../components/common/EmptyState.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { CONCERT_CATEGORY_OPTIONS } from '../../lib/constants/concertCategory'

const GRADIENTS = [
  'linear-gradient(135deg, #f43f5e, #ec4899)',
  'linear-gradient(135deg, #8b5cf6, #6366f1)',
  'linear-gradient(135deg, #0ea5e9, #06b6d4)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #f97316, #ef4444)',
  'linear-gradient(135deg, #eab308, #f97316)',
]

const SLIDE_INTERVAL_MS = 4000

export default {
  name: 'HomeView',
  components: {
    ChevronLeft,
    ChevronRight,
    Star,
    Heart,
    MapPin,
    Clock,
    Info,
    Sparkles,
    Zap,
    EmptyState
  },
  data() {
    return {
      loading: false,
      rankingLoading: false,
      items: [],
      rankingCat: '',
      categoryOptions: CONCERT_CATEGORY_OPTIONS,
      performers: [],
      performersLoading: false,
      currentPerformerIdx: 0,
      slideInterval: null,
      api: null,
      rankingScrollLeft: 0,
      rankingScrollWidth: 0,
      rankingClientWidth: 0
    }
  },
  computed: {
    currentPerformer() {
      if (!this.performers.length) return null
      return this.performers[this.currentPerformerIdx % this.performers.length] ?? null
    },
    canScrollLeft() {
      return this.rankingScrollLeft > 2
    },
    canScrollRight() {
      const maxScroll = this.rankingScrollWidth - this.rankingClientWidth
      return maxScroll > 2 && this.rankingScrollLeft < maxScroll - 2
    }
  },
  watch: {
    items() {
      this.$nextTick(this.updateRankingScrollState)
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
    this.loadPerformers()
    window.addEventListener('resize', this.updateRankingScrollState)
  },
  beforeUnmount() {
    this.stopSlide()
    window.removeEventListener('resize', this.updateRankingScrollState)
  },
  methods: {
    updateRankingScrollState() {
      const el = this.$refs.rankingScrollRef
      if (!el) return
      this.rankingScrollLeft = el.scrollLeft
      this.rankingScrollWidth = el.scrollWidth
      this.rankingClientWidth = el.clientWidth
    },
    scrollRanking(dir) {
      const el = this.$refs.rankingScrollRef
      if (!el) return
      const step = Math.max(200, el.clientWidth * 0.8)
      el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' })
    },
    setRankingCat(value) {
      if (this.rankingCat === value) return
      this.rankingCat = value
      this.loadRanking()
    },
    formatDateRange(start, end) {
      if (!start && !end) return '-'
      const fmt = (d) => {
        if (!d) return ''
        const date = typeof d === 'string' ? new Date(d) : d
        if (isNaN(date.getTime())) return ''
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')
      }
      const s = fmt(start)
      const e = fmt(end)
      if (s && e && s !== e) return `${s} ~ ${e}`
      return s || e || '-'
    },
    async load() {
      this.loading = true
      this.rankingLoading = true
      try {
        const params = new URLSearchParams()
        params.set('page', '0')
        params.set('size', '20')
        if (this.rankingCat) params.set('category', this.rankingCat)
        const res = await this.api.get(`${ENDPOINTS.concerts()}?${params.toString()}`)
        const list = res.content ?? res.items ?? []
        // ConcertListDto: id, title, category, venueName, scheduleCount, scheduleStartDate, scheduleEndDate, thumImgUrl
        this.items = list.map((c) => ({
          id: c.id,
          title: c.title ?? c.name,
          category: c.category ?? '',
          status: c.status ?? '',
          ageLimit: c.ageLimit ?? 0,
          organizerName: c.concertMemberResDto?.name ?? null,
          posterUrl:
            c.thumImgUrl ?? c.thum_img_url ?? c.posterUrl ?? c.thumbnailUrl ?? c.imageUrl ?? 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=60',
          venueName: c.venueName ?? c.venue?.name ?? null,
          scheduleCount: c.scheduleCount ?? c.schedule_count ?? null,
          scheduleStartDate: c.scheduleStartDate ?? c.schedule_start_date ?? null,
          scheduleEndDate: c.scheduleEndDate ?? c.schedule_end_date ?? null
        }))
      } finally {
        this.loading = false
        this.rankingLoading = false
      }
    },
    async loadRanking() {
      this.rankingLoading = true
      try {
        const params = new URLSearchParams()
        params.set('page', '0')
        params.set('size', '20')
        if (this.rankingCat) params.set('category', this.rankingCat)
        const res = await this.api.get(`${ENDPOINTS.concerts()}?${params.toString()}`)
        const list = res.content ?? res.items ?? []
        this.items = list.map((c) => ({
          id: c.id,
          title: c.title ?? c.name,
          category: c.category ?? '',
          status: c.status ?? '',
          ageLimit: c.ageLimit ?? 0,
          organizerName: c.concertMemberResDto?.name ?? null,
          posterUrl:
            c.thumImgUrl ?? c.thum_img_url ?? c.posterUrl ?? c.thumbnailUrl ?? c.imageUrl ?? 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=60',
          venueName: c.venueName ?? c.venue?.name ?? null,
          scheduleCount: c.scheduleCount ?? c.schedule_count ?? null,
          scheduleStartDate: c.scheduleStartDate ?? c.schedule_start_date ?? null,
          scheduleEndDate: c.scheduleEndDate ?? c.schedule_end_date ?? null
        }))
      } finally {
        this.rankingLoading = false
      }
    },
    async loadPerformers() {
      this.performersLoading = true
      try {
        const res = await this.api.get(ENDPOINTS.performers({ size: 20, page: 0 }))
        const content = res?.content ?? (Array.isArray(res) ? res : [])
        this.performers = content.map((item) => ({
          id: item.id,
          name: item.name ?? '-',
          profileImgUrl: item.profileImgUrl ?? null,
          likeCount: item.likeCount ?? 0
        }))
        this.$nextTick(() => this.startSlide())
      } finally {
        this.performersLoading = false
      }
    },
    startSlide() {
      this.stopSlide()
      if (this.performers.length <= 1) return
      this.slideInterval = setInterval(() => {
        this.currentPerformerIdx = (this.currentPerformerIdx + 1) % Math.min(this.performers.length, 10)
      }, SLIDE_INTERVAL_MS)
    },
    stopSlide() {
      if (this.slideInterval) {
        clearInterval(this.slideInterval)
        this.slideInterval = null
      }
    },
    avatarGradient(idx) {
      return GRADIENTS[idx % GRADIENTS.length]
    },
    formatCount(n) {
      if (n >= 10000) return (n / 10000).toFixed(1) + '만'
      if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
      return String(n)
    },
  }
}
</script>

<style scoped>
.artist-fade-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.artist-fade-leave-active {
  transition: opacity 0.2s ease;
}
.artist-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.artist-fade-leave-to {
  opacity: 0;
}

.ranking-scroll::-webkit-scrollbar {
  display: none;
}

.ranking-fade-enter-active,
.ranking-fade-leave-active {
  transition: opacity 0.25s ease;
}
.ranking-fade-enter-from,
.ranking-fade-leave-to {
  opacity: 0;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
