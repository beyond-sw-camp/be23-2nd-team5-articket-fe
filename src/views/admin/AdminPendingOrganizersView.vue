<template>
  <div class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">주최자 신청 승인</div>
        <div class="mt-1 text-sm text-slate-500">GET /admin/pending-organizers · 승인/거절</div>
      </div>
      <UiBadge tone="soft">ADMIN</UiBadge>
    </div>

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <template v-else>
      <UiCard v-if="items.length === 0" class="border-amber-100 bg-amber-50">
        <div class="text-sm text-slate-600">대기 중인 주최자 신청이 없습니다.</div>
      </UiCard>

      <UiCard v-else>
        <UiTable :columns="columns" :rows="items" row-key="id">
          <template #cell:role="{ row }">
            <UiBadge tone="soft">{{ row.role || 'USER' }}</UiBadge>
          </template>
          <template #cell:organizerStatus="{ row }">
            <UiBadge tone="soft" class="bg-amber-100 text-amber-800">PENDING</UiBadge>
          </template>
          <template #cell:actions="{ row }">
            <div class="flex gap-2">
              <UiButton
                class="h-8 px-3 text-sm"
                :disabled="row._approving"
                @click="approve(row)"
              >
                {{ row._approving ? '처리 중…' : '승인' }}
              </UiButton>
              <UiButton
                variant="ghost"
                class="h-8 px-3 text-sm text-red-600 hover:bg-red-50"
                :disabled="row._rejecting"
                @click="reject(row)"
              >
                {{ row._rejecting ? '처리 중…' : '거절' }}
              </UiButton>
            </div>
          </template>
        </UiTable>

        <div v-if="totalPages > 1" class="mt-4 flex items-center justify-center gap-2">
          <UiButton
            variant="ghost"
            class="h-9 px-3"
            :disabled="page <= 0"
            @click="page = Math.max(0, page - 1)"
          >
            이전
          </UiButton>
          <span class="text-sm text-slate-600">{{ page + 1 }} / {{ totalPages }}</span>
          <UiButton
            variant="ghost"
            class="h-9 px-3"
            :disabled="page >= totalPages - 1"
            @click="page = Math.min(totalPages - 1, page + 1)"
          >
            다음
          </UiButton>
        </div>
      </UiCard>
    </template>

    <p v-if="errorMessage" class="text-sm font-medium text-red-600">{{ errorMessage }}</p>
    <p v-if="successMessage" class="text-sm font-medium text-green-600">{{ successMessage }}</p>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiTable from '../../components/common/UiTable.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

const PAGE_SIZE = 20

export default {
  name: 'AdminPendingOrganizersView',
  components: {
    UiCard,
    UiTable,
    UiBadge,
    UiButton
  },
  data() {
    return {
      loading: false,
      items: [],
      page: 0,
      totalPages: 1,
      errorMessage: '',
      successMessage: '',
      api: null,
      columns: [
        { key: 'id', label: 'ID', width: '80px' },
        { key: 'name', label: '이름' },
        { key: 'email', label: '이메일' },
        { key: 'phoneNumber', label: '연락처' },
        { key: 'role', label: '역할' },
        { key: 'organizerStatus', label: '상태' },
        { key: 'actions', label: '처리', width: '160px' }
      ]
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  watch: {
    page() {
      this.load()
    }
  },
  methods: {
    async load() {
      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''
      try {
        const res = await this.api.get(ENDPOINTS.adminPendingOrganizers({ page: this.page, size: PAGE_SIZE }))
        const raw = res?.content ?? res?.data ?? []
        this.items = Array.isArray(raw) ? raw.map((r) => ({ ...r, _approving: false, _rejecting: false })) : []
        this.totalPages = Math.max(1, res?.totalPages ?? 1)
      } catch (e) {
        this.items = []
        this.errorMessage = e?.message ?? '목록을 불러오지 못했습니다.'
      } finally {
        this.loading = false
      }
    },
    async approve(row) {
      const id = row?.id
      if (id == null) return
      this.errorMessage = ''
      this.successMessage = ''
      row._approving = true
      try {
        await this.api.post(ENDPOINTS.adminApproveOrganizer(id), {})
        this.successMessage = '승인되었습니다.'
        await this.load()
      } catch (e) {
        this.errorMessage = e?.message ?? '승인 처리에 실패했습니다.'
      } finally {
        row._approving = false
      }
    },
    async reject(row) {
      const id = row?.id
      if (id == null) return
      if (!window.confirm(`"${row.name ?? row.email}" 주최자 신청을 거절할까요?`)) return
      this.errorMessage = ''
      this.successMessage = ''
      row._rejecting = true
      try {
        await this.api.post(ENDPOINTS.adminRejectOrganizer(id), {})
        this.successMessage = '거절되었습니다.'
        await this.load()
      } catch (e) {
        this.errorMessage = e?.message ?? '거절 처리에 실패했습니다.'
      } finally {
        row._rejecting = false
      }
    }
  }
}
</script>
