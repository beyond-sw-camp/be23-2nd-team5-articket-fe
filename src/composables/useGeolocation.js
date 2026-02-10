import { ref } from 'vue'

export function useGeolocation() {
  const coords = ref(null) // {lat,lng}
  const loading = ref(false)
  const error = ref('')
  const manualQuery = ref('')

  function fallbackSeoul() {
    coords.value = { lat: 37.5665, lng: 126.978 }
  }

  function getCurrentPosition() {
    loading.value = true
    error.value = ''

    if (!navigator.geolocation) {
      error.value = '이 브라우저는 위치기반 기능을 지원하지 않아요.'
      fallbackSeoul()
      loading.value = false
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        coords.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        loading.value = false
      },
      () => {
        error.value = '위치 권한이 거부되었어요. 수동 위치로 탐색할 수 있어요.'
        fallbackSeoul()
        loading.value = false
      },
    )
  }

  return { coords, loading, error, manualQuery, getCurrentPosition, fallbackSeoul }
}

