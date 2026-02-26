<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <template v-else-if="item">
      <!-- ── Hero card ── -->
      <UiCard :padded="false">
        <div class="grid gap-0 sm:grid-cols-[220px_1fr]">
          <div class="overflow-hidden rounded-2xl sm:rounded-none sm:rounded-l-2xl">
            <img class="h-56 w-full object-cover sm:h-full" :src="item.posterUrl" :alt="item.title" />
          </div>
          <div class="p-4 sm:p-5">
            <!-- Title -->
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-xl font-semibold text-slate-900">{{ item.title }}</div>
                <div class="mt-1 text-sm text-slate-500">{{ item.shortDesc }}</div>
              </div>
              <UiBadge tone="soft">{{ categoryLabel(item.category) }}</UiBadge>
            </div>

            <!-- Info grid -->
            <div class="mt-4 grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <div class="text-xs font-semibold text-slate-500">평점</div>
                <div class="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <Star class="h-4 w-4 text-amber-500" />
                  {{ stats ? stats.avgRating.toFixed(1) : (item.rating ?? '-') }}
                  <span v-if="stats" class="text-xs font-normal text-slate-400">({{ stats.reviewCount }})</span>
                </div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <div class="text-xs font-semibold text-slate-500">가격대</div>
                <div class="mt-1 text-sm font-semibold text-slate-900">{{ item.priceRange }}</div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <div class="text-xs font-semibold text-slate-500">장소</div>
                <div class="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MapPin class="h-4 w-4 text-slate-600" />
                  <button class="hover:underline" type="button" @click="$router.push(`/venues/${item.venue?.id}`)">
                    {{ item.venue?.name }}
                  </button>
                </div>
                <div class="mt-1 text-xs text-slate-500">{{ item.venue?.address }}</div>
              </div>
            </div>

            <!-- Tags -->
            <div class="mt-4 flex flex-wrap gap-2">
              <UiBadge v-for="t in item.tags || []" :key="t" tone="outline">{{ t }}</UiBadge>
            </div>

            <!-- Description + actions -->
            <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div class="text-sm text-slate-600">{{ item.description }}</div>
              <div class="flex items-center gap-2">
                <!-- Like button -->
                <button
                  type="button"
                  :disabled="liking"
                  class="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition"
                  :class="isLiked
                    ? 'border-red-300 bg-red-50 text-red-500 hover:bg-red-100'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'"
                  @click="toggleLike"
                >
                  <Heart
                    class="h-4 w-4"
                    :class="isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'"
                  />
                  {{ stats ? stats.likeCount : 0 }}
                </button>

                <UiButton variant="ghost" class="h-11 px-4" @click="$router.push(`/concerts/${item.id}/schedules`)">
                  회차 보기
                </UiButton>
                <UiButton class="h-11 px-4" @click="goToBooking">
                  예매하기
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </UiCard>

      <!-- ── 후기 작성 (로그인 시) ── -->
      <UiCard v-if="authed">
        <div class="text-sm font-semibold text-slate-900">내 후기</div>
        <form class="mt-3 grid gap-3" @submit.prevent="submitReview">
          <!-- Star rating -->
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
          <!-- Review text -->
          <div>
            <label class="block text-xs font-semibold text-slate-500">후기</label>
            <textarea
              v-model="myReview.reviewContent"
              maxlength="1000"
              rows="3"
              placeholder="공연에 대한 솔직한 후기를 남겨주세요."
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
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

      <!-- ── 관람 후기 목록 ── -->
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
              <!-- Stars display -->
              <span class="text-sm text-amber-400">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
              <span class="text-xs font-semibold text-slate-700">{{ r.memberNickname }}</span>
              <span class="ml-auto text-xs text-slate-400">{{ fmtDate(r.createdAt) }}</span>
            </div>
            <p class="mt-1 text-sm text-slate-600">{{ r.reviewContent }}</p>
          </li>
        </ul>

        <!-- Pagination -->
        <div v-if="reviewTotalPages > 1" class="mt-4 flex items-center justify-center gap-3">
          <UiButton
            variant="ghost"
            class="h-8 px-3 text-sm"
            :disabled="reviewPage === 0"
            @click="loadReviews(reviewPage - 1)"
          >이전</UiButton>
          <span class="text-xs text-slate-500">{{ reviewPage + 1 }} / {{ reviewTotalPages }}</span>
          <UiButton
            variant="ghost"
            class="h-8 px-3 text-sm"
            :disabled="reviewPage >= reviewTotalPages - 1"
            @click="loadReviews(reviewPage + 1)"
          >다음</UiButton>
        </div>
      </UiCard>
    </template>
  </div>
</template>

<script>
import { MapPin, Star, Heart } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { isAuthed } from '../../composables/useRole'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { getCategoryLabel } from '../../lib/constants/concertCategory'

export default {
  name: 'ConcertDetailView',
  components: { MapPin, Star, Heart, UiCard, UiBadge, UiButton },
  data() {
    return {
      loading: false,
      item: null,
      api: null,
      authed: false,
      // stats
      stats: null,
      // like
      isLiked: false,
      liking: false,
      // my review
      myReview: { rating: 0, reviewContent: '' },
      submittingReview: false,
      reviewError: '',
      reviewSuccess: '',
      // reviews list
      reviews: [],
      reviewsLoading: false,
      reviewPage: 0,
      reviewTotalPages: 0,
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
    categoryLabel(cat) {
      return getCategoryLabel(cat)
    },
    async load() {
      const concertId = this.$route.params.concertId
      if (!concertId) { this.item = null; return }
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
          posterUrl: concert.thumImgUrl ?? concert.thum_img_url ?? concert.posterUrl ?? concert.thumbnailUrl ?? concert.imageUrl ?? 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=60',
          tags: concert.tags ?? [],
          venue: concert.venue ?? { id: null, name: '공연장', address: '' },
        }
        // 병렬 로드
        await Promise.allSettled([
          this.loadStats(concertId),
          this.authed ? this.loadUserInteraction(concertId) : Promise.resolve(),
          this.loadReviews(0, concertId),
        ])
      } catch {
        this.item = null
      } finally {
        this.loading = false
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
      if (!this.authed) { this.$router.push('/member/doLogin'); return }
      const concertId = this.$route.params.concertId
      this.liking = true
      try {
        const res = await this.api.post(ENDPOINTS.concertLike(concertId))
        this.isLiked = res.isLiked ?? !this.isLiked
        // likeCount 즉시 반영
        if (this.stats) {
          this.stats = { ...this.stats, likeCount: this.stats.likeCount + (this.isLiked ? 1 : -1) }
        }
      } catch {
        // 실패 시 무시
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
          reviewContent: this.myReview.reviewContent,
        })
        this.reviewSuccess = '후기가 저장되었습니다.'
        await Promise.allSettled([this.loadStats(concertId), this.loadReviews(0, concertId)])
      } catch (err) {
        this.reviewError = err.message || '후기 저장에 실패했습니다.'
      } finally {
        this.submittingReview = false
      }
    },

    goToBooking() {
      if (this.item?.id) this.$router.push(`/concerts/${this.item.id}/schedules`)
    },

    fmtDate(iso) {
      if (!iso) return ''
      try { return new Date(iso).toLocaleDateString('ko-KR') } catch { return iso }
    },
  },
}
</script>
