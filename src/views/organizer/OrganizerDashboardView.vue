<template>
  <div class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">ORGANIZER 대시보드</div>
        <div class="mt-1 text-sm text-slate-500">내 공연/판매율/오픈·마감 알림/총 판매 요약 (mock)</div>
      </div>
      <UiBadge tone="soft">ORGANIZER</UiBadge>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <StatCard label="총 판매 금액" :value="`₩ ${totalRevenue.toLocaleString()}`" hint="내 공연 기준(mock)" />
      <StatCard label="오늘 오픈" :value="String(todayOpen)" hint="OPEN schedules" />
      <StatCard label="오늘 마감" :value="String(todayClose)" hint="CLOSED schedules" />
    </div>

    <UiCard>
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">바로가기</div>
          <div class="mt-1 text-sm text-slate-500">공연 생성/목록/주문</div>
        </div>
        <div class="flex gap-2">
          <UiButton variant="ghost" class="h-11 px-4" @click="$router.push('/organizer/concerts')">내 공연</UiButton>
          <UiButton class="h-11 px-5" @click="$router.push('/organizer/concerts/new')">공연 생성</UiButton>
        </div>
      </div>
    </UiCard>

    <UiCard>
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">상위 공연 판매 현황</div>
          <div class="mt-1 text-sm text-slate-500">매출 기준 Top 3 (mock)</div>
        </div>
        <UiBadge tone="soft">판매 요약</UiBadge>
      </div>

      <div v-if="loading" class="mt-4 text-sm text-slate-500">불러오는 중…</div>
      <div v-else class="mt-4">
        <UiTable :columns="topColumns" :rows="topRows">
          <template #cell:title="{ row }">
            <button
              class="font-semibold text-slate-900 hover:underline"
              type="button"
              @click="$router.push(`/organizer/concerts/${row.id}`)"
            >
              {{ row.title }}
            </button>
          </template>
          <template #cell:status="{ row }">
            <UiBadge :tone="row.status === 'PUBLISHED' ? 'solid' : 'soft'" :color="row.status === 'PUBLISHED' ? 'red' : 'slate'">
              {{ row.status }}
            </UiBadge>
          </template>
          <template #cell:revenue="{ row }">
            ₩{{ Number(row.revenue || 0).toLocaleString() }}
          </template>
        </UiTable>
      </div>
    </UiCard>
  </div>
</template>

<script>
import StatCard from '../../components/common/StatCard.vue'
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiTable from '../../components/common/UiTable.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'OrganizerDashboardView',
  components: {
    StatCard,
    UiCard,
    UiBadge,
    UiButton,
    UiTable
  },
  data() {
    return {
      loading: false,
      concerts: [],
      api: null,
      topColumns: [
        { key: 'title', label: '공연' },
        { key: 'status', label: '상태' },
        { key: 'scheduleCount', label: '회차' },
        { key: 'orderCount', label: '주문' },
        { key: 'revenue', label: '매출' }
      ]
    }
  },
  computed: {
    totalRevenue() {
      return this.concerts.reduce((sum, c) => sum + Number(c.revenue || 0), 0)
    },
    todayOpen() {
      return this.concerts.reduce((sum, c) => sum + (c.todayOpen || 0), 0)
    },
    todayClose() {
      return this.concerts.reduce((sum, c) => sum + (c.todayClose || 0), 0)
    },
    topRows() {
      return [...this.concerts].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 3)
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
      this.loading = true
      try {
        const res = await this.api.get(ENDPOINTS.organizerConcerts())
        this.concerts = res.items || []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
