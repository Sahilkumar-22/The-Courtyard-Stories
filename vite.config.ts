import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Root-relative: Vite resolves this from the project root.
    alias: { '@': '/src' },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
  },
})
