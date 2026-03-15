<template>
  <div class="space-y-6">
    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      불러오는 중…
    </div>

    <template v-else-if="item">
      <!-- Step Indicator (Only during creation flow) -->
      <div
        v-if="fromCreate"
        class="rounded-2xl border border-slate-100 bg-white px-6 pb-12 pt-6 shadow-sm"
      >
        <StepIndicator :steps="['기본 정보', '가격 정책', '구매 수량 정책', '회차 등록']" :active="0" />
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3" v-if="!fromCreate">
        <UiButton
          variant="ghost"
          class="h-9 px-2 text-sm text-slate-600 -ml-2"
          @click="goBack"
        >
          <ChevronLeft class="h-5 w-5 mr-0.5" />
          상세로
        </UiButton>
        <h1 class="mgmt-page-title">기본 정보 수정</h1>
      </div>

      <!-- Main card: 제목/뱃지/폼 -->
      <UiCard>
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <div class="mgmt-section-title">기본 정보</div>
              <UiBadge tone="soft">ORGANIZER</UiBadge>
            </div>
            <p class="mt-1 text-sm text-slate-500">
              공연 제목, 카테고리, 게시 상태, 관람 연령을 설정합니다.
            </p>
          </div>
          <p class="hidden text-sm font-medium text-slate-700 sm:block">
            {{ item.title }}
          </p>
        </div>
        <form class="grid gap-5 sm:grid-cols-2" @submit.prevent="submitUpdate">
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-slate-700">공연 제목</label>
            <input
              v-model="form.title"
              type="text"
              required
              placeholder="공연 제목을 입력하세요"
              class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div class="sm:col-span-2 space-y-2">
            <label class="block text-sm font-medium text-slate-700">썸네일 이미지</label>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div class="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  class="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-600 hover:file:bg-slate-200"
                  @change="onThumbFileChange"
                />
                <p class="mt-1 text-xs text-slate-400">
                  새 파일을 선택하면 기존 썸네일이 교체됩니다. 선택하지 않으면 현재 이미지를 유지합니다.
                </p>
              </div>
              <div v-if="thumbPreview" class="shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                <img
                  :src="thumbPreview"
                  alt="썸네일 미리보기"
                  class="h-20 w-32 object-cover"
                  @error="$event.target.style.visibility='hidden'"
                />
              </div>
            </div>
          </div>
          <div class="sm:col-span-2 space-y-2">
            <label class="block text-sm font-medium text-slate-700">상세 이미지 (다중)</label>
            <div class="space-y-4">
              <!-- 기존 상세 이미지 목록 -->
              <div v-if="existingDetailImgUrls.length > 0" class="flex flex-wrap gap-3">
                <div v-for="(url, idx) in existingDetailImgUrls" :key="url" class="relative group">
                  <div class="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    <img :src="url" class="h-24 w-40 object-cover" />
                  </div>
                  <button
                    type="button"
                    class="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg group-hover:flex"
                    @click="removeExistingDetailImg(idx)"
                  >
                    ✕
                  </button>
                  <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none">
                    <span class="text-[10px] text-white font-bold">기존 이미지</span>
                  </div>
                </div>
              </div>

              <!-- 새 상세 이미지 업로드 -->
              <div class="flex flex-col gap-2 sm:flex-row sm:items-start">
                <div class="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    class="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-600 hover:file:bg-slate-200"
                    @change="onDetailFilesChange"
                  />
                  <p class="mt-1 text-xs text-slate-400">
                    추가할 상세 이미지를 선택해 주세요.
                  </p>
                </div>
              </div>

              <!-- 새 상세 이미지 미리보기 -->
              <div v-if="detailPreviews.length > 0" class="flex flex-wrap gap-3">
                <div v-for="(p, idx) in detailPreviews" :key="idx" class="relative group">
                  <div class="overflow-hidden rounded-xl border border-blue-100 bg-blue-50">
                    <img :src="p" class="h-24 w-40 object-cover" />
                  </div>
                  <button
                    type="button"
                    class="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg group-hover:flex"
                    @click="removeDetailFile(idx)"
                  >
                    ✕
                  </button>
                  <div class="absolute inset-0 flex items-center justify-center bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none">
                    <span class="text-[10px] text-white font-bold">새 이미지</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">카테고리</label>
            <select
              v-model="form.category"
              class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">게시 상태</label>
            <select
              v-model="form.status"
              required
              class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="DRAFT">초안 (임시 저장)</option>
              <option value="UPCOMING">오픈 대기 (정보 공개)</option>
              <option value="AVAILABLE">예매 가능</option>
              <option value="CLOSED">예매 마감</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">관람 연령</label>
            <input
              v-model.number="form.ageLimit"
              type="number"
              min="0"
              placeholder="0 = 전체관람가"
              class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div class="flex justify-end gap-2 sm:col-span-2 pt-1">
            <UiButton v-if="!fromCreate" variant="ghost" type="button" @click="goBack">
              취소
            </UiButton>
            <UiButton as="button" type="submit" :disabled="saving">
              {{ saving ? '저장 중…' : '저장' }}
            </UiButton>
          </div>
        </form>
      </UiCard>

      <!-- Creation flow footer: step navigation -->
      <div
        v-if="fromCreate"
        class="fixed bottom-6 left-64 right-0 z-50 flex justify-center px-6 pointer-events-none"
      >
        <div
          class="pointer-events-auto flex w-full max-w-4xl items-center justify-between rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-2xl backdrop-blur-md"
        >
          <UiButton
            variant="ghost"
            class="h-11 px-6 text-sm text-slate-600"
            @click="$router.push('/organizer/concerts')"
          >
            <- 이전 (목록)
          </UiButton>
          <UiButton
            class="h-11 px-8 font-bold shadow-sm"
            :disabled="saving"
            @click="submitUpdate"
          >
            다음: 가격 정책 ->
          </UiButton>
        </div>
      </div>
    </template>

    <EmptyState v-else title="공연을 찾을 수 없습니다" description="존재하지 않거나 권한이 없을 수 있습니다.">
      <UiButton class="mt-3" @click="$router.push('/organizer/concerts')">목록으로</UiButton>
    </EmptyState>
  </div>
