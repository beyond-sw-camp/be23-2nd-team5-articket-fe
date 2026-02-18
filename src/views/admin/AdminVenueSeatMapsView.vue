<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">좌석맵 목록/버전 생성</div>
          <div class="mt-1 text-sm text-slate-500">{{ venue ? venue.name : '' }}</div>
        </div>
        <UiBadge tone="soft">ADMIN</UiBadge>
      </div>
      <div class="mt-4 flex items-center justify-between">
        <UiButton variant="ghost" class="h-11 px-4" @click="$router.push(`/admin/venues/${$route.params.venueId}`)">공연장</UiButton>
        <UiButton class="h-11 px-5" @click="openCreateModal">좌석맵 생성 (더미)</UiButton>
      </div>
    </UiCard>

    <UiTable :columns="columns" :rows="rows">
      <template #cell:id="{ row }">
        <button class="font-semibold text-slate-900 hover:underline" type="button" @click="$router.push(`/admin/seat-maps/${row.id}`)">
          {{ row.id }}
        </button>
      </template>
      <template #cell:row_count="{ row }">
        <span class="text-sm text-slate-700">
          {{ row.row_count || row.rowCount || '-' }}행 × {{ row.col_count || row.colCount || '-' }}열
        </span>
      </template>
      <template #cell:version="{ row }">
        <span class="text-sm text-slate-600">{{ row.version ?? '-' }}</span>
      </template>
      <template #cell:status="{ row }">
        <UiBadge :tone="row.status==='PUBLISHED'?'solid':'soft'" :color="row.status==='PUBLISHED'?'red':'slate'">
          {{ row.status || 'DRAFT' }}
        </UiBadge>
      </template>
    </UiTable>

    <UiModal :open="createModalOpen" title="좌석맵 생성 (더미)" @close="closeCreateModal">
      <form id="seatmap-create-form" class="grid gap-4" @submit.prevent="submitCreate">
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs font-semibold text-slate-600">ERD: seat_map 테이블</div>
          <div class="mt-2 text-xs text-slate-500">
            필수: row_count, col_count<br />
            선택: version, status (DRAFT/PUBLISHED/ARCHIVED)
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500">행 수 (row_count) *</label>
            <input
              v-model.number="form.row_count"
              type="number"
              min="1"
              required
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="10"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500">열 수 (col_count) *</label>
            <input
              v-model.number="form.col_count"
              type="number"
              min="1"
              required
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="10"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500">버전 (version)</label>
            <input
              v-model.number="form.version"
              type="number"
              min="1"
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="1 (선택)"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500">상태 (status)</label>
            <select
              v-model="form.status"
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option :value="null">선택 안 함</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeCreateModal">취소</UiButton>
          <UiButton as="button" type="submit" form="seatmap-create-form">생성 (더미)</UiButton>
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
import { MOCK_SEAT_MAPS, MOCK_VENUES } from '../../mocks/venues'

// seatMap/create API 스펙: ERD 기반
// 필수: row_count, col_count (venue_id는 URL 경로에서 자동)
// 선택: version, status (DRAFT/PUBLISHED/ARCHIVED)
const DUMMY_SEAT_MAP_CREATE = {
  row_count: 10,
  col_count: 10,
  version: null,
  status: null
}

function getDefaultForm() {
  return {
    row_count: DUMMY_SEAT_MAP_CREATE.row_count,
    col_count: DUMMY_SEAT_MAP_CREATE.col_count,
    version: DUMMY_SEAT_MAP_CREATE.version,
    status: DUMMY_SEAT_MAP_CREATE.status
  }
}

export default {
  name: 'AdminVenueSeatMapsView',
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
        { key: 'id', label: 'ID' },
        { key: 'row_count', label: '행/열' },
        { key: 'version', label: '버전' },
        { key: 'status', label: '상태' }
      ],
      createModalOpen: false,
      form: getDefaultForm(),
      createdSeatMaps: []
    }
  },
  computed: {
    venue() {
      return MOCK_VENUES.find((v) => v.id === this.$route.params.venueId)
    },
    rows() {
      const venueId = this.$route.params.venueId
      // ERD: venue_id 필드로 필터링
      const fromMock = MOCK_SEAT_MAPS.filter((sm) => sm.venue_id === venueId)
      const fromCreated = this.createdSeatMaps.filter((sm) => sm.venue_id === venueId)
      return [...fromMock, ...fromCreated]
    }
  },
  created() {
    // localStorage에서 생성된 더미 데이터 로드
    try {
      const stored = JSON.parse(localStorage.getItem('createdSeatMaps') || '[]')
      this.createdSeatMaps = stored
    } catch (e) {
      console.warn('Failed to load created seat maps from localStorage', e)
      this.createdSeatMaps = []
    }
  },
  methods: {
    openCreateModal() {
      this.form = getDefaultForm()
      this.createModalOpen = true
    },
    closeCreateModal() {
      this.createModalOpen = false
    },
    submitCreate() {
      // ERD 기반 API 페이로드: row_count, col_count 필수, version/status 선택
      const payload = {
        row_count: Number(this.form.row_count) || DUMMY_SEAT_MAP_CREATE.row_count,
        col_count: Number(this.form.col_count) || DUMMY_SEAT_MAP_CREATE.col_count
      }
      // 선택 필드 추가 (값이 있으면)
      if (this.form.version !== null && this.form.version !== undefined && this.form.version !== '') {
        payload.version = Number(this.form.version)
      }
      if (this.form.status !== null && this.form.status !== undefined && this.form.status !== '') {
        payload.status = this.form.status
      }
      
      // 목록 표시용: 화면에서는 route 기준 venueId로 필터링 (mock와 동일 키 사용)
      const routeVenueId = this.$route.params.venueId
      const id = `sm-dummy-${Date.now()}`
      const seatMap = {
        id,
        venue_id: routeVenueId,
        row_count: payload.row_count,
        col_count: payload.col_count,
        version: payload.version ?? null,
        status: payload.status ?? 'DRAFT',
        _createPayload: payload
      }
      this.createdSeatMaps.push(seatMap)
      // localStorage에 저장 (미리보기에서도 접근 가능하도록)
      const stored = JSON.parse(localStorage.getItem('createdSeatMaps') || '[]')
      stored.push(seatMap)
      localStorage.setItem('createdSeatMaps', JSON.stringify(stored))
      this.closeCreateModal()
    }
  }
}
</script>
