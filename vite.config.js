import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '', // Remove the base path completely
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})