</template>

<script>
import { ChevronLeft } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import StepIndicator from '../../components/common/StepIndicator.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { CONCERT_CATEGORY_OPTIONS } from '../../lib/constants/concertCategory'

export default {
  name: 'OrganizerConcertEditView',
  components: {
    ChevronLeft,
    UiCard,
    UiButton,
    UiBadge,
    EmptyState,
    StepIndicator
  },
  computed: {
    categoryOptions() {
      return CONCERT_CATEGORY_OPTIONS
    },
    fromCreate() {
      return this.$route.query?.from === 'create'
    }
  },
  data() {
    return {
      loading: false,
      item: null,
      form: { title: '', category: 'CONCERT', status: 'DRAFT', ageLimit: null, thumImgUrl: '', seatMapId: null },
      saving: false,
      api: null,
      thumbFile: null,
      thumbPreview: null,
      detailFiles: [],
      detailPreviews: [],
      existingDetailImgUrls: [],
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  beforeUnmount() {
    if (this.thumbPreview && this.thumbPreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.thumbPreview)
    }
    this.detailPreviews.forEach(p => {
      if (p.startsWith('blob:')) URL.revokeObjectURL(p)
    })
  },
  methods: {
    goBack() {
      const id = this.$route.params.concertId
      this.$router.push(id ? `/organizer/concerts/${id}` : '/organizer/concerts')
    },
    async load() {
      const concertId = this.$route.params.concertId
      if (concertId == null || concertId === '') {
        this.loading = false
        return
      }
      this.loading = true
      try {
        const detail = await this.api.get(ENDPOINTS.concert(concertId))
        this.item = detail
        this.form = {
          title: detail.title ?? '',
          category: detail.category ?? 'CONCERT',
          status: detail.status ?? 'DRAFT',
          ageLimit: detail.ageLimit ?? detail.age_limit ?? null,
          seatMapId: detail.seatMapId ?? detail.seat_map_id ?? detail.concertSeatMapResDto?.id ?? null,
          thumImgUrl: detail.thumImgUrl ?? detail.thum_img_url ?? ''
        }
        this.thumbPreview = this.form.thumImgUrl || null
        this.existingDetailImgUrls = detail.detailImgUrls ?? []
      } catch {
        this.item = null
      } finally {
        this.loading = false
      }
    },
    onThumbFileChange(e) {
      const file = e.target.files?.[0]
      if (!file) {
        this.thumbFile = null
        // 기존 썸네일 유지
        this.thumbPreview = this.form.thumImgUrl || null
        return
      }
      this.thumbFile = file
      if (this.thumbPreview && this.thumbPreview.startsWith('blob:')) {
        URL.revokeObjectURL(this.thumbPreview)
      }
      this.thumbPreview = URL.createObjectURL(file)
    },
    onDetailFilesChange(e) {
      const files = Array.from(e.target.files || [])
      if (!files.length) return

      files.forEach(file => {
        this.detailFiles.push(file)
        this.detailPreviews.push(URL.createObjectURL(file))
      })
    },
    removeDetailFile(idx) {
      const p = this.detailPreviews[idx]
      if (p && p.startsWith('blob:')) URL.revokeObjectURL(p)
      this.detailFiles.splice(idx, 1)
      this.detailPreviews.splice(idx, 1)
    },
    removeExistingDetailImg(idx) {
      this.existingDetailImgUrls.splice(idx, 1)
    },
    async submitUpdate() {
      const concertId = this.$route.params.concertId
      if (concertId == null || concertId === '' || !this.item) return
      this.saving = true

      // dto (JSON) 상세 구조
      const dto = {
        title: this.form.title,
        category: this.form.category ?? 'CONCERT',
        status: this.form.status || 'DRAFT',
        ageLimit: (this.form.ageLimit != null && this.form.ageLimit !== '')
          ? Number(this.form.ageLimit)
          : 0,
        seatMapId: (this.form.seatMapId != null && this.form.seatMapId !== '')
          ? Number(this.form.seatMapId)
          : null,
        detailImgUrls: this.existingDetailImgUrls // 기존에 유지할 이미지 URL 리스트
      }

      try {
        // multipart/form-data payload
        const fd = new FormData()
        fd.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }))

        // 새 파일을 선택한 경우에만 'newThumImg'로 교체
        if (this.thumbFile) {
          fd.append('newThumImg', this.thumbFile)
        }

        // 새 상세 이미지들 추가
        if (this.detailFiles.length > 0) {
          this.detailFiles.forEach(file => {
            fd.append('detailImgs', file)
          })
        }

        await this.api.put(ENDPOINTS.organizerUpdateConcert(concertId), fd)
        
        if (this.fromCreate) {
          this.$router.push(`/organizer/concerts/${concertId}/policies?from=create`)
        } else {
          this.$router.push(`/organizer/concerts/${concertId}`)
        }
      } catch (err) {
        console.error('Failed to update concert:', err)
      } finally {
        this.saving = false
      }
    }
  }
}
</script>
