<template>
  <div class="mx-auto space-y-6 pb-12 max-w-6xl">
    <!-- 헤더 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
      <div class="flex flex-col">
        <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">For U</h1>
        <p class="mt-1 text-sm text-slate-500">마이페이지 · {{ userName }}님을 위한 맞춤 공연 경험입니다.</p>
      </div>
      <RouterLink
        to="/me"
        class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        마이페이지
      </RouterLink>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- 공연 플래너 (좌측 2/3) -->
      <section class="content-start space-y-6 lg:col-span-2">
        <!-- 관심 아티스트 빠른 선택 (필터 UI 유지) -->
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-base font-bold text-slate-900">공연 플래너</h2>
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">FILTER BY INTERESTS</span>
          </div>

          <div class="flex gap-4 overflow-x-auto pb-4 foru-scroll-hide">
            <button
              type="button"
              class="flex shrink-0 flex-col items-center gap-2 group"
              @click="selectedId = null"
            >
              <div
                class="flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all"
                :class="selectedId === null
                  ? 'border-red-600 bg-red-50 text-red-600 ring-4 ring-red-50'
                  : 'border-slate-100 bg-slate-50 text-slate-400 group-hover:border-slate-200'"
              >
                <span class="text-xs font-bold uppercase tracking-tight">ALL</span>
              </div>
              <span class="whitespace-nowrap text-[11px] font-bold tracking-tight" :class="selectedId === null ? 'text-slate-900' : 'text-slate-400'">통합 일정</span>
            </button>

            <button
              v-for="p in likedPerformers"
              :key="p.performerId"
              type="button"
              class="flex shrink-0 flex-col items-center gap-2 group"
              @click="selectedId = p.performerId"
            >
              <div class="relative">
                <img
                  v-if="p.performerProfileImgUrl"
                  :src="p.performerProfileImgUrl"
                  :alt="p.performerName"
                  class="h-14 w-14 rounded-full border-2 object-cover transition-all"
                  :class="selectedId === p.performerId
                    ? 'border-red-600 scale-105 shadow-md ring-4 ring-red-50'
                    : 'border-slate-100 group-hover:border-slate-200'"
                />
                <div v-else class="flex h-14 w-14 items-center justify-center rounded-full border-2 bg-slate-300 text-sm font-bold text-white transition-all"
                  :class="selectedId === p.performerId ? 'border-red-600 scale-105 ring-4 ring-red-50' : 'border-slate-100'"
                >
                  {{ (p.performerName || '?').charAt(0) }}
                </div>
              </div>
              <span class="max-w-[64px] truncate whitespace-nowrap text-[11px] font-bold tracking-tight" :class="selectedId === p.performerId ? 'text-slate-900' : 'text-slate-400'">
                {{ p.performerName }}
              </span>
            </button>
          </div>
        </div>

        <!-- 타임라인 리스트 -->
        <div class="space-y-4">
          <div v-if="loading" class="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white py-12">
            <div class="flex flex-col items-center gap-3 text-slate-400">
              <svg class="h-8 w-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span class="text-sm font-medium">나를 위한 일정을 분석하고 있습니다…</span>
            </div>
          </div>

          <div v-else-if="filteredSchedules.length === 0" class="rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-sm">
            <p class="text-base font-bold text-slate-800">아직 매칭되는 일정이 없네요.</p>
            <p class="mt-1 text-sm font-medium text-slate-400">더 많은 공연과 아티스트를 '좋아요' 해보세요!</p>
            <RouterLink to="/performers" class="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-black">
              아티스트 보러가기 <ChevronRight class="h-4 w-4" />
            </RouterLink>
          </div>

          <ul v-else class="space-y-4">
            <li
              v-for="s in filteredSchedules"
              :key="s.scheduleId"
              class="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-red-200 hover:shadow-md sm:flex-row sm:items-center"
            >
              <!-- 추천 근거 아바타 (첫 번째 매칭 관심사 기준) -->
              <div class="shrink-0 flex items-center gap-3 sm:gap-4">
                <div class="relative h-14 w-14 shrink-0">
                  <img
                    v-if="s.matchedInterests?.[0]?.imgUrl"
                    :src="s.matchedInterests[0].imgUrl"
                    class="h-full w-full rounded-full border border-slate-100 object-cover shadow-sm"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Star class="h-6 w-6" />
                  </div>
                  <!-- 복수 관심사 매칭 시 카운트 배지 -->
                  <div v-if="s.matchedInterests.length > 1" class="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white ring-2 ring-white">
                    +{{ s.matchedInterests.length - 1 }}
                  </div>
                </div>
                
                <div class="min-w-0 flex-1 sm:hidden">
                  <p class="text-[10px] font-bold text-red-600 uppercase tracking-widest">Recommended for You</p>
                  <h4 class="truncate text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors">{{ s.concertTitle }}</h4>
                </div>
              </div>

              <!-- 공연 정보 -->
              <div class="min-w-0 flex-1 space-y-1 hidden sm:block">
                <div class="flex flex-wrap items-center gap-2">
                  <div v-for="(interest, idx) in s.matchedInterests" :key="idx" 
                    class="flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 border border-slate-100"
                  >
                    <span class="text-[10px] font-bold text-slate-500 uppercase">{{ interest.type }}</span>
                    <span class="text-[11px] font-bold text-slate-800">{{ interest.name }}</span>
                  </div>
                </div>
                <h4 class="mt-1 truncate text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors">{{ s.concertTitle }}</h4>
                <div class="flex items-center gap-3 text-[13px] font-medium text-slate-400">
                  <div class="flex items-center gap-1">
                    <Clock class="h-3.5 w-3.5" />
                    <span>{{ formatDateTime(s.startAt) }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <UiBadge tone="outline" :color="getStatusColor(s.status)">{{ s.status }}</UiBadge>
                  </div>
                </div>
              </div>

              <!-- 예매 버튼 -->
              <div class="flex items-center justify-between sm:block">
                <div class="sm:hidden flex flex-col gap-1">
                  <div class="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                    <Clock class="h-3 w-3" />
                    <span>{{ formatDateTime(s.startAt) }}</span>
                  </div>
                </div>
                <RouterLink
                  :to="`/schedules/${s.scheduleId}`"
                  class="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-black shadow-sm"
                >
                  예매하기
                </RouterLink>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- 사이드바 -->
      <section class="content-start space-y-6">
        <!-- 추천 키워드 (NEW API 연동 예정) -->
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-5 flex items-center gap-2">
            <Search class="h-5 w-5 text-red-600" />
            <h2 class="text-base font-bold text-slate-900">추천 키워드</h2>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="kw in recommendedKeywords"
              :key="kw.id"
              @click="handleKeywordClick(kw)"
              class="rounded-full bg-slate-50 border border-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              # {{ kw.label }}
            </button>
          </div>
        </div>

        <!-- 좋아하는 아티스트 목록 -->
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-5 flex items-center gap-2">
            <Heart class="h-5 w-5 text-red-600" />
            <h2 class="text-base font-bold text-slate-900">관심 아티스트</h2>
          </div>
          <ul class="space-y-1">
            <RouterLink
              v-for="p in likedPerformers.slice(0, 6)"
              :key="p.performerId"
              :to="`/performers/${p.performerId}`"
              class="flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-slate-50 group"
            >
              <img
                v-if="p.performerProfileImgUrl"
                :src="p.performerProfileImgUrl"
                :alt="p.performerName"
                class="h-10 w-10 shrink-0 rounded-full border border-slate-100 object-cover"
              />
              <div v-else class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-400 uppercase">
                {{ (p.performerName || '?').charAt(0) }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="truncate text-sm font-bold text-slate-800 group-hover:text-red-600 transition-colors">{{ p.performerName }}</div>
                <div class="text-[10px] font-bold text-slate-400 uppercase">Following</div>
              </div>
              <ChevronRight class="h-4 w-4 shrink-0 text-slate-300" />
            </RouterLink>
          </ul>
          <RouterLink to="/performers" class="mt-6 flex w-full items-center justify-center rounded-xl bg-slate-900 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-black transition">
            아티스트 전체보기
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { Heart, ChevronRight, Plus, Clock, Star, Search } from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import UiBadge from '../../components/common/UiBadge.vue'

export default {
  name: 'ForUView',
  components: { Heart, ChevronRight, Plus, Clock, Star, Search, UiBadge },
  data() {
    return {
      api: null,
      userName: '회원',
      likedPerformers: [],
      allSchedules: [],
      recommendedKeywords: [],
      selectedId: null,
      loading: false,
    }
  },
  computed: {
    filteredSchedules() {
      if (this.selectedId === null) return this.allSchedules
      // selectedId가 performerId인 스케줄만 필터링 (matchedInterests 배열 확인)
      return this.allSchedules.filter((s) => 
        s.matchedInterests.some(interest => interest.type === 'PERFORMER' && String(interest.performerId) === String(this.selectedId))
      )
    }
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
        // 1. 유저 정보 & 좋아요한 아티스트 & 추천 키워드 & 통합 스케줄 병렬 호출 (N+1 해결!)
        const [profileRes, likedRes, keywordsRes, schedulesRes] = await Promise.all([
          this.api.get(ENDPOINTS.me()).catch(() => null),
          this.api.get(ENDPOINTS.performerLikeList()).catch(() => []),
          this.api.get(ENDPOINTS.recommendationKeywords()).catch(() => ({ keywords: [] })),
          this.api.get(ENDPOINTS.myInterestSchedules({ size: 50 })).catch(() => ({ content: [] })),
        ])

        // 유저명 설정
        const profile = profileRes?.data ?? profileRes
        this.userName = profile?.name ?? '회원'

        // 추천 키워드 설정
        this.recommendedKeywords = keywordsRes?.keywords ?? []

        // 좋아요한 아티스트 목록 (필터 UI용)
        const likedArr = Array.isArray(likedRes) ? likedRes : likedRes?.content ?? []
        this.likedPerformers = likedArr.map((item) => ({
          performerId: item.performerId,
          performerName: item.performerName ?? '-',
          performerProfileImgUrl: item.performerProfileImgUrl ?? null,
        }))

        // 통합 스케줄 데이터 설정 (백엔드에서 Aggregation된 결과 그대로 사용)
        this.allSchedules = schedulesRes?.content ?? []
        
      } finally {
        this.loading = false
      }
    },
    formatDateTime(isoStr) {
      if (!isoStr) return '-'
      const d = new Date(isoStr)
      return `${d.getMonth() + 1}.${d.getDate()} (${this.getWeekday(d)}) ${this.formatTime(d)}`
    },
    getWeekday(date) {
      const days = ['일', '월', '화', '수', '목', '금', '토']
      return days[date.getDay()]
    },
    formatTime(date) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
    },
    getStatusColor(status) {
      const map = {
        OPEN: 'green',
        READY: 'amber',
        CLOSED: 'slate',
      }
      return map[status] || 'slate'
    },
    handleKeywordClick(kw) {
      switch (kw.type) {
        case 'PERFORMER':
          this.$router.push(`/performers/${kw.id}`)
          break
        case 'CONCERT':
          this.$router.push(`/concerts/${kw.id}`)
          break
        case 'GENRE':
          this.$router.push(`/search?category=${kw.id}`)
          break
        default:
          this.$router.push(`/search?keyword=${kw.label}`)
      }
    }
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
