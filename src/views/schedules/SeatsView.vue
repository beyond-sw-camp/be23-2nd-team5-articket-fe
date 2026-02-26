<template>
  <div class="grid gap-4">
    <!-- 헤더 -->
    <div class="flex items-center justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">좌석 선택</div>
        <div class="mt-1 text-sm text-slate-500">배치도를 클릭해 좌석을 선택하세요 · 스크롤로 확대/축소</div>
      </div>
      <UiButton variant="ghost" class="h-11 px-4" @click="load">새로고침</UiButton>
    </div>

    <!-- 등급 범례 -->
    <div v-if="gradeLabels.length > 0" class="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div v-for="g in gradeLabels" :key="g.id" class="flex items-center gap-1.5">
        <span class="h-4 w-4 rounded" :style="{ backgroundColor: g.color }"></span>
        <span class="text-xs text-slate-600">{{ g.label }}</span>
      </div>
      <div class="h-4 w-px bg-slate-200 mx-1 self-center"></div>
      <div class="flex items-center gap-1.5">
        <span class="h-4 w-4 rounded border-2 border-white" style="background:#ef4444"></span>
        <span class="text-xs text-slate-600">선택됨</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="h-4 w-4 rounded" style="background:#f59e0b"></span>
        <span class="text-xs text-slate-600">선점 중</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="h-4 w-4 rounded opacity-50" style="background:#64748b"></span>
        <span class="text-xs text-slate-600">판매 완료</span>
      </div>
    </div>

    <!-- 캔버스 -->
    <div class="overflow-hidden rounded-xl" style="border: 1px solid #1e293b;">
      <div v-if="loading" class="flex items-center justify-center bg-slate-950" style="height:520px">
        <span class="text-sm text-slate-400">배치도 불러오는 중…</span>
      </div>
      <div v-else-if="loadError" class="flex items-center justify-center bg-slate-950" style="height:260px">
        <span class="text-sm text-red-400">{{ loadError }}</span>
      </div>
      <div v-else-if="seats.length === 0" class="flex items-center justify-center bg-slate-950" style="height:260px">
        <span class="text-sm text-slate-400">등록된 좌석이 없습니다.</span>
      </div>
      <div
        v-show="!loading && !loadError && seats.length > 0"
        ref="konvaContainer"
        class="w-full"
        style="height: 520px; background: #0f172a; cursor: grab;"
      ></div>
    </div>

    <!-- 하단 선택 요약 -->
    <UiCard>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <UiBadge tone="soft">선택: {{ selected.length }}석</UiBadge>
          <span v-if="selectedTotalPrice > 0" class="text-sm text-slate-600">
            합계: ₩{{ selectedTotalPrice.toLocaleString() }}
          </span>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div v-if="holdError" class="text-sm font-semibold text-red-700">{{ holdError }}</div>
          <UiButton
            class="h-12 px-6"
            :disabled="holdLoading || selected.length === 0"
            @click="hold"
          >
            좌석 선점 (5분)
          </UiButton>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script>
import Konva from 'konva'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { useSeatHoldMock } from '../../composables/useSeatHoldMock'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'

// 에디터와 동일한 좌석 크기 상수
const SEAT_W = 20, SEAT_H = 20, SEAT_GAP = 4

// 에디터와 동일한 등급 색상
const GRADE_COLORS = {
  VIP: '#f5c842',
  R:   '#ef6b6b',
  S:   '#4ec5ef',
  A:   '#52d98a',
  B:   '#b06ef5',
  C:   '#94a3b8',
}
function gradeColor(grade) {
  return GRADE_COLORS[grade] || '#ef6b6b'
}

