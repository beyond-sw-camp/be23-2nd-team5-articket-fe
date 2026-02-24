<template>
  <div class="mx-auto max-w-4xl grid gap-6">
    <!-- 로딩 -->
    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
      불러오는 중…
    </div>

    <template v-else-if="item">
      <!-- 프로필 카드 -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-wrap items-start gap-5">
          <!-- 프로필 이미지 -->
          <img
            v-if="item.profileImgUrl"
            :src="item.profileImgUrl"
            :alt="item.name"
            class="h-28 w-24 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div
            v-else
            class="flex h-28 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 text-3xl font-bold border border-slate-200"
          >
            {{ item.name?.charAt(0) ?? '?' }}
          </div>

          <!-- 정보 -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <h1 class="text-2xl font-bold text-slate-900">{{ item.name }}</h1>
              <div class="flex items-center gap-2">
                <UiButton
                  v-if="isOrganizerOrAdmin"
                  variant="ghost"
                  class="h-9 px-3 text-sm"
                  @click="$router.push('/organizer/performers')"
                >
                  ← 목록
                </UiButton>
                <UiButton
                  v-if="canLike"
                  :variant="item.liked ? 'tonal' : 'ghost'"
                  class="h-9 px-4 text-sm"
                  @click="toggleLike"
                >
                  <Heart :class="{ 'fill-red-500 text-red-500': item.liked }" class="h-4 w-4" />
                  <span class="ml-1.5">{{ item.liked ? '좋아요 취소' : '좋아요' }}</span>
                </UiButton>
              </div>
            </div>

            <div class="mt-3 grid gap-1 text-sm text-slate-600">
              <div class="text-sm font-semibold text-green-600">
                좋아요 {{ item.likeCount.toLocaleString() }}명
              </div>
              <div v-if="item.birth">
                <span class="text-slate-400">생년월일:</span>
                <span class="ml-1.5">{{ item.birth }}</span>
              </div>
              <div v-if="item.description" class="mt-1 text-slate-600 leading-relaxed">
                {{ item.description }}
              </div>
            </div>

            <RouterLink v-if="canLike" to="/me/performers/likes" class="mt-3 inline-block text-xs text-slate-400 hover:underline">
              내가 좋아요한 공연자 보기 →
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- 출연 공연 -->
      <div>
        <h2 class="mb-3 text-base font-bold text-slate-900">
          출연 공연
          <span v-if="concerts.length" class="ml-1 text-sm font-normal text-slate-400">({{ concerts.length }})</span>
        </h2>

        <!-- 공연 없음 -->
        <div v-if="concerts.length === 0" class="rounded-2xl border border-slate-200 bg-slate-50 py-12 text-center">
          <p class="text-sm font-medium text-slate-700">"{{ item.name }}"에 대한 공연 정보가 없습니다.</p>
          <p v-if="schedules.length > 0" class="mt-1 text-xs text-slate-400">출연 회차를 확인해보세요.</p>
        </div>

        <!-- 공연 그리드 -->
        <ul v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="c in concerts"
            :key="c.id ?? c.concertId"
            class="group cursor-pointer rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition hover:border-red-300 hover:shadow"
            @click="c.concertId && $router.push(`/concerts/${c.concertId}`)"
          >
            <!-- 포스터 플레이스홀더 -->
            <div class="flex h-36 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <span class="text-xs text-slate-400">포스터 없음</span>
            </div>
            <div class="p-3">
              <p class="font-semibold text-sm text-slate-900 line-clamp-2">
                {{ c.title || c.concertTitle || '공연' }}
              </p>
              <p v-if="c.venueName" class="mt-1 text-xs text-slate-500">{{ c.venueName }}</p>
              <p v-if="c.startDate || c.date" class="mt-0.5 text-xs text-slate-400">
                {{ c.startDate || c.date }}
              </p>
              <span
                v-if="c.concertId"
                class="mt-2 inline-block text-xs font-medium text-red-500 group-hover:underline"
              >
                상세 보기 →
              </span>
            </div>
          </li>
        </ul>
      </div>

      <!-- 출연 회차 -->
      <div v-if="schedules.length > 0">
        <h2 class="mb-3 text-base font-bold text-slate-900">
          출연 회차
          <span class="ml-1 text-sm font-normal text-slate-400">({{ schedules.length }})</span>
        </h2>
        <ul class="grid gap-2">
          <li
            v-for="s in schedules"
            :key="s.scheduleId || s.id"
            class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <div>
              <p class="text-sm font-medium text-slate-800">{{ s.concertTitle || s.title || '회차' }}</p>
              <p class="mt-0.5 text-xs text-slate-400">{{ s.displayText || s.startAt || '' }}</p>
            </div>
            <UiButton
              v-if="s.scheduleId"
              variant="tonal"
              class="h-9 px-4 text-sm shrink-0"
              @click="$router.push(`/schedules/${s.scheduleId}`)"
            >
              예매
            </UiButton>
          </li>
        </ul>
      </div>
    </template>

    <!-- 공연자 없음 -->
    <div v-else class="rounded-2xl border border-slate-200 bg-white p-10 text-center">
      <p class="text-sm text-slate-500">공연자를 찾을 수 없습니다.</p>
      <UiButton variant="ghost" class="mt-3" @click="$router.push('/performers')">목록으로</UiButton>
    </div>
  </div>
</template>

<script>
import { Heart } from 'lucide-vue-next'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { useRole } from '../../composables/useRole'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'PerformerDetailView',
  components: { Heart, UiButton },
  data() {
    return {
      item: null,
      concerts: [],
      schedules: [],
      loading: false,
      api: null,
      role: null
    }
  },
  computed: {
    canLike() {
      const r = this.role?.value ?? this.role ?? 'GUEST'
      return r === 'MEMBER' || r === 'USER'
    },
    isOrganizerOrAdmin() {
      const r = this.role?.value ?? this.role ?? 'GUEST'
      return r === 'ORGANIZER' || r === 'ADMIN'
    }
  },
  created() {
    this.api = useApi()
    const { role } = useRole()
    this.role = role
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      const performerId = this.$route.params.performerId
      if (!performerId) return
      this.loading = true
      try {
        const [detail, concertsRes, schedulesRes] = await Promise.all([
          this.api.get(ENDPOINTS.performerDetail(performerId)),
          this.api.get(ENDPOINTS.performerConcerts(performerId)).catch(() => []),
          this.api.get(ENDPOINTS.performerSchedules(performerId)).catch(() => [])
        ])
        this.item = {
          id: detail.id,
          name: detail.name ?? '-',
          profileImgUrl: detail.profileImgUrl ?? null,
          description: detail.description ?? '',
          birth: detail.birth ?? null,
          likeCount: detail.likeCount ?? 0,
          liked: detail.liked ?? false
        }
        this.concerts = Array.isArray(concertsRes) ? concertsRes : concertsRes?.content ?? []
        this.schedules = Array.isArray(schedulesRes) ? schedulesRes : schedulesRes?.content ?? []
      } catch {
        this.item = null
        this.concerts = []
        this.schedules = []
      } finally {
        this.loading = false
      }
    },
    async toggleLike() {
      if (!this.item || !this.canLike) return
      try {
        if (this.item.liked) {
          await this.api.del(ENDPOINTS.performerDeleteLike() + '?id=' + this.item.id)
          this.item.liked = false
          this.item.likeCount--
        } else {
          await this.api.post(ENDPOINTS.performerLike() + '?id=' + this.item.id)
          this.item.liked = true
          this.item.likeCount++
        }
      } catch (e) {
        console.warn('Like toggle failed', e)
      }
    }
  }
}
</script>
