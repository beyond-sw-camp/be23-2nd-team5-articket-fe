<template>
  <div class="space-y-6">
    <!-- 로딩 중 스켈레톤 -->
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

    <!-- 공연 데이터가 정상적으로 있는 경우 -->
    <template v-else-if="item">
      <div class="flex items-center justify-between">
        <UiButton variant="ghost" class="-ml-2 h-9 px-2 text-sm text-slate-600" @click="$router.push('/organizer/concerts')">
          <ChevronLeft class="mr-0.5 h-5 w-5" />
          공연 목록
        </UiButton>
        <UiButton class="h-9 px-4" @click="$router.push(`/organizer/concerts/${item.id}/edit`)">
          <Pencil class="mr-1.5 h-4 w-4" />
          수정
        </UiButton>
      </div>

      <!-- 공연 기본 정보 -->
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
            <div class="absolute left-3 top-3">
              <UiBadge :tone="statusTone(item.status)" :color="statusColor(item.status)">
                {{ statusLabel(item.status) }}
              </UiBadge>
            </div>
          </div>
        </div>

        <div class="min-w-0 flex-1">
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

      <!-- 액션 카드 -->
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

        <!-- 추가된 좌석맵 보기 액션 -->
        <button
          type="button"
          class="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-red-200 hover:bg-red-50/50 hover:shadow"
          @click="openSeatMapPreview"
        >
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <Ticket class="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <div class="text-sm font-semibold text-slate-900">좌석맵 보기</div>
            <div class="text-xs text-slate-500">현재 공연에 연결된 좌석맵 확인</div>
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

      <!-- 좌석 통계 -->
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

      <!-- 좌석맵 미리보기 모달 -->
      <UiModal
        :open="seatMapPreviewOpen"
        title="좌석맵 보기"
        max-width-class="max-w-6xl"
        @close="closeSeatMapPreview"
      >
        <div v-if="seatMapPreview" class="flex h-[75vh] flex-col">
          <!-- 썸네일 이미지를 확대/축소/드래그해서 보는 영역 -->
          <div
            class="relative w-full flex-1 select-none overflow-hidden rounded-lg bg-slate-50 p-2"
            :class="isPreviewDragging ? 'cursor-grabbing' : 'cursor-grab'"
            @wheel.prevent="onPreviewWheel"
            @mousedown.left="startPreviewDrag"
            @mousemove="onPreviewDrag"
            @mouseup="endPreviewDrag"
            @mouseleave="endPreviewDrag"
          >
            <img
              v-if="seatMapPreview.thumbnailUrl || seatMapPreview.thumbnail_url"
              :src="seatMapPreview.thumbnailUrl || seatMapPreview.thumbnail_url"
              :alt="seatMapPreview.name || '좌석맵'"
              class="block h-full w-full rounded-lg object-contain transition-transform duration-75"
              :style="{
                transform: `translate(${previewOffsetX}px, ${previewOffsetY}px) scale(${previewScale})`,
                transformOrigin: 'center center',
                willChange: 'transform'
              }"
              draggable="false"
              @dragstart.prevent
              @error="$event.target.style.display='none'"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-500"
            >
              좌석맵 미리보기가 없습니다.
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <p class="text-sm text-slate-600">{{ seatMapPreview.name || `배치 ${seatMapPreview.id}` }}</p>
            <div class="flex items-center gap-2">
              <UiButton variant="ghost" class="h-8 px-3 text-xs" @click="zoomOutPreview">-</UiButton>
              <div class="text-xs text-slate-500">{{ Math.round(previewScale * 100) }}%</div>
              <UiButton variant="ghost" class="h-8 px-3 text-xs" @click="zoomInPreview">+</UiButton>
              <UiButton variant="ghost" class="h-8 px-3 text-xs" @click="resetPreviewZoom">100%</UiButton>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UiButton variant="ghost" @click="closeSeatMapPreview">닫기</UiButton>
          </div>
        </template>
      </UiModal>
    </template>

    <!-- 공연을 못 찾았을 때 -->
    <EmptyState v-else title="공연을 찾을 수 없습니다" description="존재하지 않거나 권한이 없는 공연일 수 있습니다.">
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
import UiModal from '../../components/common/UiModal.vue'
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
    EmptyState,
    UiModal
  },
  computed: {
    // 점유율 표시 문자열
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
      api: null,

      // 좌석맵 미리보기 모달 상태
      seatMapPreviewOpen: false,
      seatMapPreview: null,

      // 이미지 확대/이동 상태
      previewScale: 1,
      previewOffsetX: 0,
      previewOffsetY: 0,
      isPreviewDragging: false,
      previewDragStartX: 0,
      previewDragStartY: 0
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  beforeUnmount() {
    this.isPreviewDragging = false
  },
  methods: {
    statusLabel(s) {
      const m = {
        DRAFT: '초안',
        PUBLISHED: '게시',
        ENDED: '종료',
        AVAILABLE: 'AVAILABLE'
      }
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

    // 공연 상세와 좌석 통계를 같이 조회
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
      } finally {
        this.loading = false
      }
    },

    // 공연에 연결된 seatMapId / venueId로 좌석맵 목록을 찾아 미리보기 데이터 확보
    async openSeatMapPreview() {
      if (!this.item) return

      const seatMapId =
        this.item.seatMapId ??
        this.item.seat_map_id ??
        this.item.concertSeatMapResDto?.id ??
        null

      const venueId =
        this.item.venue?.id ??
        this.item.venueId ??
        this.item.venue_id ??
        null

      if (!seatMapId || !venueId) return

      try {
        const res = await this.api.get(ENDPOINTS.venueSeatMaps(venueId))
        const seatMaps = Array.isArray(res) ? res : res?.content || res?.items || []
        this.seatMapPreview =
          seatMaps.find((sm) => Number(sm.id) === Number(seatMapId)) ?? null
      } catch (err) {
        this.seatMapPreview = null
      }

      // 모달 열 때 확대/이동 상태 초기화
      this.previewScale = 1
      this.previewOffsetX = 0
      this.previewOffsetY = 0
      this.isPreviewDragging = false
      this.seatMapPreviewOpen = true
    },

    closeSeatMapPreview() {
      this.seatMapPreviewOpen = false
      this.previewScale = 1
      this.previewOffsetX = 0
      this.previewOffsetY = 0
      this.isPreviewDragging = false
    },

    // 마우스 휠로 확대/축소
    onPreviewWheel(evt) {
      const delta = evt.deltaY > 0 ? -0.1 : 0.1
      this.previewScale = Math.min(4, Math.max(0.5, +(this.previewScale + delta).toFixed(2)))
    },

    // 드래그 시작
    startPreviewDrag(evt) {
      this.isPreviewDragging = true
      this.previewDragStartX = evt.clientX - this.previewOffsetX
      this.previewDragStartY = evt.clientY - this.previewOffsetY
    },

    // 드래그 중 위치 이동
    onPreviewDrag(evt) {
      if (!this.isPreviewDragging) return
      this.previewOffsetX = evt.clientX - this.previewDragStartX
      this.previewOffsetY = evt.clientY - this.previewDragStartY
    },

    // 드래그 종료
    endPreviewDrag() {
      this.isPreviewDragging = false
    },

    zoomInPreview() {
      this.previewScale = Math.min(4, +(this.previewScale + 0.1).toFixed(2))
    },

    zoomOutPreview() {
      this.previewScale = Math.max(0.5, +(this.previewScale - 0.1).toFixed(2))
    },

    resetPreviewZoom() {
      this.previewScale = 1
      this.previewOffsetX = 0
      this.previewOffsetY = 0
    }
  }
}
</script>
