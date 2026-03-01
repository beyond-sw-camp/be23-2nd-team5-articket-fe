<template>
  <div class="grid gap-6">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <template v-else-if="item">
      <!-- ── 헤더: 공연 제목 ── -->
      <div class="text-2xl font-bold text-slate-900">{{ item.title }}</div>

      <!-- ── 메인: 포스터 | 상세정보 | 예매 위젯 ── -->
      <div class="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
        <!-- 왼쪽: 포스터 + 좋아요 -->
        <div class="flex flex-col">
          <div class="overflow-hidden rounded-2xl border border-slate-200">
            <img
              class="aspect-[3/4] w-full object-cover"
              :src="item.posterUrl"
              :alt="item.title"
            />
          </div>
          <button
            type="button"
            :disabled="liking"
            class="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            :class="isLiked ? 'border-red-300 bg-red-50 !text-red-600' : ''"
            @click="toggleLike"
          >
            <Heart
              class="h-4 w-4"
              :class="isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'"
            />
            {{ stats ? stats.likeCount : 0 }}
          </button>
        </div>

        <!-- 가운데: 상세 정보 -->
        <div class="space-y-4">
          <!-- 장소 -->
          <div>
            <div class="text-xs font-semibold text-slate-500">장소</div>
            <button
              type="button"
              class="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-900 hover:underline"
              @click="venueModalOpen = true"
            >
              {{ item.venue?.name }}
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
          <!-- 공연기간 -->
          <div>
            <div class="text-xs font-semibold text-slate-500">공연기간</div>
            <div class="mt-1 text-sm font-semibold text-slate-900">{{ performancePeriod }}</div>
          </div>
          <!-- 관람연령 -->
          <div>
            <div class="text-xs font-semibold text-slate-500">관람연령</div>
            <div class="mt-1 text-sm font-semibold text-slate-900">{{ ageRestrictionLabel }}</div>
          </div>
          <!-- 가격 -->
          <div>
            <div class="text-xs font-semibold text-slate-500">가격</div>
            <div class="mt-1 text-sm">
              <template v-if="priceRows.length > 0">
                <div
                  v-for="row in priceRows"
                  :key="row.grade"
                  class="font-semibold text-slate-900"
                >
                  {{ row.grade }}석 {{ Number(row.price).toLocaleString() }}원
                </div>
              </template>
              <template v-else>
                <span class="font-semibold text-slate-900">{{ item.priceRange || priceSummary }}</span>
              </template>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="(item.tags || []).length" class="flex flex-wrap gap-2 pt-2">
            <UiBadge v-for="t in item.tags" :key="t" tone="outline">{{ t }}</UiBadge>
          </div>
        </div>

        <!-- 오른쪽: 예매 위젯 -->
        <div class="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <!-- 관람일 -->
          <div class="mb-4">
            <div class="mb-3 flex items-center justify-between">
              <span class="text-sm font-semibold text-slate-900">관람일</span>
              <ChevronUp class="h-4 w-4 text-slate-400" />
            </div>
            <ConcertCalendar
              v-if="availableDates.length > 0"
              v-model="selectedDateKey"
              :available-dates="availableDates"
              :schedules-by-date="schedulesByDate"
              class="concert-calendar--detail"
              @select-schedule="onSelectSchedule"
            />
            <div v-else class="rounded-xl border border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500">
              등록된 회차가 없습니다
            </div>
          </div>

          <!-- 회차 (날짜 선택 시 표시) -->
          <div v-if="selectedSlots.length > 0" class="mb-4">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-semibold text-slate-900">회차</span>
              <ChevronUp class="h-4 w-4 text-slate-400" />
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(slot, idx) in selectedSlots"
                :key="slot.scheduleId"
                type="button"
                :class="[
                  'rounded-xl border px-4 py-2.5 text-sm font-semibold transition',
                  selectedScheduleId === slot.scheduleId
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : slot.status === 'OPEN'
                      ? 'border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-blue-50'
                      : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                ]"
                :disabled="slot.status !== 'OPEN'"
                @click="selectedScheduleId = slot.scheduleId"
              >
                {{ idx + 1 }}회 {{ formatSlotTime(slot.playTime) }}
              </button>
            </div>
          </div>

          <!-- 예매하기 -->
          <UiButton
            class="mt-auto h-12 w-full rounded-xl text-base font-semibold"
            :disabled="!canBook"
            @click="goToBooking"
          >
            예매하기
          </UiButton>
        </div>
      </div>

      <!-- ── 탭: 공연정보 | 구매평 ── -->
      <div class="space-y-4">
        <UiTabs v-model="activeTab" :tabs="tabItems" />

        <!-- 공연정보 탭 -->
        <div v-show="activeTab === 'info'" class="space-y-6">
          <div v-if="item.description" class="rounded-xl border border-slate-200 bg-white p-4">
            <div class="text-sm text-slate-700">{{ item.description }}</div>
          </div>
          <!-- 공연시간 정보 -->
          <div>
            <div class="mb-2 text-sm font-semibold text-slate-900">공연시간 정보</div>
            <ul class="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <li
                v-for="s in schedules"
                :key="s.id"
                class="text-sm text-slate-700"
              >
                {{ formatScheduleDateTime(s.play_time) }}
              </li>
              <li v-if="schedules.length === 0" class="text-sm text-slate-500">
                등록된 공연 시간이 없습니다.
              </li>
            </ul>
          </div>
          <!-- 공지사항 -->
          <div>
            <div class="mb-2 text-sm font-semibold text-slate-900">공지사항</div>
            <ul class="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <li>※ 공연 정보는 변경될 수 있으니 예매 전 반드시 확인해 주세요.</li>
              <li>※ 예매 전 관람 연령, 공연 시간 등을 다시 한 번 확인해 주세요.</li>
            </ul>
          </div>
          <!-- 휠체어석 예매 안내 -->
          <div>
            <div class="mb-2 text-sm font-semibold text-slate-900">[휠체어석 예매 안내]</div>
            <div class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              휠체어석은 전화 예매로만 이용 가능합니다. 고객센터(1544-0000) 영업시간: 평일 09:00 ~ 18:00
            </div>
          </div>
        </div>

        <!-- 구매평 탭 -->
        <div v-show="activeTab === 'reviews'">
          <!-- 내 후기 작성 (로그인 시) -->
          <UiCard v-if="authed" class="mb-4">
            <div class="text-sm font-semibold text-slate-900">내 후기</div>
            <form class="mt-3 grid gap-3" @submit.prevent="submitReview">
              <div>
                <label class="block text-xs font-semibold text-slate-500">평점 *</label>
                <div class="mt-1.5 flex gap-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    class="transition"
                    @click="myReview.rating = n"
                  >
                    <Star
                      class="h-6 w-6"
                      :class="n <= myReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'"
                    />
                  </button>
                  <span class="ml-2 self-center text-sm text-slate-500">
                    {{ myReview.rating > 0 ? `${myReview.rating}점` : '별점을 선택해주세요' }}
                  </span>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500">후기</label>
                <textarea
                  v-model="myReview.reviewContent"
                  maxlength="1000"
                  rows="3"
                  placeholder="공연에 대한 솔직한 후기를 남겨주세요."
                  class="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <div class="mt-0.5 text-right text-xs text-slate-400">{{ myReview.reviewContent.length }}/1000</div>
              </div>
              <p v-if="reviewError" class="text-sm text-red-600">{{ reviewError }}</p>
              <p v-if="reviewSuccess" class="text-sm text-green-600">{{ reviewSuccess }}</p>
              <div class="flex justify-end">
                <UiButton as="button" type="submit" :disabled="submittingReview || myReview.rating === 0">
                  저장
                </UiButton>
              </div>
            </form>
          </UiCard>

          <!-- 관람 후기 목록 -->
          <UiCard>
            <div class="flex items-center justify-between">
              <div class="text-sm font-semibold text-slate-900">
                관람 후기
                <span v-if="stats" class="ml-1 text-xs font-normal text-slate-400">{{ stats.reviewCount }}개</span>
              </div>
            </div>
            <div v-if="reviewsLoading" class="mt-3 text-sm text-slate-500">불러오는 중…</div>
            <div v-else-if="reviews.length === 0" class="mt-3 py-6 text-center text-sm text-slate-400">
              아직 후기가 없습니다. 첫 번째 후기를 남겨보세요!
            </div>
            <ul v-else class="mt-3 divide-y divide-slate-100">
              <li v-for="(r, i) in reviews" :key="i" class="py-3">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-amber-400">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
                  <span class="text-xs font-semibold text-slate-700">{{ r.memberNickname }}</span>
                  <span class="ml-auto text-xs text-slate-400">{{ fmtDate(r.createdAt) }}</span>
                </div>
                <p class="mt-1 text-sm text-slate-600">{{ r.reviewContent }}</p>
              </li>
            </ul>
            <div v-if="reviewTotalPages > 1" class="mt-4 flex items-center justify-center gap-3">
              <UiButton
                variant="ghost"
                class="h-8 px-3 text-sm"
                :disabled="reviewPage === 0"
                @click="loadReviews(reviewPage - 1)"
              >
                이전
              </UiButton>
              <span class="text-xs text-slate-500">{{ reviewPage + 1 }} / {{ reviewTotalPages }}</span>
              <UiButton
                variant="ghost"
                class="h-8 px-3 text-sm"
                :disabled="reviewPage >= reviewTotalPages - 1"
                @click="loadReviews(reviewPage + 1)"
              >
                다음
              </UiButton>
            </div>
          </UiCard>
        </div>
      </div>
    </template>

    <VenuePreviewModal
      :open="venueModalOpen"
      :venue="item?.venue"
      @close="venueModalOpen = false"
    />
  </div>
