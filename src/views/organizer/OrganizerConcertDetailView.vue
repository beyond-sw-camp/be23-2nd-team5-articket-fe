<template>
  <div class="space-y-6">
    <!-- 로딩 스켈레톤 -->
    <template v-if="loading">
      <div class="flex gap-6">
        <div class="h-64 w-48 shrink-0 animate-pulse rounded-2xl bg-slate-200" />
        <div class="flex-1 space-y-3">
          <div class="h-8 w-3/4 animate-pulse rounded bg-slate-200" />
          <div class="h-5 w-1/4 animate-pulse rounded bg-slate-100" />
          <div class="h-5 w-1/3 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div class="grid gap-3 sm:grid-cols-4">
        <div v-for="i in 4" :key="i" class="h-20 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </template>

    <template v-else-if="item">
      <!-- 상단: 뒤로가기 | 수정 -->
      <div class="flex items-center justify-between">
        <UiButton variant="ghost" class="h-9 px-2 text-sm text-slate-600 -ml-2" @click="$router.push('/organizer/concerts')">
          <ChevronLeft class="h-5 w-5 mr-0.5" />
          공연 목록
        </UiButton>
        <UiButton class="h-9 px-4" @click="$router.push(`/organizer/concerts/${item.id}/edit`)">
          <Pencil class="h-4 w-4 mr-1.5" />
          수정
        </UiButton>
      </div>

      <!-- 히어로: 포스터 + 메타 -->
      <div class="flex flex-col gap-6 sm:flex-row">
        <div class="shrink-0">
          <div class="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
            <img
              v-if="item.thumImgUrl"
              :src="item.thumImgUrl"
              :alt="item.title"
              class="aspect-[3/4] w-full min-w-[200px] max-w-[240px] object-cover sm:w-56"
              @error="onThumbError"
            />
            <div v-else class="flex aspect-[3/4] min-w-[200px] max-w-[240px] items-center justify-center bg-slate-100 sm:w-56">
              <Ticket class="h-16 w-16 text-slate-300" />
            </div>
            <div class="absolute top-3 left-3">
              <UiBadge :tone="statusTone(item.status)" :color="statusColor(item.status)">
                {{ statusLabel(item.status) }}
              </UiBadge>
            </div>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">{{ item.title }}</h1>
          <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span v-if="item.venue?.name" class="flex items-center gap-1">
              <MapPin class="h-4 w-4 text-slate-400" />
              {{ item.venue.name }}
            </span>
            <span v-if="item.category">{{ categoryLabel(item.category) }}</span>
            <span v-if="(item.ageLimit ?? item.age_limit) != null">{{ ageLabel(item.ageLimit ?? item.age_limit) }}</span>
          </div>
          <div v-if="item.priceRange" class="mt-2 text-sm font-medium text-slate-700">
            {{ item.priceRange }}
          </div>
        </div>
      </div>

      <!-- 퀵 액션 카드 -->
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          class="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-red-200 hover:bg-red-50/50 hover:shadow"
          @click="$router.push(`/organizer/concerts/${item.id}/policies`)"
        >
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <Settings class="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <div class="text-sm font-semibold text-slate-900">정책 설정</div>
            <div class="text-xs text-slate-500">가격·취소 정책 관리</div>
          </div>
          <ChevronRight class="ml-auto h-5 w-5 shrink-0 text-slate-400" />
        </button>
        <button
          type="button"
          class="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-red-200 hover:bg-red-50/50 hover:shadow"
          @click="$router.push(`/organizer/concerts/${item.id}/schedules`)"
        >
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <CalendarDays class="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <div class="text-sm font-semibold text-slate-900">회차 관리</div>
            <div class="text-xs text-slate-500">공연 일정·좌석 등록</div>
          </div>
          <ChevronRight class="ml-auto h-5 w-5 shrink-0 text-slate-400" />
        </button>
        <button
          v-if="item.status === 'DRAFT'"
          type="button"
          class="flex items-center gap-4 rounded-xl border-2 border-red-200 bg-red-50/50 p-4 text-left shadow-sm transition hover:bg-red-50 hover:shadow"
          @click="$router.push(`/organizer/concerts/${item.id}/publish`)"
        >
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100">
            <Send class="h-5 w-5 text-red-600" />
          </div>
          <div>
            <div class="text-sm font-semibold text-red-800">게시하기</div>
            <div class="text-xs text-red-600/80">사용자에게 공개</div>
          </div>
          <ChevronRight class="ml-auto h-5 w-5 shrink-0 text-red-400" />
        </button>
        <button
          v-if="item.status === 'PUBLISHED'"
          type="button"
          class="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-red-200 hover:bg-red-50/50 hover:shadow"
          @click="$router.push(`/organizer/concerts/${item.id}/orders`)"
        >
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <Receipt class="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <div class="text-sm font-semibold text-slate-900">주문 현황</div>
            <div class="text-xs text-slate-500">예매·결제 내역</div>
          </div>
          <ChevronRight class="ml-auto h-5 w-5 shrink-0 text-slate-400" />
        </button>
      </div>

      <!-- 좌석 현황 + 점유율 바 -->
      <UiCard v-if="stats" class="overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-slate-900">좌석 현황</h2>
            <p class="mt-0.5 text-xs text-slate-500">예매 진행 상황</p>
          </div>
          <UiButton v-if="item.status === 'PUBLISHED'" variant="ghost" class="h-8 px-3 text-xs" @click="$router.push(`/organizer/concerts/${item.id}/orders`)">
            주문 상세
            <ChevronRight class="ml-1 h-4 w-4" />
          </UiButton>
        </div>
        <div v-if="(stats.totalSeats ?? 0) > 0" class="mt-4">
          <div class="mb-2 flex justify-between text-sm">
            <span class="text-slate-600">점유율</span>
            <span class="font-semibold text-slate-900">{{ occupancyDisplay }}</span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-red-500 transition-all"
              :style="{ width: `${Math.min(100, (stats.occupancyRate ?? 0) || 0)}%` }"
            />
          </div>
        </div>
        <div class="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <div class="rounded-xl bg-slate-50 p-3">
            <div class="text-xs font-medium text-slate-500">총 좌석</div>
            <div class="mt-1 text-lg font-bold text-slate-900">{{ (stats.totalSeats ?? 0).toLocaleString() }}</div>
          </div>
          <div class="rounded-xl bg-green-50 p-3">
            <div class="text-xs font-medium text-slate-600">예매 가능</div>
            <div class="mt-1 text-lg font-bold text-green-800">{{ (stats.availableSeats ?? 0).toLocaleString() }}</div>
          </div>
          <div class="rounded-xl bg-slate-50 p-3">
            <div class="text-xs font-medium text-slate-500">예약중</div>
            <div class="mt-1 text-lg font-bold text-slate-900">{{ (stats.reservedSeats ?? 0).toLocaleString() }}</div>
          </div>
          <div class="rounded-xl bg-red-50 p-3">
            <div class="text-xs font-medium text-slate-600">판매 완료</div>
            <div class="mt-1 text-lg font-bold text-red-800">{{ (stats.soldSeats ?? 0).toLocaleString() }}</div>
          </div>
          <div class="rounded-xl bg-slate-50 p-3">
            <div class="text-xs font-medium text-slate-500">점유율</div>
            <div class="mt-1 text-lg font-bold text-slate-900">{{ occupancyDisplay }}</div>
          </div>
          <div v-if="stats.seatsGenerated != null" class="rounded-xl bg-slate-50 p-3">
            <div class="text-xs font-medium text-slate-500">좌석 생성</div>
            <div class="mt-1">
              <UiBadge :tone="stats.seatsGenerated ? 'solid' : 'soft'" :color="stats.seatsGenerated ? 'green' : 'slate'">
                {{ stats.seatsGenerated ? '완료' : '대기' }}
              </UiBadge>
            </div>
          </div>
        </div>
      </UiCard>
    </template>

    <!-- 에러/없음 -->
    <EmptyState v-else title="공연을 찾을 수 없습니다" description="존재하지 않거나 권한이 없을 수 있습니다.">
      <UiButton class="mt-3" @click="$router.push('/organizer/concerts')">목록으로</UiButton>
    </EmptyState>
  </div>
