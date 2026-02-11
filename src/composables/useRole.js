import { computed, reactive } from 'vue'
import { jwtDecode } from 'jwt-decode'

const VALID_ROLES = ['USER', 'ORGANIZER', 'ADMIN']

function getRoleFromToken(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const payload = jwtDecode(token)
    const r = payload?.role
    return VALID_ROLES.includes(r) ? r : 'USER'
  } catch {
    return null
  }
}

function restoreFromStorage() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null
  const role = getRoleFromToken(token)
  if (!role) return { role: 'GUEST', authed: false }
  return { role, authed: true }
}

const restored = restoreFromStorage()
const state = reactive({
  role: restored.role,
  authed: restored.authed,
})

export function useRole() {
  const role = computed(() => state.role)
  const authed = computed(() => state.authed)

  function syncFromToken() {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null
    const r = getRoleFromToken(token)
    if (!r) {
      state.role = 'GUEST'
      state.authed = false
      return
    }
    state.role = r
    state.authed = true
  }

  function setRole(nextRole) {
    state.role = nextRole
    state.authed = nextRole !== 'GUEST'
  }

  function logout() {
    state.role = 'GUEST'
    state.authed = false
  }

  return { role, authed, setRole, logout, syncFromToken }
}

export function getRole() {
  return state.role
}

export function isAuthed() {
  return state.authed
}
