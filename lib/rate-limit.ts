/**
 * In-memory rate limiter.
 * State is per-serverless-instance (resets on cold start),
 * but effective against typical brute-force attacks.
 */

interface RateLimitRecord {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitRecord>()

// Prune expired entries every minute to avoid memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    Array.from(store.entries()).forEach(([key, record]) => {
      if (record.resetAt < now) store.delete(key)
    })
  }, 60_000)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  /** milliseconds until the window resets */
  resetIn: number
}

/**
 * @param key      Unique key per client (e.g. IP + route)
 * @param limit    Max requests per window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const record = store.get(key)

  if (!record || record.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetIn: windowMs }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetIn: record.resetAt - now }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count, resetIn: record.resetAt - now }
}

/** Extract client IP from Vercel / standard proxy headers */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}
