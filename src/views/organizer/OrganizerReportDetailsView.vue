<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="mgmt-page-title">매출/환불 상세 조회</div>
          <div class="mt-1 text-sm text-slate-500">공연, 회차, 상태, 검색어로 정산 관련 주문을 조회합니다.</div>
        </div>
        <UiButton variant="ghost" class="h-10 px-4" @click="$router.push('/organizer/reports')">리포트로 돌아가기</UiButton>
      </div>

      <div class="mt-4 grid gap-3 lg:grid-cols-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">공연 선택</label>
          <select v-model="selectedConcertId" class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" @change="onConcertChange">
            <option v-for="item in concertOptions" :key="item.concertId ?? 'all'" :value="item.concertId">
              {{ item.concertTitle }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">회차 선택</label>
          <select v-model="selectedScheduleId" class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" @change="onScheduleChange">
            <option v-for="item in scheduleOptions" :key="item.scheduleId ?? 'all-schedules'" :value="item.scheduleId">
              {{ item.scheduleLabel }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">상태</label>
          <select v-model="selectedStatus" class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm">
            <option v-for="item in statusOptions" :key="item.value || 'all-status'" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">검색어</label>
          <input
            v-model.trim="keyword"
            type="text"
            class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
            placeholder="공연명 또는 주문 ID"
            @keyup.enter="submitSearch"
          />
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <UiButton class="h-11 px-5" @click="submitSearch">검색</UiButton>
        <UiButton variant="ghost" class="h-11 px-5" @click="resetFilters">초기화</UiButton>
      </div>
    </UiCard>

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중...</div>
    </UiCard>

    <UiCard v-else-if="errorMessage">
      <div class="text-sm text-red-600">{{ errorMessage }}</div>
    </UiCard>

    <UiCard v-else>
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="mgmt-section-title">조회 결과</div>
          <div class="mt-1 text-sm text-slate-500">총 {{ totalElements.toLocaleString() }}건</div>
        </div>
      </div>

      <!--
        성능 고려:
        - rows는 페이지 단위 20건만 렌더링
        - 좌석맵 모달은 버튼 클릭 시에만 데이터를 로드
      -->
      <UiTable class="mt-4" :columns="computedColumns" :rows="items">
        <template #cell:id="{ row }">
          <span class="font-medium text-slate-900">{{ row.id }}</span>
        </template>

        <template #cell:memberId="{ row }">
          <span class="text-slate-700">{{ row.memberId ?? '-' }}</span>
        </template>

        <template #cell:memberName="{ row }">
          <span class="font-medium text-slate-900">{{ row.memberName ?? '-' }}</span>
        </template>

        <template #cell:concertName="{ row }">
          <span class="font-medium text-slate-900">{{ row.concertName }}</span>
        </template>

        <template #cell:scheduleDate="{ row }">
          {{ formatDateTime(row.scheduleDate) }}
        </template>

        <template #cell:amount="{ row }">
          {{ formatWon(row.amount) }}
        </template>

        <template #cell:status="{ row }">
          <UiBadge :tone="statusTone(row.status)" :color="statusColor(row.status)">{{ row.status }}</UiBadge>
        </template>

        <template #cell:createdAt="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>

        <template #cell:processedAt="{ row }">
          {{ formatDateTime(row.processedAt) }}
        </template>

        <template #cell:seatMap="{ row }">
          <UiButton variant="ghost" class="h-8 px-3 text-xs" @click="openSeatMapModal(row)">
            좌석맵 보기
          </UiButton>
        </template>
      </UiTable>

      <div v-if="!items.length" class="mt-6 text-center text-sm text-slate-400">조회 결과가 없습니다.</div>

      <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-2">
        <UiButton variant="ghost" class="h-9 px-3" :disabled="page <= 0" @click="goPage(page - 1)">이전</UiButton>
        <span class="text-sm text-slate-600">{{ page + 1 }} / {{ totalPages }}</span>
        <UiButton variant="ghost" class="h-9 px-3" :disabled="page >= totalPages - 1" @click="goPage(page + 1)">다음</UiButton>
      </div>
    </UiCard>

    <!-- 읽기 전용 좌석맵 모달 -->
    <div
      v-if="seatMapModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3"
      @click.self="closeSeatMapModal"
    >
      <div class="flex h-[94vh] w-full max-w-[1480px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <div class="mgmt-section-title">주문 좌석맵 보기</div>
            <div class="mt-1 text-sm text-slate-500">
              주문 ID {{ selectedSeatMapRow?.id }} · {{ selectedSeatMapRow?.concertName }} · {{ formatDateTime(selectedSeatMapRow?.scheduleDate) }}
            </div>
          </div>
          <UiButton variant="ghost" class="h-10 px-4" @click="closeSeatMapModal">닫기</UiButton>
        </div>

        <div class="min-h-0 flex-1 overflow-hidden bg-slate-50 px-4 py-3">
          <div v-if="seatMapModalLoading" class="flex h-full items-center justify-center text-sm text-slate-500">
            좌석맵을 불러오는 중입니다.
          </div>

          <div v-else-if="seatMapModalError" class="flex h-full items-center justify-center text-sm text-red-600">
            {{ seatMapModalError }}
          </div>

          <div v-else-if="seatMapInsight" class="grid h-full gap-3">
            <div class="grid gap-3 xl:grid-cols-[1fr_auto]">
              <div class="grid gap-3 sm:grid-cols-4">
                <div class="rounded-xl border border-slate-200 bg-white p-3">
                  <div class="text-[11px] text-slate-500">총 좌석</div>
                  <div class="mt-1 text-2xl font-bold text-slate-900">{{ seatMapInsight.totalSeatCount }}석</div>
                </div>

                <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <div class="text-[11px] text-emerald-700">예매 완료</div>
                  <div class="mt-1 text-2xl font-bold text-emerald-700">{{ seatMapInsight.soldSeatCount }}석</div>
                </div>

                <div class="rounded-xl border border-rose-200 bg-rose-50 p-3">
                  <div class="text-[11px] text-rose-700">취소 좌석</div>
                  <div class="mt-1 text-2xl font-bold text-rose-700">{{ seatMapInsight.canceledSeatCount }}석</div>
                </div>

                <div class="rounded-xl border border-slate-200 bg-white p-3">
                  <div class="text-[11px] text-slate-500">점유율</div>
                  <div class="mt-1 text-2xl font-bold text-slate-900">{{ formatPercent(seatMapInsight.occupancyRate) }}</div>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
                <div class="flex items-center gap-2"><span class="h-3 w-3 rounded bg-emerald-500"></span><span>예매 완료</span></div>
                <div class="flex items-center gap-2"><span class="h-3 w-3 rounded bg-rose-500"></span><span>취소</span></div>
                <div class="flex items-center gap-2"><span class="h-3 w-3 rounded bg-slate-300"></span><span>예매 가능</span></div>
                <div class="flex items-center gap-2"><span class="h-3 w-3 rounded border-2 border-blue-600 bg-blue-200"></span><span>선택 주문 좌석</span></div>
              </div>
            </div>

            <!--
              성능 고려:
              - 좌석맵은 DOM 수가 많을 수 있으므로 transform만 변경한다.
              - 확대/축소/이동은 좌표 재계산 없이 scale + translate로 처리한다.
              - 드래그 중 mousemove 이벤트는 requestAnimationFrame으로 합친다.
            -->
            <div
              ref="seatMapViewport"
              class="min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white"
              :class="isPanning ? 'cursor-grabbing' : 'cursor-grab'"
              @wheel.prevent="onSeatMapWheel"
              @mousedown.left="startSeatMapPan"
              @mousemove="onSeatMapPan"
              @mouseup="endSeatMapPan"
              @mouseleave="endSeatMapPan"
            >
              <div class="relative flex h-full items-center justify-center p-3">
                <div class="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm">
                  <button
                    type="button"
                    class="rounded px-2 py-1 text-sm text-slate-600 transition-colors hover:bg-slate-100"
                    @click="zoomOut"
                  >
                    -
                  </button>
                  <span class="min-w-[52px] text-center text-xs font-semibold text-slate-600">
                    {{ Math.round(displayScale * 100) }}%
                  </span>
                  <button
                    type="button"
                    class="rounded px-2 py-1 text-sm text-slate-600 transition-colors hover:bg-slate-100"
                    @click="zoomIn"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    class="rounded px-2 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-100"
                    @click="resetSeatMapView"
                  >
                    맞춤
                  </button>
                </div>

                <div :style="scaledCanvasWrapperStyle">
                  <div class="relative origin-top-left" :style="scaledCanvasInnerStyle">
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
                        class="absolute rounded-sm"
                        :class="seat.className"
                        :style="seat.style"
                        :title="seat.title"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex h-full items-center justify-center text-sm text-slate-400">
            표시할 좌석맵 데이터가 없습니다.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiTable from '../../components/common/UiTable.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'OrganizerReportDetailsView',
  components: { UiCard, UiTable, UiBadge, UiButton },
  data() {
    return {
      api: null,
      loading: false,
      errorMessage: '',
      options: [],
      selectedConcertId: null,
      selectedScheduleId: null,
      selectedStatus: null,
      keyword: '',
      items: [],
      page: 0,
      totalPages: 1,
      totalElements: 0,
      baseColumns: [
        { key: 'id', label: '주문 ID' },
        { key: 'memberId', label: '구매자 ID' },
        { key: 'memberName', label: '구매자 이름' },
        { key: 'concertName', label: '공연명' },
        { key: 'scheduleDate', label: '회차' },
        { key: 'amount', label: '금액' },
        { key: 'status', label: '상태' },
        { key: 'createdAt', label: '주문 시각' },
        { key: 'seatMap', label: '' }
      ],
      statusOptions: [
        { value: null, label: '전체 상태' },
        { value: 'PAID', label: '매출' },
        { value: 'REFUNDED', label: '환불' },
        { value: 'CANCELED', label: '취소' }
      ],

      // 좌석맵 모달 상태
      seatMapModalOpen: false,
      seatMapModalLoading: false,
      seatMapModalError: '',
      selectedSeatMapRow: null,
      seatMapInsight: null,

      // 좌석맵 viewport 크기
      seatMapViewportWidth: 0,
      seatMapViewportHeight: 0,
      viewportMeasureRaf: null,

      // 줌/이동 상태
      zoomScale: 1,
      panX: 0,
      panY: 0,
      isPanning: false,
      panStartX: 0,
      panStartY: 0,
      panOriginX: 0,
      panOriginY: 0,
      panFrame: null
    }
  },
  computed: {
    computedColumns() {
      const columns = [...this.baseColumns]

      /**
       * 테이블 구조가 상태 변경 때마다 흔들리지 않도록 항상 컬럼을 유지한다.
       * PAID 행은 processedAt 값이 없으므로 '-'로만 보인다.
       */
      const insertIndex = columns.findIndex(col => col.key === 'createdAt') + 1
      columns.splice(insertIndex, 0, { key: 'processedAt', label: '취소/환불 시각' })

      return columns
    },

    concertOptions() {
      const map = new Map()
      map.set('all', { concertId: null, concertTitle: '전체 공연 집계' })
      for (const item of this.options) {
        if (!map.has(item.concertId)) {
          map.set(item.concertId, { concertId: item.concertId, concertTitle: item.concertTitle })
        }
      }
      return Array.from(map.values())
    },

    scheduleOptions() {
      if (this.selectedConcertId == null) {
        return [{ scheduleId: null, scheduleLabel: '전체 회차 집계' }]
      }
      return [
        { scheduleId: null, scheduleLabel: '전체 회차 집계' },
        ...this.options
          .filter(item => item.concertId === this.selectedConcertId)
          .map(item => ({ scheduleId: item.scheduleId, scheduleLabel: this.formatScheduleLabel(item.scheduleLabel) }))
      ]
    },

    /**
     * 좌석을 구역 단위로 그룹화.
     *
     * 성능 고려:
     * - API 응답 seat 배열을 computed에서 한 번만 그룹화
     * - 템플릿에서는 가공 결과만 렌더링
     */
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

    /**
     * stageListJson 우선, 없으면 단일 stage 필드 사용.
     */
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

    /**
     * 실제 렌더 bounds 계산.
     * stage/section 전체를 감싸는 캔버스 크기를 동적으로 잡는다.
     */
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

    canvasPixelSize() {
      return {
        width: Math.max(720, this.layoutBounds.width + 160),
        height: Math.max(520, this.layoutBounds.height + 160)
      }
    },

    /**
     * 모달 viewport에 맞춰 좌석맵을 자동 축소한다.
     *
     * 성능 고려:
     * - resize 시점에만 viewport 크기를 갱신한다.
     * - 하한선을 둬서 지나치게 작아지지 않게 한다.
     */
    fitScale() {
      const baseWidth = this.canvasPixelSize.width
      const baseHeight = this.canvasPixelSize.height

      if (!this.seatMapViewportWidth || !this.seatMapViewportHeight) {
        return 1
      }

      const availableWidth = Math.max(320, this.seatMapViewportWidth - 24)
      const availableHeight = Math.max(240, this.seatMapViewportHeight - 24)

      const widthScale = availableWidth / baseWidth
      const heightScale = availableHeight / baseHeight

      return Math.max(0.72, Math.min(1, widthScale, heightScale))
    },

    /**
     * 실제 화면에 표시되는 최종 배율.
     * fitScale을 기본값으로 두고 사용자가 추가 zoomScale을 얹는다.
     */
    displayScale() {
      return this.fitScale * this.zoomScale
    },

    scaledCanvasWrapperStyle() {
      return {
        width: `${this.canvasPixelSize.width * this.displayScale}px`,
        height: `${this.canvasPixelSize.height * this.displayScale}px`
      }
    },

    /**
     * 실제 좌표계는 원본을 유지하고 transform만 적용한다.
     * pan은 translate, zoom은 scale로 합쳐서 한 번에 처리한다.
     */
    scaledCanvasInnerStyle() {
      return {
        width: `${this.canvasPixelSize.width}px`,
        height: `${this.canvasPixelSize.height}px`,
        transform: `translate(${this.panX}px, ${this.panY}px) scale(${this.displayScale})`,
        transformOrigin: 'top left',
        willChange: 'transform'
      }
    },

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
    await this.fetchOptions()
    this.applyQuery()
    await this.load()

    window.addEventListener('resize', this.scheduleViewportMeasure, { passive: true })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.scheduleViewportMeasure)

    if (this.viewportMeasureRaf != null) {
      cancelAnimationFrame(this.viewportMeasureRaf)
      this.viewportMeasureRaf = null
    }

    if (this.panFrame != null) {
      cancelAnimationFrame(this.panFrame)
      this.panFrame = null
    }
  },
  methods: {
    async fetchOptions() {
      this.options = await this.api.get(ENDPOINTS.organizerSeatInsightOptions())
    },

    applyQuery() {
      const query = this.$route.query || {}
      this.selectedConcertId = query.concertId ? Number(query.concertId) : null
      this.selectedScheduleId = query.scheduleId ? Number(query.scheduleId) : null
      this.selectedStatus = query.status || null
      this.keyword = query.keyword || ''
      this.page = query.page ? Number(query.page) : 0
    },

    buildQuery(page = this.page) {
      const query = {}
      if (this.selectedConcertId != null) query.concertId = String(this.selectedConcertId)
      if (this.selectedScheduleId != null) query.scheduleId = String(this.selectedScheduleId)
      if (this.selectedStatus) query.status = this.selectedStatus
      if (this.keyword) query.keyword = this.keyword
      if (page > 0) query.page = String(page)
      return query
    },

    /**
     * 좌석 색상 클래스 계산.
     * 템플릿에서 조건 분기를 반복하지 않도록 메서드로 분리한다.
     */
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

    /**
     * resize 이벤트가 연속으로 들어와도 requestAnimationFrame 1회로 합친다.
     */
    scheduleViewportMeasure() {
      if (this.viewportMeasureRaf != null) {
        cancelAnimationFrame(this.viewportMeasureRaf)
      }

      this.viewportMeasureRaf = requestAnimationFrame(() => {
        this.viewportMeasureRaf = null
        this.measureSeatMapViewport()
      })
    },

    measureSeatMapViewport() {
      if (!this.seatMapModalOpen) return
      const el = this.$refs.seatMapViewport
      if (!el) return

      this.seatMapViewportWidth = el.clientWidth
      this.seatMapViewportHeight = el.clientHeight
    },

    /**
     * 모달을 처음 열면 fitScale 기준 100% 상태로 맞춘다.
     * 사용자가 이후 확대/이동할 수 있게 zoom/pan만 리셋한다.
     */
    resetSeatMapView() {
      this.zoomScale = 1
      this.panX = 0
      this.panY = 0
      this.isPanning = false
    },

    zoomIn() {
      this.zoomScale = Math.min(3, +(this.zoomScale * 1.15).toFixed(3))
    },

    zoomOut() {
      this.zoomScale = Math.max(0.6, +(this.zoomScale / 1.15).toFixed(3))
    },

    /**
     * 휠 줌.
     * viewport 중앙이 아니라 마우스 위치 기준까지 맞추려면 계산이 더 커지므로
     * 이 화면은 단순 zoom만 적용해서 부하를 낮춘다.
     */
    onSeatMapWheel(event) {
      const next = event.deltaY < 0
        ? this.zoomScale * 1.08
        : this.zoomScale / 1.08

      this.zoomScale = Math.max(0.6, Math.min(3, +next.toFixed(3)))
    },

    startSeatMapPan(event) {
      this.isPanning = true
      this.panStartX = event.clientX
      this.panStartY = event.clientY
      this.panOriginX = this.panX
      this.panOriginY = this.panY
    },

    /**
     * 드래그 이동은 requestAnimationFrame으로 합쳐서
     * mousemove 연속 이벤트 부담을 줄인다.
     */
    onSeatMapPan(event) {
      if (!this.isPanning) return

      const nextX = this.panOriginX + (event.clientX - this.panStartX)
      const nextY = this.panOriginY + (event.clientY - this.panStartY)

      if (this.panFrame != null) {
        cancelAnimationFrame(this.panFrame)
      }

      this.panFrame = requestAnimationFrame(() => {
        this.panFrame = null
        this.panX = nextX
        this.panY = nextY
      })
    },

    endSeatMapPan() {
      this.isPanning = false
    },

    async onConcertChange() {
      this.selectedScheduleId = null
      this.page = 0
      await this.load()
    },

    async onScheduleChange() {
      this.page = 0
      await this.load()
    },

    async submitSearch() {
      this.page = 0
      await this.load()
    },

    async resetFilters() {
      this.selectedConcertId = null
      this.selectedScheduleId = null
      this.selectedStatus = null
      this.keyword = ''
      this.page = 0
      await this.load()
    },

    async goPage(page) {
      if (page < 0 || page >= this.totalPages) return
      this.page = page
      await this.load()
    },

    async load() {
      this.loading = true
      this.errorMessage = ''

      try {
        await this.$router.replace({ query: this.buildQuery() })
        const res = await this.api.get(ENDPOINTS.organizerReportDetails({
          concertId: this.selectedConcertId,
          scheduleId: this.selectedScheduleId,
          status: this.selectedStatus,
          keyword: this.keyword,
          page: this.page,
          size: 20
        }))
        this.items = res?.content ?? []
        this.totalPages = Math.max(1, res?.totalPages ?? 1)
        this.totalElements = Number(res?.totalElements ?? this.items.length)
      } catch (err) {
        this.items = []
        this.totalPages = 1
        this.totalElements = 0
        this.errorMessage = err.message || '상세 데이터를 불러오지 못했습니다.'
      } finally {
        this.loading = false
      }
    },

    /**
     * 좌석맵은 목록 진입 시 미리 전부 로드하지 않는다.
     * 버튼 클릭 시 1건만 lazy fetch 해서 모달에 넣는다.
     * 이렇게 해야 목록 응답 속도와 초기 렌더 비용을 유지할 수 있다.
     */
    async openSeatMapModal(row) {
      if (!row?.concertId || !row?.scheduleId || !row?.id) return

      this.selectedSeatMapRow = row
      this.seatMapModalOpen = true
      this.seatMapModalLoading = true
      this.seatMapModalError = ''
      this.seatMapInsight = null
      this.resetSeatMapView()

      try {
        const res = await this.api.get(ENDPOINTS.organizerSeatMapInsight({
          concertId: row.concertId,
          scheduleId: row.scheduleId,
          orderId: row.id
        }))
        this.seatMapInsight = res

        this.$nextTick(() => {
          this.scheduleViewportMeasure()
        })
      } catch (err) {
        this.seatMapModalError = err.message || '좌석맵 데이터를 불러오지 못했습니다.'
      } finally {
        this.seatMapModalLoading = false
      }
    },

    closeSeatMapModal() {
      this.seatMapModalOpen = false
      this.seatMapModalLoading = false
      this.seatMapModalError = ''
      this.selectedSeatMapRow = null
      this.seatMapInsight = null
      this.seatMapViewportWidth = 0
      this.seatMapViewportHeight = 0
      this.resetSeatMapView()

      if (this.panFrame != null) {
        cancelAnimationFrame(this.panFrame)
        this.panFrame = null
      }
    },

    formatWon(value) {
      return `${Number(value || 0).toLocaleString()}원`
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

    formatScheduleLabel(value) {
      return this.formatDateTime(value)
    },

    formatPercent(value) {
      return `${Number(value || 0).toFixed(1)}%`
    },

    statusTone(status) {
      return status === 'PAID' ? 'solid' : 'soft'
    },

    statusColor(status) {
      if (status === 'PAID') return 'green'
      if (status === 'REFUNDED' || status === 'CANCELED') return 'red'
      return 'slate'
    }
  }
}
</script>
