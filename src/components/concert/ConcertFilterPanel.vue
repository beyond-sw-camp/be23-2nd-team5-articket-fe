<template>
  <aside class="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:w-64">
    <h2 class="mb-5 text-base font-bold text-slate-900">필터</h2>

    <!-- 장르 -->
    <section v-if="!hideGenre" class="border-b border-slate-100 pb-5">
      <h3 class="mb-3 text-xs font-semibold text-slate-500">장르 (중복 선택 가능)</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="opt in genreOptions"
          :key="opt.value"
          type="button"
          :class="[
            'rounded-full px-3 py-1.5 text-xs font-medium transition',
            localFilters.genres.includes(opt.value)
              ? 'border-2 border-red-300 bg-red-50 text-red-700'
              : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
          ]"
          @click="toggleGenre(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </section>

    <!-- 판매상태 -->
    <section class="border-b border-slate-100 py-5">
      <h3 class="mb-3 text-xs font-semibold text-slate-500">판매상태</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="opt in salesStatusOptions"
          :key="opt.value"
          type="button"
          :class="[
            'rounded-full px-3 py-1.5 text-xs font-medium transition',
            localFilters.salesStatus === opt.value
              ? 'border-2 border-red-300 bg-red-50 text-red-700'
              : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
          ]"
          @click="localFilters.salesStatus = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </section>

    <!-- 날짜 -->
    <section class="border-b border-slate-100 py-5">
      <h3 class="mb-3 text-xs font-semibold text-slate-500">날짜</h3>
      <div class="flex items-center justify-between gap-2">
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          @click="prevMonth"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>
        <span class="text-sm font-semibold text-slate-900">{{ calendarYear }}.{{ String(calendarMonth).padStart(2, '0') }}</span>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          @click="nextMonth"
        >
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
      <div class="mt-3 grid grid-cols-7 gap-1 text-center text-xs">
        <span v-for="d in weekdayLabels" :key="d" :class="d === '일' ? 'text-red-500' : 'text-slate-500'">{{ d }}</span>
        <template v-for="(cell, idx) in calendarCells" :key="idx">
          <span
            v-if="!cell"
            class="h-8"
          ></span>
          <button
            v-else
            type="button"
            :class="[
              'flex h-8 items-center justify-center rounded-lg transition',
              cell.isToday ? 'bg-red-600 text-white font-semibold' : '',
              (cell.isRangeStart || cell.isRangeEnd) && !cell.isToday ? 'border-2 border-red-300 bg-red-50 text-red-700' : '',
              cell.isInRange && !cell.isToday ? 'bg-red-100 text-red-700' : '',
              !cell.isToday && !cell.isRangeStart && !cell.isRangeEnd && !cell.isInRange ? 'text-slate-700 hover:bg-slate-100' : '',
              cell.isSunday && !cell.isToday && !cell.isInRange ? 'text-red-500' : ''
            ]"
            @click="selectDate(cell.date)"
          >
            {{ cell.day }}
          </button>
        </template>
      </div>
      <label class="mt-3 flex cursor-pointer items-center gap-2">
        <input
          v-model="localFilters.weekendsOnly"
          type="checkbox"
          class="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-300"
        />
        <span class="text-xs text-slate-600">한달 이내 주말</span>
      </label>
    </section>

    <!-- 지역 -->
    <section class="border-slate-100 py-5">
      <h3 class="mb-3 text-xs font-semibold text-slate-500">지역 (중복 선택 가능)</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="r in regionOptions"
          :key="r.value"
          type="button"
          :class="[
            'rounded-full px-3 py-1.5 text-xs font-medium transition',
            localFilters.regions.includes(r.value)
              ? 'border-2 border-red-300 bg-red-50 text-red-700'
              : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
          ]"
          @click="toggleRegion(r.value)"
        >
          {{ r.label }}
        </button>
      </div>
    </section>

    <!-- 하단 버튼: 패널 하단에 고정, 스크롤 시 뷰포트 하단에 따라옴, 패널 끝에서는 패널 맨 밑에 고정 -->
    <div class="sticky bottom-0 z-10 -mx-5 mt-5 flex gap-2 border-t border-slate-100 bg-white px-5 py-4">
      <button
        type="button"
        class="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        @click="reset"
      >
        초기화
      </button>
      <button
        type="button"
        class="flex-1 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        @click="apply"
      >
        {{ totalCount.toLocaleString() }}개 검색
      </button>
    </div>
  </aside>
</template>

<script>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { CONCERT_CATEGORY_OPTIONS } from '../../lib/constants/concertCategory'

const SALES_STATUS_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'PUBLISHED', label: '판매중' },
  { value: 'DRAFT', label: '판매예정' },
  { value: 'ENDED', label: '판매종료' },
]

