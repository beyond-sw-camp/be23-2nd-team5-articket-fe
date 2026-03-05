<template>
  <div class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">회원 관리</h1>
        <p class="mt-1 text-sm text-slate-500">전체 회원 목록을 조회하고 검색합니다.</p>
      </div>
      <UiBadge tone="soft">ADMIN</UiBadge>
    </div>

    <!-- 검색 필터 -->
    <div class="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-4">
      <select
        v-model="searchRole"
        class="h-10 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
      >
        <option value="">역할 전체</option>
        <option value="USER">USER</option>
        <option value="ORGANIZER">ORGANIZER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <input
        v-model="searchEmail"
        type="text"
        placeholder="이메일로 검색"
        class="h-10 flex-1 min-w-[180px] rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        @keydown.enter.prevent="doSearch"
      />
      <UiButton class="h-10 px-4 shrink-0" @click="doSearch">검색</UiButton>
      <UiButton variant="ghost" class="h-10 px-4 shrink-0" @click="resetSearch">초기화</UiButton>
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      목록을 불러오는 중…
    </div>
    <UiTable v-else :columns="columns" :rows="rows">
      <template #cell:email="{ row }">
        <span class="font-medium text-slate-800">{{ row.email }}</span>
      </template>
      <template #cell:role="{ row }">
        <UiBadge
          :tone="row.role === 'ADMIN' ? 'solid' : row.role === 'ORGANIZER' ? 'soft' : 'outline'"
          :color="row.role === 'ADMIN' ? 'red' : row.role === 'ORGANIZER' ? 'blue' : 'slate'"
        >
          {{ row.role || '-' }}
        </UiBadge>
      </template>
      <template #cell:actions="{ row }">
        <UiButton variant="ghost" class="h-8 px-3 text-sm" @click="$router.push(`/admin/users/${row.id}/orders?role=${row.role}`)">
          상세보기
        </UiButton>
      </template>
    </UiTable>

    <!-- 페이징 -->
    <div v-if="!loading && totalPages > 1" class="flex items-center justify-center gap-2">
      <UiButton variant="ghost" class="h-9 px-3" :disabled="page <= 0" @click="goPage(page - 1)">이전</UiButton>
      <span class="text-sm text-slate-600">{{ page + 1 }} / {{ totalPages }}</span>
      <UiButton variant="ghost" class="h-9 px-3" :disabled="page >= totalPages - 1" @click="goPage(page + 1)">다음</UiButton>
    </div>
  </div>
</template>

<script>
import UiTable from '../../components/common/UiTable.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'AdminUsersView',
  components: { UiTable, UiButton, UiBadge },
  data() {
    return {
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: '이름' },
        { key: 'email', label: '이메일' },
        { key: 'role', label: '역할' },
        { key: 'createdTime', label: '가입일' },
        { key: 'actions', label: '작업' }
      ],
      api: null,
      rows: [],
      loading: false,
      searchEmail: '',
      searchRole: '',
      page: 0,
      totalPages: 1,
      pageSize: 15
    }
  },
  created() {
    this.api = useApi()
    this.loadUsers()
  },
  watch: {
    page() {
      this.loadUsers()
    }
  },
  methods: {
    doSearch() {
      this.page = 0
      this.loadUsers()
    },
    resetSearch() {
      this.searchEmail = ''
      this.searchRole = ''
      this.page = 0
      this.loadUsers()
    },
    goPage(p) {
      if (p < 0 || p >= this.totalPages) return
      this.page = p
    },
    formatDate(val) {
      if (!val) return '-'
      // Spring Boot LocalDateTime 배열 형식: [year, month(1-based), day, hour, minute, ...]
      const d = Array.isArray(val) ? new Date(val[0], val[1] - 1, val[2]) : new Date(val)
      if (isNaN(d.getTime())) return '-'
      return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
        .replace(/\. /g, '.').replace(/\.$/, '')
    },
    async loadUsers() {
      this.loading = true
      try {
        const params = {
          page: this.page,
          size: this.pageSize,
          ...(this.searchEmail.trim() && { email: this.searchEmail.trim() }),
          ...(this.searchRole && { role: this.searchRole })
        }
        const res = await this.api.get(ENDPOINTS.adminUsers(params))
        const list = res?.content ?? res?.items ?? (Array.isArray(res) ? res : [])
        this.rows = list.map((u) => ({
          id: u.id ?? u.memberId ?? '-',
          name: u.name ?? u.nickname ?? '-',
          email: u.email ?? '-',
          role: u.role ?? u.memberRole ?? '-',
          status: u.status ?? u.memberStatus ?? '-',
          createdTime: this.formatDate(u.createdTime)
        }))
        this.totalPages = Math.max(1, res?.totalPages ?? 1)
      } catch (err) {
        console.error('회원 목록 로드 실패', err)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
