import { ref } from 'vue'
import { parseErrorResponse } from '../lib/api/parseError'

const state = ref({ open: false, message: '', code: null, details: null })

/**
 * API 에러(ErrorDto)를 alert 모달로 표시
 * @param {Error|{ responseData?, response? }} err - API client가 throw한 Error 또는 axios error
 * @param {{ skipAlert?: boolean }} opts - skipAlert: true면 모달 생략
 */
export function showErrorAlert(err, opts = {}) {
  if (opts.skipAlert) return
  const data = err?.responseData ?? err?.response?.data
  const parsed = parseErrorResponse(data)
  const message = parsed.message ?? err?.message ?? '요청 처리 중 오류가 발생했습니다.'
  const displayMsg = typeof message === 'string' ? message.trim() : String(message)
  if (!displayMsg) return

  state.value = {
    open: true,
    message: displayMsg,
    code: parsed.code,
    details: parsed.details
  }
}

export function useErrorAlert() {
  function close() {
    state.value = { open: false, message: '', code: null, details: null }
  }

  return { state, showErrorAlert, close }
}

/** @deprecated use showErrorAlert instead */
export const showErrorToast = showErrorAlert

/** @deprecated use useErrorAlert instead */
export const useErrorToast = useErrorAlert
