<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <UiCard v-else-if="!profile">
      <div class="text-sm text-slate-500">정보를 불러오지 못했습니다.</div>
      <UiButton class="mt-3" @click="load">다시 시도</UiButton>
    </UiCard>

    <UiCard v-else-if="profile">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">내 정보</div>
        </div>
        <UiBadge v-if="profile.role" tone="soft">{{ profile.role }}</UiBadge>
      </div>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">이름</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ profile.name || '-' }}</div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">이메일</div>
          <div class="mt-1 flex items-center gap-2">
            <span class="text-sm font-semibold text-slate-900">{{ profile.email || '-' }}</span>
            <Icon
              v-if="profile.socialType === 'GOOGLE'"
              icon="logos:google-icon"
              class="h-5 w-5 shrink-0"
              title="Google"
            />
            <Icon
              v-else-if="profile.socialType === 'KAKAO'"
              icon="simple-icons:kakaotalk"
              :style="{ color: '#191919' }"
              class="h-5 w-5 shrink-0"
              title="카카오"
            />
          </div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:col-span-2">
          <div class="text-xs font-semibold text-slate-500">연락처</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ profile.phoneNumber || '-' }}</div>
        </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:col-span-2">
          <div class="text-xs font-semibold text-slate-500">생년월일</div>
          <div class="mt-1 text-sm font-semibold text-slate-900"> {{ verifiedBirthDateFormatted || '-'}}</div>
        </div>
        <RouterLink
          to="/me/verify-identity"
          class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 sm:col-span-2"
        >
          <div>
            <div class="text-xs font-semibold text-slate-500">본인인증 여부</div>
            <div class="mt-1 flex flex-wrap items-center gap-2">
              <UiBadge
                :color="ageVerifiedAt ? 'green' : 'slate'"
                :tone="ageVerifiedAt ? 'soft' : 'soft'"
              >
                {{ ageVerifiedAt ? '완료' : '미완료' }}
              </UiBadge>
            </div>
          </div>
          <span class="text-slate-400">&gt;</span>
        </RouterLink>
      </div>

      <!-- 주최자 신청 현황 (주최자 계정으로 신청한 유저에 대해서만) -->
      <div
        v-if="hasAppliedForOrganizer"
        class="mt-4 rounded-2xl border p-4 shadow-sm"
        :class="organizerStatusClass"
      >
        <div class="text-xs font-semibold text-slate-500">주최자 신청 현황</div>
        <div class="mt-1 flex items-center gap-2">
          <span class="text-sm font-semibold">{{ organizerStatusLabel }}</span>
          <UiBadge v-if="profile.organizerStatus === 'PENDING'" tone="soft">검토 중</UiBadge>
          <UiBadge v-else-if="profile.organizerStatus === 'APPROVED'" tone="solid">승인됨</UiBadge>
          <UiBadge v-else-if="profile.organizerStatus === 'REJECTED'" tone="soft" class="bg-red-50 text-red-700">거절됨</UiBadge>
        </div>
        <p v-if="profile.organizerStatus === 'PENDING'" class="mt-2 text-xs text-slate-600">
          관리자 검토 후 승인되면 공연 등록·관리 메뉴를 이용하실 수 있습니다.
        </p>
        <p v-else-if="profile.organizerStatus === 'REJECTED'" class="mt-2 text-xs text-slate-600">
          문의 사항이 있으시면 고객센터로 연락해 주세요.
        </p>
      </div>

      <div v-if="!hasAppliedForOrganizer" class="mt-4 flex flex-wrap gap-2">
        <UiButton class="h-11 px-5" @click="$router.push('/me/orders')">내 주문 목록</UiButton>
        <UiButton variant="tonal" class="h-11 px-5" @click="$router.push('/me/performers/likes')">좋아요한 아티스트</UiButton>
        <UiButton variant="ghost" class="h-11 px-5" @click="$router.push('/')">둘러보기</UiButton>
      </div>
    </UiCard>
  </div>
</template>

<script>
import { Icon } from '@iconify/vue'
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'ProfileView',
  components: {
    Icon,
    UiCard,
    UiBadge,
    UiButton
  },
  data() {
    return {
      profile: null,
      loading: false,
      api: null,
    }
  },
  computed: {
    /** DTO ageVerifiedAt: 본인인증 완료일 (null이면 미완료) */
    ageVerifiedAt() {
      return this.profile?.ageVerifiedAt ?? null
    },
    /** DTO verifiedBirthDate: 인증된 생년월일 (MemberDetailDto) */
    verifiedBirthDateFormatted() {
      const raw = this.profile?.ageVerifiedAt ?? null
      if (!raw) return ''
      const s = String(raw)
      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
      return m ? `${m[1]}년 ${m[2]}월 ${m[3]}일` : s
    },
    /** 주최자 계정 신청 이력이 있는 경우에만 true (PENDING/APPROVED/REJECTED) */
    hasAppliedForOrganizer() {
      const s = this.profile?.organizerStatus
      return ['PENDING', 'APPROVED', 'REJECTED'].includes(s)
    },
    organizerStatusLabel() {
      const s = this.profile?.organizerStatus
      if (s === 'PENDING') return '검토 중'
      if (s === 'APPROVED') return '승인됨'
      if (s === 'REJECTED') return '거절됨'
      return this.profile?.organizerStatus ?? '-'
    },
    organizerStatusClass() {
      const s = this.profile?.organizerStatus
      if (s === 'PENDING') return 'border-amber-200 bg-amber-50'
      if (s === 'APPROVED') return 'border-green-200 bg-green-50'
      if (s === 'REJECTED') return 'border-red-200 bg-red-50'
      return 'border-slate-200 bg-slate-50'
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
        const data = await this.api.get(ENDPOINTS.me())
        this.profile = data?.data != null ? data.data : data
      } catch (e) {
        this.profile = null
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
