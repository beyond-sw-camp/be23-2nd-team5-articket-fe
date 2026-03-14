<template>
  <div class="flex flex-col gap-3">

    <!-- 등급 범례 -->
    <div v-if="gradeLabels.length > 0"
         class="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
      <span class="text-xs font-semibold text-slate-400">등급</span>
      <div v-for="g in gradeLabels" :key="g.id" class="flex items-center gap-1.5">
        <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: g.color }"></span>
        <span class="text-xs text-slate-600">{{ g.label }}</span>
      </div>
      <div class="h-4 w-px bg-slate-200 mx-0.5 self-center"></div>
      <div class="flex items-center gap-1.5">
        <span class="h-3 w-3 rounded-full bg-blue-500" style="box-shadow:0 0 0 2px #bfdbfe"></span>
        <span class="text-xs text-slate-600">선택됨</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="h-3 w-3 rounded-full" style="background:#334155"></span>
        <span class="text-xs text-slate-600">선점 중</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="h-3 w-3 rounded-full" style="background:#cbd5e1; opacity:.5"></span>
        <span class="text-xs text-slate-600">판매 완료</span>
      </div>
        <!-- 추가: 선택한 공연/회차 -->
      <div class="ml-auto shrink-0 text-xs md:text-sm text-slate-600">
        <span class="font-semibold text-slate-800">{{ scheduleTitle }}</span>
        <span class="mx-2 text-slate-300">|</span>
        <span>{{ formattedScheduleDate }}</span>
      </div>
    </div>

    <!-- 메인: 캔버스 + 사이드바 -->
    <div class="flex gap-4" style="height: 680px;">

      <!-- ── 좌석 캔버스 ── -->
      <div class="relative flex-1 min-w-0 rounded-2xl overflow-hidden border border-slate-200"
           style="background: #f0f4f8;">
        <!-- 로딩 -->
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
          <span class="text-sm text-slate-400">배치도 불러오는 중…</span>
        </div>
        <!-- 에러 -->
        <div v-else-if="loadError" class="absolute inset-0 flex items-center justify-center">
          <span class="text-sm text-red-400">{{ loadError }}</span>
        </div>
        <!-- 빈 상태 -->
        <div v-else-if="!loading && seats.length === 0"
             class="absolute inset-0 flex items-center justify-center">
          <span class="text-sm text-slate-400">등록된 좌석이 없습니다.</span>
        </div>

        <!-- Konva 캔버스 -->
        <div
          v-show="!loading && !loadError && seats.length > 0"
          ref="konvaContainer"
          class="w-full h-full"
          style="cursor: grab;"
        ></div>

        <!-- 줌 버튼 -->
        <div class="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
          <button @click="zoomIn"
            class="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-600 text-xl font-light flex items-center justify-center hover:bg-slate-50 transition-colors">
            +
          </button>
          <button @click="zoomOut"
            class="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-600 text-xl font-light flex items-center justify-center hover:bg-slate-50 transition-colors">
            −
          </button>
          <button @click="fitToView"
            class="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-500 text-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
            title="전체 보기">
            ↺
          </button>
        </div>
      </div>

      <!-- ── 오른쪽 선택 패널 ── -->
      <div class="w-64 shrink-0 flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden">

        <!-- 패널 헤더 -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span class="text-sm font-semibold text-slate-900">
            선택 좌석&nbsp;<span class="text-blue-600">{{ selected.length }}</span>
          </span>
          <button
            v-if="selected.length > 0"
            class="text-xs text-slate-400 hover:text-red-500 transition-colors"
            @click="clearAll">
            전체삭제
          </button>
        </div>

        <!-- 선택된 좌석 목록 -->
        <div class="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
          <div
            v-for="seat in selectedSeats"
            :key="seat.seatId"
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="text-xs font-semibold" :style="{ color: gradeColorOf(seat.grade) }">
                {{ seat.grade }}석
              </div>
              <div class="mt-0.5 text-xs text-slate-600 leading-tight">
                {{ seat.sectionName }}<br>
                {{ seat.rowNo }}열 {{ seat.seatNo }}번
              </div>
              <div class="mt-1.5 text-sm font-bold text-slate-900">
                {{ (seat.price || 0).toLocaleString() }}원
              </div>
            </div>
            <button
              class="text-slate-300 hover:text-red-400 transition-colors mt-0.5 shrink-0"
              @click="toggleSeat(seat)">
              ✕
            </button>
          </div>

          <!-- 빈 상태 -->
          <div v-if="selected.length === 0"
               class="flex flex-col items-center justify-center h-48 text-slate-400 text-xs text-center leading-relaxed">
            <span class="text-2xl mb-2">🪑</span>
            좌석을 클릭해<br>선택하세요
          </div>
        </div>

        <!-- 선점 타이머 -->
        <div v-if="holdCountdown"
             class="px-4 py-2 flex items-center justify-between border-t border-orange-100 bg-orange-50">
          <span class="text-xs text-slate-500">선점 만료까지</span>
          <span
            class="text-sm font-bold tabular-nums transition-colors"
            :class="holdIsUrgent ? 'text-red-600 animate-pulse' : 'text-orange-500'">
            {{ holdCountdown }}
          </span>
        </div>

        <!-- 합계 + 버튼 영역 -->
        <div class="border-t border-slate-100 px-4 py-4 flex flex-col gap-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500">합계</span>
            <span class="font-bold text-slate-900">
              {{ selectedTotalPrice > 0 ? selectedTotalPrice.toLocaleString() + '원' : '—' }}
            </span>
          </div>

          <div class="text-xs text-slate-500">
            최대 {{ maxSeats }}개까지 선택할 수 있습니다.
          </div>

          <div v-if="holdError" class="text-xs text-red-500">{{ holdError }}</div>
          <button
            class="w-full h-12 rounded-xl text-sm font-semibold transition-colors"
            :class="selected.length > 0 && !holdLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
            :disabled="holdLoading || selected.length === 0"
            @click="hold">
            {{ holdLoading ? '처리 중…' : '선택 완료' }}
          </button>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
