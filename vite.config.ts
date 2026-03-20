import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
          motion: ['framer-motion'],
          supabase: ['@supabase/supabase-js'],
          zustand: ['zustand'],
          xlsx: ['xlsx'],
        },
      },
    },
  },
})
