/**
 * 백엔드 공통 에러 응답에서 ErrorDto 추출
 * 지원 형식:
 *   - { status: "fail", data: { status_code, code, error_message, details } }
 *   - { success: false, error: { error_message, code, details } }
 * @param {any} responseData - error.response.data
 * @returns {{ message: string|null, code: string|null, details: Array|null }}
 */
export function parseErrorResponse(responseData) {
  if (responseData == null) return { message: null, code: null, details: null }

  // { status: "fail", data: { ... } }
  if (responseData.status === 'fail' && responseData.data != null) {
    const d = responseData.data
    return {
      message: d.error_message ?? d.message ?? null,
      code: d.code ?? null,
      details: Array.isArray(d.details) ? d.details : null,
    }
  }

  // { success: false, error: { error_message, code, details } }
  if (responseData.success === false && responseData.error != null && typeof responseData.error === 'object') {
    const d = responseData.error
    return {
      message: d.error_message ?? d.message ?? null,
      code: d.code ?? null,
      details: Array.isArray(d.details) ? d.details : null,
    }
  }

  // 레거시 / 기타 형식 fallback
  if (typeof responseData === 'string' && responseData.trim()) {
    return { message: responseData.trim(), code: null, details: null }
  }
  if (typeof responseData === 'object') {
    const msg =
      responseData.error_message ??
      responseData.message ??
      responseData.error ??
      responseData.msg ??
      responseData.errorMessage ??
      (Array.isArray(responseData.details) ? responseData.details[0]?.reason : null) ??
      null
    let strMsg = null
    if (typeof msg === 'string' && msg.trim()) strMsg = msg.trim()
    else if (typeof msg === 'number') strMsg = String(msg)
    return { message: strMsg, code: responseData.code ?? null, details: null }
  }
  return { message: null, code: null, details: null }
}

export function getMessageFromResponse(data) {
  return parseErrorResponse(data).message
}