export default {
  name: 'SeatsView',
  components: { UiCard, UiButton, UiBadge },

  data() {
    return {
      loading: false,
      loadError: null,
      seats: [],          // flat List<SeatResDto> from backend
      selected: [],       // 선택된 seatId 배열
      holdLoading: false,
      holdError: null,
      api: null,
      enabled: false,
      seatHoldMock: null,
      konvaStageInstance: null,
      mainLayerInstance: null,
    }
  },

  computed: {
    selectedSet() {
      return new Set(this.selected)
    },
    selectedTotalPrice() {
      return this.selected.reduce((sum, id) => {
        const s = this.seats.find(s => s.seatId === id)
        return sum + (s?.price ?? 0)
      }, 0)
    },
    // 구역별로 좌석 그룹핑 (sectionX/Y/rotation 포함)
    sections() {
      const map = {}
      for (const seat of this.seats) {
        const id = seat.sectionId
        if (!map[id]) {
          map[id] = {
            sectionId: id,
            name: seat.sectionName,
            color: seat.sectionColor,
            x: seat.sectionX ?? 0,
            y: seat.sectionY ?? 0,
            rotation: seat.sectionRotation ?? 0,
            seats: []
          }
        }
        if (seat.isVisible !== false) map[id].seats.push(seat)
      }
      return Object.values(map)
    },
    // 첫 번째 좌석에서 스테이지 정보 추출 (모든 좌석에 동일하게 포함됨)
    stageInfo() {
      const s = this.seats[0]
      if (!s || s.stageWidth == null) return null
      return {
        x: s.stageX ?? 0,
        y: s.stageY ?? 0,
        width: s.stageWidth,
        height: s.stageHeight ?? 100,
        rotation: s.stageRotation ?? 0,
      }
    },
    // 범례용 등급 목록 (좌석에 실제 존재하는 등급만)
    gradeLabels() {
      const seen = new Set()
      const result = []
      for (const seat of this.seats) {
        if (seat.grade && !seen.has(seat.grade)) {
          seen.add(seat.grade)
          result.push({
            id: seat.grade,
            label: seat.grade === 'VIP' ? 'VIP' : seat.grade + '석',
            color: gradeColor(seat.grade)
          })
        }
      }
      return result
    }
  },

  created() {
    this.api = useApi()
    this.seatHoldMock = useSeatHoldMock()
  },

  mounted() {
    this.load()
  },

  beforeUnmount() {
    if (this.konvaStageInstance) {
      this.konvaStageInstance.destroy()
      this.konvaStageInstance = null
    }
  },

  methods: {
    async load() {
      const scheduleId = this.$route.params.scheduleId
      if (!scheduleId) return
      this.loading = true
      this.loadError = null
      this.seats = []
      this.selected = []
      if (this.konvaStageInstance) {
        this.konvaStageInstance.destroy()
        this.konvaStageInstance = null
      }
      try {
        const res = await this.api.get(ENDPOINTS.seats(scheduleId))
        this.seats = Array.isArray(res) ? res : res?.content ?? res?.items ?? []
        if (this.seats.length > 0) {
          this.$nextTick(() => this.initKonva())
        }
      } catch (err) {
        this.loadError = err.message || '좌석 배치도를 불러오지 못했습니다.'
        this.seats = []
        // 에러는 ErrorAlertModal에서 표시됨
      } finally {
        this.loading = false
      }
    },

    initKonva() {
      const container = this.$refs.konvaContainer
      if (!container) return
      if (this.konvaStageInstance) {
        this.konvaStageInstance.destroy()
      }

      const konvaStage = new Konva.Stage({
        container,
        width: container.offsetWidth,
        height: container.offsetHeight,
        draggable: true,
      })
      this.konvaStageInstance = konvaStage

      const mainLayer = new Konva.Layer()
      konvaStage.add(mainLayer)
      this.mainLayerInstance = mainLayer

      // 드래그 중 커서 변경
      konvaStage.on('dragstart', () => { container.style.cursor = 'grabbing' })
      konvaStage.on('dragend',   () => { container.style.cursor = 'grab' })

      // 마우스 휠 줌 (에디터와 동일한 로직)
      konvaStage.on('wheel', (e) => {
        e.evt.preventDefault()
        const oldScale = konvaStage.scaleX()
        const pointer = konvaStage.getPointerPosition()
        const mousePointTo = {
          x: (pointer.x - konvaStage.x()) / oldScale,
          y: (pointer.y - konvaStage.y()) / oldScale,
        }
        const factor = e.evt.deltaY < 0 ? 1.1 : 1 / 1.1
        const newScale = Math.min(Math.max(oldScale * factor, 0.2), 5)
        konvaStage.scale({ x: newScale, y: newScale })
        konvaStage.position({
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        })
      })

      this.renderAll()
      this.fitToView()
    },

    // 좌석의 상태/선택 여부에 따라 채우기 색 반환
    seatFillColor(seat) {
      if (this.selectedSet.has(seat.seatId)) return '#ef4444'
      switch (seat.status) {
        case 'AVAILABLE': return seat.sectionColor || gradeColor(seat.grade)
        case 'HOLD':      return '#f59e0b'
        case 'SOLD':      return '#64748b'
        default:          return '#334155'
      }
    },

    renderAll() {
      const layer = this.mainLayerInstance
      if (!layer) return
      layer.destroyChildren()

      // ── 무대 (STAGE) ──
      const si = this.stageInfo
      if (si) {
        const stageGrp = new Konva.Group({ x: si.x, y: si.y, rotation: si.rotation })
        stageGrp.add(new Konva.Rect({
          width: si.width, height: si.height,
          fill: '#1e293b', stroke: '#3b82f6', strokeWidth: 2, cornerRadius: 4
        }))
        stageGrp.add(new Konva.Text({
          text: 'STAGE', fontSize: 20, fontStyle: 'bold', fill: '#60a5fa',
          width: si.width, height: si.height, align: 'center', verticalAlign: 'middle'
        }))
        layer.add(stageGrp)
      }

      // ── 구역별 좌석 그리드 ──
      for (const section of this.sections) {
        if (section.seats.length === 0) continue

        const maxRow = Math.max(...section.seats.map(s => s.rowNo))
        const maxCol = Math.max(...section.seats.map(s => s.seatNo))
        const gridW = maxCol * (SEAT_W + SEAT_GAP) - SEAT_GAP

        const grp = new Konva.Group({
          x: section.x,
          y: section.y,
          rotation: section.rotation,
        })

        // 구역 이름 레이블 (에디터와 동일한 위치)
        grp.add(new Konva.Text({
          text: section.name,
          fontSize: 12, fill: '#cbd5e1',
          x: 0, y: -20,
          width: gridW, align: 'center'
        }))

        // 행 번호 레이블
        for (let r = 1; r <= maxRow; r++) {
          grp.add(new Konva.Text({
            text: String(r),
            fontSize: 9, fill: '#94a3b8',
            x: -18, y: (r - 1) * (SEAT_H + SEAT_GAP) + SEAT_H / 2 - 5,
            width: 14, align: 'right',
            listening: false,
          }))
        }

        // 좌석 렌더링
        for (const seat of section.seats) {
          const x = (seat.seatNo - 1) * (SEAT_W + SEAT_GAP)
          const y = (seat.rowNo - 1) * (SEAT_H + SEAT_GAP)
          const fill = this.seatFillColor(seat)
          const isSelected = this.selectedSet.has(seat.seatId)
          const isAvailable = seat.status === 'AVAILABLE'

          const rect = new Konva.Rect({
            x, y,
            width: SEAT_W, height: SEAT_H,
            fill,
            stroke: isSelected ? '#fff' : 'transparent',
            strokeWidth: 1.5,
            opacity: seat.status === 'SOLD' ? 0.4 : 1,
            cornerRadius: 2,
          })

          // 좌석 번호 텍스트
          const seatNumText = new Konva.Text({
            text: String(seat.seatNo),
            fontSize: 7, fill: 'rgba(255,255,255,0.85)',
            x, y: y + SEAT_H / 2 - 3.5,
            width: SEAT_W, align: 'center',
            listening: false,
          })

          if (isAvailable) {
            rect.on('mouseenter', () => {
              rect.opacity(0.7)
              layer.draw()
              document.body.style.cursor = 'pointer'
            })
            rect.on('mouseleave', () => {
              rect.opacity(1)
              layer.draw()
              document.body.style.cursor = 'default'
            })
            rect.on('click tap', (e) => {
              e.cancelBubble = true
              this.konvaStageInstance?.stopDrag()
              this.toggleSeat(seat)
            })
          }

          grp.add(rect)
          grp.add(seatNumText)
        }

        layer.add(grp)
      }

      layer.draw()
    },

    // 모든 콘텐츠가 보이도록 뷰 자동 맞춤
    fitToView() {
      const stage = this.konvaStageInstance
      if (!stage || this.sections.length === 0) return

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

      for (const section of this.sections) {
        if (section.seats.length === 0) continue
        const maxRow = Math.max(...section.seats.map(s => s.rowNo))
        const maxCol = Math.max(...section.seats.map(s => s.seatNo))
        const w = maxCol * (SEAT_W + SEAT_GAP)
        const h = maxRow * (SEAT_H + SEAT_GAP)
        minX = Math.min(minX, section.x - 25)
        minY = Math.min(minY, section.y - 25)
        maxX = Math.max(maxX, section.x + w + 10)
        maxY = Math.max(maxY, section.y + h + 10)
      }

      const si = this.stageInfo
      if (si) {
        minX = Math.min(minX, si.x)
        minY = Math.min(minY, si.y)
        maxX = Math.max(maxX, si.x + si.width)
        maxY = Math.max(maxY, si.y + si.height)
      }

      if (!isFinite(minX)) return

      const PAD = 40
      const contentW = Math.max(maxX - minX, 100)
      const contentH = Math.max(maxY - minY, 100)
      const scale = Math.min(
        (stage.width()  - PAD * 2) / contentW,
        (stage.height() - PAD * 2) / contentH,
        2  // 최대 200% 줌
      )
      stage.scale({ x: scale, y: scale })
      stage.position({
        x: -minX * scale + PAD,
        y: -minY * scale + PAD,
      })
    },

    toggleSeat(seat) {
      if (seat.status !== 'AVAILABLE') return
      const idx = this.selected.indexOf(seat.seatId)
      if (idx >= 0) {
        this.selected.splice(idx, 1)
      } else {
        this.selected.push(seat.seatId)
      }
      this.renderAll()
    },

    async hold() {
      if (this.selected.length === 0) return
      this.holdLoading = true
      try {
        const scheduleId = this.$route.params.scheduleId
        const res = await this.seatHoldMock.createHold({ scheduleId, seats: [...this.selected] })
        // 선점된 좌석 상태 로컬 업데이트
        for (const seatId of this.selected) {
          const seat = this.seats.find(s => s.seatId === seatId)
          if (seat) seat.status = 'HOLD'
        }
        this.selected = []
        this.$router.push(`/hold/${res.holdId}`)
      } catch (e) {
        // 에러는 ErrorAlertModal에서 표시됨
      } finally {
        this.holdLoading = false
      }
    }
  }
}
</script>
