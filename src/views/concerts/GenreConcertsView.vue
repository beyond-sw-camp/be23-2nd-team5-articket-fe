<template>
  <!-- ── 콘서트: 멜론 티켓 스타일 ── -->
  <div v-if="genre === 'CONCERT'" class="melon-ticket-wrap">
    <main class="melon-main">
      <h2 class="page-title">콘서트</h2>

      <section class="featured-section">
        <div class="featured-card" v-for="item in featuredItems" :key="'feat-'+item.id">
          <div class="melon-img-placeholder">IMG</div>
          <div class="info">
            <h3 class="title">{{ item.title }}</h3>
            <p class="location">{{ item.location }}</p>
          </div>
        </div>
      </section>

      <div class="filter-wrap">
        <div class="filter-tabs">
          <button class="active">전체</button>
        </div>
      </div>

      <div class="sort-bar">
        <div class="view-types">
          <button class="view-btn list-view">▤</button>
          <button class="view-btn grid-view active">▦</button>
        </div>
        <div class="sort-options">
          <span class="active">인기순</span>
          <span class="divider">|</span>
          <span>관람평순</span>
          <span class="divider">|</span>
          <span>최신순</span>
        </div>
      </div>

      <section class="melon-grid-section">
        <div class="melon-grid-card" v-for="item in gridItems" :key="'grid-'+item.id">
          <div class="melon-img-placeholder">IMG</div>
          <div class="info">
            <h4 class="title">{{ item.title }}</h4>
            <p class="date">{{ item.date }}</p>
            <p class="location">{{ item.location }}</p>
            <span class="status-badge" :class="{ booking: item.status === '예매중' }">
              {{ item.status }}
            </span>
          </div>
        </div>
      </section>
    </main>

    <footer class="melon-footer">
      <div class="footer-top">
        <ul class="footer-links">
          <li>회사소개</li>
          <li>이용약관</li>
          <li><strong>개인정보처리방침</strong></li>
          <li>청소년보호정책</li>
          <li>이메일주소무단수집거부</li>
        </ul>
        <div class="cs-info">고객센터 1899-0042</div>
      </div>
      <div class="footer-bottom">
        <div class="company-info">
          <p>카카오엔터테인먼트 | 대표이사 : 권기수, 장윤중 | 주소 : 경기도 성남시 분당구 판교역로 221</p>
          <p>사업자등록번호 : 220-81-62517 | 통신판매업신고 : 제 2018-성남분당-0210호</p>
          <p>Copyright © Kakao Entertainment Corp. All rights reserved.</p>
        </div>
        <div class="cert-logos">
          <span class="cert-box">ISMS</span>
          <span class="cert-box">가족친화우수기업</span>
        </div>
      </div>
    </footer>
  </div>

  <!-- ── 그 외 장르: 인터파크 스타일 ── -->
  <div v-else class="interpark-ticket-page">
    <main class="main-content">
      <section class="hero-section">
        <button class="nav-btn prev">&lt;</button>
        <div class="hero-cards">
          <div class="hero-card" v-for="item in heroItems" :key="item.id">
            <div class="image-placeholder">IMG</div>
            <div class="hero-info">
              <h3>{{ item.title }}</h3>
              <p>{{ item.location }}</p>
              <p>{{ item.date }}</p>
            </div>
          </div>
        </div>
        <button class="nav-btn next">&gt;</button>
      </section>

      <section class="tags-section">
        <button class="tag" v-for="tag in tags" :key="tag"># {{ tag }}</button>
      </section>

      <section class="banner-section">
        <div class="banner-placeholder blue">배너 1</div>
        <div class="banner-placeholder dark">배너 2</div>
        <div class="banner-placeholder pink">배너 3</div>
      </section>

      <section class="list-section">
        <h2 class="section-title">지금 할인중!</h2>
        <div class="grid-container cols-6">
          <div class="card" v-for="item in discountItems" :key="item.id">
            <div class="card-img-placeholder">IMG</div>
            <div class="card-info">
              <h4 class="title">{{ item.title }}</h4>
              <p class="location">{{ item.location }}</p>
              <div class="price-info">
                <span class="discount">{{ item.discount }}%</span>
                <span class="price">{{ item.price }}원</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="list-section">
        <h2 class="section-title">오픈 예정</h2>
        <div class="grid-container cols-5">
          <div class="card" v-for="item in upcomingItems" :key="item.id">
            <div class="card-img-placeholder">IMG</div>
            <div class="card-info">
              <span class="open-date">{{ item.openDate }} 오픈</span>
              <h4 class="title">{{ item.title }}</h4>
              <p class="location">{{ item.location }}</p>
            </div>
          </div>
        </div>
        <div class="btn-wrap center">
          <button class="more-btn">오픈 예정 공연 전체보기 &gt;</button>
        </div>
      </section>

      <section class="list-section">
        <h2 class="section-title">아동/가족 둘러보기</h2>
        <div class="tabs">
          <button class="tab" v-for="tab in browseTabs" :key="tab.id" :class="{ active: tab.active }">
            {{ tab.name }}
          </button>
        </div>
        <div class="grid-container cols-5">
          <div class="card" v-for="item in browseItems" :key="item.id">
            <div class="card-img-placeholder">IMG</div>
            <div class="card-info">
              <h4 class="title">{{ item.title }}</h4>
              <p class="location">{{ item.location }}</p>
              <p class="date">{{ item.date }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="footer-links">
        <span>회사소개</span>
        <span>이용약관</span>
        <span>개인정보처리방침</span>
        <span>청소년보호정책</span>
        <span>고객센터</span>
      </div>
      <div class="footer-info">
        <p>(주)인터파크트리플 | 대표이사 : 최휘영 | 사업자등록번호 : 824-81-02515</p>
        <p>서울특별시 서초구 강남대로 447 (서초동, 남서울빌딩)</p>
        <p>고객센터 : 1544-1555 (평일 09:00~18:00)</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const genre = computed(() => route.params.genre);

// ── 멜론 (CONCERT) 데이터 ──
const featuredItems = ref([
  { id: 1, title: '[얼리버드] 앤디 워홀 : 더 비즈니스...', location: '현대백화점 판교점 10층 토파즈홀' },
  { id: 2, title: '<울트라 백화점> 서울 V2.0', location: '현대백화점 신촌점 U-PLEX' },
  { id: 3, title: '[부산] 하리보 해피월드 인...', location: '하리보 해피월드 (부산)' },
  { id: 4, title: 'NIKE 2nd Exhibition', location: '성수동 대림창고 갤러리 코오롱' },
]);

const gridItems = ref([
  { id: 1, title: 'NIKE 2nd Exhibition', date: '2024.03.01 ~ 2024.06.30', location: '성수동 대림창고', status: '예매중' },
  { id: 2, title: '유미의 세포들 특별전', date: '2024.02.15 ~ 2024.05.20', location: '그라운드시소 서촌', status: '예매중' },
  { id: 3, title: '클림트, 빛과 색채의 교향곡', date: '2024.01.10 ~ 2024.04.10', location: '예술의전당 한가람미술관', status: '예매중' },
  { id: 4, title: '어느 봄 날의 정원', date: '2024.03.15 ~ 2024.05.31', location: '서울식물원', status: '판매예정' },
  { id: 5, title: 'ROOM FOR WONDER', date: '2024.04.01 ~ 2024.08.31', location: 'DDP 동대문디자인플라자', status: '예매중' },
  { id: 6, title: '앤디 워홀 : THE BUSINESS OF ART', date: '2024.02.01 ~ 2024.06.30', location: '현대백화점 판교점', status: '예매중' },
  { id: 7, title: '요하네스 페르메이르 전', date: '2024.05.01 ~ 2024.09.30', location: '국립중앙박물관', status: '판매예정' },
  { id: 8, title: '미피와 마법우체통', date: '2024.01.20 ~ 2024.04.30', location: 'AK플라자 수원', status: '예매중' },
  { id: 9, title: '우주, 낯선 세계', date: '2024.03.01 ~ 2024.07.31', location: '과천과학관', status: '예매중' },
  { id: 10, title: '구스타프 클림트 특별전', date: '2024.02.10 ~ 2024.05.10', location: '빛의 벙커 제주', status: '예매중' },
  { id: 11, title: '<울트라 백화점> 서울 V2.0', date: '2024.01.15 ~ 2024.03.31', location: '현대백화점 신촌점', status: '예매중' },
  { id: 12, title: '윌리를 찾아라', date: '2024.04.10 ~ 2024.08.10', location: '롯데월드타워 뮤지엄', status: '예매중' },
  { id: 13, title: '따뜻한 하루의 온도', date: '2024.02.01 ~ 2024.04.30', location: 'K현대미술관', status: '예매중' },
  { id: 14, title: 'The Great Exhibition', date: '2024.03.10 ~ 2024.06.20', location: '세종문화회관', status: '예매중' },
  { id: 15, title: '플라워 바이 네이키드', date: '2024.01.01 ~ 2024.12.31', location: 'AK&홍대', status: '예매중' },
  { id: 16, title: '요시고 사진전', date: '2024.02.20 ~ 2024.07.20', location: '그라운드시소 서촌', status: '예매중' },
]);

// ── 인터파크 (기타 장르) 데이터 ──
const tags = ref(['전체연령관람가', '할인예매', '뮤지컬', '연극', '클래식/무용', '전시/행사']);

const heroItems = ref([
  { id: 1, title: '뮤지컬 <장수탕 선녀님>', location: '서울숲 씨어터', date: '2023.09.15 ~ 2024.03.03' },
  { id: 2, title: '알사탕 - 서울숲', location: '서울숲 씨어터 1관', date: '2023.09.01 ~ 2024.03.03' },
  { id: 3, title: '아주아주 배고픈 애벌레', location: 'KT&G 상상마당 대치아트홀', date: '2023.10.07 ~ 2024.03.01' },
  { id: 4, title: '시간을 파는 상점', location: '대학로 파랑씨어터', date: '2024.01.01 ~ 2024.12.31' },
]);

const discountItems = ref([
  { id: 1, title: '번개맨과 블랙홀 대모험', location: '올림픽공원 우리금융아트홀', discount: 40, price: '39,000' },
  { id: 2, title: '설민석의 한국사 대모험', location: '광림아트센터 BBCH홀', discount: 45, price: '33,000' },
  { id: 3, title: '내일은 내일에게', location: '대학로 드림아트센터', discount: 50, price: '20,000' },
  { id: 4, title: '고고다이노 공룡탐험대', location: '성균관대학교 새천년홀', discount: 40, price: '39,600' },
  { id: 5, title: '마술사 최현우의 위대한 마술', location: '올림픽공원 올림픽홀', discount: 40, price: '59,000' },
  { id: 6, title: '퍼포먼스 뮤지컬 <점프>', location: '명보아트홀', discount: 50, price: '30,000' },
]);

const upcomingItems = ref([
  { id: 1, openDate: '03.05 (화) 14:00', title: '2024 가족뮤지컬 <수박수영장> - 대전', location: '대전예술의전당' },
  { id: 2, openDate: '03.06 (수) 14:00', title: '가족뮤지컬 <우리아빠가 최고야> - 광주', location: '광주문화예술회관' },
  { id: 3, openDate: '03.08 (금) 10:00', title: '어린이 뮤지컬 <공룡이 살아있다>', location: '용산아트홀' },
  { id: 4, openDate: '03.11 (월) 14:00', title: '2024 앤서니 브라운 뮤지컬', location: '성남아트센터' },
  { id: 5, openDate: '03.15 (금) 14:00', title: '매직 드로잉 가족극 <두들팝>', location: '인천문화예술회관' },
]);

const browseTabs = ref([
  { id: 1, name: '추천', active: true },
  { id: 2, name: '예매순', active: false },
  { id: 3, name: '최신순', active: false },
  { id: 4, name: '할인', active: false },
  { id: 5, name: '종료임박', active: false },
]);

const browseItems = ref(Array.from({ length: 10 }, (_, i) => ({
  id: i,
  title: `아동/가족 추천 공연 ${i + 1}`,
  location: '서울/경기 전역',
  date: '2024.03.01 ~ 2024.12.31'
})));
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }
ul { list-style: none; }
button { border: none; background: none; cursor: pointer; }

