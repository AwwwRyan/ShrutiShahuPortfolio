import { defineConfig } from 'vitest/config';
import path from 'node:path';
import 'dotenv/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Tests hit a real remote Postgres (Neon free tier) plus bcrypt hashing —
    // the 5s default is too tight for multi-round-trip tests under real network latency.
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
