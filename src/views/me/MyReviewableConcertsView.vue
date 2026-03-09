<template>
  <div class="mx-auto max-w-6xl space-y-6 px-4 pb-12">
    <!-- 헤더 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">리뷰 작성하기</h1>
        <p class="mt-1 text-sm text-slate-500">
          관람일이 지난 공연에 리뷰를 남기면 공연 초대권을 받을 수 있어요.
        </p>
      </div>
      <RouterLink
        to="/me"
        class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        마이페이지
      </RouterLink>
    </div>

    <!-- 로딩 -->
    <div
      v-if="loading"
      class="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white py-12"
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

    <!-- 빈 목록 -->
    <div
      v-else-if="items.length === 0"
      class="rounded-2xl border border-slate-200 bg-white py-16 text-center"
    >
      <p class="text-slate-500">관람일이 지난 예매 공연이 없습니다.</p>
      <p class="mt-1 text-sm text-slate-400">공연 관람 후 이 페이지에서 리뷰를 작성할 수 있어요.</p>
      <RouterLink
        to="/me/orders"
        class="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        예매내역 보기
      </RouterLink>
    </div>

    <!-- 리뷰 작성 가능 목록 (공연별 1개, 관람일 지난 것만) -->
    <div v-else class="space-y-4">
      <div
        v-for="item in items"
        :key="item.concertId"
        class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 sm:flex-row sm:items-center sm:p-5"
      >
        <div class="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-32 sm:w-24">
          <img
            :src="item.posterUrl"
            :alt="item.title"
            class="h-full w-full object-cover"
          />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-medium text-slate-500">관람일 {{ item.viewDate }}</p>
          <p class="mt-1 text-base font-bold text-slate-900">{{ item.title }}</p>
          <p class="mt-0.5 text-sm text-slate-600">{{ item.location }}</p>
        </div>
        <div class="flex shrink-0 flex-col gap-2 sm:items-end">
          <RouterLink
            :to="reviewWriteLink(item.concertId)"
            class="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            리뷰 작성하기
          </RouterLink>
          <RouterLink
            :to="`/concerts/${item.concertId}`"
            class="text-xs text-slate-500 hover:text-slate-700 hover:underline"
          >
            공연 상세 보기
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import {
  extractOrdersList,
  getViewDateTime,
  isPaidOrder,
  isPastViewDate,
} from '../../lib/utils/orderReviewEligibility'

function formatDate(isoStr) {
  if (!isoStr) return '-'
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return '-'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}.${m}.${day} ${h}:${min}`
}

export default {
  name: 'MyReviewableConcertsView',
  data() {
    return {
      api: null,
      items: [],
      loading: false,
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  methods: {
    reviewWriteLink(concertId) {
      return { path: `/concerts/${concertId}`, query: { tab: 'reviews' } }
    },
    /** 주문 목록을 공연별 1건으로 묶어 화면용 items 생성 */
    buildItemsFromOrders(list) {
      if (!Array.isArray(list)) return []
      const byConcert = new Map()
      list.forEach((order) => {
        const cid =
          order.concertId ??
          order.concert_id ??
          order.concert?.id ??
          order.schedule?.concertId
        if (cid == null) return
        const viewDate = getViewDateTime(order)
        const existing = byConcert.get(cid)
        if (!existing || new Date(viewDate) > new Date(existing.scheduleDate)) {
          byConcert.set(cid, {
            concertId: cid,
            title:
              order.concertName ??
              order.concert_name ??
              order.concert?.name ??
              order.title ??
              '-',
            posterUrl:
              order.concertUrl ??
              order.posterUrl ??
              order.poster_url ??
              order.concert?.posterUrl ??
              '',
            viewDate: formatDate(viewDate),
            location:
              order.venueName ??
              order.venue_name ??
              order.venue?.name ??
              '-',
            scheduleDate: viewDate,
          })
        }
      })
      return Array.from(byConcert.values()).sort(
        (a, b) => new Date(b.scheduleDate) - new Date(a.scheduleDate)
      )
    },
    async load() {
      this.loading = true
      try {
        // 1) 리뷰 작성 가능 전용 API 우선 사용 (백엔드가 결제완료+관람경과만 반환)
        try {
          const result = await this.api.get(ENDPOINTS.myOrdersReviewable())
          const list = extractOrdersList(result)
          this.items = this.buildItemsFromOrders(list)
          return
        } catch (_) {
          // 2) 미구현 시 전체 예매 조회 후 클라이언트 필터
        }
        const result = await this.api.get(ENDPOINTS.myOrders())
        const list = extractOrdersList(result)
        const pastOrders = list.filter((order) => {
          const viewDate = getViewDateTime(order)
          return isPaidOrder(order) && isPastViewDate(viewDate)
        })
        this.items = this.buildItemsFromOrders(pastOrders)
      } catch (_) {
        this.items = []
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
