<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">주문 상태</div>
          <div class="mt-1 text-sm text-slate-500">polling mock</div>
        </div>
        <UiButton variant="ghost" class="h-10 px-3" @click="load">
          <RefreshCw class="h-4 w-4" />
        </UiButton>
      </div>

      <div v-if="error" class="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
        {{ error }}
      </div>

      <div v-else-if="item" class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">주문ID</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ item.id }}</div>
          <div class="mt-3 inline-flex items-center gap-2">
            <component :is="icon" class="h-5 w-5" :class="item.status === 'SUCCESS' ? 'text-emerald-600' : item.status === 'FAILED' ? 'text-red-600' : 'text-amber-600'" />
            <UiBadge v-bind="statusTone">{{ item.status }}</UiBadge>
          </div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">타임라인</div>
          <div class="mt-2 grid gap-2 text-sm">
            <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <span class="font-semibold text-slate-700">주문 생성</span>
              <span class="text-xs text-slate-500">{{ new Date(item.createdAt).toLocaleTimeString() }}</span>
            </div>
            <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <span class="font-semibold text-slate-700">결제 처리</span>
              <span class="text-xs text-slate-500">{{ item.status === 'PENDING' ? '진행중' : '완료' }}</span>
            </div>
            <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <span class="font-semibold text-slate-700">확정</span>
              <span class="text-xs text-slate-500">{{ item.status }}</span>
            </div>
          </div>
        </div>

        <div class="sm:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <UiButton variant="ghost" class="h-12 px-5" @click="$router.push('/me/orders')">내 주문</UiButton>
          <UiButton
            class="h-12 px-6"
            variant="ghost"
            :disabled="item.status !== 'SUCCESS'"
            @click="$router.push(`/orders/${item.id}/cancel`)"
          >
            주문 취소
          </UiButton>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script>
import { CheckCircle2, XCircle, Clock3, RefreshCw } from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'OrderStatusView',
  components: {
    CheckCircle2,
    XCircle,
    Clock3,
    RefreshCw,
    UiCard,
    UiButton,
    UiBadge
  },
  data() {
    return {
      loading: false,
      item: null,
      error: '',
      timer: null,
      api: null
    }
  },
  computed: {
    statusTone() {
      const st = this.item?.status
      if (st === 'SUCCESS') return { tone: 'solid', color: 'green' }
      if (st === 'FAILED') return { tone: 'solid', color: 'red' }
      if (st === 'CANCELLED') return { tone: 'soft', color: 'slate' }
      return { tone: 'soft', color: 'amber' }
    },
    icon() {
      const st = this.item?.status
      if (st === 'SUCCESS') return 'CheckCircle2'
      if (st === 'FAILED') return 'XCircle'
      if (st === 'CANCELLED') return 'XCircle'
      return 'Clock3'
    }
  },
  created() {
    this.api = useApi()
  },
  async mounted() {
    await this.load()
    this.timer = setInterval(async () => {
      if (!this.item) return
      if (this.item.status !== 'PENDING') return
      await this.load()
    }, 1200)
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    async load() {
      this.loading = true
      this.error = ''
      try {
        this.item = await this.api.get(ENDPOINTS.order(this.$route.params.orderId))
      } catch (e) {
        this.error = e?.message || '주문 조회에 실패했어요.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
