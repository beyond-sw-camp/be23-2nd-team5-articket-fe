<template>
  <div class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-lg font-bold text-slate-900">좋아요한 아티스트</div>
        <div class="mt-0.5 text-sm text-slate-500">내가 좋아요한 아티스트 목록</div>
      </div>
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
      불러오는 중…
    </div>

    <template v-else>
      <!-- 빈 상태 -->
      <div v-if="rows.length === 0" class="rounded-2xl border border-slate-200 bg-slate-50 py-12 text-center">
        <p class="text-sm text-slate-500">좋아요한 아티스트가 없습니다.</p>
        <UiButton variant="tonal" class="mt-4" @click="$router.push('/performers')">아티스트 탐색</UiButton>
      </div>

      <!-- 목록: PerformerMemberListDto (performerId, performerName, performerProfileImgUrl, performerDescription) -->
      <ul v-else class="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <li
          v-for="row in rows"
          :key="row.performerId"
          class="flex items-center gap-4 px-4 py-4 transition hover:bg-slate-50"
        >
          <!-- 프로필 이미지 -->
          <div class="shrink-0">
            <img
              v-if="row.performerProfileImgUrl"
              :src="row.performerProfileImgUrl"
              :alt="row.performerName"
              class="h-16 w-16 rounded-full object-cover border border-slate-200 shadow-sm"
            />
            <div
              v-else
              class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-2xl font-bold border border-slate-200"
            >
              {{ (row.performerName || '?').charAt(0) }}
            </div>
          </div>

          <!-- 이름 + 소개 -->
          <div
            class="flex-1 min-w-0 cursor-pointer"
            @click="$router.push(`/performers/${row.performerId}`)"
          >
            <div class="font-bold text-slate-900 truncate text-base">{{ row.performerName || '아티스트' }}</div>
            <div class="mt-1 text-xs font-medium text-green-600">좋아요한 아티스트</div>
            <p
              v-if="row.performerDescription"
              class="mt-1.5 line-clamp-2 text-xs text-slate-500"
            >
              {{ row.performerDescription }}
            </p>
          </div>

          <!-- 좋아요 취소 -->
          <button
            type="button"
            class="shrink-0 flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-100"
            @click.stop="cancelLike(row)"
          >
            <Heart class="h-4 w-4 fill-red-500 text-red-500" />
            좋아요 취소
          </button>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
import { Heart } from 'lucide-vue-next'
import UiButton from '../../components/common/UiButton.vue'
import { useApi } from '../../composables/useApi'
import { ENDPOINTS } from '../../lib/api/endpoints'

export default {
  name: 'MyPerformerLikesView',
  components: { Heart, UiButton },
  data() {
    return {
      api: null,
      rows: [],
      loading: false
    }
  },
  created() {
    this.api = useApi()
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const list = await this.api.get(ENDPOINTS.performerLikeList())
        const arr = Array.isArray(list) ? list : list?.content ?? []
        this.rows = arr.map((item) => ({
          id: item.id,
          performerId: item.performerId,
          performerName: item.performerName ?? '',
          performerProfileImgUrl: item.performerProfileImgUrl ?? null,
          performerDescription: item.performerDescription ?? null,
          memberId: item.memberId
        }))
      } catch {
        this.rows = []
      } finally {
        this.loading = false
      }
    },
    async cancelLike(row) {
      const performerId = row?.performerId
      if (performerId == null || performerId === '') return
      try {
        await this.api.del(ENDPOINTS.performerDeleteLike() + '?id=' + performerId)
        this.rows = this.rows.filter((r) => r.performerId !== row.performerId)
      } catch (e) {
        console.warn('Like cancel failed', e)
      }
    }
  }
}
</script>
