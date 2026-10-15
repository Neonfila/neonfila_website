import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' so dist/ serves from any subdirectory or static host
export default defineConfig({
  base: './',
  plugins: [react()],
})
