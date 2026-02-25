<template>
  <div class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">공연 생성</div>
        <div class="mt-1 text-sm text-slate-500">ERD 기반: title, status, seat_map_id, age_limit</div>
      </div>
      <UiBadge tone="soft">ORGANIZER</UiBadge>
    </div>

    <UiCard>
      <form id="concert-create-form" class="grid gap-4" @submit.prevent="submitCreate">
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs font-semibold text-slate-600">ERD: concert 테이블</div>
          <div class="mt-1 text-xs text-slate-500">
            필수: title, status (DRAFT/PUBLISHED), seat_map_id<br />
            선택: age_limit (member_id는 자동)
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500">공연 제목 (title) *</label>
          <input
            v-model="form.title"
            type="text"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="공연 제목"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500">상태 (status) *</label>
            <select
              v-model="form.status"
              required
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500">관람 가능 연령 (age_limit)</label>
            <input
              v-model.number="form.age_limit"
              type="number"
              min="0"
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="예: 12 (선택)"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500">공연장 선택 *</label>
          <select
            v-model="form.venue_id"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            @change="loadSeatMaps"
          >
            <option :value="null">공연장을 선택하세요</option>
            <option v-for="v in venues" :key="v.id" :value="v.id">{{ v.name }}</option>
          </select>
          <div v-if="loadingVenues" class="mt-1 text-xs text-slate-400">공연장 목록 불러오는 중...</div>
        </div>
        <div v-if="form.venue_id && seatMaps.length > 0">
          <label class="block text-xs font-semibold text-slate-500">좌석맵 선택 (seat_map_id) *</label>
          <div class="mt-2 grid gap-2">
            <button
              v-for="sm in seatMaps"
              :key="sm.id"
              type="button"
              :class="[
                'rounded-xl border p-3 text-left transition',
                form.seat_map_id === sm.id
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              ]"
              @click="form.seat_map_id = sm.id"
            >
              <div class="flex items-start justify-between">
                <div>
                  <div class="text-sm font-semibold text-slate-900">ID: {{ sm.id }}</div>
                  <div class="mt-1 text-xs text-slate-600">
                    {{ sm.row_count || sm.rowCount || '-' }}행 × {{ sm.col_count || sm.colCount || '-' }}열
                    <span v-if="sm.version"> · v{{ sm.version }}</span>
                  </div>
                </div>
                <UiBadge :tone="sm.seatMapStatus === 'PUBLISHED' ? 'solid' : 'soft'" :color="sm.seatMapStatus === 'PUBLISHED' ? 'red' : 'slate'">
                  {{ sm.seatMapStatus || 'DRAFT' }}
                </UiBadge>
              </div>
            </button>
          </div>
          <div v-if="seatMaps.length === 0 && !loadingSeatMaps" class="mt-2 text-xs text-slate-400">
            선택한 공연장에 사용 가능한 좌석맵이 없습니다.
          </div>
        </div>
        <div v-else-if="form.venue_id && !loadingSeatMaps && seatMaps.length === 0" class="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs text-slate-600">선택한 공연장에 사용 가능한 좌석맵이 없습니다.</div>
        </div>
        <div v-if="loadingSeatMaps" class="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs text-slate-600">좌석맵 목록 불러오는 중...</div>
        </div>
        <p v-if="successMessage" class="text-sm text-green-600">{{ successMessage }}</p>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" type="button" class="h-11 px-4" @click="$router.push('/organizer/concerts')">취소</UiButton>
          <UiButton as="button" type="submit" form="concert-create-form" class="h-11 px-5" :disabled="saving">공연 생성</UiButton>
        </div>
      </form>
    </UiCard>

    <!-- 회차 생성 모달 (공연 생성 후 자동 표시) -->
    <UiModal :open="scheduleModalOpen" title="회차 생성 (더미)" @close="closeScheduleModal">
      <form id="schedule-create-form" class="grid gap-4" @submit.prevent="submitSchedule">
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs font-semibold text-slate-600">ERD: concert_schedule 테이블</div>
          <div class="mt-1 text-xs text-slate-500">
            공연: <span class="font-semibold">{{ createdConcert?.title }}</span> (ID: {{ createdConcert?.id }})<br />
            필수: play_time, booking_start, booking_end, status (READY/OPEN/CLOSED)<br />
            선택: concert_thum_img_url, concert_detail_img_url (concert_id는 자동)
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500">공연 시작 시간 (play_time) *</label>
          <input
            v-model="scheduleForm.play_time"
            type="datetime-local"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500">예매 오픈 시각 (booking_start) *</label>
            <input
              v-model="scheduleForm.booking_start"
              type="datetime-local"
              required
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500">예매 마감 시각 (booking_end) *</label>
            <input
              v-model="scheduleForm.booking_end"
              type="datetime-local"
              required
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500">상태 (status) *</label>
          <select
            v-model="scheduleForm.status"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="READY">READY</option>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500">썸네일 이미지 URL (concert_thum_img_url)</label>
            <input
              v-model="scheduleForm.concert_thum_img_url"
              type="url"
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="https://..."
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500">상세 이미지 URL (concert_detail_img_url)</label>
            <input
              v-model="scheduleForm.concert_detail_img_url"
              type="url"
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="https://..."
            />
          </div>
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="skipSchedule">건너뛰기</UiButton>
          <UiButton as="button" type="submit" form="schedule-create-form" :disabled="savingSchedule">생성 (더미)</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiModal from '../../components/common/UiModal.vue'
