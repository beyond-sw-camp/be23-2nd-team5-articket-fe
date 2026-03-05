<template>
  <div class="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
    <h2 class="text-lg font-bold text-slate-900">프로필 수정</h2>
    <p class="mt-3 text-sm text-slate-600">
      프로필 수정 기능은 백엔드 API 연동 후 제공될 예정입니다.
    </p>
    <p class="mt-1 text-xs text-slate-500">
      (회원 이름, 연락처 등 수정을 위한 PATCH /users/me 등 API가 필요합니다.)
    </p>
    <RouterLink
      to="/me"
      class="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
    >
      마이페이지로 돌아가기
    </RouterLink>
  </div>
</template>

<script>
export default {
  name: 'ProfileEditView',
}
</script>
