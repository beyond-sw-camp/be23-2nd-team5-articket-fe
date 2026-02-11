<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">내 주변 공연장</div>
          <div class="mt-1 text-sm text-slate-500">거리순 · 필터(거리 km)</div>
        </div>
        <UiBadge tone="soft">GET /venue/address</UiBadge>
      </div>

      <div v-if="geoError" class="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <div class="font-semibold">위치 권한 안내</div>
        <div class="mt-1 text-sm text-amber-800">{{ geoError }}</div>
        <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <input
            v-model="manualQuery"
            class="h-11 w-full rounded-2xl border border-amber-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none"
            placeholder="동네/역명 (mock에서는 서울 중심 좌표로 대체)"
          />
          <UiButton class="h-11 px-5" @click="load">수동 위치로 탐색</UiButton>
        </div>
      </div>

      <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div class="inline-flex items-center gap-2 text-sm text-slate-600">
          <Navigation class="h-4 w-4 text-slate-600" />
          <span v-if="coords">lat {{ coords.lat.toFixed(4) }}, lng {{ coords.lng.toFixed(4) }}</span>
          <span v-else>좌표를 불러오는 중…</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-slate-500">반경</span>
          <select
            v-model.number="radiusKm"
            class="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none"
          >
            <option :value="2">2 km</option>
            <option :value="5">5 km</option>
            <option :value="10">10 km</option>
          </select>
        </div>
      </div>
    </UiCard>

    <UiCard v-if="geoLoading || loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <EmptyState
      v-else-if="canLoad && venues.length === 0"
      title="근처 공연장이 없어요"
      description="반경을 늘리거나 수동 위치로 다시 시도해보세요."
    />

    <div v-else class="grid gap-3 sm:grid-cols-2">
      <UiCard v-for="v in venues" :key="v.id" class="cursor-pointer transition hover:shadow-lg" @click="$router.push(`/venues/${v.id}`)">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MapPin class="h-4 w-4 text-slate-600" />
              {{ v.name }}
            </div>
            <div class="mt-1 text-sm text-slate-500">{{ v.address }}</div>
          </div>
          <UiBadge tone="soft">{{ v.distanceKm }} km</UiBadge>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script>
import { MapPin, Navigation } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import { useGeolocation } from '../../composables/useGeolocation'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'NearbyView',
  components: {
    MapPin,
    Navigation,
    UiCard,
    UiButton,
    UiBadge,
    EmptyState
  },
  data() {
    return {
      radiusKm: 5,
      loading: false,
      venues: [],
      api: null,
      geolocation: null,
      coords: null,
      geoLoading: false,
      geoError: null,
      manualQuery: ''
    }
  },
  computed: {
    canLoad() {
      return !!this.coords
    }
  },
  watch: {
    coords() {
      this.load()
    },
    radiusKm() {
      this.load()
    }
  },
  created() {
    this.api = useApi()
    this.geolocation = useGeolocation()
  },
  mounted() {
    this.getCurrentPosition()
  },
  methods: {
    getCurrentPosition() {
      this.geoLoading = true
      this.geolocation.getCurrentPosition()
      
      // Watch for changes from the composable
      const checkCoords = () => {
        if (this.geolocation.coords.value) {
          this.coords = this.geolocation.coords.value
          this.geoLoading = false
        } else if (this.geolocation.error.value) {
          this.geoError = this.geolocation.error.value
          this.geoLoading = false
        } else {
          setTimeout(checkCoords, 100)
        }
      }
      checkCoords()
    },
    async load() {
      if (!this.coords) return
      this.loading = true
      try {
        const res = await this.api.get(
          ENDPOINTS.venueAddress({ lat: this.coords.lat, lng: this.coords.lng, radiusKm: this.radiusKm })
        )
        this.venues = res.items || []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
