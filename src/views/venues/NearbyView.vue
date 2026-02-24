<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">내 주변 공연장</div>
          <div class="mt-1 text-sm text-slate-500">거리순 · 필터(거리 km)</div>
        </div>
        <UiBadge tone="soft">GET /venues/nearby</UiBadge>
      </div>

      <!-- 위치 오류 -->
      <div v-if="geoError" class="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <div class="font-semibold">위치 권한 안내</div>
        <div class="mt-1 text-sm text-amber-800">{{ geoError }}</div>
      </div>

      <!-- 좌표 + 반경 선택 -->
      <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div class="inline-flex items-center gap-2 text-sm text-slate-600">
          <Navigation class="h-4 w-4 text-slate-600" />
          <span v-if="coords">lat {{ coords.lat.toFixed(4) }}, lng {{ coords.lng.toFixed(4) }}</span>
          <span v-else-if="geoLoading">좌표를 불러오는 중…</span>
          <span v-else class="text-amber-600">위치를 가져오지 못했습니다.</span>
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

    <!-- 카카오 지도 -->
    <UiCard class="overflow-hidden !p-0">
      <div class="relative">
        <div ref="mapContainer" class="h-72 w-full bg-slate-100" />
        <!-- 지도 로딩 오버레이 -->
        <div v-if="!mapLoaded" class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100">
          <svg class="h-8 w-8 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span class="text-xs text-slate-400">카카오 지도 불러오는 중…</span>
        </div>
      </div>
    </UiCard>

    <!-- 로딩 -->
    <UiCard v-if="geoLoading || loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <!-- 결과 없음 -->
    <EmptyState
      v-else-if="canLoad && venues.length === 0 && !loading"
      title="근처 공연장이 없어요"
      description="반경을 늘려서 다시 시도해보세요."
    />

    <!-- 공연장 목록 -->
    <div v-else class="grid gap-3 sm:grid-cols-2">
      <UiCard
        v-for="v in venues"
        :key="v.id"
        class="cursor-pointer transition hover:shadow-lg"
        :class="{ 'ring-2 ring-red-400': selectedVenueId === v.id }"
        @click="focusVenue(v)"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MapPin class="h-4 w-4 text-slate-600" />
              {{ v.name }}
            </div>
            <div class="mt-1 text-sm text-slate-500">{{ v.formattedAddress }}</div>
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
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

// ─── 카카오 SDK 폴링 로더 (index.html에 SDK 스크립트 삽입 필요) ───
function loadKakaoSdk() {
  return new Promise((resolve, reject) => {
    const check = (retries = 30) => {
      if (window.kakao?.maps) {
        resolve(window.kakao.maps)
      } else if (retries <= 0) {
        reject(new Error('카카오 지도 SDK를 찾을 수 없습니다.'))
      } else {
        setTimeout(() => check(retries - 1), 200)
      }
    }
    check()
  })
}

