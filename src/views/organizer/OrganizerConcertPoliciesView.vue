<template>
  <div class="space-y-6 pb-24">
    <!-- Page Title -->
    <div>
      <h1 class="text-xl font-bold text-slate-900">가격 정책</h1>
      <p class="mt-1 text-sm text-slate-500">공연 생성 후 가격 정책 설정 -> 구매 수량 정책 설정 -> 회차 등록 순서로 진행됩니다.</p>
    </div>

    <!-- Step Indicator Container -->
    <div v-if="fromCreate" class="rounded-2xl border border-slate-100 bg-white px-6 pb-12 pt-6 shadow-sm">
      <StepIndicator :steps="['기본 정보', '가격 정책', '구매 수량 정책', '회차 등록']" :active="currentStepIndex" />
    </div>

    <!-- Info Alert -->
    <div v-if="fromCreate" class="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
      <p class="text-sm font-medium text-green-800">공연이 생성되었습니다.</p>
      <p class="mt-0.5 text-sm text-green-700">가격 정책과 구매 수량 정책을 설정한 뒤 회차를 등록하세요.</p>
    </div>

    <!-- Header + Policy List Card -->
    <UiCard>
      <!-- Card Header -->
      <div class="flex items-start justify-between gap-6">
        <div>
          <div class="flex items-center gap-2">
            <div class="text-sm font-semibold text-slate-900">공연 정책 관리</div>
            <UiBadge tone="soft" class="mt-0.5">ORGANIZER</UiBadge>
          </div>
          <div class="mt-1 text-sm text-slate-500">
            기본 가격, 구매 제한 정책을 설정합니다.
          </div>
        </div>
        <div class="shrink-0">
          <UiButton
            class="h-11 px-5 text-sm font-semibold"
            :disabled="policyLocked || !availableTypes.length"
            @click="openCreateModal"
          >
            + 정책 추가
          </UiButton>
        </div>
      </div>

      <!-- 정책 잠금 안내 -->
      <div
        v-if="policyLocked"
        class="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
      >
        <div class="text-xs font-semibold text-slate-700">정책 수정 불가</div>
        <div class="mt-0.5 text-xs text-slate-600">
          이미 게시되었거나 회차가 생성된 공연은 가격 정책과 구매 수량 제한 정책을 수정할 수 없습니다.
        </div>
      </div>

      <!-- 필수 정책 안내 -->
      <div
        v-if="!loading && requiredPolicyMessage"
        class="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
      >
        <div class="text-xs font-semibold text-amber-700">필수 설정 필요</div>
        <div class="mt-0.5 text-xs text-amber-600">
          {{ requiredPolicyMessage }}
        </div>
      </div>

      <!-- Policy List (simple rows, no extra box) -->
      <div class="mt-5 border-t border-slate-100">
        <!-- Loading / Error / Empty states -->
        <div v-if="loading" class="py-3 text-sm text-slate-500">불러오는 중...</div>
        <div v-else-if="errorMessage" class="py-3 text-sm text-red-600">
          {{ errorMessage }}
        </div>
        <div v-else-if="!items.length" class="py-3 text-sm text-slate-500">
          등록된 정책이 없습니다. <strong>기본 가격 정책</strong>과 <strong>구매 수량 제한</strong>을 먼저 등록하세요.
        </div>

        <!-- Policies -->
        <template v-else>
          <div
            v-for="item in items"
            :key="item.id"
            class="flex items-center justify-between gap-4 border-b border-slate-100 py-3"
          >
            <div class="flex-1 min-w-0">
              <!-- Type & primary summary -->
              <div class="flex items-center gap-3">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {{ TYPE_LABEL[item.type] || item.type }}
                </span>

                <template v-if="item.type === 'BASE_PRICE'">
                  <span class="rounded-full bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {{ firstBasePriceEntry(item.config).grade || '-' }}
                  </span>
                </template>
                <template v-else-if="item.type === 'PURCHASE_LIMIT'">
                  <span class="text-sm font-medium text-slate-800">
                    1인당 최대 {{ parseConfig(item.config).limit }}매
                  </span>
                </template>
              </div>

              <!-- Detail line -->
              <div class="mt-1 text-xs text-slate-500">
                <template v-if="item.type === 'BASE_PRICE'">
                  좌석 등급별 기본 가격을 설정합니다.
                </template>
                <template v-else-if="item.type === 'PURCHASE_LIMIT'">
                  회원당 구매 제한 수량을 설정합니다.
                </template>
              </div>
            </div>

            <!-- Right side: price/summary + actions -->
            <div class="flex items-center gap-4 shrink-0">
              <div class="min-w-[80px] text-right text-sm font-semibold text-slate-900">
                <template v-if="item.type === 'BASE_PRICE'">
                  {{ firstBasePriceEntry(item.config).price.toLocaleString() }}원
                </template>
                <template v-else-if="item.type === 'PURCHASE_LIMIT'">
                  {{ parseConfig(item.config).limit }}매
                </template>
              </div>
              <div class="flex gap-2">
                <UiButton
                variant="ghost"
                class="h-8 px-3 text-xs font-semibold"
                :disabled="policyLocked"
                @click="openEditModal(item)"
              >
                  수정
                </UiButton>
                <UiButton
                  variant="ghost"
                  class="h-8 px-3 text-xs font-semibold text-red-600 hover:text-red-700"
                  :disabled="policyLocked"
                  @click="openDeleteModal(item)"
                >
                  삭제
                </UiButton>
              </div>
            </div>
          </div>
        </template>
      </div>
    </UiCard>

    <!-- Navigation Footer (Fixed & Centered in Content Area) -->
    <div
      v-if="fromCreate"
      class="fixed bottom-6 left-64 right-0 z-50 flex justify-center px-6 pointer-events-none"
    >
      <div
        class="pointer-events-auto flex w-full max-w-4xl items-center justify-between rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-2xl backdrop-blur-md"
      >
        <UiButton
          variant="ghost"
          class="h-11 px-6 text-sm text-slate-600"
          @click="$router.push(`/organizer/concerts/${$route.params.concertId}/edit?from=create`)"
        >
          <- 이전 (기본 정보)
        </UiButton>

        <div class="flex items-center gap-4">
          <p
            v-if="requiredPolicyMessage"
            class="hidden text-xs font-medium text-amber-600 sm:block"
          >
            {{ requiredPolicyMessage }}
          </p>
          <UiButton
            class="h-11 px-8 font-bold shadow-sm"
            :disabled="isBottomActionDisabled"
            @click="handleBottomAction"
          >
            {{ bottomActionLabel }}
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <UiModal :open="createModalOpen" title="정책 추가" @close="closeCreateModal">
      <form id="policy-create-form" class="grid gap-4" @submit.prevent="submitCreate">
        <div>
          <label class="block text-xs font-semibold text-slate-500">정책 유형 *</label>
          <select
            v-model="form.type"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option v-for="t in availableTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
        <PolicyConfigForm
          :type="form.type"
          :seat-grades="seatGrades"
          :price-rows="priceRows"
          :purchase-limit="purchaseLimit"
          @update-price-rows="priceRows = $event"
          @add-price-row="priceRows.push($event || { grade: '', price: 0 })"
          @remove-price-row="removePriceRow"
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
          :seat-grades="seatGrades"
          :price-rows="priceRows"
          :purchase-limit="purchaseLimit"
          @update-price-rows="priceRows = $event"
          @add-price-row="priceRows.push($event || { grade: '', price: 0 })"
          @remove-price-row="removePriceRow"
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
import StepIndicator from '../../components/common/StepIndicator.vue'
import PolicyConfigForm from '../../components/organizer/PolicyConfigForm.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

