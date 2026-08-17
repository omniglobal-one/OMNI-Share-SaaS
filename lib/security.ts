// Vercel's edge overwrites x-forwarded-for and never forwards a client-supplied value (see
// https://vercel.com/docs/headers/request-headers#x-forwarded-for) — it is not spoofable by a
// client when the app is only reachable through Vercel, which both OMNI apps are. Prefer
// x-vercel-forwarded-for regardless: Vercel documents it as staying authoritative even if a
// customer later puts another proxy/CDN in front of Vercel, whereas plain x-forwarded-for
// could be affected by that specific setup. Not a fix for a real spoofing hole — just the
// more future-proof header to read.
export function getClientIp(headers: Headers): string {
  return headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    ?? headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? headers.get('x-real-ip')
    ?? 'unknown'
}

// Constant-time, case-insensitive string comparison. Used anywhere an untrusted caller
// submits a guess against a real secret (room join codes) — a naive `===` comparison lets an
// attacker infer how many leading characters were correct from response-time differences.
// Precondition: `correct` must be non-empty (enforced by the DB NOT NULL/UNIQUE constraint on
// join_code) — an empty string would divide by zero in the modulo below.
export function constantTimeEqualsUpperCase(correct: string, provided: string): boolean {
  const a = correct.toUpperCase()
  const b = provided.toUpperCase()
  let mismatch = a.length ^ b.length
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    mismatch |= (a.charCodeAt(i % a.length) ^ b.charCodeAt(i % b.length))
  }
  return mismatch === 0
}
