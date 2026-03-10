<template>
  <div class="grid gap-4">
    <div class="rounded-xl border border-slate-200 bg-white p-5">
      <h1 class="text-lg font-semibold text-slate-900">좌석 인사이트</h1>
      <p class="mt-2 text-sm text-slate-600">
        전체 공연 합산, 공연별, 회차별 좌석 판매 현황을 확인합니다.
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

    <div v-else class="grid gap-4 lg:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-white p-5">
        <h2 class="text-base font-semibold text-slate-900">구역별 판매 동향</h2>
        <p class="mt-1 text-sm text-slate-500">어떤 구역이 가장 잘 팔리는지 비교합니다.</p>

        <div class="mt-6 space-y-4">
          <div
            v-for="item in sectionSales"
            :key="item.sectionName"
            class="grid grid-cols-[64px_1fr_56px] items-center gap-3"
          >
            <div class="text-sm font-medium text-slate-700">{{ item.sectionName }}</div>
            <div class="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                class="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500"
                :style="{ width: `${item.soldRate}%` }"
              ></div>
            </div>
            <div class="text-right text-sm font-semibold text-slate-700">
              {{ formatPercent(item.soldRate) }}
            </div>
          </div>

          <div v-if="sectionSales.length === 0" class="text-sm text-slate-400">
            표시할 구역 데이터가 없습니다.
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5">
        <h2 class="text-base font-semibold text-slate-900">등급별 판매율</h2>
        <p class="mt-1 text-sm text-slate-500">좌석 등급별 판매 비율입니다.</p>

        <div class="mt-6 grid justify-items-center gap-4">
          <div class="grid h-44 w-44 place-items-center rounded-full" :style="{ background: donutGradient }">
            <div class="grid h-24 w-24 place-items-center rounded-full bg-white text-3xl font-bold text-slate-900">
              {{ overallSoldRate }}%
            </div>
          </div>

          <div class="w-full space-y-2">
            <div
              v-for="item in gradeLegend"
              :key="item.grade"
              class="flex items-center gap-2 text-sm text-slate-700"
            >
              <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: item.color }"></span>
              <span>{{ item.grade }}</span>
              <strong class="ml-auto">{{ formatPercent(item.soldRate) }}</strong>
            </div>

            <div v-if="gradeLegend.length === 0" class="text-sm text-slate-400">
              표시할 등급 데이터가 없습니다.
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5">
        <h2 class="text-base font-semibold text-slate-900">잔여석 시각화</h2>
        <p class="mt-1 text-sm text-slate-500">전체 좌석 대비 예매 완료/잔여 좌석 현황입니다.</p>

        <div class="mt-8 flex items-start justify-between">
          <div>
            <div class="text-xs text-slate-500">예매 완료</div>
            <div class="mt-1 text-4xl font-bold text-slate-900">{{ soldSeats }}석</div>
          </div>

          <div class="text-right">
            <div class="text-xs text-slate-500">잔여 좌석</div>
            <div class="mt-1 text-4xl font-bold text-slate-900">{{ remainingSeats }}석</div>
          </div>
        </div>

        <div class="mt-6 h-4 overflow-hidden rounded-full bg-slate-200">
          <div
            class="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
            :style="{ width: `${soldRate}%` }"
          ></div>
        </div>

        <div class="mt-3 flex items-center justify-between text-sm text-slate-500">
          <span>총 {{ totalSeats }}석</span>
          <span>{{ formatPercent(soldRate) }} 판매</span>
        </div>
      </div>
    </div>
    <div class="grid gap-4 xl:grid-cols-2">
      <div class="rounded-xl border border-slate-200 bg-white p-5">
        <h2 class="text-base font-semibold text-slate-900">구역별 상세 현황</h2>
        <p class="mt-1 text-sm text-slate-500">구역별 판매/잔여 좌석을 숫자로 확인합니다.</p>

        <table class="mt-5 w-full border-collapse text-left">
          <thead>
            <tr class="border-b border-slate-200 text-sm text-slate-500">
              <th class="pb-3 font-medium">구역명</th>
              <th class="pb-3 font-medium">전체 좌석</th>
              <th class="pb-3 font-medium">판매 좌석</th>
              <th class="pb-3 font-medium">잔여 좌석</th>
              <th class="pb-3 font-medium">판매율</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sectionSales" :key="item.sectionName" class="border-b border-slate-100">
              <td class="py-4 text-sm text-slate-800">{{ item.sectionName }}</td>
              <td class="py-4 text-sm text-slate-800">{{ item.totalSeats }}</td>
              <td class="py-4 text-sm text-slate-800">{{ item.soldSeats }}</td>
              <td class="py-4 text-sm text-slate-800">{{ item.remainingSeats }}</td>
              <td class="py-4 text-sm text-slate-800">{{ formatPercent(item.soldRate) }}</td>
            </tr>

            <tr v-if="sectionSales.length === 0">
              <td colspan="5" class="py-8 text-center text-sm text-slate-400">
                표시할 구역 데이터가 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5">
        <h2 class="text-base font-semibold text-slate-900">등급별 상세 현황</h2>
        <p class="mt-1 text-sm text-slate-500">등급별 판매/잔여 좌석을 숫자로 확인합니다.</p>

        <table class="mt-5 w-full border-collapse text-left">
          <thead>
            <tr class="border-b border-slate-200 text-sm text-slate-500">
              <th class="pb-3 font-medium">등급</th>
              <th class="pb-3 font-medium">전체 좌석</th>
              <th class="pb-3 font-medium">판매 좌석</th>
              <th class="pb-3 font-medium">잔여 좌석</th>
              <th class="pb-3 font-medium">판매율</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in gradeSales" :key="item.grade" class="border-b border-slate-100">
              <td class="py-4 text-sm text-slate-800">{{ item.grade }}</td>
              <td class="py-4 text-sm text-slate-800">{{ item.totalSeats }}</td>
              <td class="py-4 text-sm text-slate-800">{{ item.soldSeats }}</td>
              <td class="py-4 text-sm text-slate-800">{{ item.remainingSeats }}</td>
              <td class="py-4 text-sm text-slate-800">{{ formatPercent(item.soldRate) }}</td>
            </tr>

            <tr v-if="gradeSales.length === 0">
              <td colspan="5" class="py-8 text-center text-sm text-slate-400">
                표시할 등급 데이터가 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'OrganizerSeatInsightsView',
  data() {
    return {
      api: null,
      loading: false,
      overview: null,
      options: [],
      selectedConcertId: null,
      selectedScheduleId: null,
      gradeColors: ['#e76f51', '#f4a261', '#2a9d8f', '#457b9d', '#7c3aed']
    }
  },
  computed: {
    concertOptions() {
      const map = new Map()
      map.set('all', {
        concertId: null,
        concertTitle: '전체 공연 합산'
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
            scheduleLabel: '전체 회차 합산'
          }
        ]
      }

      return [
        {
          scheduleId: null,
          scheduleLabel: '전체 회차 합산'
        },
        ...this.options
          .filter(item => item.concertId === this.selectedConcertId)
          .map(item => ({
            scheduleId: item.scheduleId,
            scheduleLabel: this.formatScheduleLabel(item.scheduleLabel)
          }))
      ]
    },

    sectionSales() {
      return this.overview?.sectionSales ?? []
    },

    gradeSales() {
      return this.overview?.gradeSales ?? []
    },

    totalSeats() {
      return this.overview?.totalSeats ?? 0
    },

    soldSeats() {
      return this.overview?.soldSeats ?? 0
    },

    remainingSeats() {
      return this.overview?.remainingSeats ?? 0
    },

    soldRate() {
      return Number(this.overview?.soldRate ?? 0).toFixed(1)
    },

    overallSoldRate() {
      return Math.round(Number(this.overview?.soldRate ?? 0))
    },

    gradeLegend() {
      return this.gradeSales.map((item, index) => ({
        ...item,
        color: this.gradeColors[index % this.gradeColors.length]
      }))
    },

    donutGradient() {
      if (!this.gradeLegend.length) {
        return 'conic-gradient(#e2e8f0 0% 100%)'
      }

      let cursor = 0
      const parts = this.gradeLegend.map((item) => {
        const start = cursor
        const end = cursor + Number(item.soldRate || 0)
        cursor = end
        return `${item.color} ${start}% ${end}%`
      })

      return `conic-gradient(${parts.join(', ')})`
    }
  },
  created() {
    this.api = useApi()
  },
  async mounted() {
    await this.fetchOptions()
    await this.fetchSeatInsights()
  },
  methods: {
    async fetchOptions() {
      this.options = await this.api.get(ENDPOINTS.organizerSeatInsightOptions())
      this.selectedConcertId = null
      this.selectedScheduleId = null
    },

    async onConcertChange() {
      this.selectedScheduleId = null
      await this.fetchSeatInsights()
    },

    async onScheduleChange() {
      await this.fetchSeatInsights()
    },

    async fetchSeatInsights() {
      this.loading = true
      try {
        this.overview = await this.api.get(
          ENDPOINTS.organizerSeatInsights({
            concertId: this.selectedConcertId,
            scheduleId: this.selectedScheduleId
          })
        )
      } finally {
        this.loading = false
      }
    },

    formatPercent(value) {
      return `${Number(value || 0).toFixed(1)}%`
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
    }
  }
}
</script>