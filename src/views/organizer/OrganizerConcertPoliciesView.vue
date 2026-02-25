<template>
  <div class="grid gap-4">
    <!-- Header -->
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">공연 정책 관리</div>
          <div class="mt-1 text-sm text-slate-500">기본 가격·선예매·할인·구매 제한 정책을 설정합니다.</div>
        </div>
        <UiBadge tone="soft">ORGANIZER</UiBadge>
      </div>

      <div v-if="!loading && !hasBasePricePolicy" class="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <div class="text-xs font-semibold text-amber-700">필수 설정 필요</div>
        <div class="mt-0.5 text-xs text-amber-600">
          회차(Schedule)를 생성하려면 반드시 <strong>BASE_PRICE (기본 가격 정책)</strong>을 먼저 등록해야 합니다.
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <UiButton class="h-11 px-5" :disabled="!availableTypes.length" @click="openCreateModal">
          + 정책 추가
        </UiButton>
      </div>
    </UiCard>

    <!-- Loading / Error / Empty -->
    <UiCard v-if="loading"><div class="text-sm text-slate-500">불러오는 중…</div></UiCard>
    <UiCard v-else-if="errorMessage"><div class="text-sm text-red-600">{{ errorMessage }}</div></UiCard>
    <UiCard v-else-if="!items.length">
      <div class="py-2 text-sm text-slate-500">
        등록된 정책이 없습니다. <strong>BASE_PRICE (기본 가격)</strong> 정책을 먼저 등록해 주세요.
      </div>
    </UiCard>

    <!-- Policy cards -->
    <UiCard v-else v-for="item in items" :key="item.id">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <UiBadge :tone="item.type === 'BASE_PRICE' ? 'solid' : 'soft'" :color="item.type === 'BASE_PRICE' ? 'red' : 'slate'">
            {{ TYPE_LABEL[item.type] || item.type }}
          </UiBadge>
          <div class="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <!-- BASE_PRICE -->
            <template v-if="item.type === 'BASE_PRICE'">
              <div class="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1">
                <template v-for="(price, grade) in parseConfig(item.config)" :key="grade">
                  <div class="text-sm text-slate-600">{{ grade }}</div>
                  <div class="text-sm font-semibold text-slate-900 text-right">₩{{ Number(price).toLocaleString() }}</div>
                </template>
              </div>
            </template>
            <!-- PRESALE -->
            <template v-else-if="item.type === 'PRESALE'">
              <div class="grid gap-1 text-sm">
                <div class="text-slate-600">
                  선예매 기간:
                  <span class="font-semibold text-slate-900">
                    {{ fmtDate(parseConfig(item.config).startAt) }} ~ {{ fmtDate(parseConfig(item.config).endAt) }}
                  </span>
                </div>
                <div class="text-slate-600">
                  인증 필요: <span class="font-semibold text-slate-900">{{ parseConfig(item.config).authRequired ? '예' : '아니오' }}</span>
                  <span v-if="parseConfig(item.config).authType" class="ml-1 text-xs text-slate-400">({{ parseConfig(item.config).authType }})</span>
                </div>
              </div>
            </template>
            <!-- DISCOUNT -->
            <template v-else-if="item.type === 'DISCOUNT'">
              <div class="grid gap-1 text-sm">
                <div class="font-semibold text-slate-900">{{ parseConfig(item.config).discountName || '할인 정책' }}</div>
                <div class="text-slate-600">할인율: <span class="font-semibold text-slate-900">{{ Math.round((parseConfig(item.config).discountRate || 0) * 100) }}%</span></div>
                <div v-if="(parseConfig(item.config).targetGrades || []).length" class="text-slate-600">
                  대상 등급: <span class="font-semibold text-slate-900">{{ (parseConfig(item.config).targetGrades || []).join(', ') }}</span>
                </div>
                <div v-if="parseConfig(item.config).validUntil" class="text-slate-600">
                  유효 기간: <span class="font-semibold text-slate-900">{{ fmtDate(parseConfig(item.config).validUntil) }}</span>
                </div>
              </div>
            </template>
            <!-- PURCHASE_LIMIT -->
            <template v-else-if="item.type === 'PURCHASE_LIMIT'">
              <div class="grid gap-1 text-sm">
                <div class="text-slate-600">1인당 최대 구매: <span class="font-semibold text-slate-900">{{ parseConfig(item.config).limit }}매</span></div>
                <div v-if="parseConfig(item.config).message" class="text-xs text-slate-400">{{ parseConfig(item.config).message }}</div>
              </div>
            </template>
            <template v-else>
              <pre class="whitespace-pre-wrap text-xs text-slate-600">{{ JSON.stringify(parseConfig(item.config), null, 2) }}</pre>
            </template>
          </div>
        </div>
        <div class="flex flex-col gap-2 shrink-0">
          <UiButton variant="ghost" class="h-8 px-3 text-sm" @click="openEditModal(item)">수정</UiButton>
          <UiButton variant="ghost" class="h-8 px-3 text-sm text-red-600 hover:text-red-700" @click="openDeleteModal(item)">삭제</UiButton>
        </div>
      </div>
    </UiCard>

    <UiCard v-if="!loading && items.length && !availableTypes.length">
      <div class="text-xs text-slate-400">모든 정책 유형이 등록되어 있습니다.</div>
    </UiCard>

    <!-- ── Create Modal ── -->
    <UiModal :open="createModalOpen" title="정책 추가" @close="closeCreateModal">
      <form id="policy-create-form" class="grid gap-4" @submit.prevent="submitCreate">
        <div>
          <label class="block text-xs font-semibold text-slate-500">정책 유형 *</label>
          <select v-model="form.type" required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500">
            <option v-for="t in availableTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
        <PolicyConfigForm
          :type="form.type"
          :price-rows="priceRows"
          :presale="presale"
          :discount="discount"
          :purchase-limit="purchaseLimit"
          @update-price-rows="priceRows = $event"
          @add-price-row="priceRows.push({ grade: '', price: 0 })"
          @remove-price-row="removePriceRow"
          @update-presale="presale = $event"
          @update-discount="discount = $event"
          @update-purchase-limit="purchaseLimit = $event"
        />
        <p v-if="submitError" class="text-sm text-red-600">{{ submitError }}</p>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeCreateModal">취소</UiButton>
          <UiButton as="button" type="submit" form="policy-create-form" :disabled="submitting">등록</UiButton>
        </div>
      </template>
    </UiModal>

    <!-- ── Edit Modal ── -->
    <UiModal :open="editModalOpen" title="정책 수정" @close="closeEditModal">
      <form id="policy-edit-form" class="grid gap-4" @submit.prevent="submitEdit">
        <div>
          <label class="block text-xs font-semibold text-slate-500">정책 유형</label>
          <div class="mt-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {{ TYPE_LABEL[form.type] || form.type }}
          </div>
        </div>
        <PolicyConfigForm
          :type="form.type"
          :price-rows="priceRows"
          :presale="presale"
          :discount="discount"
          :purchase-limit="purchaseLimit"
          @update-price-rows="priceRows = $event"
          @add-price-row="priceRows.push({ grade: '', price: 0 })"
          @remove-price-row="removePriceRow"
          @update-presale="presale = $event"
          @update-discount="discount = $event"
          @update-purchase-limit="purchaseLimit = $event"
        />
        <p v-if="submitError" class="text-sm text-red-600">{{ submitError }}</p>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeEditModal">취소</UiButton>
          <UiButton as="button" type="submit" form="policy-edit-form" :disabled="submitting">저장</UiButton>
        </div>
      </template>
    </UiModal>

    <!-- ── Delete Modal ── -->
    <UiModal :open="deleteModalOpen" title="정책 삭제" @close="closeDeleteModal">
      <div class="text-sm text-slate-700">이 정책을 삭제하시겠습니까?</div>
      <div class="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <UiBadge tone="soft">{{ deleteTarget && (TYPE_LABEL[deleteTarget.type] || deleteTarget.type) }}</UiBadge>
      </div>
      <p v-if="submitError" class="mt-2 text-sm text-red-600">{{ submitError }}</p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="ghost" @click="closeDeleteModal">취소</UiButton>
          <UiButton class="bg-red-600 text-white hover:bg-red-700" :disabled="submitting" @click="submitDelete">삭제</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiModal from '../../components/common/UiModal.vue'
