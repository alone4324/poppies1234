import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: true,
    open: false,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    sourcemap: false,
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer'],
  },
});