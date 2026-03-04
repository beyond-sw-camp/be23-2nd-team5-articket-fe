<template>
  <div class="text-center">
    <!-- ─────────────────────────────────────────────────────
         ① 인기 공연 슬라이더
    ───────────────────────────────────────────────────────── -->
    <section class="py-6">
      <div class="relative">
        <!-- Prev -->
        <button
          type="button"
          class="absolute -left-3 top-[42%] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition"
          :disabled="heroAtStart"
          @click="heroScrollBy(-1)"
        >
          <ChevronLeft class="h-4 w-4 text-slate-600" />
        </button>

        <!-- Scroll track -->
        <div
          ref="heroScrollRef"
          class="flex gap-3 overflow-x-scroll"
          style="scrollbar-width: none; -ms-overflow-style: none; scroll-snap-type: x mandatory"
          @scroll="updateHeroScroll"
        >
          <!-- Loading skeleton -->
          <template v-if="heroLoading">
            <div
              v-for="i in 4"
              :key="'hs-' + i"
              class="flex-shrink-0 animate-pulse"
              style="width: calc((100% - 36px) / 4); scroll-snap-align: start"
            >
              <div class="rounded-xl bg-slate-200" style="aspect-ratio: 3/4"></div>
            </div>
          </template>

          <!-- Cards -->
          <template v-else>
            <div
              v-for="item in heroItems"
              :key="item.id"
              class="group flex-shrink-0 cursor-pointer"
              style="width: calc((100% - 36px) / 4); scroll-snap-align: start"
              @click="$router.push(`/concerts/${item.id}`)"
            >
              <div class="relative overflow-hidden rounded-xl bg-slate-100" style="aspect-ratio: 3/4">
                <img
                  :src="item.posterUrl"
                  :alt="item.title"
                  class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div class="absolute bottom-0 left-0 right-0 p-3">
                  <p class="line-clamp-2 text-xs font-bold leading-snug text-white">{{ item.title }}</p>
                  <p class="mt-1 truncate text-[10px] text-white/65">{{ item.venueName || '-' }}</p>
                  <p class="mt-0.5 truncate text-[10px] text-white/45">{{ formatDateRange(item.scheduleStartDate, item.scheduleEndDate) }}</p>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Next -->
        <button
          type="button"
          class="absolute -right-3 top-[42%] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition"
          :disabled="heroAtEnd"
          @click="heroScrollBy(1)"
        >
          <ChevronRight class="h-4 w-4 text-slate-600" />
        </button>
      </div>
    </section>

    <!-- ─────────────────────────────────────────────────────
         ② 오픈 예정
    ───────────────────────────────────────────────────────── -->
    <section class="border-t border-slate-100 py-8">
      <div class="mb-5 flex items-center justify-center">
        <h2 class="text-xl font-bold text-slate-900">오픈 예정</h2>
      </div>

      <!-- Loading -->
      <div v-if="upcomingLoading" class="grid grid-cols-5 gap-4">
        <div v-for="i in 5" :key="i" class="animate-pulse">
          <div class="mb-2 rounded-xl bg-slate-200" style="aspect-ratio: 3/4"></div>
          <div class="mb-1 h-3 w-3/4 rounded bg-slate-200"></div>
          <div class="h-3 w-1/2 rounded bg-slate-200"></div>
        </div>
      </div>

      <!-- Empty -->
      <div
        v-else-if="upcomingItems.length === 0"
        class="py-8 text-center text-sm text-slate-400"
      >
        오픈 예정 공연이 없습니다
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-5 gap-4">
        <div
          v-for="item in upcomingItems"
          :key="item.id"
          class="group cursor-pointer"
          @click="$router.push(`/concerts/${item.id}`)"
        >
          <div class="relative mb-2 overflow-hidden rounded-xl bg-slate-100" style="aspect-ratio: 3/4">
            <img
              :src="item.posterUrl"
              :alt="item.title"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <p class="text-xs font-bold text-red-500">{{ formatOpenBadge(item.scheduleStartDate) }}</p>
          <p class="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{{ item.title }}</p>
          <p class="mt-0.5 truncate text-xs text-slate-500">{{ item.venueName || '-' }}</p>
        </div>
      </div>

      <!-- More button -->
      <div class="mt-6 text-center">
        <button
          type="button"
          class="rounded-full border border-slate-300 px-8 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
        >
          오픈 예정 공연 전체보기 &gt;
        </button>
      </div>
    </section>

    <!-- ─────────────────────────────────────────────────────
         ③ 장르 둘러보기 (무한 스크롤)
    ───────────────────────────────────────────────────────── -->
    <section class="border-t border-slate-100 py-8">
      <h2 class="mb-5 text-xl font-bold text-slate-900">{{ genreLabel }} 둘러보기</h2>

      <div
        v-if="browseItems.length === 0 && !browseLoading"
        class="py-12 text-center text-sm text-slate-400"
      >
        공연이 없습니다
      </div>

      <div class="grid grid-cols-5 gap-x-4 gap-y-6">
        <div
          v-for="item in browseItems"
          :key="item.id"
          class="group cursor-pointer"
          @click="$router.push(`/concerts/${item.id}`)"
        >
          <div class="relative mb-2 overflow-hidden rounded-xl bg-slate-100" style="aspect-ratio: 3/4">
            <img
              :src="item.posterUrl"
              :alt="item.title"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <p class="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{{ item.title }}</p>
          <p class="mt-0.5 truncate text-xs text-slate-500">{{ item.venueName || '-' }}</p>
          <p class="mt-0.5 text-xs text-slate-400">{{ formatDateRange(item.scheduleStartDate, item.scheduleEndDate) }}</p>
        </div>
      </div>

      <!-- Infinite scroll sentinel -->
      <div ref="sentinelRef" class="mt-8 h-4"></div>

      <div v-if="browseLoading" class="py-6 text-center text-sm text-slate-400">
        불러오는 중…
      </div>
      <div
        v-if="browseDone && browseItems.length > 0 && !browseLoading"
        class="py-6 text-center text-sm text-slate-400"
      >
        모든 공연을 불러왔습니다
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { getCategoryLabel } from '../../lib/constants/concertCategory'

