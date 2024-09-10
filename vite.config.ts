import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/flamingoapp/'  // Asegúrate de que esto coincida con el nombre del repositorio en GitHub Pages
});
