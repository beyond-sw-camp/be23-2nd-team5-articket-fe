<template>
  <div>
    <div class="mx-auto max-w-6xl px-4 pt-8 pb-12">
      <!-- 페이지 타이틀 -->
      <header class="mb-6 text-center">
        <h1 class="text-2xl font-bold text-slate-900">장르별 랭킹</h1>
      </header>

      <!-- 카테고리 탭 -->
      <nav class="mb-6 flex justify-center gap-2">
        <button
          v-for="opt in categoryTabs"
          :key="opt.value"
          type="button"
          class="rounded-full px-4 py-1.5 text-sm font-semibold border transition-colors"
          :class="activeCategory === opt.value
            ? 'bg-slate-900 text-white border-slate-900'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'"
          @click="onChangeCategory(opt.value)"
        >
          {{ opt.label }}
        </button>
      </nav>

      <!-- 상단 메타: 기간 / 기준일 -->
      <section class="mb-6">
        <div class="flex flex-col gap-3 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <div class="flex items-baseline gap-2">
            <span class="text-sm font-semibold text-slate-900">{{ periodLabel }} 랭킹</span>
            <span>기준 {{ baseDateLabel }}</span>
          </div>
          <div class="flex items-center gap-2 justify-end">
            <div class="flex rounded-full border border-slate-200 bg-white p-0.5">
              <button
                v-for="opt in periodTabs"
                :key="opt.value"
                type="button"
                class="rounded-full px-3 py-1 text-[11px] font-semibold transition-colors"
                :class="activePeriod === opt.value
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'"
                @click="onChangePeriod(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
            <div class="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 md:flex">
              <span class="text-[11px] text-slate-400">기준일자</span>
              <span class="text-[11px] font-semibold text-slate-700">{{ baseDateLabel }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Top 3 카드 -->
      <section class="mb-8">
        <div
          v-if="loading && top3.length === 0"
          class="grid gap-4 md:grid-cols-3"
        >
          <div
            v-for="i in 3"
            :key="i"
            class="flex flex-col"
          >
            <div class="mb-2 aspect-[3/4] w-full rounded-xl bg-slate-200 animate-pulse" />
            <div class="mb-1 h-3 w-3/4 rounded bg-slate-200 animate-pulse" />
            <div class="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
          </div>
        </div>

        <div
          v-else-if="top3.length > 0"
          class="grid gap-4 md:grid-cols-3"
        >
          <button
            v-for="(item, idx) in top3"
            :key="item.id"
            type="button"
            class="group flex flex-col text-left"
            @click="$router.push(`/concerts/${item.id}`)"
          >
            <div class="relative mb-3 overflow-hidden rounded-xl bg-slate-100 aspect-[3/4]">
              <img
                :src="item.posterUrl"
                :alt="item.title"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div
                class="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/90 text-sm font-bold text-white shadow-md"
              >
                {{ item.rank }}
              </div>
            </div>
            <div class="space-y-0.5">
              <p class="text-[11px] font-bold text-red-500">{{ getCategoryLabel(item.category) }}</p>
              <p class="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                {{ item.title }}
              </p>
              <p class="text-xs text-slate-500">
                {{ item.venueName || '-' }}
              </p>
              <p class="text-xs text-slate-400">
                {{ formatDateRange(item.scheduleStartDate, item.scheduleEndDate) }}
              </p>
            </div>
          </button>
        </div>

        <div
          v-else-if="!loading"
          class="rounded-xl border border-slate-200 bg-white py-8 text-center text-sm text-slate-400"
        >
          공연이 없습니다
        </div>
      </section>

      <!-- 랭킹 리스트 -->
      <section
        v-if="rows.length > 0"
        class="rounded-xl border border-slate-200 bg-white"
      >
        <!-- 헤더 -->
        <div class="grid grid-cols-[56px_minmax(0,1.8fr)_1.1fr_1.1fr_0.8fr] border-b border-slate-200 px-4 py-3 text-[11px] font-semibold text-slate-400">
          <div class="text-center">순위</div>
          <div>공연명</div>
          <div class="text-center">공연장</div>
          <div class="text-center">공연기간</div>
          <div class="text-center">예매율</div>
        </div>

        <!-- 아이템 -->
        <button
          v-for="(item, idx) in rows"
          :key="item.id"
          type="button"
          class="grid w-full grid-cols-[56px_minmax(0,1.8fr)_1.1fr_1.1fr_0.8fr] items-center border-b border-slate-100 px-4 py-3 text-left text-xs last:border-b-0"
@click="$router.push(`/concerts/${item.id}`)"
          >
            <!-- 순위 -->
          <div class="text-center text-sm font-bold text-slate-900">
            {{ item.rank }}
          </div>

          <!-- 포스터 + 정보 -->
          <div class="flex items-center gap-3">
            <div class="h-14 w-10 overflow-hidden rounded bg-slate-100">
              <img
                :src="item.posterUrl"
                :alt="item.title"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="min-w-0 space-y-0.5">
              <p class="truncate text-[11px] font-bold text-red-500">
                {{ getCategoryLabel(item.category) }}
              </p>
              <p class="truncate text-sm font-semibold text-slate-900">
                {{ item.title }}
              </p>
              <p class="truncate text-[11px] text-slate-500">
                {{ item.venueName || '-' }}
              </p>
            </div>
          </div>

          <!-- 공연장 -->
          <div class="truncate text-center text-[11px] text-slate-500">
            {{ item.venueName || '-' }}
          </div>

          <!-- 공연기간 -->
          <div class="truncate text-center text-[11px] text-slate-500">
            {{ formatDateRange(item.scheduleStartDate, item.scheduleEndDate) }}
          </div>

          <!-- 예매율 -->
          <div class="text-center text-[11px] font-semibold text-slate-900">
            <span v-if="item.bookingRate != null">
              {{ item.bookingRate.toFixed(1) }}%
            </span>
            <span v-else>-</span>
          </div>
        </button>
      </section>

      <div
        v-else-if="!loading"
        class="rounded-xl border border-slate-200 bg-white py-8 text-center text-sm text-slate-400"
      >
        공연이 없습니다
      </div>

      <div v-if="loading && rows.length === 0" class="mt-6 text-center text-sm text-slate-400">
        불러오는 중…
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { CONCERT_CATEGORY_OPTIONS, getCategoryLabel } from '../../lib/constants/concertCategory'

const DEFAULT_IMG =
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=400&q=60'

const api = useApi()
const route = useRoute()
const router = useRouter()

const categoryTabs = [
  { value: '', label: '전체' },
  ...CONCERT_CATEGORY_OPTIONS,
]

const periodTabs = [
  { value: 'DAY', label: '일간' },
  { value: 'WEEK', label: '주간' },
  { value: 'MONTH', label: '월간' },
]

const activeCategory = ref((route.query.category ?? '') || '')
const activePeriod = ref('DAY')

const items = ref([])
const loading = ref(false)

const baseDate = ref(new Date())
const baseDateLabel = computed(() => {
  const d = baseDate.value
  return d
    .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/\. /g, '.')
    .replace(/\.$/, '')
})

