import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vocab-trainer/', // Add your repository name here
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})