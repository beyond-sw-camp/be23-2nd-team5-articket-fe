<template>
  <div class="grid gap-6">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">ADMIN 운영 대시보드</div>
        <div class="mt-1 text-sm text-slate-500">플랫폼 자산/보안/차단/감사 로그 요약</div>
      </div>
      <UiBadge tone="soft">ADMIN</UiBadge>
    </div>

    <!-- StatCards + 회원가입 추이 차트 (나란히) -->
    <div class="grid gap-3 lg:grid-cols-5 items-stretch">
      <!-- StatCards: 왼쪽 -->
      <div class="lg:col-span-2 flex flex-col gap-2 lg:h-full">
        <StatCard compact fill label="총 회원수" :value="summaryLoading ? '…' : String(totalUsers)" hint="전체 가입 회원" />
        <StatCard compact fill label="활성 공연장" :value="summaryLoading ? '…' : String(activeVenues)" hint="등록된 공연장" />
        <StatCard
          compact fill
          label="주최자 승인 대기"
          :value="summaryLoading ? '…' : String(pendingCount)"
          :hint="pendingCount > 0 ? '처리 필요' : '대기 없음'"
        />
      </div>

      <!-- 회원가입 추이 차트: 오른쪽 -->
      <div class="lg:col-span-3 overflow-hidden rounded-2xl border border-slate-200 bg-white flex flex-col">
        <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 shrink-0">
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold text-slate-700">회원가입 추이</span>
            <div class="flex gap-0.5 rounded-lg bg-slate-100 p-0.5">
              <button
                v-for="opt in chartRoleOptions"
                :key="opt.value"
                class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                :class="chartRole === opt.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                @click="chartRole = opt.value"
              >{{ opt.label }}</button>
            </div>
          </div>
          <div class="flex gap-1">
            <button
              v-for="opt in chartPeriodOptions"
              :key="opt.value"
              class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
              :class="chartPeriod === opt.value
                ? 'bg-red-500 text-white'
                : 'text-slate-500 hover:bg-slate-100'"
              @click="chartPeriod = opt.value"
            >{{ opt.label }}</button>
          </div>
        </div>
        <div v-if="chartLoading" class="flex flex-1 items-center justify-center text-sm text-slate-400">불러오는 중…</div>
        <div v-else class="flex-1 min-h-0 px-2 pt-2 pb-1">
          <svg viewBox="0 0 600 200" class="w-full h-full" style="min-height:170px">
            <!-- y축 가이드라인 -->
            <g v-for="(tick, i) in chartYTicks" :key="'y'+i">
              <line
                :x1="38" :y1="chartY(tick)"
                :x2="592" :y2="chartY(tick)"
                stroke="#f1f5f9" stroke-width="1"
              />
              <text :x="34" :y="chartY(tick) + 4" text-anchor="end" font-size="9" fill="#94a3b8">{{ tick }}</text>
            </g>
            <!-- 막대 -->
            <rect
              v-for="(p, i) in chartPoints"
              :key="'bar'+i"
              :x="p.x - p.barW / 2"
              :y="p.y"
              :width="p.barW"
              :height="chartBottom - p.y"
              :fill="tooltip.i === i ? '#dc2626' : '#ef4444'"
              opacity="0.85"
              rx="2"
              style="cursor:pointer"
              @mouseenter="showTooltip(p, i, $event)"
              @mouseleave="tooltip.visible = false"
            />
            <!-- 툴팁 -->
            <g v-if="tooltip.visible">
              <rect
                :x="tooltip.x - 36"
                :y="tooltip.rectTop"
                width="72"
                height="22"
                rx="4"
                fill="#1e293b"
              />
              <text
                :x="tooltip.x"
                :y="tooltip.rectTop + 15"
                text-anchor="middle"
                font-size="9"
                fill="white"
              >{{ tooltip.label }} · {{ tooltip.count }}명</text>
            </g>
            <!-- x축 날짜 레이블 -->
            <g v-for="(p, i) in chartPoints" :key="'lx'+i">
              <text
                v-if="i % chartLabelStep === 0"
                :x="p.x" :y="195"
                text-anchor="middle"
                font-size="9"
                fill="#94a3b8"
              >{{ p.label }}</text>
            </g>
          </svg>
        </div>
      </div>
    </div>


    <!-- 좌석맵 (탭) -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <!-- 헤더 -->
      <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
        <span class="text-sm font-semibold text-slate-700">공연장 - 좌석맵</span>
        <span v-if="seatMapLoading" class="text-xs text-slate-400">불러오는 중…</span>
        <span v-else class="text-xs text-slate-400">총 {{ allSeatMaps.length }}개</span>
      </div>

      <div v-if="seatMapLoading" class="p-6 text-center text-sm text-slate-400">불러오는 중…</div>
      <div v-else-if="venueGroups.length === 0" class="p-6 text-center text-sm text-slate-400">등록된 공연장이 없습니다.</div>

      <template v-else>
        <!-- 탭 -->
        <div class="flex gap-1 overflow-x-auto border-b border-slate-100 px-4 pt-3 pb-0">
          <button
            v-for="group in venueGroups"
            :key="group.venueId"
            class="shrink-0 rounded-t-lg px-4 py-2 text-xs font-medium transition-colors"
            :class="selectedVenueId === group.venueId
              ? 'border-b-2 border-red-500 text-red-600 bg-white'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'"
            @click="selectedVenueId = group.venueId; selectedSeatMapDetail = null; detailConcerts = []"
          >
            {{ group.venueName }}
            <span class="ml-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-slate-500">{{ group.seatMaps.length }}</span>
          </button>
        </div>

        <!-- 선택된 탭의 좌석맵 그리드 -->
        <div class="p-4">
          <div v-if="selectedGroup && selectedGroup.seatMaps.length === 0" class="py-6 text-center text-sm text-slate-400">
            등록된 좌석맵이 없습니다.
          </div>
          <div v-else class="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <div
              v-for="sm in selectedGroup ? selectedGroup.seatMaps : []"
              :key="sm.id"
              class="group overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              :class="selectedSeatMapDetail && selectedSeatMapDetail.id === sm.id
                ? 'border-red-400 bg-red-50'
                : 'border-slate-200 bg-white'"
              @click="openSeatMapDetail(sm)"
            >
              <!-- 썸네일 -->
              <div class="relative aspect-[5/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                <img
                  v-if="sm.thumbnailUrl"
                  :src="sm.thumbnailUrl"
                  alt="좌석맵"
                  class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div v-else class="flex h-full flex-col items-center justify-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <span
                  class="absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm"
                  :class="sm.status === 'PUBLISHED' ? 'bg-green-500 text-white' : sm.status === 'ARCHIVED' ? 'bg-amber-500 text-white' : 'bg-slate-600 text-white'"
                >{{ sm.status === 'PUBLISHED' ? '게시' : sm.status === 'ARCHIVED' ? '폐기' : '초안' }}</span>
                <div class="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition-colors duration-200 group-hover:bg-slate-900/20">
                  <span class="rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 opacity-0 shadow transition-opacity duration-200 group-hover:opacity-100">
                    {{ selectedSeatMapDetail && selectedSeatMapDetail.id === sm.id ? '닫기' : '선택' }}
                  </span>
                </div>
              </div>
              <div class="p-3">
                <div class="truncate font-semibold text-slate-900 text-sm leading-tight">{{ sm.name || '-' }}</div>
                <div class="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                  <span v-if="sm.size">{{ sm.size.toLocaleString() }}석</span>
                  <span v-if="sm.size && sm.version" class="text-slate-300">·</span>
                  <span v-if="sm.version">v{{ sm.version }}</span>
                  <span v-if="!sm.size && !sm.version">정보 없음</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── 인라인 상세 패널 ── -->
        <div v-if="selectedSeatMapDetail" class="border-t border-slate-200 bg-white">
          <!-- 패널 헤더 -->
          <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-slate-900 text-sm">{{ selectedSeatMapDetail.name || '좌석맵' }}</span>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="selectedSeatMapDetail.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : selectedSeatMapDetail.status === 'ARCHIVED' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'"
              >{{ selectedSeatMapDetail.status === 'PUBLISHED' ? '게시' : selectedSeatMapDetail.status === 'ARCHIVED' ? '폐기' : '초안' }}</span>
              <span v-if="selectedSeatMapDetail.version" class="text-xs text-slate-400">v{{ selectedSeatMapDetail.version }}</span>
            </div>
            <button class="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors text-sm" @click="selectedSeatMapDetail = null; detailConcerts = []; detailSchedules = []">✕</button>
          </div>

          <!-- 로딩 -->
          <div v-if="detailSeatMapLoading" class="p-8 text-center text-sm text-slate-400">불러오는 중…</div>

          <!-- 본문 -->
          <div v-else class="p-4 grid gap-4 lg:grid-cols-3">

            <!-- 왼쪽: 배치도 미리보기 + 상태 변경 -->
            <div class="lg:col-span-1 flex flex-col gap-3">
              <!-- 배치도 미리보기 -->
              <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-1.5">
                  <span class="text-xs font-semibold text-slate-600">배치도 미리보기</span>
                  <div class="flex items-center gap-0.5">
                    <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-200 text-xs" @click="detailImgScale = Math.max(detailImgScale / 1.25, 0.25)">−</button>
                    <span class="min-w-10 text-center text-xs text-slate-500">{{ Math.round(detailImgScale * 100) }}%</span>
                    <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-200 text-xs" @click="detailImgScale = Math.min(detailImgScale * 1.25, 3)">+</button>
                    <button type="button" class="rounded p-1 text-xs text-slate-500 hover:bg-slate-200" @click="resetDetailImgView">↺</button>
                  </div>
                </div>
                <div
                  v-if="selectedSeatMapDetail.thumbnailUrl"
                  class="relative bg-white overflow-hidden"
                  :class="detailImgDragging ? 'cursor-grabbing' : 'cursor-grab'"
                  style="height: 200px"
                  @wheel.prevent="onDetailImgWheel"
                  @mousedown.prevent="onDetailImgMouseDown"
                  @mousemove="onDetailImgMouseMove"
                  @mouseup="onDetailImgMouseUp"
                  @mouseleave="onDetailImgMouseUp"
                >
                  <img
                    :src="selectedSeatMapDetail.thumbnailUrl"
                    alt="배치도"
                    draggable="false"
                    class="absolute left-0 top-0 w-full h-full object-contain select-none pointer-events-none"
                    :style="{
                      transformOrigin: '0 0',
                      transform: `translate(${detailImgOffsetX}px, ${detailImgOffsetY}px) scale(${detailImgScale})`
                    }"
                  />
                </div>
                <div v-else class="flex flex-col items-center justify-center py-10 bg-slate-50">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-slate-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span class="text-xs text-slate-400">저장된 배치도가 없습니다</span>
                </div>
              </div>

              <!-- 좌석수 -->
              <div v-if="selectedSeatMapDetail.size" class="text-xs text-slate-500">총 {{ selectedSeatMapDetail.size.toLocaleString() }}석</div>

            </div>

            <!-- 오른쪽: 공연 목록 + 캘린더 -->
            <div class="lg:col-span-2 grid gap-4 lg:grid-cols-5">
              <!-- 공연 목록 -->
              <div class="lg:col-span-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
                  <span class="text-xs font-semibold text-slate-700">이 좌석맵의 공연</span>
                  <span v-if="detailConcertsLoading" class="text-xs text-slate-400">불러오는 중…</span>
                  <span v-else class="text-xs text-slate-400">{{ detailConcerts.length }}건</span>
                </div>
                <div v-if="detailConcertsLoading" class="p-4 text-center text-xs text-slate-400">불러오는 중…</div>
                <div v-else-if="detailConcerts.length === 0" class="p-4 text-center text-xs text-slate-400">등록된 공연이 없습니다.</div>
                <table v-else class="w-full text-sm">
                  <thead class="border-b border-slate-100">
                    <tr>
                      <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">공연명</th>
                      <th class="px-3 py-2 text-center text-xs font-semibold text-slate-500">상태</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">기간</th>
                      <th class="px-3 py-2 text-center text-xs font-semibold text-slate-500">잔여석</th>
                      <th class="px-3 py-2 text-center text-xs font-semibold text-slate-500">일정</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="c in detailConcerts"
                      :key="c.id"
                      class="border-b border-slate-100 last:border-0 transition-colors"
                      :class="detailSelectedConcertId === c.id ? 'bg-red-50' : 'hover:bg-slate-50'"
                    >
                      <td class="px-3 py-2">
                        <div class="font-medium text-slate-900 text-xs">{{ c.title || '-' }}</div>
                        <div class="text-xs text-slate-400">ID {{ c.id }}</div>
                      </td>
                      <td class="px-3 py-2 text-center">
                        <span
                          class="rounded-full px-2 py-0.5 text-xs font-semibold"
                          :class="c.status === 'AVAILABLE' ? 'bg-red-100 text-red-700' : c.status === 'UPCOMING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'"
                        >{{ { DRAFT: '초안', UPCOMING: '게시', AVAILABLE: '예매중', CLOSED: '마감' }[c.status] ?? c.status }}</span>
                      </td>
                      <td class="px-3 py-2 text-xs text-slate-600">
                        <template v-if="concertDateRange(c)">
                          <div>{{ concertDateRange(c).start }}</div>
                          <div class="text-slate-400">~ {{ concertDateRange(c).end }}</div>
                        </template>
                        <span v-else class="text-slate-400">-</span>
                      </td>
                      <td class="px-3 py-2 text-center">
                        <span class="text-xs font-semibold" :class="concertRemainingSeats(c) === 0 ? 'text-red-500' : 'text-emerald-600'">
                          {{ concertRemainingSeats(c) }}석
                        </span>
                      </td>
                      <td class="px-3 py-2 text-center">
                        <button
                          class="h-6 rounded-lg border px-2 text-xs font-medium transition-colors"
                          :class="detailSelectedConcertId === c.id
                            ? 'border-red-500 bg-red-500 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
                          @click="selectDetailConcert(c)"
                        >{{ detailSelectedConcertId === c.id ? '선택됨' : '일정 보기' }}</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 캘린더 -->
              <div class="lg:col-span-2">
                <div class="rounded-xl border border-slate-200 bg-white p-3">
                  <div class="mb-2 border-b border-slate-100 pb-2">
                    <div class="text-xs font-semibold text-slate-700">공연 일정</div>
                    <div class="mt-0.5 text-xs text-slate-400">
                      <template v-if="detailSelectedConcertId">「{{ detailSelectedConcertTitle }}」</template>
                      <template v-else>전체 공연 일정</template>
                    </div>
                  </div>
                  <ConcertCalendar
                    :available-dates="detailAvailableDates"
                    :schedules-by-date="detailSchedulesByDate"
                    :admin-mode="true"
                    @select-schedule="() => {}"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

  </div>