</template>

<script>
import { ChevronRight, ChevronUp, Heart, Star } from 'lucide-vue-next'
import ConcertCalendar from '../../components/concert/ConcertCalendar.vue'
import VenuePreviewModal from '../../components/concert/VenuePreviewModal.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiCard from '../../components/common/UiCard.vue'
import UiTabs from '../../components/common/UiTabs.vue'
import { useApi } from '../../composables/useApi'
import { isAuthed } from '../../composables/useRole'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'ConcertDetailView',
  components: {
    ChevronRight,
    ChevronUp,
    Heart,
    Star,
    ConcertCalendar,
    VenuePreviewModal,
    UiBadge,
    UiButton,
    UiCard,
    UiTabs
  },
  data() {
    return {
      loading: false,
      item: null,
      api: null,
      authed: false,
      stats: null,
      isLiked: false,
      liking: false,
      schedules: [],
      priceRows: [],
      myReview: { rating: 0, reviewContent: '' },
      submittingReview: false,
      reviewError: '',
      reviewSuccess: '',
      reviews: [],
      reviewsLoading: false,
      reviewPage: 0,
      reviewTotalPages: 0,
      activeTab: 'info',
      selectedScheduleId: null,
      selectedDateKey: null,
      venueModalOpen: false
    }
  },
  computed: {
    tabItems() {
      return [
        { key: 'info', label: '공연정보' },
        { key: 'reviews', label: `구매평${this.stats?.reviewCount ? `(${this.stats.reviewCount})` : ''}` }
      ]
    },
    performancePeriod() {
      if (!this.schedules.length) return '-'
      const dates = this.schedules.map((s) => new Date(s.play_time).getTime())
      const min = new Date(Math.min(...dates))
      const max = new Date(Math.max(...dates))
      return `${min.getFullYear()}.${String(min.getMonth() + 1).padStart(2, '0')}.${String(min.getDate()).padStart(2, '0')} ~ ${max.getFullYear()}.${String(max.getMonth() + 1).padStart(2, '0')}.${String(max.getDate()).padStart(2, '0')}`
    },
    ageRestrictionLabel() {
      const age = this.item?.ageLimit ?? this.item?.age_limit ?? null
      if (age == null || age === '') return '전체 관람가'
      return `만 ${age}세 이상`
    },
    priceSummary() {
      if (!this.schedules.length) return this.item?.priceRange || '-'
      const mins = this.schedules.map((s) => s.summary?.minPrice).filter(Boolean)
      const maxs = this.schedules.map((s) => s.summary?.maxPrice).filter(Boolean)
      if (!mins.length && !maxs.length) return this.item?.priceRange || '-'
      const lo = mins.length ? Math.min(...mins) : 0
      const hi = maxs.length ? Math.max(...maxs) : 0
      return lo === hi ? `₩${lo.toLocaleString()}` : `₩${lo.toLocaleString()} ~ ₩${hi.toLocaleString()}`
    },
    availableDates() {
      const set = new Set()
      for (const s of this.schedules) {
        const d = new Date(s.play_time)
        set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
      }
      return [...set].sort()
    },
    schedulesByDate() {
      const map = {}
      for (const s of this.schedules) {
        const d = new Date(s.play_time)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        if (!map[key]) map[key] = []
        map[key].push({
          scheduleId: s.id,
          playTime: this.extractTime(s.play_time),
          status: s.status
        })
      }
      // 회차 순 정렬
      for (const k of Object.keys(map)) {
        map[k].sort((a, b) => a.playTime.localeCompare(b.playTime))
      }
      return map
    },
    selectedSlots() {
      const dateKey = this.selectedDateKey || this.availableDates[0]
      if (!dateKey) return []
      return this.schedulesByDate[dateKey] ?? []
    },
    canBook() {
      return this.selectedScheduleId && this.schedules.some((s) => s.id === this.selectedScheduleId && s.status === 'OPEN')
    }
  },
  watch: {
    selectedDateKey(newKey) {
      if (!newKey) return
      const slots = this.schedulesByDate[newKey] ?? []
      const firstOpen = slots.find((s) => s.status === 'OPEN')
      this.selectedScheduleId = firstOpen ? firstOpen.scheduleId : null
    }
  },
  created() {
    this.api = useApi()
    this.authed = isAuthed()
  },
  mounted() {
    this.load()
  },
  methods: {
    extractTime(iso) {
      if (!iso) return '00:00'
      const d = new Date(iso)
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    },
    formatSlotTime(playTime) {
      return playTime && playTime.length >= 5 ? playTime.slice(0, 5) : playTime || ''
    },
    formatScheduleDateTime(iso) {
      if (!iso) return '-'
      const d = new Date(iso)
      const week = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
      const t = this.extractTime(iso)
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일(${week}) ${t}(KST)`
    },
    onSelectSchedule(scheduleId) {
      this.selectedScheduleId = scheduleId
    },
    async load() {
      const concertId = this.$route.params.concertId
      if (!concertId) {
        this.item = null
        return
      }
      this.loading = true
      try {
        const concert = await this.api.get(ENDPOINTS.concert(concertId))
        this.item = {
          ...concert,
          shortDesc: concert.shortDesc ?? concert.description ?? '',
          description: concert.description ?? '',
          category: concert.category ?? '콘서트',
          rating: concert.rating ?? '0',
          priceRange: concert.priceRange ?? '',
          posterUrl:
            concert.thumImgUrl ??
            concert.thum_img_url ??
            concert.posterUrl ??
            concert.thumbnailUrl ??
            concert.imageUrl ??
            'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=60',
          tags: concert.tags ?? [],
          venue: concert.venue ?? { id: null, name: '공연장', address: '' },
          ageLimit: concert.ageLimit ?? concert.age_limit ?? null
        }
        await Promise.allSettled([
          this.loadStats(concertId),
          this.loadSchedules(concertId),
          this.loadPolicies(concertId),
          this.authed ? this.loadUserInteraction(concertId) : Promise.resolve(),
          this.loadReviews(0, concertId)
        ])
        // 초기 회차/날짜 선택
        if (this.availableDates.length > 0) this.selectedDateKey = this.availableDates[0]
        const firstOpen = this.schedules.find((s) => s.status === 'OPEN')
        if (firstOpen) this.selectedScheduleId = firstOpen.id
      } catch {
        this.item = null
      } finally {
        this.loading = false
      }
    },
    async loadSchedules(concertId) {
      concertId = concertId ?? this.$route.params.concertId
      try {
        const res = await this.api.get(`${ENDPOINTS.concertSchedules(concertId)}?page=0&size=50&sort=playTime,asc`)
        const list = res.content ?? res.items ?? []
        this.schedules = list.map((s) => ({
          ...s,
          play_time: s.playTime ?? s.play_time,
          summary: s.summary ?? { minPrice: null, maxPrice: null }
        }))
      } catch {
        this.schedules = []
      }
    },
    async loadPolicies(concertId) {
      concertId = concertId ?? this.$route.params.concertId
      try {
        const raw = await this.api.get(ENDPOINTS.concertPolicies(concertId))
        const list = Array.isArray(raw) ? raw : (raw?.content ?? raw?.items ?? [])
        const base = list.find((p) => p.type === 'BASE_PRICE')
        if (base?.config) {
          const c = typeof base.config === 'string' ? JSON.parse(base.config) : base.config
          this.priceRows = Object.entries(c).map(([grade, price]) => ({ grade, price: Number(price) || 0 }))
        } else {
          this.priceRows = []
        }
      } catch {
        this.priceRows = []
      }
    },
    async loadStats(concertId) {
      concertId = concertId ?? this.$route.params.concertId
      try {
        this.stats = await this.api.get(ENDPOINTS.concertStats(concertId))
      } catch {
        this.stats = null
      }
    },
    async loadUserInteraction(concertId) {
      concertId = concertId ?? this.$route.params.concertId
      try {
        const data = await this.api.get(ENDPOINTS.concertUserInteraction(concertId))
        this.isLiked = data.isLiked ?? false
        if (data.rating) {
          this.myReview.rating = data.rating
          this.myReview.reviewContent = data.reviewContent ?? ''
        }
      } catch {
        this.isLiked = false
      }
    },
    async loadReviews(page = 0, concertId) {
      concertId = concertId ?? this.$route.params.concertId
      this.reviewsLoading = true
      this.reviewPage = page
      try {
        const res = await this.api.get(`${ENDPOINTS.concertReviews(concertId)}?page=${page}&size=10`)
        this.reviews = res.content ?? (Array.isArray(res) ? res : [])
        this.reviewTotalPages = res.totalPages ?? 1
      } catch {
        this.reviews = []
      } finally {
        this.reviewsLoading = false
      }
    },
    async toggleLike() {
      if (!this.authed) {
        this.$router.push('/member/doLogin')
        return
      }
      const concertId = this.$route.params.concertId
      this.liking = true
      try {
        const res = await this.api.post(ENDPOINTS.concertLike(concertId))
        this.isLiked = res.isLiked ?? !this.isLiked
        if (this.stats) {
          this.stats = { ...this.stats, likeCount: this.stats.likeCount + (this.isLiked ? 1 : -1) }
        }
      } catch {
        // ignore
      } finally {
        this.liking = false
      }
    },
    async submitReview() {
      if (this.myReview.rating === 0) return
      const concertId = this.$route.params.concertId
      this.reviewError = ''
      this.reviewSuccess = ''
      this.submittingReview = true
      try {
        await this.api.put(ENDPOINTS.concertReview(concertId), {
          rating: this.myReview.rating,
          reviewContent: this.myReview.reviewContent
        })
        this.reviewSuccess = '후기가 저장되었습니다.'
        await Promise.allSettled([this.loadStats(concertId), this.loadReviews(0, concertId)])
      } catch (err) {
        this.reviewError = err.message || '후기 저장에 실패했습니다.'
      } finally {
        this.submittingReview = false
      }
    },
    async goToBooking() {
      if (!this.canBook) {
        if (this.item?.id) this.$router.push(`/concerts/${this.item.id}/schedules`)
        return
      }
      if (!this.authed) {
        this.$router.push({ path: '/member/doLogin', query: { redirect: this.$route.fullPath } })
        return
      }
      const scheduleId = this.selectedScheduleId
      this.$router.push(`/schedules/${scheduleId}/seats`)
    },
    fmtDate(iso) {
      if (!iso) return ''
      try {
        return new Date(iso).toLocaleDateString('ko-KR')
      } catch {
        return iso
      }
    }
  }
}
</script>

<style scoped>
.concert-calendar--detail :deep(.rounded-lg) {
  border-radius: 0.5rem;
}
</style>
