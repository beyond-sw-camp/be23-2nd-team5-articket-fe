<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <template v-else-if="item">
      <UiCard :padded="false">
        <div class="grid gap-0 sm:grid-cols-[220px_1fr]">
          <div class="overflow-hidden rounded-2xl sm:rounded-none sm:rounded-l-2xl">
            <img class="h-56 w-full object-cover sm:h-full" :src="item.posterUrl" :alt="item.title" />
          </div>
          <div class="p-4 sm:p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-xl font-semibold text-slate-900">{{ item.title }}</div>
                <div class="mt-1 text-sm text-slate-500">{{ item.shortDesc }}</div>
              </div>
              <UiBadge tone="soft">{{ item.category }}</UiBadge>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <div class="text-xs font-semibold text-slate-500">평점</div>
                <div class="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Star class="h-4 w-4 text-amber-500" /> {{ item.rating }}
                </div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <div class="text-xs font-semibold text-slate-500">가격대</div>
                <div class="mt-1 text-sm font-semibold text-slate-900">{{ item.priceRange }}</div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <div class="text-xs font-semibold text-slate-500">장소</div>
                <div class="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MapPin class="h-4 w-4 text-slate-600" />
                  <button class="hover:underline" type="button" @click="$router.push(`/venues/${item.venue?.id}`)">
                    {{ item.venue?.name }}
                  </button>
                </div>
                <div class="mt-1 text-xs text-slate-500">{{ item.venue?.address }}</div>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <UiBadge v-for="t in item.tags || []" :key="t" tone="outline">{{ t }}</UiBadge>
            </div>

            <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div class="text-sm text-slate-600">{{ item.description }}</div>
              <div class="flex gap-2">
                <UiButton variant="ghost" class="h-11 px-4" @click="$router.push(`/concerts/${item.id}/schedules`)">
                  회차 보기
                </UiButton>
                <UiButton class="h-11 px-4" @click="goToBooking">
                  예매하기
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </UiCard>
    </template>
  </div>

</template>

<script>
import { MapPin, Star } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'ConcertDetailView',
  components: {
    MapPin,
    Star,
    UiCard,
    UiBadge,
    UiButton
  },
  data() {
    return {
      loading: false,
      item: null,
      api: null
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
        let concert
        try {
          concert = await this.api.get(ENDPOINTS.concert(this.$route.params.concertId))
        } catch (err) {
          // API 실패 시 localStorage에서 더미 데이터 로드
          console.warn('API call failed, using dummy data', err)
          const stored = JSON.parse(localStorage.getItem('createdConcerts') || '[]')
          concert = stored.find((c) => c.id === this.$route.params.concertId)
          
          if (concert) {
            // 화면 표시 형식으로 변환
            // ERD: concert.seat_map_id를 통해 venue 찾기
            let venue = { name: '공연장', address: '' }
            if (concert.seat_map_id) {
              const createdSeatMaps = JSON.parse(localStorage.getItem('createdSeatMaps') || '[]')
              const { MOCK_SEAT_MAPS, MOCK_VENUES } = await import('../../mocks/venues')
              const allSeatMaps = [...createdSeatMaps, ...MOCK_SEAT_MAPS]
              const seatMap = allSeatMaps.find((sm) => sm.id === concert.seat_map_id)
              if (seatMap && seatMap.venue_id) {
                const createdVenues = JSON.parse(localStorage.getItem('createdVenues') || '[]')
                const allVenues = [...createdVenues, ...MOCK_VENUES]
                venue = allVenues.find((v) => v.id === seatMap.venue_id) || { name: '공연장', address: '' }
              }
            }
            
            concert = {
              ...concert,
              shortDesc: '새로 등록된 공연입니다',
              description: '공연 상세 정보를 확인하세요.',
              category: '콘서트',
              rating: '4.5',
              priceRange: '₩50,000 ~ ₩150,000',
              posterUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=60',
              tags: ['인기', '신규'],
              venue: {
                id: venue.id,
                name: venue.name,
                address: venue.address || ''
              }
            }
          }
        }
        
        this.item = concert
      } finally {
        this.loading = false
      }
    },
    goToBooking() {
      // 예매하기 버튼 클릭 시 회차 목록으로 이동
      if (this.item && this.item.id) {
        this.$router.push(`/concerts/${this.item.id}/schedules`)
      }
    }
  }
}
</script>
