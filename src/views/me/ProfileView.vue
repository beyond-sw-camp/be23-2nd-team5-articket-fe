<template>
  <div class="mx-auto space-y-6 pb-12 max-w-6xl">
    <!-- 헤더 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
      <div>
        <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">마이페이지</h1>
        <p class="mt-1 text-sm text-slate-500">마이페이지 · 회원님의 프로필 정보입니다.</p>
      </div>
      <div class="flex items-center gap-2">
        <UiButton 
          variant="ghost" 
          class="!h-10 !rounded-xl !px-4 !text-sm !font-semibold !border-slate-200"
          @click="openEditModal"
        >
          프로필 수정
        </UiButton>
      </div>
    </div>

    <!-- 로딩 -->
    <div v-if="loading && !profile" class="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white py-12">
      <div class="flex flex-col items-center gap-3 text-slate-500">
        <svg class="h-8 w-8 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span class="text-sm font-medium">불러오는 중…</span>
      </div>
    </div>

    <template v-else-if="profile">
      <!-- Section 1: 프로필 상단 카드 -->
      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-6">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-bold text-slate-900 sm:text-2xl">
                {{ profile.name || '회원' }}
              </h2>
              <UiBadge color="slate" tone="soft" class="!px-2 !py-0.5 !text-[11px]">
                {{ roleLabel }}
              </UiBadge>
            </div>
            <p class="mt-2 text-sm text-slate-600 font-medium">
              아트티켓과 함께 예술의 가치를 더하고 있습니다.
            </p>
          </div>
          <div class="flex shrink-0 gap-6 rounded-xl border border-slate-100 bg-slate-50/50 px-5 py-3 sm:gap-8">
            <div>
              <p class="text-[11px] font-medium uppercase text-slate-400">가입일</p>
              <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ joinDateFormatted }}</p>
            </div>
            <div>
              <p class="text-[11px] font-medium uppercase text-slate-400">관람 공연</p>
              <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ viewingCount }}회</p>
            </div>
          </div>
        </div>

        <!-- 4열 정보 그리드 -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 mt-6">
          <div class="space-y-1">
            <p class="text-[11px] font-medium text-slate-500">이메일 (Email)</p>
            <p class="text-sm font-semibold text-slate-900">{{ profile.email || '-' }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-[11px] font-medium text-slate-500">연락처 (Phone)</p>
            <p class="text-sm font-semibold text-slate-900">{{ profile.phoneNumber || '-' }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-[11px] font-medium text-slate-500">생년월일 (Birth)</p>
            <p class="text-sm font-semibold text-slate-900">{{ verifiedBirthDateFormatted }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-[11px] font-medium text-slate-500">본인인증 (Verified)</p>
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-1.5 text-sm font-bold" :class="ageVerifiedAt ? 'text-emerald-600' : 'text-red-600'">
                <CheckCircle v-if="ageVerifiedAt" class="h-4 w-4" />
                <ShieldAlert v-else class="h-4 w-4" />
                <span>{{ ageVerifiedAt ? '본인인증 완료' : '미인증 회원' }}</span>
              </div>
              <RouterLink v-if="!ageVerifiedAt" to="/me/verify-identity" class="text-[11px] font-bold text-slate-400 hover:text-red-600 hover:underline">인증하기 →</RouterLink>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 2: 메인 그리드 -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <!-- 왼쪽: 통계 및 링크 (8열) -->
        <div class="space-y-6 lg:col-span-8">
          <!-- 관람 취향 통계 -->
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div class="mb-5 flex items-center gap-2">
              <BarChart3 class="h-5 w-5 text-red-600" />
              <h2 class="text-base font-bold text-slate-900">나의 관람 취향</h2>
            </div>
            
            <div v-if="genreStats.length > 0" class="space-y-5 rounded-xl bg-slate-50 p-5">
              <div v-for="genre in genreStats.slice(0, 3)" :key="genre.category" class="space-y-2">
                <div class="flex items-center justify-between text-xs font-bold">
                  <span class="text-slate-700">{{ getCategoryLabel(genre.category) }}</span>
                  <span class="text-red-600">{{ genre.percentage }}%</span>
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div 
                    class="h-full rounded-full bg-red-600 transition-all duration-700" 
                    :style="{ width: `${genre.percentage}%` }"
                  />
                </div>
              </div>
            </div>
            <div v-else class="rounded-xl bg-slate-50 py-10 text-center">
              <p class="text-xs font-medium text-slate-400">관람 이력이 있으면 취향 분석이 표시됩니다.</p>
            </div>
          </div>

          <!-- 바로가기 링크 -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <RouterLink 
              to="/me/performers/likes"
              class="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
            >
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-red-50 group-hover:text-red-600">
                <Heart class="h-5 w-5" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-bold text-slate-900">좋아한 아티스트</p>
                <p class="mt-0.5 text-xs text-slate-500 font-medium">내가 좋아요한 아티스트 목록</p>
              </div>
            </RouterLink>
            <RouterLink 
              to="/me/concerts/likes"
              class="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
            >
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-red-50 group-hover:text-red-600">
                <Star class="h-5 w-5" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-bold text-slate-900">좋아한 공연</p>
                <p class="mt-0.5 text-xs text-slate-500 font-medium">내가 좋아요한 공연 목록</p>
              </div>
            </RouterLink>
          </div>
        </div>

        <!-- 오른쪽: 활동 내역 (4열) -->
        <div class="lg:col-span-4 space-y-6">
          <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4 sm:px-5">
              <div class="flex items-center gap-2">
                <Clock class="h-4 w-4 text-slate-400" />
                <h2 class="text-sm font-bold text-slate-900">최근 활동 내역</h2>
              </div>
              <RouterLink to="/me/orders" class="text-[11px] font-bold text-slate-400 hover:text-red-600">전체보기</RouterLink>
            </div>
            <div v-if="formattedActivities.length > 0" class="divide-y divide-slate-100">
              <div 
                v-for="(act, idx) in formattedActivities" 
                :key="idx" 
                class="group cursor-pointer p-4 sm:px-5 transition-colors hover:bg-slate-50"
              >
                <p class="text-[10px] font-bold text-red-500 uppercase">{{ act.typeLabel }}</p>
                <h4 class="mt-1 text-sm font-bold text-slate-800 transition-colors group-hover:text-red-600 line-clamp-1">
                  {{ act.title }}
                </h4>
                <p class="mt-1 text-[10px] font-medium text-slate-400">{{ act.timeAgo }}</p>
              </div>
            </div>
            <div v-else class="p-10 text-center">
              <p class="text-xs font-medium text-slate-300">최근 활동이 없습니다.</p>
            </div>
          </div>

          <!-- 주최자 상태 -->
          <div
            v-if="hasAppliedForOrganizer"
            class="rounded-2xl border p-4 shadow-sm sm:p-5"
            :class="organizerStatusClass"
          >
            <p class="text-[11px] font-bold uppercase text-slate-400">Organizer Status</p>
            <div class="mt-3 flex items-center justify-between">
              <span class="text-sm font-bold text-slate-900">{{ organizerStatusLabel }}</span>
              <UiBadge :color="organizerBadgeColor" tone="solid" class="!px-2 !py-0.5 !text-[10px]">
                {{ profile.organizerStatus }}
              </UiBadge>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 프로필 수정 모달 -->
    <UiModal
      :open="editModalOpen"
      title="프로필 수정"
      max-width-class="max-w-md"
      @close="closeEditModal"
    >
      <div class="space-y-5 py-2">
        <div class="space-y-1">
          <label for="edit-name" class="text-xs font-semibold text-slate-700">이름</label>
          <input
            id="edit-name"
            v-model="editForm.name"
            type="text"
            required
            class="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            placeholder="이름을 입력하세요"
          />
        </div>

        <div class="space-y-1">
          <label for="edit-phone" class="text-xs font-semibold text-slate-700">연락처</label>
          <input
            id="edit-phone"
            v-model="editForm.phoneNumber"
            type="tel"
            required
            class="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            placeholder="010-0000-0000"
          />
        </div>

        <div v-if="updateError" class="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600">
          {{ updateError }}
        </div>
      </div>

      <template #footer>
        <div class="flex gap-2">
          <UiButton 
            variant="ghost" 
            class="flex-1 !h-10 !rounded-xl !text-sm" 
            @click="closeEditModal"
          >
            취소
          </UiButton>
          <UiButton 
            variant="primary" 
            class="flex-[2] !h-10 !rounded-xl !bg-slate-900 hover:!bg-slate-800 !text-sm" 
            :disabled="updating"
            @click="handleUpdateProfile"
          >
            <svg v-if="updating" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            저장하기
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script>
import { 
  BarChart3, 
  Clock, 
  Heart, 
  Star, 
  CheckCircle, 
  ShieldAlert 
} from 'lucide-vue-next'
import { useMe } from '../../composables/useMe'
import { getCategoryLabel } from '../../lib/constants/concertCategory'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiModal from '../../components/common/UiModal.vue'

function timeAgo(isoStr) {
  if (!isoStr) return '-'
  const d = new Date(isoStr)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400 * 2) return `${Math.floor(diff / 86400)}일 전`
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default {
  name: 'ProfileView',
  components: { 
    BarChart3, 
    Clock, 
    Heart, 
    Star, 
    CheckCircle, 
    ShieldAlert,
    UiButton,
    UiBadge,
    UiModal
  },
  data() {
    return {
      profile: null,
      genreStats: [],
      recentActivities: [],
      loading: false,
      me: null,
      
      // Edit Modal State
      editModalOpen: false,
      updating: false,
      updateError: '',
      editForm: {
        name: '',
        phoneNumber: ''
      }
    }
  },
  computed: {
    roleLabel() {
      const r = this.profile?.role
      if (r === 'ORGANIZER') return '주최자'
      if (r === 'ADMIN') return '관리자'
      return '일반 회원'
    },
    ageVerifiedAt() {
      return this.profile?.ageVerifiedAt ?? null
    },
    verifiedBirthDateFormatted() {
      const raw = this.profile?.verifiedBirthDate ?? this.profile?.birthDate ?? null
      if (!raw) return '-'
      const d = new Date(raw)
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
    },
    joinDateFormatted() {
      const raw = this.profile?.createdTime ?? this.profile?.createdAt ?? null
      if (!raw) return '-'
      const d = new Date(raw)
      return d.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })
        .replace(/\. /g, '.').replace(/\.$/, '')
    },
    viewingCount() {
      return this.profile?.viewingCount ?? 0
    },
    hasAppliedForOrganizer() {
      return ['PENDING', 'APPROVED', 'REJECTED'].includes(this.profile?.organizerStatus)
    },
    organizerStatusLabel() {
      const s = this.profile?.organizerStatus
      if (s === 'PENDING') return '검토 중'
      if (s === 'APPROVED') return '승인됨'
      if (s === 'REJECTED') return '거절됨'
      return s
    },
    organizerBadgeColor() {
      const s = this.profile?.organizerStatus
      if (s === 'PENDING') return 'amber'
      if (s === 'APPROVED') return 'green'
      if (s === 'REJECTED') return 'red'
      return 'slate'
    },
    organizerStatusClass() {
      const s = this.profile?.organizerStatus
      if (s === 'PENDING') return 'border-amber-100 bg-amber-50'
      if (s === 'APPROVED') return 'border-green-100 bg-green-50'
      if (s === 'REJECTED') return 'border-red-100 bg-red-50'
      return 'border-slate-100 bg-slate-50'
    },
    formattedActivities() {
      return this.recentActivities.map((act) => ({
        ...act,
        typeLabel: act.type === 'BOOKING' ? '예매 완료' : '활동',
        title: act.concertTitle || '공연 관람',
        timeAgo: timeAgo(act.createdAt),
      }))
    },
  },
  created() {
    const { refetch, fetchGenrePreferences, fetchRecentActivities, updateProfile } = useMe()
    this.me = { refetch, fetchGenrePreferences, fetchRecentActivities, updateProfile }
  },
  mounted() {
    this.load()
  },
  methods: {
    getCategoryLabel,
    async load() {
      this.loading = true
      try {
        const [p, g, a] = await Promise.all([
          this.me.refetch(),
          this.me.fetchGenrePreferences(),
          this.me.fetchRecentActivities({ page: 0, size: 5 })
        ])
        this.profile = p
        this.genreStats = g
        this.recentActivities = a?.content || []
      } catch (e) {
        console.error('Failed to load profile data:', e)
      } finally {
        this.loading = false
      }
    },
    
    // Edit Modal Methods
    openEditModal() {
      if (!this.profile) return
      this.editForm.name = this.profile.name || ''
      this.editForm.phoneNumber = this.profile.phoneNumber || ''
      this.updateError = ''
      this.editModalOpen = true
    },
    closeEditModal() {
      this.editModalOpen = false
    },
    async handleUpdateProfile() {
      if (this.updating) return
      this.updating = true
      this.updateError = ''
      
      try {
        await this.me.updateProfile({
          name: this.editForm.name,
          phoneNumber: this.editForm.phoneNumber
        })
        this.profile = await this.me.refetch()
        this.closeEditModal()
      } catch (e) {
        this.updateError = e.responseData?.message || e.message || '저장 중 오류가 발생했습니다.'
      } finally {
        this.updating = false
      }
    }
  },
}
</script>
