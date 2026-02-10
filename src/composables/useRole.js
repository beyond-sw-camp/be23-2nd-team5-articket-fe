import { computed, reactive } from 'vue'

const state = reactive({
  role: 'GUEST', // GUEST | USER | ORGANIZER | ADMIN
  authed: false,
})

export function useRole() {
  const role = computed(() => state.role)
  const authed = computed(() => state.authed)

  function setRole(nextRole) {
    state.role = nextRole
    state.authed = nextRole !== 'GUEST'
  }

  function logout() {
    state.role = 'GUEST'
    state.authed = false
  }

  return { role, authed, setRole, logout }
}

export function getRole() {
  return state.role
}

export function isAuthed() {
  return state.authed
}

