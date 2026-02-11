<template>
  <div class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">ADMIN 운영 대시보드</div>
        <div class="mt-1 text-sm text-slate-500">플랫폼 자산/보안/차단/감사 로그 요약</div>
      </div>
      <UiBadge tone="soft">ADMIN</UiBadge>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <StatCard label="활성 공연장" value="3" hint="mock" />
      <StatCard label="차단 목록" value="0" hint="mock" />
      <StatCard label="감사 로그" value="50" hint="최근 50건" />
    </div>

    <UiCard>
      <div class="flex flex-wrap items-center gap-2">
        <UiButton class="h-11 px-5" @click="$router.push('/admin/venues')">공연장</UiButton>
        <UiButton variant="ghost" class="h-11 px-5" @click="$router.push('/admin/audit-logs')">감사 로그</UiButton>
        <UiButton variant="ghost" class="h-11 px-5" @click="$router.push('/admin/blocklist')">차단</UiButton>
      </div>
    </UiCard>
  </div>
</template>

<script>
import StatCard from '../../components/common/StatCard.vue'
import UiCard from '../../components/common/UiCard.vue'
import UiBadge from '../../components/common/UiBadge.vue'
import UiButton from '../../components/common/UiButton.vue'

export default {
  name: 'AdminDashboardView',
  components: {
    StatCard,
    UiCard,
    UiBadge,
    UiButton
  }
}
</script>
