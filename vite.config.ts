import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/flamingoapp/', 
  plugins: [react()],
  server: {
    port: 3000, 
    strictPort: true 
  },
  build: {
    outDir: 'dist', 
    sourcemap: true 
  }
});
