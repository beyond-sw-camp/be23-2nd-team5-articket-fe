<template>
  <div class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">ORGANIZER 대시보드</div>
        <div class="mt-1 text-sm text-slate-500">오늘/월간/전체 매출과 상위 공연 성과를 확인합니다.</div>
      </div>
      <UiBadge tone="soft">ORGANIZER</UiBadge>
    </div>

    <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ errorMessage }}
    </div>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <button type="button" class="text-left" @click="goReportDetails('PAID')">
        <StatCard label="오늘 순 매출" :value="formatWon(todaySalesAmount)" hint="PAID 주문 기준" />
      </button>
      <button type="button" class="text-left" @click="goReportDetails('PAID')">
        <StatCard label="이번 달 순 매출" :value="formatWon(thisMonthSalesAmount)" hint="이번 달 누적" />
      </button>
      <button type="button" class="text-left" @click="goReportDetails('PAID')">
        <StatCard label="전체 순 매출" :value="formatWon(totalSalesAmount)" hint="전체 기간 누적" />
      </button>
      <StatCard label="오늘 주문 건수" :value="formatCount(todayOrderCount)" hint="오늘 생성된 PAID 주문" />
    </div>

    <UiCard>
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">빠른 이동</div>
          <div class="mt-1 text-sm text-slate-500">공연 생성과 공연 목록으로 바로 이동합니다.</div>
        </div>
        <div class="flex gap-2">
          <UiButton variant="ghost" class="h-11 px-4" @click="$router.push('/organizer/concerts')">내 공연</UiButton>
          <UiButton variant="ghost" class="h-11 px-4" @click="goReportDetails('PAID')">매출 상세</UiButton>
          <UiButton class="h-11 px-5" @click="$router.push('/organizer/concerts/new')">공연 생성</UiButton>
        </div>
      </div>
    </UiCard>

    <UiCard>
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">공연별 매출 TOP 3</div>
          <div class="mt-1 text-sm text-slate-500">공연 및 관람일시, 공연 장소, 관람 연령, 매출, 잔여 좌석을 함께 표시합니다.</div>
        </div>
        <UiBadge tone="soft">실시간 집계</UiBadge>
      </div>

      <div v-if="loading" class="mt-4 text-sm text-slate-500">불러오는 중...</div>
      <div v-else class="mt-4">
        <UiTable :columns="topColumns" :rows="topRows">
          <template #cell:title="{ row }">
            <button
              class="flex w-full items-center gap-4 text-left"
              type="button"
              @click="$router.push(`/organizer/concerts/${row.concertId}`)"
            >
              <!--
                - TOP 3만 렌더링하므로 img 3개는 부담되지 않음
              -->
              <div class="h-24 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                <img
                  v-if="row.thumImgUrl"
                  :src="row.thumImgUrl"
                  alt="공연 썸네일"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
                <div v-else class="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                  NO IMG
                </div>
              </div>

              <div class="min-w-0">
                <div class="truncate font-semibold text-slate-900">
                  {{ row.title }}
                </div>
                <div class="mt-1 text-sm text-slate-500">
                  {{ formatDateTime(row.playTime) }}
                </div>
              </div>
            </button>
          </template>

          <template #cell:venueName="{ row }">
            <span class="text-sm text-slate-700">
              {{ row.venueName || '-' }}
            </span>
          </template>

          <template #cell:ageLimit="{ row }">
            <span class="text-sm text-slate-700">
              {{ ageLabel(row.ageLimit) }}
            </span>
          </template>

          <template #cell:status="{ row }">
            <UiBadge :tone="row.status === 'PUBLISHED' ? 'solid' : 'soft'" :color="row.status === 'PUBLISHED' ? 'red' : 'slate'">
              {{ row.status === 'PUBLISHED' ? '게시' : row.status }}
            </UiBadge>
          </template>

          <template #cell:bookingRate="{ row }">
            {{ formatPercent(row.bookingRate) }}
          </template>

          <template #cell:revenue="{ row }">
            <button type="button" class="font-semibold text-red-600 hover:underline" @click="goConcertReportDetails(row.concertId)">
              {{ formatWon(row.revenue) }}
            </button>
          </template>

          <template #cell:remainingSeats="{ row }">
            <span :class="row.remainingSeats === 0 ? 'font-semibold text-red-600' : ''">
              {{ row.remainingSeats === 0 ? '매진' : `${formatCount(row.remainingSeats)} / ${formatCount(row.totalSeats)}` }}
            </span>
          </template>
        </UiTable>
      </div>
    </UiCard>

    <section class="grid gap-4 xl:grid-cols-2">
      <UiCard>
        <div class="text-sm font-semibold text-slate-900">오픈 예정 회차</div>
        <div class="mt-1 text-sm text-slate-500">예매 오픈을 앞둔 회차를 확인합니다.</div>

        <div v-if="loading" class="mt-4 text-sm text-slate-500">불러오는 중...</div>

        <div v-else class="mt-4 space-y-3">
          <div
            v-for="item in overview?.upcomingSchedules || []"
            :key="item.scheduleId"
            class="rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <div class="text-sm font-semibold text-slate-900">{{ item.concertTitle }}</div>
            <div class="mt-1 text-sm text-slate-500">{{ formatDateTime(item.playTime) }}</div>
            <div class="mt-2 flex items-center justify-between text-sm text-slate-600">
              <span>예매율 {{ formatPercent(item.bookingRate) }}</span>
              <span>잔여 {{ formatCount(item.remainingSeats) }} / {{ formatCount(item.totalSeats) }}</span>
            </div>
          </div>

          <div v-if="!(overview?.upcomingSchedules || []).length" class="text-sm text-slate-400">
            표시할 오픈 예정 회차가 없습니다.
          </div>
        </div>
      </UiCard>

      <UiCard>
        <div class="text-sm font-semibold text-slate-900">마감 임박 회차</div>
        <div class="mt-1 text-sm text-slate-500">운영 체크가 필요한 오픈 중 회차를 확인합니다.</div>

        <div v-if="loading" class="mt-4 text-sm text-slate-500">불러오는 중...</div>

        <div v-else class="mt-4 space-y-3">
          <div
            v-for="item in overview?.closingSoonSchedules || []"
            :key="item.scheduleId"
            class="rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <div class="text-sm font-semibold text-slate-900">{{ item.concertTitle }}</div>
            <div class="mt-1 text-sm text-slate-500">{{ formatDateTime(item.playTime) }}</div>
            <div class="mt-2 flex items-center justify-between text-sm text-slate-600">
              <span>예매율 {{ formatPercent(item.bookingRate) }}</span>
              <span>잔여 {{ formatCount(item.remainingSeats) }} / {{ formatCount(item.totalSeats) }}</span>
            </div>
          </div>

          <div v-if="!(overview?.closingSoonSchedules || []).length" class="text-sm text-slate-400">
            표시할 마감 임박 회차가 없습니다.
          </div>
        </div>
      </UiCard>
    </section>
  </div>