const ALL_POLICY_TYPES = [
  { value: 'BASE_PRICE', label: 'BASE_PRICE' },
  { value: 'PURCHASE_LIMIT', label: 'PURCHASE_LIMIT' },
]

export const TYPE_LABEL = {
  BASE_PRICE: '기본 가격',
  PURCHASE_LIMIT: '구매 수량 제한',
}

export default {
  name: 'OrganizerConcertPoliciesView',
  components: { UiCard, UiBadge, UiButton, UiModal, PolicyConfigForm, StepIndicator },
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
      seatGrades: [],
      priceRows: [{ grade: '', price: 0 }],
      purchaseLimit: { limit: 10, message: '' },
      submitting: false,
      submitError: '',
      concertDetail: null,
      hasSchedules: false,
      policyLocked: false,
    }
  },
  computed: {
    registeredTypes() {
      return this.items.map((i) => i.type)
    },
    availableTypes() {
      return ALL_POLICY_TYPES.filter((t) => !this.registeredTypes.includes(t.value))
    },
    hasBasePricePolicy() {
      return this.registeredTypes.includes('BASE_PRICE')
    },
    hasPurchaseLimitPolicy() {
      return this.registeredTypes.includes('PURCHASE_LIMIT')
    },
    policyStep() {
      return this.$route.query?.policyStep === 'limit' ? 'limit' : 'price'
    },
    currentStepIndex() {
      if (this.policyStep === 'limit') return 2
      return 1
    },
    canGoToLimitStep() {
      return this.hasBasePricePolicy
    },
    canProceedToSchedules() {
      return this.hasBasePricePolicy && this.hasPurchaseLimitPolicy
    },
    requiredPolicyMessage() {
      if (this.policyStep === 'price' && !this.hasBasePricePolicy) {
        return '2단계 가격 정책(BASE_PRICE)을 먼저 등록해 주세요.'
      }
      if (this.policyStep === 'limit' && !this.hasPurchaseLimitPolicy) {
        return '3단계 구매 수량 제한(PURCHASE_LIMIT) 정책을 먼저 등록해 주세요.'
      }
      return ''
    },
    bottomActionLabel() {
      if (this.policyStep === 'price') {
        return '다음: 구매 수량 정책 등록 ->'
      }

      if (!this.hasPurchaseLimitPolicy) {
        return '구매 수량 정책 등록 필요'
      }

      return '다음: 회차 등록 ->'
    },
    fromCreate() {
      return this.$route.query?.from === 'create'
    },
    isBottomActionDisabled() {
      if (this.policyStep === 'price') {
        return !this.hasBasePricePolicy
      }
      return !this.hasPurchaseLimitPolicy
    },
  },
  created() { this.api = useApi() },
  mounted() {
    this.load()
    this.loadSeatGrades()
  },
  methods: {
    firstBasePriceEntry(config) {
      const parsed = this.parseConfig(config)
      const entries = Object.entries(parsed || {})
      if (!entries.length) return { grade: '-', price: 0 }
      const [grade, price] = entries[0]
      return { grade, price: Number(price) || 0 }
    },
    async loadSeatGrades() {
      const concertId = this.$route.params.concertId
      if (!concertId) return
      try {
        const detail = await this.api.get(ENDPOINTS.concert(concertId))
        const seatMapId = detail?.seatMapId ?? detail?.seat_map_id ?? detail?.concertSeatMapResDto?.id ?? null
        if (!seatMapId) {
          this.seatGrades = []
          return
        }
        const grades = await this.api.get(ENDPOINTS.organizerSeatMapGrades(seatMapId))
        this.seatGrades = Array.isArray(grades) ? grades.filter(Boolean) : []
      } catch {
        this.seatGrades = []
      }
    },
    async load() {
      const concertId = this.$route.params.concertId
      if (!concertId) return

      this.loading = true
      this.errorMessage = ''

      try {
        const [policiesRes, concertRes, schedulesRes] = await Promise.all([
          this.api.get(ENDPOINTS.concertPolicies(concertId)),
          this.api.get(ENDPOINTS.concert(concertId)),
          this.api.get(ENDPOINTS.concertSchedules(concertId)),
        ])

        this.items = Array.isArray(policiesRes)
          ? policiesRes
          : (policiesRes.content ?? policiesRes.items ?? [])

        this.concertDetail = concertRes

        const schedules = Array.isArray(schedulesRes)
          ? schedulesRes
          : (schedulesRes.content ?? schedulesRes.items ?? [])

        this.hasSchedules = schedules.length > 0

        const concertStatus =
          concertRes?.status ??
          concertRes?.concertStatus ??
          concertRes?.concert_status ??
          'DRAFT'

        this.policyLocked = concertStatus !== 'DRAFT' || this.hasSchedules
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
        const map = Object.fromEntries(
          Object.entries(parsed).map(([grade, price]) => [String(grade), Number(price) || 0])
        )
        if (this.seatGrades.length) {
          this.priceRows = this.seatGrades.map((grade) => ({ grade, price: map[grade] ?? 0 }))
        } else if (Object.entries(map).length) {
          this.priceRows = Object.entries(map).map(([grade, price]) => ({ grade, price }))
        } else {
          this.priceRows = [{ grade: '', price: 0 }]
        }
      } else if (type === 'PURCHASE_LIMIT') {
        this.purchaseLimit = { limit: parsed.limit ?? 10, message: parsed.message ?? '' }
      }
    },
    removePriceRow(idx) {
      if (this.priceRows.length > 1) this.priceRows.splice(idx, 1)
    },
    validateBasePriceRows() {
      if (!this.seatGrades.length) return true
      const configured = new Set(
        this.priceRows
          .map((row) => String(row.grade || '').trim())
          .filter((grade) => grade && this.seatGrades.includes(grade))
      )
      const missing = this.seatGrades.filter((grade) => !configured.has(grade))
      if (missing.length) {
        this.submitError = `가격이 누락된 좌석 등급: ${missing.join(', ')}`
        return false
      }
      return true
    },
    buildConfig() {
      switch (this.form.type) {
        case 'BASE_PRICE': {
          const obj = {}
          for (const row of this.priceRows) {
            const grade = String(row.grade || '').trim()
            if (!grade) continue
            if (this.seatGrades.length && !this.seatGrades.includes(grade)) continue
            obj[grade] = Number(row.price) || 0
          }
          return JSON.stringify(obj)
        }
        case 'PURCHASE_LIMIT':
          return JSON.stringify({
            limit: Number(this.purchaseLimit.limit) || 10,
            ...(this.purchaseLimit.message ? { message: this.purchaseLimit.message } : {}),
          })
        default:
          return '{}'
      }
    },
    openCreateModal() {
      if (this.policyLocked) return

      let targetType = 'BASE_PRICE'

      if (this.policyStep === 'limit') {
        targetType = 'PURCHASE_LIMIT'
      }

      const exists = this.registeredTypes.includes(targetType)
      if (exists) return

      this.form = { type: targetType }
      this.resetEditorState(targetType)
      this.submitError = ''
      this.createModalOpen = true
    },
    closeCreateModal() { this.createModalOpen = false },
    async submitCreate() {
      const concertId = this.$route.params.concertId
      if (!concertId) return

      this.submitError = ''
      if (this.form.type === 'BASE_PRICE' && !this.validateBasePriceRows()) return

      this.submitting = true
      try {
        await this.api.post(ENDPOINTS.organizerCreatePolicy(concertId), {
          type: this.form.type,
          config: this.buildConfig(),
        })

        this.closeCreateModal()
        await this.load()

        /**
         * 생성 플로우에서는 가격 정책 등록 직후 자동으로 3단계(구매 수량 정책)로 넘긴다.
         * 별도 페이지 이동 없이 query만 바꿔 같은 화면에서 단계만 전환한다.
         */
        if (this.fromCreate && this.form.type === 'BASE_PRICE') {
          this.$router.replace({
            path: this.$route.path,
            query: { ...this.$route.query, policyStep: 'limit' },
          })
        }
      } catch (err) {
        this.submitError = err.message || '정책 등록에 실패했습니다.'
      } finally {
        this.submitting = false
      }
    },
    openEditModal(item) {
      if (this.policyLocked) return

      this.editTarget = item
      this.form = { type: item.type }
      this.resetEditorState(item.type, this.parseConfig(item.config))
      this.submitError = ''
      this.editModalOpen = true
    },
    closeEditModal() {
      this.editModalOpen = false
      this.editTarget = null
    },
    async submitEdit() {
      if (!this.editTarget) return
      this.submitError = ''
      if (this.form.type === 'BASE_PRICE' && !this.validateBasePriceRows()) return
      this.submitting = true
      try {
        await this.api.put(ENDPOINTS.organizerUpdatePolicy(this.editTarget.id), { type: this.form.type, config: this.buildConfig() })
        this.closeEditModal()
        await this.load()
      } catch (err) {
        this.submitError = err.message || '정책 수정에 실패했습니다.'
      } finally {
        this.submitting = false
      }
    },
    openDeleteModal(item) {
      if (this.policyLocked) return

      this.deleteTarget = item
      this.submitError = ''
      this.deleteModalOpen = true
    },
    closeDeleteModal() {
      this.deleteModalOpen = false
      this.deleteTarget = null
    },
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
      } finally {
        this.submitting = false
      }
    },
    goToSchedulesStep() {
      if (!this.canProceedToSchedules) return
      const concertId = this.$route.params.concertId
      if (!concertId) return
      this.$router.push(`/organizer/concerts/${concertId}/schedules?from=create`)
    },
    handleBottomAction() {
      const concertId = this.$route.params.concertId
      if (!concertId) return

      if (this.policyStep === 'price') {
        if (!this.hasBasePricePolicy) return

        this.$router.replace({
          path: this.$route.path,
          query: { ...this.$route.query, policyStep: 'limit' },
        })
        return
      }

      if (!this.hasPurchaseLimitPolicy) return

      this.$router.push(`/organizer/concerts/${concertId}/schedules?from=create`)
    },
  },
}
</script>