import Konva from 'konva'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useApi } from '../../composables/useApi'
import { parseErrorResponse } from '../../lib/api/parseError'
import { showErrorAlert } from '../../composables/useErrorToast'
import UiButton from '../../components/common/UiButton.vue'
import UiModal from '../../components/common/UiModal.vue'
import { ENDPOINTS } from '../../lib/api/endpoints'

// 에디터와 동일한 좌석 간격 (위치 호환성 유지)
const SEAT_W = 20, SEAT_H = 20, SEAT_GAP = 4
const SEAT_STEP = SEAT_W + SEAT_GAP   // 24px (센터 간 거리)
const SEAT_R   = 8                     // 원형 좌석 반지름

// 등급 색상 (에디터와 동일)
const GRADE_COLORS = {
  VIP: '#f5c842',
  R:   '#ef6b6b',
  S:   '#4ec5ef',
  A:   '#52d98a',
  B:   '#b06ef5',
  C:   '#94a3b8',
}
function gradeColor(grade) {
  return GRADE_COLORS[grade] || '#94a3b8'
}

// isVisible 해석 헬퍼
// - null / false / 0 / "false" 등 모든 falsy 변형 처리
// - 필드 자체가 없으면 기본값 true (표시)
function resolveVisible(seat) {
  for (const key of ['isVisible', 'is_visible', 'visible']) {
    if (key in seat) {
      const v = seat[key]
      // null, false, 0, "false", "0" → 미사용 좌석
      return v !== null && v !== false && v !== 0 && v !== 'false' && v !== '0'
    }
  }
  return true
}

