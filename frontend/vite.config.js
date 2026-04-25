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
      // react-map-gl v8 requires subpath imports
      'react-map-gl': 'react-map-gl/mapbox',
    },
  },
  assetsInclude: ['**/*.geojson'],
  server: {
    port: 5173,
    open: true,
  },
});
