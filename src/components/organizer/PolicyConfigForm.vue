<template>
  <div class="grid gap-3">
    <!-- BASE_PRICE -->
    <template v-if="type === 'BASE_PRICE'">
      <div>
        <label class="block text-xs font-semibold text-slate-500">좌석 등급별 기본 가격</label>
        <div class="mt-1 text-xs text-slate-400">예시: {"VIP": 150000, "R": 120000}</div>
        <div class="mt-2 grid gap-2">
          <div v-for="(row, idx) in priceRows" :key="idx" class="flex gap-2 items-center">
            <select
              v-if="seatGrades.length"
              :value="row.grade"
              @change="updatePriceRow(idx, 'grade', $event.target.value)"
              class="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">등급 선택</option>
              <option v-for="grade in availableGradesForRow(idx)" :key="grade" :value="grade">{{ grade }}</option>
            </select>
            <input
              v-else
              :value="row.grade"
              @input="updatePriceRow(idx, 'grade', $event.target.value)"
              placeholder="등급명 (예: VIP)"
              class="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <input
              :value="row.price"
              @input="updatePriceRow(idx, 'price', $event.target.value)"
              type="number"
              min="0"
              placeholder="가격 (원)"
              class="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <button
              type="button"
              class="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-100 text-lg"
              @click="$emit('remove-price-row', idx)"
            >x</button>
          </div>
        </div>
        <button
          type="button"
          class="mt-2 h-8 px-3 text-sm rounded-xl"
          :class="!seatGrades.length || canAddPriceRow
            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            : 'text-slate-300 cursor-not-allowed'"
          :disabled="seatGrades.length && !canAddPriceRow"
          @click="handleAddPriceRow"
        >+ 등급 추가</button>
      </div>
    </template>

    <!-- PRESALE -->
    <template v-else-if="type === 'PRESALE'">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-500">선예매 시작 *</label>
          <input
            :value="presale.startAt"
            @input="updatePresale('startAt', $event.target.value)"
            type="datetime-local"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500">선예매 종료 *</label>
          <input
            :value="presale.endAt"
            @input="updatePresale('endAt', $event.target.value)"
            type="datetime-local"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>
      <label class="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
        <input
          type="checkbox"
          :checked="presale.authRequired"
          @change="updatePresale('authRequired', $event.target.checked)"
          class="h-4 w-4 rounded border-slate-300 text-red-500 focus:ring-red-400"
        />
        인증 필요
      </label>
      <div v-if="presale.authRequired">
        <label class="block text-xs font-semibold text-slate-500">인증 유형</label>
        <input
          :value="presale.authType"
          @input="updatePresale('authType', $event.target.value)"
          type="text"
          placeholder="예: FANCLUB_MEMBERSHIP"
          class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>
    </template>

    <!-- DISCOUNT -->
    <template v-else-if="type === 'DISCOUNT'">
      <div>
        <label class="block text-xs font-semibold text-slate-500">할인명 *</label>
        <input
          :value="discount.discountName"
          @input="updateDiscount('discountName', $event.target.value)"
          type="text"
          required
          placeholder="예: 조기예매 할인"
          class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-500">할인율(%) *</label>
          <input
            :value="discountRateDisplay"
            @input="updateDiscount('discountRate', Number($event.target.value) / 100)"
            type="number"
            min="0"
            max="100"
            step="0.1"
            required
            placeholder="예: 15"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <div class="mt-0.5 text-xs text-slate-400">입력값은 100으로 나눠 저장됩니다. (15 -> 0.15)</div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500">유효 기간</label>
          <input
            :value="discount.validUntil"
            @input="updateDiscount('validUntil', $event.target.value)"
            type="datetime-local"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-500">대상 등급 (쉼표 구분)</label>
        <input
          :value="(discount.targetGrades || []).join(', ')"
          @input="updateDiscount('targetGrades', $event.target.value.split(',').map(s => s.trim()).filter(Boolean))"
          type="text"
          placeholder="예: R, S"
          class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>
    </template>

    <!-- PURCHASE_LIMIT -->
    <template v-else-if="type === 'PURCHASE_LIMIT'">
      <div>
        <label class="block text-xs font-semibold text-slate-500">1인당 최대 구매 수 *</label>
        <input
          :value="purchaseLimit.limit"
          @input="updatePurchaseLimit('limit', Number($event.target.value))"
          type="number"
          min="1"
          required
          class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-500">안내 메시지</label>
        <input
          :value="purchaseLimit.message"
          @input="updatePurchaseLimit('message', $event.target.value)"
          type="text"
          placeholder="예: 1인당 최대 4매까지 예매 가능합니다."
          class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'PolicyConfigForm',
  props: {
    type: { type: String, required: true },
    seatGrades: { type: Array, default: () => [] },
    priceRows: { type: Array, default: () => [] },
    presale: { type: Object, default: () => ({}) },
    discount: { type: Object, default: () => ({}) },
    purchaseLimit: { type: Object, default: () => ({}) },
  },
  emits: [
    'update-price-rows',
    'add-price-row',
    'remove-price-row',
    'update-presale',
    'update-discount',
    'update-purchase-limit',
  ],
  computed: {
    discountRateDisplay() {
      return Math.round((this.discount.discountRate || 0) * 100 * 10) / 10
    },
    selectedSeatGrades() {
      if (!this.seatGrades.length) return []
      return this.priceRows
        .map((row) => String(row.grade || '').trim())
        .filter((grade) => grade && this.seatGrades.includes(grade))
    },
    canAddPriceRow() {
      if (!this.seatGrades.length) return true
      return this.selectedSeatGrades.length < this.seatGrades.length
    },
  },
  methods: {
    availableGradesForRow(idx) {
      if (!this.seatGrades.length) return []
      const current = String(this.priceRows[idx]?.grade || '').trim()
      const usedByOthers = new Set(
        this.priceRows
          .map((row, i) => (i === idx ? '' : String(row.grade || '').trim()))
          .filter((grade) => grade && this.seatGrades.includes(grade))
      )
      return this.seatGrades.filter((grade) => grade === current || !usedByOthers.has(grade))
    },
    firstAvailableGrade() {
      if (!this.seatGrades.length) return ''
      const used = new Set(this.selectedSeatGrades)
      return this.seatGrades.find((grade) => !used.has(grade)) || ''
    },
    handleAddPriceRow() {
      if (!this.canAddPriceRow) return
      this.$emit('add-price-row', { grade: this.firstAvailableGrade(), price: 0 })
    },
    updatePriceRow(idx, key, value) {
      const rows = this.priceRows.map((r, i) =>
        i === idx ? { ...r, [key]: key === 'price' ? Number(value) || 0 : value } : r
      )
      this.$emit('update-price-rows', rows)
    },
    updatePresale(key, value) {
      this.$emit('update-presale', { ...this.presale, [key]: value })
    },
    updateDiscount(key, value) {
      this.$emit('update-discount', { ...this.discount, [key]: value })
    },
    updatePurchaseLimit(key, value) {
      this.$emit('update-purchase-limit', { ...this.purchaseLimit, [key]: value })
    },
  },
}
</script>
