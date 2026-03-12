<template>
  <div class="grid gap-4">
    <!-- 월 네비게이션 -->
    <div class="flex items-center justify-between">
      <button type="button" class="rounded-lg p-1.5 hover:bg-slate-100" @click="prevMonth">
        <ChevronLeft class="h-4 w-4 text-slate-600" />
      </button>
      <span class="text-sm font-semibold text-slate-900">
        {{ currentYear }}년 {{ currentMonth + 1 }}월
      </span>
      <button type="button" class="rounded-lg p-1.5 hover:bg-slate-100" @click="nextMonth">
        <ChevronRight class="h-4 w-4 text-slate-600" />
      </button>
    </div>

    <!-- 요일 헤더 -->
    <div class="grid grid-cols-7 text-center">
      <div v-for="d in weekDays" :key="d" class="py-1 text-xs font-semibold text-slate-400">{{ d }}</div>
    </div>

    <!-- 날짜 그리드 -->
    <div class="grid grid-cols-7 gap-1 text-center">

      <div v-for="(cell, i) in calendarCells" :key="i">
        <div v-if="!cell" class="py-2" />
        <button
          v-else
          type="button"
          :class="[
            'w-full rounded-lg py-2 text-sm transition',
            hasSchedule(cell) ? 'font-bold text-red-600 hover:bg-red-50' : 'text-slate-400 cursor-default',
            isSelected(cell) ? 'bg-red-500 !text-white hover:bg-red-600' : ''
          ]"
          :disabled="!hasSchedule(cell)"
          @click="selectDate(cell)"
        >
          {{ cell.getDate() }}
          <div v-if="hasSchedule(cell) && !isSelected(cell)" class="mx-auto mt-0.5 h-1 w-1 rounded-full bg-red-400" />
        </button>
      </div>
    </div>

    <!-- 선택한 날짜의 회차 정보 (표시 전용) -->
    <transition name="fade">
      <div v-if="selectedSlots.length > 0" class="border-t border-slate-100 pt-4">
        <div class="mb-2 text-xs font-semibold text-slate-500">{{ selectedDateLabel }} 회차</div>
        <div class="grid gap-1.5">
          <div
            v-for="slot in selectedSlots"
            :key="slot.scheduleId"
            class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5"
          >
            <span class="flex items-center gap-2">
              <span v-if="slot.concertTitle" class="text-xs text-slate-400">{{ slot.concertTitle }}</span>
              <span class="text-sm font-semibold text-slate-900">{{ formatTime(slot.playTime) }}</span>
            </span>
            <span
              :class="[
                'rounded-full px-2 py-0.5 text-xs font-semibold',
                slot.status === 'OPEN' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-500'
              ]"
            >
              {{ statusLabel(slot.status) }}
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

export default {
  name: 'ConcertCalendar',
  components: { ChevronLeft, ChevronRight },
  props: {
    availableDates: { type: Array, default: () => [] },
    schedulesByDate: { type: Object, default: () => ({}) },
    modelValue: { type: String, default: null },
    adminMode: { type: Boolean, default: false }
  },
  emits: ['select-schedule', 'update:selectedDate', 'update:modelValue'],
  data() {
    const init = this._firstAvailableDate()
    return {
      currentYear: init.getFullYear(),
      currentMonth: init.getMonth(),
      selectedDate: null,
      weekDays: ['일', '월', '화', '수', '목', '금', '토']
    }
  },
  watch: {
    availableDates(val) {
      if (val && val.length > 0) {
        const d = new Date(val[0])
        if (!isNaN(d.getTime())) {
          this.currentYear = d.getFullYear()
          this.currentMonth = d.getMonth()
        }
      }
    }
  },
  computed: {
    calendarCells() {
      const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay()
      const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate()
      const cells = Array(firstDay).fill(null)
      for (let d = 1; d <= daysInMonth; d++) {
        cells.push(new Date(this.currentYear, this.currentMonth, d))
      }
      return cells
    },
    selectedSlots() {
      const key = this.selectedDate || this.modelValue
      if (!key) return []
      return this.schedulesByDate[key] ?? []
    },
    selectedDateLabel() {
      const key = this.selectedDate || this.modelValue
      if (!key) return ''
      const [, m, d] = key.split('-')
      return `${parseInt(m)}월 ${parseInt(d)}일`
    },
  },
  methods: {
    _firstAvailableDate() {
      if (this.availableDates && this.availableDates.length > 0) {
        const d = new Date(this.availableDates[0])
        if (!isNaN(d.getTime())) return d
      }
      return new Date()
    },
    prevMonth() {
      if (this.currentMonth === 0) { this.currentYear--; this.currentMonth = 11 }
      else this.currentMonth--
    },
    nextMonth() {
      if (this.currentMonth === 11) { this.currentYear++; this.currentMonth = 0 }
      else this.currentMonth++
    },
    toKey(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    hasSchedule(date) {
      return this.availableDates.includes(this.toKey(date))
    },
    isSelected(date) {
      const key = this.toKey(date)
      return (this.selectedDate || this.modelValue) === key
    },
    selectDate(date) {
      if (!this.hasSchedule(date)) return
      const key = this.toKey(date)
      this.selectedDate = key
      this.$emit('update:selectedDate', key)
      this.$emit('update:modelValue', key)

      // 해당 날짜의 첫 번째 예매 가능 회차 자동 선택
      const slots = this.schedulesByDate[key] ?? []
      const target = this.adminMode
        ? slots[0]
        : slots.find(s => s.status === 'OPEN') ?? slots[0]
      if (target) {
        this.$emit('select-schedule', target.scheduleId)
      }
    },
    formatTime(playTime) {
      return playTime ? playTime.slice(0, 5) : ''
    },
    statusLabel(status) {
      const map = { OPEN: '예매 가능', CLOSED: '마감', CANCELED: '취소' }
      return map[status] ?? status
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
