<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900">공연 생성</h1>
        <p class="mt-1 text-sm text-slate-500">공연 생성 후 정책(가격) 설정 -> 회차 추가 순서로 진행됩니다</p>
      </div>
      <UiButton variant="ghost" class="h-9 px-3 text-sm" @click="$router.push('/organizer/concerts')">
        <- 목록
      </UiButton>
    </div>

    <UiCard>
      <form id="concert-create-form" class="space-y-6" @submit.prevent="submitCreate">
        <section>
          <h2 class="text-sm font-semibold text-slate-900">기본 정보</h2>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-slate-700">공연 제목</label>
              <input
                v-model="form.title"
                type="text"
                required
                placeholder="공연 제목을 입력하세요"
                class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700">카테고리</label>
              <select
                v-model="form.category"
                required
                class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700">게시 상태</label>
              <select
                v-model="form.status"
                required
                class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="DRAFT">초안 (추후 게시)</option>
                <option value="PUBLISHED">바로 게시</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700">관람 연령</label>
              <input
                v-model.number="form.age_limit"
                type="number"
                min="0"
                placeholder="0 = 전체관람가"
                class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-slate-700">공연 썸네일 URL</label>
              <input
                v-model="form.thum_img_url"
                type="url"
                placeholder="https://..."
                class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
        </section>

        <section class="border-t border-slate-100 pt-6">
          <h2 class="text-sm font-semibold text-slate-900">공연장 · 좌석 배치</h2>
          <div class="mt-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700">공연장</label>

              <input
                v-model.trim="venueQuery"
                type="text"
                placeholder="공연장명을 검색하세요"
                class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                @input="onVenueQueryInput"
              />

              <select
                v-model="form.venue_id"
                required
                class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                @change="loadSeatMaps"
              >
                <option value="">공연장을 선택하세요</option>
                <option v-for="v in venues" :key="v.id" :value="v.id">{{ v.name }}</option>
              </select>

              <div v-if="!loadingVenues && venueQuery && venues.length === 0" class="mt-1 text-xs text-slate-400">검색 결과가 없습니다.</div>
              <div v-if="loadingVenues" class="mt-1 text-xs text-slate-400">목록 불러오는 중...</div>
            </div>

            <div v-if="form.venue_id">
              <label class="block text-sm font-medium text-slate-700">좌석 배치도</label>

              <div v-if="loadingSeatMaps" class="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">좌석맵 불러오는 중...</div>

              <div v-else-if="seatMaps.length === 0" class="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">선택한 공연장에 게시된 좌석맵이 없습니다.</div>

              <div v-else class="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  v-for="sm in seatMaps"
                  :key="sm.id"
                  type="button"
                  :class="[
                    'group flex items-center gap-3 rounded-xl border p-3 text-left transition',
                    form.seat_map_id === sm.id
                      ? 'border-red-500 bg-red-50 ring-1 ring-red-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  ]"
                  @click="form.seat_map_id = sm.id"
                >
                  <div class="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <img
                      v-if="sm.thumbnailUrl || sm.thumbnail_url"
                      :src="sm.thumbnailUrl || sm.thumbnail_url"
                      alt=""
                      class="h-full w-full object-cover"
                      @error="$event.target.style.display='none'"
                    />
                    <div v-else class="flex h-full w-full items-center justify-center text-2xl text-slate-300">🗺️</div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-semibold text-slate-900">{{ sm.name || `배치 ${sm.id}` }}</div>
                    <div class="mt-0.5 text-xs text-slate-500">
                      {{ (sm.totalSeats ?? sm.row_count ?? sm.rowCount ?? '-') }}석
                      <span v-if="sm.version"> · v{{ sm.version }}</span>
                    </div>
                  </div>
                  <UiBadge v-if="form.seat_map_id === sm.id" tone="solid" color="red" class="shrink-0">선택됨</UiBadge>
                </button>
              </div>

              <div v-if="selectedSeatMap" class="mt-2 flex items-center gap-2">
                <UiButton
                  v-if="selectedSeatMap.thumbnailUrl || selectedSeatMap.thumbnail_url"
                  variant="ghost"
                  type="button"
                  class="h-8 px-3 text-xs"
                  @click="openSeatMapPreview"
                >
                  배치도 미리보기
                </UiButton>
                <span v-else class="text-xs text-slate-500">배치도 썸네일이 없습니다</span>
              </div>
            </div>
          </div>
        </section>

        <div class="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <UiButton variant="ghost" type="button" @click="$router.push('/organizer/concerts')">취소</UiButton>
          <UiButton as="button" type="submit" form="concert-create-form" :disabled="saving">
            {{ saving ? '생성 중...' : '공연 생성' }}
          </UiButton>
        </div>
      </form>
    </UiCard>

    <UiModal
      :open="seatMapPreviewOpen"
      title="배치도 미리보기"
      max-width-class="max-w-6xl"
      @close="closeSeatMapPreview"
    >
      <div v-if="selectedSeatMap" class="flex h-[75vh] flex-col">
        <div
          class="w-full flex-1 overflow-hidden rounded-lg bg-slate-50 p-2 select-none"
          :class="isPreviewDragging ? 'cursor-grabbing' : 'cursor-grab'"
          @wheel.prevent="onPreviewWheel"
          @mousedown.left="startPreviewDrag"
          @mousemove="onPreviewDrag"
          @mouseup="endPreviewDrag"
          @mouseleave="endPreviewDrag"
        >
          <img
            v-if="selectedSeatMap.thumbnailUrl || selectedSeatMap.thumbnail_url"
            :src="selectedSeatMap.thumbnailUrl || selectedSeatMap.thumbnail_url"
            :alt="selectedSeatMap.name || '좌석맵'"
            class="h-full w-full rounded-lg object-contain transition-transform duration-75"
            :style="{ transform: `translate(${previewOffsetX}px, ${previewOffsetY}px) scale(${previewScale})`, transformOrigin: 'center center' }"
            draggable="false"
            @dragstart.prevent
            @error="$event.target.style.display='none'"
          />
        </div>

        <div class="mt-3 flex items-center justify-between">
          <p class="text-sm text-slate-600">{{ selectedSeatMap.name || `배치 ${selectedSeatMap.id}` }}</p>
          <div class="flex items-center gap-2">
            <UiButton variant="ghost" class="h-8 px-3 text-xs" @click="zoomOutPreview">-</UiButton>
            <div class="text-xs text-slate-500">{{ Math.round(previewScale * 100) }}%</div>
            <UiButton variant="ghost" class="h-8 px-3 text-xs" @click="zoomInPreview">+</UiButton>
            <UiButton variant="ghost" class="h-8 px-3 text-xs" @click="resetPreviewZoom">100%</UiButton>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UiButton variant="ghost" @click="closeSeatMapPreview">닫기</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script>
