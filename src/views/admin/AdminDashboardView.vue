<template>
  <div class="grid gap-6">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">ADMIN 운영 대시보드</div>
        <div class="mt-1 text-sm text-slate-500">플랫폼 자산/보안/차단/감사 로그 요약</div>
      </div>
      <UiBadge tone="soft">ADMIN</UiBadge>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <StatCard label="활성 공연장" value="-" hint="" />
      <StatCard label="차단 목록" value="-" hint="" />
      <StatCard label="감사 로그" value="50" hint="최근 50건" />
    </div>

    <UiCard>
      <div class="flex flex-wrap items-center gap-2">
        <UiButton class="h-11 px-5" @click="$router.push('/admin/venues')">공연장</UiButton>
        <UiButton variant="ghost" class="h-11 px-5" @click="$router.push('/admin/audit-logs')">감사 로그</UiButton>
        <UiButton variant="ghost" class="h-11 px-5" @click="$router.push('/admin/blocklist')">차단</UiButton>
      </div>
    </UiCard>

    <!-- 공연장 + 좌석맵 목록 -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="text-sm font-semibold text-slate-900">공연장 · 좌석맵</div>
        <span v-if="seatMapLoading" class="text-xs text-slate-400">불러오는 중…</span>
        <span v-else class="text-xs text-slate-400">공연장 {{ venueGroups.length }}개</span>
      </div>

      <div v-if="seatMapLoading" class="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
        불러오는 중…
      </div>
      <div v-else-if="venueGroups.length === 0" class="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
        등록된 공연장이 없습니다.
      </div>

      <!-- 공연장별 섹션 -->
      <div v-for="group in venueGroups" :key="group.venueId" class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <!-- 공연장 헤더 -->
        <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-slate-900">{{ group.venueName }}</span>
            <span class="rounded-md bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600">좌석맵 {{ group.seatMaps.length }}개</span>
          </div>
          <button
            class="text-xs text-blue-600 hover:underline"
            @click="$router.push(`/admin/venues/${group.venueId}/seat-maps`)"
          >
            전체 관리 →
          </button>
        </div>

        <!-- 해당 공연장의 좌석맵 카드들 -->
        <div v-if="group.seatMaps.length === 0" class="px-4 py-5 text-center text-sm text-slate-400">
          등록된 좌석맵이 없습니다.
        </div>
        <div v-else class="grid gap-2 p-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          <div
            v-for="sm in group.seatMaps"
            :key="sm.id"
            class="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            @click="$router.push({ path: `/admin/dashboard/seat-maps/${sm.id}`, query: { venueId: group.venueId } })"
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
                <span class="text-xs text-slate-400">레이아웃 미저장</span>
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
                <span v-if="!sm.size && !sm.version" class="text-slate-300">정보 없음</span>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      seatMapLoading: false,
      api: null
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.loadSeatMaps()
  },
  methods: {
    // ── 공연장+좌석맵 로드 ────────────────────────────────────
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
      } catch (e) {
        console.error('좌석맵 로드 실패', e)
        this.venueGroups = []
      } finally {
        this.seatMapLoading = false
      }
    },

  }
}
</script>
