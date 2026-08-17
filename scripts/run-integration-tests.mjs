#!/usr/bin/env node
// Runs the RLS/integration test suite against a local Supabase stack. Requires
// `supabase start` to already be running (needs Docker) — this script just reads its
// connection details via `supabase status -o json` and forwards them as env vars to vitest,
// so nobody has to copy keys by hand.
import { execSync, spawnSync } from 'node:child_process'

let status
try {
  const raw = execSync('supabase status -o json', { encoding: 'utf8', shell: true })
  // supabase.ps1 sometimes prints a "new CLI version available" notice to stdout ahead of the
  // JSON — trim to the JSON object itself rather than assuming stdout is pure JSON.
  const jsonStart = raw.indexOf('{')
  status = JSON.parse(raw.slice(jsonStart))
} catch (err) {
  console.error(
    'Could not read `supabase status`. Is the local stack running? Start it with `supabase start` (requires Docker) and try again.'
  )
  console.error(err?.message ?? err)
  process.exit(1)
}

const env = {
  ...process.env,
  SUPABASE_URL: status.API_URL,
  SUPABASE_ANON_KEY: status.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
}

const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['vitest', 'run', '--config', 'vitest.integration.config.mts'],
  { stdio: 'inherit', env, shell: process.platform === 'win32' }
)

if (result.error) {
  console.error('Failed to spawn vitest:', result.error)
  process.exit(1)
}
process.exit(result.status ?? 1)
