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

    <!-- 통합검색 -->
    <div class="flex gap-2 rounded-2xl border border-slate-200 bg-white p-4">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="좌석맵명, 버전으로 검색"
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
      <template #cell:id="{ row }">
        <span class="font-semibold text-slate-900">{{ row.id }}</span>
      </template>
      <template #cell:name="{ row }">
        <span class="text-sm text-slate-700">{{ row.name || '-' }}</span>
      </template>
      <template #cell:size="{ row }">
        <span class="text-sm text-slate-700">{{ row.size }}</span>
      </template>
      <template #cell:version="{ row }">
        <span class="text-sm text-slate-600">{{ row.version ?? '-' }}</span>
      </template>
      <template #cell:status="{ row }">
        <UiBadge :tone="row.status==='PUBLISHED'?'solid':'soft'" :color="row.status==='PUBLISHED'?'red':'slate'">
          {{ row.status || 'DRAFT' }}
        </UiBadge>
      </template>
      <template #cell:actions="{ row }">
        <UiButton variant="ghost" class="h-8 px-3 text-sm" @click="$router.push({ path: `/admin/seat-maps/${row.id}`, query: { venueId: venueId } })">
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

    <UiModal :open="createModalOpen" title="좌석맵 생성" @close="closeCreateModal">
      <form id="seatmap-create-form" class="grid gap-4" @submit.prevent="submitCreate">
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
        { key: 'name', label: '이름' },
        { key: 'size', label: '좌석/섹션' },
        { key: 'version', label: '버전' },
        { key: 'status', label: '상태' },
        { key: 'actions', label: '작업' }
      ],
      api: null,
      venue: null,
      rows: [],
      recentSeatMapIds: [],
      createModalOpen: false,
      form: getDefaultForm(),
      loading: false,
      searchKeyword: '',
      page: 0,
      totalPages: 1,
      pageSize: 10
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
    },
    page() {
      this.loadSeatMaps()
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
      const totalSeats = item?.totalSeats ?? null
      const rowCount = item?.row_count ?? item?.rowCount
      const colCount = item?.col_count ?? item?.colCount
      let size = '-'
      if (totalSeats != null) size = `${totalSeats}석`
      else if (rowCount != null && colCount != null) size = `${rowCount}행 × ${colCount}열`
      return {
        id: item?.id,
        name: item?.name || '',
        venue_id: item?.venue_id ?? item?.venueId,
        row_count: rowCount,
        col_count: colCount,
        totalSeats,
        size,
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
      this.loading = true
      try {
        const kw = this.searchKeyword?.trim()
        // 백엔드 검색 미지원 시: 검색어 있으면 많이 불러와서 클라이언트 필터링
        const isSearching = !!kw
        const params = {
          page: isSearching ? 0 : this.page,
          size: isSearching ? 200 : this.pageSize
        }
        const res = await this.api.get(ENDPOINTS.adminVenueSeatMapsList(this.venueId, params))
        let list = Array.isArray(res?.content) ? res.content : (Array.isArray(res) ? res : res?.content || res?.items || [])
        let rows = list.map(this.toSeatMapRow)
        if (isSearching) {
          const lower = kw.toLowerCase()
          rows = rows.filter((r) => {
            const name = (r.name || '').toLowerCase()
            const version = String(r.version || '').toLowerCase()
            return name.includes(lower) || version.includes(lower)
          })
          this.rows = rows
          this.totalPages = 1
        } else {
          this.rows = rows
          this.totalPages = Math.max(1, res?.totalPages ?? 1)
        }
      } catch (err) {
        this.rows = []
        this.totalPages = 1
        console.warn('Failed to load seat maps', err)
      } finally {
        this.loading = false
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
    doSearch() {
      this.page = 0
      this.loadSeatMaps()
    },
    resetSearch() {
      this.searchKeyword = ''
      this.page = 0
      this.loadSeatMaps()
    },
    goPage(p) {
      if (p < 0 || p >= this.totalPages) return
      this.page = p
    },
    openCreateModal() {
      this.form = getDefaultForm()
      this.createModalOpen = true
    },
    closeCreateModal() {
      this.createModalOpen = false
    },
    async submitCreate() {
      const payload = {
        venueId: Number(this.venueId),
        name: this.form.name || `${this.venue?.name || '좌석맵'}-${Date.now()}`
      }
      if (this.form.status) {
        payload.status = this.form.status
      }

      try {
        const createdRes = await this.api.post(ENDPOINTS.adminCreateSeatMap(), payload)
        this.closeCreateModal()
        // 생성된 좌석맵의 레이아웃 에디터로 바로 이동
        const newId = createdRes?.id ?? this.extractSeatMapIdFromCreateResponse(createdRes)
        if (newId) {
          this.$router.push(`/admin/seat-maps/${newId}/layout`)
        } else {
          await this.loadData()
        }
      } catch (err) {
        console.warn('Failed to create seat map', err)
      }
    }
  }
}
</script>
