import { defineConfig } from 'vitest/config'

// Integration/RLS tests — require a local Supabase stack (`supabase start`, needs Docker).
// Separate from vitest.config.mts (unit tests) so `npm test` stays fast and dependency-free;
// run these explicitly with `npm run test:integration`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.integration.test.ts'],
    exclude: ['node_modules/**', '.next/**'],
    testTimeout: 20000,
    hookTimeout: 30000,
  },
})
