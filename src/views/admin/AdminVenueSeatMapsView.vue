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
      <template #cell:name="{ row }">
        <button class="font-semibold text-slate-900 hover:underline" type="button" @click="$router.push(`/admin/seat-maps/${row.id}`)">
          {{ row.name }}
        </button>
      </template>
      <template #cell:status="{ row }">
        <UiBadge :tone="row.status==='PUBLISHED'?'solid':'soft'" :color="row.status==='PUBLISHED'?'red':'slate'">
          {{ row.status }}
        </UiBadge>
      </template>
    </UiTable>

    <UiModal :open="createModalOpen" title="좌석맵 생성 (더미)" @close="closeCreateModal">
      <form id="seatmap-create-form" class="grid gap-4" @submit.prevent="submitCreate">
        <div>
          <label class="block text-xs font-semibold text-slate-500">좌석맵 이름 (name)</label>
          <input
            v-model="form.name"
            type="text"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="예: 콘서트형"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500">행 수 (rowCount)</label>
            <input
              v-model.number="form.rowCount"
              type="number"
              min="1"
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="10"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500">열 수 (colCount)</label>
            <input
              v-model.number="form.colCount"
              type="number"
              min="1"
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="10"
            />
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

// seatMap/create API 스펙: { name, rowCount, colCount } (venueId는 자동)
const DUMMY_SEAT_MAP_CREATE = {
  name: '콘서트형',
  rowCount: 10,
  colCount: 10
}

function getDefaultForm() {
  return {
    name: DUMMY_SEAT_MAP_CREATE.name,
    rowCount: DUMMY_SEAT_MAP_CREATE.rowCount,
    colCount: DUMMY_SEAT_MAP_CREATE.colCount
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
        { key: 'name', label: '좌석맵' },
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
      const fromMock = MOCK_SEAT_MAPS.filter((sm) => sm.venueId === venueId)
      const fromCreated = this.createdSeatMaps.filter((sm) => sm.venueId === venueId)
      return [...fromMock, ...fromCreated]
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
      const payload = {
        name: this.form.name || DUMMY_SEAT_MAP_CREATE.name,
        rowCount: Number(this.form.rowCount) || DUMMY_SEAT_MAP_CREATE.rowCount,
        colCount: Number(this.form.colCount) || DUMMY_SEAT_MAP_CREATE.colCount
      }
      // 목록 표시용: 화면에서는 route 기준 venueId로 필터링 (mock와 동일 키 사용)
      const routeVenueId = this.$route.params.venueId
      const id = `sm-dummy-${Date.now()}`
      const seatMap = {
        id,
        venueId: routeVenueId,
        name: payload.name,
        version: 1,
        status: 'DRAFT',
        sections: [{ key: 'A', rows: payload.rowCount, cols: payload.colCount }],
        // API 연동 시 사용할 페이로드 형태 유지
        _createPayload: payload
      }
      this.createdSeatMaps.push(seatMap)
      this.closeCreateModal()
    }
  }
}
</script>
