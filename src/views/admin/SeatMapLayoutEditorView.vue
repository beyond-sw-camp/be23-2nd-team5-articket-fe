<template>
  <div class="sfe-root" ref="rootContainer">
    <!-- ── TOP BAR ── -->
    <div class="sfe-topbar">
      <div class="flex items-center gap-3">
        <div class="sfe-logo-box">
          <span class="text-xl">🏟️</span>
        </div>
        <div>
          <div class="sfe-file-name">{{ fileName }}</div>
          <div class="sfe-file-meta">Version {{ seatMapVersion || 1 }} • {{ savedStatus }}</div>
        </div>
      </div>

      <div class="sfe-spacer"></div>

      <div class="flex items-center gap-2">
        <button class="sfe-btn sfe-ghost" @click="undo" :disabled="historyIndex <= 0" title="Ctrl+Z">
          <span>↩</span> 실행 취소
        </button>
        <button class="sfe-btn sfe-ghost" @click="redo" :disabled="historyIndex >= history.length - 1" title="Ctrl+Y">
          <span>↪</span> 다시 실행
        </button>
        <div class="sfe-div"></div>
        <button class="sfe-btn sfe-ghost" :class="{ 'sfe-active': snapEnabled }" @click="snapEnabled = !snapEnabled">
          <span>⌗</span> 스냅 {{ snapEnabled ? 'ON' : 'OFF' }}
        </button>
        <div class="sfe-div"></div>
        <button class="sfe-btn sfe-ghost" @click="downloadLayoutImage" title="현재 배치도를 PNG로 다운로드">
          <span>🖼</span> 이미지 저장
        </button>
        <button class="sfe-btn sfe-primary" @click="handleSave" :disabled="saving">
          <span>💾</span> {{ saving ? '저장 중...' : '저장' }}
        </button>
        <button class="sfe-btn sfe-danger" @click="router.back()">
          <span>✕</span> 닫기
        </button>
      </div>
    </div>

    <!-- ── MAIN WORKSPACE ── -->
    <div class="sfe-main">

      <!-- LEFT TOOLS PANEL -->
      <div class="sfe-left-panel">
        <div class="sfe-tool-group">
          <div class="sfe-tool-label">TOOLS</div>
          <button class="sfe-tool-btn" :class="{ active: isFullScreen }" @click="toggleFullScreen" title="전체 화면">
            <span>⛶</span>
            <span>전체화면</span>
          </button>
          <button v-for="t in tools" :key="t.id"
               class="sfe-tool-btn" :class="{ active: currentTool === t.id }"
               @click="setTool(t.id)" :title="t.name">
            <span>{{ t.icon }}</span>
            <span>{{ t.name }}</span>
          </button>
          <button class="sfe-tool-btn" @click="fitToView" title="화면 맞춤">
            <span>⊞</span>
            <span>화면맞춤</span>
          </button>
          <button class="sfe-tool-btn" @click="clearAllObjects">
            <span>🗑</span>
            <span>초기화</span>
          </button>
        </div>

        <div class="sfe-spacer"></div>
      </div>

      <!-- CENTER CANVAS AREA -->
      <div class="sfe-canvas-area" ref="canvasContainer">
        <div id="sfe-konva" class="w-full h-full"></div>

        <!-- HUD Controls -->
        <div class="sfe-hud">
          <button class="sfe-hud-btn" @click="zoomOut">－</button>
          <span class="sfe-hud-val">{{ Math.round(stageScale * 100) }}%</span>
          <button class="sfe-hud-btn" @click="zoomIn">＋</button>
        </div>

      </div>

      <!-- RIGHT PROPERTIES PANEL -->
      <div class="sfe-right-panel">

        <!-- ── 좌석수정 도구 활성 시: 브러시 패널 항상 표시 ── -->
        <div v-if="currentTool === 'seatEdit'" class="sfe-prop-section">
          <div class="sfe-prop-header">
            <span>✏️ 좌석수정 도구</span>
          </div>

          <div class="sfe-field-group">
            <label class="sfe-label">브러시 모드</label>
            <div class="flex rounded bg-slate-100 p-1 text-xs">
              <button class="flex-1 py-2 rounded transition-colors"
                      :class="brushMode === 'state' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'"
                      @click="brushMode = 'state'">상태 토글</button>
              <button class="flex-1 py-2 rounded transition-colors"
                      :class="brushMode === 'grade' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'"
                      @click="brushMode = 'grade'">등급 칠하기</button>
            </div>
            <p class="text-[10px] text-slate-500 mt-1.5">
              {{ brushMode === 'state'
                ? '드래그 → 사용 ↔ 미사용 전환'
                : '드래그 → 아래 등급으로 칠하기' }}
            </p>
          </div>

          <div class="sfe-field-group">
            <label class="sfe-label">{{ brushMode === 'grade' ? '칠할 등급' : '등급 팔레트' }}</label>
            <div class="grid grid-cols-3 gap-1.5">
              <button v-for="g in grades" :key="g.id"
                      class="sfe-grade-mini-btn"
                      :style="{
                        background: activePaintGrade === g.id ? g.color : 'transparent',
                        borderColor: g.color,
                        color: activePaintGrade === g.id ? '#fff' : g.color
                      }"
                      @click="activePaintGrade = g.id; brushMode = 'grade'">
                {{ g.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── 객체 선택 시 속성 ── -->
        <div v-if="selectedObj" class="sfe-prop-section">
          <div class="sfe-prop-header">
            <span>{{ selectedObj.type === 'stage' ? '무대 속성' : '구역 속성' }}</span>
          </div>

          <div class="sfe-field-group">
            <label class="sfe-label">이름</label>
            <input type="text" class="sfe-input" v-model="selectedObj.name" @change="pushHistory">
          </div>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label class="sfe-label">X 좌표</label>
              <input type="number" class="sfe-input" v-model.number="selectedObj.x" @change="syncStage">
            </div>
            <div>
              <label class="sfe-label">Y 좌표</label>
              <input type="number" class="sfe-input" v-model.number="selectedObj.y" @change="syncStage">
            </div>
            <div>
              <label class="sfe-label">{{ selectedObj.type === 'seatGrid' ? '행 수' : '너비' }}</label>
              <input v-if="selectedObj.type === 'seatGrid'" type="number" class="sfe-input"
                     v-model.number="selectedObj.rows" @change="syncStage(); pushHistory()">
              <input v-else type="number" class="sfe-input"
                     v-model.number="selectedObj.width" @change="syncStage(); pushHistory()">
            </div>
            <div>
              <label class="sfe-label">{{ selectedObj.type === 'seatGrid' ? '열 수' : '높이' }}</label>
              <input v-if="selectedObj.type === 'seatGrid'" type="number" class="sfe-input"
                     v-model.number="selectedObj.cols" @change="syncStage(); pushHistory()">
              <input v-else type="number" class="sfe-input"
                     v-model.number="selectedObj.height" @change="syncStage(); pushHistory()">
            </div>
          </div>

          <div class="sfe-field-group">
            <label class="sfe-label">회전 ({{ Math.round(selectedObj.rotation || 0) }}°)</label>
            <input type="range" class="sfe-slider" min="-180" max="180"
                   v-model.number="selectedObj.rotation" @input="onRotationInput" @change="pushHistory">
          </div>

          <!-- 구역 전용 -->
          <template v-if="selectedObj.type === 'seatGrid'">
            <div class="sfe-field-group">
              <label class="sfe-label">열 번호 표시</label>
              <div class="flex rounded bg-slate-100 p-1">
                <button v-for="opt in ['none', 'left', 'right']" :key="opt"
                        class="flex-1 py-1 text-[10px] rounded transition-colors"
                        :class="(selectedObj.rowLabelType || 'left') === opt ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'"
                        @click="selectedObj.rowLabelType = opt; syncStage(); pushHistory()">
                  {{ opt === 'none' ? '없음' : opt === 'left' ? '왼쪽' : '오른쪽' }}
                </button>
              </div>
            </div>
          </template>

          <div class="mt-4 pt-4 border-t border-slate-200 flex gap-2">
            <button class="sfe-btn sfe-ghost flex-1" @click="duplicateObj">복제</button>
            <button class="sfe-btn sfe-danger flex-1" @click="deleteObj">삭제</button>
          </div>
        </div>

        <!-- ── 빈 상태 안내 ── -->
        <div v-if="currentTool === 'select' && !selectedObj && selectedSeatIds.size === 0"
             class="flex flex-col items-center justify-center h-full text-slate-500 p-6 text-center">
          <div class="text-4xl mb-4">👆</div>
          <p class="text-sm">구역이나 무대를 클릭하여<br>속성을 편집하세요.</p>
          <div class="mt-6 text-[11px] text-slate-600 text-left space-y-1.5">
            <p><span class="text-slate-500">👆 선택</span> — 구역 이동·크기 조절</p>
            <p><span class="text-slate-500">✏️ 좌석수정</span> — 드래그로 상태·등급 칠하기</p>
            <p><span class="text-slate-500">▦ 구역생성</span> — 드래그로 크기 지정 후 생성</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useApi } from '../../composables/useApi'
import Konva from 'konva'

const route = useRoute()
const router = useRouter()
const api = useApi()
const seatMapId = route.params.seatMapId
const rootContainer = ref(null)
const isFullScreen = ref(false)

// ── STATE ─────────────────────────────────────────────────────────────
const fileName = ref('로딩 중...')
const seatMapVersion = ref(1)
const savedStatus = ref('저장됨')
const currentTool = ref('select')
const selectedId = ref(null)
const selectedSeatIds = ref(new Set())
const objects = ref([])
const stageScale = ref(1)
const snapEnabled = ref(true)
const saving = ref(false)
const bulkVisible = ref(true)

// Paint state
const isPainting = ref(false)
const paintValue = ref('inactive')    // 'inactive' | 'empty'
const brushMode = ref('state')        // 'state' | 'grade'
const activePaintGrade = ref('C')
const lastPaintedKey = ref(null)

// History
const history = ref([])
const historyIndex = ref(-1)

// Konva refs
let konvaStage = null
let mainLayer = null
let guideLayer = null
let transformer = null
let selectionRect = null

// 구역 드래그 생성 상태
let isDragCreating = false
let dragCreateStart = null
let previewRect = null
let previewLabel = null
let guidelineStops = null

// Constants
const SEAT_W = 20, SEAT_H = 20, SEAT_GAP = 4
const SNAP_SIZE = 10

const tools = [
  { id: 'select',   icon: '↖', name: '선택' },
  { id: 'seatEdit', icon: '✏', name: '좌석수정' },
  { id: 'seatGrid', icon: '▦', name: '구역생성' },
  { id: 'stage',    icon: '▭', name: '무대' },
]

const grades = [
  { id: 'VIP', label: 'VIP', color: '#f5c842' },
  { id: 'R',   label: 'R석', color: '#ef6b6b' },
  { id: 'S',   label: 'S석', color: '#4ec5ef' },
  { id: 'A',   label: 'A석', color: '#52d98a' },
  { id: 'B',   label: 'B석', color: '#b06ef5' },
  { id: 'C',   label: 'C석', color: '#94a3b8' },
]

// ── COMPUTED ──────────────────────────────────────────────────────────
const selectedObj = computed(() => objects.value.find(o => o.id === selectedId.value))

// ── HELPERS ───────────────────────────────────────────────────────────
const uid = () => `obj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

const getPointerPos = () => {
  const pos = konvaStage.getPointerPosition()
  const scale = konvaStage.scaleX()
  return {
    x: (pos.x - konvaStage.x()) / scale,
    y: (pos.y - konvaStage.y()) / scale
  }
}

const gradeColor = (gradeId) => grades.find(g => g.id === gradeId)?.color || '#ef6b6b'

// 화면 좌표 → 그룹 로컬 좌표 변환 후 어떤 좌석인지 탐색
const findSeatAtPos = (worldX, worldY) => {
  for (const obj of objects.value) {
    if (obj.type !== 'seatGrid') continue
    const grp = mainLayer?.findOne('#' + obj.id)
    if (!grp) continue

    // worldX/Y는 content space (stage scale/offset 제거 후)
    // screen pos = world * scale + stageOffset
    const screenX = worldX * konvaStage.scaleX() + konvaStage.x()
    const screenY = worldY * konvaStage.scaleY() + konvaStage.y()
    const transform = grp.getAbsoluteTransform().copy()
    transform.invert()
    const local = transform.point({ x: screenX, y: screenY })

    const col = Math.floor(local.x / (SEAT_W + SEAT_GAP))
    const row = Math.floor(local.y / (SEAT_H + SEAT_GAP))

    if (row >= 0 && row < obj.rows && col >= 0 && col < obj.cols) {
      const lx = local.x - col * (SEAT_W + SEAT_GAP)
      const ly = local.y - row * (SEAT_H + SEAT_GAP)
      if (lx >= 0 && lx <= SEAT_W && ly >= 0 && ly <= SEAT_H) {
        return { obj, row, col }
      }
    }
  }
  return null
}

const applyStatePaint = (obj, row, col) => {
  if (!obj.states) obj.states = []
  if (!obj.states[row]) obj.states[row] = []
  obj.states[row][col] = paintValue.value

  const key = `${row + 1}_${col + 1}`
  const def = obj.seatDefs[key]
  if (def) def.isVisible = paintValue.value !== 'inactive'
}

const applyGradePaint = (obj, row, col) => {
  const key = `${row + 1}_${col + 1}`
  let def = obj.seatDefs[key]
  if (!def) {
    def = { id: null, rowNo: row + 1, seatNo: col + 1, grade: activePaintGrade.value, isVisible: true }
    obj.seatDefs[key] = def
  } else {
    def.grade = activePaintGrade.value
  }
}

// ── HISTORY ───────────────────────────────────────────────────────────
const saveState = () => {
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  history.value.push(JSON.stringify(objects.value))
  historyIndex.value++
  savedStatus.value = '수정됨*'
}
const pushHistory = () => saveState()

const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    objects.value = JSON.parse(history.value[historyIndex.value])
    selectedId.value = null
    selectedSeatIds.value.clear()
    syncStage()
  }
}
const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    objects.value = JSON.parse(history.value[historyIndex.value])
    selectedId.value = null
    selectedSeatIds.value.clear()
    syncStage()
  }
}

// ── FULL SCREEN ───────────────────────────────────────────────────────
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    rootContainer.value?.requestFullscreen().catch((e) => {
      console.warn('Full screen failed:', e)
    })
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

// ── TOOLS ─────────────────────────────────────────────────────────────
const setTool = (t) => {
  currentTool.value = t
  selectedId.value = null
  selectedSeatIds.value.clear()
  if (transformer) transformer.nodes([])

  // seatEdit은 드래그로 페인트해야 하므로 stage 패닝 비활성화
  // (패닝이 활성화되면 mousemove 시 좌표계가 이동해 paint 불가)
  konvaStage.draggable(t === 'select')

  const container = konvaStage.container()
  if (t === 'seatEdit') container.style.cursor = 'cell'
  else if (t === 'select') container.style.cursor = 'default'
  else container.style.cursor = 'crosshair'

  renderAll()
}

// ── OBJECT MANIPULATION ───────────────────────────────────────────────
const addSeatGrid = (x, y, rows = 5, cols = 8) => {
  const obj = {
    id: uid(), type: 'seatGrid', name: '새 구역',
    x: Math.round(x), y: Math.round(y),
    rows, cols, grade: 'C', color: '#94a3b8',
    rotation: 0, shape: 'RECTANGLE', rowLabelType: 'left',
    states: Array(Math.max(rows, 20)).fill(0).map(() => Array(Math.max(cols, 30)).fill('empty')),
    seatDefs: {}
  }
  objects.value.push(obj)
  pushHistory()
  selectedId.value = obj.id
  setTool('select')
}

const addStage = (x, y, w = 300, h = 100) => {
  objects.value.push({
    id: uid(), type: 'stage', name: 'STAGE',
    x: Math.round(x), y: Math.round(y),
    width: Math.round(w), height: Math.round(h),
    rotation: 0
  })
  pushHistory()
  setTool('select')
}

const duplicateObj = () => {
  if (!selectedObj.value) return
  const copy = JSON.parse(JSON.stringify(selectedObj.value))
  copy.id = uid()
  copy.x += 20; copy.y += 20
  objects.value.push(copy)
  selectedId.value = copy.id
  pushHistory() // This calls saveState
  syncStage()
}

const deleteObj = () => {
  if (!selectedObj.value) return
  if (!confirm('선택한 객체를 삭제하시겠습니까?')) return
  objects.value = objects.value.filter(o => o.id !== selectedId.value)
  selectedId.value = null
  if (transformer) transformer.nodes([])
  pushHistory() // This calls saveState
  syncStage()
}

const clearAllObjects = () => {
  if (objects.value.length === 0) return
  if (!confirm('모든 내용을 지우고 초기화하시겠습니까?')) return
  objects.value = []
  selectedId.value = null
  selectedSeatIds.value.clear()
  if (transformer) transformer.nodes([]);
  pushHistory() // This calls saveState
  syncStage()
}

// ── SEAT BULK EDIT (box select) ────────────────────────────────────────
const clearSeatSelection = () => {
  selectedSeatIds.value.clear()
  syncStage()
}

// objId가 '_' 포함될 수 있으므로 뒤에서 두 자리를 잘라냄
const parseSeatKey = (key) => {
  const parts = key.split('_')
  const c = parseInt(parts.pop())
  const r = parseInt(parts.pop())
  const objId = parts.join('_')
  return { objId, r, c }
}

const bulkUpdateGrade = (grade) => {
  if (selectedSeatIds.value.size === 0) return
  selectedSeatIds.value.forEach(key => {
    const { objId, r, c } = parseSeatKey(key)
    const obj = objects.value.find(o => o.id === objId)
    if (!obj) return
    const defKey = `${r + 1}_${c + 1}`
    let def = obj.seatDefs[defKey]
    if (!def) {
      def = { id: null, rowNo: r + 1, seatNo: c + 1, grade, isVisible: true }
      obj.seatDefs[defKey] = def
    } else {
      def.grade = grade
    }
  })
  pushHistory()
  syncStage()
}

const bulkUpdateVisibility = (visible) => {
  bulkVisible.value = visible
  selectedSeatIds.value.forEach(key => {
    const { objId, r, c } = parseSeatKey(key)
    const obj = objects.value.find(o => o.id === objId)
    if (!obj) return
    if (!obj.states) obj.states = []
    if (!obj.states[r]) obj.states[r] = []
    obj.states[r][c] = visible ? 'empty' : 'inactive'
    const defKey = `${r + 1}_${c + 1}`
    const def = obj.seatDefs[defKey]
    if (def) def.isVisible = visible
  })
  pushHistory()
  syncStage()
}

// ── ALIGNMENT GUIDES ──────────────────────────────────────────────────
const getLineGuideStops = (skipShape) => {
  const vertical = [0, konvaStage.width() / 2, konvaStage.width()]
  const horizontal = [0, konvaStage.height() / 2, konvaStage.height()]
  objects.value.forEach(item => {
    if (item.id === skipShape.id()) return
    const w = item.width || (item.cols * (SEAT_W + SEAT_GAP))
    const h = item.height || (item.rows * (SEAT_H + SEAT_GAP))
    vertical.push(item.x, item.x + w, item.x + w / 2)
    horizontal.push(item.y, item.y + h, item.y + h / 2)
  })
  return { vertical, horizontal }
}

const getObjectSnappingEdges = (node) => {
  const box = node.getClientRect()
  const absPos = node.absolutePosition()
  return {
    vertical: [
      { guide: Math.round(box.x), offset: Math.round(absPos.x - box.x), snap: 'start' },
      { guide: Math.round(box.x + box.width / 2), offset: Math.round(absPos.x - box.x - box.width / 2), snap: 'center' },
      { guide: Math.round(box.x + box.width), offset: Math.round(absPos.x - box.x - box.width), snap: 'end' }
    ],
    horizontal: [
      { guide: Math.round(box.y), offset: Math.round(absPos.y - box.y), snap: 'start' },
      { guide: Math.round(box.y + box.height / 2), offset: Math.round(absPos.y - box.y - box.height / 2), snap: 'center' },
      { guide: Math.round(box.y + box.height), offset: Math.round(absPos.y - box.y - box.height), snap: 'end' }
    ]
  }
}

const getGuides = (lineGuideStops, itemBounds) => {
  const resultV = [], resultH = []
  lineGuideStops.vertical.forEach(lineGuide => {
    itemBounds.vertical.forEach(itemBound => {
      if (Math.abs(lineGuide - itemBound.guide) < SNAP_SIZE)
        resultV.push({ lineGuide, diff: lineGuide - itemBound.guide, snap: itemBound.snap, offset: itemBound.offset })
    })
  })
  lineGuideStops.horizontal.forEach(lineGuide => {
    itemBounds.horizontal.forEach(itemBound => {
      if (Math.abs(lineGuide - itemBound.guide) < SNAP_SIZE)
        resultH.push({ lineGuide, diff: lineGuide - itemBound.guide, snap: itemBound.snap, offset: itemBound.offset })
    })
  })
  const guides = []
  const minV = resultV.sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff))[0]
  if (minV) guides.push({ lineGuide: minV.lineGuide, offset: minV.offset, orientation: 'V', snap: minV.snap })
  const minH = resultH.sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff))[0]
  if (minH) guides.push({ lineGuide: minH.lineGuide, offset: minH.offset, orientation: 'H', snap: minH.snap })
  return guides
}

const drawGuides = (guides) => {
  guideLayer.destroyChildren()
  guides.forEach(lg => {
    if (lg.orientation === 'H') {
      const line = new Konva.Line({
        points: [-6000, 0, 6000, 0], stroke: '#ff00ff', strokeWidth: 1, dash: [4, 6]
      })
      line.absolutePosition({ x: 0, y: lg.lineGuide })
      guideLayer.add(line)
    } else if (lg.orientation === 'V') {
      const line = new Konva.Line({
        points: [0, -6000, 0, 6000], stroke: '#ff00ff', strokeWidth: 1, dash: [4, 6]
      })
      line.absolutePosition({ x: lg.lineGuide, y: 0 })
      guideLayer.add(line)
    }
  })
  guideLayer.batchDraw()
}

// ── RENDER (REFACTORED) ───────────────────────────────────────────────

/**
 * Populates a Konva.Group for a stage object.
 */
function populateStageGroup(grp, obj) {
  grp.add(new Konva.Rect({
    width: obj.width, height: obj.height,
    fill: '#f1f5f9', stroke: '#3b82f6', strokeWidth: 2, cornerRadius: 4,
    name: 'shape'
  }))
  grp.add(new Konva.Text({
    text: obj.name, fontSize: 20, fontStyle: 'bold', fill: '#60a5fa',
    width: obj.width, height: obj.height, align: 'center', verticalAlign: 'middle',
    name: 'label'
  }))
}

/**
 * Populates a Konva.Group for a seat grid object.
 */
function populateSeatGridGroup(grp, obj) {
  const rows = obj.rows || 5
  const cols = obj.cols || 8
  const w = SEAT_W, h = SEAT_H, gap = SEAT_GAP
  const gridW = cols * (w + gap) - gap
  const gridH = rows * (h + gap) - gap

  // 투명 히트 영역
  grp.add(new Konva.Rect({ x: 0, y: 0, width: gridW, height: gridH, fill: 'transparent' }))

  // 행 번호 레이블
  if (obj.rowLabelType === 'left') {
    for (let r = 0; r < rows; r++) {
      grp.add(new Konva.Text({
        text: String(r + 1), fontSize: 10, fill: '#94a3b8',
        x: -20, y: r * (h + gap) + 4, width: 15, align: 'right'
      }))
    }
  } else if (obj.rowLabelType === 'right') {
    for (let r = 0; r < rows; r++) {
      grp.add(new Konva.Text({
        text: String(r + 1), fontSize: 10, fill: '#94a3b8',
        x: gridW + 5, y: r * (h + gap) + 4, width: 15, align: 'left'
      }))
    }
  }

  // 좌석 렌더링
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const state = obj.states?.[r]?.[c] ?? 'empty'
      const def = obj.seatDefs?.[`${r + 1}_${c + 1}`]
      const seatGrade = def?.grade || obj.grade || 'R'
      const fill = state === 'inactive' ? '#cbd5e1' : gradeColor(seatGrade)
      const seatKey = `${obj.id}_${r}_${c}`
      const isSelected = selectedSeatIds.value.has(seatKey)

      grp.add(new Konva.Rect({
        x: c * (w + gap), y: r * (h + gap),
        width: w, height: h,
        fill,
        stroke: isSelected ? '#fff' : 'transparent',
        strokeWidth: 1.5,
        opacity: state === 'inactive' ? 0.25 : 1,
        listening: false,
        perfectDrawEnabled: false,
        shadowForStrokeEnabled: false
      }))
    }
  }

  // 구역 이름 레이블
  grp.add(new Konva.Text({
    text: obj.name, fontSize: 12, fill: '#cbd5e1',
    x: 0, y: -20,
    width: gridW, align: 'center'
  }))
}

/**
 * Creates a new Konva.Group for a given object from the data model.
 */
function createObjectNode(obj) {
  if (!mainLayer) return

  const grp = new Konva.Group({
      id: obj.id,
      x: obj.x, y: obj.y,
      rotation: obj.rotation || 0,
      draggable: currentTool.value === 'select',
      name: 'object'
    })

    if (obj.type === 'stage') {
      populateStageGroup(grp, obj)
    } else if (obj.type === 'seatGrid') {
      populateSeatGridGroup(grp, obj)
      const pr = Math.min(Math.max(stageScale.value, 1), 3)
      grp.cache({ pixelRatio: pr })
    }

    // ── 공통 이벤트 ──
    grp.on('click tap', (e) => {
      if (currentTool.value === 'select') {
        selectedId.value = obj.id
        updateTransformer()
        e.cancelBubble = true
      }
    })

    grp.on('dragstart', (e) => {
      if (!snapEnabled.value) return
      guidelineStops = getLineGuideStops(e.target)
    })

    grp.on('dragmove', (e) => {
      if (!snapEnabled.value) return
      guideLayer.destroyChildren()
      const itemBounds = getObjectSnappingEdges(e.target)
      const guides = getGuides(guidelineStops || getLineGuideStops(e.target), itemBounds)
      if (!guides.length) return
      drawGuides(guides)
      const absPos = e.target.absolutePosition()
      guides.forEach(lg => {
        if (lg.orientation === 'V') absPos.x = lg.lineGuide + lg.offset
        else if (lg.orientation === 'H') absPos.y = lg.lineGuide + lg.offset
      })
      e.target.absolutePosition(absPos)
    })

    grp.on('dragend', () => {
      guideLayer.destroyChildren()
      guidelineStops = null
      const o = objects.value.find(o => o.id === obj.id)
      if (o) { o.x = Math.round(grp.x()); o.y = Math.round(grp.y()) }
      pushHistory()
    })

    // 마우스 드래그 중 실시간 회전 각도 패널 반영
    grp.on('transform', () => {
      const o = objects.value.find(o => o.id === obj.id)
      if (o) o.rotation = Math.round(grp.rotation())
    })

    grp.on('transformend', () => {
      const o = objects.value.find(o => o.id === obj.id)
      if (!o) return
      o.x = Math.round(grp.x())
      o.y = Math.round(grp.y())
      o.rotation = Math.round(grp.rotation())
      const scaleX = grp.scaleX(), scaleY = grp.scaleY()
      if (o.type === 'stage') {
        o.width = Math.round(o.width * scaleX)
        o.height = Math.round(o.height * scaleY)
        o.scaleX = 1; o.scaleY = 1
      } else if (o.type === 'seatGrid') {
        const currentW = o.cols * (SEAT_W + SEAT_GAP) - SEAT_GAP
        const currentH = o.rows * (SEAT_H + SEAT_GAP) - SEAT_GAP
        o.cols = Math.max(1, Math.round((Math.abs(currentW * scaleX) + SEAT_GAP) / (SEAT_W + SEAT_GAP)))
        o.rows = Math.max(1, Math.round((Math.abs(currentH * scaleY) + SEAT_GAP) / (SEAT_H + SEAT_GAP)))
        o.scaleX = 1; o.scaleY = 1
      }
      pushHistory()
      grp.scaleX(1); grp.scaleY(1)
      syncStage()
    })
    mainLayer.add(grp)
}

/**
 * Updates an existing Konva.Group based on changed data.
 */
function updateObjectNode(node, obj) {
  // Update common attributes
  node.setAttrs({ x: obj.x, y: obj.y, rotation: obj.rotation || 0 })

  // Re-populate children. This is a compromise for simplicity.
  // It's still much faster than destroying/recreating the group and its events.
  node.destroyChildren()

  if (obj.type === 'stage') {
    populateStageGroup(node, obj)
  } else if (obj.type === 'seatGrid') {
    populateSeatGridGroup(node, obj)
    // Re-cache after updating
    const pr = Math.min(Math.max(stageScale.value, 1), 3)
    node.clearCache()
    node.cache({ pixelRatio: pr })
  }
}

/**
 * The main rendering function. It synchronizes the Konva stage with the `objects` data model.
 * It adds, removes, or updates nodes as necessary, avoiding a full-recreation.
 */
const syncStage = () => {
  if (!mainLayer) return

  const existingNodes = mainLayer.find('.object')
  const dataIds = new Set(objects.value.map(obj => obj.id))

  // 1. Remove nodes that are no longer in the data model
  existingNodes.forEach(node => {
    if (!dataIds.has(node.id())) {
      if (transformer && transformer.nodes().includes(node)) {
        transformer.nodes([])
      }
      node.destroy()
    }
  })

  // 2. Add new nodes or update existing ones
  objects.value.forEach(obj => {
    try {
      const node = mainLayer.findOne('#' + obj.id)
      if (node) {
        updateObjectNode(node, obj)
      } else {
        createObjectNode(obj)
      }
    } catch (e) {
      console.error('Error syncing object:', obj, e)
    }
  })

  updateTransformer()
  mainLayer.batchDraw()
}

const renderAll = syncStage // Alias for backward compatibility in a few places

const updateTransformer = () => {
  if (!transformer) return
  const node = mainLayer.findOne('#' + selectedId.value)
  transformer.nodes(node ? [node] : [])
  if (transformer.getLayer()) transformer.getLayer().batchDraw()
}

// ── STAGE EVENT HANDLERS ──────────────────────────────────────────────
let isSelecting = false
let selectionStart = { x: 0, y: 0 }

const handleStageMouseDown = (e) => {
  const pos = getPointerPos()

  // 구역 생성 OR 무대 생성: 드래그로 크기 결정
  if (currentTool.value === 'seatGrid' || currentTool.value === 'stage') {
    dragCreateStart = { ...pos }
    isDragCreating = true
    const isStage = currentTool.value === 'stage'
    previewRect = new Konva.Rect({
      x: pos.x, y: pos.y, width: 0, height: 0,
      fill: isStage ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 107, 107, 0.15)',
      stroke: isStage ? '#3b82f6' : '#ef6b6b',
      strokeWidth: 1.5, dash: [5, 4]
    })
    previewLabel = new Konva.Text({
      x: pos.x + 6, y: pos.y + 6,
      text: '', fontSize: 11, fill: isStage ? '#3b82f6' : '#ef6b6b', fontStyle: 'bold'
    })
    guideLayer.add(previewRect)
    guideLayer.add(previewLabel)
    guideLayer.batchDraw()
    return
  }

  if (currentTool.value === 'seatEdit') {
    const hit = findSeatAtPos(pos.x, pos.y)
    if (hit) {
      // 페인트 시작 — stage drag 중단 방지
      e.evt?.preventDefault()
      konvaStage.stopDrag()
      if (brushMode.value === 'state') {
        const cur = hit.obj.states?.[hit.row]?.[hit.col] ?? 'empty'
        paintValue.value = cur === 'inactive' ? 'empty' : 'inactive'
        applyStatePaint(hit.obj, hit.row, hit.col)
      } else {
        applyGradePaint(hit.obj, hit.row, hit.col)
      }
      isPainting.value = true
      lastPaintedKey.value = `${hit.obj.id}_${hit.row}_${hit.col}`
      syncStage()
    } else {
      // 빈 공간 → 박스 선택
      isSelecting = true
      selectionStart = pos
      selectionRect.visible(true)
      selectionRect.width(0)
      selectionRect.height(0)
    }
    return
  }

  if (currentTool.value === 'select' && e.target === konvaStage) {
    selectedId.value = null
    updateTransformer()
  }
}

const handleStageMouseMove = () => {
  // 구역/무대 드래그 생성 프리뷰 업데이트
  if (isDragCreating && dragCreateStart) {
    const pos = getPointerPos()
    const x = Math.min(dragCreateStart.x, pos.x)
    const y = Math.min(dragCreateStart.y, pos.y)
    const w = Math.abs(pos.x - dragCreateStart.x)
    const h = Math.abs(pos.y - dragCreateStart.y)
    if (previewRect) previewRect.setAttrs({ x, y, width: w, height: h })

    if (previewLabel) {
      let labelText = ''
      if (currentTool.value === 'stage') {
        labelText = `${Math.round(w)}px × ${Math.round(h)}px`
      } else {
        const pCols = Math.max(1, Math.round((w + SEAT_GAP) / (SEAT_W + SEAT_GAP)))
        const pRows = Math.max(1, Math.round((h + SEAT_GAP) / (SEAT_H + SEAT_GAP)))
        labelText = `${pRows}행 × ${pCols}열`
      }
      previewLabel.setAttrs({ x: x + 6, y: y + 6, text: labelText })
    }
    guideLayer.batchDraw()
    return
  }

  if (isPainting.value) {
    const pos = getPointerPos()
    const hit = findSeatAtPos(pos.x, pos.y)
    if (hit) {
      const key = `${hit.obj.id}_${hit.row}_${hit.col}`
      if (key !== lastPaintedKey.value) {
        lastPaintedKey.value = key
        if (brushMode.value === 'state') {
          applyStatePaint(hit.obj, hit.row, hit.col)
        } else {
          applyGradePaint(hit.obj, hit.row, hit.col)
        }
        syncStage()
      }
    }
    return
  }

  if (!isSelecting) return
  const pos = getPointerPos()
  const x = Math.min(selectionStart.x, pos.x)
  const y = Math.min(selectionStart.y, pos.y)
  selectionRect.setAttrs({
    x, y,
    width: Math.abs(pos.x - selectionStart.x),
    height: Math.abs(pos.y - selectionStart.y)
  })
  guideLayer.batchDraw()
}

const handleStageMouseUp = () => {
  // 구역/무대 드래그 생성 완료
  if (isDragCreating && dragCreateStart) {
    isDragCreating = false
    const pos = getPointerPos()
    const x = Math.min(dragCreateStart.x, pos.x)
    const y = Math.min(dragCreateStart.y, pos.y)
    const w = Math.abs(pos.x - dragCreateStart.x)
    const h = Math.abs(pos.y - dragCreateStart.y)

    // 프리뷰 정리
    if (previewRect) { previewRect.destroy(); previewRect = null }
    if (previewLabel) { previewLabel.destroy(); previewLabel = null }
    guideLayer.batchDraw()
    dragCreateStart = null

    if (currentTool.value === 'stage') {
      // 무대 생성 (최소 크기 제한, 클릭 시 기본 크기)
      const finalW = Math.max(20, w)
      const finalH = Math.max(20, h)
      addStage(x, y, finalW, finalH)
    } else {
      // 구역 생성
      const cols = Math.max(1, Math.round((w + SEAT_GAP) / (SEAT_W + SEAT_GAP)))
      const rows = Math.max(1, Math.round((h + SEAT_GAP) / (SEAT_H + SEAT_GAP)))
      addSeatGrid(x, y, rows, cols)
    }
    return
  }

  if (isPainting.value) {
    isPainting.value = false
    lastPaintedKey.value = null
    pushHistory()
    return
  }

  if (!isSelecting) return
  isSelecting = false
  selectionRect.visible(false)

  const box = selectionRect.getClientRect()
  const newSelected = new Set(selectedSeatIds.value)

  objects.value.filter(o => o.type === 'seatGrid').forEach(obj => {
    const grp = mainLayer.findOne('#' + obj.id)
    if (!grp) return
    const rows = obj.rows || 5, cols = obj.cols || 8
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lx = c * (SEAT_W + SEAT_GAP), ly = r * (SEAT_H + SEAT_GAP)
        const p = grp.getAbsoluteTransform().point({ x: lx + SEAT_W / 2, y: ly + SEAT_H / 2 })
        if (p.x >= box.x && p.x <= box.x + box.width &&
            p.y >= box.y && p.y <= box.y + box.height) {
          newSelected.add(`${obj.id}_${r}_${c}`)
        }
      }
    }
  })

  selectedSeatIds.value = newSelected
  syncStage()
}

// ── API ───────────────────────────────────────────────────────────────
const loadLayout = async () => {
  try {
    const mapRes = await api.get(`/seat-maps/admin/${seatMapId}`)
    if (mapRes) {
      fileName.value = mapRes.name
      seatMapVersion.value = mapRes.version
    }

    const sections = await api.get(`/seat-sections/admin/${seatMapId}`)

    // stageListJson이 있으면 여러 stage 파싱
    let stageObjs = []
    const stageListJson = mapRes?.stageListJson ?? mapRes?.stage_list_json
    if (stageListJson) {
      try {
        const list = JSON.parse(stageListJson)
        stageObjs = list.map(s => ({
          id: uid(), type: 'stage',
          name: s.name || 'STAGE',
          x: s.x ?? 0, y: s.y ?? 0,
          width: s.width ?? 300, height: s.height ?? 100,
          rotation: s.rotation ?? 0
        }))
      } catch (e) {
        console.warn('stageListJson 파싱 실패:', e)
      }
    }

    const gridObjs = await Promise.all((sections || []).map(async sec => {
      const defs = await api.get(`/seat-definitions/admin/sections/${sec.id}/definitions`)
      // 백엔드 응답 필드명 다양성 대응 (rows/totalRow, seatsPerRow/totalCol 등)
      const rows = sec.rows ?? sec.totalRow ?? sec.total_row ?? 5
      const cols = sec.seatsPerRow ?? sec.seats_per_row ?? sec.totalCol ?? sec.total_col ?? 10
      
      // seatDefs 맵을 먼저 생성하여 조회 성능 최적화 (O(N) -> O(1))
      const seatDefsMap = (defs || []).reduce((acc, d) => {
        const r = d.rowNo ?? d.row_no
        const c = d.seatNo ?? d.seat_no
        acc[`${r}_${c}`] = {
          id: d.id, rowNo: r, seatNo: c,
          grade: d.gradeDefault ?? d.grade ?? 'R',
          isVisible: d.isVisible ?? true
        }
        return acc
      }, {})

      const states = Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const d = seatDefsMap[`${r + 1}_${c + 1}`]
          return d?.isVisible === false ? 'inactive' : 'empty'
        })
      )

      // 위치: 백엔드가 xpos/ypos (전체 소문자) 로 반환함 (확인됨)
      const x = sec.xpos ?? sec.xPos ?? sec.x_pos ?? sec.posX ?? sec.pos_x ?? 0
      const y = sec.ypos ?? sec.yPos ?? sec.y_pos ?? sec.posY ?? sec.pos_y ?? 0

      return {
        id: String(sec.id),
        type: 'seatGrid',
        name: sec.name ?? `구역 ${sec.id}`,
        x, y,
        rows, cols,
        grade: defs?.[0]?.gradeDefault ?? defs?.[0]?.grade ?? 'R',
        color: gradeColor(defs?.[0]?.gradeDefault ?? defs?.[0]?.grade ?? 'R'),
        rotation: sec.rotation ?? 0,
        shape: sec.shape ?? 'RECTANGLE',
        rowLabelType: sec.rowLabelType ?? sec.row_label_type ?? 'left',
        states,
        seatDefs: seatDefsMap
      }
    }))

    objects.value = [...stageObjs, ...gridObjs]
    saveState()
    savedStatus.value = '저장됨'
    syncStage()
  } catch (e) {
    console.error('loadLayout error:', e)
  }
}

const handleSave = async () => {
  if (savedStatus.value === '저장됨') {
    if (!confirm('변경된 내용이 없습니다. 그래도 저장하시겠습니까?')) return
  } else {
    if (!confirm('현재 배치도를 저장하시겠습니까?')) return
  }

  saving.value = true
  try {
    const stageObjs = objects.value.filter(o => o.type === 'stage')
    const grids = objects.value.filter(o => o.type === 'seatGrid')

    // 저장 전 화면맞춤(fitToView) → 레이어 재렌더링 대기 → 캡처
    fitToView()
    await new Promise(resolve => setTimeout(resolve, 300))
    const thumbnailDataUrl = captureLayoutDataUrl()

    const payload = {
      // 하위 호환: 첫 번째 stage를 단일 stage 필드로도 전송
      stageX: stageObjs[0]?.x || 0,
      stageY: stageObjs[0]?.y || 0,
      stageWidth: stageObjs[0]?.width || 300,
      stageHeight: stageObjs[0]?.height || 100,
      stageRotation: stageObjs[0]?.rotation || 0,
      // 여러 stage 배열
      stages: stageObjs.map(s => ({
        x: s.x, y: s.y,
        width: s.width, height: s.height,
        rotation: s.rotation || 0,
        name: s.name || 'STAGE'
      })),
      thumbnailUrl: thumbnailDataUrl || undefined,
      sections: grids.map(g => {
        // uid()는 'obj_'로 시작하는 문자열, 로드된 기존 구역은 숫자 문자열('5' 등)
        const parsedId = parseInt(g.id)
        const isExistingSection = !isNaN(parsedId) && String(parsedId) === g.id

        const seatPayload = Object.values(g.seatDefs || {}).map(d => {
          const r = d.rowNo - 1, c = d.seatNo - 1
          const state = g.states?.[r]?.[c]
          return { id: d.id, rowNo: d.rowNo, seatNo: d.seatNo, grade: d.grade, isVisible: state !== 'inactive' }
        })
        const section = {
          id: isExistingSection ? parsedId : null,  // ← 기존: 숫자 ID, 새로운: null
          name: g.name,
          xPos: g.x, yPos: g.y, rotation: g.rotation,
          shape: g.shape,
          totalRow: g.rows, seatsPerRow: g.cols,
          initialGrade: g.grade,
          rowLabelType: g.rowLabelType ?? 'left',
        }

        // 새 구역인 경우: 전체 좌석(rows×cols)을 순회하여 rules 생성
        // seatDefs에 없는 좌석(등급 미편집)도 states로 visible 상태 반영
        if (!isExistingSection) {
          const allRules = []
          for (let r = 0; r < g.rows; r++) {
            for (let c = 0; c < g.cols; c++) {
              const def = g.seatDefs[`${r + 1}_${c + 1}`]
              const state = g.states?.[r]?.[c] ?? 'empty'
              allRules.push({
                rows: String(r + 1),
                cols: String(c + 1),
                grade: def?.grade || g.grade || 'C',
                visible: state !== 'inactive'
              })
            }
          }
          section.rules = allRules
        } else if (isExistingSection) {
          // 기존 구역인 경우: seats 배열로 개별 좌석 업데이트
          section.seats = seatPayload.map(seat => ({
            id: seat.id,
            grade: seat.grade,
            isVisible: seat.isVisible
          }))
        }

        return section
      })
    }

    await api.patch(`/seat-maps/admin/${seatMapId}/layout`, payload)
    await loadLayout()
    // 저장 후 서버 기준으로 다시 로드하여 section id/삭제 상태를 동기화
    savedStatus.value = '저장됨'
    alert('저장되었습니다.')
  } catch (e) {
    console.error(e)
    alert('저장 실패')
  } finally {
    saving.value = false
  }
}

// ── LIFECYCLE ─────────────────────────────────────────────────────────
const onWindowMouseUp = () => {
  if (isPainting.value) {
    isPainting.value = false
    lastPaintedKey.value = null
    pushHistory()
  }
}

let isKeyboardMoving = false
const onWindowKeyDown = (e) => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return

  if (selectedObj.value) {
    const step = e.shiftKey ? 10 : 1
    let moved = false
    if (e.key === 'ArrowUp') { selectedObj.value.y -= step; moved = true }
    else if (e.key === 'ArrowDown') { selectedObj.value.y += step; moved = true }
    else if (e.key === 'ArrowLeft') { selectedObj.value.x -= step; moved = true }
    else if (e.key === 'ArrowRight') { selectedObj.value.x += step; moved = true }

    if (moved) {
      e.preventDefault()
      syncStage()
      isKeyboardMoving = true
    }
  }
}

const onWindowKeyUp = () => {
  if (isKeyboardMoving) {
    pushHistory()
    isKeyboardMoving = false
  }
}

// ── UNSAVED CHANGES PROTECTION ────────────────────────────────────────
const handleBeforeUnload = (e) => {
  if (savedStatus.value !== '저장됨') {
    e.preventDefault()
    e.returnValue = ''
  }
}

onBeforeRouteLeave((to, from, next) => {
  if (savedStatus.value !== '저장됨' && !confirm('저장하지 않은 변경사항이 있습니다. 정말 나가시겠습니까?')) {
    next(false)
  } else {
    next()
  }
})

onMounted(() => {
  window.addEventListener('mouseup', onWindowMouseUp)
  window.addEventListener('keydown', onWindowKeyDown)
  window.addEventListener('keyup', onWindowKeyUp)
  window.addEventListener('beforeunload', handleBeforeUnload)
  document.addEventListener('fullscreenchange', () => {
    isFullScreen.value = !!document.fullscreenElement
  })

  const container = document.getElementById('sfe-konva')
  konvaStage = new Konva.Stage({
    container: 'sfe-konva',
    width: container.offsetWidth,
    height: container.offsetHeight,
    draggable: true
  })

  mainLayer = new Konva.Layer()
  guideLayer = new Konva.Layer()
  konvaStage.add(mainLayer)
  konvaStage.add(guideLayer)

  transformer = new Konva.Transformer({
    anchorSize: 8,
    borderStroke: '#3b82f6',
    anchorStroke: '#3b82f6',
    anchorFill: '#fff',
    rotateEnabled: true,
    keepRatio: false
  })
  mainLayer.add(transformer)

  selectionRect = new Konva.Rect({
    fill: 'rgba(59, 130, 246, 0.15)',
    stroke: '#3b82f6',
    strokeWidth: 1,
    visible: false
  })
  guideLayer.add(selectionRect)

  konvaStage.on('mousedown', handleStageMouseDown)
  konvaStage.on('mousemove', handleStageMouseMove)
  konvaStage.on('mouseup', handleStageMouseUp)
  konvaStage.on('wheel', (e) => {
    e.evt.preventDefault()
    const oldScale = konvaStage.scaleX()
    const pointer = konvaStage.getPointerPosition()
    const mousePointTo = {
      x: (pointer.x - konvaStage.x()) / oldScale,
      y: (pointer.y - konvaStage.y()) / oldScale,
    }
    const newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1
    konvaStage.scale({ x: newScale, y: newScale })
    konvaStage.position({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    })
    stageScale.value = newScale
    mainLayer.batchDraw()
  })

  new ResizeObserver(() => {
    konvaStage.width(container.offsetWidth)
    konvaStage.height(container.offsetHeight)
    syncStage()
  }).observe(container)

  loadLayout()
})

onBeforeUnmount(() => {
  window.removeEventListener('mouseup', onWindowMouseUp)
  window.removeEventListener('keydown', onWindowKeyDown)
  window.removeEventListener('keyup', onWindowKeyUp)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// ── THUMBNAIL / IMAGE CAPTURE ─────────────────────────────────────────
// 모든 객체가 보이도록 뷰를 맞춘 뒤 캡처 → base64 반환
// DB 저장(thumbnailUrl) 및 로컬 다운로드에 공통 사용
const captureLayoutDataUrl = () => {
  if (!konvaStage || !mainLayer || objects.value.length === 0) return null

  // 트랜스포머, 선택 박스 임시 숨김
  const prevNodes = transformer.nodes()
  transformer.nodes([])
  if (selectionRect) selectionRect.visible(false)
  mainLayer.draw()

  // 오브젝트 전체의 스크린 좌표 바운딩박스 계산 → 콘텐츠에 딱 맞게 크롭
  const scale = konvaStage.scaleX()
  const stagePos = konvaStage.position()
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  objects.value.forEach(obj => {
    const w = obj.width || (obj.cols * (SEAT_W + SEAT_GAP))
    const h = obj.height || (obj.rows * (SEAT_H + SEAT_GAP))
    const sx = obj.x * scale + stagePos.x
    const sy = obj.y * scale + stagePos.y
    // 구역 이름 레이블(y: -20)과 행번호 레이블(x: -20) 포함
    minX = Math.min(minX, sx - 20 * scale)
    minY = Math.min(minY, sy - 20 * scale)
    maxX = Math.max(maxX, sx + w * scale)
    maxY = Math.max(maxY, sy + h * scale)
  })

  const PAD = 24
  const cropX = Math.max(0, minX - PAD)
  const cropY = Math.max(0, minY - PAD)
  const cropW = Math.min(konvaStage.width(), maxX + PAD) - cropX
  const cropH = Math.min(konvaStage.height(), maxY + PAD) - cropY

  // 흰색 배경 Rect 임시 삽입 (JPEG는 투명 미지원 → 검정 방지)
  // cropX/Y는 스크린 픽셀 좌표 → Konva 월드 좌표로 변환 필요
  const bgRect = new Konva.Rect({
    x: (cropX - stagePos.x) / scale,
    y: (cropY - stagePos.y) / scale,
    width: cropW / scale,
    height: cropH / scale,
    fill: '#ffffff',
    listening: false,
  })
  mainLayer.add(bgRect)
  bgRect.moveToBottom()
  mainLayer.draw()

  const dataUrl = konvaStage.toDataURL({
    mimeType: 'image/jpeg',
    quality: 0.9,
    pixelRatio: 2,
    x: cropX,
    y: cropY,
    width: cropW,
    height: cropH
  })

  // 배경 Rect 제거 후 복원
  bgRect.destroy()
  transformer.nodes(prevNodes)
  if (selectionRect) selectionRect.visible(false)
  mainLayer.draw()

  return dataUrl
}

// ── DEBOUNCED INPUT HANDLER ───────────────────────────────────────────
let rotationDebounce = null
const onRotationInput = () => {
  if (rotationDebounce) clearTimeout(rotationDebounce)
  rotationDebounce = setTimeout(() => {
    syncStage()
  }, 50)
}

// 로컬 이미지 다운로드 (🖼 이미지 저장 버튼)
const downloadLayoutImage = () => {
  const dataUrl = captureLayoutDataUrl()
  if (!dataUrl) return
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `seatmap_${fileName.value || seatMapId}.jpg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// 줌 동작 후 선명한 렌더링을 위한 지연 처리 (Debounce)
let zoomDebounce = null
const debouncedRenderAll = () => {
  if (zoomDebounce) clearTimeout(zoomDebounce)
  zoomDebounce = setTimeout(() => {
    renderAll()
  }, 200)
}

const zoomIn = () => {
  const s = stageScale.value * 1.2
  konvaStage.scale({ x: s, y: s })
  stageScale.value = s
  mainLayer.batchDraw() // 즉시 반영 (비트맵 스케일링)
  debouncedRenderAll()  // 지연 반영 (고해상도 리렌더링)
}
const zoomOut = () => {
  const s = stageScale.value / 1.2
  konvaStage.scale({ x: s, y: s })
  stageScale.value = s
  mainLayer.batchDraw()
  debouncedRenderAll()
}
const fitToView = () => {
  if (objects.value.length === 0) {
    konvaStage.position({ x: 0, y: 0 })
    konvaStage.scale({ x: 1, y: 1 })
    stageScale.value = 1
    mainLayer.batchDraw()
    return
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  objects.value.forEach(obj => {
    const w = obj.width || (obj.cols * (SEAT_W + SEAT_GAP))
    const h = obj.height || (obj.rows * (SEAT_H + SEAT_GAP))
    minX = Math.min(minX, obj.x)
    minY = Math.min(minY, obj.y)
    maxX = Math.max(maxX, obj.x + w)
    maxY = Math.max(maxY, obj.y + h)
  })

  const PAD = 50
  const contentW = Math.max(maxX - minX, 100)
  const contentH = Math.max(maxY - minY, 100)
  const scale = Math.min(
    (konvaStage.width() - PAD * 2) / contentW,
    (konvaStage.height() - PAD * 2) / contentH
  )
  const finalScale = Math.min(scale, 1.5)

  const centerX = (konvaStage.width() - contentW * finalScale) / 2 - minX * finalScale
  const centerY = (konvaStage.height() - contentH * finalScale) / 2 - minY * finalScale

  konvaStage.scale({ x: finalScale, y: finalScale })
  konvaStage.position({ x: centerX, y: centerY })
  stageScale.value = finalScale
  mainLayer.batchDraw()
  debouncedRenderAll()
}
</script>

<style scoped>
/* ── Layout ── */
/* ── 라이트 테마 ── */
.sfe-root {
  display: flex; flex-direction: column;
  width: 100%; max-width: 100%;
  height: calc(100vh - 64px);
  min-height: 0; min-width: 0;
  overflow: hidden;
  background: #f8fafc; color: #1e293b; font-family: 'Pretendard', sans-serif;
}
.sfe-root:fullscreen {
  height: 100vh;
}
.sfe-topbar {
  height: 56px; min-height: 56px; background: #ffffff; border-bottom: 1px solid #e2e8f0;
  display: flex; align-items: center; padding: 0 16px; flex-shrink: 0; min-width: 0;
}
.sfe-logo-box {
  width: 32px; height: 32px; background: #3b82f6; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
}
.sfe-file-name { font-weight: 600; font-size: 14px; color: #0f172a; }
.sfe-file-meta { font-size: 11px; color: #64748b; }
.sfe-spacer { flex: 1; }
.sfe-div { width: 1px; height: 24px; background: #e2e8f0; margin: 0 8px; }

/* ── Buttons ── */
.sfe-btn {
  display: flex; align-items: center; gap: 6px; padding: 6px 12px;
  border-radius: 6px; font-size: 12px; font-weight: 500; transition: all 0.2s;
}
.sfe-ghost { background: transparent; color: #475569; }
.sfe-ghost:hover { background: #f1f5f9; color: #0f172a; }
.sfe-ghost:disabled { opacity: 0.4; cursor: not-allowed; }
.sfe-active { background: #e0f2fe; color: #0369a1; }
.sfe-primary { background: #3b82f6; color: white; }
.sfe-primary:hover { background: #2563eb; }
.sfe-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.sfe-danger { background: #ef4444; color: white; }
.sfe-danger:hover { background: #dc2626; }

/* ── Main layout ── */
.sfe-main { display: flex; flex: 1; min-height: 0; overflow: hidden; }

/* ── Left panel ── */
.sfe-left-panel {
  width: 100px; flex-shrink: 0; background: #ffffff; border-right: 1px solid #e2e8f0;
  display: flex; flex-direction: column; align-items: center; padding-top: 20px; padding-bottom: 20px;
  overflow-y: auto; min-height: 0;
}
.sfe-tool-group { display: flex; flex-direction: column; gap: 8px; width: 100%; align-items: center; }
.sfe-tool-label { font-size: 11px; color: #64748b; font-weight: 700; margin-bottom: 6px; letter-spacing: 0.08em; }
.sfe-tool-btn {
  width: 82px; height: 82px; border-radius: 12px; color: #64748b;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
  transition: all 0.2s;
}
.sfe-tool-btn span:first-child { font-size: 32px; line-height: 1; }
.sfe-tool-btn span:last-child { font-size: 12px; font-weight: 500; }
.sfe-tool-btn:hover { background: #f1f5f9; color: #0f172a; }
.sfe-tool-btn.active { background: #3b82f6; color: white; box-shadow: 0 0 0 2px #60a5fa66; }

/* ── Canvas ── */
.sfe-canvas-area {
  flex: 1; min-width: 0; min-height: 0; position: relative; background: #f1f5f9;
  background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
  background-size: 20px 20px;
}
.sfe-hud {
  position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
  background: #ffffff; padding: 4px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  display: flex; align-items: center; gap: 8px;
}
.sfe-hud-btn { width: 24px; height: 24px; border-radius: 4px; transition: background-color 0.2s; color: #475569; }
.sfe-hud-btn:hover { background-color: #f1f5f9; color: #0f172a; }
.sfe-hud-val { font-size: 12px; font-variant-numeric: tabular-nums; width: 40px; text-align: center; color: #334155; }

/* ── Right panel ── */
.sfe-right-panel {
  width: 210px; flex-shrink: 0; background: #ffffff; border-left: 1px solid #e2e8f0;
  display: flex; flex-direction: column; overflow-y: auto;
}
.sfe-prop-section { padding: 16px; border-bottom: 1px solid #e2e8f0; }
.sfe-prop-header {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 12px;
}
.sfe-field-group { margin-bottom: 14px; }
.sfe-label { display: block; font-size: 11px; color: #64748b; margin-bottom: 6px; }
.sfe-input, .sfe-select {
  width: 100%; background: #ffffff; border: 1px solid #e2e8f0;
  color: #1e293b; padding: 6px 10px; border-radius: 6px; font-size: 12px;
}
.sfe-input:focus { border-color: #3b82f6; outline: none; }
.sfe-slider { width: 100%; accent-color: #3b82f6; }
.sfe-grade-btn {
  border: 1px solid; background: transparent; padding: 4px; border-radius: 4px;
  font-size: 11px; font-weight: 600; transition: all 0.2s;
}
.sfe-grade-btn:hover { background: #f1f5f9; }
.sfe-grade-mini-btn {
  border: 1px solid; padding: 3px 0; border-radius: 4px;
  font-size: 10px; font-weight: 700; transition: all 0.15s; text-align: center;
  cursor: pointer;
}
.sfe-grade-mini-btn:hover { opacity: 0.85; }
.sfe-divider { height: 1px; background: #e2e8f0; margin: 8px 0 14px; }

/* ── Canvas hint ── */
.sfe-canvas-hint {
  font-size: 11px; color: #64748b; background: #f8fafc;
  border: 1px dashed #cbd5e1; border-radius: 6px;
  padding: 8px 10px; line-height: 1.6;
}
</style>
