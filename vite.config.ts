import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const deploymentNavigation = fileURLToPath(
  new URL('./src/deployment/AtlasNavigation.ts', import.meta.url),
)
const deploymentDataSources = fileURLToPath(
  new URL('./src/deployment/AtlasDataSources.ts', import.meta.url),
)

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '../../navigation/AtlasNavigation',
        replacement: deploymentNavigation,
      },
      {
        find: '../../data/AtlasDataSources',
        replacement: deploymentDataSources,
      },
    ],
  },
  build: {
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks: {
          geography: ['topojson-client', 'world-atlas/countries-110m.json'],
          maplibre: ['maplibre-gl'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})