</template>

<script>
import StatCard from '../../components/common/StatCard.vue'
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiTable from '../../components/common/UiTable.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

const EMPTY_OVERVIEW = {
  todaySalesAmount: 0,
  thisMonthSalesAmount: 0,
  totalSalesAmount: 0,
  todayOrderCount: 0,
  topConcerts: [],
  dailySalesLast7Days: []
}

export default {
  name: 'OrganizerDashboardView',
  components: {
    StatCard,
    UiCard,
    UiBadge,
    UiButton,
    UiTable
  },
  data() {
    return {
      loading: false,
      errorMessage: '',
      overview: { ...EMPTY_OVERVIEW },
      api: null,
      topColumns: [
        { key: 'title', label: '공연 및 관람일시' },
        { key: 'venueName', label: '공연 장소' },
        { key: 'ageLimit', label: '관람 연령' },
        { key: 'bookingRate', label: '예매율' },
        { key: 'revenue', label: '매출' },
        { key: 'status', label: '상태' },
        { key: 'remainingSeats', label: '잔여 좌석' }
      ]
    }
  },
  computed: {
    todaySalesAmount() {
      return Number(this.overview.todaySalesAmount ?? this.overview.today_sales_amount ?? 0)
    },
    thisMonthSalesAmount() {
      return Number(this.overview.thisMonthSalesAmount ?? this.overview.this_month_sales_amount ?? 0)
    },
    totalSalesAmount() {
      return Number(this.overview.totalSalesAmount ?? this.overview.total_sales_amount ?? 0)
    },
    todayOrderCount() {
      return Number(this.overview.todayOrderCount ?? this.overview.today_order_count ?? 0)
    },
    topRows() {
      const topConcerts = this.overview.topConcerts ?? this.overview.top_concerts
      if (!Array.isArray(topConcerts)) return []

      /**
       * 성능 고려:
       * - overview 응답을 화면에서 여러 번 가공하지 않도록 computed에서 한 번 normalize 한다.
       * - TOP 3라서 가공 비용은 사실상 매우 작다.
       */
      return topConcerts.map((row) => ({
        concertId: row.concertId ?? row.concert_id,
        scheduleId: row.scheduleId ?? row.schedule_id,
        title: row.title ?? '-',
        playTime: row.playTime ?? row.play_time ?? null,
        status: row.status ?? '-',
        revenue: Number(row.revenue ?? 0),
        remainingSeats: Number(row.remainingSeats ?? row.remaining_seats ?? 0),
        totalSeats: Number(row.totalSeats ?? row.total_seats ?? 0),
        bookingRate: Number(row.bookingRate ?? row.booking_rate ?? 0),
        thumImgUrl: row.thumImgUrl ?? row.thum_img_url ?? '',
        venueName: row.venueName ?? row.venue_name ?? '',
        ageLimit: row.ageLimit ?? row.age_limit ?? 0
      }))
    },
    dailySales() {
      const source = this.overview.dailySalesLast7Days ?? this.overview.daily_sales_last7_days
      if (Array.isArray(source) && source.length > 0) {
        return source.map((item) => ({
          date: item.date,
          salesAmount: Number(item.salesAmount ?? item.sales_amount ?? 0)
        }))
      }

      const list = []
      const today = new Date()
      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        list.push({ date: d.toISOString().slice(0, 10), salesAmount: 0 })
      }
      return list
    },
    maxDailySales() {
      return this.dailySales.reduce((max, d) => Math.max(max, Number(d.salesAmount || 0)), 0)
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      this.errorMessage = ''
      try {
        const res = await this.api.get(ENDPOINTS.organizerDashboardOverview())
        this.overview = { ...EMPTY_OVERVIEW, ...(res || {}) }
      } catch (e) {
        this.overview = { ...EMPTY_OVERVIEW }
        this.errorMessage = e?.message || '대시보드 데이터를 불러오지 못했습니다.'
      } finally {
        this.loading = false
      }
    },
    goReportDetails(status) {
      this.$router.push({ path: '/organizer/reports/details', query: { status } })
    },
    goConcertReportDetails(concertId) {
      this.$router.push({ path: '/organizer/reports/details', query: { status: 'PAID', concertId: String(concertId) } })
    },
    formatWon(value) {
      const num = Number(value || 0)
      return `${num.toLocaleString()}원`
    },
    formatCount(value) {
      return Number(value || 0).toLocaleString()
    },
    formatPercent(value) {
      return `${Number(value || 0).toFixed(1)}%`
    },
    formatDateWithDay(dateString) {
      const d = new Date(dateString)
      if (Number.isNaN(d.getTime())) return dateString || '-'
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const weekdays = ['일', '월', '화', '수', '목', '금', '토']
      return `${mm}.${dd}(${weekdays[d.getDay()]})`
    },
    formatDateTime(value) {
      if (!value) return '-'
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return value

      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      const hh = String(date.getHours()).padStart(2, '0')
      const mi = String(date.getMinutes()).padStart(2, '0')

      return `${yyyy}.${mm}.${dd} ${hh}:${mi}`
    },

    /**
     * 관람 연령 표기 통일.
     * 0 또는 null은 전체관람가, 그 외는 "만 xx세 이상"으로 표기한다.
     */
    ageLabel(age) {
      const num = Number(age ?? 0)
      if (!Number.isFinite(num) || num <= 0) return '전체관람가'
      return `만 ${num}세 이상`
    },

    chartHeight(amount) {
      if (this.maxDailySales <= 0) return 6
      return Math.max(8, Math.round((Number(amount || 0) / this.maxDailySales) * 100))
    },
    barWidth(amount) {
      if (this.maxDailySales <= 0) return 0
      return Math.max(4, Math.round((Number(amount || 0) / this.maxDailySales) * 100))
    }
  }
}
</script>
