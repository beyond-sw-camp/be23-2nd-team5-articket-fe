<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Flame, Ticket, ChevronRight } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

const api = useApi()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const items = ref([])

const cat = computed(() => String(route.query.cat || ''))
const q = computed(() => String(route.query.q || ''))

async function load() {
  loading.value = true
  try {
    const res = await api.get(`${ENDPOINTS.concerts()}?cat=${encodeURIComponent(cat.value)}&q=${encodeURIComponent(q.value)}`)
    items.value = res.items || []
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => route.query, load)

function badgeTone(label) {
  if (label === '매진임박') return { tone: 'solid', color: 'red' }
  if (label === '오픈예정') return { tone: 'soft', color: 'amber' }
  return { tone: 'soft', color: 'green' }
}
</script>

<template>
  <div class="grid gap-4">
    <div class="grid gap-4 lg:grid-cols-3">
      <UiCard class="lg:col-span-2" :padded="false">
        <div class="relative overflow-hidden rounded-2xl">
          <img
            class="h-[260px] w-full object-cover"
            src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1800&q=60"
            alt="hero"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-5">
            <div class="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 shadow-sm">
              <Flame class="h-4 w-4" />
              <span>상위 추천</span>
            </div>
            <div class="mt-3 text-3xl font-semibold text-white">COLDPLAY WORLD TOUR</div>
            <div class="mt-1 text-sm text-white/80">드디어 한국 상륙! 역대급 스케일의 공연을 직접 확인하세요.</div>
          </div>
        </div>
      </UiCard>

      <UiCard>
        <div class="text-sm font-semibold text-slate-900">Ticket Open</div>
        <div class="mt-1 text-sm text-slate-500">빌리마크니 내한공연</div>
        <div class="mt-4 rounded-2xl bg-indigo-600 p-4 text-white shadow-sm">
          <div class="text-xs font-semibold opacity-90">OPEN IN</div>
          <div class="mt-2 text-2xl font-semibold tabular-nums">04:12:44</div>
        </div>
        <div class="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <div class="text-xs font-semibold text-slate-500">MY BENEFIT</div>
            <div class="mt-1 text-sm font-semibold text-slate-900">이번 주 쿠폰 혜택 확인하기</div>
          </div>
          <UiButton class="h-10 px-4">다운로드</UiButton>
        </div>
      </UiCard>
    </div>

    <div class="flex items-center justify-between">
      <div class="text-sm font-semibold text-slate-900">실시간 랭킹</div>
      <button class="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900" type="button">
        더보기 <ChevronRight class="h-4 w-4" />
      </button>
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
      불러오는 중…
    </div>

    <div v-else-if="items.length === 0">
      <EmptyState title="검색 결과가 없어요" description="다른 키워드나 카테고리로 다시 시도해보세요." />
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UiCard
        v-for="(c, idx) in items"
        :key="c.id"
        class="cursor-pointer transition hover:shadow-lg"
        :padded="false"
        @click="router.push(`/concerts/${c.id}`)"
      >
        <div class="relative overflow-hidden rounded-2xl">
          <img class="h-44 w-full object-cover" :src="c.posterUrl" :alt="c.title" />
          <div class="absolute left-3 top-3">
            <UiBadge tone="solid" color="slate">#{{ idx + 1 }}</UiBadge>
          </div>
          <div class="absolute right-3 top-3">
            <UiBadge v-bind="badgeTone(c.statusBadge)">{{ c.statusBadge }}</UiBadge>
          </div>
        </div>
        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="text-sm font-semibold text-slate-900">{{ c.title }}</div>
            <UiBadge tone="outline">{{ c.category }}</UiBadge>
          </div>
          <div class="mt-1 text-sm text-slate-500">{{ c.shortDesc }}</div>
          <div class="mt-3 flex items-center justify-between">
            <div class="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Ticket class="h-4 w-4 text-slate-500" />
              <span>{{ c.priceRange }}</span>
            </div>
            <div class="text-xs font-semibold text-slate-500">⭐ {{ c.rating }}</div>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>

