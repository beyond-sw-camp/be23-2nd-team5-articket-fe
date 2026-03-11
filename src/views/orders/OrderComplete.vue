<template>
  <div class="payment-complete-wrapper">
    <div class="header-section">
      <div class="check-icon">✓</div>
      <h2 class="title">예매가 정상적으로 완료되었습니다.</h2>
      <p class="subtitle">예매번호로 상세 내역을 확인하실 수 있습니다.</p>
      <p class="subtitle-virtual" v-if="bookingInfo.paymentMethod === '무통장입금 (입금대기)'">
        1시간 이내에 입금처리해주세요.
      </p>
    </div>

    <div class="info-section">
      <h3 class="section-title">예매 정보</h3>
      <table class="info-table">
        <colgroup>
          <col style="width: 120px;" />
          <col style="width: auto;" />
        </colgroup>
        <tbody>
          <tr>
            <th>예매번호</th>
            <td class="highlight">{{ bookingInfo.bookingNumber }}</td>
          </tr>
          <tr>
            <th>공연/행사명</th>
            <td>{{ bookingInfo.eventName }}</td>
          </tr>
          <tr>
            <th>관람일시</th>
            <td>{{ bookingInfo.eventDate }}</td>
          </tr>
          <tr>
            <th>장소</th>
            <td>{{ bookingInfo.venue }}</td>
          </tr>
          <tr>
            <th>좌석정보</th>
            <td>{{ bookingInfo.seatInfo }} ({{ bookingInfo.ticketCount }}매)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="info-section">
      <h3 class="section-title">결제 정보</h3>
      <table class="info-table">
        <colgroup>
          <col style="width: 120px;" />
          <col style="width: auto;" />
        </colgroup>
        <tbody>
          <tr>
            <th>결제수단</th>
            <td>{{ bookingInfo.paymentMethod }}</td>
          </tr>
          <tr>
            <th>총 결제금액</th>
            <td class="price">{{ formatPrice(bookingInfo.totalPrice) }}원</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="info-section" v-if="bookingInfo.paymentMethod === '무통장입금 (입금대기)'">
      <h3 class="section-title">입금 계좌 정보</h3>
      <table class="info-table">
        <colgroup>
          <col style="width: 120px;" />
          <col style="width: auto;" />
        </colgroup>
        <tbody>
          <tr>
            <th>은행</th>
            <td>{{ accountInfo.bank }}</td>
          </tr>
          <tr>
            <th>계좌번호</th>
            <td class="highlight">{{ accountInfo.accountNumber }}</td>
          </tr>
          <tr>
            <th>예금주</th>
            <td>{{ accountInfo.holder }}</td>
          </tr>
          <tr>
            <th>입금기한</th>
            <td class="deadline">{{ accountInfo.deadline }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 모바일 티켓 섹션 (결제 성공 + 유효 티켓만, 슬라이드 UX) -->
    <div v-if="ticketCount > 0" class="info-section">
      <h3 class="section-title">모바일 티켓</h3>
      <div class="ticket-slider-header">
        <p class="ticket-slider-text">좌우로 넘기며 각 좌석의 티켓을 확인할 수 있습니다.</p>
        <span class="ticket-slider-count">{{ currentTicketIndex + 1 }} / {{ ticketCount }}</span>
      </div>
      <div class="ticket-slider">
        <button
          type="button"
          class="nav-btn prev"
          :disabled="currentTicketIndex === 0"
          @click="prevTicket"
        >
          ‹
        </button>
        <div class="ticket-slider-viewport">
          <transition name="fade-slide" mode="out-in">
            <div v-if="currentTicket" :key="currentTicket.id" class="ticket-card">
              <div class="ticket-header">
                <div>
                  <div class="ticket-seat-label">좌석</div>
                  <div class="ticket-seat-name">{{ currentTicket.seatDefName }}</div>
                </div>
                <div class="ticket-status">
                  사용 가능
                </div>
              </div>

              <div class="ticket-body">
                <div class="ticket-number-label">티켓 번호</div>
                <div class="ticket-number">
                  {{ currentTicket.ticketNumber || '티켓 생성 중입니다.' }}
                </div>
              </div>

              <div class="ticket-qr">
                <img
                  v-if="currentTicket.qrCodeUrl"
                  :src="currentTicket.qrCodeUrl"
                  alt="모바일 티켓 QR"
                />
                <div v-else class="ticket-qr-placeholder">
                  QR 코드 준비 중입니다.
                </div>
              </div>
            </div>
          </transition>
        </div>
        <button
          type="button"
          class="nav-btn next"
          :disabled="currentTicketIndex >= ticketCount - 1"
          @click="nextTicket"
        >
          ›
        </button>
      </div>
      <div class="ticket-dots">
        <button
          v-for="(_, idx) in filteredTickets"
          :key="idx"
          type="button"
          class="dot"
          :class="{ active: idx === currentTicketIndex }"
          @click="currentTicketIndex = idx"
        />
      </div>
    </div>

    <div class="button-group">
      <button class="btn btn-home" @click="goToHome">홈으로 가기</button>
      <button class="btn btn-ticket" @click="goToMyTicket">예매내역 확인</button>
    </div>
  </div>
</template>

<script>
import { ENDPOINTS } from '../../lib/api/endpoints';
import { useApi } from '../../composables/useApi';

export default {
  name: 'OrderComplete',
  data() {
    return {
      api: null,
      bookingInfo: {
        bookingNumber: '',
        eventName: '',
        eventDate: '',
        venue: '',
        seatInfo: '',
        ticketCount: 0,
        totalPrice: 0,
        paymentMethod: ''
      },
      tickets: [],
      currentTicketIndex: 0,
      accountInfo: {
        bank: '국민은행',
        accountNumber: '123-456-789012',
        holder: '(주)비욘드티켓',
        deadline: '2026.02.28 23:59까지'
      }
    }
  },
  computed: {
    // 서버 기준으로 결제 완료(PAID) + 좌석 상태 SOLD 인 티켓만 노출
    filteredTickets() {
      return this.tickets.filter((t) => t.status === 'SOLD')
    },
    ticketCount() {
      return this.filteredTickets.length
    },
    currentTicket() {
      if (!this.ticketCount) return null
      return this.filteredTickets[Math.min(this.currentTicketIndex, this.ticketCount - 1)]
    }
  },
  created() {
    this.api = useApi()
  },
  async mounted() {
    const raw = localStorage.getItem('orderData');
    if (raw) {
      const { order, payMethod } = JSON.parse(raw);
      const seatNames = (order.seatDetails || []).map(s => s.seatDefName).join(', ');
      this.bookingInfo = {
        bookingNumber: order.uuid,
        eventName: order.concertName,
        eventDate: order.scheduleDate,
        venue: order.venueName,
        seatInfo: seatNames,
        ticketCount: (order.seatDetails || []).length,
        totalPrice: Number(order.amount) + 2000 * (order.seatDetails || []).length,
        paymentMethod: payMethod === 'CARD' ? '신용카드 (결제완료)' : '무통장입금 (입금대기)'
      };
      // 방금 결제 완료된 주문 상세를 다시 조회하여 좌석별 티켓/QR 정보 확보
      if (order.id || order.orderId) {
        try {
          const fresh = await this.api.get(ENDPOINTS.order(order.id || order.orderId));
          if (fresh.status === 'PAID') {
            this.tickets = (fresh.seatDetails || []).map((seat) => ({ ...seat }));
          } else {
            this.tickets = [];
          }
        } catch (_) {
          this.tickets = (order.seatDetails || []).map((seat) => ({ ...seat }));
        }
      } else {
        this.tickets = (order.seatDetails || []).map((seat) => ({ ...seat }));
      }
      localStorage.removeItem('orderData');
    }
  },
  methods: {
    formatPrice(price) {
      return price.toLocaleString('ko-KR');
    },
    goToHome() {
      this.$router.push('/');
    },
    goToMyTicket() {
      this.$router.push('/me/orders');
    },
    prevTicket() {
      if (this.currentTicketIndex > 0) this.currentTicketIndex -= 1
    },
    nextTicket() {
      if (this.currentTicketIndex < this.ticketCount - 1) this.currentTicketIndex += 1
    }
  }
}
</script>

<style scoped>
.payment-complete-wrapper {
  max-width: 600px;
  margin: 40px auto;
  font-family: 'Pretendard', 'Malgun Gothic', sans-serif;
  color: #333;
}

/* 상단 메시지 */
.header-section {
  text-align: center;
  margin-bottom: 40px;
}
.check-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  background-color: #f0f8f1;
  color: #17bb62;
  border-radius: 50%;
  font-size: 24px;
  font-weight: 900;
  -webkit-text-stroke: 1px #17bb62;
  margin-bottom: 16px;
}
.title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 8px 0;
}
.subtitle {
  font-size: 15px;
  color: #666;
  margin: 0;
}
.subtitle-virtual {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #e07000;
}

