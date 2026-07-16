import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        'src/app/**',
        'src/components/**',
        'node_modules/**',
        '.next/**',
      ],
    },
  },
});