</template>

<script>
import { ChevronLeft, ChevronRight, MapPin, Ticket, Settings, CalendarDays, Send, Receipt, Pencil } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { getCategoryLabel } from '../../lib/constants/concertCategory'

export default {
  name: 'OrganizerConcertDetailView',
  components: {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Ticket,
    Settings,
    CalendarDays,
    Send,
    Receipt,
    Pencil,
    UiCard,
    UiButton,
    UiBadge,
    EmptyState
  },
  computed: {
    occupancyDisplay() {
      const rate = this.stats?.occupancyRate
      if (rate == null || Number.isNaN(rate)) return '-'
      return `${Number(rate).toFixed(1)}%`
    }
  },
  data() {
    return {
      loading: false,
      item: null,
      stats: null,
      api: null
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  methods: {
    statusLabel(s) {
      const m = { DRAFT: '초안', PUBLISHED: '게시', ENDED: '종료' }
      return m[s] ?? s ?? '-'
    },
    statusTone(s) {
      return s === 'PUBLISHED' ? 'solid' : 'soft'
    },
    statusColor(s) {
      if (s === 'PUBLISHED') return 'red'
      if (s === 'ENDED') return 'slate'
      return 'amber'
    },
    categoryLabel(cat) {
      return getCategoryLabel(cat)
    },
    ageLabel(age) {
      if (age == null || age === '') return ''
      if (age === 0) return '전체관람가'
      return `${age}세 이상`
    },
    onThumbError(e) {
      e.target.style.display = 'none'
    },
    async load() {
      const concertId = this.$route.params.concertId
      if (concertId == null || concertId === '') {
        this.loading = false
        return
      }
      this.loading = true
      try {
        const [detail, statsRes] = await Promise.all([
          this.api.get(ENDPOINTS.concert(concertId)),
          this.api.get(ENDPOINTS.organizerConcertStats(concertId)).catch(() => null)
        ])
        this.item = detail
        this.stats = statsRes
      } catch (err) {
        this.item = null
        // 에러는 ErrorAlertModal에서 표시됨
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
