<template>
  <div class="grid gap-4">
    <div class="flex items-center gap-3">
      <UiButton variant="ghost" class="h-9 px-3" @click="$router.push('/admin/users')">← 목록</UiButton>
      <div>
        <h1 class="text-xl font-bold text-slate-900">공연/스케줄 내역</h1>
        <p class="mt-1 text-sm text-slate-500">회원 ID: {{ userId }}</p>
      </div>
    </div>

    <!-- 공연 목록 -->
    <div v-if="concertLoading" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      불러오는 중…
    </div>

    <div v-else-if="concerts.length === 0" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      등록된 공연이 없습니다.
    </div>

    <template v-else>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div class="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">공연 목록</div>
        <table class="w-full text-sm">
          <thead class="border-b border-slate-100 bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-slate-600">ID</th>
              <th class="px-4 py-3 text-left font-semibold text-slate-600">공연명</th>
              <th class="px-4 py-3 text-center font-semibold text-slate-600">상태</th>
              <th class="px-4 py-3 text-center font-semibold text-slate-600">연령제한</th>
              <th class="px-4 py-3 text-center font-semibold text-slate-600">회차 보기</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="concert in concerts" :key="concert.id">
              <tr class="border-b border-slate-100">
                <td class="px-4 py-3 text-slate-700">{{ concert.id }}</td>
                <td class="px-4 py-3 font-medium text-slate-900">{{ concert.title || '-' }}</td>
                <td class="px-4 py-3 text-center">
                  <UiBadge
                    :tone="concert.status === 'PUBLISHED' ? 'solid' : 'soft'"
                    :color="concert.status === 'PUBLISHED' ? 'red' : 'slate'"
                  >
                    {{ statusLabel(concert.status) }}
                  </UiBadge>
                </td>
                <td class="px-4 py-3 text-center text-slate-700">
                  {{ concert.ageLimit != null ? `${concert.ageLimit}세` : '-' }}
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    class="h-8 rounded-lg border px-3 text-xs font-medium transition-colors"
                    :class="selectedConcertId === concert.id
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
                    @click="toggleSchedules(concert)"
                  >
                    {{ selectedConcertId === concert.id ? '접기' : '회차 보기' }}
                  </button>
                </td>
              </tr>
              <!-- 회차 목록 인라인 -->
              <tr v-if="selectedConcertId === concert.id" :key="`sched-${concert.id}`">
                <td colspan="5" class="bg-slate-50 px-6 py-4">
                  <div class="mb-2 text-xs font-semibold text-slate-500">
                    「{{ concert.title }}」 회차 목록
                  </div>
                  <div v-if="scheduleLoading" class="py-4 text-center text-xs text-slate-400">불러오는 중…</div>
                  <div v-else-if="schedules.length === 0" class="py-4 text-center text-xs text-slate-400">등록된 회차가 없습니다.</div>
                  <table v-else class="w-full text-xs">
                    <thead>
                      <tr class="border-b border-slate-200">
                        <th class="py-2 pr-4 text-left font-semibold text-slate-500">일시</th>
                        <th class="py-2 pr-4 text-center font-semibold text-slate-500">상태</th>
                        <th class="py-2 pr-4 text-center font-semibold text-slate-500">예매율</th>
                        <th class="py-2 pr-4 text-center font-semibold text-slate-500">판매/총좌석</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="sched in schedules" :key="sched.id" class="border-b border-slate-100 last:border-0">
                        <td class="py-2 pr-4 text-slate-700">{{ formatDateTime(sched.playTime ?? sched.play_time) }}</td>
                        <td class="py-2 pr-4 text-center">
                          <UiBadge
                            :tone="sched.status === 'OPEN' ? 'solid' : 'soft'"
                            :color="sched.status === 'OPEN' ? 'red' : 'slate'"
                            class="text-xs"
                          >
                            {{ sched.status }}
                          </UiBadge>
                        </td>
                        <td class="py-2 pr-4 text-center">
                          <div class="flex items-center justify-center gap-2">
                            <div class="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                              <div
                                class="h-full rounded-full bg-red-500"
                                :style="{ width: Math.min(sched.occupancyRate ?? sched.occupancy ?? 0, 100) + '%' }"
                              />
                            </div>
                            <span>{{ sched.occupancyRate ?? sched.occupancy ?? 0 }}%</span>
                          </div>
                        </td>
                        <td class="py-2 pr-4 text-center text-slate-700">
                          {{ sched.soldSeats ?? sched.sold ?? 0 }} / {{ sched.totalSeats ?? sched.total ?? 0 }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- 페이징 -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
        <UiButton variant="ghost" class="h-9 px-3" :disabled="page <= 0" @click="goPage(page - 1)">이전</UiButton>
        <span class="text-sm text-slate-600">{{ page + 1 }} / {{ totalPages }}</span>
        <UiButton variant="ghost" class="h-9 px-3" :disabled="page >= totalPages - 1" @click="goPage(page + 1)">다음</UiButton>
      </div>
    </template>
  </div>
</template>

<script>
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

function formatDateTime(isoStr) {
  if (!isoStr) return '-'
  const dt = new Date(isoStr)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const d = String(dt.getDate()).padStart(2, '0')
  const h = String(dt.getHours()).padStart(2, '0')
  const min = String(dt.getMinutes()).padStart(2, '0')
  return `${y}.${m}.${d} ${h}:${min}`
}

export default {
  name: 'AdminUserConcertsView',
  components: { UiButton, UiBadge },
  data() {
    return {
      concerts: [],
      concertLoading: false,
      schedules: [],
      scheduleLoading: false,
      selectedConcertId: null,
      page: 0,
      size: 10,
      totalPages: 1,
      api: null
    }
  },
  computed: {
    userId() {
      return this.$route.params.userId
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.loadConcerts()
  },
  methods: {
    statusLabel(s) {
      const m = { DRAFT: '초안', PUBLISHED: '게시', ENDED: '종료' }
      return m[s] ?? s ?? '-'
    },
    formatDateTime,
    goPage(p) {
      if (p < 0 || p >= this.totalPages) return
      this.page = p
      this.loadConcerts()
    },
    async loadConcerts() {
      this.concertLoading = true
      this.selectedConcertId = null
      this.schedules = []
      try {
        const res = await this.api.get(ENDPOINTS.adminUserConcerts(this.userId, { page: this.page, size: this.size }))
        this.concerts = res?.content ?? res?.items ?? (Array.isArray(res) ? res : [])
        this.totalPages = Math.max(1, res?.totalPages ?? 1)
      } catch (e) {
        console.error('공연 목록 로드 실패', e)
        this.concerts = []
      } finally {
        this.concertLoading = false
      }
    },
    async toggleSchedules(concert) {
      if (this.selectedConcertId === concert.id) {
        this.selectedConcertId = null
        this.schedules = []
        return
      }
      this.selectedConcertId = concert.id
      this.schedules = []
      this.scheduleLoading = true
      try {
        const res = await this.api.get(`${ENDPOINTS.concertSchedules(concert.id)}?page=0&size=50&sort=playTime,asc`)
        const raw = res?.content ?? res?.items ?? (Array.isArray(res) ? res : [])
        this.schedules = raw
      } catch (e) {
        console.error('회차 로드 실패', e)
        this.schedules = []
      } finally {
        this.scheduleLoading = false
      }
    }
  }
}
</script>
