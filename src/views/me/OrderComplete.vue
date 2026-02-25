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

    <div class="button-group">
      <button class="btn btn-home" @click="goToHome">홈으로 가기</button>
      <button class="btn btn-ticket" @click="goToMyTicket">예매내역 확인</button>
    </div>
  </div>
</template>

<script>
import { ENDPOINTS } from '../../lib/api/endpoints';

export default {
  name: 'OrderComplete',
  data() {
    return {
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
      accountInfo: {
        bank: '국민은행',
        accountNumber: '123-456-789012',
        holder: '(주)비욘드티켓',
        deadline: '2026.02.28 23:59까지'
      }
    }
  },
  mounted() {
    const raw = localStorage.getItem('orderData');
    if (raw) {
      const { order, payMethod } = JSON.parse(raw);
      const seatNames = order.seatDetails.map(s => s.seatDefName).join(', ');
      this.bookingInfo = {
        bookingNumber: order.uuid,
        eventName: order.concertName,
        eventDate: order.scheduleDate,
        venue: order.venueName,
        seatInfo: seatNames,
        ticketCount: order.seatDetails.length,
        totalPrice: Number(order.amount) + 2000 * order.seatDetails.length,
        paymentMethod: payMethod === 'CARD' ? '신용카드 (결제완료)' : '무통장입금 (입금대기)'
      };
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