/* ════════════════════════════════
   멜론 티켓 스타일 (CONCERT)
════════════════════════════════ */
.melon-ticket-wrap {
  width: 100%;
}
.melon-main {
  width: 100%;
  margin: 60px 0;
  padding: 0;
}
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 32px;
}
.featured-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;
  margin-bottom: 56px;
}
.melon-img-placeholder {
  background-color: #e9ecef;
  aspect-ratio: 3 / 4;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #adb5bd;
  font-size: 18px;
  font-weight: bold;
  border-radius: 4px;
  margin-bottom: 14px;
}
.featured-card .title { font-size: 15px; font-weight: bold; margin-bottom: 8px; line-height: 1.3; }
.featured-card .location { font-size: 13px; color: #888; }

.filter-wrap {
  border: 1px solid #ddd;
  padding: 18px 24px;
  margin-bottom: 24px;
}
.filter-tabs button {
  font-size: 14px;
  color: #00CD3C;
  font-weight: bold;
  border: 1px solid #00CD3C;
  padding: 4px 12px;
  border-radius: 15px;
}

.sort-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}
.view-types .view-btn { font-size: 20px; color: #ccc; margin-right: 10px; }
.view-types .view-btn.active { color: #00CD3C; }
.sort-options { font-size: 13px; color: #666; }
.sort-options .active { color: #333; font-weight: bold; }
.sort-options .divider { margin: 0 10px; color: #eee; }

.melon-grid-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px 20px;
}
.melon-grid-card .title {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.melon-grid-card .date,
.melon-grid-card .location { font-size: 13px; color: #666; margin-bottom: 4px; }
.status-badge {
  display: inline-block;
  font-size: 12px;
  padding: 2px 6px;
  border: 1px solid #ccc;
  color: #888;
  margin-top: 5px;
}
.status-badge.booking { border-color: #00CD3C; color: #00CD3C; }

.melon-footer {
  border-top: 1px solid #ddd;
  padding: 40px 0;
  margin-top: 60px;
  color: #666;
}
.melon-footer .footer-top {
  max-width: 1008px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
  margin-bottom: 20px;
}
.melon-footer .footer-links { display: flex; gap: 20px; font-size: 14px; }
.cs-info { font-weight: bold; color: #333; }
.melon-footer .footer-bottom {
  max-width: 1008px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  line-height: 1.6;
}
.company-info p { margin-bottom: 4px; }
.cert-logos { display: flex; gap: 10px; align-items: flex-start; }
.cert-box { border: 1px solid #ddd; padding: 4px 8px; border-radius: 4px; font-size: 11px; }

/* ════════════════════════════════
   인터파크 스타일 (기타 장르)
════════════════════════════════ */
.interpark-ticket-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
.hero-section {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 30px;
}
.hero-cards { display: flex; gap: 20px; width: 100%; }
.hero-card { flex: 1; background: #f8f8f8; border-radius: 12px; overflow: hidden; }
.image-placeholder {
  height: 200px;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}
.hero-info { padding: 15px; background: #2b2b2b; color: white; }
.hero-info h3 { font-size: 16px; margin-bottom: 8px; }
.hero-info p { font-size: 12px; color: #ccc; }
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 40px; height: 40px;
  font-size: 18px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.nav-btn.prev { left: -20px; }
.nav-btn.next { right: -20px; }

.tags-section { display: flex; justify-content: center; gap: 10px; margin: 30px 0; }
.tag { padding: 8px 16px; border: 1px solid #ddd; border-radius: 20px; font-size: 14px; }

.banner-section { display: flex; gap: 20px; margin-bottom: 50px; }
.banner-placeholder {
  flex: 1; height: 80px; display: flex;
  align-items: center; justify-content: center;
  border-radius: 8px; color: white; font-weight: bold;
}
.banner-placeholder.blue { background: #00c3ff; }
.banner-placeholder.dark { background: #2c3e50; }
.banner-placeholder.pink { background: #ffb6c1; }

.list-section { margin-bottom: 60px; }
.section-title { text-align: center; font-size: 24px; margin-bottom: 30px; }

.grid-container { display: grid; gap: 20px; }
.cols-6 { grid-template-columns: repeat(6, 1fr); }
.cols-5 { grid-template-columns: repeat(5, 1fr); }

.card { cursor: pointer; }
.card-img-placeholder {
  height: 220px; background: #eee; border-radius: 8px; margin-bottom: 10px;
  display: flex; align-items: center; justify-content: center; color: #aaa;
}
.card-info .title { font-size: 15px; margin-bottom: 5px; line-height: 1.4; }
.card-info .location { font-size: 13px; color: #666; margin-bottom: 5px; }
.card-info .date { font-size: 12px; color: #999; }
.open-date { display: inline-block; color: #1769ff; font-weight: bold; font-size: 13px; margin-bottom: 5px; }
.price-info .discount { color: #ff3b30; font-weight: bold; margin-right: 5px; }
.price-info .price { font-weight: bold; }

.btn-wrap.center { text-align: center; margin-top: 30px; }
.more-btn { padding: 10px 30px; border: 1px solid #ccc; border-radius: 20px; background: white; font-size: 14px; }

.tabs { display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; }
.tab { font-size: 16px; color: #666; padding-bottom: 5px; }
.tab.active { color: #000; font-weight: bold; border-bottom: 2px solid #000; }

.footer { border-top: 1px solid #ddd; padding: 40px 0; margin-top: 50px; }
.footer-links { display: flex; gap: 20px; margin-bottom: 20px; font-weight: bold; font-size: 14px; }
.footer-info p { font-size: 12px; color: #666; margin-bottom: 5px; }
</style>
