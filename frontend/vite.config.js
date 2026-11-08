import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // En desarrollo, las llamadas a /api las reenvía Vite a la API local:
    // el navegador ve un solo origen, igual que en producción, y no hay CORS.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  build: {
    // El build queda dentro del backend: Express sirve el frontend y la API
    // desde el mismo contenedor en Cloud Run.
    outDir: '../backend/public',
    emptyOutDir: true,
  },
})
