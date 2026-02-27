import { reactive } from 'vue'

/**
 * 대기열(Virtual Waiting Queue) 전역 상태
 * Zustand/Pinia 대신 Vue reactive 사용
 */
const queueState = reactive({
  scheduleId: null,
  position: 0,
  total: 0,
  admitted: false,
  admittedAt: null,
  isPolling: false,
})

const DEFAULT_ADMISSION_TTL_MS = 10 * 60 * 1000 // 10분

export function useQueueStore() {
  function reset() {
    queueState.scheduleId = null
    queueState.position = 0
    queueState.total = 0
    queueState.admitted = false
    queueState.admittedAt = null
    queueState.isPolling = false
  }

  function setWaiting(scheduleId, position, total) {
    queueState.scheduleId = scheduleId
    queueState.position = position
    queueState.total = total
    queueState.admitted = false
    queueState.admittedAt = null
    queueState.isPolling = true
  }

  function updatePosition(position, total, admitted) {
    queueState.position = position
    queueState.total = total
    queueState.admitted = admitted
    if (admitted) {
      queueState.admittedAt = Date.now()
      queueState.isPolling = false
    }
  }

  function handleAdmitted(scheduleId) {
    if (queueState.scheduleId !== null && String(queueState.scheduleId) === String(scheduleId)) {
      queueState.admitted = true
      queueState.admittedAt = Date.now()
      queueState.position = 0
      queueState.isPolling = false
    }
  }

  function stopPolling() {
    queueState.isPolling = false
  }

  /** 입장 허가 시점 기준 10분 TTL 남은 ms */
  function getRemainingAdmissionMs() {
    if (!queueState.admittedAt) return 0
    const elapsed = Date.now() - queueState.admittedAt
    return Math.max(0, DEFAULT_ADMISSION_TTL_MS - elapsed)
  }

  /** 현재 scheduleId에 대해 입장 권한이 유효한지 */
  function isAdmissionValidFor(scheduleId) {
    if (!queueState.admitted || !queueState.admittedAt) return false
    if (String(queueState.scheduleId) !== String(scheduleId)) return false
    return getRemainingAdmissionMs() > 0
  }

  return {
    state: queueState,
    reset,
    setWaiting,
    updatePosition,
    handleAdmitted,
    stopPolling,
    getRemainingAdmissionMs,
    isAdmissionValidFor,
    DEFAULT_ADMISSION_TTL_MS,
  }
}
