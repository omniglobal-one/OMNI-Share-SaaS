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