import UiCard from '../../components/common/UiCard.vue'
import UiButton from '../../components/common/UiButton.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiModal from '../../components/common/UiModal.vue'
import { useApi } from '../../composables/useApi'
import { showErrorAlert } from '../../composables/useErrorToast'
import { ENDPOINTS } from '../../lib/api/endpoints'
import { CONCERT_CATEGORY_OPTIONS } from '../../lib/constants/concertCategory'

// ERD: concert 테이블
// 필수: title, status (DRAFT/PUBLISHED), seat_map_id
// 선택: age_limit (member_id는 자동)
const DUMMY_CONCERT = {
  title: '새로운 공연',
  status: 'DRAFT',
  seat_map_id: 1,
  age_limit: null
}

function getDefaultForm() {
  return {
    title: DUMMY_CONCERT.title,
    category: 'CONCERT',
    status: DUMMY_CONCERT.status,
    venue_id: '',
    seat_map_id: null,
    age_limit: DUMMY_CONCERT.age_limit,
    thum_img_url: ''
  }
}

export default {
  name: 'OrganizerNewConcertView',
  components: {
    UiCard,
    UiButton,
    UiBadge,
    UiModal
  },
  computed: {
    categoryOptions() {
      return CONCERT_CATEGORY_OPTIONS
    },
    selectedSeatMap() {
      if (!this.form.seat_map_id || !this.seatMaps.length) return null
      return this.seatMaps.find((sm) => sm.id === this.form.seat_map_id) ?? null
    }
  },
  data() {
    return {
      api: null,
      form: getDefaultForm(),
      saving: false,
      successMessage: '',
      venueQuery: '',
      venueSearchTimer: null,
      venues: [],
      seatMaps: [],
      loadingVenues: false,
      loadingSeatMaps: false,
      seatMapPreviewOpen: false,
      previewScale: 1,
      previewOffsetX: 0,
      previewOffsetY: 0,
      isPreviewDragging: false,
      previewDragStartX: 0,
      previewDragStartY: 0
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.loadVenues()
  },
  beforeUnmount() {
    if (this.venueSearchTimer) clearTimeout(this.venueSearchTimer)
  },
  methods: {
    onVenueQueryInput() {
      if (this.venueSearchTimer) clearTimeout(this.venueSearchTimer)
      this.venueSearchTimer = setTimeout(() => {
        this.loadVenues()
      }, 250)
    },
    async loadVenues() {
      this.loadingVenues = true
      try {
        const keyword = (this.venueQuery || '').trim()
        const res = await this.api.get(ENDPOINTS.searchVenues({ keyword, page: 0, size: 200 }))
        this.venues = Array.isArray(res) ? res : res?.content || res?.items || []
      } catch (err) {
        console.warn('Failed to load venues', err)
        this.venues = []
      } finally {
        this.loadingVenues = false
      }
    },
    async loadSeatMaps() {
      if (!this.form.venue_id) {
        this.seatMaps = []
        this.form.seat_map_id = null
        return
      }
      this.loadingSeatMaps = true
      this.form.seat_map_id = null
      try {
        const res = await this.api.get(ENDPOINTS.venueSeatMaps(this.form.venue_id))
        const allSeatMaps = Array.isArray(res) ? res : res?.content || res?.items || []
        this.seatMaps = allSeatMaps.filter((sm) => sm.seatMapStatus === 'PUBLISHED')
      } catch (err) {
        console.warn('Failed to load seat maps', err)
        this.seatMaps = []
      } finally {
        this.loadingSeatMaps = false
      }
    },
    openSeatMapPreview() {
      this.previewScale = 1
      this.previewOffsetX = 0
      this.previewOffsetY = 0
      this.isPreviewDragging = false
      this.seatMapPreviewOpen = true
    },
    closeSeatMapPreview() {
      this.seatMapPreviewOpen = false
      this.previewScale = 1
      this.previewOffsetX = 0
      this.previewOffsetY = 0
      this.isPreviewDragging = false
    },
    onPreviewWheel(evt) {
      const delta = evt.deltaY > 0 ? -0.1 : 0.1
      this.previewScale = Math.min(4, Math.max(0.5, +(this.previewScale + delta).toFixed(2)))
    },
    zoomInPreview() {
      this.previewScale = Math.min(4, +(this.previewScale + 0.1).toFixed(2))
    },
    zoomOutPreview() {
      this.previewScale = Math.max(0.5, +(this.previewScale - 0.1).toFixed(2))
    },
    resetPreviewZoom() {
      this.previewScale = 1
      this.previewOffsetX = 0
      this.previewOffsetY = 0
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
    endPreviewDrag() {
      this.isPreviewDragging = false
    },
    async submitCreate() {
      if (!this.form.seat_map_id) {
        showErrorAlert(new Error('좌석맵을 선택해 주세요. 공연장을 먼저 선택한 뒤 좌석맵을 선택하세요.'))
        return
      }
      this.successMessage = ''
      this.saving = true
      const payload = {
        title: this.form.title || DUMMY_CONCERT.title,
        category: this.form.category || 'CONCERT',
        status: this.form.status || DUMMY_CONCERT.status,
        seatMapId: this.form.seat_map_id
      }
      if (this.form.age_limit !== null && this.form.age_limit !== undefined && this.form.age_limit !== '') {
        payload.ageLimit = Number(this.form.age_limit)
      }
      if (this.form.thum_img_url) {
        payload.thumImgUrl = this.form.thum_img_url
      }
      try {
        const res = await this.api.post(ENDPOINTS.organizerCreateConcert(), payload)
        let concertId = res?.id ?? res?.concertId
        if (concertId == null) {
          const list = await this.api.get(ENDPOINTS.organizerConcerts()).catch(() => [])
          const arr = Array.isArray(list) ? list : (list?.items ?? list?.content ?? [])
          const found = arr.find((c) => c.title === payload.title)
          concertId = found?.id
        }
        if (concertId) {
          this.$router.push(`/organizer/concerts/${concertId}/policies?from=create`)
          return
        }
      } catch (err) {
      } finally {
        this.saving = false
      }
    }
  }
}
</script>
