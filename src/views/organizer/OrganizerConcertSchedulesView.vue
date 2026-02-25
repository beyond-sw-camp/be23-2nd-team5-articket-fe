<template>
  <div class="grid gap-4">
    <!-- Header -->
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">회차 목록</div>
          <div class="mt-1 text-sm text-slate-500">play_time · booking_start/end · status</div>
        </div>
        <UiBadge tone="soft">ORGANIZER</UiBadge>
      </div>
      <div class="mt-4 flex justify-end">
        <UiButton class="h-11 px-5" @click="openCreateModal">+ 회차 생성</UiButton>
      </div>
    </UiCard>

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <UiCard v-else-if="!items.length">
      <div class="text-sm text-slate-500">등록된 회차가 없습니다.</div>
    </UiCard>

    <template v-else>
      <UiTable :columns="columns" :rows="items">
        <template #cell:play_time="{ row }">
          {{ new Date(row.play_time).toLocaleString() }}
        </template>

        <template #cell:status="{ row }">
          <UiBadge
            :tone="row.status === 'OPEN' ? 'solid' : 'soft'"
            :color="row.status === 'OPEN' ? 'red' : 'slate'"
          >
            {{ row.status }}
          </UiBadge>
        </template>

        <template #cell:occupancy="{ row }">
          <div class="flex items-center gap-2">
            <div class="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
              <div
                class="h-full rounded-full bg-red-500"
                :style="{ width: Math.min(row.occupancy, 100) + '%' }"
              />
            </div>
            <span class="text-xs text-slate-600">{{ row.occupancy }}%</span>
          </div>
        </template>

        <template #cell:actions="{ row }">
          <div class="flex gap-1">
            <UiButton
              variant="ghost"
              class="h-8 px-2 text-sm"
              @click="openStats(row)"
            >통계</UiButton>
            <UiButton
              variant="ghost"
              class="h-8 px-2 text-sm"
              @click="$router.push(`/organizer/schedules/${row.id}/performers`)"
            >출연진</UiButton>
            <UiButton
              variant="ghost"
              class="h-8 px-2 text-sm text-red-600 hover:text-red-700"
              @click="confirmDelete(row)"
            >삭제</UiButton>
          </div>
        </template>
      </UiTable>
    </template>

    <!-- ── Create Modal ── -->
    <UiModal :open="createModalOpen" title="회차 생성" @close="closeCreateModal">
      <form id="schedule-create-form" class="grid gap-4" @submit.prevent="submitCreate">
        <div>
          <label class="block text-xs font-semibold text-slate-500">공연 시작 시간 *</label>
          <input
            v-model="form.play_time"
            type="datetime-local"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500">예매 오픈 *</label>
            <input
              v-model="form.booking_start"
              type="datetime-local"
              required
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500">예매 마감 *</label>
            <input
              v-model="form.booking_end"
              type="datetime-local"
              required
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500">상태 *</label>
          <select
            v-model="form.status"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="READY">READY</option>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
        <p v-if="createError" class="text-sm text-red-600">{{ createError }}</p>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeCreateModal">취소</UiButton>
          <UiButton as="button" type="submit" form="schedule-create-form" :disabled="creating">생성</UiButton>
        </div>
      </template>
    </UiModal>

    <!-- ── Stats Modal ── -->
    <UiModal :open="statsModalOpen" title="회차 통계" @close="closeStatsModal">
      <div v-if="statsLoading" class="text-sm text-slate-500">불러오는 중…</div>
      <div v-else-if="statsError" class="text-sm text-red-600">{{ statsError }}</div>
      <template v-else-if="stats">
        <div class="mb-3 text-xs text-slate-500">
          {{ statsTarget && new Date(statsTarget.play_time).toLocaleString() }}
        </div>
        <!-- Occupancy bar -->
        <div class="mb-4">
          <div class="mb-1 flex justify-between text-xs text-slate-500">
            <span>예매율</span>
            <span class="font-semibold text-slate-900">{{ stats.occupancyRate ?? 0 }}%</span>
          </div>
          <div class="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              class="h-full rounded-full bg-red-500 transition-all"
              :style="{ width: Math.min(stats.occupancyRate ?? 0, 100) + '%' }"
            />
          </div>
        </div>
        <!-- Stats grid -->
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
            <div class="text-xs font-semibold text-slate-500">전체</div>
            <div class="mt-1 text-lg font-bold text-slate-900">{{ stats.totalSeats ?? 0 }}</div>
          </div>
          <div class="rounded-xl border border-red-100 bg-red-50 p-3 text-center">
            <div class="text-xs font-semibold text-red-500">판매(SOLD)</div>
            <div class="mt-1 text-lg font-bold text-red-700">{{ stats.soldSeats ?? 0 }}</div>
          </div>
          <div class="rounded-xl border border-amber-100 bg-amber-50 p-3 text-center">
            <div class="text-xs font-semibold text-amber-600">선점(HELD)</div>
            <div class="mt-1 text-lg font-bold text-amber-700">{{ stats.reservedSeats ?? 0 }}</div>
          </div>
          <div class="rounded-xl border border-green-100 bg-green-50 p-3 text-center">
            <div class="text-xs font-semibold text-green-600">가용</div>
            <div class="mt-1 text-lg font-bold text-green-700">{{ stats.availableSeats ?? 0 }}</div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end">
          <UiButton variant="ghost" @click="closeStatsModal">닫기</UiButton>
        </div>
      </template>
    </UiModal>

    <!-- ── Delete Confirm Modal ── -->
    <UiModal :open="deleteModalOpen" title="회차 삭제" @close="closeDeleteModal">
      <div class="text-sm text-slate-700">이 회차를 삭제하시겠습니까?</div>
      <div v-if="deleteTarget" class="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        {{ new Date(deleteTarget.play_time).toLocaleString() }} · {{ deleteTarget.status }}
      </div>
      <!-- SOLD warning -->
      <div class="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <div class="text-xs font-semibold text-amber-700">주의</div>
        <div class="mt-0.5 text-xs text-amber-600">
          판매된 좌석(SOLD)이 하나라도 있으면 삭제가 불가능합니다.
        </div>
      </div>
      <p v-if="deleteError" class="mt-2 text-sm text-red-600">{{ deleteError }}</p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeDeleteModal">취소</UiButton>
          <UiButton
            class="bg-red-600 text-white hover:bg-red-700"
            :disabled="deleting"
            @click="submitDelete"
          >삭제</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiTable from '../../components/common/UiTable.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiModal from '../../components/common/UiModal.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

