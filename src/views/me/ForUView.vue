<template>
  <div class="mx-auto max-w-6xl pb-20 px-4">
    <!-- 헤더 -->
    <div class="mb-8 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="text-left">
        <h1 class="text-2xl font-bold text-slate-900">For U</h1>
        <p class="mt-1 text-sm text-slate-500">{{ userName }}님의 취향을 분석한 맞춤 공연 추천입니다.</p>
      </div>
      <RouterLink
        to="/me"
        class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        마이페이지
      </RouterLink>
    </div>

    <div class="grid gap-8 lg:grid-cols-3">
      <!-- 메인 콘텐츠 (좌측 2) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 관심 아티스트 필터 (Sticky) -->
        <div class="sticky top-16 z-10 -mx-4 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:mx-0 sm:rounded-2xl sm:border sm:border-slate-100 sm:px-5">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wider">My Artists</h2>
          </div>

          <div class="flex gap-3 overflow-x-auto pb-1 foru-scroll-hide">
            <button
              type="button"
              class="flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all"
              :class="selectedId === null
                ? 'bg-slate-900 text-white shadow-md transform scale-105'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
              @click="selectedId = null"
            >
              <span>ALL</span>
            </button>

            <button
              v-for="p in likedPerformers"
              :key="p.performerId"
              type="button"
              class="flex shrink-0 items-center gap-2 rounded-full border px-1.5 py-1.5 pr-4 transition-all"
              :class="selectedId === p.performerId
                ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-100'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'"
              @click="selectedId = p.performerId"
            >
              <img
                v-if="p.performerProfileImgUrl"
                :src="p.performerProfileImgUrl"
                :alt="p.performerName"
                class="h-7 w-7 rounded-full object-cover"
              />
              <div v-else class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-400">
                {{ (p.performerName || '?').charAt(0) }}
              </div>
              <span class="text-sm font-bold">{{ p.performerName }}</span>
            </button>
          </div>
        </div>

        <!-- 로딩/빈 상태/공연 카드 목록 -->
        <div v-if="loading" class="py-20 text-center">
          <div class="inline-block animate-spin rounded-full border-4 border-slate-200 border-t-red-600 h-10 w-10 mb-4"></div>
          <p class="text-sm font-bold text-slate-400">공연을 불러오는 중입니다...</p>
        </div>

        <div v-else-if="filteredConcerts.length === 0" class="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50">
          <div class="mb-6 rounded-full bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <Heart class="h-10 w-10 text-slate-300" />
          </div>
          <h3 class="text-lg font-bold text-slate-900">추천 공연이 없어요</h3>
          <p class="mt-2 max-w-xs text-sm text-slate-500">
            {{ selectedId ? '선택하신 아티스트의 예정된 공연이 없습니다.' : '관심 아티스트를 팔로우하거나 공연을 찜해보세요!' }}
          </p>
        </div>

        <!-- 공연 카드 목록 -->
        <div v-else class="space-y-4">
          <div
            v-for="c in filteredConcerts"
            :key="c.concertId"
            class="group relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-red-200 hover:shadow-lg sm:flex-row sm:items-stretch"
          >
            <!-- 포스터 -->
            <div class="shrink-0 cursor-pointer" @click="$router.push(`/concerts/${c.concertId}`)">
              <img
                :src="c.posterUrl || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=150&q=80'"
                class="h-36 w-24 rounded-lg object-cover shadow-sm"
                :alt="c.concertTitle"
              />
            </div>

            <!-- 정보 영역 -->
            <div class="flex flex-1 flex-col justify-between py-0.5">
              <div>
                <!-- 매칭 아티스트 태그 -->
                <div v-if="c.matchedPerformers && c.matchedPerformers.length" class="mb-2 flex flex-wrap gap-1.5">
                  <span
                    v-for="p in c.matchedPerformers.slice(0, 3)"
                    :key="p.id"
                    class="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 border border-red-100"
                  >
                    🎤 {{ p.name }}
                    <span v-if="p.roleName" class="font-normal opacity-70">({{ p.roleName }})</span>
                  </span>
                </div>

                <!-- 공연명 -->
                <h3
                  class="text-base font-bold text-slate-900 leading-tight group-hover:text-red-600 transition-colors cursor-pointer"
                  @click="$router.push(`/concerts/${c.concertId}`)"
                >
                  {{ c.concertTitle }}
                </h3>

                <!-- 카테고리 -->
                <p v-if="c.category" class="mt-0.5 text-xs font-medium text-slate-400">{{ c.category }}</p>

                <!-- 공연 기간 -->
                <p class="mt-1 text-xs font-semibold text-slate-600">
                  {{ formatDateRange(c.scheduleStartDate, c.scheduleEndDate) }}
                </p>
              </div>

              <!-- 하단: 상태 + 좋아요 + 버튼 -->
              <div class="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                <div class="flex items-center gap-2">
                  <UiBadge tone="outline" :color="getStatusColor(c.status)">{{ getStatusLabel(c.status) }}</UiBadge>
                  <Heart
                    v-if="c.liked"
                    class="h-4 w-4 fill-red-500 text-red-500"
                  />
                </div>
                <RouterLink
                  :to="`/concerts/${c.concertId}`"
                  class="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-black"
                >
                  상세보기
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 사이드바 (우측 1) -->
      <aside class="space-y-6">
        <!-- 인기 아티스트 Top 3 -->
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-base font-bold text-slate-900">인기 아티스트</h2>
            <span class="text-[10px] font-bold text-red-600 uppercase tracking-widest">Top 3</span>
          </div>
          <div v-if="topPerformers.length === 0" class="py-4 text-center text-xs text-slate-400">
            데이터를 불러오는 중...
          </div>
          <div v-else class="space-y-4">
            <div v-for="(p, idx) in topPerformers" :key="p.id" class="flex items-center gap-3 group cursor-pointer" @click="$router.push(`/performers/${p.id}`)">
              <div class="relative">
                <img :src="p.profileImgUrl || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=100&q=80'" class="h-12 w-12 rounded-full border border-slate-100 object-cover" />
                <div class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white ring-2 ring-white">
                  {{ idx + 1 }}
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-bold text-slate-800 group-hover:text-red-600 transition-colors">{{ p.name }}</p>
                <p class="text-[10px] font-medium text-slate-400">{{ p.concertCount || 0 }}개의 공연 진행 중</p>
              </div>
            </div>
          </div>
          <RouterLink to="/performers" class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition">
            아티스트 둘러보기 <ChevronRight class="h-3 w-3" />
          </RouterLink>
        </div>

        <!-- 퀵 메뉴 -->
        <div class="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-lg">
          <h3 class="text-sm font-bold opacity-80 uppercase tracking-widest mb-4">Quick Menu</h3>
          <ul class="space-y-3">
            <li>
              <RouterLink to="/concerts/ranking" class="flex items-center justify-between text-sm font-bold hover:text-red-400 transition">
                실시간 랭킹 보기 <ChevronRight class="h-4 w-4 opacity-50" />
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/nearby" class="flex items-center justify-between text-sm font-bold hover:text-red-400 transition">
                내 주변 공연장 <ChevronRight class="h-4 w-4 opacity-50" />
              </RouterLink>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import { Heart, ChevronRight } from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import UiBadge from '../../components/common/UiBadge.vue'

