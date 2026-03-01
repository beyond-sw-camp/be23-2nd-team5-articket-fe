<template>
  <div class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">공연장 관리</h1>
        <p class="mt-1 text-sm text-slate-500">공연장을 등록하고 목록을 관리합니다.</p>
      </div>
      <div class="flex items-center gap-2">
        <UiBadge tone="soft">ADMIN</UiBadge>
        <UiButton class="h-11 px-5" @click="openCreateModal">공연장 생성</UiButton>
      </div>
    </div>

    <!-- 통합검색 -->
    <div class="flex gap-2 rounded-2xl border border-slate-200 bg-white p-4">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="공연장명, 주소, 키워드로 검색"
        class="h-10 flex-1 min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        @keydown.enter.prevent="doSearch"
      />
      <UiButton class="h-10 px-4 shrink-0" @click="doSearch">검색</UiButton>
      <UiButton variant="ghost" class="h-10 px-4 shrink-0" @click="resetSearch">초기화</UiButton>
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      목록을 불러오는 중…
    </div>
    <UiTable v-else :columns="columns" :rows="rows">
      <template #cell:name="{ row }">
        <span class="font-semibold text-slate-900">{{ row.name }}</span>
      </template>
      <template #cell:status="{ row }">
        <UiBadge :tone="row.status === 'ACTIVE' ? 'soft' : 'outline'" :color="row.status === 'ACTIVE' ? 'green' : 'slate'">
          {{ row.status === 'ACTIVE' ? '활성' : (row.status === 'INACTIVE' ? '비활성' : row.status || '-') }}
        </UiBadge>
      </template>
      <template #cell:formattedAddress="{ row }">
        <span class="text-sm text-slate-700 max-w-xs truncate block" :title="row.formattedAddress">{{ row.formattedAddress || '-' }}</span>
      </template>
      <template #cell:addressDetail="{ row }">
        <span class="text-sm text-slate-600">{{ row.addressDetail || '-' }}</span>
      </template>
      <template #cell:seatMapCount="{ row }">
        <button class="font-semibold text-slate-700 hover:underline" type="button" @click="$router.push(`/admin/venues/${row.id}/seat-maps`)">
          {{ row.seatMapCount ?? 0 }}개
        </button>
      </template>
      <template #cell:actions="{ row }">
        <UiButton variant="ghost" class="h-8 px-3 text-sm" @click="$router.push(`/admin/venues/${row.id}`)">
          상세보기
        </UiButton>
      </template>
    </UiTable>

    <!-- 페이징 -->
    <div v-if="!loading && totalPages > 1" class="flex items-center justify-center gap-2">
      <UiButton variant="ghost" class="h-9 px-3" :disabled="page <= 0" @click="goPage(page - 1)">
        이전
      </UiButton>
      <span class="text-sm text-slate-600">{{ page + 1 }} / {{ totalPages }}</span>
      <UiButton variant="ghost" class="h-9 px-3" :disabled="page >= totalPages - 1" @click="goPage(page + 1)">
        다음
      </UiButton>
    </div>

    <!-- 공연장 생성 모달 -->
    <UiModal :open="createModalOpen" title="공연장 생성" @close="closeCreateModal">
      <form id="venue-create-form" class="grid gap-5" @submit.prevent="submitCreate">

        <!-- Step 1: 기본 정보 -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500">공연장명 (name) *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="세종문화회관 중극장"
              @keydown.enter.prevent
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500">상태 (status) *</label>
            <select
              v-model="form.status"
              required
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>

        <!-- Step 2: 카카오 지도 검색 -->
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div class="mb-3 flex items-center gap-2">
            <svg class="h-4 w-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <div class="text-xs font-semibold text-slate-600">카카오 지도로 주소 검색</div>
          </div>

          <!-- 검색창 -->
          <div class="flex gap-2">
            <input
              v-model="mapSearchQuery"
              type="text"
              class="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="장소명 또는 주소를 입력하세요"
              @keydown.enter.prevent="searchPlaces"
            />
            <button
              type="button"
              class="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-yellow-500 active:bg-yellow-600"
              @click="searchPlaces"
            >
              검색
            </button>
          </div>

          <!-- 검색 결과 목록 -->
          <div v-if="placeResults.length > 0" class="mt-3 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <button
              v-for="(place, idx) in placeResults"
              :key="idx"
              type="button"
              class="flex w-full flex-col gap-0.5 border-b border-slate-100 px-3 py-2.5 text-left last:border-none hover:bg-slate-50"
              @click="selectPlace(place)"
            >
              <span class="text-sm font-semibold text-slate-900">{{ place.place_name }}</span>
              <span class="text-xs text-slate-400">{{ place.road_address_name || place.address_name }}</span>
            </button>
          </div>
          <div v-else-if="mapSearchQuery && mapSearchDone" class="mt-3 rounded-xl border border-slate-100 bg-white px-3 py-3 text-center text-xs text-slate-400">
            검색 결과가 없습니다.
          </div>

          <!-- 카카오 지도 -->
          <div class="relative mt-3 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <div ref="mapContainer" class="h-64 w-full bg-slate-100" />
            <!-- 지도 미로드 상태 안내 -->
            <div v-if="!mapLoaded && !mapLoadError" class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100">
              <svg class="h-8 w-8 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span class="text-xs text-slate-400">카카오 지도 SDK를 불러오는 중...</span>
            </div>
            <!-- 지도 로드 실패 안내 -->
            <div v-else-if="mapLoadError" class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100 px-4 text-center">
              <svg class="h-8 w-8 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span class="text-xs font-medium text-slate-600">지도를 불러올 수 없습니다</span>
              <span class="text-xs text-slate-500">앱 키와 카카오 개발자 콘솔의 도메인 설정을 확인해 주세요.</span>
            </div>
            <!-- 선택된 장소 핀 표시 오버레이 -->
            <div v-if="selectedPlace" class="absolute bottom-3 left-3 right-3 rounded-lg bg-white/90 px-3 py-2 text-xs shadow backdrop-blur-sm">
              <span class="font-semibold text-slate-800">{{ selectedPlace.place_name }}</span>
              <span class="ml-2 text-slate-500">{{ selectedPlace.road_address_name || selectedPlace.address_name }}</span>
            </div>
          </div>
        </div>

        <!-- Step 3: 주소 정보 (자동 채워짐 + 수동 수정 가능) -->
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div class="flex items-center justify-between">
            <div class="text-xs font-semibold text-slate-600">venueAddressReqDto</div>
            <span v-if="selectedPlace" class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">지도에서 자동 입력됨</span>
          </div>
          <div class="mt-3 grid gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-500">전체주소 (formattedAddress)</label>
              <input
                v-model="form.venueAddressReqDto.formattedAddress"
                type="text"
                class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                placeholder="서울특별시 종로구 세종대로 175"
              />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-semibold text-slate-500">도로명 (road)</label>
                <input
                  v-model="form.venueAddressReqDto.road"
                  type="text"
                  class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="세종대로"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500">건물번호 (houseNumber)</label>
                <input
                  v-model="form.venueAddressReqDto.houseNumber"
                  type="text"
                  class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="175"
                />
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-xs font-semibold text-slate-500">시도 (sido)</label>
                <input
                  v-model="form.venueAddressReqDto.sido"
                  type="text"
                  class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="서울특별시"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500">시군구 (sigungu)</label>
                <input
                  v-model="form.venueAddressReqDto.sigungu"
                  type="text"
                  class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="종로구"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500">읍면동 (eupmyeondong)</label>
                <input
                  v-model="form.venueAddressReqDto.eupmyeondong"
                  type="text"
                  class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="세종로"
                />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-semibold text-slate-500">우편번호 (postCode)</label>
                <input
                  v-model="form.venueAddressReqDto.postCode"
                  type="text"
                  class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="03172"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500">상세주소 (addressDetail)</label>
                <input
                  v-model="form.venueAddressReqDto.addressDetail"
                  type="text"
                  class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="중극장"
                />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-semibold text-slate-500">위도 (latitude)</label>
                <input
                  v-model.number="form.venueAddressReqDto.latitude"
                  type="number"
                  step="any"
                  class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="37.5726"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500">경도 (longitude)</label>
                <input
                  v-model.number="form.venueAddressReqDto.longitude"
                  type="number"
                  step="any"
                  class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="126.9769"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeCreateModal">취소</UiButton>
          <UiButton as="button" type="submit" form="venue-create-form">생성</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiTable from '../../components/common/UiTable.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiModal from '../../components/common/UiModal.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

