import PortOne from '@portone/browser-sdk/v2'
import { useApi } from './useApi'
import { ENDPOINTS } from '../lib/api/endpoints'

/**
 * 본인인증(이니시스) 로직 composable
 */
export function useInicis() {
  const api = useApi()

  async function requestIdentityVerification(onSuccess) {
    const response = await PortOne.requestIdentityVerification({
      storeId: 'store-6ac42987-375b-44fc-bbc9-d9650b676666',
      identityVerificationId: `identity-verification-${crypto.randomUUID()}`,
      channelKey: 'channel-key-a0fb163c-2bae-4ed0-9d2e-06bba0d3d8bb',
    })

    if (response.code !== undefined) {
      return alert(response.message)
    }

    try {
      await api.post(ENDPOINTS.inicis(), {
        identityVerificationId: response.identityVerificationId,
      })
      if (typeof onSuccess === 'function') await onSuccess()
    } catch (e) {
      // ErrorAlertModal에서 표시됨
    }
  }

  return { requestIdentityVerification }
}
