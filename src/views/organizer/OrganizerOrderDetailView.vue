<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

const api = useApi()
const route = useRoute()

const loading = ref(false)
const item = ref(null)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    item.value = await api.get(ENDPOINTS.organizerOrder(route.params.orderId))
  } catch (e) {
    error.value = e?.message || '주문 조회에 실패했어요.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <UiCard v-else-if="error">
      <div class="text-sm font-semibold text-slate-900">주문 상세</div>
      <div class="mt-2 text-sm text-red-700">{{ error }}</div>
    </UiCard>

    <UiCard v-else-if="item">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">주문 상세 (ORGANIZER)</div>
          <div class="mt-1 text-sm text-slate-500">{{ item.id }}</div>
        </div>
        <UiBadge
          :tone="item.status === 'SUCCESS' ? 'solid' : 'soft'"
          :color="item.status === 'SUCCESS' ? 'green' : 'slate'"
        >
          {{ item.status }}
        </UiBadge>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">생성일</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">
            {{ new Date(item.createdAt).toLocaleString() }}
          </div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">금액</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">
            ₩{{ Number(item.totalAmount || 0).toLocaleString() }}
          </div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:col-span-2">
          <div class="text-xs font-semibold text-slate-500">좌석</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">
            {{ (item.seats || []).join(', ') }}
          </div>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <UiButton variant="ghost" class="h-11 px-4" @click="$router.back()">뒤로</UiButton>
        <UiButton class="h-11 px-5" @click="$router.push(`/organizer/concerts/${item.concertId}/orders`)">
          공연 주문 목록
        </UiButton>
      </div>
    </UiCard>
  </div>
</template>


