import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Em dev: base '/' para servir local. Em build/prod: '/hufobldc/' para GitHub Pages.
  base: process.env.NODE_ENV === 'production' ? '/hubfobldc/' : '/',
})
