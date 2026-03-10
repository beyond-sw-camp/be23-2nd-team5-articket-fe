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
        <!-- 빈 셀 (월 시작 전) -->
        <div v-if="!cell" class="py-2" />
        <!-- 날짜 셀 -->
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
          <!-- 스케줄 있는 날짜 점 표시 -->
          <div v-if="hasSchedule(cell) && !isSelected(cell)" class="mx-auto mt-0.5 h-1 w-1 rounded-full bg-red-400" />
        </button>
      </div>
    </div>

    <!-- 선택한 날짜의 회차 목록 -->
    <transition name="fade">
      <div v-if="selectedSlots.length > 0" class="border-t border-slate-100 pt-4">
        <div class="mb-2 text-xs font-semibold text-slate-500">
          {{ selectedDateLabel }} 회차 선택
        </div>
        <div class="grid gap-2">
          <button
            v-for="slot in selectedSlots"
            :key="slot.scheduleId"
            type="button"
            :class="[
              'flex items-center justify-between rounded-xl border px-4 py-3 text-left transition',
              slot.status === 'OPEN'
                ? 'border-red-200 bg-red-50 hover:border-red-400'
                : adminMode ? 'border-slate-200 bg-slate-50 hover:border-slate-400' : 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
            ]"
            :disabled="!adminMode && slot.status !== 'OPEN'"
            @click="$emit('select-schedule', slot.scheduleId)"
          >
            <span class="flex flex-col gap-0.5">
              <span v-if="slot.concertTitle" class="text-xs font-medium text-slate-500">{{ slot.concertTitle }}</span>
              <span class="text-sm font-semibold text-slate-900">{{ formatTime(slot.playTime) }}</span>
            </span>
            <span :class="['text-xs font-semibold', slot.status === 'OPEN' ? 'text-red-500' : 'text-slate-400']">
              {{ slot.status === 'OPEN' ? '예매 가능' : slot.status }}
            </span>
          </button>
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
    // availableDates: ['2026-03-21', '2026-03-22']
    availableDates: { type: Array, default: () => [] },
    // schedulesByDate: { '2026-03-21': [{scheduleId, playTime, status}] }
    schedulesByDate: { type: Object, default: () => ({}) },
    // 초기 선택 날짜 (부모와 동기화용)
    modelValue: { type: String, default: null },
    // 어드민 모드: 상태에 관계없이 모든 슬롯 클릭 가능, 공연명 표시
    adminMode: { type: Boolean, default: false }
  },
  emits: ['select-schedule', 'update:selectedDate', 'update:modelValue'],
  data() {
    const now = new Date()
    return {
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth(),
      selectedDate: null,
      weekDays: ['일', '월', '화', '수', '목', '금', '토']
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
      if (!this.selectedDate) return ''
      const [, m, d] = this.selectedDate.split('-')
      return `${parseInt(m)}월 ${parseInt(d)}일`
    }
  },
  methods: {
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
    },
    formatTime(playTime) {
      // playTime: "18:00:00" or "18:00"
      return playTime ? playTime.slice(0, 5) : ''
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
