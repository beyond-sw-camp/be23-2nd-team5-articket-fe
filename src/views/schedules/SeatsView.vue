<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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

const api = useApi()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const seats = ref([])
const selected = ref([])

const section = ref('')
const grade = ref('')

const { loading: holdLoading, error: holdError, createHold } = useSeatHoldMock()
const { enabled, toggle, applyRandomMutation } = useRealtimeSeatMock()

async function load() {
  loading.value = true
  try {
    const res = await api.get(ENDPOINTS.seats(route.params.scheduleId))
    seats.value = res.items || []
  } finally {
    loading.value = false
  }
}

onMounted(load)

const sections = computed(() => Array.from(new Set(seats.value.map((s) => s.section))).sort())
const grades = computed(() => Array.from(new Set(seats.value.map((s) => s.grade))).sort())

const filtered = computed(() => {
  return seats.value.filter((s) => {
    if (section.value && s.section !== section.value) return false
    if (grade.value && s.grade !== grade.value) return false
    return true
  })
})

function toggleSeat(id) {
  const idx = selected.value.indexOf(id)
  if (idx >= 0) {
    selected.value.splice(idx, 1)
    return
  }
  const seat = seats.value.find((s) => s.id === id)
  if (!seat || seat.status !== SEAT_STATUS.AVAILABLE) return
  selected.value.push(id)
}

function simulateRealtime() {
  toggle()
  seats.value = applyRandomMutation(seats.value)
  selected.value = selected.value.filter((id) => {
    const s = seats.value.find((x) => x.id === id)
    return s && s.status === SEAT_STATUS.AVAILABLE
  })
}

async function hold() {
  if (selected.value.length === 0) return
  const res = await createHold({ scheduleId: route.params.scheduleId, seats: selected.value })
  router.push(`/hold/${res.holdId}`)
}
</script>

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
          <div v-if="holdError" class="text-sm font-semibold text-red-700">{{ holdError }}</div>
          <UiButton class="h-12 px-6" :disabled="holdLoading || selected.length === 0" @click="hold">
            <Timer class="h-4 w-4" />
            <span class="ml-2">좌석 선점(5분)</span>
          </UiButton>
        </div>
      </div>
    </UiCard>
  </div>
</template>
