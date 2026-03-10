<template>
  <div class="mx-auto max-w-6xl space-y-6 pb-12">
    <!-- 로딩 -->
    <div
      v-if="loading"
      class="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white py-16"
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

    <template v-else-if="item">
      <!-- 헤더: 공연 제목 -->
      <div class="flex flex-wrap items-center gap-2">
        <h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">{{ item.title }}</h1>
        <span
          v-if="item.category"
          class="rounded-full border border-slate-200 bg-slate-50 px-3 py-0.5 text-xs font-semibold text-slate-600"
        >
          {{ item.category }}
        </span>
      </div>

      <!-- 메인: 포스터 | 상세정보 | 예매 위젯 -->
      <div class="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
        <!-- 왼쪽: 포스터 + 좋아요 -->
        <div class="flex flex-col">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
            <img
              class="aspect-[3/4] w-full object-cover"
              :src="item.posterUrl"
              :alt="item.title"
            />
          </div>
          <button
            type="button"
            :disabled="liking"
            class="mt-3 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition disabled:opacity-50"
            :class="isLiked ? 'border-red-300 bg-red-50 text-red-600' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
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
        <div class="space-y-5">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <dl class="grid gap-4 sm:grid-cols-1">
              <div>
                <dt class="text-xs font-semibold uppercase tracking-wider text-slate-400">장소</dt>
                <dd class="mt-1">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 hover:text-red-600 hover:underline"
                    @click="venueModalOpen = true"
                  >
                    {{ item.venue?.name }}
                    <ChevronRight class="h-4 w-4" />
                  </button>
                </dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-wider text-slate-400">공연기간</dt>
                <dd class="mt-1 text-sm font-semibold text-slate-900">{{ performancePeriod }}</dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-wider text-slate-400">관람연령</dt>
                <dd class="mt-1 text-sm font-semibold text-slate-900">{{ ageRestrictionLabel }}</dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-wider text-slate-400">가격</dt>
                <dd class="mt-1 text-sm">
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
                </dd>
              </div>
            </dl>
            <div v-if="(item.tags || []).length" class="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <span
                v-for="t in item.tags"
                :key="t"
                class="rounded-full border border-slate-200 bg-slate-50 px-3 py-0.5 text-xs font-medium text-slate-600"
              >
                {{ t }}
              </span>
            </div>
          </div>
        </div>

        <!-- 오른쪽: 예매 위젯 -->
        <div class="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-4">
            <div class="mb-3 flex items-center justify-between">
              <span class="text-sm font-semibold text-slate-900">관람일</span>
            </div>
            <ConcertCalendar
              v-if="availableDates.length > 0"
              v-model="selectedDateKey"
              :available-dates="availableDates"
              :schedules-by-date="schedulesByDate"
              class="concert-calendar--detail"
              @select-schedule="onSelectSchedule"
            />
            <div v-else class="rounded-xl border border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
              등록된 회차가 없습니다
            </div>
          </div>

          <div v-if="selectedSlots.length > 0" class="mb-4">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-semibold text-slate-900">회차</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(slot, idx) in selectedSlots"
                :key="slot.scheduleId"
                type="button"
                :class="[
                  'rounded-xl border px-4 py-2.5 text-sm font-semibold transition',
                  selectedScheduleId === slot.scheduleId
                    ? 'border-red-500 bg-red-600 text-white'
                    : slot.status === 'OPEN'
                      ? 'border-slate-200 bg-white text-slate-900 hover:border-red-300 hover:bg-red-50'
                      : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                ]"
                :disabled="slot.status !== 'OPEN'"
                @click="selectedScheduleId = slot.scheduleId"
              >
                {{ idx + 1 }}회 {{ formatSlotTime(slot.playTime) }}
              </button>
            </div>
          </div>

          <button
            type="button"
            class="mt-auto h-12 w-full rounded-xl text-base font-semibold text-white transition disabled:opacity-50"
            :class="canBook ? 'bg-red-600 hover:bg-red-700' : 'cursor-not-allowed bg-slate-300'"
            :disabled="!canBook"
            @click="goToBooking"
          >
            예매하기
          </button>
        </div>
      </div>

      <!-- 탭: 공연정보 | 구매평 -->
      <div class="space-y-4">
        <div class="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <button
            v-for="t in tabItems"
            :key="t.key"
            type="button"
            class="whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition"
            :class="activeTab === t.key ? 'border-red-200 bg-red-50 text-red-700' : 'border-transparent bg-transparent text-slate-600 hover:bg-slate-50'"
            @click="activeTab = t.key"
          >
            {{ t.label }}
          </button>
        </div>

        <!-- 공연정보 탭 -->
        <div v-show="activeTab === 'info'" class="space-y-6">
          <div v-if="item.description" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-3 text-sm font-semibold text-slate-900">공연 소개</h3>
            <div class="text-sm leading-relaxed text-slate-700">{{ item.description }}</div>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-3 text-sm font-semibold text-slate-900">공연시간 정보</h3>
            <ul class="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-700">
              <li v-for="s in schedules" :key="s.id">
                {{ formatScheduleDateTime(s.play_time) }}
              </li>
              <li v-if="schedules.length === 0" class="text-slate-500">
                등록된 공연 시간이 없습니다.
              </li>
            </ul>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-3 text-sm font-semibold text-slate-900">공지사항</h3>
            <ul class="space-y-2 text-sm text-slate-600">
              <li>※ 공연 정보는 변경될 수 있으니 예매 전 반드시 확인해 주세요.</li>
              <li>※ 예매 전 관람 연령, 공연 시간 등을 다시 한 번 확인해 주세요.</li>
            </ul>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 class="mb-2 text-sm font-semibold text-slate-900">휠체어석 예매 안내</h3>
            <p class="text-sm text-slate-600">
              휠체어석은 전화 예매로만 이용 가능합니다. 고객센터(1544-0000) 영업시간: 평일 09:00 ~ 18:00
            </p>
          </div>
        </div>

        <!-- 구매평 탭 -->
        <div v-show="activeTab === 'reviews'" class="space-y-6">
          <!-- 내 후기 작성 (로그인 시, 결제·관람일 경과 시에만) -->
          <div v-if="authed" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="text-sm font-semibold text-slate-900">내 후기</h3>
            <div v-if="reviewEligibilityLoading" class="mt-4 py-6 text-center text-sm text-slate-400">
              리뷰 작성 가능 여부 확인 중…
            </div>
            <div
              v-else-if="!canWriteReview"
              class="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-5 text-center text-sm text-slate-600"
            >
              이 공연에 대한 리뷰는 <strong>결제 후 관람일이 지난 경우에만</strong> 작성할 수 있습니다.
              <p class="mt-2 text-xs text-slate-500">
                관람이 끝난 공연은 마이페이지 &gt; 리뷰 작성하기에서 확인할 수 있어요.
              </p>
            </div>
            <!-- 저장 직후 토스트 (뷰 모드에서도 표시) -->
            <div
              v-if="reviewSuccess"
              ref="reviewSuccessRef"
              class="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
            >
              <Check class="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{{ reviewSuccess }}</span>
            </div>
            <!-- 내 후기 있음: 관람 후기와 동일 스타일로 표시 + 수정하기 (카드 구분 없음) -->
            <template v-if="hasExistingReview && !isEditingReview">
              <div class="mt-4 rounded-xl border border-slate-100 bg-slate-50/50 py-4 px-4">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-amber-400">{{ '★'.repeat(myReview.rating) }}{{ '☆'.repeat(5 - myReview.rating) }}</span>
                    <span class="text-xs font-semibold text-slate-700">내가 작성한 후기</span>
                  </div>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    @click="isEditingReview = true"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                    수정하기
                  </button>
                </div>
                <p class="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{{ myReview.reviewContent || '(내용 없음)' }}</p>
              </div>
            </template>
            <!-- 입력/수정 폼 -->
            <form v-else class="mt-4 grid gap-4" @submit.prevent="submitReview">
              <div>
                <label class="block text-xs font-semibold text-slate-500">평점 *</label>
                <div class="mt-1.5 flex items-center gap-1">
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
                  <span class="ml-2 text-sm text-slate-500">
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
                  class="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <div class="mt-0.5 text-right text-xs text-slate-400">{{ myReview.reviewContent.length }}/1000</div>
              </div>
              <p v-if="reviewError" class="text-sm text-red-600">{{ reviewError }}</p>
              <div class="flex justify-end gap-2">
                <button
                  v-if="isEditingReview"
                  type="button"
                  class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  @click="cancelEditReview"
                >
                  취소
                </button>
                <button
                  type="submit"
                  class="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 bg-red-600 hover:bg-red-700"
                  :disabled="submittingReview || myReview.rating === 0"
                >
                  <span>{{ isEditingReview ? '수정 저장' : '저장' }}</span>
                </button>
              </div>
            </form>
          </div>

          <!-- 관람 후기 목록 -->
          <div ref="reviewsListRef" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-slate-900">
                관람 후기
                <span v-if="stats" class="ml-1 font-normal text-slate-400">{{ stats.reviewCount }}개</span>
              </h3>
            </div>
            <div v-if="reviewsLoading" class="mt-4 flex justify-center py-8 text-sm text-slate-500">
              불러오는 중…
            </div>
            <div v-else-if="reviews.length === 0" class="mt-4 py-8 text-center text-sm text-slate-400">
              아직 후기가 없습니다. 첫 번째 후기를 남겨보세요!
            </div>
            <ul v-else class="mt-4 divide-y divide-slate-100">
              <li
                v-for="(r, i) in reviews"
                :key="i"
                class="py-4 first:pt-0"
                :class="{ 'rounded-lg border border-red-100 bg-red-50/40 px-3 -mx-3': isMyReview(r) }"
              >
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-amber-400">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
                  <span v-if="isMyReview(r)" class="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">내 후기</span>
                  <span class="text-xs font-semibold text-slate-700">{{ maskNickname(r.memberNickname ?? r.nickname) }}</span>
                  <span class="ml-auto text-xs text-slate-400">{{ fmtDate(r.createdAt) }}</span>
                </div>
                <p class="mt-1.5 text-sm text-slate-600 whitespace-pre-wrap">{{ r.reviewContent }}</p>
              </li>
            </ul>
            <div v-if="reviewTotalPages > 1" class="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                class="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                :disabled="reviewPage === 0"
                @click="loadReviews(reviewPage - 1)"
              >
                이전
              </button>
              <span class="text-sm text-slate-500">{{ reviewPage + 1 }} / {{ reviewTotalPages }}</span>
              <button
                type="button"
                class="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                :disabled="reviewPage >= reviewTotalPages - 1"
                @click="loadReviews(reviewPage + 1)"
              >
                다음
              </button>
            </div>
          </div>
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
import { Check, ChevronRight, ChevronUp, Heart, Pencil, Star } from 'lucide-vue-next'
import ConcertCalendar from '../../components/concert/ConcertCalendar.vue'
import VenuePreviewModal from '../../components/concert/VenuePreviewModal.vue'
import { useApi } from '../../composables/useApi'
import { useMe } from '../../composables/useMe'
import { isAuthed } from '../../composables/useRole'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { maskNickname } from '../../lib/utils/maskNickname'
import {
  extractOrdersList,
  getViewDateTime,
  getConcertId,
  isPaidOrder,
  isPastViewDate,
} from '../../lib/utils/orderReviewEligibility'

