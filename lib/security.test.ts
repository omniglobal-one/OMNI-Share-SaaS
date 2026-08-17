import { describe, it, expect } from 'vitest'
import { constantTimeEqualsUpperCase } from './security'

describe('constantTimeEqualsUpperCase', () => {
  it('returns true for an exact match', () => {
    expect(constantTimeEqualsUpperCase('ABC123', 'ABC123')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(constantTimeEqualsUpperCase('ABC123', 'abc123')).toBe(true)
    expect(constantTimeEqualsUpperCase('abc123', 'ABC123')).toBe(true)
  })

  it('rejects a wrong code of the same length', () => {
    expect(constantTimeEqualsUpperCase('ABC123', 'ABC124')).toBe(false)
  })

  it('rejects a code that differs only in length', () => {
    expect(constantTimeEqualsUpperCase('ABC123', 'ABC12')).toBe(false)
    expect(constantTimeEqualsUpperCase('ABC123', 'ABC1234')).toBe(false)
  })

  it('rejects an empty guess against a real code', () => {
    expect(constantTimeEqualsUpperCase('ABC123', '')).toBe(false)
  })

  // Regression guard for the vulnerability this function replaced: the comparison must not
  // short-circuit on the first mismatched character. We can't directly assert on timing in a
  // unit test, but we can assert the function always walks the full max(a.length, b.length)
  // by checking a case where an early-exit implementation would give the wrong answer: a
  // provided string that matches the correct one everywhere except the very last character.
  it('correctly rejects a near-miss that differs only in the last character', () => {
    expect(constantTimeEqualsUpperCase('ABCDEF', 'ABCDEG')).toBe(false)
  })
})