const REGION_OPTIONS = [
  { value: '서울', label: '서울' },
  { value: '경기', label: '경기' },
  { value: '인천', label: '인천' },
  { value: '부산', label: '부산' },
  { value: '대구', label: '대구' },
  { value: '대전', label: '대전' },
  { value: '광주', label: '광주' },
  { value: '울산', label: '울산' },
  { value: '세종', label: '세종' },
  { value: '강원', label: '강원' },
  { value: '충북', label: '충북' },
  { value: '충남', label: '충남' },
  { value: '전북', label: '전북' },
  { value: '전남', label: '전남' },
  { value: '경북', label: '경북' },
  { value: '경남', label: '경남' },
  { value: '제주', label: '제주' },
]

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export default {
  name: 'ConcertFilterPanel',
  components: {
    ChevronLeft,
    ChevronRight,
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    hideGenre: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'apply'],
  data() {
    return {
      localFilters: {
        genres: [],
        salesStatus: '',
        selectedDateStart: null,
        selectedDateEnd: null,
        weekendsOnly: false,
        regions: [],
        benefitMemberDiscount: false,
      },
      calendarYear: new Date().getFullYear(),
      calendarMonth: new Date().getMonth() + 1,
      genreOptions: CONCERT_CATEGORY_OPTIONS,
      salesStatusOptions: SALES_STATUS_OPTIONS,
      regionOptions: REGION_OPTIONS,
      weekdayLabels: WEEKDAY_LABELS,
    }
  },
  computed: {
    calendarCells() {
      const year = this.calendarYear
      const month = this.calendarMonth - 1
      const first = new Date(year, month, 1)
      const last = new Date(year, month + 1, 0)
      const startPad = first.getDay()
      const days = last.getDate()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const cells = []
      for (let i = 0; i < startPad; i++) cells.push(null)
      const start = this.localFilters.selectedDateStart
      const end = this.localFilters.selectedDateEnd
      const startTs = start ? new Date(start).setHours(0, 0, 0, 0) : null
      const endTs = end ? new Date(end).setHours(0, 0, 0, 0) : null
      const rangeEnd = endTs ?? startTs

      for (let d = 1; d <= days; d++) {
        const date = new Date(year, month, d)
        date.setHours(0, 0, 0, 0)
        const ts = date.getTime()
        const isRangeStart = startTs != null && ts === startTs
        const isRangeEnd = rangeEnd != null && ts === rangeEnd
        const isInRange = startTs != null && rangeEnd != null && ts > startTs && ts < rangeEnd
        const isSelected = isRangeStart || isRangeEnd || isInRange
        cells.push({
          day: d,
          date,
          isToday: date.getTime() === today.getTime(),
          isSelected,
          isRangeStart,
          isRangeEnd,
          isInRange,
          isSunday: date.getDay() === 0,
        })
      }
      return cells
    },
  },
  watch: {
    modelValue: {
      deep: true,
      handler(v) {
        if (v && Object.keys(v).length) {
          this.localFilters = { ...this.localFilters, ...v }
        }
      },
    },
  },
  methods: {
    toggleGenre(val) {
      const arr = this.localFilters.genres
      const idx = arr.indexOf(val)
      if (idx >= 0) arr.splice(idx, 1)
      else arr.push(val)
    },
    toggleRegion(val) {
      const arr = this.localFilters.regions
      const idx = arr.indexOf(val)
      if (idx >= 0) arr.splice(idx, 1)
      else arr.push(val)
    },
    selectDate(date) {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      const start = this.localFilters.selectedDateStart
      const end = this.localFilters.selectedDateEnd

      if (!start) {
        this.localFilters.selectedDateStart = d
        this.localFilters.selectedDateEnd = null
        return
      }
      if (!end) {
        const startCopy = new Date(start)
        startCopy.setHours(0, 0, 0, 0)
        if (d.getTime() === startCopy.getTime()) {
          this.localFilters.selectedDateStart = null
          this.localFilters.selectedDateEnd = null
          return
        }
        const [s, e] = [d, startCopy].sort((a, b) => a.getTime() - b.getTime())
        this.localFilters.selectedDateStart = s
        this.localFilters.selectedDateEnd = e
        return
      }
      this.localFilters.selectedDateStart = d
      this.localFilters.selectedDateEnd = null
    },
    prevMonth() {
      if (this.calendarMonth <= 1) {
        this.calendarYear--
        this.calendarMonth = 12
      } else {
        this.calendarMonth--
      }
    },
    nextMonth() {
      if (this.calendarMonth >= 12) {
        this.calendarYear++
        this.calendarMonth = 1
      } else {
        this.calendarMonth++
      }
    },
    reset() {
      this.localFilters = {
        genres: [],
        salesStatus: '',
        selectedDateStart: null,
        selectedDateEnd: null,
        weekendsOnly: false,
        regions: [],
        benefitMemberDiscount: false,
      }
      this.calendarYear = new Date().getFullYear()
      this.calendarMonth = new Date().getMonth() + 1
      this.$emit('update:modelValue', { ...this.localFilters })
      this.$emit('apply', { ...this.localFilters })
    },
    apply() {
      this.$emit('update:modelValue', { ...this.localFilters })
      this.$emit('apply', { ...this.localFilters })
    },
  },
}
</script>