// ─── 카카오 SDK 로더 ───────────────────────────────────────────────
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
    script.onerror = (e) => {
      reject(new Error('카카오 지도 스크립트를 불러올 수 없습니다. 앱 키와 카카오 개발자 콘솔의 도메인 설정을 확인해 주세요.'))
    }
    document.head.appendChild(script)
  })
}

// ─── 기본 폼 ──────────────────────────────────────────────────────
function getDefaultForm() {
  return {
    name: '',
    status: 'ACTIVE',
    venueAddressReqDto: {
      formattedAddress: '',
      road: '',
      houseNumber: '',
      sido: '',
      sigungu: '',
      eupmyeondong: '',
      postCode: '',
      addressDetail: '',
      latitude: null,
      longitude: null
    }
  }
}

export default {
  name: 'AdminVenuesView',
  components: { UiCard, UiTable, UiButton, UiBadge, UiModal },

  data() {
    return {
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: '공연장명' },
        { key: 'status', label: '상태' },
        { key: 'formattedAddress', label: '주소' },
        { key: 'addressDetail', label: '상세주소' },
        { key: 'seatMapCount', label: '좌석맵' },
        { key: 'actions', label: '작업' }
      ],
      api: null,
      rows: [],
      createModalOpen: false,
      form: getDefaultForm(),
      loading: false,

      // 검색·페이징
      searchKeyword: '',
      page: 0,
      totalPages: 1,
      pageSize: 10,

      // 지도 관련
      mapSearchQuery: '',
      placeResults: [],
      mapSearchDone: false,
      selectedPlace: null,
      mapLoaded: false,
      mapLoadError: false,
      kakaoMap: null,
      kakaoMarker: null,
      kakaoServices: null
    }
  },

  created() {
    this.api = useApi()
    this.loadVenues()
  },
  watch: {
    page() {
      this.loadVenues()
    },
  },

  methods: {
    doSearch() {
      this.page = 0
      this.loadVenues()
    },
    resetSearch() {
      this.searchKeyword = ''
      this.page = 0
      this.loadVenues()
    },
    goPage(p) {
      if (p < 0 || p >= this.totalPages) return
      this.page = p
    },
    // ── 공연장 목록 ──────────────────────────────────────────────
    toVenueRow(item) {
      const rawStatus = item?.venueStatus ?? item?.status
      const status = rawStatus ? String(rawStatus).toUpperCase() : ''
      return {
        id: item?.id,
        name: item?.name || '-',
        status: status || '-',
        formattedAddress: item?.formattedAddress || '-',
        addressDetail: item?.addressDetail || '-',
        seatMapCount: item?.seatMapCount ?? (Array.isArray(item?.seatMapIds) ? item.seatMapIds.length : 0)
      }
    },
    normalizeVenueListResponse(res) {
      const list = Array.isArray(res) ? res : res?.content || res?.items || []
      return list.map(this.toVenueRow)
    },
    async loadVenues() {
      this.loading = true
      try {
        const kw = this.searchKeyword?.trim()
        const params = {
          page: this.page,
          size: this.pageSize,
          ...(kw && { keyword: kw }),
        }
        const res = await this.api.get(ENDPOINTS.adminVenueList(params))
        const list = res?.content ?? res
        this.rows = this.normalizeVenueListResponse(list)
        this.totalPages = Math.max(1, res?.totalPages ?? 1)
      } finally {
        this.loading = false
      }
    },

    // ── 모달 열기/닫기 ───────────────────────────────────────────
    async openCreateModal() {
      this.form = getDefaultForm()
      this.mapSearchQuery = ''
      this.placeResults = []
      this.mapSearchDone = false
      this.selectedPlace = null
      this.kakaoMap = null
      this.kakaoMarker = null
      this.mapLoaded = false
      this.mapLoadError = false
      this.createModalOpen = true

      // 모달 DOM이 렌더링된 후 지도 초기화
      await this.$nextTick()
      this.initMap()
    },
    closeCreateModal() {
      this.createModalOpen = false
    },

    // ── 카카오 지도 초기화 ───────────────────────────────────────
    async initMap() {
      try {
        const maps = await loadKakaoSdk()
        const container = this.$refs.mapContainer
        if (!container) return

        const options = {
          center: new maps.LatLng(37.5665, 126.9780), // 서울 시청 기본
          level: 5
        }
        this.kakaoMap = new maps.Map(container, options)
        this.kakaoServices = new maps.services.Places()
        this.mapLoaded = true
      } catch (e) {
        this.mapLoadError = true
        console.warn('카카오 지도 SDK 로드 실패:', e?.message || e)
      }
    },

    // ── 장소 검색 ────────────────────────────────────────────────
    searchPlaces() {
      if (!this.mapSearchQuery.trim() || !this.kakaoServices) return
      this.mapSearchDone = false
      this.placeResults = []

      this.kakaoServices.keywordSearch(this.mapSearchQuery, (results, status) => {
        this.mapSearchDone = true
        if (status === window.kakao.maps.services.Status.OK) {
          this.placeResults = results.slice(0, 8)
        }
      })
    },

    // ── 장소 선택 → 지도 이동 + 폼 자동 채우기 ──────────────────
    async selectPlace(place) {
      this.selectedPlace = place
      this.placeResults = []
      this.mapSearchQuery = place.place_name

      const lat = parseFloat(place.y)
      const lng = parseFloat(place.x)

      // 지도 이동
      if (this.kakaoMap) {
        const maps = window.kakao.maps
        const position = new maps.LatLng(lat, lng)
        this.kakaoMap.setCenter(position)
        this.kakaoMap.setLevel(3)

        // 기존 마커 제거 후 새 마커 생성
        if (this.kakaoMarker) this.kakaoMarker.setMap(null)
        this.kakaoMarker = new maps.Marker({ position, map: this.kakaoMap })
      }

      // 도로명 주소 분해 (road_address 객체 활용)
      const roadAddr = place.road_address_name || ''
      const jibunAddr = place.address_name || ''

      // 상세 주소 정보는 address 검색으로 보강
      this.fillFormFromPlace(place, lat, lng, roadAddr, jibunAddr)
    },

    fillFormFromPlace(place, lat, lng, roadAddr, jibunAddr) {
      const addr = place.road_address_name || place.address_name || ''

      // 주소 파싱 헬퍼
      const parts = addr.split(' ')
      const sido = parts[0] || ''
      const sigungu = parts[1] || ''
      const eupmyeondong = parts[2] || ''

      // 도로명 / 건물번호 분리
      let road = ''
      let houseNumber = ''
      if (place.road_address_name) {
        const roadParts = place.road_address_name.split(' ')
        // "서울특별시 종로구 세종대로 175" → road=세종대로, houseNumber=175
        houseNumber = roadParts[roadParts.length - 1] || ''
        road = roadParts[roadParts.length - 2] || ''
      }

      this.form.venueAddressReqDto = {
        formattedAddress: addr,
        road,
        houseNumber,
        sido,
        sigungu,
        eupmyeondong,
        postCode: place.zip_code || '',
        addressDetail: '',
        latitude: lat,
        longitude: lng
      }

      // 공연장명이 비어있으면 장소명으로 자동 채움
      if (!this.form.name) {
        this.form.name = place.place_name
      }
    },

    // ── 공연장 생성 제출 ─────────────────────────────────────────
    async submitCreate() {
      const addr = this.form.venueAddressReqDto || {}
      const payload = {
        name: this.form.name,
        status: this.form.status,
        venueAddressReqDto: {
          formattedAddress: addr.formattedAddress || '',
          road: addr.road || '',
          houseNumber: addr.houseNumber || '',
          sido: addr.sido || '',
          sigungu: addr.sigungu || '',
          eupmyeondong: addr.eupmyeondong || '',
          postCode: addr.postCode || '',
          addressDetail: addr.addressDetail || '',
          latitude: Number.isFinite(Number(addr.latitude)) ? Number(addr.latitude) : 0,
          longitude: Number.isFinite(Number(addr.longitude)) ? Number(addr.longitude) : 0
        }
      }
      try {
        await this.api.post(ENDPOINTS.adminCreateVenue(), payload)
        this.closeCreateModal()
        await this.loadVenues()
      } catch (err) {
        console.warn('Failed to create venue', err)
      }
    }
  }
}
</script>
