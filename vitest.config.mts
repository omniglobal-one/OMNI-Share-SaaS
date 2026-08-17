import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Fast, pure-logic unit tests only — no network, no DB. Run on every `npm test`.
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**', '**/*.integration.test.ts'],
  },
})
