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
        <UiButton class="h-11 px-5" @click="openCreateModal">좌석맵 생성</UiButton>
      </div>
    </UiCard>

    <UiTable :columns="columns" :rows="rows">
      <template #cell:id="{ row }">
        <button
          class="font-semibold text-slate-900 hover:underline"
          type="button"
          @click="$router.push({ path: `/admin/seat-maps/${row.id}`, query: { venueId: venueId } })"
        >
          {{ row.id }}
        </button>
      </template>
      <template #cell:name="{ row }">
        <span class="text-sm text-slate-700">{{ row.name || '-' }}</span>
      </template>
      <template #cell:size="{ row }">
        <span class="text-sm text-slate-700">
          {{ row.row_count || row.rowCount || '-' }}행 × {{ row.col_count || row.colCount || '-' }}열
        </span>
      </template>
      <template #cell:sections="{ row }">
        <span class="text-sm text-slate-700">{{ row.sectionsCount ?? '-' }}개</span>
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

    <UiModal :open="createModalOpen" title="좌석맵 생성" @close="closeCreateModal">
      <form id="seatmap-create-form" class="grid gap-4" @submit.prevent="submitCreate">
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs font-semibold text-slate-600">SeatMapController</div>
          <div class="mt-2 text-xs text-slate-500">
            섹션을 비워두면 `create` 호출, 섹션을 1개 이상 넣으면 `createWithSections` 호출
          </div>
        </div>
        <div class="grid gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500">좌석맵 이름 (name) *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="콘서트용 기본 레이아웃"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
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
        <div class="rounded-xl border border-slate-200 p-3">
          <div class="flex items-center justify-between">
            <div class="text-xs font-semibold text-slate-600">섹션(선택)</div>
            <UiButton type="button" class="h-9 px-3" @click="addSectionDraft">섹션 추가</UiButton>
          </div>
          <div v-if="form.sections.length === 0" class="mt-2 text-xs text-slate-500">섹션 없이 생성 가능</div>
          <div v-for="(section, index) in form.sections" :key="section._key" class="mt-3 rounded-lg border border-slate-200 p-3">
            <div class="mb-2 flex items-center justify-between">
              <div class="text-xs font-semibold text-slate-500">섹션 {{ index + 1 }}</div>
              <button type="button" class="text-xs font-semibold text-red-600 hover:underline" @click="removeSectionDraft(section._key)">삭제</button>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="section.name"
                type="text"
                class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="name (예: VIP)"
              />
              <input
                v-model="section.displayColor"
                type="text"
                class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="displayColor (예: #FF5733)"
              />
              <input
                v-model.number="section.rows"
                type="number"
                min="1"
                class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="rows"
              />
              <input
                v-model.number="section.seatsPerRow"
                type="number"
                min="1"
                class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="seatsPerRow"
              />
              <select v-model="section.initialGrade" class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900">
                <option value="VIP">VIP</option>
                <option value="R">R</option>
                <option value="S">S</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeCreateModal">취소</UiButton>
          <UiButton as="button" type="submit" form="seatmap-create-form">생성</UiButton>
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

const DUMMY_SEAT_MAP_CREATE = {
  name: '기본 좌석맵',
  status: 'DRAFT'
}