</template>

<script>
import StatCard from '../../components/common/StatCard.vue'
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import ConcertCalendar from '../../components/concert/ConcertCalendar.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'AdminDashboardView',
  components: { StatCard, UiCard, UiBadge, UiButton, ConcertCalendar },
  data() {
    return {
      venueGroups: [],
      selectedVenueId: null,
      seatMapLoading: false,
      summaryLoading: false,
      totalUsers: 0,
      activeVenues: 0,
      pendingCount: 0,
      blocklistCount: 0,
      pendingItems: [],
      pendingLoading: false,
      chartLoading: false,
      chartRawUsers: [],
      chartPeriod: 30,
      chartRole: 'ALL',
      chartRoleOptions: [
        { label: '전체', value: 'ALL' },
        { label: 'USER', value: 'USER' },
        { label: 'ORGANIZER', value: 'ORGANIZER' }
      ],
      tooltip: { visible: false, x: 0, y: 0, label: '', count: 0, i: -1 },
      chartPeriodOptions: [
        { label: '1달', value: 30 },
        { label: '6개월', value: 180 },
        { label: '1년', value: 365 }
      ],
      api: null,
      // 인라인 상세 패널
      selectedSeatMapDetail: null,
      detailSeatMapLoading: false,
      detailImgScale: 1,
      detailImgOffsetX: 0,
      detailImgOffsetY: 0,
      detailImgDragging: false,
      detailImgDragStart: { x: 0, y: 0 },
      detailImgDragStartOffset: { x: 0, y: 0 },
      detailConcerts: [],
      detailConcertsLoading: false,
      detailSelectedConcertId: null,
      detailSelectedConcertTitle: '',
      detailSchedules: [],
      detailStatusUpdating: false
    }
  },
  computed: {
    chartDays() {
      const days = []
      const today = new Date()
      for (let i = this.chartPeriod - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
      }
      return days
    },
    chartLabelStep() {
      if (this.chartPeriod <= 30) return 7
      if (this.chartPeriod <= 180) return 30
      return 60
    },
    chartCounts() {
      const map = {}
      for (const u of this.chartRawUsers) {
        if (this.chartRole !== 'ALL' && u.role !== this.chartRole) continue
        const raw = u.createdTime ?? u.createdAt ?? u.joinedAt ?? ''
        if (!raw) continue
        const key = String(raw).slice(0, 10)
        map[key] = (map[key] || 0) + 1
      }
      return this.chartDays.map((d) => map[d] || 0)
    },
    chartMaxY() {
      return Math.max(1, ...this.chartCounts)
    },
    chartYTicks() {
      const max = this.chartMaxY
      if (max <= 4) return [0, 1, 2, max]
      const step = Math.ceil(max / 4)
      return [0, step, step * 2, step * 3, step * 4].filter(v => v <= max + step)
    },
    chartPoints() {
      const PAD_L = 38, PAD_R = 8, PAD_T = 8, PAD_B = 28
      const W = 600 - PAD_L - PAD_R
      const H = 200 - PAD_T - PAD_B
      const n = this.chartDays.length
      const barW = Math.max(1, (W / n) * 0.7)
      return this.chartCounts.map((count, i) => ({
        x: PAD_L + (i + 0.5) * (W / n),
        y: PAD_T + H - (count / this.chartMaxY) * H,
        barW,
        label: this.chartPeriod <= 30 ? this.chartDays[i].slice(5) : this.chartDays[i].slice(0, 7)
      }))
    },
    chartBottom() {
      return 200 - 28
    },
    allSeatMaps() {
      return this.venueGroups.flatMap((g) =>
        g.seatMaps.map((sm) => ({ ...sm, venueId: g.venueId, venueName: g.venueName }))
      )
    },
    selectedGroup() {
      return this.venueGroups.find((g) => g.venueId === this.selectedVenueId) ?? null
    },
    detailAvailableDates() {
      const set = new Set()
      for (const s of this.detailSchedules) {
        const raw = s.play_time ?? s.playTime ?? s.startAt ?? s.date ?? ''
        if (!raw) continue
        const d = new Date(raw)
        if (isNaN(d)) continue
        set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
      }
      return [...set].sort()
    },
    detailSchedulesByDate() {
      const map = {}
      for (const s of this.detailSchedules) {
        const raw = s.play_time ?? s.playTime ?? s.startAt ?? s.date ?? ''
        if (!raw) continue
        const d = new Date(raw)
        if (isNaN(d)) continue
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        if (!map[key]) map[key] = []
        map[key].push({
          scheduleId: s.id,
          playTime: raw.length > 10 ? raw.slice(11, 16) : '',
          status: s.status
        })
      }
      for (const k of Object.keys(map)) {
        map[k].sort((a, b) => a.playTime.localeCompare(b.playTime))
      }
      return map
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.loadSeatMaps()
    this.loadSummary()
    this.loadPendingOrganizers()
    this.loadUserChart()
  },
  watch: {
    chartPeriod() {
      this.loadUserChart()
    }
  },
  methods: {
    async loadSummary() {
      this.summaryLoading = true
      try {
        const [usersRes, venuesRes, pendingRes] = await Promise.allSettled([
          this.api.get(ENDPOINTS.adminUsers({ page: 0, size: 1 })),
          this.api.get(ENDPOINTS.adminVenueList({ page: 0, size: 100 })),
          this.api.get(ENDPOINTS.adminPendingOrganizers({ page: 0, size: 1 }))
        ])

        if (usersRes.status === 'fulfilled') {
          this.totalUsers = usersRes.value?.totalElements ?? usersRes.value?.total ?? 0
        }
        if (venuesRes.status === 'fulfilled') {
          const venues = venuesRes.value?.content ?? venuesRes.value?.items ?? (Array.isArray(venuesRes.value) ? venuesRes.value : [])
          this.activeVenues = venues.length
        }
        if (pendingRes.status === 'fulfilled') {
          this.pendingCount = pendingRes.value?.totalElements ?? pendingRes.value?.total ?? 0
        }
      } finally {
        this.summaryLoading = false
      }
    },

    async loadPendingOrganizers() {
      this.pendingLoading = true
      try {
        const res = await this.api.get(ENDPOINTS.adminPendingOrganizers({ page: 0, size: 5 }))
        const raw = res?.content ?? res?.data ?? []
        this.pendingItems = Array.isArray(raw)
          ? raw.map((r) => ({ ...r, _approving: false, _rejecting: false }))
          : []
        this.pendingCount = res?.totalElements ?? res?.total ?? this.pendingItems.length
      } catch {
        this.pendingItems = []
      } finally {
        this.pendingLoading = false
      }
    },

    async approveOrganizer(item) {
      item._approving = true
      try {
        await this.api.post(ENDPOINTS.adminApproveOrganizer(item.id), {})
        await this.loadPendingOrganizers()
        await this.loadSummary()
      } finally {
        item._approving = false
      }
    },

    async rejectOrganizer(item) {
      if (!window.confirm(`"${item.name ?? item.email}" 주최자 신청을 거절할까요?`)) return
      item._rejecting = true
      try {
        await this.api.post(ENDPOINTS.adminRejectOrganizer(item.id), {})
        await this.loadPendingOrganizers()
        await this.loadSummary()
      } finally {
        item._rejecting = false
      }
    },

    showTooltip(p, i) {
      const tx = Math.min(Math.max(p.x, 44), 556)
      const rectTop = Math.max(p.y - 28, 2)
      this.tooltip = { visible: true, x: tx, rectTop, label: p.label, count: this.chartCounts[i], i }
    },

    chartY(value) {
      const PAD_T = 8, PAD_B = 28, H = 200 - PAD_T - PAD_B
      return PAD_T + H - (value / this.chartMaxY) * H
    },

    async loadUserChart() {
      this.chartLoading = true
      const size = this.chartPeriod <= 30 ? 200 : this.chartPeriod <= 180 ? 1000 : 2000
      try {
        const res = await this.api.get(ENDPOINTS.adminUsers({ page: 0, size }))
        this.chartRawUsers = res?.content ?? res?.items ?? (Array.isArray(res) ? res : [])
      } catch {
        this.chartRawUsers = []
      } finally {
        this.chartLoading = false
      }
    },

    // ── 인라인 상세 패널 ──────────────────────────────────────
    openSeatMapDetail(sm) {
      if (this.selectedSeatMapDetail?.id === sm.id) {
        this.selectedSeatMapDetail = null
        this.detailConcerts = []
        this.detailSchedules = []
        return
      }
      this.selectedSeatMapDetail = { ...sm, venueId: this.selectedVenueId }
      this.resetDetailImgView()
      this.detailSelectedConcertId = null
      this.detailSelectedConcertTitle = ''
      this.detailSchedules = []
      this.loadDetailConcerts(sm.id, this.selectedVenueId)
    },

    async loadDetailConcerts(seatMapId, venueId) {
      this.detailConcertsLoading = true
      this.detailConcerts = []
      try {
        const res = await this.api.get(ENDPOINTS.adminVenueConcerts(venueId))
        const allConcerts = res?.content ?? res?.items ?? (Array.isArray(res) ? res : [])

        // 각 공연의 회차 목록 병렬 조회
        const scheduleResults = await Promise.allSettled(
          allConcerts.map(c => this.api.get(ENDPOINTS.concertSchedules(c.id)))
        )
        const concertScheduleMap = allConcerts.map((concert, i) => {
          const r = scheduleResults[i]
          const schedules = r.status === 'fulfilled'
            ? (r.value?.content ?? r.value?.items ?? (Array.isArray(r.value) ? r.value : []))
            : []
          return { concert, schedules }
        })

        // 회차별 좌석맵 병렬 조회
        const allSchedules = concertScheduleMap.flatMap(({ schedules }) => schedules)
        const seatMapResults = await Promise.allSettled(
          allSchedules.map(s => this.api.get(ENDPOINTS.seatMap(s.id)))
        )
        const seatMapById = {}
        allSchedules.forEach((s, i) => {
          const r = seatMapResults[i]
          if (r.status === 'fulfilled') seatMapById[s.id] = String(r.value?.seatMapId ?? '')
        })

        // 이 좌석맵을 쓰는 공연만 필터 (matching schedules 포함)
        const filtered = []
        for (const { concert, schedules } of concertScheduleMap) {
          const matching = schedules.filter(s => seatMapById[s.id] === String(seatMapId))
          if (matching.length > 0) {
            filtered.push({ ...concert, _schedules: matching })
          }
        }
        this.detailConcerts = filtered
        // 좌석맵의 전체 공연 일정 바로 표시
        this.detailSchedules = filtered.flatMap(c => c._schedules ?? [])
      } catch {
        this.detailConcerts = []
      } finally {
        this.detailConcertsLoading = false
      }
    },

    selectDetailConcert(concert) {
      if (this.detailSelectedConcertId === concert.id) {
        // 선택 해제 → 전체 일정으로 복원
        this.detailSelectedConcertId = null
        this.detailSelectedConcertTitle = ''
        this.detailSchedules = this.detailConcerts.flatMap(c => c._schedules ?? [])
        return
      }
      this.detailSelectedConcertId = concert.id
      this.detailSelectedConcertTitle = concert.title || ''
      this.detailSchedules = concert._schedules ?? []
    },

    concertDateRange(concert) {
      const schedules = concert._schedules ?? []
      if (schedules.length === 0) return null
      const times = schedules
        .map(s => new Date(s.playTime ?? s.play_time))
        .filter(d => !isNaN(d))
        .sort((a, b) => a - b)
      if (times.length === 0) return null
      const fmt = d => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
      return { start: fmt(times[0]), end: fmt(times[times.length - 1]) }
    },

    concertRemainingSeats(concert) {
      const schedules = concert._schedules ?? []
      return schedules.reduce((total, s) => {
        const avail = s.availabilityByGrade ?? {}
        return total + Object.values(avail).reduce((sum, v) => sum + (v ?? 0), 0)
      }, 0)
    },

    async updateDetailStatus(status) {
      if (!this.selectedSeatMapDetail || this.selectedSeatMapDetail.status === status) return
      this.detailStatusUpdating = true
      try {
        await this.api.patch(ENDPOINTS.adminUpdateSeatMapStatus(this.selectedSeatMapDetail.id, status))
        // 카드와 패널 상태 동기화
        this.selectedSeatMapDetail = { ...this.selectedSeatMapDetail, status }
        // venueGroups 내 카드도 업데이트
        for (const group of this.venueGroups) {
          const sm = group.seatMaps.find(s => s.id === this.selectedSeatMapDetail.id)
          if (sm) { sm.status = status; break }
        }
      } catch {
        // 에러는 ErrorAlertModal에서 표시
      } finally {
        this.detailStatusUpdating = false
      }
    },

    // 썸네일 줌/드래그
    onDetailImgWheel(e) {
      const delta = e.deltaY < 0 ? 1.25 : 1 / 1.25
      const rect = e.currentTarget.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const newScale = Math.min(Math.max(this.detailImgScale * delta, 0.25), 3)
      const actualDelta = newScale / this.detailImgScale
      this.detailImgOffsetX = mx - (mx - this.detailImgOffsetX) * actualDelta
      this.detailImgOffsetY = my - (my - this.detailImgOffsetY) * actualDelta
      this.detailImgScale = newScale
    },
    onDetailImgMouseDown(e) {
      this.detailImgDragging = true
      this.detailImgDragStart = { x: e.clientX, y: e.clientY }
      this.detailImgDragStartOffset = { x: this.detailImgOffsetX, y: this.detailImgOffsetY }
    },
    onDetailImgMouseMove(e) {
      if (!this.detailImgDragging) return
      this.detailImgOffsetX = this.detailImgDragStartOffset.x + (e.clientX - this.detailImgDragStart.x)
      this.detailImgOffsetY = this.detailImgDragStartOffset.y + (e.clientY - this.detailImgDragStart.y)
    },
    onDetailImgMouseUp() {
      this.detailImgDragging = false
    },
    resetDetailImgView() {
      this.detailImgScale = 1
      this.detailImgOffsetX = 0
      this.detailImgOffsetY = 0
    },

    async loadSeatMaps() {
      this.seatMapLoading = true
      try {
        const venuesRes = await this.api.get(ENDPOINTS.adminVenueList({ page: 0, size: 100 }))
        const venues = venuesRes?.content ?? venuesRes?.items ?? (Array.isArray(venuesRes) ? venuesRes : [])

        const results = await Promise.allSettled(
          venues.map((v) =>
            this.api.get(ENDPOINTS.adminVenueSeatMapsList(v.id, { page: 0, size: 50 }))
              .then((res) => {
                const list = res?.content ?? res?.items ?? (Array.isArray(res) ? res : [])
                return {
                  venueId: v.id,
                  venueName: v.name,
                  seatMaps: list.map((sm) => ({
                    id: sm.id,
                    name: sm.name || '',
                    status: sm.status ?? sm.seatMapStatus ?? 'DRAFT',
                    thumbnailUrl: sm.thumbnailUrl ?? sm.thumbnail_url ?? null,
                    size: sm.totalSeats ?? null,
                    version: sm.version ?? null
                  }))
                }
              })
          )
        )

        this.venueGroups = results
          .filter((r) => r.status === 'fulfilled')
          .map((r) => r.value)
        if (this.venueGroups.length > 0 && this.selectedVenueId === null) {
          this.selectedVenueId = this.venueGroups[0].venueId
        }
      } catch (e) {
        this.venueGroups = []
      } finally {
        this.seatMapLoading = false
      }
    }
  }
}
</script>
