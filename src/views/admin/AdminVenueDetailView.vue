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

      <!-- 공연장 기본 정보 -->
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

      <!-- 공연 목록 -->
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
          <span class="text-sm font-semibold text-slate-700">이 공연장의 공연</span>
          <span v-if="concertsLoading" class="text-xs text-slate-400">불러오는 중…</span>
          <span v-else class="text-xs text-slate-400">{{ concerts.length }}건</span>
        </div>

        <div v-if="concertsLoading" class="p-6 text-center text-sm text-slate-400">불러오는 중…</div>
        <div v-else-if="concerts.length === 0" class="p-6 text-center text-sm text-slate-400">등록된 공연이 없습니다.</div>
        <table v-else class="w-full text-sm">
          <thead class="border-b border-slate-100">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">공연명</th>
              <th class="px-4 py-2 text-center text-xs font-semibold text-slate-500">상태</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">주최자</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="concert in concerts"
              :key="concert.id"
              class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
            >
              <td class="px-4 py-3">
                <div class="font-medium text-slate-900">{{ concert.title || '-' }}</div>
                <div class="text-xs text-slate-400">ID {{ concert.id }}</div>
              </td>
              <td class="px-4 py-3 text-center">
                <UiBadge
                  :tone="concert.status === 'PUBLISHED' ? 'solid' : 'soft'"
                  :color="concert.status === 'PUBLISHED' ? 'red' : 'slate'"
                >
                  {{ statusLabel(concert.status) }}
                </UiBadge>
              </td>
              <td class="px-4 py-3">
                <div class="text-slate-700">{{ concert.organizerName || concert.organizer?.name || '-' }}</div>
                <div v-if="concert.organizerEmail" class="text-xs text-slate-400">{{ concert.organizerEmail }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
    UiBadge
  },
  data() {
    return {
      venue: null,
      loading: false,
      api: null,
      concerts: [],
      concertsLoading: false
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
    }
  },
  watch: {
    venueId: {
      handler() {
        this.loadVenue()
      }
    }
  },
  created() {
    this.api = useApi()
    this.loadVenue()
  },
  methods: {
    statusLabel(s) {
      const m = { DRAFT: '초안', PUBLISHED: '게시', ENDED: '종료' }
      return m[s] ?? s ?? '-'
    },
    async loadVenue() {
      if (!this.venueId) return
      this.loading = true
      this.venue = null
      try {
        this.venue = await this.api.get(ENDPOINTS.adminVenueDetail(this.venueId))
        await this.loadConcerts()
      } catch (err) {
        this.venue = null
      } finally {
        this.loading = false
      }
    },
    async loadConcerts() {
      this.concertsLoading = true
      try {
        const res = await this.api.get(ENDPOINTS.venueConcerts(this.venueId))
        this.concerts = res?.content ?? res?.items ?? (Array.isArray(res) ? res : [])
      } catch (err) {
        this.concerts = []
      } finally {
        this.concertsLoading = false
      }
    }
  }
}
</script>