export default {
  name: 'ConcertDetailView',
  components: {
    Check,
    ChevronRight,
    ChevronUp,
    Heart,
    Pencil,
    Star,
    ConcertCalendar,
    VenuePreviewModal,
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
      canWriteReview: false,
      reviewEligibilityLoading: false,
      hasExistingReview: false,
      isEditingReview: false,
      activeTab: 'info',
      selectedScheduleId: null,
      selectedDateKey: null,
      venueModalOpen: false
    }
  },
  computed: {
    meProfile() {
      const me = this._me
      return me?.profile?.value ?? me?.profile ?? null
    },
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
    // 연령 제한/로그인/연령 인증 상태
    isAgeLimited() {
      const age = this.item?.ageLimit ?? this.item?.age_limit
      return typeof age === 'number' && age > 0
    },
    isLoggedIn() {
      if (typeof localStorage === 'undefined') return false
      return !!localStorage.getItem('accessToken')
    },
    isAgeVerified() {
      const p = this.meProfile
      return !!(p && (p.ageVerifiedAt || p.age_verified_at))
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
    },
    '$route.query.tab'(tab) {
      if (tab === 'reviews') this.activeTab = 'reviews'
    },
    activeTab(tab) {
      if (tab === 'reviews' && this.authed && this.$route.params.concertId) {
        this.loadCanWriteReview()
      }
    },
  },
  created() {
    this.api = useApi()
    this._me = useMe()
    this.authed = isAuthed()
  },
  mounted() {
    this.load()
    if (this.$route.query.tab === 'reviews') this.activeTab = 'reviews'
  },
  methods: {
    maskNickname,
    isMyReview(r) {
      if (!this.authed || !this.meProfile) return false
      const myName = this.meProfile.nickname ?? this.meProfile.name ?? ''
      const nick = r.memberNickname ?? r.nickname ?? ''
      return !!myName && myName === nick
    },
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
        if (data.rating != null && data.rating > 0) {
          this.myReview.rating = data.rating
          this.myReview.reviewContent = data.reviewContent ?? ''
          this.hasExistingReview = true
        } else if (data.reviewContent && String(data.reviewContent).trim()) {
          this.myReview.rating = data.rating ?? 0
          this.myReview.reviewContent = data.reviewContent
          this.hasExistingReview = true
        } else {
          this.hasExistingReview = false
        }
      } catch {
        this.isLiked = false
        this.hasExistingReview = false
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
    async loadCanWriteReview() {
      const concertId = String(this.$route.params.concertId ?? '')
      if (!concertId) return
      this.reviewEligibilityLoading = true
      this.canWriteReview = false
      try {
        // 1) 리뷰 작성 가능 전용 API 우선 (백엔드가 이미 결제완료+관람경과만 반환)
        try {
          const result = await this.api.get(ENDPOINTS.myOrdersReviewable())
          const list = extractOrdersList(result)
          const hasEligible = list.some((o) => getConcertId(o) === concertId)
          this.canWriteReview = !!hasEligible
          return
        } catch (_) {}
        // 2) 폴백: 전체 예매 조회 후 해당 공연·결제완료·관람일 경과 여부 판단
        const result = await this.api.get(ENDPOINTS.myOrders())
        const list = extractOrdersList(result)
        if (!Array.isArray(list)) return
        const hasEligible = list.some(
          (o) =>
            getConcertId(o) === concertId &&
            isPaidOrder(o) &&
            isPastViewDate(getViewDateTime(o))
        )
        this.canWriteReview = !!hasEligible
      } catch (_) {
        this.canWriteReview = false
      } finally {
        this.reviewEligibilityLoading = false
      }
    },
    cancelEditReview() {
      this.isEditingReview = false
      this.reviewError = ''
      this.loadUserInteraction(this.$route.params.concertId)
    },
    async submitReview() {
      if (this.myReview.rating === 0 || !this.canWriteReview) return
      const concertId = this.$route.params.concertId
      this.reviewError = ''
      this.reviewSuccess = ''
      this.submittingReview = true
      try {
        await this.api.put(ENDPOINTS.concertReview(concertId), {
          rating: this.myReview.rating,
          reviewContent: this.myReview.reviewContent
        })
        this.hasExistingReview = true
        this.isEditingReview = false
        this.reviewSuccess = '후기가 저장되었습니다.'
        await Promise.allSettled([this.loadStats(concertId), this.loadReviews(0, concertId)])
        this.$nextTick(() => {
          this.$refs.reviewSuccessRef?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
          setTimeout(() => {
            this.reviewSuccess = ''
            this.$refs.reviewsListRef?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
          }, 1500)
        })
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
      // 연령 제한 공연인 경우: 로그인/연령 인증 사전 검증
      if (this.isAgeLimited) {
        if (!this.isLoggedIn) {
          alert('연령 제한이 있는 공연입니다. 로그인 후 이용해 주세요.')
          this.$router.push({ path: '/member/doLogin', query: { redirect: this.$route.fullPath } })
          return
        }
        if (!this.isAgeVerified) {
          alert('연령 인증이 되지 않은 사용자입니다. 본인 인증을 먼저 진행해 주세요.')
          this.$router.push('/me/verify-identity')
          return
        }
      } else if (!this.authed) {
        // 전체 관람가 공연은 비로그인 예매 허용 정책이면 이 블록을 제거/완화할 수 있음
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