/* 테이블 영역 */
.info-section {
  margin-bottom: 30px;
}
.section-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #222;
}
.info-table {
  width: 100%;
  border-collapse: collapse;
  border-top: 1px solid #eee;
}
.info-table th, .info-table td {
  padding: 14px 10px;
  border-bottom: 1px solid #eee;
  text-align: left;
  font-size: 14px;
}
.info-table th {
  background-color: #f9f9f9;
  color: #555;
  font-weight: 500;
}
.info-table td {
  color: #222;
}
.deadline {
  color: #e07000;
  font-weight: bold;
}
.highlight {
  color: #ed2126;
  font-weight: bold;
}
.price {
  font-size: 16px;
  font-weight: 700;
  color: #000;
}

/* 모바일 티켓 슬라이더 */
.ticket-slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.ticket-slider-text {
  font-size: 13px;
  color: #64748b;
}
.ticket-slider-count {
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
}
.ticket-slider {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ticket-slider-viewport {
  flex: 1;
  overflow: hidden;
}
.nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.nav-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.nav-btn:not(:disabled):hover {
  background: #f8fafc;
}
.ticket-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 14px;
  background: #f8fafc;
}
.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}
.ticket-seat-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}
.ticket-seat-name {
  margin-top: 2px;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}
.ticket-status {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: #22c55e1a;
  color: #15803d;
}
.ticket-body {
  margin-top: 4px;
}
.ticket-number-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}
.ticket-number {
  margin-top: 2px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 11px;
  color: #0f172a;
  word-break: break-all;
}
.ticket-qr {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}
.ticket-qr img {
  width: 110px;
  height: 110px;
  object-fit: contain;
  border-radius: 12px;
  background: #fff;
  padding: 6px;
  border: 1px solid #e2e8f0;
}
.ticket-qr-placeholder {
  width: 110px;
  height: 110px;
  border-radius: 12px;
  border: 1px dashed #cbd5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #94a3b8;
  background: #f8fafc;
}
/* 슬라이드 전환 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(8px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
/* 페이지 도트 */
.ticket-dots {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
}
.ticket-dots .dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #cbd5f5;
  border: none;
  padding: 0;
}
.ticket-dots .dot.active {
  width: 12px;
  background: #0f172a;
}

/* 버튼 영역 */
.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 40px;
}
.btn {
  width: 180px;
  height: 48px;
  font-size: 15px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-home {
  background-color: #fff;
  border: 1px solid #ccc;
  color: #333;
}
.btn-home:hover {
  background-color: #f5f5f5;
}
.btn-ticket {
  background-color: #ed2126; /* 인터파크 레드 */
  border: 1px solid #ed2126;
  color: #fff;
}
.btn-ticket:hover {
  background-color: #d11c21;
}
</style>