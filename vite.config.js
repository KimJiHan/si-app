import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/si-app/', // GitHub repository name
  build: {
    // 성능 최적화 설정
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 코드 스플리팅 설정
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리 분리
          'react-vendor': ['react', 'react-dom'],
          // 유틸리티 라이브러리 분리
          'utils': ['qrcode'],
        },
        // 청크 파일명 설정
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // 청크 크기 경고 임계값
    chunkSizeWarningLimit: 500,
    // 소스맵 설정 (프로덕션에서는 숨김)
    sourcemap: false,
    // CSS 코드 스플리팅
    cssCodeSplit: true,
    // 압축 설정
    assetsInlineLimit: 4096 // 4KB 이하 파일은 인라인
  },
  // 성능 최적화를 위한 설정
  optimizeDeps: {
    include: ['react', 'react-dom', 'qrcode'],
    exclude: []
  },
  // 서버 설정
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    // HMR 설정
    hmr: {
      overlay: true
    }
  },
  // Preview 서버 설정
  preview: {
    port: 4173,
    host: true
  }
})