export default {
  name: 'SeatsView',

  components: { UiButton, UiModal },

  data() {
    return {
      loading:      false,
      loadError:    null,
      seats:        [],
      selected:     [],
      holdLoading:  false,  // "선택 완료" 버튼 로딩
      holdError:    null,
      api:          null,
      konvaStageInstance: null,
      mainLayerInstance:  null,
      seatNodeMap:        new Map(),
      seatToggling:        false,  // 좌석 선점/해제 API 호출 중 (중복 클릭 방지)
      proceedingToCheckout: false, // 결제 페이지로 이동 중이면 true (이탈 시 해제 스킵)
      // 구매 제한 정책 기본값.
      // 정책 조회 실패 시에도 화면이 동작하도록 안전한 fallback 값으로 설정.
      maxSeats:     10,          // 1인 최대 선택 가능 좌석 수
      holdExpiresAt:    null,      // 선점 만료 시각 (ms timestamp)
      holdCountdown:    '',        // "04:32" 형식 카운트다운 표시
      holdTimerInterval: null,     // setInterval ID
      stompClient:      null,      // WebSocket STOMP 클라이언트
      stageListJson:    null,      // 여러 무대(stage) JSON
      seatMapData:      null,      // seatMap API 응답 전체 (stage 폴백용)
      scheduleTitle:    '',        // 추가: 공연명
      scheduleDate:     null,      // 추가: 회차 일시
    }
  },

  computed: {
    // 카운트다운이 1분 미만이면 긴급(빨간색)으로 표시
    holdIsUrgent() {
      return this.holdCountdown.startsWith('00:')
    },
    selectedSet() {
      return new Set(this.selected)
    },
    selectedSeats() {
      return this.selected
        .map(id => this.seats.find(s => s.seatId === id))
        .filter(Boolean)
    },
    selectedTotalPrice() {
      return this.selectedSeats.reduce((sum, s) => sum + (s?.price ?? 0), 0)
    },
    // 구역별 그룹 (sectionX/Y/rotation 포함)
    sections() {
      const map = {}
      for (const seat of this.seats) {
        const id = seat.sectionId
        if (!map[id]) {
          map[id] = {
            sectionId:    id,
            name:         seat.sectionName,
            x:            seat.sectionX,
            y:            seat.sectionY,
            rotation:     seat.sectionRotation,
            rowLabelType: seat.rowLabelType ?? 'left',
            seats:        []
          }
        }
        if (seat.isVisible !== false) map[id].seats.push(seat)
      }
      return Object.values(map)
    },
    // 여러 무대(stage) 목록 반환
    stageList() {
      // 1순위: stageListJson 파싱
      if (this.stageListJson) {
        try {
          const list = JSON.parse(this.stageListJson)
          if (Array.isArray(list) && list.length > 0) return list
        } catch (e) {
          // 파싱 실패 시 다음 폴백으로
        }
      }
      // 2순위: seatMap API 응답의 단일 stage 필드
      const sm = this.seatMapData
      if (sm && sm.stageWidth != null) {
        return [{ x: sm.stageX ?? 0, y: sm.stageY ?? 0, width: sm.stageWidth, height: sm.stageHeight ?? 100, rotation: sm.stageRotation ?? 0, name: 'STAGE' }]
      }
      // 3순위: 좌석 데이터의 단일 stage 필드 (기존 폴백)
      const s = this.seats[0]
      if (!s || s.stageWidth == null) return []
      return [{ x: s.stageX, y: s.stageY, width: s.stageWidth, height: s.stageHeight, rotation: s.stageRotation, name: 'STAGE' }]
    },
    // 범례용 등급 목록
    gradeLabels() {
      const seen = new Set()
      const result = []
      for (const seat of this.seats) {
        if (seat.grade && !seen.has(seat.grade)) {
          seen.add(seat.grade)
          result.push({
            id:    seat.grade,
            label: seat.grade === 'VIP' ? 'VIP' : seat.grade + '석',
            color: gradeColor(seat.grade)
          })
        }
      }
      return result
    },
    formattedScheduleDate() {
      if (!this.scheduleDate) return '-'
      const d = new Date(this.scheduleDate)
      if (Number.isNaN(d.getTime())) return this.scheduleDate
      const day = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const mi = String(d.getMinutes()).padStart(2, '0')
      return `${yyyy}.${mm}.${dd}(${day}) ${hh}:${mi}`
    }
  },

  created() {
    this.api = useApi()
  },

  mounted() {
    this.load()
    this.cleanupOldHolds()
    this.connectWebSocket()
    window.addEventListener('beforeunload', this.handleBeforeUnload)
  },

  // Vue Router가 같은 컴포넌트를 재사용할 때 scheduleId가 바뀌면 데이터 재로드
  watch: {
    '$route.params.scheduleId'(newId, oldId) {
      if (!newId || newId === oldId) return
      // 기존 선점/타이머/WebSocket 정리
      this.clearHoldTimer()
      this.selected = []
      this.holdError = null
      if (this.stompClient) {
        this.stompClient.deactivate()
        this.stompClient = null
      }
      this.load()
      this.connectWebSocket()
    }
  },

  beforeUnmount() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
    this.clearHoldTimer()
    // WebSocket 연결 해제
    if (this.stompClient) {
      this.stompClient.deactivate()
      this.stompClient = null
    }
    // 결제 페이지 이동이 아닌 이탈(뒤로 가기, 다른 메뉴)이면 선점된 모든 좌석 해제
    // keepalive: true → 페이지 이탈 시에도 요청 완료 보장 (axios는 unmount 시 취소됨)
    if (!this.proceedingToCheckout && this.selected.length > 0) {
      const toRelease = [...this.selected]
      const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:8082'
      const token = localStorage.getItem('accessToken')
      toRelease.forEach(seatId => {
        fetch(`${baseUrl}/seat-holds/${seatId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          keepalive: true,
        }).catch(() => {})
      })
    }
    if (this.konvaStageInstance) {
      this.konvaStageInstance.destroy()
      this.konvaStageInstance = null
    }
  },

  methods: {
    gradeColorOf(grade) {
      return gradeColor(grade)
    },
    applyScheduleMeta(meta) {
      this.scheduleTitle = meta?.concertTitle ?? meta?.concertName ?? meta?.title ?? ''
      this.scheduleDate = meta?.scheduleDate ?? meta?.playTime ?? meta?.startAt ?? null
    },
    async load() {
      const scheduleId = this.$route.params.scheduleId
      if (!scheduleId) return

      this.loading = true
      this.loadError = null
      this.seats = []
      this.selected = []
      this.holdError = null

      if (this.konvaStageInstance) {
        this.konvaStageInstance.destroy()
        this.konvaStageInstance = null
      }

      try {
        /**
         * 성능 고려:
         * 좌석, 좌석맵, 회차 정보는 동시에 가져온다.
         * 이 3개는 화면 초기 렌더링에 모두 필요하므로 병렬 조회가 가장 효율적이다.
         */
        const [seatsRes, seatMapRes, scheduleRes] = await Promise.allSettled([
          this.api.get(ENDPOINTS.seats(scheduleId), { skipErrorAlert: true }),
          this.api.get(ENDPOINTS.seatMap(scheduleId)),
          this.api.get(ENDPOINTS.schedule(scheduleId)),
        ])

        if (seatMapRes.status === 'fulfilled' && seatMapRes.value) {
          this.seatMapData = seatMapRes.value
          this.stageListJson = seatMapRes.value.stageListJson ?? null
        }

        let concertId = null
        if (scheduleRes.status === 'fulfilled' && scheduleRes.value) {
          this.applyScheduleMeta(scheduleRes.value)
          concertId =
            scheduleRes.value.concertId ??
            scheduleRes.value.concert_id ??
            scheduleRes.value.concert?.id ??
            null
        }

        /**
         * 구매 제한 정책은 화면 진입 시 1번만 조회한다.
         * 좌석 클릭마다 정책 API를 부르면 불필요한 네트워크/서버 부하가 생긴다.
         */
        if (concertId) {
          try {
            const policiesRes = await this.api.get(ENDPOINTS.concertPolicies(concertId))
            const policies = Array.isArray(policiesRes)
              ? policiesRes
              : (policiesRes?.content ?? policiesRes?.items ?? [])

            const purchaseLimitPolicy = policies.find((p) => p.type === 'PURCHASE_LIMIT')

            if (purchaseLimitPolicy?.config) {
              const parsed = JSON.parse(purchaseLimitPolicy.config)
              this.maxSeats = Number(parsed.limit ?? 10) || 10
            } else {
              this.maxSeats = 10
            }
          } catch {
            /**
             * 정책 조회 실패가 좌석 화면 전체를 깨뜨리면 안 되므로
             * 기본값 10으로 fallback 한다.
             */
            this.maxSeats = 10
          }
        } else {
          this.maxSeats = 10
        }

        const seatsData = seatsRes.status === 'fulfilled' ? seatsRes.value : []
        const raw = Array.isArray(seatsData) ? seatsData : (seatsData?.content ?? seatsData?.items ?? [])

        this.seats = raw.map((s) => ({
          ...s,
          isVisible: resolveVisible(s),
          sectionX: s.sectionX ?? s.sectionXpos ?? s.section_x ?? 0,
          sectionY: s.sectionY ?? s.sectionYpos ?? s.section_y ?? 0,
          sectionRotation: s.sectionRotation ?? s.section_rotation ?? 0,
          rowLabelType: s.rowLabelType ?? s.row_label_type ?? s.sectionRowLabelType ?? 'left',
          stageX: s.stageX ?? s.stage_x ?? s.stagex ?? 0,
          stageY: s.stageY ?? s.stage_y ?? s.stagey ?? 0,
          stageWidth: s.stageWidth ?? s.stage_width ?? s.stagewidth ?? null,
          stageHeight: s.stageHeight ?? s.stage_height ?? s.stageheight ?? 100,
          stageRotation: s.stageRotation ?? s.stage_rotation ?? 0,
        })).filter((s) => s.isVisible !== false)

        if (this.seats.length > 0) {
          this.$nextTick(() => this.initKonva())
        }
      } catch (err) {
        if (err?.status === 403) {
          const data = err.responseData || {}
          const msg =
            data.error_message ||
            data.message ||
            err.message ||
            '좌석을 조회할 수 없습니다.'

          alert(msg)

          if (msg.includes('로그인')) {
            this.$router.push({
              path: '/member/doLogin',
              query: { redirect: this.$route.fullPath },
            })
          } else if (msg.includes('연령 인증')) {
            this.$router.push('/me/verify-identity')
          } else {
            this.$router.back()
          }
          return
        }

        this.loadError = err?.message || '좌석 배치도를 불러오지 못했습니다.'
        this.seats = []
      } finally {
        this.loading = false
      }
    },

    initKonva() {
      const container = this.$refs.konvaContainer
      if (!container) return
      if (this.konvaStageInstance) this.konvaStageInstance.destroy()

      const stage = new Konva.Stage({
        container,
        width:     container.offsetWidth,
        height:    container.offsetHeight,
        draggable: true,
      })
      this.konvaStageInstance = stage

      const layer = new Konva.Layer()
      stage.add(layer)
      this.mainLayerInstance = layer

      stage.on('dragstart', () => { container.style.cursor = 'grabbing' })
      stage.on('dragend',   () => { container.style.cursor = 'grab' })

      // 마우스 휠 줌
      stage.on('wheel', (e) => {
        e.evt.preventDefault()
        const oldScale = stage.scaleX()
        const pointer  = stage.getPointerPosition()
        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        }
        const factor   = e.evt.deltaY < 0 ? 1.12 : 1 / 1.12
        const newScale = Math.min(Math.max(oldScale * factor, 0.15), 8)
        stage.scale({ x: newScale, y: newScale })
        stage.position({
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        })
      })

      this.renderAll()
      this.fitToView()
    },

    // 좌석 색상 결정
    seatFill(seat) {
      if (this.selectedSet.has(seat.seatId)) return '#3b82f6'
      switch (seat.status) {
        case 'AVAILABLE': return gradeColor(seat.grade)
        case 'HOLD':      // WebSocket 메시지 값
        case 'HELD':      return '#334155'  // DB enum 값
        case 'SOLD':      return '#cbd5e1'
        default:          return '#e2e8f0'
      }
    },
    // 전체 렌더링 (좌석 + 스테이지)
    refreshSeatVisual(seatId) {
      const node = this.seatNodeMap?.get(seatId)
      if (!node) {
        this.renderAll()
        return
      }
      const seat = this.seats.find(s => s.seatId === seatId)
      if (!seat) return

      const isSelected = this.selectedSet.has(seatId)
      const isSold = seat.status === 'SOLD'
      const isClickable = seat.status === 'AVAILABLE' || isSelected

      node.fill(this.seatFill(seat))
      node.stroke(isSelected ? '#1d4ed8' : 'transparent')
      node.opacity(isSold ? 0.3 : 1)
      node.listening(isClickable)
      this.mainLayerInstance?.batchDraw()
    },

    refreshSeatsVisual(seatIds) {
      if (!Array.isArray(seatIds) || seatIds.length === 0) return
      let fallback = false
      for (const seatId of seatIds) {
        const node = this.seatNodeMap?.get(seatId)
        const seat = this.seats.find(s => s.seatId === seatId)
        if (!node || !seat) {
          fallback = true
          break
        }
        const isSelected = this.selectedSet.has(seatId)
        const isSold = seat.status === 'SOLD'
        const isClickable = seat.status === 'AVAILABLE' || isSelected

        node.fill(this.seatFill(seat))
        node.stroke(isSelected ? '#1d4ed8' : 'transparent')
        node.opacity(isSold ? 0.3 : 1)
        node.listening(isClickable)
      }
      if (fallback) {
        this.renderAll()
        return
      }
      this.mainLayerInstance?.batchDraw()
    },
    renderAll() {
      const layer = this.mainLayerInstance
      if (!layer) return
      layer.destroyChildren()
      this.seatNodeMap = new Map()

      // ── 스테이지(무대) - 여러 stage 지원 ──
      console.log('[SeatsView] renderAll - stageList:', JSON.stringify(this.stageList))
      for (const si of this.stageList) {
        const grp = new Konva.Group({ x: si.x, y: si.y, rotation: si.rotation ?? 0 })
        grp.add(new Konva.Rect({
          width: si.width, height: si.height,
          fill: '#cbd5e1', stroke: '#64748b', strokeWidth: 2, cornerRadius: 10,
        }))
        grp.add(new Konva.Text({
          text: si.name || 'STAGE',
          fontSize: Math.max(14, Math.min(20, si.height * 0.4)),
          fontStyle: 'bold', fill: '#64748b',
          width: si.width, height: si.height,
          align: 'center', verticalAlign: 'middle',
          listening: false,
        }))
        layer.add(grp)
      }

      // ── 구역별 좌석 그리드 ──
      for (const section of this.sections) {
        if (section.seats.length === 0) continue

        const maxRow = Math.max(...section.seats.map(s => s.rowNo))
        const maxCol = Math.max(...section.seats.map(s => s.seatNo))
        const gridW  = maxCol * SEAT_STEP - SEAT_GAP

        const grp = new Konva.Group({
          x: section.x ?? 0,
          y: section.y ?? 0,
          rotation: section.rotation ?? 0,
        })

        // 구역 이름 레이블
        grp.add(new Konva.Text({
          text:       section.name,
          fontSize:   13, fontStyle: 'bold', fill: '#475569',
          x: 0, y: -24,
          width: gridW, align: 'center',
          listening:  false,
        }))

        // 행 번호 레이블 (관리자가 설정한 rowLabelType 반영: left / right / none / '')
        const labelType = section.rowLabelType
        if (labelType && labelType !== 'none') {
          const isRight = labelType === 'right'
          for (let r = 1; r <= maxRow; r++) {
            grp.add(new Konva.Text({
              text:      String(r),
              fontSize:  9, fill: '#94a3b8',
              x:         isRight ? gridW + 5 : -20,
              y:         (r - 1) * SEAT_STEP + SEAT_W / 2 - 4.5,
              width:     16,
              align:     isRight ? 'left' : 'right',
              listening: false,
            }))
          }
        }

        // 좌석 렌더링 (원형)
        for (const seat of section.seats) {
          const cx        = (seat.seatNo - 1) * SEAT_STEP + SEAT_W / 2
          const cy        = (seat.rowNo  - 1) * SEAT_STEP + SEAT_H / 2
          const fill      = this.seatFill(seat)
          const isSelected  = this.selectedSet.has(seat.seatId)
          const isAvailable = seat.status === 'AVAILABLE'
          const isSold      = seat.status === 'SOLD'
          // 내가 선점한 좌석은 status가 'HOLD'로 바뀌어도 클릭 해제 가능해야 함 (WebSocket 레이스 컨디션 방지)
          const isClickable = isAvailable || isSelected

          const circle = new Konva.Circle({
            x: cx, y: cy,
            radius:      SEAT_R,
            fill,
            stroke:      isSelected ? '#1d4ed8' : 'transparent',
            strokeWidth: 2.5,
            opacity:     isSold ? 0.3 : 1,
          })

          if (isClickable) {
            circle.on('mouseenter', () => {
              circle.radius(SEAT_R + 1.5)
              circle.opacity(0.85)
              layer.batchDraw()
              document.body.style.cursor = 'pointer'
            })
            circle.on('mouseleave', () => {
              circle.radius(SEAT_R)
              circle.opacity(1)
              layer.batchDraw()
              document.body.style.cursor = 'default'
            })
            circle.on('click tap', (e) => {
              if (this.seatToggling) return  // API 호출 중 중복 클릭 방지
              e.cancelBubble = true
              this.konvaStageInstance?.stopDrag()
              this.toggleSeat(seat)
            })
          }

          grp.add(circle)
          this.seatNodeMap.set(seat.seatId, circle)
        }

        layer.add(grp)
      }

      layer.draw()
    },

    // 전체가 보이도록 자동 맞춤 (캔버스 정중앙에 배치)
    fitToView() {
      const stage = this.konvaStageInstance
      if (!stage || this.sections.length === 0) return

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

      for (const section of this.sections) {
        if (section.seats.length === 0) continue
        const maxRow = Math.max(...section.seats.map(s => s.rowNo))
        const maxCol = Math.max(...section.seats.map(s => s.seatNo))
        const w = maxCol * SEAT_STEP
        const h = maxRow * SEAT_STEP
        minX = Math.min(minX, (section.x ?? 0) - 25)
        minY = Math.min(minY, (section.y ?? 0) - 30)
        maxX = Math.max(maxX, (section.x ?? 0) + w + 10)
        maxY = Math.max(maxY, (section.y ?? 0) + h + 10)
      }

      for (const si of this.stageList) {
        minX = Math.min(minX, si.x ?? 0)
        minY = Math.min(minY, si.y ?? 0)
        maxX = Math.max(maxX, (si.x ?? 0) + (si.width ?? 0))
        maxY = Math.max(maxY, (si.y ?? 0) + (si.height ?? 0))
      }

      if (!isFinite(minX)) return

      const PAD      = 40
      const contentW = Math.max(maxX - minX, 100)
      const contentH = Math.max(maxY - minY, 100)

      // 캔버스 크기에 맞춰 스케일 계산 (최대 2배 제한 – 너무 확대되지 않게)
      const scale = Math.min(
        (stage.width()  - PAD * 2) / contentW,
        (stage.height() - PAD * 2) / contentH,
        2
      )

      // 콘텐츠 전체를 캔버스 정중앙에 배치
      const scaledW = contentW * scale
      const scaledH = contentH * scale
      stage.scale({ x: scale, y: scale })
      stage.position({
        x: (stage.width()  - scaledW) / 2 - minX * scale,
        y: (stage.height() - scaledH) / 2 - minY * scale,
      })
    },

    zoomIn() {
      const stage = this.konvaStageInstance
      if (!stage) return
      const oldScale = stage.scaleX()
      const newScale = Math.min(oldScale * 1.25, 8)
      const cx = stage.width()  / 2
      const cy = stage.height() / 2
      stage.scale({ x: newScale, y: newScale })
      stage.position({
        x: cx - (cx - stage.x()) * (newScale / oldScale),
        y: cy - (cy - stage.y()) * (newScale / oldScale),
      })
      this.mainLayerInstance?.batchDraw()
    },

    zoomOut() {
      const stage = this.konvaStageInstance
      if (!stage) return
      const oldScale = stage.scaleX()
      const newScale = Math.max(oldScale / 1.25, 0.15)
      const cx = stage.width()  / 2
      const cy = stage.height() / 2
      stage.scale({ x: newScale, y: newScale })
      stage.position({
        x: cx - (cx - stage.x()) * (newScale / oldScale),
        y: cy - (cy - stage.y()) * (newScale / oldScale),
      })
      this.mainLayerInstance?.batchDraw()
    },

    // 좌석 클릭: 선점 API 즉시 호출 (선택 추가 → POST, 선택 해제 → DELETE)
    async toggleSeat(seat) {
      if (seat.status !== 'AVAILABLE' && !this.selectedSet.has(seat.seatId)) return
      this.seatToggling = true
      this.holdError    = null
      try {
        const idx = this.selected.indexOf(seat.seatId)
        if (idx >= 0) {
          // ── 선점 해제 ──
          await this.api.del(ENDPOINTS.seatHold(seat.seatId))
          this.selected.splice(idx, 1)
          // WebSocket RELEASE 메시지가 splice 전에 이미 처리되어 버릴 수 있으므로
          // 명시적으로 상태를 AVAILABLE로 초기화 (레이스 컨디션 방지)
          seat.status = 'AVAILABLE'
          if (this.selected.length === 0) {
            this.clearHoldTimer()
          }
        } else {
          // ── 선점 추가 ──
          if (this.selected.length >= this.maxSeats) {
            this.holdError = `좌석은 최대 ${this.maxSeats}개까지 선택할 수 있습니다.`
            return
          }
          await this.api.post(ENDPOINTS.seatHold(seat.seatId))
          this.selected.push(seat.seatId)
          // 첫 선점 시 5분 타이머 시작 (holdExpiresAt은 startHoldTimer 내부에서 설정)
          if (!this.holdExpiresAt) {
            this.startHoldTimer()
          }
        }
      } catch (e) {
        this.holdError = e?.message || '좌석 선점에 실패했습니다.'
      } finally {
        this.seatToggling = false
        this.refreshSeatVisual(seat.seatId)
      }
    },

    clearAll() {
      const toRelease = [...this.selected]
      this.selected = []
      this.clearHoldTimer()
      // 각 좌석 상태를 AVAILABLE로 초기화 + 백엔드 선점 해제 API 호출
      toRelease.forEach(seatId => {
        const seat = this.seats.find(s => s.seatId === seatId)
        if (seat) seat.status = 'AVAILABLE'
        this.api.del(ENDPOINTS.seatHold(seatId)).catch(() => {})
      })
      this.refreshSeatsVisual(toRelease)
    },

    // "선택 완료": 주문 생성 후 결제(Order) 페이지로 이동 (Checkout 단계 없음)
    async hold() {
      if (this.selected.length === 0) return
      this.holdLoading = true
      const scheduleId = this.$route.params.scheduleId
      const holdId = this.selected.map(String).join(',')
      const holdInfo = {
        holdId,
        scheduleId,
        seats: [...this.selected],
        expiresAt: this.holdExpiresAt ? new Date(this.holdExpiresAt).toISOString() : null,
        createdAt: new Date().toISOString(),
      }
      const stored = JSON.parse(localStorage.getItem('seatHolds') || '[]')
      stored.push(holdInfo)
      localStorage.setItem('seatHolds', JSON.stringify(stored))
      this.proceedingToCheckout = true
      try {
        const seatIds = this.selected.map((id) => Number(id)).filter(Number.isFinite)
        const res = await this.api.post(ENDPOINTS.orderCreate(), { seats: seatIds })
        const orderId = res?.orderId ?? res?.id ?? res
        this.holdLoading = false
        this.$router.push(`/order?orderId=${orderId}&holdId=${encodeURIComponent(holdId)}`)
      } catch (e) {
        this.holdLoading = false
        this.proceedingToCheckout = false
      }
    },

    // ── 선점 타이머 ──
    startHoldTimer() {
      this.clearHoldTimer()
      // clearHoldTimer가 holdExpiresAt을 null로 초기화하므로
      // 반드시 clearHoldTimer 이후에 설정해야 함
      this.holdExpiresAt = Date.now() + 5 * 60 * 1000
      const tick = () => {
        const remaining = this.holdExpiresAt - Date.now()
        if (remaining <= 0) {
          this.holdCountdown = '00:00'
          this.onHoldExpired()
          return
        }
        const m = Math.floor(remaining / 60000)
        const s = Math.floor((remaining % 60000) / 1000)
        this.holdCountdown = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      }
      tick()
      this.holdTimerInterval = setInterval(tick, 1000)
    },

    clearHoldTimer() {
      if (this.holdTimerInterval) {
        clearInterval(this.holdTimerInterval)
        this.holdTimerInterval = null
      }
      this.holdExpiresAt = null
      this.holdCountdown = ''
    },

    // 타이머 만료: 모든 선점 자동 해제
    async onHoldExpired() {
      this.clearHoldTimer()
      const toRelease = [...this.selected]
      this.selected = []
      // renderAll() 전에 각 좌석 상태를 AVAILABLE로 초기화해야 색상이 복원됨
      toRelease.forEach(seatId => {
        const seat = this.seats.find(s => s.seatId === seatId)
        if (seat) seat.status = 'AVAILABLE'
      })
      this.refreshSeatsVisual(toRelease)
      await Promise.all(toRelease.map(seatId =>
        this.api.del(ENDPOINTS.seatHold(seatId)).catch(() => {})
      ))
      this.holdError = '선점 시간(5분)이 만료되었습니다. 다시 선택해 주세요.'
    },

    // 이전 세션 선점 정리 (뒤로 가기 후 재진입 시)
    async cleanupOldHolds() {
      const scheduleId = this.$route.params.scheduleId
      if (!scheduleId) return
      const stored = JSON.parse(localStorage.getItem('seatHolds') || '[]')
      const old = stored.filter(h => String(h.scheduleId) === String(scheduleId))
      for (const hold of old) {
        const seatIds = hold.seats || []
        await Promise.all(seatIds.map(seatId =>
          this.api.del(ENDPOINTS.seatHold(seatId)).catch(() => {})
        ))
      }
      // 해제된 hold를 localStorage에서 제거
      const remaining = stored.filter(h => String(h.scheduleId) !== String(scheduleId))
      localStorage.setItem('seatHolds', JSON.stringify(remaining))
    },

    // ── WebSocket (STOMP) 연결 ──
    connectWebSocket() {
      const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:8082'
      const client = new Client({
        webSocketFactory: () => new SockJS(`${baseUrl}/ws-seatHold`),
        reconnectDelay: 5000,
        onConnect: () => {
          client.subscribe('/topic/seat', (message) => {
            this.onSeatStatusMessage(message)
          })
        },
        onStompError: (frame) => {
          console.warn('[STOMP] 오류:', frame)
        },
      })
      client.activate()
      this.stompClient = client
    },

    // 다른 사용자의 선점/해제 실시간 반영
    onSeatStatusMessage(message) {
      try {
        const data = JSON.parse(message.body)
        const seatId = Number(data.seatId)
        const status = data.status
        const seat = this.seats.find(s => s.seatId === seatId)
        if (!seat) return

        if (status === 'HOLD') {
          // 내가 선점 중인 좌석이면 색상 변경 불필요 (blue 유지)
          if (!this.selectedSet.has(seatId)) {
            seat.status = 'HOLD'
            this.refreshSeatVisual(seat.seatId)
          }
        } else if (status === 'RELEASE') {
          // 내가 선점 중인 좌석이면 무시 (내가 직접 selected에서 제거할 것)
          if (!this.selectedSet.has(seatId)) {
            seat.status = 'AVAILABLE'
            this.refreshSeatVisual(seat.seatId)
          }
        } else if (status === 'BOOKED') {
          seat.status = 'SOLD'
          // 내가 선점 중이던 좌석이 다른 경로로 예매 완료된 경우 강제 해제
          const idx = this.selected.indexOf(seatId)
          if (idx >= 0) {
            this.selected.splice(idx, 1)
            if (this.selected.length === 0) this.clearHoldTimer()
          }
          this.refreshSeatVisual(seat.seatId)
        }
      } catch (e) {
        console.warn('[WS] 좌석 상태 메시지 파싱 실패:', e)
      }
    },

    // 탭 닫기 / 새로고침 시 선점 해제 + localStorage 정리
    handleBeforeUnload() {
      const scheduleId = this.$route.params.scheduleId
      if (!scheduleId) return
      const stored = JSON.parse(localStorage.getItem('seatHolds') || '[]')
      const filtered = stored.filter(h => String(h.scheduleId) !== String(scheduleId))
      localStorage.setItem('seatHolds', JSON.stringify(filtered))
      // 선점 중인 좌석 해제 (탭 닫기/새로고침 대응)
      // keepalive: true → 페이지 언로드 이후에도 요청 완료 보장
      if (!this.proceedingToCheckout && this.selected.length > 0) {
        const toRelease = [...this.selected]
        const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:8082'
        const token = localStorage.getItem('accessToken')
        toRelease.forEach(seatId => {
          fetch(`${baseUrl}/seat-holds/${seatId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            keepalive: true,
          }).catch(() => {})
        })
        // beforeUnmount에서 중복 호출 방지용으로 selected 초기화
        this.selected = []
      }
    },
  }
}
</script>
