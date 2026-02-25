<template>
  <div class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">운영/감사 로그</div>
        <div class="mt-1 text-sm text-slate-500">GET /admin/audit-logs</div>
      </div>
      <UiBadge tone="soft">ADMIN</UiBadge>
    </div>

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <UiTable v-else :columns="columns" :rows="items" rowKey="id">
      <template #cell:at="{ row }">{{ new Date(row.at).toLocaleString() }}</template>
    </UiTable>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiTable from '../../components/common/UiTable.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'AdminAuditLogsView',
  components: {
    UiCard,
    UiTable,
    UiBadge
  },
  data() {
    return {
      loading: false,
      items: [],
      api: null,
      columns: [
        { key: 'at', label: '시각' },
        { key: 'action', label: '액션' },
        { key: 'actor', label: '주체' },
        { key: 'detail', label: '상세' }
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
      this.loading = true
      try {
        const res = await this.api.get(ENDPOINTS.adminAuditLogs())
        this.items = res.items || []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
