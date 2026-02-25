<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">회차 목록</div>
          <div class="mt-1 text-sm text-slate-500">ERD 기반: play_time, booking_start, booking_end, status</div>
        </div>
        <UiBadge tone="soft">ORGANIZER</UiBadge>
      </div>
      <div class="mt-4 flex justify-end">
        <UiButton class="h-11 px-5" @click="openCreateModal">회차 생성 (더미)</UiButton>
      </div>
    </UiCard>

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <UiTable v-else :columns="columns" :rows="items">
      <template #cell:play_time="{ row }">
        {{ new Date(row.play_time).toLocaleString() }}
      </template>
      <template #cell:status="{ row }">
        <UiBadge :tone="row.status === 'OPEN' ? 'solid' : 'soft'" :color="row.status === 'OPEN' ? 'red' : 'slate'">
          {{ row.status }}
        </UiBadge>
      </template>
      <template #cell:performers="{ row }">
        <UiButton
          variant="ghost"
          class="h-8 px-2 text-sm"
          @click="$router.push(`/organizer/schedules/${row.id}/performers`)"
        >
          출연진
        </UiButton>
      </template>
    </UiTable>

    <UiModal :open="createModalOpen" title="회차 생성" @close="closeCreateModal">
      <form id="schedule-create-form" class="grid gap-4" @submit.prevent="submitCreate">

        <!-- 단일/다중 토글 -->
        <div class="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            :class="['flex-1 rounded-lg py-1.5 text-xs font-semibold transition', !bulkMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400']"
            @click="bulkMode = false"
          >단일 날짜</button>
          <button
            type="button"
            :class="['flex-1 rounded-lg py-1.5 text-xs font-semibold transition', bulkMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400']"
            @click="bulkMode = true"
          >여러 날짜 (일괄 등록)</button>
        </div>

        <!-- 단일 모드 -->
        <div v-if="!bulkMode">
          <label class="block text-xs font-semibold text-slate-500">공연 시작 시간 *</label>
          <input
            v-model="form.play_time"
            type="datetime-local"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        <!-- 다중 날짜 모드 -->
        <div v-else>
          <div class="flex items-center justify-between">
            <label class="block text-xs font-semibold text-slate-500">공연 날짜 목록 *</label>
            <button type="button" class="text-xs text-red-500 hover:underline" @click="addPlayTime">+ 날짜 추가</button>
          </div>
          <div v-for="(pt, idx) in bulkForm.play_times" :key="idx" class="mt-2 flex items-center gap-2">
            <input
              v-model="bulkForm.play_times[idx]"
              type="datetime-local"
              required
              class="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <button
              v-if="bulkForm.play_times.length > 1"
              type="button"
              class="text-slate-400 hover:text-red-500"
              @click="removePlayTime(idx)"
            >✕</button>
          </div>
        </div>

        <!-- 공통: 예매 기간 + 상태 -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500">예매 오픈 시각 *</label>
            <input
              v-model="form.booking_start"
              type="datetime-local"
              required
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500">예매 마감 시각 *</label>
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
            <option value="DRAFT">DRAFT</option>
            <option value="READY">READY</option>
            <option value="OPEN">OPEN</option>
          </select>
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeCreateModal">취소</UiButton>
          <UiButton as="button" type="submit" form="schedule-create-form">
            {{ bulkMode ? `${bulkForm.play_times.length}개 회차 생성` : '회차 생성' }}
          </UiButton>
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

// ERD: concert_schedule 테이블
// 필수: play_time, booking_start, booking_end, status (READY/OPEN/CLOSED)
// 선택: concert_thum_img_url, concert_detail_img_url (concert_id는 자동)
function getDefaultForm() {
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return {
    play_time: formatDateTimeLocal(nextWeek),
    booking_start: formatDateTimeLocal(now),
    booking_end: formatDateTimeLocal(tomorrow),
    status: 'DRAFT'
  }
}

function getDefaultBulkForm() {
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  return {
    play_times: [formatDateTimeLocal(nextWeek)]
  }
}

function formatDateTimeLocal(date) {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export default {
  name: 'OrganizerConcertSchedulesView',
  components: {
    UiCard,
    UiTable,
    UiBadge,
    UiButton,
    UiModal
  },
  data() {
    return {
      loading: false,
      items: [],
      api: null,
      createModalOpen: false,
      bulkMode: false,
      form: getDefaultForm(),
      bulkForm: getDefaultBulkForm(),
      columns: [
        { key: 'play_time', label: '일시' },
        { key: 'status', label: '상태' },
        { key: 'occupancy', label: '판매율(%)' },
        { key: 'sold', label: 'SOLD' },
        { key: 'hold', label: 'HOLD' },
        { key: 'total', label: '총 좌석' },
        { key: 'performers', label: '출연진' }
      ]
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
      if (concertId == null || concertId === '') {
        this.loading = false
        return
      }
      this.loading = true
      try {
        const res = await this.api.get(`${ENDPOINTS.organizerConcertSchedules(concertId)}?page=0&size=50&sort=playTime,asc`)
        const raw = res.content ?? res.items ?? []
        this.items = raw.map((s) => ({
          ...s,
          play_time: s.playTime ?? s.play_time,
          occupancy: s.occupancy ?? 0,
          sold: s.sold ?? 0,
          hold: s.hold ?? 0,
          total: s.total ?? 0
        }))
      } finally {
        this.loading = false
      }
    },
    openCreateModal() {
      this.form = getDefaultForm()
      this.bulkForm = getDefaultBulkForm()
      this.bulkMode = false
      this.createModalOpen = true
    },
    closeCreateModal() {
      this.createModalOpen = false
    },
    addPlayTime() {
      const last = this.bulkForm.play_times.at(-1)
      // 마지막 날짜에서 하루 뒤를 기본값으로 추가
      const next = last
        ? formatDateTimeLocal(new Date(new Date(last).getTime() + 24 * 60 * 60 * 1000))
        : formatDateTimeLocal(new Date())
      this.bulkForm.play_times.push(next)
    },
    removePlayTime(idx) {
      this.bulkForm.play_times.splice(idx, 1)
    },
    async submitCreate() {
      const concertId = this.$route.params.concertId
      if (concertId == null || concertId === '') return
      try {
        if (this.bulkMode) {
          // 일괄 등록: JSON body로 전송
          await this.api.post(
            `${ENDPOINTS.organizerCreateSchedule(concertId)}/bulk`,
            {
              playTimes: this.bulkForm.play_times,
              bookingStart: this.form.booking_start,
              bookingEnd: this.form.booking_end,
              status: this.form.status
            }
          )
        } else {
          // 단건 등록: 기존 FormData 방식 유지
          const schedulePayload = {
            playTime: this.form.play_time,
            bookingStart: this.form.booking_start,
            bookingEnd: this.form.booking_end,
            status: this.form.status
          }
          const formData = new FormData()
          formData.append('schedule', new Blob([JSON.stringify(schedulePayload)], { type: 'application/json' }))
          await this.api.post(ENDPOINTS.organizerCreateSchedule(concertId), formData)
        }
        this.closeCreateModal()
        this.load()
      } catch (err) {
        console.error('Failed to create schedule', err)
      }
    }
  }
}
</script>
