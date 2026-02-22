<template>
  <div class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">공연장 생성/목록</div>
        <div class="mt-1 text-sm text-slate-500">POST /admin/venues/create · GET /admin/venues/list</div>
      </div>
      <UiBadge tone="soft">ADMIN</UiBadge>
    </div>

    <UiCard>
      <div class="flex items-center justify-between gap-3">
        <div class="text-sm text-slate-600">새 공연장을 등록하고 실제 서버 목록을 갱신합니다.</div>
        <UiButton class="h-11 px-5" @click="openCreateModal">공연장 생성</UiButton>
      </div>
    </UiCard>

    <UiTable :columns="columns" :rows="rows">
      <template #cell:name="{ row }">
        <button class="font-semibold text-slate-900 hover:underline" type="button" @click="$router.push(`/admin/venues/${row.id}`)">
          {{ row.name }}
        </button>
      </template>
      <template #cell:seatMaps="{ row }">
        <button class="font-semibold text-slate-700 hover:underline" type="button" @click="$router.push(`/admin/venues/${row.id}/seat-maps`)">
          {{ row.seatMaps }}개
        </button>
      </template>
    </UiTable>

    <UiModal :open="createModalOpen" title="공연장 생성" @close="closeCreateModal">
      <form id="venue-create-form" class="grid gap-4" @submit.prevent="submitCreate">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500">공연장명 (name) *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="세종문화회관 중극장"
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
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs font-semibold text-slate-600">venueAddressReqDto</div>
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

// venue/create API 스펙 (id 자동채번)
const DUMMY_VENUE_ADDRESS = {
  formattedAddress: '서울특별시 종로구 세종대로 175',
  road: '세종대로',
  houseNumber: '175',
  sido: '서울특별시',
  sigungu: '종로구',
  eupmyeondong: '세종로',
  postCode: '03172',
  addressDetail: '중극장',
  latitude: 37.5726,
  longitude: 126.9769
}

function getDefaultForm() {
  return {
    name: '세종문화회관 중극장',
    status: 'ACTIVE',
    venueAddressReqDto: { ...DUMMY_VENUE_ADDRESS }
  }
}

export default {
  name: 'AdminVenuesView',
  components: {
    UiCard,
    UiTable,
    UiButton,
    UiBadge,
    UiModal
  },
  data() {
    return {
      columns: [
        { key: 'name', label: '공연장' },
        { key: 'address', label: '주소' },
        { key: 'seatMaps', label: '좌석맵' }
      ],
      api: null,
      rows: [],
      createModalOpen: false,
      form: getDefaultForm(),
      loading: false
    }
  },
  created() {
    this.api = useApi()
    this.loadVenues()
  },
  methods: {
    toVenueRow(item) {
      const addressObj = item?.venueAddressResDto || item?.venueAddress || {}
      const address =
        item?.address ||
        item?.formattedAddress ||
        addressObj?.formattedAddress ||
        [addressObj?.sido, addressObj?.sigungu, addressObj?.eupmyeondong, addressObj?.road, addressObj?.houseNumber]
          .filter(Boolean)
          .join(' ')
      return {
        id: item?.id,
        name: item?.name || '-',
        address: address || '-',
        seatMaps: item?.seatMapCount ?? (Array.isArray(item?.seatMapIds) ? item.seatMapIds.length : 0)
      }
    },
    normalizeVenueListResponse(res) {
      const list = Array.isArray(res) ? res : res?.content || res?.items || []
      return list.map(this.toVenueRow)
    },
    async loadVenues() {
      this.loading = true
      try {
        const res = await this.api.get(ENDPOINTS.adminVenueList({ page: 0, size: 100 }))
        this.rows = this.normalizeVenueListResponse(res)
      } finally {
        this.loading = false
      }
    },
    openCreateModal() {
      this.form = getDefaultForm()
      this.createModalOpen = true
    },
    closeCreateModal() {
      this.createModalOpen = false
    },
    async submitCreate() {
      const addr = this.form.venueAddressReqDto || {}
      const payload = {
        name: this.form.name || '세종문화회관 중극장',
        status: this.form.status || 'ACTIVE',
        venueAddressReqDto: {
          formattedAddress: addr.formattedAddress || DUMMY_VENUE_ADDRESS.formattedAddress,
          road: addr.road || DUMMY_VENUE_ADDRESS.road,
          houseNumber: addr.houseNumber || DUMMY_VENUE_ADDRESS.houseNumber,
          sido: addr.sido || DUMMY_VENUE_ADDRESS.sido,
          sigungu: addr.sigungu || DUMMY_VENUE_ADDRESS.sigungu,
          eupmyeondong: addr.eupmyeondong || DUMMY_VENUE_ADDRESS.eupmyeondong,
          postCode: addr.postCode || DUMMY_VENUE_ADDRESS.postCode,
          addressDetail: addr.addressDetail || DUMMY_VENUE_ADDRESS.addressDetail,
          latitude: Number.isFinite(Number(addr.latitude)) ? Number(addr.latitude) : DUMMY_VENUE_ADDRESS.latitude,
          longitude: Number.isFinite(Number(addr.longitude)) ? Number(addr.longitude) : DUMMY_VENUE_ADDRESS.longitude
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
