<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Timer } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiModal from '../../components/common/UiModal.vue'
import { useSeatHoldMock } from '../../composables/useSeatHoldMock'

const route = useRoute()
const router = useRouter()

const { getHold, releaseHold } = useSeatHoldMock()
const loading = ref(false)
const item = ref(null)
const error = ref('')

const now = ref(Date.now())
let t = null

const remainingMs = computed(() => {
  const exp = item.value?.expiresAt ? new Date(item.value.expiresAt).getTime() : 0
  return Math.max(0, exp - now.value)
})
const remainingText = computed(() => {
  const s = Math.floor(remainingMs.value / 1000)
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
})
const expired = computed(() => remainingMs.value <= 0)

const open = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    item.value = await getHold(route.params.holdId)
  } catch (e) {
    error.value = '선점 정보를 찾을 수 없어요. (만료되었을 수 있어요)'
  } finally {
    loading.value = false
  }
}

async function cancelHold() {
  await releaseHold(route.params.holdId)
  open.value = false
  router.push('/')
}

onMounted(() => {
  load()
  t = setInterval(() => {
    now.value = Date.now()
    if (expired.value) load()
  }, 500)
})
onUnmounted(() => {
  if (t) clearInterval(t)
})
</script>

<template>
  <div class="grid gap-4">
    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <UiCard v-else-if="error">
      <div class="text-sm font-semibold text-slate-900">좌석 선점 조회</div>
      <div class="mt-2 text-sm text-red-700">{{ error }}</div>
      <div class="mt-4">
        <UiButton class="h-11 px-5" @click="$router.push('/')">홈으로</UiButton>
      </div>
    </UiCard>

    <UiCard v-else-if="item">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">좌석 선점</div>
          <div class="mt-1 text-sm text-slate-500">{{ item.holdId }} · schedule {{ item.scheduleId }}</div>
        </div>
        <UiBadge :tone="expired ? 'solid' : 'soft'" :color="expired ? 'slate' : 'red'">
          {{ expired ? 'EXPIRED' : 'HOLDING' }}
        </UiBadge>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Timer class="h-4 w-4 text-slate-600" />
            남은 시간
          </div>
          <div class="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{{ remainingText }}</div>
          <div class="mt-1 text-xs text-slate-500">만료 시각: {{ new Date(item.expiresAt).toLocaleString() }}</div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">선점 좌석</div>
          <div class="mt-2 flex flex-wrap gap-2">
            <UiBadge v-for="s in item.seats" :key="s" tone="outline">{{ s }}</UiBadge>
          </div>
        </div>
      </div>

      <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <UiButton variant="ghost" class="h-12 px-5" @click="open = true">선점 취소</UiButton>
        <UiButton class="h-12 px-6" :disabled="expired" @click="$router.push({ path: '/checkout', query: { holdId: item.holdId } })">
          결제 진행
        </UiButton>
      </div>
    </UiCard>
  </div>

  <UiModal :open="open" title="선점 취소" @close="open = false">
    <div class="text-sm text-slate-600">선점 좌석을 해제할까요?</div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UiButton variant="ghost" class="h-11 px-4" @click="open = false">닫기</UiButton>
        <UiButton class="h-11 px-5" @click="cancelHold">해제</UiButton>
      </div>
    </template>
  </UiModal>
</template>

