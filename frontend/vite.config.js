import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // redirect all react-map-gl imports to the maplibre adapter
      'react-map-gl': 'react-map-gl/maplibre',
    },
  },
  assetsInclude: ['**/*.geojson'],
  server: {
    port: 5173,
    open: true,
  },
});
