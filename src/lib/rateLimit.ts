// In-memory sliding window rate limiter, keyed by IP.
// Per-instance on Vercel serverless — good enough to stop casual script abuse.
const store = new Map<string, number[]>()

export function checkRateLimit(ip: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now()
  const timestamps = (store.get(ip) ?? []).filter((t) => now - t < windowMs)
  if (timestamps.length >= limit) return false
  store.set(ip, [...timestamps, now])
  return true
}
