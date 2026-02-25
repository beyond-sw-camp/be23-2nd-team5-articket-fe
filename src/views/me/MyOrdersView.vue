<template>
  <div class="container">
    <div class="page-title">마이페이지 > 예매내역</div>

    <div class="filter-container">
      <div class="date-filters">
        <button 
          v-for="filter in filters" 
          :key="filter"
          :class="{ active: activeFilter === filter }"
          @click="activeFilter = filter"
        >
          {{ filter }}
        </button>
      </div>
      <div class="search-info">
        <span class="info-text">최근 {{ activeFilter }} 예매내역입니다.</span>
      </div>
    </div>

    <table class="order-table">
      <colgroup>
        <col style="width: 15%;">
        <col style="width: 45%;">
        <col style="width: 10%;">
        <col style="width: 15%;">
        <col style="width: 15%;">
      </colgroup>
      <thead>
        <tr>
          <th>예매일/예매번호</th>
          <th>상품정보</th>
          <th>관람인원</th>
          <th>진행상태</th>
          <th>취소/환불</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="orders.length === 0">
          <td colspan="5" class="empty-message">예매 내역이 없습니다.</td>
        </tr>

        <tr v-else v-for="order in orders" :key="order.bookingNumber">
          <td>
            <div class="booking-date">{{ order.bookingDate }}</div>
            <div class="booking-number">{{ order.bookingNumber }}</div>
          </td>
          <td>
            <div class="event-info">
              <img :src="order.posterUrl" alt="포스터" class="event-poster">
              <div class="event-details">
                <a href="#" class="event-title">{{ order.title }}</a>
                <div class="event-meta">관람일시: {{ order.viewDate }}</div>
                <div class="event-meta">장소: {{ order.location }}</div>
              </div>
            </div>
          </td>
          <td>{{ order.ticketCount }}매</td>
          <td>
            <span :class="['status-badge', { 'completed': order.status === '관람완료' }]">
              {{ order.status }}
            </span>
          </td>
          <td>
            <button v-if="order.status === '예매완료'" class="cancel-btn" @click="cancelOrder(order.bookingNumber)">
              예매취소
            </button>
            <span v-else>-</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 기간 필터 상태 관리
const filters = ['1주일', '1개월', '3개월', '6개월'];
const activeFilter = ref('1개월');

// 백엔드 API에서 받아올 가상의 예매 내역 데이터
const orders = ref([
  {
    bookingDate: '2026.02.20',
    bookingNumber: 'T2602201234',
    posterUrl: 'https://via.placeholder.com/70x95/eeeeee/999999?text=Poster',
    title: '뮤지컬 〈레베카〉 10주년 기념 공연',
    viewDate: '2026.03.15(일) 14:00',
    location: '블루스퀘어 신한카드홀',
    ticketCount: 2,
    status: '예매완료'
  },
  {
    bookingDate: '2026.01.10',
    bookingNumber: 'T2601105678',
    posterUrl: 'https://via.placeholder.com/70x95/eeeeee/999999?text=Poster',
    title: '대한민국 vs 브라질 친선경기',
    viewDate: '2026.01.25(토) 20:00',
    location: '서울월드컵경기장',
    ticketCount: 1,
    status: '관람완료'
  }
]);

// 예매 취소 함수 (향후 백엔드 API 연동)
const cancelOrder = (bookingNumber) => {
  if (confirm('정말로 예매를 취소하시겠습니까?')) {
    alert(`${bookingNumber} 예매가 취소 요청되었습니다.`);
    // TODO: axios.post(`/api/v1/orders/${bookingNumber}/cancel`) 호출
  }
};
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.page-title {
  font-size: 20px;
  font-weight: bold;
  border-bottom: 2px solid #222;
  padding-bottom: 15px;
  margin-bottom: 20px;
}
.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f3f4f6;
  padding: 15px 20px;
  margin-bottom: 30px;
  border-radius: 4px;
}
.date-filters button {
  padding: 6px 15px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
  margin-right: 5px;
  font-size: 14px;
}
.date-filters button.active {
  background: #ed1c24;
  color: #fff;
  border-color: #ed1c24;
}
.info-text {
  font-size: 14px;
  color: #666;
}
.order-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}
.order-table th {
  background-color: #fbfbfb;
  padding: 15px 10px;
  border-top: 1px solid #333;
  border-bottom: 1px solid #ddd;
  font-weight: 600;
}
.order-table td {
  padding: 20px 10px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}
.booking-date {
  margin-bottom: 5px;
}
.booking-number {
  color: #0056b3;
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
}
.event-info {
  display: flex;
  text-align: left;
  align-items: center;
  gap: 15px;
}
.event-poster {
  width: 70px;
  height: 95px;
  background-color: #ddd;
  border-radius: 4px;
  object-fit: cover;
}
.event-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.event-title {
  font-size: 16px;
  font-weight: bold;
  color: #222;
  text-decoration: none;
}
.event-title:hover {
  text-decoration: underline;
}
.event-meta {
  font-size: 13px;
  color: #666;
}
.status-badge {
  font-weight: bold;
  color: #ed1c24;
}
.status-badge.completed {
  color: #888;
}
.cancel-btn {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.cancel-btn:hover {
  background: #f8f9fa;
}
.empty-message {
  padding: 50px;
  color: #888;
}
</style>


<!-- <template>
  <div class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">내 주문 목록</div>
        <div class="mt-1 text-sm text-slate-500">GET /users/me/orders</div>
      </div>
      <UiButton variant="ghost" class="h-11 px-4" @click="$router.push('/me')">내 정보</UiButton>
    </div>

    <UiCard v-if="loading">
      <div class="text-sm text-slate-500">불러오는 중…</div>
    </UiCard>

    <UiTable v-else :columns="columns" :rows="items">
      <template #cell:id="{ row }">
        <button class="font-semibold text-slate-900 hover:underline" type="button" @click="$router.push(`/me/orders/${row.id}`)">
          {{ row.id }}
        </button>
      </template>
      <template #cell:status="{ row }">
        <UiBadge :tone="row.status === 'SUCCESS' ? 'solid' : 'soft'" :color="row.status === 'SUCCESS' ? 'green' : 'slate'">
          {{ row.status }}
        </UiBadge>
      </template>
      <template #cell:createdAt="{ row }">
        {{ new Date(row.createdAt).toLocaleString() }}
      </template>
      <template #cell:totalAmount="{ row }">
        ₩{{ Number(row.totalAmount).toLocaleString() }}
      </template>
    </UiTable>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiTable from '../../components/common/UiTable.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'MyOrdersView',
  components: {
    UiCard,
    UiBadge,
    UiButton,
    UiTable
  },
  data() {
    return {
      loading: false,
      items: [],
      api: null,
      columns: [
        { key: 'id', label: '주문ID' },
        { key: 'status', label: '상태' },
        { key: 'createdAt', label: '생성일' },
        { key: 'totalAmount', label: '금액' }
      ],
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
        const res = await this.api.get(`${ENDPOINTS.myOrders()}?page=0&size=20`)
        this.items = res?.content ?? res?.items ?? []
      } finally {
        this.loading = false
      }
    }
  }
}
</script> -->
