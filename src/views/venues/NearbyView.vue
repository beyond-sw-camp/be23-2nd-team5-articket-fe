<template>
  <div class="flex flex-col gap-6">

    <!-- ── 헤더 ──────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-1">
      <div class="flex items-center gap-2">
        <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
          <MapPin class="h-4 w-4" />
        </span>
        <h2 class="text-lg font-bold tracking-tight text-slate-900">내 주변 공연장</h2>
      </div>
      <p class="pl-10 text-xs text-slate-400">현재 위치 기준 거리순 · 공연장을 선택하면 공연 목록을 볼 수 있어요</p>
    </div>

    <!-- ── 지역 검색 ──────────────────────────────────────────────── -->
    <div class="relative">
      <div class="flex gap-2">
        <input
          v-model="regionSearchQuery"
          type="text"
          class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          placeholder="동명, 역명, 주소 등으로 검색"
          @keydown.enter.prevent="searchRegion"
        />
        <button
          type="button"
          class="shrink-0 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
          :disabled="regionSearchLoading || !regionSearchQuery.trim()"
          @click="searchRegion"
        >
          {{ regionSearchLoading ? '검색 중…' : '검색' }}
        </button>
      </div>
      <!-- 검색 결과 드롭다운 -->
      <div
        v-if="regionSearchResults.length > 0"
        class="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
      >
        <button
          v-for="(place, idx) in regionSearchResults"
          :key="idx"
          type="button"
          class="flex w-full flex-col gap-0.5 px-4 py-2.5 text-left text-sm hover:bg-slate-50"
          @click="selectRegionSearch(place)"
        >
          <span class="font-semibold text-slate-900">{{ place.place_name }}</span>
          <span class="text-xs text-slate-500">{{ place.road_address_name || place.address_name }}</span>
        </button>
      </div>
    </div>

    <!-- ── 컨트롤 바 ─────────────────────────────────────────────── -->
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <!-- 위치 상태 + 내 위치로 버튼 -->
      <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <span
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          :class="coords ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'"
        >
          <Navigation class="h-3.5 w-3.5" />
        </span>
        <span v-if="geoLoading" class="text-xs text-slate-400">위치 확인 중…</span>
        <span v-else-if="coords" class="min-w-0 truncate text-xs font-medium text-slate-600" :title="coords.lat + ', ' + coords.lng">
          {{ currentAddress || (coords.lat.toFixed(4) + ', ' + coords.lng.toFixed(4)) }}
        </span>
        <span v-else class="text-xs font-medium text-amber-600">위치를 가져오지 못했습니다</span>
        <button
          v-if="coords && mapLoaded"
          type="button"
          class="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          @click="focusOnMyLocation"
        >
          내 위치로
        </button>
      </div>

      <!-- 반경 선택 -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-slate-400">반경</span>
        <div class="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5">
          <button
            v-for="km in [2, 5, 10]"
            :key="km"
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
            :class="radiusKm === km
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'"
            @click="radiusKm = km"
          >
            {{ km }}km
          </button>
        </div>
      </div>
    </div>

    <!-- 위치 오류 -->
    <div v-if="geoError" class="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
      <span class="mt-0.5 text-amber-500">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      </span>
      <p class="text-xs text-amber-800">{{ geoError }}</p>
    </div>

    <!-- ── 지도 ──────────────────────────────────────────────────── -->
    <div class="relative overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
      <div ref="mapContainer" class="relative z-0 h-56 w-full min-h-[14rem] bg-slate-100 sm:h-72 lg:h-80" />
      <!-- 지도 로딩 스켈레톤 -->
      <div
        v-if="!mapLoaded"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-50"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
          <MapPin class="h-5 w-5 text-slate-400" />
        </div>
        <span class="text-xs text-slate-400">지도 불러오는 중…</span>
      </div>
    </div>

    <!-- ── 로딩 스켈레톤 ─────────────────────────────────────────── -->
    <div v-if="geoLoading || loading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="i in 4"
        :key="i"
        class="h-20 animate-pulse rounded-2xl bg-slate-100"
      />
    </div>

    <!-- ── 결과 없음 ──────────────────────────────────────────────── -->
    <div
      v-else-if="canLoad && venues.length === 0 && !loading"
      class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 py-12 text-center"
    >
      <span class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <MapPin class="h-6 w-6 text-slate-300" />
      </span>
      <div>
        <p class="text-sm font-semibold text-slate-600">근처 공연장이 없어요</p>
        <p class="mt-0.5 text-xs text-slate-400">반경을 늘려서 다시 시도해보세요</p>
      </div>
    </div>

    <!-- ── 공연장 목록 ────────────────────────────────────────────── -->
    <div v-else-if="venues.length > 0" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="v in venues"
        :key="v.id"
        class="group relative flex w-full flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        :class="selectedVenueId === v.id
          ? 'border-red-500 ring-2 ring-red-100'
          : 'border-slate-100 hover:border-slate-200'"
      >
        <button
          type="button"
          class="flex flex-1 flex-col gap-2 px-4 py-4 text-left"
          @click="selectVenue(v)"
        >
          <!-- 선택 인디케이터 -->
          <span
            v-if="selectedVenueId === v.id"
            class="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-600"
          >
            <svg class="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>

          <div class="flex items-start justify-between gap-2 pr-6">
            <div class="flex items-start gap-2.5">
              <span
                class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-colors"
                :class="selectedVenueId === v.id ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-red-50 group-hover:text-red-600'"
              >
                <MapPin class="h-3.5 w-3.5" />
              </span>
              <div>
                <p class="text-sm font-semibold text-slate-900 leading-tight">{{ v.name }}</p>
                <p class="mt-0.5 text-xs text-slate-400 line-clamp-1">{{ v.formattedAddress }}</p>
              </div>
            </div>
          </div>

          <!-- 거리 배지 -->
          <div class="flex items-center gap-1.5">
            <span
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              :class="selectedVenueId === v.id ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'"
            >
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12h18M12 3l9 9-9 9"/>
              </svg>
              {{ v.distanceKm }} km
            </span>
          </div>
        </button>

        <!-- 길찾기 -->
        <div class="border-t border-slate-100 px-4 py-2">
          <button
            type="button"
            class="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-red-600"
            @click="openDirectionsModal(v)"
          >
            <Navigation class="h-3.5 w-3.5" />
            길찾기
          </button>
        </div>
      </div>
    </div>

    <!-- ── 길찾기 모달 ────────────────────────────────────────────── -->
    <UiModal :open="directionsModalOpen" title="길찾기" @close="closeDirectionsModal">
      <div v-if="directionsVenue" class="flex flex-col gap-4">
        <div>
          <p class="text-sm font-semibold text-slate-900">{{ directionsVenue.name }}</p>
          <p class="mt-0.5 text-xs text-slate-500">{{ directionsVenue.formattedAddress }}</p>
        </div>

        <!-- 모달 내 지도 미리보기 (목적지 + 내 위치) -->
        <div v-if="directionsVenue.latitude != null && directionsVenue.longitude != null" class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <div ref="directionsMapContainer" class="h-44 w-full min-h-[11rem]" />
          <div v-if="!directionsMapLoaded" class="absolute inset-0 flex items-center justify-center bg-slate-100">
            <span class="text-xs text-slate-400">지도 불러오는 중…</span>
          </div>
        </div>

        <p class="text-xs text-slate-400">선택한 앱으로 열어 목적지까지 길찾기를 할 수 있어요.</p>
        <div class="flex flex-col gap-2">
          <a
            :href="directionsKakaoUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#FEE500] px-4 py-3 text-sm font-semibold text-slate-900 transition hover:opacity-90"
            @click="closeDirectionsModal"
          >
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg">K</span>
            카카오맵으로 열기
          </a>
          <a
            :href="directionsNaverUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#03C75A] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            @click="closeDirectionsModal"
          >
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-[#03C75A]">N</span>
            네이버 지도로 열기
          </a>
          <a
            :href="directionsGoogleUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            @click="closeDirectionsModal"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google 지도로 열기
          </a>
        </div>
      </div>
    </UiModal>

    <!-- ── 공연 패널 (슬라이드 인) ────────────────────────────────── -->
    <transition name="panel-slide">
      <div v-if="selectedVenue" class="flex flex-col gap-4">

        <!-- 패널 헤더 -->
        <div class="flex items-center justify-between border-t border-slate-100 pt-4">
          <div class="flex items-center gap-2">
            <span class="h-4 w-1 rounded-full bg-red-600" />
            <h3 class="text-sm font-bold text-slate-900">{{ selectedVenue.name }}</h3>
            <span
              v-if="!concertsLoading"
              class="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600"
            >
              {{ concerts.length }}개
            </span>
          </div>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-slate-300 hover:text-slate-600"
            @click="clearSelectedVenue"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>

        <!-- 공연 로딩 스켈레톤 -->
        <div v-if="concertsLoading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="i in 3" :key="i" class="h-24 animate-pulse rounded-2xl bg-slate-100" />
        </div>

        <!-- 공연 없음 -->
        <div
          v-else-if="concerts.length === 0"
          class="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 py-10 text-center"
        >
          <span class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <svg class="h-5 w-5 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
            </svg>
          </span>
          <p class="text-xs font-medium text-slate-500">현재 예정된 공연이 없어요</p>
        </div>

        <!-- 공연 카드 목록 -->
        <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="c in concerts"
            :key="c.id"
            type="button"
            class="group flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md"
            @click="$router.push(`/concerts/${c.id}`)"
          >
            <!-- 공연명 + 상태 -->
            <div class="flex items-start justify-between gap-2">
              <p class="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-red-700 transition-colors">
                {{ c.title }}
              </p>
              <span class="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                OPEN
              </span>
            </div>

            <!-- 메타 -->
            <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
              <span v-if="c.organizer" class="flex items-center gap-1">
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
                {{ c.organizer }}
              </span>
              <span class="flex items-center gap-1">
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                </svg>
                {{ c.ageLimit > 0 ? `${c.ageLimit}세 이상` : '전체 관람가' }}
              </span>
            </div>

            <!-- 화살표 -->
            <div class="flex items-center gap-1 text-xs font-medium text-red-500 opacity-0 transition-opacity group-hover:opacity-100">
              자세히 보기
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </button>
        </div>

      </div>
    </transition>

  </div>
</template>

<script>
import { MapPin, Navigation, X } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiModal from '../../components/common/UiModal.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

function loadKakaoSdk() {
  const appKey = (import.meta.env.VITE_KAKAO_MAP_APP_KEY || '').toString().trim()
  if (!appKey) {
    return Promise.reject(
      new Error('카카오 지도 앱 키가 없습니다. .env에 VITE_KAKAO_MAP_APP_KEY를 설정해 주세요.')
    )
  }

  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve(window.kakao.maps))
      return
    }
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`
    script.async = false
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao.maps))
    }
    script.onerror = () => {
      reject(new Error('카카오 지도 SDK를 불러올 수 없습니다. 앱 키와 도메인 설정을 확인해 주세요.'))
    }
    document.head.appendChild(script)
  })
}

export default {
  name: 'NearbyView',
  components: { MapPin, Navigation, X, UiCard, UiButton, UiBadge, UiModal, EmptyState },

  data() {
    return {
      radiusKm: 5,
      loading: false,
      venues: [],
      api: null,
      coords: null,
      gpsCoords: null, // 실제 GPS 위치 (지역 검색과 구분, '내 위치로' 시 사용)
      geoLoading: false,
      geoError: null,
      currentAddress: '', // 역지오코딩 주소

      // 지역 검색
      regionSearchQuery: '',
      regionSearchResults: [],
      regionSearchLoading: false,

      // 지도
      mapLoaded: false,
      kakaoMap: null,
      myMarker: null,
      venueMarkers: [],
      radiusCircle: null,

      // 공연장 선택 + 공연 목록
      selectedVenueId: null,
      selectedVenue: null,
      concerts: [],
      concertsLoading: false,

      // 길찾기 모달
      directionsModalOpen: false,
      directionsVenue: null,
      directionsMap: null,       // 모달 내 미리보기 지도 인스턴스
      directionsMapLoaded: false
    }
  },

  computed: {
    canLoad() {
      return !!this.coords
    },
    directionsKakaoUrl() {
      const v = this.directionsVenue
      if (v?.latitude && v?.longitude) {
        const name = encodeURIComponent(v.name || '공연장')
        return `https://map.kakao.com/link/to/${name},${v.latitude},${v.longitude}`
      }
      if (v?.formattedAddress) {
        return `https://map.kakao.com/?q=${encodeURIComponent(v.formattedAddress)}`
      }
      return '#'
    },
    directionsNaverUrl() {
      const v = this.directionsVenue
      if (v?.latitude && v?.longitude) {
        return `https://map.naver.com/v5/directions/-,-,-,-/car?destination=${v.latitude},${v.longitude}`
      }
      if (v?.formattedAddress) {
        return `https://map.naver.com/v5/search/${encodeURIComponent(v.formattedAddress)}`
      }
      return '#'
    },
    directionsGoogleUrl() {
      const v = this.directionsVenue
      if (v?.latitude && v?.longitude) {
        return `https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}`
      }
      if (v?.formattedAddress) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.formattedAddress)}`
      }
      return '#'
    }
  },

  watch: {
    coords() {
      this.load()
      this.updateMyLocationOnMap()
      this.updateCurrentAddress()
    },
    radiusKm() {
      if (this.canLoad) this.load()
    },
    venues() {
      this.updateVenueMarkersOnMap()
    },
    regionSearchQuery(q) {
      if (!q?.trim()) this.regionSearchResults = []
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
          center: new maps.LatLng(37.5665, 126.9780),
          level: 7
        })
        this.mapLoaded = true
        // 로딩 오버레이 제거 후 지도 크기 재계산 (안 하면 지도가 잘리거나 안 보일 수 있음)
        this.$nextTick(() => {
          if (this.kakaoMap?.relayout) this.kakaoMap.relayout()
        })
      } catch (e) {
        console.warn('카카오 지도 초기화 실패:', e)
      }
    },

    // ── 현재 위치 주소 조회 (역지오코딩) ───────────────────────────
    updateCurrentAddress() {
      if (!this.coords || !window.kakao?.maps?.services) return
      this.currentAddress = ''
      const geocoder = new window.kakao.maps.services.Geocoder()
      geocoder.coord2Address(this.coords.lng, this.coords.lat, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result?.[0]) {
          const road = result[0].road_address?.address_name
          const jibun = result[0].address?.address_name
          this.currentAddress = road || jibun || ''
        }
      })
    },

    // ── 지도에서 내 위치로 포커스 (실제 GPS로 복귀, 주소도 사용자 위치로 갱신) ──
    focusOnMyLocation() {
      if (!this.gpsCoords) {
        this.getCurrentPosition()
        return
      }
      this.coords = { lat: this.gpsCoords.lat, lng: this.gpsCoords.lng }
      // coords watcher → load(), updateMyLocationOnMap(), updateCurrentAddress() 로 지도·주소 갱신
    },

    // ── 내 위치 마커 + 반경 원 ────────────────────────────────────
    updateMyLocationOnMap() {
      if (!this.kakaoMap || !this.coords) return
      const maps = window.kakao.maps
      const position = new maps.LatLng(this.coords.lat, this.coords.lng)

      this.kakaoMap.setCenter(position)
      this.kakaoMap.setLevel(this.radiusKm <= 2 ? 6 : this.radiusKm <= 5 ? 7 : 8)

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

    // ── 공연장 마커 ───────────────────────────────────────────────
    updateVenueMarkersOnMap() {
      if (!this.kakaoMap) return
      const maps = window.kakao.maps

      this.venueMarkers.forEach(m => m.setMap(null))
      this.venueMarkers = []

      this.venues.forEach(v => {
        if (!v.latitude || !v.longitude) return
        const position = new maps.LatLng(v.latitude, v.longitude)
        const marker = new maps.Marker({ position, map: this.kakaoMap, title: v.name })

        const infowindow = new maps.InfoWindow({
          content: `<div style="padding:8px 10px;font-size:13px;font-weight:600;white-space:nowrap;">${v.name}<br><span style="font-weight:400;color:#6b7280;font-size:12px;">${v.distanceKm} km</span></div>`
        })
        maps.event.addListener(marker, 'click', () => {
          this.venueMarkers.forEach(m => m._iw?.close())
          infowindow.open(this.kakaoMap, marker)
          this.selectVenue(v)
        })
        marker._iw = infowindow
        this.venueMarkers.push(marker)
      })
    },

    // ── 공연장 선택 → 지도 포커스 + 공연 목록 로드 ───────────────
    async selectVenue(v) {
      // 지도 포커스
      if (this.kakaoMap && v.latitude && v.longitude) {
        const maps = window.kakao.maps
        const position = new maps.LatLng(v.latitude, v.longitude)
        this.kakaoMap.setCenter(position)
        this.kakaoMap.setLevel(4)
        const marker = this.venueMarkers.find(m => m.getTitle() === v.name)
        if (marker) {
          this.venueMarkers.forEach(m => m._iw?.close())
          marker._iw?.open(this.kakaoMap, marker)
        }
      }

      // 같은 공연장 재클릭 시 닫기
      if (this.selectedVenueId === v.id) {
        this.clearSelectedVenue()
        return
      }

      this.selectedVenueId = v.id
      this.selectedVenue = v
      this.concerts = []
      await this.loadConcertsByVenue(v.id)
    },

    clearSelectedVenue() {
      this.selectedVenueId = null
      this.selectedVenue = null
      this.concerts = []
    },

    openDirectionsModal(venue) {
      this.directionsVenue = venue
      this.directionsModalOpen = true
      this.directionsMapLoaded = false
      this.directionsMap = null
      if (venue?.latitude != null && venue?.longitude != null) {
        this.$nextTick(() => this.initDirectionsMap())
      }
    },
    closeDirectionsModal() {
      this.directionsModalOpen = false
      this.directionsVenue = null
      this.directionsMapLoaded = false
      this.directionsMap = null
    },

    // ── 길찾기 모달 내 지도 미리보기 ─────────────────────────────────
    async initDirectionsMap() {
      const venue = this.directionsVenue
      const container = this.$refs.directionsMapContainer
      if (!venue || venue.latitude == null || venue.longitude == null || !container || !window.kakao?.maps) return

      try {
        const maps = window.kakao.maps
        const center = new maps.LatLng(venue.latitude, venue.longitude)

        const options = { center, level: 4 }
        this.directionsMap = new maps.Map(container, options)

        // 목적지 마커
        new maps.Marker({ position: center, map: this.directionsMap, title: venue.name })

        // 내 위치 마커 (있으면 표시하고 영역에 맞춤)
        if (this.coords?.lat != null && this.coords?.lng != null) {
          const myPos = new maps.LatLng(this.coords.lat, this.coords.lng)
          new maps.Marker({
            position: myPos,
            map: this.directionsMap,
            title: '내 위치',
            image: new maps.MarkerImage(
              'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
              new maps.Size(22, 32)
            )
          })
          const bounds = new maps.LatLngBounds()
          bounds.extend(center)
          bounds.extend(myPos)
          this.directionsMap.setBounds(bounds, 40, 40, 40, 40)
        }

        this.directionsMapLoaded = true
        this.$nextTick(() => this.directionsMap?.relayout?.())
      } catch (e) {
        console.warn('길찾기 모달 지도 초기화 실패:', e)
        this.directionsMapLoaded = true
      }
    },

    // ── 공연 목록 로드: venue → seatMaps → concerts 필터링 ───────
    // 서버에 venueId 필터가 없으므로 아래 체인으로 처리:
    // 1) GET /venues/{venueId}/seat-maps  → seatMapId Set 구성
    // 2) GET /concerts?status=PUBLISHED   → 전체 PUBLISHED 공연
    // 3) concert.concertSeatMapResDto.id ∈ seatMapIds 인 것만 추출
    async loadConcertsByVenue(venueId) {
      this.concertsLoading = true
      try {
        // 1. seatMap 목록
        const seatMapRes = await this.api.get(ENDPOINTS.venueSeatMapsList(venueId, { page: 0, size: 100 }))
        const seatMaps = Array.isArray(seatMapRes) ? seatMapRes : seatMapRes?.content || seatMapRes?.items || []
        const seatMapIds = new Set(seatMaps.map(sm => sm.id))

        if (seatMapIds.size === 0) {
          this.concerts = []
          return
        }

        // 2. PUBLISHED 공연 전체 (size=200으로 충분히 가져옴)
        const concertRes = await this.api.get(`${ENDPOINTS.concerts()}?status=PUBLISHED&size=200`)
        const allConcerts = Array.isArray(concertRes) ? concertRes : concertRes?.content || concertRes?.items || []

        // 3. 이 venue 소속 seatMap의 공연만 필터
        this.concerts = allConcerts
          .filter(c => seatMapIds.has(c.concertSeatMapResDto?.id))
          .map(c => ({
            id: c.id,
            title: c.title,
            status: c.status,
            ageLimit: c.ageLimit,
            organizer: c.concertMemberResDto?.name || null
          }))
      } catch (e) {
        console.warn('공연 목록 조회 실패:', e)
        this.concerts = []
      } finally {
        this.concertsLoading = false
      }
    },

    // ── 지역 검색 (카카오 장소 검색) ───────────────────────────────
    async searchRegion() {
      const query = this.regionSearchQuery?.trim()
      if (!query) return
      if (!window.kakao?.maps?.services) {
        try {
          await loadKakaoSdk()
        } catch (e) {
          console.warn('지도 SDK 로드 실패:', e)
          return
        }
      }
      this.regionSearchLoading = true
      this.regionSearchResults = []
      const places = new window.kakao.maps.services.Places()
      places.keywordSearch(query, (results, status) => {
        this.regionSearchLoading = false
        if (status === window.kakao.maps.services.Status.OK) {
          this.regionSearchResults = (results || []).slice(0, 8)
        }
      })
    },
    selectRegionSearch(place) {
      const lat = parseFloat(place.y)
      const lng = parseFloat(place.x)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
      this.coords = { lat, lng }
      this.currentAddress = place.place_name || place.road_address_name || place.address_name || ''
      this.regionSearchResults = []
      this.regionSearchQuery = ''
    },

    // ── 브라우저 Geolocation ──────────────────────────────────────
    getCurrentPosition() {
      if (!navigator.geolocation) {
        this.geoError = '이 브라우저는 위치 정보를 지원하지 않습니다.'
        return
      }
      this.geoLoading = true
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          this.gpsCoords = { lat, lng }
          this.coords = { lat, lng }
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

    // ── 주변 공연장 API ───────────────────────────────────────────
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

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>