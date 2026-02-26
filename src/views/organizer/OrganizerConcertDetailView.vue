<template>
  <div class="grid gap-4">
    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
      불러오는 중…
    </div>
    <template v-else-if="item">
      <div class="flex items-end justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">공연 상세 / 수정</div>
          <div class="mt-1 text-sm text-slate-500">{{ item.title }}</div>
        </div>
        <div class="flex gap-2">
          <UiButton variant="ghost" class="h-11 px-4" @click="$router.push(`/organizer/concerts/${item.id}/policies`)">정책 설정</UiButton>
          <UiButton variant="ghost" class="h-11 px-4" @click="$router.push(`/organizer/concerts/${item.id}/schedules`)">회차 관리</UiButton>
          <UiButton variant="ghost" class="h-11 px-4" @click="$router.push(`/organizer/concerts/${item.id}/publish`)">게시하기</UiButton>
        </div>
      </div>

      <UiCard>
        <form class="grid gap-4" @submit.prevent="submitUpdate">
          <div>
            <label class="block text-xs font-semibold text-slate-500">공연 제목 *</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-500">상태</label>
              <select
                v-model="form.status"
                class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ENDED">ENDED</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500">관람 가능 연령</label>
              <input
                v-model.number="form.ageLimit"
                type="number"
                min="0"
                class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
          <p v-if="successMessage" class="text-sm text-green-600">{{ successMessage }}</p>
          <div class="flex justify-end gap-2">
            <UiButton variant="ghost" type="button" class="h-11 px-4" @click="load">취소</UiButton>
            <UiButton as="button" type="submit" class="h-11 px-5" :disabled="saving">저장</UiButton>
          </div>
        </form>
      </UiCard>

      <UiCard v-if="stats">
        <div class="text-sm font-semibold text-slate-900">판매 현황</div>
        <div class="mt-3 grid gap-3 sm:grid-cols-3">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div class="text-xs font-semibold text-slate-500">총 예매 수</div>
            <div class="mt-1 text-sm font-semibold text-slate-900">{{ stats.totalOrders ?? 0 }}</div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div class="text-xs font-semibold text-slate-500">총 매출</div>
            <div class="mt-1 text-sm font-semibold text-slate-900">₩{{ Number(stats.totalRevenue ?? 0).toLocaleString() }}</div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div class="text-xs font-semibold text-slate-500">회차 수</div>
            <div class="mt-1 text-sm font-semibold text-slate-900">{{ stats.scheduleCount ?? 0 }}</div>
          </div>
        </div>
      </UiCard>
    </template>
    <div v-else class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
      공연 정보를 불러올 수 없습니다.
    </div>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'OrganizerConcertDetailView',
  components: {
    UiCard,
    UiButton
  },
  data() {
    return {
      loading: false,
      item: null,
      stats: null,
      form: { title: '', status: 'DRAFT', ageLimit: null, seatMapId: null },
      saving: false,
      successMessage: '',
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
    async load() {
      const concertId = this.$route.params.concertId
      if (concertId == null || concertId === '') {
        this.loading = false
        return
      }
      this.loading = true
      this.successMessage = ''
      try {
        const [detail, statsRes] = await Promise.all([
          this.api.get(ENDPOINTS.concert(concertId)),
          this.api.get(ENDPOINTS.organizerConcertStats(concertId)).catch(() => null)
        ])
        this.item = detail
        this.stats = statsRes
        this.form = {
          title: detail.title ?? '',
          status: detail.status ?? 'DRAFT',
          ageLimit: detail.ageLimit ?? detail.age_limit ?? null,
          seatMapId: detail.seatMapId ?? detail.seat_map_id ?? null
        }
      } catch (err) {
        this.item = null
        // 에러는 ErrorAlertModal에서 표시됨
      } finally {
        this.loading = false
      }
    },
    async submitUpdate() {
      const concertId = this.$route.params.concertId
      if (concertId == null || concertId === '') return
      this.successMessage = ''
      this.saving = true
      try {
        const payload = {
          title: this.form.title,
          status: this.form.status,
          seatMapId: this.form.seatMapId
        }
        if (this.form.ageLimit != null && this.form.ageLimit !== '') {
          payload.ageLimit = Number(this.form.ageLimit)
        }
        await this.api.put(ENDPOINTS.organizerUpdateConcert(concertId), payload)
        this.successMessage = '저장되었습니다.'
        await this.load()
      } catch (err) {
        // 에러는 ErrorAlertModal에서 표시됨
      } finally {
        this.saving = false
      }
    }
  }
}
</script>