import { useApi } from '../../composables/useApi'
import { showErrorAlert } from '../../composables/useErrorToast'
import { ENDPOINTS } from '../../lib/api/endpoints'

// ERD: concert 테이블
// 필수: title, status (DRAFT/PUBLISHED), seat_map_id
// 선택: age_limit (member_id는 자동)
const DUMMY_CONCERT = {
  title: '새로운 공연',
  status: 'DRAFT',
  seat_map_id: 1,
  age_limit: null
}

function getDefaultForm() {
  return {
    title: DUMMY_CONCERT.title,
    status: DUMMY_CONCERT.status,
    venue_id: null,
    seat_map_id: null,
    age_limit: DUMMY_CONCERT.age_limit
  }
}

function getDefaultScheduleForm() {
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return {
    play_time: formatDateTimeLocal(nextWeek),
    booking_start: formatDateTimeLocal(now),
    booking_end: formatDateTimeLocal(tomorrow),
    status: 'READY',
    concert_thum_img_url: '',
    concert_detail_img_url: ''
  }
}

function formatDateTimeLocal(date) {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export default {
  name: 'OrganizerNewConcertView',
  components: {
    UiCard,
    UiButton,
    UiBadge,
    UiModal
  },
  data() {
    return {
      api: null,
      form: getDefaultForm(),
      saving: false,
      successMessage: '',
      venues: [],
      seatMaps: [],
      loadingVenues: false,
      loadingSeatMaps: false,
      scheduleModalOpen: false,
      scheduleForm: getDefaultScheduleForm(),
      savingSchedule: false,
      createdConcert: null
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.loadVenues()
  },
  methods: {
    async loadVenues() {
      this.loadingVenues = true
      try {
        const res = await this.api.get(ENDPOINTS.venues())
        this.venues = Array.isArray(res) ? res : res?.content || res?.items || []
      } catch (err) {
        console.warn('Failed to load venues', err)
        this.venues = []
      } finally {
        this.loadingVenues = false
      }
    },
    async loadSeatMaps() {
      if (!this.form.venue_id) {
        this.seatMaps = []
        this.form.seat_map_id = null
        return
      }
      this.loadingSeatMaps = true
      this.form.seat_map_id = null
      try {
        const res = await this.api.get(ENDPOINTS.venueSeatMaps(this.form.venue_id))
        const allSeatMaps = Array.isArray(res) ? res : res?.content || res?.items || []
        this.seatMaps = allSeatMaps.filter((sm) => sm.seatMapStatus === 'PUBLISHED')
      } catch (err) {
        console.warn('Failed to load seat maps', err)
        this.seatMaps = []
      } finally {
        this.loadingSeatMaps = false
      }
    },
    async submitCreate() {
      this.successMessage = ''
      this.saving = true
      const payload = {
        title: this.form.title || DUMMY_CONCERT.title,
        status: this.form.status || DUMMY_CONCERT.status,
        seatMapId: this.form.seat_map_id
      }
      if (this.form.age_limit !== null && this.form.age_limit !== undefined && this.form.age_limit !== '') {
        payload.ageLimit = Number(this.form.age_limit)
      }
      try {
        const res = await this.api.post(ENDPOINTS.organizerCreateConcert(), payload)
        let concertId = res?.id ?? res?.concertId
        if (concertId == null) {
          const list = await this.api.get(ENDPOINTS.organizerConcerts()).catch(() => [])
          const arr = Array.isArray(list) ? list : (list?.items ?? list?.content ?? [])
          const found = arr.find((c) => c.title === payload.title)
          concertId = found?.id
        }
        this.createdConcert = { id: concertId, title: payload.title, ...res }
        this.successMessage = concertId
          ? '공연이 생성되었습니다. 회차를 추가하세요.'
          : '공연이 생성되었습니다. 목록에서 해당 공연을 선택해 회차를 추가하세요.'
        this.scheduleForm = getDefaultScheduleForm()
        this.scheduleModalOpen = true
      } catch (err) {
        // 에러는 ErrorAlertModal에서 표시됨
      } finally {
        this.saving = false
      }
    },
    async submitSchedule() {
      if (!this.createdConcert?.id) {
        showErrorAlert(new Error('공연 ID를 확인할 수 없습니다. 목록에서 해당 공연을 선택한 뒤 회차를 추가하세요.'))
        return
      }
      this.savingSchedule = true
      const concertId = this.createdConcert.id
      const toIso = (val) => val ? (val.length === 16 ? val + ':00' : val) : val
      const schedulePayload = {
        playTime: toIso(this.scheduleForm.play_time),
        bookingStart: toIso(this.scheduleForm.booking_start),
        bookingEnd: toIso(this.scheduleForm.booking_end),
        status: this.scheduleForm.status
      }
      if (this.scheduleForm.concert_thum_img_url) {
        schedulePayload.concertThumImgUrl = this.scheduleForm.concert_thum_img_url
      }
      if (this.scheduleForm.concert_detail_img_url) {
        schedulePayload.concertDetailImgUrl = this.scheduleForm.concert_detail_img_url
      }
      const formData = new FormData()
      formData.append('schedule', new Blob([JSON.stringify(schedulePayload)], { type: 'application/json' }))
      try {
        await this.api.post(ENDPOINTS.organizerCreateSchedule(concertId), formData)
        this.successMessage = '공연과 회차가 생성되었습니다!'
        setTimeout(() => {
          this.$router.push(`/organizer/concerts/${concertId}/schedules`)
        }, 1500)
      } catch (err) {
        // 에러는 ErrorAlertModal에서 표시됨
      } finally {
        this.savingSchedule = false
      }
    },
    skipSchedule() {
      if (this.createdConcert) {
        this.$router.push(`/organizer/concerts/${this.createdConcert.id}/schedules`)
      } else {
        this.$router.push('/organizer/concerts')
      }
    },
    closeScheduleModal() {
      this.scheduleModalOpen = false
      if (this.createdConcert) {
        this.$router.push(`/organizer/concerts/${this.createdConcert.id}/schedules`)
      }
    }
  }
}
</script>
