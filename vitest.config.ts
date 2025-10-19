import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.ts',
        '**/*.config.js',
        '**/scripts/**',
        '**/examples/**',
        '**/__tests__/**'
      ]
    },
    include: [
      'packages/**/__tests__/**/*.test.ts',
      'packages/**/__tests__/**/*.test.tsx'
    ],
    exclude: [
      'node_modules',
      'dist',
      '.turbo',
      'examples'
    ]
  },
  resolve: {
    alias: {
      '@brik/core': path.resolve(__dirname, 'packages/brik-core/src'),
      '@brik/compiler': path.resolve(__dirname, 'packages/brik-compiler/src'),
      '@brik/schemas': path.resolve(__dirname, 'packages/brik-schemas/src'),
      '@brik/react-native': path.resolve(__dirname, 'packages/brik-react-native/src'),
      '@brik/target-swiftui': path.resolve(__dirname, 'packages/brik-target-swiftui/src'),
      '@brik/target-compose': path.resolve(__dirname, 'packages/brik-target-compose/src')
    }
  }
});