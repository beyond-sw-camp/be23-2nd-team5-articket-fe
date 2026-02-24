<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">회차 출연진 관리</div>
        <div class="mt-1 text-sm text-slate-500">스케줄 ID: {{ scheduleId }} · 추가/수정/삭제</div>
      </div>
      <UiButton variant="ghost" class="h-10 px-3" @click="$router.push('/organizer/concerts')">공연 목록</UiButton>
    </div>

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <template v-else>
      <UiTable :columns="castingColumns" :rows="castingRows" row-key="performerId">
        <template #cell:performerName="{ row }">
          <button
            class="font-semibold text-slate-900 hover:underline"
            type="button"
            @click="$router.push(`/performers/${row.performerId}`)"
          >
            {{ row.performerName || row.name || '-' }}
          </button>
        </template>
        <template #cell:role="{ row }">
          <span class="text-slate-700">{{ row.role || '-' }}</span>
        </template>
        <template #cell:actions="{ row }">
          <div class="flex gap-2">
            <UiButton variant="ghost" class="h-8 px-2 text-sm" @click="openEditModal(row)">수정</UiButton>
            <UiButton variant="ghost" class="h-8 px-2 text-sm text-red-600" @click="confirmDelete(row)">삭제</UiButton>
          </div>
        </template>
      </UiTable>

      <div class="flex justify-end">
        <UiButton class="h-11 px-5" @click="openAddModal">출연진 추가</UiButton>
      </div>
    </template>

    <!-- 추가 모달 -->
    <UiModal :open="addModalOpen" title="출연진 추가" @close="closeAddModal">
      <form id="add-casting-form" class="grid gap-4" @submit.prevent="submitAdd">
        <div>
          <label class="block text-xs font-semibold text-slate-500">공연자 ID (performerId) *</label>
          <input
            v-model.number="addForm.performerId"
            type="number"
            required
            min="1"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="1"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500">역할 (role)</label>
          <input
            v-model="addForm.role"
            type="text"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="주연, 조연 등"
          />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeAddModal">취소</UiButton>
          <UiButton as="button" type="submit" form="add-casting-form">추가</UiButton>
        </div>
      </template>
    </UiModal>

    <!-- 수정 모달 -->
    <UiModal :open="editModalOpen" title="출연진 수정" @close="closeEditModal">
      <form id="edit-casting-form" class="grid gap-4" @submit.prevent="submitEdit">
        <div>
          <label class="block text-xs font-semibold text-slate-500">역할 (role)</label>
          <input
            v-model="editForm.role"
            type="text"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="주연, 조연 등"
          />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeEditModal">취소</UiButton>
          <UiButton as="button" type="submit" form="edit-casting-form">저장</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiTable from '../../components/common/UiTable.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiModal from '../../components/common/UiModal.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'OrganizerSchedulePerformersView',
  components: { UiCard, UiTable, UiButton, UiModal },
  data() {
    return {
      castingColumns: [
        { key: 'performerName', label: '공연자' },
        { key: 'role', label: '역할' },
        { key: 'actions', label: '관리' }
      ],
      api: null,
      castingRows: [],
      loading: false,
      addModalOpen: false,
      editModalOpen: false,
      addForm: { performerId: null, role: '' },
      editForm: { performerId: null, role: '' }
    }
  },
  computed: {
    scheduleId() {
      return this.$route.params.scheduleId
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    if (this.scheduleId) this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const list = await this.api.get(ENDPOINTS.schedulePerformers(this.scheduleId))
        const arr = Array.isArray(list) ? list : list?.content ?? []
        this.castingRows = arr.map((item) => ({
          performerId: item.performerId ?? item.id,
          performerName: item.performerName ?? item.name,
          role: item.role ?? ''
        }))
      } catch {
        this.castingRows = []
      } finally {
        this.loading = false
      }
    },
    openAddModal() {
      this.addForm = { performerId: null, role: '' }
      this.addModalOpen = true
    },
    closeAddModal() {
      this.addModalOpen = false
    },
    async submitAdd() {
      try {
        await this.api.post(ENDPOINTS.scheduleOrganizerAddPerformer(this.scheduleId), {
          performerId: this.addForm.performerId,
          role: this.addForm.role?.trim() || null
        })
        this.closeAddModal()
        await this.load()
      } catch (err) {
        console.warn('Add casting failed', err)
      }
    },
    openEditModal(row) {
      this.editForm = { performerId: row.performerId, role: row.role || '' }
      this.editModalOpen = true
    },
    closeEditModal() {
      this.editModalOpen = false
    },
    async submitEdit() {
      try {
        await this.api.put(ENDPOINTS.scheduleOrganizerUpdatePerformer(this.scheduleId, this.editForm.performerId), {
          role: this.editForm.role?.trim() || null
        })
        this.closeEditModal()
        await this.load()
      } catch (err) {
        console.warn('Update casting failed', err)
      }
    },
    confirmDelete(row) {
      if (!window.confirm(`"${row.performerName}" 출연을 삭제할까요?`)) return
      this.doDelete(row.performerId)
    },
    async doDelete(performerId) {
      try {
        await this.api.del(ENDPOINTS.scheduleOrganizerDeletePerformer(this.scheduleId, performerId))
        await this.load()
      } catch (err) {
        console.warn('Delete casting failed', err)
      }
    }
  }
}
</script>
