import { describe, test, expect, vi, afterEach } from 'vitest'
import { checkRateLimit } from '../rateLimit'

// The store Map is module-scoped and persists between tests in the same file.
// Each test uses a unique IP to stay isolated from the others.

afterEach(() => {
  vi.useRealTimers()
})

describe('checkRateLimit', () => {
  test('allows requests while under the limit', () => {
    for (let i = 0; i < 4; i++) {
      expect(checkRateLimit('rl-under', 5, 60_000)).toBe(true)
    }
  })

  test('returns false once the limit is reached', () => {
    const ip = 'rl-at-limit'
    for (let i = 0; i < 5; i++) checkRateLimit(ip, 5, 60_000)
    expect(checkRateLimit(ip, 5, 60_000)).toBe(false)
  })

  test('limit of 1: first request passes, second is blocked', () => {
    const ip = 'rl-single'
    expect(checkRateLimit(ip, 1, 60_000)).toBe(true)
    expect(checkRateLimit(ip, 1, 60_000)).toBe(false)
  })

  test('timestamps outside the window are expired and slots reopen', () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000_000)
    const ip = 'rl-expire'

    for (let i = 0; i < 5; i++) checkRateLimit(ip, 5, 60_000)
    expect(checkRateLimit(ip, 5, 60_000)).toBe(false)

    // Advance past the 60s window — all prior timestamps should expire
    vi.setSystemTime(1_000_000 + 61_000)
    expect(checkRateLimit(ip, 5, 60_000)).toBe(true)
  })

  test('timestamps at exactly windowMs are considered expired', () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000_000)
    const ip = 'rl-edge'

    for (let i = 0; i < 5; i++) checkRateLimit(ip, 5, 60_000)

    // At exactly 60s later: now - t === windowMs, so filter (< windowMs) excludes them.
    // All timestamps are expired → slot reopens → request is allowed.
    vi.setSystemTime(1_000_000 + 60_000)
    expect(checkRateLimit(ip, 5, 60_000)).toBe(true)
  })

  test('different IPs have independent counters', () => {
    const ipA = 'rl-indep-a'
    const ipB = 'rl-indep-b'

    for (let i = 0; i < 5; i++) checkRateLimit(ipA, 5, 60_000)
    expect(checkRateLimit(ipA, 5, 60_000)).toBe(false)
    expect(checkRateLimit(ipB, 5, 60_000)).toBe(true)
  })
})
