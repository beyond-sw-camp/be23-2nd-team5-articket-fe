<template>
  <div class="grid gap-6">
    <!-- 장르 타이틀 -->
    <h1 class="text-2xl font-bold text-slate-900 lg:text-3xl">{{ genreLabel }}</h1>

    <!-- 보기 방식 토글 + 정렬 버튼 -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <button
          type="button"
          :class="[viewMode === 'grid' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50']"
          class="flex h-9 w-9 items-center justify-center rounded-lg transition"
          aria-label="그리드 보기"
          @click="viewMode = 'grid'"
        >
          <LayoutGrid class="h-4 w-4" />
        </button>
        <button
          type="button"
          :class="[viewMode === 'list' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50']"
          class="flex h-9 w-9 items-center justify-center rounded-lg transition"
          aria-label="리스트 보기"
          @click="viewMode = 'list'"
        >
          <List class="h-4 w-4" />
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-for="opt in sortOptions"
          :key="opt.value"
          type="button"
          :class="[sortBy === opt.value ? 'font-semibold text-slate-900' : 'text-slate-500 hover:text-slate-700']"
          class="text-sm transition"
          @click="sortBy = opt.value; load()"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="rounded-xl border border-slate-200 p-12 text-center text-sm text-slate-500">
      불러오는 중…
    </div>

    <!-- 빈 결과 -->
    <div v-else-if="items.length === 0" class="rounded-xl border border-slate-200 p-12">
      <EmptyState title="해당 장르의 공연이 없어요" description="다른 장르를 선택해보세요." />
    </div>

    <!-- 공연 목록 (그리드) -->
    <div
      v-else
      :class="[
        'grid gap-4',
        viewMode === 'grid'
          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
          : 'grid-cols-1'
      ]"
    >
      <div
        v-for="c in sortedItems"
        :key="c.id"
        class="group cursor-pointer"
        @click="$router.push(`/concerts/${c.id}`)"
      >
        <div
          :class="[
            'overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md',
            viewMode === 'list' ? 'flex gap-4' : ''
          ]"
        >
          <div
            :class="[
              'flex-shrink-0 overflow-hidden bg-slate-100',
              viewMode === 'grid' ? 'aspect-[3/4]' : 'h-24 w-32'
            ]"
          >
            <img
              :src="c.posterUrl"
              :alt="c.title"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="flex flex-1 flex-col justify-center p-3 text-left">
            <h3 class="line-clamp-2 text-sm font-semibold text-slate-900">
              {{ c.title }}
            </h3>
            <p class="mt-1 text-xs text-slate-500">
              {{ formatDateRange(c.scheduleStartDate, c.scheduleEndDate) }}
            </p>
            <span
              class="mt-1 inline-flex w-fit rounded px-2 py-0.5 text-xs font-medium"
              :class="statusBadgeClass(c.status)"
            >
              {{ statusLabel(c.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { LayoutGrid, List } from 'lucide-vue-next'
import EmptyState from '../../components/common/EmptyState.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { CONCERT_CATEGORY_LABELS } from '../../lib/constants/concertCategory'

const SORT_OPTIONS = [
  { value: 'popular', label: '인기순' },
  { value: 'imminent', label: '공연임박순' },
  { value: 'latest', label: '최신순' }
]

export default {
  name: 'GenreConcertsView',
  components: {
    LayoutGrid,
    List,
    EmptyState
  },
  data() {
    return {
      loading: false,
      items: [],
      viewMode: 'grid',
      sortBy: 'popular',
      sortOptions: SORT_OPTIONS,
      api: null
    }
  },
  computed: {
    genreKey() {
      return String(this.$route.params.genre || '').toUpperCase()
    },
    genreLabel() {
      return CONCERT_CATEGORY_LABELS[this.genreKey] ?? this.genreKey ?? '공연'
    },
    sortedItems() {
      const list = [...this.items]
      if (this.sortBy === 'imminent') {
        return list.sort((a, b) => {
          const da = a.scheduleStartDate ? new Date(a.scheduleStartDate).getTime() : 0
          const db = b.scheduleStartDate ? new Date(b.scheduleStartDate).getTime() : 0
          return da - db
        })
      }
      if (this.sortBy === 'latest') {
        return list.sort((a, b) => {
          const da = a.scheduleStartDate ? new Date(a.scheduleStartDate).getTime() : 0
          const db = b.scheduleStartDate ? new Date(b.scheduleStartDate).getTime() : 0
          return db - da
        })
      }
      return list
    }
  },
  watch: {
    '$route.params.genre'() {
      this.load()
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  methods: {
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
      if (s && e && s !== e) return `${s} - ${e}`
      return s || e || '-'
    },
    statusLabel(status) {
      if (status === 'PUBLISHED') return '예매가능'
      if (status === 'DRAFT') return '준비중'
      if (status === 'ENDED') return '종료'
      return status ?? '예매가능'
    },
    statusBadgeClass(status) {
      if (status === 'PUBLISHED') return 'bg-green-100 text-green-700'
      if (status === 'ENDED') return 'bg-slate-100 text-slate-600'
      return 'bg-amber-100 text-amber-700'
    },
    async load() {
      if (!this.genreKey) return
      this.loading = true
      try {
        const params = new URLSearchParams()
        params.set('page', '0')
        params.set('size', '50')
        params.set('category', this.genreKey)
        if (this.sortBy === 'imminent') params.set('sort', 'scheduleStartDate,asc')
        if (this.sortBy === 'latest') params.set('sort', 'scheduleStartDate,desc')
        const res = await this.api.get(`${ENDPOINTS.concerts()}?${params.toString()}`)
        const list = res.content ?? res.items ?? []
        this.items = list.map((c) => ({
          id: c.id,
          title: c.title ?? c.name,
          category: c.category ?? '',
          status: c.status ?? 'PUBLISHED',
          posterUrl:
            c.thumImgUrl ?? c.thum_img_url ?? c.posterUrl ?? c.thumbnailUrl ?? c.imageUrl ?? 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=60',
          venueName: c.venueName ?? c.venue?.name ?? null,
          scheduleCount: c.scheduleCount ?? c.schedule_count ?? null,
          scheduleStartDate: c.scheduleStartDate ?? c.schedule_start_date ?? null,
          scheduleEndDate: c.scheduleEndDate ?? c.schedule_end_date ?? null
        }))
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
