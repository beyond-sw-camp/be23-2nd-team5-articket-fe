<template>
  <div class="mx-auto space-y-6 pb-12">
    <!-- 헤더 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">{{ canManage ? '아티스트 관리' : '아티스트' }}</h1>
        <p class="mt-1 text-sm text-slate-500">이름으로 검색 · 목록</p>
      </div>
      <button
        v-if="canManage"
        type="button"
        class="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
        @click="openCreateModal"
      >
        + 아티스트 등록
      </button>
    </div>

    <!-- 검색 -->
    <form class="flex gap-2" @submit.prevent="search">
      <input
        v-model="searchName"
        type="text"
        placeholder="아티스트 이름 검색"
        class="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
      />
      <button
        type="submit"
        class="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        검색
      </button>
      <button
        v-if="searchName"
        type="button"
        class="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        @click="clearSearch"
      >
        초기화
      </button>
    </form>

    <!-- 로딩 -->
    <div
      v-if="loading"
      class="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white py-12"
    >
      <div class="flex flex-col items-center gap-3 text-slate-500">
        <svg
          class="h-8 w-8 animate-spin text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span class="text-sm">불러오는 중…</span>
      </div>
    </div>

    <template v-else>
      <!-- 빈 상태 -->
      <div v-if="rows.length === 0" class="rounded-2xl border border-slate-200 bg-white py-16 text-center">
        <p class="text-sm text-slate-500">
          {{ searchName ? `"${searchName}" 검색 결과가 없습니다.` : '등록된 아티스트가 없습니다.' }}
        </p>
        <button
          v-if="searchName"
          type="button"
          class="mt-4 inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          @click="clearSearch"
        >
          검색 초기화
        </button>
      </div>

      <!-- 목록 -->
      <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ul class="divide-y divide-slate-100">
          <li
            v-for="(row, idx) in rows"
            :key="row.id"
            class="flex cursor-pointer items-center gap-4 px-4 py-4 transition hover:bg-slate-50 sm:px-5"
            @click="onRowClick(row)"
          >
            <!-- 순위 -->
            <div class="w-8 shrink-0 text-center">
              <span
                class="text-base font-bold"
                :class="idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-400'"
              >
                {{ page * pageSize + idx + 1 }}
              </span>
            </div>

            <!-- 프로필 이미지 -->
            <div class="shrink-0">
              <img
                v-if="row.profileImgUrl"
                :src="row.profileImgUrl"
                :alt="row.name"
                class="h-14 w-14 rounded-full border border-slate-200 object-cover"
              />
              <div
                v-else
                class="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xl font-bold text-slate-400"
              >
                {{ row.name?.charAt(0) ?? '?' }}
              </div>
            </div>

            <!-- 이름 + 정보 -->
            <div class="min-w-0 flex-1">
              <div class="truncate font-bold text-slate-900">{{ row.name }}</div>
              <div class="mt-0.5 text-sm font-medium text-emerald-600">
                좋아요 {{ row.likeCount.toLocaleString() }}명
              </div>
              <div v-if="row.birth" class="mt-0.5 text-xs text-slate-400">{{ row.birth }}</div>
              <div v-if="row.description" class="mt-0.5 truncate text-xs text-slate-500">{{ row.description }}</div>
            </div>

            <!-- 좋아요 버튼 (USER만) -->
            <div v-if="canLike" class="shrink-0" @click.stop>
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                :class="row.liked
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'"
                @click="toggleLike(row)"
              >
                <Heart
                  class="h-3.5 w-3.5"
                  :class="{ 'fill-red-500 text-red-500': row.liked }"
                />
                {{ row.liked ? '좋아요 취소' : '좋아요' }}
              </button>
            </div>
          </li>
        </ul>
      </div>

      <!-- 페이징 -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-50"
          :disabled="page <= 0"
          @click="goPage(page - 1)"
        >
          이전
        </button>
        <span class="text-sm text-slate-600">{{ page + 1 }} / {{ totalPages }}</span>
        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-50"
          :disabled="page >= totalPages - 1"
          @click="goPage(page + 1)"
        >
          다음
        </button>
      </div>
    </template>

    <!-- 아티스트 등록 모달 (canManage만) -->
    <Teleport to="body">
      <div
        v-if="canManage && createModalOpen"
        class="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
      >
        <div
          class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          aria-hidden="true"
          @click="closeCreateModal"
        />
        <div class="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div class="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 class="text-sm font-semibold text-slate-900">아티스트 등록</h2>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              @click="closeCreateModal"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
          <form
            id="performer-create-form"
            class="flex min-h-0 flex-1 flex-col overflow-y-auto"
            @submit.prevent="submitCreate"
          >
            <div class="space-y-4 px-4 py-4">
              <div>
                <label class="block text-xs font-semibold text-slate-500">이름 (name) *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="아티스트 또는 팀명"
                  class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500">프로필 이미지 (profileImg)</label>
                <input
                  ref="profileImgInput"
                  type="file"
                  accept="image/*"
                  class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500">소개 (description)</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  placeholder="간단한 소개"
                  class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500">생년월일 (birth)</label>
                <input
                  v-model="form.birth"
                  type="date"
                  class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>
            <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
              <button
                type="button"
                class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                @click="closeCreateModal"
              >
                취소
              </button>
              <button
                type="submit"
                form="performer-create-form"
                class="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                등록
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { Heart, X } from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { useRole } from '../../composables/useRole'
import { ENDPOINTS } from '../../lib/api/endpoints'

