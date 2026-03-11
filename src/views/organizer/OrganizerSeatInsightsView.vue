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

    <template v-else>
      <div class="grid gap-4 lg:grid-cols-3">
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

      <div v-if="seatMapInsight" class="rounded-xl border border-slate-200 bg-white p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-slate-900">좌석맵 인사이트</h2>
            <p class="mt-1 text-sm text-slate-500">
              회차별 좌석 상태와 선택 주문 좌석을 좌석맵으로 확인합니다.
            </p>
          </div>

          <div
            v-if="seatMapInsight.highlightOrderId"
            class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            주문 #{{ seatMapInsight.highlightOrderId }} 강조
          </div>
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-4">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div class="text-xs text-slate-500">총 좌석</div>
            <div class="mt-1 text-2xl font-bold text-slate-900">{{ seatMapInsight.totalSeatCount }}석</div>
          </div>

          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div class="text-xs text-emerald-700">예매 완료</div>
            <div class="mt-1 text-2xl font-bold text-emerald-700">{{ seatMapInsight.soldSeatCount }}석</div>
          </div>

          <div class="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <div class="text-xs text-rose-700">취소 좌석</div>
            <div class="mt-1 text-2xl font-bold text-rose-700">{{ seatMapInsight.canceledSeatCount }}석</div>
          </div>

          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div class="text-xs text-slate-500">점유율</div>
            <div class="mt-1 text-2xl font-bold text-slate-900">{{ formatPercent(seatMapInsight.occupancyRate) }}</div>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-4 text-sm text-slate-600">
          <div class="flex items-center gap-2">
            <span class="h-3 w-3 rounded bg-emerald-500"></span>
            <span>예매 완료</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-3 w-3 rounded bg-rose-500"></span>
            <span>취소</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-3 w-3 rounded bg-slate-300"></span>
            <span>예매 가능</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-3 w-3 rounded border-2 border-blue-600 bg-blue-200"></span>
            <span>선택 주문 좌석(좌석맵 보기 전용)</span>
          </div>
        </div>

        <div class="mt-5 overflow-auto rounded-2xl border border-slate-200 bg-slate-50">
          <!-- 성능을 위해 style 계산은 computed에서 미리 끝내고, 여기서는 결과만 렌더 -->
          <div class="flex min-h-[760px] min-w-[1400px] items-center justify-center p-10">
            <div class="relative" :style="layoutCanvasStyle">
              <div
                v-for="stage in preparedStages"
                :key="stage.key"
                class="absolute flex items-center justify-center rounded-lg border-2 border-slate-400 bg-slate-200/80 text-sm font-semibold text-slate-700"
                :style="stage.style"
              >
                {{ stage.name || 'STAGE' }}
              </div>

              <div
                v-for="section in preparedSections"
                :key="section.key"
                class="absolute"
                :style="section.style"
              >
                <div
                  class="pointer-events-none absolute rounded bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-sm"
                  :style="section.labelStyle"
                >
                  {{ section.name }}
                </div>

                <div
                  v-for="seat in section.seats"
                  :key="seat.seatId"
                  class="absolute rounded-sm transition"
                  :class="seat.className"
                  :style="seat.style"
                  :title="seat.title"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
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
      highlightedOrderId: null,
      seatMapInsight: null,
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
    },

    // 좌석을 구역 단위로 그룹핑
    seatSections() {
      const seats = this.seatMapInsight?.seats ?? []
      const map = new Map()

      for (const seat of seats) {
        const key = `${seat.sectionName}-${seat.sectionX}-${seat.sectionY}-${seat.sectionRotation}`

        if (!map.has(key)) {
          map.set(key, {
            key,
            name: seat.sectionName,
            x: seat.sectionX ?? 0,
            y: seat.sectionY ?? 0,
            rotation: seat.sectionRotation ?? 0,
            seats: []
          })
        }

        map.get(key).seats.push(seat)
      }

      return Array.from(map.values()).map(section => ({
        ...section,
        seats: [...section.seats].sort((a, b) => {
          if ((a.rowNo ?? 0) !== (b.rowNo ?? 0)) return (a.rowNo ?? 0) - (b.rowNo ?? 0)
          return (a.seatNo ?? 0) - (b.seatNo ?? 0)
        })
      }))
    },

    // 다중 stage 우선, 없으면 단일 stage 사용
    stageList() {
      if (!this.seatMapInsight) return []

      const json = this.seatMapInsight.stageListJson
      if (json) {
        try {
          const parsed = JSON.parse(json)
          if (Array.isArray(parsed)) {
            return parsed.map((item, index) => ({
              key: `stage-${index}`,
              x: item.x ?? 0,
              y: item.y ?? 0,
              width: item.width ?? 300,
              height: item.height ?? 100,
              rotation: item.rotation ?? 0,
              name: item.name ?? 'STAGE'
            }))
          }
        } catch (e) {
          console.warn('stageListJson 파싱 실패:', e)
        }
      }

      if (this.seatMapInsight.stageWidth != null) {
        return [
          {
            key: 'stage-single',
            x: this.seatMapInsight.stageX ?? 0,
            y: this.seatMapInsight.stageY ?? 0,
            width: this.seatMapInsight.stageWidth ?? 300,
            height: this.seatMapInsight.stageHeight ?? 100,
            rotation: this.seatMapInsight.stageRotation ?? 0,
            name: 'STAGE'
          }
        ]
      }

      return []
    },

    // 실제 렌더링 콘텐츠의 전체 크기 계산
    layoutBounds() {
      const points = []

      for (const stage of this.stageList) {
        points.push({
          x: stage.x,
          y: stage.y,
          width: stage.width,
          height: stage.height
        })
      }

      for (const section of this.seatSections) {
        const seats = section.seats ?? []
        const seatWidth = seats.length ? Math.max(...seats.map(seat => (seat.x ?? 0) + 18)) : 120
        const seatHeight = seats.length ? Math.max(...seats.map(seat => (seat.y ?? 0) + 18)) : 40

        points.push({
          x: section.x,
          y: section.y,
          width: seatWidth,
          // 구역 이름 높이까지 포함
          height: seatHeight + 28
        })
      }

      if (!points.length) {
        return { minX: 0, minY: 0, width: 600, height: 420 }
      }

      const minX = Math.min(...points.map(item => item.x))
      const minY = Math.min(...points.map(item => item.y))
      const maxX = Math.max(...points.map(item => item.x + item.width))
      const maxY = Math.max(...points.map(item => item.y + item.height))

      return {
        minX,
        minY,
        width: maxX - minX,
        height: maxY - minY
      }
    },

    // 내부 캔버스 크기를 콘텐츠 기준으로 동적으로 계산
    layoutCanvasStyle() {
      return {
        width: `${Math.max(720, this.layoutBounds.width + 160)}px`,
        height: `${Math.max(520, this.layoutBounds.height + 160)}px`
      }
    },

    // stage는 min 좌표를 기준으로 정규화
    preparedStages() {
      return this.stageList.map(stage => ({
        ...stage,
        style: {
          left: `${stage.x - this.layoutBounds.minX + 80}px`,
          top: `${stage.y - this.layoutBounds.minY + 80}px`,
          width: `${stage.width}px`,
          height: `${stage.height}px`,
          transform: `rotate(${stage.rotation || 0}deg)`,
          transformOrigin: 'center center'
        }
      }))
    },

    // section, label, seat style을 한 번에 미리 계산
    preparedSections() {
      return this.seatSections.map(section => {
        const sectionSeats = section.seats ?? []
        const maxSeatX = sectionSeats.length
          ? Math.max(...sectionSeats.map(seat => (seat.x ?? 0) + 18))
          : 120

        return {
          ...section,
          style: {
            left: `${section.x - this.layoutBounds.minX + 80}px`,
            top: `${section.y - this.layoutBounds.minY + 80}px`,
            transform: `rotate(${section.rotation || 0}deg)`,
            transformOrigin: 'top left'
          },
          labelStyle: {
            left: `${Math.max(0, (maxSeatX / 2) - 28)}px`,
            top: '-28px',
            // 글자는 기울어지지 않도록 섹션 회전을 반대로 적용
            transform: `rotate(${-(section.rotation || 0)}deg)`,
            transformOrigin: 'center center',
            whiteSpace: 'nowrap'
          },
          seats: sectionSeats.map(seat => ({
            ...seat,
            style: {
              left: `${seat.x}px`,
              top: `${seat.y}px`,
              width: '18px',
              height: '18px'
            },
            className: this.seatClass(seat),
            title: `${seat.seatDefName} (${seat.status})`
          }))
        }
      })
    }
  },
  created() {
    this.api = useApi()
  },
  async mounted() {
    const query = this.$route.query || {}

    const concertId = query.concertId
    const scheduleId = query.scheduleId
    const orderId = query.orderId

    this.selectedConcertId =
      concertId != null && concertId !== '' && concertId !== 'null' && concertId !== 'undefined'
        ? Number(concertId)
        : null

    this.selectedScheduleId =
      scheduleId != null && scheduleId !== '' && scheduleId !== 'null' && scheduleId !== 'undefined'
        ? Number(scheduleId)
        : null

    this.highlightedOrderId =
      orderId != null && orderId !== '' && orderId !== 'null' && orderId !== 'undefined'
        ? Number(orderId)
        : null

    await this.fetchOptions()
    await this.fetchSeatInsights()

    if (this.selectedScheduleId != null) {
      await this.fetchSeatMapInsights()
    }
  },
  methods: {
    async fetchOptions() {
      this.options = await this.api.get(ENDPOINTS.organizerSeatInsightOptions())
    },

    async onConcertChange() {
      this.selectedScheduleId = null
      this.highlightedOrderId = null
      this.seatMapInsight = null

      await this.$router.replace({
        query: this.selectedConcertId != null
          ? { concertId: String(this.selectedConcertId) }
          : {}
      })

      await this.fetchSeatInsights()
    },

    async onScheduleChange() {
      this.highlightedOrderId = null

      await this.$router.replace({
        query: {
          ...(this.selectedConcertId != null ? { concertId: String(this.selectedConcertId) } : {}),
          ...(this.selectedScheduleId != null ? { scheduleId: String(this.selectedScheduleId) } : {})
        }
      })

      await this.fetchSeatInsights()
      await this.fetchSeatMapInsights()
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

    async fetchSeatMapInsights() {
      if (this.selectedScheduleId == null) {
        this.seatMapInsight = null
        return
      }

      this.seatMapInsight = await this.api.get(
        ENDPOINTS.organizerSeatMapInsights({
          concertId: this.selectedConcertId,
          scheduleId: this.selectedScheduleId,
          orderId: this.highlightedOrderId
        })
      )
    },

    // 좌석 색상만 메서드로 유지
    seatClass(seat) {
      if (seat.highlighted) {
        return 'border-2 border-blue-600 bg-blue-200 shadow-sm'
      }
      if (seat.status === 'SOLD') {
        return 'bg-emerald-500'
      }
      if (seat.status === 'CANCELED') {
        return 'bg-rose-500'
      }
      return 'bg-slate-300'
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