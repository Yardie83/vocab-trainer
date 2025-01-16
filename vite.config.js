import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './', // This is important for both local and deployed environments
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
})