<template>
  <UiModal :open="open" title="장소 미리보기" @close="$emit('close')">
    <div v-if="venue" class="flex flex-col gap-4">
      <!-- 공연장명 -->
      <p class="text-base font-bold text-slate-900">{{ venue.name }}</p>

      <!-- 주소 + 복사 -->
      <div class="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p class="min-w-0 flex-1 text-sm text-slate-700">{{ displayAddress }}</p>
        <button
          type="button"
          class="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          @click="copyAddress"
        >
          {{ copySuccess ? '복사됨' : '복사' }}
        </button>
      </div>

      <!-- 지도 / 로드뷰 (좌표 있을 때) -->
      <div v-if="hasCoords" class="space-y-2">
        <div class="flex gap-2">
          <button
            type="button"
            :class="[
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
              mapMode === 'map'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
            @click="mapMode = 'map'"
          >
            지도
          </button>
          <button
            type="button"
            :class="[
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
              mapMode === 'roadview'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
            @click="mapMode = 'roadview'"
          >
            로드뷰
          </button>
        </div>
        <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100" style="min-height: 220px;">
          <div ref="mapContainer" class="absolute inset-0 w-full" style="height: 220px;" :class="{ 'invisible': mapMode === 'roadview' }" />
          <div
            v-show="mapMode === 'roadview'"
            ref="roadviewContainer"
            class="absolute inset-0 w-full"
            style="height: 220px;"
          />
          <div v-if="mapLoading" class="absolute inset-0 flex items-center justify-center bg-slate-100">
            <span class="text-xs text-slate-500">지도 불러오는 중…</span>
          </div>
          <div v-else-if="mapMode === 'roadview' && roadviewError" class="absolute inset-0 flex items-center justify-center bg-slate-100">
            <span class="text-xs text-slate-500">해당 위치에는 로드뷰가 없습니다</span>
          </div>
        </div>
      </div>

      <!-- 좌표 없을 때: 카카오맵 검색 링크 -->
      <div v-else-if="displayAddress" class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p class="text-xs text-slate-500">지도는 주소 검색으로 확인할 수 있어요.</p>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <a
          v-if="kakaoMapUrl"
          :href="kakaoMapUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 rounded-xl border border-[#FEE500] bg-[#FEE500] px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:opacity-90"
          @click="$emit('close')"
        >
          <span class="flex h-6 w-6 items-center justify-center rounded bg-white text-xs font-bold">K</span>
          카카오맵 길찾기
        </a>
      </div>
    </template>
  </UiModal>
</template>

<script>
import UiModal from '../common/UiModal.vue'
import { loadKakaoSdk } from '../../lib/kakaoMap'

export default {
  name: 'VenuePreviewModal',
  components: { UiModal },
  props: {
    open: { type: Boolean, default: false },
    venue: {
      type: Object,
      default: null,
    },
  },
  emits: ['close'],
  data() {
    return {
      mapMode: 'map',
      mapLoading: false,
      copySuccess: false,
      mapInstance: null,
      roadviewInstance: null,
      roadviewError: false,
    }
  },
  computed: {
    displayAddress() {
      const v = this.venue
      if (!v) return ''
      return v.address ?? v.formattedAddress ?? v.formatted_address ?? ''
    },
    coords() {
      const v = this.venue
      if (!v) return null
      const lat = v.latitude ?? v.lat
      const lng = v.longitude ?? v.lng
      if (lat != null && lng != null) return { lat, lng }
      return null
    },
    hasCoords() {
      return !!this.coords
    },
    kakaoMapUrl() {
      const v = this.venue
      if (!v) return ''
      const c = this.coords
      if (c) {
        const name = encodeURIComponent(v.name || '공연장')
        return `https://map.kakao.com/link/to/${name},${c.lat},${c.lng}`
      }
      const addr = this.displayAddress
      if (addr) return `https://map.kakao.com/?q=${encodeURIComponent(addr)}`
      return ''
    },
  },
  watch: {
    open(val) {
      if (val && this.hasCoords) {
        this.roadviewError = false
        this.$nextTick(() => this.initMap())
      } else {
        this.mapInstance = null
        this.roadviewInstance = null
        this.roadviewError = false
      }
    },
    mapMode(val) {
      if (val === 'roadview' && this.hasCoords && !this.roadviewInstance) {
        this.roadviewError = false
        this.$nextTick(() => {
          setTimeout(() => this.initRoadview(), 150)
        })
      }
    },
  },
  methods: {
    async initMap() {
      const c = this.coords
      if (!this.$refs.mapContainer || !c) return
      this.mapLoading = true
      try {
        const maps = await loadKakaoSdk()
        const position = new maps.LatLng(c.lat, c.lng)
        this.mapInstance = new maps.Map(this.$refs.mapContainer, {
          center: position,
          level: 3,
        })
        new maps.Marker({ position, map: this.mapInstance, title: this.venue.name })
        if (this.mapInstance.relayout) this.mapInstance.relayout()
      } catch {
        // 앱 키 미설정 등
      } finally {
        this.mapLoading = false
      }
    },
    async initRoadview() {
      const c = this.coords
      const container = this.$refs.roadviewContainer
      if (!container || !window.kakao?.maps || !c) return

      const maps = window.kakao.maps
      if (!maps.Roadview || !maps.RoadviewClient) {
        this.roadviewError = true
        return
      }

      const position = new maps.LatLng(c.lat, c.lng)

      // 공식 샘플 순서: Roadview 객체를 먼저 생성 후 setPanoId
      try {
        this.roadviewInstance = new maps.Roadview(container)
        const rvClient = new maps.RoadviewClient()
        rvClient.getNearestPanoId(position, 50, (panoId) => {
          if (panoId === null) {
            this.roadviewError = true
            return
          }
          this.roadviewInstance.setPanoId(panoId, position)
          this.roadviewError = false
          if (this.roadviewInstance.relayout) this.roadviewInstance.relayout()
        })
      } catch {
        this.roadviewError = true
      }
    },
    copyAddress() {
      const addr = this.displayAddress
      if (!addr) return
      navigator.clipboard
        .writeText(addr)
        .then(() => {
          this.copySuccess = true
          setTimeout(() => { this.copySuccess = false }, 2000)
        })
        .catch(() => {})
    },
  },
}
</script>
