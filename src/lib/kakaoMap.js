/**
 * 카카오 지도 SDK 로드 (재사용)
 * @returns {Promise<object>} kakao.maps
 */
export function loadKakaoSdk() {
  const appKey = (import.meta.env.VITE_KAKAO_MAP_APP_KEY || '').toString().trim()
  if (!appKey) {
    return Promise.reject(
      new Error('카카오 지도 앱 키가 없습니다. .env에 VITE_KAKAO_MAP_APP_KEY를 설정해 주세요.')
    )
  }

  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve(window.kakao.maps))
      return
    }
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`
    script.async = false
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao.maps))
    }
    script.onerror = () => {
      reject(new Error('카카오 지도 SDK를 불러올 수 없습니다. 앱 키와 도메인 설정을 확인해 주세요.'))
    }
    document.head.appendChild(script)
  })
}
