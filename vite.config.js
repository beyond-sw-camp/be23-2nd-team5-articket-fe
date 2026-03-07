import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    global: 'window',
  },
  server: {
    proxy: {
      // /api/* → 백엔드로 전달. rewrite 제거 시 백엔드 경로가 /api/files/1 형태일 때 사용
      '/api': {
        target: process.env.VITE_API_BASE || 'http://localhost:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})