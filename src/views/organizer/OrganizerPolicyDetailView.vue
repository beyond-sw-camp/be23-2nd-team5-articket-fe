<template>
  <div class="grid gap-4">
    <UiCard>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">정책 수정 / 삭제</div>
          <div v-if="policy" class="mt-1 text-sm text-slate-500">정책 ID: {{ policy.id }}</div>
        </div>
        <div class="flex gap-2">
          <UiBadge tone="soft">ORGANIZER</UiBadge>
          <UiButton variant="ghost" class="h-8 px-3 text-sm" @click="goBack">← 목록</UiButton>
        </div>
      </div>
    </UiCard>

    <UiCard v-if="loading"><div class="text-sm text-slate-500">불러오는 중…</div></UiCard>
    <UiCard v-else-if="errorMessage">
      <div class="text-sm text-red-600">{{ errorMessage }}</div>
      <UiButton variant="ghost" class="mt-3 h-8 px-3 text-sm" @click="goBack">← 목록으로</UiButton>
    </UiCard>

    <template v-else-if="policy">
      <UiCard>
        <div class="text-sm font-semibold text-slate-900">정책 수정</div>
        <form class="mt-4 grid gap-4" @submit.prevent="submitEdit">
          <div>
            <label class="block text-xs font-semibold text-slate-500">정책 유형</label>
            <div class="mt-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {{ TYPE_LABEL[policy.type] || policy.type }}
            </div>
          </div>

          <PolicyConfigForm
            :type="policy.type"
            :price-rows="priceRows"
            :presale="presale"
            :discount="discount"
            :purchase-limit="purchaseLimit"
            @update-price-rows="priceRows = $event"
            @add-price-row="priceRows.push({ grade: '', price: 0 })"
            @remove-price-row="(idx) => { if (priceRows.length > 1) priceRows.splice(idx, 1) }"
            @update-presale="presale = $event"
            @update-discount="discount = $event"
            @update-purchase-limit="purchaseLimit = $event"
          />

          <p v-if="editError" class="text-sm text-red-600">{{ editError }}</p>
          <p v-if="editSuccess" class="text-sm text-green-600">{{ editSuccess }}</p>
          <div class="flex justify-end gap-2">
            <UiButton variant="ghost" type="button" @click="resetForm">취소</UiButton>
            <UiButton as="button" type="submit" :disabled="saving">저장</UiButton>
          </div>
        </form>
      </UiCard>

      <UiCard>
        <div class="text-sm font-semibold text-slate-900">정책 삭제</div>
        <div class="mt-1 text-sm text-slate-500">이 정책을 삭제하면 복구할 수 없습니다.</div>
        <p v-if="deleteError" class="mt-2 text-sm text-red-600">{{ deleteError }}</p>
        <div class="mt-4 flex justify-end">
          <UiButton class="bg-red-600 text-white hover:bg-red-700" :disabled="deleting" @click="submitDelete">삭제</UiButton>
        </div>
      </UiCard>
    </template>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'
import PolicyConfigForm from '../../components/organizer/PolicyConfigForm.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

const TYPE_LABEL = {
  BASE_PRICE:     '기본 가격 (BASE_PRICE)',
  PRESALE:        '선예매 (PRESALE)',
  DISCOUNT:       '할인 정책 (DISCOUNT)',
  PURCHASE_LIMIT: '구매 제한 (PURCHASE_LIMIT)',
}

export default {
  name: 'OrganizerPolicyDetailView',
  components: { UiCard, UiBadge, UiButton, PolicyConfigForm },
  data() {
    return {
      TYPE_LABEL,
      loading: false,
      policy: null,
      errorMessage: '',
      api: null,
      // sub-editor state
      priceRows: [{ grade: '', price: 0 }],
      presale: { startAt: '', endAt: '', authRequired: false, authType: '' },
      discount: { discountName: '', discountRate: 0, targetGrades: [], validUntil: '' },
      purchaseLimit: { limit: 4, message: '' },
      saving: false,
      editError: '',
      editSuccess: '',
      deleting: false,
      deleteError: '',
    }
  },
  created() { this.api = useApi() },
  mounted() { this.load() },
  methods: {
    goBack() {
      const concertId = this.$route.query.concertId
      if (concertId) this.$router.push(`/organizer/concerts/${concertId}/policies`)
      else this.$router.back()
    },
    async load() {
      const policyId = this.$route.params.policyId
      const concertId = this.$route.query.concertId
      if (!policyId || !concertId) { this.errorMessage = '공연 ID가 필요합니다. 정책 목록에서 다시 접근해 주세요.'; return }
      this.loading = true
      this.errorMessage = ''
      try {
        const list = await this.api.get(ENDPOINTS.concertPolicies(concertId))
        const items = Array.isArray(list) ? list : (list.content ?? list.items ?? [])
        this.policy = items.find((p) => String(p.id) === String(policyId)) ?? null
        if (!this.policy) this.errorMessage = '해당 정책을 찾을 수 없습니다.'
        else this.resetForm()
      } catch (err) {
        this.errorMessage = err.message || '정책 정보를 불러오지 못했습니다.'
      } finally { this.loading = false }
    },
    parseConfig(config) {
      if (!config) return {}
      try { return JSON.parse(config) } catch { return {} }
    },
    resetForm() {
      if (!this.policy) return
      const p = this.parseConfig(this.policy.config)
      this.editError = ''; this.editSuccess = ''
      switch (this.policy.type) {
        case 'BASE_PRICE':
          this.priceRows = Object.entries(p).length
            ? Object.entries(p).map(([grade, price]) => ({ grade, price: Number(price) }))
            : [{ grade: '', price: 0 }]
          break
        case 'PRESALE':
          this.presale = { startAt: p.startAt ?? '', endAt: p.endAt ?? '', authRequired: p.authRequired ?? false, authType: p.authType ?? '' }
          break
        case 'DISCOUNT':
          this.discount = { discountName: p.discountName ?? '', discountRate: p.discountRate ?? 0, targetGrades: p.targetGrades ?? [], validUntil: p.validUntil ?? '' }
          break
        case 'PURCHASE_LIMIT':
          this.purchaseLimit = { limit: p.limit ?? 4, message: p.message ?? '' }
          break
      }
    },
    addPriceRow() { this.priceRows.push({ grade: '', price: 0 }) },
    removePriceRow(idx) { if (this.priceRows.length > 1) this.priceRows.splice(idx, 1) },
    buildConfig() {
      switch (this.policy.type) {
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
    async submitEdit() {
      this.editError = ''; this.editSuccess = ''; this.saving = true
      try {
        await this.api.put(ENDPOINTS.organizerUpdatePolicy(this.policy.id), { type: this.policy.type, config: this.buildConfig() })
        this.editSuccess = '저장되었습니다.'
        await this.load()
      } catch (err) { this.editError = err.message || '정책 수정에 실패했습니다.' }
      finally { this.saving = false }
    },
    async submitDelete() {
      this.deleteError = ''; this.deleting = true
      try {
        await this.api.del(ENDPOINTS.organizerDeletePolicy(this.policy.id))
        this.goBack()
      } catch (err) { this.deleteError = err.message || '정책 삭제에 실패했습니다.' }
      finally { this.deleting = false }
    },
  },
}
</script>
