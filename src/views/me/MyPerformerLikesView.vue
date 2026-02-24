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

      <!-- 목록 -->
      <ul v-else class="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <li
          v-for="row in rows"
          :key="row.id"
          class="flex items-center gap-4 px-4 py-3 transition hover:bg-slate-50"
        >
          <!-- 프로필 이미지 -->
          <div class="shrink-0">
            <img
              v-if="row.profileImgUrl"
              :src="row.profileImgUrl"
              :alt="row.name"
              class="h-14 w-14 rounded-full object-cover border border-slate-200"
            />
            <div
              v-else
              class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-xl font-bold border border-slate-200"
            >
              {{ row.name?.charAt(0) ?? '?' }}
            </div>
          </div>

          <!-- 이름 + 정보 -->
          <div
            class="flex-1 min-w-0 cursor-pointer"
            @click="$router.push(`/performers/${row.id}`)"
          >
            <div class="font-bold text-slate-900 truncate">{{ row.name }}</div>
            <div class="mt-0.5 text-sm font-medium text-green-600">
              좋아요 {{ row.likeCount.toLocaleString() }}명
            </div>
            <div v-if="row.birth" class="mt-0.5 text-xs text-slate-400">{{ row.birth }}</div>
            <div v-if="row.description" class="mt-0.5 text-xs text-slate-500 truncate">{{ row.description }}</div>
          </div>

          <!-- 좋아요 취소 버튼 -->
          <button
            class="shrink-0 flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-100"
            @click.stop="cancelLike(row)"
          >
            <Heart class="h-3.5 w-3.5 fill-red-500 text-red-500" />
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
          name: item.name ?? '-',
          profileImgUrl: item.profileImgUrl ?? null,
          description: item.description ?? '',
          birth: item.birth ?? null,
          likeCount: item.likeCount ?? 0,
          liked: item.liked ?? true
        }))
      } catch {
        this.rows = []
      } finally {
        this.loading = false
      }
    },
    async cancelLike(row) {
      try {
        await this.api.del(ENDPOINTS.performerDeleteLike() + '?id=' + row.id)
        this.rows = this.rows.filter((r) => r.id !== row.id)
      } catch (e) {
        console.warn('Like cancel failed', e)
      }
    }
  }
}
</script>