export default {
  name: 'ForUView',
  components: { Heart, ChevronRight, UiBadge },
  data() {
    return {
      api: null,
      userName: '회원',
      likedPerformers: [],
      topPerformers: [],
      allConcerts: [],
      selectedId: null, // null = ALL, 또는 performerId
      loading: false,
    }
  },
  computed: {
    filteredConcerts() {
      if (this.selectedId === null) return this.allConcerts
      return this.allConcerts.filter((c) =>
        Array.isArray(c.matchedPerformers) &&
        c.matchedPerformers.some((p) => String(p.id) === String(this.selectedId))
      )
    },
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const [profileRes, likedRes, topRes, concertsRes] = await Promise.all([
          this.api.get(ENDPOINTS.me()).catch(() => null),
          this.api.get(ENDPOINTS.performerLikeList()).catch(() => []),
          this.api.get(ENDPOINTS.performers({ size: 3 })).catch(() => []),
          this.api.get(ENDPOINTS.interestConcerts({ size: 50 })).catch(() =>
            this.api.get(ENDPOINTS.myInterestSchedules({ size: 50 })).catch(() => ({ content: [] }))
          ),
        ])

        const profile = profileRes?.data ?? profileRes
        this.userName = profile?.name ?? profile?.nickname ?? '회원'

        const likedArr = Array.isArray(likedRes) ? likedRes : likedRes?.content ?? []
        this.likedPerformers = likedArr.map((item) => ({
          performerId: item.performerId,
          performerName: item.performerName ?? '-',
          performerProfileImgUrl: item.performerProfileImgUrl ?? null,
        }))

        const topArr = Array.isArray(topRes) ? topRes : topRes?.content ?? []
        this.topPerformers = topArr.map((p) => ({
          id: p.id,
          name: p.name,
          profileImgUrl: p.profileImgUrl,
          concertCount: p.concertCount,
        }))

        const rawConcerts = concertsRes?.content ?? []
        this.allConcerts = rawConcerts.map((c) => ({
          concertId: c.concertId,
          concertTitle: c.concertTitle,
          posterUrl: c.posterUrl ?? c.concertPosterUrl ?? null,
          category: c.category ?? null,
          scheduleStartDate: c.scheduleStartDate ?? null,
          scheduleEndDate: c.scheduleEndDate ?? null,
          status: c.status ?? 'AVAILABLE',
          liked: c.liked ?? false,
          matchedPerformers: Array.isArray(c.matchedPerformers) ? c.matchedPerformers : [],
        }))
      } finally {
        this.loading = false
      }
    },
    formatDateRange(start, end) {
      if (!start && !end) return '일정 미정'
      const fmt = (iso) => {
        if (!iso) return ''
        const d = new Date(iso)
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
      }
      if (start && end) {
        const s = fmt(start)
        const e = fmt(end)
        return s === e ? s : `${s} ~ ${e}`
      }
      return fmt(start || end)
    },
    getStatusLabel(status) {
      const map = {
        DRAFT: '준비중',
        UPCOMING: '오픈 예정',
        AVAILABLE: '예매 중',
        CLOSED: '공연 종료',
      }
      return map[status] || status || '-'
    },
    getStatusColor(status) {
      const map = {
        DRAFT: 'slate',
        UPCOMING: 'amber',
        AVAILABLE: 'green',
        CLOSED: 'slate',
      }
      return map[status] || 'slate'
    },
  },
}
</script>

<style scoped>
.foru-scroll-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.foru-scroll-hide::-webkit-scrollbar {
  display: none;
}
</style>