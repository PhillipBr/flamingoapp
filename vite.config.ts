import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/flamingoapp/',  
  plugins: [react()],
  build: {
    outDir: 'dist',  
    rollupOptions: {
      input: '/src/main.tsx'
    }
  }
});
