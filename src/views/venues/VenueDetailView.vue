<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <template v-else-if="venue">
      <UiCard>
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-sm font-semibold text-slate-900">{{ venue.name }}</div>
            <div class="mt-1 inline-flex items-center gap-2 text-sm text-slate-600">
              <MapPin class="h-4 w-4 text-slate-600" />
              <span>{{ venue.address }}</span>
            </div>
            <div class="mt-2 text-sm text-slate-500">{{ venue.description }}</div>
          </div>
          <UiBadge tone="soft">Venue</UiBadge>
        </div>

        <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <UiButton variant="ghost" class="h-11 px-4" @click="$router.push('/nearby')">내 주변으로</UiButton>
          <UiButton class="h-11 px-5" @click="$router.push('/admin/seat-maps/' + (venue.seatMapIds && venue.seatMapIds[0] ? venue.seatMapIds[0] : 'sm-olympic-1'))">
            <LayoutGrid class="h-4 w-4" />
            <span class="ml-2">좌석맵 미리보기</span>
          </UiButton>
        </div>
      </UiCard>

      <div class="flex items-center justify-between">
        <div class="text-sm font-semibold text-slate-900">해당 공연장 전체공연 (오픈예정 포함)</div>
        <UiBadge tone="soft">GET /venues/{{ $route.params.venueId }}/concerts</UiBadge>
      </div>

      <EmptyState v-if="concerts.length === 0" title="등록된 공연이 없어요" description="mock 데이터에서 추가할 수 있어요." />

      <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <UiCard
          v-for="c in concerts"
          :key="c.id"
          class="cursor-pointer transition hover:shadow-lg"
          :padded="false"
          @click="$router.push(`/concerts/${c.id}`)"
        >
          <div class="overflow-hidden rounded-2xl">
            <img class="h-40 w-full object-cover" :src="c.posterUrl" :alt="c.title" />
          </div>
          <div class="p-4">
            <div class="flex items-start justify-between gap-2">
              <div class="text-sm font-semibold text-slate-900">{{ c.title }}</div>
              <UiBadge tone="outline">{{ c.category }}</UiBadge>
            </div>
            <div class="mt-1 text-sm text-slate-500">{{ c.shortDesc }}</div>
          </div>
        </UiCard>
      </div>
    </template>
  </div>
</template>

<script>
import { MapPin, LayoutGrid } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'VenueDetailView',
  components: {
    MapPin,
    LayoutGrid,
    UiCard,
    UiButton,
    UiBadge,
    EmptyState
  },
  data() {
    return {
      loading: false,
      venue: null,
      concerts: [],
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
      const venueId = this.$route.params.venueId
      if (venueId == null || venueId === '') {
        this.loading = false
        return
      }
      this.loading = true
      try {
        this.venue = await this.api.get(ENDPOINTS.venue(venueId))
        const res = await this.api.get(ENDPOINTS.venueConcerts(venueId))
        this.concerts = res.items || []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
