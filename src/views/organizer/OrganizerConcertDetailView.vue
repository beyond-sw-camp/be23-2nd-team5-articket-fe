<template>
  <div class="space-y-6">
    <!-- 로딩 중 스켈레톤 -->
    <template v-if="loading">
      <div class="h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
          <div class="h-64 animate-pulse rounded-2xl bg-slate-100" />
          <div class="h-40 animate-pulse rounded-2xl bg-slate-100" />
        </div>
        <div class="h-96 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </template>

    <template v-else-if="item">
      <!-- 상단 헤더 & 핵심 액션 -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <UiButton variant="ghost" class="-ml-2 h-8 px-2 text-xs text-slate-500" @click="$router.push('/organizer/concerts')">
            <ChevronLeft class="mr-1 h-4 w-4" /> 목록으로 돌아가기
          </UiButton>
          <div class="mt-1 flex items-center gap-3">
            <h1 class="mgmt-page-title">{{ item.title }}</h1>
            <UiBadge :tone="statusTone(item.status)" :color="statusColor(item.status)">
              {{ statusLabel(item.status) }}
            </UiBadge>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UiButton variant="ghost" class="h-10 border border-slate-200 bg-white px-4 text-slate-600" @click="$router.push(`/organizer/concerts/${item.id}/policies`)">
            <Settings class="mr-2 h-4 w-4 text-slate-500" /> 정책 설정
          </UiButton>
          <UiButton variant="ghost" class="h-10 border border-slate-200 bg-white px-4 text-slate-600" @click="$router.push(`/organizer/concerts/${item.id}/performers`)">
            <Users class="mr-2 h-4 w-4 text-slate-500" /> 메인 캐스트
          </UiButton>
          <UiButton variant="ghost" class="h-10 border border-slate-200 bg-white px-4 text-slate-600" @click="$router.push(`/organizer/concerts/${item.id}/edit`)">
            <Pencil class="mr-2 h-4 w-4 text-slate-500" /> 정보 수정
          </UiButton>
            <UiButton
              v-if="canHideConcert"
              color="red"
              class="h-10 px-6 shadow-lg shadow-red-100"
              @click="hideConcert"
            >
              사용자 화면에서 숨기기
            </UiButton>

            <UiButton
              v-if="canShowConcert"
              color="red"
              class="h-10 px-6 shadow-lg shadow-red-100"
              @click="showConcert"
            >
              사용자 화면에 다시 노출
            </UiButton>
        </div>
      </div>

      <!-- 메인 관리 대시보드 레이아웃 -->
      <div class="grid gap-6 lg:grid-cols-3">
        
        <!-- 왼쪽 컬럼: 회차 관리 & 이미지 -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- 회차 관리 섹션 (기존 회차 페이지 데이터 완전 통합) -->
          <UiCard class="border-slate-200 shadow-sm">
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 class="mgmt-section-title">공연 회차 관리</h2>
                <p class="mgmt-section-subtitle">회차별 예매 기간, 판매 현황 및 출연진을 관리합니다.</p>
              </div>
              <UiButton variant="solid" color="red" class="h-9 px-4 text-xs font-bold shadow-sm" @click="openCreateModal">
                + 새 회차 등록
              </UiButton>
            </div>

            <div v-if="schedulesLoading" class="py-12 text-center text-sm text-slate-400">회차 정보를 불러오는 중...</div>
            <div v-else-if="!schedules.length" class="py-12 text-center text-sm text-slate-400">등록된 회차가 없습니다. 회차를 추가해 주세요.</div>
            <div v-else class="overflow-hidden">
              <UiTable :columns="scheduleColumns" :rows="schedules">
                <!-- 공연 일시 -->
                <template #cell:playTime="{ row }">
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-800">{{ formatDateTime(row.playTime) }}</span>
                    <span class="text-[10px] text-slate-400">ID: {{ row.id }}</span>
                  </div>
                </template>

                <!-- 예매 기간 (추가됨) -->
                <template #cell:bookingPeriod="{ row }">
                  <div class="flex flex-col text-[11px] leading-tight text-slate-500">
                    <span>시작: {{ formatDateTime(row.bookingStart) }}</span>
                    <span>종료: {{ formatDateTime(row.bookingEnd) }}</span>
                  </div>
                </template>

                <!-- 상태 -->
                <template #cell:status="{ row }">
                  <UiBadge :tone="row.status === 'OPEN' || row.status === 'AVAILABLE' ? 'solid' : 'soft'" :color="row.status === 'OPEN' || row.status === 'AVAILABLE' ? 'red' : 'slate'">
                    {{ row.status }}
                  </UiBadge>
                </template>

                <!-- 예매 현황 (상세 수치 포함) -->
                <template #cell:occupancy="{ row }">
                  <div class="flex flex-col gap-1.5 min-w-[100px]">
                    <div class="flex justify-between items-center text-[10px] font-bold">
                      <span class="text-slate-400">{{ row.occupancy }}%</span>
                      <span class="text-slate-700">{{ (row.sold || 0).toLocaleString() }} / {{ (row.total || 0).toLocaleString() }}석</span>
                    </div>
                    <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div class="h-full rounded-full bg-red-500 transition-all duration-500" :style="{ width: `${row.occupancy}%` }" />
                    </div>
                  </div>
                </template>

                <!-- 작업 -->
                <template #cell:actions="{ row }">
                  <div class="flex items-center gap-1">
                    <UiButton variant="ghost" class="h-7 px-2 text-[10px] font-bold text-slate-600 hover:bg-slate-100" @click="$router.push(`/organizer/schedules/${row.id}/performers`)">
                      출연진
                    </UiButton>
                    <UiButton
                      variant="ghost"
                      class="h-7 px-2 text-[10px] font-bold"
                      :class="row.status === 'DRAFT' ? 'text-slate-400' : 'text-slate-300 cursor-not-allowed'"
                      :disabled="row.status !== 'DRAFT'"
                      @click="row.status === 'DRAFT' && openEditModal(row)"
                    >
                      수정
                    </UiButton>
                    <UiButton
                      v-if="row.status === 'DRAFT' || row.status === 'READY'"
                      variant="ghost"
                      class="h-7 px-2 text-[10px] font-bold text-red-500"
                      @click="deleteSchedule(row)"
                    >
                      삭제
                    </UiButton>
                  </div>
                </template>
              </UiTable>
            </div>
          </UiCard>

          <!-- 공연 정보 요약 카드 -->
          <UiCard class="overflow-hidden !p-0 shadow-sm border-slate-200">
            <div class="flex flex-col sm:flex-row">
              <div class="relative w-full sm:w-48 shrink-0 bg-slate-100">
                <img :src="item.thumImgUrl" class="aspect-[3/4] h-full w-full object-cover" @error="onThumbError" />
              </div>
              <div class="flex-1 p-5">
                <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 class="mgmt-section-title">기본 정보</h2>
                  <span class="text-[10px] font-medium text-slate-400">ID: {{ item.id }}</span>
                </div>
                <div class="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
                  <div>
                    <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">공연 장소</p>
                    <p class="mt-1 font-semibold text-slate-700">{{ item.venue?.name || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">카테고리</p>
                    <p class="mt-1 font-semibold text-slate-700">{{ categoryLabel(item.category) }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">공연 기간</p>
                    <p class="mt-1 font-semibold text-slate-700 text-xs leading-tight">
                      {{ formatDate(item.scheduleStartDate) }} ~ {{ formatDate(item.scheduleEndDate) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">티켓 오픈</p>
                    <p class="mt-1 font-semibold text-slate-700 text-xs">
                      {{ formatDateTime(item.ticketingOpenAt) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </UiCard>

          <!-- 상세 설명 이미지 -->
          <div v-if="item.detailImgUrls && item.detailImgUrls.length > 0">
            <div class="mb-3 flex items-center justify-between px-1">
              <h2 class="mgmt-section-title">상세 설명 이미지 ({{ item.detailImgUrls.length }})</h2>
              <p class="text-[10px] text-slate-400">* 사용자 앱 노출 이미지</p>
            </div>
            <div class="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              <div v-for="(url, idx) in item.detailImgUrls" :key="idx" 
                class="h-36 w-56 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition hover:scale-[1.02] hover:border-red-200"
              >
                <img :src="url" class="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <!-- 오른쪽 컬럼: 판매 통계 & 소셜 지표 -->
        <div class="space-y-6">
          
          <!-- 판매 현황 요약 카드 -->
          <UiCard class="shadow-xl shadow-slate-200/50 border-slate-200">
            <div class="flex items-center justify-between">
              <h2 class="mgmt-section-title">전체 판매 지표</h2>
              <UiButton variant="ghost" class="h-7 px-2 text-[10px] text-slate-500" @click="$router.push(`/organizer/concerts/${item.id}/orders`)">
                주문 상세 <ChevronRight class="ml-1 h-3 w-3" />
              </UiButton>
            </div>

            <div class="mt-6 flex flex-col items-center">
              <div class="relative flex h-36 w-36 items-center justify-center">
                <svg class="h-full w-full -rotate-90 transform">
                  <circle cx="72" cy="72" r="64" stroke="currentColor" stroke-width="12" fill="transparent" class="text-slate-100" />
                  <circle cx="72" cy="72" r="64" stroke="currentColor" stroke-width="12" fill="transparent" 
                    class="text-red-500 transition-all duration-1000 ease-out" 
                    :style="{ strokeDasharray: 402, strokeDashoffset: 402 - (402 * (stats?.occupancyRate || 0)) / 100 }" />
                </svg>
                <div class="absolute text-center">
                  <span class="text-3xl font-black text-slate-900">{{ occupancyDisplay }}</span>
                  <p class="text-[10px] font-bold text-slate-400">누적 점유율</p>
                </div>
              </div>
            </div>

            <div class="mt-8 space-y-2">
              <div class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span class="text-xs font-bold text-slate-500">총 좌석</span>
                <span class="text-sm font-black text-slate-900">{{ (stats?.totalSeats || 0).toLocaleString() }}석</span>
              </div>
              <div class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span class="text-xs font-bold text-slate-500">판매 완료</span>
                <span class="text-sm font-black">{{ (stats?.soldSeats || 0).toLocaleString() }}석</span>
              </div>
              <div class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span class="text-xs font-bold text-slate-500">예약 중 (Hold)</span>
                <span class="text-sm font-black">{{ (stats?.reservedSeats || 0).toLocaleString() }}석</span>
              </div>
            </div>
          </UiCard>

          <!-- 소셜 반응 카드 -->
          <UiCard class="border-slate-200">
            <h2 class="mgmt-section-title">소셜 반응</h2>
            <div class="mt-4 grid grid-cols-2 gap-3">
              <div class="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-center">
                <Heart class="mx-auto mb-1 h-5 w-5 text-red-500 fill-red-50" />
                <p class="text-lg font-black text-slate-900">{{ (item.likeCount || 0).toLocaleString() }}</p>
                <p class="text-[10px] font-bold text-slate-400">좋아요</p>
              </div>
              <div class="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-center">
                <MessageSquare class="mx-auto mb-1 h-5 w-5 text-amber-500" />
                <p class="text-lg font-black text-slate-900">{{ (item.reviewCount || 0).toLocaleString() }}</p>
                <p class="text-[10px] font-bold text-slate-400">리뷰 수</p>
              </div>
            </div>
          </UiCard>

          <!-- 좌석맵 퀵 링크 -->
          <button @click="openSeatMapPreview" class="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-red-300 shadow-sm group">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-red-50 group-hover:text-red-600">
                  <Ticket class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-xs font-black text-slate-900 uppercase leading-none">Seat Map</p>
                  <p class="text-[10px] text-slate-400 mt-1">배치도 미리보기</p>
                </div>
              </div>
              <ChevronRight class="h-5 w-5 text-slate-300 group-hover:text-red-400" />
            </div>
          </button>

        </div>
      </div>
    </template>

    <EmptyState v-else title="공연을 찾을 수 없습니다" description="존재하지 않거나 권한이 없는 공연일 수 있습니다.">
      <UiButton class="mt-3" @click="$router.push('/organizer/concerts')">목록으로</UiButton>
    </EmptyState>

    <!-- 회차 생성 모달 -->
    <UiModal :open="createScheduleModalOpen" title="회차 생성" @close="closeCreateModal">
      <form id="schedule-create-form" class="grid gap-4" @submit.prevent="submitCreateSchedule">
        <div v-if="scheduleFormError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ scheduleFormError }}
        </div>

        <div class="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button type="button" :class="['flex-1 rounded-lg py-1.5 text-xs font-semibold transition', !bulkMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400']" @click="bulkMode = false">
            단일 날짜
          </button>
          <button type="button" :class="['flex-1 rounded-lg py-1.5 text-xs font-semibold transition', bulkMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400']" @click="bulkMode = true">
            여러 날짜 (일괄 등록)
          </button>
        </div>

        <div v-if="!bulkMode">
          <label class="block text-xs font-semibold text-slate-500">공연 시작 시간 *</label>
          <input v-model="scheduleForm.playTime" type="datetime-local" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-red-500 outline-none shadow-sm" required />
        </div>

        <div v-else>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-xs font-semibold text-slate-500">공연 날짜 목록 *</label>
            <button type="button" class="text-xs text-red-500 font-bold hover:underline" @click="addBulkPlayTime">+ 날짜 추가</button>
          </div>
          <div class="max-h-48 overflow-y-auto pr-1 space-y-2">
            <div v-for="(pt, idx) in bulkScheduleForm.playTimes" :key="idx" class="flex items-center gap-2">
              <input v-model="bulkScheduleForm.playTimes[idx]" type="datetime-local" class="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-red-500 outline-none shadow-sm" required />
              <button v-if="bulkScheduleForm.playTimes.length > 1" type="button" class="text-slate-400 hover:text-red-500 transition-colors" @click="removeBulkPlayTime(idx)">
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500">예매 오픈 *</label>
            <input
              v-model="scheduleForm.bookingStart"
              type="datetime-local"
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-red-500 outline-none shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
              :disabled="hasExistingSchedules"
              required
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500">예매 마감 *</label>
            <input
              v-model="scheduleForm.bookingEnd"
              type="datetime-local"
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-red-500 outline-none shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
              :disabled="hasExistingSchedules"
              required
            />
          </div>
        </div>

      <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div class="flex items-center justify-between gap-3">
          <span class="text-sm font-semibold text-slate-500">회차 공개 상태</span>
          <span
            class="inline-flex items-center rounded-full px-2.5 py-1 text-sm font-bold"
            :class="scheduleStatusRule.allowedStatus === 'DRAFT'
              ? 'bg-slate-200 text-slate-700'
              : 'bg-amber-100 text-amber-700'"
          >
            {{ scheduleStatusRule.label }}
          </span>
        </div>
        <p class="mt-2 text-sm text-slate-500 whitespace-pre-line">
          {{ createScheduleBookingGuide }}
        </p>
      </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeCreateModal">취소</UiButton>
          <UiButton as="button" type="submit" form="schedule-create-form" color="red" :disabled="creatingSchedule" class="px-8 font-bold">회차 생성</UiButton>
        </div>
      </template>
    </UiModal>

    <!-- 회차 수정 모달 -->
    <UiModal :open="editScheduleModalOpen" title="회차 수정" @close="closeEditModal">
      <form id="schedule-edit-form" class="grid gap-4" @submit.prevent="submitEditSchedule">
        <div v-if="editScheduleFormError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ editScheduleFormError }}
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-500">공연 시작 시간 *</label>
          <input v-model="editScheduleForm.playTime" type="datetime-local" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-red-500 outline-none shadow-sm" required />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500">예매 오픈 *</label>
            <input
              v-model="editScheduleForm.bookingStart"
              type="datetime-local"
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-red-500 outline-none shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
              :disabled="hasMultipleSchedules"
              required
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500">예매 마감 *</label>
            <input
              v-model="editScheduleForm.bookingEnd"
              type="datetime-local"
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-red-500 outline-none shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
              :disabled="hasMultipleSchedules"
              required
            />
          </div>
        </div>

      <div>
        <label class="block text-xs font-semibold text-slate-500">상태 *</label>
        <select
          v-model="editScheduleForm.status"
          class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-red-500 outline-none shadow-sm"
        >
          <option
            v-for="option in editScheduleStatusOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <p class="mt-2 text-xs text-slate-500">
          {{ editScheduleStatusRule.help }}
        </p>
      </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeEditModal">취소</UiButton>
          <UiButton as="button" type="submit" form="schedule-edit-form" color="red" :disabled="editingSchedule" class="px-8 font-bold">수정 저장</UiButton>
        </div>
      </template>
    </UiModal>

    <!-- 좌석맵 미리보기 모달 -->
    <UiModal :open="seatMapPreviewOpen" title="좌석맵 보기" max-width-class="max-w-6xl" @close="closeSeatMapPreview">
      <div v-if="seatMapPreview" class="flex h-[75vh] flex-col">
        <div class="relative w-full flex-1 select-none overflow-hidden rounded-lg bg-slate-50 p-2"
          :class="isPreviewDragging ? 'cursor-grabbing' : 'cursor-grab'"
          @wheel.prevent="onPreviewWheel" @mousedown.left="startPreviewDrag" @mousemove="onPreviewDrag" @mouseup="endPreviewDrag" @mouseleave="endPreviewDrag"
        >
          <img v-if="seatMapPreview.thumbnailUrl || seatMapPreview.thumbnail_url" 
            :src="seatMapPreview.thumbnailUrl || seatMapPreview.thumbnail_url" class="block h-full w-full rounded-lg object-contain transition-transform duration-75"
            :style="{ transform: `translate(${previewOffsetX}px, ${previewOffsetY}px) scale(${previewScale})`, transformOrigin: 'center center' }"
            draggable="false" @dragstart.prevent
          />
        </div>
        <div class="mt-3 flex items-center justify-between px-2">
          <p class="text-sm font-bold text-slate-600">{{ seatMapPreview.name }}</p>
          <div class="flex items-center gap-2">
            <UiButton variant="ghost" class="h-8 px-3 text-xs" @click="resetPreviewZoom">100%</UiButton>
            <UiButton variant="ghost" class="h-8 px-3 text-xs font-bold text-red-600" @click="closeSeatMapPreview">닫기</UiButton>
          </div>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script>
import { 
  ChevronLeft, ChevronRight, MapPin, Ticket, Settings, 
  CalendarDays, Send, Receipt, Pencil, Users, Heart, MessageSquare, X 
} from 'lucide-vue-next'
import UiCard from '../../components/common/UiCard.vue'
import UiTable from '../../components/common/UiTable.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import UiModal from '../../components/common/UiModal.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { getCategoryLabel } from '../../lib/constants/concertCategory'

export default {
  name: 'OrganizerConcertDetailView',
  components: {
    ChevronLeft, ChevronRight, MapPin, Ticket, Settings, 
    CalendarDays, Send, Receipt, Pencil, Users, Heart, MessageSquare, X,
    UiCard, UiTable, UiButton, UiBadge, EmptyState, UiModal
  },
  data() {
    return {
      loading: false,
      item: null,
      stats: null,
      api: null,
      seatMapPreviewOpen: false,
      seatMapPreview: null,
      previewScale: 1,
      previewOffsetX: 0,
      previewOffsetY: 0,
      isPreviewDragging: false,
      previewDragStartX: 0,
      previewDragStartY: 0,
      managementMenus: [
        { label: '정책 설정', icon: 'Settings', path: (id) => `/organizer/concerts/${id}/policies` },
        { label: '메인 캐스트', icon: 'Users', path: (id) => `/organizer/concerts/${id}/performers` },
        { label: '주문 현황', icon: 'Receipt', path: (id) => `/organizer/concerts/${id}/orders` },
      ],

      // 회차 관리 관련 상태 (기존 회차 페이지 데이터와 100% 매칭)
      schedules: [],
      schedulesLoading: false,
      scheduleColumns: [
        { key: 'playTime', label: '공연 일시' },
        { key: 'bookingPeriod', label: '예매 기간' },
        { key: 'status', label: '상태' },
        { key: 'occupancy', label: '예매율/판매현황' },
        { key: 'actions', label: '작업' }
      ],
      createScheduleModalOpen: false,
      creatingSchedule: false,
      bulkMode: false,
      scheduleForm: this.getDefaultScheduleForm(),
      bulkScheduleForm: {
        playTimes: [this.getDefaultDateTime()]
      },
      scheduleFormError: '',

      editScheduleModalOpen: false,
      editingSchedule: false,
      editScheduleId: null,
      editScheduleForm: { playTime: '', bookingStart: '', bookingEnd: '', status: 'DRAFT' },
      editScheduleFormError: ''
    }
  },

  computed: {
    occupancyDisplay() {
      const rate = this.stats?.occupancyRate
      return (rate == null || Number.isNaN(rate)) ? '0%' : `${Number(rate).toFixed(1)}%`
    },
    hasExistingSchedules() {
    return Array.isArray(this.schedules) && this.schedules.length > 0
    },
    baseScheduleBookingWindow() {
      if (!this.hasExistingSchedules) return null

      const base = this.schedules[0]
      return {
        bookingStart: base.bookingStart ?? '',
        bookingEnd: base.bookingEnd ?? ''
      }
    },
    createScheduleBookingGuide() {
      const baseGuide = this.hasExistingSchedules
        ? '기존 회차가 있어 예매 오픈/마감 시간은 첫 회차 기준으로 동일하게 적용됩니다.'
        : this.scheduleStatusRule.help

      const statusMeaning = this.scheduleStatusRule.allowedStatus === 'DRAFT'
        ? '노출 대기 : 사용자가 아직 볼 수 없는 상태'
        : '오픈 예정 : 사용자는 볼 수 있지만 예매는 아직 불가능한 상태'

      return `${baseGuide}\n\n${statusMeaning}`
    },
    canHideConcert() {
      return ['UPCOMING', 'AVAILABLE', 'CLOSED'].includes(this.item?.status)
    },
    canShowConcert() {
      return this.item?.status === 'HIDDEN'
    },
    scheduleStatusRule() {
      return this.getScheduleStatusRule(this.scheduleForm.bookingStart)
    },
    editScheduleStatusRule() {
      return this.getScheduleStatusRule(this.editScheduleForm.bookingStart)
    },
    scheduleStatusOptions() {
      return this.getScheduleStatusOptions(this.scheduleForm.bookingStart)
    },
    editScheduleStatusOptions() {
      return this.getScheduleStatusOptions(this.editScheduleForm.bookingStart)
    }
  },
  watch: {
    'scheduleForm.bookingStart': {
      immediate: true,
      handler() {
        this.syncScheduleStatus()
      }
    },
    'editScheduleForm.bookingStart': {
      immediate: true,
      handler() {
        this.syncEditScheduleStatus()
      }
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  methods: {
    getDefaultDateTime() {
      const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
      return d.toISOString().slice(0, 16)
    },
    getDefaultScheduleForm() {
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const bookingEnd = new Date(nextWeek.getTime() - 24 * 60 * 60 * 1000)
      const fmtIso = (date) => {
        const d = new Date(date)
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
        return d.toISOString().slice(0, 16)
      }

      return {
        playTime: fmtIso(nextWeek),
        bookingStart: fmtIso(now),
        bookingEnd: fmtIso(bookingEnd),
        status: 'DRAFT'
      }
    },
    statusLabel(s) {
      const m = { 
        DRAFT: '초안',
        UPCOMING: '오픈 예정',
        AVAILABLE: '예매 가능',
        CLOSED: '예매 마감',
        HIDDEN: '숨김'
       }
      return m[s] ?? s ?? '-'
    },
    statusTone(s) { return (s === 'AVAILABLE') ? 'solid' : 'soft' },
    statusColor(s) {
      if (s === 'AVAILABLE') return 'red'
      if (s === 'HIDDEN') return 'slate'
      return 'slate'
    },
    categoryLabel(cat) { return getCategoryLabel(cat) },
    formatDate(d) {
      if (!d) return '-'
      const date = new Date(d)
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
    },
    formatDateTime(d) {
      if (!d) return '-'
      const date = new Date(d)
      return `${this.formatDate(d)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    onThumbError(e) { e.target.style.display = 'none' },
    
    getScheduleStatusGuide(status) {
      const guides = {
        DRAFT: '노출 대기: 관객에게 아직 보이지 않는 상태예요. 예매 오픈 30일 전 이전 회차에 사용해 주세요.',
        READY: '오픈 예정: 관객에게는 노출되지만 아직 예매는 시작되지 않은 상태예요. 예매 오픈 30일 이내 회차에 사용해 주세요.'
      }
      return guides[status] ?? ''
    },

    async load() {
      const concertId = this.$route.params.concertId
      if (!concertId) return
      this.loading = true
      this.schedulesLoading = true
      try {
        const [detail, statsRes, schedulesRes] = await Promise.all([
          this.api.get(ENDPOINTS.concert(concertId)),
          this.api.get(ENDPOINTS.organizerConcertStats(concertId)).catch(() => null),
          this.api.get(`${ENDPOINTS.concertSchedules(concertId)}?page=0&size=50&sort=playTime,asc`)
        ])
        this.item = detail
        this.stats = statsRes
        const rawSchedules = schedulesRes.content ?? schedulesRes.items ?? []
        this.schedules = rawSchedules.map(s => ({
          ...s,
          playTime: s.playTime ?? s.play_time,
          bookingStart: s.bookingStart ?? s.booking_start,
          bookingEnd: s.bookingEnd ?? s.booking_end,
          occupancy: s.occupancyRate ?? s.occupancy ?? 0,
          sold: s.soldSeats ?? s.sold ?? 0,
          total: s.totalSeats ?? s.total ?? 0
        }))
      } catch (err) {
        this.item = null
      } finally {
        this.loading = false
        this.schedulesLoading = false
      }
    },

    openCreateModal() {
      this.scheduleForm = this.getDefaultScheduleForm()
      this.bulkScheduleForm.playTimes = [this.getDefaultDateTime()]
      this.bulkMode = false
      this.scheduleFormError = ''

      // 기존 회차가 있으면 첫 회차의 예매 오픈/마감 시간을 그대로 사용
      if (this.hasExistingSchedules && this.baseScheduleBookingWindow) {
        this.scheduleForm.bookingStart = this.toDateTimeLocalValue(this.baseScheduleBookingWindow.bookingStart)
        this.scheduleForm.bookingEnd = this.toDateTimeLocalValue(this.baseScheduleBookingWindow.bookingEnd)
      }

      // 모달 열 때 bookingStart 기준으로 상태를 즉시 맞춤
      const createRule = this.getScheduleStatusRule(this.scheduleForm.bookingStart)
      this.scheduleForm.status = createRule.allowedStatus

      this.createScheduleModalOpen = true
    },
    closeCreateModal() { this.createScheduleModalOpen = false },
    addBulkPlayTime() {
      const last = this.bulkScheduleForm.playTimes.at(-1)
      const next = new Date(new Date(last).getTime() + 24 * 60 * 60 * 1000)
      const d = new Date(next)
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
      this.bulkScheduleForm.playTimes.push(d.toISOString().slice(0, 16))
    },
    removeBulkPlayTime(idx) { this.bulkScheduleForm.playTimes.splice(idx, 1) },
    openEditModal(row) {
      this.editScheduleId = row.id
      this.editScheduleForm = {
        playTime: this.toDateTimeLocalValue(row.playTime),
        bookingStart: this.toDateTimeLocalValue(row.bookingStart),
        bookingEnd: this.toDateTimeLocalValue(row.bookingEnd),
        status: row.status ?? 'DRAFT'
      }
      // 수정 모달도 bookingStart 기준으로 상태 재동기화
      const editRule = this.getScheduleStatusRule(this.editScheduleForm.bookingStart)
      this.editScheduleForm.status = editRule.allowedStatus

      this.editScheduleFormError = ''
      this.editScheduleModalOpen = true
    },
    closeEditModal() { this.editScheduleModalOpen = false },
    async submitEditSchedule() {
      this.editingSchedule = true
      this.editScheduleFormError = ''
      try {
        await this.api.put(ENDPOINTS.organizerUpdateSchedule(this.editScheduleId), {
          playTime: this.editScheduleForm.playTime,
          bookingStart: this.editScheduleForm.bookingStart,
          bookingEnd: this.editScheduleForm.bookingEnd,
          status: this.editScheduleForm.status
        })
        this.closeEditModal()
        await this.load()
      } catch (err) {
        this.editScheduleFormError = '회차 수정 중 오류가 발생했습니다.'
      } finally {
        this.editingSchedule = false
      }
    },
    async submitCreateSchedule() {
      const concertId = this.$route.params.concertId
      this.creatingSchedule = true
      this.scheduleFormError = ''

      if (this.hasExistingSchedules && this.baseScheduleBookingWindow) {
        this.scheduleForm.bookingStart = this.toDateTimeLocalValue(this.baseScheduleBookingWindow.bookingStart)
        this.scheduleForm.bookingEnd = this.toDateTimeLocalValue(this.baseScheduleBookingWindow.bookingEnd)
      }
      // 제출 직전 bookingStart 기준으로 상태를 다시 강제
      this.scheduleForm.status = this.getScheduleStatusRule(this.scheduleForm.bookingStart).allowedStatus

      try {
        if (this.bulkMode) {
          await this.api.post(ENDPOINTS.organizerBulkCreateSchedules(concertId), {
            playTimes: this.bulkScheduleForm.playTimes,
            bookingStart: this.scheduleForm.bookingStart,
            bookingEnd: this.scheduleForm.bookingEnd,
            status: this.scheduleForm.status
          })
        } else {
          await this.api.post(ENDPOINTS.organizerCreateSchedule(concertId), {
            playTime: this.scheduleForm.playTime,
            bookingStart: this.scheduleForm.bookingStart,
            bookingEnd: this.scheduleForm.bookingEnd,
            status: this.scheduleForm.status
          })
        }
        this.closeCreateModal()
        await this.load()
      } catch (err) {
        this.scheduleFormError = '회차 생성 중 오류가 발생했습니다.'
      } finally {
        this.creatingSchedule = false
      }
    },
    async openSeatMapPreview() {
      if (!this.item) return
      const seatMapId = this.item.seatMapId ?? this.item.concertSeatMapResDto?.id
      const venueId = this.item.venue?.id
      if (!seatMapId || !venueId) return
      try {
        const res = await this.api.get(ENDPOINTS.venueSeatMaps(venueId))
        const seatMaps = Array.isArray(res) ? res : res?.content || []
        this.seatMapPreview = seatMaps.find((sm) => Number(sm.id) === Number(seatMapId))
      } catch (err) { this.seatMapPreview = null }
      this.previewScale = 1
      this.previewOffsetX = 0
      this.previewOffsetY = 0
      this.seatMapPreviewOpen = true
    },
    closeSeatMapPreview() { this.seatMapPreviewOpen = false },
    onPreviewWheel(evt) {
      const delta = evt.deltaY > 0 ? -0.1 : 0.1
      this.previewScale = Math.min(4, Math.max(0.5, +(this.previewScale + delta).toFixed(2)))
    },
    startPreviewDrag(evt) {
      this.isPreviewDragging = true
      this.previewDragStartX = evt.clientX - this.previewOffsetX
      this.previewDragStartY = evt.clientY - this.previewOffsetY
    },
    onPreviewDrag(evt) {
      if (!this.isPreviewDragging) return
      this.previewOffsetX = evt.clientX - this.previewDragStartX
      this.previewOffsetY = evt.clientY - this.previewDragStartY
    },
    endPreviewDrag() { this.isPreviewDragging = false },
    resetPreviewZoom() {
      this.previewScale = 1
      this.previewOffsetX = 0
      this.previewOffsetY = 0
    },
    toDate(value) {
      if (!value) return null
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? null : date
    },
    getThirtyDayBoundary() {
      const now = new Date()
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    },
    
    getScheduleStatusRule(bookingStart) {
      const bookingDate = this.toDate(bookingStart)
      if (!bookingDate) {
        return {
          allowedStatus: 'DRAFT',
          label: '노출 대기',
          help: '예매 오픈 시간을 먼저 선택해 주세요.'
        }
      }

      const boundary = this.getThirtyDayBoundary()
      const isAfterThirtyDays = bookingDate > boundary

      if (bookingDate > boundary) {
        return {
          allowedStatus: 'DRAFT',
          label: '노출 대기',
          help: '예매 오픈이 30일보다 많이 남아 있어 노출 대기 상태로만 생성할 수 있어요.'
        }
      }

      return {
        allowedStatus: 'READY',
        label: '오픈 예정',
        help: '예매 오픈이 30일 이내라 오픈 예정 상태로만 생성할 수 있습니다.'
      }
    },
    getScheduleStatusOptions(bookingStart) {
      const rule = this.getScheduleStatusRule(bookingStart)
      return [{ value: rule.allowedStatus, label: rule.label }]
    },
    syncScheduleStatus() {
      const nextStatus = this.scheduleStatusRule.allowedStatus
      if (this.scheduleForm.status !== nextStatus) {
        this.scheduleForm.status = nextStatus
      }
    },
    syncEditScheduleStatus() {
      const nextStatus = this.editScheduleStatusRule.allowedStatus
      if (this.editScheduleForm.status !== nextStatus) {
        this.editScheduleForm.status = nextStatus
      }
    },
    async hideConcert() {
      if (!this.item?.id) return

      try {
        await this.api.post(`/concerts/organizer/${this.item.id}/hide`)
        await this.load()
      } catch (err) {
        alert('공연 숨기기 중 오류가 발생했습니다.')
      }
    },
    async showConcert() {
      if (!this.item?.id) return

      try {
        await this.api.post(`/concerts/organizer/${this.item.id}/show`)
        await this.load()
      } catch (err) {
        alert('공연 보이기 중 오류가 발생했습니다.')
      }
    },
    toDateTimeLocalValue(val) {
      if (!val) return ''
      const d = new Date(val)
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
      return d.toISOString().slice(0, 16)
    },
    hasMultipleSchedules() {
      return Array.isArray(this.schedules) && this.schedules.length > 1
    },
    async deleteSchedule(row) {
      if (!row?.id) return

      const ok = window.confirm(
        row.status === 'READY'
          ? '오픈 예정 회차를 삭제할까요? 삭제 후에는 되돌릴 수 없습니다.'
          : '노출 대기 회차를 삭제할까요? 삭제 후에는 되돌릴 수 없습니다.'
      )
      if (!ok) return

      try {
        await this.api.del(ENDPOINTS.organizerDeleteSchedule(row.id))
        await this.load()
      } catch (err) {
        alert(err?.message || '회차 삭제 중 오류가 발생했습니다.')
      }
    }
  }
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
