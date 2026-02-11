<template>
  <UiCard v-if="venue">
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">공연장 수정</div>
        <div class="mt-1 text-sm text-slate-500">{{ venue.name }}</div>
      </div>
      <UiBadge tone="soft">ADMIN</UiBadge>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div class="text-xs font-semibold text-slate-500">주소</div>
        <div class="mt-1 text-sm font-semibold text-slate-900">{{ venue.address }}</div>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div class="text-xs font-semibold text-slate-500">좌표</div>
        <div class="mt-1 text-sm font-semibold text-slate-900">{{ venue.lat }}, {{ venue.lng }}</div>
      </div>
    </div>

    <div class="mt-4 flex gap-2">
      <UiButton variant="ghost" class="h-11 px-4" @click="$router.push('/admin/venues')">목록</UiButton>
      <UiButton class="h-11 px-5" @click="$router.push(`/admin/venues/${venue.id}/seat-maps`)">좌석맵 관리</UiButton>
    </div>
  </UiCard>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { MOCK_VENUES } from '../../mocks/venues'

export default {
  name: 'AdminVenueEditView',
  components: {
    UiCard,
    UiBadge,
    UiButton
  },
  computed: {
    venue() {
      return MOCK_VENUES.find((v) => v.id === this.$route.params.venueId)
    }
  }
}
</script>
