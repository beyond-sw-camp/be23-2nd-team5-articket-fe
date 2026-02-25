import { reactive } from 'vue'
import { EventSourcePolyfill } from 'event-source-polyfill'

const SSE_URL = `${import.meta.env.VITE_API_BASE || 'http://localhost:8082'}/sse/connect`
const SSE_EVENTS = ['payment', 'concert', 'admin']

const state = reactive({
  connected: false,
  notifications: [],
})

let es = null

export function useSSE() {
  function connect() {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    // 이미 연결 중이면 중복 연결 방지
    if (es && state.connected) return

    // 이전 연결 정리
    if (es) {
      es.close()
      es = null
    }

    console.log('[SSE] 연결 시도:', SSE_URL)

    try {
      es = new EventSourcePolyfill(SSE_URL, {
        headers: { Authorization: `Bearer ${token}` },
        heartbeatTimeout: 60 * 60 * 1000,
        withCredentials: false,
      })
    } catch (err) {
      console.error('[SSE] EventSource 생성 실패:', err)
      es = null
      return
    }

    es.addEventListener('connect', (e) => {
      console.log('[SSE] 연결 성공:', e.data)
      state.connected = true
    })

    SSE_EVENTS.forEach((eventName) => {
      es.addEventListener(eventName, (e) => {
        console.log(`[SSE] 이벤트 수신 (${eventName}):`, e.data)
        try {
          const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
          state.notifications.unshift({
            id: Date.now() + Math.random(),
            eventName,
            message: data.message ?? '새 알림이 있습니다.',
            time: new Date(),
            read: false,
          })
        } catch (err) {
          console.warn('[SSE] 데이터 파싱 실패:', e.data, err)
        }
      })
    })

    es.onerror = (err) => {
      console.error('[SSE] 연결 오류:', err)
      state.connected = false
      // es 초기화 → 재연결 가능하도록
      es.close()
      es = null
    }
  }

  function disconnect() {
    if (es) {
      es.close()
      es = null
    }
    state.connected = false
  }

  function markAllRead() {
    state.notifications.forEach((n) => { n.read = true })
  }

  return { state, connect, disconnect, markAllRead }
}
