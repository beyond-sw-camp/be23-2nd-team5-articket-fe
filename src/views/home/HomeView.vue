<template>
  <div class="-mx-4 bg-white">

    <!-- ───── ① 히어로 배너 ───── -->
    <section
      class="relative bg-slate-950 overflow-hidden"
      style="width:100vw;margin-left:calc(50% - 50vw)"
    >
      <!-- 배너 이미지 영역 + 썸네일 스트립 (하단선 일치) -->
      <div class="relative" style="height:420px">
        <!-- 로딩 스켈레톤 -->
        <div
          v-if="bannersLoading && !heroBanner"
          class="absolute inset-0 bg-slate-800 animate-pulse"
        />

        <!-- 배너 이미지 슬라이드 -->
        <Transition name="hero-banner-fade" mode="out-in">
          <div
            v-if="heroBanner"
            :key="heroBanner.id"
            class="absolute inset-0 flex items-center justify-center cursor-pointer group"
            :style="{ background: bannerBgGradient ?? undefined }"
            @click="$router.push(heroBanner.linkUrl)"
          >
            <img
              :src="heroBanner.imageUrl"
              alt="프로모션 배너"
              style="width:100%;height:100%;max-width:1600px;max-height:420px;object-fit:contain"
            />
            <div class="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
          </div>
        </Transition>

        <!-- 썸네일 스트립 — 배너 하단에 오버레이, 하단선 일치 -->
        <div
          v-if="heroItems.length"
          class="absolute bottom-0 left-0 right-0 z-10"
        >
          <div
            class="max-w-6xl mx-auto px-4 flex gap-2 overflow-x-auto py-2.5"
            style="scrollbar-width:none;-ms-overflow-style:none"
          >
            <div
              v-for="(b, i) in heroItems"
              :key="'thumb-' + b.id"
              class="flex-shrink-0 relative cursor-default"
              @mouseenter="goHero(i)"
            >
              <img
                :src="b.imageUrl"
                alt="배너 썸네일"
                class="h-10 w-10 object-cover rounded transition-all duration-200"
                :class="heroIndex === i
                  ? 'opacity-100 ring-2 ring-white scale-105'
                  : 'opacity-45 hover:opacity-75'"
              />
              <div
                v-if="heroIndex === i"
                class="absolute -bottom-px left-0 right-0 h-0.5 bg-red-500 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───── ② 프로모션 카드 그리드 ───── -->
    <section v-if="baseItems.length" class="px-4 pt-6 pb-2">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          v-for="(c, idx) in baseItems.slice(0, 6)"
          :key="'promo-' + c.id"
          type="button"
          class="relative overflow-hidden rounded-2xl group cursor-pointer text-left"
          style="aspect-ratio:16/8"
          @click="$router.push(`/concerts/${c.id}`)"
        >
          <!-- 배경 이미지 -->
          <img
            :src="c.posterUrl"
            :alt="c.title"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <!-- 오버레이 -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

          <!-- 상단 배지 -->
          <div class="absolute top-2 left-2">
            <span
              class="text-[10px] font-black px-2 py-0.5 rounded leading-tight"
              :class="idx === 5 ? 'bg-red-600 text-white' : 'bg-black/55 text-white/85'"
            >
              {{ idx === 5 ? 'TOP 10' : getCategoryLabel(c.category) }}
            </span>
          </div>

          <!-- 하단 정보 -->
          <div class="absolute bottom-0 left-0 right-0 p-3">
            <p class="text-white text-xs font-bold line-clamp-2 leading-snug">{{ c.title }}</p>
            <p class="text-white/50 text-[10px] mt-0.5">
              {{ formatDateRange(c.scheduleStartDate, c.scheduleEndDate) }}
            </p>
          </div>
        </button>
      </div>
    </section>

    <!-- ───── ③ 장르별 랭킹 ───── -->
    <section class="px-4 pt-8 pb-6">
      <!-- 섹션 헤더 -->
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-xl font-bold text-slate-900">장르별 랭킹</h2>
        <RouterLink
          :to="rankingCat ? `/genre/${rankingCat}` : '/concerts'"
          class="flex items-center gap-0.5 text-sm text-slate-500 hover:text-red-600 transition-colors"
        >
          {{ rankingCat ? getCategoryLabel(rankingCat) + ' ' : '' }}랭킹 전체보기
          <ChevronRight class="h-3.5 w-3.5" />
        </RouterLink>
      </div>

      <!-- 장르 탭 -->
      <div
        class="flex gap-2 overflow-x-auto pb-2 mb-5"
        style="scrollbar-width:none;-ms-overflow-style:none"
      >
        <button
          type="button"
          class="flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
          :class="!rankingCat ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
          @click="setRankingCat('')"
        >전체</button>
        <button
          v-for="opt in categoryOptions"
          :key="opt.value"
          type="button"
          class="flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
          :class="rankingCat === opt.value ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
          @click="setRankingCat(opt.value)"
        >{{ opt.label }}</button>
      </div>

      <!-- 카드 캐러셀 -->
      <div class="relative min-h-[260px]">
        <Transition name="ranking-fade" mode="out-in">
          <div
            v-if="loading && items.length === 0"
            key="loading"
            class="flex items-center justify-center h-[260px] text-sm text-slate-400"
          >
            불러오는 중…
          </div>
          <div
            v-else-if="!rankingLoading && items.length === 0"
            key="empty"
            class="rounded-xl border border-slate-200 p-12"
          >
            <EmptyState title="공연이 없습니다" description="다른 장르를 선택해보세요." />
          </div>
          <div v-else key="carousel" class="relative">
            <!-- 이전 버튼 -->
            <button
              type="button"
              class="absolute left-0 top-[42%] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition"
              :disabled="!canScrollLeft"
              @click="scrollRanking('left')"
            >
              <ChevronLeft class="h-4 w-4 text-slate-600" />
            </button>
            <!-- 다음 버튼 -->
            <button
              type="button"
              class="absolute right-0 top-[42%] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition"
              :disabled="!canScrollRight"
              @click="scrollRanking('right')"
            >
              <ChevronRight class="h-4 w-4 text-slate-600" />
            </button>

            <Transition name="ranking-fade" mode="out-in">
              <div
                :key="rankingCat"
                ref="rankingScrollRef"
                class="flex gap-4 overflow-x-auto scroll-smooth px-10 py-2"
                style="scrollbar-width:none;-ms-overflow-style:none"
                @scroll="updateRankingScrollState"
              >
                <div
                  v-for="(c, idx) in items"
                  :key="c.id"
                  class="group flex w-[155px] flex-shrink-0 flex-col rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  @click="$router.push(`/concerts/${c.id}`)"
                >
                  <div class="relative overflow-hidden bg-slate-100" style="aspect-ratio:3/4">
                    <img
                      :src="c.posterUrl"
                      :alt="c.title"
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div class="absolute bottom-2 left-2 text-[28px] font-black text-white leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                      {{ idx + 1 }}
                    </div>
                  </div>
                  <div class="p-3 space-y-0.5">
                    <p class="text-[10px] font-bold text-red-500">{{ getCategoryLabel(c.category) }}</p>
                    <h4 class="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{{ c.title }}</h4>
                    <p class="text-[10px] text-slate-500">{{ c.venueName || '-' }}</p>
                    <p class="text-[10px] text-slate-400">{{ formatDateRange(c.scheduleStartDate, c.scheduleEndDate) }}</p>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- 로딩 오버레이 -->
            <Transition name="overlay-fade">
              <div
                v-if="rankingLoading"
                class="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/80"
              >
                <span class="text-sm text-slate-400">불러오는 중…</span>
              </div>
            </Transition>
          </div>
        </Transition>
      </div>
    </section>

    <!-- ───── ④ 오픈 예정 ───── -->
    <section class="border-t border-slate-100 px-4 py-8">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-xl font-bold text-slate-900">오픈 예정</h2>
        <RouterLink
          to="/concerts"
          class="flex items-center gap-0.5 text-sm text-slate-500 hover:text-red-600 transition-colors"
        >
          오픈 예정 공연 전체보기 <ChevronRight class="h-3.5 w-3.5" />
        </RouterLink>
      </div>

      <div
        v-if="openingSoonItems.length === 0 && !openingSoonLoading"
        class="py-8 text-center text-sm text-slate-400"
      >
        오픈 예정 공연이 없습니다
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button
          v-for="c in openingSoonItems"
          :key="'soon-' + c.id"
          type="button"
          class="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition text-left w-full"
          @click="$router.push(`/concerts/${c.id}`)"
        >
          <!-- 날짜 배지 -->
          <div class="flex-shrink-0 w-14 pt-0.5">
            <span class="text-red-600 text-[11px] font-black block leading-snug whitespace-nowrap">
              {{ formatOpenBadge(c.scheduleStartDate) }}
            </span>
          </div>
          <!-- 포스터 -->
          <img
            :src="c.posterUrl"
            :alt="c.title"
            class="w-12 h-[68px] object-cover rounded-lg flex-shrink-0"
          />
          <!-- 정보 -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{{ c.title }}</p>
            <p class="text-[11px] text-slate-500 mt-1">{{ c.venueName || '-' }}</p>
            <span class="inline-flex items-center mt-1.5 bg-slate-100 text-slate-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
              {{ getCategoryLabel(c.category) }}
            </span>
          </div>
        </button>
      </div>
    </section>

    <!-- ───── ⑤ 추천 키워드 ───── -->
    <section class="border-t border-slate-100 px-4 py-8">
      <div class="flex items-center gap-2 mb-5">
        <h2 class="text-xl font-bold text-slate-900">추천 키워드</h2>
      </div>

      <!-- 키워드 태그 -->
      <div class="flex gap-2 mb-6 flex-wrap">
        <button
          v-for="kw in keywordOptions"
          :key="kw.value"
          type="button"
          class="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition border"
          :class="selectedKeyword === kw.value
            ? 'bg-slate-900 text-white border-slate-900'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'"
          @click="setKeyword(kw.value)"
        >
          <span v-if="selectedKeyword === kw.value" class="text-xs">🔥</span>
          {{ kw.label }}
        </button>
      </div>

      <!-- 키워드 공연 카드 -->
      <div v-if="keywordLoading" class="py-8 text-center text-sm text-slate-400">불러오는 중…</div>
      <div
        v-else-if="keywordItems.length === 0"
        class="py-8 text-center text-sm text-slate-400"
      >공연이 없습니다</div>
      <div
        v-else
        class="flex gap-4 overflow-x-auto pb-2"
        style="scrollbar-width:none;-ms-overflow-style:none"
      >
        <button
          v-for="c in keywordItems"
          :key="'kw-' + c.id"
          type="button"
          class="flex-shrink-0 w-[155px] cursor-pointer group text-left"
          @click="$router.push(`/concerts/${c.id}`)"
        >
          <div class="overflow-hidden rounded-xl bg-slate-100 mb-2" style="aspect-ratio:3/4">
            <img
              :src="c.posterUrl"
              :alt="c.title"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <p class="text-[10px] font-bold text-red-500">{{ getCategoryLabel(c.category) }}</p>
          <p class="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mt-0.5">{{ c.title }}</p>
          <p class="text-[11px] text-slate-400 mt-0.5">
            {{ formatDateRange(c.scheduleStartDate, c.scheduleEndDate) }}
          </p>
        </button>
      </div>
    </section>

    <!-- ───── ⑥ 공연 초대권 배너 ───── -->
    <section class="px-4 py-4">
      <div
        class="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-5 flex items-center justify-between cursor-pointer hover:from-violet-700 hover:to-indigo-700 transition-all"
        role="button"
        @click="$router.push('/concerts')"
      >
        <div class="flex items-center gap-4">
          <span class="text-2xl" aria-hidden="true">🎫</span>
          <p class="text-white font-bold text-sm lg:text-base">
            관람후기(리뷰)를 작성하고 공연 초대권 받아가세요!
          </p>
        </div>
        <ChevronRight class="h-5 w-5 text-white flex-shrink-0" />
      </div>
    </section>

    <!-- ───── ⑦ 베스트 관람후기 ───── -->
    <section class="border-t border-slate-100 px-4 py-8">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-xl font-bold text-slate-900">베스트 관람후기</h2>
        <button
          type="button"
          class="flex items-center gap-1 text-sm text-slate-500 hover:text-red-600 transition-colors"
          @click="loadBestReviews"
        >
          관람후기 새로 보기 <RefreshCw class="h-3.5 w-3.5 ml-0.5" />
        </button>
      </div>

      <div v-if="reviewsLoading" class="py-8 text-center text-sm text-slate-400">불러오는 중…</div>
      <div
        v-else-if="bestReviews.length === 0"
        class="rounded-xl border border-slate-100 py-10 text-center text-sm text-slate-400"
      >
        아직 관람후기가 없습니다
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          v-for="r in bestReviews"
          :key="r.id"
          type="button"
          class="flex gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition text-left w-full"
          @click="$router.push(`/concerts/${r.concertId}`)"
        >
          <img
            :src="r.posterUrl"
            :alt="r.concertTitle"
            class="w-12 h-16 object-cover rounded-lg flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[11px] font-bold text-slate-500">{{ r.nickname }}</span>
              <div class="flex items-center gap-0.5">
                <Star
                  v-for="s in 5"
                  :key="s"
                  class="h-3 w-3"
                  :class="s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-200'"
                />
                <span class="text-[10px] font-bold text-slate-400 ml-1">{{ r.rating }}</span>
              </div>
            </div>
            <p class="text-xs font-semibold text-slate-700 mb-1">{{ r.concertTitle }}</p>
            <p class="text-xs text-slate-500 line-clamp-2">{{ r.content }}</p>
          </div>
        </button>
      </div>
    </section>

    <!-- 하단 여백 -->
    <div class="h-6" />
  </div>
