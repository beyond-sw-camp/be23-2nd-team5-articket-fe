<template>
  <div class="space-y-6">
    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      불러오는 중…
    </div>

    <template v-else-if="item">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <UiButton variant="ghost" class="h-9 px-2 text-sm text-slate-600 -ml-2" @click="goBack">
          <ChevronLeft class="h-5 w-5 mr-0.5" />
          상세로
        </UiButton>
        <h1 class="text-xl font-bold text-slate-900">기본 정보 수정</h1>
      </div>

      <UiCard>
        <p class="mb-5 text-sm text-slate-600">{{ item.title }}</p>
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
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-slate-700">썸네일 이미지 URL</label>
            <input
              v-model="form.thumImgUrl"
              type="url"
              placeholder="https://..."
              class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
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
            <UiButton variant="ghost" type="button" @click="goBack">취소</UiButton>
            <UiButton as="button" type="submit" :disabled="saving">
              {{ saving ? '저장 중…' : '저장' }}
            </UiButton>
          </div>
        </form>
      </UiCard>
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
import EmptyState from '../../components/common/EmptyState.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { CONCERT_CATEGORY_OPTIONS } from '../../lib/constants/concertCategory'

export default {
  name: 'OrganizerConcertEditView',
  components: {
    ChevronLeft,
    UiCard,
    UiButton,
    EmptyState
  },
  computed: {
    categoryOptions() {
      return CONCERT_CATEGORY_OPTIONS
    }
  },
  data() {
    return {
      loading: false,
      item: null,
      form: { title: '', category: 'CONCERT', ageLimit: null, thumImgUrl: '', seatMapId: null },
      saving: false,
      api: null
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
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
          ageLimit: detail.ageLimit ?? detail.age_limit ?? null,
          seatMapId: detail.seatMapId ?? detail.seat_map_id ?? detail.concertSeatMapResDto?.id ?? null,
          thumImgUrl: detail.thumImgUrl ?? detail.thum_img_url ?? ''
        }
      } catch {
        this.item = null
      } finally {
        this.loading = false
      }
    },
    async submitUpdate() {
      const concertId = this.$route.params.concertId
      if (concertId == null || concertId === '' || !this.item) return
      this.saving = true
      try {
        const payload = {
          title: this.form.title,
          status: this.item.status ?? 'DRAFT',
          seatMapId: this.form.seatMapId,
          category: this.form.category ?? 'CONCERT',
          ageLimit: this.form.ageLimit != null && this.form.ageLimit !== '' ? Number(this.form.ageLimit) : 0,
        }
        if (this.form.thumImgUrl) {
          payload.thumImgUrl = this.form.thumImgUrl
        }
        await this.api.put(ENDPOINTS.organizerUpdateConcert(concertId), payload)
        this.$router.push(`/organizer/concerts/${concertId}`)
      } finally {
        this.saving = false
      }
    }
  }
}
</script>
