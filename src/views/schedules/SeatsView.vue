<template>
  <div class="grid gap-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">좌석 상태 조회</div>
        <div class="mt-1 text-sm text-slate-500">AVAILABLE / HOLD / SOLD · 필터(구역/등급)</div>
      </div>
      <div class="flex gap-2">
        <UiButton variant="ghost" class="h-11 px-4" @click="load">새로고침</UiButton>
        <UiButton variant="ghost" class="h-11 px-4" @click="simulateRealtime">
          <RefreshCw class="h-4 w-4" />
          <span class="ml-2">실시간 좌석 업데이트</span>
        </UiButton>
      </div>
    </div>

    <SeatLegend />

    <SectionFilter v-model:section="section" v-model:grade="grade" :sections="sections" :grades="grades" />

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <SeatGrid v-else :seats="filtered" :selected="selected" @toggle="toggleSeat" />

    <UiCard>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2">
          <UiBadge tone="soft">선택: {{ selected.length }}석</UiBadge>
          <UiBadge v-if="enabled" tone="solid" color="red">Realtime ON</UiBadge>
          <UiBadge v-else tone="soft">Realtime OFF</UiBadge>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <UiButton class="h-12 px-6" :disabled="holdLoading || selected.length === 0" @click="hold">
            <Timer class="h-4 w-4" />
            <span class="ml-2">좌석 선점(5분)</span>
          </UiButton>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script>
import { RefreshCw, Timer } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import SeatLegend from '../../components/seats/SeatLegend.vue'
import SeatGrid from '../../components/seats/SeatGrid.vue'
import SectionFilter from '../../components/seats/SectionFilter.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { useSeatHoldMock } from '../../composables/useSeatHoldMock'
import { useRealtimeSeatMock } from '../../composables/useRealtimeSeatMock'
import { SEAT_STATUS } from '../../mocks/seats'

export default {
  name: 'SeatsView',
  components: {
    RefreshCw,
    Timer,
    UiCard,
    UiButton,
    UiBadge,
    SeatLegend,
    SeatGrid,
    SectionFilter
  },
  data() {
    return {
      loading: false,
      seats: [],
      selected: [],
      section: '',
      grade: '',
      api: null,
      holdLoading: false,
      enabled: false,
      seatHoldMock: null,
      realtimeSeatMock: null
    }
  },
  computed: {
    sections() {
      return Array.from(new Set(this.seats.map((s) => s.section))).sort()
    },
    grades() {
      return Array.from(new Set(this.seats.map((s) => s.grade))).sort()
    },
    filtered() {
      return this.seats.filter((s) => {
        if (this.section && s.section !== this.section) return false
        if (this.grade && s.grade !== this.grade) return false
        return true
      })
    }
  },
  created() {
    this.api = useApi()
    this.seatHoldMock = useSeatHoldMock()
    this.realtimeSeatMock = useRealtimeSeatMock()
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      const scheduleId = this.$route.params.scheduleId
      if (scheduleId == null || scheduleId === '') {
        this.loading = false
        return
      }
      this.loading = true
      try {
        const res = await this.api.get(ENDPOINTS.seats(scheduleId))
        this.seats = Array.isArray(res) ? res : res?.content || res?.items || []
      } catch (err) {
        this.seats = []
        // 에러는 ErrorAlertModal에서 표시됨
      } finally {
        this.loading = false
      }
    },
    toggleSeat(id) {
      const idx = this.selected.indexOf(id)
      if (idx >= 0) {
        this.selected.splice(idx, 1)
        return
      }
      const seat = this.seats.find((s) => s.id === id)
      if (!seat || seat.status !== SEAT_STATUS.AVAILABLE) return
      this.selected.push(id)
    },
    simulateRealtime() {
      this.realtimeSeatMock.toggle()
      this.enabled = this.realtimeSeatMock.enabled.value
      this.seats = this.realtimeSeatMock.applyRandomMutation(this.seats)
      this.selected = this.selected.filter((id) => {
        const s = this.seats.find((x) => x.id === id)
        return s && s.status === SEAT_STATUS.AVAILABLE
      })
    },
    async hold() {
      if (this.selected.length === 0) return
      this.holdLoading = true
      try {
        const scheduleId = this.$route.params.scheduleId
        const res = await this.seatHoldMock.createHold({ scheduleId, seats: this.selected })
        
        // 선점된 좌석 상태를 로컬에서도 업데이트
        this.selected.forEach((seatId) => {
          const seat = this.seats.find((s) => s.id === seatId)
          if (seat) {
            seat.status = SEAT_STATUS.HOLD
          }
        })

        // 선택 초기화
        this.selected = []
        
        this.$router.push(`/hold/${res.holdId}`)
      } catch (e) {
        // 에러는 ErrorAlertModal에서 표시됨
      } finally {
        this.holdLoading = false
      }
    }
  }
}
</script>
