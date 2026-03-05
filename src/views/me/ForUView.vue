<template>
  <div class="mx-auto max-w-5xl space-y-6 pb-12">
    <!-- 헤더 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 shadow-sm">
          <Star class="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">For U</h1>
          <p class="mt-0.5 text-sm text-slate-500">나를 위한 맞춤 공연 경험</p>
        </div>
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
      <section class="content-start space-y-4 lg:col-span-2">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-bold text-slate-900">공연 플래너</h2>
          <span class="text-xs text-slate-400">{{ selectedIdx + 1 }} / {{ likedPerformers.length + 1 }}</span>
        </div>

        <!-- 아티스트 필터 -->
        <div
          class="flex gap-3 overflow-x-auto pb-2 foru-scroll-hide"
        >
          <button
            type="button"
            class="flex shrink-0 flex-col items-center gap-1.5"
            @click="selectedId = null"
          >
            <div
              class="flex h-14 w-14 items-center justify-center rounded-full border-2 transition"
              :class="selectedId === null
                ? 'border-slate-900 bg-slate-100'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300'"
            >
              <span
                class="text-xs font-bold"
                :class="selectedId === null ? 'text-slate-900' : 'text-slate-400'"
              >ALL</span>
            </div>
            <span
              class="whitespace-nowrap text-xs font-medium"
              :class="selectedId === null ? 'text-slate-900' : 'text-slate-500'"
            >나의 일정</span>
          </button>

          <button
            v-for="p in likedPerformers"
            :key="p.performerId"
            type="button"
            class="flex shrink-0 flex-col items-center gap-1.5"
            @click="selectedId = p.performerId"
          >
            <div class="relative">
              <img
                v-if="p.performerProfileImgUrl"
                :src="p.performerProfileImgUrl"
                :alt="p.performerName"
                class="h-14 w-14 rounded-full border-2 object-cover transition"
                :class="selectedId === p.performerId
                  ? 'border-slate-900 scale-105 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'"
              />
              <div
                v-else
                class="flex h-14 w-14 items-center justify-center rounded-full border-2 text-lg font-bold text-white transition"
                :class="selectedId === p.performerId
                  ? 'border-slate-900 scale-105 bg-slate-700 shadow-md'
                  : 'border-slate-200 bg-slate-500'"
              >
                {{ (p.performerName || '?').charAt(0) }}
              </div>
              <div
                v-if="selectedId === p.performerId"
                class="absolute -bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-slate-900"
              />
            </div>
            <span
              class="max-w-[56px] truncate whitespace-nowrap text-xs font-medium"
              :class="selectedId === p.performerId ? 'text-slate-900' : 'text-slate-500'"
            >{{ p.performerName }}</span>
          </button>

          <button
            v-for="i in addSlots"
            :key="`add-${i}`"
            type="button"
            class="flex shrink-0 flex-col items-center gap-1.5"
            @click="$router.push('/performers')"
          >
            <div class="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-slate-200 transition hover:border-slate-300">
              <Plus class="h-4 w-4 text-slate-300" />
            </div>
            <span class="text-xs text-slate-400">추가</span>
          </button>
        </div>

        <!-- 인사말 카드 -->
        <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p class="text-sm font-bold text-slate-800">{{ userName }}님을 위한 공연일정입니다.</p>
          <p class="mt-0.5 text-xs text-slate-500">공연플래너에 담은 공연과 선호 아티스트의 공연스케줄을 타임라인으로 확인해보세요.</p>
        </div>

        <!-- 로딩 -->
        <div
          v-if="loading"
          class="flex min-h-[180px] items-center justify-center rounded-2xl border border-slate-200 bg-white py-12"
        >
          <div class="flex flex-col items-center gap-3 text-slate-500">
            <svg
              class="h-8 w-8 animate-spin text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span class="text-sm">불러오는 중…</span>
          </div>
        </div>

        <!-- 빈 상태 -->
        <div
          v-else-if="filteredSchedules.length === 0"
          class="rounded-2xl border border-slate-200 bg-white py-14 text-center"
        >
          <p class="text-sm font-medium text-slate-700">선호 아티스트와 매칭되는 공연이 없네요.</p>
          <p class="mt-1 text-xs text-slate-400">곧 좋은 공연을 준비하여 알려드리겠습니다.</p>
          <RouterLink
            to="/"
            class="mt-5 inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            테마/지역별 공연보기 <ChevronRight class="h-4 w-4" />
          </RouterLink>
        </div>

        <!-- 스케줄 목록 -->
        <ul v-else class="grid gap-2">
          <li
            v-for="s in filteredSchedules"
            :key="s.key"
            class="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300"
          >
            <div class="shrink-0">
              <img
                v-if="s.performerImg"
                :src="s.performerImg"
                :alt="s.performerName"
                class="h-10 w-10 rounded-full border border-slate-200 object-cover"
              />
              <div
                v-else
                class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-500 text-sm font-bold text-white"
              >
                {{ s.performerName?.charAt(0) ?? '?' }}
              </div>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-semibold text-slate-700">{{ s.performerName }}</span>
                <span v-if="s.role" class="text-xs text-slate-400">· {{ s.role }}</span>
              </div>
              <div class="mt-0.5 truncate text-sm font-semibold text-slate-900">{{ s.title }}</div>
              <div v-if="s.displayText" class="mt-0.5 text-xs text-slate-400">{{ s.displayText }}</div>
            </div>

            <RouterLink
              v-if="s.scheduleId"
              :to="`/schedules/${s.scheduleId}`"
              class="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              예매
            </RouterLink>
          </li>
        </ul>
      </section>

      <!-- 맞춤 공연 (우측 1/3) -->
      <section class="content-start space-y-4">
        <h2 class="text-base font-bold text-slate-900">맞춤 공연</h2>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div v-if="likedPerformers.length === 0" class="text-center">
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Heart class="h-6 w-6 text-slate-300" />
            </div>
            <p class="mt-3 text-sm leading-relaxed text-slate-500">
              공연 준비중인 아티스트를 추가하고<br />공연을 추천받으세요.
            </p>
          </div>

          <div v-else>
            <p class="mb-3 text-xs font-semibold text-slate-500">좋아요한 아티스트</p>
            <ul class="grid gap-1">
              <RouterLink
                v-for="p in likedPerformers.slice(0, 5)"
                :key="p.performerId"
                :to="`/performers/${p.performerId}`"
                class="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50"
              >
                <img
                  v-if="p.performerProfileImgUrl"
                  :src="p.performerProfileImgUrl"
                  :alt="p.performerName"
                  class="h-9 w-9 shrink-0 rounded-full border border-slate-200 object-cover"
                />
                <div
                  v-else
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-500 text-sm font-bold text-white"
                >
                  {{ (p.performerName || '?').charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-semibold text-slate-800">{{ p.performerName }}</div>
                  <div class="text-xs text-slate-400">좋아요한 아티스트</div>
                </div>
                <ChevronRight class="h-4 w-4 shrink-0 text-slate-300" />
              </RouterLink>
            </ul>
            <p v-if="likedPerformers.length > 5" class="mt-1 text-center text-xs text-slate-400">
              외 {{ likedPerformers.length - 5 }}명
            </p>
          </div>

          <RouterLink
            to="/performers"
            class="mt-5 flex w-full items-center justify-center rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            추천공연 확인하기
          </RouterLink>
        </div>

        <div class="rounded-2xl border border-dashed border-slate-200 p-4 text-center">
          <p class="text-xs leading-relaxed text-slate-400">
            더 많은 아티스트를 좋아요하면<br />더 정확한 추천을 받을 수 있어요.
          </p>
          <RouterLink
            to="/performers"
            class="mt-3 inline-block text-xs font-semibold text-slate-700 transition hover:underline"
          >
            아티스트 탐색하기 →
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { Star, Heart, ChevronRight, Plus } from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'ForUView',
  components: { Star, Heart, ChevronRight, Plus },
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
          this.allSchedules = allSchedules
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