const periodLabel = computed(() => {
  const t = periodTabs.find((p) => p.value === activePeriod.value)
  return t?.label ?? '일간'
})

const top3 = computed(() => items.value.slice(0, 3))
const rows = computed(() => items.value.slice(3))

function onChangeCategory(value) {
  if (value === activeCategory.value) return
  const query = { ...route.query }
  if (value) query.category = value
  else delete query.category
  router.push({ path: '/concerts/ranking', query })
}

function onChangePeriod(value) {
  if (value === activePeriod.value) return
  activePeriod.value = value
  loadRanking()
}

watch(
  () => route.query.category,
  (val) => {
    activeCategory.value = (val ?? '') || ''
    loadRanking()
  },
)

/** GET /concerts/ranking 응답 item 매핑 (concertId → id, rank 유지) */
function mapRankingItem(c) {
  return {
    id: c.concertId ?? c.id,
    rank: c.rank ?? 0,
    title: c.title ?? c.name ?? '',
    category: c.category ?? '',
    posterUrl: c.posterUrl ?? c.thumImgUrl ?? c.thumbnailUrl ?? c.imageUrl ?? DEFAULT_IMG,
    venueName: c.venueName ?? c.venue?.name ?? null,
    scheduleStartDate: c.scheduleStartDate ?? c.schedule_start_date ?? null,
    scheduleEndDate: c.scheduleEndDate ?? c.schedule_end_date ?? null,
    bookingCount: c.bookingCount ?? c.booking_count ?? null,
    bookingRate: c.bookingRate ?? c.booking_rate ?? null,
    rankDiff: c.rankDiff ?? null,
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

function toYyyyMmDd(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

async function loadRanking() {
  loading.value = true
  try {
    // 1차: 장르별 예매율 랭킹 전용 API 사용
    const url = ENDPOINTS.concertsRanking({
      period: activePeriod.value,
      baseDate: toYyyyMmDd(baseDate.value),
      category: activeCategory.value || undefined,
      page: 0,
      size: 30,
    })
    const res = await api.get(url)
    const list = res?.items ?? res?.content ?? (Array.isArray(res) ? res : [])
    items.value = list.map(mapRankingItem)
    if (res?.baseDate) {
      const d = new Date(res.baseDate)
      if (!isNaN(d.getTime())) baseDate.value = d
    }
  } catch (_) {
    // 백엔드에서 /concerts/ranking 미지원 시 기존 예매수 기반 목록 API로 폴백
    try {
      const fallbackUrl = ENDPOINTS.searchConcerts({
        category: activeCategory.value || undefined,
        page: 0,
        size: 30,
        sort: 'bookingCount,desc',
      })
      const res = await api.get(fallbackUrl)
      const list = res?.items ?? res?.content ?? (Array.isArray(res) ? res : [])
      items.value = list.map((c, i) => mapRankingItem({ ...c, rank: c.rank ?? i + 1 }))
      if (res?.baseDate) {
        const d = new Date(res.baseDate)
        if (!isNaN(d.getTime())) baseDate.value = d
      }
    } catch (_) {
      items.value = []
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRanking()
})
</script>

<style scoped>
.aspect-\[3\/4\] {
  aspect-ratio: 3 / 4;
}
</style>

