<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div class="mgmt-page-title">메인 캐스트 관리</div>
        <div class="mgmt-page-subtitle">공연 ID: {{ concertId }} · 공연 레벨 출연진 추가/수정/삭제</div>
      </div>
      <UiButton variant="ghost" class="h-10 px-3" @click="$router.push(`/organizer/concerts/${concertId}`)">공연 상세</UiButton>
    </div>

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <template v-else>
      <UiTable :columns="castingColumns" :rows="castingRows" row-key="performerId">
        <template #cell:performerName="{ row }">
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
              <img
                v-if="row.profileImgUrl"
                :src="row.profileImgUrl"
                :alt="row.performerName"
                class="h-full w-full object-cover"
                @error="$event.target.style.display='none'"
              />
              <span v-else>{{ (row.performerName || '?').charAt(0) }}</span>
            </div>
            <button
              class="font-semibold text-slate-900 hover:underline text-left"
              type="button"
              @click="openViewConfirm(row)"
            >
              {{ row.performerName || '-' }}
            </button>
          </div>
        </template>
        <template #cell:roleName="{ row }">
          <span class="text-slate-700">{{ row.roleName || '-' }}</span>
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
    <UiModal :open="addModalOpen" title="메인 캐스트 추가" @close="closeAddModal">
      <form id="add-concert-casting-form" class="grid gap-4" @submit.prevent="submitAdd">
        <div>
          <label class="block text-xs font-semibold text-slate-500">아티스트 검색 *</label>
          <div class="mt-1 flex gap-2">
            <input
              v-model="addSearchName"
              type="text"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="이름으로 검색 (예: 홍길동)"
              @keydown.enter.prevent="doSearchPerformers"
            />
            <UiButton type="button" class="h-10 px-4 whitespace-nowrap" :disabled="searchLoading" @click="doSearchPerformers">
              {{ searchLoading ? '검색 중…' : '검색' }}
            </UiButton>
          </div>
          <div v-if="searchResults.length" class="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
            <button
              v-for="p in searchResults"
              :key="p.id"
              type="button"
              class="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left text-sm transition hover:bg-slate-100"
              :class="[
                isPerformerSelected(p.id) ? 'bg-red-50 border border-red-200' : '',
                isAlreadyRegistered(p.id) ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''
              ]"
              :disabled="isAlreadyRegistered(p.id)"
              @click="togglePerformer(p)"
            >
              <div class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                <img
                  v-if="p.profileImgUrl"
                  :src="p.profileImgUrl"
                  :alt="p.name"
                  class="h-full w-full object-cover"
                  @error="$event.target.style.display='none'"
                />
                <span v-else>{{ (p.name || '?').charAt(0) }}</span>
              </div>
              <div class="min-w-0 flex-1 whitespace-normal">
                <div class="font-semibold text-slate-900 break-words">{{ p.name }}</div>
                <div v-if="p.description" class="mt-0.5 text-xs text-slate-500 break-words">{{ p.description }}</div>
              </div>
              <span v-if="isAlreadyRegistered(p.id)" class="text-xs font-semibold text-slate-400">이미 등록됨</span>
              <span v-else-if="isPerformerSelected(p.id)" class="text-xs font-semibold text-red-600">선택됨</span>
            </button>
          </div>
          <div v-else-if="addSearchName && !searchLoading" class="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2">
            <p class="text-xs text-slate-500">
              "{{ addSearchName }}"에 대한 아티스트를 찾을 수 없습니다.
            </p>
            <UiButton
              type="button"
              variant="ghost"
              class="h-8 px-3 text-xs whitespace-nowrap"
              @click="$router.push({ path: '/organizer/performers', query: { from: 'concert', concertId } })"
            >
              새 아티스트 등록하기
            </UiButton>
          </div>
        </div>

        <!-- 선택된 아티스트 목록 및 배역 입력 -->
        <div v-if="addSelectedPerformers.length > 0" class="border-t border-slate-100 pt-4">
          <label class="block text-xs font-semibold text-slate-500 mb-2">선택된 아티스트 및 역할명 ({{ addSelectedPerformers.length }}명)</label>
          <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
            <div v-for="item in addSelectedPerformers" :key="item.id" class="flex items-center gap-2 rounded-lg border border-slate-200 p-2 bg-white">
              <div class="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                <img v-if="item.profileImgUrl" :src="item.profileImgUrl" class="h-full w-full object-cover" />
                <span v-else>{{ (item.name || '?').charAt(0) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-slate-900 truncate">{{ item.name }}</div>
              </div>
              <input
                v-model="item.roleName"
                type="text"
                class="w-32 rounded border border-slate-200 px-2 py-1 text-xs focus:border-red-500 focus:outline-none"
                placeholder="역할 입력 (예: 주연)"
              />
              <button type="button" class="text-slate-400 hover:text-red-500 px-1" @click="removeSelected(item.id)">✕</button>
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeAddModal">취소</UiButton>
          <UiButton as="button" type="submit" form="add-concert-casting-form">추가</UiButton>
        </div>
      </template>
    </UiModal>

    <!-- 수정 모달 -->
    <UiModal :open="editModalOpen" title="역할명 수정" @close="closeEditModal">
      <form id="edit-concert-casting-form" class="grid gap-4" @submit.prevent="submitEdit">
        <div>
          <label class="block text-xs font-semibold text-slate-500">역할명 *</label>
          <input
            v-model="editForm.roleName"
            type="text"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="예: 주연, 조연 등"
          />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeEditModal">취소</UiButton>
          <UiButton as="button" type="submit" form="edit-concert-casting-form">저장</UiButton>
        </div>
      </template>
    </UiModal>

    <!-- 아티스트 상세 이동 확인 모달 -->
    <UiModal :open="viewConfirmOpen" title="아티스트 상세 보기" @close="closeViewConfirm">
      <div class="space-y-3 text-sm text-slate-700">
        <p>
          <span class="font-semibold">{{ selectedPerformer?.performerName || '선택한 아티스트' }}</span>
          의 아티스트 관리 상세 화면으로 이동하시겠습니까?
        </p>
        <p class="text-xs text-slate-500">
          확인을 누르면 조직자용 아티스트 상세 뷰로 이동하고, 취소를 누르면 현재 화면에 머무릅니다.
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeViewConfirm">아니요</UiButton>
          <UiButton @click="confirmViewPerformer">예, 상세 보기</UiButton>
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
  name: 'OrganizerConcertPerformersView',
  components: { UiCard, UiTable, UiButton, UiModal },
  data() {
    return {
      castingColumns: [
        { key: 'performerName', label: '아티스트' },
        { key: 'roleName', label: '역할명' },
        { key: 'actions', label: '관리' }
      ],
      api: null,
      castingRows: [],
      loading: false,
      addModalOpen: false,
      editModalOpen: false,
      addSelectedPerformers: [], // Array of { id, name, profileImgUrl, roleName }
      editForm: { performerId: null, roleName: '' },
      addSearchName: '',
      searchResults: [],
      searchLoading: false,
      viewConfirmOpen: false,
      selectedPerformer: null
    }
  },
  computed: {
    concertId() {
      return this.$route.params.concertId
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    if (this.concertId) this.load()
  },
  methods: {
    async load() {
      if (!this.concertId) return
      this.loading = true
      try {
        const res = await this.api.get(ENDPOINTS.concertPerformers(this.concertId))
        const arr = Array.isArray(res) ? res : res?.content ?? []
        this.castingRows = arr.map((item) => ({
          performerId: item.performerId ?? item.id,
          performerName: item.performerName ?? item.name,
          profileImgUrl: item.profileImgUrl ?? null,
          roleName: item.roleName ?? item.role ?? ''
        }))
      } catch {
        this.castingRows = []
      } finally {
        this.loading = false
      }
    },
    openAddModal() {
      this.addSelectedPerformers = []
      this.addSearchName = ''
      this.searchResults = []
      this.addModalOpen = true
    },
    closeAddModal() {
      this.addModalOpen = false
    },
    async doSearchPerformers() {
      const q = (this.addSearchName || '').trim()
      if (!q) {
        this.searchResults = []
        return
      }
      this.searchLoading = true
      try {
        const res = await this.api.get(ENDPOINTS.performers({ name: q, size: 20, page: 0 }))
        const content = Array.isArray(res) ? res : res?.content ?? res?.items ?? []
        this.searchResults = content.map((item) => ({
          id: item.id ?? item.performerId,
          name: item.name ?? item.performerName,
          profileImgUrl: item.profileImgUrl ?? item.performerProfileImgUrl ?? null,
          description: item.description ?? null
        }))
      } catch (err) {
        console.warn('Search performers failed', err)
        this.searchResults = []
      } finally {
        this.searchLoading = false
      }
    },
    isPerformerSelected(id) {
      return this.addSelectedPerformers.some(p => p.id === id)
    },
    isAlreadyRegistered(id) {
      return this.castingRows.some(row => row.performerId === id)
    },
    togglePerformer(p) {
      if (this.isAlreadyRegistered(p.id)) return
      const idx = this.addSelectedPerformers.findIndex(item => item.id === p.id)
      if (idx >= 0) {
        this.addSelectedPerformers.splice(idx, 1)
      } else {
        this.addSelectedPerformers.push({
          id: p.id,
          name: p.name,
          profileImgUrl: p.profileImgUrl,
          roleName: ''
        })
      }
    },
    removeSelected(id) {
      this.addSelectedPerformers = this.addSelectedPerformers.filter(p => p.id !== id)
    },
    async submitAdd() {
      if (!this.concertId) return
      if (this.addSelectedPerformers.length === 0) {
        window.alert('추가할 아티스트를 선택해 주세요.')
        return
      }
      try {
        await Promise.all(this.addSelectedPerformers.map(p =>
          this.api.post(ENDPOINTS.organizerConcertAddPerformer(this.concertId), {
            performerId: p.id,
            roleName: (p.roleName || '').trim() || '출연'
          })
        ))
        this.closeAddModal()
        await this.load()
      } catch (err) {
        console.warn('Add concert performer failed', err)
      }
    },
    openEditModal(row) {
      this.editForm = { performerId: row.performerId, roleName: row.roleName || '' }
      this.editModalOpen = true
    },
    closeEditModal() {
      this.editModalOpen = false
    },
    async submitEdit() {
      if (!this.concertId) return
      const performerId = this.editForm?.performerId
      if (performerId == null) return
      const roleName = (this.editForm.roleName || '').trim()
      if (!roleName) {
        window.alert('역할명을 입력해 주세요.')
        return
      }
      try {
        await this.api.put(ENDPOINTS.organizerConcertUpdatePerformer(this.concertId, performerId), { roleName })
        this.closeEditModal()
        await this.load()
      } catch (err) {
        console.warn('Update concert performer failed', err)
      }
    },
    confirmDelete(row) {
      if (!window.confirm(`"${row.performerName}" 출연진을 삭제할까요?`)) return
      this.doDelete(row.performerId)
    },
    async doDelete(performerId) {
      if (!this.concertId || performerId == null) return
      try {
        await this.api.del(ENDPOINTS.organizerConcertDeletePerformer(this.concertId, performerId))
        await this.load()
      } catch (err) {
        console.warn('Delete concert performer failed', err)
      }
    },
    openViewConfirm(row) {
      this.selectedPerformer = row
      this.viewConfirmOpen = true
    },
    closeViewConfirm() {
      this.viewConfirmOpen = false
      this.selectedPerformer = null
    },
    confirmViewPerformer() {
      const id = this.selectedPerformer?.performerId
      if (!id) {
        this.closeViewConfirm()
        return
      }
      this.closeViewConfirm()
      this.$router.push(`/organizer/performers/${id}`)
    }
  }
}
</script>