<template>
  <UiCard v-if="loading">
    <div class="text-sm text-slate-500">불러오는 중…</div>
  </UiCard>
  <UiCard v-else-if="seatMap">
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">좌석맵 관리</div>
        <div class="mt-1 text-sm text-slate-500">
          ID: {{ seatMap.id }} ·
          <span class="font-semibold">{{ seatMap.name || '-' }}</span>
          <span v-if="seatMap.version !== null && seatMap.version !== undefined"> · v{{ seatMap.version }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UiButton class="h-9 px-4" @click="$router.push(`/admin/seat-maps/${seatMap.id}/layout`)">
          🗺️ 레이아웃 편집
        </UiButton>
        <UiBadge tone="soft">ADMIN</UiBadge>
      </div>
    </div>

    <div class="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div class="text-xs text-slate-500">
        상태: <span class="font-semibold text-slate-700">{{ seatMap.status || 'DRAFT' }}</span>
      </div>
      <div class="flex flex-wrap items-end gap-2">
        <div class="min-w-60 flex-1">
          <label class="block text-xs font-semibold text-slate-500">좌석맵 이름 수정</label>
          <input
            v-model="seatMapNameDraft"
            type="text"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
            placeholder="좌석맵 이름"
          />
        </div>
        <UiButton class="h-11 px-4" :disabled="savingSeatMapName" @click="updateSeatMapName">이름 저장</UiButton>
      </div>
      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
      <p v-if="successMessage" class="text-sm text-green-600">{{ successMessage }}</p>
    </div>

    <div class="mt-4 rounded-xl border border-slate-200 p-4">
      <div class="mb-3 flex items-center justify-between">
        <div class="text-sm font-semibold text-slate-900">섹션 관리</div>
        <UiButton class="h-9 px-3" :disabled="addingSection" @click="addSection">섹션 추가</UiButton>
      </div>

      <div v-if="sections.length === 0" class="text-sm text-slate-500">등록된 섹션이 없습니다.</div>

      <div v-for="section in sections" :key="section.id" class="mb-3 rounded-lg border border-slate-200 p-3">
        <div v-if="editingSectionId !== section.id" class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="text-sm font-semibold text-slate-900">{{ section.name || '-' }}</div>
            <div class="mt-1 text-xs text-slate-500">
              rows {{ section.rows ?? '-' }} · seatsPerRow {{ section.seatsPerRow ?? '-' }} · grade {{ section.initialGrade || '-' }}
            </div>
          </div>
          <div class="flex gap-2">
            <UiButton class="h-9 px-3" @click="startEditSection(section)">수정</UiButton>
            <UiButton class="h-9 px-3" :disabled="deletingSectionId === section.id" @click="deleteSection(section.id)">삭제</UiButton>
          </div>
        </div>

        <div v-else class="grid gap-2">
          <div class="grid grid-cols-2 gap-2">
            <input v-model="sectionDraft.name" type="text" class="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="name" />
            <input v-model="sectionDraft.displayColor" type="text" class="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="#33C3F0" />
            <input v-model.number="sectionDraft.rows" type="number" min="1" class="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="rows" />
            <input v-model.number="sectionDraft.seatsPerRow" type="number" min="1" class="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="seatsPerRow" />
            <select v-model="sectionDraft.initialGrade" class="rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="VIP">VIP</option>
              <option value="R">R</option>
              <option value="S">S</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
          <div class="flex gap-2">
            <UiButton class="h-9 px-3" @click="saveSection(section.id)">저장</UiButton>
            <UiButton class="h-9 px-3" @click="cancelEditSection">취소</UiButton>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 rounded-xl border border-slate-200 p-4">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div class="text-sm font-semibold text-slate-900">좌석 정의 등급 관리</div>
        <select
          v-model="selectedSectionId"
          class="h-10 min-w-52 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
        >
          <option :value="null">섹션 선택</option>
          <option v-for="section in sections" :key="section.id" :value="section.id">{{ section.name }}</option>
        </select>
      </div>

      <div v-if="definitionsLoading" class="text-sm text-slate-500">좌석 정의 불러오는 중…</div>
      <div v-else-if="!selectedSectionId" class="text-sm text-slate-500">섹션을 선택하세요.</div>
      <div v-else-if="seatDefinitions.length === 0" class="text-sm text-slate-500">좌석 정의가 없습니다.</div>
      <div v-else>
        <div class="mb-2 flex flex-wrap items-center gap-2">
          <label class="text-xs text-slate-500">일괄 등급</label>
          <select v-model="bulkGrade" class="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900">
            <option :value="''">선택</option>
            <option value="VIP">VIP</option>
            <option value="R">R</option>
            <option value="S">S</option>
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
          <UiButton class="h-9 px-3" @click="applyBulkGrade">선택 좌석 일괄 변경</UiButton>
          <button type="button" class="text-xs font-semibold text-slate-600 hover:underline" @click="toggleSelectAllDefinitions">
            {{ selectedDefinitionIds.length === seatDefinitions.length ? '전체 해제' : '전체 선택' }}
          </button>
        </div>

        <div class="max-h-96 overflow-auto rounded-lg border border-slate-200">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-600">
              <tr>
                <th class="px-3 py-2 text-left">선택</th>
                <th class="px-3 py-2 text-left">행</th>
                <th class="px-3 py-2 text-left">좌석</th>
                <th class="px-3 py-2 text-left">현재등급</th>
                <th class="px-3 py-2 text-left">변경등급</th>
                <th class="px-3 py-2 text-left">액션</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="def in seatDefinitions" :key="def.id" class="border-t border-slate-100">
                <td class="px-3 py-2">
                  <input :checked="selectedDefinitionIds.includes(def.id)" type="checkbox" @change="toggleDefinitionSelection(def.id)" />
                </td>
                <td class="px-3 py-2">{{ def.rowNo ?? def.row_no ?? '-' }}</td>
                <td class="px-3 py-2">{{ def.seatNo ?? def.seat_no ?? '-' }}</td>
                <td class="px-3 py-2">{{ def.gradeDefault ?? def.grade_default ?? '-' }}</td>
                <td class="px-3 py-2">
                  <select v-model="definitionGradeDrafts[def.id]" class="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900">
                    <option value="VIP">VIP</option>
                    <option value="R">R</option>
                    <option value="S">S</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                  </select>
                </td>
                <td class="px-3 py-2">
                  <UiButton class="h-9 px-3" @click="updateDefinitionGrade(def.id)">저장</UiButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="mt-4 flex gap-2">
      <UiButton variant="ghost" class="h-11 px-4" @click="$router.back()">뒤로</UiButton>
      <UiButton class="h-11 px-5" @click="$router.push(`/admin/seat-maps/${seatMap.id}/publish`)">게시/폐기</UiButton>
    </div>
  </UiCard>
  <UiCard v-else>
    <div class="text-sm font-semibold text-slate-900">좌석맵 정보를 찾을 수 없습니다.</div>
    <div class="mt-1 text-sm text-slate-500">{{ errorMessage || '-' }}</div>
  </UiCard>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'AdminSeatMapPreviewView',
  components: {
    UiCard,
    UiBadge,
    UiButton
  },
  data() {
    return {
      api: null,
      loading: false,
      seatMap: null,
      sections: [],
      seatMapNameDraft: '',
      savingSeatMapName: false,
      addingSection: false,
      deletingSectionId: null,
      editingSectionId: null,
      sectionDraft: {
        name: '',
        displayColor: '#FF5733',
        rows: 5,
        seatsPerRow: 10,
        initialGrade: 'VIP'
      },
      selectedSectionId: null,
      definitionsLoading: false,
      seatDefinitions: [],
      selectedDefinitionIds: [],
      definitionGradeDrafts: {},
      bulkGrade: '',
      errorMessage: '',
      successMessage: ''
    }
  },
  computed: {
    seatMapId() {
      return this.$route.params.seatMapId
    }
  },
  watch: {
    seatMapId() {
      this.loadAll()
    },
    selectedSectionId() {
      this.loadDefinitions()
    }
  },
  created() {
    this.api = useApi()
    this.loadAll()
  },
  methods: {
    normalizeSeatMap(item) {
      return {
        id: item?.id,
        name: item?.name ?? '',
        venue_id: item?.venue_id ?? item?.venueId ?? item?.venue?.id,
        row_count: item?.row_count ?? item?.rowCount,
        col_count: item?.col_count ?? item?.colCount,
        version: item?.version ?? null,
        status: item?.status || 'DRAFT'
      }
    },
    normalizeSection(item) {
      return {
        id: item?.id,
        name: item?.name ?? '',
        displayColor: item?.displayColor ?? item?.display_color ?? '#FF5733',
        rows: item?.rows ?? item?.totalRow ?? item?.total_row,
        seatsPerRow: item?.seatsPerRow ?? item?.seats_per_row ?? item?.totalCol ?? item?.total_col,
        initialGrade: item?.initialGrade ?? item?.initial_grade ?? 'VIP'
      }
    },
    async loadAll() {
      if (this.seatMapId == null || this.seatMapId === '') {
        this.loading = false
        return
      }
      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''
      try {
        const detail = await this.api.get(ENDPOINTS.adminSeatMapDetail(this.seatMapId))
        this.seatMap = detail ? this.normalizeSeatMap(detail) : null
        this.seatMapNameDraft = this.seatMap?.name || ''
        await this.loadSections()
      } catch (err) {
        this.seatMap = null
        this.errorMessage = err.message || '좌석맵 정보를 불러오지 못했습니다.'
      } finally {
        this.loading = false
      }
    },
    async loadSections() {
      if (this.seatMapId == null || this.seatMapId === '') return
      try {
        const res = await this.api.get(ENDPOINTS.adminSeatSectionsBySeatMap(this.seatMapId))
        const list = Array.isArray(res) ? res : res?.content || res?.items || []
        this.sections = list.map(this.normalizeSection)
        if (!this.selectedSectionId || !this.sections.some((s) => String(s.id) === String(this.selectedSectionId))) {
          this.selectedSectionId = this.sections.length > 0 ? this.sections[0].id : null
        }
      } catch (err) {
        this.sections = []
      }
    },
    async loadDefinitions() {
      this.selectedDefinitionIds = []
      this.definitionGradeDrafts = {}
      if (!this.selectedSectionId) {
        this.seatDefinitions = []
        return
      }
      this.definitionsLoading = true
      try {
        const res = await this.api.get(ENDPOINTS.adminSeatDefinitionsBySection(this.selectedSectionId))
        const list = Array.isArray(res) ? res : res?.content || res?.items || []
        this.seatDefinitions = list
        list.forEach((item) => {
          const current = item?.gradeDefault ?? item?.grade_default ?? 'VIP'
          this.definitionGradeDrafts[item.id] = current
        })
      } catch (err) {
        this.seatDefinitions = []
      } finally {
        this.definitionsLoading = false
      }
    },
    async updateSeatMapName() {
      if (!this.seatMapNameDraft?.trim()) return
      this.savingSeatMapName = true
      this.errorMessage = ''
      this.successMessage = ''
      try {
        await this.api.patch(ENDPOINTS.adminUpdateSeatMapName(this.seatMapId), { name: this.seatMapNameDraft.trim() })
        this.successMessage = '좌석맵 이름이 수정되었습니다.'
        await this.loadAll()
      } catch (err) {
        this.errorMessage = err.message || '좌석맵 이름 수정에 실패했습니다.'
      } finally {
        this.savingSeatMapName = false
      }
    },
    async addSection() {
      this.addingSection = true
      this.errorMessage = ''
      this.successMessage = ''
      try {
        await this.api.post(ENDPOINTS.adminAddSeatMapSection(this.seatMapId), {
          name: `NEW-${Date.now().toString().slice(-4)}`,
          displayColor: '#33C3F0',
          totalRow: 5,
          totalCol: 10,
          rows: 5,
          seatsPerRow: 10,
          initialGrade: 'R'
        })
        this.successMessage = '섹션이 추가되었습니다.'
        await this.loadSections()
      } catch (err) {
        this.errorMessage = err.message || '섹션 추가에 실패했습니다.'
      } finally {
        this.addingSection = false
      }
    },
    startEditSection(section) {
      this.editingSectionId = section.id
      this.sectionDraft = {
        name: section.name || '',
        displayColor: section.displayColor || '#FF5733',
        rows: section.rows || 1,
        seatsPerRow: section.seatsPerRow || 1,
        initialGrade: section.initialGrade || 'VIP'
      }
    },
    cancelEditSection() {
      this.editingSectionId = null
    },
    async saveSection(sectionId) {
      this.errorMessage = ''
      this.successMessage = ''
      try {
        await this.api.put(ENDPOINTS.adminUpdateSeatSection(sectionId), {
          name: this.sectionDraft.name,
          displayColor: this.sectionDraft.displayColor,
          totalRow: Number(this.sectionDraft.rows),
          totalCol: Number(this.sectionDraft.seatsPerRow),
          rows: Number(this.sectionDraft.rows),
          seatsPerRow: Number(this.sectionDraft.seatsPerRow),
          initialGrade: this.sectionDraft.initialGrade
        })
        this.successMessage = '섹션이 수정되었습니다.'
        this.editingSectionId = null
        await this.loadSections()
      } catch (err) {
        this.errorMessage = err.message || '섹션 수정에 실패했습니다.'
      }
    },
    async deleteSection(sectionId) {
      this.deletingSectionId = sectionId
      this.errorMessage = ''
      this.successMessage = ''
      try {
        await this.api.del(ENDPOINTS.adminDeleteSeatSection(sectionId))
        this.successMessage = '섹션이 삭제되었습니다.'
        await this.loadSections()
        await this.loadDefinitions()
      } catch (err) {
        this.errorMessage = err.message || '섹션 삭제에 실패했습니다.'
      } finally {
        this.deletingSectionId = null
      }
    },
    toggleDefinitionSelection(definitionId) {
      const idx = this.selectedDefinitionIds.findIndex((id) => String(id) === String(definitionId))
      if (idx >= 0) {
        this.selectedDefinitionIds.splice(idx, 1)
      } else {
        this.selectedDefinitionIds.push(definitionId)
      }
    },
    toggleSelectAllDefinitions() {
      if (this.selectedDefinitionIds.length === this.seatDefinitions.length) {
        this.selectedDefinitionIds = []
      } else {
        this.selectedDefinitionIds = this.seatDefinitions.map((d) => d.id)
      }
    },
    async updateDefinitionGrade(definitionId) {
      const grade = this.definitionGradeDrafts[definitionId]
      if (!grade) return
      this.errorMessage = ''
      this.successMessage = ''
      try {
        await this.api.patch(ENDPOINTS.adminUpdateSeatDefinitionGrade(definitionId), { grade })
        this.successMessage = '좌석 등급이 수정되었습니다.'
        await this.loadDefinitions()
      } catch (err) {
        this.errorMessage = err.message || '좌석 등급 수정에 실패했습니다.'
      }
    },
    async applyBulkGrade() {
      if (!this.selectedSectionId || !this.bulkGrade) return
      const definitionIds = this.selectedDefinitionIds.length > 0
        ? this.selectedDefinitionIds
        : this.seatDefinitions.map((d) => d.id)
      if (definitionIds.length === 0) return
      this.errorMessage = ''
      this.successMessage = ''
      try {
        await this.api.patch(
          ENDPOINTS.adminBulkUpdateSeatDefinitionsGrade(this.selectedSectionId),
          { definitionIds, grade: this.bulkGrade }
        )
        this.successMessage = `좌석 ${definitionIds.length}건 등급이 변경되었습니다.`
        await this.loadDefinitions()
      } catch (err) {
        this.errorMessage = err.message || '좌석 등급 일괄 수정에 실패했습니다.'
      }
    }
  }
}
</script>
