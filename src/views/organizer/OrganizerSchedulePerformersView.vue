<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">회차 출연진 관리</div>
        <div class="mt-1 text-sm text-slate-500">스케줄 ID: {{ scheduleId }} · 추가/수정/삭제</div>
      </div>
      <UiButton variant="ghost" class="h-10 px-3" @click="$router.back()">← 뒤로</UiButton>
    </div>

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <template v-else>
      <UiCard v-if="!castingRows.length">
        <div class="text-sm text-slate-500">등록된 출연진이 없습니다.</div>
      </UiCard>

      <UiTable v-else :columns="castingColumns" :rows="castingRows" row-key="performerId">
        <template #cell:performerName="{ row }">
          <div class="flex items-center gap-2">
            <img
              v-if="row.profileImgUrl"
              :src="row.profileImgUrl"
              class="h-8 w-8 rounded-full object-cover"
              alt=""
            />
            <div v-else class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400">?</div>
            <button
              class="font-semibold text-slate-900 hover:underline"
              type="button"
              @click="$router.push(`/performers/${row.performerId}`)"
            >
              {{ row.performerName || '-' }}
            </button>
          </div>
        </template>
        <template #cell:casting="{ row }">
          <span class="text-slate-700">{{ row.casting || '-' }}</span>
        </template>
        <template #cell:actions="{ row }">
          <div class="flex gap-2">
            <UiButton variant="ghost" class="h-8 px-2 text-sm" @click="openEditModal(row)">수정</UiButton>
            <UiButton variant="ghost" class="h-8 px-2 text-sm text-red-600" @click="confirmDelete(row)">삭제</UiButton>
          </div>
        </template>
      </UiTable>

      <div class="flex justify-end">
        <UiButton class="h-11 px-5" @click="openAddModal">+ 출연진 추가</UiButton>
      </div>
    </template>

    <!-- 추가 모달 -->
    <UiModal :open="addModalOpen" title="출연진 추가" @close="closeAddModal">
      <form id="add-casting-form" class="grid gap-4" @submit.prevent="submitAdd">

        <!-- 출연진 검색 -->
        <div>
          <label class="block text-xs font-semibold text-slate-500">출연진 검색 *</label>
          <div class="mt-1 flex gap-2">
            <input
              v-model="searchKeyword"
              type="text"
              class="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="이름으로 검색"
              @input="onSearchInput"
            />
            <UiButton type="button" variant="ghost" class="h-10 px-3 text-sm" :disabled="searching" @click="searchPerformers">검색</UiButton>
          </div>

          <!-- 검색 결과 -->
          <div v-if="searchResults.length" class="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <button
              v-for="p in searchResults"
              :key="p.id"
              type="button"
              class="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50"
              @click="selectPerformer(p)"
            >
              <img
                v-if="p.profileImgUrl"
                :src="p.profileImgUrl"
                class="h-8 w-8 rounded-full object-cover"
                alt=""
              />
              <div v-else class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400">?</div>
              <div>
                <div class="text-sm font-semibold text-slate-900">{{ p.name }}</div>
                <div v-if="p.description" class="text-xs text-slate-500 line-clamp-1">{{ p.description }}</div>
              </div>
            </button>
          </div>
          <div v-else-if="searched && !searching" class="mt-2 text-xs text-slate-400">검색 결과가 없습니다.</div>

          <!-- 선택된 출연진 표시 -->
          <div v-if="addForm.performerId" class="mt-2 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2">
            <span class="text-xs text-red-700">선택됨:</span>
            <span class="text-sm font-semibold text-red-900">{{ addForm.performerName }}</span>
            <span class="text-xs text-slate-400">(ID: {{ addForm.performerId }})</span>
            <button type="button" class="ml-auto text-xs text-slate-400 hover:text-red-500" @click="clearSelectedPerformer">✕</button>
          </div>
        </div>

        <!-- 배역 입력 -->
        <div>
          <label class="block text-xs font-semibold text-slate-500">배역 (casting) *</label>
          <input
            v-model="addForm.casting"
            type="text"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="예: 주연, 조연, 홍길동 역"
          />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeAddModal">취소</UiButton>
          <UiButton as="button" type="submit" form="add-casting-form" :disabled="!addForm.performerId || !addForm.casting.trim()">추가</UiButton>
        </div>
      </template>
    </UiModal>

    <!-- 수정 모달 -->
    <UiModal :open="editModalOpen" title="출연진 수정" @close="closeEditModal">
      <form id="edit-casting-form" class="grid gap-4" @submit.prevent="submitEdit">
        <div class="rounded-xl bg-slate-50 px-3 py-2">
          <span class="text-xs text-slate-500">출연진: </span>
          <span class="text-sm font-semibold text-slate-900">{{ editForm.performerName }}</span>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500">배역 (casting) *</label>
          <input
            v-model="editForm.casting"
            type="text"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="예: 주연, 조연, 홍길동 역"
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
        { key: 'performerName', label: '아티스트' },
        { key: 'casting', label: '배역' },
        { key: 'actions', label: '관리' }
      ],
      api: null,
      castingRows: [],
      loading: false,

      // 추가 모달
      addModalOpen: false,
      addForm: { performerId: null, performerName: '', casting: '' },

      // 출연진 검색
      searchKeyword: '',
      searchResults: [],
      searching: false,
      searched: false,
      searchTimer: null,

      // 수정 모달
      editModalOpen: false,
      editForm: { performerId: null, performerName: '', casting: '' }
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
    // ── 출연진 목록 로드 ──────────────────────────────────────
    async load() {
      if (this.scheduleId == null || this.scheduleId === '') return
      this.loading = true
      try {
        const list = await this.api.get(ENDPOINTS.schedulePerformers(this.scheduleId))
        const arr = Array.isArray(list) ? list : list?.content ?? []
        this.castingRows = arr.map((item) => ({
          performerId: item.performerId ?? item.id,
          performerName: item.performerName ?? item.name ?? '-',
          profileImgUrl: item.profileImgUrl ?? '',
          casting: item.casting ?? item.role ?? ''
        }))
      } catch {
        this.castingRows = []
      } finally {
        this.loading = false
      }
    },

    // ── 출연진 검색 ──────────────────────────────────────────
    onSearchInput() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        if (this.searchKeyword.trim()) this.searchPerformers()
        else this.searchResults = []
      }, 400)
    },
    async searchPerformers() {
      if (!this.searchKeyword.trim()) return
      this.searching = true
      this.searched = false
      try {
        const res = await this.api.get(ENDPOINTS.performers({ name: this.searchKeyword.trim(), size: 10 }))
        this.searchResults = Array.isArray(res) ? res : res?.content ?? []
        this.searched = true
      } catch {
        this.searchResults = []
      } finally {
        this.searching = false
      }
    },
    selectPerformer(performer) {
      this.addForm.performerId = performer.id
      this.addForm.performerName = performer.name
      this.searchKeyword = performer.name
      this.searchResults = []
    },
    clearSelectedPerformer() {
      this.addForm.performerId = null
      this.addForm.performerName = ''
      this.searchKeyword = ''
      this.searchResults = []
      this.searched = false
    },

    // ── 추가 모달 ────────────────────────────────────────────
    openAddModal() {
      this.addForm = { performerId: null, performerName: '', casting: '' }
      this.searchKeyword = ''
      this.searchResults = []
      this.searched = false
      this.addModalOpen = true
    },
    closeAddModal() {
      this.addModalOpen = false
    },
    async submitAdd() {
      if (!this.addForm.performerId) return
      if (!this.addForm.casting.trim()) return
      try {
        await this.api.post(ENDPOINTS.scheduleOrganizerAddPerformer(this.scheduleId), {
          performerId: this.addForm.performerId,
          casting: this.addForm.casting.trim()
        })
        this.closeAddModal()
        await this.load()
      } catch (err) {
        console.warn('Add casting failed', err)
      }
    },

    // ── 수정 모달 ────────────────────────────────────────────
    openEditModal(row) {
      this.editForm = {
        performerId: row.performerId,
        performerName: row.performerName,
        casting: row.casting || ''
      }
      this.editModalOpen = true
    },
    closeEditModal() {
      this.editModalOpen = false
    },
    async submitEdit() {
      if (this.scheduleId == null || this.scheduleId === '') return
      const performerId = this.editForm?.performerId
      if (performerId == null) return
      try {
        await this.api.put(ENDPOINTS.scheduleOrganizerUpdatePerformer(this.scheduleId, performerId), {
          casting: this.editForm.casting?.trim() || ''
        })
        this.closeEditModal()
        await this.load()
      } catch (err) {
        console.warn('Update casting failed', err)
      }
    },

    // ── 삭제 ─────────────────────────────────────────────────
    confirmDelete(row) {
      if (!window.confirm(`"${row.performerName}" 출연을 삭제할까요?`)) return
      this.doDelete(row.performerId)
    },
    async doDelete(performerId) {
      if (this.scheduleId == null || this.scheduleId === '') return
      if (performerId == null) return
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