</template>

<script>
import { ChevronLeft, ChevronRight, Star, RefreshCw } from 'lucide-vue-next'
import EmptyState from '../../components/common/EmptyState.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { CONCERT_CATEGORY_OPTIONS, getCategoryLabel } from '../../lib/constants/concertCategory'

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=400&q=60'

export default {
  name: 'HomeView',
  components: { ChevronLeft, ChevronRight, Star, RefreshCw, EmptyState },

  data() {
    return {
      // 랭킹
      loading: false,
      rankingLoading: false,
      items: [],
      rankingCat: '',
      categoryOptions: CONCERT_CATEGORY_OPTIONS,
      rankingScrollLeft: 0,
      rankingScrollWidth: 0,
      rankingClientWidth: 0,

      // 추천 키워드
      keywordOptions: [
        { value: 'MUSICAL', label: '재관람률 높은' },
        { value: 'FAMILY', label: '아이와 함께' },
        { value: 'THEATRE', label: '예매 연극 추천' },
      ],
      selectedKeyword: 'MUSICAL',
      keywordItems: [],
      keywordLoading: false,

      // 베스트 관람후기
      bestReviews: [],
      reviewsLoading: false,

      // 프로모션 카드 그리드용 기본 목록 (장르 필터 영향 없음)
      baseItems: [],

      // 오픈 예정 (전용 API)
      openingSoon: [],
      openingSoonLoading: false,

      // 히어로 배너 (프로모션 API)
      heroBanners: [],
      bannersLoading: false,
      heroIndex: 0,
      heroInterval: null,
      bannerBgGradient: null,
      bannerBgCache: {},

      api: null,
    }
  },

  computed: {
    heroItems() {
      return this.heroBanners
    },
    heroBanner() {
      if (!this.heroItems.length) return null
      return this.heroItems[this.heroIndex % this.heroItems.length] ?? null
    },
    openingSoonItems() {
      return this.openingSoon
    },
    canScrollLeft() {
      return this.rankingScrollLeft > 2
    },
    canScrollRight() {
      const max = this.rankingScrollWidth - this.rankingClientWidth
      return max > 2 && this.rankingScrollLeft < max - 2
    },
  },

  watch: {
    items() {
      this.$nextTick(this.updateRankingScrollState)
    },
    heroBanner(val) {
      if (!val) return
      const cached = this.bannerBgCache[val.id]
      if (cached) {
        this.bannerBgGradient = cached
      } else {
        this.bannerBgGradient = null
        this.extractBannerColors(val.imageUrl, val.id)
      }
    },
  },

  created() {
    this.api = useApi()
  },

  mounted() {
    this.loadHeroBanners()
    this.load()
    this.loadOpeningSoon()
    this.loadKeywordItems()
    window.addEventListener('resize', this.updateRankingScrollState)
  },

  beforeUnmount() {
    this.stopHeroSlide()
    window.removeEventListener('resize', this.updateRankingScrollState)
  },

  methods: {
    getCategoryLabel,

    // ─── 히어로 슬라이드 제어 ────────────────────────────────
    startHeroSlide() {
      this.stopHeroSlide()
      if (this.heroItems.length <= 1) return
      this.heroInterval = setInterval(() => {
        this.heroIndex = (this.heroIndex + 1) % this.heroItems.length
      }, 3000)
    },
    stopHeroSlide() {
      if (this.heroInterval) {
        clearInterval(this.heroInterval)
        this.heroInterval = null
      }
    },
    goHero(idx) {
      this.heroIndex = idx
      this.startHeroSlide() // 수동 이동 시 타이머 리셋
    },

    // ─── 배너 좌·우 엣지 색상 추출 → 배경 그라데이션 ────────
    async extractBannerColors(imageUrl, bannerId) {
      if (!imageUrl) return
      try {
        const colors = await this.sampleBannerEdges(imageUrl)
        if (!colors) return
        const { left, right } = colors
        const gradient = `linear-gradient(to right, rgb(${left.r},${left.g},${left.b}), rgb(${right.r},${right.g},${right.b}))`
        this.bannerBgCache[bannerId] = gradient
        if (this.heroBanner?.id === bannerId) this.bannerBgGradient = gradient
        // 나머지 배너도 미리 추출
        this.heroItems.forEach(async (b) => {
          if (b.id !== bannerId && !this.bannerBgCache[b.id]) {
            const c = await this.sampleBannerEdges(b.imageUrl).catch(() => null)
            if (c) {
              this.bannerBgCache[b.id] = `linear-gradient(to right, rgb(${c.left.r},${c.left.g},${c.left.b}), rgb(${c.right.r},${c.right.g},${c.right.b}))`
            }
          }
        })
      } catch (_) {}
    },

    sampleBannerEdges(url) {
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        const timer = setTimeout(() => resolve(null), 5000)

        img.onload = () => {
          clearTimeout(timer)
          try {
            const W = 100, H = 50
            const canvas = document.createElement('canvas')
            canvas.width = W
            canvas.height = H
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, W, H)

            const avg = (x0, y0, w, h) => {
              const d = ctx.getImageData(x0, y0, w, h).data
              let r = 0, g = 0, b = 0
              const n = w * h
              for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2] }
              return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) }
            }

            resolve({
              left:  avg(0,     0, 5, H),   // 좌측 5px
              right: avg(W - 5, 0, 5, H),   // 우측 5px
            })
          } catch (_) { resolve(null) }
        }

        img.onerror = () => { clearTimeout(timer); resolve(null) }
        img.src = url
      })
    },
    // ──────────────────────────────────────────────────────────

    // ─── 히어로 배너 (프로모션 API) ──────────────────────────
    async loadHeroBanners() {
      this.bannersLoading = true
      try {
        const res = await this.api.get(ENDPOINTS.promotions())
        const list = Array.isArray(res) ? res : (res.content ?? res.items ?? [])
        this.heroBanners = list.map(p => ({
          id: p.id,
          imageUrl: p.mainBannerUrl ?? p.bannerUrl ?? p.imageUrl ?? '',
          linkUrl: `/promotions/${p.id}`,
        }))
      } catch (_) {
        // 백엔드 미준비 시 빈 배열 유지
        this.heroBanners = []
      } finally {
        this.bannersLoading = false
        this.$nextTick(() => this.startHeroSlide())
      }
    },
    // ──────────────────────────────────────────────────────────

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

    setKeyword(value) {
      if (this.selectedKeyword === value) return
      this.selectedKeyword = value
      this.loadKeywordItems()
    },

    mapConcert(c) {
      return {
        id: c.id,
        title: c.title ?? c.name,
        category: c.category ?? '',
        status: c.status ?? '',
        posterUrl:
          c.thumImgUrl ?? c.thum_img_url ?? c.posterUrl ?? c.thumbnailUrl ?? c.imageUrl ?? DEFAULT_IMG,
        venueName: c.venueName ?? c.venue?.name ?? null,
        scheduleCount: c.scheduleCount ?? c.schedule_count ?? null,
        scheduleStartDate: c.scheduleStartDate ?? c.schedule_start_date ?? null,
        scheduleEndDate: c.scheduleEndDate ?? c.schedule_end_date ?? null,
      }
    },

    async load() {
      this.loading = true
      this.rankingLoading = true
      try {
        // 프로모션 카드 그리드용 + 초기 랭킹 (예매수 기준 정렬)
        const params = new URLSearchParams({ page: '0', size: '20', sort: 'bookingCount,desc' })
        const res = await this.api.get(`${ENDPOINTS.concerts()}?${params.toString()}`)
        const list = res.content ?? res.items ?? []
        const mapped = list.map(this.mapConcert)
        this.items = mapped
        if (!this.baseItems.length) this.baseItems = mapped
        this.$nextTick(() => {
          this.updateRankingScrollState()
          this.loadBestReviews()
        })
      } finally {
        this.loading = false
        this.rankingLoading = false
      }
    },

    async loadRanking() {
      this.rankingLoading = true
      try {
        const params = new URLSearchParams({ page: '0', size: '20', sort: 'bookingCount,desc' })
        if (this.rankingCat) params.set('category', this.rankingCat)
        const res = await this.api.get(`${ENDPOINTS.concerts()}?${params.toString()}`)
        const list = res.content ?? res.items ?? []
        this.items = list.map(this.mapConcert)
      } finally {
        this.rankingLoading = false
      }
    },

    async loadOpeningSoon() {
      this.openingSoonLoading = true
      try {
        const params = new URLSearchParams({
          page: '0', size: '6',
          status: 'UPCOMING',
          sort: 'scheduleStartDate,asc',
        })
        const res = await this.api.get(`${ENDPOINTS.concerts()}?${params.toString()}`)
        const list = res.content ?? res.items ?? []
        this.openingSoon = list.map(this.mapConcert)
      } finally {
        this.openingSoonLoading = false
      }
    },

    async loadKeywordItems() {
      this.keywordLoading = true
      try {
        // 키워드별 정렬 기준 매핑
        const sortMap = {
          MUSICAL: 'reviewCount,desc',   // 재관람률 높은
          FAMILY:  'bookingCount,desc',  // 아이와 함께
          THEATRE: 'bookingCount,desc',  // 예매 연극 추천
        }
        const sort = sortMap[this.selectedKeyword] ?? 'bookingCount,desc'
        const params = new URLSearchParams({ page: '0', size: '5', category: this.selectedKeyword, sort })
        const res = await this.api.get(`${ENDPOINTS.concerts()}?${params.toString()}`)
        const list = res.content ?? res.items ?? []
        this.keywordItems = list.map(this.mapConcert)
      } finally {
        this.keywordLoading = false
      }
    },

    async loadBestReviews() {
      this.reviewsLoading = true
      try {
        const list = await this.api.get(ENDPOINTS.bestReviews(4))
        this.bestReviews = (Array.isArray(list) ? list : (list?.content ?? [])).map(r => ({
          id: r.id,
          concertId: r.concertId,
          concertTitle: r.concertTitle,
          posterUrl: r.concertThumbnailUrl,
          nickname: r.nickname,
          rating: r.rating,
          content: r.content,
        }))
      } finally {
        this.reviewsLoading = false
      }
    },

    formatDateRange(start, end) {
      if (!start && !end) return '-'
      const fmt = d => {
        if (!d) return ''
        const date = typeof d === 'string' ? new Date(d) : d
        if (isNaN(date.getTime())) return ''
        return date
          .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
          .replace(/\. /g, '.')
          .replace(/\.$/, '')
      }
      const s = fmt(start)
      const e = fmt(end)
      if (s && e && s !== e) return `${s} ~ ${e}`
      return s || e || '-'
    },

    formatOpenBadge(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return '-'
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      const diff = Math.round((d - today) / (1000 * 60 * 60 * 24))
      if (diff <= 0) return '오늘'
      if (diff === 1) return '내일'
      const days = ['일', '월', '화', '수', '목', '금', '토']
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      return `${mm}.${dd}(${days[date.getDay()]})`
    },
  },
}
</script>

<style scoped>
/* 히어로 배너 페이드 트랜지션 */
.hero-banner-fade-leave-active {
  transition: opacity 0.25s ease;
}
.hero-banner-fade-enter-active {
  transition: opacity 0.4s ease;
}
.hero-banner-fade-leave-to,
.hero-banner-fade-enter-from {
  opacity: 0;
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
