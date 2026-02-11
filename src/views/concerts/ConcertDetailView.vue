<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <template v-else-if="item">
      <UiCard :padded="false">
        <div class="grid gap-0 sm:grid-cols-[220px_1fr]">
          <div class="overflow-hidden rounded-2xl sm:rounded-none sm:rounded-l-2xl">
            <img class="h-56 w-full object-cover sm:h-full" :src="item.posterUrl" :alt="item.title" />
          </div>
          <div class="p-4 sm:p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-xl font-semibold text-slate-900">{{ item.title }}</div>
                <div class="mt-1 text-sm text-slate-500">{{ item.shortDesc }}</div>
              </div>
              <UiBadge tone="soft">{{ item.category }}</UiBadge>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <div class="text-xs font-semibold text-slate-500">평점</div>
                <div class="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Star class="h-4 w-4 text-amber-500" /> {{ item.rating }}
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

            <div class="mt-4 flex flex-wrap gap-2">
              <UiBadge v-for="t in item.tags || []" :key="t" tone="outline">{{ t }}</UiBadge>
            </div>

            <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div class="text-sm text-slate-600">{{ item.description }}</div>
              <div class="flex gap-2">
                <UiButton variant="ghost" class="h-11 px-4" @click="$router.push(`/concerts/${item.id}/schedules`)">
                  회차 보기
                </UiButton>
                <UiButton class="h-11 px-4" @click="open = true">예매하기</UiButton>
              </div>
            </div>
          </div>
        </div>
      </UiCard>
    </template>
  </div>

  <BookingModal :open="open" :concert="item" @close="open = false" />
</template>

<script>
import { MapPin, Star } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import BookingModal from '../../components/BookingModal.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'ConcertDetailView',
  components: {
    MapPin,
    Star,
    UiCard,
    UiBadge,
    UiButton,
    BookingModal
  },
  data() {
    return {
      loading: false,
      item: null,
      open: false,
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
      this.loading = true
      try {
        this.item = await this.api.get(ENDPOINTS.concert(this.$route.params.concertId))
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
