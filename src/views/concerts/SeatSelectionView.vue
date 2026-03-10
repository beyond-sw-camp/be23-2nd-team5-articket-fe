<template>
  <div class="mx-auto max-w-7xl p-4 py-10 md:p-8">
    <h1 class="text-2xl font-bold mb-6 text-slate-900">좌석 선택</h1>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- 좌석 배치도 영역 -->
      <div class="flex-1">
        <div class="relative w-full h-[600px] bg-slate-100 border border-slate-300 overflow-auto rounded-xl shadow-inner">
          
          <!-- 로딩 중 표시 -->
          <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <span class="text-slate-500 font-medium">좌석 정보를 불러오는 중...</span>
          </div>

          <!-- 스테이지(무대) 렌더링 -->
          <div
            v-if="stageInfo"
            class="absolute bg-slate-800 text-white flex items-center justify-center text-sm font-bold shadow-md"
            :style="getStageStyle()"
          >
            STAGE
          </div>

          <!-- 구역(Section) 단위 렌더링 -->
          <div
            v-for="section in groupedSections"
            :key="section.sectionId"
            class="absolute border border-blue-200 bg-blue-50/30 transition-all duration-300"
            :style="getSectionStyle(section)"
          >
            <!-- 구역 이름 -->
            <div class="absolute -top-6 left-0 w-full text-center text-xs font-bold text-slate-500 whitespace-nowrap">
              {{ section.sectionName }}
            </div>

            <!-- 열 번호 (Row Numbers) -->
            <div v-for="row in section.rows" :key="row" 
                 class="absolute text-[10px] text-slate-400 font-bold flex items-center justify-end w-4"
                 :style="{
                   left: '-20px',
                   top: `${(row - 1) * (seatSize + seatGap)}px`,
                   height: `${seatSize}px`
                 }">
              {{ row }}
            </div>

            <!-- 구역 내 좌석들 -->
            <div class="relative">
              <button
                v-for="seat in section.seats"
                :key="seat.seatId"
                class="absolute flex items-center justify-center text-[10px] transition-colors shadow-sm"
                :class="getSeatColorClass(seat)"
                :style="getSeatStyle(seat, section)"
                :disabled="seat.status !== 'AVAILABLE'"
                @click="toggleSeat(seat)"
                :title="`${seat.grade}석 ${seat.rowNo}열 ${seat.seatNo}번`"
              >
                <!-- 좌석 번호가 작아서 안 보일 수 있으므로 필요시 숨김 처리 -->
                <span class="scale-75">{{ seat.seatNo }}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- 우측 선택 정보 패널 -->
      <div class="w-full lg:w-80 space-y-4">
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 class="font-bold text-lg mb-3 text-slate-800">선택된 좌석</h3>
          
          <div v-if="selectedSeats.length === 0" class="text-slate-400 text-sm py-4 text-center">
            좌석을 선택해주세요.
          </div>
          
          <ul v-else class="space-y-2 mb-4">
            <li v-for="seat in selectedSeats" :key="seat.seatId" class="flex justify-between items-center text-sm p-2 bg-slate-50 rounded border border-slate-100">
              <div>
                <span class="font-bold text-slate-700">{{ seat.sectionName }}</span>
                <span class="text-slate-500 ml-1">{{ seat.rowNo }}열 {{ seat.seatNo }}번</span>
              </div>
              <div class="font-medium text-blue-600">
                {{ seat.price.toLocaleString() }}원
              </div>
            </li>
          </ul>

          <div class="border-t border-slate-100 pt-3 flex justify-between items-center font-bold text-slate-900">
            <span>총 결제금액</span>
            <span class="text-xl text-blue-600">{{ totalPrice.toLocaleString() }}원</span>
          </div>

          <button 
            class="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
            :disabled="selectedSeats.length === 0"
          >
            예매하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'SeatSelectionView',
  data() {
    return {
      api: null,
      scheduleId: null,
      seatList: [],
      selectedSeats: [],
      stageInfo: null,
      loading: false,
      seatSize: 24, // 좌석 크기 (px)
      seatGap: 4,   // 좌석 간격 (px)
    }
  },
  computed: {
    groupedSections() {
      const sections = {};
      this.seatList.forEach(seat => {
        if (!sections[seat.sectionId]) {
          sections[seat.sectionId] = {
            sectionId: seat.sectionId,
            sectionName: seat.sectionName,
            x: seat.sectionX || 0,
            y: seat.sectionY || 0,
            rotation: seat.sectionRotation || 0,
            shape: seat.sectionShape || 'RECTANGLE',
            seats: [],
            maxSeatNo: 0,
            rows: new Set()
          };
        }
        sections[seat.sectionId].seats.push(seat);
        sections[seat.sectionId].rows.add(seat.rowNo);
        if (seat.seatNo > sections[seat.sectionId].maxSeatNo) {
          sections[seat.sectionId].maxSeatNo = seat.seatNo;
        }
      });
      return Object.values(sections);
    },
    totalPrice() {
      return this.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    }
  },
  created() {
    this.api = useApi();
    // 라우터 파라미터에서 scheduleId 가져오기
    if (this.$route.params.scheduleId) {
      this.scheduleId = this.$route.params.scheduleId;
    }
  },
  mounted() {
    this.fetchSeats();
  },
  methods: {
    async fetchSeats() {
      this.loading = true;
      try {
        // 좌석 조회 API (연령 제한 포함 검증)
        const response = await this.api.get(ENDPOINTS.seats(this.scheduleId), { skipErrorAlert: true });
        this.seatList = Array.isArray(response)
          ? response
          : response?.content ?? response?.items ?? [];

        // 첫 번째 좌석 데이터에서 스테이지 정보 추출 (모든 좌석에 동일하게 포함됨)
        if (this.seatList.length > 0) {
          const first = this.seatList[0];
          this.stageInfo = {
            x: first.stageX || 0,
            y: first.stageY || 0,
            width: first.stageWidth || 300,
            height: first.stageHeight || 100,
            rotation: first.stageRotation || 0
          };
        }
      } catch (err) {
        // 연령 제한/권한 관련 403 처리
        if (err?.status === 403) {
          const data = err.responseData || {};
          const msg =
            data.error_message ||
            data.message ||
            err.message ||
            '좌석을 조회할 수 없습니다.';

          alert(msg);

          if (msg.includes('로그인')) {
            this.$router.push({
              path: '/member/doLogin',
              query: { redirect: this.$route.fullPath },
            });
          } else if (msg.includes('연령 인증')) {
            this.$router.push('/me/verify-identity');
          } else {
            this.$router.back();
          }
          return;
        }

        console.error('좌석 정보를 불러오는데 실패했습니다.', err);
      } finally {
        this.loading = false;
      }
    },
    getStageStyle() {
      if (!this.stageInfo) return {};
      return {
        left: `${this.stageInfo.x}px`,
        top: `${this.stageInfo.y}px`,
        width: `${this.stageInfo.width}px`,
        height: `${this.stageInfo.height}px`,
        transform: `rotate(${this.stageInfo.rotation}deg)`,
        transformOrigin: 'center center'
      };
    },
    getSectionStyle(section) {
      return {
        left: `${section.x}px`,
        top: `${section.y}px`,
        transform: `rotate(${section.rotation}deg)`,
        transformOrigin: 'top left',
      };
    },
    getSeatStyle(seat, section) {
      if (section && section.shape === 'CIRCLE') {
        const radius = seat.rowNo * (this.seatSize + this.seatGap);
        // 최대 좌석 수로 360도를 나눔 (기본값 12)
        const angleStep = 360 / (section.maxSeatNo || 12);
        const angle = (seat.seatNo - 1) * angleStep;
        const radian = angle * (Math.PI / 180);

        return {
          width: `${this.seatSize}px`,
          height: `${this.seatSize}px`,
          left: `${radius * Math.cos(radian)}px`,
          top: `${radius * Math.sin(radian)}px`
        };
      }

      const colIndex = seat.seatNo - 1;
      const rowIndex = seat.rowNo - 1;
      return {
        width: `${this.seatSize}px`,
        height: `${this.seatSize}px`,
        left: `${colIndex * (this.seatSize + this.seatGap)}px`,
        top: `${rowIndex * (this.seatSize + this.seatGap)}px`
      };
    },
    getSeatColorClass(seat) {
  const isSelected = this.selectedSeats.some(s => s.seatId === seat.seatId);
    if (isSelected) return 'bg-purple-600 text-white border border-purple-600 z-10 ring-2 ring-purple-200';

    // 선점중(HELD) 전용 색상: VIP와 겹치지 않게 slate 계열
    if (seat.status === 'HELD') return 'bg-slate-700 text-white border border-slate-900';

    // 그 외 비가용 좌석
    if (seat.status !== 'AVAILABLE') return 'bg-slate-300 text-slate-400 cursor-not-allowed border border-slate-300';

    if (seat.grade === 'VIP') return 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200';
    if (seat.grade === 'R') return 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200';
    if (seat.grade === 'S') return 'bg-sky-100 text-sky-700 border border-sky-300 hover:bg-sky-200';
    if (seat.grade === 'A') return 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200';
    if (seat.grade === 'B') return 'bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200';
    return 'bg-slate-200 text-slate-700 border border-slate-400 hover:bg-slate-300'; // C, 기타
  },
    toggleSeat(seat) {
      const index = this.selectedSeats.findIndex(s => s.seatId === seat.seatId);
      if (index === -1) {
        this.selectedSeats.push(seat);
      } else {
        this.selectedSeats.splice(index, 1);
      }
    }
  }
}
</script>