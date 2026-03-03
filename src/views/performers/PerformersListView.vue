<template>
  <div class="grid gap-4">
    <!-- 헤더 -->
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div class="text-lg font-bold text-slate-900">{{ canManage ? '아티스트 관리' : '아티스트' }}</div>
        <div class="mt-0.5 text-sm text-slate-500">이름으로 검색 · 목록</div>
      </div>
      <UiButton v-if="canManage" class="h-11 px-5" @click="openCreateModal">+ 아티스트 등록</UiButton>
    </div>

    <!-- 검색 -->
    <form class="flex gap-2" @submit.prevent="search">
      <input
        v-model="searchName"
        type="text"
        placeholder="아티스트 이름 검색"
        class="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
      />
      <UiButton type="submit" class="h-10 px-4 text-sm">검색</UiButton>
      <UiButton v-if="searchName" variant="ghost" class="h-10 px-3 text-sm" type="button" @click="clearSearch">초기화</UiButton>
    </form>

    <!-- 로딩 -->
    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
      불러오는 중…
    </div>

    <template v-else>
      <!-- 빈 상태 -->
      <div v-if="rows.length === 0" class="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
        {{ searchName ? `"${searchName}" 검색 결과가 없습니다.` : '등록된 아티스트가 없습니다.' }}
      </div>

      <!-- 순위 목록 -->
      <ul v-else class="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <li
          v-for="(row, idx) in rows"
          :key="row.id"
          class="flex items-center gap-4 px-4 py-3 transition hover:bg-slate-50"
        >
          <!-- 순위 -->
          <div class="w-8 shrink-0 text-center">
            <span
              class="text-base font-bold"
              :class="idx === 0 ? 'text-red-500' : idx === 1 ? 'text-orange-400' : idx === 2 ? 'text-yellow-500' : 'text-slate-400'"
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
              class="h-14 w-14 rounded-full object-cover border border-slate-200"
            />
            <div
              v-else
              class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-xl font-bold border border-slate-200"
            >
              {{ row.name?.charAt(0) ?? '?' }}
            </div>
          </div>

          <!-- 이름 + 정보 -->
          <div
            class="flex-1 min-w-0 cursor-pointer"
            @click="onRowClick(row)"
          >
            <div class="font-bold text-slate-900 truncate">{{ row.name }}</div>
            <div class="mt-0.5 text-sm font-medium text-green-600">
              좋아요 {{ row.likeCount.toLocaleString() }}명
            </div>
            <div v-if="row.birth" class="mt-0.5 text-xs text-slate-400">{{ row.birth }}</div>
            <div v-if="row.description" class="mt-0.5 text-xs text-slate-500 truncate">{{ row.description }}</div>
          </div>

          <!-- 좋아요 버튼 (USER만) -->
          <div v-if="canLike" class="shrink-0">
            <button
              class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition"
              :class="row.liked
                ? 'border-red-300 bg-red-50 text-red-500'
                : 'border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-400'"
              @click.stop="toggleLike(row)"
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

      <!-- 페이징 -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
        <UiButton variant="ghost" class="h-10 px-3" :disabled="page <= 0" @click="goPage(page - 1)">이전</UiButton>
        <span class="text-sm text-slate-600">{{ page + 1 }} / {{ totalPages }}</span>
        <UiButton variant="ghost" class="h-10 px-3" :disabled="page >= totalPages - 1" @click="goPage(page + 1)">다음</UiButton>
      </div>
    </template>

    <!-- 공연자 등록 모달 (canManage만) -->
    <UiModal v-if="canManage" :open="createModalOpen" title="아티스트 등록" @close="closeCreateModal">
      <form id="performer-create-form" class="grid gap-4" @submit.prevent="submitCreate">
        <div>
          <label class="block text-xs font-semibold text-slate-500">이름 (name) *</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="아티스트 또는 팀명"
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

    <!-- 아티스트 상세 모달 (관리자/주최자 전용) -->
    <UiModal v-if="canManage" :open="detailModalOpen" title="아티스트 상세" @close="closeDetail">
      <div v-if="detailLoading" class="text-sm text-slate-500">
        불러오는 중…
      </div>
      <div v-else-if="detailItem" class="grid gap-4">
        <div class="flex gap-4">
          <div class="shrink-0">
            <img
              v-if="detailItem.profileImgUrl"
              :src="detailItem.profileImgUrl"
              :alt="detailItem.name"
              class="h-20 w-16 rounded-xl object-cover border border-slate-200"
            />
            <div
              v-else
              class="flex h-20 w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-400 text-2xl font-bold border border-slate-200"
            >
              {{ detailItem.name?.charAt(0) ?? '?' }}
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-lg font-bold text-slate-900">{{ detailItem.name }}</div>
            <div v-if="detailItem.birth" class="mt-1 text-xs text-slate-500">생년월일: {{ detailItem.birth }}</div>
            <div class="mt-1 text-xs font-medium text-green-600">
              좋아요 {{ (detailItem.likeCount ?? 0).toLocaleString() }}명
            </div>
          </div>
        </div>
        <div v-if="detailItem.description" class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {{ detailItem.description }}
        </div>

        <!-- 간단 출연 공연 목록 -->
        <div v-if="detailItem.concerts && detailItem.concerts.length" class="mt-1 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div class="mb-1 text-xs font-semibold text-slate-600">
            출연 공연 (최근 {{ detailItem.concerts.length }}건)
          </div>
          <ul class="space-y-1">
            <li
              v-for="c in detailItem.concerts"
              :key="c.id"
              class="flex items-center justify-between gap-2 text-xs text-slate-700"
            >
              <div class="min-w-0 flex-1">
                <div class="truncate font-medium text-slate-900">
                  {{ c.title }}
                </div>
                <div v-if="c.venueName" class="truncate text-[11px] text-slate-500">
                  {{ c.venueName }}
                </div>
              </div>
              <div v-if="c.startDate" class="shrink-0 text-[11px] text-slate-400">
                {{ c.startDate }}
              </div>
            </li>
          </ul>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeDetail">닫기</UiButton>
          <UiButton v-if="detailItem" @click="goDetailPage">
            NEXTICKET 서비스에서 자세히 보기
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script>
import { Heart } from 'lucide-vue-next'
import UiButton from '../../components/common/UiButton.vue'
import UiModal from '../../components/common/UiModal.vue'
import { useApi } from '../../composables/useApi'
import { useRole } from '../../composables/useRole'
import { ENDPOINTS } from '../../lib/api/endpoints'

