import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteCompression({ threshold: 1024 })],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor'
            if (id.includes('three') || id.includes('@react-three') || id.includes('maath'))
              return 'three-vendor'
            if (id.includes('gsap') || id.includes('lenis') || id.includes('framer-motion'))
              return 'anim-vendor'
          }
        },
      },
    },
  },
})
