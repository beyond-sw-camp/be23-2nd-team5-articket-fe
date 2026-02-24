<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <UiCard v-else-if="error" class="border-red-200 bg-red-50">
      <div class="text-sm font-semibold text-red-700">{{ error }}</div>
      <UiButton class="mt-3" @click="load">다시 시도</UiButton>
    </UiCard>

    <UiCard v-else-if="profile">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">내 정보</div>
        </div>
        <UiBadge v-if="profile.grade" tone="soft">{{ profile.grade }}</UiBadge>
      </div>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">이름</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ profile.name || '-' }}</div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">이메일</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ profile.email || '-' }}</div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:col-span-2">
          <div class="text-xs font-semibold text-slate-500">연락처</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ profile.phoneNumber || '-' }}</div>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <UiButton class="h-11 px-5" @click="$router.push('/me/orders')">내 주문 목록</UiButton>
        <UiButton variant="tonal" class="h-11 px-5" @click="$router.push('/me/performers/likes')">좋아요한 아티스트</UiButton>
        <UiButton v-if="!isVerified" variant="ghost" class="h-10 px-3" @click="inicis">
          <span class="ml-2 text-sm">본인인증</span>
        </UiButton>
        <UiButton v-if="isVerified" variant="ghost" class="h-10 px-3">
          <span class="ml-2 text-sm">본인인증 완료</span>
        </UiButton>
        <UiButton variant="ghost" class="h-11 px-5" @click="$router.push('/')">둘러보기</UiButton>
      </div>
    </UiCard>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import PortOne from '@portone/browser-sdk/v2'

export default {
  name: 'ProfileView',
  components: {
    UiCard,
    UiBadge,
    UiButton
  },
  data() {
    return {
      profile: null,
      loading: false,
      error: '',
      api: null,
      isVerified: null
    }
  },
  created() {
    this.api = useApi()
    this.isVerifiedAge()
  },
  mounted() {
    this.load()
  },
  methods: {
    async isVerifiedAge() {
      const iV = localStorage.getItem("isVerified");
      if (iV) {
        this.isVerified = true;
      }
    },
    async load() {
      this.loading = true
      this.error = ''
      try {
        const data = await this.api.get(ENDPOINTS.me())
        this.profile = data?.data != null ? data.data : data
      } catch (e) {
        this.error = e.message || '내 정보를 불러오지 못했습니다.'
      } finally {
        this.loading = false
      }
    },
    async inicis() {
      const response = await PortOne.requestIdentityVerification({
        // 고객사 storeId로 변경해주세요.
        storeId: "store-6ac42987-375b-44fc-bbc9-d9650b676666",
        identityVerificationId: `identity-verification-${crypto.randomUUID()}`,
        // 연동 정보 메뉴의 채널 관리 탭에서 확인 가능합니다.
        channelKey: "channel-key-a0fb163c-2bae-4ed0-9d2e-06bba0d3d8bb",
      });
      // 프로세스가 제대로 완료되지 않은 경우 에러 코드가 존재합니다
      if (response.code !== undefined) {
        return alert(response.message);
      }

      // 인증코드를 받아 서버로 인증확인 요청보내기 (axios 통일)
      try {
        await this.api.post(ENDPOINTS.inicis(), {
          identityVerificationId: response.identityVerificationId
        })
        localStorage.setItem('isVerified', true)
        this.isVerified = true
      } catch (e) {
        this.error = e?.message || '본인인증 확인에 실패했습니다.'
      }

    },
  },

}
</script>
