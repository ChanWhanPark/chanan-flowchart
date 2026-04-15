import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@Components': path.resolve(__dirname, 'src/components'),
      '@Context': path.resolve(__dirname, 'src/context'),
      '@Data': path.resolve(__dirname, 'src/data'),
      '@Parser': path.resolve(__dirname, 'src/parser'),
      '@Types': path.resolve(__dirname, 'src/types'),
      '@Utils': path.resolve(__dirname, 'src/utils'),
    },
  },
  server: {
    port: 80,
  },
})
