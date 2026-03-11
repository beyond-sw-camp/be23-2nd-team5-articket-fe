<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">매출/환불 상세 조회</div>
          <div class="mt-1 text-sm text-slate-500">공연, 회차, 상태, 검색어로 정산 관련 주문을 조회합니다.</div>
        </div>
        <UiButton variant="ghost" class="h-10 px-4" @click="$router.push('/organizer/reports')">리포트로 돌아가기</UiButton>
      </div>

      <div class="mt-4 grid gap-3 lg:grid-cols-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">공연 선택</label>
          <select v-model="selectedConcertId" class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" @change="onConcertChange">
            <option v-for="item in concertOptions" :key="item.concertId ?? 'all'" :value="item.concertId">
              {{ item.concertTitle }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">회차 선택</label>
          <select v-model="selectedScheduleId" class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" @change="onScheduleChange">
            <option v-for="item in scheduleOptions" :key="item.scheduleId ?? 'all-schedules'" :value="item.scheduleId">
              {{ item.scheduleLabel }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">상태</label>
          <select v-model="selectedStatus" class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm">
            <option v-for="item in statusOptions" :key="item.value || 'all-status'" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">검색어</label>
          <input
            v-model.trim="keyword"
            type="text"
            class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
            placeholder="공연명 또는 주문 ID"
            @keyup.enter="submitSearch"
          />
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <UiButton class="h-11 px-5" @click="submitSearch">검색</UiButton>
        <UiButton variant="ghost" class="h-11 px-5" @click="resetFilters">초기화</UiButton>
      </div>
    </UiCard>

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중...</div>
    </UiCard>

    <UiCard v-else-if="errorMessage">
      <div class="text-sm text-red-600">{{ errorMessage }}</div>
    </UiCard>

    <UiCard v-else>
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">조회 결과</div>
          <div class="mt-1 text-sm text-slate-500">총 {{ totalElements.toLocaleString() }}건</div>
        </div>

        <div class="flex items-center gap-2">
          <!-- 현재 선택된 회차 기준으로 좌석 인사이트 진입 -->
          <UiButton
            variant="ghost"
            class="h-10 px-4"
            :disabled="!selectedScheduleId"
            @click="openSeatMapByFilter"
          >
            이 회차 좌석맵 보기
          </UiButton>

          <UiButton
            variant="ghost"
            class="h-10 px-4"
            :disabled="!currentConcertOrderListId"
            @click="openOrderList"
          >
            주문목록 바로가기
          </UiButton>
        </div>
      </div>

      <UiTable class="mt-4" :columns="columns" :rows="items">
        <template #cell:id="{ row }">
          <button class="font-semibold text-red-600 hover:underline" type="button" @click="openDetail(row.id)">
            {{ row.id }}
          </button>
        </template>

        <template #cell:concertName="{ row }">
          <span class="font-medium text-slate-900">{{ row.concertName }}</span>
        </template>

        <template #cell:scheduleDate="{ row }">
          {{ formatDateTime(row.scheduleDate) }}
        </template>

        <template #cell:amount="{ row }">
          {{ formatWon(row.amount) }}
        </template>

        <template #cell:status="{ row }">
          <UiBadge :tone="statusTone(row.status)" :color="statusColor(row.status)">{{ row.status }}</UiBadge>
        </template>

        <template #cell:createdAt="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>

        <template #cell:seatMap="{ row }">
          <!-- 주문 단위로 좌석 인사이트 이동 + 주문 좌석 강조 -->
          <UiButton variant="ghost" class="h-8 px-3 text-xs" @click="openSeatMapByRow(row)">
            좌석맵 보기
          </UiButton>
        </template>

        <template #cell:detail="{ row }">
          <UiButton variant="ghost" class="h-8 px-3 text-xs" @click="openDetail(row.id)">상세</UiButton>
        </template>
      </UiTable>

      <div v-if="!items.length" class="mt-6 text-center text-sm text-slate-400">조회 결과가 없습니다.</div>

      <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-2">
        <UiButton variant="ghost" class="h-9 px-3" :disabled="page <= 0" @click="goPage(page - 1)">이전</UiButton>
        <span class="text-sm text-slate-600">{{ page + 1 }} / {{ totalPages }}</span>
        <UiButton variant="ghost" class="h-9 px-3" :disabled="page >= totalPages - 1" @click="goPage(page + 1)">다음</UiButton>
      </div>
    </UiCard>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiTable from '../../components/common/UiTable.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'OrganizerReportDetailsView',
  components: { UiCard, UiTable, UiBadge, UiButton },
  data() {
    return {
      api: null,
      loading: false,
      errorMessage: '',
      options: [],
      selectedConcertId: null,
      selectedScheduleId: null,
      selectedStatus: null,
      keyword: '',
      items: [],
      page: 0,
      totalPages: 1,
      totalElements: 0,
      columns: [
        { key: 'id', label: '주문 ID' },
        { key: 'concertName', label: '공연명' },
        { key: 'scheduleDate', label: '회차' },
        { key: 'amount', label: '금액' },
        { key: 'status', label: '상태' },
        { key: 'createdAt', label: '주문 시각' },
        { key: 'seatMap', label: '' },
        { key: 'detail', label: '' }
      ],
      statusOptions: [
        { value: null, label: '전체 상태' },
        { value: 'PAID', label: '매출' },
        { value: 'REFUNDED', label: '환불' },
        { value: 'CANCELED', label: '취소' }
      ]
    }
  },
  computed: {
    concertOptions() {
      const map = new Map()
      map.set('all', { concertId: null, concertTitle: '전체 공연 집계' })
      for (const item of this.options) {
        if (!map.has(item.concertId)) {
          map.set(item.concertId, { concertId: item.concertId, concertTitle: item.concertTitle })
        }
      }
      return Array.from(map.values())
    },
    scheduleOptions() {
      if (this.selectedConcertId == null) {
        return [{ scheduleId: null, scheduleLabel: '전체 회차 집계' }]
      }
      return [
        { scheduleId: null, scheduleLabel: '전체 회차 집계' },
        ...this.options
          .filter(item => item.concertId === this.selectedConcertId)
          .map(item => ({ scheduleId: item.scheduleId, scheduleLabel: this.formatScheduleLabel(item.scheduleLabel) }))
      ]
    },
    currentConcertOrderListId() {
      if (this.selectedConcertId != null) return this.selectedConcertId
      return this.items.find(item => item.concertId != null)?.concertId ?? null
    }
  },
  created() {
    this.api = useApi()
  },
  async mounted() {
    await this.fetchOptions()
    this.applyQuery()
    await this.load()
  },
  methods: {
    async fetchOptions() {
      this.options = await this.api.get(ENDPOINTS.organizerSeatInsightOptions())
    },
    applyQuery() {
      const query = this.$route.query || {}
      this.selectedConcertId = query.concertId ? Number(query.concertId) : null
      this.selectedScheduleId = query.scheduleId ? Number(query.scheduleId) : null
      this.selectedStatus = query.status || null
      this.keyword = query.keyword || ''
      this.page = query.page ? Number(query.page) : 0
    },
    buildQuery(page = this.page) {
      const query = {}
      if (this.selectedConcertId != null) query.concertId = String(this.selectedConcertId)
      if (this.selectedScheduleId != null) query.scheduleId = String(this.selectedScheduleId)
      if (this.selectedStatus) query.status = this.selectedStatus
      if (this.keyword) query.keyword = this.keyword
      if (page > 0) query.page = String(page)
      return query
    },
    async onConcertChange() {
      this.selectedScheduleId = null
      this.page = 0
      await this.load()
    },
    async onScheduleChange() {
      this.page = 0
      await this.load()
    },
    async submitSearch() {
      this.page = 0
      await this.load()
    },
    async resetFilters() {
      this.selectedConcertId = null
      this.selectedScheduleId = null
      this.selectedStatus = null
      this.keyword = ''
      this.page = 0
      await this.load()
    },
    async goPage(page) {
      if (page < 0 || page >= this.totalPages) return
      this.page = page
      await this.load()
    },
    async load() {
      this.loading = true
      this.errorMessage = ''
      try {
        await this.$router.replace({ query: this.buildQuery() })
        const res = await this.api.get(ENDPOINTS.organizerReportDetails({
          concertId: this.selectedConcertId,
          scheduleId: this.selectedScheduleId,
          status: this.selectedStatus,
          keyword: this.keyword,
          page: this.page,
          size: 20
        }))
        this.items = res?.content ?? []
        this.totalPages = Math.max(1, res?.totalPages ?? 1)
        this.totalElements = Number(res?.totalElements ?? this.items.length)
      } catch (err) {
        this.items = []
        this.totalPages = 1
        this.totalElements = 0
        this.errorMessage = err.message || '상세 데이터를 불러오지 못했습니다.'
      } finally {
        this.loading = false
      }
    },
    openDetail(orderId) {
      this.$router.push(`/organizer/orders/${orderId}`)
    },
    openOrderList() {
      if (!this.currentConcertOrderListId) return
      this.$router.push(`/organizer/concerts/${this.currentConcertOrderListId}/orders`)
    },
    openSeatMapByFilter() {
      // 회차 선택이 되어 있어야 회차 좌석맵으로 이동 가능
      if (!this.selectedScheduleId) return

      this.$router.push({
        path: '/organizer/seat-insights',
        query: {
          ...(this.selectedConcertId != null ? { concertId: String(this.selectedConcertId) } : {}),
          scheduleId: String(this.selectedScheduleId)
        }
      })
    },

    openSeatMapByRow(row) {
      // 주문 정보 기준으로 좌석맵 이동 + 주문 좌석 강조
      if (!row?.concertId || !row?.scheduleId || !row?.id) return

      this.$router.push({
        path: '/organizer/seat-insights',
        query: {
          concertId: String(row.concertId),
          scheduleId: String(row.scheduleId),
          orderId: String(row.id)
        }
      })
    },
    
    formatWon(value) {
      return `${Number(value || 0).toLocaleString()}원`
    },
    formatDateTime(value) {
      if (!value) return '-'
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return value
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      const hh = String(date.getHours()).padStart(2, '0')
      const mi = String(date.getMinutes()).padStart(2, '0')
      return `${yyyy}.${mm}.${dd} ${hh}:${mi}`
    },
    formatScheduleLabel(value) {
      return this.formatDateTime(value)
    },
    statusTone(status) {
      return status === 'PAID' ? 'solid' : 'soft'
    },
    statusColor(status) {
      if (status === 'PAID') return 'green'
      if (status === 'REFUNDED' || status === 'CANCELED') return 'red'
      return 'slate'
    }
  }
}
</script>
