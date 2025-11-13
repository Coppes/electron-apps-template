import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
    // Exclude main process tests from default run
    exclude: [
      'node_modules',
      'test/unit/main/**',
      'test/unit/security/**',
      'test/integration/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/main.js',
        'src/preload.js',
        'test/',
        'src/main/**',
      ],
    },
  },
  define: {
    'process.env.NODE_ENV': '"test"',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
      '@common': path.resolve(__dirname, './src/common'),
    },
  },
});
