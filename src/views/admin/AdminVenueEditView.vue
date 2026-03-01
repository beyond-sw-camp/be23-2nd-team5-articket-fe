<template>
  <div v-if="!venue && !loadError" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
    불러오는 중…
  </div>
  <div v-else-if="loadError" class="rounded-2xl border border-slate-200 bg-white p-8 text-center">
    <div class="text-sm text-slate-600">공연장을 찾을 수 없습니다.</div>
    <UiButton class="mt-3" @click="$router.push('/admin/venues')">목록으로</UiButton>
  </div>
  <UiCard v-else-if="venue">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">공연장 수정</h1>
        <p class="mt-1 text-sm text-slate-500">{{ venue.name }}</p>
      </div>
      <UiBadge tone="soft">ADMIN</UiBadge>
    </div>

    <form id="venue-edit-form" class="mt-4 grid gap-4" @submit.prevent="submitUpdate">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-500">공연장명 (name) *</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="공연장 이름"
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
            />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-semibold text-slate-500">도로명 (road)</label>
              <input
                v-model="form.venueAddressReqDto.road"
                type="text"
                class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500">건물번호 (houseNumber)</label>
              <input
                v-model="form.venueAddressReqDto.houseNumber"
                type="text"
                class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500">시군구 (sigungu)</label>
              <input
                v-model="form.venueAddressReqDto.sigungu"
                type="text"
                class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500">읍면동 (eupmyeondong)</label>
              <input
                v-model="form.venueAddressReqDto.eupmyeondong"
                type="text"
                class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500">상세주소 (addressDetail)</label>
              <input
                v-model="form.venueAddressReqDto.addressDetail"
                type="text"
                class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500">경도 (longitude)</label>
              <input
                v-model.number="form.venueAddressReqDto.longitude"
                type="number"
                step="any"
                class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
        </div>
      </div>
      <p v-if="successMessage" class="text-sm text-green-600">{{ successMessage }}</p>
      <div class="flex flex-wrap gap-2">
        <UiButton variant="ghost" type="button" class="h-11 px-4" @click="$router.push('/admin/venues')">목록</UiButton>
        <UiButton variant="ghost" type="button" class="h-11 px-4" @click="$router.push(`/admin/venues/${venueId}`)">상세보기</UiButton>
        <UiButton variant="tonal" type="button" class="h-11 px-4" @click="$router.push(`/admin/venues/${venueId}/seat-maps`)">좌석맵 관리</UiButton>
        <UiButton as="button" type="submit" class="h-11 px-5" :disabled="saving">저장</UiButton>
      </div>
    </form>
  </UiCard>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

const defaultAddress = () => ({
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
})

export default {
  name: 'AdminVenueEditView',
  components: {
    UiCard,
    UiBadge,
    UiButton
  },
  data() {
    return {
      api: null,
      form: {
        name: '',
        status: 'ACTIVE',
        venueAddressReqDto: defaultAddress()
      },
      venue: null,
      loadError: false,
      saving: false,
      successMessage: ''
    }
  },
  computed: {
    venueId() {
      return this.$route.params.venueId
    }
  },
  watch: {
    venueId: {
      handler() {
        this.loadVenue()
      }
    },
    venue: {
      immediate: true,
      handler(v) {
        if (!v) return
        const address = v.venueAddressResDto || v.venueAddress || {}
        this.form = {
          name: v.name,
          status: v.status || 'ACTIVE',
          venueAddressReqDto: {
            ...defaultAddress(),
            formattedAddress: v.address || address.formattedAddress || '',
            road: address.road || '',
            houseNumber: address.houseNumber || '',
            sido: address.sido || '',
            sigungu: address.sigungu || '',
            eupmyeondong: address.eupmyeondong || '',
            postCode: address.postCode || '',
            addressDetail: address.addressDetail || '',
            latitude: v.lat ?? address.latitude ?? null,
            longitude: v.lng ?? address.longitude ?? null
          }
        }
        this.successMessage = ''
      }
    }
  },
  created() {
    this.api = useApi()
    this.loadVenue()
  },
  methods: {
    async loadVenue() {
      if (this.venueId == null || this.venueId === '') return
      this.successMessage = ''
      this.loadError = false
      try {
        this.venue = await this.api.get(ENDPOINTS.adminVenueDetail(this.venueId))
      } catch (err) {
        this.venue = null
        this.loadError = true
      }
    },
    async submitUpdate() {
      if (this.venueId == null || this.venueId === '') return
      this.successMessage = ''
      this.saving = true
      const payload = {
        name: this.form.name,
        status: this.form.status || 'ACTIVE',
        venueAddressReqDto: {
          formattedAddress: this.form.venueAddressReqDto.formattedAddress ?? '',
          road: this.form.venueAddressReqDto.road ?? '',
          houseNumber: this.form.venueAddressReqDto.houseNumber ?? '',
          sido: this.form.venueAddressReqDto.sido ?? '',
          sigungu: this.form.venueAddressReqDto.sigungu ?? '',
          eupmyeondong: this.form.venueAddressReqDto.eupmyeondong ?? '',
          postCode: this.form.venueAddressReqDto.postCode ?? '',
          addressDetail: this.form.venueAddressReqDto.addressDetail ?? '',
          latitude: Number.isFinite(Number(this.form.venueAddressReqDto.latitude))
            ? Number(this.form.venueAddressReqDto.latitude)
            : null,
          longitude: Number.isFinite(Number(this.form.venueAddressReqDto.longitude))
            ? Number(this.form.venueAddressReqDto.longitude)
            : null
        }
      }
      try {
        await this.api.put(ENDPOINTS.adminUpdateVenue(this.venueId), payload)
        this.successMessage = '저장되었습니다.'
      } catch (err) {
        // 에러는 ErrorAlertModal에서 표시됨
      } finally {
        this.saving = false
      }
    }
  }
}
</script>
