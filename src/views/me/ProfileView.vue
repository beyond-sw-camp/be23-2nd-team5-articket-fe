<template>
  <div class="mx-auto max-w-5xl space-y-6 pb-12">
    <!-- 로딩 -->
    <div
      v-if="loading && !profile"
      class="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white py-12"
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

    <!-- 에러 -->
    <div
      v-else-if="!profile"
      class="rounded-2xl border border-slate-200 bg-white p-8 text-center"
    >
      <p class="text-sm text-slate-600">정보를 불러오지 못했습니다.</p>
      <button
        type="button"
        class="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        @click="load"
      >
        다시 시도
      </button>
    </div>

    <template v-else>
      <!-- 상단: 프로필 + 통계 카드 -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">
                {{ profile.name || '회원' }}
              </h1>
              <span
                class="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-semibold text-slate-600"
              >
                {{ roleLabel }}
              </span>
            </div>
            <div class="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span class="flex items-center gap-1.5">
                <Mail class="h-4 w-4 shrink-0 text-slate-400" />
                {{ profile.email || '-' }}
                <Icon
                  v-if="profile.socialType === 'GOOGLE'"
                  icon="logos:google-icon"
                  class="h-5 w-5 shrink-0"
                  title="Google"
                />
                <Icon
                  v-else-if="profile.socialType === 'KAKAO'"
                  icon="simple-icons:kakaotalk"
                  class="h-5 w-5 shrink-0"
                  :style="{ color: '#191919' }"
                  title="카카오"
                />
              </span>
            </div>
            <dl class="mt-4 grid gap-2 sm:grid-cols-2">
              <div>
                <dt class="text-xs font-medium text-slate-500">연락처</dt>
                <dd class="mt-0.5 text-sm font-medium text-slate-900">{{ profile.phoneNumber || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-slate-500">생년월일</dt>
                <dd class="mt-0.5 text-sm font-medium text-slate-900">{{ verifiedBirthDateFormatted }}</dd>
              </div>
            </dl>
            <div class="mt-4 flex flex-wrap gap-3">
              <RouterLink
                to="/me/edit"
                class="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                프로필 수정
              </RouterLink>
              <button
                type="button"
                class="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                알림 설정
              </button>
            </div>
            <!-- 본인인증: 상태 표시 + 미완료 시 인증하기 링크 -->
            <div class="mt-4 flex flex-wrap items-center gap-2">
              <span class="text-xs font-medium text-slate-500">본인인증</span>
              <span
                :class="ageVerifiedAt
                  ? 'rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800'
                  : 'rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600'"
              >
                {{ ageVerifiedAt ? '완료' : '미완료' }}
              </span>
              <RouterLink
                v-if="!ageVerifiedAt"
                to="/me/verify-identity"
                class="text-xs font-semibold text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
              >
                인증하기 →
              </RouterLink>
            </div>
          </div>
          <div class="flex shrink-0 gap-6 rounded-xl border border-slate-100 bg-slate-50/50 px-6 py-4 sm:gap-10">
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-slate-400">가입일</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ joinDateFormatted }}</p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-slate-400">관람 공연</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ viewingCount }}회</p>
            </div>
          </div>
        </div>

        <!-- 주최자 신청 현황 -->
        <div
          v-if="hasAppliedForOrganizer"
          class="mt-6 rounded-xl border p-4"
          :class="organizerStatusClass"
        >
          <p class="text-xs font-semibold text-slate-500">주최자 신청 현황</p>
          <div class="mt-1 flex flex-wrap items-center gap-2">
            <span class="text-sm font-semibold text-slate-900">{{ organizerStatusLabel }}</span>
            <span
              v-if="profile.organizerStatus === 'PENDING'"
              class="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800"
            >검토 중</span>
            <span
              v-else-if="profile.organizerStatus === 'APPROVED'"
              class="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
            >승인됨</span>
            <span
              v-else-if="profile.organizerStatus === 'REJECTED'"
              class="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"
            >거절됨</span>
          </div>
          <p v-if="profile.organizerStatus === 'PENDING'" class="mt-2 text-xs text-slate-600">
            관리자 검토 후 승인되면 공연 등록·관리 메뉴를 이용하실 수 있습니다.
          </p>
        </div>
      </div>

      <!-- 좋아요한 아티스트 / 좋아요한 공연 바로가기 -->
      <div class="grid gap-3 sm:grid-cols-2">
        <RouterLink
          to="/me/performers/likes"
          class="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Heart class="h-6 w-6" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-900">좋아요한 아티스트</p>
            <p class="mt-0.5 text-xs text-slate-500">내가 좋아요한 아티스트 목록</p>
          </div>
          <ChevronRight class="h-5 w-5 shrink-0 text-slate-400" />
        </RouterLink>
        <RouterLink
          to="/me/concerts/likes"
          class="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Star class="h-6 w-6" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-900">좋아요한 공연</p>
            <p class="mt-0.5 text-xs text-slate-500">내가 좋아요한 공연 목록</p>
          </div>
          <ChevronRight class="h-5 w-5 shrink-0 text-slate-400" />
        </RouterLink>
      </div>

      <!-- 하단 2열: 관람 취향 + EXPERIENCE | 최근 활동 -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- 왼쪽: 관람 취향 + EXPERIENCE -->
        <div class="space-y-6 lg:col-span-2">
          <!-- 나의 관람 취향 -->
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="flex items-center gap-2 text-base font-bold text-slate-900">
              <BarChart2 class="h-5 w-5 text-slate-500" />
              나의 관람 취향
            </h2>
            <div v-if="genreStats.length > 0" class="mt-4 space-y-4">
              <div>
                <p class="text-xs font-medium uppercase tracking-wider text-slate-400">Favorite Genre</p>
                <p class="mt-1 text-lg font-bold text-slate-900">
                  {{ getCategoryLabel(genreStats[0].category) }}
                </p>
                <p class="text-sm text-slate-500">
                  전체 관람의 {{ genreStats[0].percentage }}% 차지
                </p>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(item, i) in genreStats.slice(0, 3)"
                  :key="item.category"
                  class="flex items-center gap-3"
                >
                  <div class="w-24 shrink-0 text-sm font-medium text-slate-700">
                    {{ getCategoryLabel(item.category) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        class="h-full rounded-full transition-all"
                        :class="i === 0 ? 'bg-red-500' : 'bg-slate-300'"
                        :style="{ width: item.percentage + '%' }"
                      />
                    </div>
                  </div>
                  <span class="w-10 shrink-0 text-right text-sm font-semibold text-slate-600">
                    {{ item.percentage }}%
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="mt-4 rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-500">
              관람 이력이 있으면 취향 분석이 표시됩니다.
            </div>
          </div>

          <!-- EXPERIENCE -->
          <div class="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wider text-slate-400">Experience</p>
            <p class="mt-2 text-lg font-bold leading-snug">
              "{{ experienceQuote }}"
            </p>
            <p class="mt-2 text-sm text-slate-300">
              {{ experienceSubtext }}
            </p>
            <div v-if="experienceBadges.length > 0" class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="badge in experienceBadges"
                :key="badge"
                class="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200"
              >
                #{{ badge }}
              </span>
            </div>
          </div>
        </div>

        <!-- 오른쪽: 최근 활동 내역 -->
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="flex items-center gap-2 text-base font-bold text-slate-900">
            <Clock class="h-5 w-5 text-slate-500" />
            최근 활동 내역
          </h2>
          <ul v-if="formattedActivities.length > 0" class="mt-4 space-y-4">
            <li
              v-for="(act, i) in formattedActivities"
              :key="i"
              class="flex flex-col gap-0.5 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
            >
              <p class="text-xs font-semibold text-slate-500">{{ act.typeLabel }}</p>
              <p class="text-sm font-semibold text-slate-900">{{ act.title }}</p>
              <p class="text-xs text-slate-400">{{ act.timeAgo }}</p>
            </li>
          </ul>
          <div v-else class="mt-4 rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-500">
            최근 활동이 없습니다.
          </div>
          <div class="mt-4 text-center">
            <RouterLink
              to="/me/orders"
              class="text-sm font-semibold text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            >
              전체 활동 보기
            </RouterLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { Icon } from '@iconify/vue'
import { Mail, BarChart2, Clock, Heart, Star, ChevronRight } from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { useMe } from '../../composables/useMe'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { getCategoryLabel } from '../../lib/constants/concertCategory'

function timeAgo(isoStr) {
  if (!isoStr) return '-'
  const d = new Date(isoStr)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400 * 2) return `${Math.floor(diff / 86400)}일 전`
  if (diff < 86400 * 7) return '1주일 전'
  if (diff < 86400 * 14) return '2주일 전'
  if (diff < 86400 * 30) return '1개월 전'
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default {
  name: 'ProfileView',
  components: { Icon, Mail, BarChart2, Clock, Heart, Star, ChevronRight },
  data() {
    return {
      profile: null,
      genreStats: [],
      recentActivities: [],
      loading: false,
      api: null,
      me: null,
    }
  },
  computed: {
    roleLabel() {
      const r = this.profile?.role
      if (r === 'ORGANIZER') return '주최자'
      if (r === 'ADMIN') return '관리자'
      return '일반 회원'
    },
    /** 본인인증 완료일 (있으면 완료, 없으면 미완료) */
    ageVerifiedAt() {
      return this.profile?.ageVerifiedAt ?? null
    },
    /** 생년월일 표시 (본인인증 완료 시 인증된 생년월일 등) */
    verifiedBirthDateFormatted() {
      const raw = this.profile?.verifiedBirthDate ?? this.profile?.birthDate ?? this.profile?.ageVerifiedAt ?? null
      if (!raw) return '-'
      const d = new Date(raw)
      if (isNaN(d.getTime())) return '-'
      return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    },
    joinDateFormatted() {
      const raw = this.profile?.createdTime ?? this.profile?.createdAt ?? null
      if (!raw) return '-'
      const d = new Date(raw)
      if (isNaN(d.getTime())) return '-'
      return d.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')
    },
    viewingCount() {
      return this.profile?.viewingCount ?? 0
    },
    hasAppliedForOrganizer() {
      const s = this.profile?.organizerStatus
      return ['PENDING', 'APPROVED', 'REJECTED'].includes(s)
    },
    organizerStatusLabel() {
      const s = this.profile?.organizerStatus
      if (s === 'PENDING') return '검토 중'
      if (s === 'APPROVED') return '승인됨'
      if (s === 'REJECTED') return '거절됨'
      return s ?? '-'
    },
    organizerStatusClass() {
      const s = this.profile?.organizerStatus
      if (s === 'PENDING') return 'border-amber-200 bg-amber-50'
      if (s === 'APPROVED') return 'border-green-200 bg-green-50'
      if (s === 'REJECTED') return 'border-red-200 bg-red-50'
      return 'border-slate-200 bg-slate-50'
    },
    experienceQuote() {
      const count = this.viewingCount
      if (count >= 20) return '공연을 사랑하는 열정가'
      if (count >= 10) return '꾸준한 관람러'
      if (count >= 1) return '공연과 함께하는 일상'
      return '첫 관람을 기다리고 있어요'
    },
    experienceSubtext() {
      const count = this.viewingCount
      if (count >= 20) return '상위 12%의 관람 기록을 보유 중입니다.'
      if (count >= 10) return '꾸준히 공연을 즐기고 있어요.'
      if (count >= 1) return '관람 이력을 쌓아가고 있어요.'
      return '예매한 공연을 관람하면 여기에 표시됩니다.'
    },
    experienceBadges() {
      const count = this.viewingCount
      const badges = []
      if (count >= 20) badges.push('프로관빨러', '뮤지컬매니아')
      else if (count >= 10) badges.push('관람러')
      else if (count >= 1) badges.push('시작한 지 얼마 안 됐어요')
      return badges
    },
    formattedActivities() {
      return this.recentActivities.map((act) => ({
        ...act,
        title: act.concertTitle || '공연',
        timeAgo: timeAgo(act.createdAt),
      }))
    },
  },
  created() {
    this.api = useApi()
    const { refetch, fetchGenrePreferences, fetchRecentActivities } = useMe()
    this.me = { refetch, fetchGenrePreferences, fetchRecentActivities }
  },
  mounted() {
    this.load()
  },
  methods: {
    getCategoryLabel,
    async load() {
      this.loading = true
      try {
        this.profile = await this.me.refetch()
        this.genreStats = await this.me.fetchGenrePreferences()
        const activitiesRes = await this.me.fetchRecentActivities({ page: 0, size: 5 })
        this.recentActivities = activitiesRes?.content || []
      } catch (e) {
        console.error('Failed to load profile data:', e)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
