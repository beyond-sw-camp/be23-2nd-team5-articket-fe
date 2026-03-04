<template>
  <div class="grid gap-4">
    <!-- 헤더 -->
    <div class="flex items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">프로모션 배너 관리</h1>
        <p class="mt-1 text-sm text-slate-500">홈 히어로 배너를 등록하고 노출 순서를 관리합니다.</p>
      </div>
      <div class="flex items-center gap-2">
        <UiBadge tone="soft">ADMIN</UiBadge>
        <UiButton class="h-11 px-5" @click="openCreateModal">새 배너 추가</UiButton>
      </div>
    </div>

    <!-- 검색 바 -->
    <div class="flex items-center gap-2">
      <input
        v-model="keyword"
        type="text"
        placeholder="제목으로 검색…"
        class="h-9 w-64 rounded-xl border border-slate-200 px-3 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        @keydown.enter="search"
      />
      <UiButton class="h-9 px-4 text-sm" @click="search">검색</UiButton>
      <UiButton v-if="keyword" variant="ghost" class="h-9 px-3 text-sm" @click="clearSearch">초기화</UiButton>
    </div>

    <!-- 목록 테이블 -->
    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      목록을 불러오는 중…
    </div>
    <UiTable v-else :columns="columns" :rows="rows">
      <!-- 노출 순서 -->
      <template #cell:displayOrder="{ row }">
        <span class="font-mono text-sm font-semibold text-slate-700">{{ row.displayOrder }}</span>
      </template>

      <!-- 제목 -->
      <template #cell:title="{ row }">
        <span class="font-semibold text-slate-900">{{ row.title }}</span>
      </template>

      <!-- 메인 배너 미리보기 -->
      <template #cell:mainBannerUrl="{ row }">
        <a v-if="row.mainBannerUrl" :href="row.mainBannerUrl" target="_blank" rel="noopener" class="block">
          <img
            :src="row.mainBannerUrl"
            alt="메인 배너"
            class="h-10 w-24 rounded object-cover border border-slate-100 hover:opacity-80 transition-opacity"
            @error="e => e.target.style.display = 'none'"
          />
        </a>
        <span v-else class="text-xs text-slate-400">-</span>
      </template>

      <!-- 상세 이미지 미리보기 -->
      <template #cell:detailImageUrl="{ row }">
        <a v-if="row.detailImageUrl" :href="row.detailImageUrl" target="_blank" rel="noopener" class="block">
          <img
            :src="row.detailImageUrl"
            alt="상세 이미지"
            class="h-10 w-16 rounded object-cover border border-slate-100 hover:opacity-80 transition-opacity"
            @error="e => e.target.style.display = 'none'"
          />
        </a>
        <span v-else class="text-xs text-slate-400">-</span>
      </template>

      <!-- 액션 버튼 -->
      <template #cell:actions="{ row }">
        <div class="flex items-center gap-1">
          <UiButton variant="ghost" class="h-8 px-3 text-sm" @click="openEditModal(row)">수정</UiButton>
          <UiButton variant="ghost" class="h-8 px-3 text-sm text-red-500 hover:text-red-600" @click="deletePromotion(row)">삭제</UiButton>
        </div>
      </template>
    </UiTable>

    <!-- 페이지네이션 -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-1">
      <button
        class="h-8 w-8 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        :disabled="page === 0"
        @click="goPage(page - 1)"
      >‹</button>
      <button
        v-for="p in pageRange"
        :key="p"
        class="h-8 w-8 rounded-lg text-sm font-medium"
        :class="p === page ? 'bg-red-500 text-white' : 'text-slate-600 hover:bg-slate-100'"
        @click="goPage(p)"
      >{{ p + 1 }}</button>
      <button
        class="h-8 w-8 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        :disabled="page === totalPages - 1"
        @click="goPage(page + 1)"
      >›</button>
    </div>

    <!-- 등록 / 수정 모달 -->
    <UiModal :open="modalOpen" :title="editingId ? '배너 수정' : '새 배너 등록'" @close="closeModal">
      <form id="promotion-form" class="grid gap-5" @submit.prevent="submitForm">
        <!-- 제목 -->
        <div>
          <label class="block text-xs font-semibold text-slate-500">제목 (title) *</label>
          <input
            v-model="form.title"
            type="text"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="2025 여름 특가 프로모션"
            @keydown.enter.prevent
          />
        </div>

        <!-- 메인 배너 이미지 -->
        <div>
          <label class="block text-xs font-semibold text-slate-500">
            메인 배너 이미지
            <span v-if="!editingId" class="text-red-500"> *</span>
            <span v-else class="ml-1 font-normal text-slate-400">(새 파일 선택 시 교체)</span>
          </label>
          <input
            ref="mainBannerInput"
            type="file"
            accept="image/*"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-600 hover:file:bg-slate-200"
            @change="onMainBannerChange"
          />
          <div v-if="form.mainBannerPreview" class="mt-2 overflow-hidden rounded-xl border border-slate-100 bg-slate-50" style="height:80px">
            <img
              :src="form.mainBannerPreview"
              alt="메인 배너 미리보기"
              class="h-full w-full object-contain"
              @error="e => e.target.style.visibility = 'hidden'"
            />
          </div>
        </div>

        <!-- 상세 이미지 -->
        <div>
          <label class="block text-xs font-semibold text-slate-500">
            상세 이미지
            <span v-if="!editingId" class="text-red-500"> *</span>
            <span v-else class="ml-1 font-normal text-slate-400">(새 파일 선택 시 교체)</span>
          </label>
          <input
            ref="detailImageInput"
            type="file"
            accept="image/*"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-600 hover:file:bg-slate-200"
            @change="onDetailImageChange"
          />
          <div v-if="form.detailImagePreview" class="mt-2 overflow-hidden rounded-xl border border-slate-100 bg-slate-50" style="height:80px">
            <img
              :src="form.detailImagePreview"
              alt="상세 이미지 미리보기"
              class="h-full w-full object-contain"
              @error="e => e.target.style.visibility = 'hidden'"
            />
          </div>
        </div>

        <!-- 노출 순서 -->
        <div>
          <label class="block text-xs font-semibold text-slate-500">노출 순서 (displayOrder)</label>
          <input
            v-model.number="form.displayOrder"
            type="number"
            min="0"
            class="mt-1 w-32 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="0"
            @keydown.enter.prevent
          />
          <p class="mt-1 text-xs text-slate-400">낮을수록 먼저 노출됩니다 (기본값: 0)</p>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeModal">취소</UiButton>
          <UiButton as="button" type="submit" form="promotion-form" :disabled="submitting">
            {{ submitting ? '처리 중…' : (editingId ? '수정' : '등록') }}
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script>
import UiTable from '../../components/common/UiTable.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiModal from '../../components/common/UiModal.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