const PAGE_SIZE = 10

export default {
  name: 'PerformersListView',
  components: { Heart, X },
  props: {
    canManage: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      api: null,
      role: null,
      rows: [],
      loading: false,
      searchName: '',
      page: 0,
      pageSize: PAGE_SIZE,
      totalPages: 0,
      totalElements: 0,
      createModalOpen: false,
      form: { name: '', description: '', birth: '' },
    }
  },
  computed: {
    canLike() {
      const r = this.role?.value ?? this.role ?? 'GUEST'
      return r === 'USER' || r === 'MEMBER'
    },
  },
  created() {
    this.api = useApi()
    const { role } = useRole()
    this.role = role
    this.searchName = this.$route.query.name || ''
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const res = await this.api.get(
          ENDPOINTS.performers({ name: this.searchName || undefined, page: this.page, size: PAGE_SIZE }),
        )
        const content = res?.content ?? (Array.isArray(res) ? res : [])
        this.rows = content.map((item) => ({
          id: item.id,
          name: item.name ?? '-',
          profileImgUrl: item.profileImgUrl ?? null,
          description: item.description ?? '',
          birth: item.birth ?? null,
          likeCount: item.likeCount ?? 0,
          liked: item.liked ?? false,
        }))
        this.totalPages = res?.totalPages ?? 1
        this.totalElements = res?.totalElements ?? this.rows.length
      } finally {
        this.loading = false
      }
    },
    onRowClick(row) {
      if (this.canManage) {
        this.$router.push(`/organizer/performers/${row.id}`)
        return
      }
      this.$router.push(`/performers/${row.id}`)
    },
    search() {
      this.page = 0
      this.$router.replace({ query: { ...this.$route.query, name: this.searchName || undefined } }).catch(() => {})
      this.load()
    },
    clearSearch() {
      this.searchName = ''
      this.page = 0
      this.load()
    },
    goPage(p) {
      if (p < 0 || p >= this.totalPages) return
      this.page = p
      this.load()
    },
    async toggleLike(row) {
      const id = row?.id
      if (id == null || id === '') return
      try {
        if (row.liked) {
          await this.api.del(ENDPOINTS.performerDeleteLike(id))
          row.liked = false
          if (row.likeCount != null) row.likeCount--
        } else {
          await this.api.post(ENDPOINTS.performerLike(id))
          row.liked = true
          if (row.likeCount != null) row.likeCount++
        }
      } catch (e) {
        console.warn('Like toggle failed', e)
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
        await this.api.post(ENDPOINTS.performerCreate(), formData)
        this.closeCreateModal()
        await this.load()
      } catch (err) {
        console.error('Performer create failed. Server response:', err.responseData)
      }
    },
  },
}
</script>