const PAGE_SIZE = 10

export default {
  name: 'PerformersListView',
  components: { Heart, UiButton, UiModal },
  props: {
    canManage: {
      type: Boolean,
      default: false
    }
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
      detailModalOpen: false,
      detailLoading: false,
      detailItem: null
    }
  },
  computed: {
    canLike() {
      const r = this.role?.value ?? this.role ?? 'GUEST'
      return r === 'USER' || r === 'MEMBER'
    }
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
          ENDPOINTS.performers({ name: this.searchName || undefined, page: this.page, size: PAGE_SIZE })
        )
        const content = res?.content ?? (Array.isArray(res) ? res : [])
        this.rows = content.map((item) => ({
          id: item.id,
          name: item.name ?? '-',
          profileImgUrl: item.profileImgUrl ?? null,
          description: item.description ?? '',
          birth: item.birth ?? null,
          likeCount: item.likeCount ?? 0,
          liked: item.liked ?? false
        }))
        this.totalPages = res?.totalPages ?? 1
        this.totalElements = res?.totalElements ?? this.rows.length
      } finally {
        this.loading = false
      }
    },
    onRowClick(row) {
      if (this.canManage) {
        this.openDetail(row.id)
      } else {
        this.$router.push(`/performers/${row.id}`)
      }
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
    async openDetail(id) {
      if (id == null || id === '') return
      this.detailModalOpen = true
      this.detailLoading = true
      this.detailItem = null
      try {
        const [detail, concertsRes] = await Promise.all([
          this.api.get(ENDPOINTS.performerDetail(id)),
          this.api.get(ENDPOINTS.performerConcerts(id)).catch(() => []),
        ])
        const concertsArr = Array.isArray(concertsRes) ? concertsRes : concertsRes?.content ?? concertsRes?.items ?? []
        const topConcerts = concertsArr.slice(0, 3).map((c) => ({
          id: c.id ?? c.concertId,
          title: c.title ?? c.concertTitle ?? '공연',
          venueName: c.venueName ?? null,
          startDate: c.startDate ?? c.date ?? null,
        }))
        this.detailItem = {
          id: detail.id,
          name: detail.name ?? '-',
          profileImgUrl: detail.profileImgUrl ?? null,
          description: detail.description ?? '',
          birth: detail.birth ?? null,
          likeCount: detail.likeCount ?? 0,
          concerts: topConcerts,
        }
      } catch (e) {
        console.warn('Load performer detail failed', e)
        this.detailItem = null
      } finally {
        this.detailLoading = false
      }
    },
    closeDetail() {
      this.detailModalOpen = false
      this.detailItem = null
    },
    goDetailPage() {
      const id = this.detailItem?.id
      if (!id) {
        this.closeDetail()
        return
      }
      this.closeDetail()
      // 관리자 컨텍스트에서도, NEXTICKET 사용자 상세 페이지로 라우팅
      this.$router.push(`/performers/${id}`)
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