const DEFAULT_IMG =
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=400&q=60'
const PAGE_SIZE = 10

const route = useRoute()
const api = useApi()

const genre = computed(() => route.params.genre)
const genreLabel = computed(() => getCategoryLabel(genre.value))

// ── Hero ──────────────────────────────────────────────────
const heroItems = ref([])
const heroLoading = ref(false)
const heroScrollRef = ref(null)
const heroScrollLeft = ref(0)
const heroScrollWidth = ref(0)
const heroClientWidth = ref(0)

const heroAtStart = computed(() => heroScrollLeft.value <= 2)
const heroAtEnd = computed(() => {
  const max = heroScrollWidth.value - heroClientWidth.value
  return max <= 2 || heroScrollLeft.value >= max - 2
})

function updateHeroScroll() {
  const el = heroScrollRef.value
  if (!el) return
  heroScrollLeft.value = el.scrollLeft
  heroScrollWidth.value = el.scrollWidth
  heroClientWidth.value = el.clientWidth
}

function heroScrollBy(dir) {
  const el = heroScrollRef.value
  if (!el) return
  el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })
}

// ── Upcoming ──────────────────────────────────────────────
const upcomingItems = ref([])
const upcomingLoading = ref(false)

// ── Browse (infinite scroll) ──────────────────────────────
const browseItems = ref([])
const browsePage = ref(0)
const browseLoading = ref(false)
const browseDone = ref(false)
const sentinelRef = ref(null)
let observer = null

// ── Utils ─────────────────────────────────────────────────
function mapConcert(c) {
  return {
    id: c.id,
    title: c.title ?? c.name ?? '',
    category: c.category ?? '',
    status: c.status ?? '',
    posterUrl:
      c.thumImgUrl ?? c.thum_img_url ?? c.posterUrl ?? c.thumbnailUrl ?? c.imageUrl ?? DEFAULT_IMG,
    venueName: c.venueName ?? c.venue?.name ?? null,
    scheduleStartDate: c.scheduleStartDate ?? c.schedule_start_date ?? null,
    scheduleEndDate: c.scheduleEndDate ?? c.schedule_end_date ?? null,
  }
}

function formatDateRange(start, end) {
  if (!start && !end) return '-'
  const fmt = (d) => {
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
}

function formatOpenBadge(dateStr) {
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
}

// ── API ───────────────────────────────────────────────────
async function loadHero() {
  heroLoading.value = true
  try {
    const res = await api.get(
      ENDPOINTS.searchConcerts({
        category: genre.value,
        page: 0,
        size: 10,
        status: 'OPEN',
        sort: 'bookingCount,desc',
      }),
    )
    const list = res.content ?? res.items ?? (Array.isArray(res) ? res : [])
    heroItems.value = list.map(mapConcert)
  } catch (_) {
    heroItems.value = []
  } finally {
    heroLoading.value = false
    nextTick(updateHeroScroll)
  }
}

async function loadUpcoming() {
  upcomingLoading.value = true
  try {
    const res = await api.get(
      ENDPOINTS.searchConcerts({
        category: genre.value,
        page: 0,
        size: 5,
        status: 'READY',
        sort: 'scheduleStartDate,asc',
      }),
    )
    const list = res.content ?? res.items ?? (Array.isArray(res) ? res : [])
    upcomingItems.value = list.map(mapConcert)
  } catch (_) {
    upcomingItems.value = []
  } finally {
    upcomingLoading.value = false
  }
}

async function loadBrowse() {
  if (browseLoading.value || browseDone.value) return
  browseLoading.value = true
  try {
    const res = await api.get(
      ENDPOINTS.searchConcerts({
        category: genre.value,
        page: browsePage.value,
        size: PAGE_SIZE,
        sort: 'bookingCount,desc',
      }),
    )
    const list = res.content ?? res.items ?? (Array.isArray(res) ? res : [])
    browseItems.value.push(...list.map(mapConcert))
    if (list.length < PAGE_SIZE) {
      browseDone.value = true
    } else {
      browsePage.value++
    }
  } catch (_) {
    browseDone.value = true
  } finally {
    browseLoading.value = false
  }
}

// ── Intersection Observer ─────────────────────────────────
function setupObserver() {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadBrowse()
    },
    { rootMargin: '300px' },
  )
  if (sentinelRef.value) observer.observe(sentinelRef.value)
}

// ── Reset + reload all sections ───────────────────────────
async function loadAll() {
  if (heroScrollRef.value) heroScrollRef.value.scrollLeft = 0
  heroScrollLeft.value = 0
  heroItems.value = []
  upcomingItems.value = []
  browseItems.value = []
  browsePage.value = 0
  browseLoading.value = false
  browseDone.value = false
  await Promise.all([loadHero(), loadUpcoming()])
}

watch(genre, (val) => {
  if (val) loadAll()
})

onMounted(async () => {
  if (genre.value) await loadAll()
  await nextTick()
  setupObserver()
  updateHeroScroll()
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>
