<template>
  <div class="grid gap-4">
    <div class="rounded-xl border border-slate-200 bg-white p-5">
      <h1 class="text-lg font-semibold text-slate-900">정산/리포트</h1>
      <p class="mt-2 text-sm text-slate-600">
        공연과 회차를 선택해 최근 매출, 환불 추이, 정산 내역을 확인합니다.
      </p>

      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">공연 선택</label>
          <select
            v-model="selectedConcertId"
            class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
            @change="onConcertChange"
          >
            <option
              v-for="item in concertOptions"
              :key="item.concertId ?? 'all'"
              :value="item.concertId"
            >
              {{ item.concertTitle }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">회차 선택</label>
          <select
            v-model="selectedScheduleId"
            class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
            @change="onScheduleChange"
          >
            <option
              v-for="item in scheduleOptions"
              :key="item.scheduleId ?? 'all-schedules'"
              :value="item.scheduleId"
            >
              {{ item.scheduleLabel }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div
      v-if="loading"
      class="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500"
    >
      데이터를 불러오는 중입니다.
    </div>

    <!-- 4개 카드를 한 grid 안의 직접 형제로 둬야 같은 행/같은 열 크기가 맞는다 -->
    <div v-else class="grid gap-4 2xl:grid-cols-2">
      <div class="flex min-w-0 h-full flex-col rounded-xl border border-slate-200 bg-white p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-slate-900">최근 7일 매출</h2>
            <p class="mt-1 text-sm text-slate-500">선택한 기준의 날짜별 매출 흐름입니다.</p>
          </div>
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            @click="goToDetail('PAID')"
          >
            매출 자세히 보기
          </button>
        </div>

        <div class="mt-8 grid h-72 grid-cols-7 items-end gap-4">
          <div
            v-for="item in dailySalesRows"
            :key="item.label"
            class="grid justify-items-center gap-3"
          >
            <div class="flex h-48 w-full items-end rounded-2xl bg-slate-100 p-2">
              <div
                class="w-full rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600"
                :style="{ height: `${item.height}%` }"
              ></div>
            </div>
            <div class="text-sm font-medium text-slate-600">{{ item.label }}</div>
            <div class="text-sm text-slate-700">{{ formatWon(item.salesAmount) }}</div>
          </div>
        </div>
      </div>

      <div class="flex min-w-0 h-full flex-col rounded-xl border border-slate-200 bg-white p-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-slate-900">월별 정산 내역</h2>
            <p class="mt-1 text-sm text-slate-500">공연 수익과 월별 정산 상태를 확인합니다.</p>
          </div>
          <button
            type="button"
            class="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white"
          >
            엑셀 다운로드
          </button>
        </div>

        <!-- 테이블은 폭이 부족하면 내부 스크롤로 대응 -->
        <div class="mt-6 flex-1 overflow-x-auto">
          <table class="min-w-[640px] w-full border-collapse text-left">
            <thead>
              <tr class="border-b border-slate-200 text-sm text-slate-500">
                <th class="pb-3 font-medium">대표공연 누적 수익</th>
                <th class="pb-3 font-medium">정산월</th>
                <th class="pb-3 font-medium">정산 금액</th>
                <th class="pb-3 font-medium">지급 상태</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in settlementRows"
                :key="row.settlementMonth"
                class="border-b border-slate-100"
              >
                <td class="py-4 text-sm text-slate-800">{{ formatWon(row.totalRevenue) }}</td>
                <td class="py-4 text-sm text-slate-800">{{ row.settlementMonth }}</td>
                <td class="py-4 text-sm text-slate-800">{{ formatWon(row.settlementAmount) }}</td>
                <td class="py-4">
                  <span
                    class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                    :class="statusClass(row.payoutStatus)"
                  >
                    {{ row.payoutStatus }}
                  </span>
                </td>
              </tr>

              <tr v-if="settlementRows.length === 0">
                <td colspan="4" class="py-8 text-center text-sm text-slate-400">
                  정산 내역이 없습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex min-w-0 h-full flex-col rounded-xl border border-slate-200 bg-white p-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-slate-900">일별 환불/매출 이중 차트</h2>
            <p class="mt-1 text-sm text-slate-500">최근 7일 환불과 매출을 같은 축으로 비교합니다.</p>
          </div>
          <div class="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span class="inline-flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              매출
            </span>
            <span class="inline-flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
              환불
            </span>
          </div>
        </div>

        <!-- 차트는 작은 폭에서 잘리지 않도록 내부만 가로 스크롤 -->
        <div class="mt-6 flex-1 overflow-x-auto">
          <div class="min-w-[720px]">
            <!-- 날짜 라벨도 SVG 안에 같이 넣어서 점 위치와 정확히 맞춤 -->
            <svg viewBox="0 0 720 290" class="h-80 w-full">
              <line
                v-for="line in chartGridLines"
                :key="line"
                x1="40"
                x2="680"
                :y1="line"
                :y2="line"
                stroke="#e2e8f0"
                stroke-dasharray="4 6"
              />

              <polyline
                v-if="salesPolyline"
                :points="salesPolyline"
                fill="none"
                stroke="#10b981"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <polyline
                v-if="refundPolyline"
                :points="refundPolyline"
                fill="none"
                stroke="#f43f5e"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <g v-for="point in chartPoints" :key="point.key">
                <circle :cx="point.x" :cy="point.salesY" r="4.5" fill="#10b981" />
                <circle :cx="point.x" :cy="point.refundY" r="4.5" fill="#f43f5e" />

                <text
                  :x="point.x"
                  :y="point.salesLabelY"
                  text-anchor="middle"
                  font-size="11"
                  font-weight="600"
                  fill="#059669"
                >
                  {{ point.salesLabel }}
                </text>

                <text
                  :x="point.x"
                  :y="point.refundLabelY"
                  text-anchor="middle"
                  font-size="11"
                  font-weight="600"
                  fill="#e11d48"
                >
                  {{ point.refundLabel }}
                </text>

                <text
                  :x="point.x"
                  y="276"
                  text-anchor="middle"
                  font-size="12"
                  fill="#64748b"
                >
                  {{ point.label }}
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div class="flex min-w-0 h-full flex-col rounded-xl border border-slate-200 bg-white p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-slate-900">환불/취소 요약</h2>
            <p class="mt-1 text-sm text-slate-500">선택한 공연·회차 기준 환불 현황입니다.</p>
          </div>
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            @click="goToDetail('REFUNDED')"
          >
            환불 자세히 보기
          </button>
        </div>

        <!-- 확대 시 너무 이른 2열 전환을 피하려고 lg부터 2열 -->
        <div class="mt-5 grid gap-3 lg:grid-cols-2">
          <div class="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div class="text-xs font-medium text-rose-500">이번 달 환불액</div>
            <div class="mt-2 text-2xl font-semibold text-slate-900">{{ formatWon(refundSummary.thisMonthRefundAmount) }}</div>
            <div class="mt-1 text-sm text-slate-500">{{ formatCount(refundSummary.thisMonthRefundCount) }}</div>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div class="text-xs font-medium text-slate-500">누적 환불액</div>
            <div class="mt-2 text-2xl font-semibold text-slate-900">{{ formatWon(refundSummary.totalRefundAmount) }}</div>
            <div class="mt-1 text-sm text-slate-500">{{ formatCount(refundSummary.totalRefundCount) }}</div>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-xs font-medium text-slate-500">이번 달 환불률</div>
                <div class="mt-2 text-2xl font-semibold text-slate-900">{{ formatPercent(refundSummary.thisMonthRefundRate) }}</div>
              </div>
              <div class="text-right">
                <div class="text-xs font-medium text-slate-500">기준 매출</div>
                <div class="mt-2 text-lg font-semibold text-slate-900">{{ formatWon(refundSummary.thisMonthSalesAmount) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'OrganizerReportsView',
  data() {
    return {
      api: null,
      loading: false,
      report: null,
      options: [],
      selectedConcertId: null,
      selectedScheduleId: null
    }
  },
  computed: {
    // 좌석 인사이트와 같은 방식으로 공연/회차 선택 옵션을 구성한다.
    concertOptions() {
      const map = new Map()
      map.set('all', {
        concertId: null,
        concertTitle: '전체 공연 집계'
      })

      for (const item of this.options) {
        if (!map.has(item.concertId)) {
          map.set(item.concertId, {
            concertId: item.concertId,
            concertTitle: item.concertTitle
          })
        }
      }

      return Array.from(map.values())
    },

    scheduleOptions() {
      if (this.selectedConcertId == null) {
        return [
          {
            scheduleId: null,
            scheduleLabel: '전체 회차 집계'
          }
        ]
      }

      return [
        {
          scheduleId: null,
          scheduleLabel: '전체 회차 집계'
        },
        ...this.options
          .filter(item => item.concertId === this.selectedConcertId)
          .map(item => ({
            scheduleId: item.scheduleId,
            scheduleLabel: this.formatScheduleLabel(item.scheduleLabel)
          }))
      ]
    },

    chartRows() {
      return this.report?.dailyRevenueRefunds ?? []
    },

    // 최근 7일 매출 막대 카드와 아래 이중 차트가 같은 기준 데이터를 사용한다.
    dailySalesRows() {
      const rows = this.chartRows
      const max = Math.max(...rows.map((item) => Number(item.salesAmount || 0)), 1)

      return rows.map((item) => ({
        ...item,
        label: this.formatDate(item.date),
        height: Math.max(10, Math.round((Number(item.salesAmount || 0) / max) * 100))
      }))
    },

    refundSummary() {
      return this.report?.refundSummary ?? {
        thisMonthRefundAmount: 0,
        totalRefundAmount: 0,
        thisMonthRefundCount: 0,
        totalRefundCount: 0,
        thisMonthSalesAmount: 0,
        thisMonthRefundRate: 0
      }
    },

    settlementRows() {
      return this.report?.monthlySettlements ?? []
    },

    chartMax() {
      const values = this.chartRows.flatMap((item) => [Number(item.salesAmount || 0), Number(item.refundAmount || 0)])
      return Math.max(...values, 1)
    },

    // SVG 좌표 계산을 날짜 라벨/금액 라벨과 동일한 축으로 맞춘다.
    chartPoints() {
      const width = 640
      const left = 40
      const top = 24
      const height = 196
      const count = this.chartRows.length

      if (!count) return []

      return this.chartRows.map((item, index) => {
        const x = count === 1 ? left + width / 2 : left + (width / (count - 1)) * index
        const salesAmount = Number(item.salesAmount || 0)
        const refundAmount = Number(item.refundAmount || 0)

        const salesY = top + height - (salesAmount / this.chartMax) * height
        const refundY = top + height - (refundAmount / this.chartMax) * height

        return {
          key: `${item.date}-${index}`,
          label: this.formatDate(item.date),
          x,
          salesY,
          refundY,
          salesLabelY: Math.max(14, salesY - 10),
          refundLabelY: Math.max(14, refundY - 10),
          salesLabel: this.formatCompactWon(salesAmount),
          refundLabel: this.formatCompactWon(refundAmount)
        }
      })
    },

    salesPolyline() {
      return this.chartPoints.map((point) => `${point.x},${point.salesY}`).join(' ')
    },

    refundPolyline() {
      return this.chartPoints.map((point) => `${point.x},${point.refundY}`).join(' ')
    },

    chartGridLines() {
      return [56, 104, 152, 200]
    }
  },
  created() {
    this.api = useApi()
  },
  async mounted() {
    await this.fetchOptions()
    await this.fetchSettlementReport()
  },
  methods: {
    async fetchOptions() {
      this.options = await this.api.get(ENDPOINTS.organizerSeatInsightOptions())
      this.selectedConcertId = null
      this.selectedScheduleId = null
    },

    async onConcertChange() {
      this.selectedScheduleId = null
      await this.fetchSettlementReport()
    },

    async onScheduleChange() {
      await this.fetchSettlementReport()
    },

    // 선택된 공연/회차를 리포트 API에 그대로 전달한다.
    async fetchSettlementReport() {
      this.loading = true
      try {
        this.report = await this.api.get(
          ENDPOINTS.organizerSettlementReport({
            days: 7,
            concertId: this.selectedConcertId,
            scheduleId: this.selectedScheduleId
          })
        )
      } finally {
        this.loading = false
      }
    },

    goToDetail(status) {
      const query = {}
      if (this.selectedConcertId != null) query.concertId = String(this.selectedConcertId)
      if (this.selectedScheduleId != null) query.scheduleId = String(this.selectedScheduleId)
      if (status) query.status = status
      this.$router.push({ path: '/organizer/reports/details', query })
    },

    formatWon(value) {
      return `${Number(value || 0).toLocaleString()}원`
    },

    // 차트 라벨용 축약 금액 표기
    formatCompactWon(value) {
      const amount = Number(value || 0)

      if (amount >= 100000000) {
        return `${(amount / 100000000).toFixed(amount % 100000000 === 0 ? 0 : 1)}억`
      }

      if (amount >= 10000) {
        return `${Math.round(amount / 10000)}만`
      }

      return amount.toLocaleString()
    },

    formatCount(value) {
      return `${Number(value || 0).toLocaleString()}건`
    },

    formatPercent(value) {
      return `${Number(value || 0).toFixed(1)}%`
    },

    formatDate(value) {
      if (!value) return '-'
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return value

      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      return `${mm}.${dd}`
    },

    formatScheduleLabel(value) {
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

    statusClass(status) {
      return {
        'bg-green-100 text-green-700': status === '지급 완료',
        'bg-blue-100 text-blue-700': status === '정산 완료',
        'bg-amber-100 text-amber-700': status === '집계 중'
      }
    }
  }
}
</script>
