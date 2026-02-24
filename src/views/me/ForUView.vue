<template>
  <div class="grid gap-6">
    <!-- 페이지 헤더 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-pink-500 shadow-sm">
          <Star class="h-4 w-4 text-white" />
        </div>
        <div>
          <div class="text-lg font-bold text-slate-900">For U</div>
          <div class="text-xs text-slate-500">나를 위한 맞춤 공연 경험</div>
        </div>
      </div>
      <button
        class="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
        @click="$router.push('/')"
      >
        <ChevronLeft class="h-4 w-4" /> 홈으로
      </button>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- ── 공연 플래너 (left 2/3) ── -->
      <section class="lg:col-span-2 grid gap-4 content-start">
        <div class="flex items-center justify-between">
          <div class="text-base font-bold text-slate-900">공연 플래너</div>
          <span class="text-xs text-slate-400">{{ selectedIdx + 1 }} / {{ likedPerformers.length + 1 }}</span>
        </div>

        <!-- 아티스트 필터 -->
        <div
          class="flex gap-3 overflow-x-auto pb-2"
          style="scrollbar-width: none; -ms-overflow-style: none;"
        >
          <!-- ALL -->
          <button class="shrink-0 flex flex-col items-center gap-1.5" @click="selectedId = null">
            <div
              class="flex h-14 w-14 items-center justify-center rounded-full border-2 transition"
              :class="selectedId === null
                ? 'border-red-500 bg-red-50 shadow-sm'
                : 'border-slate-200 bg-slate-50 hover:border-red-300'"
            >
              <span
                class="text-xs font-black"
                :class="selectedId === null ? 'text-red-600' : 'text-slate-400'"
              >ALL</span>
            </div>
            <span
              class="text-xs font-medium whitespace-nowrap"
              :class="selectedId === null ? 'text-red-600' : 'text-slate-500'"
            >나의 일정</span>
          </button>

          <!-- 좋아요한 아티스트 -->
          <button
            v-for="p in likedPerformers"
            :key="p.id"
            class="shrink-0 flex flex-col items-center gap-1.5"
            @click="selectedId = p.id"
          >
            <div class="relative">
              <img
                v-if="p.profileImgUrl"
                :src="p.profileImgUrl"
                :alt="p.name"
                class="h-14 w-14 rounded-full object-cover border-2 transition"
                :class="selectedId === p.id
                  ? 'border-red-500 scale-105 shadow-md'
                  : 'border-slate-200 hover:border-red-300'"
              />
              <div
                v-else
                class="h-14 w-14 rounded-full border-2 flex items-center justify-center text-white text-lg font-bold transition"
                :style="{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }"
                :class="selectedId === p.id ? 'border-red-500 scale-105 shadow-md' : 'border-transparent'"
              >
                {{ p.name?.charAt(0) ?? '?' }}
              </div>
              <div
                v-if="selectedId === p.id"
                class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-red-500"
              ></div>
            </div>
            <span
              class="max-w-[56px] truncate text-xs font-medium whitespace-nowrap"
              :class="selectedId === p.id ? 'text-red-600' : 'text-slate-500'"
            >{{ p.name }}</span>
          </button>

          <!-- 추가 슬롯 -->
          <button
            v-for="i in addSlots"
            :key="`add-${i}`"
            class="shrink-0 flex flex-col items-center gap-1.5"
            @click="$router.push('/performers')"
          >
            <div class="h-14 w-14 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center hover:border-red-300 transition">
              <Plus class="h-4 w-4 text-slate-300" />
            </div>
            <span class="text-xs text-slate-300">추가</span>
          </button>
        </div>

        <!-- 인사말 카드 -->
        <div class="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 px-4 py-3">
          <div class="text-sm font-bold text-emerald-700">{{ userName }}님을 위한 공연일정입니다.</div>
          <div class="mt-0.5 text-xs text-slate-500">공연플래너에 담은 공연과 선호 아티스트의 공연스케줄을 타임라인으로 확인해보세요.</div>
        </div>

        <!-- 로딩 -->
        <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          불러오는 중…
        </div>

        <!-- 빈 상태 -->
        <div
          v-else-if="filteredSchedules.length === 0"
          class="rounded-2xl border border-slate-200 bg-slate-50 py-14 text-center"
        >
          <div class="text-sm font-medium text-slate-700">선호 아티스트와 매칭되는 공연이 없네요.</div>
          <div class="mt-1 text-xs text-slate-400">곧 좋은 공연을 준비하여 알려드리겠습니다.</div>
          <button
            class="mt-5 inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-red-300 hover:text-red-600"
            @click="$router.push('/')"
          >
            테마/지역별 공연보기 <ChevronRight class="h-4 w-4" />
          </button>
        </div>

        <!-- 스케줄 목록 -->
        <ul v-else class="grid gap-2">
          <li
            v-for="s in filteredSchedules"
            :key="s.key"
            class="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-red-200 hover:shadow-md"
          >
            <!-- 아티스트 아바타 -->
            <div class="shrink-0">
              <img
                v-if="s.performerImg"
                :src="s.performerImg"
                :alt="s.performerName"
                class="h-10 w-10 rounded-full object-cover border border-slate-200"
              />
              <div
                v-else
                class="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold border border-white shadow-sm"
              >
                {{ s.performerName?.charAt(0) ?? '?' }}
              </div>
            </div>

            <!-- 공연 정보 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-semibold text-red-500">{{ s.performerName }}</span>
                <span v-if="s.role" class="text-xs text-slate-400">· {{ s.role }}</span>
              </div>
              <div class="mt-0.5 truncate text-sm font-semibold text-slate-900">{{ s.title }}</div>
              <div v-if="s.displayText" class="mt-0.5 text-xs text-slate-400">{{ s.displayText }}</div>
            </div>

            <!-- 예매 버튼 -->
            <UiButton
              v-if="s.scheduleId"
              variant="tonal"
              class="h-9 shrink-0 px-3 text-xs"
              @click="$router.push(`/schedules/${s.scheduleId}`)"
            >
              예매
            </UiButton>
          </li>
        </ul>
      </section>

      <!-- ── 맞춤 공연 (right 1/3) ── -->
      <section class="grid gap-4 content-start">
        <div class="text-base font-bold text-slate-900">맞춤 공연</div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <!-- 아티스트 없을 때 -->
          <div v-if="likedPerformers.length === 0" class="text-center">
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Heart class="h-6 w-6 text-slate-300" />
            </div>
            <p class="mt-3 text-sm leading-relaxed text-slate-500">
              공연 준비중인 아티스트를 추가하고<br />공연을 추천받으세요.
            </p>
          </div>

          <!-- 아티스트 목록 -->
          <div v-else>
            <p class="text-xs font-semibold text-slate-500 mb-3">좋아요한 아티스트</p>
            <ul class="grid gap-1">
              <li
                v-for="p in likedPerformers.slice(0, 5)"
                :key="p.id"
                class="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50"
                @click="$router.push(`/performers/${p.id}`)"
              >
                <img
                  v-if="p.profileImgUrl"
                  :src="p.profileImgUrl"
                  :alt="p.name"
                  class="h-9 w-9 shrink-0 rounded-full border border-slate-200 object-cover"
                />
                <div
                  v-else
                  class="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-sm font-bold text-white"
                >
                  {{ p.name?.charAt(0) ?? '?' }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-semibold text-slate-800">{{ p.name }}</div>
                  <div class="text-xs text-slate-400">좋아요 {{ p.likeCount.toLocaleString() }}명</div>
                </div>
                <ChevronRight class="h-4 w-4 shrink-0 text-slate-300" />
              </li>
            </ul>
            <div v-if="likedPerformers.length > 5" class="mt-1 text-center text-xs text-slate-400">
              외 {{ likedPerformers.length - 5 }}명
            </div>
          </div>

          <button
            class="mt-5 w-full rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 py-3 text-sm font-bold text-white shadow-sm transition hover:from-red-600 hover:to-pink-600 active:scale-95"
            @click="$router.push('/performers')"
          >
            추천공연 확인하기
          </button>
        </div>

        <!-- 아티스트 탐색 유도 -->
        <div class="rounded-2xl border border-dashed border-slate-200 p-4 text-center">
          <p class="text-xs leading-relaxed text-slate-400">
            더 많은 아티스트를 좋아요하면<br />더 정확한 추천을 받을 수 있어요.
          </p>
          <button
            class="mt-3 text-xs font-semibold text-red-500 transition hover:underline"
            @click="$router.push('/performers')"
          >
            아티스트 탐색하기 →
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { Star, Heart, ChevronRight, ChevronLeft, Plus } from 'lucide-vue-next'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'ForUView',
  components: { Star, Heart, ChevronRight, ChevronLeft, Plus, UiButton },
  data() {
    return {
      api: null,
      userName: '회원',
      likedPerformers: [],
      allSchedules: [],
      selectedId: null,
      loading: false
    }
  },
  computed: {
    selectedIdx() {
      if (this.selectedId === null) return 0
      const idx = this.likedPerformers.findIndex((p) => p.id === this.selectedId)
      return idx === -1 ? 0 : idx + 1
    },
    filteredSchedules() {
      if (this.selectedId === null) return this.allSchedules
      return this.allSchedules.filter((s) => s.performerId === this.selectedId)
    },
    addSlots() {
      return Math.max(0, 3 - this.likedPerformers.length)
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
        // 유저 정보 + 좋아요한 아티스트 병렬 로딩
        const [profileRes, likedRes] = await Promise.all([
          this.api.get(ENDPOINTS.me()).catch(() => null),
          this.api.get(ENDPOINTS.performerLikeList()).catch(() => [])
        ])

        const profile = profileRes?.data ?? profileRes
        this.userName = profile?.name ?? '회원'

        const likedArr = Array.isArray(likedRes) ? likedRes : likedRes?.content ?? []
        this.likedPerformers = likedArr.map((item) => ({
          id: item.id,
          name: item.name ?? '-',
          profileImgUrl: item.profileImgUrl ?? null,
          likeCount: item.likeCount ?? 0
        }))

        // 각 아티스트의 스케줄 병렬 로딩
        if (this.likedPerformers.length > 0) {
          const results = await Promise.all(
            this.likedPerformers.map((p) =>
              this.api.get(ENDPOINTS.performerSchedules(p.id)).catch(() => [])
            )
          )

          const allSchedules = []
          results.forEach((res, idx) => {
            const arr = Array.isArray(res) ? res : res?.content ?? []
            const p = this.likedPerformers[idx]
            arr.forEach((s) => {
              allSchedules.push({
                key: `${p.id}-${s.scheduleId ?? s.id}`,
                scheduleId: s.scheduleId ?? s.id ?? null,
                performerId: p.id,
                performerName: p.name,
                performerImg: p.profileImgUrl,
                title: s.concertTitle ?? s.title ?? '공연',
                displayText: s.displayText ?? s.startAt ?? '',
                role: s.role ?? null
              })
            })
          })
          this.allSchedules = allSchedules
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
div::-webkit-scrollbar {
  display: none;
}
</style>
