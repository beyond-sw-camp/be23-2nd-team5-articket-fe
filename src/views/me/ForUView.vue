<template>
  <div class="mx-auto space-y-6 pb-12 max-w-6xl">
    <!-- 헤더 (마이페이지 디자인 시스템 적용) -->
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
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-base font-bold text-slate-900">공연 플래너</h2>
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ selectedIdx + 1 }} / {{ likedPerformers.length + 1 }} SELECTED</span>
          </div>

          <!-- 아티스트 필터 (가로 스크롤) -->
          <div class="flex gap-4 overflow-x-auto pb-4 foru-scroll-hide">
            <!-- 전체 일정 버튼 -->
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
              <span
                class="whitespace-nowrap text-[11px] font-bold tracking-tight"
                :class="selectedId === null ? 'text-slate-900' : 'text-slate-400'"
              >나의 일정</span>
            </button>

            <!-- 개별 아티스트 버튼 -->
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
                <div
                  v-else
                  class="flex h-14 w-14 items-center justify-center rounded-full border-2 text-sm font-bold text-white transition-all"
                  :class="selectedId === p.performerId
                    ? 'border-red-600 scale-105 bg-red-600 shadow-md ring-4 ring-red-50'
                    : 'border-slate-100 bg-slate-300'"
                >
                  {{ (p.performerName || '?').charAt(0) }}
                </div>
              </div>
              <span
                class="max-w-[64px] truncate whitespace-nowrap text-[11px] font-bold tracking-tight"
                :class="selectedId === p.performerId ? 'text-slate-900' : 'text-slate-400'"
              >{{ p.performerName }}</span>
            </button>

            <!-- 추가 버튼 -->
            <button
              type="button"
              class="flex shrink-0 flex-col items-center gap-2 group"
              @click="$router.push('/performers')"
            >
              <div class="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-slate-200 transition-all hover:border-slate-300 hover:bg-slate-50">
                <Plus class="h-4 w-4 text-slate-300" />
              </div>
              <span class="text-[11px] font-bold text-slate-300 tracking-tight">추가</span>
            </button>
          </div>

          <!-- 인사말 영역 -->
          <div class="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p class="text-sm font-bold text-slate-800">{{ userName }}님을 위한 맞춤 공연 일정입니다.</p>
            <p class="mt-1 text-xs font-medium text-slate-500 leading-relaxed">선호 아티스트의 공연 스케줄을 타임라인으로 한눈에 확인해보세요.</p>
          </div>
        </div>

        <!-- 로딩/스케줄 목록 -->
        <div class="space-y-4">
          <div v-if="loading" class="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white py-12">
            <div class="flex flex-col items-center gap-3 text-slate-400">
              <svg class="h-8 w-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span class="text-sm font-medium">일정을 불러오는 중…</span>
            </div>
          </div>

          <div v-else-if="filteredSchedules.length === 0" class="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
            <p class="text-sm font-bold text-slate-800">선호 아티스트와 매칭되는 공연이 없네요.</p>
            <p class="mt-1 text-xs font-medium text-slate-400">곧 새로운 공연 소식을 들려드릴게요!</p>
            <RouterLink
              to="/"
              class="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-black shadow-sm"
            >
              전체 공연 보기 <ChevronRight class="h-4 w-4" />
            </RouterLink>
          </div>

          <ul v-else class="space-y-3">
            <li
              v-for="s in filteredSchedules"
              :key="s.key"
              class="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-red-200 hover:shadow-md sm:px-5"
            >
              <div class="shrink-0">
                <img
                  v-if="s.performerImg"
                  :src="s.performerImg"
                  :alt="s.performerName"
                  class="h-12 w-12 rounded-full border border-slate-100 object-cover"
                />
                <div
                  v-else
                  class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-400"
                >
                  {{ s.performerName?.charAt(0) ?? '?' }}
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-red-600">{{ s.performerName }}</span>
                  <span v-if="s.role" class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{{ s.role }}</span>
                </div>
                <div class="mt-1 truncate text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">{{ s.title }}</div>
                <div v-if="s.displayText" class="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Clock class="h-3.5 w-3.5" />
                  <span>{{ s.displayText }}</span>
                </div>
              </div>

              <RouterLink
                v-if="s.scheduleId"
                :to="`/schedules/${s.scheduleId}`"
                class="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-black shadow-sm"
              >
                예매하기
              </RouterLink>
            </li>
          </ul>
        </div>
      </section>

      <!-- 맞춤 공연 사이드바 (우측 1/3) -->
      <section class="content-start space-y-6">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-5 flex items-center gap-2">
            <Heart class="h-5 w-5 text-red-600" />
            <h2 class="text-base font-bold text-slate-900">추천 아티스트</h2>
          </div>

          <div v-if="likedPerformers.length === 0" class="py-8 text-center">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-200">
              <Plus class="h-6 w-6" />
            </div>
            <p class="mt-4 text-xs font-medium leading-relaxed text-slate-400">
              좋아요한 아티스트를 추가하고<br />맞춤 공연 정보를 확인하세요.
            </p>
            <RouterLink
              to="/performers"
              class="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-5 text-xs font-bold text-white transition hover:bg-black"
            >
              아티스트 추가하기
            </RouterLink>
          </div>

          <div v-else class="space-y-1">
            <p class="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Favorite Artists</p>
            <ul class="space-y-1">
              <RouterLink
                v-for="p in likedPerformers.slice(0, 5)"
                :key="p.performerId"
                :to="`/performers/${p.performerId}`"
                class="flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-slate-50 group"
              >
                <img
                  v-if="p.performerProfileImgUrl"
                  :src="p.performerProfileImgUrl"
                  :alt="p.performerName"
                  class="h-10 w-10 shrink-0 rounded-full border border-slate-100 object-cover group-hover:border-red-200"
                />
                <div
                  v-else
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400 group-hover:bg-red-50 group-hover:text-red-400"
                >
                  {{ (p.performerName || '?').charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-bold text-slate-800 group-hover:text-red-600 transition-colors">{{ p.performerName }}</div>
                  <div class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Liked Performer</div>
                </div>
                <ChevronRight class="h-4 w-4 shrink-0 text-slate-300 group-hover:text-red-600" />
              </RouterLink>
            </ul>
            <p v-if="likedPerformers.length > 5" class="mt-3 text-center text-[11px] font-bold text-slate-300 uppercase">
              + {{ likedPerformers.length - 5 }} More
            </p>

            <RouterLink
              to="/performers"
              class="mt-6 flex w-full items-center justify-center rounded-xl bg-slate-900 py-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-black"
            >
              전체 아티스트 탐색
            </RouterLink>
          </div>
        </div>

        <div class="rounded-2xl border border-dashed border-slate-200 p-6 text-center bg-slate-50/30">
          <p class="text-xs font-medium leading-relaxed text-slate-400">
            더 많은 아티스트를 팔로우하면<br />정교한 공연 추천을 받을 수 있습니다.
          </p>
          <RouterLink
            to="/performers"
            class="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 transition hover:text-red-600"
          >
            추천 더 보기 <ChevronRight class="h-3 w-3" />
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { Heart, ChevronRight, Plus, Clock } from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'ForUView',
  components: { Heart, ChevronRight, Plus, Clock },
  data() {
    return {
      api: null,
      userName: '회원',
      likedPerformers: [],
      allSchedules: [],
      selectedId: null,
      loading: false,
    }
  },
  computed: {
    selectedIdx() {
      if (this.selectedId === null) return 0
      const idx = this.likedPerformers.findIndex((p) => p.performerId === this.selectedId)
      return idx === -1 ? 0 : idx + 1
    },
    filteredSchedules() {
      if (this.selectedId === null) return this.allSchedules
      return this.allSchedules.filter((s) => s.performerId === this.selectedId)
    },
    addSlots() {
      return Math.max(0, 3 - this.likedPerformers.length)
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
        const [profileRes, likedRes] = await Promise.all([
          this.api.get(ENDPOINTS.me()).catch(() => null),
          this.api.get(ENDPOINTS.performerLikeList()).catch(() => []),
        ])

        const profile = profileRes?.data ?? profileRes
        this.userName = profile?.name ?? '회원'

        const likedArr = Array.isArray(likedRes) ? likedRes : likedRes?.content ?? []
        this.likedPerformers = likedArr.map((item) => ({
          id: item.id,
          performerId: item.performerId,
          performerName: item.performerName ?? '-',
          performerProfileImgUrl: item.performerProfileImgUrl ?? null,
        }))

        const withId = (this.likedPerformers || []).filter((p) => p?.performerId != null && p.performerId !== '')
        if (withId.length > 0) {
          const results = await Promise.all(
            withId.map((p) =>
              this.api.get(ENDPOINTS.performerSchedules(p.performerId)).catch(() => []),
            ),
          )

          const allSchedules = []
          results.forEach((res, idx) => {
            const arr = Array.isArray(res) ? res : res?.content ?? []
            const p = withId[idx]
            arr.forEach((s) => {
              allSchedules.push({
                key: `${p.performerId}-${s.scheduleId ?? s.id}`,
                scheduleId: s.scheduleId ?? s.id ?? null,
                performerId: p.performerId,
                performerName: p.performerName,
                performerImg: p.performerProfileImgUrl,
                title: s.concertTitle ?? s.title ?? '공연',
                displayText: s.displayText ?? s.startAt ?? '',
                role: s.role ?? null,
              })
            })
          })
          
          // 날짜 순으로 정렬 (Timeline 경험 개선)
          this.allSchedules = allSchedules.sort((a, b) => {
            const dateA = new Date(a.displayText || 0)
            const dateB = new Date(b.displayText || 0)
            return dateA - dateB
          })
        }
      } finally {
        this.loading = false
      }
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
