import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// import { rtlcssPlugin } from './vite-rtlcss-plugin';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // rtlcssPlugin(),
    visualizer({
      filename: 'dist/stats.html',
      open: true, // opens the report in browser after build
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import'],
      },
    },
  },
});