function getDefaultForm() {
  return {
    name: DUMMY_SEAT_MAP_CREATE.name,
    status: DUMMY_SEAT_MAP_CREATE.status,
    sections: []
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
        { key: 'name', label: '이름' },
        { key: 'size', label: '행/열' },
        { key: 'sections', label: '섹션' },
        { key: 'version', label: '버전' },
        { key: 'status', label: '상태' }
      ],
      api: null,
      venue: null,
      rows: [],
      recentSeatMapIds: [],
      createModalOpen: false,
      form: getDefaultForm(),
      loading: false
    }
  },
  computed: {
    venueId() {
      return this.$route.params.venueId
    }
  },
  created() {
    this.api = useApi()
    this.loadData()
  },
  watch: {
    venueId() {
      this.loadData()
    }
  },
  methods: {
    normalizeSeatMapId(id) {
      if (id === null || id === undefined) return null
      const trimmed = String(id).trim()
      return trimmed === '' ? null : trimmed
    },
    addRecentSeatMapId(id) {
      const normalized = this.normalizeSeatMapId(id)
      if (!normalized) return
      if (!this.recentSeatMapIds.includes(normalized)) {
        this.recentSeatMapIds.push(normalized)
      }
    },
    extractSeatMapIdFromCreateResponse(res) {
      const candidates = [
        res?.id,
        res?.seatMapId,
        res?.data?.id,
        res?.data?.seatMapId,
        res?.seatMap?.id
      ]
      for (const candidate of candidates) {
        const normalized = this.normalizeSeatMapId(candidate)
        if (normalized) return normalized
      }
      return null
    },
    extractSeatMapIds(venueDetail) {
      const fromSeatMapIds = Array.isArray(venueDetail?.seatMapIds)
        ? venueDetail.seatMapIds.map((item) => (typeof item === 'object' ? (item?.id ?? item?.seatMapId) : item))
        : []
      const fromSeatMaps = Array.isArray(venueDetail?.seatMaps)
        ? venueDetail.seatMaps.map((item) => item?.id ?? item?.seatMapId)
        : []
      const merged = [...fromSeatMapIds, ...fromSeatMaps]
        .map((id) => this.normalizeSeatMapId(id))
        .filter(Boolean)
      return Array.from(new Set(merged))
    },
    async loadSeatMapsByIds(ids) {
      if (!Array.isArray(ids) || ids.length === 0) {
        this.rows = []
        return
      }
      const settled = await Promise.allSettled(
        ids.map((seatMapId) => this.api.get(ENDPOINTS.adminSeatMapDetail(seatMapId)))
      )
      const details = settled
        .filter((result) => result.status === 'fulfilled' && result.value)
        .map((result) => result.value)
      this.rows = details.map(this.toSeatMapRow)
    },
    toSeatMapRow(item) {
      const sections = Array.isArray(item?.sections) ? item.sections : []
      return {
        id: item?.id,
        name: item?.name || '',
        venue_id: item?.venue_id ?? item?.venueId,
        row_count: item?.row_count ?? item?.rowCount,
        col_count: item?.col_count ?? item?.colCount,
        sectionsCount: item?.sectionCount ?? sections.length ?? 0,
        version: item?.version ?? null,
        status: item?.status ?? item?.seatMapStatus ?? 'DRAFT'
      }
    },
    async loadVenue() {
      if (this.venueId == null || this.venueId === '') return
      try {
        this.venue = await this.api.get(ENDPOINTS.adminVenueDetail(this.venueId))
      } catch (err) {
        this.venue = null
        console.warn('Failed to load venue detail', err)
      }
    },
    async loadSeatMaps() {
      if (this.venueId == null || this.venueId === '') return
      try {
        // GET /venues/{venueId}/seat-maps (Pageable)
        const res = await this.api.get(ENDPOINTS.venueSeatMapsList(this.venueId, { page: 0, size: 100 }))
        const list = Array.isArray(res?.content) ? res.content : (Array.isArray(res) ? res : res?.content || res?.items || [])
        let rows = list.map(this.toSeatMapRow)
        // Prepend any recently created (so they show before next full reload)
        const fallbackIds = this.recentSeatMapIds
          .map((id) => this.normalizeSeatMapId(id))
          .filter((id) => id && !rows.some((r) => String(r.id) === String(id)))
        if (fallbackIds.length > 0) {
          const settled = await Promise.allSettled(
            fallbackIds.map((id) => this.api.get(ENDPOINTS.adminSeatMapDetail(id)))
          )
          const extra = settled
            .filter((r) => r.status === 'fulfilled' && r.value)
            .map((r) => this.toSeatMapRow(r.value))
          rows = [...extra, ...rows]
        }
        this.rows = rows
      } catch (err) {
        this.rows = []
        console.warn('Failed to load seat maps', err)
      }
    },
    async loadData() {
      this.loading = true
      try {
        await this.loadVenue()
        await this.loadSeatMaps()
      } finally {
        this.loading = false
      }
    },
    openCreateModal() {
      this.form = getDefaultForm()
      this.createModalOpen = true
    },
    addSectionDraft() {
      this.form.sections.push({
        _key: `section-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: '',
        displayColor: '#FF5733',
        rows: 5,
        seatsPerRow: 10,
        initialGrade: 'VIP'
      })
    },
    removeSectionDraft(key) {
      this.form.sections = this.form.sections.filter((s) => s._key !== key)
    },
    closeCreateModal() {
      this.createModalOpen = false
    },
    async submitCreate() {
      const basePayload = {
        venueId: Number(this.venueId),
        name: this.form.name || `${this.venue?.name || '좌석맵'}-${Date.now()}`
      }
      if (this.form.status) {
        basePayload.status = this.form.status
      }
      const cleanedSections = this.form.sections
        .map((s) => ({
          name: s.name?.trim(),
          displayColor: s.displayColor?.trim() || '#FF5733',
          totalRow: Number(s.rows),
          totalCol: Number(s.seatsPerRow),
          rows: Number(s.rows),
          seatsPerRow: Number(s.seatsPerRow),
          initialGrade: s.initialGrade
        }))
        .filter((s) => s.name && Number.isFinite(s.totalRow) && s.totalRow > 0 && Number.isFinite(s.totalCol) && s.totalCol > 0)

      try {
        let createdRes
        if (cleanedSections.length > 0) {
          createdRes = await this.api.post(ENDPOINTS.adminCreateSeatMapWithSections(), {
            ...basePayload,
            sections: cleanedSections
          })
        } else {
          createdRes = await this.api.post(ENDPOINTS.adminCreateSeatMap(), basePayload)
        }
        // Ensure immediate visibility even if venue detail seatMapIds lags.
        if (createdRes?.id) {
          const createdRow = this.toSeatMapRow(createdRes)
          this.rows = [createdRow, ...this.rows.filter((r) => String(r.id) !== String(createdRow.id))]
        }
        this.addRecentSeatMapId(this.extractSeatMapIdFromCreateResponse(createdRes))
        this.closeCreateModal()
        await this.loadData()
      } catch (err) {
        console.warn('Failed to create seat map', err)
      }
    }
  }
}
</script>
