<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CalendarClock } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

const api = useApi()
const route = useRoute()
const router = useRouter()

const concert = ref(null)
const schedules = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    concert.value = await api.get(ENDPOINTS.concert(route.params.concertId))
    const res = await api.get(ENDPOINTS.concertSchedules(route.params.concertId))
    schedules.value = res.items || []
  } finally {
    loading.value = false
  }
}

onMounted(load)

function statusBadge(st) {
  return st === 'OPEN' ? { tone: 'solid', color: 'red', label: 'OPEN' } : { tone: 'soft', color: 'slate', label: 'CLOSED' }
}
</script>

<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <template v-else>
      <div class="flex items-end justify-between gap-4">
        <div>
          <div class="text-sm font-semibold text-slate-900">회차 목록</div>
          <div class="mt-1 text-sm text-slate-500">{{ concert?.title }}</div>
        </div>
        <UiButton variant="ghost" class="h-11 px-4" @click="router.push(`/concerts/${route.params.concertId}`)">
          공연 상세
        </UiButton>
      </div>

      <div class="grid gap-3">
        <UiCard
          v-for="s in schedules"
          :key="s.id"
          class="cursor-pointer transition hover:shadow-lg"
          @click="router.push(`/schedules/${s.id}`)"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CalendarClock class="h-4 w-4 text-slate-600" />
                {{ new Date(s.startsAt).toLocaleString() }}
              </div>
              <div class="mt-1 text-sm text-slate-500">
                가격 요약: ₩{{ s.summary?.minPrice?.toLocaleString() }} ~ ₩{{ s.summary?.maxPrice?.toLocaleString() }}
              </div>
            </div>
            <UiBadge v-bind="statusBadge(s.status)">{{ statusBadge(s.status).label }}</UiBadge>
          </div>
        </UiCard>
      </div>
    </template>
  </div>
</template>