function getDefaultForm() {
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return {
    play_time: fmt(nextWeek),
    booking_start: fmt(now),
    booking_end: fmt(tomorrow),
    status: 'READY',
  }
}

function fmt(date) {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export default {
  name: 'OrganizerConcertSchedulesView',
  components: { UiCard, UiTable, UiBadge, UiButton, UiModal },
  data() {
    return {
      loading: false,
      items: [],
      api: null,
      // create
      createModalOpen: false,
      form: getDefaultForm(),
      creating: false,
      createError: '',
      // stats
      statsModalOpen: false,
      statsTarget: null,
      stats: null,
      statsLoading: false,
      statsError: '',
      // delete
      deleteModalOpen: false,
      deleteTarget: null,
      deleting: false,
      deleteError: '',
      columns: [
        { key: 'play_time', label: '일시' },
        { key: 'status', label: '상태' },
        { key: 'occupancy', label: '예매율' },
        { key: 'sold', label: 'SOLD' },
        { key: 'hold', label: 'HELD' },
        { key: 'total', label: '총 좌석' },
        { key: 'actions', label: '' },
      ],
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      const concertId = this.$route.params.concertId
      if (!concertId) { this.loading = false; return }
      this.loading = true
      try {
        const res = await this.api.get(
          `${ENDPOINTS.organizerConcertSchedules(concertId)}?page=0&size=50&sort=playTime,asc`
        )
        const raw = res.content ?? res.items ?? []
        this.items = raw.map((s) => ({
          ...s,
          play_time: s.playTime ?? s.play_time,
          occupancy: s.occupancyRate ?? s.occupancy ?? 0,
          sold: s.soldSeats ?? s.sold ?? 0,
          hold: s.reservedSeats ?? s.hold ?? 0,
          total: s.totalSeats ?? s.total ?? 0,
        }))
      } finally {
        this.loading = false
      }
    },

    // ── Create ──────────────────────────────────────────────
    openCreateModal() {
      this.form = getDefaultForm()
      this.createError = ''
      this.createModalOpen = true
    },
    closeCreateModal() { this.createModalOpen = false },
    async submitCreate() {
      const concertId = this.$route.params.concertId
      if (!concertId) return
      this.createError = ''
      this.creating = true
      try {
        const payload = {
          playTime: this.form.play_time,
          bookingStart: this.form.booking_start,
          bookingEnd: this.form.booking_end,
          status: this.form.status,
        }
        const formData = new FormData()
        formData.append('schedule', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
        await this.api.post(ENDPOINTS.organizerCreateSchedule(concertId), formData)
        this.closeCreateModal()
        await this.load()
      } catch (err) {
        this.createError = err.message || '회차 생성에 실패했습니다.'
      } finally {
        this.creating = false
      }
    },

    // ── Stats ────────────────────────────────────────────────
    async openStats(row) {
      this.statsTarget = row
      this.stats = null
      this.statsError = ''
      this.statsLoading = true
      this.statsModalOpen = true
      try {
        this.stats = await this.api.get(ENDPOINTS.organizerScheduleStats(row.id))
      } catch (err) {
        this.statsError = err.message || '통계를 불러오지 못했습니다.'
      } finally {
        this.statsLoading = false
      }
    },
    closeStatsModal() {
      this.statsModalOpen = false
      this.statsTarget = null
      this.stats = null
    },

    // ── Delete ───────────────────────────────────────────────
    confirmDelete(row) {
      this.deleteTarget = row
      this.deleteError = ''
      this.deleteModalOpen = true
    },
    closeDeleteModal() {
      this.deleteModalOpen = false
      this.deleteTarget = null
    },
    async submitDelete() {
      if (!this.deleteTarget) return
      this.deleteError = ''
      this.deleting = true
      try {
        await this.api.del(ENDPOINTS.organizerDeleteSchedule(this.deleteTarget.id))
        this.closeDeleteModal()
        await this.load()
      } catch (err) {
        this.deleteError = err.message || '삭제에 실패했습니다. 판매된 좌석이 있는지 확인해 주세요.'
      } finally {
        this.deleting = false
      }
    },
  },
}
</script>
