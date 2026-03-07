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
      <StatCard label="오늘 매출" :value="formatWon(todaySalesAmount)" hint="PAID 주문 기준" />
      <StatCard label="이번 달 매출" :value="formatWon(thisMonthSalesAmount)" hint="이번 달 누적" />
      <StatCard label="전체 매출" :value="formatWon(totalSalesAmount)" hint="전체 기간 누적" />
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
          <UiButton class="h-11 px-5" @click="$router.push('/organizer/concerts/new')">공연 생성</UiButton>
        </div>
      </div>
    </UiCard>

    <UiCard>
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">공연별 매출 TOP 3</div>
          <div class="mt-1 text-sm text-slate-500">예매율, 매출, 잔여 좌석을 함께 표시합니다.</div>
        </div>
        <UiBadge tone="soft">실시간 집계</UiBadge>
      </div>

      <div v-if="loading" class="mt-4 text-sm text-slate-500">불러오는 중...</div>
      <div v-else class="mt-4">
        <UiTable :columns="topColumns" :rows="topRows">
          <template #cell:title="{ row }">
            <button
              class="font-semibold text-slate-900 hover:underline"
              type="button"
              @click="$router.push(`/organizer/concerts/${row.concertId}`)"
            >
              {{ row.title }}
            </button>
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
            {{ formatWon(row.revenue) }}
          </template>

          <template #cell:remainingSeats="{ row }">
            <span :class="row.remainingSeats === 0 ? 'font-semibold text-red-600' : ''">
              {{ row.remainingSeats === 0 ? '매진' : `${formatCount(row.remainingSeats)} / ${formatCount(row.totalSeats)}` }}
            </span>
          </template>
        </UiTable>
      </div>
    </UiCard>

    <UiCard>
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">최근 7일 매출</div>
          <div class="mt-1 text-sm text-slate-500">날짜별 매출 흐름입니다.</div>
        </div>
      </div>

      <div v-if="loading" class="mt-4 text-sm text-slate-500">불러오는 중...</div>
      <div v-else class="mt-4 grid gap-4">
        <div class="rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-4">
          <div class="flex h-40 items-end gap-2">
            <div
              v-for="day in dailySales"
              :key="`bar-${day.date}`"
              class="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <div class="flex h-28 w-full max-w-12 items-end">
                <div
                  class="w-full rounded-t-md bg-emerald-500/80 transition-[height] duration-300"
                  :style="{ height: `${chartHeight(day.salesAmount)}%` }"
                  :title="`${formatDateWithDay(day.date)} - ${formatWon(day.salesAmount)}`"
                />
              </div>
              <div class="text-[11px] font-medium text-slate-500">
                {{ formatDateWithDay(day.date) }}
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-2">
          <div
            v-for="day in dailySales"
            :key="day.date"
            class="grid items-center gap-3 sm:grid-cols-[96px_1fr_120px]"
          >
            <div class="text-xs font-medium text-slate-500">{{ formatDateWithDay(day.date) }}</div>
            <div class="h-2 overflow-hidden rounded-full bg-slate-100">
              <div class="h-full rounded-full bg-emerald-500/40" :style="{ width: `${barWidth(day.salesAmount)}%` }" />
            </div>
            <div class="text-right text-sm font-medium text-slate-700">{{ formatWon(day.salesAmount) }}</div>
          </div>
        </div>
      </div>
    </UiCard>
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
        { key: 'title', label: '공연명' },
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
      return topConcerts.map((row) => ({
        concertId: row.concertId ?? row.concert_id,
        title: row.title ?? '-',
        status: row.status ?? '-',
        revenue: Number(row.revenue ?? 0),
        remainingSeats: Number(row.remainingSeats ?? row.remaining_seats ?? 0),
        totalSeats: Number(row.totalSeats ?? row.total_seats ?? 0),
        bookingRate: Number(row.bookingRate ?? row.booking_rate ?? 0)
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
