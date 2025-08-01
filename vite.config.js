import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  }
})


/* Config for Dev Environment with a local backend:

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:31415'
    }
  },
  define: {
    'process.env': {}
  }
})

*/
