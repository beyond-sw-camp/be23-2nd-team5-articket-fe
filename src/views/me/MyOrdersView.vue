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
            <span :class="['status-badge', { 'completed': order.status === '관람완료' || order.status === '취소완료' }]">
              {{ order.status }}
            </span>
          </td>
          <td>
            <button
              v-if="order.status === '예매완료' || order.status === '결제대기'"
              class="cancel-btn"
              :disabled="order.cancelling"
              @click="cancelOrder(order)"
            >
              {{ order.cancelling ? '취소중...' : '예매취소' }}
            </button>
            <span v-else>-</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { useApi } from '../../composables/useApi';
import { ENDPOINTS } from '../../lib/api/endpoints';

const STATUS_MAP = {
  PAID: '예매완료',
  PENDING: '결제대기',
  CANCELLED: '취소완료'
};

function formatDateTime(isoStr) {
  if (!isoStr) return '-';
  const dt = new Date(isoStr);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  const h = String(dt.getHours()).padStart(2, '0');
  const min = String(dt.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${d} ${h}:${min}`;
}

function formatDateOnly(isoStr) {
  if (!isoStr) return '-';
  const dt = new Date(isoStr);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export default {
  name: 'MyOrdersView',
  data() {
    return {
      filters: ['1주일', '1개월', '3개월', '6개월'],
      activeFilter: '1개월',
      orders: [],
      loading: false,
      api: null
    };
  },
  created() {
    this.api = useApi();
  },
  mounted() {
    this.loadOrders();
  },
  methods: {
    async loadOrders() {
      this.loading = true;
      try {
        const result = await this.api.get(ENDPOINTS.myOrders());

        console.log(result)
        const list = result.content || [];
        this.orders = list.map(order => ({
          id: order.id,
          bookingDate: formatDateOnly(order.scheduleDate),
          bookingNumber: order.uuid || order.id || '-',
          posterUrl: 'https://via.placeholder.com/70x95/eeeeee/999999?text=Poster',
          title: order.concertName || '-',
          viewDate: formatDateTime(order.scheduleDate),
          location: order.venueName || '-',
          ticketCount: order.seatDetails ? order.seatDetails.length : 0,
          status: STATUS_MAP[order.status] || order.status,
          cancelling: false
        }));
      } catch (e) {
        this.orders = [];
      } finally {
        this.loading = false;
      }
    },
    async cancelOrder(order) {
      if (!confirm('정말로 예매를 취소하시겠습니까?')) return;
      order.cancelling = true;
      try {
        await this.api.post(ENDPOINTS.orderCancel(order.id));
        await this.loadOrders();
      } catch (e) {
        alert(e.message || '취소 처리 중 오류가 발생했습니다.');
      } finally {
        order.cancelling = false;
      }
    }
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