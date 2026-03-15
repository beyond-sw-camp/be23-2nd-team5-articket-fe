<template>
  <div class="grid gap-4">

    <!-- ── 페이지 헤더 ── -->
    <div class="flex items-center justify-between gap-4">
      <div class="shrink-0">
        <div class="text-sm font-semibold text-slate-900">공연장 · 좌석맵 인사이트</div>
        <div class="mt-0.5 text-xs text-slate-400">공연장별 좌석맵 운영 현황 및 공연 일정 분석</div>
      </div>
      <div class="flex flex-1 items-center justify-end gap-3">
        <!-- 공연장 검색 -->
        <div class="relative w-64">
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="venueKeyword"
            type="text"
            placeholder="공연장명 검색…"
            class="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-900 transition focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
            @input="onSearchInput"
          />
          <button
            v-if="venueKeyword"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            type="button"
            @click="clearSearch"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <button
          class="shrink-0 text-xs font-medium text-slate-400 transition-colors hover:text-slate-700"
          @click="$router.push('/admin/venues')"
        >공연장 관리 →</button>
      </div>
    </div>

    <!-- ── 공연장 목록 ── -->
    <div class="rounded-2xl border border-slate-200 bg-white">

      <!-- 로딩 -->
      <div v-if="venueLoading" class="flex items-center justify-center py-16 text-sm text-slate-400">
        불러오는 중…
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="venues.length === 0" class="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <div>
          <p class="text-sm text-slate-500">
            <template v-if="venueKeyword">"<strong>{{ venueKeyword }}</strong>"와 일치하는 공연장이 없습니다.</template>
            <template v-else>등록된 공연장이 없습니다.</template>
          </p>
          <button v-if="venueKeyword" class="mt-1.5 text-xs font-medium text-red-500 hover:text-red-600" @click="clearSearch">검색 초기화</button>
        </div>
      </div>

      <!-- 공연장 카드 그리드 -->
      <div v-else class="p-4">
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <button
            v-for="venue in venues"
            :key="venue.id"
            type="button"
            class="group flex flex-col gap-1.5 rounded-xl border p-4 text-left transition-all"
            :class="selectedVenue?.id === venue.id
              ? 'border-red-400 bg-red-50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'"
            @click="selectVenue(venue)"
          >
            <div class="flex items-start justify-between gap-2">
              <span
                class="line-clamp-2 text-sm font-semibold leading-snug"
                :class="selectedVenue?.id === venue.id ? 'text-red-700' : 'text-slate-800'"
              >{{ venue.name }}</span>
              <span
                v-if="selectedVenue?.id === venue.id"
                class="mt-0.5 shrink-0 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white"
              >선택됨</span>
            </div>
            <p v-if="venue.address" class="line-clamp-1 text-[11px] text-slate-400">{{ venue.address }}</p>
            <p v-if="venue.capacity" class="text-[11px] font-medium text-slate-500">{{ venue.capacity.toLocaleString() }}석</p>
          </button>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="venueTotalPages > 1" class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span class="text-xs text-slate-400">{{ venueTotal }}개 공연장</span>
          <div class="flex items-center gap-1">
            <button
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
              :disabled="venuePage <= 0"
              @click="loadVenues(venuePage - 1)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="min-w-[60px] text-center text-xs font-medium text-slate-600">{{ venuePage + 1 }} / {{ venueTotalPages }}</span>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
              :disabled="venuePage >= venueTotalPages - 1"
              @click="loadVenues(venuePage + 1)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
        <div v-else class="mt-3 border-t border-slate-100 pt-2.5 text-right text-xs text-slate-400">
          {{ venueTotal }}개 공연장
        </div>
      </div>
    </div>

    <!-- ── 좌석맵 + 인사이트 (공연장 선택 시) ── -->
    <template v-if="selectedVenue">

      <!-- 구분선 헤더 -->
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-slate-200"></div>
        <span class="shrink-0 text-xs font-semibold text-slate-500">{{ selectedVenue.name }}</span>
        <div class="h-px flex-1 bg-slate-200"></div>
      </div>

      <!-- 2컬럼 메인 레이아웃 -->
      <div class="grid gap-4 lg:grid-cols-[300px_1fr]">

        <!-- 왼쪽: 좌석맵 목록 -->
        <div class="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div class="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-600">좌석맵</span>
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
              {{ seatMaps.length }}개
            </span>
          </div>

          <div v-if="seatMapsLoading" class="py-12 text-center text-xs text-slate-400">불러오는 중…</div>

          <div v-else-if="seatMaps.length === 0"
            class="py-12 text-center text-xs text-slate-400">
            등록된 좌석맵이 없습니다.
          </div>

          <div v-else class="flex flex-col divide-y divide-slate-50">
            <button
              v-for="sm in seatMaps" :key="sm.id"
              type="button"
              class="group flex items-center gap-3 p-4 text-left transition-colors"
              :class="selectedSeatMapDetail?.id === sm.id
                ? 'bg-red-50'
                : 'hover:bg-slate-50'"
              @click="openSeatMapDetail(sm)"
            >
              <!-- 썸네일 -->
              <div class="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <img v-if="sm.thumbnailUrl" :src="sm.thumbnailUrl" alt="좌석맵"
                  class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div v-else class="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <!-- 선택 인디케이터 -->
                <div v-if="selectedSeatMapDetail?.id === sm.id"
                  class="absolute inset-0 flex items-center justify-center rounded-lg bg-red-500/20 ring-2 ring-red-400">
                  <div class="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                </div>
              </div>

              <!-- 정보 -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span class="truncate text-sm font-semibold"
                    :class="selectedSeatMapDetail?.id === sm.id ? 'text-red-600' : 'text-slate-800'">
                    {{ sm.name || '이름 없음' }}
                  </span>
                  <span
                    class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                    :class="{
                      'bg-emerald-100 text-emerald-700': sm.status === 'PUBLISHED',
                      'bg-amber-100 text-amber-700': sm.status === 'ARCHIVED',
                      'bg-slate-100 text-slate-500': sm.status !== 'PUBLISHED' && sm.status !== 'ARCHIVED'
                    }"
                  >{{ sm.status === 'PUBLISHED' ? '게시' : sm.status === 'ARCHIVED' ? '폐기' : '초안' }}</span>
                </div>
                <div class="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span v-if="sm.size">{{ sm.size.toLocaleString() }}석</span>
                  <span v-if="sm.size && sm.version" class="text-slate-200">·</span>
                  <span v-if="sm.version">v{{ sm.version }}</span>
                  <span v-if="!sm.size && !sm.version">정보 없음</span>
                </div>
              </div>

              <!-- 화살표 -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 transition-colors"
                :class="selectedSeatMapDetail?.id === sm.id ? 'text-red-400' : 'text-slate-200 group-hover:text-slate-400'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 오른쪽: 인사이트 패널 -->
        <div class="min-w-0">

          <!-- 빈 상태 -->
          <div v-if="!selectedSeatMapDetail"
            class="flex h-full min-h-[480px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white text-center">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-700">좌석맵을 선택하세요</p>
              <p class="mt-1 text-xs text-slate-400">왼쪽에서 좌석맵을 선택하면 인사이트를 확인할 수 있습니다</p>
            </div>
          </div>

          <!-- 인사이트 본문 -->
          <div v-else class="grid gap-4">

            <!-- 인사이트 헤더 카드 -->
            <div class="flex items-start justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-xs text-slate-400">{{ selectedVenue.name }}</span>
                  <span class="text-xs text-slate-200">/</span>
                  <span class="text-base font-bold text-slate-900">{{ selectedSeatMapDetail.name }}</span>
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="{
                      'bg-emerald-100 text-emerald-700': selectedSeatMapDetail.status === 'PUBLISHED',
                      'bg-amber-100 text-amber-700': selectedSeatMapDetail.status === 'ARCHIVED',
                      'bg-slate-100 text-slate-600': selectedSeatMapDetail.status !== 'PUBLISHED' && selectedSeatMapDetail.status !== 'ARCHIVED'
                    }"
                  >{{ selectedSeatMapDetail.status === 'PUBLISHED' ? '게시' : selectedSeatMapDetail.status === 'ARCHIVED' ? '폐기' : '초안' }}</span>
                  <span v-if="selectedSeatMapDetail.version" class="text-xs text-slate-400">v{{ selectedSeatMapDetail.version }}</span>
                </div>
                <p v-if="selectedSeatMapDetail.size" class="mt-1 text-xs text-slate-400">
                  총 {{ selectedSeatMapDetail.size.toLocaleString() }}석 수용
                </p>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <button
                  class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  @click="$router.push(`/admin/seat-maps/${selectedSeatMapDetail.id}/layout`)"
                >배치도 편집</button>
                <button
                  v-if="selectedSeatMapDetail.status !== 'PUBLISHED'"
                  class="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                  @click="$router.push(`/admin/seat-maps/${selectedSeatMapDetail.id}/publish`)"
                >게시하기</button>
                <button
                  class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  @click="$router.push(`/admin/dashboard/seat-maps/${selectedSeatMapDetail.id}`)"
                >상세 관리</button>
              </div>
            </div>

            <!-- 로딩 -->
            <div v-if="detailConcertsLoading"
              class="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-400">
              불러오는 중…
            </div>

            <template v-else>
              <!-- 월 네비게이션 -->
              <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3">
                <button
                  class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  @click="prevDetailMonth"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <span class="text-sm font-bold text-slate-900">{{ detailViewYear }}년 {{ detailViewMonth + 1 }}월</span>
                <button
                  class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  @click="nextDetailMonth"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              <!-- KPI 카드 행 -->
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <!-- 도넛: 공연장 점유율 -->
                <div class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                  <div class="relative h-20 w-20">
                    <svg class="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="38" stroke="currentColor" stroke-width="10" fill="transparent" class="text-slate-100" />
                      <circle
                        cx="50" cy="50" r="38"
                        stroke="currentColor" stroke-width="10" fill="transparent"
                        class="text-red-500 transition-all duration-700 ease-out"
                        :stroke-dasharray="238.76"
                        :stroke-dashoffset="238.76 - (238.76 * detailViewOccupancy) / 100"
                        stroke-linecap="round"
                      />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-lg font-black text-slate-900">{{ detailViewOccupancy }}%</span>
                    </div>
                  </div>
                  <div class="text-center">
                    <p class="text-xs font-semibold text-slate-700">공연장 점유율</p>
                    <p class="mt-0.5 text-[10px] text-slate-400">{{ detailOccupiedDays }}일 / {{ detailDaysInMonth }}일</p>
                  </div>
                </div>

                <div class="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5">
                  <p class="text-[10px] font-medium uppercase tracking-wider text-slate-400">이달 회차</p>
                  <p class="mt-1.5 text-3xl font-black text-slate-900">{{ detailThisMonthScheduleCount }}</p>
                  <p class="mt-0.5 text-[10px] text-slate-400">회차 수</p>
                </div>

                <div class="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5">
                  <p class="text-[10px] font-medium uppercase tracking-wider text-slate-400">이달 공연</p>
                  <p class="mt-1.5 text-3xl font-black text-slate-900">{{ detailThisMonthConcertCount }}</p>
                  <p class="mt-0.5 text-[10px] text-slate-400">공연 수</p>
                </div>

                <div class="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5">
                  <p class="text-[10px] font-medium uppercase tracking-wider text-slate-400">누적 공연</p>
                  <p class="mt-1.5 text-3xl font-black text-slate-900">{{ detailConcerts.length }}</p>
                  <p class="mt-0.5 text-[10px] text-slate-400">전체</p>
                </div>
              </div>

              <!-- 캘린더 + 사이드 패널 -->
              <div class="grid gap-4 lg:grid-cols-3">

                <!-- 캘린더 + 필터 칩 -->
                <div class="lg:col-span-2 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                  <!-- 공연 필터 칩 -->
                  <div>
                    <p class="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">공연 필터</p>
                    <div v-if="detailViewConcerts.length === 0" class="text-xs text-slate-300">이 달 공연 없음</div>
                    <div v-else class="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        class="rounded-full border px-3 py-1 text-xs font-medium transition-all"
                        :class="detailSelectedConcertId === null
                          ? 'border-slate-800 bg-slate-800 text-white'
                          : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'"
                        @click="detailSelectedConcertId = null; detailSchedules = detailConcerts.flatMap(c => c._schedules ?? [])"
                      >전체 <span class="opacity-60">{{ detailThisMonthScheduleCount }}</span></button>
                      <button
                        v-for="c in detailViewConcerts" :key="c.id"
                        type="button"
                        class="rounded-full border px-3 py-1 text-xs font-medium transition-all"
                        :class="detailSelectedConcertId === c.id
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'"
                        @click="selectDetailConcert(c)"
                      >
                        <span class="inline-block max-w-[120px] truncate align-bottom">{{ c.title }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- 캘린더 -->
                  <ConcertCalendar
                    :available-dates="detailAvailableDates"
                    :schedules-by-date="detailSchedulesByDate"
                    :admin-mode="true"
                    :controlled-year="detailViewYear"
                    :controlled-month="detailViewMonth"
                    @select-schedule="() => {}"
                  />
                </div>

                <!-- 사이드: 공연 상태 + 누적 지표 -->
                <div class="flex flex-col gap-4">
                  <!-- 공연 상태 분포 -->
                  <div class="rounded-2xl border border-slate-200 bg-white p-5">
                    <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">공연 상태</p>
                    <div v-if="detailConcerts.length === 0" class="py-4 text-center text-xs text-slate-300">공연 없음</div>
                    <div v-else class="space-y-2.5">
                      <div v-for="item in detailConcertStatusBreakdown" :key="item.status"
                        class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <div class="h-2 w-2 rounded-full" :class="item.dotClass"></div>
                          <span class="text-xs text-slate-600">{{ item.label }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <div class="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div
                              class="h-full rounded-full transition-all duration-500"
                              :class="item.barClass"
                              :style="{ width: `${(item.count / detailConcerts.length) * 100}%` }"
                            ></div>
                          </div>
                          <span class="w-4 text-right text-xs font-semibold text-slate-700">{{ item.count }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 누적 지표 -->
                  <div class="rounded-2xl border border-slate-200 bg-white p-5">
                    <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">누적 지표</p>
                    <div class="space-y-3">
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-slate-500">전체 공연</span>
                        <span class="text-sm font-bold text-slate-900">{{ detailConcerts.length }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-slate-500">전체 회차</span>
                        <span class="text-sm font-bold text-slate-900">{{ detailSchedules.length }}</span>
                      </div>
                      <div v-if="selectedSeatMapDetail.size" class="flex items-center justify-between">
                        <span class="text-xs text-slate-500">수용 좌석</span>
                        <span class="text-sm font-bold text-slate-900">{{ selectedSeatMapDetail.size.toLocaleString() }}석</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script>
import ConcertCalendar from '../../components/concert/ConcertCalendar.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'AdminVenueInsightView',
  components: { ConcertCalendar },
  data() {
    return {
      // 공연장 목록
      venues: [],
      venuePage: 0,
      venueTotalPages: 1,
      venueTotal: 0,
      venuePageSize: 9,
      venueKeyword: '',
      venueLoading: false,
      _searchTimer: null,

      // 선택된 공연장
      selectedVenue: null,

      // 선택된 공연장의 좌석맵 목록
      seatMaps: [],
      seatMapsLoading: false,

      // 인사이트 패널
      selectedSeatMapDetail: null,
      detailConcerts: [],
      detailConcertsLoading: false,
      detailSelectedConcertId: null,
      detailSchedules: [],
      detailViewYear: new Date().getFullYear(),
      detailViewMonth: new Date().getMonth(),

      api: null,
    }
  },
  computed: {
    detailViewSchedules() {
      return this.detailSchedules.filter(s => {
        const raw = s.play_time ?? s.playTime ?? ''
        if (!raw) return false
        const d = new Date(raw)
        return d.getFullYear() === this.detailViewYear && d.getMonth() === this.detailViewMonth
      })
    },
    detailAvailableDates() {
      const set = new Set()
      for (const s of this.detailViewSchedules) {
        const raw = s.play_time ?? s.playTime ?? ''
        if (!raw) continue
        const d = new Date(raw)
        if (isNaN(d)) continue
        set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
      }
      return [...set].sort()
    },
    detailSchedulesByDate() {
      const map = {}
      for (const s of this.detailViewSchedules) {
        const raw = s.play_time ?? s.playTime ?? ''
        if (!raw) continue
        const d = new Date(raw)
        if (isNaN(d)) continue
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        if (!map[key]) map[key] = []
        map[key].push({ scheduleId: s.id, playTime: raw.length > 10 ? raw.slice(11, 16) : '', status: s.status })
      }
      for (const k of Object.keys(map)) map[k].sort((a, b) => a.playTime.localeCompare(b.playTime))
      return map
    },
    detailThisMonthScheduleCount() {
      return this.detailConcerts.flatMap(c => c._schedules ?? []).filter(s => {
        const raw = s.playTime ?? s.play_time
        if (!raw) return false
        const d = new Date(raw)
        return d.getFullYear() === this.detailViewYear && d.getMonth() === this.detailViewMonth
      }).length
    },
    detailThisMonthConcertCount() {
      return this.detailConcerts.filter(c =>
        (c._schedules ?? []).some(s => {
          const raw = s.playTime ?? s.play_time
          if (!raw) return false
          const d = new Date(raw)
          return d.getFullYear() === this.detailViewYear && d.getMonth() === this.detailViewMonth
        })
      ).length
    },
    detailViewConcerts() {
      return this.detailConcerts.filter(c =>
        (c._schedules ?? []).some(s => {
          const raw = s.playTime ?? s.play_time
          if (!raw) return false
          const d = new Date(raw)
          return d.getFullYear() === this.detailViewYear && d.getMonth() === this.detailViewMonth
        })
      )
    },
    detailDaysInMonth() {
      return new Date(this.detailViewYear, this.detailViewMonth + 1, 0).getDate()
    },
    detailOccupiedDays() {
      return new Set(
        this.detailConcerts.flatMap(c => c._schedules ?? []).filter(s => {
          const raw = s.playTime ?? s.play_time
          if (!raw) return false
          const d = new Date(raw)
          return d.getFullYear() === this.detailViewYear && d.getMonth() === this.detailViewMonth
        }).map(s => new Date(s.playTime ?? s.play_time).getDate())
      ).size
    },
    detailViewOccupancy() {
      return this.detailDaysInMonth > 0
        ? Math.round((this.detailOccupiedDays / this.detailDaysInMonth) * 100)
        : 0
    },
    detailConcertStatusBreakdown() {
      const counts = { AVAILABLE: 0, UPCOMING: 0, DRAFT: 0, ENDED: 0 }
      for (const c of this.detailConcerts) {
        if (c.status in counts) counts[c.status]++
        else counts.ENDED++
      }
      return [
        { status: 'AVAILABLE', label: '예매중',    count: counts.AVAILABLE, dotClass: 'bg-red-400',   barClass: 'bg-red-400' },
        { status: 'UPCOMING',  label: '오픈대기',  count: counts.UPCOMING,  dotClass: 'bg-amber-400', barClass: 'bg-amber-400' },
        { status: 'DRAFT',     label: '초안',      count: counts.DRAFT,     dotClass: 'bg-slate-300', barClass: 'bg-slate-300' },
        { status: 'ENDED',     label: '종료/기타', count: counts.ENDED,     dotClass: 'bg-slate-200', barClass: 'bg-slate-200' },
      ].filter(item => item.count > 0)
    },
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.loadVenues(0)
  },
  beforeUnmount() {
    if (this._searchTimer) clearTimeout(this._searchTimer)
  },
  methods: {
    onSearchInput() {
      if (this._searchTimer) clearTimeout(this._searchTimer)
      this._searchTimer = setTimeout(() => {
        this.loadVenues(0)
      }, 300)
    },
    clearSearch() {
      this.venueKeyword = ''
      if (this._searchTimer) clearTimeout(this._searchTimer)
      this.loadVenues(0)
    },
    async loadVenues(page) {
      this.venueLoading = true
      this.venuePage = page
      try {
        const kw = this.venueKeyword.trim()
        const res = await this.api.get(ENDPOINTS.adminVenueList({
          page,
          size: this.venuePageSize,
          ...(kw && { keyword: kw }),
        }))
        const list = res?.content ?? (Array.isArray(res) ? res : [])
        this.venues = list.map(v => ({
          id: v.id,
          name: v.name,
          address: v.address ?? v.venueAddressResDto?.address ?? null,
          capacity: v.capacity ?? v.totalSeats ?? null,
        }))
        this.venueTotalPages = Math.max(1, res?.totalPages ?? 1)
        this.venueTotal = res?.totalElements ?? list.length
      } catch {
        this.venues = []
        this.venueTotalPages = 1
        this.venueTotal = 0
      } finally {
        this.venueLoading = false
      }
    },
    async selectVenue(venue) {
      if (this.selectedVenue?.id === venue.id) return
      this.selectedVenue = venue
      this.selectedSeatMapDetail = null
      this.detailConcerts = []
      this.detailSchedules = []
      this.seatMaps = []
      await this.loadVenueSeatMaps(venue.id)
    },
    async loadVenueSeatMaps(venueId) {
      this.seatMapsLoading = true
      try {
        const res = await this.api.get(ENDPOINTS.adminVenueSeatMapsList(venueId, { page: 0, size: 50 }))
        const list = res?.content ?? res?.items ?? (Array.isArray(res) ? res : [])
        this.seatMaps = list.map(sm => ({
          id: sm.id,
          name: sm.name || '',
          status: sm.status ?? sm.seatMapStatus ?? 'DRAFT',
          thumbnailUrl: sm.thumbnailUrl ?? sm.thumbnail_url ?? null,
          size: sm.totalSeats ?? null,
          version: sm.version ?? null,
        }))
      } catch {
        this.seatMaps = []
      } finally {
        this.seatMapsLoading = false
      }
    },
    openSeatMapDetail(sm) {
      if (this.selectedSeatMapDetail?.id === sm.id) {
        this.selectedSeatMapDetail = null
        this.detailConcerts = []
        this.detailSchedules = []
        return
      }
      this.selectedSeatMapDetail = { ...sm }
      this.detailSelectedConcertId = null
      this.detailSchedules = []
      const now = new Date()
      this.detailViewYear = now.getFullYear()
      this.detailViewMonth = now.getMonth()
      this.loadDetailConcerts(sm.id, this.selectedVenue.id)
    },
    prevDetailMonth() {
      if (this.detailViewMonth === 0) { this.detailViewYear--; this.detailViewMonth = 11 }
      else this.detailViewMonth--
      this.detailSelectedConcertId = null
      this.detailSchedules = this.detailConcerts.flatMap(c => c._schedules ?? [])
    },
    nextDetailMonth() {
      if (this.detailViewMonth === 11) { this.detailViewYear++; this.detailViewMonth = 0 }
      else this.detailViewMonth++
      this.detailSelectedConcertId = null
      this.detailSchedules = this.detailConcerts.flatMap(c => c._schedules ?? [])
    },
    selectDetailConcert(concert) {
      if (this.detailSelectedConcertId === concert.id) {
        this.detailSelectedConcertId = null
        this.detailSchedules = this.detailConcerts.flatMap(c => c._schedules ?? [])
        return
      }
      this.detailSelectedConcertId = concert.id
      this.detailSchedules = concert._schedules ?? []
    },
    async loadDetailConcerts(seatMapId, venueId) {
      this.detailConcertsLoading = true
      this.detailConcerts = []
      try {
        const res = await this.api.get(ENDPOINTS.adminVenueConcerts(venueId))
        const allConcerts = res?.content ?? res?.items ?? (Array.isArray(res) ? res : [])
        const scheduleResults = await Promise.allSettled(
          allConcerts.map(c => this.api.get(ENDPOINTS.concertSchedules(c.id)))
        )
        const concertScheduleMap = allConcerts.map((concert, i) => {
          const r = scheduleResults[i]
          const schedules = r.status === 'fulfilled'
            ? (r.value?.content ?? r.value?.items ?? (Array.isArray(r.value) ? r.value : []))
            : []
          return { concert, schedules }
        })
        const allSchedules = concertScheduleMap.flatMap(({ schedules }) => schedules)
        const seatMapResults = await Promise.allSettled(
          allSchedules.map(s => this.api.get(ENDPOINTS.seatMap(s.id)))
        )
        const seatMapById = {}
        allSchedules.forEach((s, i) => {
          const r = seatMapResults[i]
          if (r.status === 'fulfilled') seatMapById[s.id] = String(r.value?.seatMapId ?? '')
        })
        const filtered = []
        for (const { concert, schedules } of concertScheduleMap) {
          const matching = schedules.filter(s => seatMapById[s.id] === String(seatMapId))
          if (matching.length > 0) filtered.push({ ...concert, _schedules: matching })
        }
        this.detailConcerts = filtered
        this.detailSchedules = filtered.flatMap(c => c._schedules ?? [])
      } catch {
        this.detailConcerts = []
      } finally {
        this.detailConcertsLoading = false
      }
    },
  },
}
</script>
