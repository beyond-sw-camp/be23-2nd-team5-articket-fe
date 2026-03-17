<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="py-12 text-center text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <template v-else-if="seatMap">
      <!-- 상단 헤더 -->
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="mgmt-page-title">{{ seatMap.name || '좌석맵' }}</h1>
            <UiBadge
              :tone="seatMap.status === 'PUBLISHED' ? 'solid' : 'soft'"
              :color="seatMap.status === 'PUBLISHED' ? 'green' : 'slate'"
            >
              {{ seatMap.status || 'DRAFT' }}
            </UiBadge>
          </div>
          <p class="mgmt-page-subtitle">ID {{ seatMap.id }} · v{{ seatMap.version ?? '-' }}</p>
        </div>
        <div class="flex items-center gap-2">
          <UiBadge tone="soft">ADMIN</UiBadge>
          <UiButton variant="ghost" class="h-10 px-4" @click="$router.push('/admin/dashboard')">
            대시보드
          </UiButton>
          <UiButton
            v-if="venueId"
            variant="ghost"
            class="h-10 px-4"
            @click="$router.push(`/admin/venues/${venueId}/seat-maps`)"
          >
            좌석맵 목록
          </UiButton>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- 배치도 미리보기 (왼쪽) -->
        <div class="lg:col-span-1">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">
              <span class="text-xs font-semibold text-slate-600">배치도 미리보기</span>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="rounded p-1 text-slate-500 hover:bg-slate-200 transition-colors text-sm"
                  @click="imgScale = Math.max(imgScale / 1.25, 0.25)"
                >−</button>
                <span class="min-w-12 text-center text-xs text-slate-500">{{ Math.round(imgScale * 100) }}%</span>
                <button
                  type="button"
                  class="rounded p-1 text-slate-500 hover:bg-slate-200 transition-colors text-sm"
                  @click="imgScale = Math.min(imgScale * 1.25, 3)"
                >+</button>
                <button type="button" class="rounded p-1 text-xs text-slate-500 hover:bg-slate-200" @click="resetImgView">↺</button>
              </div>
            </div>
            <div
              v-if="seatMap.thumbnailUrl"
              class="relative bg-white overflow-hidden"
              :class="imgDragging ? 'cursor-grabbing' : 'cursor-grab'"
              style="height: 240px"
              @wheel.prevent="onImgWheel"
              @mousedown.prevent="onImgMouseDown"
              @mousemove="onImgMouseMove"
              @mouseup="onImgMouseUp"
              @mouseleave="onImgMouseUp"
            >
              <img
                :src="seatMap.thumbnailUrl"
                alt="배치도"
                draggable="false"
                class="absolute left-0 top-0 w-full h-full object-contain select-none pointer-events-none"
                :style="{
                  transformOrigin: '0 0',
                  transform: `translate(${imgOffsetX}px, ${imgOffsetY}px) scale(${imgScale})`
                }"
              />
            </div>
            <div v-else class="flex flex-col items-center justify-center py-16 bg-slate-50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span class="text-sm text-slate-400">저장된 배치도가 없습니다</span>
              <span class="text-xs mt-1 text-slate-400">레이아웃 편집 후 저장해주세요</span>
            </div>
          </div>
        </div>

        <!-- 정보 (오른쪽) -->
        <div class="lg:col-span-2">
          <UiCard>
            <dl class="space-y-4">
              <div>
                <dt class="text-xs font-semibold text-slate-500">좌석맵 이름</dt>
                <dd class="mt-1 text-sm font-medium text-slate-900">{{ seatMap.name || '-' }}</dd>
              </div>
              <div class="border-t border-slate-100 pt-4">
                <dt class="text-xs font-semibold text-slate-500">게시 상태</dt>
                <dd class="mt-1">
                  <UiBadge
                    :tone="seatMap.status === 'PUBLISHED' ? 'solid' : 'soft'"
                    :color="seatMap.status === 'PUBLISHED' ? 'green' : seatMap.status === 'ARCHIVED' ? 'amber' : 'slate'"
                  >
                    {{ seatMap.status === 'PUBLISHED' ? '게시' : seatMap.status === 'ARCHIVED' ? '폐기' : '임시저장' }}
                  </UiBadge>
                </dd>
              </div>
              <div v-if="seatMap.version != null" class="border-t border-slate-100 pt-4">
                <dt class="text-xs font-semibold text-slate-500">버전</dt>
                <dd class="mt-1 text-sm text-slate-700">v{{ seatMap.version }}</dd>
              </div>
            </dl>
          </UiCard>
        </div>
      </div>
      <!-- 공연 목록 + 캘린더 -->
      <div class="grid gap-4 lg:grid-cols-5">
        <!-- 공연 목록 (왼쪽) -->
        <div class="lg:col-span-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
            <span class="text-sm font-semibold text-slate-700">이 좌석맵의 공연</span>
            <span v-if="concertsLoading" class="text-xs text-slate-400">불러오는 중…</span>
            <span v-else class="text-xs text-slate-400">{{ concerts.length }}건</span>
          </div>
          <div v-if="concertsLoading" class="p-6 text-center text-sm text-slate-400">불러오는 중…</div>
          <div v-else-if="!venueId" class="p-6 text-center text-sm text-slate-400">공연장 정보가 없습니다.</div>
          <div v-else-if="concerts.length === 0" class="p-6 text-center text-sm text-slate-400">등록된 공연이 없습니다.</div>
          <table v-else class="w-full text-sm">
            <thead class="border-b border-slate-100">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">공연명</th>
                <th class="px-4 py-2 text-center text-xs font-semibold text-slate-500">상태</th>
                <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">주최자</th>
                <th class="px-4 py-2 text-center text-xs font-semibold text-slate-500">일정</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="concert in concerts"
                :key="concert.id"
                class="border-b border-slate-100 last:border-0 transition-colors"
                :class="selectedConcertId === concert.id ? 'bg-red-50' : 'hover:bg-slate-50'"
              >
                <td class="px-4 py-3">
                  <div class="font-medium text-slate-900">{{ concert.title || '-' }}</div>
                  <div class="text-xs text-slate-400">ID {{ concert.id }}</div>
                </td>
                <td class="px-4 py-3 text-center">
                  <UiBadge
                    :tone="['UPCOMING', 'AVAILABLE'].includes(concert.status) ? 'solid' : 'soft'"
                    :color="concert.status === 'AVAILABLE' ? 'red' : concert.status === 'UPCOMING' ? 'amber' : 'slate'"
                  >
                    {{ statusLabel(concert.status) }}
                  </UiBadge>
                </td>
                <td class="px-4 py-3 text-sm text-slate-700">
                  {{ concert.organizerEmail || '-' }}
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    class="h-7 rounded-lg border px-3 text-xs font-medium transition-colors"
                    :class="selectedConcertId === concert.id
                      ? 'border-red-500 bg-red-500 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
                    @click="selectConcert(concert)"
                  >
                    {{ selectedConcertId === concert.id ? '선택됨' : '일정 보기' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 캘린더 (오른쪽) -->
        <div class="lg:col-span-2">
          <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <div class="mb-3 border-b border-slate-100 pb-3">
              <div class="text-sm font-semibold text-slate-700">공연 일정</div>
              <div class="mt-1 text-xs text-slate-400">
                <template v-if="selectedConcertId">「{{ selectedConcertTitle }}」 일정</template>
                <template v-else>공연을 선택하면 일정이 표시됩니다</template>
              </div>
            </div>
            <div v-if="schedulesLoading" class="py-8 text-center text-sm text-slate-400">일정 불러오는 중…</div>
            <ConcertCalendar
              v-else
              :available-dates="availableDates"
              :schedules-by-date="schedulesByDate"
              :admin-mode="true"
              @select-schedule="() => {}"
            />
          </div>
        </div>
      </div>
    </template>

    <UiCard v-else>
      <div class="py-12 text-center text-sm text-slate-500">좌석맵 정보를 찾을 수 없습니다.</div>
      <div class="flex justify-center mt-4">
        <UiButton variant="ghost" @click="$router.push('/admin/dashboard')">대시보드로</UiButton>
      </div>
    </UiCard>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import ConcertCalendar from '../../components/concert/ConcertCalendar.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'AdminSeatMapDetailView',
  components: { UiCard, UiBadge, UiButton, ConcertCalendar },
  data() {
    return {
      api: null,
      loading: false,
      seatMap: null,
      seatMapNameDraft: '',
      savingSeatMapName: false,
      statusDraft: 'DRAFT',
      statusUpdating: false,
      successMessage: '',
      imgScale: 1,
      imgOffsetX: 0,
      imgOffsetY: 0,
      imgDragging: false,
      imgDragStart: { x: 0, y: 0 },
      imgDragStartOffset: { x: 0, y: 0 },
      concerts: [],
      concertsLoading: false,
      selectedConcertId: null,
      selectedConcertTitle: '',
      schedules: [],
      schedulesLoading: false
    }
  },
  computed: {
    seatMapId() {
      return this.$route.params.seatMapId
    },
    venueId() {
      return this.$route.query?.venueId || this.seatMap?.venue_id || this.seatMap?.venueId
    },
    availableDates() {
      const set = new Set()
      for (const s of this.schedules) {
        const raw = s.play_time ?? s.playTime ?? s.startAt ?? s.date ?? ''
        if (!raw) continue
        const d = new Date(raw)
        if (isNaN(d)) continue
        set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
      }
      return [...set].sort()
    },
    schedulesByDate() {
      const map = {}
      for (const s of this.schedules) {
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
  watch: {
    seatMapId() {
      this.loadAll()
    }
  },
  created() {
    this.api = useApi()
    this.loadAll()
  },
  methods: {
    statusLabel(s) {
      const m = { DRAFT: '초안', UPCOMING: '게시', AVAILABLE: '예매중', CLOSED: '마감' }
      return m[s] ?? s ?? '-'
    },
    normalizeSeatMap(item) {
      const status = String(item?.status ?? item?.seatMapStatus ?? 'DRAFT').toUpperCase()
      const rawThumb = item?.thumbnailUrl ?? item?.thumbnail_url ?? null

      return {
        id: item?.id,
        name: item?.name ?? '',
        venue_id: item?.venue_id ?? item?.venueId ?? item?.venue?.id,
        version: item?.version ?? null,
        status,
        thumbnailUrl: rawThumb
          ? (String(rawThumb).startsWith('data:')
              ? rawThumb
              : `${rawThumb}${String(rawThumb).includes('?') ? '&' : '?'}t=${Date.now()}`)
          : null
      }
    },
    async loadAll() {
      if (!this.seatMapId) return
      this.loading = true
      this.successMessage = ''
      try {
        const detail = await this.api.get(ENDPOINTS.adminSeatMapDetail(this.seatMapId))
        this.seatMap = detail ? this.normalizeSeatMap(detail) : null
        this.seatMapNameDraft = this.seatMap?.name || ''
        this.statusDraft = this.seatMap?.status || 'DRAFT'
        await this.loadConcerts()
      } catch (err) {
        this.seatMap = null
      } finally {
        this.loading = false
      }
    },
    async loadConcerts() {
      if (!this.venueId) return
      this.concertsLoading = true
      try {
        const res = await this.api.get(ENDPOINTS.venueConcerts(this.venueId))
        const allConcerts = res?.content ?? res?.items ?? (Array.isArray(res) ? res : [])

        // 각 공연의 스케줄 목록 병렬 조회
        const scheduleResults = await Promise.allSettled(
          allConcerts.map((c) => this.api.get(ENDPOINTS.concertSchedules(c.id)))
        )

        // 스케줄별 seat-map 병렬 조회 (어느 스케줄이 이 좌석맵을 쓰는지 확인)
        const concertScheduleMap = []
        for (let i = 0; i < allConcerts.length; i++) {
          const r = scheduleResults[i]
          const schedules = r.status === 'fulfilled'
            ? (r.value?.content ?? r.value?.items ?? (Array.isArray(r.value) ? r.value : []))
            : []
          concertScheduleMap.push({ concert: allConcerts[i], schedules })
        }

        const allSchedules = concertScheduleMap.flatMap(({ schedules }) => schedules)
        const seatMapResults = await Promise.allSettled(
          allSchedules.map((s) => this.api.get(ENDPOINTS.seatMap(s.id)))
        )

        // scheduleId → seatMapId 매핑
        const seatMapById = {}
        for (let i = 0; i < allSchedules.length; i++) {
          const r = seatMapResults[i]
          if (r.status === 'fulfilled') {
            seatMapById[allSchedules[i].id] = String(r.value?.seatMapId ?? '')
          }
        }

        const filtered = []
        for (const { concert, schedules } of concertScheduleMap) {
          const matchingSchedules = schedules.filter(
            (s) => seatMapById[s.id] === String(this.seatMapId)
          )
          if (matchingSchedules.length > 0) {
            filtered.push({ ...concert, _schedules: matchingSchedules })
          }
        }
        this.concerts = filtered
      } catch (err) {
        this.concerts = []
      } finally {
        this.concertsLoading = false
      }
    },
    selectConcert(concert) {
      if (this.selectedConcertId === concert.id) {
        this.selectedConcertId = null
        this.selectedConcertTitle = ''
        this.schedules = []
        return
      }
      this.selectedConcertId = concert.id
      this.selectedConcertTitle = concert.title || ''
      this.schedules = concert._schedules ?? []
    },
    async updateStatus(status) {
      if (!this.seatMapId || this.seatMap?.status === status) return
      this.statusUpdating = true
      this.successMessage = ''
      try {
        await this.api.patch(ENDPOINTS.adminUpdateSeatMapStatus(this.seatMapId, status))
        this.seatMap = this.normalizeSeatMap({ ...this.seatMap, status })
        this.statusDraft = status
        const labels = { DRAFT: '임시저장', PUBLISHED: '게시', ARCHIVED: '폐기' }
        this.successMessage = `상태가 ${labels[status]}로 변경되었습니다.`
      } finally {
        this.statusUpdating = false
      }
    },
    async updateSeatMapName() {
      if (!this.seatMapNameDraft?.trim()) return
      this.savingSeatMapName = true
      this.successMessage = ''
      try {
        await this.api.patch(ENDPOINTS.adminUpdateSeatMapName(this.seatMapId), {
          name: this.seatMapNameDraft.trim()
        })
        this.successMessage = '좌석맵 이름이 수정되었습니다.'
        this.seatMap = this.normalizeSeatMap({ ...this.seatMap, name: this.seatMapNameDraft.trim() })
      } finally {
        this.savingSeatMapName = false
      }
    },
    onImgWheel(e) {
      const delta = e.deltaY < 0 ? 1.25 : 1 / 1.25
      const rect = e.currentTarget.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const newScale = Math.min(Math.max(this.imgScale * delta, 0.25), 3)
      const actualDelta = newScale / this.imgScale
      this.imgOffsetX = mx - (mx - this.imgOffsetX) * actualDelta
      this.imgOffsetY = my - (my - this.imgOffsetY) * actualDelta
      this.imgScale = newScale
    },
    onImgMouseDown(e) {
      this.imgDragging = true
      this.imgDragStart = { x: e.clientX, y: e.clientY }
      this.imgDragStartOffset = { x: this.imgOffsetX, y: this.imgOffsetY }
    },
    onImgMouseMove(e) {
      if (!this.imgDragging) return
      this.imgOffsetX = this.imgDragStartOffset.x + (e.clientX - this.imgDragStart.x)
      this.imgOffsetY = this.imgDragStartOffset.y + (e.clientY - this.imgDragStart.y)
    },
    onImgMouseUp() {
      this.imgDragging = false
    },
    resetImgView() {
      this.imgScale = 1
      this.imgOffsetX = 0
      this.imgOffsetY = 0
    }
  }
}
</script>
