import { reactive } from 'vue'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { useQueueStore } from '../stores/useQueueStore'

const SSE_URL = `${import.meta.env.VITE_API_BASE || 'http://localhost:8082'}/sse/connect`
const SSE_EVENTS = ['payment', 'concert', 'admin']
const MAX_RECONNECT_ATTEMPTS = 5
const BASE_RECONNECT_DELAY_MS = 3000

const state = reactive({
  connected: false,
  notifications: [],
})

let es = null
let reconnectAttempts = 0
let reconnectTimer = null

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
      scheduleReconnect()
      return
    }

    es.addEventListener('connect', (e) => {
      console.log('[SSE] 연결 성공:', e.data)
      state.connected = true
      reconnectAttempts = 0
    })

    // queue_admitted: 대기열 입장 허가 (scheduleId 전달)
    es.addEventListener('queue_admitted', (e) => {
      console.log('[SSE] queue_admitted:', e.data)
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
        const scheduleId = data?.message
        if (scheduleId != null) {
          const { handleAdmitted } = useQueueStore()
          handleAdmitted(scheduleId)
        }
      } catch (err) {
        console.warn('[SSE] queue_admitted 파싱 실패:', e.data, err)
      }
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
      if (es) {
        es.close()
        es = null
      }
      scheduleReconnect()
    }
  }

  function scheduleReconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('[SSE] 최대 재연결 시도 횟수 초과')
      return
    }
    const delay = BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts)
    reconnectAttempts++
    console.log(`[SSE] ${delay}ms 후 재연결 시도 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      connect()
    }, delay)
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    reconnectAttempts = 0
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
