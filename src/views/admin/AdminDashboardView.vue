<template>
  <div class="grid gap-6">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">ADMIN 운영 대시보드</div>
        <div class="mt-1 text-sm text-slate-500">플랫폼 자산/보안/차단/감사 로그 요약</div>
      </div>
      <UiBadge tone="soft">ADMIN</UiBadge>
    </div>

    <!-- StatCards -->
    <div class="grid gap-3 sm:grid-cols-4">
      <StatCard label="총 회원수" :value="summaryLoading ? '…' : String(totalUsers)" hint="전체 가입 회원" />
      <StatCard label="활성 공연장" :value="summaryLoading ? '…' : String(activeVenues)" hint="등록된 공연장" />
      <StatCard
        label="주최자 승인 대기"
        :value="summaryLoading ? '…' : String(pendingCount)"
        :hint="pendingCount > 0 ? '처리 필요' : '대기 없음'"
      />
    </div>

    <!-- 회원가입 추이 차트 -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
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
      <div v-if="chartLoading" class="flex items-center justify-center py-16 text-sm text-slate-400">불러오는 중…</div>
      <div v-else class="p-4">
        <svg viewBox="0 0 600 160" class="w-full" style="height:160px">
          <!-- y축 가이드라인 -->
          <g v-for="(tick, i) in chartYTicks" :key="'y'+i">
            <line
              :x1="40" :y1="chartY(tick)"
              :x2="580" :y2="chartY(tick)"
              stroke="#f1f5f9" stroke-width="1"
            />
            <text :x="36" :y="chartY(tick) + 4" text-anchor="end" font-size="9" fill="#94a3b8">{{ tick }}</text>
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
              :x="p.x" :y="155"
              text-anchor="middle"
              font-size="9"
              fill="#94a3b8"
            >{{ p.label }}</text>
          </g>
        </svg>
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
            @click="selectedVenueId = group.venueId"
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
              class="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              @click="$router.push({ path: `/admin/dashboard/seat-maps/${sm.id}`, query: { venueId: selectedVenueId } })"
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
                <!-- 상태 뱃지 -->
                <span
                  class="absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm"
                  :class="sm.status === 'PUBLISHED'
                    ? 'bg-green-500 text-white'
                    : sm.status === 'ARCHIVED'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-600 text-white'"
                >
                  {{ sm.status === 'PUBLISHED' ? '게시' : sm.status === 'ARCHIVED' ? '폐기' : '초안' }}
                </span>
                <!-- 호버 오버레이 -->
                <div class="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition-colors duration-200 group-hover:bg-slate-900/20">
                  <span class="rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 opacity-0 shadow transition-opacity duration-200 group-hover:opacity-100">
                    상세보기
                  </span>
                </div>
              </div>
              <!-- 정보 -->
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
      </template>
    </div>

  </div>
</template>

<script>
import StatCard from '../../components/common/StatCard.vue'
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'AdminDashboardView',
  components: { StatCard, UiCard, UiBadge, UiButton },
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
      api: null
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
      const PAD_L = 40, PAD_R = 20, PAD_T = 10, PAD_B = 30
      const W = 600 - PAD_L - PAD_R
      const H = 160 - PAD_T - PAD_B
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
      const PAD_T = 10, PAD_B = 30
      return 160 - PAD_T - PAD_B + PAD_T
    },
    allSeatMaps() {
      return this.venueGroups.flatMap((g) =>
        g.seatMaps.map((sm) => ({ ...sm, venueId: g.venueId, venueName: g.venueName }))
      )
    },
    selectedGroup() {
      return this.venueGroups.find((g) => g.venueId === this.selectedVenueId) ?? null
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
      const PAD_T = 10, PAD_B = 30, H = 160 - PAD_T - PAD_B
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
