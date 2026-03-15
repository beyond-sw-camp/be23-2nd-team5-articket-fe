<template>
  <div class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">내 공연 목록</div>
        <div class="mt-1 text-sm text-slate-500">주최자 본인 공연 목록 (상태, 카테고리, 판매/좋아요 통계 및 공연 기간)</div>
      </div>
      <UiButton class="h-11 px-5" @click="$router.push('/organizer/concerts/new')">공연 생성</UiButton>
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      목록을 불러오는 중…
    </div>
    <UiTable v-else :columns="columns" :rows="items">
      <template #cell:title="{ row }">
        <button class="font-semibold text-slate-900 hover:underline text-left" type="button" @click="$router.push(`/organizer/concerts/${row.id}`)">
          {{ row.title || '-' }}
        </button>
      </template>
      <template #cell:category="{ row }">
        <span class="text-xs font-medium text-slate-600">{{ row.category || '-' }}</span>
      </template>
      <template #cell:status="{ row }">
        <UiBadge :tone="row.status === 'PUBLISHED' || row.status === 'AVAILABLE' ? 'solid' : 'soft'" :color="row.status === 'PUBLISHED' || row.status === 'AVAILABLE' ? 'red' : 'slate'">
          {{ statusLabel(row.status) }}
        </UiBadge>
      </template>
      <template #cell:stats="{ row }">
        <div class="flex items-center gap-3">
          <div title="판매량" class="flex items-center gap-1.5">
            <Ticket class="h-3.5 w-3.5 text-blue-500" />
            <span class="text-xs font-semibold text-slate-700">{{ (row.bookingCount || 0).toLocaleString() }}</span>
          </div>
          <div title="좋아요" class="flex items-center gap-1.5">
            <Heart class="h-3.5 w-3.5 text-red-500" />
            <span class="text-xs font-semibold text-slate-700">{{ (row.likeCount || 0).toLocaleString() }}</span>
          </div>
          <div title="리뷰" class="flex items-center gap-1.5">
            <MessageSquare class="h-3.5 w-3.5 text-amber-500" />
            <span class="text-xs font-semibold text-slate-700">{{ (row.reviewCount || 0).toLocaleString() }}</span>
          </div>
        </div>
      </template>
      <template #cell:period="{ row }">
        <div class="text-xs text-slate-600">
          {{ formatDate(row.scheduleStartDate) }} ~ {{ formatDate(row.scheduleEndDate) }}
        </div>
      </template>
      <template #cell:actions="{ row }">
        <UiButton variant="ghost" class="h-8 px-3 text-sm" @click="$router.push(`/organizer/concerts/${row.id}`)">
          상세보기
        </UiButton>
      </template>
    </UiTable>

    <div v-if="!loading && totalPages > 1" class="flex items-center justify-center gap-2">
      <UiButton variant="ghost" class="h-9 px-3" :disabled="page <= 0" @click="goPage(page - 1)">
        이전
      </UiButton>
      <span class="text-sm text-slate-600">{{ page + 1 }} / {{ totalPages }}</span>
      <UiButton variant="ghost" class="h-9 px-3" :disabled="page >= totalPages - 1" @click="goPage(page + 1)">
        다음
      </UiButton>
    </div>
  </div>
</template>

<script>
import { Ticket, Heart, MessageSquare } from 'lucide-vue-next'
import UiTable from '../../components/common/UiTable.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'OrganizerConcertsView',
  components: {
    Ticket,
    Heart,
    MessageSquare,
    UiTable,
    UiBadge,
    UiButton
  },
  data() {
    return {
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'title', label: '공연명' },
        { key: 'category', label: '카테고리' },
        { key: 'status', label: '상태' },
        { key: 'stats', label: '판매/좋아요/후기' },
        { key: 'period', label: '공연 기간' },
        { key: 'actions', label: '작업' }
      ],
      loading: false,
      items: [],
      page: 0,
      size: 10,
      totalPages: 0,
      api: null
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  methods: {
    statusLabel(s) {
      const m = { DRAFT: '초안', PUBLISHED: '게시', ENDED: '종료', UPCOMING: '오픈대기', AVAILABLE: '예매가능' }
      return m[s] ?? s ?? '-'
    },
    formatDate(d) {
      if (!d) return '-'
      const date = new Date(d)
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
    },
    goPage(p) {
      if (p < 0 || p >= this.totalPages) return
      this.page = p
      this.load()
    },
    async load() {
      this.loading = true
      try {
        const res = await this.api.get(ENDPOINTS.organizerConcerts({ page: this.page, size: this.size }))
        this.items = res?.content ?? res?.items ?? (Array.isArray(res) ? res : [])
        this.totalPages = res?.totalPages ?? 1
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