function defaultForm() {
  return {
    title: '',
    displayOrder: 0,
    mainBannerFile: null,
    mainBannerPreview: null,
    detailImageFile: null,
    detailImagePreview: null,
  }
}

export default {
  name: 'AdminPromotionsView',
  components: { UiTable, UiButton, UiBadge, UiModal },

  data() {
    return {
      columns: [
        { key: 'displayOrder',  label: '순서' },
        { key: 'title',         label: '제목' },
        { key: 'mainBannerUrl', label: '메인 배너' },
        { key: 'detailImageUrl',label: '상세 이미지' },
        { key: 'actions',       label: '관리' },
      ],
      rows: [],
      loading: false,

      // 검색 / 페이징
      keyword: '',
      page: 0,
      totalPages: 0,
      pageSize: 10,

      // 모달
      modalOpen: false,
      editingId: null,
      form: defaultForm(),
      submitting: false,

      _blobUrls: [],
      api: null,
    }
  },

  computed: {
    pageRange() {
      const start = Math.max(0, this.page - 2)
      const end = Math.min(this.totalPages - 1, start + 4)
      const pages = []
      for (let i = start; i <= end; i++) pages.push(i)
      return pages
    },
  },

  created() {
    this.api = useApi()
    this.load()
  },

  methods: {
    // ── 목록 로드 ─────────────────────────────────────────────────
    async load() {
      this.loading = true
      try {
        const res = await this.api.get(ENDPOINTS.promotions({
          keyword: this.keyword,
          page: this.page,
          size: this.pageSize,
          sort: 'displayOrder,asc',
        }))
        this.rows = res.content ?? (Array.isArray(res) ? res : [])
        this.totalPages = res.totalPages ?? 1
      } catch (err) {
        alert('목록을 불러오는 데 실패했습니다.')
      } finally {
        this.loading = false
      }
    },

    // ── 검색 ──────────────────────────────────────────────────────
    search() {
      this.page = 0
      this.load()
    },
    clearSearch() {
      this.keyword = ''
      this.page = 0
      this.load()
    },

    // ── 페이지 이동 ───────────────────────────────────────────────
    goPage(p) {
      this.page = p
      this.load()
    },

    // ── 파일 선택 핸들러 ──────────────────────────────────────────
    onMainBannerChange(e) {
      const file = e.target.files?.[0]
      if (!file) return
      this._revokeBlobUrl(this.form.mainBannerPreview)
      this.form.mainBannerFile = file
      const blobUrl = URL.createObjectURL(file)
      this._blobUrls.push(blobUrl)
      this.form.mainBannerPreview = blobUrl
    },
    onDetailImageChange(e) {
      const file = e.target.files?.[0]
      if (!file) return
      this._revokeBlobUrl(this.form.detailImagePreview)
      this.form.detailImageFile = file
      const blobUrl = URL.createObjectURL(file)
      this._blobUrls.push(blobUrl)
      this.form.detailImagePreview = blobUrl
    },
    _revokeBlobUrl(url) {
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
    },

    // ── 등록 모달 ─────────────────────────────────────────────────
    openCreateModal() {
      this.editingId = null
      this.form = defaultForm()
      this.modalOpen = true
    },

    // ── 수정 모달 ─────────────────────────────────────────────────
    openEditModal(row) {
      this.editingId = row.id
      this.form = {
        title: row.title ?? '',
        displayOrder: row.displayOrder ?? 0,
        mainBannerFile: null,
        mainBannerPreview: row.mainBannerUrl ?? null,
        detailImageFile: null,
        detailImagePreview: row.detailImageUrl ?? null,
      }
      this.modalOpen = true
    },

    closeModal() {
      this._blobUrls.forEach(url => URL.revokeObjectURL(url))
      this._blobUrls = []
      this.modalOpen = false
      this.editingId = null
    },

    // ── 등록 / 수정 제출 ──────────────────────────────────────────
    async submitForm() {
      if (!this.editingId && !this.form.mainBannerFile) {
        alert('메인 배너 이미지를 선택해 주세요.')
        return
      }
      if (!this.editingId && !this.form.detailImageFile) {
        alert('상세 이미지를 선택해 주세요.')
        return
      }

      this.submitting = true
      try {
        const promotionBlob = new Blob(
          [JSON.stringify({ title: this.form.title, displayOrder: this.form.displayOrder ?? 0 })],
          { type: 'application/json' }
        )
        const fd = new FormData()
        fd.append('promotion', promotionBlob)
        if (this.form.mainBannerFile) fd.append('mainBannerImage', this.form.mainBannerFile)
        if (this.form.detailImageFile) fd.append('detailImage', this.form.detailImageFile)

        if (this.editingId) {
          await this.api.post(ENDPOINTS.updatePromotion(this.editingId), fd)
        } else {
          await this.api.post(ENDPOINTS.createPromotion(), fd)
        }
        alert('성공적으로 처리되었습니다.')
        this.closeModal()
        await this.load()
      } catch (err) {
        alert(err?.message ?? '처리 중 오류가 발생했습니다.')
      } finally {
        this.submitting = false
      }
    },

    // ── 삭제 ──────────────────────────────────────────────────────
    async deletePromotion(row) {
      if (!window.confirm(`"${row.title}" 배너를 삭제하시겠습니까?`)) return
      try {
        await this.api.del(ENDPOINTS.deletePromotion(row.id))
        alert('성공적으로 처리되었습니다.')
        await this.load()
      } catch (err) {
        alert(err?.message ?? '삭제 중 오류가 발생했습니다.')
      }
    },
  },
}
</script>
