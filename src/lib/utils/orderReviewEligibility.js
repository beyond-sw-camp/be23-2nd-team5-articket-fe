/**
 * 예매 목록·리뷰 작성 가능 여부 판단 공용 유틸
 * (MyReviewableConcertsView, ConcertDetailView 등에서 사용)
 */

const STATUS_PAID = ['PAID', '예매완료', '관람완료', 'COMPLETED', 'CONFIRMED', 'SUCCESS']
const STATUS_EXCLUDE = ['CANCELLED', 'CANCELED', 'PENDING', 'REFUNDED', '취소', '취소완료', '결제대기']

export function extractOrdersList(result) {
  if (!result || typeof result !== 'object') return []
  if (Array.isArray(result)) return result
  return (
    result.content ??
    result.data ??
    result.orders ??
    result.items ??
    []
  )
}

export function getViewDateTime(order) {
  return (
    order.scheduleDate ??
    order.schedule_date ??
    order.playTime ??
    order.play_time ??
    order.performanceDate ??
    order.performance_date ??
    order.scheduleStartDate ??
    order.viewDate ??
    null
  )
}

export function isPaidOrder(order) {
  const status = (order.status ?? order.orderStatus ?? '').toString().toUpperCase().trim()
  if (!status) return false
  if (STATUS_EXCLUDE.some((s) => status.includes(s.toUpperCase()))) return false
  if (STATUS_PAID.some((s) => status === s.toUpperCase() || status.includes(s))) return true
  return status === 'PAID'
}

export function isPastViewDate(dateValue) {
  if (!dateValue) return false
  const viewEnd = new Date(dateValue)
  if (isNaN(viewEnd.getTime())) return false
  return viewEnd.getTime() <= Date.now()
}

/** 주문에서 공연 ID 추출 (문자열 비교용) */
export function getConcertId(order) {
  const id = order.concertId ?? order.concert_id ?? order.concert?.id ?? order.schedule?.concertId
  return id == null ? '' : String(id)
}
