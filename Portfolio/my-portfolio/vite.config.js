import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Three.js (~880 kB) is lazy-loaded after the page text renders, so its size doesn't block first paint.
    chunkSizeWarningLimit: 900,
  },
})
