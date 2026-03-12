<template>
  <div class="space-y-6 pb-24">
    <!-- Page Title -->
    <div>
      <h1 class="text-xl font-bold text-slate-900">회차 등록</h1>
      <p class="mt-1 text-sm text-slate-500">가격 정책 설정 후 공연 회차를 등록해 주세요.</p>
    </div>

    <div v-if="fromCreate" class="rounded-2xl border border-slate-100 bg-white px-6 pb-12 pt-6 shadow-sm">
      <StepIndicator :steps="['기본 정보', '가격 정책', '회차 등록']" :active="2" />
    </div>

    <!-- Header -->
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">회차 목록</div>
          <div class="mt-1 text-sm text-slate-500">공연 회차별 시작 시간, 예매 기간, 상태를 관리합니다.</div>
        </div>
        <UiBadge tone="soft">ORGANIZER</UiBadge>
      </div>
      <div class="mt-4 flex justify-end">
        <UiButton class="h-11 px-5" @click="openCreateModal">+ 회차 생성</UiButton>
      </div>
    </UiCard>

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중...</div>
    </UiCard>

    <UiCard v-else-if="!items.length">
      <div class="text-sm text-slate-500">등록된 회차가 없습니다. 회차를 생성해 주세요.</div>
    </UiCard>

    <template v-else>
      <UiTable :columns="columns" :rows="items">
        <template #cell:play_time="{ row }">
          <div class="text-sm font-medium text-slate-900">
            {{ formatDateTime(row.play_time) }}
          </div>
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
            <div class="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-red-500 transition-all"
                :style="{ width: Math.min(row.occupancy, 100) + '%' }"
              />
            </div>
            <span class="text-xs font-semibold text-slate-600">{{ row.occupancy }}%</span>
          </div>
        </template>

        <template #cell:performers="{ row }">
          <UiButton
            variant="ghost"
            class="h-8 px-2 text-xs font-semibold text-slate-600"
            @click="$router.push(`/organizer/schedules/${row.id}/performers`)"
          >
            출연진 관리
          </UiButton>
        </template>
      </UiTable>
    </template>

    <!-- Navigation Footer -->
    <div v-if="fromCreate" class="fixed bottom-6 left-64 right-0 z-50 flex justify-center px-6 pointer-events-none">
      <div class="pointer-events-auto flex w-full max-w-4xl items-center justify-between rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-2xl backdrop-blur-md">
        <UiButton
          variant="ghost"
          class="h-11 px-6 text-sm text-slate-600"
          @click="$router.push(`/organizer/concerts/${$route.params.concertId}/policies?from=create`)"
        >
          ← 이전 (가격 정책)
        </UiButton>
        <div class="flex items-center gap-4">
          <p v-if="!items.length" class="hidden text-xs font-medium text-amber-600 sm:block">
            최소 1개 이상의 회차를 등록해야 합니다.
          </p>
          <UiButton
            variant="solid"
            color="red"
            class="h-11 px-10 font-bold shadow-sm"
            :disabled="!items.length"
            @click="$router.push('/organizer/concerts')"
          >
            공연 등록 완료
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <UiModal :open="createModalOpen" title="회차 생성" @close="closeCreateModal">
      <form id="schedule-create-form" class="grid gap-4" @submit.prevent="submitCreate">
        <div v-if="formError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ formError }}
        </div>

        <!-- 단일 / 여러 날짜 선택 -->
        <div class="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            :class="[
              'flex-1 rounded-lg py-1.5 text-xs font-semibold transition',
              !bulkMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
            ]"
            @click="switchMode(false)"
          >
            단일 날짜
          </button>
          <button
            type="button"
            :class="[
              'flex-1 rounded-lg py-1.5 text-xs font-semibold transition',
              bulkMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
            ]"
            @click="switchMode(true)"
          >
            여러 날짜 (일괄 등록)
          </button>
        </div>

        <!-- 단일 날짜 모드 -->
        <div v-if="!bulkMode">
          <label class="block text-xs font-semibold text-slate-500">공연 시작 시간 *</label>

          <div class="mt-1 flex gap-2">
            <input
              v-model="scheduleDrafts.playTime"
              type="datetime-local"
              class="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              @dblclick="confirmScheduleDate('playTime')"
            />
            <UiButton
              type="button"
              variant="ghost"
              class="shrink-0 px-4"
              @click="confirmScheduleDate('playTime')"
            >
              확인
            </UiButton>
          </div>

          <p class="mt-1 text-xs text-slate-500">더블 클릭 또는 확인 버튼으로 공연 시작 시간을 확정합니다.</p>
          <p v-if="form.play_time" class="mt-1 text-xs text-emerald-600">
            확정됨: {{ formatDateTime(form.play_time) }}
          </p>
        </div>

        <!-- 여러 날짜 모드 -->
        <div v-else>
          <div class="flex items-center justify-between">
            <label class="block text-xs font-semibold text-slate-500">공연 날짜 목록 *</label>
            <button type="button" class="text-xs text-red-500 hover:underline" @click="addPlayTime">+ 날짜 추가</button>
          </div>

          <div
            v-for="(pt, idx) in bulkDrafts.play_times"
            :key="idx"
            class="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <div class="flex items-center gap-2">
              <input
                v-model="bulkDrafts.play_times[idx]"
                type="datetime-local"
                class="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                @dblclick="confirmBulkPlayTime(idx)"
              />
              <UiButton
                type="button"
                variant="ghost"
                class="shrink-0 px-4"
                @click="confirmBulkPlayTime(idx)"
              >
                확인
              </UiButton>
              <button
                v-if="bulkDrafts.play_times.length > 1"
                type="button"
                class="shrink-0 text-slate-400 transition-colors hover:text-red-500"
                @click="removePlayTime(idx)"
              >
                삭제
              </button>
            </div>

            <p v-if="bulkForm.play_times[idx]" class="mt-2 text-xs text-emerald-600">
              확정됨: {{ formatDateTime(bulkForm.play_times[idx]) }}
            </p>
          </div>
        </div>

        <!-- 공통: 예매 기간 -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500">예매 오픈 시각 *</label>

            <div class="mt-1 flex gap-2">
              <input
                v-model="scheduleDrafts.bookingStart"
                type="datetime-local"
                class="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                @dblclick="confirmScheduleDate('bookingStart')"
              />
              <UiButton
                type="button"
                variant="ghost"
                class="shrink-0 px-4"
                @click="confirmScheduleDate('bookingStart')"
              >
                확인
              </UiButton>
            </div>

            <p class="mt-1 text-xs text-slate-500">확인 버튼으로 예매 오픈 시각을 확정합니다.</p>
            <p v-if="form.booking_start" class="mt-1 text-xs text-emerald-600">
              확정됨: {{ formatDateTime(form.booking_start) }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500">예매 마감 시각 *</label>

            <div class="mt-1 flex gap-2">
              <input
                v-model="scheduleDrafts.bookingEnd"
                type="datetime-local"
                class="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                @dblclick="confirmScheduleDate('bookingEnd')"
              />
              <UiButton
                type="button"
                variant="ghost"
                class="shrink-0 px-4"
                @click="confirmScheduleDate('bookingEnd')"
              >
                확인
              </UiButton>
            </div>

            <p class="mt-1 text-xs text-slate-500">확인 버튼으로 예매 마감 시각을 확정합니다.</p>
            <p v-if="form.booking_end" class="mt-1 text-xs text-emerald-600">
              확정됨: {{ formatDateTime(form.booking_end) }}
            </p>
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
          <UiButton as="button" type="submit" form="schedule-create-form" :disabled="creating">생성</UiButton>
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
import StepIndicator from '../../components/common/StepIndicator.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

function fmt(date) {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

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

function getDefaultBulkForm() {
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  return {
    play_times: [fmt(nextWeek)]
  }
}

export default {
  name: 'OrganizerConcertSchedulesView',
  components: {
    UiCard,
    UiTable,
    UiBadge,
    UiButton,
    UiModal,
    StepIndicator
  },
  computed: {
    fromCreate() {
      return this.$route.query?.from === 'create'
    },
  },
  data() {
    return {
      loading: false,
      items: [],
      api: null,
      createModalOpen: false,
      bulkMode: false,
      form: getDefaultForm(),
      creating: false,
      bulkForm: getDefaultBulkForm(),
      formError: '',
      columns: [
        { key: 'play_time', label: '일시' },
        { key: 'status', label: '상태' },
        { key: 'occupancy', label: '예매율' },
        { key: 'performers', label: '관리' }
      ],

      /**
       * 날짜/시간은 바로 실제 폼 값에 반영하지 않고
       * draft 값으로 먼저 받고, 확인 버튼을 눌렀을 때 확정
       * 별도 watch 없이 사용자 액션 시점에만 값 반영.
       */
      scheduleDrafts: {
        playTime: '',
        bookingStart: '',
        bookingEnd: ''
      },

      /**
       * 일괄 회차도 동일하게 draft 배열에 둠
       */
      bulkDrafts: {
        play_times: []
      },
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
      if (!concertId) {
        this.loading = false
        return
      }

      this.loading = true
      try {
        const res = await this.api.get(`${ENDPOINTS.concertSchedules(concertId)}?page=0&size=50&sort=playTime,asc`)
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

    syncDraftsFromForm() {
      this.scheduleDrafts = {
        playTime: this.form.play_time ?? '',
        bookingStart: this.form.booking_start ?? '',
        bookingEnd: this.form.booking_end ?? ''
      }
    },

    syncBulkDraftsFromForm() {
      this.bulkDrafts = {
        play_times: [...(this.bulkForm.play_times ?? [])]
      }
    },

    openCreateModal() {
      this.form = getDefaultForm()
      this.bulkForm = getDefaultBulkForm()
      this.bulkMode = false
      this.formError = ''
      this.syncDraftsFromForm()
      this.syncBulkDraftsFromForm()
      this.createModalOpen = true
    },

    closeCreateModal() {
      this.createModalOpen = false
      this.formError = ''
    },

    switchMode(isBulk) {
      this.bulkMode = isBulk
      this.formError = ''
    },

    addPlayTime() {
      const last = this.bulkDrafts.play_times.at(-1)
      const next = last
        ? fmt(new Date(new Date(last).getTime() + 24 * 60 * 60 * 1000))
        : fmt(new Date())

      this.bulkDrafts.play_times.push(next)
      this.bulkForm.play_times.push('')
    },

    removePlayTime(idx) {
      this.bulkDrafts.play_times.splice(idx, 1)
      this.bulkForm.play_times.splice(idx, 1)
    },

    /**
     * draft로 선택한 날짜를 실제 form 값으로 확정
     * 확인 버튼이 같은 메서드를 사용
     */
    confirmScheduleDate(field) {
      const fieldMap = {
        playTime: 'play_time',
        bookingStart: 'booking_start',
        bookingEnd: 'booking_end'
      }

      const draftValue = this.scheduleDrafts[field]
      const targetField = fieldMap[field]

      if (!draftValue || !targetField) return
      this.form[targetField] = draftValue
    },

    confirmBulkPlayTime(idx) {
      const draftValue = this.bulkDrafts.play_times[idx]
      if (!draftValue) return
      this.bulkForm.play_times[idx] = draftValue
    },

    /**
      * 공연 시작 시간, 예매 기간 등 날짜/시간 관련 입력값 검증
         공연 시작 시간 < 예매 마감 시각 < 예매 오픈 시각
         일괄 등록 시 모든 공연 시작 시간이 예매 마감 시각보다 늦어야 함
      * 잘못된 요청을 서버로 보내지 않아 API/DB 부하를 줄임
     */
    validateScheduleInput() {
      this.formError = ''

      const bookingStart = this.form.booking_start
      const bookingEnd = this.form.booking_end

      if (!bookingStart || !bookingEnd) {
        this.formError = '예매 오픈 시각과 예매 마감 시각을 모두 확정해 주세요.'
        return false
      }

      const bookingStartTime = new Date(bookingStart).getTime()
      const bookingEndTime = new Date(bookingEnd).getTime()

      if (bookingStartTime >= bookingEndTime) {
        this.formError = '예매 오픈 시각은 예매 마감 시각보다 빨라야 합니다.'
        return false
      }

      if (this.bulkMode) {
        if (!this.bulkForm.play_times.length || this.bulkForm.play_times.some((v) => !v)) {
          this.formError = '모든 공연 날짜를 확인 버튼으로 확정해 주세요.'
          return false
        }

        const invalidPlayTime = this.bulkForm.play_times.find((playTime) => {
          return bookingEndTime >= new Date(playTime).getTime()
        })

        if (invalidPlayTime) {
          this.formError = '예매 마감 시각은 모든 공연 시작 시간보다 빨라야 합니다.'
          return false
        }

        return true
      }

      if (!this.form.play_time) {
        this.formError = '공연 시작 시간을 확인 버튼으로 확정해 주세요.'
        return false
      }

      const playTime = new Date(this.form.play_time).getTime()
      if (bookingEndTime >= playTime) {
        this.formError = '예매 마감 시각은 공연 시작 시간보다 빨라야 합니다.'
        return false
      }

      return true
    },

    async submitCreate() {
      const concertId = this.$route.params.concertId
      if (!concertId) return
      if (!this.validateScheduleInput()) return

      this.creating = true
      try {
        if (this.bulkMode) {
          await this.api.post(
            ENDPOINTS.organizerBulkCreateSchedules(concertId),
            {
              playTimes: this.bulkForm.play_times,
              bookingStart: this.form.booking_start,
              bookingEnd: this.form.booking_end,
              status: this.form.status
            }
          )
        } else {
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
        await this.load()
      } catch (err) {
        // 전역 에러 모달 사용
      } finally {
        this.creating = false
      }
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
  },
}
</script>
