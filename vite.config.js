import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' so dist/ serves from any subdirectory or static host
export default defineConfig({
  base: './',
  plugins: [react()],
  // The Gauntlet's research engine runs locally (studio repo, tools/selection-law)
  server: { proxy: { '/api/gauntlet': 'http://127.0.0.1:5192' } },
})
