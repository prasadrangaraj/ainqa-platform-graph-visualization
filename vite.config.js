import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  preview: {
    port: 4000,
  },
  build: {
    lib: {
      entry: 'src/components/index.tsx',
      name: 'atpGraphViewer',
      fileName: (format) => `index.${format}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