import PolicyConfigForm from '../../components/organizer/PolicyConfigForm.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

const ALL_POLICY_TYPES = [
  { value: 'BASE_PRICE',     label: 'BASE_PRICE (기본 가격)' },
  { value: 'PRESALE',        label: 'PRESALE (선예매)' },
  { value: 'DISCOUNT',       label: 'DISCOUNT (할인)' },
  { value: 'PURCHASE_LIMIT', label: 'PURCHASE_LIMIT (구매 제한)' },
]

export const TYPE_LABEL = {
  BASE_PRICE:     '기본 가격 (BASE_PRICE)',
  PRESALE:        '선예매 (PRESALE)',
  DISCOUNT:       '할인 정책 (DISCOUNT)',
  PURCHASE_LIMIT: '구매 제한 (PURCHASE_LIMIT)',
}

export default {
  name: 'OrganizerConcertPoliciesView',
  components: { UiCard, UiBadge, UiButton, UiModal, PolicyConfigForm },

  data() {
    return {
      TYPE_LABEL,
      loading: false,
      items: [],
      errorMessage: '',
      api: null,
      createModalOpen: false,
      editModalOpen: false,
      editTarget: null,
      deleteModalOpen: false,
      deleteTarget: null,
      form: { type: 'BASE_PRICE' },
      priceRows: [{ grade: '', price: 0 }],
      presale: { startAt: '', endAt: '', authRequired: false, authType: '' },
      discount: { discountName: '', discountRate: 0, targetGrades: [], validUntil: '' },
      purchaseLimit: { limit: 4, message: '' },
      submitting: false,
      submitError: '',
    }
  },

  computed: {
    registeredTypes() { return this.items.map((i) => i.type) },
    availableTypes() { return ALL_POLICY_TYPES.filter((t) => !this.registeredTypes.includes(t.value)) },
    hasBasePricePolicy() { return this.registeredTypes.includes('BASE_PRICE') },
  },

  created() { this.api = useApi() },
  mounted() { this.load() },

  methods: {
    async load() {
      const concertId = this.$route.params.concertId
      if (!concertId) return
      this.loading = true
      this.errorMessage = ''
      try {
        const res = await this.api.get(ENDPOINTS.organizerConcertPolicies(concertId))
        this.items = Array.isArray(res) ? res : (res.content ?? res.items ?? [])
      } catch (err) {
        this.errorMessage = err.message || '정책 목록을 불러오지 못했습니다.'
      } finally {
        this.loading = false
      }
    },

    parseConfig(config) {
      if (!config) return {}
      try { return JSON.parse(config) } catch { return {} }
    },

    fmtDate(iso) {
      if (!iso) return '-'
      try { return new Date(iso).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' }) } catch { return iso }
    },

    resetEditorState(type, parsed = {}) {
      if (type === 'BASE_PRICE') {
        const entries = Object.entries(parsed)
        this.priceRows = entries.length ? entries.map(([g, p]) => ({ grade: g, price: Number(p) })) : [{ grade: '', price: 0 }]
      } else if (type === 'PRESALE') {
        this.presale = { startAt: parsed.startAt ?? '', endAt: parsed.endAt ?? '', authRequired: parsed.authRequired ?? false, authType: parsed.authType ?? '' }
      } else if (type === 'DISCOUNT') {
        this.discount = { discountName: parsed.discountName ?? '', discountRate: parsed.discountRate ?? 0, targetGrades: parsed.targetGrades ?? [], validUntil: parsed.validUntil ?? '' }
      } else if (type === 'PURCHASE_LIMIT') {
        this.purchaseLimit = { limit: parsed.limit ?? 4, message: parsed.message ?? '' }
      }
    },

    removePriceRow(idx) {
      if (this.priceRows.length > 1) this.priceRows.splice(idx, 1)
    },

    buildConfig() {
      switch (this.form.type) {
        case 'BASE_PRICE': {
          const obj = {}
          for (const row of this.priceRows) if (row.grade.trim()) obj[row.grade.trim()] = Number(row.price) || 0
          return JSON.stringify(obj)
        }
        case 'PRESALE':
          return JSON.stringify({ startAt: this.presale.startAt, endAt: this.presale.endAt, authRequired: this.presale.authRequired, ...(this.presale.authRequired ? { authType: this.presale.authType } : {}) })
        case 'DISCOUNT':
          return JSON.stringify({ discountName: this.discount.discountName, discountRate: this.discount.discountRate, targetGrades: this.discount.targetGrades, ...(this.discount.validUntil ? { validUntil: this.discount.validUntil } : {}) })
        case 'PURCHASE_LIMIT':
          return JSON.stringify({ limit: Number(this.purchaseLimit.limit) || 1, ...(this.purchaseLimit.message ? { message: this.purchaseLimit.message } : {}) })
        default: return '{}'
      }
    },

    openCreateModal() {
      const first = this.availableTypes[0]
      if (!first) return
      this.form = { type: first.value }
      this.resetEditorState(first.value)
      this.submitError = ''
      this.createModalOpen = true
    },
    closeCreateModal() { this.createModalOpen = false },

    async submitCreate() {
      const concertId = this.$route.params.concertId
      if (!concertId) return
      this.submitError = ''
      this.submitting = true
      try {
        await this.api.post(ENDPOINTS.organizerCreatePolicy(concertId), { type: this.form.type, config: this.buildConfig() })
        this.closeCreateModal()
        await this.load()
      } catch (err) {
        this.submitError = err.message || '정책 등록에 실패했습니다.'
      } finally { this.submitting = false }
    },

    openEditModal(item) {
      this.editTarget = item
      this.form = { type: item.type }
      this.resetEditorState(item.type, this.parseConfig(item.config))
      this.submitError = ''
      this.editModalOpen = true
    },
    closeEditModal() { this.editModalOpen = false; this.editTarget = null },

    async submitEdit() {
      if (!this.editTarget) return
      this.submitError = ''
      this.submitting = true
      try {
        await this.api.put(ENDPOINTS.organizerUpdatePolicy(this.editTarget.id), { type: this.form.type, config: this.buildConfig() })
        this.closeEditModal()
        await this.load()
      } catch (err) {
        this.submitError = err.message || '정책 수정에 실패했습니다.'
      } finally { this.submitting = false }
    },

    openDeleteModal(item) { this.deleteTarget = item; this.submitError = ''; this.deleteModalOpen = true },
    closeDeleteModal() { this.deleteModalOpen = false; this.deleteTarget = null },

    async submitDelete() {
      if (!this.deleteTarget) return
      this.submitError = ''
      this.submitting = true
      try {
        await this.api.del(ENDPOINTS.organizerDeletePolicy(this.deleteTarget.id))
        this.closeDeleteModal()
        await this.load()
      } catch (err) {
        this.submitError = err.message || '정책 삭제에 실패했습니다.'
      } finally { this.submitting = false }
    },
  },
}
</script>
