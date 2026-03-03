<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div class="text-lg font-bold text-slate-900">공연자 관리</div>
        <div class="mt-0.5 text-sm text-slate-500">공연자 등록 · 목록 (ORGANIZER/ADMIN)</div>
      </div>
      <UiButton class="h-11 px-5" @click="openCreateModal">+ 공연자 등록</UiButton>
    </div>

    <!-- 검색 -->
    <form class="flex gap-2" @submit.prevent="search">
      <input
        v-model="searchName"
        type="text"
        placeholder="공연자 이름 검색"
        class="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
      />
      <UiButton type="submit" class="h-10 px-4 text-sm">검색</UiButton>
      <UiButton v-if="searchName" variant="ghost" class="h-10 px-3 text-sm" type="button" @click="clearSearch">초기화</UiButton>
    </form>

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <template v-else>
      <div v-if="rows.length === 0" class="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
        {{ searchName ? `"${searchName}" 검색 결과가 없습니다.` : '등록된 공연자가 없습니다.' }}
      </div>
      <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="row in rows"
          :key="row.id"
          class="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-red-300 hover:shadow"
          @click="$router.push(`/organizer/performers/${row.id}`)"
        >
          <div class="shrink-0">
            <img
              v-if="row.profileImgUrl"
              :src="row.profileImgUrl"
              :alt="row.name"
              class="h-12 w-12 rounded-full object-cover border border-slate-200"
            />
            <div
              v-else
              class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-lg font-bold border border-slate-200"
            >
              {{ row.name?.charAt(0) ?? '?' }}
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-semibold text-slate-900 truncate">{{ row.name }}</div>
            <div class="mt-1 text-xs text-slate-500 line-clamp-2">{{ row.description || '소개 없음' }}</div>
          </div>
        </div>
      </div>
    </template>

    <UiModal :open="createModalOpen" title="공연자 등록" @close="closeCreateModal">
      <form id="performer-create-form" class="grid gap-4" @submit.prevent="submitCreate">
        <div>
          <label class="block text-xs font-semibold text-slate-500">이름 (name) *</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="공연자 또는 팀명"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500">프로필 이미지 (profileImg)</label>
          <input
            ref="profileImgInput"
            type="file"
            accept="image/*"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500">소개 (description)</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="간단한 소개"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500">생년월일 (birth)</label>
          <input
            v-model="form.birth"
            type="date"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeCreateModal">취소</UiButton>
          <UiButton as="button" type="submit" form="performer-create-form">등록</UiButton>
        </div>
      </template>
    </UiModal>

  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiModal from '../../components/common/UiModal.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'OrganizerPerformersView',
  components: { UiCard, UiButton, UiModal },
  data() {
    return {
      api: null,
      rows: [],
      loading: false,
      searchName: '',
      createModalOpen: false,
      form: { name: '', description: '', birth: '' }
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  methods: {
    async search() {
      await this.load(this.searchName)
    },
    async clearSearch() {
      this.searchName = ''
      await this.load()
    },
    async load(name = '') {
      this.loading = true
      try {
        const res = await this.api.get(ENDPOINTS.performers({ size: 200, name: name || undefined }))
        const content = res?.content ?? (Array.isArray(res) ? res : [])
        this.rows = content.map((item) => ({
          id: item.id,
          name: item.name ?? '-',
          profileImgUrl: item.profileImgUrl ?? null,
          description: item.description ?? ''
        }))
      } finally {
        this.loading = false
      }
    },
    openCreateModal() {
      this.form = { name: '', description: '', birth: '' }
      this.createModalOpen = true
      this.$nextTick(() => {
        const input = this.$refs.profileImgInput
        if (input) input.value = ''
      })
    },
    closeCreateModal() {
      this.createModalOpen = false
    },
    async submitCreate() {
      try {
        const formData = new FormData()
        formData.append('name', this.form.name.trim())
        const desc = this.form.description?.trim()
        if (desc) formData.append('description', desc)
        const birth = this.form.birth
        if (birth) formData.append('birth', birth)
        const fileInput = this.$refs.profileImgInput
        if (fileInput?.files?.length) formData.append('profileImg', fileInput.files[0])
        const res = await this.api.post(ENDPOINTS.performerCreate(), formData)
        const createdId = res?.id
        const name = this.form.name.trim()
        this.closeCreateModal()

        // 회차 출연진 플로우에서 진입한 경우: 다시 회차 출연진 화면으로 이동하며 방금 생성한 공연자 자동 선택
        const from = this.$route.query?.from
        const scheduleId = this.$route.query?.scheduleId
        if (from === 'schedule' && scheduleId && createdId) {
          this.$router.push({
            path: `/organizer/schedules/${scheduleId}/performers`,
            query: {
              newPerformerId: createdId,
              newPerformerName: name
            }
          })
          return
        }

        // 일반 진입인 경우: 목록만 새로고침
        await this.load()
      } catch (err) {
        console.error('Performer create failed. Server response:', err.responseData)
        const data = err.responseData
        const msg =
          (typeof data === 'string' ? data : null) ||
          data?.message ||
          data?.error ||
          (data?.errors && Array.isArray(data.errors) ? data.errors.map((e) => e.defaultMessage || e.message).join(', ') : null) ||
          err.message
        // 에러는 ErrorAlertModal에서 표시됨
      }
    }
  }
}
</script>
