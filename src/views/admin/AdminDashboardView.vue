<template>
  <div class="grid gap-5">

    <!-- ── 헤더 ── -->
    <div class="flex items-end justify-between">
      <div>
        <div class="mgmt-page-title">ADMIN 운영 대시보드</div>
        <div class="mgmt-page-subtitle">{{ currentDateDisplay }}</div>
      </div>
      <UiBadge tone="soft">ADMIN</UiBadge>
    </div>

    <!-- ── KPI 5종 ── -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <div class="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p class="text-xs font-medium text-slate-500">총 가입 회원</p>
        <p class="mt-1.5 text-2xl font-bold text-slate-900">{{ summaryLoading ? '…' : totalUsers.toLocaleString() }}</p>
        <p class="mt-1 text-xs text-slate-400">누적</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p class="text-xs font-medium text-slate-500">오늘 신규 회원</p>
        <p class="mt-1.5 text-2xl font-bold text-slate-900">{{ chartLoading ? '…' : todayNewUsers }}</p>
        <p class="mt-1 text-xs text-slate-400">오늘 가입</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p class="text-xs font-medium text-slate-500">활성 공연</p>
        <p class="mt-1.5 text-2xl font-bold text-slate-900">{{ summaryLoading ? '…' : activeConcertCount }}</p>
        <p class="mt-1 text-xs text-slate-400">예매 가능</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p class="text-xs font-medium text-slate-500">활성 공연장</p>
        <p class="mt-1.5 text-2xl font-bold text-slate-900">{{ summaryLoading ? '…' : activeVenues }}</p>
        <p class="mt-1 text-xs text-slate-400">운영 중</p>
      </div>
      <div
        class="cursor-pointer rounded-2xl border bg-white px-5 py-4 shadow-sm transition-colors hover:bg-slate-50"
        :class="pendingCount > 0 ? 'border-red-300' : 'border-slate-200'"
        @click="$router.push('/admin/pending-organizers')"
      >
        <p class="text-xs font-medium text-slate-500">주최자 승인 대기</p>
        <p class="mt-1.5 text-2xl font-bold" :class="pendingCount > 0 ? 'text-red-600' : 'text-slate-900'">
          {{ summaryLoading ? '…' : pendingCount }}
        </p>
        <p v-if="pendingCount > 0" class="mt-1 text-xs font-semibold text-red-500">처리 필요 →</p>
        <p v-else class="mt-1 text-xs text-slate-400">대기 없음</p>
      </div>
    </div>

    <!-- ── 회원가입 추이 + 승인 대기 미리보기 ── -->
    <div class="grid gap-5 lg:grid-cols-3">

      <!-- 회원가입 추이 차트 -->
      <div class="lg:col-span-2 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-3">
              <span class="mgmt-section-title">회원가입 추이</span>
              <div class="flex gap-0.5 rounded-lg bg-slate-100 p-0.5">
                <button
                  v-for="opt in chartRoleOptions" :key="opt.value"
                  class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                  :class="chartRole === opt.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                  @click="chartRole = opt.value"
                >{{ opt.label }}</button>
              </div>
            </div>
          </div>
          <div class="flex gap-1">
            <button
              v-for="opt in chartPeriodOptions" :key="opt.value"
              class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
              :class="chartPeriod === opt.value ? 'bg-red-500 text-white' : 'text-slate-500 hover:bg-slate-100'"
              @click="chartPeriod = opt.value"
            >{{ opt.label }}</button>
          </div>
        </div>
        <div v-if="chartLoading" class="flex flex-1 items-center justify-center text-sm text-slate-500">불러오는 중…</div>
        <div v-else class="min-h-0 flex-1 px-4 pt-3 pb-2">
          <svg viewBox="0 0 600 200" class="h-full w-full" style="min-height:170px">
            <g v-for="(tick, i) in chartYTicks" :key="'y'+i">
              <line :x1="38" :y1="chartY(tick)" :x2="592" :y2="chartY(tick)" stroke="#e2e8f0" stroke-width="1" />
              <text :x="34" :y="chartY(tick) + 4" text-anchor="end" font-size="10" fill="#64748b">{{ tick }}</text>
            </g>
            <rect
              v-for="(p, i) in chartPoints" :key="'bar'+i"
              :x="p.x - p.barW / 2" :y="p.y"
              :width="p.barW" :height="chartBottom - p.y"
              :fill="tooltip.i === i ? '#dc2626' : '#ef4444'"
              opacity="0.9" rx="2" style="cursor:pointer"
              @mouseenter="showTooltip(p, i, $event)"
              @mouseleave="tooltip.visible = false"
            />
            <g v-if="tooltip.visible">
              <rect :x="tooltip.x - 36" :y="tooltip.rectTop" width="72" height="22" rx="4" fill="#1e293b" />
              <text :x="tooltip.x" :y="tooltip.rectTop + 15" text-anchor="middle" font-size="10" fill="white">{{ tooltip.label }} · {{ tooltip.count }}명</text>
            </g>
            <g v-for="(p, i) in chartPoints" :key="'lx'+i">
              <text v-if="i % chartLabelStep === 0" :x="p.x" :y="195" text-anchor="middle" font-size="10" fill="#64748b">{{ p.label }}</text>
            </g>
          </svg>
        </div>
      </div>

      <!-- 주최자 승인 대기 미리보기 -->
      <div class="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
          <div class="flex items-center gap-2">
            <span class="mgmt-section-title">승인 대기</span>
            <span v-if="pendingCount > 0"
              class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
              {{ pendingCount }}
            </span>
          </div>
          <button
            class="text-xs font-medium text-slate-400 transition-colors hover:text-slate-700"
            @click="$router.push('/admin/pending-organizers')"
          >전체 보기 →</button>
        </div>

        <div v-if="summaryLoading" class="flex flex-1 items-center justify-center py-10 text-sm text-slate-400">
          불러오는 중…
        </div>
        <div v-else-if="pendingItems.length === 0"
          class="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-xs text-slate-400">대기 중인 신청이 없습니다</p>
        </div>
        <div v-else class="flex flex-col divide-y divide-slate-50">
          <div
            v-for="item in pendingItems" :key="item.id"
            class="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-slate-800">
                {{ item.name || item.username || item.email || '-' }}
              </p>
              <p class="truncate text-[11px] text-slate-400">{{ item.email || '' }}</p>
              <p class="mt-0.5 text-[10px] text-slate-300">{{ formatRelativeTime(item.requestedAt || item.createdAt) }}</p>
            </div>
            <div class="flex shrink-0 flex-col gap-1">
              <button
                class="rounded-lg bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600 transition-colors hover:bg-emerald-100 disabled:opacity-40"
                :disabled="!!item._loading"
                @click="approveOrganizer(item)"
              >{{ item._loading === 'approve' ? '…' : '승인' }}</button>
              <button
                class="rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-slate-200 disabled:opacity-40"
                :disabled="!!item._loading"
                @click="rejectOrganizer(item)"
              >{{ item._loading === 'reject' ? '…' : '거절' }}</button>
            </div>
          </div>
          <div v-if="pendingCount > pendingItems.length"
            class="px-4 py-2.5 text-center text-[11px] text-slate-400">
            외 {{ pendingCount - pendingItems.length }}건 더 있음
          </div>
        </div>
      </div>
    </div>

    <!-- ── 빠른 이동 카드 2종 ── -->
    <div class="grid gap-4 sm:grid-cols-2">

      <!-- 공연장 인사이트 -->
      <div
        class="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-colors hover:bg-slate-50"
        @click="$router.push('/admin/venue-insights')"
      >
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <p class="mgmt-section-title">공연장 · 좌석맵 인사이트</p>
            <p class="mgmt-section-subtitle">
              {{ summaryLoading ? '…' : activeVenues }}개 공연장 · 월별 점유율 및 공연 일정 분석
            </p>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-1.5">
          <span class="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600">인사이트</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>

      <!-- 프로모션 배너 -->
      <div
        class="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-colors hover:bg-slate-50"
        @click="$router.push('/admin/promotions')"
      >
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div>
            <p class="mgmt-section-title">프로모션 배너 관리</p>
            <p class="mgmt-section-subtitle">
              {{ summaryLoading ? '…' : `${promotionCount}개 배너 등록됨 · 홈 히어로 배너 관리` }}
            </p>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-1.5">
          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">관리</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import UiBadge from '../../components/common/UiBadge.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'AdminDashboardView',
  components: { UiBadge },
  data() {
    return {
      summaryLoading: false,
      totalUsers: 0,
      activeVenues: 0,
      activeConcertCount: 0,
      promotionCount: 0,
      pendingCount: 0,
      pendingItems: [],
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
    currentDateDisplay() {
      const now = new Date()
      const days = ['일', '월', '화', '수', '목', '금', '토']
      return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`
    },
    todayNewUsers() {
      const today = new Date()
      const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      return this.chartRawUsers.filter(u => {
        const raw = u.createdTime ?? u.createdAt ?? u.joinedAt ?? ''
        return String(raw).slice(0, 10) === key
      }).length
    },
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
    chartMaxY() { return Math.max(1, ...this.chartCounts) },
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
    chartBottom() { return 200 - 28 },
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.loadSummary()
    this.loadUserChart()
  },
  watch: {
    chartPeriod() { this.loadUserChart() }
  },
  methods: {
    async loadSummary() {
      this.summaryLoading = true
      try {
        const [usersRes, venuesRes, pendingRes, concertsRes, promotionsRes, pendingItemsRes] = await Promise.allSettled([
          this.api.get(ENDPOINTS.adminUsers({ page: 0, size: 1 })),
          this.api.get(ENDPOINTS.adminVenueList({ page: 0, size: 100 })),
          this.api.get(ENDPOINTS.adminPendingOrganizers({ page: 0, size: 1 })),
          this.api.get(ENDPOINTS.searchConcerts({ status: 'AVAILABLE', page: 0, size: 1 })),
          this.api.get(ENDPOINTS.promotions({ page: 0, size: 1 })),
          this.api.get(ENDPOINTS.adminPendingOrganizers({ page: 0, size: 5 })),
        ])
        if (usersRes.status === 'fulfilled')
          this.totalUsers = usersRes.value?.totalElements ?? usersRes.value?.total ?? 0
        if (venuesRes.status === 'fulfilled') {
          const venues = venuesRes.value?.content ?? venuesRes.value?.items ?? (Array.isArray(venuesRes.value) ? venuesRes.value : [])
          this.activeVenues = venues.length
        }
        if (pendingRes.status === 'fulfilled')
          this.pendingCount = pendingRes.value?.totalElements ?? pendingRes.value?.total ?? 0
        if (concertsRes.status === 'fulfilled')
          this.activeConcertCount = concertsRes.value?.totalElements ?? concertsRes.value?.total ?? 0
        if (promotionsRes.status === 'fulfilled')
          this.promotionCount = promotionsRes.value?.totalElements ?? promotionsRes.value?.total ?? 0
        if (pendingItemsRes.status === 'fulfilled') {
          const raw = pendingItemsRes.value?.content ?? pendingItemsRes.value?.data ?? (Array.isArray(pendingItemsRes.value) ? pendingItemsRes.value : [])
          this.pendingItems = Array.isArray(raw) ? raw.map(r => ({ ...r, _loading: null })) : []
        }
      } finally {
        this.summaryLoading = false
      }
    },

    async approveOrganizer(item) {
      item._loading = 'approve'
      try {
        await this.api.post(ENDPOINTS.adminApproveOrganizer(item.id), {})
        this.pendingItems = this.pendingItems.filter(i => i.id !== item.id)
        this.pendingCount = Math.max(0, this.pendingCount - 1)
      } finally {
        item._loading = null
      }
    },

    async rejectOrganizer(item) {
      if (!window.confirm(`"${item.name ?? item.email}" 주최자 신청을 거절할까요?`)) return
      item._loading = 'reject'
      try {
        await this.api.post(ENDPOINTS.adminRejectOrganizer(item.id), {})
        this.pendingItems = this.pendingItems.filter(i => i.id !== item.id)
        this.pendingCount = Math.max(0, this.pendingCount - 1)
      } finally {
        item._loading = null
      }
    },

    formatRelativeTime(dateStr) {
      if (!dateStr) return ''
      const diff = Date.now() - new Date(dateStr).getTime()
      if (isNaN(diff)) return ''
      const m = Math.floor(diff / 60000)
      if (m < 1) return '방금 전'
      if (m < 60) return `${m}분 전`
      const h = Math.floor(m / 60)
      if (h < 24) return `${h}시간 전`
      return `${Math.floor(h / 24)}일 전`
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
  }
}
</script>
