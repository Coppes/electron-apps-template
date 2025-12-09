import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './test/setup/vitest.setup.main.js',
    include: ['test/unit/main/**/*.test.js', 'test/unit/security/**/*.test.js', 'test/integration/**/*.test.js', 'src/main/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/main/**/*.js'],
      exclude: [
        'src/main.js',
        'src/preload.js',
        'node_modules/',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  define: {
    'process.env.NODE_ENV': '"test"',
  },
  resolve: {
    alias: {
      '@main': path.resolve(__dirname, './src/main'),
      '@common': path.resolve(__dirname, './src/common'),
    },
  },
});
