<template>
  <div class="grid gap-4">
    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </div>

    <template v-else-if="venue">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-slate-900">{{ venue.name }}</h1>
          <p class="mt-1 text-sm text-slate-500">공연장 상세 정보</p>
        </div>
        <UiBadge :tone="venueStatus === 'ACTIVE' ? 'soft' : 'outline'" :color="venueStatus === 'ACTIVE' ? 'green' : 'slate'">
          {{ venueStatus === 'ACTIVE' ? '활성' : (venueStatus === 'INACTIVE' ? '비활성' : venueStatus) }}
        </UiBadge>
      </div>

      <UiCard>
        <div class="grid gap-6">
          <div>
            <div class="text-xs font-semibold text-slate-500">공연장명</div>
            <div class="mt-1 text-base font-semibold text-slate-900">{{ venue.name }}</div>
          </div>

          <div>
            <div class="text-xs font-semibold text-slate-500">상태</div>
            <div class="mt-1">
              <UiBadge :tone="venueStatus === 'ACTIVE' ? 'soft' : 'outline'" :color="venueStatus === 'ACTIVE' ? 'green' : 'slate'">
                {{ venueStatus === 'ACTIVE' ? '활성' : '비활성' }}
              </UiBadge>
            </div>
          </div>

          <div v-if="formattedAddress">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <MapPin class="h-4 w-4" />
              주소
            </div>
            <div class="mt-1 text-sm text-slate-700">{{ formattedAddress }}</div>
            <div v-if="hasAddressParts" class="mt-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
              <span v-if="addr.sido">시도: {{ addr.sido }}</span>
              <span v-if="addr.sigungu">시군구: {{ addr.sigungu }}</span>
              <span v-if="addr.postCode">우편번호: {{ addr.postCode }}</span>
              <span v-if="addr.latitude != null">위도: {{ addr.latitude }}</span>
              <span v-if="addr.longitude != null">경도: {{ addr.longitude }}</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <UiButton variant="ghost" class="h-10 px-4" @click="$router.push('/admin/venues')">
              목록
            </UiButton>
            <UiButton class="h-10 px-4" @click="$router.push(`/admin/venues/${venueId}/edit`)">
              수정하기
            </UiButton>
            <UiButton variant="tonal" class="h-10 px-4" @click="$router.push(`/admin/venues/${venueId}/seat-maps`)">
              좌석맵 관리
            </UiButton>
          </div>
        </div>
      </UiCard>
    </template>

    <div v-else class="rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <div class="text-sm text-slate-500">공연장 정보를 찾을 수 없습니다.</div>
      <UiButton class="mt-3" @click="$router.push('/admin/venues')">목록으로</UiButton>
    </div>
  </div>
</template>

<script>
import { MapPin } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'AdminVenueDetailView',
  components: {
    MapPin,
    UiCard,
    UiButton,
    UiBadge,
  },
  data() {
    return {
      venue: null,
      loading: false,
      api: null,
    }
  },
  computed: {
    venueId() {
      return this.$route.params.venueId
    },
    venueStatus() {
      const v = this.venue
      if (!v) return ''
      const raw = v.status ?? v.venueStatus ?? ''
      return String(raw).toUpperCase()
    },
    addr() {
      const v = this.venue?.venueAddressResDto || this.venue?.venueAddress || {}
      return v
    },
    formattedAddress() {
      const a = this.addr
      return (
        this.venue?.address ||
        a?.formattedAddress ||
        [a?.sido, a?.sigungu, a?.eupmyeondong, a?.road, a?.houseNumber].filter(Boolean).join(' ') ||
        null
      )
    },
    hasAddressParts() {
      const a = this.addr
      return !!(a?.sido || a?.sigungu || a?.postCode != null || a?.latitude != null || a?.longitude != null)
    },
  },
  watch: {
    venueId: {
      handler() {
        this.loadVenue()
      },
    },
  },
  created() {
    this.api = useApi()
    this.loadVenue()
  },
  methods: {
    async loadVenue() {
      if (!this.venueId) return
      this.loading = true
      this.venue = null
      try {
        this.venue = await this.api.get(ENDPOINTS.adminVenueDetail(this.venueId))
      } catch (err) {
        this.venue = null
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