export default {
  name: 'NearbyView',
  components: { MapPin, Navigation, UiCard, UiButton, UiBadge, EmptyState },

  data() {
    return {
      radiusKm: 5,
      loading: false,
      venues: [],
      api: null,
      coords: null,
      geoLoading: false,
      geoError: null,

      // 지도
      mapLoaded: false,
      kakaoMap: null,
      myMarker: null,       // 내 위치 마커
      venueMarkers: [],     // 공연장 마커 목록
      radiusCircle: null,   // 반경 원
      selectedVenueId: null
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
      this.updateMyLocationOnMap()
    },
    radiusKm() {
      if (this.canLoad) this.load()
    },
    venues() {
      this.updateVenueMarkersOnMap()
    }
  },

  async created() {
    this.api = useApi()
  },

  async mounted() {
    await this.initMap()
    this.getCurrentPosition()
  },

  methods: {
    // ── 카카오 지도 초기화 ─────────────────────────────────────────
    async initMap() {
      try {
        const maps = await loadKakaoSdk()
        const container = this.$refs.mapContainer
        if (!container) return

        this.kakaoMap = new maps.Map(container, {
          center: new maps.LatLng(37.5665, 126.9780), // 서울 시청 기본
          level: 7
        })
        this.mapLoaded = true
      } catch (e) {
        console.warn('카카오 지도 초기화 실패:', e)
      }
    },

    // ── 내 위치 마커 + 반경 원 업데이트 ──────────────────────────
    updateMyLocationOnMap() {
      if (!this.kakaoMap || !this.coords) return
      const maps = window.kakao.maps
      const position = new maps.LatLng(this.coords.lat, this.coords.lng)

      // 지도 중심 이동
      this.kakaoMap.setCenter(position)
      this.kakaoMap.setLevel(this.radiusKm <= 2 ? 6 : this.radiusKm <= 5 ? 7 : 8)

      // 내 위치 마커 (기존 제거 후 재생성)
      if (this.myMarker) this.myMarker.setMap(null)
      this.myMarker = new maps.Marker({
        position,
        map: this.kakaoMap,
        title: '내 위치',
        image: new maps.MarkerImage(
          'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
          new maps.Size(24, 35)
        )
      })

      // 반경 원 (기존 제거 후 재생성)
      if (this.radiusCircle) this.radiusCircle.setMap(null)
      this.radiusCircle = new maps.Circle({
        center: position,
        radius: this.radiusKm * 1000,
        strokeWeight: 2,
        strokeColor: '#ef4444',
        strokeOpacity: 0.6,
        fillColor: '#ef4444',
        fillOpacity: 0.05,
        map: this.kakaoMap
      })
    },

    // ── 공연장 마커 업데이트 ──────────────────────────────────────
    updateVenueMarkersOnMap() {
      if (!this.kakaoMap) return
      const maps = window.kakao.maps

      // 기존 마커 전체 제거
      this.venueMarkers.forEach(m => m.setMap(null))
      this.venueMarkers = []

      this.venues.forEach(v => {
        if (!v.latitude || !v.longitude) return
        const position = new maps.LatLng(v.latitude, v.longitude)
        const marker = new maps.Marker({ position, map: this.kakaoMap, title: v.name })

        // 마커 클릭 시 인포윈도우
        const infowindow = new maps.InfoWindow({
          content: `<div style="padding:8px 10px;font-size:13px;font-weight:600;white-space:nowrap;">${v.name}<br><span style="font-weight:400;color:#6b7280;font-size:12px;">${v.distanceKm} km</span></div>`
        })
        maps.event.addListener(marker, 'click', () => {
          // 기존 인포윈도우 닫기
          this.venueMarkers.forEach(m => m._iw?.close())
          infowindow.open(this.kakaoMap, marker)
          this.selectedVenueId = v.id
        })
        marker._iw = infowindow
        this.venueMarkers.push(marker)
      })
    },

    // ── 목록 카드 클릭 → 지도 해당 위치로 포커스 ─────────────────
    focusVenue(v) {
      this.selectedVenueId = v.id
      if (!this.kakaoMap || !v.latitude || !v.longitude) {
        this.$router.push(`/venues/${v.id}`)
        return
      }
      const maps = window.kakao.maps
      const position = new maps.LatLng(v.latitude, v.longitude)
      this.kakaoMap.setCenter(position)
      this.kakaoMap.setLevel(4)

      // 해당 마커의 인포윈도우 열기
      const marker = this.venueMarkers.find(m => m.getTitle() === v.name)
      if (marker) {
        this.venueMarkers.forEach(m => m._iw?.close())
        marker._iw?.open(this.kakaoMap, marker)
      }
    },

    // ── 브라우저 Geolocation으로 현재 위치 획득 ──────────────────
    getCurrentPosition() {
      if (!navigator.geolocation) {
        this.geoError = '이 브라우저는 위치 정보를 지원하지 않습니다.'
        return
      }
      this.geoLoading = true
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          this.geoLoading = false
        },
        (err) => {
          this.geoError = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'
          this.geoLoading = false
          console.warn('Geolocation error:', err)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    },

    // ── 서버 API 호출 ─────────────────────────────────────────────
    async load() {
      if (!this.coords) return
      this.loading = true
      try {
        const res = await this.api.get(
          ENDPOINTS.venueNearby({
            latitude: this.coords.lat,
            longitude: this.coords.lng,
            radiusKm: this.radiusKm,
            page: 0,
            size: 20
          })
        )
        // Spring Page 응답: { content: [...], totalElements: N, ... }
        const list = Array.isArray(res) ? res : res?.content || res?.items || []
        this.venues = list.map(v => ({
          id: v.id,
          name: v.name,
          formattedAddress: v.formattedAddress || v.address || '-',
          latitude: v.latitude,
          longitude: v.longitude,
          distanceKm: v.distanceKm ?? '-'
        }))
      } catch (e) {
        console.warn('근처 공연장 조회 실패:', e)
        this.venues = []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
